---
name: warren-cashflow
description: "See your cash position forward. Know what's coming in, what's going out, and when to expect tight spots — 90 days ahead."
triggers:
  - cash flow
  - cashflow
  - when is money coming in
  - bill due
  - upcoming payments
  - cash position
  - account balance
  - when do I get paid
  - bills due
  - upcoming bills
  - can I afford
---

# Warren Cash Flow

Cash flow is about timing. Tom might earn plenty but still hit a cash crunch if a large expense hits before income arrives. Warren projects 90 days forward so surprises don't happen.

## Cash Flow Projection

Warren maintains a rolling 90-day projection in `06-Cash-Flow/Cash-Flow-Projection.md`:

```
CASH FLOW PROJECTION — Next 90 Days (as of [date])

CURRENT BALANCES
| Account | Balance | Purpose |
|---------|---------|---------|
| [Checking - Primary] | $X | Daily expenses |
| [Checking - AiTheia] | $X | Business operations |
| [Savings] | $X | Emergency/reserve |
| TOTAL LIQUID | $X | |

PROJECTED CASH FLOW — Next 30 Days
| Week | Expected In | Expected Out | Net | Projected Balance |
|------|------------|-------------|-----|-------------------|
| Apr 13-19 | $X (UCLA pay) | $X (rent, utilities) | +/-$X | $X |
| Apr 20-26 | $X | $X (insurance) | +/-$X | $X |
| Apr 27-May 3 | $X (UCLA pay) | $X | +/-$X | $X |
| May 4-10 | $X | $X (Q2 est. tax) | +/-$X | $X |

ALERTS
- [date]: Projected balance drops below $X after [payment]. 
  Consider: [delaying payment / transferring from savings / accelerating invoice]

30-60 DAY OUTLOOK: [summary]
60-90 DAY OUTLOOK: [summary]
```

## Recurring Bills Tracker

Maintained in `06-Cash-Flow/Recurring-Bills.md`:

```
RECURRING OBLIGATIONS

| Bill | Amount | Frequency | Due Date | Auto-Pay | Account | Category |
|------|--------|-----------|----------|----------|---------|----------|
| Rent/Mortgage | $X | Monthly | 1st | Yes/No | Checking | Housing |
| Electric | $X | Monthly | 15th | Yes/No | Checking | Utilities |
| Internet | $X | Monthly | 20th | Yes/No | Checking | Utilities |
| Phone | $X | Monthly | 25th | Yes/No | CC | Utilities |
| Car Insurance | $X | Monthly | 1st | Yes/No | Checking | Insurance |
| Health Insurance | $X | Monthly | 1st | Yes/No | Payroll | Health |
| Netflix | $X | Monthly | [date] | Yes | CC | Entertainment |
| [Software Sub] | $X | Monthly/Annual | [date] | Yes | CC | Technology |
| Estimated Tax (Fed) | $X | Quarterly | 15th of quarter | No | Checking | Tax |
| Estimated Tax (CA) | $X | Quarterly | 15th of quarter | No | Checking | Tax |
| CA LLC Fee | $800 | Annual | Apr 15 | No | AiTheia Checking | Tax |

TOTAL MONTHLY OBLIGATIONS: $X
TOTAL QUARTERLY OBLIGATIONS: $X
TOTAL ANNUAL OBLIGATIONS: $X
```

## Bill Due Alerts

When Tom asks "What bills are due?" or "What's coming up?":

```
UPCOMING BILLS — Next 14 Days

| Due Date | Bill | Amount | Auto-Pay | Status |
|----------|------|--------|----------|--------|
| Apr 15 | Q1 Estimated Tax (Fed) | $X | No | UNPAID — Action needed |
| Apr 15 | Q1 Estimated Tax (CA) | $X | No | UNPAID — Action needed |
| Apr 15 | CA LLC Annual Fee | $800 | No | UNPAID — Action needed |
| Apr 20 | Internet | $X | Yes | Auto-pay scheduled |

TOTAL DUE NEXT 14 DAYS: $X
- Requiring manual payment: $X
- Auto-pay: $X
```

## "Can I Afford?" Analysis

When Tom asks "Can I afford [thing]?":

1. Check current liquid balance
2. Project cash flow for next 30 days without the purchase
3. Project cash flow with the purchase
4. Report: "After this $X purchase, your projected balance on [date] would be $Y. Your next income of $Z arrives on [date]. [This looks comfortable / This would be tight / This would put you below your $X threshold]."

## Account Tracking

Each account has a profile in `06-Cash-Flow/Accounts/`:

```yaml
---
institution: [Bank Name]
account_type: [checking / savings / credit card]
account_purpose: [daily spending / business operations / emergency fund]
owner: [personal / AiTheia]
balance_updated: 2026-04-12
current_balance: $X
---

# [Account Name]

## Balance History
| Date | Balance | Notable Changes |
|------|---------|-----------------|

## Linked Bills
- [List of recurring bills paid from this account]

## Notes
- [Any relevant details about this account]
```

## Payment Schedule View

Maintained in `06-Cash-Flow/Payment-Schedule.md` — a calendar view of all outgoing payments:

```
PAYMENT SCHEDULE — April 2026

| Date | Payment | Amount | Method | Status |
|------|---------|--------|--------|--------|
| Apr 1 | Rent | $X | Auto-pay | Paid |
| Apr 15 | Q1 Est. Tax (Fed) | $X | Manual | Due |
| Apr 15 | Q1 Est. Tax (CA) | $X | Manual | Due |
| Apr 15 | CA LLC Fee | $800 | Manual | Due |
| Apr 20 | Internet | $X | Auto-pay | Scheduled |
| Apr 25 | Phone | $X | Auto-pay | Scheduled |

TOTAL APRIL OUTFLOW: $X
```
