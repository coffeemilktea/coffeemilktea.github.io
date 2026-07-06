# Healthcare Data Tools

This repository is the landing page for **[ocha.dev](https://ocha.dev)** — a home for browser-based, fully client-side tools for DICOM and HL7 medical data standards.

The tools themselves are maintained in the **[hl7-dicom-tools](https://github.com/coffeemilktea/hl7-dicom-tools)** repository and served at [`ocha.dev/hl7-dicom-tools/`](https://ocha.dev/hl7-dicom-tools/). This repo hosts only the landing page and shared theme assets.

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

To preview this landing page locally, serve this repository root the same way.
