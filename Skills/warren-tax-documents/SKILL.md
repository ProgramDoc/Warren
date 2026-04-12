---
name: warren-tax-documents
description: "Every receipt filed, every form tracked, every document ready for your CPA. Tax season should be a handoff, not a scramble."
triggers:
  - receipt
  - tax document
  - tax form
  - file receipt
  - document management
  - CPA package
  - filing prep
  - save receipt
  - log receipt
  - W-2 received
  - 1099 received
  - K-1 received
---

# Warren Tax Documents

Every tax deduction needs a receipt. Every income source generates a form. Every form has a deadline. Warren tracks all of it so tax season is a handoff to the CPA, not a fire drill.

## Document Checklist

Warren maintains a master checklist in `07-Tax-Documents/Document-Checklist-2026.md`:

```
TAX DOCUMENT CHECKLIST — 2026 Tax Year

INCOME DOCUMENTS (Expected January-March 2027)
| Document | From | Expected By | Status | Notes |
|----------|------|------------|--------|-------|
| W-2 | UCLA | Jan 31 | Pending | |
| K-1 (or 1099) | AiTheia LLC | Mar 15 | Pending | |
| 1099-NEC | [Consulting client] | Jan 31 | Pending | |
| 1099-DIV | [Brokerage] | Feb 15 | Pending | |
| 1099-INT | [Bank] | Jan 31 | Pending | |

DEDUCTION DOCUMENTS
| Document | Source | Status | Notes |
|----------|--------|--------|-------|
| 1098 (Mortgage Interest) | [Lender] | Pending | If applicable |
| Property Tax Statement | [County] | Pending | If applicable |
| Charitable Receipts | Various | Ongoing | Track as donated |
| Home Office Calculation | Self-prepared | Pending | Needs square footage |
| Vehicle Mileage Log | Self-maintained | Ongoing | Track as driven |
| Professional Development Receipts | Various | Ongoing | Track as spent |
| Business Travel Receipts | Various | Ongoing | Track as spent |

OTHER DOCUMENTS
| Document | Purpose | Status |
|----------|---------|--------|
| Prior Year Return (2025) | Reference | [Have / Need] |
| Estimated Tax Payment Confirmations | Verify payments | Ongoing |
| Health Insurance (1095) | ACA compliance | Pending |
| Retirement Contribution Statements | Deduction verification | Pending |
```

## Receipt Logging

When Tom says "Save this receipt" or "Log a receipt":

Warren captures:
- **Date**: When the expense occurred
- **Vendor**: Who was paid
- **Amount**: How much
- **Category**: From Chart of Accounts
- **Business purpose**: Why this is deductible (required for business expenses)
- **Documentation**: Description of the receipt (photo reference, email confirmation, etc.)

Receipt entry format:
```yaml
---
date: 2026-04-12
vendor: Staples
amount: $85.00
category: Office Supplies
deductible: true
business_purpose: Printer paper, toner, and USB drives for home office
documentation: email confirmation #12345
---
```

Receipts are logged in `07-Tax-Documents/Receipts/2026-04/` organized by month.

## CPA Filing Package

Warren prepares a complete filing package in `07-Tax-Documents/CPA-Package/Filing-Package-2026.md`:

```
CPA FILING PACKAGE — Tax Year 2026

Prepared by: Warren (Financial Advisor System)
Prepared for: Tom [Last Name]
Date prepared: [date]
CPA: [Name, Firm]

== COVER MEMO ==

Summary of 2026 tax year:
- Total W-2 income: $X (UCLA)
- Total business/self-employment income: $X (AiTheia + consulting)
- Total investment income: $X
- Total gross income: $X
- Estimated total deductions: $X (standard/itemized)
- Estimated tax liability: $X
- Total paid (withholding + estimates): $X
- Estimated refund / amount owed: $X

Special items to discuss:
- [Any unusual transactions, changes in situation, questions]

== INCOME DOCUMENTS ==
1. W-2 from UCLA — [attached/received/pending]
2. K-1 from AiTheia LLC — [attached/received/pending]
3. 1099-NEC from [client] — [attached/received/pending]
4. [Additional documents]

== DEDUCTION SUMMARIES ==

Business Expenses (Schedule C or via AiTheia):
| Category | Annual Total | # of Receipts | Documentation Complete |
|----------|-------------|--------------|----------------------|
| Home Office | $X | N/A (calculation) | Yes/No |
| Business Travel | $X | X receipts | Yes/No |
| Business Meals | $X | X receipts | Yes/No |
| Professional Dev | $X | X receipts | Yes/No |
| Office Supplies | $X | X receipts | Yes/No |
| Technology | $X | X receipts | Yes/No |
| TOTAL | $X | | |

Itemized Deductions (if applicable):
| Category | Annual Total | Documentation |
|----------|-------------|---------------|
| SALT (capped $10K) | $X | Tax returns, property tax |
| Mortgage Interest | $X | 1098 |
| Charitable Giving | $X | Acknowledgment letters |
| TOTAL | $X | |

== ESTIMATED TAX PAYMENTS ==
| Quarter | Federal | California | Date Paid |
|---------|---------|-----------|-----------|
| Q1 | $X | $X | [date] |
| Q2 | $X | $X | [date] |
| Q3 | $X | $X | [date] |
| Q4 | $X | $X | [date] |
| TOTAL | $X | $X | |

== QUESTIONS FOR CPA ==
1. [Any tax treatment questions]
2. [Any ambiguous deductions]
3. [Any strategic planning items for next year]
```

## Document Organization

```
07-Tax-Documents/
  Document-Checklist-2026.md          (master tracker)
  Receipts/
    2026-01/                          (organized by month)
    2026-02/
    ...
  Forms/
    W2/                               (income forms by type)
    1099/
    K1/
    1098/
    1095/
  CPA-Package/
    Filing-Package-2025.md            (prior year, reference)
    Filing-Package-2026.md            (current year, in progress)
```

## Form Tracking Alerts

Warren alerts when:
- Expected tax documents haven't arrived by their deadline (e.g., W-2 not received by February 1)
- A deduction category has receipts but incomplete documentation (missing business purpose)
- The CPA package target delivery date is approaching and documents are still missing
- Year-end is approaching and the document checklist has gaps
