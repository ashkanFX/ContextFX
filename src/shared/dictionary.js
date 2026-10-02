(function (global) {
  function safeHttpsUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? url.href : '';
    } catch {
      return '';
    }
  }

  function normalize(response, fallbackLanguage) {
    if (!response || !Array.isArray(response.entries)) return null;

    const definitions = [];
    const pronunciations = new Set();
    const synonyms = new Set(response.synonyms || []);
    const antonyms = new Set(response.antonyms || []);

    response.entries.forEach(entry => {
      (entry.pronunciations || []).forEach(pronunciation => {
        if (pronunciation.text) pronunciations.add(pronunciation.text);
      });

      (entry.senses || []).forEach(sense => {
        if (!sense.definition || definitions.length >= 10) return;
        definitions.push({
          partOfSpeech: entry.partOfSpeech || '',
          definition: String(sense.definition).slice(0, 800),
          examples: (sense.examples || []).filter(Boolean).slice(0, 2).map(example => String(example).slice(0, 500)),
        });
        (sense.synonyms || []).forEach(value => synonyms.add(value));
        (sense.antonyms || []).forEach(value => antonyms.add(value));
      });
    });

    const language = response.language || { code: fallbackLanguage, name: fallbackLanguage };
    const source = response.source || {};
    const license = source.license || {};

    return {
      language: {
        code: language.code || fallbackLanguage,
        name: language.name || fallbackLanguage,
      },
      pronunciations: [...pronunciations].slice(0, 3),
      definitions,
      synonyms: [...synonyms].filter(Boolean).slice(0, 10),
      antonyms: [...antonyms].filter(Boolean).slice(0, 10),
      source: {
        url: safeHttpsUrl(source.url),
        license: {
          name: license.name || '',
          url: safeHttpsUrl(license.url),
        },
      },
      fetchedAt: Date.now(),
    };
  }

  global.ContextFXDictionary = { normalize };
})(globalThis);