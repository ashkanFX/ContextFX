# ContextFX

ContextFX is a Chrome Manifest V3 extension for collecting vocabulary while you browse. Double-click a word in page text to save it with its source page, dictionary information, and a Persian translation. Review recent words in the popup or export your full collection as a PDF.

## Features

- **Quick capture:** Double-click a word in ordinary page text to highlight and save it. Link text, form controls, and words already highlighted by ContextFX are ignored.
- **Page context:** Each saved word includes the page URL and title, plus a snapshot of up to 12,000 characters of visible page text.
- **Usage tracking:** Repeated captures of a saved word on the same page increment its usage count. Captures from other pages are stored as additional source records. The popup groups matching words case-insensitively and aggregates usage and site counts.
- **Dictionary details:** Looks up the word with FreeDictionaryAPI using the page language when available, falling back to English. The popup can show pronunciations, definitions, examples, synonyms, antonyms, and source/license attribution.
- **Persian meaning:** Looks up an English-to-Persian translation with MyMemory and stores its `responseData.translatedText` as `persianTranslation` on the saved entry. Translation is optional: a failed lookup does not prevent saving a word.
- **Modern popup:** Shows summary statistics and up to five recent unique words, with source links, translations, dictionary details, and page-text previews. Words can be deleted individually or the entire collection can be cleared.
- **Export report:** Opens a full vocabulary report with total uses, unique words, source sites, Persian meanings, priorities, and source-page links. Use **Export PDF**, then choose **Save as PDF** in Chrome's print dialog.
- **Light and dark themes:** The popup and export report share a theme preference.

## Install locally

1. Clone or download this repository.
2. Open `chrome://extensions/` in Chrome.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the project folder containing `manifest.json`.
5. Open a webpage and double-click a word outside links and form controls.
6. Open the ContextFX popup to review saved words, change the theme, delete entries, or clear the collection.
7. Select **Export PDF** to open the report, then choose **Export PDF** and save the print output as a PDF.

After changing extension files, reload ContextFX from `chrome://extensions/`.

## Network access

The extension makes requests to:

- `https://freedictionaryapi.com/*` for dictionary entries.
- `https://api.mymemory.translated.net/*` for English-to-Persian translations.

An internet connection is needed for new lookups. If either service is unavailable, the word can still be saved; dictionary details or the Persian meaning may be absent.

## Project structure

```text
ContextFX/
├── manifest.json
├── icons/
│   └── icon128.png
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
└── src/
    ├── background/
    │   └── service-worker.js
    ├── content/
    │   └── content-script.js
    ├── export/
    │   ├── print.html
    │   ├── print.css
    │   └── print.js
    └── shared/
        ├── dictionary.js
        └── vocabulary.js
```

## Architecture

- **Content script** (`src/content/content-script.js`): detects eligible double-clicks, highlights the selected word, and sends its page context to the extension.
- **Background service worker** (`src/background/service-worker.js`): looks up dictionary and translation data and saves or updates vocabulary records in `chrome.storage.local`.
- **Popup** (`popup/`): groups saved entries, displays recent vocabulary and summary statistics, and provides delete, clear, theme, and export actions.
- **Shared helpers** (`src/shared/`): normalize dictionary responses and group vocabulary records.
- **Export report** (`src/export/`): renders the full saved vocabulary and supports a print-friendly PDF layout.

## Stored vocabulary

Each source record contains the word, page URL and title, page-text snapshot, reminder flag, usage count, priority, creation time, and any available dictionary data or Persian translation. The optional fields are:

- `dictionary`: normalized FreeDictionaryAPI data, including source and license attribution.
- `persianTranslation`: the Persian text returned by MyMemory.

New records start with a usage count of `1` and a normal priority. The current capture flow preserves an existing priority but does not provide a priority-editing control in the popup. Older records without a usage count are treated as one use.

The collection is stored locally in Chrome extension storage. Page-text snapshots are limited to the first 12,000 characters of visible page text and are not a full offline copy of the webpage.

## Development notes

ContextFX uses plain HTML, CSS, and JavaScript; no build step is required. To check the JavaScript syntax with Node.js:

```sh
node --check src/background/service-worker.js
node --check src/content/content-script.js
node --check popup/popup.js
node --check src/export/print.js
```

## Contributing

Bug reports and improvements are welcome. Keep browser-extension APIs in the extension layers and shared data normalization/grouping in `src/shared/`.

## License

No license is currently specified. Add a `LICENSE` file before distributing the project under a particular license.
