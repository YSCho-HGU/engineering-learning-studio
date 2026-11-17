# Shared Textbook Viewer

Path: `/textbook-viewer/`

The shared reader is used by the C Programming chapter catalog and is linked from the Signals & Systems visual learning site.

## Supported sources

- `?course=c&drive=GOOGLE_DRIVE_FILE_ID&title=Textbook`: uses the Google Drive preview in a sandboxed provider iframe. Browser CSS can darken the **whole iframe**, but cannot change the Google document's underlying PDF page colors. The original link is always available; photo and graph colors can change.
- `?course=ss&theme=warm-neutral`: launched from Signals & Systems with its active display palette. Users can paste a Google Drive file URL or open a local PDF.
- `?pdf=/same-origin/path/to/file.pdf`: PDF.js renders an accessible same-origin PDF.
- File picker: PDF.js renders a chosen local file without uploading its bytes to any server.

Only Google Drive file IDs on known URL formats are accepted in the Drive link box. Arbitrary cross-origin fetches and arbitrary remote PDF URLs are not permitted.

## PDF.js

The viewer pins the main module and matching worker to pdf.js v4.10.38 (cdnjs), loaded only for local / same-origin PDF rendering. A network connection to the CDN is required on first use. If the library is unavailable the page shows a visible error and retains the source link when one is known.

The PDF.js render path uses `pageColors` with background and foreground settings from the site's palette. Full-fidelity color reproduction is **not guaranteed** under alternate high-contrast colors. Selecting **Original colors** avoids remapping.

## Privacy, backward compatibility and testing

No lesson/progress keys were changed. The reader does not upload user-selected PDFs. Do not put confidential documents in public URLs or public repositories.

Run `node tests/textbook-viewer.mjs` to validate viewer controls, route wiring, PDF.js version matching and URL validation. Full manual QA should additionally check a short PDF in light and dark modes, text/formula readability, mobile zoom, Google preview permissions and CDN-blocked behavior.
