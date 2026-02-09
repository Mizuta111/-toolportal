// src/features/path-replacer/PathReplacer.tsx
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

// Helper to escape HTML entities
const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const PathReplacer: React.FC = () => {
  const [inputCode, setInputCode] = useState<string>('');
  const [outputCode, setOutputCode] = useState<string>('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [useSubfolder, setUseSubfolder] = useState(false);
  const [subfolderName, setSubfolderName] = useState('');
  const [replacementSummary, setReplacementSummary] = useState({
    html: { found: 0, replaced: 0 },
    css: { found: 0, replaced: 0 },
    // js: { found: 0, replaced: 0 }, // JS replacement is pending due to safety concerns
    total: { found: 0, replaced: 0 },
  });
  const [highlightRanges, setHighlightRanges] = useState<{start: number, end: number}[]>([]);

  // Define supported image extensions from regex
  const supportedImageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico'];

  // Regex for HTML attributes (src, srcset, data-*, background, href)
  // Captures: 1: quote, 2: path before extension
  const htmlImagePathRegex = /(?:src|srcset|data-[a-z-]+|background|href)\s*=\s*(['"]?)([^'")\s>]+\.(?:png|jpg|jpeg|gif|svg|webp|bmp|ico))\1/gi;

  // Regex for CSS url() function
  // Captures: 1: path before extension
  const cssImagePathRegex = /url\(['"]?([^'")\s>]+\.(?:png|jpg|jpeg|gif|svg|webp|bmp|ico))['"]?\)/gi;

  // Regex for highlighting replaced paths in the output (now uses the same pattern as target replacement)


  // Helper function to highlight image paths correctly
  // This now takes explicit ranges to highlight
  const highlightCodeWithRanges = useCallback((code: string, ranges: {start: number, end: number}[], highlightClass: string = 'highlight-yellow') => {
    if (!ranges || ranges.length === 0) {
      return escapeHtml(code);
    }

    let resultHtml = '';
    let lastIndex = 0;
    
    // Sort ranges to handle overlaps or ensure correct order, though ideal would be non-overlapping from source.
    const sortedRanges = [...ranges].sort((a, b) => a.start - b.start);

    for (const range of sortedRanges) {
      // Add text before the current range, escaped
      resultHtml += escapeHtml(code.substring(lastIndex, range.start));
      // Add the highlighted text, escaped and wrapped in span
      resultHtml += `<span class="${highlightClass}">${escapeHtml(code.substring(range.start, range.end))}</span>`;
      lastIndex = range.end;
    }
    // Add any remaining text after the last range, escaped
    resultHtml += escapeHtml(code.substring(lastIndex));
    return resultHtml;
  }, []);

  const handleReplacePaths = () => {
    let output = '';
    let currentOutputIndex = 0; // Tracks the index in the *output* string
    const newlyReplacedRanges: {start: number, end: number}[] = [];
    const newlyFoundRanges: {start: number, end: number}[] = [];
    
    let lastInputIndex = 0;
    const allMatches: { index: number; original: string; type: 'html' | 'css'; pathPart: string; quote?: string; }[] = [];

    let tempHtmlFound = 0;
    let tempCssFound = 0;
    // let tempJsFound = 0; // JS parsing is disabled

    // --- 1. Find and categorize all potential image paths ---
    htmlImagePathRegex.lastIndex = 0; // Reset regex for each run
    let match;
    while ((match = htmlImagePathRegex.exec(inputCode)) !== null) {
        const [fullMatch, quote, pathPart] = match;
        tempHtmlFound++;
        newlyFoundRanges.push({ start: match.index, end: match.index + fullMatch.length });
        if (pathPart && !pathPart.includes('{+image_url+}')) { // Only process if not already replaced
            allMatches.push({ index: match.index, original: fullMatch, type: 'html', pathPart, quote });
        }
    }

    cssImagePathRegex.lastIndex = 0; // Reset regex
    while ((match = cssImagePathRegex.exec(inputCode)) !== null) {
        const [fullMatch, pathPart] = match;
        tempCssFound++;
        newlyFoundRanges.push({ start: match.index, end: match.index + fullMatch.length });
        if (pathPart && !pathPart.includes('{+image_url+}')) { // Only process if not already replaced
            allMatches.push({ index: match.index, original: fullMatch, type: 'css', pathPart });
        }
    }

    // Sort matches by index to process them in order
    allMatches.sort((a, b) => a.index - b.index);


    let htmlReplacedCount = 0;
    let cssReplacedCount = 0;

    // --- 2. Build the output string and calculate highlight ranges ---
    const subfolderPath = useSubfolder && subfolderName.trim() !== '' ? `${subfolderName.trim()}/` : '';
    const basePath = `{+image_url+}imgs/${subfolderPath}`;

    for (const matchedItem of allMatches) {
        // Add text before current match
        const prefix = inputCode.substring(lastInputIndex, matchedItem.index);
        output += prefix;
        currentOutputIndex += prefix.length;

        // Perform replacement
        const cleanedPath = matchedItem.pathPart.startsWith('./') ? matchedItem.pathPart.substring(2) : matchedItem.pathPart;
        const finalPath = cleanedPath.split('/').pop();

        let replacedPart = matchedItem.original; // Default to original if something fails
        if (finalPath) { // If a valid filename was extracted
            const newPath = `${basePath}${finalPath}`;
            
            if (matchedItem.type === 'html') {
                htmlReplacedCount++;
                replacedPart = matchedItem.original.replace(matchedItem.pathPart, newPath);
            } else if (matchedItem.type === 'css') {
                cssReplacedCount++;
                replacedPart = `url(${newPath})`;
            }

            const newPathIndex = replacedPart.indexOf(newPath);
            if (newPathIndex !== -1) {
              newlyReplacedRanges.push({ 
                start: currentOutputIndex + newPathIndex, 
                end: currentOutputIndex + newPathIndex + newPath.length 
              });
            }
        }
        
        output += replacedPart;
        currentOutputIndex += replacedPart.length;
        lastInputIndex = matchedItem.index + matchedItem.original.length;
    }

    // Add any remaining text after the last match
    output += inputCode.substring(lastInputIndex);
    
    setOutputCode(output);
    setHighlightRanges(newlyReplacedRanges);

    setReplacementSummary({
      html: { found: tempHtmlFound, replaced: htmlReplacedCount },
      css: { found: tempCssFound, replaced: cssReplacedCount },
      // js: { found: tempJsFound, replaced: 0 }, // JS is counting only
      total: { found: tempHtmlFound + tempCssFound /* + tempJsFound */, replaced: htmlReplacedCount + cssReplacedCount },
    });
  };

  // Memoized highlighted output code for display (character-based highlighting)
  const highlightedOutputHtml = useMemo(() => {
    // The input is a textarea, which cannot render HTML, so we don't highlight it directly.
    // The detected ranges are stored in `inputHighlightRanges` for potential future use 
    // (e.g., if the textarea is replaced with a content-editable div).
    return highlightCodeWithRanges(outputCode, highlightRanges, 'highlight-green'); // Output paths highlighted in green
  }, [outputCode, highlightRanges, highlightCodeWithRanges]);

  // Ensure textareas scroll together
  useEffect(() => {
    const handleScroll = (sourceRef: React.RefObject<HTMLElement | null>, targetRef: React.RefObject<HTMLElement | null>) => {
      if (sourceRef.current && targetRef.current) {
        targetRef.current.scrollTop = sourceRef.current.scrollTop;
      }
    };

    const inputElement = inputRef.current;
    const outputElement = outputRef.current;

    const syncInputScroll = () => handleScroll(inputRef, outputRef);
    const syncOutputScroll = () => handleScroll(outputRef, inputRef);

    if (inputElement) {
      inputElement.addEventListener('scroll', syncInputScroll);
    }
    if (outputElement) {
      outputElement.addEventListener('scroll', syncOutputScroll);
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener('scroll', syncInputScroll);
      }
      if (outputElement) {
        outputElement.removeEventListener('scroll', syncOutputScroll);
      }
    };
  }, [inputRef, outputRef]);

  const handleCopyClick = async () => {
    if (outputCode) {
      try {
        await navigator.clipboard.writeText(outputCode);
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000); // Reset status after 2 seconds
      } catch (err) {
        console.error('クリップボードへのコピーに失敗しました:', err);
        alert('コピーに失敗しました。');
      }
    }
  };


  return (
    <div className="container-wrapper">
      <Link to="/" className="back-to-portal-link">
        &larr; ポータルに戻る
      </Link>
      <h2 className="title">画像パス置換ツール</h2>
      <p className="description">コードをペーストし、画像パスを置換してプレビューします。</p>

      {/* Subfolder Options */}
      <div className="options-container">
        <div className="option-item">
          <input
            type="checkbox"
            id="useSubfolder"
            checked={useSubfolder}
            onChange={(e) => setUseSubfolder(e.target.checked)}
          />
          <label htmlFor="useSubfolder">
            フォルダに画像が格納済みならこれにチェックを入れフォルダ名を入力
          </label>
        </div>
        {useSubfolder && (
          <div className="option-item">
            <input
              type="text"
              id="subfolderName"
              className="subfolder-input"
              value={subfolderName}
              onChange={(e) => setSubfolderName(e.target.value)}
              placeholder="フォルダ名 (例: my-images)"
            />
          </div>
        )}
      </div>

      {/* Supported Image Formats and Warning */}
      <div className="info-box">
        <p>
          <span className="info-label">対応画像形式:</span> {supportedImageExtensions.join(', ').toUpperCase()}
        </p>
        <p className="warning-text">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="warning-icon">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.021 3.373 1.861 3.373h13.171c1.84 0 2.726-1.873 1.86-3.376L13.177 3.73a1.125 1.125 0 00-2.154 0L2.694 16.002zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          このツールはプレビュー用です。変更を適用する前にバックアップを作成し必ずコードレビューを行ってください。
          予期せぬ挙動が発生した場合は、置換結果を破棄し、元のコードを使用してください。元のコードの品質を損なう可能性があります。

        </p>
      </div>

      {/* Replacement Summary Display */}
      <div className="summary-container">
        <p>HTML: {replacementSummary.html.replaced} / {replacementSummary.html.found} 箇所置換</p>
        <p>CSS: {replacementSummary.css.replaced} / {replacementSummary.css.found} 箇所置換</p>
        {/* <p>JS: {replacementSummary.js.replaced} / {replacementSummary.js.found} 箇所置換 (安全のため置換は行いません)</p> */}
        <p>合計: {replacementSummary.total.replaced} / {replacementSummary.total.found} 箇所置換</p>
      </div>

      <div className="code-editors-grid">
        {/* Input Area */}
        <div>
          <label htmlFor="inputCode" className="editor-label">
            変更前コード (ここにペースト)
          </label>
          <textarea
            ref={inputRef}
            id="inputCode"
            className="code-editor"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="ここにコードをペーストしてください..."
            spellCheck="false"
          />
        </div>

        {/* Output Area (with highlighting and copy button) */}
        <div style={{ position: 'relative' }}> {/* New relative container for output editor and button */}
          <label htmlFor="outputCode" className="editor-label">
            画像パス置換済コード (プレビュー)
          </label>
          <div style={{ position: 'relative' }}> {/* Wrapper for editor and button */}
            <div
              ref={outputRef}
              id="outputCode"
              className="code-editor output-editor"
              dangerouslySetInnerHTML={{ __html: highlightedOutputHtml }}
            />
            <button onClick={handleCopyClick} className="copy-button">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="button-icon-small">
                {copyStatus === 'copied' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> // Checkmark icon
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v-2.143a4.935 4.935 0 00-1.843-.714L12 14.25h-1.685a4.935 4.935 0 00-1.843.714V17.25m.063-8.868L12 12.75l-.375-.375M12 21.75a9.75 9.75 0 100-19.5 9.75 9.75 0 000 19.5z" /> // Copy icon
                )}
              </svg>
              {copyStatus === 'copied' ? 'コピーしました！' : 'コピー'}
            </button>
          </div>
        </div>
      </div>

      <div className="button-container">
        <button
          onClick={handleReplacePaths}
          className="replace-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          パスを置換してプレビュー
        </button>
      </div>
    </div>
  );
};

export default PathReplacer;