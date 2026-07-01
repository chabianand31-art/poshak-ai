export default {
  async fetch(request, env) {

    const ALLOWED_ORIGINS = ['https://poshakbyai.com'];
    const origin = request.headers.get('Origin');

    const corsHeaders = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Block requests not coming from an allowed origin
    if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
      return new Response('Forbidden', { status: 403, headers: corsHeaders });
    }

    const url = new URL(request.url);

    // ── Helpers ──
    const json = (data, status = 200) =>
      new Response(JSON.stringify(data, null, 2), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    const unauthorized = () =>
      new Response('Unauthorized', { status: 401, headers: corsHeaders });

    const isAuthorized = () => {
      const secret = url.searchParams.get('secret');
      return env.ANALYTICS_SECRET && secret === env.ANALYTICS_SECRET;
    };

    const dbMissing = () =>
      json({ error: 'D1 database (DB) is not bound to this worker. Add it in wrangler.toml.' }, 503);

    // ─────────────────────────────────────────────
    // GET /analytics — stats dashboard
    // ─────────────────────────────────────────────
    if (url.pathname === '/analytics' && request.method === 'GET') {
      if (!isAuthorized()) return unauthorized();
      if (!env.DB) return dbMissing();

      const [
        totalVisits,
        totalScores,
        totalUsers,
        returningUsers,
        scoresLast24h,
        scoresLast7d,
        avgScoreRow,
        feedbackCount,
        avgRatingRow,
      ] = await env.DB.batch([
        env.DB.prepare(`SELECT COUNT(*) AS n FROM events WHERE event = 'visit'`),
        env.DB.prepare(`SELECT COUNT(*) AS n FROM events WHERE event = 'score'`),
        env.DB.prepare(`SELECT COUNT(DISTINCT uid) AS n FROM events`),
        env.DB.prepare(`
          SELECT COUNT(*) AS n FROM (
            SELECT uid FROM events WHERE event = 'visit'
            GROUP BY uid HAVING COUNT(*) >= 2
          )
        `),
        env.DB.prepare(`
          SELECT COUNT(*) AS n FROM events
          WHERE event = 'score'
            AND created_at >= datetime('now', '-24 hours')
        `),
        env.DB.prepare(`
          SELECT COUNT(*) AS n FROM events
          WHERE event = 'score'
            AND created_at >= datetime('now', '-7 days')
        `),
        env.DB.prepare(`SELECT ROUND(AVG(score), 1) AS avg FROM feedback WHERE score IS NOT NULL`),
        env.DB.prepare(`SELECT COUNT(*) AS n FROM feedback`),
        env.DB.prepare(`SELECT ROUND(AVG(rating), 1) AS avg FROM feedback WHERE rating IS NOT NULL`),
      ]);

      return json({
        totalVisits:     totalVisits.results[0]?.n    ?? 0,
        totalScores:     totalScores.results[0]?.n    ?? 0,
        totalUsers:      totalUsers.results[0]?.n     ?? 0,
        returningUsers:  returningUsers.results[0]?.n ?? 0,
        scoresLast24h:   scoresLast24h.results[0]?.n  ?? 0,
        scoresLast7d:    scoresLast7d.results[0]?.n   ?? 0,
        avgOutfitScore:  avgScoreRow.results[0]?.avg  ?? null,
        totalFeedback:   feedbackCount.results[0]?.n  ?? 0,
        avgFeedbackRating: avgRatingRow.results[0]?.avg ?? null,
      });
    }

    // ─────────────────────────────────────────────
    // GET /feedback/list — paginated feedback + aggregates
    // ─────────────────────────────────────────────
    if (url.pathname === '/feedback/list' && request.method === 'GET') {
      if (!isAuthorized()) return unauthorized();
      if (!env.DB) return dbMissing();

      const limit  = Math.min(parseInt(url.searchParams.get('limit')  || '100'), 500);
      const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'),   0);

      const [rows, countRow, avgRow] = await env.DB.batch([
        env.DB.prepare(`
          SELECT id, uid, rating, thoughts, improvements, comment, score, created_at
          FROM feedback
          ORDER BY created_at DESC
          LIMIT ? OFFSET ?
        `).bind(limit, offset),
        env.DB.prepare(`SELECT COUNT(*) AS n FROM feedback`),
        env.DB.prepare(`SELECT ROUND(AVG(rating), 1) AS avg FROM feedback WHERE rating IS NOT NULL`),
      ]);

      // Parse stored JSON arrays and tally chip selections
      const thoughtCounts = {}, improveCounts = {};
      const entries = rows.results.map(r => {
        const thoughts     = JSON.parse(r.thoughts     || '[]');
        const improvements = JSON.parse(r.improvements || '[]');
        thoughts.forEach(t     => { thoughtCounts[t]     = (thoughtCounts[t]     || 0) + 1; });
        improvements.forEach(i => { improveCounts[i]     = (improveCounts[i]     || 0) + 1; });
        return { ...r, thoughts, improvements };
      });

      return json({
        total:         countRow.results[0]?.n   ?? 0,
        avgRating:     avgRow.results[0]?.avg    ?? null,
        thoughtCounts,
        improveCounts,
        entries,
      });
    }

    // Everything below is POST-only
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    // ─────────────────────────────────────────────
    // POST /track — record visit or score event
    // ─────────────────────────────────────────────
    if (url.pathname === '/track') {
      try {
        const { uid, event } = await request.json();

        if (!uid || !['visit', 'score'].includes(event)) {
          return json({ ok: false, error: 'Invalid uid or event' }, 400);
        }

        if (!env.DB) return json({ ok: true }); // silently succeed during local dev

        await env.DB.prepare(`INSERT INTO events (uid, event) VALUES (?, ?)`)
          .bind(uid, event)
          .run();

        return json({ ok: true });
      } catch (err) {
        return json({ ok: false, error: err.message }, 500);
      }
    }

    // ─────────────────────────────────────────────
    // POST /feedback — store one feedback submission
    // ─────────────────────────────────────────────
    if (url.pathname === '/feedback') {
      try {
        const { uid, rating, thoughts, improvements, comment, score } = await request.json();

        if (!env.DB) return json({ ok: true }); // silently succeed during local dev

        await env.DB.prepare(`
          INSERT INTO feedback (uid, rating, thoughts, improvements, comment, score)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          uid          || null,
          typeof rating   === 'number' ? rating   : null,
          JSON.stringify(Array.isArray(thoughts)    ? thoughts    : []),
          JSON.stringify(Array.isArray(improvements)? improvements: []),
          typeof comment  === 'string' ? comment.slice(0, 1000) : null,
          typeof score    === 'number' ? score    : null,
        ).run();

        return json({ ok: true });
      } catch (err) {
        return json({ ok: false, error: err.message }, 500);
      }
    }

    // ─────────────────────────────────────────────
    // POST /transform — generate outfit image via Flux
    // ─────────────────────────────────────────────
    if (url.pathname === '/transform') {
      try {
        const { prompt } = await request.json();

        if (!prompt) return json({ error: 'prompt is required' }, 400);

        const result = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
          prompt,
          num_steps: 8,
          width:     768,
          height:    1024,
        });

        // Flux returns base64-encoded PNG — decode to binary
        const imageData = result.image
          ? Uint8Array.from(atob(result.image), c => c.charCodeAt(0))
          : result;

        return new Response(imageData, {
          headers: { ...corsHeaders, 'Content-Type': 'image/png' },
        });
      } catch (err) {
        return json({ error: err.message }, 500);
      }
    }

    // ─────────────────────────────────────────────
    // POST /accessory — add a specific accessory to the original outfit photo
    // Uses OpenAI gpt-image-1 image editing
    // ─────────────────────────────────────────────
    if (url.pathname === '/accessory') {
      try {
        const { imageBase64, accessoryLabel } = await request.json();
        if (!imageBase64 || !accessoryLabel) return json({ error: 'imageBase64 and accessoryLabel are required' }, 400);

        if (!env.OPENAI_API_KEY) return json({ error: 'OPENAI_API_KEY secret not configured' }, 503);

        const imageBytes = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0));
        const imageBlob = new Blob([imageBytes], { type: 'image/jpeg' });

        const editPrompt = `Add ${accessoryLabel} to this person's outfit. Keep the person, their clothing, pose, background, and everything else exactly as they are. Only add the ${accessoryLabel} — nothing else should change. Do not add, alter, or hallucinate any text, words, signs, watermarks, or written characters anywhere in the image.`;

        const formData = new FormData();
        formData.append('model', 'gpt-image-1');
        formData.append('image[]', imageBlob, 'outfit.jpg');
        formData.append('prompt', editPrompt);
        formData.append('n', '1');
        formData.append('size', '1024x1536');

        const response = await fetch('https://api.openai.com/v1/images/edits', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${env.OPENAI_API_KEY}` },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          return json({ error: data.error?.message || 'OpenAI error' }, response.status);
        }

        const imageData = Uint8Array.from(atob(data.data[0].b64_json), c => c.charCodeAt(0));

        return new Response(imageData, {
          headers: { ...corsHeaders, 'Content-Type': 'image/png' },
        });
      } catch (err) {
        return json({ error: err.message }, 500);
      }
    }

    // ─────────────────────────────────────────────
    // Default — Groq vision proxy
    // ─────────────────────────────────────────────
    try {
      const body = await request.json();

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${env.GROQ_API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return json({ error: err.message }, 500);
    }
  },
};
