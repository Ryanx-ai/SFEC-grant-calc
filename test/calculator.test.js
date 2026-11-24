import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, normalizePax, TRANCHE } from '../calculator.js';

test('matches supplied 21 SG/PR and 4 foreign training example at 70%', () => {
  const r = calculate({ subsidy: 70, training: { local: 21, foreign: 4 } });
  assert.equal(r.localGross, 3465000);
  assert.equal(r.localNet, 1039500);
  assert.equal(r.offset, 1000000);
  assert.equal(r.shortfall, 39500);
  assert.equal(r.localGst, 311850);
  assert.equal(r.localPayable, 351350);
  assert.equal(r.foreignPayable, 719400);
  assert.equal(r.totalPayable, 1070750);
});
test('one eligible training participant pays GST only at either subsidy', () => {
  for (const subsidy of [50, 70]) {
    const r = calculate({ subsidy, training: { local: 1 } });
    assert.equal(r.localPayable, 14850);
    assert.equal(r.offset, subsidy === 50 ? 82500 : 49500);
  }
});
test('fresh tranche thresholds for both courses and subsidy rates', () => {
  for (const [subsidy, targets] of [[70, [21, 26]], [50, [13, 16]]]) {
    const r = calculate({ subsidy });
    assert.deepEqual(r.rows.map(row => row.target), targets);
    for (const row of r.rows) {
      assert.ok((row.target - 1) * row.netPerPax < TRANCHE);
      assert.ok(row.target * row.netPerPax >= TRANCHE);
    }
  }
});
test('mixed courses share one credit cap, foreigners never consume it', () => {
  const r = calculate({ subsidy: 70, training: { local: 10, foreign: 4 }, automation: { local: 13, foreign: 2 } });
  assert.equal(r.localNet, 1002000);
  assert.equal(r.offset, TRANCHE);
  assert.equal(r.shortfall, 2000);
  assert.equal(r.foreignPayable, 1002800);
  assert.equal(r.remaining, 0);
  assert.equal(r.percentage, 100);
});
test('foreign-only and zero plans have no subsidies or credit usage', () => {
  const r = calculate({ subsidy: 70, automation: { foreign: 1 } });
  assert.equal(r.offset, 0);
  assert.equal(r.savings, 0);
  assert.equal(r.totalPayable, 141700);
  const empty = calculate({});
  assert.equal(empty.totalPayable, 0);
  assert.equal(empty.remaining, TRANCHE);
});
test('recommendations reach cap with the fewest additional enrolments', () => {
  for (const subsidy of [50, 70]) for (let local = 0; local < 30; local++) {
    const r = calculate({ subsidy, training: { local } });
    for (const s of r.suggestions) {
      const net = r.rows.find(row => row.id === s.id).netPerPax;
      assert.ok(s.additional * net >= r.remaining);
      if (s.additional > 0) assert.ok((s.additional - 1) * net < r.remaining);
      assert.equal(s.excess, s.additional * net - r.remaining);
    }
  }
});
test('input normalization rejects non-finite, negative, fractional and extreme counts', () => {
  assert.equal(normalizePax(-10), 0);
  assert.equal(normalizePax(''), 0);
  assert.equal(normalizePax('oops'), 0);
  assert.equal(normalizePax(Infinity), 0);
  assert.equal(normalizePax(2.9), 2);
  assert.equal(normalizePax(999999), 9999);
});
test('totals reconcile across representative course mixes', () => {
  for (const subsidy of [50, 70]) for (const count of [0, 1, 20, 21, 26, 9999]) {
    const r = calculate({ subsidy, training: { local: count, foreign: 3 }, automation: { local: count, foreign: 2 } });
    assert.equal(r.localGross + r.foreignGross - r.savings - r.offset + r.localGst + r.foreignGst, r.totalPayable);
    assert.equal(r.localPayable + r.foreignPayable, r.totalPayable);
    assert.equal(r.remaining + r.offset, TRANCHE);
    for (const amount of [r.offset, r.totalPayable, r.localGst, r.foreignGst]) assert.ok(Number.isSafeInteger(amount));
  }
});

test('old SFEC reimburses 90% and distinguishes net cost from upfront cash', () => {
  const r = calculate({ subsidy:70, sfec:90, training:{local:21,foreign:4} });
  assert.equal(r.offset,935550);
  assert.equal(r.shortfall,103950);
  assert.equal(r.localPayable,415800);
  assert.equal(r.totalPayable,1135200);
  assert.equal(r.totalUpfront,2070750);
  assert.equal(r.remaining,64450);
});
test('old SFEC thresholds consume the full tranche at both subsidy rates', () => {
  for (const [subsidy,targets] of [[70,[23,29]],[50,[14,18]]]) {
    const r = calculate({ subsidy,sfec:90 });
    assert.deepEqual(r.rows.map(row=>row.target),targets);
    for (const row of r.rows) {
      const before=calculate({ subsidy,sfec:90,[row.id]:{local:row.target-1} });
      const after=calculate({ subsidy,sfec:90,[row.id]:{local:row.target} });
      assert.ok(before.offset<TRANCHE);
      assert.equal(after.offset,TRANCHE);
      assert.equal(after.totalUpfront-after.totalPayable,TRANCHE);
    }
  }
});
test('new scheme remains default and foreign pricing is unaffected by SFEC rate', () => {
  const input={subsidy:50,automation:{local:1,foreign:2}};
  const old=calculate({...input,sfec:90});
  const current=calculate(input);
  assert.equal(current.sfec,100);
  assert.equal(current.totalUpfront,current.totalPayable);
  assert.equal(old.foreignPayable,current.foreignPayable);
  assert.equal(old.offset,58500);
  assert.equal(old.localPayable,18200);
});
