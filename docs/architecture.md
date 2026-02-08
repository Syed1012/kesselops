# KesselOps — Architecture & Domain Model

> **Hackathon Stuttgart 2026** · "Code. Cocktails. Repeat."
> _The brain behind every shift._
>
> Source of truth: [`system-design.md`](./system-design.md)

---

## 1. Bounded Context Map

Five clean domains. One modular monolith. One JAR to deploy.

```mermaid
graph LR
    OPS["🔧 <b>Operations</b><br/>Shifts · Checklists<br/>Handovers · Training"]
    INV["📦 <b>Inventory</b><br/>Products · Suppliers<br/>Orders · Predictions"]
    MENU["🍹 <b>Menu</b><br/>Items · Recipes<br/>Syndication"]
    GUEST["👥 <b>Guest</b><br/>Reservations · Checks<br/>Payments"]
    AI["🤖 <b>AI</b><br/>Prompts · Generation<br/>Usage Logging"]

    OPS -- "shift context" --> GUEST
    GUEST -- "sale triggers" --> MENU
    MENU -- "recipe depletes" --> INV
    OPS -- "shift data" --> INV
    AI -. "generates content" .-> OPS
    AI -. "describes items" .-> MENU
    AI -. "predicts demand" .-> INV
```

---

## 2. Simplified Domain Model

> Inspired by DDD — shows **aggregate roots**, **entities**, and key cross-domain links.
> Readable in 30 seconds. Stereotypes mark each entity's role in the domain.

```mermaid
classDiagram
    direction TB

    class Venue {
        <<aggregate root>>
    }
    class User {
        <<entity>>
    }
    class Shift {
        <<aggregate root>>
    }
    class Checklist {
        <<entity>>
    }
    class TaskItem {
        <<entity>>
    }
    class PhotoProof {
        <<value object>>
    }
    class ShiftHandover {
        <<entity>>
    }
    class TrainingModule {
        <<entity>>
    }

    class Product {
        <<aggregate root>>
    }
    class Supplier {
        <<aggregate root>>
    }
    class StockLog {
        <<event>>
    }
    class Order {
        <<entity>>
    }
    class OrderItem {
        <<value object>>
    }

    class MenuItem {
        <<aggregate root>>
    }
    class Recipe {
        <<entity>>
    }
    class RecipeIngredient {
        <<value object>>
    }
    class MenuSyndication {
        <<entity>>
    }

    class Reservation {
        <<entity>>
    }
    class GuestCheck {
        <<aggregate root>>
    }
    class GuestCheckItem {
        <<value object>>
    }

    class PromptTemplate {
        <<aggregate root>>
    }
    class AIUsageLog {
        <<event>>
    }

    %% ── Domain A: Operations ──
    Venue "1" *-- "*" User : employs
    Venue "1" *-- "*" Shift : schedules
    Shift "1" *-- "*" Checklist : requires
    Checklist "1" *-- "1..*" TaskItem : contains
    TaskItem "1" o-- "0..1" PhotoProof : evidence
    Shift "1" o-- "0..1" ShiftHandover : handover

    %% ── Domain B: Inventory ──
    Supplier "1" --> "*" Product : supplies
    Product "1" --> "*" StockLog : tracked by
    Order "1" *-- "1..*" OrderItem : contains
    OrderItem --> Product : purchases

    %% ── Domain C: Menu ──
    MenuItem "1" *-- "0..1" Recipe : prepared via
    Recipe "1" *-- "1..*" RecipeIngredient : composed of
    MenuItem "1" --> "*" MenuSyndication : published to

    %% ── Domain D: Guest ──
    GuestCheck "1" *-- "1..*" GuestCheckItem : contains

    %% ═══ CROSS-DOMAIN LINKS ═══
    RecipeIngredient --> Product : depletes
    GuestCheckItem --> MenuItem : sells
    GuestCheck --> Shift : revenue per
    MenuItem --> Venue : listed at
    Reservation --> Venue : booked at
    PromptTemplate --> Venue : configured for
    StockLog --> Shift : during
    TrainingModule ..> PromptTemplate : AI-generated
```

---

## 3. Core Data Flow — Sale → Depletion → Reorder

> This is the **killer feature**: selling a cocktail automatically depletes inventory
> and triggers smart reordering. No manual stock counting.

```mermaid
flowchart TB
    subgraph SALE["💰 MONEY IN — Guest Domain"]
        A["Staff opens <b>GuestCheck</b><br/>(table 5, Shift #12)"]
        B["<b>GuestCheckItem</b> created<br/>2× Gin & Tonic @ €9.50"]
        C["<b>GuestCheck.close(CARD)</b><br/>total: €23.89"]
        A --> B --> C
    end

    subgraph DEPLETE["📦 AUTO-DEPLETION — Menu + Inventory"]
        D["Lookup <b>MenuItem</b> → <b>Recipe</b>"]
        E["<b>RecipeIngredient[]</b>"]
        F1["Gin → consume 0.1L"]
        F2["Tonic → consume 0.4L"]
        F3["Lime → consume 2 wedges"]
        D --> E
        E --> F1
        E --> F2
        E --> F3
    end

    subgraph REORDER["🔄 SMART REORDER — Inventory"]
        G{"Product.isLowStock()?"}
        H["Auto-generate <b>Order</b><br/>→ UNIBEV supplier"]
        I["✅ Stock OK"]
        G -->|Yes| H
        G -->|No| I
    end

    C --> D
    F1 & F2 & F3 --> G

    style SALE fill:#d4edda,stroke:#28a745
    style DEPLETE fill:#fff3cd,stroke:#ffc107
    style REORDER fill:#cce5ff,stroke:#007bff
```

---

## 4. Domain Boundaries — Package Mapping

| Domain | Package | Entities | Key Responsibility |
|--------|---------|----------|--------------------|
| **A. Operations** | `com.kesselops.operations` | Venue, User, Shift, Checklist, TaskItem, PhotoProof, ShiftHandover, TrainingModule | Staff, shifts, checklists, HACCP, handovers, onboarding |
| **B. Inventory** | `com.kesselops.inventory` | Product, Supplier, StockLog, Order, OrderItem | Stock tracking, suppliers, orders, predictions |
| **C. Menu** | `com.kesselops.menu` | MenuItem, Recipe, RecipeIngredient, MenuSyndication | Digital menu, recipes, third-party syndication |
| **D. Guest** | `com.kesselops.guest` | Reservation, GuestCheck, GuestCheckItem | Reservations, sales transactions, payments |
| **E. AI** | `com.kesselops.ai` | PromptTemplate, AIUsageLog | Configurable AI brain, prompt management, usage audit |

---

## 5. Relationship Legend

| Notation | Meaning | Example |
|----------|---------|---------|
| `*--` | **Composition** (lifecycle-bound) | Shift *contains* Checklists — delete shift → delete checklists |
| `o--` | **Aggregation** (independent lifecycle) | TaskItem *may have* PhotoProof — photo can exist alone |
| `-->` | **Association** (references) | GuestCheckItem *sells* MenuItem |
| `..>` | **Dependency** (uses/calls) | TrainingModule *AI-generated via* PromptTemplate |

---

## 6. AI Integration Points

> AI is not a bolt-on chatbot — it's woven across 4 domains.

```mermaid
graph TB
    AI_ENGINE["🤖 <b>AIOrchestrationService</b><br/>POST /api/ai/generate"]

    PT["PromptTemplate<br/>(per venue, per category)"]
    LOG["AIUsageLog<br/>(tokens, cost, acceptance)"]

    AI_ENGINE --> PT
    AI_ENGINE --> LOG

    AI_ENGINE -->|ONBOARDING_GUIDE| TRAIN["TrainingModule<br/><i>Operations</i>"]
    AI_ENGINE -->|MENU_DESCRIPTION| MENU_DESC["MenuItem.description<br/><i>Menu</i>"]
    AI_ENGINE -->|SHIFT_SUMMARY| SUMMARY["ShiftHandover.summary<br/><i>Operations</i>"]
    AI_ENGINE -->|SOCIAL_POST| SOCIAL["Social content<br/><i>AI-generated</i>"]
    AI_ENGINE -->|REVIEW_RESPONSE| REVIEW["Review replies<br/><i>AI-generated</i>"]

    CLAUDE["Anthropic Claude"] -.-> AI_ENGINE
    GPT["OpenAI GPT-4o"] -.-> AI_ENGINE

    style AI_ENGINE fill:#e8daef,stroke:#8e44ad
```

---

## 7. Role-Based Access Summary

```mermaid
graph LR
    subgraph Roles
        OWNER["👑 Owner"]
        MGR["📋 Manager"]
        STAFF["👤 Staff"]
        TRAINEE["🎓 Trainee"]
    end

    OWNER -->|full access| ALL["All operations"]
    MGR -->|venue-scoped| SHIFTS["Shifts · Inventory · Menu · Guests · Analytics"]
    STAFF -->|shift-scoped| TASKS["Checklists · Guest Checks · Handovers"]
    TRAINEE -->|read + learn| TRAINING["Training Modules · Checklists"]
```

---

_5 domains · 22 entities · 1 modular monolith · 3 days to ship._
