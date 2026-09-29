# ContextFX

ContextFX is a small Chrome extension that helps readers capture and track new vocabulary while browsing. Click any word on a page to highlight and save it; view and manage saved words on the Options page.

## Features
- Click-to-save: click a word on any page to highlight and save it.
- Local vocabulary dashboard: view, search, add, and delete words from the Options page.
- Persistent storage using `chrome.storage.local` (data stays on your device).

## Architecture
- Chrome Manifest V3
- Content script: detects clicks and highlights the clicked word (`content-script.js`).
- Background service worker: receives save requests and persists entries (`service-worker.js`).
- Options page: UI for managing vocabulary (`options.html`, `options.js`, `styles.css`).

## Development / Run locally
1. Clone the repo and open Chrome's extensions page: `chrome://extensions/`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this project folder.
4. Open any webpage, click a word to save it, then open the extension Options page (via the extension entry or `options.html`) to view saved words.

## Notes
- The extension saves simple records: `{ word, url, created }` and ignores exact duplicates for the same page.
- Icons and additional UX features (importance rating, CSV export) are TODOs.

## Contributing
PRs and improvements welcome. If you want a build-based stylesheet (Tailwind build), I can add a small build step.

## License
Specify a license (e.g., MIT) if you plan to publish this project.
