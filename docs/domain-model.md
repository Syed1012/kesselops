# Backstage Shift Assistant — Domain Model & Class Diagram (v2)

> **Hackathon Stuttgart 2026** · Aligned to all sponsor requirements
> See [`feature-analysis-kano.md`](./feature-analysis-kano.md) for full KANO classification

## Architecture Overview

- **Frontend:** Next.js / React (mobile-first)
- **Backend:** Java Spring Boot microservices
- **AI:** Claude / GPT for onboarding, social, menu, predictions
- **Database:** PostgreSQL
- **Domains (6):** Core Operations · Inventory & Prediction · Digital Menu · Guest Experience · Social & Marketing · AI Configuration

## Mermaid.js Class Diagram

```mermaid
classDiagram

    %% ══════════════════════════════════════════════════════════
    %% DOMAIN A — CORE OPERATIONS (OSCHO, DEHOGA, visito)
    %% Shift planning, checklists, HACCP, handovers, onboarding
    %% ══════════════════════════════════════════════════════════
    namespace CoreOperations {
        class User {
            +Long id
            +String firstName
            +String lastName
            +String email
            +String passwordHash
            +Role role
            +String phone
            +Boolean isActive
            +Long venueId
            +DateTime createdAt
            +DateTime updatedAt
            +assignToShift(Shift shift) void
            +deactivate() void
        }

        class Role {
            <<enumeration>>
            OWNER
            MANAGER
            STAFF
            TRAINEE
        }

        class Venue {
            +Long id
            +String name
            +String address
            +String city
            +String type
            +String timezone
            +DateTime createdAt
            +getActiveStaff() List~User~
        }

        class Shift {
            +Long id
            +Long venueId
            +DateTime startTime
            +DateTime endTime
            +ShiftType type
            +String notes
            +DateTime createdAt
            +getAssignedStaff() List~User~
            +getDuration() Duration
            +isActive() Boolean
        }

        class ShiftType {
            <<enumeration>>
            MORNING
            AFTERNOON
            EVENING
            NIGHT
        }

        class ShiftAssignment {
            +Long id
            +Long userId
            +Long shiftId
            +AssignmentStatus status
            +DateTime assignedAt
            +String assignedBy
            +confirm() void
            +decline(String reason) void
        }

        class AssignmentStatus {
            <<enumeration>>
            PENDING
            CONFIRMED
            DECLINED
            NO_SHOW
        }

        class ShiftHandover {
            +Long id
            +Long fromShiftId
            +Long toShiftId
            +Long authorUserId
            +String summary
            +String openIssues
            +String nextSteps
            +DateTime createdAt
            +acknowledge(User user) void
        }

        class Checklist {
            +Long id
            +Long shiftId
            +ChecklistCategory category
            +String title
            +DateTime createdAt
            +Boolean isCompleted
            +getCompletionPercentage() Double
            +markComplete() void
        }

        class ChecklistCategory {
            <<enumeration>>
            OPENING
            CLOSING
            HANDOVER
            HACCP
            EMERGENCY
        }

        class TaskItem {
            +Long id
            +Long checklistId
            +String description
            +TaskStatus status
            +Integer sortOrder
            +Boolean requiresPhoto
            +DateTime completedAt
            +Long completedByUserId
            +markDone(User user) void
            +attachPhoto(PhotoProof photo) void
        }

        class TaskStatus {
            <<enumeration>>
            NOT_DONE
            DONE
            SKIPPED
        }

        class PhotoProof {
            +Long id
            +String fileUrl
            +String mimeType
            +Long fileSizeBytes
            +DateTime uploadedAt
            +Long uploadedByUserId
            +validate() Boolean
        }

        class TrainingModule {
            +Long id
            +String title
            +String description
            +Role targetRole
            +TrainingType type
            +String contentJson
            +Integer estimatedMinutes
            +Integer sortOrder
            +Boolean isAIGenerated
            +DateTime createdAt
            +DateTime updatedAt
        }

        class TrainingType {
            <<enumeration>>
            ONBOARDING
            HYGIENE
            SAFETY
            BEVERAGE
            SERVICE
            CHECKLIST_GUIDE
        }

        class StaffProgress {
            +Long id
            +Long userId
            +Long trainingModuleId
            +ProgressStatus status
            +Integer completionPercent
            +DateTime startedAt
            +DateTime completedAt
            +Integer quizScore
            +start() void
            +complete(Integer score) void
            +isOverdue() Boolean
        }

        class ProgressStatus {
            <<enumeration>>
            NOT_STARTED
            IN_PROGRESS
            COMPLETED
            OVERDUE
        }
    }

    %% ══════════════════════════════════════════════════════════
    %% DOMAIN B — INVENTORY & PREDICTION (UNIBEV, meincocktailfass, DEHOGA)
    %% Stock tracking, supplier integration, predictive ordering
    %% ══════════════════════════════════════════════════════════
    namespace InventoryAndPrediction {
        class Product {
            +Long id
            +String name
            +String sku
            +ProductCategory category
            +String unit
            +Double currentQuantity
            +Double reorderLevel
            +Double reorderQuantity
            +Double unitPrice
            +Long venueId
            +Boolean isActive
            +isLowStock() Boolean
            +consume(Double quantity) void
            +restock(Double quantity) void
        }

        class ProductCategory {
            <<enumeration>>
            SPIRITS
            WINE
            BEER
            COCKTAIL_KEG
            SOFT_DRINKS
            BOTANICAL_BOOSTER
            FOOD_INGREDIENT
            CONSUMABLE
        }

        class Supplier {
            +Long id
            +String name
            +String contactPerson
            +String email
            +String phone
            +String address
            +SupplierType type
            +Boolean isPreferred
            +DateTime createdAt
            +getSuppliedProducts() List~Product~
            +placeOrder(Order order) void
        }

        class SupplierType {
            <<enumeration>>
            BEVERAGE_DISTRIBUTOR
            FOOD_WHOLESALER
            COCKTAIL_KEG_PROVIDER
            CONSUMABLE_SUPPLIER
        }

        class SupplierProduct {
            +Long id
            +Long supplierId
            +Long productId
            +Double supplierPrice
            +String supplierSku
            +Integer leadTimeDays
            +Double minimumOrderQty
        }

        class StockLog {
            +Long id
            +Long productId
            +Double quantityChanged
            +StockLogType type
            +String reason
            +Long performedByUserId
            +Long shiftId
            +DateTime timestamp
        }

        class StockLogType {
            <<enumeration>>
            CONSUMPTION
            RESTOCK
            ADJUSTMENT
            WASTE
            MENU_DEPLETION
        }

        class Order {
            +Long id
            +Long supplierId
            +Long venueId
            +OrderStatus status
            +DateTime createdAt
            +DateTime expectedDelivery
            +DateTime actualDelivery
            +Double totalAmount
            +String notes
            +Boolean isAutoGenerated
            +submit() void
            +markDelivered() void
            +cancel() void
            +getTotalItems() Integer
        }

        class OrderStatus {
            <<enumeration>>
            DRAFT
            SUBMITTED
            CONFIRMED
            DELIVERED
            CANCELLED
        }

        class OrderItem {
            +Long id
            +Long orderId
            +Long productId
            +Double quantity
            +Double unitPrice
            +getSubtotal() Double
        }

        class PredictiveEngine {
            <<service>>
            +analyzeConsumption(Product p, DateRange r) ConsumptionTrend
            +predictStock(Product p, WeatherForecast w) StockPrediction
            +suggestOrder(List~Product~ lowStock) Order
            +correlateWithShifts(List~Shift~ shifts) Map
            +suggestStaffing(Venue v, WeatherForecast w) List~ShiftAssignment~
        }

        class WeatherForecast {
            +Long id
            +DateTime date
            +Double temperatureCelsius
            +String condition
            +Double precipitationMm
            +DateTime fetchedAt
        }

        class StockPrediction {
            +Long productId
            +Double predictedDailyUsage
            +Integer daysUntilStockout
            +Double recommendedOrderQty
            +Double confidenceScore
        }

        class ConsumptionTrend {
            +Long productId
            +Double averageDailyUsage
            +Double peakUsage
            +String peakDay
            +Double weekOverWeekChange
        }
    }

    %% ══════════════════════════════════════════════════════════
    %% DOMAIN C — DIGITAL MENU (Ludwig Heer, meincocktailfass)
    %% Separates what we SELL (MenuItem) from what we STOCK (Product)
    %% Recipe bridges MenuItem → Products for auto-depletion
    %% ══════════════════════════════════════════════════════════
    namespace DigitalMenu {
        class MenuItem {
            +Long id
            +Long venueId
            +String name
            +String description
            +Double price
            +MenuCategory category
            +String imageUrl
            +Boolean isAvailable
            +Boolean isAlcoholFree
            +List~String~ allergens
            +Integer sortOrder
            +DateTime createdAt
            +checkAvailability() Boolean
            +depletIngredients() void
        }

        class MenuCategory {
            <<enumeration>>
            COCKTAIL
            BEER
            WINE
            BOTANICAL_BOOSTER
            SOFT_DRINK
            COFFEE
            FOOD
            SPECIAL
        }

        class Recipe {
            +Long id
            +Long menuItemId
            +String preparationNotes
            +Integer prepTimeMinutes
            +String difficultyLevel
            +DateTime createdAt
        }

        class RecipeIngredient {
            +Long id
            +Long recipeId
            +Long productId
            +Double quantity
            +String unit
            +Boolean isOptional
            +getIngredientCost() Double
        }

        class MenuSyndication {
            +Long id
            +Long menuItemId
            +SyndicationTarget target
            +String externalId
            +SyncStatus syncStatus
            +DateTime lastSyncedAt
            +syncToTarget() void
        }

        class SyndicationTarget {
            <<enumeration>>
            SPEISEKARTE_DE
            GOOGLE_BUSINESS
            TRIPADVISOR
            WEBSITE
        }

        class SyncStatus {
            <<enumeration>>
            PENDING
            SYNCED
            FAILED
            OUT_OF_DATE
        }
    }

    %% ══════════════════════════════════════════════════════════
    %% DOMAIN D — GUEST EXPERIENCE (Ludwig Heer — Jury Member!)
    %% Guest profiles, reservations, no-shows, REVERSE ratings
    %% ══════════════════════════════════════════════════════════
    namespace GuestExperience {
        class GuestProfile {
            +Long id
            +String firstName
            +String lastName
            +String email
            +String phone
            +Long venueId
            +Integer totalVisits
            +Integer noShowCount
            +Double totalSpend
            +Double averageSpend
            +Double guestScore
            +String notes
            +List~String~ preferences
            +DateTime createdAt
            +DateTime lastVisitAt
            +calculateScore() Double
            +isReliable() Boolean
            +isVIP() Boolean
            +flagNoShow() void
            +recordVisit(Double amount) void
        }

        class Reservation {
            +Long id
            +Long guestProfileId
            +Long venueId
            +DateTime reservationTime
            +Integer partySize
            +ReservationStatus status
            +String specialRequests
            +String tablePreference
            +DateTime createdAt
            +DateTime updatedAt
            +confirm() void
            +cancel(String reason) void
            +markNoShow() void
            +markSeated() void
        }

        class ReservationStatus {
            <<enumeration>>
            PENDING
            CONFIRMED
            SEATED
            COMPLETED
            CANCELLED
            NO_SHOW
        }

        class GuestEvaluation {
            +Long id
            +Long guestProfileId
            +Long reservationId
            +Long evaluatedByUserId
            +Integer behaviorRating
            +Integer punctualityRating
            +Integer overallRating
            +String comment
            +DateTime createdAt
        }

        class GuestCheck {
            +Long id
            +Long venueId
            +Long shiftId
            +Long servedByUserId
            +Long guestProfileId
            +Long reservationId
            +String tableNumber
            +Integer guestCount
            +GuestCheckStatus status
            +PaymentMethod paymentMethod
            +Double subtotal
            +Double taxAmount
            +Double tipAmount
            +Double totalAmount
            +Double discountAmount
            +String notes
            +DateTime openedAt
            +DateTime closedAt
            +open() void
            +addItem(MenuItem item, Integer qty) GuestCheckItem
            +close(PaymentMethod method) void
            +applyDiscount(Double amount) void
            +getRevenueForShift() Double
        }

        class GuestCheckItem {
            +Long id
            +Long guestCheckId
            +Long menuItemId
            +Integer quantity
            +Double unitPrice
            +Double lineTotal
            +String modifiers
            +String notes
            +DateTime orderedAt
            +DateTime servedAt
            +getLineTotal() Double
            +triggerDepletion() void
        }

        class GuestCheckStatus {
            <<enumeration>>
            OPEN
            CLOSED
            VOID
            REFUNDED
        }

        class PaymentMethod {
            <<enumeration>>
            CASH
            CARD
            MOBILE_PAY
            SPLIT
            ON_HOUSE
        }
    }

    %% ══════════════════════════════════════════════════════════
    %% DOMAIN E — SOCIAL & MARKETING (visito, Ludwig Heer)
    %% AI post generation, Google review responses, prompt config
    %% ══════════════════════════════════════════════════════════
    namespace SocialAndMarketing {
        class SocialPost {
            +Long id
            +Long venueId
            +String content
            +Platform platform
            +PostStatus status
            +Long promptTemplateId
            +DateTime scheduledAt
            +DateTime publishedAt
            +Long generatedFromShiftId
            +DateTime createdAt
            +String createdByUserId
            +publish() void
            +schedule(DateTime dateTime) void
            +saveDraft() void
        }

        class Platform {
            <<enumeration>>
            INSTAGRAM
            FACEBOOK
            TIKTOK
            GOOGLE_BUSINESS
        }

        class PostStatus {
            <<enumeration>>
            DRAFT
            SCHEDULED
            PUBLISHED
            FAILED
        }

        class Media {
            +Long id
            +String fileUrl
            +MediaType type
            +String altText
            +Integer sortOrder
            +DateTime uploadedAt
        }

        class MediaType {
            <<enumeration>>
            IMAGE
            VIDEO
            CAROUSEL
        }

        class ReviewResponse {
            +Long id
            +Long venueId
            +Platform sourcePlatform
            +String originalReviewText
            +Integer originalRating
            +String generatedResponse
            +ReviewResponseStatus status
            +Long promptTemplateId
            +DateTime createdAt
            +approve() void
            +edit(String content) void
            +publish() void
        }

        class ReviewResponseStatus {
            <<enumeration>>
            GENERATED
            APPROVED
            PUBLISHED
            REJECTED
        }

        class AIContentGenerator {
            <<service>>
            +generateFromShift(Shift s, PromptTemplate pt) SocialPost
            +generateFromPhoto(PhotoProof p, PromptTemplate pt) SocialPost
            +generateReviewResponse(ReviewResponse r, PromptTemplate pt) String
            +suggestCaption(Media m) String
            +suggestHashtags(String content) List~String~
        }
    }

    %% ══════════════════════════════════════════════════════════
    %% DOMAIN F — AI CONFIGURATION (Delighter — configurable AI brain)
    %% Prompt templates, AI personalities per venue
    %% ══════════════════════════════════════════════════════════
    namespace AIConfiguration {
        class PromptTemplate {
            +Long id
            +Long venueId
            +String name
            +String systemPrompt
            +String userPromptTemplate
            +PromptCategory category
            +String toneOfVoice
            +String language
            +Boolean isActive
            +Integer version
            +DateTime createdAt
            +DateTime updatedAt
            +render(Map~String,Object~ vars) String
        }

        class PromptCategory {
            <<enumeration>>
            SOCIAL_POST
            REVIEW_RESPONSE
            ONBOARDING_GUIDE
            MENU_DESCRIPTION
            SHIFT_SUMMARY
        }

        class AIUsageLog {
            +Long id
            +Long promptTemplateId
            +Long userId
            +String modelUsed
            +Integer inputTokens
            +Integer outputTokens
            +Double latencyMs
            +Boolean wasAccepted
            +DateTime timestamp
        }
    }

    %% ══════════════════════════════════════════════════════════
    %% RELATIONSHIPS — Domain A (Core Operations)
    %% ══════════════════════════════════════════════════════════
    User --> Role                                : has
    User "0..*" --> "1" Venue                    : belongs to
    Venue "1" --> "0..*" Shift                   : schedules
    User "1" --> "*" ShiftAssignment             : participates via
    Shift "1" --> "*" ShiftAssignment            : staffed via
    ShiftAssignment --> AssignmentStatus          : has
    Shift --> ShiftType                          : categorized as
    Shift "1" *-- "0..*" Checklist               : contains
    Shift "1" o-- "0..1" ShiftHandover           : hands over via
    ShiftHandover "0..1" --> "1" Shift            : received by next
    Checklist --> ChecklistCategory               : typed as
    Checklist "1" *-- "1..*" TaskItem             : contains
    TaskItem --> TaskStatus                       : has
    TaskItem "1" o-- "0..1" PhotoProof            : may have

    %% Training & Onboarding
    TrainingModule --> TrainingType               : typed as
    TrainingModule --> Role                       : targets
    User "1" --> "*" StaffProgress               : tracks
    StaffProgress --> ProgressStatus              : has
    TrainingModule "1" --> "*" StaffProgress      : measured by

    %% ══════════════════════════════════════════════════════════
    %% RELATIONSHIPS — Domain B (Inventory & Prediction)
    %% ══════════════════════════════════════════════════════════
    Product --> ProductCategory                   : categorized as
    Supplier --> SupplierType                     : typed as
    Supplier "1" --> "*" SupplierProduct           : offers via
    Product "1" --> "*" SupplierProduct            : supplied via
    Product "1" --> "*" StockLog                   : tracked by
    StockLog --> StockLogType                      : typed as
    StockLog "0..*" --> "0..1" Shift              : during
    Order --> OrderStatus                         : has
    Order "1" *-- "1..*" OrderItem                : contains
    OrderItem --> Product                         : references
    Supplier "1" --> "*" Order                     : receives
    PredictiveEngine ..> Product                  : analyzes
    PredictiveEngine ..> Shift                    : correlates with
    PredictiveEngine ..> WeatherForecast          : factors in
    PredictiveEngine ..> StockPrediction          : produces
    PredictiveEngine ..> ConsumptionTrend         : produces
    PredictiveEngine ..> Order                    : suggests
    PredictiveEngine ..> ShiftAssignment          : suggests staffing

    %% ══════════════════════════════════════════════════════════
    %% RELATIONSHIPS — Domain C (Digital Menu)
    %% The critical bridge: MenuItem → Recipe → Product (inventory depletion)
    %% ══════════════════════════════════════════════════════════
    MenuItem --> MenuCategory                     : categorized as
    MenuItem "1" *-- "0..1" Recipe                : prepared via
    Recipe "1" *-- "1..*" RecipeIngredient         : composed of
    RecipeIngredient "0..*" --> "1" Product        : depletes
    MenuItem "1" --> "0..*" MenuSyndication        : published via
    MenuSyndication --> SyndicationTarget          : targets
    MenuSyndication --> SyncStatus                 : has

    %% ══════════════════════════════════════════════════════════
    %% RELATIONSHIPS — Domain D (Guest Experience)
    %% ══════════════════════════════════════════════════════════
    GuestProfile "1" --> "*" Reservation           : makes
    Reservation --> ReservationStatus              : has
    GuestProfile "1" --> "*" GuestEvaluation        : evaluated via
    GuestEvaluation "0..1" --> "0..1" Reservation  : for
    GuestEvaluation --> User                       : evaluated by

    %% Guest Check (the TRANSACTION — money coming in)
    GuestCheck --> GuestCheckStatus                : has
    GuestCheck --> PaymentMethod                   : paid via
    GuestCheck "1" *-- "1..*" GuestCheckItem       : contains
    GuestCheckItem "0..*" --> "1" MenuItem          : sells
    GuestProfile "1" --> "*" GuestCheck            : purchases via
    GuestCheck "0..1" --> "0..1" Reservation       : fulfills
    GuestCheck "0..*" --> "1" Shift                : during
    GuestCheck --> User                            : served by

    %% ══════════════════════════════════════════════════════════
    %% RELATIONSHIPS — Domain E (Social & Marketing)
    %% ══════════════════════════════════════════════════════════
    SocialPost --> Platform                       : targets
    SocialPost --> PostStatus                     : has
    SocialPost "1" *-- "0..*" Media               : includes
    Media --> MediaType                           : typed as
    ReviewResponse --> ReviewResponseStatus       : has
    ReviewResponse --> Platform                   : from
    AIContentGenerator ..> SocialPost             : generates
    AIContentGenerator ..> ReviewResponse         : generates
    AIContentGenerator ..> Shift                  : reads from
    AIContentGenerator ..> PhotoProof             : reads from
    AIContentGenerator ..> Media                  : analyzes

    %% ══════════════════════════════════════════════════════════
    %% RELATIONSHIPS — Domain F (AI Configuration)
    %% ══════════════════════════════════════════════════════════
    PromptTemplate --> PromptCategory             : categorized as
    AIUsageLog --> PromptTemplate                  : logs usage of
    AIUsageLog --> User                            : triggered by

    %% ══════════════════════════════════════════════════════════
    %% CROSS-DOMAIN RELATIONSHIPS (the glue)
    %% ══════════════════════════════════════════════════════════

    %% Social ↔ AI Config
    SocialPost "0..*" --> "0..1" PromptTemplate   : generated using
    ReviewResponse "0..*" --> "0..1" PromptTemplate : generated using
    AIContentGenerator ..> PromptTemplate         : configured by

    %% Social ↔ Core
    SocialPost "0..*" --> "0..1" Shift            : generated from

    %% Inventory ↔ Core
    StockLog --> User                             : performed by
    TaskItem --> User                             : completed by
    Order --> User                                : created by

    %% Menu ↔ Venue
    MenuItem "0..*" --> "1" Venue                 : belongs to

    %% Guest ↔ Venue
    GuestProfile "0..*" --> "1" Venue             : registered at
    Reservation "0..*" --> "1" Venue              : booked at

    %% Menu → Inventory (depletion flow)
    %% RecipeIngredient --> Product already defined above

    %% AI Config ↔ Venue
    PromptTemplate "0..*" --> "0..1" Venue        : customized for

    %% Onboarding AI
    TrainingModule "0..*" --> "0..1" PromptTemplate : generated via
```

---

## Relationship Legend

| Notation | Meaning | Example |
|----------|---------|---------|
| `<\|--` | Inheritance | — |
| `*--` | Composition (lifecycle-bound) | Shift *contains* Checklists |
| `o--` | Aggregation (independent lifecycle) | TaskItem *may have* PhotoProof |
| `-->` | Association | User *belongs to* Venue |
| `..>` | Dependency (uses / calls) | PredictiveEngine *analyzes* Product |

---

## Domain Boundaries (Bounded Contexts)

| Domain | Package (Spring Boot) | Sponsor Alignment | Responsibility |
|--------|----------------------|-------------------|----------------|
| **A. Core Operations** | `com.bsa.operations` | OSCHO, DEHOGA, visito | Users, venues, shifts, checklists, HACCP, handovers, onboarding/training |
| **B. Inventory & Prediction** | `com.bsa.inventory` | UNIBEV, meincocktailfass, DEHOGA | Product catalog, stock tracking, supplier management, predictive ordering & staffing |
| **C. Digital Menu** | `com.bsa.menu` | Ludwig Heer, meincocktailfass, Mellow Rush | MenuItem↔Recipe↔Product bridge, menu syndication to third parties |
| **D. Guest Experience** | `com.bsa.guest` | Ludwig Heer (Jury!) | Guest profiles, reservations, no-show tracking, reverse guest evaluation, **sales transactions (GuestCheck), revenue tracking, guest lifetime value** |
| **E. Social & Marketing** | `com.bsa.social` | visito, Ludwig Heer | AI post generation, Google review response, media management |
| **F. AI Configuration** | `com.bsa.ai` | All (Differentiator) | Prompt templates, AI personalities per venue, usage logging |

---

## Key Design Decisions (v3 — What Changed & Why)

### New in v3 (GuestCheck — The Missing Transaction)

11. **`GuestCheck` + `GuestCheckItem`** — The transactional entity that records "Who bought what, when, and for how much." Links to `Shift` (revenue per shift), `User` (served by), `GuestProfile` (lifetime value), `Reservation` (fulfills). Includes `GuestCheckStatus` (OPEN → CLOSED → VOIDED → REFUNDED) and `PaymentMethod` enum. `GuestProfile` enhanced with `totalSpend`, `averageSpend`, `isVIP()`, and `recordVisit()`.

### New in v2

1. **`Venue` entity added** — Multi-venue support from day one. DEHOGA wants scalable solutions; our roadmap says "Deploy across Stuttgart." Every domain entity now links to a venue.

2. **`ShiftHandover` entity** — Replaces the weak `Shift.notes` field. OSCHO explicitly wants "Kommunikation im Team ohne WhatsApp-Chaos." Now handovers are first-class structured objects with acknowledgment tracking.

3. **`TrainingModule` + `StaffProgress`** — The Fachkräftemangel (skilled worker shortage) is the #1 industry crisis per DEHOGA. AI-generated onboarding paths with progress tracking directly addresses this. Links to `PromptTemplate` for AI-generated content.

4. **`MenuItem` ≠ `Product`** — Critical separation. A `Product` is what you *stock* (a bottle of Gin, 700ml). A `MenuItem` is what you *sell* ("Gin & Tonic", €9.50). The `Recipe` + `RecipeIngredient` bridge enables **automatic inventory depletion** when a menu item is ordered. This is the deep domain insight that wins hackathons.

5. **`MenuSyndication`** — Ludwig Heer (Jury!) explicitly asked for "Weitergabe an Drittanbieter (speisekarte.de, ...)". This entity syncs menu data to external platforms.

6. **`GuestProfile` + `Reservation` + `GuestEvaluation`** — Ludwig Heer's explicit topic: "Gäste Bewertung" (gastronomer rates guests). The `GuestEvaluation` entity enables **reverse ratings** — restaurants score guests on behavior and punctuality. `GuestProfile.noShowCount` and `guestScore` create a reliability metric. This is our **secret weapon** for the jury.

7. **`PromptTemplate`** — Stores AI personalities in the database. Each venue can customize tone, language, and prompt structure. Categories span all AI use cases (social posts, review responses, onboarding, menu descriptions). Shows architectural depth beyond "we called ChatGPT."

8. **`ReviewResponse`** — Ludwig Heer asked for "Social Media Feedback zu Google Bewertungen." This entity manages AI-generated responses to Google/platform reviews, with approval workflow.

9. **`AIUsageLog`** — Audit trail for all AI interactions. Tracks tokens, latency, acceptance rate. Demonstrates production-readiness and cost awareness.

10. **`COCKTAIL_KEG` + `BOTANICAL_BOOSTER` categories** — Direct nod to meincocktailfass and Mellow Rush sponsors in our data model.

11. **`GuestCheck` ≠ `Order`** — Critical distinction. An `Order` goes **TO a supplier** (money out). A `GuestCheck` comes **FROM a guest** (money in). This completes the financial loop. Without GuestCheck, we track "Inventory going down" but never "Money coming in." The `GuestCheck → GuestCheckItem → MenuItem → Recipe → RecipeIngredient → Product` chain enables automatic inventory depletion on sale, revenue-per-shift analytics, guest lifetime value tracking, and real COGS calculation. This is the transactional backbone that turns a *tool* into a *business intelligence platform*.

### Retained from v1

- **`ShiftAssignment` join entity** — Now enhanced with `AssignmentStatus` (PENDING/CONFIRMED/DECLINED/NO_SHOW)
- **`SupplierProduct` join entity** — Added `minimumOrderQty` for real supplier integration
- **`PredictiveEngine` as `<<service>>`** — Now also suggests staffing levels
- **`AIContentGenerator` as `<<service>>`** — Now accepts `PromptTemplate` parameter
- **`StockLog` event log** — Added `MENU_DEPLETION` type and `shiftId` for shift-level tracking
- **`PhotoProof`** — Shared kernel between checklists (HACCP) and social content

---

## Data Flow: Full Sale Cycle (Transaction → Depletion → Reorder)

```
┌─────────────────────────────────────────────────────────┐
│  MONEY IN (Domain D)                                    │
│                                                         │
│  Staff opens GuestCheck (table 5, Shift #12)            │
│         │                                               │
│         ▼                                               │
│  GuestCheckItem created:                                │
│    ├── 2x "Gin & Tonic" (MenuItem) @ €9.50 = €19.00    │
│    └── 1x "Barrel Old Fashioned" (MenuItem) @ €12.00   │
│         │                                               │
│         ▼                                               │
│  GuestCheck.close(CARD)                                 │
│    subtotal: €31.00 │ tax: €5.89 │ tip: €4.00          │
│    totalAmount: €40.89                                  │
│         │                                               │
│         ├──► GuestProfile.recordVisit(€40.89)           │
│         │      totalVisits++, totalSpend += €40.89      │
│         │      lastVisitAt = now()                      │
│         │                                               │
│         └──► Reservation.status = COMPLETED             │
└─────────┬───────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│  STOCK OUT (Domain B + C)                               │
│                                                         │
│  For each GuestCheckItem:                               │
│    MenuItem → Recipe → RecipeIngredient[]                │
│                                                         │
│  "Gin & Tonic" × 2:                                     │
│    ├── Gin (Product #42) → consume(0.10L)               │
│    ├── Tonic (Product #87) → consume(0.4L)              │
│    └── Lime (Product #103) → consume(2 wedges)          │
│                                                         │
│  "Barrel Old Fashioned" × 1:                            │
│    └── OF Keg (Product #201) → consume(0.15L)           │
│                                                         │
│  Each → StockLog(type=MENU_DEPLETION, shiftId=12)       │
└─────────┬───────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│  AUTO-REORDER (Domain B)                                │
│                                                         │
│  Product.isLowStock()?                                  │
│    └── YES → PredictiveEngine.suggestOrder()            │
│                └── Order(supplier=UNIBEV, auto=true)     │
│                      └── OrderItem: 6x Gin Bottles      │
└─────────────────────────────────────────────────────────┘
```

### Analytics Now Possible

| Metric | How It's Calculated |
|--------|-------------------|
| **Revenue per Shift** | `SUM(GuestCheck.totalAmount) WHERE shiftId = X` |
| **Revenue per Staff** | `SUM(GuestCheck.totalAmount) WHERE servedByUserId = X` |
| **Average Check Size** | `AVG(GuestCheck.totalAmount) WHERE venueId = X` |
| **Top-selling MenuItem** | `SUM(GuestCheckItem.quantity) GROUP BY menuItemId` |
| **Guest Lifetime Value** | `GuestProfile.totalSpend` |
| **Guest Visit Frequency** | `GuestProfile.totalVisits / months since createdAt` |
| **Tip Rate** | `AVG(GuestCheck.tipAmount / GuestCheck.subtotal)` |
| **Cost of Goods Sold** | `SUM(RecipeIngredient.quantity × Product.unitPrice)` per check |
| **Profit per MenuItem** | `MenuItem.price - SUM(RecipeIngredient costs)` |
| **Waste Ratio** | `StockLog(WASTE) / StockLog(MENU_DEPLETION + WASTE)` |

---

## Entity Count Summary

| Domain | Entities | Enums | Services | Total |
|--------|----------|-------|----------|-------|
| Core Operations | 10 | 7 | 0 | 17 |
| Inventory & Prediction | 9 | 4 | 1 | 14 |
| Digital Menu | 4 | 4 | 0 | 8 |
| Guest Experience | 5 | 3 | 0 | 8 |
| Social & Marketing | 5 | 4 | 1 | 10 |
| AI Configuration | 2 | 1 | 0 | 3 |
| **TOTAL** | **35** | **23** | **2** | **60** |
