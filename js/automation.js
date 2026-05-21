const Automation = {
  rules: [],
  isRunning: false,

  init() {
    this.loadRules();
    this.startEngine();
  },

  loadRules() {
    const saved = Storage.getLocal('automation-rules', []);
    this.rules = saved;
  },

  saveRules() {
    Storage.setLocal('automation-rules', this.rules);
  },

  startEngine() {
    if (this.isRunning) return;
    this.isRunning = true;

    setInterval(() => this.checkRules(), 60000);
    this.checkRules();
  },

  addRule(rule) {
    rule.id = App.generateId();
    rule.enabled = rule.enabled !== false;
    rule.triggerCount = 0;
    this.rules.push(rule);
    this.saveRules();
    Toast.show('Automation rule added', 'success');
  },

  removeRule(id) {
    this.rules = this.rules.filter(r => r.id !== id);
    this.saveRules();
  },

  toggleRule(id) {
    const rule = this.rules.find(r => r.id === id);
    if (rule) {
      rule.enabled = !rule.enabled;
      this.saveRules();
    }
  },

  async checkRules() {
    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      try {
        const triggered = await this.evaluateRule(rule);
        if (triggered) {
          rule.triggerCount++;
          this.saveRules();
          await this.executeAction(rule);
        }
      } catch (e) {
        console.error('Rule evaluation error:', e);
      }
    }
  },

  async evaluateRule(rule) {
    switch (rule.type) {
      case 'budget-alert':
        return this.checkBudgetAlert(rule);
      case 'expense-category':
        return this.checkExpenseCategory(rule);
      case 'overdue-task':
        return this.checkOverdueTasks(rule);
      case 'daily-summary':
        return this.checkDailySummary(rule);
      case 'spike-detection':
        return this.checkSpikeDetection(rule);
      default:
        return false;
    }
  },

  checkBudgetAlert(rule) {
    const totalSpent = Storage.getLocal('cache-total-spent', 0);
    const threshold = rule.threshold || 0.8;
    return totalSpent >= CONFIG.budgetLimit * threshold;
  },

  checkExpenseCategory(rule) {
    const expenses = Storage.getLocal('cache-expenses', []);
    const today = new Date().toISOString().split('T')[0];
    const categoryTotal = expenses
      .filter(e => e.category === rule.category && e.date === today)
      .reduce((sum, e) => sum + e.amount, 0);
    return categoryTotal >= (rule.limit || 500);
  },

  checkOverdueTasks(rule) {
    const todos = Storage.getLocal('cache-todos', []);
    const today = new Date().toISOString().split('T')[0];
    const overdue = todos.filter(t => !t.completed && t.dueDate && t.dueDate < today);
    return overdue.length > 0;
  },

  checkDailySummary(rule) {
    const lastSummary = Storage.getLocal('last-daily-summary', '');
    const today = new Date().toISOString().split('T')[0];
    if (lastSummary !== today) {
      Storage.setLocal('last-daily-summary', today);
      return true;
    }
    return false;
  },

  checkSpikeDetection(rule) {
    const expenses = Storage.getLocal('cache-expenses', []);
    const today = new Date().toISOString().split('T')[0];
    const todayTotal = expenses
      .filter(e => e.date === today)
      .reduce((sum, e) => sum + e.amount, 0);

    const avgDaily = this.calculateAvgDaily(expenses);
    const multiplier = rule.multiplier || 2;
    return todayTotal > avgDaily * multiplier && todayTotal > (rule.minAmount || 1000);
  },

  calculateAvgDaily(expenses) {
    if (expenses.length === 0) return 0;
    const dates = [...new Set(expenses.map(e => e.date))];
    const totals = dates.map(date =>
      expenses.filter(e => e.date === date).reduce((sum, e) => sum + e.amount, 0)
    );
    return totals.reduce((sum, t) => sum + t, 0) / dates.length;
  },

  async executeAction(rule) {
    const severityMap = { warning: 'warning', danger: 'danger', info: 'info', success: 'success' };
    const type = severityMap[rule.severity] || 'info';

    switch (rule.action) {
      case 'toast':
        Toast.show(rule.message, type);
        if (typeof NotificationCenter !== 'undefined') {
          NotificationCenter.add('Automation Alert', rule.message, type);
        }
        break;
      case 'notification':
        this.sendNotification(rule.message);
        if (typeof NotificationCenter !== 'undefined') {
          NotificationCenter.add('Notification', rule.message, type);
        }
        break;
      case 'ai-insight':
        await this.getAIInsight(rule);
        break;
      case 'log':
        console.log(`[Automation] ${rule.message}`);
        break;
    }
  },

  sendNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(CONFIG.appName, {
        body: message,
        icon: '/assets/icons/icon-192.png'
      });
    }
  },

  async getAIInsight(rule) {
    try {
      const expenses = await Storage.getAll('expenses');
      const todos = await Storage.getAll('todos');

      const context = {
        totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
        budgetLimit: CONFIG.budgetLimit,
        pendingTasks: todos.filter(t => !t.completed).length
      };

      const response = await API.askAI(rule.message, context);
      Toast.show(response.substring(0, 100) + (response.length > 100 ? '...' : ''), 'info');
    } catch (e) {
      console.error('AI insight error:', e);
    }
  },

  autoCategorizeExpense(title) {
    const keywordMap = {
      Food: ['food', 'restaurant', 'cafe', 'swiggy', 'zomato', 'pizza', 'burger', 'lunch', 'dinner', 'breakfast', 'coffee', 'starbucks', 'mcdonald', 'kfc'],
      Transport: ['uber', 'ola', 'taxi', 'metro', 'bus', 'fuel', 'petrol', 'diesel', 'parking', 'auto', 'rapido'],
      Shopping: ['amazon', 'flipkart', 'mall', 'clothes', 'shoes', 'electronics', 'gift'],
      Bills: ['electricity', 'water', 'internet', 'wifi', 'rent', 'emi', 'insurance', 'phone', 'mobile'],
      Health: ['hospital', 'doctor', 'medicine', 'pharmacy', 'lab', 'test', 'gym', 'fitness'],
      Entertainment: ['movie', 'netflix', 'spotify', 'game', 'subscription', 'ott']
    };

    const lowerTitle = title.toLowerCase();
    for (const [category, keywords] of Object.entries(keywordMap)) {
      if (keywords.some(k => lowerTitle.includes(k))) {
        return category;
      }
    }
    return 'Other';
  },

  getSavingsInsight(expenses) {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    const monthlyExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    const total = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = CONFIG.budgetLimit - total;
    const daysLeft = new Date(thisYear, thisMonth + 1, 0).getDate() - new Date().getDate();
    const dailyBudget = daysLeft > 0 ? remaining / daysLeft : 0;

    return {
      total,
      remaining,
      dailyBudget: Math.round(dailyBudget),
      percentage: Math.round((total / CONFIG.budgetLimit) * 100),
      isOverBudget: total > CONFIG.budgetLimit
    };
  },

  getDefaultRules() {
    return [
      {
        type: 'budget-alert',
        action: 'toast',
        threshold: 0.8,
        message: 'You\'ve used 80% of your monthly budget!',
        severity: 'warning',
        enabled: true
      },
      {
        type: 'budget-alert',
        action: 'notification',
        threshold: 1,
        message: 'Budget exceeded! Review your spending.',
        severity: 'danger',
        enabled: true
      },
      {
        type: 'daily-summary',
        action: 'ai-insight',
        message: 'Give me a brief daily financial summary based on my expenses and tasks.',
        enabled: true
      },
      {
        type: 'spike-detection',
        action: 'toast',
        multiplier: 2,
        minAmount: 1000,
        message: 'Unusual spending detected today!',
        severity: 'warning',
        enabled: true
      },
      {
        type: 'overdue-task',
        action: 'notification',
        message: 'You have overdue tasks. Time to catch up!',
        enabled: true
      }
    ];
  },

  setupDefaults() {
    if (this.rules.length === 0) {
      this.rules = this.getDefaultRules();
      this.saveRules();
    }
  }
};
