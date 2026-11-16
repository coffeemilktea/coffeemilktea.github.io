# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this site is

A GitHub Pages site at `coffeemilktea.github.io` hosting browser-based healthcare IT tools and
reference pages for the DICOM and HL7 medical data standards. Everything is pure client-side — no
backend, no build step, no data leaves the browser. GitHub Pages deploys on every push to `master`.

There is **no Jekyll**: `.nojekyll` turns processing off and the files are served exactly as they sit
in the repo. There is nothing to build and nothing to install — open a page and it runs.

## Local development

Serve the repository root over HTTP:

```bash
python3 -m http.server 8000
```

It must be HTTP, not `file://` — every page references `/assets/` and `/tools/` by root-absolute path.

## Layout

```
index.html                    landing page: hero, tool showcase (9 cards), how it works, repos, footer, lightbox
404.html                      error page with the shared header/footer and a static tool list
assets/tokyo-night.css        dark Tokyo Night palette + base components (byte-identical to hl7-dicom-tools)
assets/tokens.css             imports tokyo-night.css; tokens, the LIGHT palette, legacy app-header chrome
assets/site.css, site.js      shared header (.sx-header), footer (.sx-footer), buttons, scroll reveal
assets/landing.css, landing.js landing-only layout and interactions (filters, tilt, lightbox, typing)
assets/converter.css, .js     the converter's layout and code (moved out of the page for the CSP)
assets/handbook.css, .js      the handbook's layout, field tooltips and contents/tag filter
assets/404.css                the 404 page's layout
assets/screenshots/           <slug>-card / -phone / -desktop / -mobile .webp for every card
assets/og.jpg, icon-*.png     social image and PWA icons; favicon.ico + favicon.svg + apple-touch-icon.png at the root
tools/theme.js                light/dark choice (runs in <head>, before paint) + shared toast / keyboard helpers
hl7-fhir-converter.html       reference: HL7 v2.5.1 <-> FHIR R4 converter
radiology-handbook.html       reference: radiology IT workflow handbook
site.webmanifest robots.txt sitemap.xml .nojekyll
```

No tool page lives in this repo any more — every one of the seven cards links out to a project site
on the same host. Six go to `/hl7-dicom-tools/…` (`coffeemilktea/hl7-dicom-tools`) and the Mirth
Transformer Builder goes to `/HL7-Interface-Javascript-Builder/`
(`coffeemilktea/HL7-Interface-Javascript-Builder`). It used to be duplicated — a copy here and a copy
there, drifting apart — so the newer copy was pushed to that repo and the one here deleted.

Those repos carry their own styling. The Mirth builder has the palette **inlined** rather than
linking `/assets/tokens.css`, because its README promises a single-file, zero-dependency page that
runs anywhere; re-inline it from `assets/tokens.css` if the palette changes. The two MCP servers also
live in their own repos now (`hl7-v2-mcp-server`, `hl7-v2-fhir-mcp-server`) and are linked from the
footer's Reference column.

## The styling contract

Every page — landing, error, tool and reference alike — starts its `<head>` with the same security
metas and loads the same shared files:

```html
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; manifest-src 'self'; base-uri 'none'; form-action 'none'; object-src 'none'; upgrade-insecure-requests">
<meta name="referrer" content="strict-origin-when-cross-origin">
…
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#e1e2e7">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#1a1b26">
<meta name="color-scheme" content="light dark">
<link rel="preload" href="/assets/tokyo-night.css" as="style">
<link rel="stylesheet" href="/assets/tokens.css">
<link rel="stylesheet" href="/assets/site.css">
<script src="/tools/theme.js"></script>
<script src="/assets/site.js" defer></script>
<link rel="stylesheet" href="/assets/<page>.css">
```

**No inline code.** The CSP has no `'unsafe-inline'`, so a page has no `<script>` or `<style>` blocks,
no `on*=` handlers and no `style=""` attributes (in markup *or* in HTML strings built by JS — use a
class; setting `el.style.x` from JS is fine). Page CSS and JS live in `assets/<page>.css|.js`. Landing
reveal delays and card tints are `data-d="1..4"` / `data-tint="<token>"`, not inline custom properties.
The CSP is a meta tag because GitHub Pages can't send headers; it can't do `frame-ancestors` or
reporting. Keep it identical on every page and first in `<head>`. Everything that reaches `innerHTML`
must go through an escaper that handles `& < > " '`.

The header (`<header class="sx-header">`, including the `.sx-theme` toggle and the phone menu's
`.sx-menu-gh` GitHub link) and footer (`<footer class="sx-footer">`) markup is repeated verbatim in all
four pages — there is no include step. Change one, change all four.

`assets/tokens.css` imports `assets/tokyo-night.css` (the dark Tokyo Night palette; byte-identical
copy in hl7-dicom-tools `tools/tokyo-night.css`, so never edit it here), and adds the light palette and
the shared chrome: the `.site-bar` breadcrumb and the `.site-foot` strip.

**Light and dark.** Dark is the default. `tools/theme.js` (a plain script in `<head>`, so no flash)
sets `<html data-theme="light|dark">` from the choice saved in `localStorage["hl7-tools-theme"]` —
the same key and values the Mirth Transformer Builder uses on this origin — or else from
`prefers-color-scheme`. The light palette is in `tokens.css` twice with identical bodies:
`:root[data-theme="light"]` and, for no-JS visitors, `@media (prefers-color-scheme: light)
:root:not([data-theme])`. Change one, change both. Shadows use
`rgb(var(--shade) / calc(<alpha> * var(--shade-k)))` (black in dark, soft ink in light) and the hero
glows scale by `--glow-k`.

**A page must not declare its own palette.** Page stylesheets (`assets/<page>.css`) carry layout only,
and read colour exclusively through the shared tokens. There is a check for this — see below.

Pages use one vocabulary, so a rule reads the same everywhere:

| Token | Role |
|---|---|
| `--bg` `--surface` `--surface2` `--sink` | page, panel, raised panel, inset well |
| `--border` `--border-soft` | rules and dividers |
| `--text` `--body` `--muted` | headings, running text, labels |
| `--accent` `--accent2` | blue (primary), purple |
| `--cyan` `--green` `--yellow` `--red` `--orange` | cyan, green, yellow, red, orange |
| `--*-bg` `--*-line` | derived washes and hairlines for the accents |
| `--on-accent` | text on a solid accent fill |
| `--glass*` | frosted fills, used on the landing page |
| `--font-sans` `--font-mono` `--radius` `--radius-sm` `--shadow` | shape and type |

Semantic convention across the reference pages: **HL7 v2 is `--yellow`, DICOM is `--cyan`, FHIR is
`--green`**, errors are `--red`, and UI accent/links are `--accent`.

Two rules hold the palette together:

- **No literal colours.** No hex, `rgb()` or `rgba()` in a page stylesheet, with three deliberate
  exceptions: the dialog backdrop scrim (shadows use the `--shade` tokens), the handbook's greyscale
  densitometry wedge, and the handbook's `@media print` block (print is always ink on white).
- **Contrast is checked, not eyeballed.** Every foreground clears WCAG AA against `--bg`, `--surface`
  and both glass fills, in both modes. A colour can pass on the page background and still fail on a
  frosted card.

Light values are Tokyo Night Day hues darkened until each clears 4.5:1 on every surface, both glass
fills and its own wash (lowest pair 4.60:1). Animations must switch off under
`prefers-reduced-motion: reduce`.

> The tool pages in `hl7-dicom-tools` still carry their own palette and are **not** yet on these
> tokens, so they will not match until that repo is updated.

## Checking your work

```bash
python3 -m http.server 8000     # then load every page in both themes
```

Before committing a styling change, confirm that no page has regressed on the contract:

- no page declares a `:root` palette block of its own
- no `var(--x)` resolves to a token `assets/tokens.css` doesn't define
- every page links `assets/tokens.css` and `assets/site.css`, and loads `tools/theme.js` and `assets/site.js`
- every page carries the same CSP and referrer metas, and has no inline `<script>`, `<style>`, `style=""`
  or `on*=` (open the console: a CSP violation is logged as an error)
- the two light blocks in `tokens.css` are still identical

Check both themes, not just dark — a `rgba()` tint keyed to a dark background disappears on a light
one, which is exactly the class of bug the tokens exist to prevent.

## Adding a tool

Five places, or the page will lie about itself:

1. a `<li class="card">` in `index.html`'s `#cards` list, with `data-cat` (any of `hl7 dicom fhir`),
   `data-slug`, a `--tint`, tags, Open/Source links and a `<template class="card-uses">` list
   (filter counts are computed by `landing.js`, but the "N tools" heading and hero facts are text)
2. four screenshots in `assets/screenshots/`: `<slug>-card.webp` 640×400, `<slug>-phone.webp` 200×433,
   `<slug>-desktop.webp` 1280×800 and `<slug>-mobile.webp` 780×1688 (390×844 @2x), sample data loaded
3. the footer's **Tools** column in all four pages
4. the tool list in `404.html`
5. `sitemap.xml`

## Adding a reference page

Same styling contract, but reference pages are deliberately **not** tool cards — the cards drive the
filter counts and category tabs, so anything added there has to be categorised and counted. Link a
reference page from the footer's **Reference** column and add it to `sitemap.xml`.
