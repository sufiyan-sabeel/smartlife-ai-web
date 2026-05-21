// WARNING: This API key is exposed in client-side JavaScript.
// For production use, either:
// 1. Use a backend proxy to hide the key
// 2. Restrict the key in OpenRouter dashboard (allowed origins, rate limits)
// 3. Use environment variables with a build tool
const CONFIG = {
  appName: "SmartLife AI",
  openRouterApiKey: "",
  aiModel: "qwen/qwen3-coder:free",
  primaryColor: "#000000",
  accentColor: "#6C63FF",
  currencySymbol: "₹",
  darkModeDefault: false,
  memoryEnabled: true,
  budgetLimit: 10000,
  agentSystemPrompt: `You are SmartLife AI.
You help with:
- expenses
- productivity
- reminders
- notes
- financial insights

Always be concise, helpful, and data-aware.
When the user asks about expenses, budget, or tasks, use the context provided.`,
  expenseCategories: [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Health",
    "Entertainment",
    "Other"
  ]
};

