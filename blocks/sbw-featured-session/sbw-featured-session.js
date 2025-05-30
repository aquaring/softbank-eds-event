export default function decorate(block) {
  // 各要素のクラス名を定義
  const baseClass = 'sbw-featured-session';
  const contentWrapperClass = `${baseClass}-content-wrapper`;
  const tagClass = `${baseClass}-tag`;
  const innerClass = `${baseClass}-inner`;
  const contentClass = `${baseClass}-content`;
  const imageClass = `${baseClass}-image`;
  const textClass = `${baseClass}-text`;
  const positionClass = `${baseClass}-position`;
  const nameClass = `${baseClass}-name`;
  const readMoreClass = `${baseClass}-readmore`;

  // 基本構造を作成
  const contentWrapper = document.createElement('div');
  contentWrapper.className = contentWrapperClass;

  // タイトル（h3要素）とタグ（h3の前のp要素）を取得
  const title = block.querySelector('h3');
  
  // h3の前のp要素を取得してタグとして処理
  const tagElements = [];
  if (title && title.parentElement) {
    const headerSection = title.parentElement;
    
    // pタグを探してタグとして処理
    const pTags = headerSection.querySelectorAll('p');
    if (pTags.length > 0) {
      pTags.forEach(pTag => {
        pTag.className = tagClass;
        tagElements.push(pTag);
      });
    }
  }
  
  // データの構造を分析
  const inputDivs = Array.from(block.children).filter(child => child.tagName === 'DIV');
  
  // モーダルURLを最後のdivから取得
  const lastDiv = inputDivs[inputDivs.length - 1];
  const modalUrl = lastDiv?.querySelector('p')?.textContent || '/modals/featured-session-ai'; // デフォルト値を設定
  
  // 人物データを格納する配列
  const peopleData = [];
  
  // 入力データから人物情報を抽出（最大4人まで）
  for (let i = 1; i < inputDivs.length - 1 && peopleData.length < 4; i++) {
    const div = inputDivs[i];
    const picture = div.querySelector('picture');
    const paragraphs = div.querySelectorAll('p');
    
    if (picture && paragraphs.length >= 2) {
      peopleData.push({
        picture: picture,
        position: paragraphs[0].textContent,
        name: paragraphs[1].textContent
      });
    }
  }
  
  // 人物データから正確に4つのコンテンツ要素を作成
  peopleData.slice(0, 4).forEach(person => {
    const contentDiv = document.createElement('div');
    contentDiv.className = contentClass;
    
    // 画像部分
    if (person.picture) {
      const imageDiv = document.createElement('div');
      imageDiv.className = imageClass;
      imageDiv.appendChild(person.picture.cloneNode(true));
      contentDiv.appendChild(imageDiv);
    }
    
    // テキスト部分
    const textDiv = document.createElement('div');
    textDiv.className = textClass;
    
    const positionP = document.createElement('p');
    positionP.className = positionClass;
    positionP.textContent = person.position;
    
    const nameP = document.createElement('p');
    nameP.className = nameClass;
    nameP.textContent = person.name;
    
    textDiv.appendChild(positionP);
    textDiv.appendChild(nameP);
    contentDiv.appendChild(textDiv);
    
    contentWrapper.appendChild(contentDiv);
  });
  
  // 既存のコンテンツをクリア
  while (block.firstChild) {
    block.removeChild(block.firstChild);
  }
  
  // 新しい構造を組み立て
  const link = document.createElement('a');
  link.href = modalUrl;
  
  // innerコンテナを作成
  const inner = document.createElement('div');
  inner.className = innerClass;
  
  // タグを先に追加（h3の前）
  if (tagElements.length > 0) {
    tagElements.forEach(tagElement => {
      inner.appendChild(tagElement);
    });
  }
  
  if (title) {
    inner.appendChild(title);
  }
  
  inner.appendChild(contentWrapper);
  link.appendChild(inner);
  
  // Read moreボタンを追加
  const readMore = document.createElement('div');
  readMore.className = readMoreClass;
  readMore.innerHTML = '<span>Read more</span>';
  link.appendChild(readMore);
  
  block.appendChild(link);
}
