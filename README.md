<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1fpBpdMNddwh6JAoBsDA28npm4_17fRyN

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set your Gemini key:
   - Locally: create `.env.local` with `GEMINI_API_KEY=your-key-here`
   - Vercel: add an Environment Variable `GEMINI_API_KEY` in the project settings
3. Run the app:
   `npm run dev`

## Release (npm)

1. Ensure a clean working tree and the correct branch.
2. Optional: run `npm run build`.
3. Run the guided release command:
   `npm run release`
4. Push the commit and tag:
   `git push --follow-tags`

Version sync checks (optional):
`npm run version:check`
