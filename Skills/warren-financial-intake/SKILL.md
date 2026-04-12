---
name: warren-financial-intake
description: "The first conversation Warren needs. Collect your complete financial picture so every other skill has the context it needs to serve you. Run this once to set up, then update as things change."
triggers:
  - financial setup
  - set up warren
  - financial intake
  - get started with finances
  - onboard warren
  - financial profile
  - update financial profile
---

# Warren Financial Intake

Before Warren can manage your financial picture, he needs to see it. This skill conducts a structured interview to collect everything Warren's agents need to operate.

The intake creates a `Financial-Profile.md` in `02-Personal-Finance/` that becomes the foundation for all other skills.

## The Intake Interview

Run this as a conversation. Warren asks questions in sections. Tom answers what he knows; "I'll get back to you on that" is fine — Warren notes it as a follow-up item.

### Section 1: Income Sources

Warren needs to know every way money comes in.

```
INCOME SOURCES

For each source, I need:
- Source name and type (employer, business, consulting, investment)
- Annual amount (approximate is fine)
- Pay schedule (biweekly, monthly, quarterly, irregular)
- Tax treatment (W-2 withholding, 1099, K-1 pass-through)
- Is this amount stable, growing, or variable?

Common sources to cover:
1. UCLA salary (W-2)
   - Gross annual salary
   - Pay schedule
   - Current withholding elections (federal, state)
   - Retirement contributions (403b? Amount?)
   - Health insurance (pre-tax? FSA/HSA?)

2. AiTheia LLC
   - Entity type (LLC, S-Corp election, sole prop?)
   - How Tom takes money out (distributions, salary, both?)
   - Estimated annual revenue
   - Estimated annual net income to Tom
   - Quarterly estimated tax payments being made?

3. Consulting / Speaking / Other
   - Any 1099 income outside AiTheia?
   - Expected annual amount
   - How is this reported? Through AiTheia or personally?

4. Investment Income
   - Dividends, interest, capital gains
   - Approximate annual amount
   - Tax-advantaged vs. taxable accounts
```

### Section 2: Accounts

Warren needs a map of where money lives.

```
ACCOUNTS

For each account:
- Institution name
- Account type (checking, savings, brokerage, retirement, credit card)
- Approximate balance (or range)
- Primary use (daily spending, savings, business operations, investments)
- Is this a personal or business account?

Common accounts to cover:
1. Checking accounts (personal and AiTheia)
2. Savings accounts
3. Credit cards (list each with approximate limit)
4. Retirement accounts (403b, IRA, Roth IRA, Solo 401k, SEP IRA)
5. Brokerage/investment accounts
6. HSA or FSA
7. Any other financial accounts (529, crypto, etc.)
```

### Section 3: Tax Situation

Warren needs to understand Tom's tax position.

```
TAX SITUATION

1. Filing status (Single, MFJ, MFS, HoH)
2. Dependents (if any)
3. State of residence (California confirmed?)
4. Last year's tax return summary:
   - Approximate AGI
   - Total federal tax paid
   - Total state tax paid
   - Refund or amount owed
   - Any special situations (AMT, NIIT, estimated tax penalty)

5. Current year estimated tax payments:
   - Have any Q1 2026 estimated payments been made?
   - Federal amount and date paid
   - California amount and date paid
   - Q1 2026 payment due April 15 — is this planned?

6. Known deductions:
   - Standard or itemized?
   - If itemized: mortgage interest, SALT, charitable, medical?
   - Home office (dedicated space? Square footage?)
   - Professional development (conferences, courses, books)
   - Business travel
   - Professional memberships and dues

7. CPA / Tax Professional:
   - Name and firm
   - How do they prefer to receive materials?
   - When do they typically need materials for filing?
   - Are they handling AiTheia taxes as well?
```

### Section 4: Recurring Obligations

Warren needs to know what goes out regularly.

```
RECURRING OBLIGATIONS

For each:
- Description
- Amount
- Frequency (monthly, quarterly, annual)
- Due date / pay date
- Auto-pay? (yes/no)
- Personal or business?

Common categories:
1. Housing (rent/mortgage, HOA, property tax, insurance)
2. Utilities (electric, gas, water, internet, phone)
3. Insurance (health, auto, life, disability, umbrella)
4. Subscriptions (software, streaming, publications, memberships)
5. Loan payments (student loans, auto, personal)
6. Business expenses (AiTheia recurring costs — hosting, tools, services)
7. Savings/investment contributions (automatic transfers)
```

### Section 5: Financial Goals and Preferences

Warren needs to understand what Tom is working toward.

```
GOALS AND PREFERENCES

1. Short-term goals (next 12 months):
   - Any large purchases planned?
   - Travel or events budgeted?
   - Emergency fund target?

2. Medium-term goals (1-5 years):
   - AiTheia growth plans with financial implications?
   - Real estate?
   - Education expenses?

3. Long-term goals:
   - Retirement timeline and target
   - Wealth building strategy
   - Estate planning considerations

4. Risk tolerance:
   - Conservative, moderate, or aggressive?
   - How comfortable are you with investment volatility?

5. Preferences:
   - How often do you want financial updates? (daily, weekly, monthly)
   - What format? (brief bullet points, detailed reports, on-demand only)
   - Any financial topics you specifically want Warren to focus on?
   - Any topics that are out of scope?
```

## After the Interview

Once the interview is complete, Warren:

1. **Creates `02-Personal-Finance/Financial-Profile.md`** — A structured summary of everything collected, organized by section.

2. **Creates `02-Personal-Finance/Accounts.md`** — A master list of all accounts with types and purposes.

3. **Creates `06-Cash-Flow/Recurring-Bills.md`** — All recurring obligations with amounts and due dates.

4. **Creates `05-Income/Income-Summary-2026.md`** — All income sources with expected amounts and timing.

5. **Populates `03-Tax/Deduction-Categories/`** — One file per deduction category Tom uses, with rules and documentation requirements.

6. **Identifies follow-up items** — Anything Tom said "I'll get back to you on" gets logged as a follow-up in the daily ledger.

7. **Flags urgent items** — If Q1 estimated taxes haven't been paid and April 15 is imminent, that gets flagged immediately.

## Updating the Profile

The intake isn't a one-time event. When Tom's financial situation changes (new income source, new account, change in tax situation), he can run this skill again. Warren updates the existing profile rather than creating a new one.

Triggers for re-running:
- "Update my financial profile"
- "I opened a new account"
- "My salary changed"
- "I started a new consulting engagement"
- "Update my tax situation"

## The Output Format

Financial Profile structure:

```yaml
---
date_created: 2026-04-12
last_updated: 2026-04-12
type: financial-profile
tags: [personal-finance, profile, core]
status: active
---

# Tom's Financial Profile

## Income Sources
| Source | Type | Annual Amount | Schedule | Tax Treatment |
|--------|------|--------------|----------|---------------|

## Accounts
| Institution | Type | Approximate Balance | Purpose |
|-------------|------|-------------------|---------|

## Tax Situation
- Filing Status:
- State: California
- 2025 AGI:
- Estimated Tax Payments (2026):
- Deduction Method: Standard / Itemized

## Recurring Obligations
| Description | Amount | Frequency | Due Date | Auto-Pay |
|-------------|--------|-----------|----------|----------|

## Financial Goals
### Short-term (12 months)
### Medium-term (1-5 years)
### Long-term

## Preferences
- Update Frequency:
- Report Format:
- Focus Areas:

## Follow-Up Items
- [ ] ...

## CPA Information
- Name:
- Firm:
- Preferred Materials Format:
- Filing Timeline:
```
