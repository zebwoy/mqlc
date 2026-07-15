/**
 * SmartDateInput — Dual-mode date input (text typing + calendar picker)
 * ───────────────────────────────────────────────────────────────────────
 * Wraps an existing <input type="date" name="..."> with:
 *   • A styled text input for fast typing (supports multiple formats)
 *   • A calendar icon button that opens the native date picker
 *
 * Supported text input formats:
 *   "15 Jul 2026", "15 July 2026"  → parsed via Date constructor
 *   "15/07/2026",  "15-07-2026"    → DD/MM/YYYY or DD-MM-YYYY
 *   "2026-07-15"                   → ISO YYYY-MM-DD
 *
 * The underlying <input type="date"> is kept in the DOM (tiny, overlapping
 * the calendar button) so form.reset() and FormData work without changes.
 *
 * Usage:
 *   const sdi = new SmartDateInput(document.getElementById('my-date-input'), {
 *     placeholder: 'DD MMM YYYY',
 *     onChange: (isoString) => {}
 *   });
 *
 *   sdi.getValue()          → "2026-07-15" (ISO)
 *   sdi.setValue("2026-07-15") → sets both text and hidden input
 *   sdi.reset()             → clears everything
 */
class SmartDateInput {
  constructor(inputEl, { placeholder = 'DD MMM YYYY  or  DD/MM/YYYY', onChange } = {}) {
    this.input = typeof inputEl === 'string' ? document.querySelector(inputEl) : inputEl;
    this.placeholder = placeholder;
    this.onChange = onChange || null;
    if (!this.input) return;
    this._init();
  }

  _init() {
    // Wrapper
    this.wrapper = document.createElement('div');
    this.wrapper.style.cssText = 'display:flex;align-items:stretch;gap:0.35rem;position:relative;';

    // Styled text input
    this.textInput = document.createElement('input');
    this.textInput.type = 'text';
    this.textInput.placeholder = this.placeholder;
    this.textInput.autocomplete = 'off';
    this.textInput.style.cssText = `
      flex:1; min-width:0; padding:0.5rem 0.75rem;
      border:1.5px solid var(--admin-border,#e2e8f0);
      border-radius:8px; font-size:0.9rem; outline:none;
      transition:border-color 0.15s, box-shadow 0.15s;
      color:var(--admin-text,#1a202c); background:#fff;
    `;

    // Calendar icon button
    this.calBtn = document.createElement('button');
    this.calBtn.type = 'button';
    this.calBtn.title = 'Pick from calendar';
    this.calBtn.style.cssText = `
      position:relative; padding:0 0.7rem;
      border:1.5px solid var(--admin-border,#e2e8f0);
      border-radius:8px; background:#fff; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      color:var(--admin-muted,#718096); flex-shrink:0;
      transition:border-color 0.15s, color 0.15s;
      overflow:hidden;
    `;
    this.calBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events:none;">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    `;

    // Position native date input INSIDE calBtn so showPicker() works
    // (it must be rendered/visible; overlapping the button keeps it accessible)
    this.input.removeAttribute('required'); // avoid confusing native validation on hidden el
    this.input.style.cssText = `
      position:absolute; inset:0; opacity:0; cursor:pointer;
      width:100%; height:100%; border:none; padding:0; margin:0;
      font-size:1px;
    `;
    this.calBtn.appendChild(this.input);

    this.wrapper.appendChild(this.textInput);
    this.wrapper.appendChild(this.calBtn);

    // Insert wrapper where the input was
    const parent = this.input.parentNode;
    parent.insertBefore(this.wrapper, this.input);

    // Sync display if there's already a value
    if (this.input.value) this.textInput.value = this._isoToDisplay(this.input.value);

    this._bindEvents();
  }

  _bindEvents() {
    // Calendar button → open native picker
    this.calBtn.addEventListener('click', (e) => {
      // Don't re-trigger if user clicked the native input directly
      if (e.target === this.input) return;
      try { this.input.showPicker(); } catch (_) {}
    });

    // Native date input change → update text display
    this.input.addEventListener('change', () => {
      this.textInput.value = this._isoToDisplay(this.input.value);
      if (this.onChange) this.onChange(this.input.value);
    });

    // Text input: parse on blur and Enter
    this.textInput.addEventListener('blur', () => this._parseAndApply());
    this.textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); this._parseAndApply(); }
    });

    // Focus styles — text input
    this.textInput.addEventListener('focus', () => {
      this.textInput.style.borderColor = 'var(--admin-accent,#2D6A4F)';
      this.textInput.style.boxShadow = '0 0 0 2px rgba(45,106,79,0.12)';
    });
    this.textInput.addEventListener('blur', () => {
      this.textInput.style.borderColor = 'var(--admin-border,#e2e8f0)';
      this.textInput.style.boxShadow = 'none';
    });

    // Hover styles — calendar button
    this.calBtn.addEventListener('mouseenter', () => {
      this.calBtn.style.borderColor = 'var(--admin-accent,#2D6A4F)';
      this.calBtn.style.color = 'var(--admin-accent,#2D6A4F)';
    });
    this.calBtn.addEventListener('mouseleave', () => {
      this.calBtn.style.borderColor = 'var(--admin-border,#e2e8f0)';
      this.calBtn.style.color = 'var(--admin-muted,#718096)';
    });
  }

  _parseAndApply() {
    const raw = this.textInput.value.trim();
    if (!raw) { this.input.value = ''; return; }

    let parsed = null;

    // ISO: 2026-07-15
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(raw)) {
      parsed = new Date(raw + 'T12:00:00');
    }
    // DD/MM/YYYY or DD-MM-YYYY
    else if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(raw)) {
      const [d, m, y] = raw.split(/[\/\-]/).map(Number);
      parsed = new Date(y, m - 1, d, 12, 0, 0);
    }
    // Natural: "15 Jul 2026", "15 July 2026", "July 15, 2026"
    else {
      parsed = new Date(raw);
    }

    if (parsed && !isNaN(parsed.getTime())) {
      const iso = this._toISO(parsed);
      this.input.value = iso;
      this.textInput.value = this._isoToDisplay(iso);
      if (this.onChange) this.onChange(iso);
    } else {
      // Shake + red border on bad input
      this.textInput.style.borderColor = '#dc2626';
      this.textInput.style.boxShadow = '0 0 0 2px rgba(220,38,38,0.15)';
      setTimeout(() => {
        this.textInput.style.borderColor = 'var(--admin-border,#e2e8f0)';
        this.textInput.style.boxShadow = 'none';
      }, 1600);
    }
  }

  _toISO(date) {
    return (
      date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0')
    );
  }

  _isoToDisplay(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return '';
    return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  getValue() { return this.input?.value || ''; }

  setValue(iso) {
    if (!this.input) return;
    this.input.value = iso || '';
    this.textInput.value = this._isoToDisplay(iso);
  }

  reset() {
    if (this.input) this.input.value = '';
    if (this.textInput) this.textInput.value = '';
  }
}
