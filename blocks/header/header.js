import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
// import { buildBreadcrumbs } from '../../scripts/scripts.js';

// PC/SPの切り替えのためのメディアクエリ
const isDesktop = window.matchMedia('(min-width: 769px)');

/**
 * ナビゲーションセクション全体を切り替える
 * @param {Element} sections ナビゲーションセクションのコンテナ
 * @param {Boolean} expanded 展開状態
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

/**
 * メニューの表示/非表示を切り替える
 * @param {Element} nav ナビゲーション要素
 * @param {Element} navSections ナビゲーションセクション
 * @param {Boolean} forceExpanded 強制的に展開状態を設定する場合の値
 */
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
 * @param {HTMLElement} headerMenu ヘッダーメニュー要素
 * @param {HTMLElement} headerBtn ヘッダーボタン要素
 * @returns {HTMLElement} 作成したSPメニュー要素
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
  return spMenu;
}

/**
 * ヘッダーを読み込み、初期化する
 * @param {HTMLElement} block ヘッダーブロック要素
 */
export default async function decorate(block) {
  // フラグメントの読み込み
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/header';
  const fragment = await loadFragment(navPath);

  // 既存コンテンツのクリア
  block.textContent = '';
  
  // ハンバーガーメニューの作成
  const hamburgerDiv = document.createElement('div');
  hamburgerDiv.className = 'hamburger-container';
  
  const hamburgerBtn = document.createElement('button');
  hamburgerBtn.className = 'hamburger-menu';
  hamburgerBtn.innerHTML = `<span></span><span></span><span></span>`;
  
  hamburgerDiv.appendChild(hamburgerBtn);
  block.appendChild(hamburgerDiv);
  
  // フラグメントコンテンツの追加
  while (fragment.firstElementChild) {
    block.append(fragment.firstElementChild);
  }
  
  // ヘッダー内の要素にクラスを付与
  const headerDivs = Array.from(block.querySelectorAll('.header > div')).filter(div => 
    !div.classList.contains('hamburger-container')
  );
  
  if (headerDivs.length >= 3) {
    headerDivs[0].classList.add('header-logo');
    headerDivs[1].classList.add('header-menu');
    headerDivs[2].classList.add('header-btn');
  }
  
  // ロゴボタンの処理
  const headerLogo = block.querySelector('.header-logo');
  if (headerLogo) {
    processButton(headerLogo, 'logo-link', 'logo');
  }
  
  // ヘッダーメニューとヘッダーボタンの取得
  const headerMenu = block.querySelector('.header-menu');
  const headerBtn = block.querySelector('.header-btn');
  
  // default-content-wrapperのdivをnavタグに変更
  if (headerMenu) {
    const defaultContentWrapper = headerMenu.querySelector('.default-content-wrapper');
    if (defaultContentWrapper) {
      const navElement = document.createElement('nav');
      navElement.className = defaultContentWrapper.className;
      
      while (defaultContentWrapper.firstChild) {
        navElement.appendChild(defaultContentWrapper.firstChild);
      }
      
      defaultContentWrapper.replaceWith(navElement);
    }
  }
  
  // SPメニューの作成
  const spMenu = createSPMenu(headerMenu, headerBtn);
  
  // SPメニューをヘッダー内に追加
  block.appendChild(spMenu);
  
  // イベントリスナーの設定
  hamburgerBtn.addEventListener('click', toggleSPMenu);
  
  // 画面サイズ変更時の処理
  const mediaQueryHandler = (e) => {
    if (e.matches) {
      // PCサイズの場合
      hamburgerDiv.style.display = 'none';
      
      // SPメニューが開いていれば閉じる
      if (spMenu.classList.contains('is-open')) {
        spMenu.classList.remove('is-open');
        document.body.style.overflow = '';
        
        // ハンバーガーメニューのアクティブ状態も解除
        if (hamburgerBtn.classList.contains('is-active')) {
          hamburgerBtn.classList.remove('is-active');
        }
      }
    } else {
      // SPサイズの場合
      hamburgerDiv.style.display = 'block';
    }
  };
  
  // メディアクエリイベントの登録と初期実行
  isDesktop.addEventListener('change', mediaQueryHandler);
  mediaQueryHandler(isDesktop);
}
