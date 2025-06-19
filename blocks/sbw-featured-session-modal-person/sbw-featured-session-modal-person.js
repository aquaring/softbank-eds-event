export default function decorate(block) {
  // 各人物データのコンテナを取得
  const personContainers = Array.from(block.children).filter(child => child.tagName === 'DIV');
  
  // 既存のコンテンツをクリア
  while (block.firstChild) {
    block.removeChild(block.firstChild);
  }
  
  // 各人物データを処理
  personContainers.forEach(container => {
    // 人物アイテムのコンテナを作成
    const itemDiv = document.createElement('div');
    itemDiv.className = 'sbw-featured-session-modal-person-item';
    
    // 画像部分の処理
    const imageContainer = container.children[0];
    if (imageContainer) {
      const imageDiv = document.createElement('div');
      imageDiv.className = 'sbw-featured-session-modal-person-image';
      
      const picture = imageContainer.querySelector('picture');
      if (picture) {
        imageDiv.appendChild(picture.cloneNode(true));
      }
      
      itemDiv.appendChild(imageDiv);
    }
    
    // テキスト部分の処理
    const textDiv = document.createElement('div');
    textDiv.className = 'sbw-featured-session-modal-person-text';
    
    // 役職の処理（2番目のdiv）
    const positionContainer = container.children[1];
    if (positionContainer) {
      const positionP = positionContainer.querySelector('p');
      if (positionP) {
        const newPositionP = document.createElement('p');
        newPositionP.className = 'sbw-featured-session-modal-person-position';
        newPositionP.innerHTML = positionP.innerHTML;
        textDiv.appendChild(newPositionP);
      }
    }
    
    // 名前の処理（3番目のdiv）
    const nameContainer = container.children[2];
    if (nameContainer) {
      const nameP = nameContainer.querySelector('p');
      if (nameP) {
        const newNameP = document.createElement('p');
        newNameP.className = 'sbw-featured-session-modal-person-name';
        newNameP.textContent = nameP.textContent;
        textDiv.appendChild(newNameP);
      }
    }
    
    itemDiv.appendChild(textDiv);
    block.appendChild(itemDiv);
  });
}
