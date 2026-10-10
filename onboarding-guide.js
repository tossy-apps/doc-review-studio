/**
 * DocReview Studio - オンボーディングガイド モジュール
 * CapCut風 ステップカルーセル & 矢印ポインター誘導
 * (ヘッダー露出・縦スクロールゼロ・2列タイトル対応)
 */

(function () {
  'use strict';

  let currentStepIndex = 0;
  let carouselTimer = null;
  let isCarouselPaused = false;
  let activeArrowTimeout = null;
  let currentButtonPage = 0; // 0: 基本・よく使う, 1: 応用・発展

  // 1. よく使う基本機能（Page 1: 6個）
  const PRIMARY_BUTTON_ITEMS = [
    {
      id: 'openDirBtn',
      name: '📁 原本を開く',
      location: 'ヘッダー左',
      desc: '作業対象となるHTMLやMarkdownの親フォルダを選択。',
      icon: '📁'
    },
    {
      id: 'addIssueFromParentBtn',
      name: '📌 指摘リストに追加',
      location: '中央ツールバー',
      desc: '本文プレビューで選択したテキストを行番号・文脈ごと登録。',
      icon: '📌'
    },
    {
      id: 'copyCurrentBtn',
      name: '🤖 選択ファイル指示',
      location: 'ヘッダー中央',
      desc: '開いているファイルの指摘をAIプロンプトとして即コピー。',
      icon: '🤖'
    },
    {
      id: 'copyAllBtn',
      name: '🤖 全ファイル指示',
      location: 'ヘッダー中央',
      desc: 'プロジェクト全ファイルの指摘を1本のAIプロンプトに合算生成。',
      icon: '🤖'
    },
    {
      id: 'toggleDiffBtn',
      name: '🔄 Diff検証',
      location: 'ヘッダー右',
      desc: '修正前とAI修正後の原本をWinMerge風に左右2画面で差分比較。',
      icon: '🔄'
    },
    {
      id: 'reloadWorkBtn',
      name: '🔄 原本再読込',
      location: 'ヘッダー左',
      desc: 'AI修正後の最新変更をF5リロードなしで瞬時に再反映。',
      icon: '🔄'
    }
  ];

  // 2. 応用・発展機能（Page 2: 6個）
  const ADVANCED_BUTTON_ITEMS = [
    {
      id: 'openBackupDirBtn',
      name: '📂 退避先を指定',
      location: 'ヘッダー左',
      desc: '修正前原本の安全な退避フォルダを作成・指定します。',
      icon: '📂'
    },
    {
      id: 'toggleInlineDiffBtn',
      name: '🎨 差分ハイライト',
      location: '中央ツールバー',
      desc: '通常プレビュー文書内で修正差分行を直接色付け表示。',
      icon: '🎨'
    },
    {
      id: 'exportJsonBtn',
      name: '💾 JSON / 📝 MD表',
      location: 'ヘッダー中央',
      desc: '作成した指摘一覧をJSONやMarkdown表でエビデンス保存。',
      icon: '💾'
    },
    {
      id: 'importJsonBtn',
      name: '📂 指摘JSON読込',
      location: 'ヘッダー中央',
      desc: '保存した指摘JSONを再読み込みしてレビューを復元。',
      icon: '📂'
    },
    {
      id: 'openDetachedModifiedBtn',
      name: '別窓: 原本',
      location: '中央ツールバー',
      desc: 'マルチモニタ用に原本プレビューを独立した別ウィンドウで表示。',
      icon: '🪟'
    },
    {
      id: 'openDetachedBackupBtn',
      name: '別窓: 修正前',
      location: '中央ツールバー',
      desc: '退避データ（修正前原本）を独立別ウィンドウで表示。',
      icon: '🪟'
    }
  ];

  // DOM構築
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
          <!-- 4. 左右2列のコンパクトヘッダー (高さ32px) -->
          <div class="guide-hero-section">
            <div class="hero-left-box">
              <span class="guide-badge">✨ 完全ローカル完結</span>
              <h2 class="guide-main-heading">3ステップで直感マスター</h2>
            </div>
            <p class="guide-sub-heading">マニュアル不要の基本操作サイクル (所要時間30秒)</p>
          </div>

          <!-- カルーセルステージ (スリム化・高さ240px) -->
          <div class="guide-carousel-wrapper" id="guideCarouselWrapper">
            <div class="guide-cards-stage" id="guideCardsStage">

              <!-- STEP 1 -->
              <div class="carousel-card state-center" id="cardStep0" data-index="0" data-target-id="openDirBtn">
                <div class="card-preview-area">
                  <div class="anim-box-step1">
                    <div class="anim-folder-pulse">📁</div>
                    <div class="anim-tree-step1">
                      <div class="tree-row"><span>📄</span> index.html</div>
                      <div class="tree-row selected"><span>📝</span> spec.md</div>
                      <div class="tree-row"><span>📄</span> manual.html</div>
                    </div>
                  </div>
                </div>
                <div class="card-desc-area">
                  <div class="card-step-pill">STEP 01</div>
                  <div class="card-step-title">📁 原本を開く / 展開</div>
                  <div class="card-step-desc">
                    左上の「原本を開く」からフォルダを選択。ファイルツリーが瞬時に展開されます。（カードクリックで場所案内）
                  </div>
                </div>
              </div>

              <!-- STEP 2 -->
              <div class="carousel-card state-right" id="cardStep1" data-index="1" data-target-id="addIssueFromParentBtn">
                <div class="card-preview-area">
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
                </div>
                <div class="card-desc-area">
                  <div class="card-step-pill">STEP 02</div>
                  <div class="card-step-title">📌 選択して指摘作成</div>
                  <div class="card-step-desc">
                    プレビュー内の文章を選択して「指摘リストに追加」を押すだけ。行番号や文脈を自動解析します。
                  </div>
                </div>
              </div>

              <!-- STEP 3 -->
              <div class="carousel-card state-hidden" id="cardStep2" data-index="2" data-target-id="copyCurrentBtn">
                <div class="card-preview-area">
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
                </div>
                <div class="card-desc-area">
                  <div class="card-step-pill">STEP 03</div>
                  <div class="card-step-title">🤖 AI指示 ＆ Diff検証</div>
                  <div class="card-step-desc">
                    「AI指示」ボタンで指示プロンプトを即取得。修正後は「Diff検証」でWinMerge風の左右比較！
                  </div>
                </div>
              </div>

            </div>

            <!-- インジケーター -->
            <div class="carousel-indicators">
              <span class="indicator-dot active" data-index="0"></span>
              <span class="indicator-dot" data-index="1"></span>
              <span class="indicator-dot" data-index="2"></span>
            </div>
          </div>

          <!-- 他のボタン一覧セクション（3列 ＆ ページ切替スクロールアニメ・スリム化） -->
          <div class="guide-all-buttons-section">
            <div class="section-header-row">
              <div class="section-title">
                <span>🔍</span> ツールバー機能一覧
                <span style="font-size: 11px; color: #64748b; font-weight: normal; margin-left: 6px;">
                  (クリックで場所を矢印案内)
                </span>
              </div>

              <!-- タブ & スライド切替ボタン -->
              <div style="display: flex; align-items: center; gap: 8px;">
                <div class="btn-category-tabs">
                  <button class="tab-btn active" id="tabPrimaryBtn">⭐ よく使う基本機能 (6)</button>
                  <button class="tab-btn" id="tabAdvancedBtn">🛠️ 応用・発展機能 (6)</button>
                </div>
                <div class="page-nav-arrows">
                  <button class="page-arrow-btn" id="pagePrevBtn" title="前のページへ">◀</button>
                  <button class="page-arrow-btn" id="pageNextBtn" title="次のページへ">▶</button>
                </div>
              </div>
            </div>

            <!-- スクロールスライドステージ -->
            <div class="button-pages-viewport">
              <div class="button-pages-slider" id="buttonPagesSlider">
                <!-- Page 1: よく使う基本 (3列) -->
                <div class="button-page" id="pagePrimaryGrid"></div>
                <!-- Page 2: 応用・発展 (3列) -->
                <div class="button-page" id="pageAdvancedGrid"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    renderButtonGrids();
    bindGuideEvents();
  }

  // ボタンカードを生成（3列×2ページ）
  function renderButtonGrids() {
    const page1El = document.getElementById('pagePrimaryGrid');
    const page2El = document.getElementById('pageAdvancedGrid');
    if (!page1El || !page2El) return;

    page1El.innerHTML = PRIMARY_BUTTON_ITEMS.map(createButtonCardHtml).join('');
    page2El.innerHTML = ADVANCED_BUTTON_ITEMS.map(createButtonCardHtml).join('');
  }

  function createButtonCardHtml(item) {
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

  // ページ切り替え（スクロールアニメーション）
  function switchButtonPage(pageIdx) {
    currentButtonPage = pageIdx;
    const slider = document.getElementById('buttonPagesSlider');
    const tabPrimary = document.getElementById('tabPrimaryBtn');
    const tabAdvanced = document.getElementById('tabAdvancedBtn');

    if (slider) {
      slider.style.transform = `translateX(-${pageIdx * 50}%)`;
    }

    if (tabPrimary && tabAdvanced) {
      tabPrimary.classList.toggle('active', pageIdx === 0);
      tabAdvanced.classList.toggle('active', pageIdx === 1);
    }
  }

  // イベントバインド
  function bindGuideEvents() {
    const overlay = document.getElementById('guideModalOverlay');
    const closeBtn = document.getElementById('guideCloseBtn');
    const dotClose = document.getElementById('guideDotClose');

    closeBtn.onclick = closeGuideModal;
    dotClose.onclick = closeGuideModal;

    overlay.onclick = (e) => {
      if (e.target === overlay) closeGuideModal();
    };

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        closeGuideModal();
      }
    });

    // カルーセルカードのクリックで場所案内
    const cards = document.querySelectorAll('.carousel-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.index, 10);
        if (idx !== currentStepIndex) {
          goToStep(idx);
        }
        const targetId = card.dataset.targetId;
        if (targetId) pointToElement(targetId, card);
      });
    });

    // インジケータードットのクリック
    const dots = document.querySelectorAll('.indicator-dot');
    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        goToStep(idx);
      });
    });

    // カルーセルにマウスホバー中は自動ループ一時停止
    const carouselWrapper = document.getElementById('guideCarouselWrapper');
    if (carouselWrapper) {
      carouselWrapper.addEventListener('mouseenter', () => { isCarouselPaused = true; });
      carouselWrapper.addEventListener('mouseleave', () => { isCarouselPaused = false; });
    }

    // ボタンページ切り替えタブ & 矢印
    const tabPrimary = document.getElementById('tabPrimaryBtn');
    const tabAdvanced = document.getElementById('tabAdvancedBtn');
    const pagePrev = document.getElementById('pagePrevBtn');
    const pageNext = document.getElementById('pageNextBtn');

    if (tabPrimary) tabPrimary.onclick = () => switchButtonPage(0);
    if (tabAdvanced) tabAdvanced.onclick = () => switchButtonPage(1);
    if (pagePrev) pagePrev.onclick = () => switchButtonPage(0);
    if (pageNext) pageNext.onclick = () => switchButtonPage(1);

    // ボタンガイドカードのクリックで矢印案内 (カード本体をsourceElとして渡す！)
    const guideCards = document.querySelectorAll('.btn-guide-card');
    guideCards.forEach(card => {
      card.addEventListener('click', () => {
        const targetId = card.dataset.targetId;
        if (targetId) pointToElement(targetId, card);
      });
    });
  }

  // カルーセルステップ切替 (0: Step1, 1: Step2, 2: Step3)
  function goToStep(nextIndex) {
    currentStepIndex = (nextIndex + 3) % 3;

    const cards = [
      document.getElementById('cardStep0'),
      document.getElementById('cardStep1'),
      document.getElementById('cardStep2')
    ];

    cards.forEach((card, idx) => {
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

    const dots = document.querySelectorAll('.indicator-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentStepIndex);
    });
  }

  // 自動カルーセルループ
  function startCarouselLoop() {
    stopCarouselLoop();
    carouselTimer = setInterval(() => {
      if (!isCarouselPaused) {
        goToStep(currentStepIndex + 1);
      }
    }, 3800);
  }

  function stopCarouselLoop() {
    if (carouselTimer) {
      clearInterval(carouselTimer);
      carouselTimer = null;
    }
  }

  // ========================================================
  // 4. CapCut風 矢印線（ヘッダー完全露出に対応したベジェ曲線）
  // ========================================================
  function pointToElement(targetId, sourceEl) {
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    if (activeArrowTimeout) {
      clearTimeout(activeArrowTimeout);
      clearHighlight();
    }

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
    pathEl.setAttribute('d', pathData);

    // 3. 矢印脇のスマートなナビ吹き出し（ボタンのすぐ下に配置）
    pinEl.innerHTML = '<span>👆</span> <span>このボタンです！(クリックで即実行)</span>';
    pinEl.style.display = 'flex';
    pinEl.style.left = `${Math.max(10, Math.round(targetCenterX - 110))}px`;
    pinEl.style.top = `${Math.round(endY + 12)}px`;

    svgLayer.classList.add('active');

    activeArrowTimeout = setTimeout(() => {
      clearHighlight();
    }, 8000);
  }

  function clearHighlight() {
    const svgLayer = document.getElementById('guideArrowSvgLayer');
    const pinEl = document.getElementById('guideTargetPin');
    const spotlightBox = document.getElementById('guideSpotlightBox');
    
    if (svgLayer) svgLayer.classList.remove('active');
    if (pinEl) pinEl.style.display = 'none';
    if (spotlightBox) spotlightBox.classList.remove('active');

    document.querySelectorAll('.guide-element-highlighted').forEach(el => {
      el.classList.remove('guide-element-highlighted');
    });
  }

  // モーダル開閉
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
      stopCarouselLoop();
      clearHighlight();
    }
  }

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
