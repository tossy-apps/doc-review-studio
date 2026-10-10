/**
 * DocReview Studio - オンボーディングガイド モジュール
 * 案A: 左右スプリット型 スタジオオンボーディングUI
 * (左: ステップ手順ナビ / 右: リッチ実演 ＆ ツールバー矢印案内)
 */

(function () {
  'use strict';

  let currentModeIndex = 0; // 0: レビュー作成, 1: AI結果検証, 2: UI/UX便利機能
  let currentStepIndex = 0; // 0, 1, 2
  let activeArrowTimeout = null;

  // ========================================================
  // 1. 左右スプリット用 ガイドデータ定義
  // ========================================================
  const GUIDE_MODES = [
    {
      modeKey: 'review',
      tabLabel: '✨ レビュー作成 (基本3ステップ)',
      navTitle: '基本のレビューサイクル',
      steps: [
        {
          index: 0,
          pill: 'STEP 01',
          title: '📁 原本読込 ＆ 退避バックアップ',
          summary: '作業フォルダを開き、編集前原本を保護',
          heading: '【準備】原本フォルダの読込と退避先バックアップ',
          explanation: '校正したいHTMLやMarkdownの作業フォルダを指定します。同時に退避先フォルダを指定しておくことで、AI編集前の元データを安全保護し、後から左右Diffで比較・復元できます。',
          previewHtml: `
            <div class="anim-box-step1">
              <div class="anim-folder-pulse">📁</div>
              <div class="anim-tree-step1">
                <div class="tree-row"><span>📄</span> index.html</div>
                <div class="tree-row selected"><span>📝</span> spec.md</div>
                <div class="tree-row"><span>📄</span> manual.html</div>
              </div>
            </div>
          `,
          actionItems: [
            {
              id: 'openDirBtn',
              name: '📁 原本フォルダを開く',
              loc: 'ヘッダー左',
              desc: '校正対象のHTML/Markdownフォルダを指定。左ツリーに一括読込します。',
              icon: '📁'
            },
            {
              id: 'openBackupDirBtn',
              name: '📂 退避先を指定',
              loc: 'ヘッダー左',
              desc: 'AI修正前の原本バックアップ先を指定。後から左右Diff比較や復元に活用。',
              icon: '📂'
            }
          ]
        },
        {
          index: 1,
          pill: 'STEP 02',
          title: '📌 選択して指摘作成',
          summary: '本文テキストをドラッグ選択して指示データを蓄積',
          heading: '【レビュー】文章を選択してワンクリックで指摘登録',
          explanation: 'プレビュー上で直したいテキストをドラッグ選択して「指摘リストに追加」を押すだけ。対象行番号・前後の文脈・ファイル名を自動解析し、AIへ渡す指示エビデンスとして記録します。',
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
          `,
          actionItems: [
            {
              id: 'addIssueFromParentBtn',
              name: '📌 指摘リストに追加',
              loc: '中央ツールバー',
              desc: '本文で選択中のテキストを行番号・文脈付きで記録し、AI指示エビデンスにします。',
              icon: '📌'
            },
            {
              id: 'openDetachedModifiedBtn',
              name: '🪟 別窓: 原本',
              loc: '中央ツールバー',
              desc: '作業中の最新原本プレビューを別ウィンドウで開き、サブモニターで常時閲覧。',
              icon: '🪟'
            }
          ]
        },
        {
          index: 2,
          pill: 'STEP 03',
          title: '🤖 AI指示プロンプト生成 ＆ 修正',
          summary: '蓄積した指摘を1クリックでコピーしAIに貼るだけ',
          heading: '【AI連携】プロンプトをクリップボードに即コピー',
          explanation: '蓄積した指摘をAI修正命令文へワンクリック変換。ChatGPTやClaude、Cursor等のチャット欄に貼り付ける（Ctrl+V）だけで修正を依頼できます。左右Diffで結果を検収できます。',
          previewHtml: `
            <div class="anim-box-step3">
              <div class="ai-copy-chip">
                <span>🤖 AI指示プロンプト</span>
                <span style="font-size: 9px; background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 3px;">コピー完了!</span>
              </div>
              <div class="diff-preview-mini">
                <div class="diff-mini-col">
                  <div style="font-size: 9px; color: #94a3b8;">Before</div>
                  <div class="diff-del-row">- 平文で一時保存</div>
                </div>
                <div class="diff-mini-col">
                  <div style="font-size: 9px; color: #94a3b8;">After</div>
                  <div class="diff-add-row">+ 暗号化して保存</div>
                </div>
              </div>
            </div>
          `,
          actionItems: [
            {
              id: 'copyCurrentBtn',
              name: '📄 選択ファイル指示',
              loc: 'ヘッダー中央',
              desc: '開いている文書の指摘のみをプロンプト化してクリップボードにコピー。',
              icon: '📄'
            },
            {
              id: 'copyAllBtn',
              name: '📚 全ファイル指示',
              loc: 'ヘッダー中央',
              desc: 'プロジェクト全ドキュメントの指摘を合算してプロンプトコピー。',
              icon: '📚'
            },
            {
              id: 'toggleDiffBtn',
              name: '🔄 左右差分(Diff)',
              loc: '中央ツールバー',
              desc: 'AI修正前後の差分をWinMerge風に左右並列比較し、誤修正をチェック。',
              icon: '🔄'
            }
          ]
        }
      ]
    },
    {
      modeKey: 'aiCheck',
      tabLabel: '🔍 AI修正結果の検証 (Diff・復元)',
      navTitle: '安心のAI修正検証サイクル',
      steps: [
        {
          index: 0,
          pill: 'STEP 01',
          title: '📂 退避バックアップ原本の確保',
          summary: 'AI編集前に原本を別フォルダへ退避保存',
          heading: '【保護】AI編集前のセーフティネット作成',
          explanation: 'AIにファイルを修正・上書きさせる前に、修正前の原本を別フォルダへ安全バックアップ。いつでも元の状態と比較・復元できるセーフティネットを作ります。',
          previewHtml: `
            <div class="anim-box-step1">
              <div class="anim-folder-pulse" style="animation: folderPulse 1.8s infinite ease-in-out;">📂</div>
              <div class="anim-tree-step1">
                <div class="tree-row"><span>📁</span> backup_original/</div>
                <div class="tree-row selected"><span>🛡️</span> 修正前原本を安全退避</div>
                <div class="tree-row"><span>✅</span> いつでも比較・復元可能</div>
              </div>
            </div>
          `,
          actionItems: [
            {
              id: 'openBackupDirBtn',
              name: '📂 退避先を指定',
              loc: 'ヘッダー左',
              desc: '修正前原本の保存先を指定し、AI修正後の比較・復元用データを確保。',
              icon: '📂'
            }
          ]
        },
        {
          index: 1,
          pill: 'STEP 02',
          title: '🔄 AI修正後の原本を瞬時再読込',
          summary: 'F5不要で即座に最新ファイルを検知',
          heading: '【反映】AIの修正内容を待ち時間ゼロで画面更新',
          explanation: 'AIがファイルを編集・保存した後、画面をF5リロード不要で最新内容に瞬時更新。AIが正しく修正してくれたかを待機時間ゼロで確認できます。',
          previewHtml: `
            <div class="anim-box-step1">
              <div class="anim-folder-pulse" style="animation: folderPulse 1.8s infinite ease-in-out;">🔄</div>
              <div class="anim-tree-step1">
                <div class="tree-row"><span>📄</span> AIが修正完了</div>
                <div class="tree-row selected"><span>⚡</span> F5不要で瞬時再読込</div>
                <div class="tree-row"><span>✅</span> 最新差分を検知</div>
              </div>
            </div>
          `,
          actionItems: [
            {
              id: 'reloadWorkBtn',
              name: '🔄 原本を最新再読込',
              loc: '中央ツールバー',
              desc: 'フォルダ全体の最新状態をF5不要で瞬時再読込します。',
              icon: '🔄'
            },
            {
              id: 'reloadSingleBtn',
              name: '⚡ 単一ファイル再読込',
              loc: '中央ツールバー',
              desc: '開いている1ファイルだけをピンポイントで0秒更新。大規模PJで効果大。',
              icon: '⚡'
            }
          ]
        },
        {
          index: 2,
          pill: 'STEP 03',
          title: '🔄 左右2画面でDiff検証・復元',
          summary: 'WinMerge風の並列比較で誤修正をゼロに',
          heading: '【検収】退避データと修正データを左右並列比較',
          explanation: '「修正前の退避原本」と「AI修正後の原本」をWinMerge風に左右2画面で並列比較。AIによる意図しない行削除や崩れがないかをブロック差分で厳密にチェックします。',
          previewHtml: `
            <div class="anim-box-step3" style="width: 90%;">
              <div class="ai-copy-chip" style="background: linear-gradient(135deg, #0284c7, #2563eb);">
                <span>🔄 WinMerge風 左右比較</span>
              </div>
              <div class="diff-preview-mini">
                <div class="diff-mini-col">
                  <div style="font-size: 10px; color: #94a3b8;">修正前 (退避原本)</div>
                  <div class="diff-del-row">- 脆弱な設定記述</div>
                </div>
                <div class="diff-mini-col">
                  <div style="font-size: 10px; color: #94a3b8;">修正後 (AI作業中)</div>
                  <div class="diff-add-row">+ セキュアな最新記述</div>
                </div>
              </div>
            </div>
          `,
          actionItems: [
            {
              id: 'toggleDiffBtn',
              name: '🔄 左右差分(Diff)',
              loc: '中央ツールバー',
              desc: '左右2画面で退避原本とAI修正原本を並列比較し、ブロック差分を検証。',
              icon: '🔄'
            }
          ]
        }
      ]
    },
    {
      modeKey: 'uiUx',
      tabLabel: '🖥️ 便利UI/UX (別窓・高速化)',
      navTitle: '作業効率を極める便利機能',
      steps: [
        {
          index: 0,
          pill: 'STEP 01',
          title: '🪟 ペイン開閉で閲覧領域を最大化',
          summary: 'ツリーや指摘欄を隠して文書に集中',
          heading: '【表示最大化】ワンタッチでプレビュー領域を拡張',
          explanation: '「Alt+1」でファイルツリー、「Alt+2」で指摘一覧をワンタッチ開閉。長文マニュアルや表組みの閲覧時に、中央のプレビュー領域をディスプレイいっぱいに広げて確認できます。',
          previewHtml: `
            <div class="anim-box-step1">
              <div class="anim-folder-pulse" style="animation: folderPulse 2.2s infinite ease-in-out;">🖥️</div>
              <div class="anim-tree-step1">
                <div class="tree-row"><span>⌨️</span> Alt+1: ツリー開閉</div>
                <div class="tree-row selected"><span>⌨️</span> Alt+2: 指摘欄開閉</div>
                <div class="tree-row"><span>🚀</span> 作業画面を最大化</div>
              </div>
            </div>
          `,
          actionItems: [
            {
              id: 'toggleTreeBtn',
              name: '📁 ファイル開閉 (Alt+1)',
              loc: '中央ツールバー',
              desc: '左のファイルツリーを折りたたんで、中央の閲覧画面を横に広く使います。',
              icon: '📁'
            },
            {
              id: 'toggleIssuesBtn',
              name: '📋 指摘一覧開閉 (Alt+2)',
              loc: '中央ツールバー',
              desc: '右の指摘エビデンス欄を折りたたんで、ドキュメント閲覧に画面を集中。',
              icon: '📋'
            }
          ]
        },
        {
          index: 1,
          pill: 'STEP 02',
          title: '🪟 マルチモニタ独立ウィンドウ表示',
          summary: 'サブディスプレイで原本・退避を常時表示',
          heading: '【2画面作業】プレビューを独立ウィンドウ化',
          explanation: '原本プレビューや修正前プレビューを独立ウィンドウとして分離ポップアップ。サブディスプレイに配置することで、マルチモニター環境での並列作業効率が跳ね上がります。',
          previewHtml: `
            <div class="anim-box-step1">
              <div class="anim-folder-pulse" style="animation: folderPulse 2.2s infinite ease-in-out;">🪟</div>
              <div class="anim-tree-step1">
                <div class="tree-row"><span>🖥️</span> 独立ウィンドウ ポップアップ</div>
                <div class="tree-row selected"><span>✨</span> サブモニターで常時表示</div>
                <div class="tree-row"><span>⚡</span> 2画面並列で作業スピードUP</div>
              </div>
            </div>
          `,
          actionItems: [
            {
              id: 'openDetachedModifiedBtn',
              name: '🪟 別窓: 原本',
              loc: '中央ツールバー',
              desc: '作業中の原本プレビューを別ウィンドウで開き、サブディスプレイで常時閲覧。',
              icon: '🪟'
            },
            {
              id: 'openDetachedBackupBtn',
              name: '🪟 別窓: 修正前',
              loc: '中央ツールバー',
              desc: '退避データ（修正前原本）を別ウィンドウで開き、別画面で常に比較参照。',
              icon: '🪟'
            }
          ]
        },
        {
          index: 2,
          pill: 'STEP 03',
          title: '🔍 高速検索 ＆ 詳細マニュアル',
          summary: '目的文書の即時発見とショートカット確認',
          heading: '【探索・ヘルプ】素早いファイル発見と仕様確認',
          explanation: '大量のドキュメント群から確認したいファイルをインクリメンタル検索。いつでも公式マニュアルから全機能の使い方やキーボードショートカットを確認できます。',
          previewHtml: `
            <div class="anim-box-step1">
              <div class="anim-folder-pulse" style="animation: folderPulse 2.2s infinite ease-in-out;">🔍</div>
              <div class="anim-tree-step1">
                <div class="tree-row"><span>🔍</span> インクリメンタル検索</div>
                <div class="tree-row selected"><span>📖</span> ショートカットキー一覧</div>
                <div class="tree-row"><span>🏠</span> 公式ポータル連携</div>
              </div>
            </div>
          `,
          actionItems: [
            {
              id: 'fileFilterInput',
              name: '🔍 ファイル検索',
              loc: '左サイドバー',
              desc: '確認したいHTML/Markdownをファイル名で瞬時にインクリメンタル検索。',
              icon: '🔍'
            },
            {
              id: 'manualHeaderLink',
              name: '📖 詳細マニュアル',
              loc: 'ヘッダー右',
              desc: '全機能の使い方、便利なショートカットキー一覧を別タブで確認。',
              icon: '📖'
            }
          ]
        }
      ]
    }
  ];

  // ========================================================
  // 2. UI初期化 ＆ レンダリング
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
    targetPin.innerHTML = '<span>👆</span> <span>このボタンです！(クリックで即実行)</span>';
    document.body.appendChild(targetPin);

    // モーダルオーバーレイ & ウィンドウ
    const overlay = document.createElement('div');
    overlay.setAttribute('id', 'guideModalOverlay');
    overlay.classList.add('guide-modal-overlay');

    overlay.innerHTML = `
      <div class="guide-window" id="guideWindow">
        <!-- タイトルバー (ドット ＋ 中央モードタブ ＋ 閉じるボタン) -->
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

          <!-- 中央モード切り替えピルタブ -->
          <div class="guide-mode-tabs" id="guideModeTabs">
            ${GUIDE_MODES.map((m, idx) => `
              <button class="guide-mode-tab ${idx === 0 ? 'active' : ''}" data-mode-idx="${idx}">
                ${m.tabLabel}
              </button>
            `).join('')}
          </div>

          <button class="guide-close-btn" id="guideCloseBtn" title="閉じる (Esc)">✕</button>
        </div>

        <!-- 左右スプリットメインボディ -->
        <div class="guide-split-body">
          <!-- 左ペイン: ステップ一覧ナビゲーション (幅360px) -->
          <div class="guide-left-pane">
            <div class="step-nav-header">
              <span class="step-nav-label" id="stepNavLabel">WORKFLOW STEPS</span>
              <h3 class="step-nav-title" id="stepNavTitle">基本のレビューサイクル</h3>
            </div>

            <!-- ステップリスト -->
            <div class="step-nav-list" id="stepNavList">
              <!-- 動的生成 -->
            </div>

            <!-- 左ペイン下部: クイックリンク & オプション -->
            <div class="guide-left-footer">
              <div class="footer-quick-links">
                <button class="btn-quick-util" id="btnQuickSearch">
                  <span>🔍</span> 検索
                </button>
                <button class="btn-quick-util" id="btnQuickManual">
                  <span>📖</span> マニュアル
                </button>
                <button class="btn-quick-util" id="btnQuickPortal">
                  <span>🏠</span> ポータル
                </button>
              </div>
              <label class="guide-dont-show-row">
                <input type="checkbox" id="chkDontShowGuide">
                <span>次回から起動時に自動表示しない</span>
              </label>
            </div>
          </div>

          <!-- 右ペイン: 実演プレビュー ＆ アクション案内 (残り全幅) -->
          <div class="guide-right-pane">
            <!-- 上部: 大型実演フレーム -->
            <div class="guide-demo-frame">
              <div class="demo-screen-content" id="demoScreenContent">
                <!-- 動的アニメーションHTML -->
              </div>
              <div class="demo-caption-bar">
                <div class="demo-step-heading" id="demoStepHeading">
                  <!-- ステップタイトル -->
                </div>
                <div class="demo-step-explanation" id="demoStepExplanation">
                  <!-- ステップ詳細説明 -->
                </div>
              </div>
            </div>

            <!-- 下部: ツールバー案内アクションステージ -->
            <div class="guide-actions-section">
              <div class="actions-header-row">
                <div class="actions-title">
                  <span>🎯</span> このステップで使用する画面ボタン
                  <span style="font-size: 11.5px; color: #64748b; font-weight: normal; margin-left: 6px;">
                    (クリックでヘッダー等の実物へ矢印案内)
                  </span>
                </div>
              </div>

              <!-- アクションカードグリッド (均等配置) -->
              <div class="action-cards-grid" id="actionCardsGrid">
                <!-- 動的生成 -->
              </div>

              <!-- 下部ナビゲーションバー -->
              <div class="guide-nav-bar">
                <div class="nav-indicators" id="navIndicators">
                  <span class="nav-dot active"></span>
                  <span class="nav-dot"></span>
                  <span class="nav-dot"></span>
                </div>
                <div class="nav-buttons-group">
                  <button class="btn-nav-prev" id="btnNavPrev">◀ 前へ</button>
                  <button class="btn-nav-next" id="btnNavNext">次へ ▶</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    bindGuideEvents();
    renderCurrentState();
  }

  // ========================================================
  // 3. 画面レンダリング処理
  // ========================================================
  function renderCurrentState() {
    const mode = GUIDE_MODES[currentModeIndex];
    if (!mode) return;

    // 1. 上部モードタブのアクティブ更新
    const tabs = document.querySelectorAll('.guide-mode-tab');
    tabs.forEach((tab, idx) => {
      tab.classList.toggle('active', idx === currentModeIndex);
    });

    // 2. 左ペインタイトルの更新
    const titleEl = document.getElementById('stepNavTitle');
    if (titleEl) titleEl.textContent = mode.navTitle;

    // 3. 左ペインのステップリスト生成
    const listEl = document.getElementById('stepNavList');
    if (listEl) {
      listEl.innerHTML = mode.steps.map((step, idx) => `
        <div class="step-nav-item ${idx === currentStepIndex ? 'active' : ''}" data-step-idx="${idx}">
          <span class="step-item-pill">${step.pill}</span>
          <div class="step-item-content">
            <div class="step-item-title">${step.title}</div>
            <div class="step-item-summary">${step.summary}</div>
          </div>
        </div>
      `).join('');

      // ステップクリックイベント付与
      listEl.querySelectorAll('.step-nav-item').forEach(item => {
        item.addEventListener('click', () => {
          const sIdx = parseInt(item.dataset.stepIdx, 10);
          goToStep(sIdx);
        });
      });
    }

    // 4. 右ペインのデモ・実演更新
    const step = mode.steps[currentStepIndex];
    if (!step) return;

    const demoContent = document.getElementById('demoScreenContent');
    const demoHeading = document.getElementById('demoStepHeading');
    const demoDesc = document.getElementById('demoStepExplanation');

    if (demoContent) demoContent.innerHTML = step.previewHtml;
    if (demoHeading) demoHeading.innerHTML = `<span>${step.pill}:</span> ${step.heading}`;
    if (demoDesc) demoDesc.textContent = step.explanation;

    // 5. 右ペインのアクションカード一覧生成
    const gridEl = document.getElementById('actionCardsGrid');
    if (gridEl) {
      const items = step.actionItems || [];
      gridEl.className = `action-cards-grid cols-${Math.min(items.length, 3)}`;

      gridEl.innerHTML = items.map(item => `
        <div class="guide-action-card" data-target-id="${item.id}">
          <div class="action-card-left">
            <div class="action-card-icon">${item.icon}</div>
            <div class="action-card-details">
              <div class="action-card-name-row">
                <span class="action-card-name">${item.name}</span>
                <span class="action-card-loc-tag">${item.loc}</span>
              </div>
              <div class="action-card-desc">${item.desc}</div>
            </div>
          </div>
          <button class="btn-point-guide" data-target-id="${item.id}">
            案内 ➔
          </button>
        </div>
      `).join('');

      // アクションカードクリックで矢印・スポットライト案内
      gridEl.querySelectorAll('.guide-action-card').forEach(card => {
        card.addEventListener('click', (e) => {
          const targetId = card.dataset.targetId;
          if (targetId) pointToElement(targetId, card);
        });
      });
    }

    // 6. ナビゲーションバーの更新
    const indicators = document.getElementById('navIndicators');
    if (indicators) {
      indicators.innerHTML = mode.steps.map((_, idx) => `
        <span class="nav-dot ${idx === currentStepIndex ? 'active' : ''}"></span>
      `).join('');
    }

    const prevBtn = document.getElementById('btnNavPrev');
    const nextBtn = document.getElementById('btnNavNext');

    if (prevBtn) {
      prevBtn.disabled = currentStepIndex === 0;
    }

    if (nextBtn) {
      if (currentStepIndex === mode.steps.length - 1) {
        nextBtn.innerHTML = '完了して閉じる ✓';
        nextBtn.onclick = () => closeGuideModal();
      } else {
        nextBtn.innerHTML = '次へ ▶';
        nextBtn.onclick = () => goToStep(currentStepIndex + 1);
      }
    }
  }

  // ========================================================
  // 4. ステップ・モード遷移
  // ========================================================
  function goToStep(stepIdx) {
    const mode = GUIDE_MODES[currentModeIndex];
    if (!mode || stepIdx < 0 || stepIdx >= mode.steps.length) return;
    currentStepIndex = stepIdx;
    clearHighlight();
    renderCurrentState();
  }

  function switchMode(modeIdx) {
    if (modeIdx < 0 || modeIdx >= GUIDE_MODES.length) return;
    currentModeIndex = modeIdx;
    currentStepIndex = 0;
    clearHighlight();
    renderCurrentState();
  }

  // ========================================================
  // 5. イベントバインド
  // ========================================================
  function bindGuideEvents() {
    const overlay = document.getElementById('guideModalOverlay');
    const closeBtn = document.getElementById('guideCloseBtn');
    const dotClose = document.getElementById('guideDotClose');

    if (closeBtn) closeBtn.onclick = closeGuideModal;
    if (dotClose) dotClose.onclick = closeGuideModal;

    if (overlay) {
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          closeGuideModal();
        }
      };
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('active')) {
        closeGuideModal();
      }
    });

    // モードタブの切り替え
    const modeTabs = document.getElementById('guideModeTabs');
    if (modeTabs) {
      modeTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.guide-mode-tab');
        if (btn) {
          const mIdx = parseInt(btn.dataset.modeIdx, 10);
          switchMode(mIdx);
        }
      });
    }

    // 前へボタン
    const prevBtn = document.getElementById('btnNavPrev');
    if (prevBtn) {
      prevBtn.onclick = () => goToStep(currentStepIndex - 1);
    }

    // 左ペインフッターのユーティリティボタン
    const btnSearch = document.getElementById('btnQuickSearch');
    if (btnSearch) {
      btnSearch.onclick = () => pointToElement('fileFilterInput', btnSearch);
    }

    const btnManual = document.getElementById('btnQuickManual');
    if (btnManual) {
      btnManual.onclick = () => pointToElement('manualHeaderLink', btnManual);
    }

    const btnPortal = document.getElementById('btnQuickPortal');
    if (btnPortal) {
      btnPortal.onclick = () => pointToElement('btnPortalWide', btnPortal);
    }

    // 次回から非表示チェックボックス
    const chk = document.getElementById('chkDontShowGuide');
    if (chk) {
      chk.checked = localStorage.getItem('docReviewStudio_hideGuide') === 'true';
      chk.onchange = () => {
        localStorage.setItem('docReviewStudio_hideGuide', chk.checked ? 'true' : 'false');
      };
    }
  }

  // ========================================================
  // 6. 矢印線 ＆ 本物クローン切り抜き（スポットライト演出）
  // ========================================================
  function pointToElement(targetId, sourceEl) {
    const overlay = document.getElementById('guideModalOverlay');
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

    // 1. スポットライト切り抜き枠に対象ボタンのクローンを配置
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

    // 3. ナビ吹き出し
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
    if (pathEl) pathEl.setAttribute('d', '');
    if (pinEl) pinEl.style.display = 'none';
    if (spotlightBox) {
      spotlightBox.classList.remove('active');
      spotlightBox.innerHTML = '';
    }
  }

  // ========================================================
  // 7. モーダル開閉
  // ========================================================
  function openGuideModal() {
    initGuideUI();
    const overlay = document.getElementById('guideModalOverlay');
    if (overlay) {
      overlay.classList.add('active');
      currentStepIndex = 0;
      clearHighlight();
      renderCurrentState();
    }
  }

  function closeGuideModal() {
    const overlay = document.getElementById('guideModalOverlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
    clearHighlight();
  }

  // ========================================================
  // 8. 外部公開API & 自動起動判定
  // ========================================================
  window.OnboardingGuide = {
    open: openGuideModal,
    close: closeGuideModal,
    pointTo: pointToElement
  };

  // DOMロード後にガイドボタンと接続 ＆ 初回起動時オープン
  document.addEventListener('DOMContentLoaded', () => {
    // ヘッダー等のガイド起動ボタンとの接続
    const triggerBtn = document.getElementById('showGuideBtn') || document.getElementById('openGuideModalBtn') || document.querySelector('.btn-guide-trigger');
    if (triggerBtn) {
      triggerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openGuideModal();
      });
    }

    // 「次回から非表示」がオフなら初回起動時に開く
    const hidePref = localStorage.getItem('docReviewStudio_hideGuide');
    if (hidePref !== 'true') {
      setTimeout(() => {
        openGuideModal();
      }, 450);
    }
  });

})();
