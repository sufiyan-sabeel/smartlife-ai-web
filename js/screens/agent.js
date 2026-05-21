const AgentScreen = {
  chatHistory: [],
  isTyping: false,

  async init() {
    this.render();
    this.setupListeners();
  },

  render() {
    const container = document.getElementById('chat-container');
    if (!container) return;

    if (this.chatHistory.length === 0) {
      container.innerHTML = `
        <div class="welcome-message">
          <div class="ai-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 3-2 5.5-3.5 7.5L12 22l-3.5-5.5C7 14.5 5 12 5 9a7 7 0 0 1 7-7z"></path><circle cx="12" cy="9" r="2"></circle></svg>
          </div>
          <h3>Hi, I'm SmartLife AI</h3>
          <p>Your intelligent assistant powered by KageOS. Ask me about your finances, tasks, or anything else.</p>
          <div class="suggestions">
            <button class="suggestion-btn" onclick="AgentScreen.askSuggestion(this)">How much did I spend this week?</button>
            <button class="suggestion-btn" onclick="AgentScreen.askSuggestion(this)">Show my pending tasks</button>
            <button class="suggestion-btn" onclick="AgentScreen.askSuggestion(this)">Am I within budget?</button>
            <button class="suggestion-btn" onclick="AgentScreen.askSuggestion(this)">Give me financial tips</button>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = this.chatHistory.map(msg => `
      <div class="chat-message ${msg.role}">
        <div class="avatar">${msg.role === 'ai' ? 'AI' : 'U'}</div>
        <div class="bubble">${this.formatMessage(msg.content)}</div>
      </div>
    `).join('');

    container.scrollTop = container.scrollHeight;
  },

  formatMessage(text) {
    if (window.marked) {
      return marked.parse(text);
    }
    return text.replace(/\n/g, '<br>');
  },

  setupListeners() {
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');

    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      input.addEventListener('input', () => {
        if (sendBtn) {
          sendBtn.disabled = !input.value.trim();
        }
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.sendMessage());
    }
  },

  askSuggestion(btn) {
    const input = document.getElementById('chat-input');
    if (input) {
      input.value = btn.textContent;
      this.sendMessage();
    }
  },

  async sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input?.value.trim();

    if (!message || this.isTyping) return;

    input.value = '';
    this.chatHistory.push({ role: 'user', content: message });
    this.render();

    this.isTyping = true;
    this.showTyping();

    try {
      const expenses = await Storage.getAll('expenses');
      const todos = await Storage.getAll('todos');
      const notes = await Storage.getAll('notes');
      const reminders = await Storage.getAll('reminders');

      const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
      const completedTodos = todos.filter(t => t.completed).length;

      const context = {
        totalExpenses: totalSpent,
        budgetLimit: CONFIG.budgetLimit,
        budgetLeft: CONFIG.budgetLimit - totalSpent,
        expenseCount: expenses.length,
        pendingTasks: todos.filter(t => !t.completed).length,
        completedTasks: completedTodos,
        notesCount: notes.length,
        remindersCount: reminders.filter(r => r.enabled).length,
        recentExpenses: expenses.slice(-5),
        pendingTodos: todos.filter(t => !t.completed).slice(0, 5),
        currentDate: new Date().toISOString()
      };

      const response = await API.askAI(message, context);

      this.hideTyping();
      this.chatHistory.push({ role: 'ai', content: response });
      this.render();
    } catch (error) {
      this.hideTyping();
      this.chatHistory.push({
        role: 'ai',
        content: `Sorry, I encountered an error: ${error.message}. Please check your API key.`
      });
      this.render();
    }

    this.isTyping = false;
  },

  showTyping() {
    const container = document.getElementById('chat-container');
    if (!container) return;

    const typingEl = document.createElement('div');
    typingEl.className = 'chat-message ai';
    typingEl.id = 'typing-indicator';
    typingEl.innerHTML = `
      <div class="avatar">AI</div>
      <div class="bubble">
        <div class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    container.appendChild(typingEl);
    container.scrollTop = container.scrollHeight;
  },

  hideTyping() {
    const typingEl = document.getElementById('typing-indicator');
    if (typingEl) typingEl.remove();
  }
};
