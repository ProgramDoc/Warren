---
name: warren-expense-tracking
description: "Know where every dollar goes. Categorize expenses, track budgets, and spot anomalies before they become problems. Log expenses as they happen or in batches."
triggers:
  - expenses
  - spending
  - budget
  - categorize
  - how much did I spend
  - expense report
  - budget tracking
  - log expense
  - I spent
  - I bought
  - I paid
---

# Warren Expense Tracking

Every dollar has a category. Every category has a budget. Every budget has a variance. Warren tracks all three so Tom always knows where his money is going.

## Logging Expenses

### Quick Entry
Tom can log expenses in natural language:

- "I spent $45 on lunch with a client"
- "Paid $200 for conference registration"
- "$85 at Staples for office supplies"
- "Uber to LAX, $42"

Warren parses the entry and creates a structured record:

```
| Date | Description | Amount | Category | Sub-Category | Tax-Deductible | Business Purpose |
|------|-------------|--------|----------|--------------|----------------|------------------|
| 2026-04-12 | Client lunch | $45.00 | Meals & Entertainment | Business Meals | Yes (50%) | Client relationship — [name] |
```

### What Warren Captures
For each expense:
- **Date**: When it happened
- **Description**: What it was
- **Amount**: How much
- **Category**: From the [[Chart-of-Accounts]]
- **Sub-category**: More specific classification
- **Tax-deductible**: Yes/No/Partial (with percentage)
- **Business purpose**: Why this is a business expense (required for deductible items)
- **Account**: Which payment method was used (if known)
- **Personal vs. Business**: Clear separation

### Ambiguous Entries
When Warren can't confidently categorize an expense:
- Ask Tom: "Is the $200 at Best Buy a business expense (equipment) or personal?"
- Learn from the answer: If Tom says "Best Buy is always business — that's where I buy peripherals," Warren remembers this for future categorization.

## Chart of Accounts (Standard Categories)

Warren uses a standard chart of accounts stored in `04-Budget/Categories/Chart-of-Accounts.md`. Default categories:

### Personal Categories
| Category | Description | Budget (Monthly) |
|----------|-------------|-----------------|
| Housing | Rent/mortgage, HOA, property tax, home insurance | TBD |
| Utilities | Electric, gas, water, internet, phone | TBD |
| Groceries | Food for home consumption | TBD |
| Dining Out | Restaurants, delivery (personal, non-business) | TBD |
| Transportation | Gas, car payment, insurance, maintenance, transit | TBD |
| Health | Insurance premiums, copays, prescriptions, gym | TBD |
| Personal Care | Clothing, grooming, personal items | TBD |
| Entertainment | Streaming, events, hobbies, recreation | TBD |
| Subscriptions | Non-business subscriptions | TBD |
| Savings/Investments | Transfers to savings, investment contributions | TBD |
| Miscellaneous Personal | Gifts, donations (personal), other | TBD |

### Business Categories (Tax-Deductible)
| Category | Description | Deduction Type |
|----------|-------------|----------------|
| Home Office | Rent/utilities apportioned to office space | Simplified or Actual |
| Professional Development | Conferences, courses, books, certifications | Full deduction |
| Business Travel | Flights, hotels, ground transport for business | Full deduction |
| Business Meals | Meals with clients, colleagues for business purposes | 50% deduction |
| Office Supplies | Equipment, software, supplies for work | Full deduction |
| Professional Memberships | Dues, association fees | Full deduction |
| Business Insurance | Professional liability, E&O | Full deduction |
| Business Services | Accounting, legal, consulting fees paid | Full deduction |
| Technology | Software subscriptions, hosting, tools for business | Full deduction |
| Communication | Business phone, internet (business portion) | Prorated |
| Charitable Giving | Donations to qualified organizations | Itemized deduction |
| Vehicle (Business Use) | Mileage or actual expenses for business driving | Standard mileage or actual |

Budgets are set to TBD until Tom provides targets during the financial intake or first budget review.

## Budget Tracking

### Monthly Budget View
```
MONTHLY BUDGET — April 2026

PERSONAL SPENDING
| Category | Budget | Spent | Remaining | % Used |
|----------|--------|-------|-----------|--------|
| Housing | $X | $X | $X | XX% |
| Groceries | $X | $X | $X | XX% |
| ... | | | | |
| TOTAL PERSONAL | $X | $X | $X | XX% |

BUSINESS SPENDING
| Category | Budget | Spent | Remaining | % Used |
|----------|--------|-------|-----------|--------|
| Home Office | $X | $X | $X | XX% |
| Professional Dev | $X | $X | $X | XX% |
| ... | | | | |
| TOTAL BUSINESS | $X | $X | $X | XX% |

GRAND TOTAL: $X spent of $X budgeted (XX%)
```

### Budget Alerts
Warren alerts when:
- Any category exceeds 80% of monthly budget (yellow alert)
- Any category exceeds 100% of monthly budget (red alert)
- Overall spending exceeds 90% of total monthly budget
- A single transaction exceeds $500 (configurable threshold)
- An unfamiliar merchant appears in a sensitive category

Alert format:
```
BUDGET ALERT: Professional Development spending at 95% of monthly budget ($475 of $500).
Recent charges: $200 conference registration, $150 online course, $125 books.
Action needed? Adjust budget or note as expected seasonal spike?
```

## Anomaly Detection

Warren flags unusual patterns:
- **Amount outliers**: Transactions significantly larger than typical for the category
- **Duplicate charges**: Same amount to same merchant within 48 hours
- **New recurring charges**: First-time charges that look like subscriptions
- **Category shifts**: Spending patterns that deviate significantly from 3-month average
- **Weekend/odd-hour charges**: Unusual timing patterns (potential fraud indicator)

## Where Expenses Are Stored

- **Daily entries**: `01-Daily-Ledger/2026-04-12.md` (today's transactions)
- **Monthly summaries**: `04-Budget/Monthly-Spending/2026-04-Spending.md`
- **Annual budget**: `04-Budget/Budget-2026.md`
- **Category definitions**: `04-Budget/Categories/Chart-of-Accounts.md`
- **Anomalies**: `04-Budget/Anomalies/` (one file per flagged item)

## Batch Entry

Tom can log multiple expenses at once:

"Log these expenses:
- $12 coffee meeting with grad student (Monday)
- $45 Uber to client site (Tuesday)
- $200 Amazon — new monitor for home office (Tuesday)
- $35 lunch with Will Lee (Wednesday)"

Warren categorizes each, asks about any ambiguous items, and creates entries for all of them.

## Spending Analysis

When Tom asks "How much did I spend on X?", Warren can answer for:
- Any category, any time period
- Personal vs. business breakdowns
- Month-over-month comparisons
- Year-to-date totals
- Tax-deductible vs. non-deductible splits
