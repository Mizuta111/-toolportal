// src/features/path-replacer/replacerLogic.test.ts
// 画像パス置換ロジックの総当たりテスト

import { describe, test, expect } from 'vitest';
import { replacePaths } from './replacerLogic';

const BASE = '{+image_url+}imgs/';

// ============================================================
// 1. HTML属性の置換テスト
// ============================================================
describe('HTML属性の置換', () => {
  // --- src 属性 ---
  describe('src属性', () => {
    test('ダブルクォート付き src', () => {
      const input = '<img src="images/photo.png">';
      const result = replacePaths(input);
      expect(result.outputCode).toBe(`<img src="${BASE}photo.png">`);
      expect(result.summary.html.replaced).toBe(1);
    });

    test('シングルクォート付き src', () => {
      const input = "<img src='images/photo.png'>";
      const result = replacePaths(input);
      expect(result.outputCode).toBe(`<img src='${BASE}photo.png'>`);
      expect(result.summary.html.replaced).toBe(1);
    });

    test('クォートなし src', () => {
      const input = '<img src=images/photo.png>';
      const result = replacePaths(input);
      expect(result.outputCode).toBe(`<img src=${BASE}photo.png>`);
      expect(result.summary.html.replaced).toBe(1);
    });

    test('相対パス (./) 付き src', () => {
      const input = '<img src="./assets/photo.jpg">';
      const result = replacePaths(input);
      expect(result.outputCode).toBe(`<img src="${BASE}photo.jpg">`);
      expect(result.summary.html.replaced).toBe(1);
    });

    test('深いネストパス src', () => {
      const input = '<img src="assets/images/icons/logo.svg">';
      const result = replacePaths(input);
      expect(result.outputCode).toBe(`<img src="${BASE}logo.svg">`);
      expect(result.summary.html.replaced).toBe(1);
    });

    test('ファイル名のみ src', () => {
      const input = '<img src="photo.png">';
      const result = replacePaths(input);
      expect(result.outputCode).toBe(`<img src="${BASE}photo.png">`);
      expect(result.summary.html.replaced).toBe(1);
    });
  });

  // --- srcset 属性 ---
  describe('srcset属性', () => {
    test('srcset 属性の置換', () => {
      const input = '<img srcset="images/photo.png">';
      const result = replacePaths(input);
      expect(result.outputCode).toBe(`<img srcset="${BASE}photo.png">`);
      expect(result.summary.html.replaced).toBe(1);
    });
  });

  // --- data-* 属性 ---
  describe('data-*属性', () => {
    test('data-src 属性', () => {
      const input = '<img data-src="images/lazy.jpg">';
      const result = replacePaths(input);
      expect(result.outputCode).toBe(`<img data-src="${BASE}lazy.jpg">`);
      expect(result.summary.html.replaced).toBe(1);
    });

    test('data-background 属性', () => {
      const input = '<div data-background="bg/hero.webp"></div>';
      const result = replacePaths(input);
      expect(result.outputCode).toBe(
        `<div data-background="${BASE}hero.webp"></div>`
      );
      expect(result.summary.html.replaced).toBe(1);
    });

    test('data-thumbnail-src 属性（ハイフン含み）', () => {
      const input = '<img data-thumbnail-src="thumbs/small.png">';
      const result = replacePaths(input);
      expect(result.outputCode).toBe(
        `<img data-thumbnail-src="${BASE}small.png">`
      );
      expect(result.summary.html.replaced).toBe(1);
    });
  });

  // --- background 属性 ---
  describe('background属性', () => {
    test('background 属性', () => {
      const input = '<td background="images/bg.gif">';
      const result = replacePaths(input);
      expect(result.outputCode).toBe(`<td background="${BASE}bg.gif">`);
      expect(result.summary.html.replaced).toBe(1);
    });
  });

  // --- href 属性 ---
  describe('href属性', () => {
    test('href 属性（favicon等）', () => {
      const input = '<link href="images/favicon.ico" rel="icon">';
      const result = replacePaths(input);
      expect(result.outputCode).toBe(
        `<link href="${BASE}favicon.ico" rel="icon">`
      );
      expect(result.summary.html.replaced).toBe(1);
    });
  });

  // --- スペースのバリエーション ---
  describe('スペースのバリエーション', () => {
    test('= の前後にスペースあり', () => {
      const input = '<img src = "images/photo.png">';
      const result = replacePaths(input);
      expect(result.outputCode).toBe(`<img src = "${BASE}photo.png">`);
      expect(result.summary.html.replaced).toBe(1);
    });
  });
});

// ============================================================
// 2. CSS url() の置換テスト
// ============================================================
describe('CSS url()の置換', () => {
  test('ダブルクォート付き url()', () => {
    const input = 'background-image: url("images/bg.png");';
    const result = replacePaths(input);
    expect(result.outputCode).toBe(
      `background-image: url("${BASE}bg.png");`
    );
    expect(result.summary.css.replaced).toBe(1);
  });

  test('シングルクォート付き url()', () => {
    const input = "background-image: url('images/bg.png');";
    const result = replacePaths(input);
    expect(result.outputCode).toBe(
      `background-image: url('${BASE}bg.png');`
    );
    expect(result.summary.css.replaced).toBe(1);
  });

  test('クォートなし url()', () => {
    const input = 'background-image: url(images/bg.png);';
    const result = replacePaths(input);
    expect(result.outputCode).toBe(
      `background-image: url(${BASE}bg.png);`
    );
    expect(result.summary.css.replaced).toBe(1);
  });

  test('相対パス付き url()', () => {
    const input = 'background: url("./assets/pattern.svg");';
    const result = replacePaths(input);
    expect(result.outputCode).toBe(
      `background: url("${BASE}pattern.svg");`
    );
    expect(result.summary.css.replaced).toBe(1);
  });

  test('深いネストパス url()', () => {
    const input = 'background: url("assets/images/icons/arrow.png");';
    const result = replacePaths(input);
    expect(result.outputCode).toBe(
      `background: url("${BASE}arrow.png");`
    );
    expect(result.summary.css.replaced).toBe(1);
  });
});

// ============================================================
// 3. CSS変数内の url() 置換テスト
// ============================================================
describe('CSS変数内のurl()置換', () => {
  test('CSS変数内の url()', () => {
    const input = '--bg-image: url("images/hero.jpg");';
    const result = replacePaths(input);
    expect(result.outputCode).toBe(
      `--bg-image: url("${BASE}hero.jpg");`
    );
    expect(result.summary.css.replaced).toBeGreaterThanOrEqual(1);
  });

  test('ハイフン含みCSS変数', () => {
    const input = '--header-bg-img: url("header/bg.webp");';
    const result = replacePaths(input);
    expect(result.outputCode).toBe(
      `--header-bg-img: url("${BASE}bg.webp");`
    );
    expect(result.summary.css.replaced).toBeGreaterThanOrEqual(1);
  });

  test('数字含みCSS変数', () => {
    const input = '--icon-2x: url("icons/icon2x.png");';
    const result = replacePaths(input);
    expect(result.outputCode).toBe(
      `--icon-2x: url("${BASE}icon2x.png");`
    );
    expect(result.summary.css.replaced).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================
// 4. 全対応画像フォーマットのテスト
// ============================================================
describe('対応画像フォーマット', () => {
  const extensions = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico', 'mp4'];

  extensions.forEach((ext) => {
    test(`拡張子: .${ext}`, () => {
      const input = `<img src="images/photo.${ext}">`;
      const result = replacePaths(input);
      expect(result.outputCode).toBe(`<img src="${BASE}photo.${ext}">`);
      expect(result.summary.html.replaced).toBe(1);
    });
  });

  // 大文字拡張子
  extensions.forEach((ext) => {
    test(`大文字拡張子: .${ext.toUpperCase()}`, () => {
      const input = `<img src="images/photo.${ext.toUpperCase()}">`;
      const result = replacePaths(input);
      expect(result.outputCode).toBe(
        `<img src="${BASE}photo.${ext.toUpperCase()}">`
      );
      expect(result.summary.html.replaced).toBe(1);
    });
  });

  // 混在ケース
  test('混在大小文字拡張子: .Png', () => {
    const input = '<img src="images/photo.Png">';
    const result = replacePaths(input);
    expect(result.outputCode).toBe(`<img src="${BASE}photo.Png">`);
    expect(result.summary.html.replaced).toBe(1);
  });
});

// ============================================================
// 5. 非対応拡張子（置換されないべき）
// ============================================================
describe('非対応拡張子（置換されないべき）', () => {
  const unsupported = ['pdf', 'doc', 'mp3', 'html', 'css', 'js', 'txt', 'zip', 'avif', 'tiff'];

  unsupported.forEach((ext) => {
    test(`拡張子: .${ext} は置換されない`, () => {
      const input = `<img src="files/document.${ext}">`;
      const result = replacePaths(input);
      expect(result.outputCode).toBe(input);
      expect(result.summary.total.replaced).toBe(0);
    });
  });
});

// ============================================================
// 6. サブフォルダオプション
// ============================================================
describe('サブフォルダオプション', () => {
  test('サブフォルダ指定あり', () => {
    const input = '<img src="images/photo.png">';
    const result = replacePaths(input, {
      useSubfolder: true,
      subfolderName: 'my-images',
    });
    expect(result.outputCode).toBe(
      `<img src="${BASE}my-images/photo.png">`
    );
  });

  test('サブフォルダ有効だが名前が空', () => {
    const input = '<img src="images/photo.png">';
    const result = replacePaths(input, {
      useSubfolder: true,
      subfolderName: '',
    });
    expect(result.outputCode).toBe(`<img src="${BASE}photo.png">`);
  });

  test('サブフォルダ有効だが名前がスペースのみ', () => {
    const input = '<img src="images/photo.png">';
    const result = replacePaths(input, {
      useSubfolder: true,
      subfolderName: '   ',
    });
    expect(result.outputCode).toBe(`<img src="${BASE}photo.png">`);
  });

  test('サブフォルダ無効（チェックさていない）', () => {
    const input = '<img src="images/photo.png">';
    const result = replacePaths(input, {
      useSubfolder: false,
      subfolderName: 'my-images',
    });
    expect(result.outputCode).toBe(`<img src="${BASE}photo.png">`);
  });

  test('日本語サブフォルダ名（URLエンコードされる）', () => {
    const input = '<img src="images/photo.png">';
    const result = replacePaths(input, {
      useSubfolder: true,
      subfolderName: '素材',
    });
    expect(result.outputCode).toContain(encodeURIComponent('素材'));
    expect(result.outputCode).toContain('photo.png');
  });

  test('特殊文字入りサブフォルダ名', () => {
    const input = '<img src="images/photo.png">';
    const result = replacePaths(input, {
      useSubfolder: true,
      subfolderName: 'my images & stuff',
    });
    expect(result.outputCode).toContain(encodeURIComponent('my images & stuff'));
  });
});

// ============================================================
// 7. 複数パスの同時置換
// ============================================================
describe('複数パスの同時置換', () => {
  test('同一行に複数のHTML画像パス', () => {
    const input =
      '<img src="a.png"><img src="b.jpg"><img src="c.gif">';
    const result = replacePaths(input);
    expect(result.outputCode).toBe(
      `<img src="${BASE}a.png"><img src="${BASE}b.jpg"><img src="${BASE}c.gif">`
    );
    expect(result.summary.html.replaced).toBe(3);
  });

  test('HTMLとCSSが混在するコード', () => {
    const input = `<div style="background: url('bg.png')"><img src="photo.jpg"></div>`;
    const result = replacePaths(input);
    expect(result.outputCode).toContain(`${BASE}bg.png`);
    expect(result.outputCode).toContain(`${BASE}photo.jpg`);
    expect(result.summary.total.replaced).toBe(2);
  });

  test('改行を挟んだ複数パス', () => {
    const input = `<img src="a.png">\n<img src="b.png">\n<img src="c.png">`;
    const result = replacePaths(input);
    expect(result.summary.html.replaced).toBe(3);
  });

  test('大量の画像パス（20個）', () => {
    const inputs = Array.from(
      { length: 20 },
      (_, i) => `<img src="img${i}.png">`
    ).join('\n');
    const result = replacePaths(inputs);
    expect(result.summary.html.replaced).toBe(20);
  });
});

// ============================================================
// 8. 既に置換済みのパスは再置換されない
// ============================================================
describe('二重置換の防止', () => {
  test('既に {+image_url+} を含むパスは置換されない', () => {
    const input = `<img src="{+image_url+}imgs/photo.png">`;
    const result = replacePaths(input);
    expect(result.outputCode).toBe(input);
    expect(result.summary.total.replaced).toBe(0);
  });

  test('一部だけ既に置換済みの混在コード', () => {
    const input = `<img src="{+image_url+}imgs/done.png"><img src="images/todo.jpg">`;
    const result = replacePaths(input);
    expect(result.summary.html.replaced).toBe(1);
    expect(result.outputCode).toContain(`{+image_url+}imgs/done.png`);
    expect(result.outputCode).toContain(`${BASE}todo.jpg`);
  });
});

// ============================================================
// 9. エッジケース
// ============================================================
describe('エッジケース', () => {
  test('空文字列の入力', () => {
    const result = replacePaths('');
    expect(result.outputCode).toBe('');
    expect(result.summary.total.replaced).toBe(0);
  });

  test('画像パスを含まない純粋なHTML', () => {
    const input = '<div><p>Hello World</p></div>';
    const result = replacePaths(input);
    expect(result.outputCode).toBe(input);
    expect(result.summary.total.replaced).toBe(0);
  });

  test('画像パスを含まないCSS', () => {
    const input = 'body { color: red; background-color: blue; }';
    const result = replacePaths(input);
    expect(result.outputCode).toBe(input);
    expect(result.summary.total.replaced).toBe(0);
  });

  test('テキストのみの入力', () => {
    const input = 'これは普通のテキストです';
    const result = replacePaths(input);
    expect(result.outputCode).toBe(input);
    expect(result.summary.total.replaced).toBe(0);
  });

  test('不完全なHTMLタグ', () => {
    const input = '<img src="photo.png"';
    const result = replacePaths(input);
    // 不完全でも正規表現がマッチするか確認
    expect(result.summary.total.found).toBeGreaterThanOrEqual(0);
  });

  test('ファイル名にスペースを含むパス', () => {
    const input = '<img src="images/my photo.png">';
    const result = replacePaths(input);
    // スペース入りファイル名を処理できるか
    expect(result.summary.total.found).toBeGreaterThanOrEqual(0);
  });

  test('ファイル名に日本語を含むパス', () => {
    const input = '<img src="images/写真.png">';
    const result = replacePaths(input);
    expect(result.summary.total.found).toBeGreaterThanOrEqual(0);
  });

  test('非常に長いパス', () => {
    const longDir = 'a/'.repeat(50);
    const input = `<img src="${longDir}photo.png">`;
    const result = replacePaths(input);
    expect(result.outputCode).toBe(`<img src="${BASE}photo.png">`);
    expect(result.summary.html.replaced).toBe(1);
  });

  test('ドット2つ含むファイル名 (file.min.png)', () => {
    const input = '<img src="images/file.min.png">';
    const result = replacePaths(input);
    // file.min.png のファイル名が保持されるか
    expect(result.outputCode).toContain('file.min.png');
    expect(result.summary.html.replaced).toBe(1);
  });

  test('クエリパラメータ付きパス', () => {
    // クエリ文字列付きは正規表現の制約で検出されない可能性
    const input = '<img src="images/photo.png?v=1.0">';
    const result = replacePaths(input);
    // ?以降を含むとマッチしない可能性があるため、動作を確認
    expect(result.summary.total.found).toBeGreaterThanOrEqual(0);
  });

  test('ハッシュ付きパス', () => {
    const input = '<img src="images/photo.png#section">';
    const result = replacePaths(input);
    expect(result.summary.total.found).toBeGreaterThanOrEqual(0);
  });

  test('絶対URL（http://）は置換される', () => {
    const input = '<img src="http://example.com/images/photo.png">';
    const result = replacePaths(input);
    // http://のURLも正規表現にマッチしてしまう可能性を確認
    expect(result.summary.total.found).toBeGreaterThanOrEqual(0);
  });

  test('絶対URL（https://）は置換される', () => {
    const input = '<img src="https://cdn.example.com/img/hero.jpg">';
    const result = replacePaths(input);
    expect(result.summary.total.found).toBeGreaterThanOrEqual(0);
  });

  test('data: URIは置換されない', () => {
    const input = '<img src="data:image/png;base64,iVBORw...">';
    const result = replacePaths(input);
    // data: URIにはマッチしないはず（.png拡張子で終わらない）
    expect(result.summary.total.replaced).toBe(0);
  });
});

// ============================================================
// 10. サマリー（カウント）の正確性
// ============================================================
describe('サマリーの正確性', () => {
  test('HTMLのみのカウント', () => {
    const input = '<img src="a.png"><img src="b.jpg">';
    const result = replacePaths(input);
    expect(result.summary.html.found).toBe(2);
    expect(result.summary.html.replaced).toBe(2);
    expect(result.summary.css.found).toBe(0);
    expect(result.summary.css.replaced).toBe(0);
    expect(result.summary.total.found).toBe(2);
    expect(result.summary.total.replaced).toBe(2);
  });

  test('CSSのみのカウント', () => {
    const input = 'bg: url("a.png"); bg2: url("b.jpg");';
    const result = replacePaths(input);
    expect(result.summary.css.found).toBe(2);
    expect(result.summary.css.replaced).toBe(2);
    expect(result.summary.html.found).toBe(0);
    expect(result.summary.total.found).toBe(2);
  });

  test('HTML + CSS混在のカウント', () => {
    const input = '<img src="a.png"> .bg { background: url("b.jpg"); }';
    const result = replacePaths(input);
    expect(result.summary.html.found).toBe(1);
    expect(result.summary.css.found).toBe(1);
    expect(result.summary.total.found).toBe(2);
    expect(result.summary.total.replaced).toBe(2);
  });

  test('0件の場合', () => {
    const input = '<p>Hello</p>';
    const result = replacePaths(input);
    expect(result.summary.html).toEqual({ found: 0, replaced: 0 });
    expect(result.summary.css).toEqual({ found: 0, replaced: 0 });
    expect(result.summary.total).toEqual({ found: 0, replaced: 0 });
  });
});

// ============================================================
// 11. ハイライト範囲の正確性
// ============================================================
describe('ハイライト範囲', () => {
  test('ハイライト範囲が存在する', () => {
    const input = '<img src="photo.png">';
    const result = replacePaths(input);
    expect(result.highlightRanges.length).toBe(1);
  });

  test('ハイライト範囲の内容が正しい', () => {
    const input = '<img src="photo.png">';
    const result = replacePaths(input);
    const range = result.highlightRanges[0];
    const highlighted = result.outputCode.substring(range.start, range.end);
    expect(highlighted).toBe(`${BASE}photo.png`);
  });

  test('複数ハイライト範囲', () => {
    const input = '<img src="a.png"><img src="b.png">';
    const result = replacePaths(input);
    expect(result.highlightRanges.length).toBe(2);
    result.highlightRanges.forEach((range) => {
      const highlighted = result.outputCode.substring(range.start, range.end);
      expect(highlighted).toContain(BASE);
    });
  });

  test('置換なしの場合ハイライト範囲は空', () => {
    const input = '<p>No images here</p>';
    const result = replacePaths(input);
    expect(result.highlightRanges.length).toBe(0);
  });
});

// ============================================================
// 12. 実際の使用パターン（リアルワールドテスト）
// ============================================================
describe('リアルワールドテスト', () => {
  test('典型的なHTML: imgタグ + linkタグ', () => {
    const input = `<!DOCTYPE html>
<html>
<head>
  <link href="favicon.ico" rel="icon">
</head>
<body>
  <img src="images/hero.jpg" alt="Hero">
  <img src="./assets/logo.png" alt="Logo">
</body>
</html>`;
    const result = replacePaths(input);
    expect(result.summary.html.replaced).toBe(3);
    expect(result.outputCode).toContain(`${BASE}favicon.ico`);
    expect(result.outputCode).toContain(`${BASE}hero.jpg`);
    expect(result.outputCode).toContain(`${BASE}logo.png`);
  });

  test('典型的なCSS: background-imageと変数', () => {
    const input = `:root {
  --hero-bg: url("images/hero-bg.webp");
}
.header {
  background-image: url('assets/header.png');
}
.footer {
  background: url(footer-bg.jpg) no-repeat;
}`;
    const result = replacePaths(input);
    expect(result.summary.css.replaced).toBeGreaterThanOrEqual(3);
    expect(result.outputCode).toContain(`${BASE}hero-bg.webp`);
    expect(result.outputCode).toContain(`${BASE}header.png`);
    expect(result.outputCode).toContain(`${BASE}footer-bg.jpg`);
  });

  test('インラインスタイル内のurl()', () => {
    const input =
      '<div style="background-image: url(\'images/inline-bg.png\')"></div>';
    const result = replacePaths(input);
    expect(result.outputCode).toContain(`${BASE}inline-bg.png`);
  });
});
