/**
 * 背景画像の設定を行う
 * @param {HTMLElement} section セクション要素
 */
const setupBackgroundImage = (section) => {
  const bgImage = section.getAttribute('data-background');
  if (!bgImage) return;

  // ?width=以降のパラメータを削除
  const cleanBgImage = bgImage.includes('?width=') 
    ? bgImage.substring(0, bgImage.indexOf('?width='))
    : bgImage;
  
  section.style.backgroundImage = `url(${cleanBgImage})`;
};

/**
 * ロゴコンテナをhgroupに変換し、ロゴ要素にクラスを追加する
 * @param {HTMLElement} logoContainer ロゴコンテナ要素
 */
const setupLogoContainer = (logoContainer) => {
  // divをhgroupに変換
  const hgroup = document.createElement('hgroup');
  hgroup.className = logoContainer.className;
  hgroup.innerHTML = logoContainer.innerHTML;
  logoContainer.parentNode.replaceChild(hgroup, logoContainer);
  
  // ロゴ要素にクラスを追加
  const logoItems = hgroup.querySelectorAll(':scope > div');
  if (logoItems.length >= 2) {
    // メインロゴをh1タグに変換
    const mainLogo = logoItems[0];
    const h1 = document.createElement('h1');
    h1.className = 'sbw-teaser-logo-main';
    h1.innerHTML = mainLogo.innerHTML;
    mainLogo.parentNode.replaceChild(h1, mainLogo);
    
    logoItems[1].classList.add('sbw-teaser-logo-sub');
  }

  return hgroup;
};

/**
 * 日付要素のレスポンシブ対応を設定する
 * @param {HTMLElement} dateElem 日付要素
 */
const setupDateResponsive = (dateElem) => {
  const originalContent = dateElem.innerHTML;
  let noBreakContent = null;
  
  const mediaQuery = window.matchMedia('(width > 769px)');
  
  const handleBreakpointChange = (e) => {
    if (e.matches) {
      // PCの場合、brタグを削除したコンテンツを適用（初回のみ作成）
      if (!noBreakContent) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = originalContent;
        tempDiv.querySelectorAll('br').forEach(br => br.remove());
        noBreakContent = tempDiv.innerHTML;
      }
      dateElem.innerHTML = noBreakContent;
    } else {
      // SPの場合、オリジナルのコンテンツを復元
      dateElem.innerHTML = originalContent;
    }
  };
  
  // 初期状態でチェック
  handleBreakpointChange(mediaQuery);
  
  // 画面幅変更時にも対応
  mediaQuery.addEventListener('change', handleBreakpointChange);
};

/**
 * アニメーション用クラスの追加
 * @param {HTMLElement} block ブロック要素
 */
const setupAnimation = (block) => {
  // アニメーション対象の要素を取得
  const hgroup = block.querySelector('hgroup');
  const dateElem = block.querySelector('.sbw-teaser-date');
  const buttonContainer = block.querySelector('.sbw-teaser-button-container');
  
  // アニメーション用クラスを追加（順番に応じたクラスを付与）
  if (hgroup) {
    hgroup.classList.add('sbw-teaser-animate', 'sbw-teaser-animate-1');
  }
  dateElem?.classList.add('sbw-teaser-animate', 'sbw-teaser-animate-2');
  buttonContainer?.classList.add('sbw-teaser-animate', 'sbw-teaser-animate-3');
  
  // アニメーション実行のトリガーを設定
  const startAnimation = () => {
    // 二重実行防止
    if (block.dataset.animationStarted === 'true') return;
    block.dataset.animationStarted = 'true';
    
    // アニメーション開始の遅延
    setTimeout(() => {
      // sbw-teaser-animated クラスを追加してアニメーションを開始
      block.classList.add('sbw-teaser-animation-start');
    }, 400);
  };
  
  // DOMContentLoadedイベントでアニメーションを開始
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAnimation);
  } else {
    // DOMがすでに読み込まれている場合は直接実行
    startAnimation();
  }
  
  // ページの表示が完了したタイミングでも実行（SPのサポート向上）
  window.addEventListener('load', startAnimation);
};

/**
 * sbw-teaserブロックの装飾
 * @param {HTMLElement} block ブロック要素
 */
export default function decorate(block) {
  const section = block.closest('.section');
  if (!section) return;
  
  // セクション設定
  section.classList.add('sbw-teaser-container');
  
  // 背景画像の設定
  setupBackgroundImage(section);
  
  // 内部のdivにクラス名を追加
  const contentDivs = block.querySelectorAll(':scope > div');
  if (contentDivs.length >= 2) {
    // ロゴコンテナの設定
    setupLogoContainer(contentDivs[0]);
    
    // 日付とボタンコンテナの設定
    const infoContainer = contentDivs[1];
    const infoItems = infoContainer.querySelectorAll(':scope > div');
    
    if (infoItems.length >= 2) {
      infoItems[0].classList.add('sbw-teaser-date');
      infoItems[1].classList.add('sbw-teaser-button-container');
      
      // 日付要素のレスポンシブ対応を設定
      setupDateResponsive(infoItems[0]);
    }
  }
  
  // アニメーション用クラスを追加
  setupAnimation(block);
}
