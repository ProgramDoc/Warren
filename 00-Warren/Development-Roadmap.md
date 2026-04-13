---
title: Warren Development Roadmap
created: 2026-04-12
updated: 2026-04-12
status: active
---

# Warren Multi-Agent Architecture & Module Roadmap

## Architecture

```
Tom (Principal)
 ├── Alfred Pennyworth (Personal Assistant)
 │     └── ← receives daily financial briefs from Warren
 │
 └── Warren (Financial Advisor)
       ├── Warren Coordinator (orchestrates all modules)
       │
       ├── Module 1: Personal Finance & Tax ✅ ACTIVE
       │     ├── Tax Planning Agent
       │     ├── Budget & Expense Agent
       │     ├── Income Tracking Agent
       │     ├── Cash Flow Agent
       │     ├── Tax Document Agent
       │     └── Financial Reporting Agent
       │
       ├── Module 2: Company Account Management 🔒 GATED
       │     ├── AiTheia Bookkeeping Agent
       │     ├── Invoice & AR Agent
       │     └── Business Tax Agent
       │
       ├── Module 3: Investment Advisory 🔒 GATED
       │     ├── Portfolio Analysis Agent
       │     ├── Market Research Agent
       │     └── Risk Assessment Agent
       │
       └── Module 4: Business Strategy 🔒 GATED
             ├── Revenue Strategy Agent
             ├── Growth Planning Agent
             └── Competitive Intelligence Agent
```

## Module Gates

### Module 2 Gate
- [ ] Module 1 skills at Functional stage (80% accuracy)
- [ ] Plaid connected and syncing personal accounts
- [ ] AiTheia S-Corp election decision made with CPA
- [ ] AiTheia LLC bank account identified in Plaid

### Module 3 Gate
- [ ] Module 1 at Refined stage (3-6 months)
- [ ] Module 2 at Functional stage
- [ ] Investment accounts connected via Plaid Investments
- [ ] Tom confirms investment advisory scope

### Module 4 Gate
- [ ] Module 2 at Refined stage
- [ ] Module 3 at Functional stage
- [ ] AiTheia generating consistent revenue data (6+ months)
- [ ] Tom defines strategic planning scope

## Implementation Priority

| Order | Item | Unlocks |
|-------|------|---------|
| 1 | Plaid integration | Automated transactions, M2 gate |
| 2 | Phase 3 right pane | Visual outputs for all modules |
| 3 | Warren Coordinator + Alfred brief | Cross-module routing, Alfred integration |
| 4 | Skill feedback API | Automated improvement tracking |
| 5 | Module 2 agents + skills | AiTheia business management |
| 6 | Phase 4 polish | Audio, markdown, mobile |
| 7 | Module 3 agents + skills | Investment tracking |
| 8 | Module 4 agents + skills | Business strategy |

## Alfred Communication Protocol

Warren generates structured daily briefs:
```
WARREN DAILY BRIEF — [date]
URGENT: [deadlines, budget alerts, overdue items]
STATUS: [cash position, MTD spending, key metrics]
FYI: [upcoming payments, trends, observations]
```

Current: Manual (vault-based). Future: `/api/brief` endpoint callable by Alfred.

## Web App Completed Features

- [x] Phase 1: Chat interface with Claude Opus + 9 tools
- [x] Phase 2: Projects/folders for organizing conversations
- [x] Phase 2.5: Document upload/download with Cloudflare R2
- [ ] Plaid integration
- [ ] Phase 3: Right pane with output tabs (charts, tables)
- [ ] Warren Coordinator + Alfred brief API
- [ ] Phase 4: Audio input, markdown rendering, mobile
