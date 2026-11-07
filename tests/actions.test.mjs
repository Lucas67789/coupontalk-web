import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import * as affiliate from '../src/lib/affiliate.ts';

function load(path, imports, globals) {
    const exports = {};
    const source = ts.transpile(readFileSync(new URL(path, import.meta.url), 'utf8'), { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 });
    runInNewContext(source, { exports, require: name => {
        assert.ok(name in imports, `Unexpected import: ${name}`);
        return imports[name];
    }, ...globals });
    return exports;
}

test('coupon opens immediately even when statistics never respond', async () => {
    const events = [];
    const { openCouponLink } = load('../src/lib/coupon-action.ts', {
        './affiliate': affiliate,
        './analytics-client': { trackEvent: () => new Promise(() => {}) },
    }, {
        window: { open: (...args) => events.push(['open', ...args]) },
        navigator: { clipboard: { writeText: code => { events.push(['copy', code]); return Promise.resolve(); } } },
        localStorage: { getItem: () => 'session' },
        fetch: () => new Promise(() => {}),
    });
    const result = openCouponLink({ id: 'coupon', code: 'SAVE10' }, 'https://www.gamsgo.com/partner/rQT9a', 'Store');
    assert.equal(events[0][0], 'copy');
    assert.deepEqual(events[1], ['open', 'https://www.gamsgo.com/partner/rQT9a', '_blank', 'noopener,noreferrer']);
    assert.match(await result, /복사 완료/);
    const count = events.length;
    await openCouponLink({ id: 'coupon', code: 'SAVE10' }, 'javascript:alert(1)', 'Store');
    assert.equal(events.length, count);
});

test('admin errors keep the editor open; successful writes pass the token to cache invalidation', async () => {
    const messages = [], tokens = [];
    const { saveAdminChange } = load('../src/lib/admin-mutation.ts', {
        './supabase': { supabase: { auth: { getSession: async () => ({ data: { session: { access_token: 'test-token' } } }) } } },
        '@/app/actions/cacheActions': { clearAllCache: async token => tokens.push(token) },
    }, { alert: text => messages.push(text) });
    assert.equal(await saveAdminChange(Promise.resolve({ data: null, error: { message: 'Permission denied' } })), false);
    assert.equal(await saveAdminChange(Promise.resolve({ data: [], error: null })), false);
    assert.equal(tokens.length, 0);
    assert.equal(await saveAdminChange(Promise.resolve({ data: [{ id: 'saved' }], error: null })), true);
    assert.deepEqual(tokens, ['test-token']);
    assert.equal(messages.length, 2);
});
import { aliCouponTiers, aliCouponDetails } from '../src/lib/ali-coupon-tiers.ts';
test('all six Ali tiers copy only the selected code and open the user affiliate URL once', async () => {
 const body = '| 코드 | 최소 구매 금액 | 할인 금액 |\n| --- | --- | --- |\n' + [['04',27,4],['08',58,8],['13',98,13],['19',148,19],['28',225,28],['45',375,45]].map(([c,m,d])=>`| LTIK${c} | US$${m} 이상 | US$${d} |`).join('\n');
 const tiers = aliCouponTiers({id:'coupon-aliexpress-nov2026-1111',content_body:body});
 assert.equal(tiers.length,6);assert.deepEqual(tiers.map(t=>t.discount),[4,8,13,19,28,45]);
 const opens=[],copies=[],events=[];
 const {openCouponLink}=load('../src/lib/coupon-action.ts',{'./affiliate':affiliate,'./analytics-client':{trackEvent:(...a)=>events.push(a)}},{window:{open:(url)=>opens.push(url)},navigator:{clipboard:{writeText:async c=>copies.push(c)}}});
 for(const tier of tiers) await openCouponLink({id:'coupon-aliexpress-nov2026-1111',code:tier.code},'http://app.ac/xtnq6XM23','알리익스프레스');
 assert.deepEqual(copies,tiers.map(t=>t.code));assert.deepEqual(opens,Array(6).fill('http://app.ac/xtnq6XM23'));assert.equal(events.filter(e=>e[0]==='affiliate_click').length,6);
 assert.deepEqual(aliCouponTiers({id:'unrelated',content_body:body}),[]);
 assert.equal(aliCouponDetails('old table\n### 알리 광군제 할인코드 입력 방법\nsteps'),'### 알리 광군제 할인코드 입력 방법\nsteps');
});

test('Ali browse and code buttons retain distinct labels without copying on browse', async () => {
 const opens=[],copies=[],events=[];
 const {openCouponLink}=load('../src/lib/coupon-action.ts',{'./affiliate':affiliate,'./analytics-client':{trackEvent:(...a)=>events.push(a)}},{window:{open:url=>opens.push(url)},navigator:{clipboard:{writeText:async c=>copies.push(c)}}});
 await openCouponLink({id:'coupon-aliexpress-nov2026-1111',code:'LTIK45'},'http://app.ac/xtnq6XM23','알리익스프레스',false,'알리 상품 먼저 보기 · 상단');
 assert.equal(copies.length,0);assert.equal(events.length,1);assert.equal(events[0][1].button_label,'알리 상품 먼저 보기 · 상단');
 await openCouponLink({id:'coupon-aliexpress-nov2026-1111',code:'LTIK45'},'http://app.ac/xtnq6XM23','알리익스프레스',true,'알리 LTIK45 · 금액별 쿠폰');
 assert.deepEqual(copies,['LTIK45']);assert.equal(opens.length,2);assert.equal(events[1][1].button_label,events[2][1].button_label);assert.equal(events[1][1].button_label,'알리 LTIK45 · 금액별 쿠폰');
});
