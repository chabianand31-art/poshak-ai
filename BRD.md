# Business Requirements Document (BRD)
## PoshakbyAI — AI-Powered Personal Stylist
**Version:** 1.0  
**Date:** May 2026  
**Status:** Active  

---

## 1. Executive Summary

PoshakbyAI is an AI-powered styling assistant that helps users get more value from the clothes they already own. It starts with instant outfit scoring (the hook), builds into a personal wardrobe over time, and eventually delivers daily outfit recommendations tailored to the user's life — occasion, mood, weather.

The business model monetises through brand-sponsored challenges and affiliate commerce in the near term, and B2B fashion insights (wear data) at scale.

---

## 2. Business Problem

**Primary problem:** Most people wear ~20% of their wardrobe 80% of the time — not because they have bad taste, but because they have no system to rediscover and restyle what they own.

**Secondary problem:** Fashion brands have purchase data but no wear data. They don't know what actually gets worn after checkout. That gap is worth money.

**Why existing solutions fail:**
- Wardrobe apps (Whering, Stylebook) require bulk upload upfront — users quit before seeing value
- Styling apps (Stitch Fix) push new purchases — doesn't solve the existing wardrobe problem
- Social scoring (Hot or Not) is entertainment, not utility

---

## 3. Business Objectives

| # | Objective | Target | Timeline |
|---|---|---|---|
| B1 | Reach 1,000 active users (scored at least 1 outfit) | 1,000 users | Aug 2026 |
| B2 | Achieve 15% Day-30 retention | 15% | Sep 2026 |
| B3 | Close first brand-sponsored challenge | ₹25,000 minimum | Sep 2026 |
| B4 | Reach 10,000 active users | 10,000 users | Dec 2026 |
| B5 | Launch wardrobe feature with 500 active wardrobe users | 500 users | Nov 2026 |
| B6 | Generate first affiliate revenue | ₹10,000 | Jan 2027 |
| B7 | Reach 50,000 users — trigger B2B data play | 50,000 users | Jun 2027 |

---

## 4. Market Opportunity

| Segment | Size | Source |
|---|---|---|
| Total Addressable Market | 130M | Indian online fashion shoppers (Bain + RedSeer 2023) |
| Serviceable Addressable Market | 15M | Fashion-active Gen Z women, urban India, smartphone-native |
| Serviceable Obtainable Market (Year 1) | 50,000 | Bangalore + Delhi, micro-influencer seeding |

**Why now:**
- Vision AI (Llama 4, GPT-4V) can now reliably understand clothing — wasn't viable 2 years ago
- India's Gen Z spends 3x more on fashion than millennials did at same age
- OOTD culture on Instagram/Reels normalises sharing your look — behaviour already exists
- Fast fashion guilt is rising — sustainability framing is a tailwind

---

## 5. Revenue Model

### Phase 1: Brand Sponsored Challenges (Month 4+)
- Partner with Indian fashion brands (FabIndia, Levi's, Myntra brands)
- Brands sponsor a themed scoring challenge (e.g., "FabIndia Ethnic Score Week")
- Revenue: ₹25,000–₹1,00,000 per challenge
- Trigger: 500+ active users, measurable engagement

### Phase 2: Affiliate Commerce (Month 6+)
- "Complete this look" cards link to Myntra / Nykaa / Amazon Fashion
- Revenue: 8–12% commission per sale
- Trigger: Wardrobe feature live, recommendation engine active

### Phase 3: B2B Fashion Insights (Month 12+)
- Anonymised aggregate data: what styles/colours get worn most, by age group, city
- Sold as monthly trend reports to fashion brands and retailers
- Revenue: ₹20,000–₹1,00,000 per report
- Trigger: 50,000+ active users with wardrobe data

### Revenue Projections

| Period | Revenue Source | Projected Revenue |
|---|---|---|
| Month 4–6 | 1–2 brand challenges | ₹25K–₹2L |
| Month 7–12 | 4 challenges + affiliate | ₹3L–₹8L |
| Year 2 | Affiliate + B2B reports | ₹15L–₹40L |

---

## 6. Business KPIs

### Acquisition
| KPI | Target (Month 3) | Target (Month 6) | Target (Month 12) |
|---|---|---|---|
| Total registered users | 500 | 5,000 | 50,000 |
| Daily active users (DAU) | 50 | 500 | 5,000 |
| Outfits scored | 1,000 | 15,000 | 1,50,000 |
| Organic/referral share | >40% | >50% | >60% |

### Engagement
| KPI | Target |
|---|---|
| Day-1 retention | >40% |
| Day-7 retention | >25% |
| Day-30 retention | >15% |
| Avg. outfits scored per user/month | >3 |
| % users who save to wardrobe (once wardrobe launches) | >30% |

### Revenue
| KPI | Target |
|---|---|
| First brand deal closed | Month 4 |
| Revenue Month 6 | ₹50,000+ |
| Revenue Month 12 | ₹5,00,000+ |
| Affiliate click-through rate | >8% |

### Product Health
| KPI | Target |
|---|---|
| Avg. time to score (upload → result) | <15 seconds |
| Error/crash rate | <1% |
| User satisfaction (thumbs up on score) | >65% |
| NPS score | >40 |

---

## 7. Stakeholders

| Role | Responsibility |
|---|---|
| Founder (you) | Product, GTM, fundraising |
| Engineering | App development, AI integration |
| Design | UI/UX, brand identity |
| Brand Partners | Sponsored challenges, affiliate deals |
| Early Users | Feedback, referrals, content creation |

---

## 8. Assumptions

1. Groq + Cloudflare Workers remain sufficient for scoring at <10K users
2. Indian micro-influencers (10K–100K followers) will participate in seeding for gifting/rev-share
3. Users will accept AI-generated outfit scores without needing to explain the algorithm
4. Fashion brands will pay for sponsored challenges at 500+ engaged users
5. Photo library integration (iOS/Android) will be technically feasible in Phase 2

---

## 9. Constraints

- **Budget:** Bootstrapped until first brand deal closes
- **Team:** Solo founder until Month 6
- **Platform:** Web MVP first; native mobile app in Phase 2
- **Data privacy:** No user images stored without explicit consent — affects B2B data timeline
- **AI cost:** API costs must stay under ₹2/user/session at current usage levels

---

## 10. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Upload fatigue kills wardrobe adoption | High | High | Value-first: score first, wardrobe builds passively over time |
| AI scoring quality perceived as inaccurate | Medium | High | Calibrate with 50-user beta before launch; add feedback loop |
| Brands won't pay at <1K users | Medium | Medium | Offer first challenge free; charge from second |
| Competitor launches similar product | Medium | Medium | Speed to market; India-first focus |
| Day-30 retention stays below 10% | High | High | Daily nudge mechanism; occasion-based re-engagement |
