# Lightweight Im2Tex

An Obsidian plugin that converts images of mathematical formulas into LaTeX — entirely on-device, no API key or internet connection required after the first run.

## How it works

The plugin runs [FormulaNet](https://huggingface.co/alephpi/FormulaNet) (a 20 M-parameter VisionEncoderDecoder model) locally via WebAssembly using `@huggingface/transformers`. The model is downloaded from Hugging Face on first use (~100 MB) and cached automatically.

## Usage

1. Open the **Im2Tex** sidebar (ribbon icon or command palette → *Open Im2Tex sidebar*).
2. Load an image by dragging it into the drop zone, clicking **Browse**, or pasting from the clipboard.
3. Draw a rectangle over the formula you want to convert. If you skip this step the full image is used.
4. Click **Detect formula**.
   - On the first run a progress bar shows the model downloading. Subsequent runs are instant.
5. Copy the result with the **Copy** button or paste it directly into your note.

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Model ID | `alephpi/FormulaNet` | Hugging Face model ID. Change only if you want to test a different compatible checkpoint. |

## Installation

### From source

```bash
git clone https://github.com/giacolees/obsidian-ligthweightIm2Tex
cd obsidian-ligthweightIm2Tex
npm install
npm run build
```

Copy (or symlink) the folder into your vault's `.obsidian/plugins/lightweight-im2tex/`, then enable the plugin in **Settings → Community plugins**.

## Development

```bash
npm run dev   # watch mode — rebuilds main.js on every change
npm run build # type-check + production build
```

See [CLAUDE.md](CLAUDE.md) for architecture notes.

## License

MIT
