import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  // 各要素のクラス名を定義
  const baseClass = 'sbw-card-session';
  const containerClass = `${baseClass}-list`;
  const itemWrapperClass = `${baseClass}-listItem`;
  const itemClass = `${baseClass}-item`;
  const itemInnerClass = `${itemClass}-inner`;
  const itemImageClass = `${itemClass}-image`;
  const itemContentClass = `${itemClass}-content`;
  const itemTagClass = `${itemClass}-tag`;
  const itemTitleClass = `${itemClass}-title`;
  const itemDetailsClass = `${itemClass}-details`;
  const itemDatetimeClass = `${itemClass}-datetime`;
  const readMoreClass = `${itemClass}-readmore`;

  // 画像サイズの出しわけ設定
  const breakpoints = [
    { media: '(min-width: 1200px)', width: '2000' },
    { width: '600' }
  ];

  // containerをulに変更
  const container = document.createElement('ul');
  container.className = containerClass;

  [...block.children].forEach((row) => {
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

    // 画像セクションの処理 [0]
    const imageSection = row.children[0];
    if (imageSection) {
      const imageSectionClone = imageSection.cloneNode(true);
      imageSectionClone.className = itemImageClass;
      cardInner.appendChild(imageSectionClone);
    }

    // コンテンツコンテナの作成
    const contentContainer = document.createElement('div');
    contentContainer.className = itemContentClass;

    // タグと時間の処理 [1]
    const headerSection = row.children[1];
    if (headerSection) {
      console.log('HeaderSection structure:', headerSection.innerHTML); // デバッグ用
      
      // pタグを探してタグとして処理（最初に処理）
      const pTags = headerSection.querySelectorAll('p');
      if (pTags.length > 0) {
        pTags.forEach(pTag => {
          pTag.className = itemTagClass;
          contentContainer.appendChild(pTag);
        });
      }
      
      // h3タグを探してタイトルとして処理（2番目に処理）
      const h3Tag = headerSection.querySelector('h3');
      if (h3Tag) {
        const titleElement = document.createElement('h3');
        titleElement.className = itemTitleClass;
        titleElement.textContent = h3Tag.textContent.trim();
        contentContainer.appendChild(titleElement);
      }
      
      // 時間部分（timeタグがあれば取得）
      const timeTag = headerSection.querySelector('time');
      if (timeTag) {
        const timeElement = document.createElement('time');
        timeElement.className = itemDatetimeClass;
        timeElement.textContent = timeTag.textContent.trim();
        contentContainer.appendChild(timeElement);
      }
      
      // 子要素が一つもなかった場合は、テキスト全体をタイトルとして扱う
      if (!h3Tag && !timeTag) {
        const titleElement = document.createElement('h3');
        titleElement.className = itemTitleClass;
        titleElement.textContent = headerSection.textContent.trim();
        contentContainer.appendChild(titleElement);
      }
    }

    // 詳細テキストの処理 [2]
    const detailsSection = row.children[2];
    if (detailsSection) {
      // 詳細テキストの内容をそのままコピー
      const detailsElement = document.createElement('div');
      detailsElement.className = itemDetailsClass;
      detailsElement.innerHTML = detailsSection.innerHTML;
      
      // strongタグを含むpタグにクラスを追加
      const paragraphs = detailsElement.querySelectorAll('p');
      paragraphs.forEach(p => {
        let classAdded = false;
        
        if (p.querySelector('strong')) {
          p.classList.add('sbw-card-session-item-name');
          classAdded = true;
        }
        
        // emタグを含むpタグにクラスを追加
        if (p.querySelector('em')) {
          p.classList.add('sbw-card-session-item-note');
          classAdded = true;
        }
        
        // クラスが何も追加されなかったpタグに「sbw-card-session-item-text」を追加
        if (!classAdded) {
          p.classList.add('sbw-card-session-item-text');
        }
      });
      
      contentContainer.appendChild(detailsElement);
    }

    // リンクの処理 [3]
    const linkSection = row.children[3];
    let linkUrl = '#';
    if (linkSection) {
      const link = linkSection.querySelector('a');
      if (link) {
        linkUrl = link.href;
      }
    }
    card.href = linkUrl;

    // contentContainerをcardInnerに追加
    cardInner.appendChild(contentContainer);

    // cardInnerをカードに追加
    card.appendChild(cardInner);
    
    // Read moreテキストを追加
    const readMoreElement = document.createElement('div');
    readMoreElement.className = readMoreClass;
    
    const readMoreText = document.createElement('span');
    readMoreText.textContent = 'Read more';
    
    const readMoreIcon = document.createElement('span');
    readMoreIcon.className = `${readMoreClass}-icon`;
    
    readMoreElement.appendChild(readMoreText);
    readMoreElement.appendChild(readMoreIcon);
    
    // Read moreをカードの最後に追加（内部コンテナの外）
    card.appendChild(readMoreElement);
    
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
