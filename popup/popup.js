document.addEventListener('DOMContentLoaded', () => {
  const totalWordsEl = document.getElementById('totalWords');
  const uniqueWordsEl = document.getElementById('uniqueWords');
  const latestWordEl = document.getElementById('latestWord');
  const recentWordsEl = document.getElementById('recentWords');
  const openOptionsBtn = document.getElementById('openOptions');
  const clearWordsBtn = document.getElementById('clearWords');

  function renderPopup(items) {
    const words = Array.isArray(items) ? items : [];
    const latest = [...words].sort((a, b) => (b.created || 0) - (a.created || 0))[0];
    const uniqueSet = new Set(words.map(item => (item.word || '').trim().toLowerCase()).filter(Boolean));

    totalWordsEl.textContent = String(words.length);
    uniqueWordsEl.textContent = String(uniqueSet.size);
    latestWordEl.textContent = latest ? latest.word : '—';

    recentWordsEl.innerHTML = '';

    if (!words.length) {
      const emptyItem = document.createElement('li');
      emptyItem.className = 'empty-state';
      emptyItem.textContent = 'No saved words yet';
      recentWordsEl.appendChild(emptyItem);
      return;
    }

    const recent = [...words].slice(-5).reverse();

    recent.forEach(entry => {
      const item = document.createElement('li');
      item.className = 'word-item';

      const word = document.createElement('span');
      word.className = 'word-text';
      word.textContent = entry.word || 'Unknown';

      const url = document.createElement('small');
      url.className = 'word-url';
      url.textContent = entry.url ? new URL(entry.url).hostname : 'Local entry';

      item.appendChild(word);
      item.appendChild(url);
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

  loadWords();
});
