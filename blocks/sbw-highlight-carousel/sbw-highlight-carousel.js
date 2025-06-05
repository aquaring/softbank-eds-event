import { fetchPlaceholders } from '../../scripts/aem.js';

// button-containerクラスのdivからhrefを取得し、削除する関数
function removeButtonContainer(block) {
  const buttonContainers = block.querySelectorAll('.button-container');

  buttonContainers.forEach((buttonContainer) => {
    buttonContainer.remove(); // divを削除
  });
}

function updateActiveSlide(slide) {
  const block = slide.closest('.sbw-highlight-carousel');
  if (!block) return;
  
  // ダミースライドの場合は処理しない
  if (slide.classList.contains('dummy-slide')) return;
  
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.sbw-highlight-carousel-slide:not(.dummy-slide)');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    if (idx === slideIndex) {
      aSlide.classList.add('active');
      // 必要に応じてアニメーションのリセット
      aSlide.style.animation = 'none';
      aSlide.offsetHeight; // リフロー強制
      aSlide.style.animation = null;
    } else {
      aSlide.classList.remove('active');
    }
    
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.sbw-highlight-carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

// ダミースライドが含まれるカルーセルを初期化
function initializeCarouselWithClones(block) {
  const slidesWrapper = block.querySelector('.sbw-highlight-carousel-slides');
  const slides = Array.from(block.querySelectorAll('.sbw-highlight-carousel-slide:not(.dummy-slide)'));
  const allSlides = block.querySelectorAll('.sbw-highlight-carousel-slide');
  const totalRealSlides = slides.length;
  
  if (!slides.length || !slidesWrapper) return;
  
  // パフォーマンスのため、scrollLeftの設定前にスムーズスクロールを無効化
  slidesWrapper.style.scrollBehavior = 'auto';
  
  // スライドの幅を取得（マージンを含む）
  const slideWidth = slides[0].offsetWidth;
  const slideStyle = window.getComputedStyle(slides[0]);
  const slideMarginLeft = parseInt(slideStyle.marginLeft || '0', 10);
  const slideMarginRight = parseInt(slideStyle.marginRight || '0', 10);
  const slideFullWidth = slideWidth + slideMarginLeft + slideMarginRight;
  
  // 初期位置を設定（最初のスライドを表示）
  const realFirstSlide = slides[0];
  const realFirstSlideCenter = realFirstSlide.offsetLeft + (realFirstSlide.offsetWidth / 2);
  const containerCenter = slidesWrapper.offsetWidth / 2;
  slidesWrapper.scrollLeft = realFirstSlideCenter - containerCenter;
  
  // 初期状態のアクティブスライド設定
  block.dataset.activeSlide = 0;
  slides[0].classList.add('active');
  slides[0].style.opacity = '1';
  slides[0].style.zIndex = '1';
  
  // スムーズスクロールを有効に戻す（遅延して適用することでちらつきを防止）
  setTimeout(() => {
    slidesWrapper.style.scrollBehavior = 'smooth';
  }, 50);
}

// スライド切り替えの一時的なロックを管理するための変数
let isSlideTransitionLocked = false;

function showSlide(block, slideIndex = 0, instant = false) {
  // スライド切り替え中の場合は処理をスキップ
  if (isSlideTransitionLocked) return;
  
  const slides = block.querySelectorAll('.sbw-highlight-carousel-slide:not(.dummy-slide)');
  const slidesWrapper = block.querySelector('.sbw-highlight-carousel-slides');
  const allSlides = Array.from(block.querySelectorAll('.sbw-highlight-carousel-slide'));
  const totalSlides = slides.length;

  if (!slides.length || !slidesWrapper) return;

  // 現在のアクティブスライドインデックス
  const currentActiveIndex = parseInt(block.dataset.activeSlide || '0', 10);
  
  // 範囲外のインデックスを正規化
  let realSlideIndex = slideIndex;
  if (slideIndex >= totalSlides) {
    realSlideIndex = 0;
  } else if (slideIndex < 0) {
    realSlideIndex = totalSlides - 1;
  }

  // インジケーターの更新
  const indicators = block.querySelectorAll('.sbw-highlight-carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx === realSlideIndex) {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    } else {
      indicator.querySelector('button').removeAttribute('disabled');
    }
  });

  // スライド表示の更新
  allSlides.forEach((slide) => {
    slide.classList.remove('active');
    slide.style.opacity = '0.5';
    slide.style.zIndex = '0';
  });
  
  // 特殊なケース：最初から最後へ、または最後から最初へ
  const isJumpingForward = currentActiveIndex === totalSlides - 1 && realSlideIndex === 0;
  const isJumpingBackward = currentActiveIndex === 0 && realSlideIndex === totalSlides - 1;
  
  let targetSlide;
  
  // トランジションのロックを有効化
  isSlideTransitionLocked = true;
  
  if (isJumpingForward) {
    // 最後のスライドから最初のスライドへ
    // 実際のスライドの前後にあるダミースライドのインデックスを計算
    const dummyFirstIndex = allSlides.findIndex(slide => 
      slide.classList.contains('dummy-slide') && slide.dataset.originalIndex === '0'
    );
    
    if (dummyFirstIndex !== -1) {
      targetSlide = allSlides[dummyFirstIndex];
      targetSlide.classList.add('active');
      targetSlide.style.opacity = '1';
      targetSlide.style.zIndex = '1';
      
      // 滑らかなトランジションのため、少し待ってから実際のスライドに切り替える
      setTimeout(() => {
        slidesWrapper.style.scrollBehavior = 'auto';
        
        // 実際のスライドをアクティブに
        const realSlide = slides[realSlideIndex];
        realSlide.classList.add('active');
        realSlide.style.opacity = '1';
        realSlide.style.zIndex = '1';
        
        // 実際のスライドに即座にスクロール
        const realSlideCenter = realSlide.offsetLeft + (realSlide.offsetWidth / 2);
        const containerCenter = slidesWrapper.offsetWidth / 2;
        slidesWrapper.scrollLeft = realSlideCenter - containerCenter;
        
        // スクロール動作を元に戻す
        setTimeout(() => {
          slidesWrapper.style.scrollBehavior = 'smooth';
          isSlideTransitionLocked = false; // ロック解除
        }, 50);
      }, 500); // トランジション完了を待つ
      
      // 先にスクロール位置を計算
      const slideCenter = targetSlide.offsetLeft + (targetSlide.offsetWidth / 2);
      const containerCenter = slidesWrapper.offsetWidth / 2;
      const scrollPosition = slideCenter - containerCenter;
      
      slidesWrapper.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
    } else {
      targetSlide = slides[realSlideIndex];
      targetSlide.classList.add('active');
      targetSlide.style.opacity = '1';
      targetSlide.style.zIndex = '1';
      isSlideTransitionLocked = false; // ロック解除
    }
  } else if (isJumpingBackward) {
    // 最初のスライドから最後のスライドへ
    // 実際のスライドの前後にあるダミースライドのインデックスを計算
    const dummyLastIndex = allSlides.findIndex(slide => 
      slide.classList.contains('dummy-slide') && slide.dataset.originalIndex === (totalSlides - 1).toString()
    );
    
    if (dummyLastIndex !== -1) {
      targetSlide = allSlides[dummyLastIndex];
      targetSlide.classList.add('active');
      targetSlide.style.opacity = '1';
      targetSlide.style.zIndex = '1';
      
      // 滑らかなトランジションのため、少し待ってから実際のスライドに切り替える
      setTimeout(() => {
        slidesWrapper.style.scrollBehavior = 'auto';
        
        // 実際のスライドをアクティブに
        const realSlide = slides[realSlideIndex];
        realSlide.classList.add('active');
        realSlide.style.opacity = '1';
        realSlide.style.zIndex = '1';
        
        // 実際のスライドに即座にスクロール
        const realSlideCenter = realSlide.offsetLeft + (realSlide.offsetWidth / 2);
        const containerCenter = slidesWrapper.offsetWidth / 2;
        slidesWrapper.scrollLeft = realSlideCenter - containerCenter;
        
        // スクロール動作を元に戻す
        setTimeout(() => {
          slidesWrapper.style.scrollBehavior = 'smooth';
          isSlideTransitionLocked = false; // ロック解除
        }, 50);
      }, 500); // トランジション完了を待つ
      
      // 先にスクロール位置を計算
      const slideCenter = targetSlide.offsetLeft + (targetSlide.offsetWidth / 2);
      const containerCenter = slidesWrapper.offsetWidth / 2;
      const scrollPosition = slideCenter - containerCenter;
      
      slidesWrapper.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
    } else {
      targetSlide = slides[realSlideIndex];
      targetSlide.classList.add('active');
      targetSlide.style.opacity = '1';
      targetSlide.style.zIndex = '1';
      isSlideTransitionLocked = false; // ロック解除
    }
  } else {
    // 通常の移動
    targetSlide = slides[realSlideIndex];
    targetSlide.classList.add('active');
    targetSlide.style.opacity = '1';
    targetSlide.style.zIndex = '1';

    // スクロール位置の計算（通常の移動の場合）
    if (targetSlide && typeof targetSlide.offsetLeft === 'number') {
      // 中央に表示するためのスクロール位置を計算
      const slideCenter = targetSlide.offsetLeft + (targetSlide.offsetWidth / 2);
      const containerCenter = slidesWrapper.offsetWidth / 2;
      const scrollPosition = slideCenter - containerCenter;
      
      slidesWrapper.scrollTo({
        left: scrollPosition,
        behavior: instant ? 'auto' : 'smooth',
      });
      
      // 通常の移動では短めの遅延でロック解除
      setTimeout(() => {
        isSlideTransitionLocked = false;
      }, 300);
    } else {
      isSlideTransitionLocked = false; // エラー時にロック解除
    }
  }

  block.dataset.activeSlide = realSlideIndex;
  
  // イベント発火によるアナリティクスなどの処理のため
  const slideChangeEvent = new CustomEvent('sbwCarouselSlideChange', { 
    detail: { 
      blockId: block.id,
      slideIndex: realSlideIndex,
      totalSlides: totalSlides 
    } 
  });
  document.dispatchEvent(slideChangeEvent);
}

// 自動再生のタイマーIDを保持する変数
let autoplayTimerId = null;

// 自動再生を開始する関数
function startAutoplay(block, interval = 5000) {
  if (autoplayTimerId) {
    clearInterval(autoplayTimerId);
  }
  
  autoplayTimerId = setInterval(() => {
    const currentSlideIndex = parseInt(block.dataset.activeSlide || '0', 10);
    showSlide(block, currentSlideIndex + 1);
  }, interval);
}

// 自動再生を停止する関数
function stopAutoplay() {
  if (autoplayTimerId) {
    clearInterval(autoplayTimerId);
    autoplayTimerId = null;
  }
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.sbw-highlight-carousel-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
      
      // インジケーター押下時に自動再生を一時停止
      if (autoplayTimerId) {
        stopAutoplay();
        // 一定時間経過後に再開
        setTimeout(() => {
          startAutoplay(block);
        }, 10000);
      }
    });
  });

  const prevButton = block.querySelector('.slide-prev');
  const nextButton = block.querySelector('.slide-next');
  
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
      
      // ボタン押下時に自動再生を一時停止
      if (autoplayTimerId) {
        stopAutoplay();
        // 一定時間経過後に再開
        setTimeout(() => {
          startAutoplay(block);
        }, 10000);
      }
    });
  }
  
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
      
      // ボタン押下時に自動再生を一時停止
      if (autoplayTimerId) {
        stopAutoplay();
        // 一定時間経過後に再開
        setTimeout(() => {
          startAutoplay(block);
        }, 10000);
      }
    });
  }

  // タッチデバイス用のスワイプイベント
  let startX = 0;
  let endX = 0;
  let isSwiping = false;
  let swipeThreshold = 50; // スワイプと判定する最小距離（px）
  let touchStartTime = 0;
  let touchEndTime = 0;
  let velocityThreshold = 0.3; // スワイプと判定する最小速度（px/ms）
  
  const slidesWrapper = block.querySelector('.sbw-highlight-carousel-slides');
  
  slidesWrapper.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    touchStartTime = Date.now();
    isSwiping = true;
    
    // タッチ開始時に自動再生を一時停止
    if (autoplayTimerId) {
      stopAutoplay();
    }
  }, { passive: true });
  
  slidesWrapper.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    endX = e.touches[0].clientX;
    
    // オプション: タッチ中のドラッグ効果をここに追加できます
  }, { passive: true });
  
  slidesWrapper.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    
    endX = e.changedTouches[0].clientX;
    touchEndTime = Date.now();
    
    const touchDuration = touchEndTime - touchStartTime;
    const diff = startX - endX;
    const velocity = Math.abs(diff) / touchDuration; // px/ms
    
    // スワイプ距離または速度が閾値を超えた場合にのみ次/前のスライドに移動
    if (Math.abs(diff) > swipeThreshold || velocity > velocityThreshold) {
      if (diff > 0) {
        // 左スワイプ（次へ）
        showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
      } else {
        // 右スワイプ（前へ）
        showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
      }
    }
    
    isSwiping = false;
    
    // スワイプ後、一定時間経過後に自動再生を再開
    setTimeout(() => {
      if (block.dataset.autoplay === 'true') {
        startAutoplay(block);
      }
    }, 5000);
  }, { passive: true });

  // 通常のスクロールは妨げないようにする（マウスホイールイベントリスナーは削除）
  // カルーセル内でのデフォルトスクロール動作を防止
  slidesWrapper.addEventListener('scroll', (e) => {
    e.preventDefault();
  }, { passive: false });

  // スライドが画面内に入ったときの処理
  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // 中央付近に表示されたスライドをアクティブに
      if (entry.isIntersecting && entry.intersectionRatio > 0.8 && !entry.target.classList.contains('dummy-slide')) {
        updateActiveSlide(entry.target);
      }
    });
  }, { threshold: [0.8] });
  
  block.querySelectorAll('.sbw-highlight-carousel-slide:not(.dummy-slide)').forEach((slide) => {
    slideObserver.observe(slide);
  });
  
  // カルーセル全体の可視性観察（ページ内に表示されたときに自動再生を開始/停止）
  const carouselVisibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // カルーセルが画面内に入った場合、自動再生を開始
        if (block.dataset.autoplay === 'true') {
          startAutoplay(block);
        }
      } else {
        // カルーセルが画面外に出た場合、自動再生を停止
        stopAutoplay();
      }
    });
  }, { threshold: 0.3 });
  
  carouselVisibilityObserver.observe(block);
  
  // ページがフォーカスを失った時に自動再生を停止
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      // ページが再表示された時に自動再生を再開（オプション）
      if (block.dataset.autoplay === 'true') {
        startAutoplay(block);
      }
    }
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.dataset.originalIndex = slideIndex.toString();
  slide.setAttribute('id', `sbw-highlight-carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('sbw-highlight-carousel-slide');
  if (slideIndex === 0) {
    slide.classList.add('active');
    slide.style.opacity = '1';
    slide.style.zIndex = '1';
  } else {
    slide.style.opacity = '0.5';
    slide.style.zIndex = '0';
  }

  const imageContainer = document.createElement('div');
  imageContainer.classList.add('sbw-highlight-carousel-slide-image');
  
  const contentContainer = document.createElement('div');
  contentContainer.classList.add('sbw-highlight-carousel-slide-content');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    if (colIdx === 0) {
      // 画像コンテナに追加
      imageContainer.append(column);
    } else {
      // テキストコンテナに追加
      contentContainer.append(column);
    }
  });

  slide.appendChild(imageContainer);
  slide.appendChild(contentContainer);

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

function handleResize(block) {
  // リサイズ時にアクティブなスライドを中央に再配置
  const activeSlideIndex = parseInt(block.dataset.activeSlide || '0', 10);
  showSlide(block, activeSlideIndex, true);
}

// アクティブなスライドの周囲にダミースライドを追加する関数
function addDummySlides(block) {
  const slidesWrapper = block.querySelector('.sbw-highlight-carousel-slides');
  const slides = Array.from(block.querySelectorAll('.sbw-highlight-carousel-slide'));
  
  // 最初と最後にダミースライドを追加して無限ループ風に見せる
  if (slides.length > 1) {
    // 最後のスライドのコピーを最初に追加
    const lastSlide = slides[slides.length - 1];
    const firstDummy = lastSlide.cloneNode(true);
    firstDummy.classList.remove('active');
    firstDummy.style.opacity = '0.5';
    firstDummy.style.zIndex = '0';
    firstDummy.classList.add('dummy-slide');
    firstDummy.setAttribute('aria-hidden', 'true');
    firstDummy.dataset.originalIndex = lastSlide.dataset.originalIndex;
    slidesWrapper.prepend(firstDummy);
    
    // 最初のスライドのコピーを最後に追加
    const firstSlide = slides[0];
    const lastDummy = firstSlide.cloneNode(true);
    lastDummy.classList.remove('active');
    lastDummy.style.opacity = '0.5';
    lastDummy.style.zIndex = '0';
    lastDummy.classList.add('dummy-slide');
    lastDummy.setAttribute('aria-hidden', 'true');
    lastDummy.dataset.originalIndex = firstSlide.dataset.originalIndex;
    slidesWrapper.append(lastDummy);
    
    // オプション：より滑らかな移動のために追加のダミースライドを追加
    if (slides.length >= 3) {
      // 2番目のスライドのコピーも最後に追加
      const secondSlide = slides[1];
      const secondDummy = secondSlide.cloneNode(true);
      secondDummy.classList.remove('active');
      secondDummy.style.opacity = '0.5';
      secondDummy.style.zIndex = '0';
      secondDummy.classList.add('dummy-slide');
      secondDummy.setAttribute('aria-hidden', 'true');
      secondDummy.dataset.originalIndex = secondSlide.dataset.originalIndex;
      slidesWrapper.append(secondDummy);
      
      // 最後から2番目のスライドのコピーも最初に追加
      const secondLastSlide = slides[slides.length - 2];
      const secondLastDummy = secondLastSlide.cloneNode(true);
      secondLastDummy.classList.remove('active');
      secondLastDummy.style.opacity = '0.5';
      secondLastDummy.style.zIndex = '0';
      secondLastDummy.classList.add('dummy-slide');
      secondLastDummy.setAttribute('aria-hidden', 'true');
      secondLastDummy.dataset.originalIndex = secondLastSlide.dataset.originalIndex;
      slidesWrapper.prepend(secondLastDummy);
    }
  }
}

let carouselId = 0;
export default async function decorate(block) {
  removeButtonContainer(block);
  carouselId += 1;
  block.classList.add('sbw-highlight-carousel');
  block.setAttribute('id', `sbw-highlight-carousel-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');
  
  // 自動再生の設定
  if (!isSingleSlide) {
    block.dataset.autoplay = 'true'; // デフォルトで自動再生を有効化
  }

  const container = document.createElement('div');
  container.classList.add('sbw-highlight-carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('sbw-highlight-carousel-slides');
  slidesWrapper.style.scrollBehavior = 'smooth';
  container.append(slidesWrapper);
  
  // ナビゲーションボタンの追加
  if (!isSingleSlide) {
    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('sbw-highlight-carousel-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;
    container.append(slideNavButtons);
  }
  
  block.append(container);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('sbw-highlight-carousel-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('sbw-highlight-carousel-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}"${idx === 0 ? ' disabled="true"' : ''}></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  if (!isSingleSlide) {
    // ダミースライドを追加して無限ループ風に見せる
    addDummySlides(block);
    
    // カルーセルの初期化
    initializeCarouselWithClones(block);
    
    bindEvents(block);
    
    // リサイズイベントのリスナーを追加（デバウンス処理つき）
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        handleResize(block);
      }, 100);
    });
    
    // 自動再生の開始（オプション）
    if (block.dataset.autoplay === 'true') {
      // ページロード時に少し遅らせて自動再生を開始
      setTimeout(() => {
        startAutoplay(block, 7000); // 7秒間隔で自動再生
      }, 2000);
    }
    
    // パフォーマンス改善のために、アイドル時間にプリロード
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // カルーセル内の画像をプリロード
        block.querySelectorAll('img').forEach(img => {
          if (img.dataset.src) {
            const preloadImg = new Image();
            preloadImg.src = img.dataset.src;
          }
        });
      });
    }
  }
}