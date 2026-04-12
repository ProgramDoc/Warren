---
tags: [meta, improvement, strategy, warren]
type: improvement-strategy
date_created: 2026-04-12
---

# Warren Improvement Strategy

## Philosophy

Warren's skills are living documents that improve through continuous use and feedback. Each interaction with Tom provides data about what works and what needs refinement. Financial skills have an additional dimension: they operate on seasonal cycles (quarterly taxes, annual filing, monthly budgets) that create natural calibration points.

Rather than static instruction sets, Warren's skills are:
- **Adaptive**: Updated based on real-world performance and Tom's financial reality
- **Evidence-based**: Improvements grounded in actual usage patterns and accuracy
- **Iterative**: Refined through systematic feedback loops
- **Seasonally calibrated**: Tax and financial cycles create natural review cadences
- **Accuracy-tracked**: Financial skills are measurable — categories are right or wrong, estimates are close or far off

---

## Feedback Loop

### During Conversation
- Note what works well (correct categorizations, useful projections, timely alerts)
- Flag what doesn't (wrong category, missed deduction, inaccurate estimate)
- Tag observations with `#skill-improvement` and the relevant skill name
- Financial corrections carry extra weight — a miscategorized expense or missed deadline has real consequences

### Seasonal Review Cadence

| Period | Review Focus |
|--------|-------------|
| Monthly | Expense categorization accuracy, budget variance analysis |
| Quarterly (Jan, Apr, Jul, Oct) | Tax estimate accuracy, income projection calibration |
| Annual (January) | Year-end review, tax filing prep quality, full system assessment |
| Tax Season (March-April) | CPA handoff smoothness, document completeness |

### Weekly Review
1. Aggregate feedback across all financial conversations
2. Identify patterns: recurring miscategorizations, missing data, unclear reports
3. Prioritize improvements by frequency, financial impact, and effort

### Improvement Cycle
1. **Collect**: Gather feedback from conversations and financial accuracy checks
2. **Analyze**: Identify root causes — is it a skill instruction issue, missing data, or wrong assumption?
3. **Design**: Draft specific improvements to skill instructions
4. **Test**: Validate against known financial data (historical transactions, prior tax returns)
5. **Deploy**: Update live skill, monitor for effectiveness
6. **Monitor**: Track impact over subsequent financial cycles

---

## Skill Lifecycle

### 1. Nascent (Current Stage — All Skills)
- Basic instructions defined
- Works for simple, well-defined financial tasks
- Tom provides heavy guidance on categories, thresholds, preferences
- Duration: First 2-4 weeks of use
- Success: Core functions work, no major categorization errors

### 2. Functional
- Common financial scenarios handled correctly
- Tom's specific income sources, deduction categories, and accounts are known
- Handles 80% of transactions without correction
- Duration: Weeks 4-12
- Success: Monthly reports are useful, tax estimates are within 10% of actual

### 3. Refined
- Understands Tom's financial patterns and preferences deeply
- Anticipates seasonal expenses, flags anomalies accurately
- Tax planning proactively surfaces optimization opportunities
- Duration: Months 3-6
- Success: Quarterly tax estimates within 5% of actual, CPA handoff is seamless

### 4. Polished
- Financial picture maintained with minimal Tom input
- Anomaly detection catches real issues, not false positives
- Tax optimization suggestions are sophisticated and well-timed
- Tom uses Warren confidently for all financial decisions
- Duration: Ongoing refinement
- Success: Tom's financial life runs smoothly with Warren as the backbone

---

## Financial-Specific Calibration

### Categorization Accuracy
Track how often Tom corrects expense categories. Maintain a corrections log:
- Original category assigned → Correct category
- Why the mistake happened (ambiguous merchant, new vendor, rule gap)
- Update categorization rules based on patterns

### Tax Estimate Accuracy
After each quarterly payment, compare Warren's estimate to the CPA's recommendation:
- Variance tracking: Was Warren's estimate higher or lower? By how much?
- Root cause: Missing income source? Wrong tax rate applied? Deduction miscalculation?
- Calibration: Adjust formulas and assumptions for next quarter

### Threshold Tuning
Budget alert thresholds and anomaly detection sensitivity are tuned based on:
- False positive rate (alerts Tom ignores → threshold too sensitive)
- False negative rate (issues Tom catches that Warren missed → threshold too loose)
- Target: Alerts should be actionable 80%+ of the time

---

## Autoresearch Integration

Warren's skills can self-improve through structured experimentation, following the autoresearch pattern:

1. **Skill instructions** (`SKILL.md`) are the equivalent of `train.py` — the code agents modify
2. **Financial data in the vault** provides training signal — do improved instructions produce better categorizations, more accurate estimates, cleaner reports?
3. **Tom's corrections** serve as the evaluation metric — fewer corrections = better skill
4. A **program.md** file in each skill folder can guide research priorities: "Focus on improving deduction categorization for home office expenses" or "Reduce false positives in anomaly detection"

The improvement cycle runs weekly during the review session, not autonomously overnight. Financial skills require human validation before deployment.

---

## New Skill Discovery

Warren should be proactive about identifying when new skills are needed:

- If Tom repeatedly asks for information no current skill covers, propose a new skill
- If a financial workflow requires manual steps that could be systematized, that is a skill opportunity
- As new modules come online (Company Accounts, Investment, Business Strategy), new skills emerge naturally

### Proposing New Skills
1. Identify the pattern: "I've noticed you frequently ask about..."
2. Propose the solution: "I could create a skill that..."
3. Describe the scope: "It would handle X, Y, Z"
4. Get feedback: "Does that capture what you need?"

---

## Integration with Daily Practice

- **Daily**: Log financial transactions, flag anomalies, update cash flow
- **Weekly**: Review categorization accuracy, process any corrections
- **Monthly**: Generate financial summary, compare budget to actual
- **Quarterly**: Tax estimate review, seasonal calibration
- **Annually**: Full system assessment, year-end report, tax filing prep review

---

#meta #improvement #strategy #financial-skills
