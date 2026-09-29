/* ─── js/components/select.js ──────────────────────────────── */
(function (window) {
  'use strict';

  class CustomSelect {
    constructor(selectElement, options = {}) {
      this.nativeSelect = typeof selectElement === 'string' ? document.querySelector(selectElement) : selectElement;
      if (!this.nativeSelect) return;
      this.options = options;
      this.init();
    }

    init() {
      this.nativeSelect.style.display = 'none';

      this.wrapper = document.createElement('div');
      this.wrapper.className = 'custom-select-wrapper';

      const isRounded =
        this.nativeSelect.id.includes('filter') ||
        this.nativeSelect.id.includes('month') ||
        this.nativeSelect.id.includes('year') ||
        this.nativeSelect.id.includes('quiz') ||
        this.nativeSelect.classList.contains('rounded') ||
        (this.nativeSelect.style.borderRadius && parseInt(this.nativeSelect.style.borderRadius) > 12) ||
        this.options.rounded;
      if (isRounded) this.wrapper.classList.add('rounded');
      if (this.nativeSelect.classList.contains('modal-select')) this.wrapper.classList.add('modal-select-wrapper');

      this.nativeSelect.parentNode.insertBefore(this.wrapper, this.nativeSelect);
      this.wrapper.appendChild(this.nativeSelect);
      this.wrapper._csInstance = this;

      const stylesToTransfer = ['flex', 'width', 'minWidth', 'maxWidth', 'margin', 'marginLeft', 'marginRight', 'marginTop', 'marginBottom'];
      stylesToTransfer.forEach(styleName => {
        const val = this.nativeSelect.style[styleName];
        if (val) this.wrapper.style[styleName] = val;
      });

      // Trigger button
      this.trigger = document.createElement('button');
      this.trigger.type = 'button';
      this.trigger.className = 'custom-select-trigger';
      this.trigger.innerHTML = `
        <span></span>
        <svg class="custom-select-chevron" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      `;
      this.wrapper.appendChild(this.trigger);

      // Dropdown — portalled to document.body so it escapes ALL ancestor overflow contexts
      this.dropdown = document.createElement('div');
      this.dropdown.className = 'custom-select-dropdown custom-select-portal';
      this.dropdown.style.cssText = 'position:fixed;z-index:99999;';
      document.body.appendChild(this.dropdown);

      this.syncOptions();

      // Watch for dynamic option changes
      this.observer = new MutationObserver(() => this.syncOptions());
      this.observer.observe(this.nativeSelect, { childList: true, subtree: true, attributes: true, attributeFilter: ['selected'] });

      // Intercept programmatic .value = to auto-sync the UI
      const nativeValueDesc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
      if (nativeValueDesc && nativeValueDesc.set) {
        const self = this;
        Object.defineProperty(this.nativeSelect, 'value', {
          get() { return nativeValueDesc.get.call(this); },
          set(val) { nativeValueDesc.set.call(this, val); self.syncOptions(); },
          configurable: true
        });
      }

      // Click trigger
      this.trigger.addEventListener('click', (e) => { e.stopPropagation(); this.toggle(); });

      // Click outside closes
      this.documentClickHandler = (e) => {
        if (!this.wrapper.contains(e.target) && !this.dropdown.contains(e.target)) this.close();
      };
      document.addEventListener('click', this.documentClickHandler);

      // Reposition portal on scroll/resize
      this.repositionHandler = () => { if (this.wrapper.classList.contains('open')) this._positionDropdown(); };
      window.addEventListener('scroll', this.repositionHandler, true);
      window.addEventListener('resize', this.repositionHandler);

      // Keyboard navigation
      this.trigger.addEventListener('keydown', (e) => {
        const isOpen = this.wrapper.classList.contains('open');
        const items = Array.from(this.dropdown.querySelectorAll('.custom-select-option'));
        const activeIndex = items.findIndex(item => item.classList.contains('selected'));

        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          if (!isOpen) { this.open(); return; }
          let nextIndex = activeIndex;
          if (e.key === 'ArrowDown') nextIndex = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
          else nextIndex = activeIndex > 0 ? activeIndex - 1 : items.length - 1;
          if (items[nextIndex]) this.selectValue(items[nextIndex].dataset.value);
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault(); this.toggle();
        } else if (e.key === 'Escape') {
          e.preventDefault(); this.close();
        } else if (e.key === 'Tab') {
          this.close();
        }
      });
    }

    syncOptions() {
      const optionsList = Array.from(this.nativeSelect.options);
      this.dropdown.innerHTML = '';
      const selectedValue = this.nativeSelect.value;
      let selectedText = '';

      optionsList.forEach(opt => {
        if (opt.disabled && !opt.value) return;
        const item = document.createElement('div');
        item.className = 'custom-select-option';
        item.dataset.value = opt.value;
        item.textContent = opt.textContent;
        const isSelected = opt.value === selectedValue;
        if (isSelected) { item.classList.add('selected'); selectedText = opt.textContent; }
        item.addEventListener('click', (e) => { e.stopPropagation(); this.selectValue(opt.value); this.close(); });
        this.dropdown.appendChild(item);
      });

      this.trigger.querySelector('span').textContent = selectedText || this.nativeSelect.value || 'Select...';
    }

    selectValue(value) {
      if (this.nativeSelect.value === value) return;
      this.nativeSelect.value = value;
      const event = new Event('change', { bubbles: true });
      this.nativeSelect.dispatchEvent(event);
      this.syncOptions();
    }

    toggle() {
      this.wrapper.classList.contains('open') ? this.close() : this.open();
    }

    // Position the portal using the trigger's fixed viewport coords
    _positionDropdown() {
      const triggerRect = this.trigger.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const dropdownHeight = this.dropdown.offsetHeight || 220;
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      const openUpward = spaceBelow < dropdownHeight + 8 && spaceAbove > spaceBelow;

      this.dropdown.style.width = triggerRect.width + 'px';
      this.dropdown.style.left  = triggerRect.left + 'px';

      if (openUpward) {
        this.dropdown.style.top    = 'auto';
        this.dropdown.style.bottom = (viewportHeight - triggerRect.top + 4) + 'px';
        this.dropdown.classList.add('drop-up');
        this.wrapper.classList.add('drop-up');
      } else {
        this.dropdown.style.top    = (triggerRect.bottom + 4) + 'px';
        this.dropdown.style.bottom = 'auto';
        this.dropdown.classList.remove('drop-up');
        this.wrapper.classList.remove('drop-up');
      }
    }

    open() {
      document.querySelectorAll('.custom-select-wrapper.open').forEach(el => {
        if (el !== this.wrapper && el._csInstance) el._csInstance.close();
      });
      this.syncOptions();
      this.wrapper.classList.add('open');
      this.dropdown.classList.add('open');
      requestAnimationFrame(() => {
        this._positionDropdown();
        const selectedOpt = this.dropdown.querySelector('.custom-select-option.selected');
        if (selectedOpt) selectedOpt.scrollIntoView({ block: 'nearest' });
      });
    }

    close() {
      this.wrapper.classList.remove('open', 'drop-up');
      this.dropdown.classList.remove('open', 'drop-up');
    }

    destroy() {
      document.removeEventListener('click', this.documentClickHandler);
      window.removeEventListener('scroll', this.repositionHandler, true);
      window.removeEventListener('resize', this.repositionHandler);
      if (this.observer) this.observer.disconnect();
      this.nativeSelect.style.display = '';
      if (this.dropdown && this.dropdown.parentNode) this.dropdown.parentNode.removeChild(this.dropdown);
      if (this.wrapper.parentNode) {
        this.wrapper.parentNode.insertBefore(this.nativeSelect, this.wrapper);
        this.wrapper.remove();
      }
    }
  }

  window.CustomSelect = CustomSelect;
})(window);
