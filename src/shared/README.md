# Shared Module

This folder holds common logic used by multiple parts of the extension.

## Purpose
- store utilities shared across the browser extension
- centralize logging and debug helpers
- keep business logic separate from UI code

## Logger
The `logger.js` file provides a small logger helper for the project.

### Example usage
```js
const logger = ContextFXLogger('extension');
logger.info('Word saved', { word: 'example', url: 'https://site.com' });
logger.warn('No word found for click event');
logger.error('Storage failed', { error: 'unknown' });
```

## Recommended future additions
- storage helpers
- validation helpers
- language settings helpers
- reusable browser API wrappers
