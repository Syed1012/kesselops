# KesselOps — API Contracts

> **Version:** 1.0.0 · **Last updated:** 2026-02-07
> **Architecture:** Modular Monolith (Spring Boot 3.4 + Java 21)
> **AI Decision:** Spring AI — see [AI Decision Rationale](#ai-decision-rationale) below

## Directory Structure

```
contracts/
├── README.md                          ← You are here
├── shared/                            ← Shared schemas, security, parameters
│   └── common-schemas.yaml            ← Response envelope, pagination, error, security
├── openapi/                           ← OpenAPI 3.1.0 contracts (per service)
│   ├── auth-api.yaml                  ← Authentication & session (6 endpoints)
│   ├── operations-api.yaml            ← Service A: Shifts, Users, Venues, Checklists, Training (33 endpoints)
│   ├── inventory-api.yaml             ← Service B: Products, Suppliers, Orders, Predictions (24 endpoints)
│   ├── menu-api.yaml                  ← Service C: MenuItems, Recipes, Syndication (17 endpoints)
│   ├── guest-api.yaml                 ← Service D: Guests, Reservations, Checks (26 endpoints)
│   └── ai-api.yaml                    ← Service E: Prompts, AI Generation, Usage (10 endpoints)
└── asyncapi/                          ← AsyncAPI 3.0.0 contracts
    └── websocket-events.yaml          ← STOMP over WebSocket: 5 topics, all event schemas

> **Note:** Social & Marketing features (post generation, review responses) are handled
> via the AI Service's unified `POST /api/ai/generate` endpoint with categories
> `SOCIAL_POST` and `REVIEW_RESPONSE`. See [`system-design.md`](../docs/system-design.md).
```

## How to Use

### Preview OpenAPI Contracts
```bash
# Swagger UI (any YAML file)
npx @redocly/cli preview-docs contracts/openapi/auth-api.yaml

# Or use Swagger Editor online: https://editor.swagger.io
# Or VSCode extension: "OpenAPI (Swagger) Editor"
```

### Preview AsyncAPI Contracts
```bash
# AsyncAPI Studio: https://studio.asyncapi.com
# Paste the contents of asyncapi/websocket-events.yaml

# Or locally:
npx @asyncapi/cli start studio
```

### Code Generation (Spring Boot)
```bash
# Generate server stubs from OpenAPI
npx @openapitools/openapi-generator-cli generate \
  -i contracts/openapi/operations-api.yaml \
  -g spring \
  -o backend/src/main/java \
  --additional-properties=useSpringBoot3=true,java8=false
```

## AI Decision Rationale

### Why Spring AI over Python + Motia?

| Factor | Spring AI (✅ Chosen) | Python + Motia |
|--------|----------------------|----------------|
| **Deployment** | Single JAR, single Railway instance | 2 runtimes, 2 containers, API gateway needed |
| **Auth** | Shared Spring Security context | Must duplicate JWT validation or add API gateway |
| **Hackathon speed** | Zero infra overhead, call AI from any service | 30-60 min setup for Python service, Docker compose, networking |
| **AI complexity** | Our calls are simple: prompt → LLM → text. No RAG, no agents, no chains | Motia/LangChain shine for complex workflows, multi-step agents |
| **Observability** | Spring Actuator + Micrometer (we already have it) | Motia adds workflow-level observability — overkill for our use case |
| **Latency** | Direct Java method call (~0ms overhead) | HTTP call to Python service (~5-15ms network hop per AI call) |
| **Type safety** | Full compile-time safety on prompts, responses | Runtime type checking |
| **Libraries** | Spring AI supports Anthropic, OpenAI, Ollama natively | Better ecosystem for advanced AI, but we don't need it |

**Bottom line:** Our AI usage is 5 categories of prompt-template → LLM → text-response. No RAG, no vector stores, no multi-step agents, no tool-use. Spring AI handles this perfectly in ~10 lines of code per call. Adding Python + Motia would cost us 2-3 hours of hackathon time on infrastructure that adds zero feature value.

**Post-hackathon?** If KesselOps evolves to need RAG over venue documents, multi-step AI agents, or complex prompt chains — THEN extract the AI module to a Python microservice with Motia/LangChain. The modular monolith design makes this extraction trivial (just replace the internal `AIOrchestrationService` calls with REST calls).

## Endpoint Count

| Contract File | Endpoints | Service Package |
|---------------|-----------|-----------------|
| `auth-api.yaml` | 6 | `com.kesselops.shared.security` |
| `operations-api.yaml` | 33 | `com.kesselops.operations` |
| `inventory-api.yaml` | 24 | `com.kesselops.inventory` |
| `menu-api.yaml` | 17 | `com.kesselops.menu` |
| `guest-api.yaml` | 26 | `com.kesselops.guest` |
| `ai-api.yaml` | 10 | `com.kesselops.ai` |
| `websocket-events.yaml` | 5 topics | WebSocket (STOMP) |
| **TOTAL** | **116 + 5 WS** | — |
