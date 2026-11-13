import test from 'node:test';
import assert from 'node:assert/strict';
import { couponStatus } from '../src/lib/utils.ts';
import { safeAffiliateUrl } from '../src/lib/affiliate.ts';
test('Farfetch uses supplied affiliate URL and exact announced start/end times', () => {
  assert.equal(safeAffiliateUrl('http://app.ac/WqDcYZ243'), 'http://app.ac/WqDcYZ243');
  const coupon = {expiry:'2026.12.01 18:00', content_body:'행사 기간: 2026.11.17 17:00 ~ 2026.12.01 18:00'};
  assert.equal(couponStatus(coupon, Date.parse('2026-11-17T16:59:59+09:00')), 'upcoming');
  assert.equal(couponStatus(coupon, Date.parse('2026-11-17T17:00:00+09:00')), 'active');
  assert.equal(couponStatus(coupon, Date.parse('2026-12-01T18:00:01+09:00')), 'expired');
});
