# ContextFX

ContextFX is a Chrome extension for learning vocabulary while browsing the web. Users can click a word on a page, save it, and later review or manage it in a local dashboard.

## What this project does
- Lets the user click a word on any webpage.
- Highlights the selected word on the page.
- Saves the word and page URL in local browser storage.
- Gives the user a dashboard to view, search, add, and delete saved words.

## Translation / language support
This project should eventually support a translator feature so words can be converted into the user's own language.

### Goal
The extension should allow a user to:
- save a word in the original language,
- translate it into their preferred language,
- view the original word and translated meaning side by side,
- store translated definitions locally for later study.

### Recommended translation flow
1. User clicks a word on a page.
2. The content script captures the text.
3. The extension sends the word to a translation module.
4. The translation module converts the word to the target language.
5. The result is stored with the original word, translated text, and page URL.

### Example translation model choices
- Built-in dictionary lookup
- OpenAI / cloud translation API
- Google Translate or other translation service
- Local language dictionary for offline use

### Recommended structure for this feature
Create a separate module dedicated to language conversion, such as:
- `src/translator/` for translation logic
- `src/shared/` for common helpers and data models
- `src/extension/` for browser-extension behavior

This keeps the translator logic separate from the browser UI and makes future feature work easier.

## Project structure
A clean development structure for this project could look like this:

```text
ContextFX/
├── manifest.json
├── content-script.js
├── service-worker.js
├── options.html
├── styles.css
├── icons/
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── src/
│   ├── extension/
│   │   └── browser logic and UI actions
│   ├── translator/
│   │   └── text translation and language conversion
│   └── shared/
│       └── common utilities and storage helpers
├── docs/
│   └── feature notes and future planning
├── README.md
└── .gitignore
```

This is a recommended separation, not a strict requirement. The extension can still work from the root while new features grow in a more controlled way.

## Architecture
- Chrome Manifest V3
- Content script: detects clicks and highlights the clicked word (`content-script.js`)
- Background service worker: receives save requests and persists entries (`service-worker.js`)
- Options page: UI for managing vocabulary (`options.html`, `styles.css`)
- Translator module: planned separate area for word-to-language conversion (`src/translator/`)

## Development / Run locally
1. Clone the repo and open Chrome's extensions page: `chrome://extensions/`.
2. Enable Developer mode.
3. Click Load unpacked and select this project folder.
4. Open a webpage, click a word to save it.
5. Open the extension Options page to view saved words.

## Development plan
### Phase 1
- Improve the options page and UI/UX
- Add better search and sort options
- Improve saved item data handling

### Phase 2
- Add translation support for user language
- Support multiple languages
- Let the user select a target language in settings

### Phase 3
- Add spaced repetition learning
- Add favorites and progress tracking
- Export/import vocabulary data

## Notes
- The extension currently stores simple records such as `{ word, url, created }`.
- Exact duplicates for the same page are ignored.
- Translation support, language selection, and advanced study features are planned next.

## Contributing
Pull requests and improvements are welcome. If you want to add the translator feature, start by creating the translation logic in `src/translator/` and keep the browser extension code separate from the language logic.

## License
Specify a license (for example MIT) if you plan to publish the project.
