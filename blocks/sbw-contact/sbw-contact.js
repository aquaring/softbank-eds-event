/**
 * sbw-contactブロックのDOM操作を行う関数
 * @param {HTMLElement} block - sbw-contactブロックのルート要素
 */
export default function decorate(block) {

  // 最初のdivにheaderクラスを設定する
  const setHeaderClass = (element) => {
    const firstDiv = element.querySelector(':scope > div:first-child');
    if (firstDiv) {
      firstDiv.classList.add('sbw-contact-header');
    }
  };

  // 2番目以降のdivをsbw-contact-innerで囲む
  const wrapInner = (element) => {
    const divs = Array.from(element.querySelectorAll(':scope > div:not(:first-child)'));

    if (divs.length > 0) {
      const wrapper = document.createElement('div');
      wrapper.className = 'sbw-contact-inner';

      divs.forEach(div => {
        element.removeChild(div);
        wrapper.appendChild(div);
      });

      element.appendChild(wrapper);

      // ボタン数に応じたクラスを追加
      addButtonCountClass(element, divs.length);
    }
  };

  /**
   * ボタン数に応じたクラスを追加する
   * @param {HTMLElement} element - 親要素
   * @param {number} buttonCount - ボタンの数
   */
  const addButtonCountClass = (element, buttonCount) => {
    // ボタン数に応じたクラスを追加
    if (buttonCount > 0 && buttonCount <= 5) {
      element.classList.add(`button${buttonCount}`);
    }
  };

  /**
   * ボタンのスタイルを装飾する（ボタン単体用）
   * @param {HTMLElement} element - 親要素
   */
  const decorateButtons = (element) => {
    element.querySelectorAll('a').forEach((a) => {
      a.title = a.title || a.textContent;
      if (a.href !== a.textContent) {
        const up = a.parentElement;
        const twoup = a.parentElement.parentElement;
        if (!a.querySelector('img')) {
          if (up.childNodes.length === 1 && (up.tagName === 'P' || up.tagName === 'DIV')) {
            a.className = 'button'; // default
            up.classList.add('button-container');
          }
          if (
            up.childNodes.length === 1
            && up.tagName === 'STRONG'
            && twoup.childNodes.length === 1
            && (twoup.tagName === 'P' || twoup.tagName === 'DIV')
          ) {
            a.className = 'button primary';
            twoup.classList.add('button-container');
          }
          if (
            up.childNodes.length === 1
            && up.tagName === 'EM'
            && twoup.childNodes.length === 1
            && (twoup.tagName === 'P' || twoup.tagName === 'DIV')
          ) {
            a.className = 'button secondary';
            twoup.classList.add('button-container');
          }
        }
      }
    });

    // Tertiaryボタンの処理
    element.querySelectorAll('p > strong > em > a').forEach((a) => {
      const em = a.parentElement;
      const strong = em.parentElement;
      const p = strong.parentElement;

      if (
        // 各要素が単一の子要素のみを持つことを確認
        em.childNodes.length === 1
        && strong.childNodes.length === 1
        && p.childNodes.length === 1
      ) {
        a.className = 'button tertiary';
        p.classList.add('button-container');
      }
    });
  };

  // 各処理を実行
  setHeaderClass(block);
  wrapInner(block);
  decorateButtons(block);
}
