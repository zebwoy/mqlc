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
      // 1. Wrap the native select or hide it
      this.nativeSelect.style.display = 'none';

      // Create wrapper element
      this.wrapper = document.createElement('div');
      this.wrapper.className = 'custom-select-wrapper';
      
      // If the native select has a rounded border style (e.g. filters), inherit it
      if (this.nativeSelect.id.includes('filter') || this.nativeSelect.classList.contains('rounded') || this.options.rounded) {
        this.wrapper.classList.add('rounded');
      }
      
      // Inherit modal-select class for spacing if present
      if (this.nativeSelect.classList.contains('modal-select')) {
        this.wrapper.classList.add('modal-select-wrapper');
      }

      // Insert wrapper after native select and move native select inside
      this.nativeSelect.parentNode.insertBefore(this.wrapper, this.nativeSelect);
      this.wrapper.appendChild(this.nativeSelect);

      // Transfer layout styles from native select to wrapper
      const stylesToTransfer = ['flex', 'width', 'minWidth', 'maxWidth', 'margin', 'marginLeft', 'marginRight', 'marginTop', 'marginBottom'];
      stylesToTransfer.forEach(styleName => {
        const val = this.nativeSelect.style[styleName];
        if (val) {
          this.wrapper.style[styleName] = val;
        }
      });

      // 2. Create the Trigger Button
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

      // 3. Create the Custom Dropdown List
      this.dropdown = document.createElement('div');
      this.dropdown.className = 'custom-select-dropdown';
      this.wrapper.appendChild(this.dropdown);

      // 4. Load initial options list
      this.syncOptions();

      // 5. Setup MutationObserver to automatically watch for dynamic option changes in native select
      this.observer = new MutationObserver(() => {
        this.syncOptions();
      });
      this.observer.observe(this.nativeSelect, { childList: true, subtree: true, attributes: true, attributeFilter: ['selected'] });

      // 6. Bind Events
      this.trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });

      // Handle document click to close dropdown when clicking outside
      this.documentClickHandler = (e) => {
        if (!this.wrapper.contains(e.target)) {
          this.close();
        }
      };
      document.addEventListener('click', this.documentClickHandler);

      // Keyboard navigation
      this.trigger.addEventListener('keydown', (e) => {
        const isOpen = this.wrapper.classList.contains('open');
        const items = Array.from(this.dropdown.querySelectorAll('.custom-select-option'));
        const activeIndex = items.findIndex(item => item.classList.contains('selected'));

        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          if (!isOpen) {
            this.open();
            return;
          }
          let nextIndex = activeIndex;
          if (e.key === 'ArrowDown') {
            nextIndex = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
          } else {
            nextIndex = activeIndex > 0 ? activeIndex - 1 : items.length - 1;
          }
          if (items[nextIndex]) {
            const val = items[nextIndex].dataset.value;
            this.selectValue(val);
          }
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggle();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this.close();
        } else if (e.key === 'Tab') {
          this.close();
        }
      });
    }

    syncOptions() {
      // Rebuild the custom list items from the native select options
      const optionsList = Array.from(this.nativeSelect.options);
      this.dropdown.innerHTML = '';
      
      const selectedValue = this.nativeSelect.value;
      let selectedText = '';

      optionsList.forEach(opt => {
        if (opt.disabled && !opt.value) return; // skip dummy placeholders that have no value

        const item = document.createElement('div');
        item.className = 'custom-select-option';
        item.dataset.value = opt.value;
        item.textContent = opt.textContent;

        const isSelected = opt.value === selectedValue;
        if (isSelected) {
          item.classList.add('selected');
          selectedText = opt.textContent;
        }

        item.addEventListener('click', (e) => {
          e.stopPropagation();
          this.selectValue(opt.value);
          this.close();
        });

        this.dropdown.appendChild(item);
      });

      // Update the trigger label text
      this.trigger.querySelector('span').textContent = selectedText || this.nativeSelect.value || 'Select...';
    }

    selectValue(value) {
      if (this.nativeSelect.value === value) return;
      this.nativeSelect.value = value;
      
      // Dispatch a change event on the native select so existing listeners capture it!
      const event = new Event('change', { bubbles: true });
      this.nativeSelect.dispatchEvent(event);
      
      // Re-sync UI state
      this.syncOptions();
    }

    toggle() {
      if (this.wrapper.classList.contains('open')) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      // Close any other open custom selects first
      document.querySelectorAll('.custom-select-wrapper.open').forEach(el => {
        if (el !== this.wrapper) el.classList.remove('open');
      });
      
      this.wrapper.classList.add('open');
      this.syncOptions(); // make sure it's fully in sync before displaying
      
      // Scroll selected option into view if list is long
      const selectedOpt = this.dropdown.querySelector('.custom-select-option.selected');
      if (selectedOpt) {
        selectedOpt.scrollIntoView({ block: 'nearest' });
      }
    }

    close() {
      this.wrapper.classList.remove('open');
    }

    destroy() {
      document.removeEventListener('click', this.documentClickHandler);
      if (this.observer) this.observer.disconnect();
      this.nativeSelect.style.display = '';
      if (this.wrapper.parentNode) {
        this.wrapper.parentNode.insertBefore(this.nativeSelect, this.wrapper);
        this.wrapper.remove();
      }
    }
  }

  window.CustomSelect = CustomSelect;
})(window);
