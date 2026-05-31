# Sivulingqondo Website

Astro static site + Sveltia CMS, deployed on Netlify.

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
npm test         # unit tests
npm run build    # production build to dist/
```

## Deployment
1. Push this repo to GitHub.
2. Edit `public/admin/config.yml` → set `repo: OWNER/REPO`.
3. On Netlify: **New site from Git** → pick the repo → build `npm run build`, publish `dist`.
4. Enable GitHub auth for the CMS (Netlify Git Gateway + Identity, or Sveltia GitHub OAuth).
5. Add domain `sivulingqondo.org.za` and point DNS to Netlify.
6. Visit `/admin`, log in, make a test edit, confirm it republishes.
