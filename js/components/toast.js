const Toast = {
  container: null,
  toasts: [],

  init() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
    this.injectStyles();
  },

  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .toast-container {
        position: fixed;
        top: calc(var(--header-height) + 12px);
        right: 16px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 8px;
        pointer-events: none;
      }

      .toast {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 14px 18px;
        background: var(--surface-elevated);
        border: 1px solid var(--border-light);
        border-radius: var(--radius-sm);
        box-shadow: var(--shadow-lg);
        min-width: 280px;
        max-width: 380px;
        pointer-events: auto;
        animation: toastIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        backdrop-filter: var(--backdrop);
        -webkit-backdrop-filter: var(--backdrop);
      }

      .toast.toast-out {
        animation: toastOut 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      .toast .toast-icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
        margin-top: 1px;
      }

      .toast .toast-content {
        flex: 1;
        min-width: 0;
      }

      .toast .toast-title {
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 2px;
      }

      .toast .toast-message {
        font-size: 12px;
        color: var(--text-secondary);
        line-height: 1.4;
      }

      .toast .toast-close {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-muted);
        flex-shrink: 0;
        transition: all var(--transition-fast);
      }

      .toast .toast-close:hover {
        background: var(--surface-hover);
        color: var(--text);
      }

      .toast.toast-success {
        border-left: 3px solid var(--success);
      }

      .toast.toast-success .toast-icon {
        color: var(--success);
      }

      .toast.toast-warning {
        border-left: 3px solid var(--warning);
      }

      .toast.toast-warning .toast-icon {
        color: var(--warning);
      }

      .toast.toast-danger {
        border-left: 3px solid var(--danger);
      }

      .toast.toast-danger .toast-icon {
        color: var(--danger);
      }

      .toast.toast-info {
        border-left: 3px solid var(--info);
      }

      .toast.toast-info .toast-icon {
        color: var(--info);
      }

      .toast .progress-bar {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        border-radius: 0 0 var(--radius-sm) var(--radius-sm);
        animation: toastProgress var(--toast-duration, 4s) linear forwards;
      }

      .toast-success .progress-bar { background: var(--success); }
      .toast-warning .progress-bar { background: var(--warning); }
      .toast-danger .progress-bar { background: var(--danger); }
      .toast-info .progress-bar { background: var(--info); }

      @keyframes toastIn {
        from { opacity: 0; transform: translateX(20px) scale(0.95); }
        to { opacity: 1; transform: translateX(0) scale(1); }
      }

      @keyframes toastOut {
        from { opacity: 1; transform: translateX(0) scale(1); }
        to { opacity: 0; transform: translateX(20px) scale(0.95); }
      }

      @keyframes toastProgress {
        from { width: 100%; }
        to { width: 0%; }
      }

      @media (max-width: 480px) {
        .toast-container {
          left: 12px;
          right: 12px;
        }

        .toast {
          min-width: auto;
          max-width: none;
        }
      }
    `;
    document.head.appendChild(style);
  },

  show(message, type = 'info', title = '', duration = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.setProperty('--toast-duration', `${duration}ms`);

    const icons = {
      success: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
      warning: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      danger: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
      info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };

    const displayTitle = title || {
      success: 'Success',
      warning: 'Warning',
      danger: 'Error',
      info: 'Info'
    }[type];

    toast.innerHTML = `
      <div class="toast-icon">${icons[type]}</div>
      <div class="toast-content">
        <div class="toast-title">${displayTitle}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <div class="progress-bar"></div>
    `;

    this.container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.dismiss(toast));

    setTimeout(() => this.dismiss(toast), duration);
  },

  dismiss(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add('toast-out');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 250);
  },

  success(message, title, duration) {
    this.show(message, 'success', title, duration);
  },

  warning(message, title, duration) {
    this.show(message, 'warning', title, duration);
  },

  error(message, title, duration) {
    this.show(message, 'danger', title, duration);
  },

  info(message, title, duration) {
    this.show(message, 'info', title, duration);
  }
};
