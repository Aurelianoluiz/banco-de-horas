import assert from 'node:assert/strict';
import { countBusinessDays } from '../integration.js';
assert.equal(countBusinessDays('2026-08-17','2026-08-21',[]),5);
assert.equal(countBusinessDays('2026-08-17','2026-08-21',['2026-08-19']),4);
console.log('integration.test.js: OK');
