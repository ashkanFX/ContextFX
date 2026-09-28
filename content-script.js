// Content script: click a word to highlight and save it
(function(){
  // inject minimal styles for highlight
  const style = document.createElement('style');
  style.textContent = `.contextfx-highlight{background:#fff7cc;border-radius:3px;padding:0 2px;box-shadow:0 1px 0 rgba(0,0,0,0.04);cursor:pointer}`;
  document.head && document.head.appendChild(style);

  function getRangeAtPoint(x,y){
    if(document.caretRangeFromPoint) return document.caretRangeFromPoint(x,y);
    if(document.caretPositionFromPoint){
      const pos = document.caretPositionFromPoint(x,y);
      const range = document.createRange();
      range.setStart(pos.offsetNode, pos.offset);
      range.setEnd(pos.offsetNode, pos.offset);
      return range;
    }
    return null;
  }

  function getWordAtPoint(e){
    const range = getRangeAtPoint(e.clientX, e.clientY);
    if(!range || !range.startContainer) return null;
    const node = range.startContainer;
    if(node.nodeType !== Node.TEXT_NODE) return null;
    const text = node.textContent;
    let offset = range.startOffset;
    if(offset<0 || offset>text.length) return null;
    // expand to word boundaries
    let start = offset, end = offset;
    const isWordChar = c => /[A-Za-zÀ-ÖØ-öø-ÿ0-9'-]/.test(c);
    while(start>0 && isWordChar(text[start-1])) start--;
    while(end<text.length && isWordChar(text[end])) end++;
    const word = text.slice(start,end).trim();
    if(!word) return null;
    const wordRange = document.createRange();
    wordRange.setStart(node, start);
    wordRange.setEnd(node, end);
    return {word, range: wordRange};
  }

  function highlightRange(range){
    try{
      const span = document.createElement('span');
      span.className = 'contextfx-highlight';
      range.surroundContents(span);
      return span;
    } catch(e){
      // surroundContents may fail if range splits nodes; fallback to simple mark
      const mark = document.createElement('mark');
      mark.className = 'contextfx-highlight';
      range.deleteContents();
      range.insertNode(mark);
      mark.textContent = range.toString();
      return mark;
    }
  }

  document.addEventListener('click', e => {
    // ignore clicks on inputs or existing highlights
    const tag = e.target && e.target.tagName;
    if(tag && /INPUT|TEXTAREA|BUTTON|SELECT/.test(tag)) return;
    if(e.target && e.target.classList && e.target.classList.contains('contextfx-highlight')) return;

    const info = getWordAtPoint(e);
    if(!info) return;
    const {word, range} = info;
    const el = highlightRange(range);
    if(el){
      // store metadata
      chrome.runtime.sendMessage({type:'save-word', word: word, url: location.href}, () => {});
    }
  }, true);
})();
