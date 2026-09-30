document.addEventListener('DOMContentLoaded', () => {
  const logger = globalThis.ContextFXLogger ? globalThis.ContextFXLogger('popup') : {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
  };

  const totalWordsEl = document.getElementById('totalWords');
  const uniqueWordsEl = document.getElementById('uniqueWords');
  const latestWordEl = document.getElementById('latestWord');
  const recentWordsEl = document.getElementById('recentWords');
  const openOptionsBtn = document.getElementById('openOptions');
  const exportWordsBtn = document.getElementById('exportWords');
  const clearWordsBtn = document.getElementById('clearWords');
  const exportStatusEl = document.getElementById('exportStatus');

  function wrapText(text, maxLength) {
    const words = String(text).split(/\s+/);
    const lines = [];
    let line = '';

    words.forEach(word => {
      while (word.length > maxLength) {
        if (line) {
          lines.push(line);
          line = '';
        }
        lines.push(word.slice(0, maxLength));
        word = word.slice(maxLength);
      }

      if (!word) return;
      if (line && `${line} ${word}`.length > maxLength) {
        lines.push(line);
        line = word;
      } else {
        line = line ? `${line} ${word}` : word;
      }
    });

    if (line) lines.push(line);
    return lines;
  }

  function toWinAnsiHex(text) {
    const specialCharacters = {
      0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84,
      0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88,
      0x2030: 0x89, 0x0160: 0x8A, 0x2039: 0x8B, 0x0152: 0x8C,
      0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92, 0x201C: 0x93,
      0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
      0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B,
      0x0153: 0x9C, 0x017E: 0x9E, 0x0178: 0x9F,
    };

    return Array.from(String(text), character => {
      const codePoint = character.codePointAt(0);
      const byte = specialCharacters[codePoint] ||
        (codePoint >= 0x20 && codePoint <= 0xFF ? codePoint : 0x3F);
      return byte.toString(16).padStart(2, '0');
    }).join('').toUpperCase();
  }

  function buildVocabularyPdf(entries) {
    const lines = [];
    entries.forEach((entry, index) => {
      wrapText(`${index + 1}. ${entry.word || 'Unknown'}`, 78)
        .forEach((text, lineIndex) => lines.push({ text, bold: lineIndex === 0, gap: 0 }));
      if (entry.url) {
        wrapText(`Source: ${entry.url}`, 88).forEach(text => lines.push({ text, bold: false, gap: 0 }));
      }
      if (entry.created) {
        const created = new Date(entry.created);
        if (!Number.isNaN(created.getTime())) {
          lines.push({ text: `Saved: ${created.toLocaleDateString()}`, bold: false, gap: 0 });
        }
      }
      lines.push({ text: '', bold: false, gap: 8 });
    });

    const pageLines = [];
    let page = [];
    let remainingHeight = 660;
    lines.forEach(line => {
      const lineHeight = (line.bold ? 17 : 13) + line.gap;
      if (remainingHeight < lineHeight && page.length) {
        pageLines.push(page);
        page = [];
        remainingHeight = 660;
      }
      page.push(line);
      remainingHeight -= lineHeight;
    });
    if (page.length || !pageLines.length) pageLines.push(page);

    const objects = [];
    const addObject = value => {
      objects.push(value);
      return objects.length;
    };

    addObject('<< /Type /Catalog /Pages 2 0 R >>');
    addObject('');
    const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    const pageIds = [];

    pageLines.forEach((pageContent, pageIndex) => {
      const commands = [
        'BT /F1 20 Tf 50 750 Td <436F6E74657874465820566F636162756C617279> Tj',
        ` /F1 10 Tf 0 -20 Td <${toWinAnsiHex(`${entries.length} words | Exported ${new Date().toLocaleDateString()}`)}> Tj`,
      ];
      let verticalPosition = 695;
      pageContent.forEach(line => {
        if (line.text) {
          commands.push(`/F1 ${line.bold ? 12 : 9} Tf 1 0 0 1 50 ${verticalPosition} Tm <${toWinAnsiHex(line.text)}> Tj`);
        }
        verticalPosition -= (line.bold ? 17 : 13) + line.gap;
      });
      commands.push(`/F1 9 Tf 1 0 0 1 520 30 Tm <${toWinAnsiHex(`Page ${pageIndex + 1} of ${pageLines.length}`)}> Tj ET`);

      const content = commands.join('\n');
      const contentId = addObject(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
      const pageId = addObject(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
      pageIds.push(`${pageId} 0 R`);
    });

    objects[1] = `<< /Type /Pages /Kids [${pageIds.join(' ')}] /Count ${pageIds.length} >>`;
    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    objects.forEach((object, index) => {
      offsets.push(pdf.length);
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });
    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach(offset => {
      pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return pdf;
  }

  function renderPopup(items) {
    const words = Array.isArray(items) ? items : [];
    const latest = [...words].sort((a, b) => (b.created || 0) - (a.created || 0))[0];
    const uniqueSet = new Set(words.map(item => (item.word || '').trim().toLowerCase()).filter(Boolean));

    totalWordsEl.textContent = String(words.length);
    uniqueWordsEl.textContent = String(uniqueSet.size);
    latestWordEl.textContent = latest ? latest.word : '—';
    exportWordsBtn.disabled = words.length === 0;

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
    logger.info('Opening vocabulary page');
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      chrome.tabs.create({ url: '../options.html' });
    }
  });

  exportWordsBtn.addEventListener('click', () => {
    chrome.storage.local.get({ vocab: [] }, result => {
      const words = Array.isArray(result.vocab) ? result.vocab : [];
      if (!words.length) {
        exportStatusEl.textContent = 'No saved words to export';
        return;
      }

      const pdf = buildVocabularyPdf(words);
      const url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `contextfx-vocabulary-${new Date().toISOString().slice(0, 10)}.pdf`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      exportStatusEl.textContent = `${words.length} words exported`;
      logger.info('Vocabulary PDF exported', { count: words.length });
    });
  });

  clearWordsBtn.addEventListener('click', () => {
    logger.warn('Clearing saved words');
    chrome.storage.local.set({ vocab: [] }, () => {
      loadWords();
    });
  });

  logger.info('Popup loaded');
  loadWords();
});
