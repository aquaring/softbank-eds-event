/**
 * Firework埋め込みブロックの設定
 */
const FIREWORK_CONFIG = {
  scriptUrl: 'https://asset.fwcdn3.com/js/embed-feed.js',
  loadDelay: 1500, // floating版の後に読み込むための遅延時間
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
 * 単一責任: スクリプトの読み込み（順序制御付き）
 */
class FireworkScriptLoader {
  constructor(config) {
    this.config = config;
  }

  /**
   * Fireworkスクリプトを読み込む（順序制御付き）
   * @returns {Promise<void>}
   */
  async loadScript() {
    // floating版の読み込み完了を待つ
    await this._waitForFloatingLoad();
    
    // 追加の遅延でfloating版の初期化完了を待つ
    await this._delay(this.config.loadDelay);
    
    if (this._isScriptAlreadyLoaded()) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = this._createScriptElement();
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Fireworks script loading failed'));
      
      document.head.appendChild(script);
    });
  }

  /**
   * floating版の読み込み完了を待つ
   * @returns {Promise<void>}
   * @private
   */
  _waitForFloatingLoad() {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 50; // 5秒間チェック
      
      const checkFloatingReady = () => {
        attempts++;
        
        // storyblock.jsが読み込まれているかチェック
        const storyblockLoaded = document.querySelector('script[src*="storyblock.js"]');
        
        if (storyblockLoaded || attempts >= maxAttempts) {
          resolve();
        } else {
          setTimeout(checkFloatingReady, 100);
        }
      };
      
      checkFloatingReady();
    });
  }

  /**
   * 指定時間待機
   * @param {number} ms
   * @returns {Promise<void>}
   * @private
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
    return script;
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
  }

  /**
   * Firework統合を初期化
   * @param {HTMLElement} container
   * @returns {Promise<void>}
   */
  async initialize(container) {
    try {
      console.log('🎠 Carousel: フローティング版の読み込み完了を待機中...');
      await this.scriptLoader.loadScript();
      console.log('🎠 Carousel: スクリプト読み込み完了、要素を作成中...');
      this._setupContent(container);
      console.log('🎠 Carousel: 初期化完了！');
    } catch (error) {
      console.error('🚨 Firework initialization failed:', error);
    }
  }

  /**
   * コンテンツを設定
   * @param {HTMLElement} container
   * @private
   */
  _setupContent(container) {
    container.innerHTML = '';
    
    const fireworkElement = this.elementFactory.createElement();
    container.appendChild(fireworkElement);
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