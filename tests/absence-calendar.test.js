import assert from 'node:assert/strict';
import { daysBetween, isBusinessDay, vacationDays } from '../absence-calendar.js';

assert.equal(daysBetween('2026-08-20','2026-08-20'),1);
assert.equal(daysBetween('2026-08-20','2026-08-22'),3);
assert.equal(vacationDays('2026-08-20','2026-08-24'),5);
assert.equal(isBusinessDay('2026-08-20'),true);
assert.equal(isBusinessDay('2026-08-22'),false);
assert.equal(isBusinessDay('2026-08-20',['2026-08-20']),false);

console.log('absence-calendar.test.js: OK');
