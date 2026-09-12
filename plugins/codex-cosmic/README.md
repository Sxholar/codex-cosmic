# Codex Cosmic

Published by **Haki**. [Privacy policy](https://github.com/Sxholar/codex-cosmic/blob/main/PRIVACY.md) · [Terms](https://github.com/Sxholar/codex-cosmic/blob/main/TERMS.md) · [Support](mailto:sxholarr@gmail.com)

A local visual studio for designing editable interfaces with Codex. Build pages and Three.js scenes, generate artwork through your Codex conversation, and try real buttons, inputs, sliders and navigation in Preview.

## Install in Codex

Requires a current Codex desktop/CLI installation, a signed-in account with available usage, and Node.js 20 or newer including npm. First launch downloads the locked runtime dependencies from npm. Windows was tested; macOS and Linux paths are supported but have not been tested on those systems.

```sh
codex plugin marketplace add Sxholar/codex-cosmic
codex plugin add codex-cosmic@cosmic
```

Start a new Codex task, select **Codex Cosmic**, and say **Open my Codex Cosmic studio**. The studio opens at `http://127.0.0.1:47831`. Each person runs their own studio using their own account.

For a downloaded ZIP, extract it and substitute its root folder for `Sxholar/codex-cosmic` in the first command. The root contains `.agents/plugins/marketplace.json`. If Codex is not on PATH, use the CLI bundled with your Codex installation.

## See work happen

- The Activity panel shows real connection, generation, validation, placement, completion and error events with elapsed time.
- Imported image thumbnails appear immediately, then change from **Ready to place** to **On canvas** when used.
- Completed elements stream into a live draft as Codex writes them, then the validated result saves once. The saved canvas remains recoverable.
- Runs survive closing the initiating chat connection. Refresh reconnects to saved run history and your prompt.
- A service restart marks unfinished runs interrupted with a retry message. Cancellation and timeouts are saved; concurrent edits preserve a proposed result for review.

Ask Codex to design your project. It chooses native elements for layout, controls and simple marks, and generates imagery only when it would improve the requested design. You do not need to prompt every asset separately. In a compatible embedded MCP Apps view, the asset workflow sends its request directly to the host. In a standalone browser, **Design with imagery when useful** prepares a request to paste into your Codex task. Browser-only **Create design** uses existing images for a local layout run. Image generation requires an available host image tool; this package does not include a separate image-generation service.

Model and effort selectors apply to the layout run. Account usage and model availability still apply. The activity feed does not expose private reasoning or invent progress percentages. Layout operations arrive progressively through an isolated Codex app-server session. Host-created assets appear as they are imported, then appear on the canvas as they are placed.

New launches open project home with Blank canvas selected. New AI requests begin with empty content; open a saved project explicitly to continue it. Failed or cancelled requests offer Retry and, when elements were completed, Open draft as a new project.

The editor uses frame-scheduled dragging, hover and keyboard-focus highlights, short transitions, and reduced-motion preferences.

## What you can edit

Editable borders, gradients, shadows, line height and letter spacing; consistent native vector icons; local list filtering; saved projects, 15 starter templates, custom templates, recoverable Trash, pages, layers, image/reference libraries, comments, project design skills, and a primitive-based Three.js scene editor. Preview and exported HTML share native inputs, sliders, switches, checkboxes, dropdowns, tabs, accordions, linked values and page navigation. Export editable JSON or a standalone HTML prototype.

Artboards are fixed-size prototypes. A design may depict a video editor, checkout or dashboard, but production media processing, payments and backend services need a separate implementation.

## Local data

Projects, images, run history and dependency caches stay on the computer:

- Windows: `%LOCALAPPDATA%/Codex Cosmic`
- macOS: `~/Library/Application Support/Codex Cosmic`
- Linux: `${XDG_DATA_HOME:-~/.local/share}/codex-cosmic`

`CODEX_COSMIC_DATA_DIR` overrides the data folder; `CODEX_COSMIC_PORT` changes the local port; `CODEX_COSMIC_CLI` selects a CLI executable. An original standalone checkout with `data/library.json` keeps that existing data folder. Updates do not package or upload projects.

The server binds to loopback and checks host/origin. It is a local tool, not a multi-user hosted service. Do not expose its port to the internet. Prompts and supplied image references are sent to Codex when you request a design; host image tools use their own service. No account credentials are bundled or shared.

## Development

```sh
cd plugins/codex-cosmic
npm ci
npm test
npm run build
npm start
```

The plugin uses `node scripts/start.mjs` to prepare a writable runtime automatically. `dist/index.html` is prebuilt. Runtime libraries are pinned by `package-lock.json`.

## Attribution and support

An independent community project, not an official OpenAI or Anthropic product. Original project code is MIT licensed. Third-party dependencies retain their licenses. The bundled design reference preserves its sources and attribution. The OpenAI blossom is a trademark; see `plugins/codex-cosmic/assets/NOTICE.md` and its accompanying license.

Report issues at [GitHub Issues](https://github.com/Sxholar/codex-cosmic/issues). This public repository is an installable community marketplace; it is not a listing in OpenAI's reviewed public plugin directory.

## Feedback during preview

Use [Report a problem or share design feedback](https://github.com/Sxholar/codex-cosmic/issues/new/choose), also linked from project home. Include the prompt, the selected model and effort, what you expected, and the result. A screenshot helps with visual feedback.

This is an independent community plugin in preview. Its public GitHub marketplace is separate from a listing in OpenAI’s public plugin directory; no public-directory approval is claimed.
