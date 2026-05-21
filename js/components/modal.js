const Modal = {
  currentModal: null,

  show({ title, content, onClose } = {}) {
    if (this.currentModal) {
      this.hide();
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3>${title || ''}</h3>
          <button class="modal-close" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body">
          ${content || ''}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.currentModal = modal;

    modal.querySelector('.modal-close').addEventListener('click', () => this.hide());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.hide();
    });

    document.addEventListener('keydown', this.handleEscape);

    if (onClose) {
      this.onClose = onClose;
    }
  },

  hide() {
    if (this.currentModal) {
      this.currentModal.remove();
      this.currentModal = null;
      document.removeEventListener('keydown', this.handleEscape);
      if (this.onClose) {
        this.onClose();
        this.onClose = null;
      }
    }
  },

  handleEscape(e) {
    if (e.key === 'Escape') {
      Modal.hide();
    }
  }
};
