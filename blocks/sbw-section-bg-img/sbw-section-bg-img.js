/**
 * sbw-section-bg-imgブロックの装飾
 */
export default function decorate(block) {
  const section = block.closest('.section');
  if (!section) return;
  
  // セクション設定
  section.classList.add('sbw-section-bg-img-container');
  
  // 内側コンテナ作成
  const innerContainer = document.createElement('div');
  innerContainer.className = 'sbw-section-bg-img-container-inner';
  block.classList.contains('inner-s') && innerContainer.classList.add('inner-s');
  
  // 子要素の移動
  const children = Array.from(section.children);
  while (section.firstChild) section.removeChild(section.firstChild);
  section.appendChild(innerContainer);
  children.forEach(child => innerContainer.appendChild(child));
  
  // コンテンツコンテナ作成
  const contentContainer = document.createElement('div');
  contentContainer.className = 'sbw-section-bg-img-content';
  
  // 背景画像処理
  setupBackgroundImage(block, contentContainer);
  
  // 子要素をコンテナに移動
  while (block.firstChild) {
    const child = block.firstChild;
    if (child.tagName === 'DIV' && !child.children.length && !child.textContent.trim()) {
      block.removeChild(child);
      continue;
    }
    contentContainer.appendChild(child);
  }
  
  // コンテンツコンテナ追加
  block.appendChild(contentContainer);
  
  // タイトルとテキストにクラス付与
  addClassesToContent(contentContainer);
  
  // inner-s処理
  if (innerContainer.classList.contains('inner-s')) {
    wrapInnerSContent(innerContainer);
  }
}

/**
 * 背景画像のセットアップ
 */
function setupBackgroundImage(block, contentContainer) {
  const imgElement = block.querySelector('img');
  if (!imgElement) {
    block.classList.add('no-bg-img');
    return;
  }
  
  const pictureElement = imgElement.closest('picture') || imgElement.parentElement;
  const bgImgDiv = document.createElement('div');
  bgImgDiv.className = 'bg-img';
  
  const pictureParent = pictureElement.parentElement;
  pictureParent.removeChild(pictureElement);
  
  if (pictureParent !== block && !pictureParent.children.length && !pictureParent.textContent.trim()) {
    pictureParent.parentElement.removeChild(pictureParent);
  }
  
  bgImgDiv.appendChild(pictureElement);
  contentContainer.appendChild(bgImgDiv);
}

/**
 * コンテンツにクラスを追加
 */
function addClassesToContent(container) {
  // タイトル処理
  const h1 = container.querySelector('h1');
  if (h1) {
    const h1Parent = h1.closest('div');
    if (h1Parent && h1Parent !== container) {
      h1Parent.classList.add('sbw-section-bg-img-content-title');
    }
  }
  
  // テキスト処理
  container.querySelectorAll('p').forEach(p => {
    const pParent = p.closest('div');
    if (pParent && pParent !== container && 
        !pParent.classList.contains('bg-img') && 
        !pParent.classList.contains('sbw-section-bg-img-content-title')) {
      pParent.classList.add('sbw-section-bg-img-content-text');
    }
  });
}

/**
 * inner-s専用のコンテンツラッピング
 */
function wrapInnerSContent(container) {
  const excludeClasses = ['default-content-wrapper', 'sbw-section-bg-img-wrapper'];
  const elementsToWrap = [];
  
  Array.from(container.children).forEach(child => {
    const shouldExclude = excludeClasses.some(cls => 
      child.classList.contains(cls) || child.querySelector(`.${cls}`));
    
    if (!shouldExclude) elementsToWrap.push(child);
  });
  
  if (!elementsToWrap.length) return;
  
  const wrapper = document.createElement('div');
  wrapper.className = 'inner-s-wrapper';
  
  elementsToWrap.forEach(el => {
    container.removeChild(el);
    wrapper.appendChild(el);
  });
  
  container.appendChild(wrapper);
}