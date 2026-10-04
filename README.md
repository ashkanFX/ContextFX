# ContextFX

ContextFX is a Chrome Manifest V3 extension for collecting vocabulary while browsing. Double-click a word in page text to save a reminder with its source page, track usage and priority, remove entries individually, and export a polished PDF report.

## What this project does
- Double-clicking ordinary page text highlights and saves the word as a reminder. Link text, form controls, and words already highlighted by ContextFX are ignored.
- Stores the word, page title, URL, and up to 12,000 characters of visible page text in `chrome.storage.local`.
- Counts each eligible capture. Capturing the same word at another eligible occurrence on the same page increments its count; words already highlighted by ContextFX are skipped. Saving the word on another page adds a source record. The popup aggregates counts case-insensitively and shows the number of distinct sites.
- Supports Low, Normal, and High priority. A word's priority is shared across all its saved source pages.
- Looks up saved words with FreeDictionaryAPI using the page's `lang` value, falling back to English. It stores pronunciations, definitions, examples, synonyms, antonyms, and source/license metadata with the vocabulary.
- Shows the five most recently saved unique words in a modern popup UI, including usage totals, source-site counts, source-page links, and page-text previews.
- Lets users remove each saved word individually from the popup with a dedicated Delete action, keeping the summary in sync with the stored vocabulary.
- Exports the complete vocabulary, usage totals, site counts, priorities, dictionary details, and source-page links in a modern report layout. The report opens Chrome's print dialog; choose **Save as PDF** to create the PDF.

Dictionary details are cached for matching words and languages across saved sites. If the API is unavailable or has no entry, the word and page reminder are still saved without dictionary details. The extension needs an internet connection for new lookups.

## Future translation support
Dictionary definitions are available now; translating definitions into a user-selected language is still planned.

### Goal
The extension should allow a user to:
- save a word in the original language,
- translate it into their preferred language,
- view the original word and translated meaning side by side,
- store translated definitions locally for later study.

### Recommended translation flow
1. The user selects a target language.
2. A translation service translates a saved word or definition.
3. ContextFX stores the translation alongside the original dictionary entry.

### Example translation model choices
- Built-in dictionary lookup
- OpenAI / cloud translation API
- Google Translate or other translation service
- Local language dictionary for offline use

## Project structure
Current extension files, including the export report and modern popup UI:

```text
ContextFX/
├── manifest.json
├── icons/
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── src/
│   ├── background/
│   │   └── service-worker.js
│   ├── content/
│   │   └── content-script.js
│   ├── export/
│   │   ├── print.html
│   │   ├── print.css
│   │   └── print.js
│   └── shared/
│       ├── README.md
│       ├── dictionary.js
│       └── vocabulary.js
├── README.md
```

## Architecture
- Chrome Manifest V3
- Content script: detects eligible double-clicks, highlights the word, and sends page context (`src/content/`)
- Background service worker: looks up dictionary data, stores reminders, increments usage counts, and updates priorities (`src/background/`)
- Popup: shows recent vocabulary, aggregate counts, priorities, source links, and per-word deletion controls in a modern card layout (`popup/`)
- Shared vocabulary helper: groups records and totals usage across source pages (`src/shared/vocabulary.js`)
- Shared dictionary helper: normalizes API responses and keeps attribution metadata (`src/shared/dictionary.js`)
- PDF report: renders all saved vocabulary in a clean dashboard-style layout and invokes Chrome's print dialog (`src/export/print.html`)

## Development / Run locally
1. Clone the repo and open Chrome's extensions page: `chrome://extensions/`.
2. Enable Developer mode.
3. Click Load unpacked and select this project folder.
4. Open a webpage and double-click a word outside links and form controls to save it as a reminder.
5. Open the extension popup to review recent words, usage, source sites, priorities, and delete any saved word with the per-item action.
6. Select **Export PDF** to open the modern report view, then choose **Save as PDF** in Chrome's print dialog.

The manifest grants the extension host access to `https://freedictionaryapi.com/*` for dictionary lookups.

## Development plan
### Planned
- Translate saved words into a user-selected language.
- Add spaced repetition and study progress.
- Add vocabulary import/export formats beyond PDF.

## Notes
- Each source record contains `{ word, url, title, pageContent, reminder, usageCount, priority, created, dictionary }`. The optional `dictionary` field contains normalized API data and its source/license attribution.
- A new word/source record starts with `usageCount: 1` and `priority: "normal"`. Capturing the same word on another eligible occurrence at that URL increments its count and refreshes the saved page context.
- Legacy records without a usage count are treated as one use.
- Page text snapshots are limited to the first 12,000 characters of visible text; this is not a full offline copy of the webpage.

## Contributing
Pull requests and improvements are welcome. If you want to add the translator feature, start by creating the translation logic in `src/translator/` and keep the browser extension code separate from the language logic.

## License
Specify a license (for example MIT) if you plan to publish the project.
