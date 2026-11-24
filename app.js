import { calculate, COURSES, normalizePax, normalizeBalance, MAX_PAX } from './calculator.js';
const $ = id => document.getElementById(id);
const money = cents => `S$${(cents / 100).toLocaleString('en-SG', { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;
let result;
let timer;
let announceTimer;
function render() {
  const course = COURSES.find(c => c.id === $('course').value);
  const subsidy = Number(document.querySelector('[name="subsidy"]:checked').value);
  const sfec = Number(document.querySelector('[name="sfec"]:checked').value);
  result = calculate({ subsidy, sfec, balance:normalizeBalance(Number($('sfec-balance').value) * 100), [course.id]: { local: $('local-pax').value, foreign: $('foreign-pax').value, localOlder:$('local-older').value, eligibleOlder:$('eligible-older').value, foreignOlder:$('foreign-older').value } });
  const r = result;
  const row = r.rows.find(c => c.id === course.id);
  for (const group of ['local','foreign']) {
    const ages = row[group + 'Ages'];
    $(group + '-younger').value = ages.younger;
    $(group + '-older').value = ages.older;
    $(group + '-younger').max = row[group];
    $(group + '-older').max = row[group];
    $(group + '-age-total').textContent = `${ages.younger} + ${ages.older} = ${row[group]} pax`;
  }
  $('eligible-older').value = row.localAges.eligible;
  $('eligible-older').max = row.localAges.older;
  $('eligible-older').disabled = row.localAges.older === 0 || subsidy === 0;
  const ageBenefit = row.localAges.eligible > 0 && subsidy > 0;
  $('age-benefit-note').textContent = subsidy === 0 ? '0% baseline: no age top-up applies.' : 'Extra 20 percentage points for eligible Singapore Citizens aged 40+.';
  $('age-toggle-label').textContent = ageBenefit ? `Ages · ${row.localAges.eligible} eligible` : (row.localAges.older || row.foreignAges.older ? 'Edit ages' : 'Set ages');
  const values = { 'target-pax':row.target, 'target-description':r.balance ? ` to use ${money(r.balance)}${ageBenefit ? ' at this age mix' : ' balance'}` : ' · No SFEC credit available', 'balance-cap':`Up to ${money(r.balance)} available`, 'local-gross':money(r.localGross), 'foreign-gross':money(r.foreignGross),
    'local-net':money(r.localNet), 'foreign-net':money(r.foreignGross), 'subsidy-label':ageBenefit ? `${subsidy}% + 20 pts for ${row.localAges.eligible} eligible SCs` : `${subsidy}% subsidy`,
    'net-per-pax':ageBenefit ? `Base ${money(row.netPerPax)} · Eligible 40+ ${money(row.enhancedNetPerPax)} / pax` : `${money(row.netPerPax)} / pax`, 'sfec-offset':r.offset ? `−${money(r.offset)}` : money(0),
    'local-after':money(r.shortfall), 'foreign-after':money(r.foreignGross), 'local-gst':money(r.localGst),
    'foreign-gst':money(r.foreignGst), 'local-payable':money(r.localPayable), 'foreign-payable':money(r.foreignPayable),
    'credit-used':money(r.offset), 'credit-remaining':`${money(r.remaining)} remaining`, 'total-payable':money(r.totalUpfront),
    'sfec-label':`SFEC ${sfec === 90 ? 'claim' : 'offset'} (${sfec}%)`,
    'after-label':sfec === 90 ? 'After SFEC claim' : 'After SFEC offset',
    'payable-label':sfec === 90 ? 'Net payable' : 'Upfront payable',
    'payable-note':sfec === 90 ? 'After reimbursement, incl. GST' : 'Including GST',
    'total-label':sfec === 90 ? 'Total upfront' : 'Total payable',
    'scheme-note':sfec === 90 ? 'Old SFEC: reimbursed after payment; expires 30 Nov 2026. Uses your available balance; subject to eligibility.' : 'Enhanced SFEC from 1 Dec 2026. Uses your available balance; subject to course & employee eligibility.' };
  for (const [id,value] of Object.entries(values)) $(id).textContent = value;
  document.querySelectorAll('.per-pax').forEach(el => el.textContent = `${money(row.fee)} / pax`);
  $('fill-target').innerHTML = r.balance ? `Use ${row.target} pax <span aria-hidden="true">↗</span>` : 'No credit';
  $('fill-target').disabled = r.balance === 0;
  $('fill-target').title = `${row.targetAges.younger} under 40, ${row.targetAges.older} aged 40+, including ${row.targetAges.eligible} eligible Singapore Citizens`;
  $('fill-target').setAttribute('aria-label', `Set SG/PR participants to ${row.target} to use the ${money(r.balance)} balance`);
  $('meter-fill').style.width = `${r.percentage}%`;
  document.querySelector('[role="progressbar"]').setAttribute('aria-valuenow',r.percentage);
  document.querySelector('[role="progressbar"]').setAttribute('aria-valuetext',`${money(r.offset)} of ${money(r.balance)} available credit used in this plan`);
  for (const button of document.querySelectorAll('[data-step]')) {
    const count = normalizePax($(button.dataset.input).value);
    button.disabled = Number(button.dataset.step) < 0 ? count === 0 : count === MAX_PAX;
  }
  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => { $('live-summary').textContent = `${money(r.offset)} SFEC used. ${money(r.remaining)} remaining. Total upfront ${money(r.totalUpfront)}.`; },350);
}
function saveUrl() {
  const url = new URL(location.href);
  url.search = new URLSearchParams({ course:$('course').value, subsidy:result.subsidy, sfec:result.sfec, balance:(result.balance / 100).toFixed(2), local:normalizePax($('local-pax').value), foreign:normalizePax($('foreign-pax').value), localOlder:$('local-older').value, eligibleOlder:$('eligible-older').value, foreignOlder:$('foreign-older').value }).toString();
  history.replaceState(null,'',url);
}
function update() { render(); saveUrl(); }
function load() {
  const params = new URLSearchParams(location.search);
  const course = params.get('course') === 'automation' || (!params.has('course') && Number(params.get('automation-local')) > 0 && !Number(params.get('training-local'))) ? 'automation' : 'training';
  $('course').value = course;
  $('sfec-balance').value = (normalizeBalance(params.has('balance') ? Number(params.get('balance')) * 100 : undefined) / 100).toFixed(2);
  const subsidy = ['0', '50', '70'].includes(params.get('subsidy')) ? params.get('subsidy') : '70';
  document.querySelector(`[name="subsidy"][value="${subsidy}"]`).checked = true;
  const sfec = params.get('sfec') === '90' ? '90' : '100';
  document.querySelector(`[name="sfec"][value="${sfec}"]`).checked = true;
  $('local-pax').value = normalizePax(params.get('local') ?? params.get(`${course}-local`) ?? 21);
  $('foreign-pax').value = normalizePax(params.get('foreign') ?? params.get(`${course}-foreign`) ?? 4);
  $('local-older').value = normalizePax(params.get('localOlder'));
  $('eligible-older').value = normalizePax(params.get('eligibleOlder'));
  $('foreign-older').value = normalizePax(params.get('foreignOlder'));
  render();
}
function toast(message) {
  clearTimeout(timer); $('toast').textContent = message; $('toast').classList.add('visible');
  timer = setTimeout(() => $('toast').classList.remove('visible'),3500);
}
$('age-toggle').addEventListener('click',() => {
  const expanded = $('age-toggle').getAttribute('aria-expanded') !== 'true';
  $('age-toggle').setAttribute('aria-expanded',expanded);
  $('age-row').hidden = !expanded;
});
for (const group of ['local','foreign']) {
  $(group + '-younger').addEventListener('input',() => {
    const total=normalizePax($(group + '-pax').value);
    $(group + '-older').value = total - Math.min(total,normalizePax($(group + '-younger').value));
    update();
  });
  $(group + '-older').addEventListener('input',update);
}
$('eligible-older').addEventListener('input',update);
for (const id of ['local-pax','foreign-pax']) {
  $(id).addEventListener('input',() => { if ($(id).value !== '') $(id).value = normalizePax($(id).value); update(); });
  $(id).addEventListener('blur',() => { $(id).value = normalizePax($(id).value); update(); });
}
$('sfec-balance').addEventListener('input',() => {
  const input = $('sfec-balance');
  if (Number(input.value) < 0 || Number(input.value) > 10000) input.value = (normalizeBalance(Number(input.value) * 100) / 100).toFixed(2);
  update();
});
$('sfec-balance').addEventListener('blur',() => { $('sfec-balance').value = (result.balance / 100).toFixed(2); update(); });
$('course').addEventListener('change',update);
for (const input of document.querySelectorAll('[name="subsidy"], [name="sfec"]')) input.addEventListener('change',update);
for (const button of document.querySelectorAll('[data-step]')) button.addEventListener('click',() => {
  const input = $(button.dataset.input); input.value = normalizePax(normalizePax(input.value) + Number(button.dataset.step)); update();
});
$('fill-target').addEventListener('click',() => {
  if (!result.balance) return;
  const row = result.rows.find(row => row.id === $('course').value);
  const target = row.target;
  $('local-older').value = row.targetAges.older;
  $('eligible-older').value = row.targetAges.eligible;
  $('local-pax').value = target; update(); toast(`Set to ${target} SG/PR pax. ${money(result.balance)} available credit fully used.`);
});
$('share').addEventListener('click',async () => {
  saveUrl();
  try { await navigator.clipboard.writeText(location.href); toast('Plan link copied.'); }
  catch { window.prompt('Copy this plan link:',location.href); }
});
$('print').addEventListener('click',() => window.print());
$('notes-open').addEventListener('click',() => $('notes').showModal());
$('notes-close').addEventListener('click',() => $('notes').close());
$('notes').addEventListener('click',event => { if(event.target === $('notes')) { const rect=$('notes').getBoundingClientRect(); if(event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) $('notes').close(); } });
window.addEventListener('popstate',load);
load();
