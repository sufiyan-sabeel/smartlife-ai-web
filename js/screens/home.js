const HomeScreen = {
  async init() {
    await this.render();
  },

  async render() {
    const expenses = await Storage.getAll('expenses');
    const todos = await Storage.getAll('todos');
    const notes = await Storage.getAll('notes');

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const completedTodos = todos.filter(t => t.completed).length;
    const budgetLeft = CONFIG.budgetLimit - totalSpent;

    const greetingEl = document.getElementById('greeting-text');
    if (greetingEl) {
      greetingEl.textContent = App.getGreeting();
    }

    document.getElementById('summary-spent').textContent = App.formatCurrency(totalSpent);
    document.getElementById('summary-tasks').textContent = `${completedTodos}/${todos.length}`;
    document.getElementById('summary-notes').textContent = notes.length;
    document.getElementById('summary-budget').textContent = App.formatCurrency(budgetLeft);

    const budgetEl = document.getElementById('summary-budget');
    if (budgetEl) {
      budgetEl.style.color = budgetLeft < 0 ? 'var(--danger)' : 'var(--text)';
    }

    const insight = Automation.getSavingsInsight(expenses);
    const budgetSub = document.getElementById('summary-budget-sub');
    if (budgetSub) {
      budgetSub.textContent = `Daily: ${App.formatCurrency(insight.dailyBudget)}`;
    }

    const tasksSub = document.getElementById('summary-tasks-sub');
    if (tasksSub) {
      if (todos.length === 0) {
        tasksSub.textContent = 'No tasks yet';
      } else if (completedTodos === todos.length) {
        tasksSub.textContent = 'All done!';
        tasksSub.style.color = 'var(--success)';
      } else {
        const pending = todos.length - completedTodos;
        tasksSub.textContent = `${pending} pending`;
      }
    }

    const spentSub = document.getElementById('summary-spent-sub');
    if (spentSub) {
      const thisMonth = new Date().getMonth();
      const monthExpenses = expenses.filter(e => new Date(e.date).getMonth() === thisMonth);
      const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      spentSub.textContent = `${monthExpenses.length} transactions this month`;
    }

    this.renderCharts(expenses);
    this.renderActivity(expenses, todos);

    const automationBanner = document.getElementById('automation-banner');
    if (automationBanner) {
      const activeRules = Automation.rules.filter(r => r.enabled).length;
      automationBanner.querySelector('p').textContent = `${activeRules} smart rules monitoring your finances`;
    }
  },

  renderCharts(expenses) {
    const last7Days = [];
    const dailyTotals = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      last7Days.push(d.toLocaleDateString('en-IN', { weekday: 'short' }));

      const dayTotal = expenses
        .filter(e => e.date === dateStr)
        .reduce((sum, e) => sum + e.amount, 0);
      dailyTotals.push(dayTotal);
    }

    Charts.initBarChart('expense-bar-chart', last7Days, dailyTotals, 'Daily Spending');

    const categoryTotals = {};
    expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const catLabels = Object.keys(categoryTotals);
    const catValues = Object.values(categoryTotals);

    if (catLabels.length > 0) {
      Charts.initPieChart('category-pie-chart', catLabels, catValues);
    }
  },

  renderActivity(expenses, todos) {
    const feed = document.getElementById('activity-feed');
    if (!feed) return;

    const recentExpenses = expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    const recentTodos = todos.filter(t => !t.completed).slice(0, 2);

    let html = '';

    recentExpenses.forEach(e => {
      html += `
        <div class="activity-item">
          <div class="icon expense">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div class="content">
            <div class="title">${e.title}</div>
            <div class="meta">${e.category} - ${App.formatDate(e.date)}</div>
          </div>
          <div class="amount negative">-${App.formatCurrency(e.amount)}</div>
        </div>
      `;
    });

    recentTodos.forEach(t => {
      html += `
        <div class="activity-item">
          <div class="icon task">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
          </div>
          <div class="content">
            <div class="title">${t.title}</div>
            <div class="meta">${t.priority} Priority</div>
          </div>
        </div>
      `;
    });

    if (!html) {
      html = '<div class="empty-state"><p>No recent activity</p><p class="sub">Start by adding expenses or tasks</p></div>';
    }

    feed.innerHTML = html;
  }
};
