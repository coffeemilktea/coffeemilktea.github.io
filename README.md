# Healthcare Data Tools

This repository is the landing page for **[ocha.dev](https://ocha.dev)** — a home for browser-based, fully client-side tools for DICOM and HL7 medical data standards.

The tools themselves are maintained in the **[hl7-dicom-tools](https://github.com/coffeemilktea/hl7-dicom-tools)** repository and served at [`ocha.dev/hl7-dicom-tools/`](https://ocha.dev/hl7-dicom-tools/). This repo hosts only the landing page and shared theme assets.

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

There is **no custom JavaScript** on the page beyond the existing theme toggle.
Every interaction below is an htmx attribute plus CSS.

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

## 🛠️ Available Tools, Descriptions, and Use Cases

A detailed breakdown of the tools linked from this landing page (source in [hl7-dicom-tools](https://github.com/coffeemilktea/hl7-dicom-tools)):

### 1. DICOM Viewer & Tag Morph
*   **Path:** [`hl7-dicom-tools/tools/dicom-viewer.html`](https://ocha.dev/hl7-dicom-tools/tools/dicom-viewer.html)
*   **Description:** A browser-based medical imaging viewer supporting major storage SOP classes (CT, MR, US, XA, NM, PET, Mammo, RT, and more). Features window/level adjustments, cine playback, and 2D measurements. It also enables inline and batch tag morphing, allowing you to edit metadata and export valid DICOM files.
*   **Use Cases:**
    *   Quickly viewing DICOM image series and verifying metadata/tags without a full PACS viewer.
    *   Anonymizing or editing patient, study, or series tags.
    *   Troubleshooting header issues and re-exporting corrected DICOM files.

### 2. DICOM Toolbox (Generator)
*   **Path:** [`hl7-dicom-tools/tools/dicom-generator.html`](https://ocha.dev/hl7-dicom-tools/tools/dicom-generator.html)
*   **Description:** A tool for creating, configuring, and generating valid DICOM files from scratch or based on templates.
*   **Use Cases:**
    *   Building synthetic or mock datasets for testing PACS, VNA, or other DICOM-compatible software.
    *   Learning and exploring the structure of DICOM headers, tags, and data elements.
    *   Testing application boundary conditions with custom-crafted DICOM tag values.

### 3. HL7 v2.x Parser
*   **Path:** [`hl7-dicom-tools/tools/msgparser.html`](https://ocha.dev/hl7-dicom-tools/tools/msgparser.html)
*   **Description:** A parser that decodes raw HL7 v2.x messages, providing a detailed, interactive breakdown of segments, fields, components, and subcomponents.
*   **Use Cases:**
    *   Troubleshooting clinical interface and integration engine messages.
    *   Decoding complex or nested HL7 messages to inspect patient identifiers (PID), order details (ORC/OBR), or observation values (OBX).
    *   Learning HL7 v2 segment structures and field definitions.

### 4. HL7 Diff Checker
*   **Path:** [`hl7-dicom-tools/tools/diff-checker.html`](https://ocha.dev/hl7-dicom-tools/tools/diff-checker.html)
*   **Description:** A side-by-side HL7 message comparison tool that highlights segment-level and field-level differences, additions, and deletions.
*   **Use Cases:**
    *   Comparing an inbound message with its outbound/transformed counterpart to verify mapping logic.
    *   Comparing messages from different source systems to align specifications.
    *   Troubleshooting interface integration issues by checking why one message succeeded while another failed.

### 5. Modality Worklist (MWL) Simulator
*   **Path:** [`hl7-dicom-tools/tools/mwl-simulator.html`](https://ocha.dev/hl7-dicom-tools/tools/mwl-simulator.html)
*   **Description:** A utility to simulate or query a DICOM Modality Worklist (C-FIND SCU). Test worklist integrations using a built-in mock dataset or connect to an active worklist SCP.
*   **Use Cases:**
    *   Testing DICOM C-FIND connections and query/retrieve workflows.
    *   Validating modality query filter parameters (e.g., Scheduled Procedure Step Start Date, Modality).
    *   Simulating imaging equipment (modalities) querying an RIS or PACS worklist.

### 6. DICOM ➔ HL7 Order Generator
*   **Path:** [`hl7-dicom-tools/tools/dicom-hl7-order.html`](https://ocha.dev/hl7-dicom-tools/tools/dicom-hl7-order.html)
*   **Description:** A bridging tool that extracts relevant patient and study metadata tags from an uploaded DICOM file and automatically generates a standard HL7 ORM^O01 radiology order message.
*   **Use Cases:**
    *   Bridging imaging archives (PACS) with clinical information systems (RIS/EMR).
    *   Simulating order messages using existing DICOM files for interface testing.
    *   Validating alignment between DICOM attributes and HL7 order segments.

---

## 🚀 Running Locally

To run the tools locally, clone the [hl7-dicom-tools](https://github.com/coffeemilktea/hl7-dicom-tools) repository — they are completely client-side (standard HTML, CSS, and JavaScript):

1.  **Direct Open:** Open any `tools/*.html` file directly in your browser (double-click or drag-and-drop into a browser window).
2.  **Local HTTP Server:** For features that require server context, run a local web server from the repository root:
    *   **Python 3:** `python -m http.server 8000`
    *   **Node.js:** `npx http-server -p 8000`
    *   Access the tools at `http://localhost:8000/tools/`.

To preview this landing page locally, serve this repository root the same way. It must
be served over HTTP rather than opened via `file://` — htmx fetches the fragments in
`partials/` with XHR, and the page references `/vendor/`, `/tools/`, and `/partials/`
by root-absolute path.
