export default function decorate(block) {
  // コンテナ要素をulに変更
  const ul = document.createElement('ul');
  ul.className = 'sbw-news-list';
  
  // pタグの中のpタグを処理する
  function processNestedPTags(parent, targetElement) {
    while (parent.firstChild) {
      const child = parent.firstChild;
      
      if (child.nodeName === 'DIV' || child.nodeName === 'P') {
        // divやpタグの内容だけを追加
        while (child.firstChild) {
          // 子要素がpタグの場合、その内容を直接追加
          if (child.firstChild.nodeName === 'P') {
            const nestedP = child.firstChild;
            while (nestedP.firstChild) {
              targetElement.appendChild(nestedP.firstChild);
            }
            nestedP.remove();
          } else {
            targetElement.appendChild(child.firstChild);
          }
        }
        child.remove();
      } else {
        targetElement.appendChild(child);
      }
    }
  }
  
  // datetime属性の設定
  function setDatetime(timeElement, dateText) {
    const dateNumbers = dateText.match(/\d+/g);
    if (dateNumbers && dateNumbers.length >= 3) {
      const year = dateNumbers[0];
      const month = dateNumbers[1].padStart(2, '0');
      const day = dateNumbers[2].padStart(2, '0');
      timeElement.setAttribute('datetime', `${year}-${month}-${day}`);
    }
  }
  
  // 各ニュース項目を処理
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'sbw-news-item';
    
    const article = document.createElement('article');
    article.className = 'sbw-news-inner';
    
    const pElement = document.createElement('p');
    pElement.className = 'sbw-news-text';
    
    // 最初のdivを日付として処理
    const firstDiv = row.querySelector(':scope > div:first-child');
    if (firstDiv) {
      const timeElement = document.createElement('time');
      
      // 日付テキストを取得
      let dateText = '';
      const pTag = firstDiv.querySelector('p');
      if (pTag) {
        dateText = pTag.textContent;
        timeElement.textContent = dateText;
      } else {
        dateText = firstDiv.textContent.trim();
        timeElement.innerHTML = firstDiv.innerHTML;
      }
      
      // datetime属性の設定
      setDatetime(timeElement, dateText);
      
      // timeタグをpタグに追加
      pElement.appendChild(timeElement);
      
      // 最初のdivを削除
      firstDiv.remove();
    }
    
    // 残りの要素をpタグに処理して追加
    processNestedPTags(row, pElement);
    
    // 要素を組み立て
    article.appendChild(pElement);
    li.appendChild(article);
    ul.appendChild(li);
  });
  
  // 元のブロックを置き換え
  block.innerHTML = '';
  block.appendChild(ul);
};
