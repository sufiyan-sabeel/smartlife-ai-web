const ChatBubble = {
  create(role, content) {
    const div = document.createElement('div');
    div.className = `chat-message ${role}`;
    div.innerHTML = `
      <div class="avatar">${role === 'ai' ? 'AI' : 'U'}</div>
      <div class="bubble">${this.formatContent(content)}</div>
    `;
    return div;
  },

  formatContent(text) {
    if (window.marked) {
      return marked.parse(text);
    }
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  },

  createTyping() {
    const div = document.createElement('div');
    div.className = 'chat-message ai';
    div.id = 'typing-indicator';
    div.innerHTML = `
      <div class="avatar">AI</div>
      <div class="bubble">
        <div class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    return div;
  }
};
