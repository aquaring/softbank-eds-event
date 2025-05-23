export default function decorate(block) {
  // 基本構造を作成
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'sbw-featured-session-content-wrapper';

  // タイトル（h3要素）を取得
  const title = block.querySelector('h3');
  
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
    contentDiv.className = 'sbw-featured-session-content';
    
    // 画像部分
    if (person.picture) {
      const imageDiv = document.createElement('div');
      imageDiv.className = 'sbw-featured-session-image';
      imageDiv.appendChild(person.picture.cloneNode(true));
      contentDiv.appendChild(imageDiv);
    }
    
    // テキスト部分
    const textDiv = document.createElement('div');
    textDiv.className = 'sbw-featured-session-text';
    
    const positionP = document.createElement('p');
    positionP.className = 'sbw-featured-session-position';
    positionP.textContent = person.position;
    
    const nameP = document.createElement('p');
    nameP.className = 'sbw-featured-session-name';
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
  inner.className = 'sbw-featured-session-inner';
  
  if (title) {
    inner.appendChild(title);
  }
  
  inner.appendChild(contentWrapper);
  link.appendChild(inner);
  
  // Read moreボタンを追加
  const readMore = document.createElement('div');
  readMore.className = 'sbw-featured-session-readmore';
  readMore.innerHTML = '<span>Read more</span>';
  link.appendChild(readMore);
  
  block.appendChild(link);
}
