# Contributing

Thanks for contributing to Math-Convert.

## Development setup

```bash
npm install
npm run dev
```

For a production verification build, run:

```bash
npm run build
```

`npm run build` is the main quality gate for this repository. There are currently no automated tests beyond the TypeScript check and production bundle build.

## Repository workflow

1. Create a branch from `main`.
2. Make focused changes with a clear purpose.
3. Run `npm run build` before opening a pull request.
4. Open a pull request with a short summary of the user-facing change.

Small pull requests are easier to review and safer to release.

## Plugin-specific expectations

- Preserve the Electron/ONNX workarounds in [`esbuild.config.mjs`](./esbuild.config.mjs). They are required for the bundled WASM runtime to work inside Obsidian.
- Keep the plugin desktop-only unless the runtime model-loading approach changes.
- If behavior changes around model loading, downloads, or inference, mention that clearly in the pull request description.
- If you change source files that affect the shipped plugin, make sure the generated `main.js` is rebuilt before merge or release.

## Testing in Obsidian

To test manually in Obsidian:

1. Copy or symlink this repository into your vault at `.obsidian/plugins/math-convert/`.
2. Enable the plugin in **Settings -> Community plugins**.
3. Reload Obsidian after rebuilding.

## Release workflow

Releases should be cut from `main` after a pull request has merged.

```bash
npm version patch
git push
git push --tags
```

The release workflow publishes the assets required by Obsidian community plugins:

- `main.js`
- `manifest.json`
- `styles.css`

The Git tag must exactly match the version in `manifest.json`.
