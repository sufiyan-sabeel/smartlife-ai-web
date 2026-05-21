const NotificationCenter = {
  notifications: [],
  isOpen: false,
  panel: null,

  init() {
    this.notifications = Storage.getLocal('notifications', []);
    this.renderPanel();
    this.updateBadge();
  },

  renderPanel() {
    this.panel = document.createElement('div');
    this.panel.className = 'notification-panel';
    this.panel.id = 'notification-panel';
    this.panel.innerHTML = this.getPanelHTML();
    document.body.appendChild(this.panel);
  },

  getPanelHTML() {
    const unread = this.notifications.filter(n => !n.read).length;
    const sorted = [...this.notifications].sort((a, b) => new Date(b.time) - new Date(a.time));

    return `
      <div class="notification-panel-header">
        <h3>Notifications ${unread > 0 ? `(${unread})` : ''}</h3>
        <button class="clear-btn" onclick="NotificationCenter.clearAll()">Clear all</button>
      </div>
      <div class="notification-list">
        ${sorted.length === 0 ? `
          <div class="notification-empty">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            <p>No notifications yet</p>
          </div>
        ` : sorted.slice(0, 50).map((n, i) => `
          <div class="notification-item ${n.read ? '' : 'unread'}" style="animation-delay: ${i * 0.03}s" onclick="NotificationCenter.markRead('${n.id}')">
            <div class="notif-icon ${n.type}">
              ${this.getIcon(n.type)}
            </div>
            <div class="notif-content">
              <div class="notif-title">${n.title}</div>
              <div class="notif-message">${n.message}</div>
              <div class="notif-time">${this.timeAgo(n.time)}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  getIcon(type) {
    const icons = {
      success: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
      warning: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      danger: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
      info: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };
    return icons[type] || icons.info;
  },

  add(title, message, type = 'info') {
    const notif = {
      id: App.generateId(),
      title,
      message,
      type,
      time: new Date().toISOString(),
      read: false
    };

    this.notifications.unshift(notif);

    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    this.save();
    this.updatePanel();
    this.updateBadge();
  },

  markRead(id) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
      this.updatePanel();
      this.updateBadge();
    }
  },

  clearAll() {
    this.notifications = [];
    this.save();
    this.updatePanel();
    this.updateBadge();
  },

  save() {
    Storage.setLocal('notifications', this.notifications);
  },

  updatePanel() {
    if (this.panel) {
      this.panel.innerHTML = this.getPanelHTML();
    }
  },

  updateBadge() {
    const unread = this.notifications.filter(n => !n.read).length;
    const bellBtn = document.getElementById('notif-bell');
    if (!bellBtn) return;

    let badge = bellBtn.querySelector('.notif-badge');
    if (unread > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'notif-badge';
        bellBtn.appendChild(badge);
      }
      badge.textContent = unread > 9 ? '9+' : unread;
    } else if (badge) {
      badge.remove();
    }
  },

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.panel) {
      this.panel.classList.toggle('open', this.isOpen);
    }

    if (this.isOpen) {
      this.notifications.forEach(n => n.read = true);
      this.save();
      setTimeout(() => this.updateBadge(), 100);
    }
  },

  close() {
    this.isOpen = false;
    if (this.panel) {
      this.panel.classList.remove('open');
    }
  },

  timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return App.formatDate(dateStr);
  }
};
