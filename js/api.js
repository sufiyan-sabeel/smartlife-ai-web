const API = {
  async askAI(message, context = {}) {
    const systemPrompt = CONFIG.agentSystemPrompt;

    let enhancedPrompt = message;
    if (CONFIG.memoryEnabled && Object.keys(context).length > 0) {
      const contextStr = JSON.stringify(context, null, 2);
      enhancedPrompt = `Context: ${contextStr}\n\nUser: ${message}`;
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.href,
        'X-Title': CONFIG.appName
      },
      body: JSON.stringify({
        model: CONFIG.aiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: enhancedPrompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  },

  async askAIStream(message, context = {}, onChunk) {
    const systemPrompt = CONFIG.agentSystemPrompt;

    let enhancedPrompt = message;
    if (CONFIG.memoryEnabled && Object.keys(context).length > 0) {
      const contextStr = JSON.stringify(context, null, 2);
      enhancedPrompt = `Context: ${contextStr}\n\nUser: ${message}`;
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.href,
        'X-Title': CONFIG.appName
      },
      body: JSON.stringify({
        model: CONFIG.aiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: enhancedPrompt }
        ],
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'));

      for (const line of lines) {
        const jsonStr = line.replace('data: ', '').trim();
        if (jsonStr === '[DONE]') continue;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            fullText += content;
            onChunk(fullText);
          }
        } catch (e) {
        }
      }
    }

    return fullText;
  }
};
