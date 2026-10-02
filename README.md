# ContextFX

ContextFX is a Chrome Manifest V3 extension for collecting vocabulary while browsing. Double-click a word in page text to save a reminder with its source page, track its usage and priority, and export the vocabulary list as a PDF.

## What this project does
- Double-clicking ordinary page text highlights and saves the word as a reminder. Link text, form controls, and words already highlighted by ContextFX are ignored.
- Stores the word, page title, URL, and up to 12,000 characters of visible page text in `chrome.storage.local`.
- Counts each eligible capture. Capturing the same word at another eligible occurrence on the same page increments its count; words already highlighted by ContextFX are skipped. Saving the word on another page adds a source record. The popup aggregates counts case-insensitively and shows the number of distinct sites.
- Supports Low, Normal, and High priority. A word's priority is shared across all its saved source pages.
- Shows the five most recently saved unique words in the popup, including usage, priority, source-page links, and a page-text preview.
- Exports the complete vocabulary, usage totals, site counts, priorities, and source-page links. The report opens Chrome's print dialog; choose **Save as PDF** to create the PDF.

## Translation / language support
This project should eventually support a translator feature so words can be converted into the user's own language.

### Goal
The extension should allow a user to:
- save a word in the original language,
- translate it into their preferred language,
- view the original word and translated meaning side by side,
- store translated definitions locally for later study.

### Recommended translation flow
1. User double-clicks a word on a page.
2. The content script captures the text.
3. The extension sends the word to a translation module.
4. The translation module converts the word to the target language.
5. The result is stored with the original word, translated text, and page URL.

### Example translation model choices
- Built-in dictionary lookup
- OpenAI / cloud translation API
- Google Translate or other translation service
- Local language dictionary for offline use

## Project structure
Current extension files:

```text
ContextFX/
├── manifest.json
├── content-script.js
├── service-worker.js
├── icons/
├── popup/
│   ├── popup.html
│   ├── popup.css
│   ├── popup.js
│   ├── print.html
│   ├── print.css
│   └── print.js
├── src/
│   ├── translator/
│   │   └── README.md
│   └── shared/
│       ├── README.md
│       └── vocabulary.js
├── docs/
│   └── README.md
├── README.md
```

## Architecture
- Chrome Manifest V3
- Content script: detects eligible double-clicks, highlights the word, and sends page context (`content-script.js`)
- Background service worker: stores reminders, increments usage counts, and updates priorities (`service-worker.js`)
- Popup: shows recent vocabulary, aggregate counts, priorities, and source links (`popup/`)
- Shared vocabulary helper: groups records and totals usage across source pages (`src/shared/vocabulary.js`)
- PDF report: renders all saved vocabulary and invokes Chrome's print dialog (`popup/print.html`)

## Development / Run locally
1. Clone the repo and open Chrome's extensions page: `chrome://extensions/`.
2. Enable Developer mode.
3. Click Load unpacked and select this project folder.
4. Open a webpage and double-click a word outside links and form controls to save it as a reminder.
5. Open the extension popup to review recent words, usage, source sites, and priorities.
6. Select **Export PDF**, then choose **Save as PDF** in Chrome's print dialog.

## Development plan
### Planned
- Translate saved words into a user-selected language.
- Add spaced repetition and study progress.
- Add vocabulary import/export formats beyond PDF.

## Notes
- Each source record contains `{ word, url, title, pageContent, reminder, usageCount, priority, created }`.
- A new word/source record starts with `usageCount: 1` and `priority: "normal"`. Capturing the same word on another eligible occurrence at that URL increments its count and refreshes the saved page context.
- Legacy records without a usage count are treated as one use.
- Page text snapshots are limited to the first 12,000 characters of visible text; this is not a full offline copy of the webpage.

## Contributing
Pull requests and improvements are welcome. If you want to add the translator feature, start by creating the translation logic in `src/translator/` and keep the browser extension code separate from the language logic.

## License
Specify a license (for example MIT) if you plan to publish the project.
