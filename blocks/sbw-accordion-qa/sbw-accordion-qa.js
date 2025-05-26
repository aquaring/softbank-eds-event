export default function decorate(block) {
  // .sbw-accordion-qaクラスの直下にあるdivに.sbw-accordion-qa-itemクラスを付与
  [...block.children].forEach((row) => {
    row.classList.add('sbw-accordion-qa-item');

    // 各アイテム内の子要素にクラスを付与
    const children = [...row.children];
    if (children.length >= 1) {
      children[0].classList.add('question-txt');

      // クリックイベントを追加
      children[0].addEventListener('click', () => {
        // 開閉状態を切り替え
        row.classList.toggle('-open');
      });
    }
    if (children.length >= 2) {
      children[1].classList.add('answer-txt');
    }

    // aタグからbuttonクラスを削除
    row.querySelectorAll('a').forEach((link) => {
      if (link.classList.contains('button')) {
        link.classList.remove('button');
      }
    });
    
    // tdの中にstrongタグがある場合、tdをthに変換
    row.querySelectorAll('td').forEach((td) => {
      if (td.querySelector('strong')) {
        const th = document.createElement('th');
        th.innerHTML = td.innerHTML;
        th.className = td.className;
        td.parentNode.replaceChild(th, td);
      }
    });
  });
}