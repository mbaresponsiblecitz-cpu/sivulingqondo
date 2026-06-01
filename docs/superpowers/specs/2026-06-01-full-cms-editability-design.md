# Full CMS Editability — Design Spec

**Date:** 2026-06-01
**Author:** Rayhaan Yunus (volunteer project)
**Status:** Approved — implementing

## 1. Goal

Make as much of the public site as possible editable by the non-technical NGO team
via the Sveltia CMS at `/admin`, so they can change any text, list, link, photo,
number, or contact detail **without developer assistance** — while keeping the
design, layout, and colours fixed so nothing can break.

## 2. Scope (agreed)

- **All real content** editable: every headline, paragraph, list, card, and photo.
- **Stays fixed (not in CMS):** navigation links, the "Donate" button label,
  colours/fonts/spacing/layout, component structure, contact-form mechanics.
- **Editability only** — inner-page layouts keep their current design (no redesign
  this pass).

## 3. Approach (chosen)

**Per-page content files (Approach B).** One small JSON file per page under
`src/data/pages/`, each surfaced as its own labelled screen in the CMS. Shared/global
content stays in `site.json`. Repeating content keeps its existing collections.

## 4. Data model

### `src/data/site.json` (expanded — global/shared)
Existing fields retained. Add:
- `partners`: string[] — partner/funder names (was hardcoded in home)
- `programmeTicker`: string[] — rotating marquee list (was hardcoded in home)
- `whatsappMessage`: string — pre-filled WhatsApp chat text (was in WhatsAppButton)
- `footerNote`: string — small footer line (was in Footer)
- each `campaign.tiers[]` gains `emoji`: string — tier icon (was hardcoded array)

### `src/data/pages/*.json` (new — one per page)
- `home.json`: hero (eyebrow, headline, intro, 2 CTA labels, 4 collage photos + alts);
  campaign card (tag, intro, right heading, trust note); programmes (eyebrow, heading,
  subtext); story (eyebrow, heading, body, quote, badge title, badge subtitle);
  transparency (eyebrow, heading, intro, partners label); get-involved band
  (eyebrow, heading, intro, 3 CTA labels)
- `about.json`: page heading; story heading + body; mission heading + body;
  team heading; transparency heading + body
- `campaign.json`: appeal intro; funds heading; budget heading; transparency
  heading + intro; empty-state text
- `get-involved.json`: page heading; `cards[]` (title, body, buttonLabel, buttonUrl)
- `contact.json`: page heading; optional intro; form button label

### Existing collections (unchanged)
Programmes (focusAreas), Team, Gallery, Transparency Wall.

## 5. Safety / fallbacks

- Every field reads `value || "<current default>"` so a cleared field renders the
  existing default rather than a blank/broken section.
- Image fields fall back to the current image path.
- Long-form body copy (story, mission, appeal) uses a markdown/rich-text widget.

## 6. CMS config (`public/admin/config.yml`)

- Add new fields to the existing `site` file (partners, ticker, whatsappMessage,
  footerNote, tier emoji).
- Add five new single-file collections: Home Page, About Page, Campaign Page,
  Get Involved Page, Contact Page — each with plainly-labelled fields, `image`
  widgets for photos, `markdown` for body copy, `list` widgets for cards.

Resulting `/admin` sidebar: Site & Campaign Settings · Home Page · About Page ·
Campaign Page · Get Involved Page · Contact Page · Programmes · Team · Gallery ·
Transparency Wall.

## 7. Out of scope

- Inner-page visual redesign (separate follow-up).
- isiXhosa translation copy.
- Editable navigation/colours/layout.

## 8. Verification

- `npm run build` succeeds; all pages render with defaults when fields are empty.
- Manual: edit a field locally, confirm it appears; clear it, confirm fallback.
