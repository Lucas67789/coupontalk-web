import {test} from 'node:test';
import assert from 'node:assert/strict';
import {analyticsLabels} from '../src/lib/analytics-labels.ts';
const labels=analyticsLabels([{id:'klook',name:'클룩'}],[{id:'c1',store_id:'klook',title:'렌터카 10% 할인',code:'렌터카10%KLK'},{id:'c2',store_id:'klook',title:'호텔 특가',code:'NO_CODE_REQUIRED'}],[],[{slug:'claude-discount',service:'클로드'}],'UXA7C');
test('Page labels expose store, coupon and advertised code instead of raw routes',()=>{assert.equal(labels.page('/store'),'전체 스토어 목록');assert.equal(labels.page('/subscriptions/claude-discount'),'겜스고 · 클로드 · 안내 코드: UXA7C');assert.match(labels.page('/store/klook/coupon/c1'),/클룩 · 렌터카 10% 할인 · 안내 코드: 렌터카10%KLK/);assert.doesNotMatch(labels.page('/store/klook/coupon/c2'),/NO_CODE_REQUIRED/);assert.doesNotMatch(labels.page('/unknown/secret'),/secret/);});
test('Coupon action identifies the selected coupon even on a general store page',()=>{assert.equal(labels.target({path:'/store/klook',coupon_id:'c1'}),labels.coupon('c1'));assert.notEqual(labels.target({path:'/store/klook',coupon_id:'c1'}),labels.target({path:'/store/klook',coupon_id:'c2'}));assert.equal(labels.coupon('deleted'),'쿠폰 정보 미연결');});
