// src/features/path-replacer/replacerLogic.ts
// PathReplacer.tsx から抽出した置換ロジック（テスト可能な純粋関数）

export interface ReplacementResult {
  outputCode: string;
  highlightRanges: { start: number; end: number }[];
  summary: {
    html: { found: number; replaced: number };
    css: { found: number; replaced: number };
    total: { found: number; replaced: number };
  };
}

export interface ReplacerOptions {
  useSubfolder: boolean;
  subfolderName: string;
}

// Regex for HTML attributes (src, srcset, data-*, background, href)
const htmlImagePathRegex = /(?:src|srcset|data-[a-z-]+|background|href)\s*=\s*(['"]?)([^'")>]+?\.(?:png|jpg|jpeg|gif|svg|webp|bmp|ico|mp4))\1/giu;

// Regex for CSS url() function (also handles url() inside CSS variables)
const cssImagePathRegex = /url\(['"]?([^'")>]+?\.(?:png|jpg|jpeg|gif|svg|webp|bmp|ico|mp4))['"]?\)/giu;

export function replacePaths(
  inputCode: string,
  options: ReplacerOptions = { useSubfolder: false, subfolderName: '' }
): ReplacementResult {
  let output = '';
  let currentOutputIndex = 0;
  const newlyReplacedRanges: { start: number; end: number }[] = [];

  let lastInputIndex = 0;
  const allMatches: {
    index: number;
    original: string;
    type: 'html' | 'css';
    pathPart: string;
    quote?: string;
  }[] = [];

  // --- 1. Find and categorize all potential image paths ---
  htmlImagePathRegex.lastIndex = 0;
  let match;
  while ((match = htmlImagePathRegex.exec(inputCode)) !== null) {
    const [fullMatch, , pathPart] = match;
    if (pathPart && !pathPart.includes('{+image_url+}')) {
      allMatches.push({
        index: match.index,
        original: fullMatch,
        type: 'html',
        pathPart,
      });
    }
  }

  cssImagePathRegex.lastIndex = 0;
  while ((match = cssImagePathRegex.exec(inputCode)) !== null) {
    const [fullMatch, pathPart] = match;
    if (pathPart && !pathPart.includes('{+image_url+}')) {
      allMatches.push({
        index: match.index,
        original: fullMatch,
        type: 'css',
        pathPart,
      });
    }
  }

  // Sort matches by index to process them in order
  allMatches.sort((a, b) => a.index - b.index);

  let htmlReplacedCount = 0;
  let cssReplacedCount = 0;

  // --- 2. Build the output string and calculate highlight ranges ---
  const subfolderNameTrimmed = options.subfolderName.trim();
  const subfolderPath =
    options.useSubfolder && subfolderNameTrimmed !== ''
      ? `${encodeURIComponent(subfolderNameTrimmed)}/`
      : '';
  const basePath = `{+image_url+}imgs/${subfolderPath}`;

  for (const matchedItem of allMatches) {
    const prefix = inputCode.substring(lastInputIndex, matchedItem.index);
    output += prefix;
    currentOutputIndex += prefix.length;

    const cleanedPath = matchedItem.pathPart.startsWith('./')
      ? matchedItem.pathPart.substring(2)
      : matchedItem.pathPart;
    const finalPath = cleanedPath.split('/').pop();

    let replacedPart = matchedItem.original;
    if (finalPath) {
      const newPath = `${basePath}${finalPath}`;

      if (matchedItem.type === 'html') {
        htmlReplacedCount++;
        replacedPart = matchedItem.original.replace(
          matchedItem.pathPart,
          newPath
        );
      } else if (matchedItem.type === 'css') {
        cssReplacedCount++;
        replacedPart = matchedItem.original.replace(
          matchedItem.pathPart,
          newPath
        );
      }

      const newPathIndex = replacedPart.indexOf(newPath);
      if (newPathIndex !== -1) {
        newlyReplacedRanges.push({
          start: currentOutputIndex + newPathIndex,
          end: currentOutputIndex + newPathIndex + newPath.length,
        });
      }
    }

    output += replacedPart;
    currentOutputIndex += replacedPart.length;
    lastInputIndex = matchedItem.index + matchedItem.original.length;
  }

  output += inputCode.substring(lastInputIndex);

  const finalHtmlFound = allMatches.filter(
    (item) => item.type === 'html'
  ).length;
  const finalCssFound = allMatches.filter(
    (item) => item.type === 'css'
  ).length;

  return {
    outputCode: output,
    highlightRanges: newlyReplacedRanges,
    summary: {
      html: { found: finalHtmlFound, replaced: htmlReplacedCount },
      css: { found: finalCssFound, replaced: cssReplacedCount },
      total: {
        found: finalHtmlFound + finalCssFound,
        replaced: htmlReplacedCount + cssReplacedCount,
      },
    },
  };
}
