# Sivulingqondo Community Project & ECD — Website Design Spec

**Date:** 2026-05-31
**Author:** Rayhaan Yunus (MBA volunteer project)
**Status:** Approved design — ready for implementation plan

## 1. Goal

Build a brand-new, beautiful, mobile-first website to **replace** the current site
(sivulingqondo.org.za). It must look professional and distinctive, while remaining
**editable by the non-technical NGO team** via a simple visual CMS. Free to host and run.

## 2. Audience

- **Primary:** Donors (individual + corporate/CSI) viewing on a phone, often via a
  WhatsApp/Facebook link.
- **Secondary:** Parents of children in the area; prospective volunteers/partners.

## 3. Approach (chosen)

**Custom Astro static site + Git-based visual CMS (Sveltia/Decap CMS).**

- Astro for a fast, fully-custom, mobile-first static site.
- Sveltia/Decap CMS gives the NGO a "log in and edit" admin panel backed by the Git repo.
- Hosted free on **Netlify** (or Cloudflare Pages), pointed at `sivulingqondo.org.za`.

Rejected: pure-static (not NGO-editable); WordPress/Wix (cost + generic + not buildable here).

## 4. Site structure (multi-page)

| Page | Purpose |
|---|---|
| **Home** | Hero + campaign banner, focus-area snapshot, impact stats, photo highlights, donate CTAs |
| **About Us** | Story, mission, founder (Nomvuyo Mzilikazi), team, NPO/PBO registration & transparency |
| **What We Do** | All 8 focus areas, each with a photo |
| **Campaign: Tables & Chairs** | R16,500 appeal, live progress bar, budget breakdown, donate → ForGood, transparency promise |
| **Gallery** | Real photos grouped by programme |
| **Get Involved** | Donate / volunteer / partner / donate goods |
| **Contact** | Phone/WhatsApp, email, address + map, Facebook, contact form |

- Persistent top nav + sticky **"Donate"** button (always one tap away on mobile).
- 8 focus areas: ECD; Afterschool Care; Sports, Arts, Culture & Heritage; Youth Empowerment;
  Community Support / Feeding; GBV Awareness & Counselling; Food Security / Garden.

## 5. Features

**Tier 1 (build now):**
- **Live donation thermometer** — animated progress bar (current / R16,500), number editable in CMS.
- **WhatsApp click-to-chat** floating button.
- **"Your impact" donation tiers** — R350 = 1 chair, R1,200 = 1 table, etc.
- **Transparency wall** — photos + invoices of what funds bought.
- **SEO + social share cards** — Open Graph/Twitter meta for good WhatsApp/Facebook previews.

**Tier 2 (build now, low effort):**
- Newsletter signup (free Mailchimp/Buttondown embed).
- Volunteer/partner enquiry form (Netlify Forms / Formspree → email).
- **isiXhosa / English toggle** — set up structurally now, content filled later.
- Animated impact-stat counters.

**Tier 3 (document only, future):**
- Blog/news; recurring-donation messaging; Google for Nonprofits (Ad Grants + Workspace).

## 6. CMS-editable content model

Editable without code: hero text; campaign goal + current amount; focus-area cards; gallery
photos; transparency-wall items (photo + caption + invoice); team members; impact stats;
contact details; newsletter link. Layout, colours, and code stay fixed.

## 7. Visual design direction

- Warm, dignified, African-rooted palette (terracotta/ochre, deep teal or indigo, cream),
  bright accent for CTAs. Not generic "charity blue."
- Real photos lead — large, full-bleed. Clean sans-serif, generous spacing, friendly rounded cards.
- Mobile-first; fast and accessible (optimised images, strong contrast, works on slow connections).

## 8. Known real content

- **Org:** Sivulingqondo Community Project & ECD. Founder/CEO & Principal Tutor: Nomvuyo Mzilikazi.
- **Phone/WhatsApp:** +27 73 778 2770
- **Email:** sivulingqondocommunityproject@gmail.com
- **Address:** 2A Starlight Walk, Ikhwezi Park, Khayelitsha, Cape Town
- **ForGood:** https://www.forgood.co.za/za/en/causes/sivulingqondo-community-project-scp-
- **Facebook:** https://web.facebook.com/sivulingqondo.comp/
- **Domain:** sivulingqondo.org.za

**To confirm with NGO:** NPO/PBO registration numbers; current campaign amount raised; real
photos (sourced from Facebook / provided by NGO); exact donation-tier wording.

## 9. Hosting & handover

- Free hosting (Netlify/Cloudflare Pages) on `sivulingqondo.org.za`.
- Deliverables: the site, the CMS admin, a plain-English **handover guide** (login, edit text,
  swap photos, update donation total), and a Tier-3 **future-ideas** doc.

## 10. Out of scope (for now)

- Payment processing on-site (donations go via ForGood).
- Blog/CMS beyond the content model above.
- Full isiXhosa translation (structure only; copy later).
