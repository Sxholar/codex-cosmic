# Automatic assets for Cosmic designs

1. Read the latest project, brief, enabled design skills, references and existing asset metadata. Inspect existing images before reusing or editing them. Infer the appropriate art direction from the actual request.
2. Plan only the imagery the design needs: hero artwork, illustrations, product images, backgrounds, textures or distinctive icons. A form or dashboard may need little imagery. Keep buttons, labels, sliders, inputs, tabs, navigation and their states as native components. Custom artwork can sit behind or beside a real control; it must not replace its behavior or accessible label.
3. Author each image prompt: purpose, subject, composition, focal placement, aspect ratio, palette, background/alpha, desired detail, and exclusions. Generate through the host image tool. Generate distinct assets separately when they need independent composition. Use a coherent sheet when a coordinated set of small decorative assets benefits from it. Do not ask users to write the prompts themselves.
4. For sheets, request even spacing and clear separation, a transparent or uniform background, and no embedded labels. Inspect the actual generated sheet and determine crop rectangles in its real pixel dimensions. Do not assume requested cell positions or dimensions match the result.
5. Import the source via `import_image_asset` (its actual dimensions are detected). Call `prepare_image_assets` with source assetId, current baseRevision, and named regions `{name,left,top,width,height,outputWidth?}`. It returns new PNG asset IDs and preserves the source. Optional `background:{color:'#ffffff',tolerance:12}` removes matching pixels connected to each crop border while protecting enclosed same-color details. Use host image editing for complex photographic cutouts or difficult halos; flat-color removal is not semantic segmentation. Preserve generated alpha.
6. Inspect the extracted outputs on light and dark backgrounds at their intended size. Check cut edges, shadows, unexpected borders, alpha and naming. Correct crops or regenerate weak assets. Retain the original, save a new version, and avoid unrelated replacements.
7. Read the latest revision and place the new asset IDs into actual image layers, respecting focal point, crop and hierarchy. For a UI sheet used as style reference, implement equivalent native controls and use extracted artwork only where useful. Connect sliders to numbers/progress, buttons to real local actions or navigation, and tabs to appropriate content.
8. In a website/code export, copy final assets into the project and reference stable local paths; do not leave code depending on a temporary image generator location. Review the rendered design and test the interactions. Report failures honestly; never call missing assets complete.

## Example preparation request

`prepare_image_assets` arguments:
```json
{"projectId":"current-project-id","baseRevision":4,"assetId":"inspected-sheet-id","regions":[{"name":"Ember crest","left":24,"top":20,"width":256,"height":256},{"name":"Wing emblem","left":312,"top":20,"width":256,"height":256}],"background":{"color":"#ffffff","tolerance":10}}
```

These coordinates are examples, not a grid prescription. Use the dimensions and regions observed in the actual source.
