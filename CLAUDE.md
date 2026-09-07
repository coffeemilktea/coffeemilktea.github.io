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

It must be HTTP, not `file://` — htmx fetches the fragments in `partials/` with XHR, and every page
references `/assets/`, `/tools/`, `/vendor/` and `/partials/` by root-absolute path.

## Layout

```
index.html                    landing page: hero, seven tool cards, about, footer (htmx)
404.html                      error page; pulls the tool list from a shared fragment
assets/tokens.css             THE palette — dark + light tokens and shared chrome
tools/theme.js                theme controller: sets data-theme, wires #btn-theme
tools/mirth-transformer.html  tool: HL7 v2.5.1 -> Mirth Connect transformer builder
hl7-fhir-converter.html       reference: HL7 v2.5.1 <-> FHIR R4 converter
radiology-handbook.html       reference: radiology IT workflow handbook
mcp/index.html + server.js    reference: HL7 v2.5.1 MCP server, docs + source
mcp/fhir/index.html + server.js  reference: HL7 v2.5.1 -> FHIR R4 MCP server
partials/tool-links.html      the seven tool links (used by 404.html)
partials/detail/*.html        one "Use cases" panel per tool card
partials/empty.html           zero-byte fragment; swapping it in collapses a panel
vendor/htmx.min.js            htmx 2.0.7, vendored — no CDN
favicon.svg robots.txt sitemap.xml .nojekyll
```

Six of the seven tool cards link to `/hl7-dicom-tools/…`, which is a **separate repository**
(`coffeemilktea/hl7-dicom-tools`) deployed as a project site on the same host. Those files are not in
this repo; only the Mirth Transformer Builder lives here.

## The styling contract

Every page — landing, error, tool and reference alike — loads the same two files:

```html
<link rel="stylesheet" href="/assets/tokens.css">
<script src="/tools/theme.js"></script>
```

`assets/tokens.css` is the single source of truth for the palette. It defines the dark tokens on
`:root`, the light overrides on `[data-theme="light"]`, and the shared chrome: the focus ring,
`::selection`, the `.site-bar` breadcrumb, the `.btn-theme` toggle and the `.site-foot` strip.

**A page must not declare its own palette.** Page-level `<style>` blocks carry layout only, and read
colour exclusively through the shared tokens. There is a check for this — see below.

Pages use one vocabulary, so a rule reads the same everywhere:

| Token | Role |
|---|---|
| `--bg` `--surface` `--surface2` `--sink` | page, panel, raised panel, inset well |
| `--border` `--border-soft` | rules and dividers |
| `--text` `--body` `--muted` | headings, running text, labels |
| `--accent` `--accent2` | taro (primary), strawberry |
| `--cyan` `--green` `--yellow` `--red` `--orange` | jasmine, matcha, brown sugar, lychee, thai tea |
| `--*-bg` `--*-line` | derived washes and hairlines for the accents |
| `--on-accent` | text on a solid accent fill |
| `--glass*` | frosted fills, used on the landing page |
| `--font-sans` `--font-mono` `--radius` `--radius-sm` `--shadow` | shape and type |

Semantic convention across the reference pages: **HL7 v2 is `--yellow`, DICOM is `--cyan`, FHIR is
`--green`**, errors are `--red`, and UI accent/links are `--accent`.

Two rules hold the palette together:

- **No literal colours.** No hex, `rgb()` or `rgba()` in a page stylesheet, with three deliberate
  exceptions: black shadow/scrim alphas, the handbook's greyscale densitometry wedge, and the
  handbook's `@media print` block (print is always ink on white).
- **Contrast is checked, not eyeballed.** Every foreground clears WCAG AA against `--bg`, `--surface`
  and both glass fills, in both modes. A colour can pass on the page background and still fail on a
  frosted card.

Every page also carries a `#btn-theme` button; `tools/theme.js` finds it and wires it up. The choice
persists to the localStorage key `hl7-tools-theme`, which is shared with the `hl7-dicom-tools` repo so
a visitor's theme follows them into the tools.

> The tool pages in `hl7-dicom-tools` still carry their own palette and are **not** yet on these
> tokens, so they will not match until that repo is updated.

## Checking your work

```bash
python3 -m http.server 8000     # then load every page in both themes
```

Before committing a styling change, confirm that no page has regressed on the contract:

- no page declares a `:root` palette block of its own
- no `var(--x)` resolves to a token `assets/tokens.css` doesn't define
- every page links `assets/tokens.css`, loads `tools/theme.js`, and has a `#btn-theme`

Check both themes, not just dark — a `rgba()` tint keyed to a dark background disappears on a light
one, which is exactly the class of bug the tokens exist to prevent.

## Adding a tool

Four places, or the page will lie about itself:

1. a `.tool-card` in `index.html`, with `data-cat` and a `--tint`
2. the `filter-count` numbers on the affected category tabs, and the "N tools" heading
3. `partials/tool-links.html` and the footer's **Tools** column in `index.html`
4. `sitemap.xml`

A new tool page starts by linking `/assets/tokens.css` and `/tools/theme.js`, adding a `#btn-theme`
button and a `.site-bar` breadcrumb, and then writing layout CSS that only ever reads the tokens
above.

## Adding a reference page

Same styling contract, but reference pages are deliberately **not** tool cards — the cards drive the
filter counts and category tabs, so anything added there has to be categorised and counted. Link a
reference page from the footer's **Reference** column and add it to `sitemap.xml`.
