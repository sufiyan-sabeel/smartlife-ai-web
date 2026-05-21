const Cards = {
  summaryCard(label, value, sub = '') {
    return `
      <div class="summary-card">
        <div class="label">${label}</div>
        <div class="value">${value}</div>
        ${sub ? `<div class="sub">${sub}</div>` : ''}
      </div>
    `;
  },

  expenseItem(expense) {
    return `
      <div class="expense-item" data-id="${expense.id}">
        <div class="category-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </div>
        <div class="details">
          <div class="title">${expense.title}</div>
          <div class="meta">${expense.category} - ${App.formatDate(expense.date)}</div>
        </div>
        <div class="amount">-${App.formatCurrency(expense.amount)}</div>
      </div>
    `;
  },

  noteCard(note) {
    return `
      <div class="note-card" onclick="NotesScreen.editNote('${note.id}')">
        <div class="note-title">${note.title || 'Untitled'}</div>
        <div class="note-preview">${note.content || ''}</div>
        <div class="note-date">${App.formatDate(note.updatedAt || note.createdAt)}</div>
      </div>
    `;
  },

  todoItem(todo) {
    return `
      <div class="todo-item ${todo.completed ? 'completed' : ''}">
        <div class="checkbox ${todo.completed ? 'checked' : ''}">
          ${todo.completed ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
        </div>
        <div class="todo-content">
          <div class="todo-title">${todo.title}</div>
          <div class="todo-meta">
            <span class="badge badge-${todo.priority?.toLowerCase() || 'medium'}">${todo.priority || 'Medium'}</span>
            ${todo.dueDate ? `<span>Due ${App.formatDate(todo.dueDate)}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }
};
