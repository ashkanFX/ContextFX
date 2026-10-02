(function (global) {
  function getSiteName(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return url || 'Local entry';
    }
  }

  function group(items) {
    const groups = new Map();

    (Array.isArray(items) ? items : []).forEach(entry => {
      const word = (entry.word || '').trim();
      if (!word) return;

      const key = word.toLowerCase();
      let group = groups.get(key);
      if (!group) {
        group = { word, entries: [], usageCount: 0, priority: entry.priority || 'normal', created: 0 };
        groups.set(key, group);
      }

      group.entries.push(entry);
      group.usageCount += Math.max(1, Number(entry.usageCount) || 1);
      group.created = Math.max(group.created, Number(entry.created) || 0);
    });

    return [...groups.values()].sort((first, second) => second.created - first.created);
  }

  global.ContextFXVocabulary = { group, getSiteName };
})(globalThis);