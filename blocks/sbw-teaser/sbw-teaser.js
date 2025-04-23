/**
 * sbw-teaserブロックの装飾
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const section = block.closest('.section');
  if (!section) return;
  
  // セクション設定
  section.classList.add('sbw-teaser-container');
  
  // 背景画像の設定
  const bgImage = section.getAttribute('data-background');
  if (bgImage) {
    section.style.backgroundImage = `url(${bgImage})`;
  }
  
  // 内部のdivにクラス名を追加
  const contentDivs = block.querySelectorAll(':scope > div');
  if (contentDivs.length >= 2) {
    // 1つ目のdiv（ロゴを含む部分）
    const logoContainer = contentDivs[0];
    const logoItems = logoContainer.querySelectorAll(':scope > div');
    
    // メインロゴとサブロゴにクラス追加
    if (logoItems.length >= 2) {
      logoItems[0].classList.add('sbw-teaser-logo-main');
      logoItems[1].classList.add('sbw-teaser-logo-sub');
    }
    
    // 2つ目のdiv（日付とボタンを含む部分）
    const infoContainer = contentDivs[1];
    const infoItems = infoContainer.querySelectorAll(':scope > div');
    
    // 日付部分とボタン部分にクラス追加
    if (infoItems.length >= 2) {
      infoItems[0].classList.add('sbw-teaser-date');
      infoItems[1].classList.add('sbw-teaser-button-container');
      
      // PCの場合（width > 769px）のときだけ、sbw-teaser-date内の<br>タグを削除する処理
      const dateElem = infoItems[0];
      
      // オリジナルの内容を保存
      const originalContent = dateElem.innerHTML;
      let noBreakContent = null;
      
      const mediaQuery = window.matchMedia('(width > 769px)');
      
      const handleBreakpointChange = (e) => {
        if (e.matches) {
          // PCの場合、brタグを削除したコンテンツを適用（初回のみ作成）
          if (!noBreakContent) {
            // 一時的な要素にコンテンツをコピー
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = originalContent;
            
            // brタグを削除
            tempDiv.querySelectorAll('br').forEach(br => {
              br.parentNode.removeChild(br);
            });
            
            noBreakContent = tempDiv.innerHTML;
          }
          
          // brタグを削除したコンテンツを適用
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
    }
  }
  
  // アニメーション用クラスを追加
  setupAnimation(block);
}

/**
 * アニメーション用クラスの追加
 * @param {HTMLElement} block 
 */
function setupAnimation(block) {
  // アニメーション対象の要素を取得
  const logoContainer = block.querySelector(':scope > div:first-child');
  const dateElem = block.querySelector('.sbw-teaser-date');
  const buttonContainer = block.querySelector('.sbw-teaser-button-container');
  
  // アニメーション用クラスを追加（順番に応じたクラスを付与）
  logoContainer?.classList.add('sbw-teaser-animate', 'sbw-teaser-animate-1');
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
  
  // DOMContentLoadedイベント後またはページロード後にアニメーションを開始
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAnimation);
  } else {
    // DOMがすでに読み込まれている場合は直接実行
    startAnimation();
  }
  
  // ページの表示が完了したタイミングでも実行（SPのサポート向上）
  window.addEventListener('load', startAnimation);
}
