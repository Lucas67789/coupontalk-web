import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as affiliate from '../src/lib/affiliate.ts';
import * as tiers from '../src/lib/ali-coupon-tiers.ts';

const api = {};
runInNewContext(ts.transpile(readFileSync(new URL('../src/lib/ali-store.ts', import.meta.url), 'utf8'), {
  module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
}), { exports: api, require: name => {
  if (name === './affiliate') return affiliate;
  if (name === './ali-coupon-tiers') return tiers;
  throw new Error(`Unexpected dependency: ${name}`);
} });

test('summary and event rows derive amounts from the published campaign body', () => {
  const coupon = { id: 'coupon-aliexpress-nov2026-1111', content_body: '| LTIK04 | US$27 이상 | US$4 |\n| LTIK45 | US$375 이상 | US$45 |' };
  assert.equal(api.aliOfferRows(coupon)[0].minimum, 'US$27 이상');
  assert.equal(api.aliOfferRows(coupon)[1].discount, 'US$45 할인');
  coupon.content_body = '| LTIK04 | US$30 이상 | US$5 |';
  assert.equal(api.aliOfferRows(coupon)[0].discount, 'US$5 할인');
});

test('legacy conditions preserve valid affiliate links and reject unsafe URLs', () => {
  assert.equal(api.aliOfferInfo({condition: JSON.stringify({text:'대상 상품 한정',url:'http://app.ac/xtnq6XM23'})}).condition, '대상 상품 한정');
  assert.equal(api.aliOfferInfo({condition: JSON.stringify({url:'javascript:alert(1)'})}).url, null);
  assert.equal(api.aliOfferInfo({condition:'대상 상품',affiliate_url:'http://app.ac/xtnq6XM23'}).url, 'http://app.ac/xtnq6XM23');
});

test('payment extraction stops at unrelated sections and retains restrictions', () => {
  const content = '## 행사\n소개\n### 카드 할인 조건\n특정 상품 한정\n| KB | US$22 |\n### 자주 묻는 질문\nFAQ\n### 간편결제 할인\n선착순 소진 시 종료';
  const payment = api.aliPaymentContent(content);
  assert.match(payment, /특정 상품 한정/);
  assert.match(payment, /선착순 소진 시 종료/);
  assert.doesNotMatch(payment, /FAQ|소개/);
  assert.equal(api.aliPaymentContent('카드 할인 등록 없음'), '');
});

test('ordinary multi-code and code-free promotions retain their own conditions', () => {
  const rows = api.aliOfferRows({id:'monthly',code:'ABC\nDEF',discount:'10% 할인',condition:'신규 고객 한정'});
  assert.equal(rows.length, 2);
  assert.equal(rows[1].minimum, '신규 고객 한정');
  assert.equal(api.aliOfferRows({id:'no-code',code:'',discount:'상품 특가',condition:''})[0].code, '');
});
