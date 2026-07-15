/**
 * TogglePill — Reusable cycling pill button component
 * ─────────────────────────────────────────────────────
 * A single <button> that cycles through a list of named states on each click.
 * Each state can define its own label, text colour, and background.
 * Compact enough to sit inline with selects and text inputs in a filter bar.
 *
 * Usage:
 *   const pill = new TogglePill(document.getElementById('my-btn'), [
 *     { value: 'all',      label: 'All',        bg: '#f3f4f6', color: '#6b7280' },
 *     { value: 'prepaid',  label: '🔵 Prepaid', bg: '#dbeafe', color: '#1d4ed8' },
 *     { value: 'postpaid', label: 'Postpaid',   bg: '#fef9c3', color: '#92400e' },
 *   ], (value, state) => console.log('changed to', value));
 *
 *   pill.getValue()   → current value string
 *   pill.reset()      → jump back to index 0 and fire onChange
 *   pill.set('prepaid') → jump to a specific value by name and fire onChange
 */
class TogglePill {
  /**
   * @param {HTMLButtonElement} el       - The button element to control
   * @param {Array<{value:string, label:string, bg?:string, color?:string}>} states
   * @param {function(value:string, state:object):void} [onChange]
   */
  constructor(el, states, onChange) {
    if (!el || !states || states.length === 0) {
      throw new Error('TogglePill: el and at least one state are required.');
    }
    this.el = el;
    this.states = states;
    this.index = 0;
    this.onChange = onChange || null;

    // Base button styles (applied once — states only change colour/text)
    this.el.style.cssText += `
      padding: 0.4rem 0.85rem;
      border-radius: 50px;
      border: 1px solid var(--admin-border, #e2e8f0);
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.18s, color 0.18s, border-color 0.18s;
      white-space: nowrap;
      outline: none;
    `;

    this._render(false); // no callback on init

    this.el.addEventListener('click', () => this._cycle());
  }

  /** Advance to the next state and fire onChange */
  _cycle() {
    this.index = (this.index + 1) % this.states.length;
    this._render(true);
  }

  /** Apply current state visuals to the button */
  _render(fireCallback) {
    const s = this.states[this.index];
    this.el.textContent  = s.label;
    this.el.style.background   = s.bg    || '#f3f4f6';
    this.el.style.color        = s.color || 'var(--admin-text, #1a202c)';
    this.el.style.borderColor  = s.borderColor || s.bg || 'var(--admin-border, #e2e8f0)';
    this.el.dataset.value      = s.value;

    if (fireCallback && this.onChange) {
      this.onChange(s.value, s);
    }
  }

  /** Get the current value string */
  getValue() {
    return this.states[this.index].value;
  }

  /** Reset to the first state */
  reset() {
    this.index = 0;
    this._render(true);
  }

  /** Jump to a specific state by value name */
  set(value) {
    const idx = this.states.findIndex(s => s.value === value);
    if (idx !== -1) {
      this.index = idx;
      this._render(true);
    }
  }
}
