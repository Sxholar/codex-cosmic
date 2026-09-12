# Codex Cosmic — live design preview

Package version: 0.1.0+codex.20260912093935. Runtime: 0.3.0-streaming.

New launches open project home with Blank canvas selected. New AI requests create empty content, while existing projects remain available through an explicit open action. Opening another project immediately clears the previous project's progress and recovery controls.

The design runner now streams completed native elements into a live draft. Actual progress, asset arrivals, cancellation, failure, interruption, retry and conflict recovery remain visible. Saved content is committed only after validation. The local service survives the originating MCP client disconnecting.

Design capabilities now include editable typography spacing, borders, gradients, shadows, native vector icons and local list filtering. New design guidance emphasizes task-specific composition, real content, useful imagery and rendered refinement. Native elements handle UI; host image generation supplies original assets when useful. Standalone browser layout runs use existing assets, and the separate imagery action prepares a request for the Codex conversation.

The editor includes frame-scheduled dragging, hover and focus feedback, reduced-motion support, and responsive panel behavior. Project home links to [bug reports and design feedback](https://github.com/Sxholar/codex-cosmic/issues/new/choose).

Validation: 39 automated tests passed; production build and plugin validation passed; real MCP initialization exposed 22 tools; the installed service survived disconnect. Two real design runs were inspected while native layers were arriving. The optional 80-layer Tideline example includes one actual generated image. Search, linked counters, switches and reset were checked in the studio and standalone HTML export. Existing saved designs were preserved during the update.

This is a tested Windows preview, not a guarantee of arbitrary generated output quality. macOS and Linux have not been device-tested. No performance benchmark or public-directory approval is claimed.

## Install

Requires Node.js 20+ with npm and a current signed-in Codex installation with available usage.

```sh
codex plugin marketplace add Sxholar/codex-cosmic
codex plugin add codex-cosmic@cosmic
```

Start a new Codex task, select Codex Cosmic, and say “Open my Codex Cosmic studio.” Each person runs their own studio locally using their own account.

The download contains a complete community marketplace. Extract the ZIP and use its root folder in place of Sxholar/codex-cosmic in the first command to install that exact release.

Optional example downloads are separate: import tideline-framebox.cosmic.json to edit it, or open tideline-framebox.html to try the standalone prototype. No examples or personal projects are loaded automatically.

This is a public community release. It is separate from OpenAI's reviewed plugin directory, where approval is still pending the supported local-MCP submission route.
