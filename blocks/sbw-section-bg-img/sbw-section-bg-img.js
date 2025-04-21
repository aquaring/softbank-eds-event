export default function decorate(block) {
  // 親セクションを取得
  const section = block.closest('.section');
  
  if (section) {
    // セクションのクラスを追加
    section.classList.add('sbw-section-bg-img-container');
    
    // 内側コンテナを作成
    const innerContainer = document.createElement('div');
    innerContainer.className = 'sbw-section-bg-img-container-inner';
    
    // inner-sクラスの確認と付与
    if (block.classList.contains('inner-s')) {
      innerContainer.classList.add('inner-s');
    }
    
    // セクション内の全ての子要素を保存（block自体も含む）
    const children = Array.from(section.children);
    
    // セクション内を空にする（innerContainerだけを入れるため）
    while (section.firstChild) {
      section.removeChild(section.firstChild);
    }
    
    // 内側コンテナをセクションに追加
    section.appendChild(innerContainer);
    
    // 保存した子要素を内側コンテナに追加
    children.forEach(child => {
      innerContainer.appendChild(child);
    });
    
    // 以下はblockの内部処理なので、変更なし
    // コンテンツ用のコンテナを作成
    const contentContainer = document.createElement('div');
    contentContainer.className = 'sbw-section-bg-img-content';
    
    // 画像要素を探す
    const imgElement = block.querySelector('img');
    if (imgElement) {
      // 画像を含む親要素（picture要素など）を探す
      const pictureElement = imgElement.closest('picture') || imgElement.parentElement;
      
      // picture要素の親divを作成し、bg-imgクラスを付与
      const bgImgDiv = document.createElement('div');
      bgImgDiv.className = 'bg-img';
      
      // 画像を移動
      const pictureParent = pictureElement.parentElement;
      pictureParent.removeChild(pictureElement);
      
      // 親要素が空になった場合、削除する
      if (pictureParent !== block && pictureParent.children.length === 0 && 
          !pictureParent.textContent.trim()) {
        pictureParent.parentElement.removeChild(pictureParent);
      }
      
      bgImgDiv.appendChild(pictureElement);
      
      // bg-imgをコンテンツコンテナに追加
      contentContainer.appendChild(bgImgDiv);
    } else {
      // 画像がない場合は黒背景用クラスを追加
      block.classList.add('no-bg-img');
    }
    
    // 残りの全ての子要素をコンテンツコンテナに移動し、空のdivは削除
    while (block.firstChild) {
      const child = block.firstChild;
      
      // 空のdiv要素をスキップ
      if (child.tagName === 'DIV' && child.children.length === 0 && 
          !child.textContent.trim()) {
        block.removeChild(child);
        continue;
      }
      
      contentContainer.appendChild(child);
    }
    
    // コンテナをブロックに追加
    block.appendChild(contentContainer);
    
    // h1を含むdivにクラスを追加
    const h1Element = contentContainer.querySelector('h1');
    if (h1Element) {
      const h1Parent = h1Element.closest('div');
      if (h1Parent && h1Parent !== contentContainer) {
        h1Parent.classList.add('sbw-section-bg-img-content-title');
      }
    }
    
    // pタグを含むdivにクラスを追加
    const pElements = contentContainer.querySelectorAll('p');
    pElements.forEach(pElement => {
      const pParent = pElement.closest('div');
      if (pParent && 
          pParent !== contentContainer && 
          !pParent.classList.contains('bg-img') &&
          !pParent.classList.contains('sbw-section-bg-img-content-title')) {
        pParent.classList.add('sbw-section-bg-img-content-text');
      }
    });
    
    // inner-sクラスがある場合、特定のクラス以外の要素をdivで囲む
    if (innerContainer.classList.contains('inner-s')) {
      // default-content-wrapperとsbw-section-bg-img-wrapper以外の要素を取得
      const elementsToWrap = [];
      const excludedClasses = ['default-content-wrapper', 'sbw-section-bg-img-wrapper'];
      
      // innerContainerの子要素を全て確認
      Array.from(innerContainer.children).forEach(child => {
        // childが直接特定のクラスを持つ場合、または特定のクラスを持つ要素を含む場合はスキップ
        let shouldSkip = false;
        excludedClasses.forEach(className => {
          if (child.classList.contains(className) || child.querySelector(`.${className}`)) {
            shouldSkip = true;
          }
        });
        
        if (!shouldSkip) {
          elementsToWrap.push(child);
        }
      });
      
      // 対象要素があれば、新しいdivで囲む
      if (elementsToWrap.length > 0) {
        const wrapperDiv = document.createElement('div');
        wrapperDiv.className = 'inner-s-wrapper';
        
        // 要素を新しいdivに移動
        elementsToWrap.forEach(element => {
          innerContainer.removeChild(element);
          wrapperDiv.appendChild(element);
        });
        
        // 作成したdivをinnerContainerに追加
        innerContainer.appendChild(wrapperDiv);
      }
    }
  }
}