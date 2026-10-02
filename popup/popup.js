document.addEventListener('DOMContentLoaded', () => {
  const totalWordsEl = document.getElementById('totalWords');
  const uniqueWordsEl = document.getElementById('uniqueWords');
  const latestWordEl = document.getElementById('latestWord');
  const recentWordsEl = document.getElementById('recentWords');
  const openOptionsBtn = document.getElementById('openOptions');
  const clearWordsBtn = document.getElementById('clearWords');
  const exportPdfBtn = document.getElementById('exportPdf');

  function appendDictionaryDetails(container, dictionary) {
    if (!dictionary) return;

    const details = document.createElement('section');
    details.className = 'dictionary-details';

    const heading = document.createElement('small');
    heading.className = 'dictionary-heading';
    heading.textContent = [dictionary.language.name, ...dictionary.pronunciations].filter(Boolean).join(' · ');
    details.appendChild(heading);

    dictionary.definitions.slice(0, 3).forEach(definition => {
      const meaning = document.createElement('p');
      meaning.className = 'dictionary-meaning';
      if (definition.partOfSpeech) {
        const partOfSpeech = document.createElement('strong');
        partOfSpeech.textContent = `${definition.partOfSpeech}: `;
        meaning.appendChild(partOfSpeech);
      }
      meaning.appendChild(document.createTextNode(definition.definition));
      details.appendChild(meaning);

      if (definition.examples.length) {
        const example = document.createElement('small');
        example.className = 'dictionary-example';
        example.textContent = `Example: ${definition.examples[0]}`;
        details.appendChild(example);
      }
    });

    if (dictionary.synonyms.length) {
      const synonyms = document.createElement('small');
      synonyms.className = 'dictionary-terms';
      synonyms.textContent = `Synonyms: ${dictionary.synonyms.join(', ')}`;
      details.appendChild(synonyms);
    }
    if (dictionary.antonyms.length) {
      const antonyms = document.createElement('small');
      antonyms.className = 'dictionary-terms';
      antonyms.textContent = `Antonyms: ${dictionary.antonyms.join(', ')}`;
      details.appendChild(antonyms);
    }

    const attribution = document.createElement('small');
    attribution.className = 'dictionary-attribution';
    if (dictionary.source.url) {
      const sourceLink = document.createElement('a');
      sourceLink.href = dictionary.source.url;
      sourceLink.target = '_blank';
      sourceLink.rel = 'noopener noreferrer';
      sourceLink.textContent = 'Source';
      attribution.append('Source: ', sourceLink);
    }
    if (dictionary.source.license.name) {
      if (attribution.childNodes.length) attribution.append(' · ');
      if (dictionary.source.license.url) {
        const licenseLink = document.createElement('a');
        licenseLink.href = dictionary.source.license.url;
        licenseLink.target = '_blank';
        licenseLink.rel = 'noopener noreferrer';
        licenseLink.textContent = dictionary.source.license.name;
        attribution.append('License: ', licenseLink);
      } else {
        attribution.append(`License: ${dictionary.source.license.name}`);
      }
    }
    if (attribution.childNodes.length) details.appendChild(attribution);
    container.appendChild(details);
  }

  function renderPopup(items) {
    const words = Array.isArray(items) ? items : [];
    const uniqueWords = ContextFXVocabulary.group(words);
    const totalUsage = uniqueWords.reduce((total, group) => total + group.usageCount, 0);

    totalWordsEl.textContent = String(totalUsage);
    uniqueWordsEl.textContent = String(uniqueWords.length);
    latestWordEl.textContent = uniqueWords.length ? uniqueWords[0].word : '—';

    recentWordsEl.innerHTML = '';

    if (!uniqueWords.length) {
      const emptyItem = document.createElement('li');
      emptyItem.className = 'empty-state';
      emptyItem.textContent = 'No saved words yet';
      recentWordsEl.appendChild(emptyItem);
      return;
    }

    const recent = uniqueWords.slice(0, 5);

    recent.forEach(group => {
      const item = document.createElement('li');
      item.className = 'word-item';

      const word = document.createElement('span');
      word.className = 'word-text';
      word.textContent = group.word;

      const sites = new Set(group.entries.map(entry => ContextFXVocabulary.getSiteName(entry.url)));
      const usage = document.createElement('small');
      usage.className = 'word-stats';
      usage.textContent = `Used ${group.usageCount} ${group.usageCount === 1 ? 'time' : 'times'} · saved on ${sites.size} ${sites.size === 1 ? 'site' : 'sites'}`;

      const reminder = document.createElement('small');
      reminder.className = 'reminder-label';
      reminder.textContent = group.entries.some(entry => entry.reminder) ? 'Reminder' : 'Saved word';

      const priorityControl = document.createElement('label');
      priorityControl.className = 'priority-control';
      const priorityLabel = document.createElement('span');
      priorityLabel.textContent = 'Priority';
      const prioritySelect = document.createElement('select');
      prioritySelect.className = 'priority-select';
      prioritySelect.setAttribute('aria-label', `Priority for ${group.word}`);
      ['low', 'normal', 'high'].forEach(priority => {
        const option = document.createElement('option');
        option.value = priority;
        option.textContent = priority.charAt(0).toUpperCase() + priority.slice(1);
        option.selected = group.priority === priority;
        prioritySelect.appendChild(option);
      });
      prioritySelect.addEventListener('change', () => {
        chrome.runtime.sendMessage({ type: 'set-priority', word: group.word, priority: prioritySelect.value }, loadWords);
      });
      priorityControl.append(priorityLabel, prioritySelect);

      const pageSources = document.createElement('div');
      pageSources.className = 'word-sources';
      const sourceEntries = [...new Map(group.entries.filter(entry => entry.url).map(entry => [entry.url, entry])).values()];
      sourceEntries.forEach(entry => {
        const pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.href = entry.url;
        pageLink.target = '_blank';
        pageLink.rel = 'noopener noreferrer';
        try {
          pageLink.textContent = entry.title || new URL(entry.url).hostname;
        } catch {
          pageLink.textContent = entry.title || entry.url;
        }
        pageSources.appendChild(pageLink);
      });

      item.append(word, usage, reminder, priorityControl, pageSources);

      const latestEntry = [...group.entries].sort((a, b) => (b.created || 0) - (a.created || 0))[0];
      appendDictionaryDetails(item, latestEntry.dictionary);
      if (latestEntry.pageContent) {
        const snapshot = document.createElement('small');
        snapshot.className = 'page-snapshot';
        snapshot.textContent = latestEntry.pageContent;
        item.appendChild(snapshot);
      }

      recentWordsEl.appendChild(item);
    });
  }

  function loadWords() {
    chrome.storage.local.get({ vocab: [] }, result => {
      renderPopup(result.vocab || []);
    });
  }

  openOptionsBtn.addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      chrome.tabs.create({ url: '../options.html' });
    }
  });

  clearWordsBtn.addEventListener('click', () => {
    chrome.storage.local.set({ vocab: [] }, () => {
      loadWords();
    });
  });

  exportPdfBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('popup/print.html') });
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.vocab) loadWords();
  });

  loadWords();
});
