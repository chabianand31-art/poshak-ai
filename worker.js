export default {
  async fetch(request, env) {

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // ── GET /analytics — stats dashboard (secret-protected) ──
    if (url.pathname === '/analytics' && request.method === 'GET') {
      const secret = url.searchParams.get('secret');
      if (!env.ANALYTICS_SECRET || secret !== env.ANALYTICS_SECRET) {
        return new Response('Unauthorized', { status: 401 });
      }
      if (!env.ANALYTICS) {
        return new Response(JSON.stringify({ error: 'KV namespace ANALYTICS not bound to this worker.' }), {
          status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      const raw = await env.ANALYTICS.get('stats:global');
      const stats = raw ? JSON.parse(raw) : { totalUsers: 0, returningUsers: 0, totalVisits: 0, totalScores: 0 };
      return new Response(JSON.stringify(stats, null, 2), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // ── POST /track — record visit or score event ──
    if (url.pathname === '/track') {
      try {
        const { uid, event } = await request.json();
        if (!uid || !['visit', 'score'].includes(event)) {
          return new Response(JSON.stringify({ ok: false }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Silently succeed if KV not yet configured
        if (!env.ANALYTICS) {
          return new Response(JSON.stringify({ ok: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const userKey = `user:${uid}`;
        const userRaw = await env.ANALYTICS.get(userKey);
        const isNew = !userRaw;
        const user = userRaw
          ? JSON.parse(userRaw)
          : { firstSeen: new Date().toISOString(), visits: 0, scores: 0 };

        user.lastSeen = new Date().toISOString();
        if (event === 'visit') user.visits = (user.visits || 0) + 1;
        if (event === 'score') user.scores = (user.scores || 0) + 1;
        await env.ANALYTICS.put(userKey, JSON.stringify(user));

        // Update global counters
        const globalRaw = await env.ANALYTICS.get('stats:global');
        const g = globalRaw
          ? JSON.parse(globalRaw)
          : { totalUsers: 0, returningUsers: 0, totalVisits: 0, totalScores: 0 };

        if (event === 'visit') {
          g.totalVisits = (g.totalVisits || 0) + 1;
          if (isNew) {
            g.totalUsers = (g.totalUsers || 0) + 1;
          } else {
            // Only count as returning on their 2nd+ visit session
            if (user.visits === 2) g.returningUsers = (g.returningUsers || 0) + 1;
          }
        }
        if (event === 'score') g.totalScores = (g.totalScores || 0) + 1;
        await env.ANALYTICS.put('stats:global', JSON.stringify(g));

        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: err.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // ── POST /transform — img2img: apply outfit changes to the actual uploaded photo ──
    if (url.pathname === '/transform') {
      try {
        const { prompt } = await request.json();

        if (!prompt) {
          return new Response(JSON.stringify({ error: 'prompt is required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const result = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
          prompt: prompt,
          num_steps: 8,
          width: 768,
          height: 1024,
        });

        // FLUX returns base64 JSON — decode to binary PNG
        const imageData = result.image
          ? Uint8Array.from(atob(result.image), c => c.charCodeAt(0))
          : result;

        return new Response(imageData, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'image/png',
          }
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // ── Default route — Groq proxy ──
    const body = await request.json();

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.GROQ_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      }
    });
  }
};
