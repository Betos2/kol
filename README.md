# Kolno'a Studio — Netlify Deployment Package

## Folder Structure
```text
kolnoa-studio-netlify/
├── index.html
├── netlify.toml
├── README.md
└── netlify/
    └── functions/
        └── transcribe.mjs
```

## How to Deploy to Netlify (with Serverless Hebrew Transcription)

> **Important:** Do **not** use Netlify's browser drag-and-drop uploader, because Netlify's drag-and-drop ignores the `netlify/functions/` folder. Use GitHub or the Netlify CLI below instead.

### Option A: Deploy via GitHub (Recommended)
1. Unzip this folder and push its contents to a new GitHub repository.
2. In Netlify, click **Add new site → Import an existing project** and select your repository.
3. Go to **Site configuration → Environment variables** and add:
   - **Key:** `OPENAI_API_KEY`
   - **Value:** your OpenAI API key (`sk-...`)
4. Trigger a deploy (**Deploys → Trigger deploy**). Your `/api/transcribe` endpoint will now be live.

### Option B: Deploy via Netlify CLI
1. Unzip this folder and open a terminal inside it.
2. Run:
   ```bash
   npx netlify-cli deploy --prod
   ```
3. Follow the login prompt, create a new site, and press **Enter** for the default publish directory (`.`).
4. Add `OPENAI_API_KEY` in Netlify under **Site configuration → Environment variables**, then run `npx netlify-cli deploy --prod` once more.
