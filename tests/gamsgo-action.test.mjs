import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { gamsgoProductLinks, gamsgoAffiliateLink } from '../src/lib/gamsgo-links.ts';

function action(clipboard) {
  const opens = [], events = [], exports = {};
  const imports = {
    './analytics-client': { trackEvent: (...args) => { events.push(args); return new Promise(() => {}); } },
    './gamsgo-links': { gamsgoAffiliateLink },
    './gamsgo-promotion': { gamsgoPromoCode: 'UXA7C' },
  };
  runInNewContext(ts.transpile(readFileSync('src/lib/gamsgo-action.ts', 'utf8'), { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }), {
    exports, require: name => imports[name], navigator: { clipboard }, window: { open: (...args) => opens.push(args) },
  });
  return { run: exports.copyGamsgoAndOpen, opens, events };
}

test('every service copies UXA7C and immediately opens its unchanged owner product link', async () => {
  for (const [slug, url] of Object.entries(gamsgoProductLinks)) {
    let finish;
    const copies = [];
    const a = action({ writeText: code => { copies.push(code); return new Promise(resolve => { finish = resolve; }); } });
    const pending = a.run(slug);
    assert.deepEqual(copies, ['UXA7C']);
    assert.equal(a.opens.length, 1);
    assert.equal(a.opens[0][0], url);
    assert.ok(url.endsWith('/partner/rQT9a'));
    finish();
    assert.match(await pending, /복사했습니다/);
    assert.deepEqual(a.events.map(e => e[0]), ['affiliate_click', 'code_copy']);
    assert.equal(a.events[0][1].subscription_slug, slug);
  }
});

test('clipboard unavailable, rejected or throwing does not block the affiliate destination or falsely count a copy', async () => {
  for (const clipboard of [undefined, { writeText: () => Promise.reject(new Error('Denied')) }, { writeText: () => { throw new Error('Denied'); } }]) {
    const a = action(clipboard);
    assert.match(await a.run('duolingo-discount-code'), /자동 복사가 되지/);
    assert.equal(a.opens[0][0], 'https://www.gamsgo.com/details/duolingo/partner/rQT9a');
    assert.deepEqual(a.events.map(e => e[0]), ['affiliate_click']);
  }
});
