# KesselOps - Domain Flow (Simple)

This is a simplified end-to-end flow of the domain model across the 5 active domains.

```mermaid
flowchart TD

    subgraph OPS["Domain A - Operations"]
        A1["Create venue and staff users"]
        A2["Plan shifts and assignments"]
        A3["Run checklists and handover"]
        A4["Run training and progress tracking"]
    end

    subgraph MENU["Domain C - Menu"]
        C1["Create menu items"]
        C2["Define recipe and ingredients"]
        C3["Sync menu to external channels"]
    end

    subgraph GUEST["Domain D - Guest"]
        D1["Create guest profile (optional)"]
        D2["Create reservation"]
        D3["Open guest check"]
        D4["Add ordered menu items"]
        D5["Close check and collect payment"]
        D6["Create guest evaluation (optional)"]
    end

    subgraph INV["Domain B - Inventory"]
        B1["Write stock logs"]
        B2["Detect low stock"]
        B3["Create supplier orders"]
        B4["Receive delivery and restock"]
    end

    subgraph AI["Domain E - AI"]
        E1["Load prompt template"]
        E2["Generate content or insight"]
        E3["Write AI usage log"]
    end

    A1 --> A2 --> A3
    A2 --> A4

    C1 --> C2 --> C3

    D1 --> D2 --> D3 --> D4 --> D5
    D1 --> D6

    D4 --> X1["Depletion bridge: GuestCheckItem -> MenuItem -> Recipe -> RecipeIngredient -> Product"]
    X1 --> B1 --> B2 --> B3 --> B4 --> B1

    A4 --> E1
    C2 --> E1
    A3 --> E1
    D1 --> E1

    E1 --> E2 --> E3
    E2 --> A4
    E2 --> C1
    E2 --> D1

    D5 --> R1["Revenue analytics by shift, staff, venue"]
    B1 --> R2["Waste and consumption analytics"]
```

## Quick Read

- Operations runs people, shifts, checklists, and onboarding.
- Menu defines what is sold.
- Guest handles reservations, checks, and evaluations.
- Inventory tracks stock and orders suppliers.
- AI supports onboarding, menu content, shift summaries, and guest insight.
- The key business chain is:
  `GuestCheckItem -> MenuItem -> Recipe -> RecipeIngredient -> Product -> StockLog -> Order`.
