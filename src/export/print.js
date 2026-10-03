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