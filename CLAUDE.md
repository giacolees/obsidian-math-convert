# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # watch mode — rebuilds main.js on every change
npm run build      # type-check then produce production main.js
```

There are no tests. TypeScript type-check only runs as part of `build`.

To test in Obsidian: symlink or copy the repo folder into your vault's `.obsidian/plugins/lightweight-im2tex/`, enable the plugin, then reload.

## Architecture

Single-file plugin (`main.ts` → bundled to `main.js` via esbuild). Everything lives in one file:

- **`Im2TexPlugin`** — Obsidian `Plugin` entry point. Registers the sidebar view, ribbon icon, command, and settings tab. Holds the `Im2TexSettings` object that's passed down to the view.
- **`Im2TexView`** — Obsidian `ItemView` that renders the full sidebar UI: drop zone → canvas pair → result block. Manages image loading (file picker / drag-and-drop / paste), rubber-band region selection drawn on an overlay `<canvas>`, and the inference flow.
- **`Im2TexSettingTab`** — Standard Obsidian settings tab for `apiEndpoint` and `apiKey`.
- **`runInference`** — Stub async function (currently returns a hardcoded formula after 600 ms). **This is the integration point**: replace the body with a real model call. It receives a PNG data-URL of the selected (or full) image and the current settings.

### Canvas layout

Two stacked `<canvas>` elements share the same dimensions inside `.im2tex-canvas-container`:

| Element | Purpose |
|---|---|
| `canvas` (bottom) | Displays the loaded image |
| `overlayCanvas` (top) | Captures mouse/touch events; draws the selection rectangle |

`getCropDataUrl()` converts the on-screen selection rectangle back to natural-image coordinates using a scale factor, then copies that region to an offscreen canvas before passing the PNG data-URL to `runInference`.

### Build notes

- esbuild externalises `obsidian`, `electron`, and all CodeMirror/Lezer packages — they are provided by the Obsidian runtime and must not be bundled.
- `@huggingface/transformers` and `onnxruntime-node` are runtime dependencies; if you wire up local ONNX inference, make sure esbuild bundles them (they are not in the external list).
- `dev` mode produces an inline source map; `production` mode strips it.
