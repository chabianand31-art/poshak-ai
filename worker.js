export default {
  async fetch(request, env) {

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const url = new URL(request.url);

    // ── /transform — img2img: apply outfit changes to the actual uploaded photo ──
    if (url.pathname === '/transform') {
      try {
        const { prompt } = await request.json();

        if (!prompt) {
          return new Response(JSON.stringify({ error: 'prompt is required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const result = await env.AI.run('@cf/bytedance/stable-diffusion-xl-lightning', {
          prompt: prompt,
          negative_prompt: 'text, letters, words, watermark, caption, logo, blurry, distorted, deformed, ugly, low quality, bad anatomy, extra limbs, multiple people, cluttered background',
          num_steps: 8,
          guidance: 2.0,
          width: 768,
          height: 1024,
        });

        // Result is a ReadableStream of PNG bytes — return as image
        return new Response(result, {
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

    // ── Default route — Groq proxy (existing behaviour) ──
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
