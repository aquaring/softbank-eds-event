import { loadFragment } from '../fragment/fragment.js';
import {
  buildBlock, decorateBlock, loadBlock, loadCSS,
} from '../../scripts/aem.js';

/**
 * モーダルブロックの実装
 * 通常のブロックと異なり、decorate関数はありません。
 * /modals/ パスへのリンクは自動的にモーダルに変換されます。
 * 他のブロックでも createModal() および openModal() 関数が使用できます。
 */

/**
 * モーダルコンテンツを作成する関数
 * @param {NodeList} contentNodes モーダルに表示するコンテンツノード
 * @returns {Object} モーダルブロックとshowModal関数を含むオブジェクト
 */
export async function createModal(contentNodes) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/modal/modal.css`);

  const closeButton = document.createElement('button');
  closeButton.classList.add('close-button');
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.type = 'button';
  closeButton.innerHTML = '<span class="icon icon-close"></span>';
  closeButton.addEventListener('click', () => dialog.close());
  
  // コンテンツの前処理
  const fragment = prepareModalContent(contentNodes);
  
  // ダイアログの作成と設定
  const dialog = createDialogElement(fragment, closeButton);
  
  // モーダルブロックの作成
  const block = buildBlock('modal', '');
  document.querySelector('main').append(block);
  decorateBlock(block);
  await loadBlock(block);
  
  // スクロール位置の管理用変数
  let pageScrollPosition = 0;
  
  // イベントリスナーの設定
  setupDialogEventListeners(dialog, block, () => pageScrollPosition);
  
  // ブロックにダイアログを追加
  block.innerHTML = '';
  block.append(dialog);

  return {
    block,
    showModal: () => {
      // ページのスクロール位置を保存
      pageScrollPosition = window.scrollY;
      
      // モーダルを表示
      dialog.showModal();
      
      // 背景スクロールを防止し、視覚的な位置を維持
      fixBodyPosition(pageScrollPosition);
      
      document.body.classList.add('modal-open');
    },
  };
}

/**
 * モーダルコンテンツを準備する
 * @param {NodeList} contentNodes モーダルに表示するコンテンツノード
 * @returns {DocumentFragment} 処理済みのドキュメントフラグメント
 */
function prepareModalContent(contentNodes) {
  const fragment = document.createDocumentFragment();
  fragment.append(...contentNodes);
  
  // ボタンコンテナの処理とリンクの設定
  processButtonContainers(fragment);
  
  return fragment;
}

/**
 * ダイアログ要素を作成する
 * @param {DocumentFragment} content ダイアログに表示するコンテンツ
 * @param {HTMLElement} closeButton 閉じるボタン要素
 * @returns {HTMLElement} ダイアログ要素
 */
function createDialogElement(content, closeButton) {
  const dialog = document.createElement('dialog');
  const dialogContent = document.createElement('div');
  
  dialogContent.classList.add('modal-content');
  
  // 閉じるボタンを最初に追加
  dialogContent.append(closeButton);
  
  // その後にコンテンツを追加
  dialogContent.append(content);
  
  dialog.append(dialogContent);
  
  return dialog;
}

/**
 * ダイアログにイベントリスナーを設定する
 * @param {HTMLElement} dialog ダイアログ要素
 * @param {HTMLElement} block モーダルブロック
 * @param {Function} getScrollPosition スクロール位置を取得する関数
 */
function setupDialogEventListeners(dialog, block, getScrollPosition) {
  // 外側クリックで閉じる
  dialog.addEventListener('click', (e) => {
    const rect = dialog.getBoundingClientRect();
    const isOutsideClick = e.clientX < rect.left 
      || e.clientX > rect.right 
      || e.clientY < rect.top 
      || e.clientY > rect.bottom;
    
    if (isOutsideClick) {
      dialog.close();
    }
  });

  // 閉じるときの処理
  dialog.addEventListener('close', () => {
    // 固定スタイルを解除
    resetBodyPosition();
    
    // スクロール位置を復元
    const currentScrollPosition = getScrollPosition();
    window.scrollTo({
      top: currentScrollPosition,
      behavior: 'instant' // autoよりも確実
    });
    
    document.body.classList.remove('modal-open');
    block.remove();
  });
}

/**
 * bodyの位置を固定してスクロールを防止する
 * @param {number} scrollY 現在のスクロール位置
 */
function fixBodyPosition(scrollY) {
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  document.body.style.top = `-${scrollY}px`;
}

/**
 * bodyの位置固定を解除する
 */
function resetBodyPosition() {
  document.body.style.position = '';
  document.body.style.width = '';
  document.body.style.top = '';
}

/**
 * ボタンコンテナの処理と全てのaタグにtarget="_blank"属性を追加
 * @param {DocumentFragment} fragment 処理するフラグメント
 */
function processButtonContainers(fragment) {
  // 全てのaタグにtarget="_blank"を追加（.sbw-session-information-item配下は除外）
  fragment.querySelectorAll('a').forEach(link => {
    // .sbw-session-information-item配下のaタグは除外
    const isInSessionInfoItem = link.closest('.sbw-session-information-item');
    if (!isInSessionInfoItem) {
      link.setAttribute('target', '_blank');
    }
  });
  
  // ボタンコンテナのラッピング処理
  wrapButtonContainers(fragment);
}

/**
 * 複数のボタンコンテナを一つのラッパーで囲む
 * @param {DocumentFragment} fragment 処理するフラグメント
 */
function wrapButtonContainers(fragment) {
  const buttonContainers = fragment.querySelectorAll('p.button-container');
  if (buttonContainers.length < 2) return;
  
  const buttonWrapper = document.createElement('div');
  buttonWrapper.className = 'button-wrapper';
  
  const parentElement = buttonContainers[0].parentElement;
  if (!parentElement) return;
  
  // ボタンコンテナをラッパーに移動
  buttonContainers.forEach(container => buttonWrapper.appendChild(container));
  
  // ラッパーを適切な位置に挿入
  parentElement.appendChild(buttonWrapper);
}

/**
 * フラグメントURLからモーダルを開く
 * @param {string} fragmentUrl 開くフラグメントのURL
 */
export async function openModal(fragmentUrl) {
  const path = fragmentUrl.startsWith('http')
    ? new URL(fragmentUrl, window.location).pathname
    : fragmentUrl;

  const fragment = await loadFragment(path);
  const { showModal } = await createModal(fragment.childNodes);
  showModal();
}
