const App = {
  async init() {
    await Storage.init();
    Theme.init();
    Toast.init();
    NotificationCenter.init();
    Router.init();

    this.loadSavedSettings();
    this.setupThemeToggle();
    this.setupNav();
    this.setupAutoCategorization();
    this.setupNotificationBell();
    this.cacheData();

    Automation.init();
    Automation.setupDefaults();

    this.requestNotificationPermission();

    console.log(`${CONFIG.appName} initialized - Powered by KageOS`);
    Toast.success('SmartLife AI loaded successfully', 'Welcome');
  },

  loadSavedSettings() {
    const saved = Storage.getLocal('app-settings', null);
    if (saved) {
      if (saved.accentColor) {
        this.applyColorTemplate(saved.colorTemplate || 'purple');
      }
      if (saved.budgetLimit) {
        CONFIG.budgetLimit = saved.budgetLimit;
      }
      if (saved.aiModel) {
        CONFIG.aiModel = saved.aiModel;
      }
      if (saved.currencySymbol) {
        CONFIG.currencySymbol = saved.currencySymbol;
      }
      if (saved.memoryEnabled !== undefined) {
        CONFIG.memoryEnabled = saved.memoryEnabled;
      }
    }
  },

  applyColorTemplate(templateId) {
    const templateColors = {
      purple: { accent: '#6C63FF', accentLight: '#8b83ff', accentDark: '#5a52e0' },
      blue: { accent: '#3b82f6', accentLight: '#60a5fa', accentDark: '#2563eb' },
      green: { accent: '#10b981', accentLight: '#34d399', accentDark: '#059669' },
      rose: { accent: '#f43f5e', accentLight: '#fb7185', accentDark: '#e11d48' },
      amber: { accent: '#f59e0b', accentLight: '#fbbf24', accentDark: '#d97706' },
      cyan: { accent: '#06b6d4', accentLight: '#22d3ee', accentDark: '#0891b2' },
      violet: { accent: '#8b5cf6', accentLight: '#a78bfa', accentDark: '#7c3aed' },
      slate: { accent: '#64748b', accentLight: '#94a3b8', accentDark: '#475569' }
    };

    const colors = templateColors[templateId] || templateColors.purple;
    const root = document.documentElement;

    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--accent-light', colors.accentLight);
    root.style.setProperty('--accent-dark', colors.accentDark);
    root.style.setProperty('--accent-subtle', colors.accent + '14');
    root.style.setProperty('--accent-glow', colors.accent + '26');
  },

  setupThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        Theme.toggle();
        Charts.updateColors();
      });
    }
  },

  setupNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const route = item.dataset.route;
        Router.navigate(route);
        NotificationCenter.close();
      });
    });
  },

  setupNotificationBell() {
    document.addEventListener('click', (e) => {
      const panel = document.getElementById('notification-panel');
      const bell = document.getElementById('notif-bell');
      if (panel && !panel.contains(e.target) && bell && !bell.contains(e.target)) {
        NotificationCenter.close();
      }
    });
  },

  setupAutoCategorization() {
    const originalShowAddModal = ExpenseScreen.showAddModal;
    ExpenseScreen.showAddModal = function(expense = null) {
      const isEdit = !!expense;
      Modal.show({
        title: isEdit ? 'Edit Expense' : 'Add Expense',
        content: `
          <div class="editor-modal-content">
            <label>Title</label>
            <input type="text" id="expense-title" value="${expense?.title || ''}" placeholder="e.g., Swiggy order">
            <label>Amount</label>
            <input type="number" id="expense-amount" value="${expense?.amount || ''}" placeholder="0">
            <label>Category <span style="color:var(--text-muted);font-weight:400;text-transform:none;">(auto-detected)</span></label>
            <select id="expense-category">
              ${CONFIG.expenseCategories.map(c => `<option value="${c}" ${expense?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
            <label>Note (optional)</label>
            <textarea id="expense-note" placeholder="Add a note...">${expense?.note || ''}</textarea>
            <label>Date</label>
            <input type="date" id="expense-date" value="${expense?.date || new Date().toISOString().split('T')[0]}">
            <div class="filter-modal-actions">
              <button class="btn btn-secondary" onclick="Modal.hide()">Cancel</button>
              <button class="btn btn-primary" onclick="ExpenseScreen.save('${expense?.id || ''}')">${isEdit ? 'Update' : 'Add'}</button>
            </div>
          </div>
        `
      });

      if (!isEdit) {
        const titleInput = document.getElementById('expense-title');
        const categorySelect = document.getElementById('expense-category');

        titleInput.addEventListener('input', () => {
          const title = titleInput.value.trim();
          if (title.length > 2) {
            const autoCategory = Automation.autoCategorizeExpense(title);
            categorySelect.value = autoCategory;
          }
        });
      }
    };
  },

  async cacheData() {
    const expenses = await Storage.getAll('expenses');
    const todos = await Storage.getAll('todos');

    Storage.setLocal('cache-expenses', expenses);
    Storage.setLocal('cache-todos', todos);
    Storage.setLocal('cache-total-spent', expenses.reduce((sum, e) => sum + e.amount, 0));
  },

  async refreshCache() {
    await this.cacheData();
    Automation.checkRules();
  },

  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      setTimeout(() => {
        Notification.requestPermission();
      }, 5000);
    }
  },

  formatCurrency(amount) {
    return `${CONFIG.currencySymbol}${amount.toLocaleString('en-IN')}`;
  },

  formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
  },

  formatTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  },

  getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  },

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
