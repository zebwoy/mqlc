/* ─── js/components/datepicker.js ──────────────────────────────── */
(function (window) {
  'use strict';

  class CustomDatePicker {
    /**
     * @param {Object} options
     * @param {string|Element} options.container  — selector or DOM element
     * @param {string|Element} options.input      — selector or DOM element (hidden date input)
     * @param {Function}       [options.onSelect] — callback(date)
     * @param {Date|string|null} [options.initialDate] — null = no pre-selection
     * @param {boolean}        [options.showTrigger=true] — false to hide built-in trigger button
     *                          (use open/close/toggle programmatically instead)
     */
    constructor(options) {
      // Accept DOM element OR CSS selector
      this.container = (options.container instanceof Element)
        ? options.container
        : document.querySelector(options.container);
      this.input = (options.input instanceof Element)
        ? options.input
        : document.querySelector(options.input);

      this.onSelect   = options.onSelect  || (() => {});
      this.showTrigger = options.showTrigger !== false; // default: true

      // null = no pre-selection; omitted = default to today
      if ('initialDate' in options) {
        this.initialDate = options.initialDate
          ? new Date(options.initialDate)
          : null;
      } else {
        this.initialDate = new Date();
      }

      this.selectedDate = this.initialDate;
      const viewFrom   = this.selectedDate || new Date();
      this.viewYear    = viewFrom.getFullYear();
      this.viewMonth   = viewFrom.getMonth();

      this.init();
    }

    // ── Public API ──────────────────────────────────────────────
    open()   { if (this.dropdownEl) { this.dropdownEl.style.display = 'block'; this.renderGrid(); } }
    close()  { if (this.dropdownEl)   this.dropdownEl.style.display = 'none'; }
    toggle() {
      if (!this.dropdownEl) return;
      const isOpen = this.dropdownEl.style.display !== 'none';
      if (isOpen) this.close(); else this.open();
    }

    /** Programmatically select a date (ISO string or Date object). */
    setDate(dateOrISO) {
      if (!dateOrISO) return;
      const date = (typeof dateOrISO === 'string')
        ? new Date(dateOrISO + (dateOrISO.length === 10 ? 'T12:00:00' : ''))
        : dateOrISO;
      if (!isNaN(date.getTime())) this.selectDate(date);
    }

    /** Clear selection. */
    clear() {
      this.selectedDate = null;
      if (this.input)     this.input.value = '';
      if (this.displayEl) this.displayEl.textContent = 'Select date';
    }

    // ── Internals ───────────────────────────────────────────────
    init() {
      if (!this.container || !this.input) return;

      const idPrefix    = 'dp-' + Math.random().toString(36).substring(2, 9);
      this.triggerId    = `${idPrefix}-trigger`;
      this.displayId    = `${idPrefix}-display`;
      this.dropdownId   = `${idPrefix}-dropdown`;
      this.prevId       = `${idPrefix}-prev`;
      this.nextId       = `${idPrefix}-next`;
      this.gridId       = `${idPrefix}-grid`;
      this.labelId      = `${idPrefix}-label`;
      this.todayBtnId   = `${idPrefix}-today`;

      const triggerHidden = this.showTrigger ? '' : ' style="display:none;"';

      this.container.innerHTML = `
        <button type="button" class="datepicker-trigger" id="${this.triggerId}"${triggerHidden}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span id="${this.displayId}">Select date</span>
        </button>
        <div class="datepicker-dropdown" id="${this.dropdownId}" style="display:none;">
          <div class="datepicker-nav">
            <button type="button" id="${this.prevId}">‹</button>
            <span id="${this.labelId}"></span>
            <button type="button" id="${this.nextId}">›</button>
          </div>
          <div class="datepicker-grid" id="${this.gridId}"></div>
          <div class="datepicker-footer">
            <button type="button" id="${this.todayBtnId}" class="dp-quick-btn">Today</button>
          </div>
        </div>
      `;

      this.triggerBtn = this.container.querySelector(`#${this.triggerId}`);
      this.displayEl  = this.container.querySelector(`#${this.displayId}`);
      this.dropdownEl = this.container.querySelector(`#${this.dropdownId}`);
      this.prevBtn    = this.container.querySelector(`#${this.prevId}`);
      this.nextBtn    = this.container.querySelector(`#${this.nextId}`);
      this.gridEl     = this.container.querySelector(`#${this.gridId}`);
      this.labelEl    = this.container.querySelector(`#${this.labelId}`);
      this.todayBtn   = this.container.querySelector(`#${this.todayBtnId}`);

      // Built-in trigger toggle
      this.triggerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });

      this.prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.viewMonth--;
        if (this.viewMonth < 0) { this.viewMonth = 11; this.viewYear--; }
        this.renderGrid();
      });

      this.nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.viewMonth++;
        if (this.viewMonth > 11) { this.viewMonth = 0; this.viewYear++; }
        this.renderGrid();
      });

      this.todayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectDate(new Date());
        this.close();
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (this.container && !this.container.contains(e.target)) this.close();
      });

      // Initial render
      if (this.selectedDate) {
        this.selectDate(this.selectedDate);
      } else {
        this.renderGrid(); // render grid for current month without selecting
      }
    }

    formatDisplay(date) {
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    toISO(date) {
      return date.getFullYear() + '-' +
        String(date.getMonth() + 1).padStart(2, '0') + '-' +
        String(date.getDate()).padStart(2, '0');
    }

    selectDate(date) {
      if (!date) return;
      this.selectedDate = date;
      this.input.value = this.toISO(date);
      if (this.displayEl) this.displayEl.textContent = this.formatDisplay(date);
      this.viewYear  = date.getFullYear();
      this.viewMonth = date.getMonth();
      this.renderGrid();
      this.onSelect(date);
    }

    renderGrid() {
      if (!this.gridEl || !this.labelEl) return;

      const viewDate = new Date(this.viewYear, this.viewMonth, 1);
      this.labelEl.textContent = viewDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

      const today       = new Date();
      const selectedVal = this.input ? this.input.value : '';
      const firstDay    = viewDate.getDay();
      const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();

      let html = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
        .map(d => `<span class="dp-head">${d}</span>`).join('');

      for (let i = 0; i < firstDay; i++) html += `<span></span>`;

      for (let day = 1; day <= daysInMonth; day++) {
        const iso        = this.toISO(new Date(this.viewYear, this.viewMonth, day));
        const isToday    = (day === today.getDate() && this.viewMonth === today.getMonth() && this.viewYear === today.getFullYear());
        const isSelected = (iso === selectedVal);
        const cls = `dp-day${isToday ? ' dp-today' : ''}${isSelected ? ' dp-selected' : ''}`;
        html += `<button type="button" class="${cls}" data-date="${iso}">${day}</button>`;
      }

      this.gridEl.innerHTML = html;

      this.gridEl.querySelectorAll('.dp-day').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const [y, m, d] = btn.dataset.date.split('-').map(Number);
          this.selectDate(new Date(y, m - 1, d));
          this.close();
        });
      });
    }
  }

  window.CustomDatePicker = CustomDatePicker;
})(window);
