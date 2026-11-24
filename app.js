import { calculate, COURSES, normalizePax, MAX_PAX } from './calculator.js';
const $ = id => document.getElementById(id);
const money = cents => `S$${(cents / 100).toLocaleString('en-SG', { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;
let result;
let timer;
let announceTimer;
function render() {
  const course = COURSES.find(c => c.id === $('course').value);
  const subsidy = Number(document.querySelector('[name="subsidy"]:checked').value);
  result = calculate({ subsidy, [course.id]: { local: $('local-pax').value, foreign: $('foreign-pax').value } });
  const r = result;
  const row = r.rows.find(c => c.id === course.id);
  const values = { 'target-pax':row.target, 'local-gross':money(r.localGross), 'foreign-gross':money(r.foreignGross),
    'local-net':money(r.localNet), 'foreign-net':money(r.foreignGross), 'subsidy-label':`${subsidy}% subsidy`,
    'net-per-pax':`${money(row.netPerPax)} / pax`, 'sfec-offset':r.offset ? `−${money(r.offset)}` : money(0),
    'local-after':money(r.shortfall), 'foreign-after':money(r.foreignGross), 'local-gst':money(r.localGst),
    'foreign-gst':money(r.foreignGst), 'local-payable':money(r.localPayable), 'foreign-payable':money(r.foreignPayable),
    'credit-used':money(r.offset), 'credit-remaining':`${money(r.remaining)} remaining`, 'total-payable':money(r.totalPayable) };
  for (const [id,value] of Object.entries(values)) $(id).textContent = value;
  document.querySelectorAll('.per-pax').forEach(el => el.textContent = `${money(row.fee)} / pax`);
  $('fill-target').innerHTML = `Use ${row.target} pax <span aria-hidden="true">↗</span>`;
  $('fill-target').setAttribute('aria-label', `Set SG/PR participants to ${row.target} to use the S$10,000 tranche`);
  $('meter-fill').style.width = `${r.percentage}%`;
  document.querySelector('[role="progressbar"]').setAttribute('aria-valuenow',r.percentage);
  document.querySelector('[role="progressbar"]').setAttribute('aria-valuetext',`${money(r.offset)} of S$10,000 used`);
  for (const button of document.querySelectorAll('[data-step]')) {
    const count = normalizePax($(button.dataset.input).value);
    button.disabled = Number(button.dataset.step) < 0 ? count === 0 : count === MAX_PAX;
  }
  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => { $('live-summary').textContent = `${money(r.offset)} SFEC used. ${money(r.remaining)} remaining. Total payable ${money(r.totalPayable)}.`; },350);
}
function saveUrl() {
  const url = new URL(location.href);
  url.search = new URLSearchParams({ course:$('course').value, subsidy:result.subsidy, local:normalizePax($('local-pax').value), foreign:normalizePax($('foreign-pax').value) }).toString();
  history.replaceState(null,'',url);
}
function update() { render(); saveUrl(); }
function load() {
  const params = new URLSearchParams(location.search);
  const course = params.get('course') === 'automation' || (!params.has('course') && Number(params.get('automation-local')) > 0 && !Number(params.get('training-local'))) ? 'automation' : 'training';
  $('course').value = course;
  const subsidy = params.get('subsidy') === '50' ? '50' : '70';
  document.querySelector(`[name="subsidy"][value="${subsidy}"]`).checked = true;
  $('local-pax').value = normalizePax(params.get('local') ?? params.get(`${course}-local`) ?? 21);
  $('foreign-pax').value = normalizePax(params.get('foreign') ?? params.get(`${course}-foreign`) ?? 4);
  render();
}
function toast(message) {
  clearTimeout(timer); $('toast').textContent = message; $('toast').classList.add('visible');
  timer = setTimeout(() => $('toast').classList.remove('visible'),3500);
}
for (const id of ['local-pax','foreign-pax']) {
  $(id).addEventListener('input',() => { if ($(id).value !== '') $(id).value = normalizePax($(id).value); update(); });
  $(id).addEventListener('blur',() => { $(id).value = normalizePax($(id).value); update(); });
}
$('course').addEventListener('change',update);
for (const input of document.querySelectorAll('[name="subsidy"]')) input.addEventListener('change',update);
for (const button of document.querySelectorAll('[data-step]')) button.addEventListener('click',() => {
  const input = $(button.dataset.input); input.value = normalizePax(normalizePax(input.value) + Number(button.dataset.step)); update();
});
$('fill-target').addEventListener('click',() => {
  const target = result.rows.find(row => row.id === $('course').value).target;
  $('local-pax').value = target; update(); toast(`Set to ${target} SG/PR pax. S$10,000 credit fully used.`);
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
