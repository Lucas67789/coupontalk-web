import test from 'node:test';
import assert from 'node:assert/strict';
import {safeAffiliateUrl,safeNavigationUrl} from '../src/lib/affiliate.ts';
import {sanitizeContent} from '../src/lib/content-safety.ts';

test('malformed image URLs cannot become internal coupon navigation',()=>{
 for (const u of ['/store/롯데온/coupon/<https:/coupontalk.kr/a.webp>', '/store/lotteon/coupon/%3Chttps:/coupontalk.kr/a.webp%3E', '/store/lotteon/coupon/https:/coupontalk.kr/a.webp']) assert.equal(safeNavigationUrl(u),null);
 assert.equal(safeNavigationUrl('/store/lotteon/coupon/valid-id'),'/store/lotteon/coupon/valid-id');
 assert.ok(safeNavigationUrl('/coupon-images/a.webp'));
});

test('outbound policy denies unverified merchant, tracker and altered owner links',()=>{
 for(const u of ['https://www.charleskeith.com/kr?utm_medium=affiliate','http://app.ac/unknown','https://link.coupang.com/a/unknown','https://www.gamsgo.com/partner/other','https://newtip.net/click.php?m=agoda&a=A100705293&l=0000','https://www.gamsgo.com/partner/rQT9a?redirect=https://evil.test'])assert.equal(safeAffiliateUrl(u),null,u);
 for(const u of ['https://www.trip.com/t/B6KdOPw6vW2','https://www.gamsgo.com/partner/rQT9a','http://app.ac/xtnq6XM23','http://app.ac/qjwzata23'])assert.equal(safeAffiliateUrl(u),u);
});
test('internal links work and external source anchors become text without damaging images',()=>{
 for(const u of ['/store/agoda','#price-comparison','https://coupontalk.kr/subscriptions'])assert.ok(safeNavigationUrl(u));
 for(const u of ['//evil.test','/\\evil.test','javascript:alert(1)','https://coupontalk.kr.evil.test'])assert.equal(safeNavigationUrl(u),null);
 const html=sanitizeContent('<p><a href="https://claude.com/pricing">가격 출처</a><a href="/store/agoda">아고다</a><a href="https://www.gamsgo.com/partner/rQT9a">구매</a><img src="https://images.example/a.png"></p>');
 assert.match(html,/<span>가격 출처<\/span>/);assert.match(html,/href="\/store\/agoda"/);assert.match(html,/href="https:\/\/www.gamsgo.com\/partner\/rQT9a"/);assert.match(html,/<img src="https:\/\/images.example\/a.png"/);
});
