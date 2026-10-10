/**
 * DocReview Studio - オンボーディングガイド モジュール
 * CapCut風 ステップカルーセル & 矢印ポインター誘導
 * (ユースケース別3大分類・AI合体セル・フェーズ連動カルーセル・UDフォント対応)
 */

(function () {
  'use strict';

  let currentStepIndex = 0;
  let carouselTimer = null;
  let isCarouselPaused = false;
  let activeArrowTimeout = null;
  let currentButtonPage = 0; // 0: レビュー作成, 1: AI結果検証, 2: UI/UX便利機能

  // ========================================================
  // 1. カルーセル 3フェーズ データセット（タブ連動）
  // ========================================================
  const CAROUSEL_SETS = [
    {
      badge: '✨ レビュー作成サイクル',
      title: '3ステップで直感マスター',
      sub: 'マニュアル不要のレビュー作成サイクル (所要時間30秒)',
      steps: [
        {
          index: 0,
          targetId: 'openDirBtn',
          pill: 'STEP 01',
          title: '📁 原本フォルダを開く【レビュー対象の一括読込】',
          desc: '校正したいHTMLやMarkdownが入った作業フォルダを指定します。フォルダ構成が瞬時に左ツリーへ展開され、完全ローカル完結のため社外秘ファイルも安全に読み込めます。',
          previewHtml: `
            <div class="anim-box-step1">
              <div class="anim-folder-pulse">📁</div>
              <div class="anim-tree-step1">
                <div class="tree-row"><span>📄</span> index.html</div>
                <div class="tree-row selected"><span>📝</span> spec.md</div>
                <div class="tree-row"><span>📄</span> manual.html</div>
              </div>
            </div>
          `
        },
        {
          index: 1,
          targetId: 'addIssueFromParentBtn',
          pill: 'STEP 02',
          title: '📌 選択して指摘作成【校正箇所の自動抽出】',
          desc: 'プレビュー内の直したいテキストをドラッグ選択して「指摘リストに追加」を押すだけ。対象行・前後の文脈・ファイル名を自動解析し、AIへ渡す指示エビデンスとして蓄積します。',
          previewHtml: `
            <div class="anim-box-step2">
              <div class="doc-text-sample">
                ユーザー情報は
                <span class="highlight-text-anim">暗号化して保存</span>
                すること。
              </div>
              <svg class="anim-cursor-svg" viewBox="0 0 24 24" fill="none">
                <path d="M4 3L11 20L14 13L21 11L4 3Z" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/>
              </svg>
              <div class="anim-pin-badge">📌 指摘に追加</div>
            </div>
          `
        },
        {
          index: 2,
          targetId: 'copyCurrentBtn',
          pill: 'STEP 03',
          title: '🤖 AI指示プロンプト生成【1クリック修正依頼】',
          desc: '溜まった指摘を、ChatGPTやClaude、Cursor等のAIにそのまま貼り付けられる「精密な修正命令プロンプト」へワンクリック変換。AI指示出しの手間をゼロにします。',
          previewHtml: `
            <div class="anim-box-step3">
              <div class="ai-copy-chip">
                <span>🤖 AI指示プロンプト</span>
                <span style="font-size: 8px; background: rgba(255,255,255,0.2); padding: 1px 4px; border-radius: 2px;">コピー完了!</span>
              </div>
              <div class="diff-preview-mini">
                <div class="diff-mini-col">
                  <div style="font-size: 8px; color: #94a3b8;">Before</div>
                  <div class="diff-del-row">- 平文で一時保存</div>
                </div>
                <div class="diff-mini-col">
                  <div style="font-size: 8px; color: #94a3b8;">After</div>
                  <div class="diff-add-row">+ 暗号化して保存</div>
                </div>
              </div>
            </div>
          `
        }
      ]
    },
    {
      badge: '🔍 AI修正結果の検証サイクル',
      title: 'AI修正結果の検証サイクル',
      sub: '退避バックアップ・原本再読込・左右Diff検証で安心検収 (所要時間30秒)',
      steps: [
        {
          index: 0,
          targetId: 'openBackupDirBtn',
          pill: 'STEP 01',
          title: '📂 退避先を指定【AI作業前の原本バックアップ保護】',
          desc: 'AIにファイルを修正・上書きさせる前に、修正前の原本を別フォルダへ安全バックアップ。いつでも元の状態と比較・復元できるセーフティネットを作ります。',
          previewHtml: `
            <div class="anim-box-step1">
              <div class="anim-folder-pulse" style="animation: folderPulse 1.8s infinite ease-in-out;">📂</div>
              <div class="anim-tree-step1">
                <div class="tree-row"><span>📁</span> backup_original/</div>
                <div class="tree-row selected"><span>🛡️</span> 修正前原本を安全退避</div>
                <div class="tree-row"><span>✅</span> いつでも比較・復元可能</div>
              </div>
            </div>
          `
        },
        {
          index: 1,
          targetId: 'reloadWorkBtn',
          pill: 'STEP 02',
          title: '🔄 原本を最新再読込【AI修正後の即時画面反映】',
          desc: 'AIがファイルを編集・保存した後、画面をF5リロード不要で最新内容に瞬時更新。AIが正しく修正してくれたかを待機時間ゼロで確認できます。',
          previewHtml: `
            <div class="anim-box-step1">
              <div class="anim-folder-pulse" style="animation: folderPulse 1.8s infinite ease-in-out;">🔄</div>
              <div class="anim-tree-step1">
                <div class="tree-row"><span>📄</span> AIが修正完了</div>
                <div class="tree-row selected"><span>⚡</span> F5不要で瞬時再読込</div>
                <div class="tree-row"><span>✅</span> 最新差分を検知</div>
              </div>
            </div>
          `
        },
        {
          index: 2,
          targetId: 'toggleDiffBtn',
          pill: 'STEP 03',
          title: '🔄 左右2画面でDiff検証【AI誤修正の防止・検収比較】',
          desc: '「修正前の退避原本」と「AI修正後の原本」をWinMerge風に左右2画面で並列比較。AIによる意図しない行削除や崩れがないかをブロック差分で厳密にチェックします。',
          previewHtml: `
            <div class="anim-box-step3" style="width: 90%;">
              <div class="ai-copy-chip" style="background: linear-gradient(135deg, #0284c7, #2563eb);">
                <span>🔄 WinMerge風 左右比較</span>
              </div>
              <div class="diff-preview-mini">
                <div class="diff-mini-col">
                  <div style="font-size: 9px; color: #94a3b8;">修正前 (退避原本)</div>
                  <div class="diff-del-row">- 脆弱な設定記述</div>
                </div>
                <div class="diff-mini-col">
                  <div style="font-size: 9px; color: #94a3b8;">修正後 (AI作業中)</div>
                  <div class="diff-add-row">+ セキュアな最新記述</div>
                </div>
              </div>
            </div>
          `
        }
      ]
    },
    {
      badge: '🖥️ 作業効率を極めるUI/UX',
      title: '作業効率を極めるUI/UX機能',
      sub: 'ペイン開閉・別窓プレビュー・高速リロードで快適作業 (所要時間30秒)',
      steps: [
        {
          index: 0,
          targetId: 'toggleFilesBtn',
          pill: 'STEP 01',
          title: '◧ ◨ ペイン開閉【ドキュメント閲覧領域の最大化】',
          desc: '「Alt+1」でファイルツリー、「Alt+2」で指摘一覧をワンタッチ開閉。長文マニュアルや表組みの閲覧時に、中央のプレビュー領域をディスプレイいっぱいに広げて確認できます。',
          previewHtml: `
            <div class="anim-box-step1">
              <div class="anim-folder-pulse" style="font-size: 34px;">🖥️</div>
              <div class="anim-tree-step1">
                <div class="tree-row"><span>◧</span> Alt+1: ツリー開閉</div>
                <div class="tree-row selected"><span>◨</span> Alt+2: 指摘欄開閉</div>
                <div class="tree-row"><span>📐</span> 作業画面を最大化</div>
              </div>
            </div>
          `
        },
        {
          index: 1,
          targetId: 'openDetachedModifiedBtn',
          pill: 'STEP 02',
          title: '🪟 マルチモニタ別窓表示【2画面での快適レビュー】',
          desc: '原本プレビューや修正前プレビューを独立ウィンドウとして分離ポップアップ。サブディスプレイに配置することで、マルチモニター環境での並列作業効率が跳ね上がります。',
          previewHtml: `
            <div class="anim-box-step3" style="width: 88%;">
              <div class="ai-copy-chip" style="background: linear-gradient(135deg, #475569, #1e293b);">
                <span>🪟 独立ウィンドウ ポップアップ</span>
              </div>
              <div style="font-size: 11.5px; color: #cbd5e1; text-align: center; padding: 4px;">
                サブモニターに常時フル画面表示して作業効率アップ！
              </div>
            </div>
          `
        },
        {
          index: 2,
          targetId: 'reloadCurrentFileBtn',
          pill: 'STEP 03',
          title: '🔄 現在ファイルのみ高速更新【大規模プロジェクトの即時同期】',
          desc: 'ファイル数が膨大なプロジェクトでも、今開いている1ファイルだけをピンポイントで0秒再読込。フォルダ全体の走査待ちをなくし、リズムを崩さずレビューを継続できます。',
          previewHtml: `
            <div class="anim-box-step1">
              <div class="anim-folder-pulse">⚡</div>
              <div class="anim-tree-step1">
                <div class="tree-row"><span>📄</span> 大規模プロジェクト対応</div>
                <div class="tree-row selected"><span>⚡</span> 選択中ファイルだけ0秒同期</div>
                <div class="tree-row"><span>🚀</span> 全体走査の待ち時間ゼロ</div>
              </div>
            </div>
          `
        }
      ]
    }
  ];

  // ========================================================
  // 2. ボタン一覧 3大分類データセット
  // ========================================================

  // ①【📝 レビュー・指摘作成】（基本サイクル・合体セル含む）
  const REVIEW_CREATION_ITEMS = [
    {
      id: 'openDirBtn',
      name: '📁 原本フォルダを開く',
      location: 'ヘッダー左',
      desc: '【レビュー対象の一括指定】校正したいHTML/Markdownの作業フォルダを指定。左ツリーに一括展開します。',
      icon: '📁'
    },
    {
      id: 'openBackupDirBtn',
      name: '📂 退避先を指定',
      location: 'ヘッダー左',
      desc: '【AI修正前の原本保護】AI編集前に原本を退避保存。修正後の左右Diff比較や復元に活用します。',
      icon: '📂'
    },
    {
      id: 'addIssueFromParentBtn',
      name: '📌 指摘リストに追加',
      location: '中央ツールバー',
      desc: '【校正指示の登録】本文で選択した文章を行番号・文脈付きで記録し、AI指示エビデンスにします。',
      icon: '📌'
    },
    // ★ 選択指示 & 全指示の合体デュアルセル（2列スパン）
    {
      isDual: true,
      name: '🤖 AI指示プロンプト生成',
      location: 'ヘッダー中央',
      desc: '【クリップボードに即コピー】蓄積した指摘をAI修正命令文へワンクリック変換。ChatGPTやClaude、Cursor等のチャット欄に貼り付ける（Ctrl+V）だけで修正を依頼できます。',
      icon: '🤖',
      left: {
        id: 'copyCurrentBtn',
        title: '📄 選択ファイル指示',
        desc: '開いている文書の指摘のみコピー'
      },
      right: {
        id: 'copyAllBtn',
        title: '📚 全ファイル指示',
        desc: 'プロジェクト全指摘を合算コピー'
      }
    }
  ];

  // ②【🔍 AI修正結果のチェック】（修正後の検収・Diff検証）
  const AI_INSPECTION_ITEMS = [
    {
      id: 'openBackupDirBtn',
      name: '📂 退避先を指定',
      location: 'ヘッダー左',
      desc: '【原本の上書き保護】AIに編集させる前に、修正前の安全な状態を別フォルダへバックアップ退避します。',
      icon: '📂'
    },
    {
      id: 'reloadWorkBtn',
      name: '🔄 原本再読込',
      location: 'ヘッダー左',
      desc: '【最新状態の即時同期】AIがファイルを編集・保存した後、画面をF5リロード不要で最新表示に更新します。',
      icon: '🔄'
    },
    {
      id: 'toggleDiffBtn',
      name: '🔄 Diff検証',
      location: 'ヘッダー右',
      desc: '【AI修正結果の誤り検収】修正前とAI修正後の原本を左右2画面でブロック差分比較し、誤修正や意図しない改変を防ぎます。',
      icon: '🔄'
    },
    {
      id: 'toggleInlineDiffBtn',
      name: '🎨 差分ハイライト',
      location: '中央ツールバー',
      desc: '【本文内の修正行チェック】通常のプレビュー画面上で、修正前と比べて変更・追加された行を直接色付け表示します。',
      icon: '🎨'
    },
    {
      id: 'exportJsonBtn',
      name: '💾 JSON / 📝 MD表',
      location: 'ヘッダー中央',
      desc: '【指摘エビデンスの出力】作成した指摘一覧をJSON（復元用）やMarkdown表（報告用）として外部ファイル保存します。',
      icon: '💾'
    },
    {
      id: 'importJsonBtn',
      name: '📂 指摘JSON読込',
      location: 'ヘッダー中央',
      desc: '【レビュー状態の復元】以前保存した指摘JSONファイルを再読み込みし、前回のレビュー作業を途中から再開します。',
      icon: '📂'
    }
  ];

  // ③【🖥️ UI/UX便利機能】（画面レイアウト・別窓・高速化）
  const UI_UX_ITEMS = [
    {
      id: 'toggleFilesBtn',
      name: '◧ ファイル開閉 (Alt+1)',
      location: '中央ツールバー',
      desc: '【作業領域の拡張】左のファイルツリーを折りたたんで、中央プレビューの閲覧画面を横に広く使います。',
      icon: '◧'
    },
    {
      id: 'toggleLogsBtn',
      name: '◨ 指摘一覧開閉 (Alt+2)',
      location: '中央ツールバー',
      desc: '【プレビューの最大化】右の指摘エビデンス欄を折りたたんで、ドキュメントの閲覧・確認に画面を集中させます。',
      icon: '◨'
    },
    {
      id: 'reloadCurrentFileBtn',
      name: '🔄 単一ファイル再読込',
      location: '中央ツールバー',
      desc: '【待ち時間ゼロの同期】開いている1ファイルだけを高速再読込し、大規模フォルダでも一瞬で最新化します。',
      icon: '🔄'
    },
    // ★ 別窓：原本 ／ 別窓：修正前の合体デュアルセル（2列スパン）
    {
      isDual: true,
      name: '🪟 別窓：原本 ／ 別窓：修正前',
      location: '中央ツールバー',
      desc: '【マルチモニタ独立表示】原本プレビューや修正前プレビューを別ウィンドウとして分離ポップアップ。サブモニターに並べて大画面で並列作業できます。',
      icon: '🪟',
      left: {
        id: 'openDetachedModifiedBtn',
        title: '🪟 別窓: 原本',
        desc: '作業中の最新原本を別窓表示'
      },
      right: {
        id: 'openDetachedBackupBtn',
        title: '🪟 別窓: 修正前',
        desc: '退避データ(ビフォー)を別窓表示'
      }
    },
    {
      id: 'fileFilterInput',
      name: '🔍 ファイル検索',
      location: '左サイドバー',
      desc: '【目的文書の素早い探索】大量のドキュメント群から、確認したいHTML/Markdownをファイル名で瞬時にインクリメンタル検索します。',
      icon: '🔍'
    },
    {
      id: 'manualHeaderLink',
      name: '📖 詳細マニュアル',
      location: 'ヘッダー右',
      desc: '【仕様・操作方法の確認】全機能の詳細な使い方、便利なショートカットキー一覧を別タブで確認します。',
      icon: '📖'
    },
    {
      id: 'btnPortalWide',
      name: '🏠 公式ポータル',
      location: '左上ブランド',
      desc: '【開発ポータル・関連情報】tossy-apps公式ポータルページ（他ツールや最新リリース情報）を開きます。',
      icon: '🏠'
    }
  ];

  // ========================================================
  // 3. UI初期化 & DOM構築
  // ========================================================
  function initGuideUI() {
    if (document.getElementById('guideModalOverlay')) return;

    // SVG矢印レイヤー
    const svgLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgLayer.setAttribute('id', 'guideArrowSvgLayer');
    svgLayer.classList.add('guide-arrow-svg-layer');
    svgLayer.innerHTML = `
      <defs>
        <marker id="startDot" markerWidth="8" markerHeight="8" refX="4" refY="4">
          <circle cx="4" cy="4" r="3.5" fill="#38bdf8" />
        </marker>
        <marker id="arrowHead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M 0 1 L 7 4 L 0 7 z" fill="#38bdf8" />
        </marker>
      </defs>
      <path id="guideArrowPath" class="guide-arrow-path" marker-start="url(#startDot)" marker-end="url(#arrowHead)" d="" />
    `;
    document.body.appendChild(svgLayer);

    // スポットライト切り抜き枠
    const spotlightBox = document.createElement('div');
    spotlightBox.setAttribute('id', 'guideSpotlightBox');
    spotlightBox.classList.add('guide-spotlight-box');
    document.body.appendChild(spotlightBox);

    // ターゲットピン
    const targetPin = document.createElement('div');
    targetPin.setAttribute('id', 'guideTargetPin');
    targetPin.classList.add('guide-target-pin');
    targetPin.style.display = 'none';
    targetPin.innerHTML = '<span>🎯</span> <span id="guidePinText" class="guide-pin-badge-clone">ボタン</span>';
    document.body.appendChild(targetPin);

    // モーダルオーバーレイ & ウィンドウ
    const overlay = document.createElement('div');
    overlay.setAttribute('id', 'guideModalOverlay');
    overlay.classList.add('guide-modal-overlay');

    overlay.innerHTML = `
      <div class="guide-window" id="guideWindow">
        <!-- タイトルバー -->
        <div class="guide-titlebar">
          <div class="guide-title-left">
            <div class="window-dots">
              <span class="window-dot close" id="guideDotClose" title="閉じる"></span>
              <span class="window-dot min"></span>
              <span class="window-dot max"></span>
            </div>
            <div class="guide-window-title">
              <span>💡</span> DocReview Studio スタジオガイド
            </div>
          </div>
          <button class="guide-close-btn" id="guideCloseBtn" title="閉じる (Esc)">✕</button>
        </div>

        <!-- メインボディ (縦スクロールゼロで1画面フィット) -->
        <div class="guide-window-body" id="guideWindowBody">
          <!-- ヘッダータイトル (左右2列レイアウト) -->
          <div class="guide-hero-section">
            <div class="hero-left-box">
              <span class="guide-badge" id="guideHeroBadge">✨ レビュー作成サイクル</span>
              <h2 class="guide-main-heading" id="guideHeroTitle">3ステップで直感マスター</h2>
            </div>
            <p class="guide-sub-heading" id="guideHeroSub">マニュアル不要のレビュー作成サイクル (所要時間30秒)</p>
          </div>

          <!-- カルーセルステージ -->
          <div class="guide-carousel-wrapper" id="guideCarouselWrapper">
            <div class="guide-cards-stage" id="guideCardsStage">
              <!-- JSで動的に3枚を生成 -->
            </div>

            <!-- インジケーター -->
            <div class="carousel-indicators">
              <span class="indicator-dot active" data-index="0"></span>
              <span class="indicator-dot" data-index="1"></span>
              <span class="indicator-dot" data-index="2"></span>
            </div>
          </div>

          <!-- ツールバー機能一覧セクション（3大分類タブ ＆ スライド） -->
          <div class="guide-all-buttons-section">
            <div class="section-header-row">
              <div class="section-title">
                <span>🔍</span> ツールバー機能一覧
                <span style="font-size: 12px; color: #64748b; font-weight: normal; margin-left: 6px;">
                  (クリックでヘッダー等の実物へ矢印案内)
                </span>
              </div>

              <!-- 3大ユースケース分類タブ & スライド切替ボタン -->
              <div style="display: flex; align-items: center; gap: 8px;">
                <div class="btn-category-tabs">
                  <button class="tab-btn active" id="tabCat0Btn">📝 レビュー・指摘作成</button>
                  <button class="tab-btn" id="tabCat1Btn">🔍 AI修正結果のチェック</button>
                  <button class="tab-btn" id="tabCat2Btn">🖥️ UI/UX便利機能</button>
                </div>
                <div class="page-nav-arrows">
                  <button class="page-arrow-btn" id="pagePrevBtn" title="前の分類へ">◀</button>
                  <button class="page-arrow-btn" id="pageNextBtn" title="次の分類へ">▶</button>
                </div>
              </div>
            </div>

            <!-- スクロールスライドステージ (3大分類: 300%) -->
            <div class="button-pages-viewport">
              <div class="button-pages-slider" id="buttonPagesSlider">
                <!-- Page 1: レビュー・指摘作成 -->
                <div class="button-page" id="pageReviewGrid"></div>
                <!-- Page 2: AI検査結果のチェック -->
                <div class="button-page" id="pageAiCheckGrid"></div>
                <!-- Page 3: UI/UX便利機能 -->
                <div class="button-page" id="pageUiUxGrid"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    renderCarouselCards(0);
    renderButtonGrids();
    bindGuideEvents();
  }

  // ========================================================
  // 4. カルーセルカード描画 & ステップ管理
  // ========================================================
  function renderCarouselCards(categoryIdx) {
    const stage = document.getElementById('guideCardsStage');
    const badgeEl = document.getElementById('guideHeroBadge');
    const titleEl = document.getElementById('guideHeroTitle');
    const subEl = document.getElementById('guideHeroSub');
    if (!stage) return;

    const catData = CAROUSEL_SETS[categoryIdx] || CAROUSEL_SETS[0];

    if (badgeEl) badgeEl.innerText = catData.badge;
    if (titleEl) titleEl.innerText = catData.title;
    if (subEl) subEl.innerText = catData.sub;

    stage.innerHTML = catData.steps.map((step, idx) => `
      <div class="carousel-card ${idx === 0 ? 'state-center' : idx === 1 ? 'state-right' : 'state-hidden'}"
           id="cardStep${idx}" data-index="${idx}" data-target-id="${step.targetId}">
        <div class="card-preview-area">
          ${step.previewHtml}
        </div>
        <div class="card-desc-area">
          <div class="card-step-pill">${step.pill}</div>
          <div class="card-step-title">${step.title}</div>
          <div class="card-step-desc">${step.desc}</div>
        </div>
      </div>
    `).join('');

    currentStepIndex = 0;
    updateCarouselIndicators();

    // カードクリックで矢印案内
    stage.querySelectorAll('.carousel-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.index, 10);
        if (idx !== currentStepIndex) {
          goToStep(idx);
        }
        const targetId = card.dataset.targetId;
        if (targetId) pointToElement(targetId, card);
      });
    });
  }

  function goToStep(nextIndex) {
    currentStepIndex = (nextIndex + 3) % 3;

    const cards = [
      document.getElementById('cardStep0'),
      document.getElementById('cardStep1'),
      document.getElementById('cardStep2')
    ];

    cards.forEach((card, idx) => {
      if (!card) return;
      card.className = 'carousel-card';
      if (idx === currentStepIndex) {
        card.classList.add('state-center');
      } else if (idx === (currentStepIndex - 1 + 3) % 3) {
        card.classList.add('state-left');
      } else if (idx === (currentStepIndex + 1) % 3) {
        card.classList.add('state-right');
      } else {
        card.classList.add('state-hidden');
      }
    });

    updateCarouselIndicators();
  }

  function updateCarouselIndicators() {
    const dots = document.querySelectorAll('.indicator-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentStepIndex);
    });
  }

  function startCarouselLoop() {
    stopCarouselLoop();
    carouselTimer = setInterval(() => {
      if (!isCarouselPaused) {
        goToStep(currentStepIndex + 1);
      }
    }, 4500);
  }

  function stopCarouselLoop() {
    if (carouselTimer) {
      clearInterval(carouselTimer);
      carouselTimer = null;
    }
  }

  // ========================================================
  // 5. ボタンカード描画（合体セル対応）
  // ========================================================
  function renderButtonGrids() {
    const page0El = document.getElementById('pageReviewGrid');
    const page1El = document.getElementById('pageAiCheckGrid');
    const page2El = document.getElementById('pageUiUxGrid');

    if (page0El) page0El.innerHTML = REVIEW_CREATION_ITEMS.map(createItemHtml).join('');
    if (page1El) page1El.innerHTML = AI_INSPECTION_ITEMS.map(createItemHtml).join('');
    if (page2El) page2El.innerHTML = UI_UX_ITEMS.map(createItemHtml).join('');
  }

  function createItemHtml(item) {
    // 合体デュアルセルの場合（選択指示 & 全指示 / 別窓 原本 & 修正前）
    if (item.isDual) {
      return `
        <div class="btn-guide-card btn-guide-dual-card">
          <div class="btn-guide-icon">${item.icon}</div>
          <div class="btn-guide-dual-content">
            <div class="dual-header">
              <span class="btn-guide-name">${item.name}</span>
              <span class="btn-guide-location-tag">${item.location}</span>
            </div>
            ${item.desc ? `<div class="dual-desc-text">${item.desc}</div>` : ''}
            <div class="dual-actions-row">
              <div class="dual-action-box" data-target-id="${item.left.id}" title="クリックでヘッダー/ツールバーの実物を案内">
                <div class="dual-action-texts">
                  <div class="dual-action-title">${item.left.title}</div>
                  <div class="dual-action-desc">${item.left.desc}</div>
                </div>
                <button class="dual-pointer-btn">案内 ➔</button>
              </div>
              <div class="dual-action-divider"></div>
              <div class="dual-action-box" data-target-id="${item.right.id}" title="クリックでヘッダー/ツールバーの実物を案内">
                <div class="dual-action-texts">
                  <div class="dual-action-title">${item.right.title}</div>
                  <div class="dual-action-desc">${item.right.desc}</div>
                </div>
                <button class="dual-pointer-btn">案内 ➔</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // 通常のカード
    return `
      <div class="btn-guide-card" data-target-id="${item.id}" title="クリックすると実際の場所を矢印で案内します">
        <div class="btn-guide-icon">${item.icon}</div>
        <div class="btn-guide-info">
          <div class="btn-guide-name">
            ${item.name}
            <span class="btn-guide-location-tag">${item.location}</span>
          </div>
          <div class="btn-guide-desc">${item.desc}</div>
        </div>
        <div class="btn-guide-pointer-btn">案内 ➔</div>
      </div>
    `;
  }

  // ========================================================
  // 6. 分類タブ切替（カルーセルアニメも連動！）
  // ========================================================
  function switchButtonPage(pageIdx) {
    clearHighlight(); // タブ・ページ切替時に前回の矢印とスポットライトを確実にクリア！
    currentButtonPage = (pageIdx + 3) % 3;
    const slider = document.getElementById('buttonPagesSlider');
    const tabs = [
      document.getElementById('tabCat0Btn'),
      document.getElementById('tabCat1Btn'),
      document.getElementById('tabCat2Btn')
    ];

    if (slider) {
      slider.style.transform = `translateX(-${currentButtonPage * 33.3333}%)`;
    }

    tabs.forEach((tab, idx) => {
      if (tab) tab.classList.toggle('active', idx === currentButtonPage);
    });

    // 上部のカルーセルカード群も、そのフェーズの3ステップに即座に更新！
    renderCarouselCards(currentButtonPage);
  }

  // ========================================================
  // 7. イベントバインド
  // ========================================================
  function bindGuideEvents() {
    const overlay = document.getElementById('guideModalOverlay');
    const closeBtn = document.getElementById('guideCloseBtn');
    const dotClose = document.getElementById('guideDotClose');

    if (closeBtn) closeBtn.onclick = closeGuideModal;
    if (dotClose) dotClose.onclick = closeGuideModal;

    if (overlay) {
      overlay.onclick = (e) => {
        if (e.target === overlay) closeGuideModal();
      };
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('active')) {
        closeGuideModal();
      }
    });

    // カルーセルインジケータードット
    const dots = document.querySelectorAll('.indicator-dot');
    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        goToStep(idx);
      });
    });

    // カルーセルホバー中は自動ループ一時停止
    const carouselWrapper = document.getElementById('guideCarouselWrapper');
    if (carouselWrapper) {
      carouselWrapper.addEventListener('mouseenter', () => { isCarouselPaused = true; });
      carouselWrapper.addEventListener('mouseleave', () => { isCarouselPaused = false; });
    }

    // 3大分類タブ切替ボタン
    const tab0 = document.getElementById('tabCat0Btn');
    const tab1 = document.getElementById('tabCat1Btn');
    const tab2 = document.getElementById('tabCat2Btn');
    const pagePrev = document.getElementById('pagePrevBtn');
    const pageNext = document.getElementById('pageNextBtn');

    if (tab0) tab0.onclick = () => switchButtonPage(0);
    if (tab1) tab1.onclick = () => switchButtonPage(1);
    if (tab2) tab2.onclick = () => switchButtonPage(2);
    if (pagePrev) pagePrev.onclick = () => switchButtonPage(currentButtonPage - 1);
    if (pageNext) pageNext.onclick = () => switchButtonPage(currentButtonPage + 1);

    // 通常カードのクリック案内
    const guideCards = document.querySelectorAll('.btn-guide-card:not(.btn-guide-dual-card)');
    guideCards.forEach(card => {
      card.addEventListener('click', () => {
        const targetId = card.dataset.targetId;
        if (targetId) pointToElement(targetId, card);
      });
    });

    // 合体デュアルセルの左右ボックスクリック案内
    const dualBoxes = document.querySelectorAll('.dual-action-box');
    dualBoxes.forEach(box => {
      box.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = box.dataset.targetId;
        if (targetId) pointToElement(targetId, box);
      });
    });
  }

  // ========================================================
  // 8. CapCut風 矢印線 & 本物クローン切り抜き（Cutout）
  // ========================================================
  function pointToElement(targetId, sourceEl) {
    const overlay = document.getElementById('guideModalOverlay');
    // ダイアログが開いていない（非アクティブ）状態では、絶対に矢印を描画しない安全ガード
    if (!overlay || !overlay.classList.contains('active')) {
      clearHighlight();
      return;
    }

    let targetEl = document.getElementById(targetId);
    if (!targetEl) {
      if (targetId === 'manualHeaderLink') {
        targetEl = document.querySelector('header a.btn-manual');
      } else if (targetId === 'btnPortalWide') {
        targetEl = document.querySelector('.btn-portal-wide');
      }
    }
    if (!targetEl) return;

    if (activeArrowTimeout) {
      clearTimeout(activeArrowTimeout);
      activeArrowTimeout = null;
    }
    clearHighlight();

    const svgLayer = document.getElementById('guideArrowSvgLayer');
    const pathEl = document.getElementById('guideArrowPath');
    const pinEl = document.getElementById('guideTargetPin');
    const spotlightBox = document.getElementById('guideSpotlightBox');
    const windowEl = document.getElementById('guideWindow');

    const targetRect = targetEl.getBoundingClientRect();
    const winRect = windowEl ? windowEl.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2 };

    // 1. スポットライト切り抜き枠に対象ボタンのクローンを配置して最前面に完全浮き彫り！
    if (spotlightBox) {
      spotlightBox.innerHTML = '';
      const clone = targetEl.cloneNode(true);
      clone.removeAttribute('id');
      clone.style.margin = '0';
      clone.style.pointerEvents = 'auto';
      clone.style.cursor = 'pointer';
      clone.style.boxShadow = '0 0 20px rgba(56, 189, 248, 0.85)';
      clone.onclick = (e) => {
        e.stopPropagation();
        closeGuideModal();
        targetEl.click();
      };
      spotlightBox.appendChild(clone);

      spotlightBox.style.left = `${Math.round(targetRect.left)}px`;
      spotlightBox.style.top = `${Math.round(targetRect.top)}px`;
      spotlightBox.style.width = `${Math.round(targetRect.width)}px`;
      spotlightBox.style.height = `${Math.round(targetRect.height)}px`;
      spotlightBox.classList.add('active');
    }

    // 2. 矢印線の始点（クリックされたカードからダイレクトに出発）
    let startX, startY;
    if (sourceEl && typeof sourceEl.getBoundingClientRect === 'function') {
      const srcRect = sourceEl.getBoundingClientRect();
      startX = Math.round(srcRect.left + srcRect.width / 2);
      startY = Math.round(srcRect.top + 4);
    } else {
      startX = Math.round(winRect.left + winRect.width / 2);
      startY = Math.round(winRect.top + 20);
    }

    // 矢印の終点（ヘッダーの対象ボタン下端中央）
    const targetCenterX = Math.round(targetRect.left + targetRect.width / 2);
    const endX = targetCenterX;
    const endY = Math.round(targetRect.bottom + 6);

    // ベジェ曲線の制御点（始点カードから上向きにスムーズに弧を描く）
    const midX = Math.round(endX + (startX - endX) * 0.35);
    const midY = Math.round(endY + (startY - endY) * 0.45);

    const pathData = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
    if (pathEl) pathEl.setAttribute('d', pathData);

    // 3. 矢印脇のスマートなナビ吹き出し（ボタンのすぐ下に配置）
    if (pinEl) {
      pinEl.innerHTML = '<span>👆</span> <span>このボタンです！(クリックで即実行)</span>';
      pinEl.style.display = 'flex';
      pinEl.style.left = `${Math.max(10, Math.round(targetCenterX - 110))}px`;
      pinEl.style.top = `${Math.round(endY + 12)}px`;
    }

    if (svgLayer) svgLayer.classList.add('active');

    activeArrowTimeout = setTimeout(() => {
      clearHighlight();
    }, 8000);
  }

  function clearHighlight() {
    if (activeArrowTimeout) {
      clearTimeout(activeArrowTimeout);
      activeArrowTimeout = null;
    }

    const svgLayer = document.getElementById('guideArrowSvgLayer');
    const pathEl = document.getElementById('guideArrowPath');
    const pinEl = document.getElementById('guideTargetPin');
    const spotlightBox = document.getElementById('guideSpotlightBox');

    if (svgLayer) svgLayer.classList.remove('active');
    if (pathEl) pathEl.setAttribute('d', ''); // 矢印のSVGパスを即座にリセット
    if (pinEl) pinEl.style.display = 'none';
    if (spotlightBox) {
      spotlightBox.classList.remove('active');
      spotlightBox.innerHTML = ''; // 残存クローン要素を完全消去
    }

    document.querySelectorAll('.guide-element-highlighted').forEach(el => {
      el.classList.remove('guide-element-highlighted');
    });
  }

  // ========================================================
  // 9. モーダル開閉
  // ========================================================
  function openGuideModal() {
    initGuideUI();
    const overlay = document.getElementById('guideModalOverlay');
    if (overlay) {
      overlay.classList.add('active');
      goToStep(0);
      switchButtonPage(0);
      startCarouselLoop();
    }
  }

  function closeGuideModal() {
    const overlay = document.getElementById('guideModalOverlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
    stopCarouselLoop();
    clearHighlight(); // 矢印・吹き出し・スポットライトを0秒で即座に完全消去
  }

  // 画面リサイズ時も矢印の座標ズレを防ぐためクリア
  window.addEventListener('resize', () => {
    clearHighlight();
  });

  // グローバル公開
  window.DocReviewGuide = {
    open: openGuideModal,
    close: closeGuideModal,
    pointTo: pointToElement,
    switchPage: switchButtonPage
  };

  // 初回自動起動（原本未選択時）
  document.addEventListener('DOMContentLoaded', () => {
    initGuideUI();
    setTimeout(() => {
      const folderLabel = document.getElementById('folderLabel');
      if (folderLabel && folderLabel.innerText.includes('[原本未選択]')) {
        openGuideModal();
      }
    }, 400);
  });

})();
