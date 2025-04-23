import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
// import { buildBreadcrumbs } from '../../scripts/scripts.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 769px)');

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {Boolean} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    if (section.classList.contains('nav-drop')) {
      section.setAttribute('aria-expanded', expanded);
    }
  });
}

/**
 * SPメニューの表示/非表示を切り替える
 */
function toggleSPMenu() {
  const spMenu = document.querySelector('.sp-menu');
  if (spMenu) {
    const isOpen = spMenu.classList.contains('is-open');
    spMenu.classList.toggle('is-open');
    document.body.style.overflow = isOpen ? '' : 'hidden';
    
    // ハンバーガーメニューにactiveクラスを追加/削除
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    if (hamburgerMenu) {
      hamburgerMenu.classList.toggle('is-active', !isOpen);
    }
  }
}

function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const isSP = !isDesktop.matches;

  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');

  if (isSP) {
    // SP表示時は全体のトグルのみ
    navSections.style.display = expanded ? 'none' : 'block';
  } else {
    // PC表示時は各セクションのトグル
    toggleAllNavSections(navSections, expanded);
  }
}

/**
 * ボタンの処理
 * @param {HTMLElement} element 対象要素
 * @param {string} newClassName 新しいクラス名
 * @param {string} newContainerClassName 新しいコンテナクラス名
 */
const processButton = (element, newClassName, newContainerClassName) => {
  const button = element.querySelector('.button');
  if (button) {
    button.className = newClassName;
    button.closest('.button-container').className = newContainerClassName;
  }
};

/**
 * SPメニュー用のHTMLを作成
 * PCのヘッダーメニューとボタンを複製してSPメニューとして使用
 */
function createSPMenu(headerMenu, headerBtn) {
  const spMenu = document.createElement('div');
  spMenu.className = 'sp-menu';
  
  // SPメニューコンテンツ部分
  const spMenuContent = document.createElement('div');
  spMenuContent.className = 'sp-menu-content';
  
  // PCのヘッダーメニューを複製
  if (headerMenu) {
    const menuClone = headerMenu.cloneNode(true);
    spMenuContent.appendChild(menuClone);
  }
  
  // PCのボタン部分を複製
  if (headerBtn) {
    const btnClone = headerBtn.cloneNode(true);
    spMenuContent.appendChild(btnClone);
  }
  
  spMenu.appendChild(spMenuContent);
  
  document.body.appendChild(spMenu);
  return spMenu;
}

/**
 * ヘッダーを読み込む
 */
export default async function decorate(block) {
  // sbwフォルダのheader.docxを読み込む
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/sbw/header';
  const fragment = await loadFragment(navPath);

  // 読み込んだフラグメントを追加
  block.textContent = '';
  
  // ハンバーガーメニュー用のdivを先に作成
  const hamburgerDiv = document.createElement('div');
  hamburgerDiv.className = 'hamburger-container';
  
  // ハンバーガーボタンの作成
  const hamburgerBtn = document.createElement('button');
  hamburgerBtn.className = 'hamburger-menu';
  hamburgerBtn.innerHTML = `<span></span><span></span><span></span>`;
  
  hamburgerDiv.appendChild(hamburgerBtn);
  block.appendChild(hamburgerDiv);
  
  // フラグメントを追加
  while (fragment.firstElementChild) {
    block.append(fragment.firstElementChild);
  }
  
  // p > emタグを持つ要素にSP表示用のクラスを追加
  const pTagsWithEm = block.querySelectorAll('p > em');
  pTagsWithEm.forEach(emTag => {
    const parentP = emTag.parentElement;
    if (parentP) {
      parentP.classList.add('sp-only');
    }
  });
  
  // ヘッダー内の3つのdivにクラスを付与
  const headerDivs = Array.from(block.querySelectorAll('.header > div')).filter(div => !div.classList.contains('hamburger-container'));
  if (headerDivs.length >= 3) {
    headerDivs[0].classList.add('header-logo');
    headerDivs[1].classList.add('header-menu');
    headerDivs[2].classList.add('header-btn');
  }
  
  // ボタンの処理 - footer.jsと同様
  const headerLogo = block.querySelector('.header-logo');
  if (headerLogo) {
    processButton(headerLogo, 'logo-link', 'logo');
  }
  
  // sp-onlyクラスを持つ要素をheader-btnクラスの中に移動
  const spOnlyTexts = block.querySelectorAll('.sp-only');
  const headerBtn = block.querySelector('.header-btn');
  if (headerBtn && spOnlyTexts.length > 0) {
    spOnlyTexts.forEach(spText => {
      // 元の親から削除
      spText.parentElement.removeChild(spText);
      // header-btnの直下の先頭に追加（default-content-wrapperの前）
      const defaultContentWrapper = headerBtn.querySelector('.default-content-wrapper');
      if (defaultContentWrapper) {
        headerBtn.insertBefore(spText, defaultContentWrapper);
      } else {
        headerBtn.appendChild(spText);
      }
    });
  }
  
  const headerMenu = block.querySelector('.header-menu');
  
  // SP用メニューの作成（PCのメニューとボタンを渡す）
  const spMenu = createSPMenu(headerMenu, headerBtn);
  
  // ハンバーガーメニューのクリックイベント
  hamburgerBtn.addEventListener('click', toggleSPMenu);
  
  // PCとSPの表示切り替えの際にハンバーガーメニューを表示/非表示
  const mediaQueryHandler = (e) => {
    if (e.matches) {
      // PCサイズの場合、ハンバーガーボタンを非表示
      hamburgerDiv.style.display = 'none';
      // SPメニューが開いていれば閉じる
      if (spMenu.classList.contains('is-open')) {
        spMenu.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    } else {
      // SPサイズの場合、ハンバーガーボタンを表示
      hamburgerDiv.style.display = 'block';
    }
  };
  
  // メディアクエリのリスナー登録
  isDesktop.addEventListener('change', mediaQueryHandler);
  // 初期表示時の処理
  mediaQueryHandler(isDesktop);
}
