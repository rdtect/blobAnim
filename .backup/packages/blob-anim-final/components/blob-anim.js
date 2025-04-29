
import { createAnim } from '../lib/createAnim.js';

export class BlobAnimElement extends HTMLElement {
  static get observedAttributes() {
    return [
      'state', 'variant', 'count', 'size', 'speed', 'opacity', 'color',
      'gooey', 'scaleeffects', 'solidcolor', 'width', 'height'
    ];
  }

  constructor() {
    super();
    this._container = document.createElement('div');
    this._container.style.width = '100%';
    this._container.style.height = '100%';
    this.attachShadow({ mode: 'open' }).appendChild(this._container);
    this._config = {};
    this._anim = null;
  }

  connectedCallback() {
    this._config = this._parseAttributes();
    this._createAnimation();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (!this._anim) return;
    const parsed = this._parseSingleAttr(name, newVal);
    this._config = { ...this._config, ...parsed };
    this._anim.update(parsed);
  }

  disconnectedCallback() {
    this.destroy();
  }

  _parseAttributes() {
    const attrs = {};
    for (const attr of this.attributes) {
      Object.assign(attrs, this._parseSingleAttr(attr.name, attr.value));
    }
    return attrs;
  }

  _parseSingleAttr(name, value) {
    if (['count', 'size', 'speed', 'width', 'height'].includes(name)) {
      return { [name]: parseFloat(value) };
    }
    if (name === 'opacity') {
      return { opacity: parseFloat(value) };
    }
    if (['gooey', 'scaleeffects', 'solidcolor'].includes(name)) {
      return { [name]: value !== 'false' };
    }
    return { [name]: value };
  }

  _createAnimation() {
    if (this._anim) this._anim.destroy();
    this._anim = createAnim(this._container, this._config);
  }

  // Public API
  update(newConfig = {}) {
    if (this._anim) {
      this._config = { ...this._config, ...newConfig };
      this._anim.update(newConfig);
    }
    return this;
  }

  pause() {
    this._anim?.pause();
    return this;
  }

  resume() {
    this._anim?.resume();
    return this;
  }

  resize(width, height) {
    this._config.width = width;
    this._config.height = height;
    this._container.style.width = width + 'px';
    this._container.style.height = height + 'px';
    this._anim?.update({ width, height });
    return this;
  }

  destroy() {
    this._anim?.destroy();
    this._anim = null;
    return this;
  }
}

customElements.define('blob-anim', BlobAnimElement);
