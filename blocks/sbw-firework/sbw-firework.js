/**
 * Firework埋め込みブロックの設定
 */
const FIREWORK_CONFIG = {
  scriptUrl: 'https://asset.fwcdn3.com/js/embed-feed.js',
  readinessTimeout: 3000,
  contentLoadTimeout: 15000,
  contentCheckInterval: 1000,
  reinitializationDelay: 100,
  manualInitDelay: 200,
  defaultAttributes: {
    channel: 'hojin_marketing_stragetic_dept',
    playlist: '5qN2Xo',
    mode: 'row',
    open_in: 'default',
    max_videos: '0',
    placement: 'middle',
    player_placement: 'bottom-right',
    branding: 'false'
  },
  styles: {
    minHeight: '300px',
    minWidth: '100%',
    display: 'block'
  }
};

/**
 * Fireworkスクリプトローダー
 * 単一責任: スクリプトの読み込みとFireworkの準備状態確認
 */
class FireworkScriptLoader {
  constructor(config) {
    this.config = config;
  }

  /**
   * Fireworkスクリプトを読み込む
   * @returns {Promise<void>}
   */
  async loadScript() {
    if (this._isScriptAlreadyLoaded()) {
      await this._waitForFireworkReady();
      return;
    }

    return new Promise((resolve, reject) => {
      const script = this._createScriptElement();
      
      script.onload = async () => {
        try {
          await this._waitForFireworkReady();
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      script.onerror = () => {
        reject(new Error('Fireworks script loading failed'));
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * スクリプトが既に読み込まれているかチェック
   * @returns {boolean}
   * @private
   */
  _isScriptAlreadyLoaded() {
    return document.querySelector('script[src*="embed-feed.js"]') !== null;
  }

  /**
   * スクリプト要素を作成
   * @returns {HTMLScriptElement}
   * @private
   */
  _createScriptElement() {
    const script = document.createElement('script');
    script.async = true;
    script.type = 'text/javascript';
    script.src = this.config.scriptUrl;
    script.defer = true;
    return script;
  }

  /**
   * Fireworkの準備完了を待つ
   * @returns {Promise<void>}
   * @private
   */
  _waitForFireworkReady() {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = this.config.readinessTimeout / 100;
      
      const checkReady = () => {
        attempts++;
        
        if (this._isFireworkReady()) {
          resolve();
        } else if (attempts >= maxAttempts) {
          resolve(); // タイムアウトでも続行
        } else {
          setTimeout(checkReady, 100);
        }
      };
      
      checkReady();
    });
  }

  /**
   * Fireworkが準備完了かチェック
   * @returns {boolean}
   * @private
   */
  _isFireworkReady() {
    return !!(window._fwn || customElements.get('fw-embed-feed'));
  }
}

/**
 * Firework要素ファクトリー
 * 単一責任: fw-embed-feed要素の作成と設定
 */
class FireworkElementFactory {
  constructor(config) {
    this.config = config;
  }

  /**
   * fw-embed-feed要素を作成
   * @returns {HTMLElement}
   */
  createElement() {
    const element = document.createElement('fw-embed-feed');
    this._applyStyles(element);
    this._setAttributes(element);
    this._setupCustomElementHandling(element);
    return element;
  }

  /**
   * 要素にスタイルを適用
   * @param {HTMLElement} element
   * @private
   */
  _applyStyles(element) {
    Object.assign(element.style, this.config.styles);
  }

  /**
   * 要素に属性を設定
   * @param {HTMLElement} element
   * @private
   */
  _setAttributes(element) {
    Object.entries(this.config.defaultAttributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  /**
   * カスタム要素の処理を設定
   * @param {HTMLElement} element
   * @private
   */
  _setupCustomElementHandling(element) {
    if (!customElements.get('fw-embed-feed') && customElements.whenDefined) {
      customElements.whenDefined('fw-embed-feed')
        .then(() => this._reinitializeElement(element))
        .catch(() => {
          // エラーは無視
        });
    }
  }

  /**
   * 要素を再初期化
   * @param {HTMLElement} element
   * @private
   */
  _reinitializeElement(element) {
    try {
      // connectedCallbackを実行
      if (element.connectedCallback && typeof element.connectedCallback === 'function') {
        element.connectedCallback();
      }
      
      // 属性の再設定
      setTimeout(() => {
        const channel = element.getAttribute('channel');
        if (channel) {
          element.setAttribute('channel', channel);
        }
      }, this.config.reinitializationDelay);
      
      // Firework APIの手動初期化
      this._triggerManualInitialization(element);
    } catch (error) {
      // エラーは無視
    }
  }

  /**
   * 手動初期化をトリガー
   * @param {HTMLElement} element
   * @private
   */
  _triggerManualInitialization(element) {
    if (!window._fwn) return;

    setTimeout(() => {
      const initEvent = new CustomEvent('firework:manual-init', {
        detail: { element: element, timestamp: Date.now() }
      });
      element.dispatchEvent(initEvent);
      document.dispatchEvent(initEvent);
    }, this.config.manualInitDelay);
  }
}

/**
 * コンテンツ監視者
 * 単一責任: Firework要素のコンテンツ読み込みを監視
 */
class FireworkContentObserver {
  constructor(config) {
    this.config = config;
  }

  /**
   * 要素のコンテンツ読み込みを監視
   * @param {HTMLElement} element
   * @returns {Promise<boolean>}
   */
  observe(element) {
    return new Promise((resolve) => {
      let hasContentLoaded = false;
      
      const observer = this._createMutationObserver(() => {
        hasContentLoaded = true;
        resolve(true);
      });
      
      const checkInterval = this._createPeriodicCheck(element, () => {
        hasContentLoaded = true;
        observer.disconnect();
        resolve(true);
      });
      
      this._setupTimeout(observer, checkInterval, () => {
        resolve(hasContentLoaded);
      });
      
      observer.observe(element, this._getObserverOptions());
    });
  }

  /**
   * MutationObserverを作成
   * @param {Function} onContentFound
   * @returns {MutationObserver}
   * @private
   */
  _createMutationObserver(onContentFound) {
    return new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          onContentFound();
        }
      });
    });
  }

  /**
   * 定期チェックを作成
   * @param {HTMLElement} element
   * @param {Function} onContentFound
   * @returns {number}
   * @private
   */
  _createPeriodicCheck(element, onContentFound) {
    return setInterval(() => {
      if (element.childElementCount > 0 || element.innerHTML.length > 0) {
        onContentFound();
      }
    }, this.config.contentCheckInterval);
  }

  /**
   * タイムアウトを設定
   * @param {MutationObserver} observer
   * @param {number} checkInterval
   * @param {Function} onTimeout
   * @private
   */
  _setupTimeout(observer, checkInterval, onTimeout) {
    setTimeout(() => {
      clearInterval(checkInterval);
      observer.disconnect();
      onTimeout();
    }, this.config.contentLoadTimeout);
  }

  /**
   * MutationObserverのオプションを取得
   * @returns {object}
   * @private
   */
  _getObserverOptions() {
    return {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      characterData: true
    };
  }
}

/**
 * フォールバック表示管理者
 * 単一責任: フォールバック表示の作成と管理
 */
class FireworkFallbackManager {
  /**
   * 読み込み中表示を作成
   * @returns {HTMLElement}
   */
  createLoadingFallback() {
    return this._createFallbackElement(
      '🎬 動画コンテンツを読み込み中...',
      `コンテンツが表示されない場合は、ネットワーク接続を確認するか、<br>
       しばらく経ってから再度お試しください。`,
      '#333'
    );
  }

  /**
   * エラー表示を作成
   * @param {string} channel
   * @param {string} playlist
   * @returns {HTMLElement}
   */
  createErrorFallback(channel, playlist) {
    return this._createFallbackElement(
      '⚠️ 動画コンテンツの読み込みに失敗しました',
      `チャンネル: ${channel}<br>
       プレイリスト: ${playlist}<br><br>
       設定を確認するか、しばらく経ってから再度お試しください。`,
      '#d73502'
    );
  }

  /**
   * フォールバック要素を作成
   * @param {string} title
   * @param {string} message
   * @param {string} titleColor
   * @returns {HTMLElement}
   * @private
   */
  _createFallbackElement(title, message, titleColor) {
    const fallbackDiv = document.createElement('div');
    fallbackDiv.className = 'firework-fallback';
    fallbackDiv.style.cssText = this._getFallbackStyles();
    fallbackDiv.innerHTML = this._getFallbackHTML(title, message, titleColor);
    return fallbackDiv;
  }

  /**
   * フォールバックのスタイルを取得
   * @returns {string}
   * @private
   */
  _getFallbackStyles() {
    return `
      padding: 40px 20px;
      text-align: center;
      background: #f5f5f5;
      border: 2px dashed #ccc;
      border-radius: 8px;
      color: #666;
      font-family: Arial, sans-serif;
    `;
  }

  /**
   * フォールバックのHTMLを取得
   * @param {string} title
   * @param {string} message
   * @param {string} titleColor
   * @returns {string}
   * @private
   */
  _getFallbackHTML(title, message, titleColor) {
    return `
      <h3 style="margin: 0 0 10px 0; color: ${titleColor};">${title}</h3>
      <p style="margin: 0; font-size: 14px;">${message}</p>
    `;
  }
}

/**
 * Firework統合管理者
 * 責任: 全体の初期化フローを管理
 */
class FireworkIntegrationManager {
  constructor(config = FIREWORK_CONFIG) {
    this.config = config;
    this.scriptLoader = new FireworkScriptLoader(config);
    this.elementFactory = new FireworkElementFactory(config);
    this.contentObserver = new FireworkContentObserver(config);
    this.fallbackManager = new FireworkFallbackManager();
  }

  /**
   * Firework統合を初期化
   * @param {HTMLElement} container
   * @returns {Promise<void>}
   */
  async initialize(container) {
    try {
      await this.scriptLoader.loadScript();
      await this._setupContent(container);
    } catch (error) {
      this._handleError(container);
    }
  }

  /**
   * コンテンツを設定
   * @param {HTMLElement} container
   * @returns {Promise<void>}
   * @private
   */
  async _setupContent(container) {
    container.innerHTML = '';
    
    const fallbackContent = this.fallbackManager.createLoadingFallback();
    container.appendChild(fallbackContent);
    
    const fireworkElement = this.elementFactory.createElement();
    container.appendChild(fireworkElement);
    
    const contentLoaded = await this.contentObserver.observe(fireworkElement);
    
    if (contentLoaded) {
      fallbackContent.remove();
    } else {
      this._showErrorFallback(container, fallbackContent, fireworkElement);
    }
  }

  /**
   * エラーフォールバックを表示
   * @param {HTMLElement} container
   * @param {HTMLElement} fallbackContent
   * @param {HTMLElement} fireworkElement
   * @private
   */
  _showErrorFallback(container, fallbackContent, fireworkElement) {
    fireworkElement.style.display = 'none';
    
    const errorFallback = this.fallbackManager.createErrorFallback(
      this.config.defaultAttributes.channel,
      this.config.defaultAttributes.playlist
    );
    
    container.replaceChild(errorFallback, fallbackContent);
  }

  /**
   * エラーを処理
   * @param {HTMLElement} container
   * @private
   */
  _handleError(container) {
    container.innerHTML = '<p class="firework-error">動画の読み込みに失敗しました。</p>';
  }
}

/**
 * メインのdecorate関数
 * 依存性注入によりテスタビリティを向上
 */
export default function decorate(block) {
  const manager = new FireworkIntegrationManager();
  
  const initializeWhenReady = async () => {
    await manager.initialize(block);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWhenReady);
  } else {
    initializeWhenReady();
  }
}