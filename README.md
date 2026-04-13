# Warren - Financial Advisor System

Warren is a financial, tax, and investment advisor that operates as a peer system alongside [Alfred Pennyworth](../Alfred%20Pennyworth/), Tom's AI personal assistant.

## Live App

**https://warren-dashboard.onrender.com** — AI-powered financial advisor chat, backed by Claude Opus with 9 specialized financial tools.

## Architecture

Warren operates independently from Alfred. Both report directly to Tom. Warren handles all financial matters; Alfred handles personal assistance, scheduling, and communication. The two coordinate via structured summaries that Alfred can incorporate into daily briefings.

### Web App

- **Stack:** Next.js 16.2.3, TypeScript, Tailwind CSS v4, PostgreSQL
- **Hosting:** Render.com (Web Service + PostgreSQL)
- **AI:** Claude Opus via SSE streaming with tool-use for agent routing
- **Auth:** Email/password (bcrypt 12 rounds) + TOTP 2FA, JWT sessions
- **RBAC:** Owner (full financial access) | Household (shared budgets only)
- **Design:** "The Sovereign Intelligence" — deep navy palette, Manrope/Inter typography, glassmorphism

### Obsidian Vault

This repository is also an Obsidian vault with SKILL.md agent architectures, financial charters, and reference materials. Clone and open in Obsidian to use the full knowledge management system.

## Modules

| Module | Status | Description |
|--------|--------|-------------|
| Personal Finance & Tax | Active | Tax planning, expense tracking, income management, cash flow, reporting |
| Company Account Management | Planned | AiTheia LLC bookkeeping, AR/AP, payroll, company taxes |
| Investment Advisory | Planned | Portfolio analysis, market research, asset allocation |
| Business Strategy | Planned | Revenue strategy, growth planning, financial modeling |

## Agent Swarm (Personal Finance & Tax)

| Agent | Tools | Domain |
|-------|-------|--------|
| Tax Planning | `get_tax_deadlines`, `get_tax_position` | Tax strategy, quarterly estimates |
| Budget & Expense | `get_budget_progress`, `get_expense_breakdown`, `log_expense` | Spending, budgets, categorization |
| Income Tracking | `get_income_summary` | All income sources (W-2, K-1, 1099) |
| Cash Flow | `get_cashflow_projection`, `get_recurring_bills` | 90-day projections, bill tracking |
| Tax Document | — | Receipt management, CPA filing packages |
| Financial Reporting | `get_alerts` | Monthly summaries, alerts |

## Development

```bash
cd Warren/app
npm run dev        # Start dev server (localhost:3000)
npm run build      # Production build
```

## Privacy

All personal financial data is excluded from this repository via `.gitignore`. Only system structure, skills, charters, templates, and public reference materials are tracked in git.
