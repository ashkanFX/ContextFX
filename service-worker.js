// Background service worker: listens for save-word messages and persists to storage
chrome.runtime.onMessage.addListener((message, sender) => {
  if(message && message.type === 'save-word'){
    const word = message.word || '';
    const url = message.url || (sender && sender.tab && sender.tab.url) || '';
    if(!word) return;
    chrome.storage.local.get({vocab: []}, data => {
      const vocab = data.vocab || [];
      const exists = vocab.find(v => v.word === word && v.url === url);
      if(!exists){
        vocab.push({word, url, created: Date.now()});
        chrome.storage.local.set({vocab});
      }
    });
  }
});
