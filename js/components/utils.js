/* ─── js/components/utils.js ────────────────────────────────── */
(function (window) {
  'use strict';

  /**
   * Safe HTML Escaping Utility to prevent Stored XSS injections.
   * @param {*} str - Raw string or object value.
   * @returns {string} Sanitized string value.
   */
  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    const s = String(str);
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Debouncing performance utility to limit DOM updates on fast inputs.
   * @param {Function} fn - Target callback function.
   * @param {number} delay - Time delay in milliseconds.
   * @returns {Function} Debounced function.
   */
  function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /**
   * Unified Excel Exporter using SheetJS.
   * @param {Array<Object>} data - Array of row objects to convert to sheet.
   * @param {string} sheetName - Title of the sheet.
   * @param {string} filename - Output name of the excel file.
   */
  function exportToExcel(data, sheetName, filename) {
    if (typeof XLSX === 'undefined') {
      if (window.toast) {
        window.toast.error('Excel library (SheetJS) is not loaded.');
      } else {
        alert('Excel library (SheetJS) is not loaded.');
      }
      return;
    }

    if (!data || !data.length) {
      if (window.toast) {
        window.toast.warning('No data available to export.');
      } else {
        alert('No data available to export.');
      }
      return;
    }

    try {
      const ws = XLSX.utils.json_to_sheet(data);
      
      // Auto-fit column widths slightly
      const maxVals = {};
      data.forEach(row => {
        Object.keys(row).forEach(key => {
          const valLen = String(row[key] || '').length;
          maxVals[key] = Math.max(maxVals[key] || 10, valLen, key.length);
        });
      });
      ws['!cols'] = Object.keys(maxVals).map(key => ({ wch: maxVals[key] + 3 }));

      // Add auto-filters if there is a range
      if (ws['!ref']) {
        const range = XLSX.utils.decode_range(ws['!ref']);
        ws['!autofilter'] = { ref: XLSX.utils.encode_range(range) };
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, filename);

      if (window.toast) {
        window.toast.success(`Successfully exported report: ${filename}`);
      }
    } catch (err) {
      console.error('Excel export failed:', err);
      if (window.toast) {
        window.toast.error(`Export failed: ${err.message}`);
      }
    }
  }

  // Export functions to global scope
  window.escapeHTML = escapeHTML;
  window.debounce = debounce;
  window.exportToExcel = exportToExcel;

})(window);
