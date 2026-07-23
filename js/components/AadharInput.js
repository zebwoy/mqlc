/**
 * AadharInput — 3-box Aadhaar number input component (XXXX — XXXX — XXXX)
 * ──────────────────────────────────────────────────────────────────────────
 * Renders three separate 4-digit inputs with auto-advance, backspace nav,
 * and paste support. Combines into a hidden <input name="..."> for FormData.
 *
 * Usage:
 *   const ai = new AadharInput(document.getElementById('aadhar-host'), {
 *     name: 'aadhar_no',
 *     onChange: (val) => {}   // val is "XXXX-XXXX-XXXX" or ""
 *   });
 *
 *   ai.getValue()           → "XXXX-XXXX-XXXX"
 *   ai.setValue("123412341234") → fills all 3 boxes
 *   ai.reset()              → clears all boxes
 */
class AadharInput {
  constructor(el, { name = 'aadhar_no', onChange } = {}) {
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    this.name = name;
    this.onChange = onChange || null;
    if (!this.el) return;
    this._render();
  }

  _boxStyle() {
    return `
      flex: 1 1 0%; min-width: 0; max-width: 110px; width: 0; text-align: center; letter-spacing: 0.12em;
      font-weight: 700; font-size: 0.95rem; font-family: monospace;
      padding: 0.5rem 0.2rem; box-sizing: border-box;
      border: 1.5px solid var(--admin-border, #e2e8f0);
      border-radius: 8px; outline: none; background: #fff;
      transition: border-color 0.15s, box-shadow 0.15s;
      color: var(--admin-text, #1a202c);
    `;
  }

  _render() {
    const sep = '<span style="font-size:1.1rem;font-weight:700;color:var(--admin-muted,#718096);padding:0 1px;line-height:1;flex-shrink:0;">—</span>';

    this.el.innerHTML = `
      <div style="display:flex;align-items:center;gap:0.3rem;width:100%;max-width:100%;flex-wrap:nowrap;box-sizing:border-box;">
        <input class="aadhar-box" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="XXXX" style="${this._boxStyle()}">
        ${sep}
        <input class="aadhar-box" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="XXXX" style="${this._boxStyle()}">
        ${sep}
        <input class="aadhar-box" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="XXXX" style="${this._boxStyle()}">
        <input type="hidden" name="${this.name}">
      </div>
    `;

    this.boxes = Array.from(this.el.querySelectorAll('.aadhar-box'));
    this.hidden = this.el.querySelector(`input[name="${this.name}"]`);
    this._bindEvents();
  }

  _bindEvents() {
    this.boxes.forEach((box, i) => {
      // Allow only digits
      box.addEventListener('input', () => {
        box.value = box.value.replace(/\D/g, '').slice(0, 4);
        this._sync();
        if (box.value.length === 4 && i < 2) this.boxes[i + 1].focus();
      });

      // Backspace on empty → go back
      box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && box.value === '' && i > 0) {
          this.boxes[i - 1].focus();
          this.boxes[i - 1].setSelectionRange(4, 4);
        }
      });

      // Paste — handle full 12-digit paste anywhere
      box.addEventListener('paste', (e) => {
        e.preventDefault();
        const raw = (e.clipboardData?.getData('text') || '').replace(/\D/g, '');
        if (raw.length >= 8) {
          // Distribute across all 3 boxes from box 0
          this.boxes[0].value = raw.slice(0, 4);
          this.boxes[1].value = raw.slice(4, 8);
          this.boxes[2].value = raw.slice(8, 12);
          this.boxes[2].focus();
        } else {
          box.value = raw.slice(0, 4);
          if (box.value.length === 4 && i < 2) this.boxes[i + 1].focus();
        }
        this._sync();
      });

      // Focus ring
      box.addEventListener('focus', () => {
        box.style.borderColor = 'var(--admin-accent, #2D6A4F)';
        box.style.boxShadow = '0 0 0 2px rgba(45,106,79,0.12)';
      });
      box.addEventListener('blur', () => {
        box.style.borderColor = 'var(--admin-border, #e2e8f0)';
        box.style.boxShadow = 'none';
      });
    });
  }

  _sync() {
    const vals = this.boxes.map(b => b.value);
    const digits = vals.join('');
    this.hidden.value = digits.length > 0 ? vals.join('-') : '';
    if (this.onChange) this.onChange(this.hidden.value);
  }

  getValue() { return this.hidden?.value || ''; }

  setValue(val) {
    if (!val) return;
    const digits = String(val).replace(/\D/g, '');
    if (this.boxes[0]) this.boxes[0].value = digits.slice(0, 4);
    if (this.boxes[1]) this.boxes[1].value = digits.slice(4, 8);
    if (this.boxes[2]) this.boxes[2].value = digits.slice(8, 12);
    this._sync();
  }

  reset() {
    this.boxes.forEach(b => b.value = '');
    if (this.hidden) this.hidden.value = '';
  }
}
