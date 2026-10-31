import { test } from 'node:test';
import assert from 'node:assert/strict';
import { priceDifference, subscriptionPrices, won } from '../src/lib/subscription-prices.ts';

test('price differences preserve negative savings and round percentages', () => {
  assert.deepEqual(priceDifference(29000, 6613), { amount: 22387, percent: 77.2 });
  assert.deepEqual(priceDifference(29000, 37882), { amount: -8882, percent: -30.6 });
  assert.equal(won(18227 / 3), '6,076원');
});
test('published prices cover all 15 guides without treating stock or unlike plans as discounts', () => {
  assert.equal(Object.keys(subscriptionPrices).length, 15);
  for (const quote of Object.values(subscriptionPrices)) {
    assert.ok(quote.total > 0 && quote.months > 0 && quote.conditions && quote.difference);
    assert.ok(quote.source.startsWith('https://www.gamsgo.com/'));
  }
  assert.equal(subscriptionPrices['midjourney-pricing'].soldOut, true);
  assert.equal(subscriptionPrices['genspark-pricing'].soldOut, true);
  assert.equal(subscriptionPrices['canva-subscription'].official, undefined);
  assert.equal(subscriptionPrices['netflix-discount'].listing, true);
});
