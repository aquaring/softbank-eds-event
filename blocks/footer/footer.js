import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
// import { buildBreadcrumbs } from '../../scripts/scripts.js';

/**
 * フッターグローバルのDOMを作成する
 * @returns {HTMLElement} フッターグローバル要素
 */
const createFooterGlobalDOM = () => {
  const footerGlobal = document.createElement('div');
  footerGlobal.className = 'footer global';
  return footerGlobal;
};

/**
 * フラグメントラッパーの処理
 * @param {HTMLElement} footerFragment フラグメント要素
 * @param {HTMLElement} footerGlobal フッターグローバル要素
 */
const processFragmentWrapper = (footerFragment, footerGlobal) => {
  if (!footerFragment) return;

  // フラグメントから必要な部分だけを抽出して追加
  const fragmentWrapper = document.createElement('div');
  fragmentWrapper.className = 'fragment-wrapper';
  
  // フラグメント内のsectionを探す
  const sections = footerFragment.querySelectorAll('.section');
  if (sections && sections.length > 0) {
    // 必要なセクションを追加（フッターグローバル部分）
    sections.forEach((section) => {
      if (!section.classList.contains('footer-gnav-title') && 
          !section.classList.contains('footer-gnav-links') && 
          !section.classList.contains('footer-gnav-sns')) {
        fragmentWrapper.appendChild(section.cloneNode(true));
      }
    });
  }
  
  footerGlobal.appendChild(fragmentWrapper);
};

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
 * フッターを装飾する
 * @param {Element} block フッターブロック要素
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const footerFragment = await loadFragment(footerPath);

  block.textContent = '';
  const footerGlobal = createFooterGlobalDOM();

  // フラグメントラッパーの処理
  processFragmentWrapper(footerFragment, footerGlobal);

  // DOM要素の追加
  block.append(footerGlobal);

  // ボタンの処理
  processButton(footerGlobal, 'logo-link', 'logo');

  // パンくずリストを追加
  // const breadcrumbs = await buildBreadcrumbs();
  // footerGlobal.insertAdjacentElement('beforebegin', breadcrumbs);
}
