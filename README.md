# SFEC Grant Calculator

Single-screen, table-based training planner for Vertical Institute, matching the supplied pricing comparison references. Static, dependency-free browser application with an editable available SFEC balance up to S$10,000, a choice of two courses, 0%/50%/70% subsidy selection, SG/PR and foreign participant pricing, credit utilisation, collapsible age breakdown and minimum SG/PR headcount, cost breakdown, shareable plan URLs and print/PDF layout.

## Run

Requires Node.js 22 or later. No dependencies or environment variables are required.

```sh
npm run dev   # http://localhost:4173
npm test
npm run build
```

Vercel builds with `npm run build` and serves `dist/`. Connect this repository's `main` branch for production deployments.

## Calculation model

- GenAI Training: S$1,650 per enrolment, excluding GST.
- GenAI Workflow Automation: S$1,300 per enrolment, excluding GST.
- SG/PR net fee = full fee × (1 − selected subsidy).
- Age groups (under 40 / 40+) always sum to each SG/PR or foreign total. Eligible Singapore Citizens within the older SG/PR group receive 20 percentage points above the selected baseline: 50% becomes 70%, 70% becomes 90%. No top-up applies at 0% baseline. Older PRs and foreigners retain their usual pricing. Eligibility must be confirmed and enhanced subsidies must not be double-counted.
- Mixed local net fees = baseline net fee × non-enhanced pax + enhanced net fee × eligible older pax. GST stays on full fees.
- SFEC = min(available balance, total eligible net fees × selected 90% / 100% rate).
- Foreign participants pay full fees and receive no subsidy or SFEC in this model.
- GST = 9% of full fees, before subsidy.
- Net cost = fees after subsidy − SFEC + GST. This is also upfront payable under the new scheme; under the old reimbursement scheme, upfront payment is fees after subsidy + GST.
- The pax target finds the smallest whole-number cohort that consumes the available balance at the current SG/PR age and eligibility proportions, rounding older/eligible counts down. The target button applies these counts; without eligible older pax, the target uses the baseline rate. Changing total pax preserves older counts up to the new total and assigns new pax to under 40.
- Calculations use integer cents. Counts are whole enrolments, clamped to 0–9,999 per field.
- The interface estimates one selected course at a time. The reusable calculation engine also supports mixed courses under a shared cap.
- Available balance defaults to S$10,000 and can be set from S$0 to S$10,000, including cents. Enter unused credit before this plan. Claims and pax targets use this balance; the meter shows credit consumed by this plan only. Zero balance means no offset or recommended pax. Absentee payroll, EIS and input GST recovery are outside scope. Each pax attends the selected course.

## Policy basis

Rules checked 24 November 2026. The SFEC toggle supports the old 90% reimbursement scheme (expires 30 November 2026) and the enhanced 100% upfront-offset scheme (from 1 December 2026). Old-scheme highlighted totals show net cost after reimbursement; the summary shows the full upfront payment. Shared URLs include the SFEC rate , available balance in dollars and age/eligibility counts; existing links default to 100% and S$10,000. The calculation engine accepts balance in integer cents. Eligibility for each company, employee, course and subsidy rate must be confirmed before enrolment.

- [TPGateway enhanced SFEC FAQ](https://www.tpgateway.gov.sg/faq/skillsfuture-enterprise-credit-enhanced): 100% net training fee offset, GST exclusion, SG/PR eligibility, upfront treatment, wallet cap.
- [MOM announcement, 3 November 2026](https://www.mom.gov.sg/newsroom/parliament-questions-and-replies/2026/1103-written-answer-to-pq-on-redesigned-skillsfuture-enterprise-credit): fresh S$10,000 wallet and 1 December 2026 launch.

Course fees supplied by the project owner. Subsidy and tax treatment match the supplied pricing examples. The UI includes eligibility notes and links to official guidance.

## Design

A white, three-column pricing table with blue SG/PR and foreign headings, subtle dividers and bright blue payable totals follows the supplied reference images. Compact course and subsidy controls, editable SFEC balance and pax counts, a one-click tranche target and a slim credit summary fit on a standard laptop screen. DM Sans keeps all labels and figures consistent. Eligibility notes open in a dialog to preserve the single-screen view. Shareable URLs and landscape print styling are included.

The age editor is collapsed by default behind “Set ages”. Its summary shows the eligible older count when the benefit is active. Share links retain all counts; old links default to no age top-up. Print output includes the breakdown even when collapsed.

## Validation

`npm test` covers the owner's 21-local/4-foreign example, both rates and course thresholds, mixed-course shared cap, empty and foreign-only plans, recommendations, invalid inputs and reconciliation of totals. Core calculations run without network access; Google Fonts has system font fallbacks. Plans are represented in the URL; no personal information is collected or sent to a backend.
