[CmdletBinding()]
param(
    [ValidateSet("patch", "minor", "major")]
    [string]$Bump = "patch",
    [string]$Summary = "",
    [switch]$NoPush,
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-External {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath,
        [string[]]$Arguments = @(),
        [switch]$Capture,
        [switch]$AllowFail
    )

    if ($Capture) {
        $result = & $FilePath @Arguments 2>&1
        $exitCode = $LASTEXITCODE
        if ((-not $AllowFail) -and $exitCode -ne 0) {
            $output = ($result -join [Environment]::NewLine)
            throw "Command failed: $FilePath $($Arguments -join ' ')`n$output"
        }
        return ($result -join [Environment]::NewLine).Trim()
    }

    & $FilePath @Arguments
    $exitCode = $LASTEXITCODE
    if ((-not $AllowFail) -and $exitCode -ne 0) {
        throw "Command failed: $FilePath $($Arguments -join ' ') (exit code $exitCode)."
    }
}

function Parse-SemVer {
    param([string]$Value)
    if ($Value -match '^v?(?<Major>\d+)\.(?<Minor>\d+)\.(?<Patch>\d+)$') {
        return [pscustomobject]@{
            Major = [int]$Matches.Major
            Minor = [int]$Matches.Minor
            Patch = [int]$Matches.Patch
        }
    }
    return $null
}

function Format-SemVer {
    param([int]$Major, [int]$Minor, [int]$Patch)
    return "$Major.$Minor.$Patch"
}

function Get-LatestSemVerTag {
    $rawTags = Invoke-External -FilePath "git" -Arguments @("tag", "--list", "v*") -Capture -AllowFail
    if ([string]::IsNullOrWhiteSpace($rawTags)) {
        return $null
    }

    $parsed = @()
    foreach ($tag in ($rawTags -split "\r?\n")) {
        if ([string]::IsNullOrWhiteSpace($tag)) {
            continue
        }
        $parts = Parse-SemVer -Value $tag.Trim()
        if ($null -ne $parts) {
            $parsed += [pscustomobject]@{
                Tag   = $tag.Trim()
                Major = $parts.Major
                Minor = $parts.Minor
                Patch = $parts.Patch
            }
        }
    }

    if ($parsed.Count -eq 0) {
        return $null
    }

    return ($parsed |
        Sort-Object -Property @{ Expression = "Major"; Descending = $true }, @{ Expression = "Minor"; Descending = $true }, @{ Expression = "Patch"; Descending = $true } |
        Select-Object -First 1).Tag
}

function Get-PackageVersion {
    if (-not (Test-Path -LiteralPath "package.json")) {
        return "0.0.0"
    }

    $pkg = Get-Content -LiteralPath "package.json" -Raw | ConvertFrom-Json
    if ($null -eq $pkg.version -or [string]::IsNullOrWhiteSpace([string]$pkg.version)) {
        return "0.0.0"
    }

    return [string]$pkg.version
}

function Get-NextVersion {
    param(
        [string]$BaseVersion,
        [string]$BumpType
    )

    $parts = Parse-SemVer -Value $BaseVersion
    if ($null -eq $parts) {
        throw "Base version '$BaseVersion' is not a valid semver."
    }

    switch ($BumpType) {
        "major" {
            return Format-SemVer -Major ($parts.Major + 1) -Minor 0 -Patch 0
        }
        "minor" {
            return Format-SemVer -Major $parts.Major -Minor ($parts.Minor + 1) -Patch 0
        }
        default {
            return Format-SemVer -Major $parts.Major -Minor $parts.Minor -Patch ($parts.Patch + 1)
        }
    }
}

function Get-DiffStats {
    $raw = Invoke-External -FilePath "git" -Arguments @("diff", "--cached", "--numstat") -Capture -AllowFail
    $insertions = 0
    $deletions = 0
    $files = 0

    if (-not [string]::IsNullOrWhiteSpace($raw)) {
        foreach ($line in ($raw -split "\r?\n")) {
            if ([string]::IsNullOrWhiteSpace($line)) {
                continue
            }

            $parts = $line -split "`t"
            if ($parts.Count -lt 3) {
                continue
            }

            $files += 1
            if ($parts[0] -match '^\d+$') {
                $insertions += [int]$parts[0]
            }
            if ($parts[1] -match '^\d+$') {
                $deletions += [int]$parts[1]
            }
        }
    }

    return [pscustomobject]@{
        Files      = $files
        Insertions = $insertions
        Deletions  = $deletions
    }
}

function Build-Summary {
    param(
        [string[]]$Files,
        [int]$Insertions,
        [int]$Deletions
    )

    if ($null -eq $Files -or $Files.Count -eq 0) {
        return "atualizacoes gerais do projeto"
    }

    $versionFiles = @("package.json", "package-lock.json")
    $focusFiles = @($Files | Where-Object { $versionFiles -notcontains $_ })
    if ($focusFiles.Count -eq 0) {
        $focusFiles = $Files
    }

    $target = ""
    if ($focusFiles.Count -le 3) {
        $target = $focusFiles -join ", "
    }
    else {
        $firstThree = $focusFiles[0..2] -join ", "
        $remaining = $focusFiles.Count - 3
        $target = "$firstThree e mais $remaining arquivo(s)"
    }

    return "atualizacoes em $target (+$Insertions/-$Deletions)"
}

Invoke-External -FilePath "git" -Arguments @("rev-parse", "--is-inside-work-tree") | Out-Null

$branch = Invoke-External -FilePath "git" -Arguments @("branch", "--show-current") -Capture
if ([string]::IsNullOrWhiteSpace($branch)) {
    throw "Could not detect current branch."
}

$latestTag = Get-LatestSemVerTag
$baseVersion = if ($null -ne $latestTag) { $latestTag.TrimStart("v") } else { Get-PackageVersion }
$nextVersion = Get-NextVersion -BaseVersion $baseVersion -BumpType $Bump
$nextTag = "v$nextVersion"

$allTagsRaw = Invoke-External -FilePath "git" -Arguments @("tag", "--list", "v*") -Capture -AllowFail
$allTags = @($allTagsRaw -split "\r?\n" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
$tagSet = New-Object System.Collections.Generic.HashSet[string]([System.StringComparer]::OrdinalIgnoreCase)
foreach ($tag in $allTags) {
    [void]$tagSet.Add($tag.Trim())
}

while ($tagSet.Contains($nextTag)) {
    $parts = Parse-SemVer -Value $nextVersion
    $nextVersion = Format-SemVer -Major $parts.Major -Minor $parts.Minor -Patch ($parts.Patch + 1)
    $nextTag = "v$nextVersion"
}

if ($DryRun) {
    $status = Invoke-External -FilePath "git" -Arguments @("status", "--short") -Capture -AllowFail
    Write-Host "Commit_PAF dry-run"
    Write-Host "Branch: $branch"
    Write-Host "Latest tag: $latestTag"
    Write-Host "Next tag: $nextTag"
    Write-Host "Bump: $Bump"
    if (-not [string]::IsNullOrWhiteSpace($Summary)) {
        Write-Host "Resumo manual: $Summary"
    }
    if ([string]::IsNullOrWhiteSpace($status)) {
        Write-Host "Changes: none"
    }
    else {
        Write-Host "Changes:"
        Write-Host $status
    }
    Write-Host "No files were changed because -DryRun was used."
    exit 0
}

if (Test-Path -LiteralPath "package.json") {
    Invoke-External -FilePath "npm.cmd" -Arguments @("version", $nextVersion, "--no-git-tag-version", "--allow-same-version")
}

Invoke-External -FilePath "git" -Arguments @("add", "-A")
$stagedRaw = Invoke-External -FilePath "git" -Arguments @("diff", "--cached", "--name-only") -Capture
$stagedFiles = @($stagedRaw -split "\r?\n" | ForEach-Object { $_.Trim() } | Where-Object { $_ })

if ($stagedFiles.Count -eq 0) {
    throw "No staged changes found. Nothing to commit."
}

$stats = Get-DiffStats
$autoSummary = Build-Summary -Files $stagedFiles -Insertions $stats.Insertions -Deletions $stats.Deletions
$finalSummary = if ([string]::IsNullOrWhiteSpace($Summary)) { $autoSummary } else { "$($Summary.Trim()) | $autoSummary" }
$stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$message = "Commit_PAF $stamp [$branch] - $finalSummary"

Invoke-External -FilePath "git" -Arguments @("commit", "-m", $message)
Invoke-External -FilePath "git" -Arguments @("tag", "-a", $nextTag, "-m", "Release $nextTag")

if (-not $NoPush) {
    Invoke-External -FilePath "git" -Arguments @("push", "origin", $branch, "--follow-tags")
}

Write-Host "Commit_PAF completed."
Write-Host "Branch: $branch"
Write-Host "Tag: $nextTag"
Write-Host "Message: $message"
if ($NoPush) {
    Write-Host "Push skipped (-NoPush)."
}
