import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { subscriptionPrices, subscriptionPriceCheckedAt } from '../src/lib/subscription-prices.ts';
import { subscriptionImagePaths } from '../src/lib/subscription-image.ts';

test('all 15 services have 3 readable PNG assets with prices matching the page data', () => {
  const manifest = JSON.parse(fs.readFileSync('public/subscription-images/v3/manifest.json','utf8'));
  assert.equal(manifest.length, Object.keys(subscriptionPrices).length * 3);
  for (const [slug, q] of Object.entries(subscriptionPrices)) {
    for (const path of subscriptionImagePaths(slug)) {
      const item = manifest.find(row => row.path === path);
      assert.ok(item, path);
      assert.equal(item.total, q.total, 'Regenerate visuals when the verified price changes');
      assert.equal(item.months, q.months);
      assert.equal(item.checkedAt, subscriptionPriceCheckedAt);
      const bytes = fs.readFileSync(`public${path}`);
      assert.equal(bytes.subarray(0,8).toString('hex'), '89504e470d0a1a0a');
      assert.equal(bytes.readUInt32BE(16),1200);
      assert.equal(bytes.readUInt32BE(20),1200);
    }
  }
});
