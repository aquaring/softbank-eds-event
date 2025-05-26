import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  // 各要素のクラス名を定義
  const baseClass = 'sbw-exhibits';
  const containerClass = `${baseClass}-list`;
  const itemWrapperClass = `${baseClass}-listItem`;
  const itemClass = `${baseClass}-item`;
  const itemInnerClass = `${itemClass}-inner`;
  const itemImageClass = `${itemClass}-image`;
  const itemBody1Class = `${itemClass}-body1`;
  const itemBody2Class = `${itemClass}-body2`;
  const itemListsClass = `${itemClass}-lists`;
  const readMoreClass = `${itemClass}-readmore`;

  // アイテムの数
  const blockLength = block.children.length;

  // 画像サイズの出しわけ設定
  const breakpoints = [
    { media: '(min-width: 1200px)', width: '2000' },
    { width: `${blockLength <= 1 ? '900' : '600'}` }
  ];

  // containerを作成（要素が1つのみの場合はdiv）
  const container = blockLength <= 1 ? document.createElement('div') : document.createElement('ul');
  container.className = containerClass;

  [...block.children].forEach((row) => {

    // 見出しタグ、リンクの有無を確認
    const isHeading = row.querySelector('h2, h3, h4, h5, h6');
    const hasLink = row.querySelector('a');
    const isLinkAll = (block.classList.contains('link-all') && hasLink) || hasLink;
    
    // sectionInnerの作成
    const sectionInner = document.createElement('div');
    sectionInner.className = itemInnerClass;
    sectionInner.append(...row.childNodes);

    // 各子要素にクラスを追加
    [...sectionInner.children].forEach((child, index) => {
      switch (index) {
        case 0:
          child.className = itemImageClass;
          break;
        case 1:
          child.className = itemBody1Class;
          break;
        case 2:
          child.className = itemBody2Class;
          break;
        default:
          break;
      }
    });

    // リンクまたはdivを作成
    const contentElement = document.createElement(isLinkAll ? 'a' : 'div');
    contentElement.className = itemClass;
    
    // 全体がリンクエリアの場合、hrefを設定し、もとの要素を削除
    if (isLinkAll) {
      const innerLink = sectionInner.querySelector('a');
      contentElement.href = innerLink.href;
      contentElement.classList.add('-link');
      
      // Read moreテキストを追加
      const readMoreElement = document.createElement('div');
      readMoreElement.className = readMoreClass;
      const readMoreText = document.createElement('span');
      readMoreText.textContent = 'Read more';
      const readMoreIcon = document.createElement('span');
      readMoreIcon.className = `${readMoreClass}-icon`;
      readMoreElement.appendChild(readMoreText);
      readMoreElement.appendChild(readMoreIcon);
      
      // もとのリンクを削除
      if (innerLink.closest('div')) {
        innerLink.closest('div').remove();
      }
      
      // Read moreをsectionInnerの最後に追加
      sectionInner.appendChild(readMoreElement);
    }
    
    // sectionInnerをcontentElementに追加
    contentElement.appendChild(sectionInner);
    
    // article要素を作成
    const article = document.createElement('article');
    article.appendChild(contentElement);

    // 要素が1つの場合は直接追加
    if (blockLength === 1) {
      container.append(article);
    } else {
      const li = document.createElement('li');
      li.className = itemWrapperClass;
      // 余分な空白を防ぐためにスタイルを直接設定
      li.style.margin = '0';
      li.style.padding = '0';
      li.style.border = 'none';

      // articleをリストに追加
      li.append(article);
      container.append(li);
    }

    // リストのclass付け
    // すべてのulにitemListsClassをつける
    const listElements = sectionInner.querySelectorAll('ul');
    listElements.forEach((ul) => {
      ul.className = itemListsClass;
    });

    const alignList = sectionInner.querySelectorAll('[data-align]');
    alignList.forEach((align) => {
      const alignData = align.getAttribute('data-align');
      if (alignData) align.style.textAlign = alignData;
    });
  });

  // pictureを最適化
  container.querySelectorAll('picture > img').forEach((img) => {
    const picture = img.closest('picture');
    picture.replaceWith(createOptimizedPicture(img.src, img.alt, false, breakpoints));
  });
  
  // blockに追加
  block.innerHTML = '';
  block.append(container);
}

