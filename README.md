# Healthcare Data Tools

Landing page and reference pages for free, browser-based HL7 v2.5.1, DICOM and FHIR tools.

**Live:** [coffeemilktea.github.io](https://coffeemilktea.github.io/)

## Pages

| Page | Desktop | Mobile |
|---|---|---|
| **[Landing page](https://coffeemilktea.github.io/)**: product-style showcase of every tool, with real desktop and phone screenshots, HL7 / DICOM / FHIR filters, a screenshot lightbox with use cases, and a how-it-works and privacy section. · [`index.html`](index.html) | <img src="docs/screenshots/landing-desktop.webp" width="420" alt="Landing page, desktop"> | <img src="docs/screenshots/landing-mobile.webp" width="150" alt="Landing page, mobile"> |
| **[HL7 v2.5.1 ↔ FHIR R4 Converter](https://coffeemilktea.github.io/hl7-fhir-converter.html)**: converts HL7 v2.5.1 messages (ADT, ORM, ORU, SIU, ACK) to FHIR R4 message Bundles and back, with a field-level mapping trace, a report of anything that couldn't be mapped faithfully, and a round-trip check. · [`hl7-fhir-converter.html`](hl7-fhir-converter.html) | <img src="docs/screenshots/hl7-fhir-converter-desktop.webp" width="420" alt="Converter, desktop"> | <img src="docs/screenshots/hl7-fhir-converter-mobile.webp" width="150" alt="Converter, mobile"> |
| **[Radiology Transaction Handbook](https://coffeemilktea.github.io/radiology-handbook.html)**: a reference for PACS administrators covering the order-to-image timeline, HL7 ADT/ORM/ORU, DICOM SCU/SCP roles, DIMSE, DICOMweb, tags, ports and troubleshooting. · [`radiology-handbook.html`](radiology-handbook.html) | <img src="docs/screenshots/radiology-handbook-desktop.webp" width="420" alt="Handbook, desktop"> | <img src="docs/screenshots/radiology-handbook-mobile.webp" width="150" alt="Handbook, mobile"> |

The landing page links to these tools:
- the six tools in [hl7-dicom-tools](https://github.com/coffeemilktea/hl7-dicom-tools) (HL7 Parser, HL7 Diff Checker, DICOM → HL7 Order, DICOM Toolbox, DICOM Viewer & Tag Morph, MWL Simulator)
- the Mirth Transformer Builder ([HL7-Interface-Javascript-Builder](https://github.com/coffeemilktea/HL7-Interface-Javascript-Builder))

## Features

- No build step and no Jekyll (`.nojekyll`): files are served exactly as committed.
- No frameworks: small vanilla `assets/site.js` (sticky header, scroll reveal, phone menu) and `assets/landing.js` (filters, card tilt, lightbox, typing sample), plus the shared `tools/theme.js`.
- Animations respect `prefers-reduced-motion`: with it on, nothing moves and all content shows at once.
- Screenshots of every tool live in `assets/screenshots/` as WebP (`*-card`, `*-phone`, `*-desktop`, `*-mobile`).
- Dark Tokyo Night theme from `assets/tokyo-night.css`, byte-identical to the copy in hl7-dicom-tools, so the site and the tools look the same.
- Mobile-friendly: 16px inputs on touch screens, 44px tap targets, wide tables and code blocks scroll inside their own box, and safe-area insets are respected.

## HL7 standard: v2.5.1

The converter reads and writes HL7 **v2.5.1**: it warns when an input's MSH-12 is a different version, and it always writes `2.5.1` to MSH-12 when converting from FHIR. The handbook's examples use v2.5.1 too.

## Privacy

Everything runs client-side. The converter and the handbook make no network requests with your data: messages and Bundles are converted in your browser.

## Local development

```bash
git clone https://github.com/coffeemilktea/coffeemilktea.github.io.git
cd coffeemilktea.github.io
python3 -m http.server 8000   # open http://localhost:8000/
```

Use HTTP, not `file://`: pages reference `/assets/` and `/tools/` by root-absolute path. Links to `/hl7-dicom-tools/…` and `/HL7-Interface-Javascript-Builder/` point at sibling GitHub Pages sites, so they only resolve on the live host. See [CLAUDE.md](CLAUDE.md) for the file layout and theme rules.

## Tech

- Static HTML, CSS and vanilla JavaScript.
- `assets/tokyo-night.css`: palette and base components. `assets/tokens.css`: tokens and legacy chrome. `assets/site.css` / `assets/site.js`: the shared header, footer and scroll reveal. `assets/landing.css` / `assets/landing.js`: the landing page. `tools/theme.js`: shared helpers.
- Published with GitHub Pages from `master`.
