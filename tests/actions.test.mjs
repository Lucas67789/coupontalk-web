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
        './supabase': { supabase: { rpc: () => new Promise(() => {}) } },
    }, {
        window: { open: (...args) => events.push(['open', ...args]) },
        navigator: { clipboard: { writeText: code => { events.push(['copy', code]); return Promise.resolve(); } } },
        localStorage: { getItem: () => 'session' },
        fetch: () => new Promise(() => {}),
    });
    const result = openCouponLink({ id: 'coupon', code: 'SAVE10' }, 'https://example.com/?aff=owner', 'Store');
    assert.equal(events[0][0], 'copy');
    assert.deepEqual(events[1], ['open', 'https://example.com/?aff=owner', '_blank', 'noopener,noreferrer']);
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
