# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this site is

A GitHub Pages site hosting browser-based healthcare IT tools for DICOM and HL7 medical data standards. All tools are pure client-side — no backend, no build step, no data leaves the browser. The site is deployed automatically by GitHub Pages on every push to `main`.

## Local development

The landing page (`index.md`) is rendered by Jekyll. To preview it locally:

```bash
bundle install
bundle exec jekyll serve
```

The tool pages (`tools/*.html`) are standalone HTML files with no dependencies — open them directly in a browser without running Jekyll.

## Architecture

### Two distinct layers

**Landing page** (`index.md` + `_layouts/default.html` + `assets/css/custom.css`): A Jekyll site with a single layout. The landing page is Markdown with embedded HTML for the tool card grid.

**Tool pages** (`tools/*.html`): Fully self-contained HTML files. Each tool is a single-file application — HTML structure, `<style>` block for tool-specific CSS, and `<script>` blocks for all logic live in one file.

### Shared theme system

Four of the five tools load two shared files from `tools/`:

- `theme.css` — Monokai CSS custom properties for dark (default) and light modes. Light mode activates via `[data-theme="light"]` on `<html>`.
- `theme.js` — Reads/writes `localStorage` key `hl7-tools-theme`, exposes `window.toggleTheme()`, and syncs the `#btn-theme` toggle button.

**Exception**: `mwl-simulator.html` embeds its own inline CSS with the same Monokai palette but is dark-only and does not load `theme.css`/`theme.js`.

The landing page (`assets/css/custom.css`) mirrors the same Monokai palette variables but is a separate dark-only stylesheet — it does not use `theme.css`.

### Monokai palette (used everywhere)

| Variable | Dark value | Purpose |
|---|---|---|
| `--bg` | `#272822` | Page background |
| `--surface` | `#1e1f1a` | Card/panel backgrounds |
| `--accent` | `#66d9ef` | Links, highlights (cyan) |
| `--green` | `#a6e22e` | Success, action buttons |
| `--text` | `#f8f8f2` | Primary text |
| `--muted` | `#75715e` | Secondary text, comments |

### Adding a new tool

1. Create `tools/your-tool.html` as a standalone HTML file.
2. Add `<link rel="stylesheet" href="theme.css" />` and `<script src="theme.js"></script>` in `<head>` to get the shared Monokai theme and light/dark toggle.
3. Add a `#btn-theme` button element to get the theme toggle wired up automatically.
4. Add a tool card entry to `index.md` following the existing pattern.
5. Add tool-specific light-mode overrides in a `<style>` block using `[data-theme="light"]` selectors.
