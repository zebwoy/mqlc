/**
 * SmartDateInput — Text input + CustomDatePicker calendar button
 * ─────────────────────────────────────────────────────────────────
 * Wraps an existing <input type="date" name="..."> with:
 *   • A styled text input for fast typing (multiple formats supported)
 *   • A calendar icon button that opens a CustomDatePicker dropdown
 *
 * Requires: js/components/datepicker.js (CustomDatePicker) loaded first.
 *
 * Supported text input formats:
 *   "27062025"          → DDMMYYYY compact   → 27 Jun 2025
 *   "15 Jul 2026"       → natural            → 15 Jul 2026
 *   "15/07/2026"        → DD/MM/YYYY         → 15 Jul 2026
 *   "15-07-2026"        → DD-MM-YYYY         → 15 Jul 2026
 *   "2026-07-15"        → ISO YYYY-MM-DD     → 15 Jul 2026
 *
 * The underlying <input type="date"> is kept in the DOM with display:none
 * so FormData / form.reset() still work without changes.
 *
 * Usage:
 *   const sdi = new SmartDateInput(document.getElementById('my-date-input'));
 *   sdi.getValue()           → "2026-07-15" (ISO)
 *   sdi.setValue("2026-07-15") → sets text display + hidden input
 *   sdi.reset()              → clears both
 */
class SmartDateInput {
  constructor(inputEl, { placeholder = 'DD MMM YYYY  or  27062025', onChange } = {}) {
    this.input       = typeof inputEl === 'string' ? document.querySelector(inputEl) : inputEl;
    this.placeholder = placeholder;
    this.onChange    = onChange || null;
    this._cdp        = null;
    if (!this.input) return;
    this._init();
  }

  _init() {
    const parent      = this.input.parentNode;

    // ── 1. Hide native input (kept for FormData serialization) ──
    this.input.style.display = 'none';
    this.input.removeAttribute('required');
    // Ensure the hidden input has an ID for CustomDatePicker to target
    if (!this.input.id) {
      this.input.id = 'sdi-native-' + Math.random().toString(36).substr(2, 8);
    }

    // ── 2. Build: [text input] [calendar button ▾] ─────────────
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'sdi-wrapper';
    this.wrapper.style.cssText = 'display:flex;align-items:stretch;gap:0.35rem;position:relative;';

    // Styled text input
    this.textInput = document.createElement('input');
    this.textInput.type        = 'text';
    this.textInput.placeholder = this.placeholder;
    this.textInput.autocomplete = 'off';
    this.textInput.style.cssText = `
      flex:1; min-width:0; padding:0.5rem 0.75rem;
      border:1.5px solid var(--admin-border,#e2e8f0);
      border-radius:8px; font-size:0.9rem; outline:none;
      transition:border-color 0.15s, box-shadow 0.15s;
      color:var(--admin-text,#1a202c); background:#fff;
    `;

    // Calendar icon button (opens CustomDatePicker dropdown)
    this.calBtn = document.createElement('button');
    this.calBtn.type  = 'button';
    this.calBtn.title = 'Pick from calendar';
    this.calBtn.style.cssText = `
      padding:0 0.7rem;
      border:1.5px solid var(--admin-border,#e2e8f0);
      border-radius:8px; background:#fff; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      color:var(--admin-muted,#718096); flex-shrink:0;
      transition:border-color 0.15s, color 0.15s;
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

    // ── 3. Host div for CustomDatePicker dropdown ───────────────
    // Absolutely positioned so the dropdown floats above other fields.
    this.dpHost = document.createElement('div');
    this.dpHost.id = 'sdi-dp-' + Math.random().toString(36).substr(2, 8);
    this.dpHost.style.cssText = `
      position:absolute; top:100%; left:0; right:0; z-index:500;
      margin-top:4px;
    `;

    this.wrapper.appendChild(this.textInput);
    this.wrapper.appendChild(this.calBtn);
    this.wrapper.appendChild(this.dpHost);

    // ── 4. Insert wrapper before the hidden native input ────────
    parent.insertBefore(this.wrapper, this.input);

    // ── 5. Initialise CustomDatePicker (trigger hidden) ─────────
    if (typeof CustomDatePicker !== 'undefined') {
      this._cdp = new CustomDatePicker({
        container:    this.dpHost,
        input:        this.input,
        showTrigger:  false,
        initialDate:  null,          // no pre-selection (setValue() called externally)
        onSelect:     (date) => {
          this.textInput.value = this._isoToDisplay(this._toISO(date));
          if (this.onChange) this.onChange(this._toISO(date));
        },
      });
      // Sync display if native input already has a value (e.g. setValue called before _init)
      if (this.input.value) {
        this.textInput.value = this._isoToDisplay(this.input.value);
        this._cdp.setDate(this.input.value);
      }
    }

    this._bindEvents();
  }

  _bindEvents() {
    // Calendar button → toggle dropdown
    this.calBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this._cdp) this._cdp.toggle();
    });

    // Text input: parse on blur and Enter
    this.textInput.addEventListener('blur',    () => this._parseAndApply());
    this.textInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); this._parseAndApply(); }
    });

    // Focus / blur styling
    this.textInput.addEventListener('focus', () => {
      this.textInput.style.borderColor = 'var(--admin-accent,#2D6A4F)';
      this.textInput.style.boxShadow   = '0 0 0 2px rgba(45,106,79,0.12)';
    });
    this.textInput.addEventListener('blur', () => {
      this.textInput.style.borderColor = 'var(--admin-border,#e2e8f0)';
      this.textInput.style.boxShadow   = 'none';
    });

    // Hover styling — calendar button
    this.calBtn.addEventListener('mouseenter', () => {
      this.calBtn.style.borderColor = 'var(--admin-accent,#2D6A4F)';
      this.calBtn.style.color       = 'var(--admin-accent,#2D6A4F)';
    });
    this.calBtn.addEventListener('mouseleave', () => {
      this.calBtn.style.borderColor = 'var(--admin-border,#e2e8f0)';
      this.calBtn.style.color       = 'var(--admin-muted,#718096)';
    });
  }

  _parseAndApply() {
    const raw = this.textInput.value.trim();
    if (!raw) { this.input.value = ''; return; }

    const parsed = this._parseInput(raw);

    if (parsed && !isNaN(parsed.getTime())) {
      const iso = this._toISO(parsed);
      this.input.value      = iso;
      this.textInput.value  = this._isoToDisplay(iso);
      if (this._cdp) this._cdp.setDate(iso);
      if (this.onChange) this.onChange(iso);
    } else {
      // Shake + red border to signal bad input
      this.textInput.style.borderColor = '#dc2626';
      this.textInput.style.boxShadow   = '0 0 0 2px rgba(220,38,38,0.15)';
      setTimeout(() => {
        this.textInput.style.borderColor = 'var(--admin-border,#e2e8f0)';
        this.textInput.style.boxShadow   = 'none';
      }, 1600);
    }
  }

  _parseInput(s) {
    // DDMMYYYY compact: "27062025"
    if (/^\d{8}$/.test(s)) {
      const d = parseInt(s.substr(0, 2), 10);
      const m = parseInt(s.substr(2, 2), 10);
      const y = parseInt(s.substr(4, 4), 10);
      const date = new Date(y, m - 1, d, 12, 0, 0);
      if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900) return date;
    }

    // ISO: 2026-07-15
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) {
      return new Date(s + 'T12:00:00');
    }

    // DD/MM/YYYY or DD-MM-YYYY
    if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(s)) {
      const [d, m, y] = s.split(/[\/\-]/).map(Number);
      return new Date(y, m - 1, d, 12, 0, 0);
    }

    // Natural: "15 Jul 2026", "15 July 2026", "July 15, 2026"
    const natural = new Date(s);
    if (!isNaN(natural.getTime())) return natural;

    return null;
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

  // ── Public API ────────────────────────────────────────────────
  getValue() { return this.input?.value || ''; }

  setValue(iso) {
    if (!this.input) return;
    this.input.value     = iso || '';
    if (this.textInput) this.textInput.value = this._isoToDisplay(iso);
    if (this._cdp && iso) this._cdp.setDate(iso);
  }

  reset() {
    if (this.input)     this.input.value = '';
    if (this.textInput) this.textInput.value = '';
    if (this._cdp)      this._cdp.clear();
  }
}
