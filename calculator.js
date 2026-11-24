// Monetary arithmetic uses integer cents throughout.
export const TRANCHE = 1_000_000;
export const MAX_PAX = 9999;
export const COURSES = [
  { id: 'training', name: 'GenAI Training', fee: 165_000 },
  { id: 'automation', name: 'GenAI Workflow Automation', fee: 130_000 },
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
  const enhancedSubsidy = subsidy ? subsidy + 20 : 0;
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
      enhancedNetPerPax, ageSavings,
      gstPerPax: course.fee * 9 / 100,
      localGross: course.fee * local, foreignGross: course.fee * foreign,
      localNet: netPerPax * local - ageSavings,
      ...ageMixTarget(balance, offsetPerPax, enhancedOffsetPerPax, local, localAges.older, localAges.eligible) };
  });
  const sum = key => rows.reduce((total, row) => total + row[key], 0);
  const localGross = sum('localGross');
  const foreignGross = sum('foreignGross');
  const localNet = sum('localNet');
  const offset = Math.min(balance, Math.round(localNet * sfec / 100));
  const remaining = balance - offset;
  const shortfall = localNet - offset;
  const localGst = localGross * 9 / 100;
  const foreignGst = foreignGross * 9 / 100;
  return { subsidy, enhancedSubsidy, sfec, balance, rows, localPax: sum('local'), foreignPax: sum('foreign'),
    localGross, foreignGross, localNet, savings: localGross - localNet,
    offset, remaining, shortfall, localGst, foreignGst,
    localPayable: shortfall + localGst, foreignPayable: foreignGross + foreignGst,
    totalPayable: shortfall + localGst + foreignGross + foreignGst,
    totalUpfront: (sfec === 90 ? localNet : shortfall) + localGst + foreignGross + foreignGst,
    percentage: balance ? offset / balance * 100 : 0,
    suggestions: rows.map(row => ({ id: row.id, additional: Math.ceil(remaining / row.offsetPerPax),
      excess: remaining ? Math.ceil(remaining / row.offsetPerPax) * row.netPerPax - remaining : 0 })),
  };
}
