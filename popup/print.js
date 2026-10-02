document.addEventListener('DOMContentLoaded', () => {
  const rows = document.getElementById('vocabularyRows');
  const summary = document.getElementById('reportSummary');

  function appendCell(row, value, className) {
    const cell = document.createElement('td');
    if (className) cell.className = className;
    cell.textContent = value;
    row.appendChild(cell);
    return cell;
  }

  function appendDictionary(cell, dictionary) {
    if (!dictionary) {
      cell.textContent = 'No dictionary entry available.';
      return;
    }

    const language = document.createElement('small');
    language.className = 'dictionary-language';
    language.textContent = [dictionary.language.name, ...dictionary.pronunciations].filter(Boolean).join(' · ');
    cell.appendChild(language);

    dictionary.definitions.forEach(definition => {
      const meaning = document.createElement('p');
      meaning.className = 'dictionary-meaning';
      if (definition.partOfSpeech) {
        const partOfSpeech = document.createElement('strong');
        partOfSpeech.textContent = `${definition.partOfSpeech}: `;
        meaning.appendChild(partOfSpeech);
      }
      meaning.appendChild(document.createTextNode(definition.definition));
      cell.appendChild(meaning);

      definition.examples.forEach(exampleText => {
        const example = document.createElement('small');
        example.className = 'dictionary-example';
        example.textContent = `Example: ${exampleText}`;
        cell.appendChild(example);
      });
    });

    [['Synonyms', dictionary.synonyms], ['Antonyms', dictionary.antonyms]].forEach(([label, terms]) => {
      if (!terms.length) return;
      const line = document.createElement('p');
      line.className = 'dictionary-terms';
      line.textContent = `${label}: ${terms.join(', ')}`;
      cell.appendChild(line);
    });

    const attribution = document.createElement('p');
    attribution.className = 'dictionary-attribution';
    if (dictionary.source.url) {
      const sourceLink = document.createElement('a');
      sourceLink.href = dictionary.source.url;
      sourceLink.textContent = 'Source';
      attribution.append('Source: ', sourceLink);
    }
    if (dictionary.source.license.name) {
      if (attribution.childNodes.length) attribution.append(' · ');
      if (dictionary.source.license.url) {
        const licenseLink = document.createElement('a');
        licenseLink.href = dictionary.source.license.url;
        licenseLink.textContent = dictionary.source.license.name;
        attribution.append('License: ', licenseLink);
      } else {
        attribution.append(`License: ${dictionary.source.license.name}`);
      }
    }
    if (attribution.childNodes.length) cell.appendChild(attribution);
  }

  chrome.storage.local.get({ vocab: [] }, result => {
    const groups = ContextFXVocabulary.group(result.vocab || []);
    const totalUses = groups.reduce((total, group) => total + group.usageCount, 0);
    summary.textContent = `${groups.length} ${groups.length === 1 ? 'word' : 'words'} · ${totalUses} total ${totalUses === 1 ? 'use' : 'uses'} · ${new Date().toLocaleDateString()}`;

    if (!groups.length) {
      const row = document.createElement('tr');
      appendCell(row, 'No saved vocabulary yet.', 'empty-report').colSpan = 6;
      rows.appendChild(row);
    }

    groups.forEach(group => {
      const row = document.createElement('tr');
      appendCell(row, group.word, 'report-word');
      appendCell(row, String(group.usageCount));
      appendCell(row, String(new Set(group.entries.map(entry => ContextFXVocabulary.getSiteName(entry.url))).size));
      appendCell(row, group.priority.charAt(0).toUpperCase() + group.priority.slice(1));

      const latestEntry = [...group.entries].sort((a, b) => (b.created || 0) - (a.created || 0))[0];
      const dictionaryCell = document.createElement('td');
      appendDictionary(dictionaryCell, latestEntry.dictionary);
      row.appendChild(dictionaryCell);

      const sources = document.createElement('td');
      const sourceEntries = [...new Map(group.entries.filter(entry => entry.url).map(entry => [entry.url, entry])).values()];
      sourceEntries.forEach((entry, index) => {
        if (index) sources.appendChild(document.createElement('br'));
        const link = document.createElement('a');
        link.href = entry.url;
        link.textContent = entry.title || ContextFXVocabulary.getSiteName(entry.url);
        sources.appendChild(link);
      });
      row.appendChild(sources);
      rows.appendChild(row);
    });

    window.setTimeout(() => window.print(), 250);
  });
});