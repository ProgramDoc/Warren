---
name: warren-income-tracking
description: "Track every income stream. UCLA salary, AiTheia distributions, consulting, and investment returns — all in one view with tax document reconciliation."
triggers:
  - income
  - salary
  - earnings
  - how much have I made
  - income sources
  - W-2
  - 1099
  - K-1
  - income summary
  - year to date income
  - YTD income
---

# Warren Income Tracking

Tom's income comes from multiple sources with different tax treatments, pay schedules, and documentation requirements. Warren tracks every stream so the full picture is always available.

## Income Sources

Warren maintains a profile for each income source in `05-Income/Sources/`:

### Source Profile Template
```yaml
---
source: [Name]
type: [employment / business / consulting / investment]
tax_treatment: [W-2 / 1099-NEC / K-1 / 1099-DIV / 1099-INT]
pay_schedule: [biweekly / monthly / quarterly / irregular]
expected_annual: $X
withholding: [yes / no]
self_employment_tax: [yes / no]
status: active
---

# [Source Name]

## Details
- Entity: [employer/client name]
- Start date: [when this income started]
- Gross amount per period: $X
- Withholding per period: Federal $X, State $X, FICA $X
- Net per period: $X

## 2026 Income Log
| Date | Gross | Federal WH | State WH | FICA | Net | Notes |
|------|-------|-----------|----------|------|-----|-------|

## YTD Summary
- Gross YTD: $X
- Total Withholding YTD: $X
- Net YTD: $X
```

## Logging Income

Tom can log income in natural language:
- "Got paid $X from UCLA today"
- "AiTheia distribution of $X this month"
- "Received $X consulting payment from [client]"
- "Dividend of $X from [brokerage]"

Warren records the entry in the appropriate source file and updates the annual summary.

## Income Summary View

When Tom asks "How much have I made?" or "What's my YTD income?":

```
INCOME SUMMARY — 2026 YTD (as of [date])

| Source | YTD Gross | YTD Withholding | YTD Net | Projected Annual |
|--------|----------|----------------|---------|-----------------|
| UCLA Salary | $X | $X | $X | $X |
| AiTheia LLC | $X | — | $X | $X |
| Consulting | $X | — | $X | $X |
| Investment Income | $X | — | $X | $X |
| TOTAL | $X | $X | $X | $X |

TAX TREATMENT BREAKDOWN
- W-2 Income (withholding applied): $X
- Self-Employment Income (estimated tax required): $X
- Investment Income (varies): $X

NEXT EXPECTED INCOME
- [Source]: $X on [date]
```

## Tax Document Reconciliation

At year-end, Warren reconciles recorded income against tax documents:

```
TAX DOCUMENT RECONCILIATION — 2025

| Source | Warren Recorded | Tax Document | Document Type | Match? |
|--------|----------------|-------------|---------------|--------|
| UCLA | $X | $X | W-2 | Yes/No |
| AiTheia | $X | $X | K-1 | Yes/No |
| Consulting Client A | $X | $X | 1099-NEC | Yes/No |

DISCREPANCIES TO RESOLVE:
- [Source]: Warren shows $X, document shows $Y. Difference: $Z.
  Possible reason: [timing, unreported payment, error]
```

## Expected Income Tracking

Warren tracks expected vs. received income:
- Expected payment from client hasn't arrived — flag after grace period
- UCLA pay check amount changed — flag for review (raise? benefits change?)
- AiTheia distribution timing shifted — note and update cash flow projections

## Data Storage

- Source profiles: `05-Income/Sources/[Source-Name].md`
- Annual summary: `05-Income/Income-Summary-2026.md`
- Tax document records: `05-Income/Tax-Documents-Income/`
