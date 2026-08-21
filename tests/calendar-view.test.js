import test from 'node:test';
import assert from 'node:assert/strict';
import { monthGrid } from '../web/calendar-view.js';

test('calendar month grid starts on monday', () => {
  const cells = monthGrid(2026, 8);
  const firstDate = cells.findIndex(Boolean);
  assert.equal(new Date('2026-08-01T12:00:00').getDay(), 6);
  assert.equal(firstDate, 5);
  assert.equal(cells.filter(Boolean).length, 31);
});
