// API endpoints are defined in config.js

// ── Analytics ──
const _UID_KEY = 'poshak_uid';
function _getUID() {
  let uid = localStorage.getItem(_UID_KEY);
  if (!uid) { uid = crypto.randomUUID(); localStorage.setItem(_UID_KEY, uid); }
  return uid;
}
function track(event) {
  try {
    fetch(CONFIG.WORKER_URL + CONFIG.ENDPOINTS.TRACK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: _getUID(), event })
    }).catch(() => {});
  } catch (_) {}
}
track('visit');

let currentImageBase64 = null;
let currentMediaType = 'image/jpeg';

function getMediaType(file) {
  if (file.type && file.type.startsWith('image/')) return file.type;
  const ext = file.name.split('.').pop().toLowerCase();
  const map = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg',
    png: 'image/png', gif: 'image/gif',
    webp: 'image/webp', bmp: 'image/bmp',
    tiff: 'image/tiff', tif: 'image/tiff',
    heic: 'image/heic', heif: 'image/heif',
    avif: 'image/avif'
  };
  return map[ext] || 'image/jpeg';
}

const SYSTEM_PROMPT = `You are a Principal Fashion Designer and Creative Director with 20+ years in luxury Indian and contemporary fashion — think the design sensibility of Sabyasachi, the editorial sharpness of Manish Malhotra's atelier, and the street-smart trend awareness of a Vogue India stylist. You have dressed celebrities, judged design collections, and can read an outfit the way a novelist reads a sentence. You give feedback that is specific, authoritative, classy, and genuinely useful. You do not flatter. You do not vague-out. Every comment you make could be quoted in a magazine.

Score outfit photos on 4 dimensions (each out of 25, total out of 100):
1. colour_harmony — Colour Matching (0-25): Does the palette have a considered point of view? Covers: tone harmony, colour temperature, contrast ratios, clashing, monochrome execution, and whether the colours feel curated or accidental.
2. outfit_cohesion — How Well It Goes Together (0-25): Do the pieces belong in the same universe? Covers: style register (ethnic/western clash), occasion appropriateness, fabric weight mixing, and whether the overall look has a clear, unified narrative.
3. intentionality — Effort & Finishing (0-25): Is this look complete and considered? Covers: accessories (jewellery, bags, belts, watches), grooming visible in photo, the finishing details that separate a dressed person from a styled one. SHOES ALWAYS BELONG IN THIS CATEGORY.
4. silhouette — Fit & Shape (0-25): Is the construction and proportion working on this body? Covers: fit precision, volume balance, hem lengths, silhouette flattery, structural integrity of the garment. Do NOT mention shoes here.

─────────────────────────────
STEP 1 — GARMENT IDENTIFICATION (do this before everything else)
─────────────────────────────
Identify with precision. These are not interchangeable:
- Saree: draped fabric, worn with blouse and petticoat
- Kurta / Kurti: stitched top, worn with salwar / pants / leggings
- Salwar Kameez: kurta + salwar (loose pleated pants), often a set
- Co-ord set: matching top + bottom in same fabric or print
- Lehenga: flared skirt + fitted blouse + optional dupatta
- Sherwani: formal men's knee-length coat garment
- Achkan: similar to sherwani, typically simpler
- Bandhgala / Nehru jacket: structured collarless jacket
- Blazer / Jacket: Western outerwear, structured
- Trench / Overcoat: longline outerwear
Use the SAME garment name across every field. Do not call it a kurta in the label and a sherwani in the tip.

─────────────────────────────
STEP 2 — DEEP OBSERVATION (required before scoring)
─────────────────────────────
Before writing a single score or comment, study the image as a designer would:
- What exact garments are present? What are their colours, fabrics (as best as visible), and construction?
- What accessories are already on the person? List them explicitly: earrings, necklace, watch, belt, bag, dupatta, stole, brooch, etc.
- How does the fit sit on the body? Where is the volume? Are proportions balanced?
- What is the occasion context — festive, casual, office, wedding, street?
- What is working well and what is the single weakest element?
This observation locks in everything. If it is not in the observation, it does not exist. You cannot comment on what you cannot see.

─────────────────────────────
STEP 3 — SCORING (calibrated honestly)
─────────────────────────────
- A thrown-together everyday outfit with no intention = 4–5. Not 7.
- A decent outfit with some thought but missing details = 5–6.5.
- A well put-together look with a clear colour story and good fit = 7–7.5.
- A genuinely strong, intentional, well-executed outfit = 8–8.5.
- Reserve 9–10 for editorial-quality, truly exceptional looks.
- Most real-world outfits land between 4.5 and 7. Be honest.
- Missing accessories, clashing colours, poor fit — deduct. Do not be shy.
- Do NOT round up to be kind. A 5.5 should feel like a 5.5.
- Nudge ONLY if total < 80. One nudge max. Score ≥ 80: NO nudge.

─────────────────────────────
STEP 4 — WRITING FEEDBACK (the most important part)
─────────────────────────────
Write like a Principal Designer who has given a thousand critiques and can make every word count. The tone is: warm but unsparing, specific not vague, classy not casual, editorial not chatty.

FIELDS:
- label: MAX 6 words. An arresting, Instagram-worthy capsule of this exact outfit — specific to the garment, colour, and vibe you see. The energy to aim for (do NOT copy): "the kurta knows what it's doing", "one belt away from iconic", "navy doing the heavy lifting", "colour story: still finding the plot", "embroidery carrying the whole look". No hashtags. No full stops. Must feel like it could appear on a Vogue India reel.
- vibe_line: MAX 12 words. One crisp, editorial sentence. The kind a Creative Director would say while reviewing a lookbook. Specific to this outfit. No full stops.
- whats_working: MAX 20 words. Name the single strongest element and say precisely WHY it works — fabric, colour choice, proportion, styling detail. Sound like you are writing a design review. Not "the colours look nice." More like: "The deep navy jacquard against cream dhoti pants creates exactly the right formal tension."
- nudge: MAX 20 words. One specific, immediately actionable correction. Name the exact piece or detail. Sound like a mentor mid-critique — clear, direct, not unkind. Not "add accessories." More like: "A slim oxidised silver cuff on the left wrist would anchor the whole look."

TIP QUALITY — this is critical:
Each tip must read like a designer note, not a style blog caption. Be precise:
- Name the specific item, colour, or garment element you are addressing
- Reference what is already in the observation — do not invent things that are not there
- Suggest the exact fix: a specific accessory, colour swap, or proportion change
- Avoid vague words: "pop of colour", "statement piece", "something bold" — these are lazy. Be specific.
- Good tip: "The ivory dhoti needs a pointed-toe tan juttis — the sandals are dropping the formality register."
- Bad tip: "Consider adding accessories to complete the look."
- Each tip MAX 25 words.

─────────────────────────────
ABSOLUTE RULES
─────────────────────────────
- Score ONLY if exactly one person is visible with outfit clearly shown. Multiple people or non-fashion image → scoreable: false.
- NEVER suggest an accessory already visible in the observation. Person wearing a dupatta? Do NOT suggest a dupatta. Earrings already on? No earring tip. Belt visible? No belt suggestion. Cross-check every tip against your observation before writing it. Suggesting what they already have is a factual error — it will immediately destroy your credibility.
- Gender neutral always. No "girl", "queen", "king", "bro" — address the look, not the person.
- Indian English — precise, warm, authoritative. Bollywood or cultural references are welcome when they add wit. Never sarcastic, never dismissive.
- Short sentences. No flowery filler. Every word earns its place.

─────────────────────────────
2026 TREND INTELLIGENCE
─────────────────────────────
COLOURS TO REWARD: Pantone Cloud Dancer (off-white), Burnished Lilac, Lava Falls (deep red-brown), Alexandrite (teal), Acacia (muted gold), Coral Red, Forest Moss, Mandarin Orange, Canary Yellow, Chartreuse. Bold saturated tones — pastels are fading.

SILHOUETTES TO REWARD: Asymmetric cuts, layered hems, midi-to-maxi hybrids, relaxed draped necklines cinched at waist, cropped boxy jackets, structured longline shapes, 1970s retro tailoring, intentional oversized proportions.

FABRICS TO REWARD: Jacquard (floral, geometric, 3D raised), bouclé, matte velvet, crochet, embroidery, sequins, natural fibres — linen, cotton blends, lyocell. Tactile richness is the 2026 mood.

ACCESSORIES TO REWARD: Statement belts with oversized buckles, bold sculptural jewellery (oversized gemstones, Art Deco shapes), woven leather bags, crescent bags, pointed or square-toe shoes, vintage revival (satin scarves).

WHAT IS OUT: Drop-waist, bubble hems, bodycon, ultra-skinny fits, faded denim, dainty minimalist jewellery, micro bags, chunky rounded-toe chelsea boots, pastel-only outfits.

INDIA-SPECIFIC TRENDS TO REWARD: Kurta with clean white sneakers (intentional, not lazy), saree with crop top or structured blouse, jhumkas with contemporary streetwear, Indo-Western fusion with clear intention, co-ords with utility or cargo details, comfort silhouettes with a strong colour story.

─────────────────────────────
IMAGE PROMPT (for the "new look" visualisation)
─────────────────────────────
- Only populate image_prompt when nudge is not null (score < 80)
- Write a precise Flux/SDXL generation prompt for the improved outfit
- Describe exactly ONE person, ONE outfit, standing still, facing camera
- Be specific: exact garment names, exact colours, fabric descriptors, accessories
- No vague adjectives like "stylish" or "improved" — describe what they are literally wearing
- Structure: "[man/woman] wearing [top], [bottom], [shoes if visible], [accessories], [occasion], fashion editorial photograph, full body, clean studio background, soft natural lighting, sharp focus"
- CRITICAL: Start with "man" or "woman" based on visible gender presentation. Never "person" — image models default female.
- MAX 50 words

─────────────────────────────
PARTIAL BODY RULES
─────────────────────────────
- partial_body: true if only upper OR only lower body is visible. false if full body is shown.
- shoes_visible: true only if footwear is clearly in frame.
- If shoes_visible is false: HARD RULE — no mention of shoes, footwear, loafers, heels, sandals, boots, or anything below the ankle in any field. You cannot see them. Suggest only what is visible.
- If partial_body is true: HARD CAPS — silhouette MAX 10/25, intentionality MAX 13/25. Total MUST be below 6.5. Nudge must say to upload a full-body shot. No exceptions.

Respond ONLY with valid JSON, no markdown:
{
  "scoreable": true,
  "partial_body": false,
  "shoes_visible": true,
  "observation": "Precise designer's eye description: exact garments, colours, fabrics (where visible), all accessories already present, fit, proportions, inferred occasion. This is the ground truth — everything else must be consistent with this.",
  "scores": { "color_harmony": 0, "outfit_cohesion": 0, "intentionality": 0, "silhouette": 0, "total": 0 },
  "label": "",
  "vibe_line": "",
  "whats_working": "",
  "nudge": null,
  "image_prompt": null,
  "tips": {
    "color_harmony": "Specific palette critique or colour suggestion — name the exact tones. Max 25 words.",
    "outfit_cohesion": "Name the exact piece or element disrupting cohesion and suggest the precise fix. Max 25 words.",
    "intentionality": "Name a specific accessory or finishing detail that is missing or could be elevated. Never suggest what is already there. Max 25 words.",
    "silhouette": "Name the exact proportion or fit issue and prescribe the correction. No shoes unless shoes_visible is true. Max 25 words."
  },
  "fingerprint": []
}

If not scoreable: { "scoreable": false, "reason": "brief reason" }`;

const processingMessages = [
  ["Checking your outfit...", "Give us a second, we're looking at everything"],
  ["Reading the colours...", "Seeing how your palette is working together"],
  ["Checking how it all fits...", "Do these pieces belong together?"],
  ["Almost done...", "Putting your score together"]
];

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
}

function goHome() {
  currentImageBase64 = null;
  currentImagePrompt = null;
  if (currentLookImageUrl) { URL.revokeObjectURL(currentLookImageUrl); currentLookImageUrl = null; }
  document.getElementById('fileInput').value = '';
  document.getElementById('cameraInput').value = '';
  document.querySelectorAll('.dim-item').forEach(d => d.classList.remove('open'));
  // Reset feedback form
  selectedRating = 0;
  document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
  const ta = document.getElementById('fbTextarea');
  if (ta) ta.value = '';
  document.getElementById('feedbackForm').style.display = 'block';
  document.getElementById('thankyouState').style.display = 'none';
  showScreen('home');
}

async function loadSamplePhoto() {
  const sampleUrl = CONFIG.SAMPLE_IMAGE;
  try {
    const res = await fetch(sampleUrl);
    const blob = await res.blob();
    const file = new File([blob], 'sample.jpg', { type: 'image/jpeg' });
    handleImage(file);
  } catch {
    alert('Could not load sample. Check your connection and try again.');
  }
}

function handleImage(file) {
  if (!file) return;

  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const isHeic = ext === 'heic' || ext === 'heif' ||
    file.type === 'image/heic' || file.type === 'image/heif';

  if (isHeic) {
    document.getElementById('errorTitle').textContent = 'HEIC photos aren\'t supported yet.';
    document.getElementById('errorSub').textContent = 'On your iPhone, open the photo → tap Share → Save as JPG, then upload that.';
    showScreen('error');
    return;
  }

  currentMediaType = 'image/jpeg';
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // Resize to max 1024px — keeps quality, cuts payload ~10x
      const MAX = 1024;
      let { width: w, height: h } = img;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else        { w = Math.round(w * MAX / h); h = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const compressed = canvas.toDataURL('image/jpeg', 0.82);
      currentImageBase64 = compressed.split(',')[1];
      const imgEl = document.getElementById('previewImg');
      imgEl.onerror = () => { imgEl.src = ''; imgEl.style.background = '#2C2C2A'; };
      imgEl.src = compressed;
      showScreen('preview');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// File input
document.getElementById('fileInput').addEventListener('change', (e) => {
  handleImage(e.target.files[0]);
});

// Camera input
document.getElementById('cameraInput').addEventListener('change', (e) => {
  handleImage(e.target.files[0]);
});

// Upload zone click
document.getElementById('uploadZone').addEventListener('click', () => {
  document.getElementById('fileInput').click();
});

// Drag and drop
const zone = document.getElementById('uploadZone');
zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
zone.addEventListener('drop', (e) => {
  e.preventDefault();
  zone.classList.remove('drag-over');
  handleImage(e.dataTransfer.files[0]);
});

// Processing animation
let processingInterval = null;
function startProcessingAnimation() {
  let step = 0;
  const dots = document.querySelectorAll('.step-dot');

  dots.forEach(d => d.classList.remove('lit'));
  dots[0].classList.add('lit');

  processingInterval = setInterval(() => {
    step = (step + 1) % processingMessages.length;
    document.getElementById('processingTitle').textContent = processingMessages[step][0];
    document.getElementById('processingSub').textContent = processingMessages[step][1];
    dots.forEach(d => d.classList.remove('lit'));
    for (let i = 0; i <= step; i++) dots[i].classList.add('lit');
  }, 1800);
}

function stopProcessingAnimation() {
  clearInterval(processingInterval);
}

async function callGroq(imageBase64, mediaType) {
  const response = await fetch(CONFIG.WORKER_URL + CONFIG.ENDPOINTS.GROQ_PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      max_tokens: 1000,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:${mediaType};base64,${imageBase64}` } },
          { type: 'text', text: 'Score this outfit.' }
        ]}
      ]
    })
  });
  const data = await response.json();
  return { response, data };
}

async function startAnalysis() {
  if (!currentImageBase64) return;
  showScreen('processing');
  startProcessingAnimation();

  try {
    const { response, data } = await callGroq(currentImageBase64, currentMediaType);

    stopProcessingAnimation();

    if (!response.ok) {
      const msg = data.error?.message || `API error ${response.status}`;
      if (response.status === 401) { localStorage.removeItem('dc_api_key'); showKeyModal(); return; }
      throw new Error(msg);
    }

    const rawText = data.choices?.[0]?.message?.content || '';
    if (!rawText) throw new Error('Empty response. Try again.');
    const clean = rawText.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    if (!result.scoreable) {
      document.getElementById('errorTitle').textContent = "Hmm, we can't score this.";
      document.getElementById('errorSub').textContent = result.reason || "We need a clear, full look at your outfit.";
      showScreen('error');
      return;
    }

    displayResult(result);
    track('score');

  } catch (err) {
    stopProcessingAnimation();
    document.getElementById('errorTitle').textContent = "Something went wrong.";
    document.getElementById('errorSub').textContent = err.message || "Couldn't analyze your photo. Please try again.";
    showScreen('error');
    console.error('Gemini error:', err);
  }
}

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

function animateNumber(el, from, to, duration, onUpdate) {
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const val = Math.round((from + (to - from) * easeOut(t)) * 10) / 10;
    el.textContent = val.toFixed(1);
    if (onUpdate) onUpdate(val, t);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function getScoreColor(score) {
  if (score >= 7.5) return 'var(--coral)';
  if (score >= 5) return 'var(--amber)';
  return 'var(--red)';
}

function getPillClass(score) {
  const pct = (score / 25) * 100;
  if (pct >= 75) return '';
  if (pct >= 50) return 'amber';
  return 'red';
}

function displayResult(result) {
  showScreen('result');

  const { scores, label, vibe_line, whats_working, nudge, tips, image_prompt, partial_body, shoes_visible, observation } = result;
  currentImagePrompt = image_prompt || null;
  const total = scores.total;

  // Show partial body notice if applicable
  const partialNotice = document.getElementById('partialBodyNotice');
  partialNotice.style.display = partial_body ? 'flex' : 'none';
  const dims = [scores.color_harmony, scores.outfit_cohesion, scores.intentionality, scores.silhouette];
  const tipTexts = tips ? [
    tips.color_harmony,
    tips.outfit_cohesion,
    tips.intentionality,
    tips.silhouette
  ] : ['', '', '', ''];

  // Reset
  const scoreNumEl = document.getElementById('scoreNum');
  const scoreLabelEl = document.getElementById('scoreLabel');
  const shareBtn = document.getElementById('shareBtn');
  scoreNumEl.textContent = '0';
  scoreNumEl.style.color = getScoreColor(0);
  scoreLabelEl.style.opacity = '0';
  shareBtn.classList.remove('visible');

  document.getElementById('feedbackSection').classList.remove('visible');
  document.getElementById('nudgeCard').style.display = 'none';
  document.getElementById('vibeCard').classList.remove('amber');

  // Reset dim items
  for (let i = 0; i < 4; i++) {
    const dimEl = document.getElementById('dim' + i);
    const valEl = document.getElementById('val' + i);
    const barEl = document.getElementById('bar' + i);
    dimEl.classList.remove('visible');
    valEl.textContent = '0.0/10';
    valEl.className = 'dim-score-label';
    barEl.style.width = '0%';
    barEl.className = 'dim-bar';
  }

  // Animate total score
  animateNumber(scoreNumEl, 0, total / 10, 1300, (val) => {
    scoreNumEl.style.color = getScoreColor(val);
  });

  // Mark lowest scoring dimension
  const lowestIdx = dims.indexOf(Math.min(...dims));

  // Reveal dimension rows staggered + animate bar + label
  dims.forEach((dimScore, i) => {
    setTimeout(() => {
      const dimEl = document.getElementById('dim' + i);
      const valEl = document.getElementById('val' + i);
      const barEl = document.getElementById('bar' + i);
      const tipEl = document.getElementById('tiptext' + i);
      dimEl.classList.add('visible');
      if (i === lowestIdx) dimEl.classList.add('lowest-score');
      if (tipEl && tipTexts[i]) tipEl.textContent = tipTexts[i];

      const pillClass = getPillClass(dimScore);
      valEl.className = 'dim-score-label' + (pillClass ? ' ' + pillClass : '');
      barEl.className = 'dim-bar' + (pillClass ? ' ' + pillClass : '');

      const startTime = performance.now();
      function tick(now) {
        const t = Math.min((now - startTime) / 700, 1);
        const val = Math.round(dimScore * easeOut(t));
        const pct = Math.round((val / 25) * 100);
        valEl.textContent = (val / 25 * 10).toFixed(1) + '/10';
        barEl.style.width = pct + '%';
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, 500 + i * 180);
  });

  // Wire accessory try-on buttons after tip texts are set
  if (tips) {
    Object.keys(accessoryImageCache).forEach(k => {
      URL.revokeObjectURL(accessoryImageCache[k]);
      delete accessoryImageCache[k];
    });
    setTimeout(() => wireAccessoryButtons(tips, shoes_visible, observation), 600);
  }

  // Label + share
  setTimeout(() => {
    scoreLabelEl.textContent = label;
    scoreLabelEl.style.opacity = '1';
    shareBtn.classList.add('visible');
  }, 1400);

  // Feedback content
  document.getElementById('vibeText').textContent = vibe_line;
  if (total < 80) document.getElementById('vibeCard').classList.add('amber');
  document.getElementById('workingText').textContent = whats_working;

  const nudgeCard = document.getElementById('nudgeCard');
  const shoeWords = /\b(shoes?|footwear|loafers?|heels?|sneakers?|socks?|sandals?|boots?|flats?|pumps?|stilettos?)\b/i;
  const safeNudge = (shoes_visible === false && nudge && shoeWords.test(nudge)) ? null : nudge;
  if (safeNudge && total < 80) {
    nudgeCard.style.display = 'flex';
    document.getElementById('nudgeText').textContent = safeNudge;
  } else {
    nudgeCard.style.display = 'none';
  }

  setTimeout(() => {
    document.getElementById('feedbackSection').classList.add('visible');
  }, 1800);
}

let currentImagePrompt = null;
let currentLookImageUrl = null; // cached blob URL for the generated look

function promptSeed(str) {
  // Deterministic seed from prompt string — same prompt always gives same image
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 99999;
}

function showNewLook() {
  if (!currentImagePrompt) return;
  const overlay = document.getElementById('newlookOverlay');
  const wrap = document.getElementById('newlookImgWrap');
  overlay.classList.add('open');

  // If already generated for this outfit, show cached image instantly
  if (currentLookImageUrl) {
    wrap.innerHTML = '';
    const img = document.createElement('img');
    img.src = currentLookImageUrl;
    img.style.cssText = 'width:100%;border-radius:16px;display:block;';
    wrap.appendChild(img);
    return;
  }

  generateLookImage(wrap);
}

async function generateLookImage(wrap) {
  const loadInterval = startImageLoadingUI(wrap, [
    'Reading the suggestion...',
    'Rebuilding the look...',
    'Adding finishing touches...',
    'Almost there...',
  ]);

  function showRetry(msg) {
    clearInterval(loadInterval);
    wrap.innerHTML = `
      <div style="padding:2rem;text-align:center;">
        <div style="font-size:13px;color:#8C8579;line-height:1.6;margin-bottom:1rem;">${msg}</div>
        <button onclick="generateLookImage(document.getElementById('newlookImgWrap'))" style="padding:8px 20px;border-radius:8px;background:#D85A30;color:#fff;border:none;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;">Try again</button>
      </div>`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const res = await fetch(CONFIG.WORKER_URL + CONFIG.ENDPOINTS.TRANSFORM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: currentImagePrompt + ', fashion editorial, highly detailed, photorealistic, studio lighting, clean background'
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showRetry(`Generation failed (${res.status}).<br>${typeof err.error === 'string' ? err.error : 'Try again in a moment.'}`);
      return;
    }

    clearInterval(loadInterval);
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    currentLookImageUrl = objUrl;
    wrap.innerHTML = '';
    const img = document.createElement('img');
    img.src = objUrl;
    img.style.cssText = 'width:100%;border-radius:16px;display:block;';
    wrap.appendChild(img);

  } catch (err) {
    if (err.name === 'AbortError') {
      showRetry('Taking too long.<br>Try again in a moment.');
    } else {
      showRetry('Something went wrong.<br>Try again in a moment.');
    }
  }
}

function closeNewLook(e) {
  if (e && e.target !== document.getElementById('newlookOverlay')) return;
  document.getElementById('newlookOverlay').classList.remove('open');
}

function shareScore() {
  const score = document.getElementById('scoreNum').textContent;
  const label = document.getElementById('scoreLabel').textContent;
  const appUrl = CONFIG.APP_URL;
  const text = `My outfit scored ${score}/10 ✨\n"${label}"\n\n#PoshakAI #OOTD #OutfitCheck #StyleScore #DripCheck`;
  if (navigator.share) {
    navigator.share({ title: 'PoshakbyAI — drip.check', text, url: appUrl });
  } else {
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('shareBtn');
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Share', 2000);
    });
  }
}

function toggleDim(el) {
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.dim-item').forEach(d => d.classList.remove('open'));
  if (!isOpen) el.classList.add('open');
}

let selectedRating = 0;

function selectEmoji(btn, val) {
  document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedRating = val;
}

function toggleChip(chip) {
  chip.classList.toggle('selected');
}

function submitFeedback() {
  document.getElementById('feedbackForm').style.display = 'none';
  document.getElementById('thankyouState').style.display = 'block';
}

// ── Shared image-generation loading UI ──

const FASHION_QUOTES = [
  '"Fashion is the armour to survive the reality of everyday life." — Bill Cunningham',
  '"Style is a way to say who you are without having to speak." — Rachel Zoe',
  '"Fashion is not something that exists in dresses only. It is in the sky, in the street." — Coco Chanel',
  '"Clothes mean nothing until someone lives in them." — Marc Jacobs',
  '"In difficult times, fashion is always outrageous." — Elsa Schiaparelli',
  '"The dress must follow the body of a woman, not the body following the dress." — Hubert de Givenchy',
  '"Elegance is not about being noticed, it\'s about being remembered." — Giorgio Armani',
  '"Fashion is about something that comes from within you." — Ralph Lauren',
  '"Style is knowing who you are, what you want to say, and not giving a damn." — Orson Welles',
  '"A woman who wears no perfume has no future." — Coco Chanel',
];

function startImageLoadingUI(wrap, steps) {
  wrap.innerHTML = `
    <div class="newlook-loading">
      <div class="newlook-shimmer"></div>
      <div class="newlook-step" id="_nlStep">${steps[0]}</div>
      <div class="newlook-quote" id="_nlQuote"></div>
    </div>`;

  let stepIdx = 0, quoteIdx = Math.floor(Math.random() * FASHION_QUOTES.length);
  const stepEl  = wrap.querySelector('#_nlStep');
  const quoteEl = wrap.querySelector('#_nlQuote');

  // Fade in first quote
  quoteEl.style.opacity = '0';
  setTimeout(() => { quoteEl.textContent = FASHION_QUOTES[quoteIdx]; quoteEl.style.opacity = '1'; }, 300);

  const interval = setInterval(() => {
    // Advance step
    if (stepIdx < steps.length - 1) {
      stepIdx++;
      stepEl.style.opacity = '0';
      setTimeout(() => { stepEl.textContent = steps[stepIdx]; stepEl.style.opacity = '1'; }, 400);
    }
    // Rotate quote
    quoteEl.style.opacity = '0';
    quoteIdx = (quoteIdx + 1) % FASHION_QUOTES.length;
    setTimeout(() => { quoteEl.textContent = FASHION_QUOTES[quoteIdx]; quoteEl.style.opacity = '1'; }, 600);
  }, 5000);

  return interval;
}

// ── Accessory try-on ──

const ACCESSORY_RE = /\b(earring|jhumka|jhumki|hoop|stud|clutch|bag|handbag|tote|sling[- ]?bag|belt|buckle|watch|necklace|chain|pendant|choker|bracelet|bangle|scarf|dupatta|stole|sunglasses|shades|brooch|cuff|anklet|hair\s*clip|headband|scrunchie)\b/i;
const accessoryImageCache = {};

function wireAccessoryButtons(tips, shoes_visible, observation) {
  const tipArr = [tips.color_harmony, tips.outfit_cohesion, tips.intentionality, tips.silhouette];
  tipArr.forEach((tipText, i) => {
    if (!tipText) return;
    const match = ACCESSORY_RE.exec(tipText);
    if (!match) return;

    const accessoryLabel = match[0].toLowerCase();
    const tipEl = document.getElementById('tiptext' + i);
    if (!tipEl) return;

    const prev = tipEl.parentNode.querySelector('.tryon-btn');
    if (prev) prev.remove();

    const btn = document.createElement('button');
    btn.className = 'tryon-btn';
    btn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/></svg> See the look`;
    btn.onclick = (e) => {
      e.stopPropagation();
      showAccessoryTryOn(tipText, accessoryLabel, i, observation);
    };
    tipEl.parentNode.appendChild(btn);
  });
}

function showAccessoryTryOn(tipText, accessoryLabel, cacheKey, observation) {
  const overlay = document.getElementById('accessoryOverlay');
  const wrap = document.getElementById('accessoryImgWrap');
  document.getElementById('accessoryOverlayTitle').textContent = 'How it could look with ' + accessoryLabel;
  overlay.classList.add('open');

  if (accessoryImageCache[cacheKey]) {
    wrap.innerHTML = '';
    const img = document.createElement('img');
    img.src = accessoryImageCache[cacheKey];
    img.style.cssText = 'width:100%;border-radius:16px;display:block;';
    wrap.appendChild(img);
    return;
  }

  generateAccessoryImage(wrap, tipText, accessoryLabel, observation, cacheKey);
}

async function generateAccessoryImage(wrap, tipText, accessoryLabel, observation, cacheKey) {
  const loadInterval = startImageLoadingUI(wrap, [
    'Studying your photo...',
    'Placing the ' + accessoryLabel + '...',
    'Blending it in...',
    'Almost there...',
    'Still rendering — this one\'s worth the wait...',
  ]);

  function showRetry(msg) {
    clearInterval(loadInterval);
    wrap.innerHTML = `
      <div style="padding:2rem;text-align:center;">
        <div style="font-size:13px;color:#8C8579;line-height:1.6;margin-bottom:1rem;">${msg}</div>
        <button onclick="location.reload();" style="padding:8px 20px;border-radius:8px;background:#D85A30;color:#fff;border:none;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;">Refresh to try again</button>
      </div>`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // gpt-image-1 can take up to ~90s

    const res = await fetch(CONFIG.WORKER_URL + CONFIG.ENDPOINTS.ACCESSORY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: currentImageBase64, accessoryLabel }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showRetry(`Preview failed (${res.status}).<br>${typeof err.error === 'string' ? err.error : 'Try again in a moment.'}`);
      return;
    }

    clearInterval(loadInterval);
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    accessoryImageCache[cacheKey] = objUrl;

    wrap.innerHTML = '';
    const img = document.createElement('img');
    img.src = objUrl;
    img.style.cssText = 'width:100%;border-radius:16px;display:block;';
    wrap.appendChild(img);

  } catch (err) {
    if (err.name === 'AbortError') {
      showRetry('Taking too long.<br>Refresh and try again.');
    } else {
      showRetry('Something went wrong.<br>Refresh and try again.');
    }
  }
}

function closeAccessoryOverlay(e) {
  if (e && e.target !== document.getElementById('accessoryOverlay')) return;
  document.getElementById('accessoryOverlay').classList.remove('open');
}


