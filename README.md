# Warren - Financial Advisor System

Warren is a financial, tax, and investment advisor that operates as a peer system alongside [Alfred Pennyworth](../Alfred%20Pennyworth/), Tom's AI personal assistant.

## Architecture

Warren operates independently from Alfred. Both report directly to Tom. Warren handles all financial matters; Alfred handles personal assistance, scheduling, and communication. The two coordinate via structured summaries that Alfred can incorporate into daily briefings.

## Modules

| Module | Status | Description |
|--------|--------|-------------|
| Personal Finance & Tax | Active | Tax planning, expense tracking, income management, cash flow, reporting |
| Company Account Management | Planned | AiTheia LLC bookkeeping, AR/AP, payroll, company taxes |
| Investment Advisory | Planned | Portfolio analysis, market research, asset allocation |
| Business Strategy | Planned | Revenue strategy, growth planning, financial modeling |

## Agent Swarm (Personal Finance & Tax)

- **Tax Planning Agent** - Tax strategy, deduction tracking, quarterly estimates
- **Budget & Expense Agent** - Expense categorization, budget tracking
- **Income Tracking Agent** - All income sources (W-2, K-1, 1099)
- **Cash Flow Agent** - 90-day projections, bill tracking
- **Tax Document Agent** - Receipt management, CPA filing packages
- **Financial Reporting Agent** - Monthly summaries, dashboards

## Skills

Each agent has one or more skills (SKILL.md files) that define specific capabilities with triggers, instructions, and examples.

## Privacy

All personal financial data is excluded from this repository via `.gitignore`. Only system structure, skills, charters, templates, and public reference materials are tracked in git.

## Vault

This repository is also an Obsidian vault. Clone it and open in Obsidian to use the full knowledge management system.
