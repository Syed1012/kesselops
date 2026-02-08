# Backstage Shift Assistant — Feature Analysis & KANO Model

> **Context:** Hackathon Stuttgart 2026 · "Code. Cocktails. Repeat."
> **Mission:** Digitize gastronomy & tourism in Stuttgart & surrounding area
> **Goal:** WIN 1st place (€500) with a demo-ready MVP in 3 days

---

## 1. Sponsor Landscape — Who Wants What

| # | Sponsor | Type | Core Pain Points | What They Want From Us |
|---|---------|------|------------------|----------------------|
| 1 | **visito** (Organizer) | SaaS Platform | Modular gastro tools | Shift planning, digital inventory, HACCP, social media AI, AI POS |
| 2 | **OSCHO** | Café/Bar/Event | Daily operational chaos, WhatsApp communication, onboarding | Digital checklists, onboarding tools, smart shift planning, team communication, digital HACCP |
| 3 | **Ludwig Heer** (Alte Post / GreenBill) | Restaurateur & Jury | POS data management, **guest evaluation**, digital contracts, inventory, social media→Google reviews | Centralized POS menu data, **gastronomer rates guests** (reverse rating), growing contracts, inventory, social→review bridge |
| 4 | **UNIBEV** | Beverage Supplier | Manual orders, opaque delivery, no real-time stock visibility, late/early reorders | Smart ordering, real-time consumption tracking, supplier integration, shift plan digitization |
| 5 | **meincocktailfass** | Pre-mixed cocktail kegs | Time-intensive cocktail prep, quality variance, no digital ordering/planning | Digital reorder, consumption tracking, quality standardization |
| 6 | **DEHOGA** | Industry Association & Jury | Fachkräftemangel, manual planning, over/understaffing, food waste, missing digital interfaces, no affordable tools | Scalable staff planning, waste reduction, sustainability tools, affordable digital tools |
| 7 | **Geheimtipp Stuttgart** | City Magazine | Hidden spots undiscoverable, Stuttgart underrated, fragmented trip planning | Digital storytelling, venue-community networking, discovery tools |
| 8 | **VIBZ** | Powerbank Rental | Low visibility of stations, no smart city integration | Location-based services (peripheral) |
| 9 | **Mellow Rush** | Botanical Boosters (Alcohol-free) | Alcohol is default, alternatives boring, no ritual | Menu integration for NA drinks (peripheral) |
| 10 | **Staatssekretär Dr. Rapp** | Government | Cultural tourism underdeveloped | AI city tours, AR (peripheral) |

---

## 2. Gap Analysis — What Our Domain Model Now Covers

> **Status after Domain Model v3:** All 🔴 gaps from v1 have been resolved. See [`domain-model.md`](./domain-model.md).

| Area | Hackathon Requires | Domain Model v3 Has | **Status** |
|------|-------------------|---------------------|------------|
| Digital Checklists | ✅ OSCHO, visito, DEHOGA | ✅ `Checklist` + `TaskItem` + `PhotoProof` + `ChecklistCategory` (HACCP) | ✅ Covered |
| Shift Planning | ✅ OSCHO, UNIBEV, DEHOGA | ✅ `Shift` + `ShiftAssignment` + `AssignmentStatus` | ✅ Covered |
| Inventory / Stock | ✅ UNIBEV, meincocktailfass, DEHOGA | ✅ `Product` + `StockLog` + `Supplier` + `PredictiveEngine` | ✅ Covered |
| Auto-ordering / Supplier Integration | ✅ UNIBEV, meincocktailfass | ✅ `Order` + `OrderItem` + `SupplierProduct` + `PredictiveEngine.suggestOrder()` | ✅ Covered |
| Social Media AI | ✅ visito, Ludwig Heer | ✅ `SocialPost` + `AIContentGenerator` + `Media` | ✅ Covered |
| HACCP / Hygiene | ✅ OSCHO, visito | ✅ `ChecklistCategory.HACCP` + `PhotoProof` (timestamped evidence) | ✅ Covered |
| **Staff Onboarding** | ✅ OSCHO, DEHOGA (Fachkräftemangel) | ✅ `TrainingModule` + `StaffProgress` + `ProgressStatus` + `TrainingType` (6 types incl. ONBOARDING) | ✅ Covered |
| **Digital Menu (User Appealing)** | ✅ Ludwig Heer (POS/menu), Our own slide | ✅ `MenuItem` + `MenuCategory` (8 types) + `MenuSyndication` — Domain C (Digital Menu) | ✅ Covered |
| **Recipe / Ingredient Linking** | ✅ meincocktailfass, consumption accuracy | ✅ `Recipe` + `RecipeIngredient` → `Product` (auto-depletion chain) | ✅ Covered |
| **Guest Evaluation / No-Show** | ✅ Ludwig Heer (explicit sponsor topic) | ✅ `GuestEvaluation` (reverse rating: behavior + punctuality + overall) + `GuestProfile.noShowCount` + `guestScore` | ✅ Covered |
| **Reservation System** | ✅ Implied by guest evaluation + no-show | ✅ `Reservation` + `ReservationStatus` (6 states incl. NO_SHOW, SEATED, COMPLETED) | ✅ Covered |
| **AI Prompt Templates** | ✅ Multiple AI features need configurable prompts | ✅ `PromptTemplate` + `PromptCategory` (5 types) + `AIUsageLog` — Domain F (AI Configuration) | ✅ Covered |
| **Shift Handover Notes** | ✅ OSCHO (replace WhatsApp) | ✅ `ShiftHandover` (dedicated entity: summary, openIssues, nextSteps, acknowledge()) | ✅ Covered |
| **Team Communication** | ✅ OSCHO (replace WhatsApp chaos) | ✅ `ShiftHandover` + structured `Checklist` workflow replaces unstructured chat | ✅ Covered |
| **Google Review Bridge** | ✅ Ludwig Heer (social→Google) | ✅ `ReviewResponse` + `ReviewResponseStatus` (GENERATED→APPROVED→PUBLISHED) + AI generation | ✅ Covered |
| **Waste Tracking** | ✅ DEHOGA (Nachhaltigkeit) | ✅ `StockLogType.WASTE` + `StockLog.shiftId` enables per-shift waste analytics | ✅ Covered |
| **Weather-based Prediction** | ✅ DEHOGA (unplanbare Gästezahlen) | ✅ `WeatherForecast` + `PredictiveEngine.predictStock()` + `.suggestStaffing()` | ✅ Covered |
| **Sales Transactions** | ✅ Revenue tracking, COGS, analytics | ✅ `GuestCheck` + `GuestCheckItem` + `GuestCheckStatus` + `PaymentMethod` (v3) | ✅ Covered |

> **Result: 18/18 areas covered. 0 gaps remaining.** Domain model is hackathon-complete.

---

## 3. KANO Model Classification

### 🔴 MUST-HAVE (基本品質 — Basic Quality)
> *If missing, the jury will reject us. These solve explicit sponsor requirements.*

| # | Feature | Sponsors Demanding It | Rationale |
|---|---------|----------------------|-----------|
| M1 | **Digital Shift Checklists** (Open/Close/Handover/Emergency) | OSCHO, visito, DEHOGA | Core problem statement. Every sponsor mentions it. |
| M2 | **Shift Planning & Assignment** (with drag-drop UI) | OSCHO, UNIBEV, DEHOGA | "Schichtpläne sind nicht wirklich gut digitalisiert" — Sidney Blum |
| M3 | **HACCP Digital Hygiene Checks** (timestamped + photo proof) | OSCHO, visito | Regulatory compliance. Already in our slides. |
| M4 | **Basic Consumption/Inventory Tracking** | UNIBEV, meincocktailfass, DEHOGA | "Echtzeit-Überblick über Verfügbarkeit und Verbrauch" |
| M5 | **Mobile-First Responsive UI** | All sponsors | "schnell, visuell, mobil" — core UX requirement |
| M6 | **Shift Handover Notes** (structured, replaces WhatsApp) | OSCHO | "Kommunikation im Team ohne WhatsApp-Chaos" |

### 🟢 PERFORMANCE (一元品質 — One-Dimensional)
> *The more/better we do these, the higher we score. Linear satisfaction.*

| # | Feature | Sponsors Benefiting | Rationale |
|---|---------|--------------------|-----------|
| P1 | **AI-Powered Staff Onboarding** (role-specific paths, micro-guides) | OSCHO, DEHOGA | "Fachkräftemangel" is THE industry crisis. Our slide promises it. |
| P2 | **Smart Beverage Reorder Suggestions** (predictive, weather-aware) | UNIBEV, meincocktailfass | "Nachbestellungen passieren häufig zu spät oder zu früh" |
| P3 | **Digital Menu with Recipes** (MenuItem → Recipe → Products) | Ludwig Heer, meincocktailfass | "AI powered Digital menu – user appealing" from our own deck |
| P4 | **Guest Profile & Reservation with No-Show Tracking** | Ludwig Heer (Jury!) | His EXPLICIT topic: "Gäste Bewertung" — gastronomer rates guests |
| P5 | **Supplier Integration API** (UNIBEV, meincocktailfass ready) | UNIBEV, meincocktailfass | "Partner integration: Ready for UNIBEV, meincocktailfass" |
| P6 | **Social Media AI Post Generator** (from shift data, photos) | visito, Ludwig Heer | "Social Media Feedback zu Google Bewertungen" |
| P7 | **Waste Reduction Dashboard** (sustainability metrics) | DEHOGA | "Nachhaltigkeit scheitert im Alltag" |

### 💡 DELIGHTERS (魅力品質 — Attractive/WOW)
> *Not expected, but if present → massive jury impact. Differentiators to WIN.*

| # | Feature | Why It's a Delighter | Jury Impact |
|---|---------|---------------------|-------------|
| D1 | **AI Prompt Templates** (configurable AI personalities per venue) | Nobody expects a configurable AI brain. Shows deep architecture. | 🏆 Technical sophistication |
| D2 | **Predictive Staffing** (weather + event data → auto staff suggestions) | Goes beyond scheduling into intelligence | 🏆 DEHOGA + OSCHO wow factor |
| D3 | **Guest Scoring System** (reverse Yelp — restaurant rates guests) | Ludwig Heer will LOVE this. Nobody else will build it. | 🏆 Direct jury member delight |
| D4 | **Cross-Venue Analytics** (benchmarking across Stuttgart venues) | Scalability story for pitch: "Deploy across Stuttgart" | 🏆 Vision & scale |
| D5 | **Live Consumption Dashboard** (real-time keg/bottle levels) | Visual WOW in demo | 🏆 Demo impact |
| D6 | **Google Review Response Generator** (AI drafts responses to reviews) | Ludwig Heer mentioned "Social Media Feedback zu Google Bewertungen" | 🏆 Connects social→reviews |
| D7 | **Multi-venue Menu Syndication** (central menu → speisekarte.de, etc.) | Ludwig Heer: "Weitergabe an Drittanbieter (speisekarte.de,...)" | 🏆 Directly addresses jury topic |

### ⚪ INDIFFERENT (無関心品質)
> *Nice on paper, won't move the needle for judges.*

| # | Feature | Why Indifferent |
|---|---------|----------------|
| I1 | Dark mode / theme customization | UX polish, not functional value |
| I2 | Multi-language UI | Stuttgart-focused hackathon, German is fine |
| I3 | PDF export for checklists | Paper backup for digital tool is ironic |
| I4 | Calendar sync (Google/Outlook) | Integration nice-to-have, not demo-worthy |

### 🚫 REVERSE (逆品質 — Avoid)
> *Building these would actively hurt our positioning.*

| # | Feature | Why It Hurts |
|---|---------|-------------|
| R1 | Full POS/Cash Register | Competes with visito (organizer!) — do NOT build |
| R2 | Tourist city guide / AR tours | Dr. Rapp's topic but off our domain — dilutes focus |
| R3 | Powerbank finder integration | VIBZ topic, irrelevant to our operations tool |
| R4 | Full employee contract management | Ludwig Heer mentioned it but too complex for MVP |

---

## 4. Strategic MVP Scope (3-Day Hackathon)

### Day 1 — Foundation (Must-Haves)
- [ ] User auth + role system (Manager/Staff)
- [ ] Shift CRUD + Assignment
- [ ] Checklist templates (Opening/Closing/HACCP)
- [ ] TaskItem with status + photo proof
- [ ] Shift handover notes

### Day 2 — Differentiators (Performance + 1 Delighter)
- [ ] AI onboarding flow generation (P1)
- [ ] Digital menu + recipe → inventory depletion (P3)
- [ ] Basic consumption tracking with reorder hints (P4)
- [ ] Guest profile + reservation + no-show flag (P4)
- [ ] Social media AI post generation (P6)

### Day 3 — Polish + Demo Wow (Delighters)
- [ ] AI Prompt Templates (D1) — show configurable AI
- [ ] Guest scoring system (D3) — delight Ludwig Heer
- [ ] Live consumption dashboard (D5) — visual demo impact
- [ ] Pitch preparation + demo flow

---

## 5. Jury Alignment Matrix

| Jury Member | Role | What Impresses Them | Our Feature |
|---|---|---|---|
| **Ludwig Heer** | Gastronom, GreenBill founder | Guest evaluation, menu management, inventory, Google reviews | P3 (Menu), P4 (Guest), D3 (Scoring), D6 (Review AI) |
| **Sidney Blum** | UNIBEV / Schankstelle | Digital shift plans, beverage ordering | M2 (Shifts), M4 (Inventory), P2 (Reorder), P5 (Supplier API) |
| **Armen Shalalu** | visito CEO (Organizer) | Modular SaaS, AI integration, scalability | D1 (Prompts), D4 (Multi-venue), P6 (Social AI) |
| **Tobias Dürr** | OSCHO owner | Daily operations relief | M1 (Checklists), M6 (Handover), P1 (Onboarding) |
| **Jan Ammersbach** | Jury | Tech quality, innovation | D1 (Architecture), D2 (Predictive) |
| **Atila Dilber** | Jury | Practical impact | M1-M6 (All must-haves working) |
| **Phillip Gschwind** | Jury | Pitch quality, business viability | D4 (Scale story), clear demo |

---

## 6. Competitive Moat — Why We Win

1. **We address 6/10 sponsors directly** (OSCHO, DEHOGA, UNIBEV, meincocktailfass, Ludwig Heer, visito)
2. **We build the ONLY full back-of-house→front-of-house bridge** (operations + menu + guest + marketing)
3. **Guest Evaluation is our secret weapon** — Ludwig Heer is on the jury and nobody else will build it
4. **AI is integrated across 4 domains** (onboarding, menu, social, predictions) — not just a chatbot wrapper
5. **Supplier-ready architecture** — UNIBEV/meincocktailfass can see themselves in our product
6. **Recipe→Inventory depletion** — shows deep domain understanding beyond basic CRUD

---

*This analysis feeds directly into the updated `domain-model.md` with 6 bounded contexts.*
