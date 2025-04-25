import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  // 各要素のクラス名を定義
  const baseClass = 'sbw-contents';
  const containerClass = `${baseClass}-list`;
  const itemWrapperClass = `${baseClass}-listItem`;
  const itemClass = `${baseClass}-item`;
  const itemInnerClass = `${itemClass}-inner`;
  const itemImageClass = `${itemClass}-image`;
  const itemNumberClass = `${itemClass}-number`;
  const itemTitleClass = `${itemClass}-title`;
  const itemTitleWrapperClass = `${itemClass}-title-wrapper`;
  const itemBodyClass = `${itemClass}-body`;
  const readMoreClass = `${itemClass}-readmore`;

  // アイテムの数
  const blockLength = block.children.length;

  // 画像サイズの出しわけ設定
  const breakpoints = [
    { media: '(min-width: 1200px)', width: '2000' },
    { width: `${blockLength <= 1 ? '900' : '600'}` }
  ];

  // containerをolに変更
  const container = document.createElement('ol');
  container.className = containerClass;

  [...block.children].forEach((row, rowIndex) => {
    // リストアイテムを作成
    const listItem = document.createElement('li');
    listItem.className = itemWrapperClass;
    
    // articleを作成
    const article = document.createElement('article');
    
    // リンク要素を作成
    const card = document.createElement('a');
    card.className = itemClass;
    
    // カード内部コンテナの作成
    const cardInner = document.createElement('div');
    cardInner.className = itemInnerClass;

    // 画像セクションの処理
    const imageSection = row.children[0];
    if (imageSection) {
      const imageSectionClone = imageSection.cloneNode(true);
      imageSectionClone.className = itemImageClass;
      cardInner.appendChild(imageSectionClone);
    }

    // タイトルセクションとナンバーの処理
    const titleSection = row.children[1];
    if (titleSection) {
      // タイトルラッパーを作成
      const titleWrapper = document.createElement('div');
      titleWrapper.className = itemTitleWrapperClass;
      
      // ナンバーセクションの作成
      const numberElement = document.createElement('div');
      numberElement.className = itemNumberClass;
      // 01, 02, 03 の形式でナンバリング
      const formattedNumber = String(rowIndex + 1).padStart(2, '0');
      numberElement.textContent = formattedNumber;
      
      // タイトルセクションのクローンを作成
      const titleSectionClone = titleSection.cloneNode(true);
      titleSectionClone.className = itemTitleClass;
      
      // ナンバーとタイトルをラッパーに追加
      titleWrapper.appendChild(numberElement);
      titleWrapper.appendChild(titleSectionClone);
      
      // タイトルラッパーをカード内部に追加
      cardInner.appendChild(titleWrapper);
    }

    // 本文セクションの処理
    const bodySection = row.children[2];
    if (bodySection) {
      const bodySectionClone = bodySection.cloneNode(true);
      bodySectionClone.className = itemBodyClass;
      cardInner.appendChild(bodySectionClone);
    }

    // リンクの処理
    // リンクのhrefを設定
    const innerLink = row.querySelector('a');
    if (innerLink) {
      card.href = innerLink.href;
      
      // もとのリンクを削除
      if (innerLink.closest('div')) {
        const closestDiv = innerLink.closest('div');
        if (closestDiv.parentElement) {
          closestDiv.remove();
        }
      }
    } else {
      card.href = '#';
    }
    
    // Read moreテキストを追加
    const readMoreElement = document.createElement('div');
    readMoreElement.className = readMoreClass;
    const readMoreText = document.createElement('span');
    readMoreText.textContent = 'Read more';
    const readMoreArrow = document.createElement('span');
    readMoreArrow.className = `${readMoreClass}-arrow`;
    readMoreElement.appendChild(readMoreText);
    readMoreElement.appendChild(readMoreArrow);
    
    // Read moreをcardInnerの最後に追加
    cardInner.appendChild(readMoreElement);

    // cardInnerをカードに追加
    card.appendChild(cardInner);
    
    // カードをarticleに追加
    article.appendChild(card);
    
    // articleをリストアイテムに追加
    listItem.appendChild(article);
    
    // リストアイテムをコンテナに追加
    container.appendChild(listItem);
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
