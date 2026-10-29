import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeContent, jsonLd } from '../src/lib/content-safety.ts';
import { safeAffiliateUrl, hasCouponCode } from '../src/lib/affiliate.ts';
import { isCouponExpired } from '../src/lib/utils.ts';
import { parseFaqs } from '../src/lib/faq.ts';
import { contentImages, publicContentImages, couponImages } from '../src/lib/content-images.ts';

test('content images support Markdown and HTML, deduplicate and reject unsafe URLs', () => {
    assert.deepEqual(contentImages('![coupon](https://example.com/a.jpg) <img src="https://example.com/b.jpg?a=1&amp;b=2"> ![same](https://example.com/a.jpg) <img src="javascript:alert(1)"> <img src="https://user:pass@example.com/c.jpg">'), ['https://example.com/a.jpg', 'https://example.com/b.jpg?a=1&b=2']);
    assert.deepEqual(contentImages(null), []);
    assert.deepEqual(contentImages('![상품](/images/product.jpg)'), ['https://coupontalk.kr/coupon-images/_site/product.jpg?fit=square-v1']);
    assert.deepEqual(contentImages('<img src="//unknown.example/a.jpg">'), []);
    const previous = process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://owned.supabase.co';
    try {
        assert.deepEqual(contentImages('![coupon](https://owned.supabase.co/storage/v1/object/public/images/thumbnails/a.jpg)'), ['https://coupontalk.kr/coupon-images/thumbnails/a.jpg?fit=square-v1']);
        assert.deepEqual(contentImages('![coupon](https://owned.supabase.co/storage/v1/object/public/images/a.svg)'), ['https://coupontalk.kr/coupon-images/a.svg.png?fit=square-v1']);
        assert.equal(publicContentImages('<img src="https://owned.supabase.co/storage/v1/object/public/images/a.svg">'), '<img src="https://coupontalk.kr/coupon-images/a.svg.png?fit=square-v1">');
        assert.deepEqual(couponImages(''), ['https://coupontalk.kr/og-image.png?fit=square-v1']);
    } finally {
        if (previous === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
        else process.env.NEXT_PUBLIC_SUPABASE_URL = previous;
    }
});

test('FAQ arrays and legacy JSON strings render without accepting malformed entries', () => {
    const faqs = [{ question: '사용 방법?', answer: '결제 화면에 입력' }];
    assert.deepEqual(parseFaqs(faqs), faqs);
    assert.deepEqual(parseFaqs(JSON.stringify(faqs)), faqs);
    for (const value of [null, '{}', '{broken', 5]) assert.deepEqual(parseFaqs(value), []);
    assert.deepEqual(parseFaqs([null, { question: {} }, ...faqs]), faqs);
});

test('stored HTML cannot execute handlers, embedded scripts or unsafe URLs', () => {
    const clean = sanitizeContent('<p><img src="https://example.com/a.jpg" onerror="alert(1)"><a href="javascript:alert(1)">offer</a><svg onload="alert(1)"></svg><iframe srcdoc="<script>alert(1)</script>"></iframe><script>alert(1)</script></p>');
    assert.doesNotMatch(clean, /onerror|javascript:|<script|<svg|<iframe|srcdoc/);
    assert.match(clean, /https:\/\/example.com\/a.jpg/);
    assert.match(sanitizeContent('<h1>Hello</h1><p style="color:#ff0000;text-align:center">World</p>'), /<h2>Hello<\/h2>/);
});
test('JSON-LD data cannot close its HTML script element', () => {
    const payload = { title: '</script><script>alert(1)</script>' };
    const encoded = jsonLd(payload);
    assert.ok(!encoded.includes('<'));
    assert.deepEqual(JSON.parse(encoded), payload);
});
test('affiliate URLs only allow absolute HTTP(S) links without credentials', () => {
    for (const value of ['javascript:alert(1)', 'data:text/html,test', '//evil.test', 'https://user:password@example.com', '', undefined]) assert.equal(safeAffiliateUrl(value), null);
    assert.equal(safeAffiliateUrl('https://example.com/?aff=owner'), 'https://example.com/?aff=owner');
    assert.equal(hasCouponCode('전용링크 자동적용'), false);
    assert.equal(hasCouponCode('LKP10'), true);
});
test('expiry follows Korea midnight, precise time and range end', () => {
    assert.equal(isCouponExpired('2026.09.30', '', Date.parse('2026-09-30T14:59:59Z')), false);
    assert.equal(isCouponExpired('2026.09.30', '', Date.parse('2026-09-30T15:00:00Z')), true);
    assert.equal(isCouponExpired('2026-10-02 12:00:00', '', Date.parse('2026-10-02T04:00:00Z')), true);
    assert.equal(isCouponExpired('2026-09-01 ~ 2026-10-31', '', Date.parse('2026-10-02T04:00:00Z')), false);
    assert.equal(isCouponExpired('상시진행', '9월 등록', Date.parse('2026-10-02T04:00:00Z')), false);
    assert.equal(isCouponExpired('2026.09.30 예약 / 2026.12.31 투숙', '', Date.parse('2026-10-02T04:00:00Z')), true);
    for (const expiry of ['예약:2026년 4월 30일 마감 / 숙박:2027년 3월 31일 까지', '2026년 4월 내 예약 시, 2027년 3월 31일 숙박 건', '예약기간: 2026.08.01~2026.09.30 / 숙박기간: ~2027.09.30']) {
        assert.equal(isCouponExpired(expiry, '', Date.parse('2026-10-14T00:00:00Z')), true, expiry);
    }
    assert.equal(isCouponExpired('2026년 10월 내 예약 / 2027년 3월 투숙', '', Date.parse('2026-10-31T14:59:59Z')), false);
    assert.equal(isCouponExpired('2026년 10월 내 예약 / 2027년 3월 투숙', '', Date.parse('2026-10-31T15:00:00Z')), true);
    assert.equal(isCouponExpired('예약:2026/09/30 / 숙박:2027/03/31', '', Date.parse('2026-10-14T00:00:00Z')), true);
    assert.equal(isCouponExpired('2026/10/31 예약 / 2027/03/31 투숙', '', Date.parse('2026-10-14T00:00:00Z')), false);
});
