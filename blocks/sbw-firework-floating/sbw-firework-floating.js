/**
 * Firework Floating埋め込みブロックの設定
 */
const FIREWORK_FLOATING_CONFIG = {
  scriptUrl: 'https://asset.fwcdn3.com/js/storyblock.js',
  defaultAttributes: {
    channel: 'hojin_marketing_stragetic_dept',
    playlist: '',
    mode: 'pinned',
    autoplay: 'true',
    player_captions: 'false'
  },
  styles: {
    minHeight: '300px',
    minWidth: '100%',
    display: 'block'
  },
  elementName: 'fw-storyblock',
  scriptPattern: 'storyblock.js'
};

/**
 * Firework Storyblockスクリプトローダー
 * 単一責任: スクリプトの読み込み
 */
class FireworkStoryblockScriptLoader {
  constructor(config) {
    this.config = config;
  }

  /**
   * Firework Storyblockスクリプトを読み込む
   * @returns {Promise<void>}
   */
  async loadScript() {
    if (this._isScriptAlreadyLoaded()) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = this._createScriptElement();
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Firework Storyblock script loading failed'));
      
      document.head.appendChild(script);
    });
  }

  /**
   * スクリプトが既に読み込まれているかチェック
   * @returns {boolean}
   * @private
   */
  _isScriptAlreadyLoaded() {
    return document.querySelector(`script[src*="${this.config.scriptPattern}"]`) !== null;
  }

  /**
   * スクリプト要素を作成
   * @returns {HTMLScriptElement}
   * @private
   */
  _createScriptElement() {
    const script = document.createElement('script');
    script.async = true;
    script.src = this.config.scriptUrl;
    return script;
  }
}

/**
 * Firework Storyblock要素ファクトリー
 * 単一責任: fw-storyblock要素の作成と設定
 */
class FireworkStoryblockElementFactory {
  constructor(config, playlistId) {
    this.config = config;
    this.playlistId = playlistId;
  }

  /**
   * fw-storyblock要素を作成
   * @returns {HTMLElement}
   */
  createElement() {
    const element = document.createElement(this.config.elementName);
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
    
    // playlistIdが指定されている場合は、動的に設定
    if (this.playlistId) {
      element.setAttribute('playlist', this.playlistId);
    }
  }
}

/**
 * Firework Storyblock統合管理者
 * 責任: 全体の初期化フローを管理
 */
class FireworkStoryblockIntegrationManager {
  constructor(playlistId, config = FIREWORK_FLOATING_CONFIG) {
    this.playlistId = playlistId;
    this.config = config;
    this.scriptLoader = new FireworkStoryblockScriptLoader(config);
    this.elementFactory = new FireworkStoryblockElementFactory(config, playlistId);
  }

  /**
   * Firework Storyblock統合を初期化
   * @param {HTMLElement} container
   * @returns {Promise<void>}
   */
  async initialize(container) {
    try {
      await this.scriptLoader.loadScript();
      this._setupContent(container);
    } catch (error) {
      console.error('🚨 Firework Storyblock initialization failed:', error);
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
  const PLAYLIST_ID = block.querySelector('p').textContent;
  const manager = new FireworkStoryblockIntegrationManager(PLAYLIST_ID);
  
  const initializeWhenReady = async () => {
    await manager.initialize(block);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWhenReady);
  } else {
    initializeWhenReady();
  }
}
