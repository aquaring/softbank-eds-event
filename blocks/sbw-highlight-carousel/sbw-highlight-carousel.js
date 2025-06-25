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
  if (!block || slide.classList.contains('clone-slide')) return;
  
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.sbw-highlight-carousel-slide:not(.clone-slide)');
  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.classList.toggle('active', idx === slideIndex);
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
    indicator.querySelector('button').disabled = idx === slideIndex;
  });
}

// スライドの可視性とフィルター効果を更新する関数
function updateVisibilityAndFilters(block) {
  const slidesWrapper = block.querySelector('.sbw-highlight-carousel-slides');
  if (!slidesWrapper) return;
  
  const containerWidth = slidesWrapper.offsetWidth;
  const containerCenter = slidesWrapper.scrollLeft + (containerWidth / 2);
  const allSlides = Array.from(block.querySelectorAll('.sbw-highlight-carousel-slide'));
  
  allSlides.forEach(slide => {
    const slideCenter = slide.offsetLeft + (slide.offsetWidth / 2);
    const distanceFromCenter = Math.abs(containerCenter - slideCenter);
    
    if (distanceFromCenter < slide.offsetWidth * 0.01) {
      slide.classList.add('fully-visible');
      slide.classList.remove('partially-visible');
    } else {
      slide.classList.add('partially-visible');
      slide.classList.remove('fully-visible');
    }
  });
}

// 真の無限スクロールカルーセル初期化
function initializeCircularCarousel(block) {
  const slidesWrapper = block.querySelector('.sbw-highlight-carousel-slides');
  const slides = Array.from(block.querySelectorAll('.sbw-highlight-carousel-slide'));
  
  if (!slides.length || !slidesWrapper) return;
  
  // スムーズスクロールの初期設定
  slidesWrapper.style.scrollBehavior = 'smooth';
  slidesWrapper.style.scrollTimingFunction = 'cubic-bezier(0.4, 0, 0.2, 1)';
  slidesWrapper.style.transitionDuration = '600ms';
  
  // 真の無限スクロール用の初期クローンスライドを作成
  createInitialInfiniteSlides(block);
  
  // 初期状態のアクティブスライド設定
  block.dataset.activeSlide = 0;
  
  // すべてのスライドからactiveクラスを削除してから最初のスライドをアクティブに
  slides.forEach((slide, idx) => {
    slide.classList.toggle('active', idx === 0);
  });
  
  // 初期位置を中央のオリジナルスライドに設定
  setTimeout(() => {
    positionToOriginalSlide(block, 0, true);
    // 初期フィルター効果を適用
    setTimeout(() => {
      updateVisibilityAndFilters(block);
    }, 200);
  }, 100);
  
  // 無限スクロール監視を開始
  addInfiniteScrollWatcher(block);
}

// 初期の無限スライド作成
function createInitialInfiniteSlides(block) {
  const slidesWrapper = block.querySelector('.sbw-highlight-carousel-slides');
  const originalSlides = Array.from(block.querySelectorAll('.sbw-highlight-carousel-slide:not(.clone-slide)'));
  
  if (originalSlides.length < 2) return;
  
  // 既存のクローンスライドを削除
  block.querySelectorAll('.clone-slide').forEach(slide => slide.remove());
  
  // 左側に3セット分のクローンスライドを追加
  for (let set = 0; set < 3; set++) {
    for (let i = originalSlides.length - 1; i >= 0; i--) {
      const leftClone = createCloneSlide(originalSlides[i], 'left', set, i);
      slidesWrapper.insertBefore(leftClone, slidesWrapper.firstChild);
    }
  }
  
  // 右側に3セット分のクローンスライドを追加
  for (let set = 0; set < 3; set++) {
    for (let i = 0; i < originalSlides.length; i++) {
      const rightClone = createCloneSlide(originalSlides[i], 'right', set, i);
      slidesWrapper.appendChild(rightClone);
    }
  }
}

// クローンスライドを作成する関数
function createCloneSlide(originalSlide, direction, setIndex, slideIndex) {
  const clone = originalSlide.cloneNode(true);
  clone.classList.add('clone-slide', `clone-${direction}`);
  clone.classList.remove('active');
  clone.dataset.slideIndex = `clone-${direction}-${setIndex}-${slideIndex}`;
  clone.dataset.originalIndex = slideIndex;
  clone.dataset.setIndex = setIndex;
  clone.setAttribute('aria-hidden', 'true');
  clone.querySelectorAll('a').forEach(link => link.setAttribute('tabindex', '-1'));
  return clone;
}

// 真の無限スクロール監視
function addInfiniteScrollWatcher(block) {
  const slidesWrapper = block.querySelector('.sbw-highlight-carousel-slides');
  const originalSlides = Array.from(block.querySelectorAll('.sbw-highlight-carousel-slide:not(.clone-slide)'));
  
  if (!slidesWrapper || originalSlides.length < 2) return;
  
  let isGenerating = false;
  let scrollTimeout;
  
  const handleScroll = () => {
    if (isGenerating || isSlideTransitionLocked) return;
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      checkAndGenerateSlides();
      updateActiveSlideByPosition();
    }, 50);
  };
  
  const checkAndGenerateSlides = () => {
    if (isGenerating) return;
    
    const scrollLeft = slidesWrapper.scrollLeft;
    const containerWidth = slidesWrapper.offsetWidth;
    const scrollWidth = slidesWrapper.scrollWidth;
    
    // 右側にスクロールしすぎた場合、右側にクローンスライドを追加
    if (scrollLeft > scrollWidth - containerWidth * 2) {
      isGenerating = true;
      addMoreClones(block, 'right');
      setTimeout(() => { isGenerating = false; }, 100);
    }
    
    // 左側にスクロールしすぎた場合、左側にクローンスライドを追加
    if (scrollLeft < containerWidth) {
      isGenerating = true;
      addMoreClones(block, 'left');
      setTimeout(() => { isGenerating = false; }, 100);
    }
    
    // パフォーマンス維持のため、遠くのクローンスライドを削除
    removeDistantClones(block);
  };
  
     // 位置ベースでアクティブスライドとフィルター効果を更新
   const updateActiveSlideByPosition = () => {
     if (isSlideTransitionLocked) return;
     
     // フィルター効果を更新
     updateVisibilityAndFilters(block);
     
     // アクティブスライドを更新
     const scrollLeft = slidesWrapper.scrollLeft;
     const containerWidth = slidesWrapper.offsetWidth;
     const containerCenter = scrollLeft + (containerWidth / 2);
     
     // すべてのスライド（オリジナル + クローン）を取得
     const allSlides = Array.from(block.querySelectorAll('.sbw-highlight-carousel-slide'));
     
     // 現在の中央に最も近いスライドを見つける
     let closestSlide = null;
     let minDistance = Infinity;
     
     allSlides.forEach(slide => {
       const slideCenter = slide.offsetLeft + (slide.offsetWidth / 2);
       const distance = Math.abs(containerCenter - slideCenter);
       
       // 中央に最も近いスライドを見つける
       if (distance < minDistance) {
         minDistance = distance;
         
         if (!slide.classList.contains('clone-slide')) {
           // オリジナルスライドの場合
           const slideIndex = parseInt(slide.dataset.slideIndex, 10);
           closestSlide = { slide, index: slideIndex };
         } else {
           // クローンスライドの場合
           const originalIndex = parseInt(slide.dataset.originalIndex, 10);
           closestSlide = { slide, index: originalIndex };
         }
       }
     });
     
     // アクティブスライドのインデックスを更新
     if (closestSlide && minDistance < 200) {
       const currentActiveIndex = parseInt(block.dataset.activeSlide || '0', 10);
       if (closestSlide.index !== currentActiveIndex) {
         updateActiveSlideIndex(block, closestSlide.index);
       }
     }
   };
  
  slidesWrapper.addEventListener('scroll', handleScroll, { passive: true });
}

// 追加のクローンスライドを生成
function addMoreClones(block, direction) {
  const slidesWrapper = block.querySelector('.sbw-highlight-carousel-slides');
  const originalSlides = Array.from(block.querySelectorAll('.sbw-highlight-carousel-slide:not(.clone-slide)'));
  
  if (direction === 'right') {
    // 右側に新しいセットを追加
    const existingRightClones = block.querySelectorAll('.clone-right');
    const maxSetIndex = Math.max(...Array.from(existingRightClones).map(clone => 
      parseInt(clone.dataset.setIndex || '0', 10)
    ));
    const newSetIndex = maxSetIndex + 1;
    
    for (let i = 0; i < originalSlides.length; i++) {
      const rightClone = createCloneSlide(originalSlides[i], 'right', newSetIndex, i);
      slidesWrapper.appendChild(rightClone);
    }
  } else if (direction === 'left') {
    // 左側に新しいセットを追加（スクロール位置を維持するため特別な処理）
    const existingLeftClones = block.querySelectorAll('.clone-left');
    const maxSetIndex = Math.max(...Array.from(existingLeftClones).map(clone => 
      parseInt(clone.dataset.setIndex || '0', 10)
    ));
    const newSetIndex = maxSetIndex + 1;
    
    // 現在のスクロール位置を記録
    const currentScrollLeft = slidesWrapper.scrollLeft;
    
    // 左側に新しいセットを追加
    for (let i = originalSlides.length - 1; i >= 0; i--) {
      const leftClone = createCloneSlide(originalSlides[i], 'left', newSetIndex, i);
      slidesWrapper.insertBefore(leftClone, slidesWrapper.firstChild);
    }
    
    // スクロール位置を調整（新しいスライドが追加された分だけ右にシフト）
    const slideWidth = originalSlides[0].offsetWidth + 40; // スライド幅 + gap
    const offsetWidth = originalSlides.length * slideWidth;
    slidesWrapper.scrollLeft = currentScrollLeft + offsetWidth;
  }
}

// 遠くのクローンスライドを削除（パフォーマンス最適化）
function removeDistantClones(block) {
  const slidesWrapper = block.querySelector('.sbw-highlight-carousel-slides');
  const scrollLeft = slidesWrapper.scrollLeft;
  const containerWidth = slidesWrapper.offsetWidth;
  const viewportLeft = scrollLeft - containerWidth;
  const viewportRight = scrollLeft + containerWidth * 2;
  
  // 画面から遠く離れたクローンスライドを削除
  const allClones = block.querySelectorAll('.clone-slide');
  allClones.forEach(clone => {
    const cloneLeft = clone.offsetLeft;
    const cloneRight = cloneLeft + clone.offsetWidth;
    
    // ビューポートから十分離れているかチェック
    if (cloneRight < viewportLeft || cloneLeft > viewportRight) {
      const setIndex = parseInt(clone.dataset.setIndex || '0', 10);
      // 初期セット（0, 1, 2）は保持し、それ以降のセットのみ削除
      if (setIndex > 2) {
        clone.remove();
      }
    }
  });
}

// オリジナルスライドに位置を設定する関数
function positionToOriginalSlide(block, slideIndex, instant = false) {
  const slidesWrapper = block.querySelector('.sbw-highlight-carousel-slides');
  const originalSlides = Array.from(block.querySelectorAll('.sbw-highlight-carousel-slide:not(.clone-slide)'));
  const targetSlide = originalSlides[slideIndex];
  
  if (!targetSlide || !slidesWrapper) return;
  
  const slideCenter = targetSlide.offsetLeft + (targetSlide.offsetWidth / 2);
  const containerCenter = slidesWrapper.offsetWidth / 2;
  const scrollPosition = slideCenter - containerCenter;
  
  if (instant) {
          slidesWrapper.style.scrollBehavior = 'auto';
    slidesWrapper.scrollLeft = scrollPosition;
          requestAnimationFrame(() => {
            slidesWrapper.style.scrollBehavior = 'smooth';
    });
  } else {
    slidesWrapper.scrollTo({
      left: scrollPosition,
      behavior: 'smooth',
    });
  }
  
  // アクティブスライドを更新
  updateActiveSlideIndex(block, slideIndex);
  
  // フィルター効果を更新
  setTimeout(() => {
    updateVisibilityAndFilters(block);
  }, instant ? 50 : 200);
}


// アクティブスライドのインデックスを更新する関数
function updateActiveSlideIndex(block, slideIndex) {
  const originalSlides = Array.from(block.querySelectorAll('.sbw-highlight-carousel-slide:not(.clone-slide)'));
  
  // アクティブ状態を更新
  originalSlides.forEach((slide, idx) => {
    slide.classList.toggle('active', idx === slideIndex);
  });
  
  block.dataset.activeSlide = slideIndex;
  
  // インジケーターも更新
  const indicators = block.querySelectorAll('.sbw-highlight-carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    indicator.querySelector('button').disabled = idx === slideIndex;
  });
}

// スライド切り替えの一時的なロックを管理するための変数
let isSlideTransitionLocked = false;

// 真の無限スクロール対応のshowSlide関数
function showSlide(block, slideIndex = 0, instant = false) {
  if (isSlideTransitionLocked) return;
  
  const originalSlides = block.querySelectorAll('.sbw-highlight-carousel-slide:not(.clone-slide)');
  const totalSlides = originalSlides.length;

  if (!originalSlides.length) return;

  const currentActiveIndex = parseInt(block.dataset.activeSlide || '0', 10);
  
  // 範囲外のインデックスを正規化（循環処理）
  let realSlideIndex = slideIndex;
  if (slideIndex >= totalSlides) {
    realSlideIndex = slideIndex % totalSlides;
  } else if (slideIndex < 0) {
    realSlideIndex = totalSlides + (slideIndex % totalSlides);
  }

  // 同じスライドの場合は処理をスキップ
  if (realSlideIndex === currentActiveIndex && !instant) {
    return;
  }

  // トランジションのロックを有効化
  isSlideTransitionLocked = true;

  // データセットを更新
  block.dataset.activeSlide = realSlideIndex;

  // インジケーターの更新
  const indicators = block.querySelectorAll('.sbw-highlight-carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    indicator.querySelector('button').disabled = idx === realSlideIndex;
  });

  // 最適なスライド（オリジナルまたはクローン）を見つけて移動
  moveToOptimalSlide(block, realSlideIndex, instant);
  
  // スライドの移動が完全に止まった時点でのみクラスを更新
  const slidesWrapper = block.querySelector('.sbw-highlight-carousel-slides');
  const transitionEndHandler = () => {
    isSlideTransitionLocked = false;
    
    // カルーセルが止まった時点で中央のスライドを判定してクラスを更新
    const containerWidth = slidesWrapper.offsetWidth;
    const containerCenter = slidesWrapper.scrollLeft + (containerWidth / 2);
    const allSlides = Array.from(block.querySelectorAll('.sbw-highlight-carousel-slide'));
    
    allSlides.forEach(slide => {
      const slideCenter = slide.offsetLeft + (slide.offsetWidth / 2);
      const distanceFromCenter = Math.abs(containerCenter - slideCenter);
      
      if (distanceFromCenter < slide.offsetWidth * 0.01) {
        slide.classList.add('fully-visible');
        slide.classList.remove('partially-visible');
      } else {
        slide.classList.add('partially-visible');
        slide.classList.remove('fully-visible');
      }
    });
    
    slidesWrapper.removeEventListener('scrollend', transitionEndHandler);
  };
  
  if (instant) {
    isSlideTransitionLocked = false;
    // instant の場合も同様のクラス更新処理
    const containerWidth = slidesWrapper.offsetWidth;
    const containerCenter = slidesWrapper.scrollLeft + (containerWidth / 2);
    const allSlides = Array.from(block.querySelectorAll('.sbw-highlight-carousel-slide'));
    
    allSlides.forEach(slide => {
      const slideCenter = slide.offsetLeft + (slide.offsetWidth / 2);
      const distanceFromCenter = Math.abs(containerCenter - slideCenter);
      
      if (distanceFromCenter < slide.offsetWidth * 0.01) {
        slide.classList.add('fully-visible');
        slide.classList.remove('partially-visible');
      } else {
        slide.classList.add('partially-visible');
        slide.classList.remove('fully-visible');
      }
    });
  } else {
    slidesWrapper.addEventListener('scrollend', transitionEndHandler, { once: true });
  }
  
  // カスタムイベントの発火
  const slideChangeEvent = new CustomEvent('sbwCarouselSlideChange', { 
    detail: { 
      blockId: block.id,
      slideIndex: realSlideIndex,
      totalSlides: totalSlides 
    } 
  });
  document.dispatchEvent(slideChangeEvent);
}

// 最適なスライド（オリジナルまたはクローン）に移動
function moveToOptimalSlide(block, slideIndex, instant = false) {
  const slidesWrapper = block.querySelector('.sbw-highlight-carousel-slides');
  const currentScrollLeft = slidesWrapper.scrollLeft;
  const containerWidth = slidesWrapper.offsetWidth;
  const containerCenter = currentScrollLeft + (containerWidth / 2);
  
  // 指定されたインデックスのすべてのスライド（オリジナル+クローン）を取得
  const allMatchingSlides = [];
  
  // オリジナルスライド
  const originalSlides = Array.from(block.querySelectorAll('.sbw-highlight-carousel-slide:not(.clone-slide)'));
  if (originalSlides[slideIndex]) {
    allMatchingSlides.push(originalSlides[slideIndex]);
  }
  
  // クローンスライド
  const cloneSlides = Array.from(block.querySelectorAll(`.clone-slide[data-original-index="${slideIndex}"]`));
  allMatchingSlides.push(...cloneSlides);
  
  // 現在の位置から最も近いスライドを選択
  let closestSlide = null;
  let minDistance = Infinity;
  
  allMatchingSlides.forEach(slide => {
    const slideCenter = slide.offsetLeft + (slide.offsetWidth / 2);
    const distance = Math.abs(containerCenter - slideCenter);
    
    if (distance < minDistance) {
      minDistance = distance;
      closestSlide = slide;
    }
  });
  
  if (closestSlide) {
    const slideCenter = closestSlide.offsetLeft + (closestSlide.offsetWidth / 2);
    const scrollPosition = slideCenter - (containerWidth / 2);
    
    if (instant) {
      slidesWrapper.style.scrollBehavior = 'auto';
      slidesWrapper.scrollLeft = scrollPosition;
      requestAnimationFrame(() => {
        slidesWrapper.style.scrollBehavior = 'smooth';
        slidesWrapper.style.scrollTimingFunction = 'cubic-bezier(0.4, 0, 0.2, 1)';
        slidesWrapper.style.transitionDuration = '600ms';
      });
    } else {
      slidesWrapper.style.scrollBehavior = 'smooth';
      slidesWrapper.style.scrollTimingFunction = 'cubic-bezier(0.4, 0, 0.2, 1)';
      slidesWrapper.style.transitionDuration = '600ms';
      
      slidesWrapper.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });

      // アニメーション終了後に中央のオリジナルスライドに瞬時に移動
      const transitionEndHandler = () => {
        const originalSlide = originalSlides[slideIndex];
        if (originalSlide) {
          const originalCenter = originalSlide.offsetLeft + (originalSlide.offsetWidth / 2);
          const originalScrollPosition = originalCenter - (containerWidth / 2);
          
          // スライドが中央に来て止まったタイミングでクラスを更新
          originalSlides.forEach((slide, idx) => {
            if (idx === slideIndex) {
              slide.classList.add('active', 'fully-visible');
              slide.classList.remove('partially-visible');
              slide.setAttribute('aria-hidden', 'false');
            } else {
              slide.classList.remove('active', 'fully-visible');
              slide.classList.add('partially-visible');
              slide.setAttribute('aria-hidden', 'true');
            }
          });
          
          requestAnimationFrame(() => {
            slidesWrapper.style.scrollBehavior = 'auto';
            slidesWrapper.style.transitionDuration = '0ms';
            slidesWrapper.scrollLeft = originalScrollPosition;
            
            requestAnimationFrame(() => {
              slidesWrapper.style.scrollBehavior = 'smooth';
              slidesWrapper.style.scrollTimingFunction = 'cubic-bezier(0.4, 0, 0.2, 1)';
              slidesWrapper.style.transitionDuration = '600ms';
            });
          });
        }
        
        slidesWrapper.removeEventListener('scrollend', transitionEndHandler);
      };

      slidesWrapper.addEventListener('scrollend', transitionEndHandler, { once: true });
    }
  }
}

// 自動再生のタイマーIDを保持する変数
let autoplayTimerId = null;

// 真の無限スクロール対応の自動再生機能
function startAutoplay(block, interval = 5000) {
  if (autoplayTimerId) {
    clearInterval(autoplayTimerId);
  }
  
  autoplayTimerId = setInterval(() => {
    // スライド切り替え中は自動再生をスキップ
    if (isSlideTransitionLocked) return;
    
    const currentSlideIndex = parseInt(block.dataset.activeSlide || '0', 10);
    
    // 次のスライドを表示（無限に続くスライドへ移動）
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
      const targetSlideIndex = parseInt(slideIndicator.dataset.targetSlide, 10);
      showSlide(block, targetSlideIndex); // 無限スクロール内の最適な位置へ移動
      
      // インジケーター押下時に自動再生を一時停止
      if (autoplayTimerId) {
        stopAutoplay();
        // 一定時間経過後に再開
        setTimeout(() => {
          startAutoplay(block);
        }, 8000);
      }
    });
  });

  const prevButton = block.querySelector('.slide-prev');
  const nextButton = block.querySelector('.slide-next');
  
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      const currentSlide = parseInt(block.dataset.activeSlide, 10);
      showSlide(block, currentSlide - 1); // 無限に続く前のスライドへ
      
      // ボタン押下時に自動再生を一時停止
      if (autoplayTimerId) {
        stopAutoplay();
        setTimeout(() => {
          startAutoplay(block);
        }, 8000);
      }
    });
  }
  
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      const currentSlide = parseInt(block.dataset.activeSlide, 10);
      showSlide(block, currentSlide + 1); // 無限に続く次のスライドへ
      
      // ボタン押下時に自動再生を一時停止
      if (autoplayTimerId) {
        stopAutoplay();
        setTimeout(() => {
          startAutoplay(block);
        }, 8000);
      }
    });
  }

  // 真の無限スクロール対応のタッチイベント処理
  let startX = 0;
  let endX = 0;
  let isSwiping = false;
  let swipeThreshold = 40; // 無限スクロール用の敏感なスワイプ判定
  let touchStartTime = 0;
  let touchEndTime = 0;
  let velocityThreshold = 0.2; // 自然な速度閾値
  
  const slidesWrapper = block.querySelector('.sbw-highlight-carousel-slides');
  
  slidesWrapper.addEventListener('touchstart', (e) => {
    // スライド切り替え中はタッチイベントを無視
    if (isSlideTransitionLocked) return;
    
    startX = e.touches[0].clientX;
    touchStartTime = Date.now();
    isSwiping = true;
    
    // タッチ開始時に自動再生を一時停止
    if (autoplayTimerId) {
      stopAutoplay();
    }
  }, { passive: true });
  
  slidesWrapper.addEventListener('touchmove', (e) => {
    if (!isSwiping || isSlideTransitionLocked) return;
    endX = e.touches[0].clientX;
  }, { passive: true });
  
  slidesWrapper.addEventListener('touchend', (e) => {
    if (!isSwiping || isSlideTransitionLocked) return;
    
    endX = e.changedTouches[0].clientX;
    touchEndTime = Date.now();
    
    const touchDuration = touchEndTime - touchStartTime;
    const diff = startX - endX;
    const velocity = Math.abs(diff) / touchDuration;
    
    // スワイプ距離または速度が閾値を超えた場合にスライド移動
    if (Math.abs(diff) > swipeThreshold || velocity > velocityThreshold) {
      const currentSlide = parseInt(block.dataset.activeSlide, 10);
      
      if (diff > 0) {
        // 左スワイプ（次へ）- 無限に続くスライドへ移動
        showSlide(block, currentSlide + 1);
      } else {
        // 右スワイプ（前へ）- 無限に続くスライドへ移動
        showSlide(block, currentSlide - 1);
      }
    }
    
    isSwiping = false;
    
    // スワイプ後の自動再生再開
    setTimeout(() => {
      if (block.dataset.autoplay === 'true') {
        startAutoplay(block);
      }
    }, 2000);
  }, { passive: true });

  // 全スライド複製方式対応のスライド監視
  const slideObserver = new IntersectionObserver((entries) => {
    if (isSlideTransitionLocked) return;
    
    entries.forEach((entry) => {
      // リアルスライドのみを監視し、中央付近に表示されたスライドをアクティブに
      if (entry.isIntersecting && entry.intersectionRatio > 0.5 && !entry.target.classList.contains('clone-slide')) {
        const slideIndex = parseInt(entry.target.dataset.slideIndex, 10);
        const currentActiveIndex = parseInt(block.dataset.activeSlide || '0', 10);
        
        // 現在のアクティブスライドと異なり、有効なインデックスの場合のみ更新
        if (slideIndex !== currentActiveIndex && !isNaN(slideIndex) && slideIndex >= 0) {
          updateActiveSlideIndex(block, slideIndex);
        }
      }
    });
  }, { 
    threshold: [0.5],
    rootMargin: '-40px'
  });
  
  block.querySelectorAll('.sbw-highlight-carousel-slide:not(.clone-slide)').forEach((slide) => {
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
    // 循環カルーセルの初期化
    initializeCircularCarousel(block);
    
    showSlide(block, 0, true);
    
    // イベントをバインド
    setTimeout(() => {
      bindEvents(block);
    }, 100);
    
    // リサイズイベントのリスナーを追加（デバウンス処理つき）
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        handleResize(block);
      }, 100);
    });
    
    // 自動再生の開始（真の無限スクロール対応）
    if (block.dataset.autoplay === 'true') {
      // ページロード時に少し遅らせて自動再生を開始
      setTimeout(() => {
        startAutoplay(block, 3500); // 3.5秒間隔で自動再生（無限に続く効果を実感）
      }, 800);
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