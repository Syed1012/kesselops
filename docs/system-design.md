# KesselOps — System Design & Architecture

> **Hackathon Stuttgart 2026** · Feb 9–11 · "Code. Cocktails. Repeat."
> **Project Name:** KesselOps _(Kessel = Stuttgart's valley basin, Ops = Operations)_
> **Tagline:** _The brain behind every shift._
>
> Related docs:
>
> - [`feature-analysis-kano.md`](./feature-analysis-kano.md) — KANO model & sponsor gap analysis (18/18 covered)

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Decision](#2-architecture-decision)
3. [Tech Stack](#3-tech-stack)
4. [Service Decomposition](#4-service-decomposition)
5. [Project Structure & Directory Layout](#5-project-structure--directory-layout)
6. [Infrastructure & DevOps](#6-infrastructure--devops)
7. [Database Design](#7-database-design)
8. [API Design Conventions](#8-api-design-conventions)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Features — Sponsor-Wise Coverage](#10-features--sponsor-wise-coverage)
11. [AI Features — Dedicated Section](#11-ai-features--dedicated-section)
12. [Quick-Start Guide](#12-quick-start-guide)

---

## 1. System Overview

```
┌───────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                    │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│   │  Staff   │  │ Manager  │  │  Owner   │  │ External APIs  │  │
│   │ (Mobile) │  │ (Tablet) │  │(Desktop) │  │(UNIBEV, Google)│  │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬────────┘  │
│        └──────────────┴──────────────┴────────────────┘           │
│                              │ HTTPS                              │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              NEXT.JS FRONTEND (Vercel)                      │  │
│  │    App Router · Server Components · Tailwind · shadcn/ui    │  │
│  │    PWA-enabled · Mobile-first responsive                    │  │
│  └──────────────────────────┬──────────────────────────────────┘  │
│                              │ REST + WebSocket                   │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              API GATEWAY (Spring Cloud Gateway)             │  │
│  │    Rate limiting · JWT validation · Request routing          │  │
│  └───┬───────┬──────┬───────┬───────┬──────┬──────────────────┘  │
│      │       │      │       │       │                           │
│      ▼       ▼      ▼       ▼       ▼                           │
│  ┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐              │
│  │ OPS  ││ INV  ││ MENU ││GUEST ││  AI  │               │
│  │ SVC  ││ SVC  ││ SVC  ││ SVC  ││ SVC  │               │
│  └──┬───┘└──┬───┘└──┬───┘└──┬───┘└──┬───┘               │
│     │       │       │       │       │                     │
│     └───────┴───────┴───┬───┴───────┘                    │
│                         │                                         │
│                         ▼                                         │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                     POSTGRESQL                              │  │
│  │   ops_db · inventory_db · menu_db · guest_db              │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐    │
│  │  Redis Cache  │  │  S3 / Minio  │  │  LLM Provider (API) │    │
│  │  (sessions,   │  │  (photos,    │  │  (Claude / GPT)     │    │
│  │   realtime)   │  │   media)     │  │                     │    │
│  └──────────────┘  └──────────────┘  └──────────────────────┘    │
└───────────────────────────────────────────────────────────────────┘
```

---

## 2. Architecture Decision

### Why Modular Monolith (NOT Microservices) for Hackathon

| Factor                 | Microservices        | **Modular Monolith** ✅     |
| ---------------------- | -------------------- | --------------------------- |
| Setup time             | 2+ hours per service | 30 min total                |
| Inter-service comms    | HTTP/gRPC overhead   | Direct method calls         |
| Transaction management | Distributed (saga)   | Simple `@Transactional`     |
| Debugging              | Multi-container logs | Single JVM, single log      |
| Deployment             | K8s / Docker Compose | Single JAR → Railway/Render |
| **Hackathon speed**    | ❌ Too slow          | ✅ Ship in 3 days           |

**Decision:** Build as a **modular monolith** — 5 Spring Boot packages mirroring our 5 domains. Each package has clean boundaries (own controllers, services, repositories). Can be extracted to microservices post-hackathon with zero refactoring because domain boundaries are already clean.

```
de.kesselops
├── operations/     ← Domain A (Shifts, Checklists, Handovers, Training)
├── inventory/      ← Domain B (Products, Stock, Suppliers)
├── menu/           ← Domain C (MenuItems, Recipes, Syndication)
├── guest/          ← Domain D (Guest Profiles, Reservations, Evaluations, Checks)
├── ai/             ← Domain E (Prompts, Usage Logging)
└── shared/         ← Cross-cutting: Auth, Config, DTOs, Exceptions
```

---

## 3. Tech Stack

### Frontend

| Layer         | Technology                         | Why                                                       |
| ------------- | ---------------------------------- | --------------------------------------------------------- |
| Framework     | **Next.js 15** (App Router)        | Server components, RSC, file-based routing, Vercel deploy |
| Language      | **TypeScript 5**                   | Type safety across frontend                               |
| Styling       | **Tailwind CSS 4** + **shadcn/ui** | Rapid, beautiful UI. No design system needed.             |
| State         | **Zustand**                        | Lightweight vs Redux, perfect for dashboard state         |
| Data Fetching | **TanStack Query v5**              | Caching, optimistic updates, real-time polling            |
| Forms         | **React Hook Form** + **Zod**      | Validation with zero re-renders                           |
| Charts        | **Recharts**                       | Revenue, consumption, waste dashboards                    |
| PWA           | **next-pwa**                       | Offline checklist capability for staff                    |
| Mobile Camera | **Browser MediaDevices API**       | PhotoProof capture for HACCP                              |
| Real-time     | **Socket.IO client**               | Live consumption dashboard                                |
| Icons         | **Lucide React**                   | Clean, consistent icon set                                |

### Backend

| Layer        | Technology                      | Why                                                                   |
| ------------ | ------------------------------- | --------------------------------------------------------------------- |
| Framework    | **Spring Boot 3.4**             | Industry-standard, modular, battle-tested                             |
| Language     | **Java 21** (LTS)               | Records, virtual threads, pattern matching                            |
| Build        | **Maven**                       | Industry standard, robust dependency management, multi-module support |
| API          | **Spring Web (REST)**           | Standard REST controllers                                             |
| Persistence  | **Spring Data JPA + Hibernate** | ORM with repository pattern                                           |
| Database     | **PostgreSQL 16**               | JSONB for preferences, full-text search for menus                     |
| Migration    | **Flyway**                      | Versioned SQL migrations                                              |
| Caching      | **Spring Cache + Redis**        | Session, menu cache, weather data                                     |
| Auth         | **Spring Security + JWT**       | Stateless auth, role-based access                                     |
| Validation   | **Jakarta Validation**          | `@NotNull`, `@Size`, `@Valid` on DTOs                                 |
| API Docs     | **SpringDoc OpenAPI**           | Auto-generated Swagger UI                                             |
| File Storage | **AWS S3 / MinIO**              | PhotoProof, media uploads                                             |
| WebSocket    | **Spring WebSocket + STOMP**    | Live consumption dashboard push                                       |
| Testing      | **JUnit 5 + Testcontainers**    | Real DB in tests, no H2 hacks                                         |

### AI / LLM Integration

| Component         | Technology                                                        | Why                                              |
| ----------------- | ----------------------------------------------------------------- | ------------------------------------------------ |
| LLM Provider      | **Anthropic Claude API** (primary) / **OpenAI GPT-4o** (fallback) | Best reasoning for content generation            |
| SDK               | **Spring AI**                                                     | Official Spring integration for LLM calls        |
| Prompt Management | **DB-stored `PromptTemplate`**                                    | Per-venue customizable AI personalities          |
| Weather API       | **Open-Meteo** (free)                                             | No API key needed, forecast data for predictions |
| Google Reviews    | **Google My Business API**                                        | Read reviews (future)                            |

### Infrastructure

| Component        | Technology                         | Why                                           |
| ---------------- | ---------------------------------- | --------------------------------------------- |
| Frontend Hosting | **Vercel**                         | Zero-config Next.js deployment, free tier     |
| Backend Hosting  | **Railway** or **Render**          | One-click Spring Boot deploy, free PostgreSQL |
| Database         | **Railway PostgreSQL** or **Neon** | Managed, free tier, instant provisioning      |
| Redis            | **Upstash Redis**                  | Serverless Redis, free tier                   |
| File Storage     | **Cloudflare R2** or **AWS S3**    | S3-compatible, generous free tier             |
| CI/CD            | **GitHub Actions**                 | Auto-build on push, deploy to Railway/Vercel  |
| Monitoring       | **Spring Boot Actuator**           | Health checks, metrics, ready for production  |

---

## 4. Service Decomposition

> Even though we deploy as a modular monolith, each "service" is a clean package with its own controller → service → repository layers.

### Service A: Operations Service (`de.kesselops.operations`)

| Responsibility         | Entities                                                                 | Key Endpoints                                                           |
| ---------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| User & role management | `User`, `Role`                                                           | `POST /api/users`, `GET /api/users/{id}`                                |
| Venue management       | `Venue`                                                                  | `POST /api/venues`, `GET /api/venues/{id}/staff`                        |
| Shift planning         | `Shift`, `ShiftType`, `ShiftAssignment`, `AssignmentStatus`              | `POST /api/shifts`, `PUT /api/shifts/{id}/assign`                       |
| Checklists & HACCP     | `Checklist`, `ChecklistCategory`, `TaskItem`, `TaskStatus`, `PhotoProof` | `POST /api/shifts/{id}/checklists`, `PUT /api/tasks/{id}/complete`      |
| Shift handovers        | `ShiftHandover`                                                          | `POST /api/shifts/{id}/handover`, `PUT /api/handovers/{id}/acknowledge` |
| Staff onboarding       | `TrainingModule`, `TrainingType`, `StaffProgress`, `ProgressStatus`      | `GET /api/training/for-role/{role}`, `PUT /api/training/progress/{id}`  |

### Service B: Inventory Service (`de.kesselops.inventory`)

| Responsibility      | Entities                                      | Key Endpoints                                               |
| ------------------- | --------------------------------------------- | ----------------------------------------------------------- |
| Product catalog     | `Product`, `ProductCategory`                  | `POST /api/products`, `GET /api/products/low-stock`         |
| Supplier management | `Supplier`, `SupplierType`, `SupplierProduct` | `POST /api/suppliers`, `GET /api/suppliers/{id}/products`   |
| Stock logging       | `StockLog`, `StockLogType`                    | `POST /api/stock-logs`, `GET /api/stock-logs/by-shift/{id}` |
| Ordering            | `Order`, `OrderStatus`, `OrderItem`           | `POST /api/orders`, `PUT /api/orders/{id}/deliver`          |

### Service C: Menu Service (`de.kesselops.menu`)

| Responsibility        | Entities                                             | Key Endpoints                                                            |
| --------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------ |
| Menu management       | `MenuItem`, `MenuCategory`                           | `POST /api/menu-items`, `GET /api/menu-items/venue/{id}`                 |
| Recipes & ingredients | `Recipe`, `RecipeIngredient`                         | `POST /api/recipes`, `GET /api/recipes/{menuItemId}`                     |
| Menu syndication      | `MenuSyndication`, `SyndicationTarget`, `SyncStatus` | `POST /api/syndication/sync/{menuItemId}`, `GET /api/syndication/status` |

### Service D: Guest Service (`de.kesselops.guest`)

| Responsibility       | Entities                                                            | Key Endpoints                                                                     |
| -------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Guest profiles       | `GuestProfile`                                                      | `POST /api/guests`, `GET /api/guests/{id}`, `GET /api/guests/{id}/history`        |
| Reservations         | `Reservation`, `ReservationStatus`                                  | `POST /api/reservations`, `PUT /api/reservations/{id}/confirm`, `PUT /api/reservations/{id}/no-show` |
| Guest evaluations    | `GuestEvaluation`                                                   | `POST /api/evaluations`, `GET /api/guests/{guestId}/evaluations`, `GET /api/guests/{guestId}/score` |
| Guest checks (sales) | `GuestCheck`, `GuestCheckItem`, `GuestCheckStatus`, `PaymentMethod` | `POST /api/checks`, `PUT /api/checks/{id}/close`, `GET /api/checks/by-shift/{id}` |

### Service E: AI Service (`de.kesselops.ai`)

| Responsibility   | Entities                           | Key Endpoints                                                     |
| ---------------- | ---------------------------------- | ----------------------------------------------------------------- |
| Prompt templates | `PromptTemplate`, `PromptCategory` | `POST /api/prompts`, `GET /api/prompts/venue/{id}/category/{cat}` |
| Usage logging    | `AIUsageLog`                       | `GET /api/ai/usage/stats`, `GET /api/ai/usage/by-venue/{id}`      |
| AI orchestration | — (calls Claude/GPT)               | `POST /api/ai/generate` (unified AI gateway)                      |

---

## 5. Project Structure & Directory Layout

````
kesselops/
│
├── README.md
├── docker-compose.yml                    # PostgreSQL + Redis + MinIO for local dev
├── .github/
│   └── workflows/
│       ├── ci-backend.yml                # Build + test Spring Boot
│       └── ci-frontend.yml               # Build + lint Next.js
│
├── docs/
│   ├── domain-model.md                   # → copy from /arch/domain-model.md
│   ├── feature-analysis-kano.md          # → copy from /arch/feature-analysis-kano.md
│   ├── system-design.md                  # → this file
│   └── api-spec.yaml                     # OpenAPI spec (auto-generated)
│
├── infra/
│   ├── docker/
│   │   ├── Dockerfile.backend            # Multi-stage: build + JRE slim
│   │   └── Dockerfile.frontend           # Multi-stage: build + nginx
│   ├── nginx/
│   │   └── nginx.conf                    # Reverse proxy (production)
│   ├── scripts/
│   │   ├── init-db.sh                    # Create schemas, seed data
│   │   └── seed-demo-data.sql            # Demo data for hackathon pitch
│   └── railway/
│       └── railway.toml                  # Railway deployment config
│
├── backend/                              # Spring Boot Modular Monolith
│   ├── pom.xml                           # Root Maven POM
│   │
│   │
│   └── src/
│       ├── main/
│       │   ├── java/de/kesselops/
│       │   │   │
│       │   │   ├── KesselOpsApplication.java        # @SpringBootApplication
│       │   │   │
│       │   │   ├── shared/                           # Cross-cutting concerns
│       │   │   │   ├── config/
│       │   │   │   │   ├── SecurityConfig.java       # JWT + role-based security
│       │   │   │   │   ├── CorsConfig.java           # CORS for Next.js frontend
│       │   │   │   │   ├── WebSocketConfig.java      # STOMP WebSocket config
│       │   │   │   │   └── AiConfig.java             # Spring AI / LLM config
│       │   │   │   ├── security/
│       │   │   │   │   ├── JwtTokenProvider.java
│       │   │   │   │   ├── JwtAuthFilter.java
│       │   │   │   │   └── UserDetailsServiceImpl.java
│       │   │   │   ├── exception/
│       │   │   │   │   ├── GlobalExceptionHandler.java
│       │   │   │   │   ├── ResourceNotFoundException.java
│       │   │   │   │   └── BusinessRuleException.java
│       │   │   │   ├── dto/
│       │   │   │   │   └── ApiResponse.java          # Standard response wrapper
│       │   │   │   └── util/
│       │   │   │       └── DateTimeUtils.java
│       │   │   │
│       │   │   ├── operations/                       # Domain A
│       │   │   │   ├── controller/
│       │   │   │   │   ├── UserController.java
│       │   │   │   │   ├── VenueController.java
│       │   │   │   │   ├── ShiftController.java
│       │   │   │   │   ├── ChecklistController.java
│       │   │   │   │   ├── HandoverController.java
│       │   │   │   │   └── TrainingController.java
│       │   │   │   ├── service/
│       │   │   │   │   ├── UserService.java
│       │   │   │   │   ├── ShiftService.java
│       │   │   │   │   ├── ChecklistService.java
│       │   │   │   │   ├── HandoverService.java
│       │   │   │   │   └── TrainingService.java
│       │   │   │   ├── repository/
│       │   │   │   │   ├── UserRepository.java
│       │   │   │   │   ├── ShiftRepository.java
│       │   │   │   │   ├── ChecklistRepository.java
│       │   │   │   │   └── TrainingModuleRepository.java
│       │   │   │   ├── model/
│       │   │   │   │   ├── User.java
│       │   │   │   │   ├── Role.java
│       │   │   │   │   ├── Venue.java
│       │   │   │   │   ├── Shift.java
│       │   │   │   │   ├── ShiftType.java
│       │   │   │   │   ├── ShiftAssignment.java
│       │   │   │   │   ├── AssignmentStatus.java
│       │   │   │   │   ├── ShiftHandover.java
│       │   │   │   │   ├── Checklist.java
│       │   │   │   │   ├── ChecklistCategory.java
│       │   │   │   │   ├── TaskItem.java
│       │   │   │   │   ├── TaskStatus.java
│       │   │   │   │   ├── PhotoProof.java
│       │   │   │   │   ├── TrainingModule.java
│       │   │   │   │   ├── TrainingType.java
│       │   │   │   │   ├── StaffProgress.java
│       │   │   │   │   └── ProgressStatus.java
│       │   │   │   └── dto/
│       │   │   │       ├── ShiftCreateRequest.java
│       │   │   │       ├── ShiftResponse.java
│       │   │   │       ├── ChecklistResponse.java
│       │   │   │       └── HandoverRequest.java
│       │   │   │
│       │   │   ├── inventory/                        # Domain B
│       │   │   │   ├── controller/
│       │   │   │   │   ├── ProductController.java
│       │   │   │   │   ├── SupplierController.java
│       │   │   │   │   ├── OrderController.java
│       │   │   │   │   └── PredictionController.java
│       │   │   │   ├── service/
│       │   │   │   │   ├── ProductService.java
│       │   │   │   │   ├── SupplierService.java
│       │   │   │   │   ├── OrderService.java
│       │   │   │   │   └── StockService.java
│       │   │   │   ├── repository/
│       │   │   │   │   ├── ProductRepository.java
│       │   │   │   │   ├── SupplierRepository.java
│       │   │   │   │   ├── OrderRepository.java
│       │   │   │   │   └── StockLogRepository.java
│       │   │   │   ├── model/
│       │   │   │   │   ├── Product.java
│       │   │   │   │   ├── ProductCategory.java
│       │   │   │   │   ├── Supplier.java
│       │   │   │   │   ├── SupplierType.java
│       │   │   │   │   ├── SupplierProduct.java
│       │   │   │   │   ├── StockLog.java
│       │   │   │   │   ├── StockLogType.java
│       │   │   │   │   ├── Order.java
│       │   │   │   │   ├── OrderStatus.java
│       │   │   │   │   ├── OrderItem.java
│       │   │   │   │   ├── OrderItem.java
│       │   │   │   │   └── ConsumptionTrend.java
│       │   │   │   └── dto/
│       │   │   │       ├── ProductResponse.java
│       │   │   │       ├── OrderCreateRequest.java
│       │   │   │       └── PredictionResponse.java
│       │   │   │
│       │   │   ├── menu/                             # Domain C
│       │   │   │   ├── controller/
│       │   │   │   │   ├── MenuItemController.java
│       │   │   │   │   ├── RecipeController.java
│       │   │   │   │   └── SyndicationController.java
│       │   │   │   ├── service/
│       │   │   │   │   ├── MenuService.java
│       │   │   │   │   ├── RecipeService.java
│       │   │   │   │   ├── DepletionService.java     # MenuItem sale → Stock depletion
│       │   │   │   │   └── SyndicationService.java
│       │   │   │   ├── repository/
│       │   │   │   │   ├── MenuItemRepository.java
│       │   │   │   │   ├── RecipeRepository.java
│       │   │   │   │   └── MenuSyndicationRepository.java
│       │   │   │   ├── model/
│       │   │   │   │   ├── MenuItem.java
│       │   │   │   │   ├── MenuCategory.java
│       │   │   │   │   ├── Recipe.java
│       │   │   │   │   ├── RecipeIngredient.java
│       │   │   │   │   ├── MenuSyndication.java
│       │   │   │   │   ├── SyndicationTarget.java
│       │   │   │   │   └── SyncStatus.java
│       │   │   │   └── dto/
│       │   │   │       ├── MenuItemResponse.java
│       │   │   │       └── RecipeCreateRequest.java
│       │   │   │
│       │   │   │
│       │   │   ├── guest/                            # Domain D
│       │   │   │   ├── controller/
│       │   │   │   │   ├── GuestController.java
│       │   │   │   │   ├── ReservationController.java
│       │   │   │   │   ├── EvaluationController.java
│       │   │   │   │   └── GuestCheckController.java
│       │   │   │   ├── service/
│       │   │   │   │   ├── GuestService.java
│       │   │   │   │   ├── ReservationService.java
│       │   │   │   │   ├── EvaluationService.java
│       │   │   │   │   └── GuestCheckService.java
│       │   │   │   ├── repository/
│       │   │   │   │   ├── GuestProfileRepository.java
│       │   │   │   │   ├── ReservationRepository.java
│       │   │   │   │   ├── GuestEvaluationRepository.java
│       │   │   │   │   └── GuestCheckRepository.java
│       │   │   │   ├── model/
│       │   │   │   │   ├── GuestProfile.java
│       │   │   │   │   ├── Reservation.java
│       │   │   │   │   ├── ReservationStatus.java
│       │   │   │   │   ├── GuestEvaluation.java
│       │   │   │   │   ├── GuestCheck.java
│       │   │   │   │   ├── GuestCheckItem.java
│       │   │   │   │   ├── GuestCheckStatus.java
│       │   │   │   │   └── PaymentMethod.java
│       │   │   │   └── dto/
│       │   │   │       ├── GuestProfileResponse.java
│       │   │   │       ├── ReservationRequest.java
│       │   │   │       ├── EvaluationRequest.java
│       │   │   │       └── GuestCheckResponse.java
│       │   │   │
│       │   │   │
│       │   │   ├── ai/                               # Domain E
│       │   │       ├── controller/
│       │   │       │   ├── PromptController.java
│       │   │       │   └── AIUsageController.java
│       │   │       ├── service/
│       │   │       │   ├── PromptTemplateService.java
│       │   │       │   ├── AIOrchestrationService.java  # Unified LLM gateway
│       │   │       │   └── AIUsageService.java
│       │   │       ├── repository/
│       │   │       │   ├── PromptTemplateRepository.java
│       │   │       │   └── AIUsageLogRepository.java
│       │   │       ├── model/
│       │   │       │   ├── PromptTemplate.java
│       │   │       │   ├── PromptCategory.java
│       │   │       │   └── AIUsageLog.java
│       │   │       └── dto/
│       │   │           ├── AIGenerateRequest.java
│       │   │           └── AIUsageStatsResponse.java
│       │   │
│       │   └── resources/
│       │       ├── application.yml                   # Main config
│       │       ├── application-dev.yml               # Dev profile (local DB, verbose logs)
│       │       ├── application-prod.yml              # Prod profile (Railway)
│       │       └── db/migration/                     # Flyway migrations
│       │           ├── V1__create_operations_schema.sql
│       │           ├── V2__create_inventory_schema.sql
│       │           ├── V3__create_menu_schema.sql
│       │           ├── V4__create_guest_schema.sql
│       │           ├── V5__create_ai_schema.sql
│       │           └── V6__seed_demo_data.sql
│       │
│       └── test/
│           └── java/de/kesselops/
│               ├── operations/
│               │   └── ShiftServiceTest.java
│               ├── inventory/
│               ├── menu/
│               │   └── DepletionServiceTest.java
│               └── guest/
│                   └── GuestCheckServiceTest.java
│
└── frontend/                             # Next.js App
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── next.config.ts
    ├── .env.local                        # API_URL, etc.
    │
    ├── public/
    │   ├── icons/                        # PWA icons
    │   ├── manifest.json                 # PWA manifest
    │   └── logo.svg
    │
    └── src/
        ├── app/                          # Next.js App Router
        │   ├── layout.tsx                # Root layout (auth provider, theme)
        │   ├── page.tsx                  # Landing / login redirect
        │   ├── (auth)/
        │   │   ├── login/page.tsx
        │   │   └── register/page.tsx
        │   ├── (dashboard)/
        │   │   ├── layout.tsx            # Dashboard shell (sidebar + header)
        │   │   ├── page.tsx              # Dashboard overview
        │   │   ├── shifts/
        │   │   │   ├── page.tsx          # Shift calendar view
        │   │   │   ├── [id]/page.tsx     # Shift detail + checklists
        │   │   │   └── handover/page.tsx # Handover form
        │   │   ├── checklists/
        │   │   │   ├── page.tsx          # Active checklists
        │   │   │   └── [id]/page.tsx     # Checklist with tasks
        │   │   ├── inventory/
        │   │   │   ├── page.tsx          # Stock overview + low-stock alerts
        │   │   │   ├── products/page.tsx # Product catalog
        │   │   │   └── orders/page.tsx   # Supplier orders
        │   │   ├── menu/
        │   │   │   ├── page.tsx          # Digital menu builder
        │   │   │   ├── [id]/page.tsx     # MenuItem detail + recipe
        │   │   │   └── syndication/page.tsx # Syndication status
        │   │   ├── guests/
        │   │   │   ├── page.tsx          # Guest profiles list
        │   │   │   ├── [id]/page.tsx     # Guest detail + history
        │   │   │   ├── reservations/page.tsx # Reservations board
        │   │   │   └── checks/page.tsx   # Active guest checks (POS-lite)
        │   │   ├── training/
        │   │   │   ├── page.tsx          # Training modules overview
        │   │   │   └── [id]/page.tsx     # Training module content
        │   │   └── analytics/
        │   │       └── page.tsx          # Revenue, waste, consumption charts
        │   └── api/                      # Next.js API routes (BFF pattern)
        │       └── auth/[...nextauth]/route.ts
        │
        ├── components/
        │   ├── ui/                       # shadcn/ui components (auto-generated)
        │   │   ├── button.tsx
        │   │   ├── card.tsx
        │   │   ├── dialog.tsx
        │   │   ├── input.tsx
        │   │   ├── select.tsx
        │   │   ├── table.tsx
        │   │   └── ...
        │   ├── layout/
        │   │   ├── sidebar.tsx
        │   │   ├── header.tsx
        │   │   └── mobile-nav.tsx
        │   ├── shifts/
        │   │   ├── shift-calendar.tsx
        │   │   ├── shift-card.tsx
        │   │   └── assignment-badge.tsx
        │   ├── checklists/
        │   │   ├── checklist-card.tsx
        │   │   ├── task-item.tsx
        │   │   └── photo-capture.tsx
        │   ├── inventory/
        │   │   ├── stock-level-bar.tsx
        │   │   ├── low-stock-alert.tsx
        │   │   └── consumption-chart.tsx
        │   ├── menu/
        │   │   ├── menu-item-card.tsx
        │   │   ├── recipe-editor.tsx
        │   │   └── ingredient-list.tsx
        │   ├── guests/
        │   │   ├── guest-score-badge.tsx
        │   │   ├── reservation-card.tsx
        │   │   └── guest-check-panel.tsx
        │   └── analytics/
        │       ├── revenue-chart.tsx
        │       ├── waste-chart.tsx
        │       └── kpi-card.tsx
        │
        ├── lib/
        │   ├── api.ts                    # Axios/fetch wrapper for backend
        │   ├── auth.ts                   # Auth helpers
        │   ├── utils.ts                  # cn() helper, formatters
        │   └── constants.ts              # API URLs, app config
        │
        ├── hooks/
        │   ├── use-shifts.ts             # TanStack Query hooks
        │   ├── use-inventory.ts
        │   ├── use-menu.ts
        │   ├── use-guests.ts
        │   └── use-websocket.ts          # Live consumption socket
        │
        ├── stores/
        │   ├── auth-store.ts             # Zustand: user session
        │   ├── shift-store.ts            # Zustand: active shift context
        │   └── venue-store.ts            # Zustand: selected venue
        │
        └── types/
            ├── operations.ts             # TypeScript types mirroring backend DTOs
            ├── inventory.ts
            ├── menu.ts
            ├── guest.ts
            └── ai.ts

---

## 6. Infrastructure & DevOps

### Local Development (`docker-compose.yml`)

```yaml
version: '3.9'
services:
  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: kesselops
      POSTGRES_USER: kesselops
      POSTGRES_PASSWORD: kesselops_dev
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  minio:
    image: minio/minio:latest
    ports: ["9000:9000", "9001:9001"]
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"

volumes:
  pgdata:
````

### CI/CD Pipeline (GitHub Actions)

```
on push to main:
  ├── backend/
  │   ├── gradle build + test
  │   ├── build Docker image
  │   └── deploy to Railway
  └── frontend/
      ├── npm ci + lint + build
      └── deploy to Vercel (auto via Git integration)
```

### Environment Variables

```env
# Backend (application.yml / Railway)
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/kesselops
SPRING_DATASOURCE_USERNAME=kesselops
SPRING_DATASOURCE_PASSWORD=kesselops_dev
JWT_SECRET=your-256-bit-secret
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
REDIS_URL=redis://localhost:6379

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
```

---

## 7. Database Design

### Schema Strategy

One PostgreSQL database, 5 schemas mirroring domains:

```sql
CREATE SCHEMA IF NOT EXISTS operations;   -- Domain A
CREATE SCHEMA IF NOT EXISTS inventory;    -- Domain B
CREATE SCHEMA IF NOT EXISTS menu;         -- Domain C
CREATE SCHEMA IF NOT EXISTS guest;        -- Domain D
CREATE SCHEMA IF NOT EXISTS ai;           -- Domain E
```

### Key Indexes (Performance)

```sql
-- High-frequency queries
CREATE INDEX idx_shift_venue_date ON operations.shifts(venue_id, start_time);
CREATE INDEX idx_stock_log_product ON inventory.stock_logs(product_id, timestamp);
CREATE INDEX idx_guest_check_shift ON guest.guest_checks(shift_id);
CREATE INDEX idx_guest_check_user ON guest.guest_checks(served_by_user_id);
CREATE INDEX idx_reservation_venue_date ON guest.reservations(venue_id, reservation_time);
CREATE INDEX idx_menu_item_venue ON menu.menu_items(venue_id, is_available);
```

### Naming Conventions

| Entity      | Table                      | Example                                             |
| ----------- | -------------------------- | --------------------------------------------------- |
| Java class  | snake_case plural          | `GuestCheck` → `guest.guest_checks`                 |
| Foreign key | `<entity>_id`              | `shift_id`, `venue_id`                              |
| Enum column | snake_case                 | `GuestCheckStatus` → `status` (stored as `VARCHAR`) |
| Timestamps  | `created_at`, `updated_at` | All entities                                        |

---

## 8. API Design Conventions

### URL Pattern

```
/api/{domain}/{resource}
/api/{domain}/{resource}/{id}
/api/{domain}/{resource}/{id}/{sub-resource}
```

### Standard Response Envelope

```json
{
  "success": true,
  "data": { ... },
  "message": "Shift created successfully",
  "timestamp": "2026-02-09T14:30:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "SHIFT_CONFLICT",
    "message": "User is already assigned to a shift at this time",
    "field": "userId"
  },
  "timestamp": "2026-02-09T14:30:00Z"
}
```

### Pagination

```
GET /api/guests?page=0&size=20&sort=lastVisitAt,desc
```

```json
{
  "success": true,
  "data": { "content": [...], "totalElements": 142, "totalPages": 8, "page": 0 }
}
```

---

## 9. Authentication & Authorization

### Flow

```
1. POST /api/auth/login  { email, password }
2. Server validates → returns { accessToken, refreshToken, user }
3. Frontend stores accessToken in memory (Zustand), refreshToken in httpOnly cookie
4. Every request: Authorization: Bearer <accessToken>
5. JwtAuthFilter validates token, sets SecurityContext
6. @PreAuthorize("hasRole('MANAGER')") on controllers
```

### Role-Based Access

| Endpoint            | OWNER | MANAGER | STAFF | TRAINEE |
| ------------------- | ----- | ------- | ----- | ------- |
| Venue CRUD          | ✅    | ❌      | ❌    | ❌      |
| Shift create/edit   | ✅    | ✅      | ❌    | ❌      |
| Checklist complete  | ✅    | ✅      | ✅    | ✅      |
| Guest check (sales) | ✅    | ✅      | ✅    | ❌      |
| Inventory manage    | ✅    | ✅      | ❌    | ❌      |
| Analytics view      | ✅    | ✅      | ❌    | ❌      |
| Training view       | ✅    | ✅      | ✅    | ✅      |

---

## 10. Features — Sponsor-Wise Coverage

### Sponsor: OSCHO (Café/Bar/Event)

| Feature                            | Domain | Entities Involved                                   | Description                                                                       |
| ---------------------------------- | ------ | --------------------------------------------------- | --------------------------------------------------------------------------------- |
| Digital Opening/Closing Checklists | A      | `Checklist`, `TaskItem`, `PhotoProof`               | Templated checklists per shift type with photo evidence                           |
| HACCP Hygiene Compliance           | A      | `Checklist(HACCP)`, `TaskItem`, `PhotoProof`        | Timestamped hygiene checks with photo proof for audits                            |
| Shift Handover Notes               | A      | `ShiftHandover`                                     | Structured handover (summary, open issues, next steps) replacing WhatsApp         |
| Team Communication                 | A      | `ShiftHandover`, `Checklist`                        | Structured task-based communication per shift, not chat                           |
| Smart Shift Planning               | A      | `Shift`, `ShiftAssignment`, `AssignmentStatus`      | Drag-drop shift assignment with PENDING → CONFIRMED → NO_SHOW tracking            |
| Staff Onboarding                   | A      | `TrainingModule`, `StaffProgress`, `ProgressStatus` | AI-generated role-specific onboarding paths (ONBOARDING, HYGIENE, BEVERAGE, etc.) |

### Sponsor: UNIBEV (Beverage Supplier)

| Feature                  | Domain | Entities Involved                             | Description                                                          |
| ------------------------ | ------ | --------------------------------------------- | -------------------------------------------------------------------- |
| Real-time Stock Tracking | B      | `Product`, `StockLog`, `StockLogType`         | Every consumption/waste/restock event logged with shift context      |
| Supplier Integration API | B      | `Supplier`, `SupplierType`, `SupplierProduct` | UNIBEV product catalog with prices, lead times, min order quantities |
| Consumption Analytics    | B      | `ConsumptionTrend`, `StockLog`                | Week-over-week usage trends, peak day identification                 |

### Sponsor: meincocktailfass (Cocktail Kegs)

| Feature                 | Domain | Entities Involved                                                         | Description                                                       |
| ----------------------- | ------ | ------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Cocktail Keg Tracking   | B+C    | `Product(COCKTAIL_KEG)`, `MenuItem`, `Recipe`                             | Keg as a Product, cocktail as MenuItem, Recipe links them         |
| Auto-Depletion on Sale  | B+C+D  | `GuestCheckItem` → `MenuItem` → `Recipe` → `RecipeIngredient` → `Product` | Selling a "Barrel Old Fashioned" automatically depletes keg stock |
| Keg Reorder Alerts      | B      | `Product.isLowStock()`, `PredictiveEngine`                                | Alert when keg drops below reorder level                          |
| Quality Standardization | C      | `Recipe`, `RecipeIngredient`                                              | Exact recipe with portions ensures consistent cocktails           |

### Sponsor: Ludwig Heer 🏆 (Jury Member!)

| Feature                           | Domain | Entities Involved                             | Description                                                        |
| --------------------------------- | ------ | --------------------------------------------- | ------------------------------------------------------------------ |
| Reservation System                | D      | `Reservation`, `ReservationStatus` (6 states) | PENDING → CONFIRMED → SEATED → COMPLETED (plus CANCELLED / NO_SHOW) |
| Reverse Guest Evaluation          | D      | `GuestProfile`, `GuestEvaluation`             | Gastronomer rates guests (behavior/punctuality) for reliability/VIP scoring |
| Digital Menu Management           | C      | `MenuItem`, `MenuCategory`, `Recipe`          | Centralized menu with categories, pricing, availability, allergens |
| Menu Syndication to Third Parties | C      | `MenuSyndication`, `SyndicationTarget`        | Auto-sync menus to speisekarte.de, Google Business, TripAdvisor    |

### Sponsor: DEHOGA (Industry Association & Jury)

| Feature                   | Domain | Entities Involved                                     | Description                                                        |
| ------------------------- | ------ | ----------------------------------------------------- | ------------------------------------------------------------------ |
| Fachkräftemangel Solution | A      | `TrainingModule`, `StaffProgress`                     | AI-generated onboarding reduces time-to-productivity for new hires |
| Waste Reduction           | B      | `StockLog(WASTE)`, `ConsumptionTrend`                 | Track waste per shift, per product. Identify waste patterns.       |
| Sustainability Metrics    | B      | Waste Ratio = `WASTE / (MENU_DEPLETION + WASTE)`      | Sustainability dashboard with concrete waste-to-usage ratios       |
| Affordable Digital Tool   | —      | Architecture decision: open-source, free-tier hosting | No per-seat licensing. Free to deploy.                             |
| Multi-Venue Scalability   | A      | `Venue` entity, all entities linked via `venueId`     | "Deploy across Stuttgart" — every entity is venue-scoped           |

### Sponsor: Mellow Rush (Botanical Boosters)

| Feature                    | Domain | Entities Involved                                                | Description                                       |
| -------------------------- | ------ | ---------------------------------------------------------------- | ------------------------------------------------- |
| NA Drink Menu Category     | C      | `MenuCategory.BOTANICAL_BOOSTER`, `MenuItem(isAlcoholFree=true)` | First-class alcohol-free category in digital menu |
| Botanical Product Category | B      | `ProductCategory.BOTANICAL_BOOSTER`                              | Dedicated inventory category for NA ingredients   |

### Sponsor: visito (Organizer)

| Feature                        | Domain | Entities Involved                                | Description                                                       |
| ------------------------------ | ------ | ------------------------------------------------ | ----------------------------------------------------------------- |
| Modular Architecture           | All    | 5 domains, clean package boundaries              | Each domain can be extracted to a standalone service              |
| AI Integration Across Platform | E      | `PromptTemplate`, `AIUsageLog`, `PromptCategory` | Configurable AI with usage tracking, not just "we called ChatGPT" |

### Sponsor: Geheimtipp Stuttgart (City Magazine)

| Feature              | Domain | Entities Involved                   | Description                                     |
| -------------------- | ------ | ----------------------------------- | ----------------------------------------------- |
| Venue Discovery Data | A      | `Venue` (name, address, city, type) | Venue data ready for city discovery integration |
| Menu Syndication     | C      | `MenuSyndication`                   | Menu data exportable to discovery platforms     |

---

## 11. AI Features — Dedicated Section

> KesselOps uses AI across **5 domains**, not as a bolt-on chatbot but as an integrated intelligence layer.

### AI Feature Matrix

| #    | AI Feature                     | Domain | Input                                                                        | Output                                                                    | LLM Used | Prompt Category    |
| ---- | ------------------------------ | ------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------- | ------------------ |
| AI-1 | **Staff Onboarding Generator** | A      | `Role`, `Venue.type`, existing `TrainingModule`s                             | AI-generated onboarding path with micro-guides                            | Claude   | `ONBOARDING_GUIDE` |
| AI-2 | **Menu Description Generator** | C      | `MenuItem.name`, `Recipe.preparationNotes`, `RecipeIngredient[]`             | Appealing menu description with allergen info                             | GPT-4o   | `MENU_DESCRIPTION` |
| AI-3 | **Shift Summary Generator**    | A      | `Shift` data, `Checklist` completion, `StockLog` events, `GuestCheck` totals | End-of-shift summary for handover                                         | Claude   | `SHIFT_SUMMARY`    |
| AI-4 | **Waste Pattern Analysis**     | B      | `StockLog(WASTE)` time series per product                                    | "Your lime waste peaks on Mondays — consider reducing Monday prep by 30%" | Claude   | — (inline)         |
| AI-5 | **Waste Pattern Analysis**     | B      | `StockLog(WASTE)` time series per product                                    | "Your lime waste peaks on Mondays — consider reducing Monday prep by 30%" | Claude   | — (inline)         |
| AI-6 | **Shift Summary Generator**    | A+E    | `Shift` data, `Checklist` completion, `StockLog` events, `GuestCheck` totals | End-of-shift summary for handover or social post                          | Claude   | `SHIFT_SUMMARY`    |
| AI-7 | **Menu Description Generator** | C      | `MenuItem.name`, `Recipe.preparationNotes`, `RecipeIngredient[]`             | Appealing menu description with allergen info                             | GPT-4o   | `MENU_DESCRIPTION` |

### AI Architecture Detail

```
┌──────────────────────────────────────────────────────────────┐
│  AI ORCHESTRATION LAYER (de.kesselops.ai)                   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  AIOrchestrationService                                │  │
│  │                                                        │  │
│  │  1. Receive request (category + variables)             │  │
│  │  2. Load PromptTemplate by venue + category            │  │
│  │  3. Render template with variables                     │  │
│  │  4. Call LLM provider (Claude / GPT)                   │  │
│  │  5. Log usage to AIUsageLog                            │  │
│  │  6. Return generated content                           │  │
│  └───────┬────────────────┬──────────────────┬────────────┘  │
│          │                │                  │               │
│          ▼                ▼                  ▼               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ Anthropic    │ │ OpenAI       │ │ Custom ML            │ │
│  │ Claude 3.5   │ │ GPT-4o       │ │ (waste analysis,     │ │
│  │              │ │ + Vision     │ │  heuristics)         │ │
│  │ Primary for: │ │ Primary for: │ │                      │ │
│  │ • Onboarding │ │ • Menu desc  │ │ Primary for:         │ │
│  │ • Summaries  │ │              │ │ • Waste analysis     │ │
│  │              │ │              │ │                      │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  PromptTemplate (per venue, per category)              │  │
│  │                                                        │  │
│  │  systemPrompt: "Du bist der Social Media Manager       │  │
│  │    von {venue.name}, einem {venue.type} in Stuttgart.  │  │
│  │    Dein Ton ist {toneOfVoice}. Sprache: {language}."   │  │
│  │                                                        │  │
│  │  userPromptTemplate: "Erstelle einen Instagram Post    │  │
│  │    basierend auf: Schicht: {shift.type}, Datum:        │  │
│  │    {shift.date}, Highlights: {shift.handover.summary}" │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  AIUsageLog (audit + cost tracking)                    │  │
│  │                                                        │  │
│  │  • Which prompt was used                               │  │
│  │  • Which model answered                                │  │
│  │  • Token count (input + output)                        │  │
│  │  • Latency in ms                                       │  │
│  │  • Was the result accepted by the user?                │  │
│  │  → Enables: cost projection, quality scoring, A/B      │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Why This AI Architecture Wins

| What Others Build        | What KesselOps Has                                                         |
| ------------------------ | -------------------------------------------------------------------------- |
| Hardcoded prompts        | `PromptTemplate` per venue per use case — configurable in DB               |
| One AI feature (chatbot) | **7 AI features** across 5 domains                                         |
| No tracking              | `AIUsageLog` with token count, latency, acceptance rate                    |
| English-only             | `language` field in PromptTemplate — German/English/any                    |
| Same tone everywhere     | `toneOfVoice` per venue — casual bar ≠ fine dining                         |
| Black box                | Full audit trail: who requested, what prompt, what model, how much it cost |

---

## 12. Quick-Start Guide

### Prerequisites

```
- Java 21 (sdkman: sdk install java 21-tem)
- Node.js 20+ (nvm: nvm install 20)
- Docker Desktop (for PostgreSQL + Redis)
- Git
```

### Step 1: Clone & Setup

```bash
# Clone the repo
git clone https://github.com/<org>/kesselops.git
cd kesselops

# Start infrastructure
docker compose up -d

# Verify services
docker compose ps   # postgres, redis, minio should be running
```

### Step 2: Backend

```bash
cd backend

# Set environment variables (or use application-dev.yml defaults)
export ANTHROPIC_API_KEY=sk-ant-xxx

# Build & run
./mvnw spring-boot:run -pl monolith -am -Dspring-boot.run.profiles=dev

# Verify
curl http://localhost:8080/actuator/health
# → {"status":"UP"}

# API docs
open http://localhost:8080/swagger-ui.html
```

### Step 3: Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set API URL
echo "NEXT_PUBLIC_API_URL=http://localhost:8080/api" > .env.local

# Run dev server
npm run dev

# Open
open http://localhost:3000
```

### Step 4: Seed Demo Data

```bash
# Flyway runs automatically on boot, but for demo data:
cd backend
./mvnw flyway:migrate -pl monolith

# Or manually:
psql -U kesselops -d kesselops -f infra/scripts/seed-demo-data.sql
```

### Step 5: Deploy (Hackathon Day 3)

```bash
# Backend → Railway
railway login
railway link
railway up

# Frontend → Vercel
cd frontend
vercel --prod
```

---

## Architecture Decision Records (ADRs)

| #      | Decision                                    | Rationale                                                                                                  |
| ------ | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| ADR-1  | Modular monolith over microservices         | 3-day hackathon: single JVM, single deploy, zero inter-service overhead                                    |
| ADR-2  | PostgreSQL over MongoDB                     | Relational data (shifts→users, orders→products). JSONB column for flexible fields (preferences, allergens) |
| ADR-3  | Next.js App Router over Pages Router        | Server components for SEO-irrelevant dashboard, streaming SSR, better layouts                              |
| ADR-4  | Spring AI over raw HTTP to LLM              | Official Spring integration, retries, streaming, model abstraction                                         |
| ADR-5  | JWT over session cookies                    | Stateless backend, easy multi-client support, WebSocket auth                                               |
| ADR-6  | Flyway over Liquibase                       | SQL-based migrations, simpler for hackathon speed                                                          |
| ADR-7  | Zustand over Redux                          | 2KB vs 42KB, simpler API, sufficient for dashboard state                                                   |
| ADR-8  | shadcn/ui over Material UI                  | Copy-paste components (own code), Tailwind-native, hackathon-fast                                          |
| ADR-9  | 5 DB schemas in 1 database over 5 databases | Simplicity + cross-domain joins possible in monolith phase                                                 |
| ADR-10 | Railway over AWS/GCP                        | One-click deploy, free PostgreSQL, zero DevOps for hackathon                                               |
| ADR-11 | `GuestCheck` ≠ `Order`                      | Order = money OUT (to supplier). GuestCheck = money IN (from guest). Both are needed for COGS calculation. |
| ADR-12 | Prompt templates in DB over code            | Venues customize AI personality without code changes. Shows architectural maturity.                        |

---

_KesselOps: 5 domains · 27 entities · 4 AI features · 3 days to win._
