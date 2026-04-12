---
name: warren-tax-calendar
description: "Never miss a tax deadline. Federal, California, and AiTheia LLC filing dates tracked and alerted with enough lead time to act."
triggers:
  - tax deadlines
  - filing dates
  - when are taxes due
  - quarterly payment due
  - tax calendar
  - upcoming tax dates
  - April 15
  - estimated taxes due
---

# Warren Tax Calendar

Tax deadlines are non-negotiable. Missing one costs money (penalties and interest) and stress. Warren tracks every deadline and alerts with enough lead time for Tom to act or delegate to the CPA.

## 2026 Federal Tax Calendar

### Individual Filing (Form 1040)

| Date | Deadline | Action Required |
|------|----------|-----------------|
| **April 15, 2026** | 2025 tax return due (or extension) | File return or Form 4868 extension |
| **April 15, 2026** | Q1 2026 estimated tax payment | Pay federal estimated tax (Form 1040-ES) |
| **June 15, 2026** | Q2 2026 estimated tax payment | Pay federal estimated tax |
| **September 15, 2026** | Q3 2026 estimated tax payment | Pay federal estimated tax |
| **October 15, 2026** | Extended 2025 return due | File if extension was filed |
| **January 15, 2027** | Q4 2026 estimated tax payment | Pay federal estimated tax |

### AiTheia LLC

| Date | Deadline | Action Required |
|------|----------|-----------------|
| **March 15, 2026** | LLC/S-Corp return due (if S-Corp election) | File Form 1120-S or extension |
| **April 15, 2026** | LLC return due (if partnership/sole prop) | File Schedule C or Form 1065 |
| **September 15, 2026** | Extended LLC/S-Corp return due | File if extension was filed |

### Information Returns (Documents Tom Receives)

| Date | Document | From |
|------|----------|------|
| **January 31** | W-2 | UCLA |
| **January 31** | 1099-NEC | Consulting clients |
| **February 15** | 1099-DIV, 1099-INT | Brokerages, banks |
| **March 15** | K-1 (Schedule K-1) | AiTheia LLC (if partnership) |
| **January 31** | 1099-MISC | Other income sources |
| **January 31** | 1098 | Mortgage lender (if applicable) |

## 2026 California Tax Calendar

| Date | Deadline | Action Required |
|------|----------|-----------------|
| **April 15, 2026** | 2025 CA return due (or extension) | File Form 540 or extension |
| **April 15, 2026** | Q1 2026 CA estimated tax | Pay CA estimated tax (Form 540-ES) |
| **June 15, 2026** | Q2 2026 CA estimated tax | Pay CA estimated tax |
| **September 15, 2026** | Q3 2026 CA estimated tax | Pay CA estimated tax |
| **October 15, 2026** | Extended 2025 CA return due | File if extension was filed |
| **January 15, 2027** | Q4 2026 CA estimated tax | Pay CA estimated tax |
| **April 15, 2026** | AiTheia LLC annual fee ($800 minimum) | California Franchise Tax Board |

## Alert Protocol

When Tom asks about upcoming tax deadlines, Warren provides:

1. **Immediate deadlines** (within 14 days) — Urgent, with specific action items
2. **Upcoming deadlines** (15-60 days) — Advance notice, with preparation checklist
3. **Future deadlines** (60+ days) — FYI, no action needed yet

### Alert Format

```
TAX DEADLINE ALERT

URGENT (Due within 14 days):
  April 15, 2026 — Q1 Federal Estimated Tax Payment
  Status: [PAID / UNPAID / UNKNOWN]
  Action: [Pay via IRS Direct Pay / Send to CPA / Confirm status]
  Amount: $[estimated from tax planning] or [needs calculation]

  April 15, 2026 — Q1 California Estimated Tax Payment
  Status: [PAID / UNPAID / UNKNOWN]
  Action: [Pay via FTB / Send to CPA / Confirm status]

  April 15, 2026 — 2025 Federal Tax Return (or Extension)
  Status: [FILED / EXTENSION FILED / PENDING]
  Action: [Confirm with CPA / File extension]

UPCOMING (Next 60 days):
  June 15, 2026 — Q2 Estimated Tax Payments (Federal + CA)
  Preparation: Review income through May, recalculate estimates

NO FURTHER DEADLINES until September 15, 2026.
```

## Coordination with Alfred

When tax deadlines fall within 14 days, Warren generates a structured alert that Alfred can include in the morning briefing:

```
WARREN FINANCIAL ALERT:
- Q1 estimated tax payment due April 15 (3 days). Status: [check needed].
- 2025 return filing deadline April 15. Status: [check with CPA].
```

## Safe Harbor Rules

Warren tracks safe harbor thresholds to avoid underpayment penalties:

**Federal**: Pay at least 100% of prior year tax (110% if AGI > $150,000) through withholding and estimated payments.

**California**: Pay at least 90% of current year tax or 100% of prior year (110% if AGI > $150,000 for CA).

Warren flags when cumulative payments may fall below safe harbor at each quarterly checkpoint.

## Extension Protocol

If Tom needs an extension:
1. **Federal**: File Form 4868 by April 15. Extends filing to October 15. Does NOT extend payment deadline — estimated tax still due April 15.
2. **California**: File by April 15. Extends filing to October 15. Same payment rules as federal.

Warren notes: An extension to file is NOT an extension to pay. If Tom owes tax, it must be estimated and paid by April 15 to avoid penalties.
