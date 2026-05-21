# SmartLife AI Web

A clean, responsive HTML/CSS/JS web app for managing expenses, tasks, notes, and AI-powered assistance.

## Features

- **Home Dashboard** - Overview of spending, tasks, notes, and budget with charts
- **Expense Tracker** - CRUD operations, filtering, search, category breakdown
- **Notes / Tasks / Reminders** - Tabbed interface with grid/list views, priorities, browser notifications
- **AI Agent** - Chat interface powered by OpenRouter API with context injection

## Tech Stack

- HTML5 / CSS3 / Vanilla JavaScript
- IndexedDB for local data persistence
- Chart.js for analytics
- marked.js for markdown rendering
- OpenRouter API for AI

## Getting Started

1. Clone or download this project
2. Open `config.js` and replace `YOUR_OPENROUTER_KEY` with your actual OpenRouter API key
3. Open `index.html` in a browser or serve it locally

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```

4. Visit `http://localhost:8000`

## Configuration

Edit `config.js` to customize:

```javascript
const CONFIG = {
  appName: "SmartLife AI",
  openRouterApiKey: "YOUR_OPENROUTER_KEY",
  aiModel: "openai/gpt-4o-mini",
  currencySymbol: "₹",
  darkModeDefault: false,
  budgetLimit: 10000,
};
```

## File Structure

```
smartlife-ai-web/
├── index.html
├── config.js
├── styles/
│   ├── global.css
│   ├── theme.css
│   ├── dashboard.css
│   ├── expense.css
│   ├── notes.css
│   └── agent.css
├── js/
│   ├── app.js
│   ├── router.js
│   ├── storage.js
│   ├── api.js
│   ├── theme.js
│   ├── charts.js
│   ├── screens/
│   │   ├── home.js
│   │   ├── expense.js
│   │   ├── notes.js
│   │   └── agent.js
│   └── components/
│       ├── navbar.js
│       ├── cards.js
│       ├── modal.js
│       └── chatbubble.js
├── assets/
│   ├── icons/
│   ├── images/
│   └── fonts/
└── README.md
```

## Deployment

For production, use a serverless proxy to protect your API key:

- **Vercel**: Add API routes for OpenRouter proxy
- **Netlify**: Use Netlify Functions
- **Cloudflare Workers**: Edge proxy for API calls

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## License

MIT
