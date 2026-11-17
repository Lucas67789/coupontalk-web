import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as jsx from 'react/jsx-runtime';
import ts from 'typescript';
import * as utils from '../src/lib/utils.ts';
import * as images from '../src/lib/content-images.ts';
import * as affiliate from '../src/lib/affiliate.ts';
import * as guide from '../src/lib/store-guide.ts';
import * as theme from '../src/lib/store-theme.ts';

const api = {};
const noop = () => null;
runInNewContext(ts.transpile(readFileSync(new URL('../src/components/AliStoreLanding.tsx', import.meta.url), 'utf8'), {
  module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022,
}), {exports: api, require: name => {
  if (name === 'react/jsx-runtime') return jsx;
  if (name === 'next/link') return {default: ({children, ...props}) => createElement('a', props, children)};
  if (name === 'next/image') return {default: ({src, alt}) => createElement('img', {src, alt})};
  if (name === 'lucide-react') return new Proxy({}, {get: () => noop});
  if (name === '@/lib/utils') return utils;
  if (name === '@/lib/content-images') return images;
  if (name === '@/lib/affiliate') return affiliate;
  if (name === '@/lib/store-guide') return guide;
  if (name === '@/lib/store-theme') return theme;
  if (name === '@/lib/ali-store') return {
    aliEventLabel: title => title,
    aliOfferRows: coupon => [{code: coupon.code}],
    aliOfferInfo: coupon => ({condition: coupon.condition, url: affiliate.safeAffiliateUrl(coupon.affiliate_url)}),
    aliPaymentContent: () => '',
  };
  if (name.endsWith('.css')) return {default: {}};
  if (name === './MarkdownRenderer') return {MarkdownRenderer: noop};
  if (name === './AliOfferTable') return {default: ({storeName}) => createElement('p', null, storeName)};
  return {default: noop};
} });

test('shared landing keeps each merchant identity, individual thumbnail and detail routes', () => {
  for (const id of ['agoda', 'babybjorn', 'socar']) {
    const store = {id, name: id, website_url: '', guide_content: ''};
    const coupon = {id: 'offer-1', title: '개별 행사', code: 'SAVE', condition: '대상 상품', expiry: '2026.11.30', content_body: '![행사](https://coupontalk.kr/example.webp)', affiliate_url: ''};
    const html = renderToStaticMarkup(createElement(api.default, {store, coupons: [coupon], expiredCoupons: [{...coupon, id:'old', expiry:'2026.10.01'}], products: [], faqs: [], now:'2026-11-17T01:00:00Z'}, createElement('p', null, '전용 안내')));
    assert.ok(html.includes(`${id} 할인코드`));
    assert.ok(html.includes(`/store/${id}/coupon/offer-1`));
    assert.ok(html.includes(`/store/${id}/coupon/old`));
    assert.ok(html.includes('https://coupontalk.kr/example.webp'));
    assert.ok(html.includes('전용 안내'));
    assert.ok(!html.includes('/store/aliexpress/'));
    assert.ok(!html.includes('알리익스프레스'));
    assert.ok(!html.includes('/images/ali-store/'));
    assert.ok(html.includes('--store-accent:'));
  }
});

test('upcoming and expired offers never count as ongoing codes', () => {
  const html = renderToStaticMarkup(createElement(api.default, {store: {id:'test', name:'테스트'}, coupons:[{id:'future', code:'NEXT', title:'다음 행사', expiry:'2026.12.31', condition:'2026.12.01 시작', content_body:'행사 기간: 2026.12.01 ~ 2026.12.31'}], expiredCoupons:[], products:[], faqs:[], now:'2026-11-17T01:00:00Z'}));
  assert.ok(html.includes('시작 예정'));
  assert.ok(html.includes('코드 0종'));
});
