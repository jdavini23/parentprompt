**Product Requirements Document (PRD) — ParentPrompt**

---

**Product Name:** ParentPrompt
**Part of:** Dad's First Step Portfolio
**Owner:** Joe (Founder, Dad's First Step)
**Type:** Web App (mobile-first design)

---

### 1. Problem Statement

First-time and new dads often want to be more involved but don’t always know what to do. They need simple, actionable guidance that fits into their busy lives and builds confidence in their parenting role.

---

### 2. Goal

Create a lightweight, engaging tool that delivers personalized micro-prompts daily to help dads bond with their children, build routines, and feel empowered as active parents.

---

### 3. Target Audience

- New dads (0–3 years old children)
- Especially tech-savvy or digital-first dads
- Readers of Dad’s First Step newsletter

---

### 4. Key Features (MVP)

#### 1. **Onboarding & Personalization**

- Basic sign-up/login (Clerk or Supabase Auth)
- Capture:

  - Child’s age
  - Interests (e.g., music, sports, reading)
  - Preferred time of day for prompt

#### 2. **Daily Prompt Engine**

- AI-generated or pre-written age-appropriate bonding ideas
- Prompt types:

  - Activities ("Build a pillow fort together")
  - Conversation starters
  - Parenting mindset shifts

- Optional delivery methods:

  - Web push
  - Email (Resend or Buttondown)
  - SMS (optional later)

#### 3. **Prompt Interaction & History**

- Mark prompts as complete
- Save favorites
- View past prompts (timeline/calendar format)

#### 4. **Bonus Tool: AI Story Generator (Premium Feature)**

- Simple form: name, age, interests
- Generate bedtime story in real-time using GPT-4 Turbo

---

### 5. Future Enhancements (Post-MVP)

- Prompt streaks, gamification, badges
- Journal responses to daily prompts
- Partner tips (involve the other parent)
- Voice assistant integration ("Hey ParentPrompt...")

---

### 6. Monetization

- Freemium:

  - Free: 1 daily prompt, limited history
  - Premium: Custom prompts, AI story generator, advanced filters

- Affiliate:

  - Recommended parenting books, toys, or gear

---

### 7. Tech Stack (Recommended)

- **Frontend:** Next.js + TailwindCSS
- **Backend:** Supabase (auth + storage + DB)
- **AI:** OpenAI GPT-4 Turbo
- **Email:** Resend or Buttondown
- **Optional:** Clerk for auth if not using Supabase

---

### 8. Launch Roadmap

#### **Phase 1 — Week 1–2: Discovery & Setup**

- Finalize PRD & branding
- Design wireframes (mobile-first)
- Set up project repo + Supabase instance

#### **Phase 2 — Week 3–4: Core MVP Build**

- Onboarding flow
- Prompt engine backend (basic prompt bank or AI-generated)
- Daily prompt UI + history screen
- Basic email integration

#### **Phase 3 — Week 5: Testing & Iteration**

- Internal testing (manual QA + edge cases)
- Invite beta users (Dad’s First Step subscribers)
- Feedback loop + polish UI

#### **Phase 4 — Week 6: Soft Launch**

- Public MVP launch via Twitter, DFS newsletter
- Collect early testimonials + analytics

#### **Phase 5 — Week 7–8: Premium Features & Marketing**

- Build out AI Story Generator tool
- Add freemium/paywall logic
- Run mini launch on Product Hunt or Indie Hackers

---
