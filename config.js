// Poshak AI — centralised config
// Update WORKER_URL here to point to a different Cloudflare Worker deployment.

const CONFIG = {
  // Cloudflare Worker base URL
  WORKER_URL: 'https://poshak-proxy.chabianand31.workers.dev',

  // Worker routes
  ENDPOINTS: {
    GROQ_PROXY:  '/',           // POST  — proxies requests to Groq LLM API
    TRACK:       '/track',      // POST  — analytics: record visit / score events
    TRANSFORM:   '/transform',  // POST  — image generation via FLUX-1-Schnell (CF AI)
    ACCESSORY:      '/accessory',       // POST  — add accessory to original photo via gpt-image-1
    LOOK_REACTION:  '/look-reaction',   // POST  — thumbs up/down on generated accessory look
    ANALYTICS:      '/analytics',       // GET   — stats dashboard (requires ?secret=)
  },

  // External APIs (called by the Worker, not the browser directly)
  EXTERNAL: {
    GROQ_CHAT: 'https://api.groq.com/openai/v1/chat/completions',
  },

  // App
  APP_URL:       'https://poshakbyai.com',

  // Sample / demo image
  SAMPLE_IMAGE:  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?fm=jpg&q=80&w=800',
};
