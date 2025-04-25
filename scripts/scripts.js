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
 * divタグをsectionタグに変換する
 * セクションのロードが完了した後にだけ実行すること
 * @param {Element} main メイン要素
 */
function replaceDivsWithSections(main) {
  // セクションクラスを持つdivのみを検索
  const sectionDivs = [...main.querySelectorAll('div.section')];
  
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
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateTertiaryButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
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
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
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
  }
  
  loadDelayed();
}

loadPage();
