const NotesScreen = {
  notes: [],
  todos: [],
  reminders: [],
  currentTab: 'notes',
  viewMode: 'grid',

  async init() {
    this.notes = await Storage.getAll('notes');
    this.todos = await Storage.getAll('todos');
    this.reminders = await Storage.getAll('reminders');
    this.render();
    this.setupListeners();
  },

  render() {
    this.renderTabs();
    this.renderNotes();
    this.renderTodos();
    this.renderReminders();
  },

  renderTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === this.currentTab);
    });

    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `tab-${this.currentTab}`);
    });
  },

  renderNotes() {
    const container = document.getElementById('notes-container');
    const countEl = document.getElementById('notes-count');
    if (!container) return;

    container.className = this.viewMode === 'grid' ? 'notes-grid' : 'notes-list';

    if (countEl) {
      countEl.textContent = `${this.notes.length} note${this.notes.length !== 1 ? 's' : ''}`;
    }

    if (this.notes.length === 0) {
      container.innerHTML = '<div class="empty-state"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg><p>No notes yet</p><p class="sub">Tap + to create your first note</p></div>';
      return;
    }

    container.innerHTML = this.notes.map(n => `
      <div class="note-card" onclick="NotesScreen.editNote('${n.id}')">
        <div class="note-title">${n.title || 'Untitled'}</div>
        <div class="note-preview">${n.content || ''}</div>
        <div class="note-footer">
          <span class="note-date">${App.formatDate(n.updatedAt || n.createdAt)}</span>
          <div class="note-actions">
            <button class="delete" onclick="event.stopPropagation(); NotesScreen.deleteNote('${n.id}')">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  },

  renderTodos() {
    const container = document.getElementById('todos-container');
    if (!container) return;

    if (this.todos.length === 0) {
      container.innerHTML = '<div class="empty-state"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg><p>No tasks yet</p><p class="sub">Tap + to add your first task</p></div>';
      return;
    }

    const sorted = [...this.todos].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
    });

    container.innerHTML = sorted.map(t => `
      <div class="todo-item ${t.completed ? 'completed' : ''}" data-id="${t.id}">
        <div class="checkbox ${t.completed ? 'checked' : ''}" onclick="NotesScreen.toggleTodo('${t.id}')">
          ${t.completed ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
        </div>
        <div class="todo-content">
          <div class="todo-title">${t.title}</div>
          <div class="todo-meta">
            <span class="badge badge-${t.priority?.toLowerCase() || 'medium'}">${t.priority || 'Medium'}</span>
            ${t.dueDate ? `<span>Due ${App.formatDate(t.dueDate)}</span>` : ''}
          </div>
        </div>
        <div class="todo-actions">
          <button onclick="NotesScreen.editTodo('${t.id}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="delete" onclick="NotesScreen.deleteTodo('${t.id}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    `).join('');
  },

  renderReminders() {
    const container = document.getElementById('reminders-container');
    if (!container) return;

    if (this.reminders.length === 0) {
      container.innerHTML = '<div class="empty-state"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg><p>No reminders yet</p><p class="sub">Tap + to set a reminder</p></div>';
      return;
    }

    container.innerHTML = this.reminders.map(r => `
      <div class="reminder-item ${r.enabled ? '' : 'disabled'}" data-id="${r.id}">
        <div class="reminder-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        </div>
        <div class="reminder-content">
          <div class="reminder-title">${r.title}</div>
          <div class="reminder-time">${r.time} ${r.repeat ? `• ${r.repeat}` : ''}</div>
        </div>
        <div class="toggle ${r.enabled ? 'active' : ''}" onclick="NotesScreen.toggleReminder('${r.id}')"></div>
      </div>
    `).join('');
  },

  setupListeners() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.currentTab = tab.dataset.tab;
        this.renderTabs();
      });
    });

    document.querySelectorAll('.view-toggle button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.view-toggle button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.viewMode = btn.dataset.view;
        this.renderNotes();
      });
    });

    const fab = document.getElementById('notes-fab');
    if (fab) {
      fab.onclick = () => {
        if (this.currentTab === 'notes') this.showNoteModal();
        else if (this.currentTab === 'todos') this.showTodoModal();
        else this.showReminderModal();
      };
    }
  },

  showNoteModal(note = null) {
    const isEdit = !!note;
    Modal.show({
      title: isEdit ? 'Edit Note' : 'New Note',
      content: `
        <div class="editor-modal-content">
          <input type="text" id="note-title" value="${note?.title || ''}" placeholder="Title">
          <textarea id="note-content" placeholder="Write your note...">${note?.content || ''}</textarea>
          <div class="filter-modal-actions">
            <button class="btn btn-secondary" onclick="Modal.hide()">Cancel</button>
            <button class="btn btn-primary" onclick="NotesScreen.saveNote('${note?.id || ''}')">${isEdit ? 'Update' : 'Save'}</button>
          </div>
        </div>
      `
    });
  },

  async saveNote(editId) {
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();

    if (!title && !content) {
      Toast.error('Please add a title or content', 'Validation Error');
      return;
    }

    const now = new Date().toISOString();
    const note = {
      id: editId || App.generateId(),
      title,
      content,
      createdAt: editId ? (await Storage.get('notes', editId))?.createdAt : now,
      updatedAt: now
    };

    await Storage.put('notes', note);
    Modal.hide();
    Toast.success(editId ? 'Note updated' : 'Note created');
    await this.init();
  },

  async editNote(id) {
    const note = await Storage.get('notes', id);
    if (note) this.showNoteModal(note);
  },

  async deleteNote(id) {
    if (confirm('Delete this note?')) {
      await Storage.delete('notes', id);
      Toast.warning('Note deleted');
      await this.init();
    }
  },

  showTodoModal(todo = null) {
    const isEdit = !!todo;
    Modal.show({
      title: isEdit ? 'Edit Task' : 'New Task',
      content: `
        <div class="editor-modal-content">
          <input type="text" id="todo-title" value="${todo?.title || ''}" placeholder="Task title">
          <select id="todo-priority">
            <option value="High" ${todo?.priority === 'High' ? 'selected' : ''}>High</option>
            <option value="Medium" ${todo?.priority === 'Medium' ? 'selected' : ''}>Medium</option>
            <option value="Low" ${todo?.priority === 'Low' ? 'selected' : ''}>Low</option>
          </select>
          <input type="date" id="todo-due" value="${todo?.dueDate || ''}">
          <div class="filter-modal-actions">
            <button class="btn btn-secondary" onclick="Modal.hide()">Cancel</button>
            <button class="btn btn-primary" onclick="NotesScreen.saveTodo('${todo?.id || ''}')">${isEdit ? 'Update' : 'Add'}</button>
          </div>
        </div>
      `
    });
  },

  async saveTodo(editId) {
    const title = document.getElementById('todo-title').value.trim();
    const priority = document.getElementById('todo-priority').value;
    const dueDate = document.getElementById('todo-due').value;

    if (!title) {
      Toast.error('Please enter a task title', 'Validation Error');
      return;
    }

    const existing = editId ? await Storage.get('todos', editId) : null;
    const todo = {
      id: editId || App.generateId(),
      title,
      priority,
      dueDate,
      completed: existing?.completed || false
    };

    await Storage.put('todos', todo);
    Modal.hide();
    Toast.success(editId ? 'Task updated' : 'Task added');
    await this.init();
  },

  async toggleTodo(id) {
    const todo = await Storage.get('todos', id);
    if (todo) {
      todo.completed = !todo.completed;
      await Storage.put('todos', todo);
      if (todo.completed) {
        Toast.success('Task completed!', 'Great job');
      }
      await this.init();
    }
  },

  async editTodo(id) {
    const todo = await Storage.get('todos', id);
    if (todo) this.showTodoModal(todo);
  },

  async deleteTodo(id) {
    if (confirm('Delete this task?')) {
      await Storage.delete('todos', id);
      Toast.warning('Task deleted');
      await this.init();
    }
  },

  showReminderModal() {
    Modal.show({
      title: 'New Reminder',
      content: `
        <div class="editor-modal-content">
          <input type="text" id="reminder-title" placeholder="Reminder title">
          <input type="time" id="reminder-time" value="09:00">
          <select id="reminder-repeat">
            <option value="">Once</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
          <div class="filter-modal-actions">
            <button class="btn btn-secondary" onclick="Modal.hide()">Cancel</button>
            <button class="btn btn-primary" onclick="NotesScreen.saveReminder()">Add</button>
          </div>
        </div>
      `
    });
  },

  async saveReminder() {
    const title = document.getElementById('reminder-title').value.trim();
    const time = document.getElementById('reminder-time').value;
    const repeat = document.getElementById('reminder-repeat').value;

    if (!title) {
      Toast.error('Please enter a reminder title', 'Validation Error');
      return;
    }

    const reminder = {
      id: App.generateId(),
      title,
      time,
      repeat,
      enabled: true
    };

    await Storage.put('reminders', reminder);

    if ('Notification' in window && Notification.permission === 'granted') {
      this.scheduleNotification(reminder);
    }

    Modal.hide();
    Toast.success('Reminder created');
    await this.init();
  },

  async toggleReminder(id) {
    const reminder = await Storage.get('reminders', id);
    if (reminder) {
      reminder.enabled = !reminder.enabled;
      await Storage.put('reminders', reminder);
      Toast.info(reminder.enabled ? 'Reminder enabled' : 'Reminder disabled');
      await this.init();
    }
  },

  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  },

  scheduleNotification(reminder) {
    if (!reminder.enabled) return;

    const [hours, minutes] = reminder.time.split(':');
    const now = new Date();
    const scheduled = new Date();
    scheduled.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (scheduled <= now) {
      scheduled.setDate(scheduled.getDate() + 1);
    }

    const delay = scheduled.getTime() - now.getTime();

    setTimeout(() => {
      new Notification(CONFIG.appName, {
        body: reminder.title,
        icon: '/assets/icons/icon-192.png'
      });

      if (reminder.repeat) {
        this.scheduleNotification(reminder);
      }
    }, delay);
  }
};
