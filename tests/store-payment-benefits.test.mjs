import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
import {paymentBenefits} from '../src/lib/store-payment-data.ts';
import {storeTheme} from '../src/lib/store-theme.ts';

const api = {};
runInNewContext(ts.transpile(readFileSync(new URL('../src/lib/store-payment-benefits.ts',import.meta.url),'utf8'), {module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}), {exports:api,URL,require:()=>({paymentBenefits})});

test('every payment record has dates, source, conditions and a unique ID',()=>{
  const ids=new Set();
  for(const b of paymentBenefits){
    api.validatePaymentBenefit(b);
    assert.ok(!ids.has(b.id)); ids.add(b.id);
  }
  for(const bad of [{...paymentBenefits[0],sourceUrl:''},{...paymentBenefits[0],end:'2025-01-01'},{...paymentBenefits[0],conditions:[]}]) assert.throws(()=>api.validatePaymentBenefit(bad));
});
test('Korean midnight removes expired benefits and preserves scheduled dates accurately',()=>{
  assert.ok(api.storePaymentBenefits('emart','2026-11-18T14:59:59Z').some(b=>b.id==='emart-hy' && b.activeToday));
  assert.ok(!api.storePaymentBenefits('emart','2026-11-18T15:00:00Z').some(b=>b.id==='emart-hy'));
  assert.equal(api.storePaymentBenefits('hmall','2026-11-17T06:00:00Z').find(b=>b.id==='hmall-hy-toss').activeToday,false);
  assert.equal(api.storePaymentBenefits('hmall','2026-11-18T06:00:00Z').find(b=>b.id==='hmall-hy-toss').activeToday,true);
  assert.equal(api.storePaymentBenefits('hmall','2026-11-19T06:00:00Z').some(b=>b.id==='hmall-hy-toss'),false);
  assert.equal(api.storePaymentBenefits('gseshop','2026-11-19T06:00:00Z').every(b=>!b.activeToday),true);
});
test('store payment benefits are available without an active coupon and expire',()=>{
  assert.ok(api.storePaymentBenefits('lgecom','2026-11-17T06:00:00Z').length);
  assert.equal(api.storePaymentBenefits('lgecom','2026-12-01T00:00:00Z').length,0);
  assert.equal(api.storePaymentBenefits('unknown','2026-11-17T06:00:00Z').length,0);
});
test('merchant identity does not inherit AliExpress accent',()=>{
  for(const id of ['shokz','agoda','kkday','베이비뵨','unknown']) assert.notEqual(storeTheme(id)['--store-accent'],storeTheme('aliexpress')['--store-accent']);
});
