import { createOptimizedPicture } from '../../scripts/aem.js';

export default async function decorate(block) {
  // 各要素のクラス名を定義
  const baseClass = 'sbw-card-session';
  const containerClass = `${baseClass}-list`;
  const itemWrapperClass = `${baseClass}-listItem`;
  const itemClass = `${baseClass}-item`;
  const itemInnerClass = `${itemClass}-inner`;
  const itemImageClass = `${itemClass}-image`;
  const itemContentClass = `${itemClass}-content`;
  const itemTagClass = `${itemClass}-tag`;
  const itemTitleClass = `${itemClass}-title`;
  const itemDetailsClass = `${itemClass}-details`;
  const readMoreClass = `${itemClass}-readmore`;
  const itemSpeakersClass = `${itemClass}-speakers`;
  const itemSpeakersItemClass = `${itemSpeakersClass}-item`;

  // セッションのデータを格納する配列
  let sessionData = [];
  const sessionInfoTable = 'sbw-session-information';
  const sessionSpeakers = 'sbw-featured-session-modal-person';

  // 画像サイズの出しわけ設定
  const breakpoints = [
    { media: '(min-width: 1200px)', width: '2000' },
    { width: '600' }
  ];

  // containerをulに変更
  const container = document.createElement('ul');
  container.className = containerClass;

  // 非同期処理をPromise.allで待機
  await Promise.all([...block.children].map(async (row) => {
    if (row.children[0].innerText.startsWith('/shared-')) {
      const jsonPath = row.children[0].innerText;
      const displayId = row.children[1].innerText;
      
      try {
        const response = await fetch(`${jsonPath}.json`);
        const jsonData = await response.json();
        
        if (jsonData.data.length > 0) {
          // displayIdに対応するデータを抽出
          const filteredData = jsonData.data.filter(item => item[displayId] === "true");
          sessionData = filteredData;
          
          // 各セッションのHTMLを取得
          const sessionPromises = await Promise.all(sessionData.map(async (session) => {
            try {
              const sessionResponse = await fetch(session.path);
              const htmlContent = await sessionResponse.text();
              
              // HTMLをパース
              const parser = new DOMParser();
              const doc = parser.parseFromString(htmlContent, 'text/html');
              
              // セッション情報を取得
              const sessionInfoDivs = doc.querySelectorAll(`.${sessionInfoTable} > div`);
              const sessionInfo = {
                tag: '',
                title: '',
                description: '',
                caption: '',
                link: ''
              };

              sessionInfoDivs.forEach(div => {
                const key = div.querySelector('div:first-child')?.textContent?.trim();
                const value = div.querySelector('div:last-child');
                
                if (key && value) {
                  switch (key) {
                    case 'tag':
                      sessionInfo.tag = value.textContent.trim();
                      break;
                    case 'title':
                      sessionInfo.title = value.textContent.trim();
                      break;
                    case 'description':
                      sessionInfo.description = value.textContent.trim();
                      break;
                    case 'caption':
                      sessionInfo.caption = value.textContent.trim();
                      break;
                    case 'link':
                      const link = value.querySelector('a');
                      sessionInfo.link = link?.getAttribute('href') || '';
                      break;
                  }
                }
              });

              // スピーカー情報を取得
              const speakers = Array.from(doc.querySelectorAll(`.${sessionSpeakers} > div`)).map(speaker => {
                const picture = speaker.querySelector('picture');
                const img = picture?.querySelector('img');
                const divs = speaker.querySelectorAll('div');
                return {
                  image: img?.src || '',
                  company: divs[1]?.textContent?.trim() || '',
                  name: divs[2]?.textContent?.trim() || ''
                };
              });

              return {
                ...session,
                sessionInfo,
                speakers
              };
            } catch (error) {
              console.error(`Error fetching ${session.path}:`, error);
              return session;
            }
          }));

          // セッションデータを使用してDOMを構築
          for (const session of sessionPromises) {

            const listItem = document.createElement('li');
            listItem.className = itemWrapperClass;
            
            const article = document.createElement('article');
            const card = document.createElement('a');
            card.className = itemClass;
            
            const cardInner = document.createElement('div');
            cardInner.className = itemInnerClass;

            // 画像セクションの処理
            const imageSection = row.children[0];
            if (imageSection) {
              const imageSectionClone = imageSection.cloneNode(true);
              imageSectionClone.className = itemImageClass;
              cardInner.appendChild(imageSectionClone);
            }

            // コンテンツコンテナの作成
            const contentContainer = document.createElement('div');
            contentContainer.className = itemContentClass;

            // タグの処理
            if (session.sessionInfo.tag) {
              const tagElement = document.createElement('p');
              tagElement.className = itemTagClass;
              tagElement.textContent = session.sessionInfo.tag;
              contentContainer.appendChild(tagElement);
            }
            
            // タイトルの処理
            if (session.sessionInfo.title) {
              const titleElement = document.createElement('h3');
              titleElement.className = itemTitleClass;
              titleElement.textContent = session.sessionInfo.title;
              contentContainer.appendChild(titleElement);
            }

            // 詳細テキストの処理
            if (session.sessionInfo.description) {
              const detailsElement = document.createElement('div');
              detailsElement.className = itemDetailsClass;
              detailsElement.innerHTML = session.sessionInfo.description;
              
              const paragraphs = detailsElement.querySelectorAll('p');
              paragraphs.forEach(p => {
                let classAdded = false;
                
                if (p.querySelector('strong')) {
                  p.classList.add('sbw-card-session-item-name');
                  classAdded = true;
                }
                
                if (p.querySelector('em')) {
                  p.classList.add('sbw-card-session-item-note');
                  classAdded = true;
                }
                
                if (!classAdded) {
                  p.classList.add('sbw-card-session-item-text');
                }
              });
              
              contentContainer.appendChild(detailsElement);
            }

            // 登壇者の処理
            if (session.speakers.length > 0) {
              const speakersWrapper = document.createElement('div');
              speakersWrapper.className = itemSpeakersClass;

              session.speakers.forEach(speaker => {
                const speakerElement = document.createElement('div');
                speakerElement.className = itemSpeakersItemClass;
                speakerElement.innerHTML = `
                  <div class="sbw-card-session-item-speakers-image">
                    <img src="${speaker.image}" alt="${speaker.name}">
                  </div>
                  <div class="sbw-card-session-item-speakers-name">${speaker.name}</div>
                `;
                speakersWrapper.appendChild(speakerElement);
              });
              contentContainer.appendChild(speakersWrapper);
            }

            // リンクの処理
            card.href = session.path || '#';

            // DOMの構築を完了
            cardInner.appendChild(contentContainer);
            card.appendChild(cardInner);
            
            // Read moreテキストを追加
            const readMoreElement = document.createElement('div');
            readMoreElement.className = readMoreClass;
            
            const readMoreText = document.createElement('span');
            readMoreText.textContent = 'Read more';
            
            const readMoreIcon = document.createElement('span');
            readMoreIcon.className = `${readMoreClass}-icon`;
            
            readMoreElement.appendChild(readMoreText);
            readMoreElement.appendChild(readMoreIcon);
            card.appendChild(readMoreElement);
            
            article.appendChild(card);
            listItem.appendChild(article);
            container.appendChild(listItem);
          }
        }
      } catch (error) {
        console.error('Error loading or processing JSON:', error);
      }
    }
  }));

  // pictureを最適化
  container.querySelectorAll('picture > img').forEach((img) => {
    const picture = img.closest('picture');
    picture.replaceWith(createOptimizedPicture(img.src, img.alt, false, breakpoints));
  });
  
  // blockに追加
  block.innerHTML = '';
  block.append(container);
}