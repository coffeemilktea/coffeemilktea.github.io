# Modernize: landing page redesign (branch `modernize`)

Not pushed. Preview locally with `python3 -m http.server 8000` (links into `/hl7-dicom-tools/` and
`/HL7-Interface-Javascript-Builder/` only resolve on the live host or with a server that maps them).

## Landing page (`index.html`, `assets/landing.css`, `assets/landing.js`)
- **Hero**: one-line pitch, an animated background (drifting Tokyo Night glows and a slowly panning
  grid under a radial mask), a terminal panel that types out the synthetic HL7 v2.5.1 sample (with
  DICOM and FHIR R4 tabs, arrow-key navigation and click to finish), and four factual "at a glance"
  figures (7 tools, 2 reference pages, HL7 v2.5.1, 0 installs).
- **Tool showcase**: nine cards (the six hl7-dicom-tools tools, the Mirth Transformer Builder, the
  converter and the handbook), each with its real screenshot, kind label, a one-line description taken
  from the READMEs, tags, and Open / Source buttons. Hover lifts and tilts the card (mouse only),
  zooms the desktop screenshot and slides in the phone screenshot.
- **Filter chips**: All / HL7 / DICOM / FHIR with live counts and a polite status announcement.
- **Lightbox** (`<dialog>`): click any screenshot for the full-size desktop or phone shot, use cases
  (moved from the old htmx panels), Open/Source buttons, previous/next buttons and arrow keys; Esc closes
  and focus returns to the card.
- **How it works + privacy**: three steps and a callout for the one exception, the MWL Simulator's
  External mode (QIDO-RS to the DICOMweb URL you enter), as stated in the hl7-dicom-tools README.
- **Repositories** section with the five public repos and their GitHub descriptions (MCP servers marked
  "Work in progress", as before).
- Scroll-reveal via IntersectionObserver, sticky header that shrinks on scroll, CSS smooth anchor scrolling.

## Shared chrome (`assets/site.css`, `assets/site.js`)
- One new header (brand, nav, HL7 v2.5.1 badge, GitHub; a `<details>` menu on phones) and one footer,
  used on the landing page, converter, handbook and 404. Classes are prefixed `sx-` so they don't collide
  with the pages' own CSS.
- Converter: new header/footer, `<main>` landmark, MCP server link moved into the page intro.
- Handbook: new header above the grid; the sticky contents rail now starts below it; 44px touch targets
  for the mobile contents list and "Back to top".
- 404: rebuilt in the new visual language with a static tool list (no htmx).

## Assets
- `assets/screenshots/`: `-card` (640×400), `-phone` (200×433), `-desktop` (1280×800) and `-mobile`
  (780×1688) WebP for all nine cards. Six tools reuse hl7-dicom-tools `docs/screenshots` (samples loaded);
  the Mirth builder (ADT^A01 sample + three recipes), converter and handbook were shot fresh.
- `favicon.ico` (16/32/48, fixes the 404), `apple-touch-icon.png`, `assets/icon-192/512.png`,
  `site.webmanifest`, and `assets/og.jpg` (1200×630) wired into OG/Twitter tags on every public page.
- `docs/screenshots/` landing, converter and handbook shots refreshed for the README.

## Removed
- htmx (`vendor/htmx.min.js`) and the `partials/` fragments: nothing uses them any more (use cases now
  live in each card's `<template>`). `robots.txt` no longer disallows `/partials/`.

## Unchanged on purpose
- `assets/tokyo-night.css` (still byte-identical to hl7-dicom-tools `tools/tokyo-night.css`),
  `assets/tokens.css`, `tools/theme.js`; dark mode only; HL7 v2.5.1; every existing URL and every
  `/hl7-dicom-tools/tools/*` link; `sitemap.xml`.

## Accessibility and performance
- Skip link, `header`/`nav`/`main`/`footer` landmarks, visible focus rings, `aria-pressed` filters,
  ARIA tabs, labelled dialog. All text/background pairs used clear WCAG AA (lowest 5.1:1).
- `prefers-reduced-motion: reduce` turns off the background motion, typing, tilt, reveal and dialog
  animations, and smooth scrolling.
- Vanilla JS: `site.js` ~2 KB, `landing.js` ~8 KB; no frameworks. Images are lazy-loaded with width/height.
- Mobile fixes kept: 16px inputs, 44px tap targets, safe-area insets, dvh, no horizontal overflow.

## Verified (headless Chrome, local server)
- 1280 / 768 / 390 / 360 on landing, converter, handbook and 404: no console errors, no horizontal overflow.
- All 58 local links/assets return 200; all external GitHub links return 200.
- Filters, lightbox (open, phone view, arrow keys, Esc, focus return), header shrink, scroll reveal,
  reduced-motion behaviour.
