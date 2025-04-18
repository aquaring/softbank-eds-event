import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
// import { buildBreadcrumbs } from '../../scripts/scripts.js';

/**
 * フッターのフラグメントを読み込む
 * @param {string} path フラグメントのパス
 * @returns {Promise<HTMLElement|null>} フラグメント要素
 */
const loadFooterFragment = async (path) => {
  const fragment = await loadFragment(path);
  return fragment;
};

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
  // 現在のURLをチェックして適切なフッターパスを決定
  const currentHost = window.location.hostname;
  const defaultFooterPath = (currentHost === 'localhost' || currentHost.includes('main--softbank-eds-event--aquaring.aem.page'))
    ? '/sbw/footer'
    : '/footer';

  const footerPath = getMetadata('footer')
    ? new URL(getMetadata('footer'), window.location).pathname
    : defaultFooterPath;
  const footerFragment = await loadFooterFragment(footerPath);

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
