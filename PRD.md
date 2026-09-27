# DAYLY — PRD (Lesson 6 Assessment Version)

**DAYLY — Make Today Count.**
**Your AI-powered everyday life companion.**

> Tell DAYLY what you need to do. DAYLY helps you decide what matters, plan your day, and get it done.

**Source of truth:** `docs/PRODUCT REQUIREMENTS DOCUMENT (PRD).md` (v1.0) is preserved unchanged and remains the full product definition. This root-level `PRD.md` summarizes that definition and adds the Qubators AI Foundry Lesson 6 implementation plan. Nothing in the existing PRD was deleted or replaced.

---

## 1. Product Overview (preserved)

DAYLY is an AI-powered everyday life companion for busy professionals and entrepreneurs/business owners. It helps users organize responsibilities, determine what matters most, create a realistic daily plan, and stay productive.

Users capture responsibilities by typing, speaking, or manually adding tasks. DAYLY then understands, prioritizes, plans, reminds, adapts, and reviews.

**Core experience:** Capture → Understand → Prioritize → Plan → Remind → Adapt → Review

**Product category:** Everyday Productivity / Personal Organization

## 2. Problem (preserved)

Responsibilities are scattered across calendars, notebooks, messaging apps, reminder apps, task managers, and memory. Result: overwhelm, procrastination, missed deadlines, forgotten tasks, poor prioritization, inefficient time use, difficulty maintaining habits and goals.

DAYLY solves this by bringing everyday responsibilities into one simple experience and helping users determine what deserves attention.

## 3. Target Users (preserved)

**A. Busy Professionals** — employees, managers, consultants, freelancers, creatives, remote workers managing demanding careers + personal responsibilities.

**B. Entrepreneurs & Business Owners** — small-business owners, startup founders, freelancers, content creators, consultants, agency owners, online business owners.

**User need:** Not more tools — help deciding what deserves attention and turning intentions into action.

## 4. Core Features (preserved summary)

- AI Daily Planner (heart of DAYLY): personalized daily plan from tasks, deadlines, fixed appointments, importance, urgency, available time, preferences, goals
- Smart Task Management: add / complete / edit / delete / move / postpone; fields: name, deadline, priority, duration, status, category, notes
- AI Prioritization: High / Medium / Low suggestions; principle: AI recommends, user decides
- Smart Scheduling: realistic schedule around working hours, durations, breaks, deadlines
- Flexible Rescheduling: adapts when plans change
- Smart Reminders: useful, not annoying
- Morning Check-In, Focus Mode, Progress Tracking, Goals, Habit Tracking, Evening Review, Conversational AI Assistant, Main Dashboard

Full details: see `docs/PRODUCT REQUIREMENTS DOCUMENT (PRD).md` Sections 8–21.

## 5. MVP (preserved)

Prove: *Can DAYLY take responsibilities and turn them into a useful, personalized daily plan that helps the user get things done?*

MVP scope: task capture (type/voice/manual), AI understanding, AI prioritization, AI daily planning, task management, smart reminders, rescheduling, basic goals, basic habits, morning check-in, evening review, simple progress dashboard.

## 6. Product Vision (preserved)

Become the personal command center for everyday life. Answer daily: What do I need to do? What matters most? When should I do it? How am I progressing?

Mission: help busy people organize responsibilities, focus on what matters, and make consistent progress every day. Personality: smart, supportive, encouraging, non-judgmental — helps users recover, never guilts.

---

## 7. Lesson 6 Implementation Roadmap (ordered, with concrete outputs)

### Phase 1 — Initial Local Prototype
**Output:** working local DAYLY application page using mock data.
- Files: `index.html` (working prototype), `design.html` (visual preview), `PRD.md` (this plan)
- Runs by opening the file directly in a browser; no build step, no server, no external APIs
- **Status: IMPLEMENTED NOW**

### Phase 2 — Full-Stack Features and Data
**Output:** core DAYLY features, data persistence, authentication, and file storage integration planned for later implementation.
- Real database selection and integration, real authentication, file storage, hosted backend/frontend, calendar integration, weekly planning, productivity insights
- **Status: PLANNED FOR LATER — not implemented in this prototype**

### Phase 3 — Testing and Refinement
**Output:** user-flow testing, refinement, validation, and preparation for future deployment.
- Usability testing of Capture → Plan → Adapt → Review loop, task completion / reschedule / retention metrics, hardening before any deployment
- **Status: PLANNED FOR LATER — not implemented in this prototype**

**What is implemented now vs. planned for later:**
- NOW: local static prototype with mock/test data only (`index.html`, `design.html`, docs)
- LATER: full-stack persistence, auth, storage, deployment, advanced AI planning

---

## 8. Technology Choices (Lesson 6)

- **Framework:** HTML, CSS, and vanilla JavaScript for the initial local prototype.
- **Database:** a local/mock data approach for the current prototype; a real database will be selected and integrated in a later full-stack phase.
- **Authentication:** no real authentication in the current prototype; authentication will be added in a later full-stack phase.
- **File storage:** no external file storage in the current prototype; file storage will be considered during the full-stack phase.
- **File-storage note:** same as above — no external file-storage service is used now.

Application and database run locally for now.

No real login, no real database, no payment, no external APIs, no private credentials, no production deployment in this prototype.

---

## 9. Agent Steering & Tool Decisions

I chose to use HTML, CSS, and vanilla JavaScript for the initial prototype instead of introducing a heavier frontend framework at this stage. The reason is that the Lesson 6 assessment requires only a single local working page, so a lightweight approach allows me to validate the DAYLY user experience quickly before adding full-stack complexity.

OpenCode was used as the AI coding assistant and I reviewed and directed its implementation rather than blindly accepting generated output.

Tool-choice decision: lightweight static prototype (HTML/CSS/vanilla JS, mock data in the page) was chosen over a full-stack framework + hosted database + auth provider because the assessment only requires an initial local prototype page. This keeps the prototype runnable by opening a file, avoids secrets/credentials, and preserves the option to add full-stack complexity in Phase 2.

---

## 10. Design Refinement & Agent Steering

After reviewing the initial design direction, I instructed the AI agent to improve visual clarity by increasing text contrast, strengthening the primary button styling, and using clearer typography and spacing so that important actions and information are easier to identify.

Applied in `design.html` and `index.html`: high-contrast body text (#0F172A on #FFFFFF / #F8FAFC), strengthened primary button (solid #4F46E5 background, white bold text, clear hover/focus states, minimum 44px target), clear type scale and generous spacing, priority badges with accessible contrast, visible focus outlines, responsive layout.

---

## 11. Mock Data & Safety Note

This prototype uses mock/test data only (e.g., sample proposal, client calls, meeting, groceries, exercise). No secrets, API keys, passwords, access tokens, or private credentials are included or required.
