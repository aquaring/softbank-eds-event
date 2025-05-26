export default function decorate(block) {
  // pタグを囲むdivタグとdiv > div構造を削除
  function removeDivsAroundP(element) {
    if (!element?.children) return;
    
    let changed = true;
    while (changed) {
      changed = false;
      
      [...element.children].forEach((child) => {
        if (!child) return;
        
        if (child.tagName === 'DIV') {
          const firstChild = child.firstElementChild;
          
          // divの直下にpタグがある場合
          if (child.children.length === 1 && firstChild?.tagName === 'P') {
            element.insertBefore(firstChild, child);
            child.remove();
            changed = true;
          } 
          // div > divの場合
          else if (child.children.length === 1 && firstChild?.tagName === 'DIV') {
            while (firstChild.firstChild) {
              element.insertBefore(firstChild.firstChild, child);
            }
            child.remove();
            changed = true;
          }
          // その他のdivは再帰的に処理
          else {
            removeDivsAroundP(child);
          }
        }
      });
    }
  }

  // pタグの中にaタグがある場合、そのpタグを削除
  function removePTagsAroundLinks(element) {
    if (!element?.children) return;
    
    [...element.querySelectorAll('p')].forEach((p) => {
      if (p.querySelectorAll('a').length > 0 && p.parentElement) {
        while (p.firstChild) {
          p.parentElement.insertBefore(p.firstChild, p);
        }
        p.remove();
      }
    });
  }

  // sbw-partners-link直下のaタグの中のdivタグを削除
  function removeDivsInPartnerLinks() {
    block.querySelectorAll('.sbw-partners-link').forEach((partnerLink) => {
      const links = [...partnerLink.children].filter(child => child.tagName === 'A');
      
      links.forEach((link) => {
        [...link.children].filter(child => child.tagName === 'DIV').forEach((div) => {
          while (div.firstChild) {
            link.insertBefore(div.firstChild, div);
          }
          div.remove();
        });
      });
    });
  }

  // 連続したdivタグをliタグに変換し、ulで囲む
  function convertDivsToLiWithClass(element) {
    if (!element?.children) return;
    
    const children = [...element.children];
    let currentDivGroup = [];
    let replacements = [];
    
    // divタグをグループ化
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      
      if (child.tagName === 'DIV') {
        currentDivGroup.push(child);
      } else if (currentDivGroup.length > 0) {
        replacements.push({ divs: [...currentDivGroup] });
        currentDivGroup = [];
      }
    }
    
    if (currentDivGroup.length > 0) {
      replacements.push({ divs: [...currentDivGroup] });
    }
    
    replacements.reverse().forEach(({ divs }) => {
      const ul = document.createElement('ul');
      ul.className = 'sbw-partners-list';
      
      divs.forEach((div) => {
        const li = document.createElement('li');
        li.className = 'sbw-partners-link';
        
        while (div.firstChild) {
          li.appendChild(div.firstChild);
        }
        
        ul.appendChild(li);
      });
      
      if (divs[0]?.parentElement) {
        element.insertBefore(ul, divs[0]);
        divs.forEach(div => div.remove());
      }
    });
  }

  // sbw-partners-linkクラスの直下にdivとaタグがある場合、aタグでdivを囲む
  function wrapDivsWithLinks() {
    block.querySelectorAll('.sbw-partners-link').forEach((partnerLink) => {
      const divs = [...partnerLink.children].filter(child => child.tagName === 'DIV');
      const links = [...partnerLink.children].filter(child => child.tagName === 'A');
      
      if (divs.length > 0 && links.length > 0) {
        const link = links[0];
        const href = link.getAttribute('href');
        const target = link.getAttribute('target') || '_blank';
        const rel = link.getAttribute('rel') || 'noopener noreferrer';
        
        divs.forEach((div) => {
          const newLink = document.createElement('a');
          newLink.setAttribute('href', href);
          newLink.setAttribute('target', target);
          newLink.setAttribute('rel', rel);
          
          partnerLink.insertBefore(newLink, div);
          newLink.appendChild(div);
        });
        
        links.forEach(link => link.remove());
      }
    });
  }

  removeDivsAroundP(block);
  removePTagsAroundLinks(block);
  
  // h3タグにクラスを追加
  block.querySelectorAll('h3').forEach((h3) => {
    if (h3.parentElement === block) {
      h3.classList.add('sbw-partners-title');
    }
  });
  
  convertDivsToLiWithClass(block);
  wrapDivsWithLinks();
  removeDivsInPartnerLinks();
}