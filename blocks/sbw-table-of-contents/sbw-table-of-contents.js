/**
 * 目次を作成する関数
 * @param {HTMLElement} block - 目次ブロック要素
 */
function createTableOfContents(block) {
  // 既に目次が作成されている場合はスキップ
  if (block.querySelector('ul')) return;

  const headings = document.querySelectorAll('main h2.sbw-subpage-section-title');
  if (headings.length === 0) return;

  const currentUrl = window.location.href.split('#')[0];
  const ul = document.createElement('ul');

  headings.forEach((heading) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    
    a.href = `${currentUrl}#${heading.id}`;
    a.title = heading.textContent;
    a.textContent = heading.textContent;
    
    li.appendChild(a);
    ul.appendChild(li);
  });

  block.appendChild(ul);
}

/**
 * 目次ブロックをデコレートする関数
 * @param {HTMLElement} block - 目次ブロック要素
 */
export default function decorate(block) {
  const observer = new MutationObserver((mutations) => {
    const hasTargetHeading = mutations.some((mutation) => 
      mutation.type === 'childList' && 
      Array.from(mutation.addedNodes).some((node) => 
        node.nodeType === Node.ELEMENT_NODE && (
          node.matches?.('h2.sbw-subpage-section-title') ||
          node.querySelector?.('h2.sbw-subpage-section-title')
        )
      )
    );

    if (hasTargetHeading) {
      createTableOfContents(block);
      observer.disconnect();
    }
  });

  const main = document.querySelector('main');
  if (main) {
    observer.observe(main, {
      childList: true,
      subtree: true
    });
  }
}
