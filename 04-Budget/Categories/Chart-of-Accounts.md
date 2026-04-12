---
title: Chart of Accounts
type: reference
tags: [budget, categories, reference, chart-of-accounts]
date_created: 2026-04-12
last_updated: 2026-04-12
---

# Chart of Accounts

Standard expense and income categories used across all Warren agents for consistent categorization.

## Personal Expense Categories

| Code | Category | Description | Tax-Deductible |
|------|----------|-------------|----------------|
| P-HOU | Housing | Rent/mortgage, HOA, property tax, home insurance, repairs | Mortgage interest (itemized) |
| P-UTL | Utilities | Electric, gas, water, trash, internet, phone | Business portion deductible |
| P-GRC | Groceries | Food and household supplies for home | No |
| P-DIN | Dining Out | Restaurants, delivery, coffee (personal) | No |
| P-TRN | Transportation | Gas, car payment, insurance, maintenance, transit, parking | Business mileage deductible |
| P-HLT | Health | Insurance premiums, copays, prescriptions, dental, vision | SE health insurance deduction |
| P-FIT | Fitness | Gym membership, equipment, wellness | No |
| P-CLO | Clothing | Personal clothing and accessories | No |
| P-ENT | Entertainment | Streaming, events, hobbies, recreation | No |
| P-SUB | Subscriptions | Personal subscriptions (news, apps, services) | No |
| P-EDU | Education | Personal education (non-business) | Possible credit |
| P-GFT | Gifts | Personal gifts | No |
| P-CHR | Charitable Giving | Donations to qualified 501(c)(3) organizations | Itemized deduction |
| P-INS | Insurance | Life, disability, umbrella (personal policies) | No |
| P-SAV | Savings/Investments | Transfers to savings, investment contributions | N/A (not expense) |
| P-MSC | Miscellaneous Personal | Other personal expenses | No |

## Business Expense Categories

| Code | Category | Description | Deduction Type |
|------|----------|-------------|----------------|
| B-HOM | Home Office | Rent/utilities apportioned to dedicated office space | Simplified ($5/sqft, max $1,500) or Actual |
| B-TRV | Business Travel | Flights, hotels, ground transport for business purposes | Full deduction |
| B-MEL | Business Meals | Meals with clients/colleagues for business discussion | 50% deduction |
| B-OFC | Office Supplies | Equipment, paper, toner, peripherals, furniture | Full deduction |
| B-TEC | Technology | Software subscriptions, hosting, domains, SaaS tools | Full deduction |
| B-PDV | Professional Development | Conferences, courses, books, certifications, training | Full deduction |
| B-MEM | Professional Memberships | Association dues, professional organization fees | Full deduction |
| B-SVC | Professional Services | Accounting, legal, consulting fees paid to others | Full deduction |
| B-INS | Business Insurance | Professional liability, E&O, cyber | Full deduction |
| B-COM | Communication | Business phone, internet (business portion) | Prorated deduction |
| B-VEH | Vehicle (Business Use) | Mileage or actual expenses for business driving | Standard mileage rate or actual |
| B-MKT | Marketing | Advertising, website, promotional materials | Full deduction |
| B-PAY | Payroll | Employee wages, contractor payments (via AiTheia) | Full deduction |
| B-MSC | Miscellaneous Business | Other business expenses | Depends on nature |

## Income Categories

| Code | Category | Description | Tax Treatment |
|------|----------|-------------|---------------|
| I-SAL | Salary (W-2) | Employment income with withholding | W-2, FICA withheld |
| I-BUS | Business Income | AiTheia LLC revenue/distributions | K-1 or Schedule C, SE tax |
| I-CON | Consulting | 1099 consulting income | 1099-NEC, SE tax |
| I-SPK | Speaking Fees | Speaking engagement income | 1099-NEC or via AiTheia |
| I-DIV | Dividends | Investment dividends | 1099-DIV, qualified vs. ordinary |
| I-INT | Interest | Bank/bond interest | 1099-INT |
| I-CGN | Capital Gains | Investment gains from sales | 1099-B, short vs. long term |
| I-RNT | Rental Income | Rental property income (if applicable) | Schedule E |
| I-ROY | Royalties | Book, IP, or patent royalties | 1099-MISC |
| I-MSC | Miscellaneous Income | Other income | Varies |

## Categorization Rules

When categorizing expenses, apply these rules in order:

1. **Merchant-based rules**: Known merchants map to known categories (e.g., "UCLA Bookstore" → B-PDV, "Trader Joe's" → P-GRC)
2. **Amount-based hints**: Very large amounts at unfamiliar merchants warrant clarification
3. **Context clues**: Time of day, day of week, and description text can disambiguate
4. **Ask when uncertain**: If confidence is below 80%, ask Tom before categorizing
5. **Learn from corrections**: When Tom corrects a categorization, update merchant mapping

## Notes

- Categories marked TBD for monthly budgets will be populated during or after the financial intake
- New categories can be added as Tom's financial situation evolves
- Category codes (P-xxx, B-xxx, I-xxx) are for internal reference; natural language names are used in reports
