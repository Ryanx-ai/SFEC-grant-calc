# SFEC Grant Calculator

Client-facing training planner for Vertical Institute. Static, dependency-free browser application with a shared S$10,000 enhanced SFEC tranche, two course enrolment groups, 50%/70% subsidy selection, SG/PR and foreign participant pricing, credit utilisation, minimum additional enrolments, cost breakdown, shareable plan URLs and print/PDF layout.

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
- SFEC = min(S$10,000, total eligible net fees across both courses).
- Foreign participants pay full fees and receive no subsidy or SFEC in this model.
- GST = 9% of full fees, before subsidy.
- Upfront payable = fees after subsidy − SFEC + GST.
- Additional eligible enrolments = ceiling(remaining credit / net fee per enrolment).
- Calculations use integer cents. Counts are whole enrolments, clamped to 0–9,999 per field.
- Credit visualisation allocates to GenAI Training first, then Workflow Automation. This does not change aggregate costs.
- A fresh full tranche is assumed. Previously consumed balances, absentee payroll, EIS and input GST recovery are outside scope. An enrolment is not necessarily a unique person when a person attends both courses.

## Policy basis

Rules checked 24 November 2026. This planner models the enhanced scheme from 1 December 2026, not the expiring 90% scheme. Eligibility for each company, employee, course and subsidy rate must be confirmed before enrolment.

- [TPGateway enhanced SFEC FAQ](https://www.tpgateway.gov.sg/faq/skillsfuture-enterprise-credit-enhanced): 100% net training fee offset, GST exclusion, SG/PR eligibility, upfront treatment, wallet cap.
- [MOM announcement, 3 November 2026](https://www.mom.gov.sg/newsroom/parliament-questions-and-replies/2026/1103-written-answer-to-pq-on-redesigned-skillsfuture-enterprise-credit): fresh S$10,000 wallet and 1 December 2026 launch.

Course fees supplied by the project owner. Subsidy and tax treatment match the supplied pricing examples. The UI includes eligibility notes and links to official guidance.

## Design

Blue-and-white planning workspace: cobalt #304CE8, ink #1D2941, muted #68738A, canvas #F7F9FC, pale blue #EEF2FF, teal #087E8B. Manrope for headings and primary amounts; DM Sans for controls and tables. A two-column desktop layout keeps course inputs beside a live credit meter; mobile stacks the same content. The credit allocation is the primary visual, with course-specific colours and understated surrounding controls. No decorative charts or unrelated marketing sections.

## Validation

`npm test` covers the owner's 21-local/4-foreign example, both rates and course thresholds, mixed-course shared cap, empty and foreign-only plans, recommendations, invalid inputs and reconciliation of totals. Core calculations run without network access; Google Fonts has system font fallbacks. Plans are represented in the URL; no personal information is collected or sent to a backend.
