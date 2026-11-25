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
  result = calculate({ subsidy, sfec, balance:normalizeBalance(Number($('sfec-balance').value) * 100), [course.id]: { local: $('local-pax').value, foreign: $('foreign-pax').value, localOlder:$('local-older').value, eligibleOlder:$('local-older').value } });
  const r = result;
  const row = r.rows.find(c => c.id === course.id);
  $('local-younger').value = row.localAges.younger;
  $('local-older').value = row.localAges.older;
  $('local-younger').max = row.local;
  $('local-older').max = row.local;
  const ageAvailable = subsidy === 50;
  const ageBenefit = row.localAges.eligible > 0 && ageAvailable;
  $('age-toggle').hidden = !ageAvailable;
  if (!ageAvailable) $('age-toggle').setAttribute('aria-expanded','false');
  $('age-row').hidden = !ageAvailable || $('age-toggle').getAttribute('aria-expanded') !== 'true';
  $('age-row').classList.toggle('age-available',ageAvailable);
  $('age-toggle-label').textContent = ageBenefit ? `Ages · ${row.localAges.eligible} citizens 40+` : 'Set ages';
  const values = { 'target-pax':row.target, 'target-description':r.balance ? ` to use ${money(r.balance)}${ageBenefit ? ' at this age mix' : ' balance'}${sfec === 90 && r.foreignPax ? ` with ${r.foreignPax} foreign pax` : ''}` : ' · No SFEC credit available', 'balance-cap':`Up to ${money(r.balance)} available`, 'local-gross':money(r.localGross), 'foreign-gross':money(r.foreignGross),
    'local-net':money(r.localNet), 'foreign-net':money(r.foreignGross), 'subsidy-label':ageBenefit ? `${subsidy}% + 20 pts for ${row.localAges.eligible} eligible SCs` : `${subsidy}% subsidy`,
    'net-per-pax':ageBenefit ? `Base ${money(row.netPerPax)} · Eligible 40+ ${money(row.enhancedNetPerPax)} / pax` : `${money(row.netPerPax)} / pax`, 'sfec-offset':r.localOffset ? `−${money(r.localOffset)}` : money(0),
    'foreign-sfec-offset':sfec === 90 ? (r.foreignOffset ? `−${money(r.foreignOffset)}` : money(0)) : 'Not eligible',
    'local-after':money(r.shortfall), 'foreign-after':money(r.foreignShortfall), 'local-gst':money(r.localGst),
    'foreign-gst':money(r.foreignGst), 'local-payable':money(r.localPayable), 'foreign-payable':money(r.foreignPayable),
    'credit-used':money(r.offset), 'credit-remaining':`${money(r.remaining)} remaining`, 'total-payable':money(r.totalUpfront),
    'sfec-label':`SFEC ${sfec === 90 ? 'claim' : 'offset'} (${sfec}%)`,
    'after-label':sfec === 90 ? 'After SFEC claim' : 'After SFEC offset',
    'payable-label':sfec === 90 ? 'Net payable' : 'Upfront payable',
    'payable-note':sfec === 90 ? 'After reimbursement, incl. GST' : 'Including GST',
    'total-label':sfec === 90 ? 'Total upfront' : 'Total payable',
    'scheme-note':sfec === 90 ? 'Old SFEC: reimbursed after payment; expires 30 Nov 2026. Uses your available balance; subject to eligibility.' : 'Enhanced SFEC from 1 Dec 2026. Uses your available balance; subject to course & employee eligibility.' };
  for (const [id,value] of Object.entries(values)) $(id).textContent = value;
  $('foreign-sfec-offset').classList.toggle('not-eligible',sfec === 100);
  $('foreign-claim-note').hidden = sfec !== 90;
  document.querySelectorAll('.per-pax').forEach(el => el.textContent = `${money(row.fee)} / pax`);
  $('fill-target').innerHTML = r.balance ? `Use ${row.target} pax <span aria-hidden="true">↗</span>` : 'No credit';
  $('fill-target').disabled = r.balance === 0;
  $('fill-target').title = `${row.targetAges.younger} at baseline subsidy, ${row.targetAges.eligible} citizens aged 40+`;
  $('fill-target').setAttribute('aria-label', `Set SG/PR participants to ${row.target} to use the ${money(r.balance)} balance`);
  $('meter-fill').style.width = `${r.percentage}%`;
  document.querySelector('[role="progressbar"]').setAttribute('aria-valuenow',r.percentage);
  document.querySelector('[role="progressbar"]').setAttribute('aria-valuetext',`${money(r.offset)} of ${money(r.balance)} available credit used in this plan`);
  for (const button of document.querySelectorAll('[data-step]')) {
    const count = normalizePax($(button.dataset.input).value);
    button.disabled = Number(button.dataset.step) < 0 ? count === 0 : count >= Number($(button.dataset.input).max || MAX_PAX);
  }
  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => { $('live-summary').textContent = `${money(r.offset)} SFEC used. ${money(r.remaining)} remaining. Total upfront ${money(r.totalUpfront)}.`; },350);
}
function saveUrl() {
  const url = new URL(location.href);
  url.search = new URLSearchParams({ course:$('course').value, subsidy:result.subsidy, sfec:result.sfec, balance:(result.balance / 100).toFixed(2), local:normalizePax($('local-pax').value), foreign:normalizePax($('foreign-pax').value), citizens40:$('local-older').value }).toString();
  history.replaceState(null,'',url);
}
function update() { render(); saveUrl(); }
function load() {
  const params = new URLSearchParams(location.search);
  const requestedCourse = params.get('course');
  const course = COURSES.some(course => course.id === requestedCourse) ? requestedCourse
    : (!params.has('course') && Number(params.get('automation-local')) > 0 && !Number(params.get('training-local'))) ? 'automation' : 'training';
  $('course').value = course;
  $('sfec-balance').value = (normalizeBalance(params.has('balance') ? Number(params.get('balance')) * 100 : undefined) / 100).toFixed(2);
  const subsidy = ['0', '50', '70'].includes(params.get('subsidy')) ? params.get('subsidy') : '70';
  document.querySelector(`[name="subsidy"][value="${subsidy}"]`).checked = true;
  const sfec = params.get('sfec') === '90' ? '90' : '100';
  document.querySelector(`[name="sfec"][value="${sfec}"]`).checked = true;
  $('local-pax').value = normalizePax(params.get('local') ?? params.get(`${course}-local`) ?? 21);
  $('foreign-pax').value = normalizePax(params.get('foreign') ?? params.get(`${course}-foreign`) ?? 4);
  $('local-older').value = normalizePax(params.get('citizens40') ?? params.get('eligibleOlder'));
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
function setAgeCount(id, value) {
  const total = normalizePax($('local-pax').value);
  const count = Math.min(total,normalizePax(value));
  $('local-older').value = id === 'local-younger' ? total - count : count;
  update();
}
for (const id of ['local-younger','local-older']) {
  $(id).addEventListener('input',() => setAgeCount(id,$(id).value));
}
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
  const input = $(button.dataset.input);
  const value = normalizePax(normalizePax(input.value) + Number(button.dataset.step));
  if (input.id === 'local-younger' || input.id === 'local-older') setAgeCount(input.id,value);
  else { input.value = value; update(); }
});
$('fill-target').addEventListener('click',() => {
  if (!result.balance) return;
  const row = result.rows.find(row => row.id === $('course').value);
  const target = row.target;
  $('local-older').value = row.targetAges.older;
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
