// Background service worker: listens for save-reminder messages and persists to storage
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if(message && message.type === 'set-priority'){
    const word = (message.word || '').trim().toLowerCase();
    const priority = ['low', 'normal', 'high'].includes(message.priority) ? message.priority : 'normal';
    if(!word) return;

    chrome.storage.local.get({vocab: []}, data => {
      const vocab = data.vocab || [];
      vocab.forEach(entry => {
        if((entry.word || '').trim().toLowerCase() === word) entry.priority = priority;
      });
      chrome.storage.local.set({vocab}, () => sendResponse({ok: true}));
    });
    return true;
  }

  if(message && message.type === 'save-reminder'){
    const word = message.word || '';
    const url = message.url || (sender && sender.tab && sender.tab.url) || '';
    const title = message.title || '';
    const pageContent = message.pageContent || '';
    if(!word) {
      return;
    }

    chrome.storage.local.get({vocab: []}, data => {
      const vocab = data.vocab || [];
      const normalizedWord = word.trim().toLowerCase();
      const exists = vocab.find(v => (v.word || '').trim().toLowerCase() === normalizedWord && v.url === url);

      if(exists){
        Object.assign(exists, {
          title,
          pageContent,
          reminder: true,
          usageCount: Math.max(1, Number(exists.usageCount) || 1) + 1,
          priority: exists.priority || 'normal',
          created: Date.now(),
        });
      } else {
        const priorEntry = vocab.find(entry => (entry.word || '').trim().toLowerCase() === normalizedWord);
        vocab.push({
          word,
          url,
          title,
          pageContent,
          reminder: true,
          usageCount: 1,
          priority: priorEntry ? priorEntry.priority || 'normal' : 'normal',
          created: Date.now(),
        });
      }

      chrome.storage.local.set({vocab}, () => {
      });
    });
  }
});
