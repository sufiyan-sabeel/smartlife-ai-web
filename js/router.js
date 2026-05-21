const Router = {
  currentRoute: 'home',
  listeners: [],

  init() {
    const saved = Storage.getLocal('lastRoute', 'home');
    this.navigate(saved, false);

    window.addEventListener('popstate', () => {
      const route = window.location.hash.slice(1) || 'home';
      this.navigate(route, false);
    });
  },

  navigate(route, save = true) {
    this.currentRoute = route;

    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });

    const targetPage = document.getElementById(`page-${route}`);
    if (targetPage) {
      targetPage.classList.add('active');
    }

    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.route === route) {
        item.classList.add('active');
      }
    });

    if (save) {
      Storage.setLocal('lastRoute', route);
      window.location.hash = route;
    }

    this.listeners.forEach(listener => listener(route));

    const screenInit = {
      home: () => typeof HomeScreen !== 'undefined' && HomeScreen.init(),
      expense: () => typeof ExpenseScreen !== 'undefined' && ExpenseScreen.init(),
      notes: () => typeof NotesScreen !== 'undefined' && NotesScreen.init(),
      agent: () => typeof AgentScreen !== 'undefined' && AgentScreen.init(),
      settings: () => typeof SettingsScreen !== 'undefined' && SettingsScreen.init()
    };

    if (screenInit[route]) {
      screenInit[route]();
    }
  },

  onNavigate(callback) {
    this.listeners.push(callback);
  }
};
