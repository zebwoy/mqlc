/**
 * RadioGroup — Styled radio button pill group component
 * ───────────────────────────────────────────────────────
 * Renders options as clickable pill-style radio buttons.
 * Injects a hidden <input name="..."> so FormData picks it up automatically.
 *
 * Usage:
 *   const rg = new RadioGroup(document.getElementById('gender-host'), {
 *     name: 'gender',
 *     options: [{ value: 'Male', label: '♂ Male' }, { value: 'Female', label: '♀ Female' }],
 *     value: 'Male',           // pre-selected value
 *     onChange: (val) => {}
 *   });
 *
 *   rg.getValue()        → current value string
 *   rg.setValue('Female') → update programmatically
 *   rg.reset()           → resets to first option
 */
class RadioGroup {
  constructor(el, { name = '', options = [], value = '', onChange } = {}) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    this.name = name;
    this.options = options;
    this.value = value || options[0]?.value || '';
    this.onChange = onChange || null;
    if (!this.el || !name || !options.length) return;
    this._injectStyles();
    this._render();
  }

  _injectStyles() {
    if (document.getElementById('rg-global-styles')) return;
    const s = document.createElement('style');
    s.id = 'rg-global-styles';
    s.textContent = `
      .rg-pill {
        display: inline-flex; align-items: center; gap: 0.3rem;
        padding: 0.42rem 1.1rem; border-radius: 50px; cursor: pointer;
        border: 1.5px solid var(--admin-border, #e2e8f0);
        font-size: 0.875rem; font-weight: 500;
        background: #fff; color: var(--admin-text, #1a202c);
        transition: background 0.15s, border-color 0.15s, color 0.15s;
        user-select: none; line-height: 1.4;
      }
      .rg-pill.rg-active {
        background: var(--admin-accent, #2D6A4F);
        border-color: var(--admin-accent, #2D6A4F);
        color: #fff;
      }
      .rg-pill:hover:not(.rg-active) {
        border-color: var(--admin-accent, #2D6A4F);
        color: var(--admin-accent, #2D6A4F);
      }
    `;
    document.head.appendChild(s);
  }

  _render() {
    // Hidden input for form submission
    this._hidden = document.createElement('input');
    this._hidden.type = 'hidden';
    this._hidden.name = this.name;
    this._hidden.value = this.value;

    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;';

    this.options.forEach(opt => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'rg-pill' + (opt.value === this.value ? ' rg-active' : '');
      pill.dataset.value = opt.value;
      pill.textContent = opt.label;
      pill.addEventListener('click', () => {
        this.setValue(opt.value);
        if (this.onChange) this.onChange(opt.value);
      });
      wrap.appendChild(pill);
    });

    this.el.innerHTML = '';
    this.el.appendChild(wrap);
    this.el.appendChild(this._hidden);
  }

  _updatePills() {
    this.el.querySelectorAll('.rg-pill').forEach(pill => {
      pill.classList.toggle('rg-active', pill.dataset.value === this.value);
    });
  }

  getValue() { return this.value; }

  setValue(val) {
    this.value = val;
    if (this._hidden) this._hidden.value = val;
    this._updatePills();
  }

  reset() { this.setValue(this.options[0]?.value || ''); }
}
