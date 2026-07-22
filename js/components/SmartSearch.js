/**
 * SmartSearch — Reusable, cohesive search input component with instant clear (✕) button
 * ─────────────────────────────────────────────────────────────────────────────────────
 * Enhances standard text inputs with:
 *   - Sleek magnifying glass prefix icon
 *   - Interactive clear button (✕) that scales/fades in smoothly when typing
 *   - Built-in debounced input handling
 *   - Keyboard support (Escape key clears search & fires callback)
 *   - Standard API: getValue(), setValue(str), clear(), focus(), destroy()
 *
 * Usage:
 *   const search = new SmartSearch(document.getElementById('ds-filter-search'), {
 *     placeholder: 'Search by name...',
 *     debounceMs: 150,
 *     onInput: (val) => renderMatrix(),
 *     onClear: () => renderMatrix()
 *   });
 */
class SmartSearch {
  /**
   * @param {string|HTMLInputElement|HTMLElement} el - Element or selector
   * @param {Object} [options]
   * @param {string} [options.placeholder]
   * @param {number} [options.debounceMs=150]
   * @param {function(string, Event):void} [options.onInput]
   * @param {function():void} [options.onClear]
   * @param {boolean} [options.pill=true]
   * @param {string} [options.width]
   */
  constructor(el, options = {}) {
    this.nativeInput = typeof el === 'string' ? document.querySelector(el) : el;
    if (!this.nativeInput) return;

    this.options = {
      debounceMs: 150,
      pill: true,
      ...options
    };

    this.onInput = this.options.onInput || null;
    this.onClear = this.options.onClear || null;
    this.timer = null;

    this.init();
  }

  init() {
    if (this.nativeInput._smartSearch) return this.nativeInput._smartSearch;
    this.nativeInput._smartSearch = this;

    // Create wrapper container
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'smart-search-wrapper';
    if (this.options.pill || this.nativeInput.style.borderRadius === '50px' || this.nativeInput.classList.contains('pill')) {
      this.wrapper.classList.add('pill');
    }

    // Transfer layout width and margin styles from native input to wrapper
    const stylesToTransfer = ['flex', 'width', 'minWidth', 'maxWidth', 'margin', 'marginLeft', 'marginRight', 'marginTop', 'marginBottom'];
    stylesToTransfer.forEach(prop => {
      const val = this.nativeInput.style[prop];
      if (val) {
        this.wrapper.style[prop] = val;
      }
    });

    if (this.options.width) {
      this.wrapper.style.width = this.options.width;
    }

    // Insert wrapper before native input and move native input inside
    const parent = this.nativeInput.parentNode;
    parent.insertBefore(this.wrapper, this.nativeInput);
    this.wrapper.appendChild(this.nativeInput);

    this.nativeInput.classList.add('smart-search-input');
    if (this.options.placeholder) {
      this.nativeInput.placeholder = this.options.placeholder;
    }

    // Create Prefix Search Icon (Magnifying Glass)
    this.searchIcon = document.createElement('div');
    this.searchIcon.className = 'smart-search-icon';
    this.searchIcon.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    `;
    this.wrapper.appendChild(this.searchIcon);

    // Create Suffix Clear Button (✕)
    this.clearBtn = document.createElement('button');
    this.clearBtn.type = 'button';
    this.clearBtn.className = 'smart-search-clear-btn';
    this.clearBtn.setAttribute('aria-label', 'Clear search');
    this.clearBtn.setAttribute('tabindex', '-1');
    this.clearBtn.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    this.wrapper.appendChild(this.clearBtn);

    // Bind event listeners
    this.bindEvents();

    // Intercept programmatic .value assignments on native input to auto-sync clear button
    const nativeValueDesc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    if (nativeValueDesc && nativeValueDesc.set) {
      const self = this;
      Object.defineProperty(this.nativeInput, 'value', {
        get() {
          return nativeValueDesc.get.call(this);
        },
        set(val) {
          nativeValueDesc.set.call(this, val);
          self.syncClearButton();
        },
        configurable: true
      });
    }

    // Initial check for clear button
    this.syncClearButton();
  }

  bindEvents() {
    this.nativeInput.addEventListener('input', (e) => {
      this.syncClearButton();
      if (this.timer) clearTimeout(this.timer);

      const val = this.getValue();
      if (this.options.debounceMs > 0) {
        this.timer = setTimeout(() => {
          if (this.onInput) this.onInput(val, e);
        }, this.options.debounceMs);
      } else {
        if (this.onInput) this.onInput(val, e);
      }
    });

    // Escape key to clear search
    this.nativeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.getValue().length > 0) {
        e.preventDefault();
        this.clear();
      }
    });

    // Clear button click
    this.clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.clear();
    });

    // Focus state handling
    this.nativeInput.addEventListener('focus', () => this.wrapper.classList.add('focused'));
    this.nativeInput.addEventListener('blur', () => this.wrapper.classList.remove('focused'));
  }

  syncClearButton() {
    const hasValue = this.getValue().length > 0;
    if (hasValue) {
      this.clearBtn.classList.add('visible');
    } else {
      this.clearBtn.classList.remove('visible');
    }
  }

  getValue() {
    return (this.nativeInput.value || '').trim();
  }

  setValue(val) {
    this.nativeInput.value = val || '';
    this.syncClearButton();
    const event = new Event('input', { bubbles: true });
    this.nativeInput.dispatchEvent(event);
  }

  clear() {
    this.nativeInput.value = '';
    this.syncClearButton();
    this.nativeInput.focus();

    const event = new Event('input', { bubbles: true });
    this.nativeInput.dispatchEvent(event);

    if (this.onClear) this.onClear();
  }

  focus() {
    this.nativeInput.focus();
  }

  destroy() {
    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.parentNode.insertBefore(this.nativeInput, this.wrapper);
      this.wrapper.remove();
    }
    delete this.nativeInput._smartSearch;
  }

  static enhance(el, options) {
    return new SmartSearch(el, options);
  }

  static enhanceAll(selector = '[data-component="search"], .smart-search, .search-input') {
    const elements = document.querySelectorAll(selector);
    const instances = [];
    elements.forEach(el => {
      instances.push(new SmartSearch(el));
    });
    return instances;
  }
}

window.SmartSearch = SmartSearch;
