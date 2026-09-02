# Healthcare Data Tools

This repository is the landing page for **[coffeemilktea.github.io](https://coffeemilktea.github.io/)** — a home for browser-based, fully client-side tools for DICOM and HL7 medical data standards.

The tools themselves are maintained in the **[hl7-dicom-tools](https://github.com/coffeemilktea/hl7-dicom-tools)** repository and served at [`/hl7-dicom-tools/`](https://coffeemilktea.github.io/hl7-dicom-tools/). This repo hosts the landing page, two standalone reference pages, and shared theme assets.

---

## 🧩 How the page is built

The landing page is a static hypermedia page driven by **[htmx](https://htmx.org/) 2.0.7**, vendored at `vendor/htmx.min.js` — no CDN, no build step, no framework. GitHub Pages serves plain files; htmx fetches HTML fragments over the wire and swaps them into the DOM.

```
index.html                    shell + hero + the six tool cards + about + footer
404.html                      error page; pulls its tool list from a shared fragment
partials/
  tool-links.html             the six tool links, shared by 404.html
  detail/*.html               one per tool — "Use cases" panel + its own Hide control
  sections/quickref.html      "Which tool do I need?" — fetched on first view
  empty.html                  zero-byte fragment; swapping it in collapses a panel
vendor/htmx.min.js            htmx 2.0.7
tools/theme.js                shared dark/light controller (unchanged)
```

Three standalone pages sit outside that shell — self-contained, no htmx, their own
styles. They are listed in `sitemap.xml` and linked from the **Reference** column
of the landing-page footer, but they are deliberately *not* tool cards: the six
cards drive the filter counts and the category tabs, so a seventh would have to be
categorised and counted.

```
radiology-handbook.html       radiology IT workflow handbook
mcp/index.html                HL7 v2.5.1 reference MCP server — setup guide
mcp/server.js                 that server's source, served for download
mcp/fhir/index.html           HL7 v2.5.1 → FHIR R4 mapping MCP server — setup guide
mcp/fhir/server.js            that server's source, served for download
```

The two MCP servers are companions rather than versions of each other. The
reference server answers *what does this segment mean*; the FHIR server answers
*what does it become in R4*, and converts whole ORM, ADT and ORU messages into a
transaction Bundle. They listen on 3000 and 3001 so both can run at once.

Beyond the theme toggle and a one-line `no-js` class remover in `<head>`, the
landing page carries **no custom JavaScript**. Every interaction below is an htmx
attribute plus CSS.

### The page filters itself

The category tabs don't fetch pre-built per-category fragments. They re-fetch
**this page** and `hx-select` the subset they want:

```html
<input type="radio" name="view" id="view-hl7"
       hx-get="/" hx-select=".tool-card[data-cat~='hl7']">
<label for="view-hl7">HL7 v2.x <span class="filter-count">3</span></label>
```

`hx-select` returns every match, not just the first, so the cards in `index.html`
stay the single source of truth — **no card is ever written twice**, and there are
no category partials to keep in sync. Shared inherited config (`hx-target`,
`hx-swap`, `hx-trigger`, `hx-indicator`, `hx-sync`) lives once on the enclosing
`<fieldset>`; `hx-sync="this:replace"` cancels an in-flight request when you click
another tab.

The tabs are real radio inputs, so `:checked` drives the active styling in pure CSS
and the group stays keyboard-navigable. The live "N shown" readout is a CSS counter
over `.tool-card` — which is why it sits *after* the grid in the markup, since a
counter only sees elements that precede it in document order.

### Panels open and close over the wire

Each card's **Use cases** button `hx-get`s its fragment; the fragment ships its own
**Hide details** control, which `hx-get`s the zero-byte `partials/empty.html` back
into the same target. Both directions are plain hypermedia exchanges.
`:has(.tool-detail > *)` hides the trigger once a panel is in, and `.htmx-request`
drives the spinner. This keeps working on cards htmx swapped in via a filter, since
htmx processes swapped content.

### Deferred below the fold

The quick-reference section is fetched the first time it comes into view with
`hx-trigger="intersect once"`, behind a shimmer skeleton. It is **`intersect`, not
`revealed`**, on purpose: `revealed` is driven by scroll events, so on a tall
display where the section is already on screen it would never load for a visitor
who never scrolls. IntersectionObserver has no such blind spot.

### What it deliberately doesn't do

The **tool cards themselves stay in `index.html`** rather than being fragment-loaded.
Crawlers and no-JS visitors get the complete tool list, descriptions, and links in
the initial response; htmx only ever *adds* content. Only the quick-reference
section is deferred, and it exists nowhere in the initial payload, so nothing
crawlable is lost.

`hx-boost` is scoped to the two brand links, which are the only same-origin,
same-shell navigations on the page. It is **not** applied globally: the tool links
go to the other repo's apps, which ship their own `<head>`, styles, and scripts, and
boosting those would swap bodies across documents that don't share a shell.

`hx-push-url` is **not** used on the filters. GitHub Pages can't serve a filtered
state on refresh, so a pushed URL would 404 or lie about what the page shows.

`/partials/` is disallowed in `robots.txt` so the fragments aren't indexed as thin
standalone pages.

---

## 🔒 Privacy & Security

**Client-side only — no data leaves your browser.**  
All parsing, rendering, and modification are performed locally within your browser using JavaScript. No files, HL7 messages, or DICOM images are uploaded to any server. This makes these tools safe for inspecting data that may contain Protected Health Information (PHI).

---

## 🛠️ The tools

The six tools linked from the landing page live in
[hl7-dicom-tools](https://github.com/coffeemilktea/hl7-dicom-tools) and are served
under [`/hl7-dicom-tools/`](https://coffeemilktea.github.io/hl7-dicom-tools/):
DICOM Viewer & Tag Morph, DICOM Toolbox (generator), HL7 v2.x Parser, HL7 Diff
Checker, Modality Worklist Simulator, and DICOM ➔ HL7 Order Generator.

Descriptions and use cases are **not** duplicated here — they live in the cards in
`index.html` and the `partials/detail/*.html` fragments, which are what the site
actually serves. Edit those; this README only documents how the page is wired.

---

## 🚀 Running Locally

Serve this repository root over HTTP:

```bash
python3 -m http.server 8000
```

It must be **HTTP, not `file://`** — htmx fetches the fragments in `partials/` with
XHR, and the page references `/vendor/`, `/tools/`, and `/partials/` by
root-absolute path. Both would break on a `file://` origin.

The tools themselves run from their own repository; see
[hl7-dicom-tools](https://github.com/coffeemilktea/hl7-dicom-tools) for those.
