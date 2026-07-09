/* ─── js/components/datepicker.js ──────────────────────────────── */
(function (window) {
  'use strict';

  class CustomDatePicker {
    constructor(options) {
      this.container = document.querySelector(options.container);
      this.input = document.querySelector(options.input);
      this.onSelect = options.onSelect || (() => {});
      this.initialDate = options.initialDate ? new Date(options.initialDate) : new Date();
      this.selectedDate = this.initialDate;
      this.viewYear = this.selectedDate.getFullYear();
      this.viewMonth = this.selectedDate.getMonth();

      this.init();
    }

    init() {
      if (!this.container || !this.input) return;

      // Unique IDs/Selectors for dropdown items to allow multiple instances
      const idPrefix = 'dp-' + Math.random().toString(36).substring(2, 9);
      this.triggerId = `${idPrefix}-trigger`;
      this.displayId = `${idPrefix}-display`;
      this.dropdownId = `${idPrefix}-dropdown`;
      this.prevId = `${idPrefix}-prev`;
      this.nextId = `${idPrefix}-next`;
      this.gridId = `${idPrefix}-grid`;
      this.labelId = `${idPrefix}-label`;
      this.todayBtnId = `${idPrefix}-today`;

      // Render the structure
      this.container.innerHTML = `
        <button type="button" class="datepicker-trigger" id="${this.triggerId}">
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
      this.displayEl = this.container.querySelector(`#${this.displayId}`);
      this.dropdownEl = this.container.querySelector(`#${this.dropdownId}`);
      this.prevBtn = this.container.querySelector(`#${this.prevId}`);
      this.nextBtn = this.container.querySelector(`#${this.nextId}`);
      this.gridEl = this.container.querySelector(`#${this.gridId}`);
      this.labelEl = this.container.querySelector(`#${this.labelId}`);
      this.todayBtn = this.container.querySelector(`#${this.todayBtnId}`);

      // Bind events
      this.triggerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = this.dropdownEl.style.display !== 'none';
        this.dropdownEl.style.display = isOpen ? 'none' : 'block';
        if (!isOpen) this.renderGrid();
      });

      this.prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.viewMonth--;
        if (this.viewMonth < 0) {
          this.viewMonth = 11;
          this.viewYear--;
        }
        this.renderGrid();
      });

      this.nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.viewMonth++;
        if (this.viewMonth > 11) {
          this.viewMonth = 0;
          this.viewYear++;
        }
        this.renderGrid();
      });

      this.todayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectDate(new Date());
        this.dropdownEl.style.display = 'none';
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!this.container.contains(e.target)) {
          this.dropdownEl.style.display = 'none';
        }
      });

      // Set initial value
      this.selectDate(this.selectedDate);
    }

    formatDisplay(date) {
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    toISO(date) {
      return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    }

    selectDate(date) {
      this.selectedDate = date;
      this.input.value = this.toISO(date);
      this.displayEl.textContent = this.formatDisplay(date);
      this.viewYear = date.getFullYear();
      this.viewMonth = date.getMonth();
      this.renderGrid();
      this.onSelect(date);
    }

    renderGrid() {
      if (!this.gridEl || !this.labelEl) return;

      const viewDate = new Date(this.viewYear, this.viewMonth, 1);
      this.labelEl.textContent = viewDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

      const today = new Date();
      const selectedVal = this.input.value;
      const firstDay = viewDate.getDay();
      const daysInMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();

      let html = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
        .map(d => `<span class="dp-head">${d}</span>`).join('');

      for (let i = 0; i < firstDay; i++) {
        html += `<span></span>`;
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const iso = this.toISO(new Date(this.viewYear, this.viewMonth, day));
        const isToday = (day === today.getDate() && this.viewMonth === today.getMonth() && this.viewYear === today.getFullYear());
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
          this.dropdownEl.style.display = 'none';
        });
      });
    }
  }

  window.CustomDatePicker = CustomDatePicker;
})(window);
