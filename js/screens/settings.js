const SettingsScreen = {
  settings: {},

  init() {
    this.loadSettings();
    this.render();
    this.setupListeners();
  },

  loadSettings() {
    this.settings = Storage.getLocal('app-settings', {
      accentColor: '#6C63FF',
      colorTemplate: 'purple',
      currencySymbol: '₹',
      budgetLimit: 10000,
      aiModel: 'openai/gpt-4o-mini',
      darkMode: CONFIG.darkModeDefault,
      notifications: true,
      automation: true,
      memoryEnabled: true,
      soundEnabled: false
    });
  },

  saveSettings() {
    Storage.setLocal('app-settings', this.settings);
  },

  render() {
    this.renderColorTemplates();
    this.renderToggles();
    this.renderBudget();
    this.renderAIModel();
  },

  renderColorTemplates() {
    const container = document.getElementById('color-templates');
    if (!container) return;

    const templates = [
      { id: 'purple', name: 'Purple', colors: ['#6C63FF', '#8b83ff', '#5a52e0'] },
      { id: 'blue', name: 'Ocean', colors: ['#3b82f6', '#60a5fa', '#2563eb'] },
      { id: 'green', name: 'Emerald', colors: ['#10b981', '#34d399', '#059669'] },
      { id: 'rose', name: 'Rose', colors: ['#f43f5e', '#fb7185', '#e11d48'] },
      { id: 'amber', name: 'Amber', colors: ['#f59e0b', '#fbbf24', '#d97706'] },
      { id: 'cyan', name: 'Cyan', colors: ['#06b6d4', '#22d3ee', '#0891b2'] },
      { id: 'violet', name: 'Violet', colors: ['#8b5cf6', '#a78bfa', '#7c3aed'] },
      { id: 'slate', name: 'Slate', colors: ['#64748b', '#94a3b8', '#475569'] }
    ];

    container.innerHTML = templates.map(t => `
      <div class="color-template ${this.settings.colorTemplate === t.id ? 'active' : ''}" data-template="${t.id}">
        <div class="color-preview">
          ${t.colors.map(c => `<span style="background:${c}"></span>`).join('')}
        </div>
        <span class="name">${t.name}</span>
      </div>
    `).join('');
  },

  renderToggles() {
    const toggles = {
      'toggle-dark': this.settings.darkMode,
      'toggle-notifications': this.settings.notifications,
      'toggle-automation': this.settings.automation,
      'toggle-memory': this.settings.memoryEnabled,
      'toggle-sound': this.settings.soundEnabled
    };

    Object.entries(toggles).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.toggle('active', value);
      }
    });
  },

  renderBudget() {
    const input = document.getElementById('budget-input');
    if (input) {
      input.value = this.settings.budgetLimit;
    }
  },

  renderAIModel() {
    const select = document.getElementById('ai-model');
    if (select) {
      select.value = this.settings.aiModel;
    }
  },

  setupListeners() {
    document.querySelectorAll('.color-template').forEach(template => {
      template.addEventListener('click', () => {
        document.querySelectorAll('.color-template').forEach(t => t.classList.remove('active'));
        template.classList.add('active');
        this.settings.colorTemplate = template.dataset.template;
        this.applyColorTemplate();
        this.saveSettings();
        Toast.success(`${template.querySelector('.name').textContent} theme applied`, 'Theme Changed');
      });
    });

    const toggleMap = {
      'toggle-dark': 'darkMode',
      'toggle-notifications': 'notifications',
      'toggle-automation': 'automation',
      'toggle-memory': 'memoryEnabled',
      'toggle-sound': 'soundEnabled'
    };

    Object.entries(toggleMap).forEach(([id, key]) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', () => {
          this.settings[key] = !this.settings[key];
          el.classList.toggle('active', this.settings[key]);
          this.saveSettings();

          if (key === 'darkMode') {
            Theme.toggle();
          }

          if (key === 'automation') {
            Automation.isRunning = this.settings.automation;
          }

          Toast.success(`${key.replace(/([A-Z])/g, ' $1').trim()} ${this.settings[key] ? 'enabled' : 'disabled'}`);
        });
      }
    });

    const budgetInput = document.getElementById('budget-input');
    if (budgetInput) {
      budgetInput.addEventListener('change', () => {
        const val = parseInt(budgetInput.value);
        if (val > 0) {
          this.settings.budgetLimit = val;
          CONFIG.budgetLimit = val;
          this.saveSettings();
          Toast.success(`Budget set to ${App.formatCurrency(val)}`);
        }
      });
    }

    const aiSelect = document.getElementById('ai-model');
    if (aiSelect) {
      aiSelect.addEventListener('change', () => {
        this.settings.aiModel = aiSelect.value;
        CONFIG.aiModel = aiSelect.value;
        this.saveSettings();
        Toast.success(`AI model changed to ${aiSelect.value}`);
      });
    }

    const currencySelect = document.getElementById('currency-select');
    if (currencySelect) {
      currencySelect.value = this.settings.currencySymbol;
      currencySelect.addEventListener('change', () => {
        this.settings.currencySymbol = currencySelect.value;
        CONFIG.currencySymbol = currencySelect.value;
        this.saveSettings();
        Toast.success(`Currency changed to ${currencySelect.value}`);
      });
    }

    const clearDataBtn = document.getElementById('clear-data-btn');
    if (clearDataBtn) {
      clearDataBtn.addEventListener('click', () => {
        if (confirm('Are you sure? This will delete all your expenses, tasks, notes, and reminders.')) {
          this.clearAllData();
        }
      });
    }

    const exportBtn = document.getElementById('export-data-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportData());
    }
  },

  applyColorTemplate() {
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

    const colors = templateColors[this.settings.colorTemplate] || templateColors.purple;
    const root = document.documentElement;

    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--accent-light', colors.accentLight);
    root.style.setProperty('--accent-dark', colors.accentDark);
    root.style.setProperty('--accent-subtle', colors.accent + '14');
    root.style.setProperty('--accent-glow', colors.accent + '26');

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.content = colors.accent;
    }
  },

  async clearAllData() {
    await Storage.clear('expenses');
    await Storage.clear('todos');
    await Storage.clear('notes');
    await Storage.clear('reminders');
    Storage.removeLocal('notifications');
    Toast.success('All data cleared successfully');
    Router.navigate('home');
  },

  async exportData() {
    const data = {
      expenses: await Storage.getAll('expenses'),
      todos: await Storage.getAll('todos'),
      notes: await Storage.getAll('notes'),
      reminders: await Storage.getAll('reminders'),
      settings: this.settings,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartlife-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    Toast.success('Data exported successfully');
  }
};
