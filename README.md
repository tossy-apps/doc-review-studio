# DocReview Studio

A standalone, client-side HTML & Markdown document review, AI prompt generation, and visual diff inspection studio designed for technical writers, reviewers, and AI-assisted workflows.

ブラウザ単体でローカルのHTMLマニュアルやMarkdownドキュメント（`.md` / `.markdown`）を読み込み、直感的なレビュー指摘の記録、AI修正指示プロンプトの一括自動生成、インライン差分ハイライト、およびWinMerge風の左右ブロック差分検証を行える完全ローカル完結型Webツールです。

---

## 🌟 主な特徴 (Features)

- **完全クライアントサイド実行 (100% Client-Side / Offline Ready)**
  - 外部サーバーへの通信ゼロ。File System Access API を用いてローカルファイルをブラウザ内メモリで直接読み込み・操作。
  - 機密文書や社内マニュアル、未公開技術文書も外部へ漏洩することなく安全に扱えます。
- **HTML & Markdown（.md）の高速レンダリング**
  - HTMLファイルに加え、MarkdownドキュメントもGitHub風スタイルで美しくプレビュー表示。
  - 完全オフラインで動作する内蔵パーサー（`marked.min.js`）を同梱。
- **階層型ファイルツリー & リアルタイムインクリメンタル検索**
  - HTML/Markdownの種別バッジ（HTML / MD）付きファイル一覧。フォルダ開閉対応。
  - 検索ボックスで数千〜数万ファイルの中から目的の文書を瞬時に絞り込み可能。
- **直感的なレビュー & 指摘エビデンス管理**
  - 本文テキストを選択してワンクリックで指摘リストへ登録。
  - **画像・キャプションのレビュー**: 画像クリックまたは右クリックで、画像ファイル名や親セクション情報を自動抽出して指摘化。
  - **ファイル全体の指摘**: ファイル全体への全般的な要望もワンクリックで登録可能。
  - 指摘区分（修正 / 追加 / 削除 / 質問 / 検討中）の指定、指示入力、該当箇所への自動スクロール＆点滅ハイライト。
  - 指摘エビデンスを **JSON** または **Markdownテーブル** としてエクスポート・インポート可能。
- **AIプロンプト一括自動生成**
  - 蓄積した指摘データを、LLM（Claude, Gemini, ChatGPT 等）が迷わず直接コード修正できる形式（対象ファイル、概算行、対象テキスト、前後文脈、指示）に整形してクリップボードへ一発コピー。
- **高精度ビジュアルDiff検証 (Visual Diff Inspector)**
  - **インライン差分ハイライト**: 画面を切り替えることなく、現在の本文プレビュー内に修正箇所（追加・変更）を直接グリーンで色分け表示（`⏭️ 修正後 (Diff)` ボタン）。
  - **WinMerge風 左右ブロック差分検証**: 修正前（退避原本）と修正後（作業フォルダ）を2画面で並列比較。Canvasブリッジラインによる対応箇所の結線とスクロール自動同期。
  - **Google `diff-match-patch` ＋ HTMLトークン字句解析エンジン**: タグ構造を壊しにくく、文節・テキスト単位の変更をピンポイント抽出（不要な要素の誤着色を抑制）。
- **世代管理 & スナップショット (Generations / Snapshots)**
  - 初回原本（v0）の自動保護。作業途中の状態を「📸 セーブ」で新世代（v1, v2...）としてチェックポイント保存可能。
  - 過去の世代ファイルを安全に「📥 別名保存」可能。
- **最近使用したフォルダ履歴 (Recent Workspaces)**
  - 過去に開いた作業フォルダの履歴から、前回の作業状態（選択ファイル、世代、指摘件数）をワンクリックで復元。
- **プロ仕様のIDEライクな操作性**
  - **境界ドラッグリサイズ**: 左ペイン（ファイルツリー）と右ペイン（指摘一覧）の幅をマウスドラッグで自在に伸縮。
  - **ペイン別独立ズーム**: 左ツリー・本文・指摘一覧をそれぞれ独立して拡大縮小（Ctrl+ホイール / Alt+ホイール / ツールバーウィジェット）。画面上部ではブラウザ標準のズームと完全両立。
  - **サイドバー開閉**: `Alt+1`（ファイル一覧）/ `Alt+2`（指摘一覧）で瞬時に作業領域を最大化。
  - **独立別ウィンドウ表示**: マルチディスプレイ向けに原本・修正前を別ウィンドウでポップアップ起動。

---

## 🚀 クイックスタート (Getting Started)

- 🌐 **Webアプリを開く**: [https://tossy-apps.github.io/doc-review-studio/](https://tossy-apps.github.io/doc-review-studio/)
- 📖 **操作マニュアル (HTML)**: [https://tossy-apps.github.io/doc-review-studio/manual.html](https://tossy-apps.github.io/doc-review-studio/manual.html)（または [manual.md](manual.md)）

### 基本利用手順

1. Chromium系ブラウザ（**Google Chrome**, **Microsoft Edge**, **Brave** 等）で `index.html`（または上記Webページ）を開きます。
2. ヘッダーの **「📁 原本を開く」** をクリックし、レビュー対象のHTML / Markdownが入った作業フォルダを選択します。
3. 左ツリーからファイルを選択し、本文プレビュー上で修正したい箇所をドラッグ選択して **「📌 指摘リストに追加」** を押します（画像は右クリックでも追加可能）。
4. 指示内容を入力したら、ヘッダーの **「🤖 選択ファイル指示」** または **「🤖 全ファイル指示」** をクリックしてAIプロンプトをコピーし、LLMに渡して修正させます。
5. AI修正後、**「🔄 原本再読込」**（または開いているファイル単体の **「🔄 ファイル再読込」**）を押すと、即座に最新状態が反映され、**「⏭️ 修正後 (Diff)」** や **「🔄 WinMerge風Diff」** で修正差分を目視検証できます。

> **推奨環境**: Chromium系ブラウザ（Google Chrome, Microsoft Edge, Brave 等）  
> ※ File System Access API の仕様上、Firefox および Safari は現在非対応です。

---

## 📁 ディレクトリ構成

```text
.
├── images/                 # マニュアル用キャプチャ画像
├── index.html              # DocReview Studio 本体 (HTML/CSS/JS 完全統合SPA)
├── diff-match-patch.js     # Google diff-match-patch (LCS差分エンジン・オフライン完結)
├── marked.min.js           # Markdownパース用ライブラリ (オフライン完結)
├── onboarding-guide.js     # スタジオガイド（動的チュートリアルモジュール）
├── onboarding-guide.css    # スタジオガイド用スタイル
├── manual.html             # 詳細操作マニュアル (単体閲覧可能HTML)
├── manual.md               # 詳細操作マニュアル原稿 (Markdown)
├── robots.txt              # クローラー向け設定
├── README.md               # 本ドキュメント
└── LICENSE                 # ライセンスファイル (MIT & サードパーティライセンス)
```

---

## 📜 ライセンス (License)

本ソフトウェアは **MIT License** の下で公開されています。  
詳細は [LICENSE](LICENSE) をご参照ください。

### サードパーティライセンス (Third-Party Licenses)
- **diff-match-patch**: [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0) (Copyright 2018 The diff-match-patch Authors)
- **marked.js**: [MIT License](https://github.com/markedjs/marked/blob/master/LICENSE.md) (Copyright (c) 2018+, MarkedJS)
