/* ─── Premium Custom Robot Toast System ─────────────────────────── */

(function (window) {
  'use strict';

  // Ensure container element exists and enters top layer via popover API if supported
  function getContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      if (typeof container.showPopover === 'function') {
        container.setAttribute('popover', 'manual');
      }
      document.body.appendChild(container);
    }
    if (typeof container.showPopover === 'function') {
      try { container.showPopover(); } catch (_) {}
    }
    return container;
  }

  // Pure SVG robot templates per type
  const ROBOT_TEMPLATES = {
    info: `
      <svg class="rt-robot rt-info-robot" viewBox="0 0 40 40" width="40" height="40">
        <line x1="20" y1="8" x2="20" y2="4" stroke="#0284c7" stroke-width="2" stroke-linecap="round"/>
        <circle class="rt-antenna-tip" cx="20" cy="3" r="2.5" fill="#0284c7"/>
        <rect class="rt-body-group" x="8" y="8" width="24" height="24" rx="6" fill="#f0f9ff" stroke="#0284c7" stroke-width="2"/>
        <rect class="rt-screen" x="11" y="11" width="18" height="13" rx="3" fill="#0c4a7e"/>
        <circle class="rt-eye-left" cx="16" cy="17" r="2" fill="#38bdf8"/>
        <circle class="rt-eye-right" cx="24" cy="17" r="2" fill="#38bdf8"/>
        <path class="rt-mouth" d="M 17 21 Q 20 23 23 21" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      </svg>
    `,
    success: `
      <svg class="rt-robot rt-success-robot" viewBox="0 0 40 40" width="40" height="40">
        <line x1="20" y1="8" x2="20" y2="4" stroke="#16a34a" stroke-width="2" stroke-linecap="round"/>
        <circle class="rt-antenna-tip" cx="20" cy="3" r="2.5" fill="#16a34a"/>
        <path class="rt-arm-right" d="M 32 20 Q 36 16 34 10" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <rect class="rt-body-group" x="8" y="8" width="24" height="24" rx="6" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
        <rect class="rt-screen" x="11" y="11" width="18" height="13" rx="3" fill="#14532d"/>
        <circle class="rt-eye-left" cx="16" cy="17" r="2" fill="#4ade80"/>
        <circle class="rt-eye-right" cx="24" cy="17" r="2" fill="#4ade80"/>
        <path class="rt-mouth" d="M 16 21 Q 20 25 24 21" stroke="#4ade80" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      </svg>
    `,
    warning: `
      <svg class="rt-robot rt-warning-robot" viewBox="0 0 40 40" width="40" height="40">
        <line x1="20" y1="8" x2="20" y2="4" stroke="#ea580c" stroke-width="2" stroke-linecap="round"/>
        <circle class="rt-antenna-tip" cx="20" cy="3" r="2.5" fill="#ea580c"/>
        <rect class="rt-body-group" x="8" y="8" width="24" height="24" rx="6" fill="#fff7ed" stroke="#ea580c" stroke-width="2"/>
        <rect class="rt-screen" x="11" y="11" width="18" height="13" rx="3" fill="#7c2d12"/>
        <circle class="rt-eye-left" cx="16" cy="17" r="2" fill="#fb923c"/>
        <circle class="rt-eye-right" cx="24" cy="17" r="2" fill="#fb923c"/>
        <line x1="17" y1="22" x2="23" y2="22" stroke="#fb923c" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `,
    error: `
      <svg class="rt-robot rt-error-robot" viewBox="0 0 40 40" width="40" height="40">
        <line x1="20" y1="8" x2="20" y2="4" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
        <circle class="rt-antenna-tip" cx="20" cy="3" r="2.5" fill="#dc2626"/>
        <rect class="rt-body-group" x="8" y="8" width="24" height="24" rx="6" fill="#fef2f2" stroke="#dc2626" stroke-width="2"/>
        <rect class="rt-screen" x="11" y="11" width="18" height="13" rx="3" fill="#7f1d1d"/>
        <circle class="rt-eye-left" cx="16" cy="16" r="2" fill="#f87171"/>
        <circle class="rt-eye-right" cx="24" cy="16" r="2" fill="#f87171"/>
        <path class="rt-mouth" d="M 17 23 Q 20 20 23 23" stroke="#f87171" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      </svg>
    `,
    loading: `
      <svg class="rt-robot rt-loading-robot" viewBox="0 0 40 40" width="40" height="40">
        <line x1="20" y1="8" x2="20" y2="4" stroke="#7c3aed" stroke-width="2" stroke-linecap="round"/>
        <circle class="rt-antenna-tip" cx="20" cy="3" r="2.5" fill="#7c3aed"/>
        <rect class="rt-body-group" x="8" y="8" width="24" height="24" rx="6" fill="#f5f3ff" stroke="#7c3aed" stroke-width="2"/>
        <rect class="rt-screen" x="11" y="11" width="18" height="13" rx="3" fill="#581c87"/>
        <circle class="rt-eye-left" cx="16" cy="17" r="2" fill="#a78bfa"/>
        <circle class="rt-eye-right" cx="24" cy="17" r="2" fill="#a78bfa"/>
        <circle cx="20" cy="20" r="13" stroke="#c084fc" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="14 10" fill="none" class="rt-gear"/>
      </svg>
    `
  };

  const DEFAULT_OPTIONS = {
    duration: 4000,
    typewriter: false,
    draggable: true,
    pauseOnHover: true,
    pauseOnFocusLoss: true,
    action: null // { label: string, onClick: function }
  };

  const toast = function (message, options = {}) {
    return createToast(message, 'info', options);
  };

  toast.success = function (message, options = {}) {
    return createToast(message, 'success', options);
  };

  toast.error = function (message, options = {}) {
    return createToast(message, 'error', options);
  };

  toast.warning = function (message, options = {}) {
    return createToast(message, 'warning', options);
  };

  toast.info = function (message, options = {}) {
    return createToast(message, 'info', options);
  };

  toast.loading = function (message, options = {}) {
    const defaultLoadingOpts = { duration: Infinity, draggable: false };
    return createToast(message, 'loading', { ...defaultLoadingOpts, ...options });
  };

  // Expose global dismiss hook
  toast.dismiss = function (id) {
    if (!id) return;
    const card = document.getElementById(`toast-${id}`);
    if (card) destroyToast(card);
  };

  // Promise handler wrapping states loading -> success/error
  toast.promise = function (promise, paths = {}) {
    const id = toast.loading(paths.loading || 'Loading operations...');
    
    promise
      .then((val) => {
        const successMsg = typeof paths.success === 'function' ? paths.success(val) : (paths.success || 'Completed successfully!');
        toast.success(successMsg, { id, duration: 4000, draggable: true });
      })
      .catch((err) => {
        const errorMsg = typeof paths.error === 'function' ? paths.error(err) : (paths.error || err.message || 'An error occurred.');
        toast.error(errorMsg, { id, duration: 5000, draggable: true });
      });

    return promise;
  };

  // Helper function to animate and build the DOM structure
  function createToast(message, type, options) {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const container = getContainer();

    let id = opts.id;
    let card;
    let isUpdate = false;

    // Check if we are updating an existing toast (e.g. from promise completion)
    if (id) {
      card = document.getElementById(`toast-${id}`);
      if (card) {
        isUpdate = true;
        // Clean up previous event listeners and timeouts
        if (card._timeoutId) clearTimeout(card._timeoutId);
        if (card._progressInterval) clearInterval(card._progressInterval);
        card.className = `toast-card toast-${type} show`;
      }
    }

    if (!card) {
      id = opts.id || Math.random().toString(36).substring(2, 9);
      card = document.createElement('div');
      card.id = `toast-${id}`;
      card.className = `toast-card toast-${type}`;
      card.setAttribute('role', 'alert');
      card.setAttribute('aria-live', 'polite');
    }

    // Populate visual grid layout
    card.innerHTML = `
      <div class="toast-icon-container">
        ${ROBOT_TEMPLATES[type] || ROBOT_TEMPLATES.info}
      </div>
      <div class="toast-content">
        <div class="toast-message"></div>
      </div>
      <button class="toast-close-btn" aria-label="Close message">✕</button>
      <div class="toast-progress"></div>
    `;

    const messageContainer = card.querySelector('.toast-message');
    const closeBtn = card.querySelector('.toast-close-btn');
    const progressBar = card.querySelector('.toast-progress');

    // Typewriter effect toggle
    if (opts.typewriter && !isUpdate) {
      let index = 0;
      messageContainer.textContent = '';
      const typeSpeed = 25; // ms per char
      
      const typeText = () => {
        if (index < message.length) {
          messageContainer.textContent += message.charAt(index);
          index++;
          setTimeout(typeText, typeSpeed);
        }
      };
      typeText();
    } else {
      messageContainer.textContent = message;
    }

    // Optional custom CTA buttons inside toast
    if (opts.action) {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'toast-action-btn';
      actionBtn.textContent = opts.action.label;
      actionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        opts.action.onClick(e);
        destroyToast(card);
      });
      card.querySelector('.toast-content').appendChild(actionBtn);
    }

    // Close button click
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      destroyToast(card);
    });

    // Stacking management: prepend if new, keep if update
    if (!isUpdate) {
      container.insertBefore(card, container.firstChild);
      // Wait a frame for slide transition
      requestAnimationFrame(() => {
        card.classList.add('show');
      });
    }

    // Swipe to dismiss tracking setup
    if (opts.draggable) {
      setupDragToDismiss(card);
    }

    // Timer & Progress management
    if (opts.duration !== Infinity) {
      let remainingTime = opts.duration;
      let lastTime = Date.now();
      let isPaused = false;

      progressBar.style.animation = `toast-timer ${opts.duration}ms linear forwards`;
      progressBar.classList.add('active');

      const dismissTimer = () => {
        card._timeoutId = setTimeout(() => {
          destroyToast(card);
        }, remainingTime);
      };

      dismissTimer();

      // Pause controls
      const pauseTimer = () => {
        if (isPaused) return;
        isPaused = true;
        clearTimeout(card._timeoutId);
        const elapsed = Date.now() - lastTime;
        remainingTime = Math.max(0, remainingTime - elapsed);
        
        // Pause progress bar animation
        progressBar.style.animationPlayState = 'paused';
      };

      const resumeTimer = () => {
        if (!isPaused) return;
        isPaused = false;
        lastTime = Date.now();
        dismissTimer();
        
        // Resume progress bar animation
        progressBar.style.animationPlayState = 'running';
      };

      // Hover triggers
      if (opts.pauseOnHover) {
        card.addEventListener('mouseenter', pauseTimer);
        card.addEventListener('mouseleave', resumeTimer);
      }

      // Tab visibility focus triggers
      if (opts.pauseOnFocusLoss) {
        const onVisibilityChange = () => {
          if (document.hidden) pauseTimer();
          else resumeTimer();
        };
        document.addEventListener('visibilitychange', onVisibilityChange);
        card._cleanupVisibility = () => {
          document.removeEventListener('visibilitychange', onVisibilityChange);
        };
      }
    } else {
      // Loader toasts or persistent alerts don't show a progress bar line
      progressBar.style.display = 'none';
    }

    return id;
  }

  // Perform exit animations and clean up DOM nodes safely
  function destroyToast(card) {
    if (card._isDestroying) return;
    card._isDestroying = true;
    
    // Clear timeouts and handlers
    if (card._timeoutId) clearTimeout(card._timeoutId);
    if (card._cleanupVisibility) card._cleanupVisibility();

    // Slide out exit animation transition
    card.style.opacity = '0';
    card.style.transform = 'translateX(120%) scale(0.9)';
    card.style.maxHeight = '0';
    card.style.paddingTop = '0';
    card.style.paddingBottom = '0';
    card.style.marginTop = '0';
    card.style.marginBottom = '0';
    card.style.borderWidth = '0';

    setTimeout(() => {
      card.remove();
      // Remove container if empty to clean up DOM footprint
      const container = document.getElementById('toast-container');
      if (container && container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }

  // Modern touch/mouse coordinate dragging state machine
  function setupDragToDismiss(card) {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    const swipeThreshold = 80;

    const onStart = (e) => {
      startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
      isDragging = true;
      card.classList.add('dragging');
    };

    const onMove = (e) => {
      if (!isDragging) return;
      currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
      const deltaX = currentX - startX;

      // Restrict left-swiping slightly to focus flyout towards right edge
      if (deltaX < 0) {
        card.style.transform = `translateX(${deltaX * 0.2}px) scale(0.98)`;
      } else {
        card.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.04}deg) scale(0.98)`;
        card.style.opacity = Math.max(0.1, 1 - (deltaX / 300));
      }
    };

    const onEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      card.classList.remove('dragging');

      const deltaX = currentX - startX;

      if (deltaX > swipeThreshold) {
        // High velocity fly-out dismiss
        card.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
        card.style.transform = `translateX(120%) rotate(${deltaX * 0.05}deg)`;
        card.style.opacity = '0';
        setTimeout(() => destroyToast(card), 200);
      } else {
        // Snap back to origin
        card.style.transform = '';
        card.style.opacity = '';
      }

      startX = 0;
      currentX = 0;
    };

    // Mouse Listeners
    card.addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);

    // Touch Listeners (Mobile compatibility)
    card.addEventListener('touchstart', onStart, { passive: true });
    card.addEventListener('touchmove', onMove, { passive: true });
    card.addEventListener('touchend', onEnd);

    // Clean up standard listeners on DOM removal
    card._dragCleanup = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
    };
  }

  // Export globally
  window.toast = toast;

})(window);
