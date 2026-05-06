# Product Requirements Document (PRD)
## PoshakbyAI — AI-Powered Personal Stylist
**Version:** 1.0  
**Date:** May 2026  
**Status:** Active  

---

## 1. Product Vision

> Help people look great every day using clothes they already own — by turning their wardrobe into a personal stylist that learns, recommends, and improves over time.

**North Star Metric:** Number of outfit recommendations acted on per week (wardrobe engagement)  
**Proxy metric (Phase 1):** Number of outfits scored per DAU

---

## 2. User Personas

### Persona 1 — Priya, 23, Delhi
**Who:** Final-year student, active on Instagram, posts OOTDs
**Pain:** Buys a lot but always feels like she has nothing to wear
**Behaviour:** Discovers via "Rate My Fit" challenge from influencer she follows
**Motivation:** Validation + social sharing of her score
**Hook:** Scoring. **Retention driver:** Wardrobe recommendations

### Persona 2 — Ananya, 29, Bangalore
**Who:** Software engineer, buys fashion online but doesn't know how to style it
**Pain:** Owns nice pieces but defaults to same 5 outfits for work
**Behaviour:** Searches "how to style [item]" on YouTube/Pinterest
**Motivation:** Efficiency — wants to look good without thinking hard
**Hook:** Score + actionable suggestions. **Retention driver:** Daily outfit pick

### Persona 3 — Rohan, 26, Mumbai
**Who:** Works in consulting, cares about presentation
**Pain:** Doesn't know if his outfits are work-appropriate or stylish
**Behaviour:** Asks friends for feedback before important meetings
**Motivation:** Confidence, not fashion — wants to know he looks right
**Hook:** Score with clear rationale. **Retention driver:** Occasion-based recommendations

---

## 3. User Journey (Full Vision)

```
Day 1:   Upload outfit photo → Get score in 10 sec → See what to improve
Day 2:   Share score on Instagram → Friends try it
Week 1:  Score 3–4 outfits → Items auto-saved to wardrobe
Week 2:  Get first "try pairing these two" recommendation
Month 1: Daily outfit suggestion from wardrobe → habit formed
Month 3: "You haven't worn your navy blazer in 30 days — here's 3 ways to style it"
```

---

## 4. Product Roadmap

### Phase 1 — Scoring MVP (COMPLETE)
**Timeline:** Done (May 2026)  
**Platform:** Web (poshakbyai.com)

| Feature | Status |
|---|---|
| Upload photo (gallery + camera) | Done |
| AI outfit scoring (0–10) | Done |
| Score breakdown (5 dimensions) | Done |
| Actionable text suggestions | Done |
| Two-person detection | Done |
| Mobile-responsive UI | Done |

**Exit criteria:** 100 users score at least 1 outfit

---

### Phase 2 — Growth & Shareability
**Timeline:** June–July 2026  
**Platform:** Web (optimised for mobile browser)

#### P0 — Must have
| Feature | Description | Effort |
|---|---|---|
| Share score card | One-tap share image: "My outfit scored 7.8/10 — can you beat it?" | M |
| Score history | Last 5 scores stored in localStorage | S |
| Onboarding flow | 3-screen intro: what it does, how it works, try it | S |
| "Save to wardrobe" CTA | After scoring, one tap to save the outfit | S |
| Wardrobe teaser screen | Greyed out "My Wardrobe — coming soon" with waitlist | S |

#### P1 — Should have
| Feature | Description | Effort |
|---|---|---|
| Occasion input | Tell us where you're going → context-aware scoring | M |
| Thumbs up/down on suggestions | Trains future recommendations | S |
| Confetti animation for 8+ score | Delight moment, drives sharing | XS |

**KPIs to unlock Phase 3:**
- 500 registered users
- Day-7 retention > 20%
- >30% of users tap "Save to wardrobe"

---

### Phase 3 — Wardrobe v1 + Recommendations
**Timeline:** August–October 2026  
**Platform:** Web + PWA (installable on home screen)

#### P0 — Must have
| Feature | Description | Effort |
|---|---|---|
| Wardrobe screen | Grid of saved outfit photos | M |
| Item tagging | AI auto-tags: "navy blazer", "white tee", "chinos" | L |
| Basic outfit recommendation | "Based on your wardrobe, try this combo today" | L |
| Photo library integration | iOS/Android photo picker with multi-select | M |
| Daily styling nudge | Push notification (PWA): "Here's today's outfit" | M |

#### P1 — Should have
| Feature | Description | Effort |
|---|---|---|
| Occasion-based recommendation | "You have a meeting — here's 3 work-appropriate looks" | L |
| Weather integration | Pull local weather, adjust recommendations | M |
| Wardrobe gap analysis | "You have 8 tops, 2 bottoms — get bottoms" | M |
| Item wear tracker | "You haven't worn this in 30 days" | M |

**KPIs to unlock Phase 4:**
- 2,000 users with wardrobe items saved
- Avg. wardrobe size > 10 items
- Day-30 retention > 15%

---

### Phase 4 — Monetisation + Native App
**Timeline:** November 2026–March 2027  
**Platform:** iOS + Android app

#### P0 — Must have
| Feature | Description | Effort |
|---|---|---|
| Brand challenge framework | Admin tool to create sponsored scoring themes | L |
| "Complete the look" cards | After recommendation, show shoppable links | M |
| Affiliate link integration | Myntra/Nykaa/Amazon deep links | M |
| Native iOS app | React Native or Flutter | XL |
| Native Android app | Same codebase | XL |

#### P1 — Should have
| Feature | Description | Effort |
|---|---|---|
| Style profile | User's colour palette, body type, preferred style | L |
| Stylist chat | "Ask me anything about your wardrobe" — LLM chat | L |
| B2B dashboard (internal) | Aggregate trend data viewer for brand reports | L |

**KPIs to unlock Phase 5:**
- First brand deal closed (₹25K+)
- 10,000 MAU
- Affiliate revenue > ₹10,000/month

---

### Phase 5 — Scale + B2B Data
**Timeline:** April–December 2027

- 50,000+ users with wardrobe data
- B2B fashion insights reports to brands
- Premium subscription tier (ad-free + priority scoring)
- API for fashion brands to plug in

---

## 5. Feature Sizing (T-Shirt)

| Size | Engineering Days |
|---|---|
| XS | 0.5 |
| S | 1–2 |
| M | 3–5 |
| L | 6–10 |
| XL | 15–25 |

---

## 6. Technical Requirements

### Current Stack
- Frontend: Single-file HTML/CSS/JS (web)
- AI: Groq Llama 4 Scout (vision scoring)
- Proxy: Cloudflare Worker (poshak-proxy)
- Hosting: Static file / local server

### Phase 2 Stack Changes
- Deploy to proper domain (poshakbyai.com)
- localStorage for score history + wardrobe items
- Web Share API for score card sharing
- PWA manifest for home screen install

### Phase 3 Stack Changes
- Backend required: user accounts, wardrobe storage
- Recommended: Supabase (auth + database + storage) — fast to set up, free tier generous
- Image storage: Supabase Storage (or Cloudflare R2)
- Push notifications: Web Push API via Supabase

### Phase 4 Stack Changes
- React Native or Flutter for native apps
- Affiliate link management: simple redirect service
- Analytics: PostHog (open source, self-hostable)

### AI Cost Management
| Action | Model | Est. Cost |
|---|---|---|
| Outfit scoring | Groq Llama 4 Scout | ~₹0.10/score |
| Item tagging | Groq Llama 4 Scout | ~₹0.08/item |
| Recommendation | Rule-based (free) then LLM | ₹0–0.15 |
| Target cost/user/month | All AI combined | <₹2.00 |

---

## 7. Product KPIs by Phase

### Phase 1 (Now — Jul 2026)
| KPI | Target |
|---|---|
| Total users | 500 |
| Outfits scored | 2,000 |
| Avg session time | >2 min |
| Score share rate | >15% |
| Day-1 retention | >35% |

### Phase 2 (Aug–Oct 2026)
| KPI | Target |
|---|---|
| Total users | 5,000 |
| DAU/MAU ratio | >20% |
| % users saving to wardrobe | >30% |
| Day-7 retention | >20% |
| Day-30 retention | >12% |

### Phase 3 (Nov 2026–Jan 2027)
| KPI | Target |
|---|---|
| Total users | 15,000 |
| Wardrobe users (>5 items) | 2,000 |
| Avg wardrobe size | >10 items |
| Daily recommendation open rate | >25% |
| Day-30 retention | >18% |

### Phase 4 (Feb–Jun 2027)
| KPI | Target |
|---|---|
| MAU | 30,000 |
| App store rating | >4.2 |
| Brand deals closed | 3+ |
| Monthly affiliate revenue | ₹25,000+ |
| NPS | >40 |

---

## 8. Out of Scope (for now)

- Social feed / community features
- Live styling video calls
- In-app purchases of clothing
- Body measurement / sizing
- AR try-on
- Non-Indian markets

---

## 9. Open Questions

| Question | Owner | Decision needed by |
|---|---|---|
| Web-first vs. native app for Phase 2? | Founder | Jun 2026 |
| Build backend ourselves or use Supabase? | Engineering | Jul 2026 |
| Do we ask for email at sign-up or go no-auth for Phase 2? | Founder | Jun 2026 |
| What's the first brand to approach for a challenge? | Founder | Aug 2026 |
| Freemium model or fully free until 10K users? | Founder | Sep 2026 |

---

## 10. Launch Checklist (Phase 2)

- [ ] Domain live (poshakbyai.com)
- [ ] Score share card implemented
- [ ] Mobile browser UX tested on iOS Safari + Chrome Android
- [ ] Score history working in localStorage
- [ ] "Save to wardrobe" tap saves item
- [ ] Wardrobe teaser screen with waitlist email capture
- [ ] 10 micro-influencers briefed on Rate My Fit challenge
- [ ] Instagram page live with 3 posts before launch
- [ ] Analytics (PostHog or Mixpanel) tracking key events
- [ ] Privacy policy page live
