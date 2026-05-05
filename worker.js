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
        const { image_base64, prompt } = await request.json();

        if (!image_base64 || !prompt) {
          return new Response(JSON.stringify({ error: 'image_base64 and prompt are required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Convert base64 string to Uint8Array for Cloudflare AI
        const binaryStr = atob(image_base64);
        const imageBytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          imageBytes[i] = binaryStr.charCodeAt(i);
        }

        const result = await env.AI.run('@cf/runwayml/stable-diffusion-v1-5-img2img', {
          prompt: prompt,
          image: [...imageBytes],
          strength: 0.65,   // how much to change — 0=no change, 1=ignore original
          num_steps: 20,
          guidance: 8,
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
