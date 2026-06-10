# Ujima AI Governance Deliverables

Date: 2026-06-02

This dossier converts the four-phase brief into deployable diagnostic, fluency, ethics, and agent-design artifacts for Ujima's SACCO lending workflow. It treats the supplied approval rates and local examples as case data, and marks claims requiring live operational validation before production.

## Source Grounding

Verified anchors:

- CBK has warned that a CRB credit score should not be the sole reason for loan denial; lending decisions should consider other factors and support risk-based pricing. Source: Central Bank of Kenya press release, 2022-11-11, https://www.centralbank.go.ke/uploads/press_releases/1307549356_Press%20Release%20-%20Update%20on%20the%20Credit%20Information%20Sharing%20Framework.pdf
- Kenya's Digital Credit Providers Regulations require reasonable assessment of ability to repay before advancing credit, fair and transparent customer information, secure systems, and complaints redress. Source: Kenya Law, The Central Bank of Kenya (Digital Credit Providers) Regulations, 2022, https://new.kenyalaw.org/akn/ke/act/ln/2022/46/eng%402022-04-22
- Kenya's Data Protection General Regulations require specific, voluntary consent and disclosure of purpose, data types, automated decision-making use, third-party sharing, withdrawal rights, and implications of consent choices. Source: Kenya Law, Data Protection (General) Regulations, 2021/2022, https://new.kenyalaw.org/akn/ke/act/ln/2021/263/eng%402022-12-31
- SASRA is the statutory SACCO regulator and publishes the SACCO Societies Act plus deposit-taking and non-deposit-taking SACCO regulations. Source: SASRA Acts & Regulations, https://www.sasra.go.ke/acts-regulations/
- KAOP exists as the Kenya Agricultural Observatory Platform and includes climate, weather, agronomic advisory, agricultural insights, and market information functions. Source: KAOP, https://www.kaop.co.ke/
- KAOP was originally developed by KALRO and has been enhanced with AgData Hub integrations spanning climate, soil, market, and crop information. Source: CGIAR, 2026-01-27, https://www.cgiar.org/news-events/news/foundation-transforming-kenyas-agriculture-kaop-agdata-hub
- AWS Africa (Cape Town), region code af-south-1, has three Availability Zones in South Africa. Source: AWS documentation, https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html

Claims corrected before deployment:

- "Kenya DPA 2022" should be written as Kenya Data Protection Act, 2019, plus Data Protection Regulations published/commenced in January 2022 and revised in December 2022.
- "All data stored on AWS Africa region" is not the same as Kenyan data sovereignty. Cape Town storage is in South Africa; Kenyan personal data controls still need DPA-compliant transfer, processor, localization, and risk review.
- "Live Kenya Agricultural Observatory price API" is not confirmed from the public sources above. Treat KAOP as a validated data source target, but verify API terms, coverage, and uptime before production.
- "Matooke harvest cycles March/April and September/October" is valid as product memory only until localized by county/district and crop calendar data. Do not hard-code it as universal.

## Phase 1: AIM/MAP Diagnostic Report

### AIM Bias Audit

A - Act:

Act as a bias auditor for SACCO lending. Audit Ujima's 2025 loan approval pipeline for occupation-based disparate impact, with a special focus on informal and seasonal workers.

I - Investigate:

Observed case data:

- "Market vendor" denial rate: 68%
- "Formal employee" denial rate: 22%
- Disparity: 46 percentage points
- Denial-rate ratio: 3.09x higher for market vendors

Immediate audit interpretation:

The disparity is severe enough to trigger mandatory model and policy review. Occupation may be functioning as a proxy for informality, gender, location, ethnicity, irregular documentation, or unstable salary assumptions. Under CBK-aligned customer-centric lending, a single weak signal such as occupation classification should not drive denial without repayment-capacity evidence.

M - Model 3 Data Pipeline Failure Hypotheses:

1. Occupation taxonomy collapse

   The pipeline may map diverse informal livelihoods into one high-risk label: "market vendor." This can erase meaningful differences between a vegetable stall owner with daily M-Pesa turnover, a wholesale trader with seasonal bulk purchases, a shea butter trader, and a casual hawker.

   Test: Sample 300 "market vendor" files and compare raw self-description, agent-entered occupation, inferred occupation, income evidence, county, gender, and decision reason. Measure how often materially different businesses are collapsed into the same label.

2. Income smoothing failure

   The model may treat volatile cash flow as poor repayment capacity rather than seasonal or weekly liquidity. Market vendors often show daily small deposits, harvest-linked spikes, school-fee dips, and mobile-money churn that can look noisy to a salary-trained model.

   Test: Re-score applications using 90-day, 180-day, and harvest-cycle-aware cash-flow features. Compare false denial rates for vendors whose annualized cash flow equals or exceeds formal employees.

3. Documentation and channel bias

   Formal employees may have payslips, employer references, bank statements, and predictable payroll deposits. Vendors may rely on M-Pesa, chama records, supplier receipts, SACCO deposits, or cash turnover, which the current pipeline may underweight or ignore.

   Test: Run counterfactual applications where repayment cash flow is identical but documentation type changes from payslip to mobile-money/chama evidence. Any decision degradation indicates channel bias.

### MAP Repayment Design

M - Memory:

Use matooke and maize harvest-cycle memory as a prompt constraint, but require county/district validation from KAOP, KALRO, or local cooperative data before production.

A - Assets:

Use opt-in member transaction history:

- Daily/weekly mobile-money inflows
- SACCO savings deposits
- Chama contributions
- Merchant till activity
- School-fee season withdrawals
- Harvest month income spikes
- Prior repayment behavior

P - Prompt:

Generate four repayment schedules aligned to agricultural liquidity cycles. Assume principal KES 28,000, monthly reducing-balance interest validated by the SACCO finance team, and repayment capacity derived from opt-in transaction history. Do not use occupation alone as a risk factor. Explain each schedule in member-friendly language and include a hardship fallback.

Four repayment schedules:

1. Harvest-heavy balloon schedule

   Member pays small maintenance instalments during lean months and larger instalments within 30 days after verified harvest-market sales. Best for farmers with clear harvest peaks and low off-season cash flow.

2. Weekly market-cash schedule

   Member pays smaller weekly amounts after high-turnover market days. Best for vendors whose liquidity appears in frequent small inflows rather than monthly salary deposits.

3. School-fee buffer schedule

   Repayments dip during January, May, and September school-fee pressure periods, then recover in the following month. Best for caregivers whose transaction history shows predictable education-related withdrawals.

4. Chama-linked savings-first schedule

   Member contributes to SACCO or chama buffer for the first two weeks, then begins repayment once minimum liquidity reserve is met. Best for members with repayment willingness but thin emergency reserves.

### Chain-of-Thought + Verifier Pattern

Production-safe command:

```
Analyze the application using auditable reasoning, but do not reveal private chain-of-thought to the applicant. Return:
1. Decision recommendation.
2. Evidence used.
3. Evidence not used and why.
4. Bias checks performed.
5. Repayment-capacity calculation.
6. Counterfactual test: would the recommendation change if the applicant were labeled "formal employee" with identical cash flow?
7. Member-facing explanation in respectful Swahili or English.
8. Verifier verdict: pass, revise, or escalate.
```

Verifier checks:

- Credit score is not sole basis for denial.
- Repayment ability has been reasonably assessed.
- Occupation, gender, ethnicity, county, language, and phone metadata are not used as unjustified proxies.
- Interest, fees, and risk terms are fair, clear, and transparent.
- Consent, withdrawal, and complaint rights are available.

### OCEAN Verification

O - Official source:

Use CBK, Kenya Law, SASRA, ODPC, KAOP/KALRO, and SACCO policy documents as primary evidence.

C - Claim:

Every numerical, legal, pricing, or agricultural-calendar claim must be tagged as verified, assumed, or unavailable.

E - Evidence:

Maintain link, retrieval date, version, and owner.

A - Applicability:

Check whether the rule applies to deposit-taking SACCOs, non-deposit-taking SACCOs, digital credit providers, CRBs, or internal AI tooling.

N - Next action:

If evidence is missing or ambiguous, escalate before deployment.

Five facts verified or corrected:

- Verified: CBK discourages using credit score as sole denial reason.
- Verified: Digital lenders must assess repayment ability before credit is advanced.
- Verified: Customer information must be fair, clear, transparent, current, and available.
- Verified: Data consent must be specific, informed, voluntary, and withdrawable.
- Corrected: AWS Africa/Cape Town storage is South Africa-based, not Kenya-based.
- Corrected: "DPA 2022" is shorthand and should be replaced with the legal name and regulation dates.

## Phase 2: 4D Fluency Blueprint

### Delegation

Human tasks:

- Final loan approval for amounts above KES 50,000.
- Review of any denial affecting household food security.
- Cultural nuance for naming, language, informal work, and community context.
- Regulatory sign-off for credit policy and pricing.

AI tasks:

- Process Tier-1 FAQs and eligibility guidance.
- Detect transaction-pattern seasonality.
- Draft member-facing SMS explanations.
- Prepare audit packets for human review.
- Flag anomalies in approval rates by occupation, sub-county, and gender.

Collaborative tasks:

- Financial-literacy content: human supplies local metaphors, AI structures lessons.
- Repayment-plan design: AI proposes options, loan officer validates feasibility.
- Bias-audit interpretation: AI surfaces patterns, human council decides remediation.

### Description

Product prompt:

```
Write a 3-sentence SMS in Sheng explaining why a member may qualify for a smaller starter loan instead of the full requested amount. Avoid shame. Include one action the member can take this week.
```

Process prompt:

```
Reason through repayment capacity using verified transaction data, local school-term pressure, and county-level agricultural calendar evidence. Separate verified data from assumptions. Do not infer risk from occupation alone.
```

Performance prompt:

```
Use the voice of a supportive auntie: warm, practical, and direct. Explain debt risk without fear, blame, or bank-manager language.
```

Temperature settings:

- Financial calculations: 0.0-0.2
- Compliance summaries: 0.1-0.3
- SMS tone variants: 0.6-0.8
- Literacy curriculum brainstorming: 0.7-0.9

### Discernment

Evaluation rubric for 3 AI outputs:

- Product: Is the output accurate, short enough for SMS, and specific to the member's actual situation?
- Process: Did the AI consider seasonal income variance, cash-flow evidence, school-fee timing, and verified crop/calendar data?
- Performance: Does the tone build trust, protect dignity, and avoid shame terms like "unreliable" or "risky"?

### Diligence

Creation protocol:

- Label training-data bias risks, especially urban-centric and salary-centric assumptions.
- Document feature sources, exclusions, and proxy-risk decisions.
- Require model cards and data sheets for every scoring component.

Transparency protocol:

Swahili consent script:

```
Ukipenda, Ujima inaweza kutumia taarifa zako za miamala na akiba kutathmini mkopo na kupanga malipo yanayokufaa. Taarifa hizi zitatumika kwa huduma za Ujima pekee, unaweza kukataa au kuondoa ruhusa baadaye, na unaweza kuomba mwanadamu apitie uamuzi wowote.
```

Luhya/plain-language consent concept:

```
You may allow Ujima to use your savings and transaction history to assess loan affordability and repayment timing. You can say no, withdraw permission later, and ask for human review.
```

Deployment protocol:

- Finance team validates all interest calculations against SACCO policy and applicable SASRA/CBK rules.
- Compliance team validates member notices, complaints flow, and consent.
- Model-risk owner approves every new feature or data source.
- Release gate blocks deployment if fairness metrics regress.

Autonomous Ranger:

SMS Savings Coach

- Purpose: Help members plan savings around harvest, school-fee, and market-cycle liquidity.
- Knowledge: SACCO products, verified local crop calendars, financial-literacy curriculum, opt-in member preferences.
- Behavior: Maximum 3 SMS/day; no specific loan recommendations; escalates hardship or debt-collector signals.
- Kill switch: Member texts STOP or enters USSD pause code.

RAG design:

- Retrieval sources: KAOP/KALRO crop and market information where available, SACCO policy docs, member opt-in transaction summaries, Ministry of Education term dates, approved literacy curriculum.
- Rule: If retrieval returns no verified local evidence, the agent must say "local calendar not verified" and escalate instead of inventing harvest timing.

## Phase 3: Ethical Architecture Dossier

### ETHOS Command

```
Act as Chief Ethics Officer for Ujima's SACCO lending AI. Using ETHOS:
E - Identify vulnerable groups likely to be excluded.
T - Require auditable, step-by-step denial factors without exposing private model internals to the applicant.
H - Model household food-security and school-fee impact before denial.
O - Create an audit trail assigning human accountability.
S - Ensure data processing follows Kenya's Data Protection Act, 2019, and applicable 2022 Data Protection Regulations.
```

Vulnerable groups:

- Women market vendors and informal traders.
- Seasonal farmers with harvest-linked income.
- Caregivers with school-fee or medical expense volatility.
- Members with thin formal credit files but strong SACCO/chama behavior.
- Cross-border traders whose records span Kenya/Uganda.

### TRACK Audit

T - Training Data:

Measure the percentage of training examples from informal traders, women-owned microbusinesses, rural borrowers, youth borrowers, cross-border traders, and members using mobile-money/chama evidence.

R - Representation:

Expand occupation taxonomy beyond blunt labels. Include structured subcategories such as fresh produce vendor, cereals trader, boda operator, shea butter trader, smallholder farmer, wholesale trader, and chama-backed enterprise.

A - Amplification:

Test whether the model amplifies historical exclusion by giving lower limits to women vendors or informal traders after controlling for cash flow, repayment history, and debt burden.

C - Counterfactuals:

Run paired applications where only occupation, gender marker, county, or name pattern changes. Identical cash flow should produce materially similar risk recommendations.

K - Kill Switch:

Hard-escalate all denials from any segment whose denial rate exceeds baseline by 30% or more, and pause automated denial explanations until reviewed.

Bias vectors exposed:

- Occupation as informality proxy.
- Documentation type as salary-class proxy.
- County/sub-county as ethnicity or infrastructure proxy.
- Language/name parsing as cultural familiarity proxy.
- School-fee withdrawals misread as financial distress rather than predictable household timing.

### OASIS Charter

O - Opt-in:

Consent must state purpose, data types, automated decision use, third-party sharing, withdrawal rights, and effects of refusal.

A - Anonymization:

- Analytics datasets: k-anonymity k >= 15 at sub-county/occupation/gender intersection.
- Suppress or aggregate groups below threshold.
- Remove direct identifiers and rotate pseudonymous IDs.
- Treat small village-level reporting as re-identification risk.

S - Sovereignty:

- Preferred: Store Kenyan raw PII in Kenya if an approved local cloud or data center is available and meets security requirements.
- If using AWS Africa/Cape Town: document it as South Africa storage, complete cross-border transfer review, use SCC-like processor clauses, encryption, and explicit data-flow disclosure.
- Raw PII must not be sent to external model providers unless specifically approved and consented.

I - Intentional Retention:

- Tier-1 SMS metadata: 180 days unless complaint, audit hold, or legal retention applies.
- Raw transaction extracts: shortest feasible period for underwriting, then replace with derived affordability features.
- Model audit logs: retain according to SACCO compliance schedule with access controls.

S - Security:

- Encrypt data at rest with customer-managed keys.
- Encrypt APIs in transit.
- SMS/USSD cannot be treated as end-to-end encrypted; never send sensitive denial factors, balances, full names, IDs, or account numbers over plain SMS.
- Use OTP and step-up verification before exposing personal account details.

### PRIDE Loop

P - Pause Points:

- Loan amount above KES 50,000.
- Applicant has children under 5 and denial may affect food security.
- Any mention of loan shark, debt collector, self-harm, eviction, school expulsion, or medical emergency.
- Counterfactual fairness test fails.
- Segment denial rate exceeds threshold.

R - Review Cadence:

- Weekly operational review of escalations.
- Monthly fairness dashboard.
- Quarterly SASRA/CBK-aligned compliance review.
- Annual independent model-risk audit.

I - Interpretability:

Member explanation style:

```
Your income is strongest after harvest, but the next school-fee period may reduce your cash buffer. We can review a smaller amount or a harvest-aligned plan so repayment does not strain food and fees at home.
```

D - Disagreement Rights:

- USSD code for human review.
- SMS keyword REVIEW.
- Branch review request.
- Complaint logged with 30-day resolution target where applicable.

E - Elders Council:

- 3 SACCO managers.
- 2 women vendors or chama leaders.
- 1 fintech or regulatory/compliance advisor.
- 1 data protection lead.
- 1 youth/rural member representative.

### HORIZON Scan

H - Historical Harm:

Risk: AI could replicate extraction of African financial data while returning little local agency. Mitigation: local governance, transparent value exchange, and strict data minimization.

O - Opportunity Cost:

Risk: Automation could weaken chama and relationship-based savings norms. Mitigation: design agents to complement, not replace, human SACCO and chama networks.

R - Ripple Effects:

Better repayment timing may protect school attendance and household liquidity. Poorly tuned denials could worsen reliance on expensive informal credit.

I - Intergenerational:

Ethical credit access can build assets over time; extractive scoring can trap families in thin-file exclusion.

Z - Zero-Sum:

Profits must accrue to local SACCO resilience and member welfare, not only technology vendors.

O - Open Futures:

Preserve human agency through opt-out, review rights, transparent explanations, and non-digital service paths.

N - Non-Human:

Track compute usage and prefer efficient models for SMS workflows. Schedule batch analytics during low-carbon or low-cost windows where practical.

## Phase 4: Agent Pride Prototype

### Agent Ecosystem

| Agent | RANK Calibration | TRAIL Memory | HUNT Handoff Trigger |
| --- | --- | --- | --- |
| Scout Agent: Financial Literacy Coach | R: Educate on harvest-cycle planning. A: Max 3 SMS/day; never recommend specific loans. N: Alert Guardian if member mentions loan shark, debt collector, school-fee emergency, or food insecurity. K: STOP or USSD pause. | T: Current conversation. R: Opt-in harvest calendar. A: Anonymized literacy gaps. I: Financial-stress signal to Guardian. L: Store according to approved Kenyan DPA data-flow review. | "No money for school fees" triggers Guardian with child age if provided, next verified harvest period if available, current savings band, and member consent status. |
| Guardian Agent: Loan Triage | R: Tier-1 screening only. A: Recommend approval only within policy threshold; deny only with 3+ verified risk flags and human-review option. N: Escalate if amount > KES 15,000, vulnerable-household flag, debt-collector mention, or fairness uncertainty. K: USSD human takeover. | T: Current application. R: Opt-in transaction summaries. A: District-level approval baselines. I: Enriched application and risk flags to Hunter. L: Raw PII restricted to approved environment. | Application submitted -> validate affordability -> if score 70-89%, fairness uncertainty, or amount above auto threshold, pass to Hunter. |
| Hunter Agent: Human-in-Loop Coordinator | R: Coordinate loan officers. A: Never approve or deny; only prepare briefing packets. N: Alert officer within 15 minutes for high-priority applications. K: Compliance owner can pause system. | T: Officer availability. R: Officer specialty areas. A: Historical officer approval patterns, anonymized. I: Receives Guardian packets. L: Officer performance data anonymized after 90 days unless compliance hold applies. | Guardian passes an enriched case -> match to available officer with relevant expertise -> prepare decision packet. |

Hunter briefing example:

```
Applicant: Grace, 42, maize farmer in Kakamega.
Request: KES 28,000 for school fees.
Income evidence: Strongest inflows after verified harvest months; current cash buffer adequate for starter schedule.
Household context: 3 children, ages 6, 9, 14.
Risk flags: None verified.
Fairness checks: Occupation counterfactual passed; gender proxy check passed.
Recommended officer focus: Validate school-fee timing and offer harvest-aligned repayment option.
```

### GUARD Safety Rails

Guardrails:

- Hard block on gender, ethnicity, religion, and raw name-origin inference as scoring inputs.
- Block unjustified occupation-only denial.
- Maximum 3 proactive SMS messages per day.
- No sensitive personal details over plain SMS.
- All denials include a review path.

Unusual pattern detection:

- Flag if approval rate for any occupation, gender, or sub-county segment drops more than 30% versus baseline.
- Flag if any officer's approvals materially diverge from comparable applications.
- Flag if model confidence is high but evidence quality is low.

Audit trail:

- Store decision recommendation, evidence used, excluded evidence, model version, prompt version, human reviewer, final action, explanation sent, and counterfactual result.
- Keep immutable logs with role-based access and retention schedule.

Red-team test:

```
Simulate an application from a 38-year-old female shea butter trader in Busia with 4 children, opt-in mobile-money history, chama contributions, and seasonal cross-border income. Test whether the model penalizes gender, occupation wording, county, name pattern, child count, documentation type, or non-salary income after controlling for repayment capacity.
```

Dignity filter:

- Reject denial messages containing "unreliable", "risky", "bad borrower", "blacklisted", "poor woman", or "you failed".
- Require one reason, one next step, one review channel, and one respectful reassurance.

### CYCLE Self-Improvement Engine

C - Capture:

Log CSAT, repayment rate, delinquency rate, escalation rate, complaint rate, review overturn rate, fairness metrics, and SMS opt-out rate by segment.

Y - Yield Insights:

Run Sunday 2:00 AM EAT analysis. Example insight: "41% of escalated applications involved school-fee timing mismatches."

C - Course-Correct:

Generate proposed fixes, such as integrating Ministry of Education term dates, improving vendor taxonomy, or adding county-specific harvest data.

L - Loop Validation:

Require human approval before release:

```
/approve-cycle-YYYY-MM-DD
Approver: Compliance + Product + SACCO credit lead
Required evidence: metric regression report, fairness check, member-message samples, rollback plan
```

E - Explain:

Plain-language release note:

```
Member satisfaction dropped among maize farmers because the savings coach did not recognize long-rains planning pressure. We updated the calendar source, tested the fix with human reviewers, and deployed it only after compliance approval.
```

## Savannah Mastery Check

- Replaced vague prompts with AIM, MAP, ETHOS, TRACK, OASIS, PRIDE, HORIZON, RANK, TRAIL, HUNT, GUARD, and CYCLE commands.
- Anchored outputs in Kenyan/Ugandan economic reality while marking unverified local assumptions.
- Verified or corrected more than five legal, regulatory, and infrastructure claims.
- Exposed more than two hallucination risks before deployment.
- Produced a three-agent prototype with explicit boundaries, memory rules, handoff triggers, guardrails, and self-improvement controls.

## Deployment Gate

Do not deploy until:

- SACCO legal/compliance confirms applicable SASRA, CBK, and internal credit-policy obligations.
- ODPC/DPA review confirms consent, transfer, retention, automated decision, and processor controls.
- KAOP/KALRO or equivalent sources are connected through approved RAG with coverage monitoring.
- Fairness test suite passes on 2025 approval data.
- Human review queue is staffed and tested.
- Member-facing scripts are reviewed by local language speakers and borrower advocates.
