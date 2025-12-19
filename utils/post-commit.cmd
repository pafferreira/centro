@echo off
setlocal

node utils\sync-version-from-tag.cjs

if exist package.json git add package.json
if exist package-lock.json git add package-lock.json

endlocal
