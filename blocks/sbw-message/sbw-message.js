/**
 * sbw-messageブロックの装飾
 * @param {HTMLElement} block 
 */
export default function decorate(block) {
  const section = block.closest('.section');
  if (!section) return;
  
  // セクションにクラスを追加
  section.classList.add('sbw-section-message');
  
  // 最初の行のp要素とh2要素をhgroupに包む
  const firstRow = block.children[0];
  if (firstRow) {
    const firstRowContent = firstRow.children[0];
    if (firstRowContent) {
      const pElement = firstRowContent.querySelector('p');
      const h2Element = firstRowContent.querySelector('h2');
      
      if (pElement && h2Element) {
        // hgroupを作成
        const hgroup = document.createElement('hgroup');
        
        // pとh2をhgroupに移動
        hgroup.appendChild(pElement.cloneNode(true));
        hgroup.appendChild(h2Element.cloneNode(true));
        
        // 元の内容を削除
        firstRowContent.innerHTML = '';
        
        // hgroupを追加
        firstRowContent.appendChild(hgroup);
      }
    }
  }
  
  // 2行目にクラスを追加
  const secondRow = block.children[1];
  if (secondRow) {
    secondRow.classList.add('sbw-message-contents');
    
    // 画像とテキストのdivにクラスを追加
    const imgDiv = secondRow.children[0];
    if (imgDiv) {
      imgDiv.classList.add('sbw-message-img');
    }
    
    const textDiv = secondRow.children[1];
    if (textDiv) {
      textDiv.classList.add('sbw-message-text');
    }
  }
}
