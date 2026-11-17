import test from 'node:test';
import assert from 'node:assert/strict';
import {assertCouponPublishable, safeAffiliateUrl, safeNavigationUrl} from '../src/lib/affiliate.ts';

const url = 'http://app.ac/pEwL6dS53';
test('Shokz supplied link remains usable in coupon buttons and article links', () => {
  assert.equal(safeAffiliateUrl(url), url);
  assert.equal(safeNavigationUrl(url), url);
  assert.doesNotThrow(() => assertCouponPublishable({status:'published', affiliate_url:url, condition:JSON.stringify({url, v:false})}));
});
test('publishing rejects missing and unregistered destinations, including JSON overrides', () => {
  for (const coupon of [
    {}, {affiliate_url:'http://app.ac/not-approved'},
    {affiliate_url:url, condition:JSON.stringify({url:'http://app.ac/not-approved'})},
    {affiliate_url:'javascript:alert(1)'},
  ]) assert.throws(() => assertCouponPublishable({...coupon, status:'published'}), /게시 검수 실패/);
});
test('drafts can be saved without links; published legacy link shapes remain supported', () => {
  assert.doesNotThrow(() => assertCouponPublishable({status:'draft'}));
  assert.doesNotThrow(() => assertCouponPublishable({status:'published', affiliateUrl:url, condition:'상품 한정'}));
  assert.doesNotThrow(() => assertCouponPublishable({status:'published', condition:JSON.stringify({url})}));
});
