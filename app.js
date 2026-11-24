import { calculate, COURSES, TRANCHE, MAX_PAX, normalizePax } from './calculator.js';

const $ = id => document.getElementById(id);
const money = cents => `S$${(cents / 100).toLocaleString('en-SG', { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;
const fields = COURSES.flatMap(c => ['local', 'foreign'].map(type => `${c.id}-${type}`));
const defaults = { 'training-local': 10, 'training-foreign': 0, 'automation-local': 0, 'automation-foreign': 0 };
let result;
let announceTimer;
let toastTimer;

function getState() {
  return { subsidy: Number(document.querySelector('[name="subsidy"]:checked').value),
    ...Object.fromEntries(COURSES.map(c => [c.id, { local: $(c.id + '-local').value, foreign: $(c.id + '-foreign').value }])) };
}
function tableRow(label, local, foreign, total, className = '') {
  return `<tr class="${className}"><th scope="row">${label}</th><td>${local}</td><td>${foreign}</td><td>${total}</td></tr>`;
}
function render() {
  result = calculate(getState());
  const r = result;
  $('credit-used').textContent = money(r.offset);
  $('credit-remaining').textContent = money(r.remaining);
  $('utilisation').textContent = `${r.percentage.toLocaleString('en-SG', { maximumFractionDigits: 2 })}% utilised`;
  $('credit-status').textContent = r.remaining === 0 ? 'Tranche fully allocated' : r.offset === 0 ? 'Ready for your first enrolment' : 'Room to grow your team';
  const trainingOffset = Math.min(TRANCHE, r.rows[0].localNet);
  $('meter-training').style.width = `${trainingOffset / TRANCHE * 100}%`;
  $('meter-automation').style.width = `${(r.offset - trainingOffset) / TRANCHE * 100}%`;
  document.querySelector('[role="progressbar"]').setAttribute('aria-valuenow', r.percentage);
  document.querySelector('[role="progressbar"]').setAttribute('aria-valuetext', `${money(r.offset)} of S$10,000 used`);
  for (const row of r.rows) $(row.id + '-net').textContent = money(row.netPerPax);
  for (const button of document.querySelectorAll('[data-step]')) {
    const value = normalizePax($(button.dataset.input).value);
    button.disabled = Number(button.dataset.step) < 0 ? value === 0 : value === MAX_PAX;
  }
  const full = r.remaining === 0;
  $('target-title').textContent = full ? 'Your full tranche is put to work' : 'Make the most of your tranche';
  $('target-description').textContent = full
    ? `${r.localPax} eligible SG/PR enrolments use the full S$10,000 credit.`
    : 'To use the remaining credit, add eligible SG/PR enrolments:';
  $('target-options').innerHTML = full
    ? '<div class="target-complete"><svg class="icon"><use href="#i-check"/></svg>100% of credit allocated</div>'
    : r.suggestions.map((s, index) => `<button class="target-option" data-fill="${s.id}" aria-label="Add ${s.additional} SG/PR enrolments for ${COURSES[index].name} to use remaining credit"><div><strong>+${s.additional} <span>pax</span></strong><small>${index === 0 ? 'GenAI Training' : 'Workflow Automation'}</small></div><svg class="icon"><use href="#i-arrow"/></svg></button>`).join('');
  $('target-note').textContent = full
    ? (r.shortfall ? `${money(r.shortfall)} in course fees exceeds the tranche and is payable, plus GST.` : 'All eligible net course fees are covered. GST remains payable.')
    : `Choose either option. Course fee excess: ${money(r.suggestions[0].excess)} for Training or ${money(r.suggestions[1].excess)} for Automation, plus GST.`;
  $('total-payable').textContent = money(r.totalPayable);
  const pax = r.localPax + r.foreignPax;
  $('results-note').textContent = `${pax.toLocaleString()} enrolment${pax === 1 ? '' : 's'} in your plan · ${r.localPax.toLocaleString()} SG/PR + ${r.foreignPax.toLocaleString()} foreign`;
  const no = '<span class="not-eligible">Not eligible</span>';
  const minus = amount => amount ? `−${money(amount)}` : money(0);
  $('breakdown-body').innerHTML = [
    tableRow('Number of enrolments', r.localPax.toLocaleString(), r.foreignPax.toLocaleString(), pax.toLocaleString()),
    tableRow('Full course fees', money(r.localGross), money(r.foreignGross), money(r.localGross + r.foreignGross)),
    tableRow(`Course subsidy (${r.subsidy}%)`, minus(r.savings), no, minus(r.savings), 'deduction'),
    tableRow('Fees after subsidy', money(r.localNet), money(r.foreignGross), money(r.localNet + r.foreignGross), 'net-row'),
    tableRow('SFEC offset (100%)<span class="table-sub">Capped at S$10,000 per company</span>', minus(r.offset), no, minus(r.offset), 'deduction'),
    tableRow('Course fees after SFEC', money(r.shortfall), money(r.foreignGross), money(r.shortfall + r.foreignGross)),
    tableRow('GST (9% of full fees)', money(r.localGst), money(r.foreignGst), money(r.localGst + r.foreignGst)),
    tableRow('Upfront payable', money(r.localPayable), money(r.foreignPayable), money(r.totalPayable), 'total-row'),
  ].join('');
  $('reference-options').innerHTML = r.rows.map(row => `<div class="reference-item"><strong>${row.target}</strong><span>SG/PR pax<br>${row.name}<small>at ${r.subsidy}% subsidy · ${money(row.netPerPax)} net / pax</small></span></div>`).join('');
  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => {
    $('live-summary').textContent = `${money(r.offset)} of SFEC used. ${money(r.remaining)} remaining. Total upfront payable ${money(r.totalPayable)}.`;
  }, 350);
}
function toast(message) {
  clearTimeout(toastTimer);
  $('toast').textContent = message;
  $('toast').classList.add('visible');
  toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 4500);
}
function persistUrl() {
  const url = new URL(location.href);
  url.searchParams.set('subsidy', result.subsidy);
  for (const field of fields) url.searchParams.set(field, normalizePax($(field).value));
  history.replaceState(null, '', url);
}
function update() { render(); persistUrl(); }
function loadUrl() {
  const params = new URLSearchParams(location.search);
  const subsidy = params.get('subsidy') === '50' ? '50' : '70';
  document.querySelector(`[name="subsidy"][value="${subsidy}"]`).checked = true;
  for (const field of fields) $(field).value = params.has(field) ? normalizePax(params.get(field)) : defaults[field];
  render();
}
for (const field of fields) {
  $(field).addEventListener('input', () => {
    if ($(field).value !== '') $(field).value = normalizePax($(field).value);
    update();
  });
  $(field).addEventListener('blur', () => { $(field).value = normalizePax($(field).value); update(); });
}
document.querySelectorAll('[name="subsidy"]').forEach(input => input.addEventListener('change', update));
document.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => {
  const input = $(button.dataset.input);
  input.value = normalizePax(normalizePax(input.value) + Number(button.dataset.step));
  update();
}));
$('target-options').addEventListener('click', event => {
  const button = event.target.closest('[data-fill]');
  if (!button) return;
  const course = button.dataset.fill;
  const additional = result.suggestions.find(s => s.id === course).additional;
  const input = $(course + '-local');
  input.value = normalizePax(normalizePax(input.value) + additional);
  update();
  input.focus({ preventScroll: true });
  toast(`Added ${additional} SG/PR enrolments. Your S$10,000 tranche is fully allocated.`);
});
$('reset').addEventListener('click', () => {
  for (const field of fields) $(field).value = 0;
  document.querySelector('[name="subsidy"][value="70"]').checked = true;
  update(); toast('Plan cleared. Add participants to start a new estimate.');
});
$('share').addEventListener('click', async () => {
  persistUrl();
  try { await navigator.clipboard.writeText(location.href); toast('Plan link copied. It includes your courses, participants and subsidy.'); }
  catch { window.prompt('Copy this link to share your training plan:', location.href); }
});
$('print').addEventListener('click', () => window.print());
window.addEventListener('popstate', loadUrl);
loadUrl();
