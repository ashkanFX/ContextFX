# ContextFX

**ContextFX** is a Chrome Extension designed to help readers capture, track, and analyze new vocabulary while browsing the web. Stop losing your reading flow to dictionary tabs—build your own vocabulary database right where you learn.

## 🚀 The Mission
ContextFX helps you save unknown words instantly, store their meanings, and provides an "Importance/Usage" analysis so you can focus your learning on the words that actually matter.

## ✨ Key Features (MVP)
*   **Right-Click Capture:** Highlight any word on a webpage and save it instantly.
*   **Vocabulary Dashboard:** A clean, searchable table view of all your saved words.
*   **Importance Scoring:** Track how often you see a word or assign it an importance rating.
*   **Manual Definitions:** Edit and save personalized meanings for the words you collect.
*   **Data Portability:** Export your entire vocabulary list to CSV whenever you need.

## 🏗️ Technical Architecture
Built using **Chrome Manifest V3** for performance and security:
*   **Content Script:** Detects selections and injects the context menu.
*   **Service Worker:** Handles storage operations and background logic.
*   **Options Page:** The main dashboard (Table) where you manage your vocabulary list.
*   **Storage:** Uses `chrome.storage.local` to keep your data private and on your machine.

## 🛠️ Getting Started
To run ContextFX in development mode:

1.  **Clone this repository** to your local machine.
2.  **Open Chrome** and navigate to `chrome://extensions/`.
3.  **Toggle "Developer mode"** in the top right corner.
4.  **Click "Load unpacked"** and select your project folder.
5.  **Refresh** any open tab to start using the extension.

## 📋 Development Roadmap
- [ ] **Phase 1:** Setup manifest.json and boilerplate.
- [ ] **Phase 2:** Implement "Right-click to save" functionality.
- [ ] **Phase 3:** Create the Vocabulary Table (Options page).
- [ ] **Phase 4:** Add "Importance Rating" logic.
-4.  **Click "Load unpacked"** and select your project folder.
5.  **Refresh** any open tab to start using the extension.

## 📋 Development Roadmap
- [ ] **Phase 1:** Setup manifest.json and boilerplate.
- [ ] **Phase 2:** Implement "Right-click to save" functionality.
- [ ] **Phase 3:** Create the Vocabulary Table (Options page).
- [ ] **Phase 4:** Add "Importance Rating" logic.
- [ ] **Phase 5:** Add Export to CSV feature.

## 📝 License
[Specify your license, e.g., MIT License]
