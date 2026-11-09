import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { affiliateClickCapture } from '../src/lib/affiliate-click-capture.ts';
import * as analytics from '../src/lib/analytics.ts';

test('click before hydration survives navigation until acknowledged; middle click only once', () => {
  const stored = new Map();
  const boot = (path) => {
    const listeners = {}, window = { dispatchEvent() {} };
    runInNewContext(affiliateClickCapture, {
      window, document: { addEventListener: (type, handler) => listeners[type] = handler },
      sessionStorage: { getItem: key => stored.get(key), setItem: (key, value) => stored.set(key, value) },
      localStorage: { getItem: () => null }, location: { pathname: path, search: '?ct_test=1' },
      crypto: { randomUUID }, URLSearchParams, Event, Date,
    });
    return { listeners, capture: window.__ctAffiliateClicks };
  };
  const anchor = { href: 'https://bestmore.net/click.php?m=lgecom', dataset: { storeAffiliate: 'lge' }, textContent: 'LG전자 혜택 보기' };
  const target = { closest: () => anchor };
  const first = boot('/store/lge');
  first.listeners.click({ type: 'click', button: 0, target });
  const original = first.capture.pending()[0];
  assert.equal(original.path, '/store/lge');
  assert.equal(original.is_test, true);
  const next = boot('/store/coupang');
  assert.equal(next.capture.pending()[0].id, original.id);
  assert.equal(next.capture.pending()[0].path, '/store/lge');
  next.capture.ack(original.id);
  assert.equal(boot('/store/lge').capture.pending().length, 0);
  next.listeners.auxclick({ type: 'auxclick', button: 2, target });
  assert.equal(next.capture.pending().length, 0);
  next.listeners.auxclick({ type: 'auxclick', button: 1, target });
  assert.equal(next.capture.pending().length, 1);
});

test('captured click sends immediately without authentication await and preserves original ID/path on retry', async () => {
  const exports = {}, sent = [], saved = new Map();
  const source = ts.transpile(readFileSync(new URL('../src/lib/analytics-client.ts', import.meta.url), 'utf8'), { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 });
  runInNewContext(source, {
    exports, require: name => { assert.equal(name, './analytics'); return analytics; },
    crypto: { randomUUID }, URLSearchParams,
    localStorage: { getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value) },
    location: { pathname: '/store/coupang', hostname: 'coupontalk.kr', search: '' },
    document: { referrer: '' }, navigator: { userAgent: 'Mobile' },
    fetch: async (_, options) => { sent.push(JSON.parse(options.body)); return { ok: sent.length > 1, status: sent.length > 1 ? 200 : 500 }; },
  });
  const id = randomUUID();
  const pending = exports.trackEvent('affiliate_click', { id, path: '/store/lge', store_id: 'lge', is_test: true });
  assert.equal(sent.length, 1);
  assert.equal(await pending, true);
  assert.equal(sent.length, 2);
  assert.equal(sent[0].id, id);
  assert.equal(sent[1].id, id);
  assert.equal(sent[1].path, '/store/lge');
  assert.equal(sent[1].is_test, true);
});
