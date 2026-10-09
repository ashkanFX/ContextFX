importScripts("../shared/dictionary.js");

// Background service worker: looks up and persists saved vocabulary.
function getDictionary(word, language, vocab) {
  const cached = vocab.find(
    (entry) =>
      (entry.word || "").trim().toLowerCase() === word.trim().toLowerCase() &&
      entry.dictionary &&
      entry.dictionary.language.code === language,
  );
  if (cached) return Promise.resolve(cached.dictionary);

  const url = `https://freedictionaryapi.com/api/v1/entries/${language}/${word}`;
  return fetch(url)
    .then((response) => {
      if (!response.ok)
        throw new Error(`Dictionary lookup failed: ${response.status}`);
      return response.json();
    })
    .then((response) => ContextFXDictionary.normalize(response, language))
    .catch(() => null);
}

function translate(word, vocab) {
  return fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|fa`,
  )
    .then((response) => {
      if (!response.ok)
        throw new Error(`Translation lookup failed: ${response.status}`);
      return response.json();
    })
    .then((response) => {
      const normalizedWord = word
        .trim()
        .toLocaleLowerCase()
        .replace(/[^\p{L}\p{N}]/gu, "");
      const knownTranslations = new Set(
        vocab
          .filter(
            (entry) =>
              (entry.word || "").trim().toLocaleLowerCase() ===
              word.trim().toLocaleLowerCase(),
          )
          .flatMap((entry) => (entry.persianTranslation || "").split("،"))
          .map((translation) => translation.trim().toLocaleLowerCase())
          .filter(Boolean),
      );
      const translations = [
        ...new Set(
          (Array.isArray(response.matches) ? response.matches : [])
            .filter((match) => {
              const segment = String(match.segment || "")
                .trim()
                .toLocaleLowerCase()
                .replace(/[^\p{L}\p{N}]/gu, "");
              return (
                segment === normalizedWord &&
                typeof match.translation === "string" &&
                /\p{L}/u.test(match.translation)
              );
            })
            .sort((first, second) => Number(second.match) - Number(first.match))
            .map((match) => match.translation.trim())
            .filter(
              (translation) =>
                translation &&
                !knownTranslations.has(translation.toLocaleLowerCase()),
            ),
        ),
      ];
      if (translations.length) return translations.join("، ");
      if (knownTranslations.size) return null;

      const translatedText = response.responseData?.translatedText;
      return typeof translatedText === "string" && translatedText.trim()
        ? translatedText.trim()
        : null;
    })
    .catch(() => null);
}
// Background service worker handles reminder and priority messages.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === "save-reminder") {
    const word = message.word || "";
    const url = message.url || (sender && sender.tab && sender.tab.url) || "";
    const title = message.title || "";
    const pageContent = message.pageContent || "";
    const requestedLanguage = String(message.language || "en")
      .toLowerCase()
      .split(/[-_]/)[0];
    const language = /^[a-z]{2,3}$/.test(requestedLanguage)
      ? requestedLanguage
      : "en";
    if (!word) {
      return;
    }

    chrome.storage.local.get({ vocab: [] }, (data) => {
      const vocab = data.vocab || [];
      const normalizedWord = word.trim().toLowerCase();
      const exists = vocab.find(
        (v) =>
          (v.word || "").trim().toLowerCase() === normalizedWord &&
          v.url === url,
      );
      Promise.all([
        getDictionary(word, language, vocab),
        translate(word, vocab),
      ]).then(
        ([dictionary, persianTranslation]) => {
          if (exists) {
            Object.assign(exists, {
              title,
              pageContent,
              reminder: true,
              usageCount: Math.max(1, Number(exists.usageCount) || 1) + 1,
              priority: exists.priority || "normal",
              created: Date.now(),
            });
            if (dictionary) exists.dictionary = dictionary;
            if (persianTranslation)
              exists.persianTranslation = persianTranslation;
          } else {
            const priorEntry = vocab.find(
              (entry) =>
                (entry.word || "").trim().toLowerCase() === normalizedWord,
            );
            const entry = {
              word,
              url,
              title,
              pageContent,
              reminder: true,
              usageCount: 1,
              priority: priorEntry ? priorEntry.priority || "normal" : "normal",
              created: Date.now(),
            };
            if (dictionary) entry.dictionary = dictionary;
            if (persianTranslation)
              entry.persianTranslation = persianTranslation;
            vocab.push(entry);
          }

          chrome.storage.local.set({ vocab }, () =>
            sendResponse({
              ok: true,
              dictionaryAvailable: Boolean(dictionary),
              translationAvailable: Boolean(persianTranslation),
            }),
          );
        },
      );
    });
    return true;
  }
});
