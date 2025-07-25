import {
  // buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * autolinkModals
 */
function autolinkModals(element) {
  element.addEventListener('click', async (e) => {
    const origin = e.target.closest('a');

    if (origin && origin.href && origin.href.includes('/modals/')) {
      e.preventDefault();
      const { openModal } = await import(`${window.hlx.codeBasePath}/blocks/modal/modal.js`);
      openModal(origin.href);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * URLから?width=以降のパラメータを削除する
 * @param {string} url 処理対象のURL
 * @returns {string} パラメータを削除したURL
 */
function cleanImageUrl(url) {
  if (!url) return '';
  return url.includes('?width=') 
    ? url.substring(0, url.indexOf('?width='))
    : url;
}

/**
 * sbw-section-bg-imgクラスを持つセクションを処理する
 * data-title、data-subtitle、data-backgroundの処理を行う
 * @param {Element} main メイン要素
 */
function processBgImgSections(main) {
  /**
   * タイトルとサブタイトルからhgroup要素を作成
   * @param {string} title タイトルテキスト
   * @param {string} subtitle サブタイトルテキスト
   * @returns {HTMLElement|null} 作成したhgroup要素、またはnull
   */
  function createHeadingGroup(title, subtitle) {
    if (!title && !subtitle) return null;
    
    const hgroup = document.createElement('hgroup');
    
    if (title) {
      const h2 = document.createElement('h2');
      h2.className = 'sbw-section-bg-img-content-title';
      h2.textContent = title;
      hgroup.appendChild(h2);
    }
    
    if (subtitle) {
      const p = document.createElement('p');
      p.className = 'sbw-section-bg-img-content-text';
      p.textContent = subtitle;
      hgroup.appendChild(p);
    }
    
    return hgroup;
  }
  
  /**
   * PCとSP用の背景画像を設定する
   * @param {HTMLElement} section 背景画像を設定するセクション要素
   * @param {number} index セクションのインデックス
   */
  function setupBackgroundImages(section, index) {
    const bgImage = section.dataset.background;
    const bgImageSp = section.dataset.backgroundSp;
    
    if (!bgImage) return;
    
    // PC用の背景画像を設定
    const cleanBgImage = cleanImageUrl(bgImage);
    section.style.backgroundImage = `url(${cleanBgImage})`;
    
    // SP用の背景画像があれば、メディアクエリで切り替える
    if (bgImageSp) {
      const cleanBgImageSp = cleanImageUrl(bgImageSp);
      
      // セクションに一意のIDを設定
      if (!section.id) {
        section.id = `section-bg-${index}`;
      }
      
      // CSSでメディアクエリを使って背景画像を切り替える
      const styleEl = document.createElement('style');
      styleEl.textContent = `
        @media (width <= 768px) {
          #${section.id} {
            background-image: url(${cleanBgImageSp}) !important;
          }
        }
      `;
      
      document.head.appendChild(styleEl);
    }
  }
  
  // sbw-section-bg-imgクラスを持つセクションを検索
  const bgImgSections = [...main.querySelectorAll('section.sbw-section-bg-img')];
  
  bgImgSections.forEach((section, index) => {
    try {
      // 1. 背景画像の設定
      setupBackgroundImages(section, index);
      
      // 2. 子要素を一時保存
      const childElements = Array.from(section.children);
      childElements.forEach(child => child.remove());
      
      // 3. ラッパーとコンテンツ領域の作成
      const wrapDiv = document.createElement('div');
      wrapDiv.className = 'sbw-section-bg-img-wrap';
      
      const contentsDiv = document.createElement('div');
      contentsDiv.className = 'sbw-section-bg-img-contents';
      
      // 4. タイトル・サブタイトルの処理
      const hgroup = createHeadingGroup(section.dataset.title, section.dataset.subtitle);
      if (hgroup) {
        wrapDiv.appendChild(hgroup);
      }
      
      // 5. 元の子要素をコンテンツ領域に追加
      childElements.forEach(child => contentsDiv.appendChild(child));
      
      // 6. 要素を組み立て
      wrapDiv.appendChild(contentsDiv);
      section.appendChild(wrapDiv);
    } catch (e) {
      console.error('BgImg section processing error:', e);
    }
  });
}

/**
 * sbw-subpage-titleセクション
 * @param {Element} main メイン要素
 */
function processSubpageTitleSections(main) {
  const subpageTitleSections = [...main.querySelectorAll('section.sbw-subpage-title')];
  
  subpageTitleSections.forEach((section) => {
    try {
      // データ属性から値を取得
      const title = section.dataset.title;
      const subtitle = section.dataset.subtitle;
      const text = section.dataset.text;
      
      // hgroup要素の作成
      const hgroup = document.createElement('hgroup');
      
      if (title) {
        const h1 = document.createElement('h1');
        h1.className = 'sbw-subpage-title-title';
        h1.textContent = title;
        hgroup.appendChild(h1);
      }
      
      if (subtitle) {
        const p = document.createElement('p');
        p.className = 'sbw-subpage-title-subtitle';
        p.textContent = subtitle;
        hgroup.appendChild(p);
      }

      // 先にhgroupを追加
      section.appendChild(hgroup);
      
      // その後で説明テキストを追加
      if (text) {
        const textP = document.createElement('p');
        textP.className = 'sbw-subpage-title-text';
        textP.textContent = text;
        section.appendChild(textP);
      }
    } catch (e) {
      console.error('Subpage title section processing error:', e);
    }
  });
}

/**
 * sbw-subpage-sectionセクション
 * @param {Element} main メイン要素
 */
function processSubpageSections(main) {
  main.querySelectorAll('section.sbw-subpage-section').forEach((section) => {
    const title = section.dataset.title;
    if (!title) return;

    try {
      // ラッパーとh2要素を作成
      const wrapper = document.createElement('div');
      wrapper.className = 'sbw-subpage-section-wrapper';
      
      const h2 = document.createElement('h2');
      Object.assign(h2, {
        className: 'sbw-subpage-section-title',
        textContent: title,
        id: title
      });

      // 既存の子要素をラッパーに移動
      wrapper.append(h2, ...section.children);
      
      // セクションにラッパーを設定
      section.replaceChildren(wrapper);
    } catch (e) {
      console.error('Subpage section processing error:', e);
    }
  });
}

/**
 * divタグをsectionタグに変換する
 * セクションのロードが完了した後にだけ実行すること
 * @param {Element} main メイン要素
 */
function replaceDivsWithSections(main) {
  // セクションクラスを持つdivのみを検索
  // フラグメントコンテナー直下のdiv.sectionと、フラグメントラッパー直下のdiv.sectionは変換対象に含める
  const sectionDivs = [...main.querySelectorAll('div.section')]
    .filter(div => {
      const fragmentContainer = div.closest('.fragment-container');
      const fragmentWrapper = div.closest('.fragment-wrapper');
      
      // フラグメントコンテナー内にない場合は変換対象
      if (!fragmentContainer) return true;
      
      // フラグメントコンテナーの直下、またはフラグメントラッパーの直下の場合は変換対象
      return div.parentElement === fragmentContainer || 
             (fragmentWrapper && div.parentElement === fragmentWrapper);
    });
  
  sectionDivs.forEach((div) => {
    try {
      // status="loaded"のセクションのみ変換
      if (div.dataset.sectionStatus === 'loaded') {
        // 新しいsectionタグを作成
        const section = document.createElement('section');
        
        // 属性をコピー
        [...div.attributes].forEach((attr) => {
          section.setAttribute(attr.name, attr.value);
        });
        
        // 子要素を一つずつ移動（イベントリスナーを保持）
        while (div.firstChild) {
          section.appendChild(div.firstChild);
        }
        
        // 元のdivを置き換え
        div.parentNode.replaceChild(section, div);
      }
    } catch (e) {
      console.error('Section conversion error:', e);
    }
  });
}

/**
 * Teriaryボタン
 * @param {Element} element container element
 */
function decorateTertiaryButtons(element) {
  element.querySelectorAll('p > strong > em > a').forEach((a) => {
    const p = a.parentElement.parentElement.parentElement;
    if (
      // 親要素の構造を確認
      a.parentElement.tagName === 'EM'
      && a.parentElement.parentElement.tagName === 'STRONG'
      && p.tagName === 'P'
      // 各要素が単一の子要素のみを持つことを確認
      && a.parentElement.childNodes.length === 1
      && a.parentElement.parentElement.childNodes.length === 1
      && p.childNodes.length === 1
    ) {
      a.className = 'button tertiary';
      p.classList.add('button-container');
    }
  });
}

/**
 * モーダルリンクにblankを設定する
 * @param {Element} element 
 */
function decorateModalLinks(element) {
  element.querySelectorAll('a').forEach((a) => {
    if (a.href.includes('/modals/')) {
      a.target = '_blank';
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateTertiaryButtons(main);
  decorateModalLinks(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * メタタグから背景画像を設定する
 */
function processBackgroundFromMeta() {
  const metaBg = document.querySelector('meta[name="background"]');
  const metaBgSp = document.querySelector('meta[name="background-sp"]');
  const main = document.querySelector('main');

  if (!main || !metaBg) return;

  const bgImage = metaBg.getAttribute('content');
  const bgImageSp = metaBgSp?.getAttribute('content');

  // PC用の背景画像を設定
  main.style.backgroundImage = `url(${cleanImageUrl(bgImage)})`;
  main.style.backgroundRepeat = 'no-repeat';
  main.style.backgroundSize = '100% 296px';

  // SP用の背景画像が指定されている場合、メディアクエリで切り替える
  if (bgImageSp) {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      main {
        background-repeat: no-repeat;
        background-size: 100% 296px;
      }
      @media (width <= 768px) {
        main {
          background-image: url(${cleanImageUrl(bgImageSp)}) !important;
          background-size: 100% 360px !important;
        }
      }
    `;
    document.head.appendChild(styleEl);
  }
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'ja';
  decorateTemplateAndTheme();
  
  // メタタグから背景画像を設定
  processBackgroundFromMeta();
  
  // ヘッダーのスタイルを早期に読み込み
  await loadCSS(`${window.hlx.codeBasePath}/blocks/header/header.css`);
  
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
    
    // ヘッダーの読み込みをEagerに移動
    loadHeader(doc.querySelector('header'));
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
/**
 * スムーズスクロール実行関数
 * @param {string} targetId 対象要素のID
 */
function smoothScrollToElement(targetId) {
  const element = document.getElementById(targetId);
  if (!element) return;
  
  const elementRect = element.getBoundingClientRect();
  const elementTop = elementRect.top + window.pageYOffset;
  const targetPosition = elementTop - 40; // 40pxのマージン
  
  window.scrollTo({
    top: Math.max(0, targetPosition),
    behavior: 'smooth'
  });
}

/**
 * 画像読み込み監視を設定
 * @param {string} targetId 対象要素のID
 * @param {Object} scrollState スクロール状態管理オブジェクト
 */
function setupImageLoadMonitoring(targetId, scrollState) {
  const images = document.querySelectorAll('img');
  if (images.length === 0) return;
  
  let loadedCount = 0;
  const handleImageLoad = () => {
    loadedCount++;
    if (loadedCount >= images.length && scrollState.attempts < scrollState.maxAttempts) {
      scrollState.attempts++;
      setTimeout(() => smoothScrollToElement(targetId), 150);
    }
  };
  
  images.forEach(img => {
    if (img.complete) {
      handleImageLoad();
    } else {
      img.addEventListener('load', handleImageLoad);
      img.addEventListener('error', handleImageLoad);
    }
  });
}

/**
 * レイアウト変更監視を設定
 * @param {string} targetId 対象要素のID
 * @param {Object} scrollState スクロール状態管理オブジェクト
 */
function setupLayoutObservers(targetId, scrollState) {
  const observers = [];
  
  // ResizeObserver
  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => {
      if (scrollState.attempts < scrollState.maxAttempts) {
        scrollState.attempts++;
        setTimeout(() => smoothScrollToElement(targetId), 50);
      }
    });
    resizeObserver.observe(document.body);
    observers.push(resizeObserver);
  }
  
  // MutationObserver
  if (window.MutationObserver) {
    const mutationObserver = new MutationObserver(() => {
      if (scrollState.attempts < scrollState.maxAttempts) {
        scrollState.attempts++;
        setTimeout(() => smoothScrollToElement(targetId), 50);
      }
    });
    
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    observers.push(mutationObserver);
  }
  
  // 5秒後に全ての監視を停止
  setTimeout(() => {
    observers.forEach(observer => observer.disconnect());
  }, 5000);
}

/**
 * アンカーリンクを改善された方法でスクロールする
 * @param {string} hash ハッシュ値
 * @param {Element} doc ドキュメント要素
 */
function handleAnchorLink(hash, doc) {
  if (!hash) return;
  
  const targetId = hash.substring(1);
  const element = doc.getElementById(targetId);
  if (!element) return;
  
  const scrollState = { attempts: 0, maxAttempts: 10 };
  
  // 即座にスクロール
  smoothScrollToElement(targetId);
  
  // 各種監視設定
  setupImageLoadMonitoring(targetId, scrollState);
  setupLayoutObservers(targetId, scrollState);
}

async function loadLazy(doc) {
  autolinkModals(doc);
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  handleAnchorLink(hash, doc);

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  
  // すべてのコンテンツロード後にdivからsectionに変換
  const main = document.querySelector('main');
  if (main) {
    replaceDivsWithSections(main);
    // sbw-section-bg-imgクラスを持つセクションを処理
    processBgImgSections(main);
    // sbw-subpage-titleクラスを持つセクションを処理
    processSubpageTitleSections(main);
    // sbw-subpage-sectionクラスを持つセクションを処理
    processSubpageSections(main);
  }
  
  loadDelayed();
}

loadPage();
