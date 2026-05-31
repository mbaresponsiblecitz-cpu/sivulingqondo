# Sivulingqondo Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fast, mobile-first, NGO-editable marketing/donation website for Sivulingqondo Community Project & ECD to replace the current site.

**Architecture:** Astro static site (component-based, zero-JS by default with islands only where needed). Content lives in typed Astro Content Collections + a small `site.json` data file, all editable via Sveltia CMS (Git-backed admin at `/admin`). A single design-token CSS layer drives the warm, African-rooted visual identity. Deployed free to Netlify on `sivulingqondo.org.za`.

**Tech Stack:** Astro 5+, TypeScript, Zod (via `astro:content`), vanilla CSS with custom properties, Vitest (logic unit tests), Sveltia CMS, Netlify (hosting + Forms).

**Spec:** `docs/superpowers/specs/2026-05-31-sivulingqondo-website-design.md`

---

## File Structure

```
/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── netlify.toml
├── public/
│   ├── admin/
│   │   ├── index.html          # Sveltia CMS shell
│   │   └── config.yml          # CMS collections + fields
│   ├── images/                 # NGO-uploaded photos (via CMS)
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── content.config.ts       # Zod schemas for collections
│   ├── data/
│   │   ├── site.json           # global: contact, links, campaign totals, stats
│   │   ├── focus-areas/        # one .md per programme
│   │   ├── gallery/            # one .md per photo
│   │   ├── team/               # one .md per team member
│   │   └── transparency/       # one .md per "what we bought" item
│   ├── lib/
│   │   ├── campaign.ts         # progress + impact-tier math (UNIT TESTED)
│   │   └── campaign.test.ts
│   ├── styles/
│   │   ├── tokens.css          # colour/space/type design tokens
│   │   └── global.css          # base/reset/utilities
│   ├── components/
│   │   ├── Head.astro          # SEO + Open Graph meta
│   │   ├── Header.astro        # nav + sticky Donate
│   │   ├── Footer.astro
│   │   ├── WhatsAppButton.astro
│   │   ├── DonationThermometer.astro
│   │   ├── ImpactTiers.astro
│   │   ├── FocusAreaCard.astro
│   │   ├── StatCounter.astro   # island (animated count-up)
│   │   ├── GalleryGrid.astro
│   │   └── NewsletterSignup.astro
│   ├── layouts/
│   │   └── BaseLayout.astro
│   └── pages/
│       ├── index.astro
│       ├── about.astro
│       ├── what-we-do.astro
│       ├── campaign.astro
│       ├── gallery.astro
│       ├── get-involved.astro
│       └── contact.astro
└── docs/
    ├── HANDOVER.md             # plain-English CMS guide for NGO
    └── FUTURE-IDEAS.md         # Tier-3 roadmap
```

---

## Task 1: Scaffold Astro project + tooling

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`

- [ ] **Step 1: Create the Astro project (empty template, TypeScript strict)**

Run in repo root (the folder already contains `docs/`):
```bash
npm create astro@latest -- . --template minimal --typescript strict --no-install --no-git --skip-houston
```
If the CLI refuses because the directory is non-empty, accept the prompt to continue / merge. Expected: creates `src/`, `astro.config.mjs`, `package.json`, `tsconfig.json`.

- [ ] **Step 2: Install dependencies + Vitest**

```bash
npm install
npm install -D vitest
```
Expected: `node_modules/` created, no errors.

- [ ] **Step 3: Add Vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 4: Add test + build scripts to package.json**

In `package.json` `"scripts"`, ensure these exist:
```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "check": "astro check",
  "test": "vitest run"
}
```

- [ ] **Step 5: Verify the dev build works**

Run: `npm run build`
Expected: "Complete!" with a `dist/` folder, no errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro project with Vitest"
```

---

## Task 2: Campaign logic (TDD)

This is the only real business logic — progress percentage and impact-tier math. Test-drive it.

**Files:**
- Create: `src/lib/campaign.ts`
- Test: `src/lib/campaign.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/campaign.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { progressPercent, formatRand, tiersFromAmount } from './campaign';

describe('progressPercent', () => {
  it('returns rounded percent of goal', () => {
    expect(progressPercent(8250, 16500)).toBe(50);
  });
  it('clamps to 100 when raised exceeds goal', () => {
    expect(progressPercent(20000, 16500)).toBe(100);
  });
  it('returns 0 for a zero or invalid goal', () => {
    expect(progressPercent(500, 0)).toBe(0);
  });
});

describe('formatRand', () => {
  it('formats whole rands with thousands separator and R prefix', () => {
    expect(formatRand(16500)).toBe('R16,500');
  });
});

describe('tiersFromAmount', () => {
  it('labels how many items a donation funds', () => {
    const tiers = [
      { label: 'chair', unit: 350 },
      { label: 'table', unit: 1200 },
    ];
    expect(tiersFromAmount(2400, tiers)).toEqual([
      { label: 'chair', unit: 350, count: 6 },
      { label: 'table', unit: 1200, count: 2 },
    ]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `campaign.ts` not found / functions undefined.

- [ ] **Step 3: Implement `campaign.ts`**

Create `src/lib/campaign.ts`:
```ts
export function progressPercent(raised: number, goal: number): number {
  if (!goal || goal <= 0) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}

export function formatRand(amount: number): string {
  return 'R' + Math.round(amount).toLocaleString('en-ZA');
}

export interface Tier {
  label: string;
  unit: number;
}

export function tiersFromAmount(amount: number, tiers: Tier[]) {
  return tiers.map((t) => ({ ...t, count: Math.floor(amount / t.unit) }));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — 5 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/campaign.ts src/lib/campaign.test.ts
git commit -m "feat: add campaign progress and impact-tier logic"
```

---

## Task 3: Design tokens + global styles

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`

- [ ] **Step 1: Create design tokens**

Create `src/styles/tokens.css`:
```css
:root {
  /* Warm, African-rooted palette */
  --c-terracotta: #C0532B;
  --c-ochre: #E2A33B;
  --c-teal: #15605E;
  --c-indigo: #243B6B;
  --c-cream: #FBF5EC;
  --c-ink: #2A211B;
  --c-muted: #6B5E54;
  --c-cta: #C0532B;
  --c-cta-hover: #A2431F;

  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;

  --space-1: 0.5rem; --space-2: 1rem; --space-3: 1.5rem;
  --space-4: 2rem;  --space-6: 3rem;  --space-8: 4rem;

  --radius: 14px;
  --shadow: 0 6px 24px rgba(42, 33, 27, 0.10);
  --maxw: 1100px;
}
```

- [ ] **Step 2: Create global base styles**

Create `src/styles/global.css`:
```css
@import './tokens.css';

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: var(--font-sans);
  color: var(--c-ink);
  background: var(--c-cream);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
img { max-width: 100%; height: auto; display: block; }
a { color: var(--c-teal); }
h1, h2, h3 { line-height: 1.15; margin: 0 0 var(--space-2); }
h1 { font-size: clamp(2rem, 5vw, 3.25rem); }
h2 { font-size: clamp(1.5rem, 3vw, 2.25rem); }

.container { max-width: var(--maxw); margin-inline: auto; padding-inline: var(--space-3); }
.section { padding-block: var(--space-8); }

.btn {
  display: inline-block; padding: 0.8rem 1.4rem; border-radius: var(--radius);
  font-weight: 700; text-decoration: none; border: 0; cursor: pointer;
  transition: background-color .15s ease, transform .15s ease;
}
.btn-primary { background: var(--c-cta); color: #fff; }
.btn-primary:hover { background: var(--c-cta-hover); transform: translateY(-1px); }
.btn-secondary { background: transparent; color: var(--c-ink); border: 2px solid var(--c-ink); }

.card {
  background: #fff; border-radius: var(--radius); box-shadow: var(--shadow);
  overflow: hidden;
}
.grid { display: grid; gap: var(--space-3); }
@media (min-width: 700px) { .grid-3 { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 700px) { .grid-2 { grid-template-columns: repeat(2, 1fr); } }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  * { transition: none !important; animation: none !important; }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/styles
git commit -m "feat: add design tokens and global styles"
```

---

## Task 4: Content collections + site data

**Files:**
- Create: `src/content.config.ts`, `src/data/site.json`, sample entries under `src/data/focus-areas/`, `src/data/team/`, `src/data/gallery/`, `src/data/transparency/`

- [ ] **Step 1: Define collection schemas**

Create `src/content.config.ts`:
```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const focusAreas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/focus-areas' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    image: z.string(),
    order: z.number().default(0),
  }),
});

const team = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/team' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    image: z.string().optional(),
    order: z.number().default(0),
  }),
});

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/gallery' }),
  schema: z.object({
    image: z.string(),
    caption: z.string().optional(),
    programme: z.string().optional(),
    order: z.number().default(0),
  }),
});

const transparency = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/transparency' }),
  schema: z.object({
    title: z.string(),
    image: z.string(),
    invoice: z.string().optional(),
    date: z.coerce.date().optional(),
  }),
});

export const collections = { focusAreas, team, gallery, transparency };
```

- [ ] **Step 2: Create the global site data file**

Create `src/data/site.json`:
```json
{
  "orgName": "Sivulingqondo Community Project & ECD",
  "tagline": "Building Foundations for Children. Strengthening Our Community.",
  "phone": "+27 73 778 2770",
  "whatsapp": "27737782770",
  "email": "sivulingqondocommunityproject@gmail.com",
  "address": "2A Starlight Walk, Ikhwezi Park, Khayelitsha, Cape Town",
  "facebook": "https://web.facebook.com/sivulingqondo.comp/",
  "forGood": "https://www.forgood.co.za/za/en/causes/sivulingqondo-community-project-scp-",
  "newsletterAction": "",
  "npoNumber": "",
  "pboNumber": "",
  "campaign": {
    "title": "Tables, Chairs & Safety Mat",
    "goal": 16500,
    "raised": 0,
    "lineItems": [
      { "label": "5 Child-Size Tables", "amount": 6000 },
      { "label": "15 Child-Size Chairs", "amount": 5250 },
      { "label": "3×9m Classroom Mat", "amount": 4500 },
      { "label": "Delivery & Setup", "amount": 750 }
    ],
    "tiers": [
      { "label": "child's chair", "unit": 350 },
      { "label": "child's table", "unit": 1200 }
    ]
  },
  "stats": [
    { "label": "Children in ECD", "value": 15 },
    { "label": "Programmes", "value": 8 },
    { "label": "Years serving Khayelitsha", "value": 5 }
  ]
}
```

- [ ] **Step 3: Create one sample entry per content collection**

Create `src/data/focus-areas/early-childhood-development.md`:
```md
---
title: Early Childhood Development
summary: "Safe care and education for 15 children aged 2–5. Play-based learning, numeracy, literacy, and Xhosa heritage to prepare children for school."
image: /images/placeholder.jpg
order: 1
---
```

Create `src/data/team/founder.md`:
```md
---
name: Nomvuyo Mzilikazi
role: Founder, CEO & Principal Tutor
order: 1
---
```

Create `src/data/gallery/sample.md`:
```md
---
image: /images/placeholder.jpg
caption: Children at our ECD centre
programme: Early Childhood Development
order: 1
---
```

Create `src/data/transparency/sample.md`:
```md
---
title: Example — chairs delivered
image: /images/placeholder.jpg
date: 2026-01-01
---
```

- [ ] **Step 4: Add a placeholder image so the build resolves**

Create `public/images/placeholder.jpg` — copy any small jpg, or create a 1×1 placeholder:
```bash
mkdir -p public/images
printf '\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xd9' > public/images/placeholder.jpg
```

- [ ] **Step 5: Verify content typechecks and builds**

Run: `npm run check && npm run build`
Expected: no schema errors; build completes.

- [ ] **Step 6: Commit**

```bash
git add src/content.config.ts src/data public/images
git commit -m "feat: add content collections and site data"
```

---

## Task 5: BaseLayout + Head (SEO/Open Graph)

**Files:**
- Create: `src/components/Head.astro`, `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Create the SEO head component**

Create `src/components/Head.astro`:
```astro
---
interface Props { title: string; description: string; image?: string; }
const { title, description, image = '/images/placeholder.jpg' } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site ?? Astro.url);
const ogImage = new URL(image, Astro.site ?? Astro.url);
---
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
<meta property="og:type" content="website" />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={ogImage} />
<meta property="og:url" content={canonical} />
<meta name="twitter:card" content="summary_large_image" />
```

- [ ] **Step 2: Create the base layout**

Create `src/layouts/BaseLayout.astro`:
```astro
---
import Head from '../components/Head.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import WhatsAppButton from '../components/WhatsAppButton.astro';
import '../styles/global.css';
interface Props { title: string; description: string; image?: string; }
const { title, description, image } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head><Head title={title} description={description} image={image} /></head>
  <body>
    <Header />
    <main><slot /></main>
    <Footer />
    <WhatsAppButton />
  </body>
</html>
```

- [ ] **Step 3: Set `site` in Astro config**

In `astro.config.mjs`, add `site` inside `defineConfig`:
```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://sivulingqondo.org.za',
});
```

- [ ] **Step 4: Add a favicon placeholder**

Create `public/favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#C0532B"/><text x="16" y="22" font-size="18" text-anchor="middle" fill="#fff" font-family="sans-serif">S</text></svg>
```

(Build verification happens in Task 6 once Header/Footer exist.)

- [ ] **Step 5: Commit**

```bash
git add src/components/Head.astro src/layouts/BaseLayout.astro astro.config.mjs public/favicon.svg
git commit -m "feat: add base layout and SEO head"
```

---

## Task 6: Header (nav + sticky Donate) and Footer

**Files:**
- Create: `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/WhatsAppButton.astro`

- [ ] **Step 1: Create the header**

Create `src/components/Header.astro`:
```astro
---
import site from '../data/site.json';
const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/what-we-do', label: 'What We Do' },
  { href: '/campaign', label: 'Campaign' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/get-involved', label: 'Get Involved' },
  { href: '/contact', label: 'Contact' },
];
const path = Astro.url.pathname;
---
<header class="site-header">
  <div class="container bar">
    <a class="brand" href="/">{site.orgName}</a>
    <nav aria-label="Primary">
      {links.map((l) => (
        <a href={l.href} class={path === l.href ? 'active' : ''}>{l.label}</a>
      ))}
    </nav>
    <a class="btn btn-primary donate" href="/campaign">Donate</a>
  </div>
</header>
<style>
  .site-header { position: sticky; top: 0; z-index: 50; background: var(--c-cream); box-shadow: var(--shadow); }
  .bar { display: flex; align-items: center; gap: var(--space-2); padding-block: var(--space-1); flex-wrap: wrap; }
  .brand { font-weight: 800; text-decoration: none; color: var(--c-indigo); margin-right: auto; }
  nav { display: flex; gap: var(--space-2); flex-wrap: wrap; }
  nav a { text-decoration: none; color: var(--c-ink); font-weight: 600; }
  nav a.active { color: var(--c-terracotta); }
  .donate { white-space: nowrap; }
</style>
```

- [ ] **Step 2: Create the footer**

Create `src/components/Footer.astro`:
```astro
---
import site from '../data/site.json';
const reg = [site.npoNumber && `NPO ${site.npoNumber}`, site.pboNumber && `PBO ${site.pboNumber}`]
  .filter(Boolean).join(' · ');
---
<footer class="site-footer">
  <div class="container">
    <p><strong>{site.orgName}</strong></p>
    <p>{site.address}</p>
    <p>
      <a href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a> ·
      <a href={`mailto:${site.email}`}>{site.email}</a>
    </p>
    {reg && <p class="reg">{reg}</p>}
    <p class="fine">All donations go directly to community programmes.</p>
  </div>
</footer>
<style>
  .site-footer { background: var(--c-indigo); color: #fff; padding-block: var(--space-6); margin-top: var(--space-8); }
  .site-footer a { color: var(--c-ochre); }
  .fine, .reg { color: #d9ddea; font-size: .9rem; }
</style>
```

- [ ] **Step 3: Create the WhatsApp button**

Create `src/components/WhatsAppButton.astro`:
```astro
---
import site from '../data/site.json';
const msg = encodeURIComponent('Hi Sivulingqondo, I would like to help.');
---
<a class="wa" href={`https://wa.me/${site.whatsapp}?text=${msg}`} target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
  <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-11.9 7L4 19.5l1.1-4A8 8 0 1 1 20 11.5Z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M9 8.5c.3-.2.6-.1.8.2l.7 1.1c.1.2.1.4 0 .6l-.4.6c.4.8 1.1 1.5 1.9 1.9l.6-.4c.2-.1.4-.1.6 0l1.1.7c.3.2.4.5.2.8-.4.7-1.2 1-2 .8-2.4-.6-4.3-2.5-4.9-4.9-.2-.8.1-1.6.8-2Z"/></svg>
</a>
<style>
  .wa { position: fixed; right: 16px; bottom: 16px; z-index: 60; background: #25D366; color: #fff;
        width: 56px; height: 56px; border-radius: 50%; display: grid; place-items: center; box-shadow: var(--shadow); }
</style>
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: build completes (pages still to come, but layout + components compile). If "no pages" warning, ignore — Task 7 adds pages.

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.astro src/components/Footer.astro src/components/WhatsAppButton.astro
git commit -m "feat: add header, footer, and WhatsApp button"
```

---

## Task 7: Reusable section components

**Files:**
- Create: `src/components/DonationThermometer.astro`, `src/components/ImpactTiers.astro`, `src/components/FocusAreaCard.astro`, `src/components/StatCounter.astro`, `src/components/GalleryGrid.astro`, `src/components/NewsletterSignup.astro`

- [ ] **Step 1: Donation thermometer**

Create `src/components/DonationThermometer.astro`:
```astro
---
import { progressPercent, formatRand } from '../lib/campaign';
interface Props { raised: number; goal: number; }
const { raised, goal } = Astro.props;
const pct = progressPercent(raised, goal);
---
<div class="thermo" role="img" aria-label={`${formatRand(raised)} raised of ${formatRand(goal)} goal`}>
  <div class="track"><div class="fill" style={`width:${pct}%`}></div></div>
  <p class="labels"><strong>{formatRand(raised)}</strong> raised of {formatRand(goal)} ({pct}%)</p>
</div>
<style>
  .track { background: #eaded0; border-radius: 999px; height: 22px; overflow: hidden; }
  .fill { background: linear-gradient(90deg, var(--c-ochre), var(--c-terracotta)); height: 100%; }
  .labels { margin: var(--space-1) 0 0; }
</style>
```

- [ ] **Step 2: Impact tiers**

Create `src/components/ImpactTiers.astro`:
```astro
---
import { formatRand } from '../lib/campaign';
interface Props { tiers: { label: string; unit: number }[]; }
const { tiers } = Astro.props;
---
<div class="grid grid-3">
  {tiers.map((t) => (
    <div class="card tier">
      <p class="amt">{formatRand(t.unit)}</p>
      <p>funds <strong>1 {t.label}</strong></p>
    </div>
  ))}
</div>
<style>
  .tier { padding: var(--space-3); text-align: center; }
  .amt { font-size: 1.6rem; font-weight: 800; color: var(--c-terracotta); margin: 0; }
</style>
```

- [ ] **Step 3: Focus-area card**

Create `src/components/FocusAreaCard.astro`:
```astro
---
interface Props { title: string; summary: string; image: string; }
const { title, summary, image } = Astro.props;
---
<article class="card fa">
  <img src={image} alt={title} loading="lazy" width="600" height="400" />
  <div class="body">
    <h3>{title}</h3>
    <p>{summary}</p>
  </div>
</article>
<style>
  .fa img { aspect-ratio: 3/2; object-fit: cover; width: 100%; }
  .body { padding: var(--space-3); }
  .fa h3 { color: var(--c-teal); }
</style>
```

- [ ] **Step 4: Stat counter (animated island)**

Create `src/components/StatCounter.astro`:
```astro
---
interface Props { value: number; label: string; }
const { value, label } = Astro.props;
---
<div class="stat" data-value={value}>
  <span class="num">0</span>
  <span class="lbl">{label}</span>
</div>
<style>
  .stat { text-align: center; }
  .num { display: block; font-size: 2.6rem; font-weight: 800; color: var(--c-indigo); }
  .lbl { color: var(--c-muted); }
</style>
<script>
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll<HTMLElement>('.stat').forEach((el) => {
    const target = Number(el.dataset.value || 0);
    const num = el.querySelector('.num')!;
    if (reduce) { num.textContent = String(target); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        let cur = 0;
        const step = Math.max(1, Math.ceil(target / 40));
        const tick = () => {
          cur = Math.min(target, cur + step);
          num.textContent = String(cur);
          if (cur < target) requestAnimationFrame(tick);
        };
        tick();
      });
    }, { threshold: 0.4 });
    io.observe(el);
  });
</script>
```

- [ ] **Step 5: Gallery grid**

Create `src/components/GalleryGrid.astro`:
```astro
---
interface Item { image: string; caption?: string; }
interface Props { items: Item[]; }
const { items } = Astro.props;
---
<div class="grid grid-3">
  {items.map((it) => (
    <figure class="card g">
      <img src={it.image} alt={it.caption ?? ''} loading="lazy" width="600" height="600" />
      {it.caption && <figcaption>{it.caption}</figcaption>}
    </figure>
  ))}
</div>
<style>
  .g img { aspect-ratio: 1/1; object-fit: cover; width: 100%; }
  figcaption { padding: var(--space-2); font-size: .9rem; color: var(--c-muted); }
  figure { margin: 0; }
</style>
```

- [ ] **Step 6: Newsletter signup**

Create `src/components/NewsletterSignup.astro`:
```astro
---
import site from '../data/site.json';
const action = site.newsletterAction;
---
{action ? (
  <form class="news" action={action} method="post" target="_blank">
    <label for="news-email">Get our updates</label>
    <div class="row">
      <input id="news-email" type="email" name="EMAIL" placeholder="you@email.com" required />
      <button class="btn btn-primary" type="submit">Subscribe</button>
    </div>
  </form>
) : (
  <p class="news-todo">Newsletter signup will appear here once a mailing-list link is added in the CMS.</p>
)}
<style>
  .row { display: flex; gap: var(--space-1); flex-wrap: wrap; }
  .news input { padding: .7rem; border: 1px solid #d8c9b6; border-radius: var(--radius); flex: 1 1 220px; }
</style>
```

- [ ] **Step 7: Verify build**

Run: `npm run build && npm run check`
Expected: compiles, no type errors.

- [ ] **Step 8: Commit**

```bash
git add src/components
git commit -m "feat: add reusable section components"
```

---

## Task 8: Home page

**Files:**
- Create: `src/pages/index.astro`

- [ ] **Step 1: Build the home page**

Create `src/pages/index.astro`:
```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import DonationThermometer from '../components/DonationThermometer.astro';
import FocusAreaCard from '../components/FocusAreaCard.astro';
import StatCounter from '../components/StatCounter.astro';
import NewsletterSignup from '../components/NewsletterSignup.astro';
import site from '../data/site.json';

const focus = (await getCollection('focusAreas')).sort((a, b) => a.data.order - b.data.order).slice(0, 6);
const c = site.campaign;
---
<BaseLayout title={`${site.orgName}`} description={site.tagline}>
  <section class="hero section">
    <div class="container">
      <h1>{site.tagline}</h1>
      <p class="lede">We provide Early Childhood Development, afterschool care, youth empowerment, and cultural programmes for families in Khayelitsha.</p>
      <div class="cta-row">
        <a class="btn btn-primary" href="/campaign">Support Our Tables & Chairs Campaign</a>
        <a class="btn btn-secondary" href="/about">About Us</a>
      </div>
    </div>
  </section>

  <section class="section campaign-banner">
    <div class="container">
      <h2>{c.title}</h2>
      <DonationThermometer raised={c.raised} goal={c.goal} />
      <a class="btn btn-primary" href="/campaign">See the campaign</a>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="grid grid-3 stats">
        {site.stats.map((s) => <StatCounter value={s.value} label={s.label} />)}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <h2>What we do</h2>
      <div class="grid grid-3">
        {focus.map((f) => <FocusAreaCard title={f.data.title} summary={f.data.summary} image={f.data.image} />)}
      </div>
      <p><a class="btn btn-secondary" href="/what-we-do">See all programmes</a></p>
    </div>
  </section>

  <section class="section">
    <div class="container"><NewsletterSignup /></div>
  </section>
</BaseLayout>
<style>
  .hero { background: linear-gradient(135deg, var(--c-teal), var(--c-indigo)); color: #fff; }
  .hero .lede { font-size: 1.2rem; max-width: 40ch; }
  .cta-row { display: flex; gap: var(--space-2); flex-wrap: wrap; margin-top: var(--space-3); }
  .campaign-banner { background: #fff; }
</style>
```

- [ ] **Step 2: Verify build + preview visually**

Run: `npm run build && npm run preview`
Open the previewed URL. Expected: home page renders with hero, thermometer (R0 of R16,500), stats counting up, focus cards.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add home page"
```

---

## Task 9: About, What We Do, Gallery, Get Involved, Contact pages

**Files:**
- Create: `src/pages/about.astro`, `src/pages/what-we-do.astro`, `src/pages/gallery.astro`, `src/pages/get-involved.astro`, `src/pages/contact.astro`

- [ ] **Step 1: About page**

Create `src/pages/about.astro`:
```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import site from '../data/site.json';
const team = (await getCollection('team')).sort((a, b) => a.data.order - b.data.order);
---
<BaseLayout title={`About — ${site.orgName}`} description="Our story, mission, and team.">
  <section class="section"><div class="container">
    <h1>About Us</h1>
    <h2>Our Story</h2>
    <p>Sivulingqondo Community Project and ECD was founded to create safe spaces where children can learn, youth can grow, and culture can thrive. We believe every child deserves dignity, every young person deserves opportunity, and every community deserves to keep its heritage alive.</p>
    <h2>Mission</h2>
    <p>To build strong foundations for children, create opportunities for youth, and strengthen our community through dignity, skills, care, and the preservation of Xhosa culture and heritage.</p>
    <h2>Our Team</h2>
    <div class="grid grid-3">
      {team.map((m) => (
        <div class="card" style="padding:var(--space-3)">
          <h3 style="margin-bottom:.2rem">{m.data.name}</h3>
          <p style="color:var(--c-muted)">{m.data.role}</p>
        </div>
      ))}
    </div>
    <h2>Transparency</h2>
    <p>We are committed to full transparency. 100% of campaign funds go directly to furniture and safety equipment, and we post photos and invoices of every purchase. {site.npoNumber || site.pboNumber ? 'We are a registered NPO/PBO.' : ''}</p>
  </div></section>
</BaseLayout>
```

- [ ] **Step 2: What We Do page**

Create `src/pages/what-we-do.astro`:
```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import FocusAreaCard from '../components/FocusAreaCard.astro';
import site from '../data/site.json';
const focus = (await getCollection('focusAreas')).sort((a, b) => a.data.order - b.data.order);
---
<BaseLayout title={`What We Do — ${site.orgName}`} description="Our programmes and focus areas.">
  <section class="section"><div class="container">
    <h1>What We Do</h1>
    <div class="grid grid-3">
      {focus.map((f) => <FocusAreaCard title={f.data.title} summary={f.data.summary} image={f.data.image} />)}
    </div>
  </div></section>
</BaseLayout>
```

- [ ] **Step 3: Gallery page**

Create `src/pages/gallery.astro`:
```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import GalleryGrid from '../components/GalleryGrid.astro';
import site from '../data/site.json';
const photos = (await getCollection('gallery')).sort((a, b) => a.data.order - b.data.order)
  .map((p) => ({ image: p.data.image, caption: p.data.caption }));
---
<BaseLayout title={`Gallery — ${site.orgName}`} description="Photos from our programmes.">
  <section class="section"><div class="container">
    <h1>Gallery</h1>
    <GalleryGrid items={photos} />
  </div></section>
</BaseLayout>
```

- [ ] **Step 4: Get Involved page**

Create `src/pages/get-involved.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import site from '../data/site.json';
---
<BaseLayout title={`Get Involved — ${site.orgName}`} description="Donate, volunteer, partner, or donate goods.">
  <section class="section"><div class="container">
    <h1>Get Involved</h1>
    <div class="grid grid-2">
      <div class="card" style="padding:var(--space-3)">
        <h3>Donate</h3>
        <p>Give securely via ForGood. 100% goes to community programmes.</p>
        <a class="btn btn-primary" href={site.forGood} target="_blank" rel="noopener">Donate via ForGood</a>
      </div>
      <div class="card" style="padding:var(--space-3)">
        <h3>Volunteer or Partner</h3>
        <p>Share your time or skills, or partner with us as a business.</p>
        <a class="btn btn-secondary" href="/contact">Get in touch</a>
      </div>
      <div class="card" style="padding:var(--space-3)">
        <h3>Donate Goods</h3>
        <p>Furniture, books, toys, and food all help. Contact us to arrange drop-off.</p>
        <a class="btn btn-secondary" href="/contact">Contact us</a>
      </div>
      <div class="card" style="padding:var(--space-3)">
        <h3>Chat on WhatsApp</h3>
        <p>The fastest way to reach us.</p>
        <a class="btn btn-primary" href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener">Open WhatsApp</a>
      </div>
    </div>
  </div></section>
</BaseLayout>
```

- [ ] **Step 5: Contact page (with Netlify form)**

Create `src/pages/contact.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import site from '../data/site.json';
const mapQuery = encodeURIComponent(site.address);
---
<BaseLayout title={`Contact — ${site.orgName}`} description="Get in touch with Sivulingqondo.">
  <section class="section"><div class="container">
    <h1>Contact Us</h1>
    <div class="grid grid-2">
      <div>
        <p><strong>{site.orgName}</strong></p>
        <p>{site.address}</p>
        <p>Phone/WhatsApp: <a href={`tel:${site.phone.replace(/\s/g,'')}`}>{site.phone}</a></p>
        <p>Email: <a href={`mailto:${site.email}`}>{site.email}</a></p>
        <p>Facebook: <a href={site.facebook} target="_blank" rel="noopener">facebook.com/sivulingqondo.comp</a></p>
        <iframe title="Map" width="100%" height="260" style="border:0;border-radius:var(--radius)" loading="lazy"
          src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`}></iframe>
      </div>
      <form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" class="card" style="padding:var(--space-3)">
        <input type="hidden" name="form-name" value="contact" />
        <p hidden><label>Don't fill: <input name="bot-field" /></label></p>
        <p><label>Name<br /><input name="name" required /></label></p>
        <p><label>Email<br /><input type="email" name="email" required /></label></p>
        <p><label>Message<br /><textarea name="message" rows="5" required></textarea></label></p>
        <button class="btn btn-primary" type="submit">Send</button>
      </form>
    </div>
  </div></section>
</BaseLayout>
<style>
  form input, form textarea { width: 100%; padding: .6rem; border: 1px solid #d8c9b6; border-radius: var(--radius); }
</style>
```

- [ ] **Step 6: Verify build + preview**

Run: `npm run build && npm run check`
Expected: all 7 pages build, no type errors. Spot-check each page in `npm run preview`.

- [ ] **Step 7: Commit**

```bash
git add src/pages/about.astro src/pages/what-we-do.astro src/pages/gallery.astro src/pages/get-involved.astro src/pages/contact.astro
git commit -m "feat: add about, what-we-do, gallery, get-involved, contact pages"
```

---

## Task 10: Campaign page

**Files:**
- Create: `src/pages/campaign.astro`

- [ ] **Step 1: Build the campaign page**

Create `src/pages/campaign.astro`:
```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import DonationThermometer from '../components/DonationThermometer.astro';
import ImpactTiers from '../components/ImpactTiers.astro';
import { formatRand } from '../lib/campaign';
import site from '../data/site.json';
const c = site.campaign;
const proof = (await getCollection('transparency'));
---
<BaseLayout title={`${c.title} — ${site.orgName}`} description="Help 15 children learn with dignity. Goal: R16,500.">
  <section class="section"><div class="container">
    <h1>{c.title}</h1>
    <p class="lede">15 children aged 2–5 learn and eat on a bare floor every day. They need tables, chairs, and a 3×9m safety mat to meet ECD standards and give them dignity.</p>
    <DonationThermometer raised={c.raised} goal={c.goal} />
    <p><a class="btn btn-primary" href={site.forGood} target="_blank" rel="noopener">Donate via ForGood</a></p>

    <h2>What your donation funds</h2>
    <ImpactTiers tiers={c.tiers} />

    <h2>Budget breakdown</h2>
    <table class="budget">
      <tbody>
        {c.lineItems.map((li) => (
          <tr><td>{li.label}</td><td class="amt">{formatRand(li.amount)}</td></tr>
        ))}
        <tr class="total"><td>Total Goal</td><td class="amt">{formatRand(c.goal)}</td></tr>
      </tbody>
    </table>

    <h2>Full transparency</h2>
    <p>100% of funds go directly to furniture and safety equipment. We post photos and invoices of every purchase below.</p>
    {proof.length > 0 ? (
      <div class="grid grid-3">
        {proof.map((p) => (
          <figure class="card" style="margin:0">
            <img src={p.data.image} alt={p.data.title} loading="lazy" width="600" height="400" style="aspect-ratio:3/2;object-fit:cover" />
            <figcaption style="padding:var(--space-2)">{p.data.title}
              {p.data.invoice && <> · <a href={p.data.invoice} target="_blank" rel="noopener">View invoice</a></>}
            </figcaption>
          </figure>
        ))}
      </div>
    ) : (
      <p>Photos and invoices will be posted here as soon as we begin purchasing.</p>
    )}
  </div></section>
</BaseLayout>
<style>
  .lede { font-size: 1.15rem; max-width: 55ch; }
  .budget { width: 100%; max-width: 520px; border-collapse: collapse; }
  .budget td { padding: .6rem 0; border-bottom: 1px solid #e3d7c6; }
  .budget .amt { text-align: right; font-variant-numeric: tabular-nums; }
  .budget .total td { font-weight: 800; border-bottom: 0; color: var(--c-terracotta); }
</style>
```

- [ ] **Step 2: Verify build + preview**

Run: `npm run build && npm run preview`
Expected: campaign page shows thermometer, impact tiers (R350 = 1 chair, R1,200 = 1 table), budget table totalling R16,500, transparency section.

- [ ] **Step 3: Commit**

```bash
git add src/pages/campaign.astro
git commit -m "feat: add campaign page with thermometer, tiers, budget, transparency"
```

---

## Task 11: Sveltia CMS admin

**Files:**
- Create: `public/admin/index.html`, `public/admin/config.yml`

- [ ] **Step 1: Create the CMS shell**

Create `public/admin/index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Sivulingqondo — Content Editor</title>
  </head>
  <body>
    <script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Create the CMS config**

Create `public/admin/config.yml` (set `repo` to the actual GitHub `owner/name` during Task 13):
```yaml
backend:
  name: github
  repo: OWNER/REPO
  branch: main
media_folder: "public/images"
public_folder: "/images"
collections:
  - name: site
    label: Site & Campaign Settings
    files:
      - name: site
        label: Global Settings
        file: src/data/site.json
        fields:
          - { name: orgName, label: Organisation name, widget: string }
          - { name: tagline, label: Tagline, widget: string }
          - { name: phone, label: Phone, widget: string }
          - { name: whatsapp, label: WhatsApp number (digits only, e.g. 27737782770), widget: string }
          - { name: email, label: Email, widget: string }
          - { name: address, label: Address, widget: string }
          - { name: facebook, label: Facebook URL, widget: string }
          - { name: forGood, label: ForGood donation URL, widget: string }
          - { name: newsletterAction, label: Newsletter form action URL, widget: string, required: false }
          - { name: npoNumber, label: NPO number, widget: string, required: false }
          - { name: pboNumber, label: PBO number, widget: string, required: false }
          - name: campaign
            label: Campaign
            widget: object
            fields:
              - { name: title, label: Title, widget: string }
              - { name: goal, label: Goal (Rand), widget: number, value_type: int }
              - { name: raised, label: Amount raised so far (Rand), widget: number, value_type: int }
              - name: lineItems
                label: Budget line items
                widget: list
                fields:
                  - { name: label, label: Label, widget: string }
                  - { name: amount, label: Amount (Rand), widget: number, value_type: int }
              - name: tiers
                label: Impact tiers
                widget: list
                fields:
                  - { name: label, label: "Item (e.g. child's chair)", widget: string }
                  - { name: unit, label: Cost per item (Rand), widget: number, value_type: int }
          - name: stats
            label: Impact stats
            widget: list
            fields:
              - { name: label, label: Label, widget: string }
              - { name: value, label: Value, widget: number, value_type: int }
  - name: focusAreas
    label: Focus Areas / Programmes
    folder: src/data/focus-areas
    create: true
    format: frontmatter
    slug: "{{slug}}"
    fields:
      - { name: title, label: Title, widget: string }
      - { name: summary, label: Summary, widget: text }
      - { name: image, label: Image, widget: image }
      - { name: order, label: Order, widget: number, value_type: int, default: 0 }
  - name: team
    label: Team Members
    folder: src/data/team
    create: true
    format: frontmatter
    slug: "{{slug}}"
    fields:
      - { name: name, label: Name, widget: string }
      - { name: role, label: Role, widget: string }
      - { name: image, label: Photo, widget: image, required: false }
      - { name: order, label: Order, widget: number, value_type: int, default: 0 }
  - name: gallery
    label: Gallery Photos
    folder: src/data/gallery
    create: true
    format: frontmatter
    slug: "{{slug}}"
    fields:
      - { name: image, label: Photo, widget: image }
      - { name: caption, label: Caption, widget: string, required: false }
      - { name: programme, label: Programme, widget: string, required: false }
      - { name: order, label: Order, widget: number, value_type: int, default: 0 }
  - name: transparency
    label: Transparency Wall (purchases)
    folder: src/data/transparency
    create: true
    format: frontmatter
    slug: "{{slug}}"
    fields:
      - { name: title, label: What was bought, widget: string }
      - { name: image, label: Photo, widget: image }
      - { name: invoice, label: Invoice link, widget: string, required: false }
      - { name: date, label: Date, widget: date, required: false }
```

- [ ] **Step 3: Verify the admin is served**

Run: `npm run build`
Expected: build succeeds; `dist/admin/index.html` and `dist/admin/config.yml` exist (Astro copies `public/` verbatim).

- [ ] **Step 4: Commit**

```bash
git add public/admin
git commit -m "feat: add Sveltia CMS admin and config"
```

---

## Task 12: Netlify config, robots, sitemap

**Files:**
- Create: `netlify.toml`, `public/robots.txt`
- Modify: `package.json` (add sitemap integration), `astro.config.mjs`

- [ ] **Step 1: Add the sitemap integration**

```bash
npx astro add sitemap --yes
```
Expected: installs `@astrojs/sitemap` and adds it to `astro.config.mjs` `integrations`. If the CLI cannot auto-edit, manually add:
```js
import sitemap from '@astrojs/sitemap';
// integrations: [sitemap()]
```

- [ ] **Step 2: Create robots.txt**

Create `public/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://sivulingqondo.org.za/sitemap-index.xml
```

- [ ] **Step 3: Create netlify.toml**

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
```

- [ ] **Step 4: Verify build + sitemap output**

Run: `npm run build`
Expected: build succeeds; `dist/sitemap-index.xml` exists.

- [ ] **Step 5: Commit**

```bash
git add netlify.toml public/robots.txt astro.config.mjs package.json package-lock.json
git commit -m "chore: add Netlify config, robots.txt, and sitemap"
```

---

## Task 13: Handover docs + deployment guide

**Files:**
- Create: `docs/HANDOVER.md`, `docs/FUTURE-IDEAS.md`, `README.md`

- [ ] **Step 1: Write the NGO handover guide**

Create `docs/HANDOVER.md` covering, in plain English:
- How to open the editor: go to `https://sivulingqondo.org.za/admin`, click "Login with GitHub".
- How to update the **donation total**: Site & Campaign Settings → Campaign → "Amount raised so far" → Save/Publish.
- How to **add a photo** to the gallery: Gallery Photos → New → upload image → caption → Publish.
- How to **add a transparency item** (photo + invoice link).
- How to **edit a programme** or **add a team member**.
- Note: changes go live automatically in ~1–2 minutes (Netlify rebuild).

```md
# Sivulingqondo Website — Handover Guide

This site updates itself when you edit content. You never touch code.

## Logging in
1. Go to **https://sivulingqondo.org.za/admin**
2. Click **Login with GitHub** and approve.

## Update the donation total (the progress bar)
Site & Campaign Settings → **Campaign** → **Amount raised so far (Rand)** →
type the new number → **Publish**. The bar updates in ~1–2 minutes.

## Add a gallery photo
**Gallery Photos** → **New Gallery Photos** → upload the image, add a caption →
**Publish**.

## Add a "what we bought" item (transparency wall)
**Transparency Wall** → **New** → title (e.g. "15 chairs delivered"), upload a
photo, paste an invoice link if you have one → **Publish**.

## Edit a programme or add a team member
Use **Focus Areas / Programmes** or **Team Members** the same way.

## Tips
- Use real photos, landscape where possible.
- Keep captions short.
- If something looks wrong, wait 2 minutes and refresh — it may still be publishing.
```

- [ ] **Step 2: Write the future-ideas doc**

Create `docs/FUTURE-IDEAS.md`:
```md
# Future Ideas (Tier 3)

- **isiXhosa / English toggle** — structure is ready; add translated copy.
- **Blog / news** — add a `posts` collection + `/news` page for storytelling.
- **Recurring donations** — promote monthly giving via ForGood.
- **Google for Nonprofits** — free Google Workspace + Ad Grants (up to $10k/mo
  in search ads). Apply once NPO/PBO numbers are confirmed.
- **Newsletter automation** — connect Mailchimp/Buttondown (set the form URL in CMS).
```

- [ ] **Step 3: Write the developer README (deployment steps)**

Create `README.md` with: local dev (`npm install`, `npm run dev`), and deployment:
1. Push repo to GitHub.
2. In `public/admin/config.yml`, set `repo: OWNER/REPO`.
3. Create a Netlify site from the repo (build `npm run build`, publish `dist`).
4. Enable **Netlify Identity** + **Git Gateway** OR configure Sveltia GitHub OAuth (link Netlify's GitHub OAuth app) so `/admin` login works.
5. Add custom domain `sivulingqondo.org.za` in Netlify; update DNS.
6. Confirm `/admin` login and a test edit publishes.

```md
# Sivulingqondo Website

Astro static site + Sveltia CMS, deployed on Netlify.

## Local development
\`\`\`bash
npm install
npm run dev      # http://localhost:4321
npm test         # unit tests
npm run build    # production build to dist/
\`\`\`

## Deployment
1. Push this repo to GitHub.
2. Edit \`public/admin/config.yml\` → set \`repo: OWNER/REPO\`.
3. On Netlify: **New site from Git** → pick the repo → build \`npm run build\`, publish \`dist\`.
4. Enable GitHub auth for the CMS (Netlify Git Gateway + Identity, or Sveltia GitHub OAuth).
5. Add domain \`sivulingqondo.org.za\` and point DNS to Netlify.
6. Visit \`/admin\`, log in, make a test edit, confirm it republishes.
```

- [ ] **Step 4: Commit**

```bash
git add docs/HANDOVER.md docs/FUTURE-IDEAS.md README.md
git commit -m "docs: add handover guide, future ideas, and deployment README"
```

---

## Task 14: Final verification pass

- [ ] **Step 1: Run the full gate**

```bash
npm test && npm run check && npm run build
```
Expected: tests pass, no type errors, build completes with all 7 pages + `/admin` + sitemap.

- [ ] **Step 2: Manual mobile check**

Run `npm run preview`, open in a browser, toggle device emulation to a phone width (~375px). Verify on every page: nav wraps cleanly, sticky Donate visible, WhatsApp bubble visible, thermometer and tables readable, no horizontal scroll.

- [ ] **Step 3: Accessibility spot-check**

Confirm: images have alt text, colour contrast on CTA buttons is strong, headings are in order, the contact form inputs have labels. Fix any gaps inline.

- [ ] **Step 4: Final commit (if any fixes)**

```bash
git add -A
git commit -m "fix: final verification pass adjustments"
```

---

## Post-implementation (human-in-the-loop, not code)

These require the user/NGO and happen after the build:
- Provide 6–8 real photos → upload via `/admin` (replaces `placeholder.jpg` references).
- Confirm NPO/PBO numbers and current amount raised → enter via `/admin`.
- Add remaining 7 focus-area entries (only ECD is seeded) via `/admin` or as `.md` files.
- Push to GitHub, deploy to Netlify, wire up `/admin` auth and the custom domain (README Task 13).
```
