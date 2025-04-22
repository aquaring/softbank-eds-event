/**
 * sbw-section-bg-imgブロック
 */
export default function decorate(block) {
  const section = block.closest('.section');
  if (!section) return;
  
  section.classList.add('sbw-section-bg-img-container');
  
  // コンテナ作成
  const innerContainer = document.createElement('div');
  innerContainer.className = 'sbw-section-bg-img-container-inner';
  const hasInnerS = block.classList.contains('inner-s');
  if (hasInnerS) innerContainer.classList.add('inner-s');
  
  // 子要素の移動
  const children = [...section.children];
  while (section.firstChild) section.removeChild(section.firstChild);
  section.appendChild(innerContainer);
  children.forEach(child => innerContainer.appendChild(child));
  
  // コンテンツコンテナ
  const contentContainer = document.createElement('div');
  contentContainer.className = 'sbw-section-bg-img-content';
  
  setupBackgroundImage(block, contentContainer);
  
  // 子要素を移動
  while (block.firstChild) {
    const child = block.firstChild;
    if (child.tagName === 'DIV' && !child.children.length && !child.textContent.trim()) {
      block.removeChild(child);
      continue;
    }
    contentContainer.appendChild(child);
  }
  
  block.appendChild(contentContainer);
  
  addClassesToContent(contentContainer);
  convertToHgroups(contentContainer);
  
  // ラッパー処理
  const wrapperClass = hasInnerS ? 'inner-s-wrapper' : 'inner-wrapper';
  const contentWrapper = wrapContent(innerContainer, wrapperClass);
  
  // ラッパー移動
  if (contentWrapper) {
    innerContainer.removeChild(contentWrapper);
    contentContainer.appendChild(contentWrapper);
  }
}

/**
 * 背景画像
 */
function setupBackgroundImage(block, container) {
  const img = block.querySelector('img');
  if (!img) {
    block.classList.add('no-bg-img');
    return;
  }
  
  const picture = img.closest('picture') || img.parentElement;
  const bgImgDiv = document.createElement('div');
  bgImgDiv.className = 'bg-img';
  
  const pictureParent = picture.parentElement;
  pictureParent.removeChild(picture);
  
  if (pictureParent !== block && !pictureParent.children.length && !pictureParent.textContent.trim()) {
    pictureParent.parentElement.removeChild(pictureParent);
  }
  
  bgImgDiv.appendChild(picture);
  container.appendChild(bgImgDiv);
}

/**
 * コンテンツにクラス追加
 */
function addClassesToContent(container) {
  // タイトル処理
  const h2 = container.querySelector('h2');
  if (h2) {
    const h2Parent = h2.closest('div');
    if (h2Parent && h2Parent !== container) {
      h2Parent.classList.add('sbw-section-bg-img-content-title');
    }
  }
  
  // テキスト処理
  container.querySelectorAll('p').forEach(p => {
    const pParent = p.closest('div');
    if (pParent && 
        pParent !== container && 
        !pParent.classList.contains('bg-img') && 
        !pParent.classList.contains('sbw-section-bg-img-content-title')) {
      pParent.classList.add('sbw-section-bg-img-content-text');
    }
  });
}

/**
 * タイトルとテキストをhgroupに変換
 */
function convertToHgroups(container) {
  const title = container.querySelector('.sbw-section-bg-img-content-title');
  const text = container.querySelector('.sbw-section-bg-img-content-text');
  
  if (title && text) {
    const titleParent = title.parentNode;
    const textParent = text.parentNode;
    
    if (titleParent === textParent && titleParent !== container) {
      const hgroup = document.createElement('hgroup');
      
      [...titleParent.attributes].forEach(attr => {
        hgroup.setAttribute(attr.name, attr.value);
      });
      
      const parentOfParent = titleParent.parentNode;
      const nextSibling = titleParent.nextSibling;
      
      while (titleParent.firstChild) {
        hgroup.appendChild(titleParent.firstChild);
      }
      
      if (nextSibling) {
        parentOfParent.insertBefore(hgroup, nextSibling);
      } else {
        parentOfParent.appendChild(hgroup);
      }
      
      parentOfParent.removeChild(titleParent);
    }
  }
}

/**
 * 要素をラッパーで囲む
 */
function wrapContent(container, wrapperClass) {
  const excludeClasses = ['default-content-wrapper', 'sbw-section-bg-img-wrapper'];
  const elementsToWrap = [];
  
  [...container.children].forEach(child => {
    const shouldExclude = excludeClasses.some(cls => 
      child.classList.contains(cls) || child.querySelector(`.${cls}`));
    
    if (!shouldExclude) elementsToWrap.push(child);
  });
  
  if (!elementsToWrap.length) return null;
  
  const wrapper = document.createElement('div');
  wrapper.className = wrapperClass;
  
  elementsToWrap.forEach(el => {
    container.removeChild(el);
    wrapper.appendChild(el);
  });
  
  container.appendChild(wrapper);
  return wrapper;
}