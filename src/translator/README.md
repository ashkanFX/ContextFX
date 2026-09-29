# Translator Module

This folder is reserved for the language translation feature.

## Purpose
The translator module is responsible for converting saved vocabulary into the user's preferred language.

## Example responsibilities
- detect source language
- translate a single word or phrase
- store original + translated text
- support multiple target languages
- keep translation logic separate from browser-extension code

## Suggested API
```js
async function translateWord(text, targetLanguage) {
  // returns { original, translated, language, confidence }
}
```

## Suggested workflow
1. Receive the original word from the extension.
2. Detect or accept the source language.
3. Convert the word using a dictionary or API.
4. Return the translated result.
5. Save the result in local storage with metadata.

## Recommended next steps
- Add a language selector in the options page.
- Create a shared settings model for user language.
- Connect the translator module with the extension's storage logic.
