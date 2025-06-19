export default function decorate(block) {
  // 各要素のクラス名を定義
  const baseClass = 'sbw-session-information';
  const itemClass = `${baseClass}-item`;

  // セッション情報テーブルの要素を取得
  const sessionInfoTable = block.querySelectorAll(`.${baseClass} > div`);
  sessionInfoTable.forEach(data => {
    data.classList.add(itemClass);
    const dataElement = data.children[0];
    const dataTitle = dataElement.textContent;
    dataElement.remove();
    data.classList.add(dataTitle);

    // dataTitleの値に応じて異なる処理を実行
    switch (dataTitle) {
      case 'tag':
        // tagの処理
        const tagDiv = data.querySelector('div');
        if (tagDiv) {
          const tagContent = tagDiv.innerHTML;
          tagDiv.remove();
          data.innerHTML = tagContent;
        }
        break;
      case 'title':
        const titleTag = document.createElement('h2');
        const titleElement = data.querySelector('p');
        titleTag.textContent = titleElement.textContent;
        titleElement.closest('div').remove();
        data.appendChild(titleTag);
        break;
      case 'description':
        // descriptionの処理
        const descDiv = data.querySelector('div');
        if (descDiv) {
          const descContent = descDiv.innerHTML;
          descDiv.remove();
          data.innerHTML = descContent;
        }
        break;
      case 'caption':
        // captionの処理
        const captionDiv = data.querySelector('div');
        if (captionDiv) {
          const captionContent = captionDiv.innerHTML;
          captionDiv.remove();
          data.innerHTML = captionContent;
        }
        break;
      case 'link':
        // linkの処理
        const linkDiv = data.querySelector('div');
        if (linkDiv) {
          const linkContent = linkDiv.innerHTML;
          linkDiv.remove();
          data.innerHTML = linkContent;
          
          // tertiaryボタンの装飾
          const linkAnchor = data.querySelector('p > strong > em > a');
          if (linkAnchor) {
            const p = linkAnchor.parentElement.parentElement.parentElement;
            if (
              linkAnchor.parentElement.tagName === 'EM'
              && linkAnchor.parentElement.parentElement.tagName === 'STRONG'
              && p.tagName === 'P'
            ) {
              linkAnchor.className = 'button tertiary';
              p.classList.add('button-container');
            }
          }
        }
        break;
      default:
        // デフォルトの処理
        console.log(`Unknown dataTitle: ${dataTitle}`);
    }
  });
}
