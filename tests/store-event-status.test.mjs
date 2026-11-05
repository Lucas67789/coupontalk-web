import test from 'node:test';
import assert from 'node:assert/strict';
import { storeEventStatus } from '../src/lib/store-event-status.ts';
test('dated events use Korean end-of-day and distinguish future and unknown records', () => {
 assert.equal(storeEventStatus('2026.02.09 ~ 02.24', new Date('2026-11-05T00:00:00Z')), 'record');
 assert.equal(storeEventStatus('2026.11.01 ~ 11.05', new Date('2026-11-05T14:59:59Z')), 'current');
 assert.equal(storeEventStatus('2026.11.01 ~ 11.05', new Date('2026-11-05T15:00:00Z')), 'record');
 assert.equal(storeEventStatus('2026.12.01 ~ 2026.12.31', new Date('2026-11-05T00:00:00Z')), 'upcoming');
 assert.equal(storeEventStatus('2026.12.20 ~ 01.10', new Date('2027-01-01T00:00:00Z')), 'current');
 assert.equal(storeEventStatus('상시 행사'), 'record');
});
