// Content script: click a word to highlight and save it
(function(){ // Wrap the script in an IIFE so the code runs in isolation and does not leak variables into the page.
  // inject minimal styles for highlight
  const style = document.createElement('style'); // Create a <style> element to hold the CSS used for highlighting selected words.
  style.textContent = `.contextfx-highlight{background:#fff7cc !important;color:#302a16 !important;border-radius:3px;box-shadow:0 1px 0 rgba(0,0,0,0.04);cursor:pointer}`; // Keep highlighted text readable against the pale yellow background.
  document.head && document.head.appendChild(style); // Insert the style element into the page's <head> if the head exists.

  function getRangeAtPoint(x,y){ // Return the DOM text range at a given screen coordinate.
    if(document.caretRangeFromPoint) return document.caretRangeFromPoint(x,y); // Use the modern browser API when available to get a text range at the click position.
    if(document.caretPositionFromPoint){ // Fallback for browsers that expose caretPositionFromPoint instead of caretRangeFromPoint.
      const pos = document.caretPositionFromPoint(x,y); // Get the text node and caret offset at the clicked point.
      const range = document.createRange(); // Create a Range object to represent the caret position.
      range.setStart(pos.offsetNode, pos.offset); // Start the range at the current caret location.
      range.setEnd(pos.offsetNode, pos.offset); // End the range at the same location so it is a zero-length range.
      return range; // Return the created range.
    }
    return null; // If neither browser API is available, return null.
  }

  function getWordAtPoint(e){ // Find the word located under a click event.
    const range = getRangeAtPoint(e.clientX, e.clientY); // Convert the click coordinates into a text range.
    if(!range || !range.startContainer) return null; // Stop if there is no valid text range.
    const node = range.startContainer; // Get the text node where the caret is located.
    if(node.nodeType !== Node.TEXT_NODE) return null; // Ignore clicks that are not on text content.
    const text = node.textContent; // Read the text inside the node.
    let offset = range.startOffset; // Get the character offset inside the text node.
    if(offset<0 || offset>text.length) return null; // Ignore invalid offsets that are outside the text range.
    // expand to word boundaries
    let start = offset, end = offset; // Start with the click position and expand outward to find the full word.
    const isWordChar = c => /[A-Za-zÀ-ÖØ-öø-ÿ0-9'-]/.test(c); // Define which characters count as part of a word, including accented letters, digits, apostrophes, and hyphens.
    while(start>0 && isWordChar(text[start-1])) start--; // Move left until the previous character is no longer part of the word.
    while(end<text.length && isWordChar(text[end])) end++; // Move right until the next character is no longer part of the word.
    const word = text.slice(start,end).trim(); // Extract the full word and remove leading/trailing spaces.
    if(!word) return null; // If no word was found, stop processing.
    const wordRange = document.createRange(); // Create a range covering the exact word to highlight.
    wordRange.setStart(node, start); // Set the start of the range to the beginning of the word.
    wordRange.setEnd(node, end); // Set the end of the range to the end of the word.
    return {word, range: wordRange}; // Return the selected word and the range representing it.
  }

  function highlightRange(range){ // Wrap a selected text range in a highlighted element.
    try{
      const span = document.createElement('span'); // Create a new <span> element to wrap the selected word.
      span.className = 'contextfx-highlight'; // Apply the CSS class that gives the selected word the highlight look.
      range.surroundContents(span); // Surround the exact selected text with the new span.
      return span; // Return the inserted highlight element.
    } catch(e){
      // surroundContents may fail if range splits nodes; fallback to simple mark
      const mark = document.createElement('mark'); // Create a fallback <mark> element if wrapping the range fails.
      mark.className = 'contextfx-highlight'; // Apply the same highlight style to the fallback element.
      range.deleteContents(); // Remove the original text from the document.
      range.insertNode(mark); // Insert the highlight element at the same location.
      mark.textContent = range.toString(); // Copy the selected text into the inserted mark element.
      return mark; // Return the fallback element.
    }
  }

  document.addEventListener('dblclick', e => { // Save a word as a reminder when it is double-clicked.
    const target = e.target instanceof Element ? e.target : e.target && e.target.parentElement;
    const tag = target && target.tagName; // Get the clicked element's tag name.
    if(tag && /INPUT|TEXTAREA|BUTTON|SELECT/.test(tag)) return; // Ignore interaction with form controls so text input is not affected.
    if(target && (target.closest('a') || target.closest('.contextfx-highlight'))) return; // Ignore link text and words already saved on this page.

    const info = getWordAtPoint(e); // Determine the word under the click.
    if(!info) return; // Stop if no word was detected.
    const {word, range} = info; // Extract the word and its DOM range.
    const el = highlightRange(range); // Highlight the selected word in the page.
    if(el){
      // store metadata
      chrome.runtime.sendMessage({
        type: 'save-reminder',
        word,
        url: location.href,
        title: document.title,
        pageContent: (document.body && document.body.innerText || '').slice(0, 12000),
      }, () => {}); // Save the word and a bounded text snapshot of its page.
    }
  }, true); // Use capture mode so this handler runs before page-level click handlers.
})();
