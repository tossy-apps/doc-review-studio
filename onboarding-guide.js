/**
 * DocReview Studio - オンボーディングガイド モジュール
 * 直感マスター型 スタジオオンボーディングUI
 * (左: 3大ユースケース選択 / 右上: 自動実演アニメ / 右下: 全ボタン一望グリッド)
 */

(function () {
  'use strict';

  let currentCategoryIndex = 0; // 0: レビュー作成, 1: AI結果検証, 2: UI/UX便利機能
  let autoAnimStepIndex = 0;
  let autoAnimTimer = null;
  let activeArrowTimeout = null;

  // ========================================================
  // 1. 3大ユースケース ＆ グループ別機能データ定義
  // ========================================================
  const CATEGORIES = [
    {
      pill: 'STEP 01',
      title: '📝 レビュー・指摘作成',
      summary: '原本読込 ➔ テキスト選択指摘 ➔ AI指示文コピー',
      // 右上の自動ループアニメーションスライド (操作不要で流れる)
      slides: [
        {
          badge: '1/3 原本フォルダ読込 ＆ バックアップ',
          html: `
            <div class="anim-box-step1">
              <div class="anim-folder-pulse">📁</div>
              <div class="anim-tree-step1">
                <div class="tree-row"><span>📄</span> index.html</div>
                <div class="tree-row selected"><span>📝</span> spec.md (レビュー対象)</div>
                <div class="tree-row"><span>🛡️</span> backup_dir/ (退避原本)</div>
              </div>
            </div>
          `
        },
        {
          badge: '2/3 直したい文章を選択して指摘登録',
          html: `
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
          badge: '3/3 AI指示プロンプトをワンクリックコピー',
          html: `
            <div class="anim-box-step3">
              <div class="ai-copy-chip">
                <span>🤖 AI指示プロンプト</span>
                <span style="font-size: 9px; background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 3px;">コピー完了! (Ctrl+VでAIに貼付)</span>
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
          `
        }
      ],
      // 右下に一望表示される機能ボタン群 (グループ別)
      groups: [
        {
          title: '📁 原本フォルダ読込 ＆ バックアップ保護',
          items: [
            {
              id: 'openDirBtn',
              name: '📁 原本を開く',
              loc: 'ヘッダー左',
              desc: '校正対象フォルダを指定。開いたファイルの初期状態（v0）が自動記録され、Diff差分検証の基準になります',
              icon: '📁'
            },
            {
              id: 'createSnapshotBtn',
              name: '📸 セーブ（チェックポイント）',
              loc: 'ヘッダー左',
              desc: 'AI修正が完了した節目に保存。いつでも過去の版（v0, v1...）を選んで差分比較が可能',
              icon: '📸'
            }
          ]
        },
        {
          title: '📌 校正箇所の指定（ドラッグ選択）',
          items: [
            {
              id: 'addIssueFromParentBtn',
              name: '📌 指摘リストに追加',
              loc: '中央ツールバー',
              desc: '選択中の文章を行番号・文脈付きで記録し、AI指示エビデンスにします',
              icon: '📌'
            }
          ]
        },
        {
          title: '🤖 AI指示プロンプト生成',
          items: [
            {
              id: 'copyCurrentBtn',
              name: '📄 選択ファイル指示',
              loc: 'ヘッダー中央',
              desc: '開いている文書の指摘のみをプロンプト化してクリップボードにコピー',
              icon: '📄'
            },
            {
              id: 'copyAllBtn',
              name: '📚 全ファイル指示',
              loc: 'ヘッダー中央',
              desc: 'プロジェクト全ドキュメントの指摘を合算してプロンプトコピー',
              icon: '📚'
            }
          ]
        }
      ]
    },
    {
      pill: 'STEP 02',
      title: '🔍 AI修正結果の検証',
      summary: '左右並列Diff ➔ 原本再読込 ➔ エビデンス保存',
      slides: [
        {
          badge: '1/2 左右2画面でブロック差分検証 (WinMerge風)',
          html: `
            <div class="anim-box-step3" style="width: 90%;">
              <div class="ai-copy-chip" style="background: linear-gradient(135deg, #0284c7, #2563eb);">
                <span>🔄 左右並列ブロック比較</span>
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
          `
        },
        {
          badge: '2/2 AI編集後の原本をF5不要で即時再読込',
          html: `
            <div class="anim-box-step1">
              <div class="anim-folder-pulse" style="animation: folderPulse 1.8s infinite ease-in-out;">🔄</div>
              <div class="anim-tree-step1">
                <div class="tree-row"><span>📄</span> AIが修正完了</div>
                <div class="tree-row selected"><span>⚡</span> F5不要で瞬時再読込</div>
                <div class="tree-row"><span>✅</span> 最新差分を検知</div>
              </div>
            </div>
          `
        }
      ],
      groups: [
        {
          title: '🔄 左右Diff差分検証（修正成果物のブロック比較）',
          items: [
            {
              id: 'toggleDiffBtn',
              name: '🔄 WinMerge風Diff',
              loc: 'ヘッダー右',
              desc: '左右2画面で退避原本とAI修正原本を並列比較し、ブロック差分を検証',
              icon: '🔄'
            },
            {
              id: 'toggleInlineDiffBtn',
              name: '🔄 インラインDiff',
              loc: '中央ツールバー',
              desc: 'プレビュー領域内で退避ファイルと即時並列比較を行います',
              icon: '🔄'
            }
          ]
        },
        {
          title: '🔄 原本の再読込（AI編集後の即時反映）',
          items: [
            {
              id: 'reloadCurrentFileBtn',
              name: '⚡ 単一ファイル再読込',
              loc: '中央ツールバー',
              desc: '開いている1ファイルだけをピンポイントで0秒更新。大規模PJで効果大',
              icon: '⚡'
            },
            {
              id: 'reloadWorkBtn',
              name: '🔄 原本を最新再読込',
              loc: 'ヘッダー左',
              desc: 'フォルダ全体の最新状態をF5不要で瞬時再読込します',
              icon: '🔄'
            }
          ]
        },
        {
          title: '💾 指摘エビデンスの保存 ＆ 復元',
          items: [
            {
              id: 'exportJsonBtn',
              name: '💾 指摘JSON保存',
              loc: 'ヘッダー中央',
              desc: '指摘データをJSONファイルとしてエクスポート保存します',
              icon: '💾'
            },
            {
              id: 'exportMdBtn',
              name: '📝 MD表保存',
              loc: 'ヘッダー中央',
              desc: '指摘一覧をMarkdownテーブル表として出力・報告用保存します',
              icon: '📝'
            }
          ]
        }
      ]
    },
    {
      pill: 'STEP 03',
      title: '🖥️ UI/UX便利機能',
      summary: '別窓プレビュー ➔ ペイン開閉 ➔ マニュアル・ポータル',
      slides: [
        {
          badge: '1/2 サブモニターで原本プレビューを常時表示',
          html: `
            <div class="anim-box-step1">
              <div class="anim-folder-pulse" style="animation: folderPulse 2.2s infinite ease-in-out;">🪟</div>
              <div class="anim-tree-step1">
                <div class="tree-row"><span>🖥️</span> 独立ウィンドウ ポップアップ</div>
                <div class="tree-row selected"><span>✨</span> サブモニターで常時表示</div>
                <div class="tree-row"><span>⚡</span> 2画面並列で作業スピードUP</div>
              </div>
            </div>
          `
        },
        {
          badge: '2/2 ワンタッチで作業領域を最大化 (Alt+1 / Alt+2)',
          html: `
            <div class="anim-box-step1">
              <div class="anim-folder-pulse" style="animation: folderPulse 2.2s infinite ease-in-out;">🖥️</div>
              <div class="anim-tree-step1">
                <div class="tree-row"><span>⌨️</span> Alt+1: ツリー開閉</div>
                <div class="tree-row selected"><span>⌨️</span> Alt+2: 指摘欄開閉</div>
                <div class="tree-row"><span>🚀</span> 作業画面を最大化</div>
              </div>
            </div>
          `
        }
      ],
      groups: [
        {
          title: '🪟 マルチモニタ独立ウィンドウ表示',
          items: [
            {
              id: 'openDetachedBackupBtn',
              name: '🪟 修正前',
              loc: 'ヘッダー右',
              desc: '退避データ（修正前原本）を別ウィンドウで開き、別画面で常に比較参照',
              icon: '🪟'
            },
            {
              id: 'openDetachedModifiedBtn',
              name: '🪟 原本',
              loc: 'ヘッダー右',
              desc: '作業中の原本プレビューを別ウィンドウで開き、サブディスプレイで常時閲覧',
              icon: '🪟'
            }
          ]
        },
        {
          title: '🪟 ペイン開閉（プレビュー最大化）',
          items: [
            {
              id: 'toggleFilesBtn',
              name: '◧ ファイル開閉 (Alt+1)',
              loc: '中央ツールバー',
              desc: '左のファイルツリーを折りたたんで、中央の閲覧画面を横に広く使います',
              icon: '📁'
            },
            {
              id: 'toggleLogsBtn',
              name: '◨ 指摘一覧開閉 (Alt+2)',
              loc: '中央ツールバー',
              desc: '右の指摘エビデンス欄を折りたたんで、ドキュメント閲覧に画面を集中',
              icon: '📋'
            }
          ]
        },
        {
          title: '📖 マニュアル・ポータル ＆ 姉妹ツール',
          items: [
            {
              id: 'manualHeaderLink',
              name: '📖 詳細マニュアル',
              loc: '左下フッター',
              desc: '全機能の使い方、便利なショートカットキー一覧を別タブで確認',
              icon: '📖'
            },
            {
              id: 'btnPortalWide',
              name: '🏠 公式ポータル',
              loc: '左サイドバー',
              desc: 'tossy-apps公式ポータル（他ツールや最新リリース情報）を開きます',
              icon: '🏠'
            },
            {
              id: 'btnQuickKensaku',
              name: '📊 Excel検索: けんさくくん',
              loc: 'ヘッダー右端 / 左下フッター',
              desc: '大量の神Excel・方眼紙仕様書を爆速インメモリ検索するWindows専用ツール（30日無料試用版あり）',
              icon: '📊'
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
        <!-- タイトルバー (上部タブ完全撤去・シンプル化) -->
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

        <!-- 左右スプリットメインボディ -->
        <div class="guide-split-body">
          <!-- 左ペイン: 3大ユースケース選択メニュー (幅320px) -->
          <div class="guide-left-pane">
            <div class="step-nav-header">
              <span class="step-nav-label">WORKFLOW</span>
              <h3 class="step-nav-title">基本操作ステップ</h3>
            </div>

            <!-- 3つの大分類ステップカード -->
            <div class="step-nav-list" id="categoryNavList">
              ${CATEGORIES.map((cat, idx) => `
                <div class="step-nav-item ${idx === 0 ? 'active' : ''}" data-cat-idx="${idx}">
                  <span class="step-item-pill">${cat.pill}</span>
                  <div class="step-item-content">
                    <div class="step-item-title">${cat.title}</div>
                    <div class="step-item-summary">${cat.summary}</div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- 左ペイン下部: 次回非表示 ＆ マニュアルリンク -->
            <div class="guide-left-footer">
              <div class="footer-quick-links">
                <a href="./manual.html" target="_blank" class="btn-quick-util" id="btnQuickManual">
                  <span>📖</span> マニュアル
                </a>
                <a href="https://tossy-apps.github.io/" target="_blank" class="btn-quick-util" id="btnQuickPortal">
                  <span>🏠</span> ポータル
                </a>
                <a href="https://tossy-apps.github.io/kensaku-kun/" target="_blank" rel="noopener noreferrer" class="btn-quick-util btn-quick-kensaku" id="btnQuickKensaku" title="神Excel・方眼紙仕様書を爆速インメモリ全文検索するWindows専用ツール「けんさくくん」（30日無料試用版あり）">
                  <span>📊</span> けんさくくん ↗
                </a>
              </div>
              <label class="guide-dont-show-row" title="チェックを入れると次回ページを開いた時にこのガイドが自動で開かなくなります（ヘッダー右上の💡ガイドからいつでも再開できます）">
                <input type="checkbox" id="chkDontShowGuide">
                <span>次回から起動時に自動表示しない</span>
              </label>
            </div>
          </div>

          <!-- 右ペイン: 自動実演アニメ ＆ 全ボタン一望グリッド -->
          <div class="guide-right-pane" id="guideRightPane">
            <!-- 上部: 操作不要の自動スクロールアニメーションフレーム -->
            <div class="guide-demo-frame">
              <div class="demo-screen-content" id="demoScreenContent">
                <!-- 自動ループアニメーションHTML -->
              </div>
              <div class="demo-caption-bar">
                <div class="demo-step-heading" id="demoStepHeading">
                  <!-- スライド見出し -->
                </div>
                <span class="demo-auto-badge">⚡ 自動実演中 (操作不要)</span>
              </div>
            </div>

            <!-- 下部: ツールバー機能ボタン群 (グループ別・一望できる) -->
            <div class="guide-actions-section" id="guideActionsSection">
              <!-- グループ化された機能ボタン一覧を動的生成 -->
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    bindGuideEvents();
    renderCategory(0);
  }

  // ========================================================
  // 3. カテゴリ切り替え ＆ レンダリング
  // ========================================================
  function renderCategory(catIdx) {
    currentCategoryIndex = catIdx;
    const cat = CATEGORIES[currentCategoryIndex];
    if (!cat) return;

    // 1. 左メニューのアクティブ更新
    const navItems = document.querySelectorAll('#categoryNavList .step-nav-item');
    navItems.forEach((item, idx) => {
      item.classList.toggle('active', idx === currentCategoryIndex);
    });

    // 2. 右上の自動アニメーション初期化 & 開始
    autoAnimStepIndex = 0;
    startAutoAnimation();

    // 3. 右下のグループ別ボタン一覧生成 (いちいち切り替え不要で一望できる！)
    const sectionEl = document.getElementById('guideActionsSection');
    if (sectionEl) {
      sectionEl.innerHTML = cat.groups.map(group => `
        <div class="action-group-box">
          <div class="action-group-header">
            <span>🔹</span> ${group.title}
          </div>
          <div class="action-group-grid">
            ${group.items.map(item => `
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
            `).join('')}
          </div>
        </div>
      `).join('');

      // 各カードをクリックしたらヘッダーの実物ボタンへ矢印案内
      sectionEl.querySelectorAll('.guide-action-card').forEach(card => {
        card.addEventListener('click', (e) => {
          e.stopPropagation();
          const targetId = card.dataset.targetId;
          if (targetId) pointToElement(targetId, card);
        });
      });
    }
  }

  // ========================================================
  // 4. 操作不要の自動スクロール実演アニメーション
  // ========================================================
  function startAutoAnimation() {
    if (autoAnimTimer) {
      clearInterval(autoAnimTimer);
      autoAnimTimer = null;
    }

    renderCurrentSlide();

    autoAnimTimer = setInterval(() => {
      const cat = CATEGORIES[currentCategoryIndex];
      if (!cat || !cat.slides.length) return;
      autoAnimStepIndex = (autoAnimStepIndex + 1) % cat.slides.length;
      renderCurrentSlide();
    }, 3800);
  }

  function renderCurrentSlide() {
    const cat = CATEGORIES[currentCategoryIndex];
    if (!cat || !cat.slides.length) return;

    const slide = cat.slides[autoAnimStepIndex];
    const demoContent = document.getElementById('demoScreenContent');
    const demoHeading = document.getElementById('demoStepHeading');

    if (demoContent && slide) {
      demoContent.innerHTML = slide.html;
    }
    if (demoHeading && slide) {
      demoHeading.innerHTML = `<span>▶</span> ${slide.badge}`;
    }
  }

  function stopAutoAnimation() {
    if (autoAnimTimer) {
      clearInterval(autoAnimTimer);
      autoAnimTimer = null;
    }
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

    // 左ペインのカテゴリーカード選択
    const navItems = document.querySelectorAll('#categoryNavList .step-nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const catIdx = parseInt(item.dataset.catIdx, 10);
        clearHighlight();
        renderCategory(catIdx);
      });
    });

    // 次回から非表示チェックボックス (localStorageに保存)
    const chk = document.getElementById('chkDontShowGuide');
    if (chk) {
      chk.checked = localStorage.getItem('docReviewStudio_hideGuide') === 'true';
      chk.onchange = () => {
        localStorage.setItem('docReviewStudio_hideGuide', chk.checked ? 'true' : 'false');
      };
    }
  }

  // ========================================================
  // 6. 矢印線 ＆ 本物クローン切り抜き（前版仕様・ダイアログ暗転ゼロ）
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
        targetEl = document.getElementById('sidebarManualLink') || document.querySelector('.manual-link-box') || document.querySelector('header a.btn-manual');
      } else if (targetId === 'btnPortalWide') {
        targetEl = document.querySelector('.btn-portal-wide');
      }
    }
    if (!targetEl) return;

    // 非表示要素の場合は一時的にインライン表示して正確な配置座標を計算できるようにする
    if (window.getComputedStyle(targetEl).display === 'none') {
      targetEl.style.display = 'inline-flex';
    }

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
    const winRect = windowEl ? windowEl.getBoundingClientRect() : { left: window.innerWidth / 2, top: 104 };

    // 1. スポットライト枠に対象ボタンのクローンを配置して最前面パルス発光
    if (spotlightBox) {
      spotlightBox.innerHTML = '';
      const clone = targetEl.cloneNode(true);
      clone.removeAttribute('id');
      clone.style.margin = '0';
      clone.style.pointerEvents = 'auto';
      clone.style.cursor = 'pointer';
      clone.style.boxShadow = '0 0 20px rgba(56, 189, 248, 0.95)';
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

    // 矢印の終点（対象ボタン下端中央）
    const targetCenterX = Math.round(targetRect.left + targetRect.width / 2);
    const endX = targetCenterX;
    const endY = Math.round(targetRect.bottom + 4);

    // ベジェ曲線の制御点（始点カードから上向きにスムーズに弧を描く）
    const midX = Math.round(endX + (startX - endX) * 0.35);
    const midY = Math.round(endY + (startY - endY) * 0.45);

    const pathData = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
    if (pathEl) pathEl.setAttribute('d', pathData);

    // 3. ナビ吹き出し（ボタンの位置に応じてガイドダイアログに絶対に被らない安全位置に配置）
    if (pinEl) {
      const pinWidth = 230;
      const leftPos = Math.max(10, Math.min(window.innerWidth - pinWidth - 10, Math.round(targetCenterX - pinWidth / 2)));
      pinEl.style.left = `${leftPos}px`;

      // ツールバー等(top >= 52px)のボタンは、ボタンの上側に「👇」吹き出しを出すことでガイド枠(top:104px)と一切干渉しない
      if (targetRect.top >= 52) {
        pinEl.innerHTML = '<span>👇</span> <span>このボタンです！(クリックで即実行)</span>';
        pinEl.style.top = `${Math.max(6, Math.round(targetRect.top - 36))}px`;
      } else {
        // ヘッダー(top < 52px)のボタンは、ボタンの下側に「👆」吹き出しを出す（ガイド上部との隙間にすっきり収まる）
        pinEl.innerHTML = '<span>👆</span> <span>このボタンです！(クリックで即実行)</span>';
        pinEl.style.top = `${Math.round(targetRect.bottom + 8)}px`;
      }
      pinEl.style.display = 'flex';
    }

    if (svgLayer) svgLayer.classList.add('active');

    // 前版と同じく、十分な時間（15秒間）線がしっかり残り続ける
    activeArrowTimeout = setTimeout(() => {
      clearHighlight();
    }, 15000);
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
      clearHighlight();
      renderCategory(0);
    }
  }

  function closeGuideModal() {
    const overlay = document.getElementById('guideModalOverlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
    stopAutoAnimation();
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
  window.DocReviewGuide = window.OnboardingGuide;
  window.openDocReviewGuide = openGuideModal;

  // DOMロード後にガイドボタンと接続 ＆ 初回起動時オープン
  document.addEventListener('DOMContentLoaded', () => {
    // ヘッダーや中央待機画面等のガイド起動ボタンとの接続
    const triggerButtons = [
      document.getElementById('showGuideBtn'),
      document.getElementById('placeholderGuideBtn'),
      document.getElementById('openGuideModalBtn'),
      document.querySelector('.btn-guide-trigger')
    ].filter(Boolean);

    triggerButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openGuideModal();
      });
    });

    // 「次回から非表示」がオフなら初回起動時に開く
    const hidePref = localStorage.getItem('docReviewStudio_hideGuide');
    if (hidePref !== 'true') {
      setTimeout(() => {
        openGuideModal();
      }, 450);
    }
  });

})();
