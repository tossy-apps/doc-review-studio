# DocReview Studio

A standalone, client-side HTML document review and visual diff inspection studio designed for technical writers, reviewers, and AI-assisted workflows.

ブラウザ単体でローカルのHTMLマニュアルやドキュメントを読み込み、レビュー指摘の記録、AI修正指示プロンプトの生成、WinMerge風の左右ブロック差分検証を行える完全クライアントサイド型レビュー環境です。

---

## 🌟 特徴 (Features)

- **完全クライアントサイド実行 (100% Client-Side)**
  - サーバー通信なし。File System Access API を用いてローカルファイルを直接読み込み・退避コピー。
  - 機密文書や社内マニュアルも外部へ送信されることなく安全に扱えます。
- **直感的なレビュー & 指摘エビデンス管理**
  - マニュアル本文のテキストを選択し、ワンクリックで指摘リストへ登録。
  - 指摘区分（修正 / 追加 / 削除 / 質問 / 検討中）の設定、指示入力、該当箇所への自動ジャンプ。
  - レビュー結果を **JSON** または **Markdownテーブル** としてエクスポート・インポート可能。
- **AIプロンプト自動生成**
  - 蓄積した指摘データを、LLM（Gemini, Claude, ChatGPT 等）がそのまま解釈できる形式（対象ファイル、概算行、対象テキスト、文脈、指示）に一括整形してクリップボードへコピー。
- **WinMerge風 左右ブロック差分検証 (Diff Inspector)**
  - 原本と退避フォルダ（修正前）を並列比較。
  - 差分箇所のハイライト表示に加え、中央ブリッジライン（Canvas）による左右の対応ブロック視覚化。
  - スクロール位置の自動同期。
- **IDEライクな操作性**
  - ファイルツリー（左）および指摘一覧（右）の折りたたみトグル（ショートカット: `Alt+1` / `Alt+2`）。
  - マルチディスプレイ向けに原本・修正前をそれぞれ独立した別ウィンドウで起動可能。

---

## 🚀 クイックスタート (Getting Started)

- 🌐 **Webアプリを開く**: [https://tossy-apps.github.io/doc-review-studio/](https://tossy-apps.github.io/doc-review-studio/)
- 📖 **操作マニュアル (HTML)**: [https://tossy-apps.github.io/doc-review-studio/manual.html](https://tossy-apps.github.io/doc-review-studio/manual.html)（または [manual.md](manual.md)）

### 利用手順

1. 上記の GitHub Pages URL（またはローカルの `index.html`）を **Google Chrome** または **Microsoft Edge** で開きます。
2. 上部ヘッダーの **「📁 原本を開く」** をクリックし、レビュー対象のHTMLファイル群が含まれるフォルダを選択します。
3. **「📂 退避先を指定」** をクリックしてバックアップ用フォルダを選択すると、原本の高速ミラー退避（修正前の保持）が行われます。
4. 中央プレビューでテキストを選択し、ツールバーの **「📌 指摘リストに追加」** を押してレビューを進めます。
5. AIによる修正完了後、**「🔄 Diff検証」** または **「🔄 原本再読込」** で変更差分を検証します。

> **推奨環境**: Chromium系ブラウザ（Google Chrome, Microsoft Edge, Brave 等）  
> ※ File System Access API の仕様上、Firefox および Safari は現在非対応です。

---

## 📁 ディレクトリ構成

```text
.
├── images/             # マニュアル用キャプチャ画像
│   ├── 01_main_view.png
│   ├── 02_open_source.png
│   ├── 03_evidence_input.png
│   ├── 04_ai_prompt.png
│   ├── 05_diff_inspector.png
│   └── 06_pane_toggle.png
├── index.html          # DocReview Studio 本体 (GitHub Pages / ローカル実行用)
├── manual.html         # 公開用操作マニュアル (単体閲覧可能HTML)
├── manual.md           # 操作マニュアル原稿 (Markdown)
├── robots.txt          # クローラー向け設定
├── README.md           # 本ドキュメント
└── LICENSE             # ライセンスファイル
```
