# Healthcare Data Tools

The landing page for **[coffeemilktea.github.io](https://coffeemilktea.github.io/)** — a home for
browser-based, fully client-side tools for DICOM and HL7 medical data standards.

The six tools themselves live in **[hl7-dicom-tools](https://github.com/coffeemilktea/hl7-dicom-tools)**
and are served under [`/hl7-dicom-tools/`](https://coffeemilktea.github.io/hl7-dicom-tools/).
This repo holds the landing page, two standalone reference pages, and the shared theme controller.

No build step, no framework, no CDN. GitHub Pages serves plain files straight from `master`;
`.nojekyll` turns Jekyll processing off entirely.

---

## What's in here

```
index.html                    shell, hero, the six tool cards, about, footer
404.html                      error page; pulls its tool list from a shared fragment at load
partials/
  tool-links.html             the six tool links, shared with 404.html
  detail/*.html               one per tool — "Use cases" panel, each shipping its own Hide control
  empty.html                  zero-byte fragment; swapping it in collapses a panel
radiology-handbook.html       standalone: radiology IT workflow handbook
hl7-fhir-converter.html       standalone: HL7 v2.5.1 <-> FHIR R4 converter
mcp/index.html                standalone: HL7 v2.5.1 reference MCP server setup guide
mcp/server.js                 that server's source, served for download
mcp/fhir/index.html           standalone: HL7 v2.5.1 -> FHIR R4 mapping MCP server setup guide
mcp/fhir/server.js            that server's source, served for download
tools/theme.js                shared dark/light controller
vendor/htmx.min.js            htmx 2.0.7, vendored
favicon.svg                   boba cup
robots.txt sitemap.xml        /partials/ is disallowed; sitemap covers both repos' pages
.nojekyll                     serve files as-is
CLAUDE.md                     notes for Claude Code
```

The four standalone pages are self-contained — no htmx, their own styles. They're in `sitemap.xml`
and linked from the footer's **Reference** column, but deliberately are *not* tool cards: the six
cards drive the filter counts and category tabs, so a seventh would have to be categorised and
counted.

`hl7-fhir-converter.html` converts both ways between v2.5.1 messages (ADT, ORM, ORU, SIU, ACK) and
FHIR R4 message Bundles, reporting a field-level mapping trace, everything the mapping does **not**
carry over, and a round-trip diff. Its segment field names, code tables and message structures are
generated from the same reference data as `mcp/server.js` — change the definitions there and the
`HL7_SPEC`, `HL7_TABLES` and `HL7_STRUCTURES` blocks in the converter have to be regenerated to
match.

The two MCP servers are companions, not versions of each other. The reference server answers *what
does this segment mean*; the FHIR server answers *what does it become in R4*, and converts whole
ORM, ADT and ORU messages into a transaction Bundle. They listen on 3000 and 3001, so both can run
at once.

---

## The landing page is hypermedia

Beyond the theme toggle and a one-line `no-js` class remover in `<head>`, the landing page carries
**no custom JavaScript**. Every interaction below is an htmx attribute plus CSS.

### The page filters itself

The category tabs don't fetch pre-built per-category fragments. They re-fetch **this page** and
`hx-select` the subset they want:

```html
<input type="radio" name="view" id="view-hl7"
       hx-get="/" hx-select=".tool-card[data-cat~='hl7']">
<label for="view-hl7">HL7 v2.x <span class="filter-count">3</span></label>
```

`hx-select` returns every match, not just the first, so the cards in `index.html` stay the single
source of truth — **no card is ever written twice**, and there are no category partials to keep in
sync. Shared inherited config (`hx-target`, `hx-swap`, `hx-trigger`, `hx-indicator`, `hx-sync`) lives
once on the enclosing `<fieldset>`; `hx-sync="this:replace"` cancels an in-flight request when you
click another tab.

The tabs are real radio inputs, so `:checked` drives the active styling in pure CSS and the group
stays keyboard-navigable. The live "N shown" readout is a CSS counter over `.tool-card` — which is
why it sits *after* the grid in the markup, since a counter only sees elements preceding it in
document order.

### Panels open and close over the wire

Each card's **Use cases** button `hx-get`s its fragment; the fragment ships its own **Hide details**
control, which `hx-get`s the zero-byte `partials/empty.html` back into the same target. Both
directions are plain hypermedia exchanges. `:has(.tool-detail > *)` hides the trigger once a panel is
in, and `.htmx-request` drives the spinner. This keeps working on cards htmx swapped in via a filter,
since htmx processes swapped content.

### What it deliberately doesn't do

The **tool cards stay in `index.html`** rather than being fragment-loaded. Crawlers and no-JS
visitors get the complete tool list, descriptions, and links in the initial response; htmx only ever
*adds* content — the detail panels, and nothing else. Nothing crawlable is deferred.

`hx-boost` is scoped to the two brand links — the only same-origin, same-shell navigations on the
page. It is **not** global: the tool links go to the other repo's apps, which ship their own
`<head>`, styles, and scripts, and boosting those would swap bodies across documents that don't
share a shell.

`hx-push-url` is **not** used on the filters. GitHub Pages can't serve a filtered state on refresh,
so a pushed URL would 404 or lie about what the page shows.

`/partials/` is disallowed in `robots.txt` so fragments aren't indexed as thin standalone pages.

---

## Theme

Dark is **brown sugar boba**, light is **milk tea**. Accents come off a boba shop's flavour wall:

| Token | Dark | Light | |
|---|---|---|---|
| `--bg` | `#1e1815` | `#f3e7d6` | steeped pearl / milk tea |
| `--surface` | `#161110` | `#fdf8f0` | dark cup / milk foam |
| `--accent` | `#c9a0ea` | `#67399c` | taro |
| `--accent2` | `#f2a0bd` | `#a83464` | strawberry milk |
| `--green` | `#a9c96a` | `#4d6b1c` | matcha |
| `--yellow` | `#f0cf8a` | `#7a5a0e` | brown sugar |
| `--red` | `#f0736f` | `#b03530` | lychee |
| `--orange` | `#eb8a3c` | `#9c4d13` | thai tea |
| `--text` | `#f7efe4` | `#2b211a` | milk foam |

**Taro leads for a reason.** The six tool cards each set `--tint` to one of these, and a milk-tea tan
accent landed within a few degrees of hue of the thai-tea orange — two cards would have looked
identical. Taro sits ~200° away. If you retheme, keep the six tint hues separated by at least ~12°.

Two rules hold the palette together:

- **Everything is a token.** Both token blocks live at the top of `index.html`'s `<style>`, and every
  `color-mix()` and per-card `--tint` derives from them. Change a token and the whole page follows.
  `404.html` carries a trimmed copy of the same tokens — keep the two in step.
- **Contrast is checked, not eyeballed.** Every foreground clears WCAG AA against `--bg`, `--surface`,
  **and both glass fills** (`--glass`, `--glass-strong`) in both modes. Worst pair is currently
  4.94:1. The glass fills matter: a colour can pass on the page background and still fail on a
  frosted card.

Motifs are CSS masks so they inherit `currentColor` and work in both modes without a second asset:
`--pearl-glyph` (three tapioca pearls, the section-kicker bullet) and `--pearl-band` (pearls settling
along the footer edge). The brand mark and favicon are a boba cup.

`tools/theme.js` sets `data-theme` on `<html>`, defaults to dark, exposes `window.toggleTheme()`, and
persists to the localStorage key **`hl7-tools-theme`**. That key is shared with the tools repo, so a
visitor's choice follows them between the landing page and the tools. Any page wanting the toggle
needs a `#btn-theme` button — the controller wires it automatically.

> Note: the tool pages in `hl7-dicom-tools` carry their own copy of the theme and are **not** yet on
> this palette, so they won't match the landing page until they're updated there.

---

## Editing

**Changing a tool's copy?** Edit the card in `index.html` and its `partials/detail/*.html` fragment.
Descriptions are deliberately not duplicated in this README — the cards and fragments are what the
site actually serves.

**Adding a tool?** Four places, or the page will lie about itself:

1. a `.tool-card` in `index.html`, with `data-cat` and a `--tint`
2. the `filter-count` numbers on the affected category tabs
3. `partials/tool-links.html` (feeds the footer and `404.html`)
4. `sitemap.xml`

**Retheming?** Edit the two token blocks in `index.html`, mirror them in `404.html`, and re-check
contrast against all four surfaces in both modes.

---

## Privacy

**Client-side only — no data leaves your browser.** All parsing, rendering, and modification happen
locally in the browser. No files, HL7 messages, or DICOM images are uploaded anywhere. That makes
these tools safe for inspecting data that may contain PHI. The site sets no cookies and runs no
analytics.

---

## Running locally

Serve the repository root over HTTP:

```bash
python3 -m http.server 8000
```

It must be **HTTP, not `file://`** — htmx fetches the fragments in `partials/` with XHR, and the page
references `/vendor/`, `/tools/`, and `/partials/` by root-absolute path. Both break on a `file://`
origin.

One gotcha when editing fragments: `python3 -m http.server` sends no cache headers, so a browser will
happily serve you a stale `partials/*.html` while the page itself reloads fresh. If a fragment edit
doesn't show up, hard-reload or restart on a different port.

The tools themselves run from their own repository — see
[hl7-dicom-tools](https://github.com/coffeemilktea/hl7-dicom-tools).
