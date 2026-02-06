# Tool (Path Replacer)

このプロジェクトは、Web開発における画像パスの置換を支援するためのツールです。特に、HTMLやCSS内の画像パスを一括で、特定のプレフィックスを持つ形式に変換する機能を提供します。

## 主な機能

*   HTML (`src`, `srcset`, `data-*`, `background`, `href`) および CSS (`url()`) 内の画像パスを自動的に検出・置換します。
*   置換されたパスには `{+image_url+}imgs/` のプレフィックスが追加され、オプションでサブフォルダ名を指定できます。
*   置換前後のコードをリアルタイムでプレビューし、変更箇所をハイライト表示します。
*   対応画像形式: PNG, JPG, JPEG, GIF, SVG, WEBP, BMP, ICO

## セットアップ

プロジェクトをローカルで実行するには、以下の手順に従ってください。

1.  リポジトリをクローンします。
    ```bash
    git clone [YOUR_REPOSITORY_URL]
    cd tool
    ```
2.  依存関係をインストールします。
    ```bash
    npm install
    ```

## 開発サーバーの起動

開発モードでアプリケーションを起動します。

```bash
npm run dev
```

アプリケーションは通常 `http://localhost:5173` で利用可能になります。

## ビルド

本番環境向けにプロジェクトをビルドします。

```bash
npm run build
```

ビルドされたファイルは `dist/` ディレクトリに出力されます。

## プレビュー

ビルドされたアプリケーションをローカルでプレビューします。

```bash
npm run preview
```

## 使用技術

*   React
*   TypeScript
*   Vite
*   React Router DOM