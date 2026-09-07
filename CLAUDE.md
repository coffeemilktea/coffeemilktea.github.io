# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this site is

The landing page and reference pages for **coffeemilktea.github.io** — browser-based, fully
client-side tools for DICOM and HL7 medical data standards. GitHub Pages serves plain files
straight from `master`; `.nojekyll` turns Jekyll processing off entirely, so **there is no build
step, no framework, and no CDN**. Nothing on any page loads from a third-party origin.

Six of the seven tools live in the sibling repo
[hl7-dicom-tools](https://github.com/coffeemilktea/hl7-dicom-tools) and are served under
`/hl7-dicom-tools/`. The seventh — the Mirth Transformer Builder — lives here in `tools/`.

## Local development

Serve the repository root over HTTP:

```bash
python3 -m http.server 8000
```

It must be **HTTP, not `file://`**: htmx fetches the fragments in `partials/` with XHR, and pages
reference `/tools/`, `/vendor/` and `/partials/` by root-absolute path. Both break on `file://`.

`python3 -m http.server` sends no cache headers, so a browser will happily serve a stale
`partials/*.html`. If a fragment edit doesn't show up, hard-reload or restart on another port.

## Layout

```
index.html                    shell, hero, the seven tool cards, about, footer
404.html                      error page; pulls its tool list from a shared fragment at load
partials/tool-links.html      the seven tool links, shared with 404.html
partials/detail/*.html        one per tool — "Use cases" panel, each shipping its own Hide control
partials/empty.html           zero-byte fragment; swapping it in collapses a panel
radiology-handbook.html       standalone: radiology IT workflow handbook
hl7-fhir-converter.html       standalone: HL7 v2.5.1 <-> FHIR R4 converter
mcp/index.html                standalone: HL7 v2.5.1 reference MCP server setup guide
mcp/fhir/index.html           standalone: HL7 v2.5.1 -> FHIR R4 mapping MCP server setup guide
mcp/*/server.js               those servers' sources, served for download
tools/mirth-transformer.html  standalone app: HL7 v2.5.1 -> Mirth transformer builder (a tool card)
tools/theme.css               the shared palette and chrome — single source of truth
tools/theme.js                the shared dark/light controller
vendor/htmx.min.js            htmx 2.0.7, vendored
```

## Theme — one token set, every page

**`tools/theme.css` is the only place a colour is defined.** Every page links it and derives
everything from its tokens; no page carries its own palette. Pair it with `tools/theme.js`, which
sets `data-theme` on `<html>`, defaults to dark, exposes `window.toggleTheme()`, and wires a
`#btn-theme` button. The choice persists under the localStorage key `hl7-tools-theme`, shared with
the tools repo so a visitor's preference follows them between the two.

Dark is **brown sugar boba**, light is **milk tea**:

| Token | Dark | Light | |
|---|---|---|---|
| `--bg` | `#1e1815` | `#f3e7d6` | steeped pearl / milk tea |
| `--surface` | `#161110` | `#fdf8f0` | dark cup / milk foam |
| `--surface2` | `#2e2521` | `#e5d5bf` | wet tapioca / oat milk |
| `--accent` | `#c9a0ea` | `#67399c` | taro |
| `--accent2` | `#f2a0bd` | `#a83464` | strawberry milk |
| `--cyan` | `#8ed4c4` | `#2f6f66` | jasmine green |
| `--green` | `#a9c96a` | `#4d6b1c` | matcha |
| `--yellow` | `#f0cf8a` | `#7a5a0e` | brown sugar |
| `--red` | `#f0736f` | `#b03530` | lychee |
| `--orange` | `#eb8a3c` | `#9c4d13` | thai tea |
| `--text` / `--body` / `--muted` | `#f7efe4` / `#e2d6c6` / `#a99584` | `#2b211a` / `#493c2f` / `#5f5244` | three levels of foreground |

Two rules hold it together:

- **Everything derives from a token.** The `-bg` / `-line` tints (`--accent-bg`, `--green-line`, …)
  are `color-mix()` over the accents, so they re-derive themselves when the mode flips — the light
  block only restates the accents, never the tints. Same for `--border-soft` and `--wash`.
- **Contrast is checked, not eyeballed.** Every foreground clears WCAG AA (4.5:1) against `--bg`,
  `--surface` **and both glass fills** in both modes. The worst pair is 4.80:1. Re-check all four
  surfaces if you touch a token — a colour can pass on the page background and still fail on a
  frosted card.

`theme.css` also carries the shared chrome the standalone pages use — `.site-topbar` (brand,
breadcrumb, `.btn-theme`), `.site-foot`, `.skip-link` and `::selection`. A page's own `<style>`
comes after the link, so it can override any of it.

Motifs are CSS masks so they inherit `currentColor` and need no second asset: `--pearl-glyph`
(three tapioca pearls, the section-kicker bullet) and `--pearl-band` (pearls along the footer edge).

## The landing page is hypermedia

Beyond `theme.js` and a one-line `no-js` class remover, `index.html` carries **no custom
JavaScript**. Every interaction is an htmx attribute plus CSS.

- **The page filters itself.** The category tabs re-fetch *this page* and `hx-select` the subset
  they want (`hx-get="/" hx-select=".tool-card[data-cat~='hl7']"`). `hx-select` returns every
  match, so the cards in `index.html` stay the single source of truth — no card is written twice
  and there are no category partials to keep in sync. The tabs are real radio inputs, so `:checked`
  drives the active styling in pure CSS.
- **The "N shown" readout is a CSS counter** over `.tool-card`, which is why it sits *after* the
  grid in the markup: a counter only sees elements preceding it in document order.
- **Panels open and close over the wire.** Each card's "Use cases" button `hx-get`s its fragment;
  the fragment ships its own "Hide details" control, which `hx-get`s the zero-byte
  `partials/empty.html` back into the same target.
- **What it deliberately doesn't do:** the tool cards stay in `index.html` rather than being
  fragment-loaded, so crawlers and no-JS visitors get the complete list. `hx-boost` is scoped to the
  two brand links only. `hx-push-url` is not used on the filters — GitHub Pages can't serve a
  filtered state on refresh. `/partials/` is disallowed in `robots.txt`.

## Editing

**Changing a tool's copy?** Edit the card in `index.html` and its `partials/detail/*.html` fragment.

**Adding a tool?** Four places, or the page will lie about itself:

1. a `.tool-card` in `index.html`, with `data-cat` and a `--tint`
2. the `filter-count` numbers on the affected category tabs
3. `partials/tool-links.html` (feeds `404.html`) **and** the footer "Tools" column in `index.html`
4. `sitemap.xml`

Card tints must stay visually distinct — the seven cards currently use `--accent`, `--orange`,
`--green`, `--accent2`, `--yellow`, `--red` and `--cyan`, one each. Don't reuse one.

**Retheming?** Edit `tools/theme.css` only, then re-check contrast against all four surfaces in
both modes.

> Note: the tool pages in `hl7-dicom-tools` carry their own copy of the theme and are **not** yet
> on this palette, so they won't match until they're updated there.

## Privacy

**Client-side only — no data leaves the browser.** No backend, no cookies, no analytics, and no
third-party requests of any kind. Keep it that way: don't add a webfont, an analytics snippet, or a
CDN-hosted library. Vendor it into `vendor/` instead.
