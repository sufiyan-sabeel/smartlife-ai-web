const ExpenseScreen = {
  expenses: [],
  currentFilter: 'all',
  searchQuery: '',

  async init() {
    this.expenses = await Storage.getAll('expenses');
    this.render();
    this.setupListeners();
    App.refreshCache();
  },

  render() {
    this.renderSummary();
    this.renderList();
    this.renderStats();
  },

  renderSummary() {
    const total = this.expenses.reduce((sum, e) => sum + e.amount, 0);
    const thisMonth = this.expenses
      .filter(e => {
        const d = new Date(e.date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + e.amount, 0);

    document.getElementById('expense-total').textContent = App.formatCurrency(total);
    document.getElementById('expense-month').textContent = App.formatCurrency(thisMonth);
    document.getElementById('expense-count').textContent = this.expenses.length;

    const budgetLeft = CONFIG.budgetLimit - total;
    const budgetEl = document.getElementById('expense-budget');
    budgetEl.textContent = App.formatCurrency(budgetLeft);
    budgetEl.style.color = budgetLeft < 0 ? 'var(--danger)' : 'var(--text)';
  },

  renderList() {
    const list = document.getElementById('expense-list');
    if (!list) return;

    let filtered = [...this.expenses];

    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(e => e.category === this.currentFilter);
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        (e.note && e.note.toLowerCase().includes(q))
      );
    }

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filtered.length === 0) {
      list.innerHTML = '<div class="empty-state"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg><p>No expenses found</p><p class="sub">Tap + to add your first expense</p></div>';
      return;
    }

    const categoryIcons = {
      Food: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>',
      Transport: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>',
      Shopping: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>',
      Bills: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>',
      Health: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>',
      Entertainment: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>',
      Other: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>'
    };

    const categoryClass = (cat) => cat.toLowerCase();

    list.innerHTML = filtered.map(e => `
      <div class="expense-item" data-id="${e.id}">
        <div class="category-icon ${categoryClass(e.category)}">
          ${categoryIcons[e.category] || categoryIcons['Other']}
        </div>
        <div class="details">
          <div class="title">${e.title}</div>
          <div class="meta">
            <span>${e.category}</span>
            <span class="dot"></span>
            <span>${App.formatDate(e.date)}</span>
          </div>
        </div>
        <div class="amount">-${App.formatCurrency(e.amount)}</div>
        <div class="actions">
          <button class="edit-btn" onclick="ExpenseScreen.edit('${e.id}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="delete" onclick="ExpenseScreen.deleteExpense('${e.id}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    `).join('');
  },

  renderStats() {
    const statsEl = document.getElementById('expense-stats');
    if (!statsEl) return;

    const categoryTotals = {};
    this.expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const maxVal = sorted.length > 0 ? sorted[0][1] : 1;

    if (sorted.length === 0) return;

    statsEl.innerHTML = sorted.map(([cat, total]) => {
      const percentage = Math.round((total / maxVal) * 100);
      const colors = {
        Food: 'accent',
        Transport: 'info',
        Shopping: 'danger',
        Bills: 'warning',
        Health: 'success',
        Entertainment: 'accent',
        Other: 'accent'
      };
      return `
        <div class="stat-card">
          <div class="label">${cat}</div>
          <div class="bar"><div class="bar-fill ${colors[cat] || 'accent'}" style="width: ${percentage}%"></div></div>
          <div class="value">${App.formatCurrency(total)}</div>
        </div>
      `;
    }).join('');
  },

  setupListeners() {
    const searchInput = document.getElementById('expense-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderList();
      });
    }

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;
        this.renderList();
      });
    });

    const fab = document.getElementById('expense-fab');
    if (fab) {
      fab.onclick = () => this.showAddModal();
    }
  },

  showAddModal(expense = null) {
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
  },

  async save(editId) {
    const title = document.getElementById('expense-title').value.trim();
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;
    const note = document.getElementById('expense-note').value.trim();
    const date = document.getElementById('expense-date').value;

    if (!title || !amount || !date) {
      Toast.error('Please fill in all required fields', 'Validation Error');
      return;
    }

    const expense = {
      id: editId || App.generateId(),
      title,
      amount,
      category,
      note,
      date
    };

    await Storage.put('expenses', expense);
    Modal.hide();

    if (editId) {
      Toast.success('Expense updated successfully');
    } else {
      Toast.success(`${App.formatCurrency(amount)} added to ${category}`);
    }

    await this.init();
  },

  async edit(id) {
    const expense = await Storage.get('expenses', id);
    if (expense) {
      this.showAddModal(expense);
    }
  },

  async deleteExpense(id) {
    const expense = await Storage.get('expenses', id);
    if (confirm('Delete this expense?')) {
      await Storage.delete('expenses', id);
      Toast.warning('Expense deleted');
      await this.init();
    }
  }
};
