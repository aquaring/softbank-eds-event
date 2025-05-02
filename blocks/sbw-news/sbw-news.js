export default function decorate() {
  document.querySelectorAll(".sbw-news > div").forEach((newsItem) => {
    // news--innerクラスを追加
    newsItem.classList.add("sbw-news-inner");

    const linkElement = newsItem.querySelector("a");
    if (linkElement) {
      const url = linkElement.getAttribute("href");
      const titleText = linkElement.getAttribute("title");
      // .button-containerを削除
      const buttonContainers = newsItem.querySelectorAll(".button-container");
      buttonContainers.forEach((buttonContainer) => {
        buttonContainer.remove();
      });
      // リンク要素内のボタンコンテナも削除
      const linkButtonContainers = linkElement.querySelectorAll(".button-container");
      linkButtonContainers.forEach((buttonContainer) => {
        buttonContainer.remove();
      });

      // 新しい<a>タグを作成し、news-item-linkをラップ
      const wrapper = document.createElement("a");
      wrapper.href = url;
      wrapper.className = "sbw-news-item-link";
      wrapper.title = titleText;

      // titleの文言を<p>タグで追加
      if (titleText) {
        const titleParagraph = document.createElement("p");
        titleParagraph.className = "sbw-news-title";
        titleParagraph.textContent = titleText;
        newsItem.appendChild(titleParagraph);
      }

      // 元の<a>タグを削除
      linkElement.remove();

      // newsItemを<a>の中に移動
      newsItem.replaceWith(wrapper);
      wrapper.appendChild(newsItem);
    }
  });

  // スクロールバーが表示されている場合のみpadding-rightを追加
  const newsBlocks = document.querySelectorAll('.sbw-news.scroll.block');
  newsBlocks.forEach((newsBlock) => {
    // ResizeObserverを使用して要素のサイズ変更を監視
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { target } = entry;
        // スクロールバーが表示されているかチェック
        if (target.scrollHeight > target.clientHeight) {
          // スクロールバーが表示されている場合、padding-rightを追加
          target.style.paddingRight = '8px';
        } else {
          // スクロールバーが表示されていない場合、padding-rightを削除
          target.style.paddingRight = '0';
        }
      }
    });

    // 監視開始
    resizeObserver.observe(newsBlock);
  });
};
