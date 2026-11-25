// Monetary arithmetic uses integer cents throughout.
export const TRANCHE = 1_000_000;
export const MAX_PAX = 9999;
// Full fees before GST, checked against official course pages on 25 November 2026.
export const COURSE_PRICES_REVIEWED = "25 November 2026";
export const COURSES = [
  {
    "id": "training",
    "name": "Generative AI Training",
    "fee": 165000,
    "category": "Featured — Generative AI",
    "source": "https://verticalinstitute.com/generative-ai-course/"
  },
  {
    "id": "content",
    "name": "Generative AI for Content Creation",
    "fee": 130000,
    "category": "Featured — Generative AI",
    "source": "https://verticalinstitute.com/courses/generative-ai-for-content-creation-course/"
  },
  {
    "id": "automation",
    "name": "Generative AI Workflow Automation",
    "fee": 130000,
    "category": "Featured — Generative AI",
    "source": "https://verticalinstitute.com/short-courses/ai-workflow-automation-course/"
  },
  {
    "id": "data-analytics",
    "name": "Data Analytics",
    "fee": 195000,
    "category": "Data Analytics",
    "source": "https://verticalinstitute.com/data-analytics/"
  },
  {
    "id": "advanced-data-analytics",
    "name": "Advanced Data Analytics",
    "fee": 200000,
    "category": "Data Analytics",
    "source": "https://verticalinstitute.com/advanced-data-analytics/"
  },
  {
    "id": "power-bi",
    "name": "Data Analytics Using Power BI",
    "fee": 130000,
    "category": "Data Analytics",
    "source": "https://verticalinstitute.com/courses/power-bi-course/"
  },
  {
    "id": "data-science",
    "name": "Data Science & AI",
    "fee": 165000,
    "category": "Data Science & AI",
    "source": "https://verticalinstitute.com/data-science/"
  },
  {
    "id": "ux-design",
    "name": "UI/UX Design",
    "fee": 165000,
    "category": "UI/UX Design",
    "source": "https://verticalinstitute.com/user-experience/"
  },
  {
    "id": "digital-marketing",
    "name": "Digital Marketing",
    "fee": 165000,
    "category": "Digital Marketing",
    "source": "https://verticalinstitute.com/digital-marketing-course/"
  },
  {
    "id": "seo-marketing",
    "name": "SEO Marketing",
    "fee": 130000,
    "category": "Digital Marketing",
    "source": "https://verticalinstitute.com/short-courses/seo-marketing/"
  },
  {
    "id": "google-analytics",
    "name": "Mastering Google Analytics 4",
    "fee": 130000,
    "category": "Digital Marketing",
    "source": "https://verticalinstitute.com/short-courses/google-analytics-course/"
  },
  {
    "id": "google-youtube-marketing",
    "name": "Google & YouTube Marketing",
    "fee": 130000,
    "category": "Digital Marketing",
    "source": "https://verticalinstitute.com/short-courses/google-youtube-marketing-course/"
  },
  {
    "id": "ecommerce-gig-platforms",
    "name": "E-commerce and Gig Platforms",
    "fee": 60000,
    "category": "Digital Marketing",
    "source": "https://verticalinstitute.com/short-courses/ecommerce-and-gig-platform-course/"
  },
  {
    "id": "cybersecurity",
    "name": "Cybersecurity",
    "fee": 165000,
    "category": "Cybersecurity",
    "source": "https://verticalinstitute.com/cybersecurity/"
  },
  {
    "id": "carbon-reporting",
    "name": "Carbon Reporting & Greenhouse Gas Measurement",
    "fee": 130000,
    "category": "Sustainability & ESG",
    "source": "https://verticalinstitute.com/short-courses/carbon-reporting-ghg-measurement-course/"
  },
  {
    "id": "blockchain-cryptocurrency",
    "name": "Blockchain & Cryptocurrency",
    "fee": 200000,
    "category": "Investments & Finance",
    "source": "https://verticalinstitute.com/blockchain-course/"
  },
  {
    "id": "leading-with-clarity",
    "name": "Leading with Clarity: From Strategy to Team Results",
    "fee": 120000,
    "category": "Critical Soft Skills",
    "source": "https://verticalinstitute.com/short-courses/strategy-to-team-results-course/"
  },
  {
    "id": "customer-relationships",
    "name": "Manage and Strengthen Customer Relationships",
    "fee": 60000,
    "category": "Critical Soft Skills",
    "source": "https://verticalinstitute.com/short-courses/manage-and-strengthen-customer-relationships/"
  },
  {
    "id": "people-relationship-management",
    "name": "Effective People and Relationship Management",
    "fee": 110000,
    "category": "Critical Soft Skills",
    "source": "https://verticalinstitute.com/short-courses/effective-people-relationship-management-course/"
  },
  {
    "id": "critical-thinking",
    "name": "Critical Thinking & Problem-Solving",
    "fee": 110000,
    "category": "Critical Soft Skills",
    "source": "https://verticalinstitute.com/short-courses/critical-thinking-and-problem-solving-course/"
  },
  {
    "id": "presentation-storytelling",
    "name": "Effective Presentation and Storytelling",
    "fee": 130000,
    "category": "Critical Soft Skills",
    "source": "https://verticalinstitute.com/short-courses/effective-presentation-storytelling-course/"
  },
  {
    "id": "stress-resilience",
    "name": "Manage Stress and Build Mental Resilience",
    "fee": 60000,
    "category": "Critical Soft Skills",
    "source": "https://verticalinstitute.com/short-courses/manage-stress-build-mental-resilience-course/"
  },
  {
    "id": "workplace-conflict",
    "name": "Managing Conflict in the Workplace",
    "fee": 120000,
    "category": "Critical Soft Skills",
    "source": "https://verticalinstitute.com/short-courses/managing-conflict-in-the-workplace/"
  },
  {
    "id": "personal-growth-productivity",
    "name": "Enhance Personal Growth & Increase Productivity",
    "fee": 110000,
    "category": "Critical Soft Skills",
    "source": "https://verticalinstitute.com/short-courses/enhance-personal-growth-increase-productivity/"
  }
];
export function normalizePax(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(MAX_PAX, Math.max(0, Math.trunc(n))) : 0;
}
// Balance is expressed in cents, like all other monetary inputs and results.
export function normalizeBalance(value = TRANCHE) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(TRANCHE, Math.max(0, Math.round(n))) : 0;
}
export function ageSplit(total, older = 0, eligible = 0) {
  total = normalizePax(total);
  older = Math.min(total, normalizePax(older));
  return { younger: total - older, older, eligible: Math.min(older, normalizePax(eligible)) };
}
export function scaleAgeSplit(total, originalTotal, older, eligible) {
  return ageSplit(total, originalTotal ? Math.floor(total * older / originalTotal) : 0,
    originalTotal ? Math.floor(total * eligible / originalTotal) : 0);
}
function ageMixTarget(balance, baseOffset, enhancedOffset, total, older, eligible) {
  let low = 0;
  let high = Math.ceil(balance / Math.min(baseOffset, enhancedOffset));
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const ages = scaleAgeSplit(mid, total, older, eligible);
    const claim = (mid - ages.eligible) * baseOffset + ages.eligible * enhancedOffset;
    if (claim >= balance) high = mid;
    else low = mid + 1;
  }
  return { target: low, targetAges: scaleAgeSplit(low, total, older, eligible) };
}
export function calculate(input) {
  const balance = normalizeBalance(input.balance);
  const subsidy = input.subsidy === 0 || input.subsidy === '0' ? 0 : Number(input.subsidy) === 50 ? 50 : 70;
  const sfec = Number(input.sfec) === 90 ? 90 : 100;
  const enhancedSubsidy = subsidy === 50 ? 70 : subsidy;
  const rows = COURSES.map(course => {
    const local = normalizePax(input[course.id]?.local ?? 0);
    const foreign = normalizePax(input[course.id]?.foreign ?? 0);
    const netPerPax = course.fee * (100 - subsidy) / 100;
    const offsetPerPax = Math.round(netPerPax * sfec / 100);
    const localAges = ageSplit(local, input[course.id]?.localOlder, input[course.id]?.eligibleOlder);
    const foreignAges = ageSplit(foreign, input[course.id]?.foreignOlder);
    const enhancedNetPerPax = course.fee * (100 - enhancedSubsidy) / 100;
    const enhancedOffsetPerPax = Math.round(enhancedNetPerPax * sfec / 100);
    const ageSavings = (netPerPax - enhancedNetPerPax) * localAges.eligible;
    return { ...course, local, foreign, localAges, foreignAges, netPerPax, offsetPerPax,
      enhancedNetPerPax, enhancedOffsetPerPax, ageSavings,
      gstPerPax: course.fee * 9 / 100,
      localGross: course.fee * local, foreignGross: course.fee * foreign,
      localNet: netPerPax * local - ageSavings,
      ...ageMixTarget(balance, offsetPerPax, enhancedOffsetPerPax, local, localAges.older, localAges.eligible) };
  });
  const sum = key => rows.reduce((total, row) => total + row[key], 0);
  const localGross = sum('localGross');
  const foreignGross = sum('foreignGross');
  const localNet = sum('localNet');
  const foreignClaimable = sfec === 90 ? Math.round(foreignGross * 90 / 100) : 0;
  // Display allocation assumes SG/PR claims first; both groups share one balance.
  const localOffset = Math.min(balance, Math.round(localNet * sfec / 100));
  const foreignOffset = Math.min(balance - localOffset, foreignClaimable);
  const offset = localOffset + foreignOffset;
  const foreignShortfall = foreignGross - foreignOffset;
  if (sfec === 90) {
    const localTargetBalance = Math.max(0, balance - foreignClaimable);
    for (const row of rows) Object.assign(row, ageMixTarget(localTargetBalance,
      row.offsetPerPax, row.enhancedOffsetPerPax, row.local, row.localAges.older, row.localAges.eligible));
  }
  const remaining = balance - offset;
  const shortfall = localNet - localOffset;
  const localGst = localGross * 9 / 100;
  const foreignGst = foreignGross * 9 / 100;
  return { subsidy, enhancedSubsidy, sfec, balance, rows, localPax: sum('local'), foreignPax: sum('foreign'),
    localGross, foreignGross, localNet, savings: localGross - localNet,
    offset, localOffset, foreignOffset, foreignShortfall, remaining, shortfall, localGst, foreignGst,
    localPayable: shortfall + localGst, foreignPayable: foreignShortfall + foreignGst,
    totalPayable: shortfall + localGst + foreignShortfall + foreignGst,
    totalUpfront: (sfec === 90 ? localNet : shortfall) + localGst + foreignGross + foreignGst,
    percentage: balance ? offset / balance * 100 : 0,
    suggestions: rows.map(row => ({ id: row.id, additional: Math.ceil(remaining / row.offsetPerPax),
      excess: remaining ? Math.ceil(remaining / row.offsetPerPax) * row.netPerPax - remaining : 0 })),
  };
}
