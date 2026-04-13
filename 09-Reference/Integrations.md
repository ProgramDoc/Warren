---
title: Warren Integrations Reference
type: reference
tags: [integrations, mcp, api, reference]
date_created: 2026-04-12
last_updated: 2026-04-12
---

# Warren Integrations

Reference guide for all external tool integrations connected to or available for Warren.

## Active Integrations

### Excel MCP Server
- **Type**: MCP Server
- **Package**: `@guillehr2/excel-mcp-server`
- **Purpose**: Create, read, write Excel workbooks for financial tracking, budgets, reports, and dashboards
- **Capabilities**: 30+ tools — cell operations, charts, formatting, CSV/JSON/PDF import/export, dashboard creation
- **Config**: Added to `.mcp.json` in project root
- **Status**: Active — will load on next Claude Code session

### TurboTax / Intuit Connector
- **Type**: Claude Connector (built-in, not MCP)
- **Purpose**: Tax estimates, refund projections, document management, QuickBooks access
- **Setup**: Claude > Profile > Settings > Connectors > Search "Intuit TurboTax" > Connect
- **Status**: Connect via Claude UI when ready

### NotebookLM (notebooklm-py)
- **Type**: Python library + CLI tool
- **Package**: `pip install "notebooklm-py[browser]"`
- **Purpose**: Programmatic access to Google NotebookLM for presentations, podcasts, quizzes, and AI-powered research synthesis
- **Usage**: CLI commands or Python API — call via shell in automation
- **Requires**: Python 3.10+, Playwright + Chromium for auth
- **Status**: Installed in `Warren/.venv/` with Playwright + Chromium
- **Activate**: `source Warren/.venv/bin/activate`

## Planned Integrations

### Plaid (Bank Aggregation)
- **Type**: MCP Server
- **Purpose**: Real-time bank/credit card transaction sync, account balances
- **Options**:
  - **Official Plaid Dashboard MCP**: `https://api.dashboard.plaid.com/mcp/sse` (requires Plaid production account)
  - **Community TypeScript**: `npx @304techmaven/plaid-mcp-server` (requires `PLAID_CLIENT_ID`, `PLAID_SECRET`)
  - **Community .NET**: [arjabbar/PlaidMCP](https://github.com/arjabbar/PlaidMCP) (supports sandbox mode, encrypted token storage)
- **Required**: Plaid developer account (free sandbox available at [dashboard.plaid.com](https://dashboard.plaid.com))
- **Environment Variables**: `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV` (sandbox/development/production)
- **Impact**: Automates transaction import for expense tracking and cash flow — highest-impact integration
- **Status**: Pending — needs Plaid account setup

## Available But Not Yet Configured

### Schwab / Fidelity / Vanguard (Investment Accounts)
- **Options**:
  - [Truthifi](https://truthifi.com) — no-code connector for Schwab, Fidelity, Vanguard via OAuth
  - [sudowealth/schwab-mcp](https://github.com/sudowealth/schwab-mcp) — Schwab-specific, runs on Cloudflare Workers
- **Purpose**: Portfolio analysis, positions, balances, market data (read-only)
- **When**: Module 3 (Investment Advisory)

### Xero MCP (Accounting)
- **Repo**: [XeroAPI/xero-mcp-server](https://github.com/XeroAPI/xero-mcp-server)
- **Purpose**: Full accounting — contacts, invoices, payments, P&L, balance sheets, payroll
- **When**: Module 2 (Company Account Management) — if AiTheia uses Xero

### Financial Datasets MCP (Market Data)
- **Purpose**: Historical stock prices, P/E ratios, SEC filings, analyst estimates
- **When**: Module 3 (Investment Advisory)

### EdgarTools MCP (SEC Filings)
- **Purpose**: 13F filings, insider trading, company filings
- **When**: Module 3 or 4

### OCR / Receipt Scanning
- **Options**: Elite Document OCR Lite (Apify), TextIn OCR MCP, Box AI OCR
- **Purpose**: Automated receipt data extraction from photos/PDFs
- **When**: After Plaid is set up, for receipts that don't flow through bank feeds

## MCP Configuration

MCP servers are configured in `/Users/thomaskingsley/Desktop/Alfred Pennyworth/Warren/.claude/settings.local.json`.

Current config includes Excel MCP server. To add more servers, add entries to the `mcpServers` object.

---

*This document is updated as integrations are added or changed.*
