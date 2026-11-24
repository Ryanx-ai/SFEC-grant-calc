# SFEC Grant Calculator

Single-screen, table-based training planner for Vertical Institute, matching the supplied pricing comparison references. Static, dependency-free browser application with an editable available SFEC balance up to S$10,000, a choice of two courses, 50%/70% subsidy selection, SG/PR and foreign participant pricing, credit utilisation, minimum SG/PR headcount, cost breakdown, shareable plan URLs and print/PDF layout.

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
- SFEC = min(available balance, total eligible net fees × selected 90% / 100% rate).
- Foreign participants pay full fees and receive no subsidy or SFEC in this model.
- GST = 9% of full fees, before subsidy.
- Net cost = fees after subsidy − SFEC + GST. This is also upfront payable under the new scheme; under the old reimbursement scheme, upfront payment is fees after subsidy + GST.
- Additional eligible enrolments = ceiling(remaining credit / SFEC offset per enrolment).
- Calculations use integer cents. Counts are whole enrolments, clamped to 0–9,999 per field.
- The interface estimates one selected course at a time. The reusable calculation engine also supports mixed courses under a shared cap.
- Available balance defaults to S$10,000 and can be set from S$0 to S$10,000, including cents. Enter unused credit before this plan. Claims and pax targets use this balance; the meter shows credit consumed by this plan only. Zero balance means no offset or recommended pax. Absentee payroll, EIS and input GST recovery are outside scope. Each pax attends the selected course.

## Policy basis

Rules checked 24 November 2026. The SFEC toggle supports the old 90% reimbursement scheme (expires 30 November 2026) and the enhanced 100% upfront-offset scheme (from 1 December 2026). Old-scheme highlighted totals show net cost after reimbursement; the summary shows the full upfront payment. Shared URLs include the SFEC rate and available balance in dollars; existing links default to 100% and S$10,000. The calculation engine accepts balance in integer cents. Eligibility for each company, employee, course and subsidy rate must be confirmed before enrolment.

- [TPGateway enhanced SFEC FAQ](https://www.tpgateway.gov.sg/faq/skillsfuture-enterprise-credit-enhanced): 100% net training fee offset, GST exclusion, SG/PR eligibility, upfront treatment, wallet cap.
- [MOM announcement, 3 November 2026](https://www.mom.gov.sg/newsroom/parliament-questions-and-replies/2026/1103-written-answer-to-pq-on-redesigned-skillsfuture-enterprise-credit): fresh S$10,000 wallet and 1 December 2026 launch.

Course fees supplied by the project owner. Subsidy and tax treatment match the supplied pricing examples. The UI includes eligibility notes and links to official guidance.

## Design

A white, three-column pricing table with blue SG/PR and foreign headings, subtle dividers and bright blue payable totals follows the supplied reference images. Compact course and subsidy controls, editable SFEC balance and pax counts, a one-click tranche target and a slim credit summary fit on a standard laptop screen. DM Sans keeps all labels and figures consistent. Eligibility notes open in a dialog to preserve the single-screen view. Shareable URLs and landscape print styling are included.

## Validation

`npm test` covers the owner's 21-local/4-foreign example, both rates and course thresholds, mixed-course shared cap, empty and foreign-only plans, recommendations, invalid inputs and reconciliation of totals. Core calculations run without network access; Google Fonts has system font fallbacks. Plans are represented in the URL; no personal information is collected or sent to a backend.
