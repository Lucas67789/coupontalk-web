import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bookingDeadlineFromContent, couponExpiryTime} from '../src/lib/utils.ts';
import {matchesSearch} from '../src/lib/search.ts';
import {hasCouponCode} from '../src/lib/affiliate.ts';
import {STORE_ALIASES} from '../src/lib/store-aliases.ts';

test('booking deadline is separate from stay end, in Markdown and editor HTML', () => {
    for (const content of ['- **예약기간:** 2026.08.01 ~ 2026.08.31 (기획전은 8월 16일까지)\n- 숙박기간: 2027.03.31', '<p><strong>예약 기간:</strong> 2026.06.01 ~ 2026.06.30</p><p>숙박: 2026.12.31</p>']) {
        const deadline = bookingDeadlineFromContent(content);
        assert.ok(couponExpiryTime(deadline) < couponExpiryTime('2026.12.31'));
    }
    assert.equal(bookingDeadlineFromContent('예약 기간은 상품별 확인'), null);
});
test('search combines brand, model and coupon terms without case or spacing sensitivity', () => {
    assert.equal(matchesSearch('레노버 ThinkPad 21KG001JKR LVLINKPRICE', '레노버  21kg001jkr'), true);
    assert.equal(matchesSearch('클룩 일본 호텔 15% 할인', '클룩 호텔'), true);
    assert.equal(matchesSearch('클룩 일본 호텔 15% 할인', '클룩 항공'), false);
});
test('automatic link labels are not copied as coupon codes, exact real codes stay intact', () => {
    assert.equal(hasCouponCode('할인코드 자동적용 (링크 접속)'), false);
    assert.equal(hasCouponCode('금액별 상이 (본문 참고)'), false);
    assert.equal(hasCouponCode('일본호텔15%KLK'), true);
    for (const target of Object.values(STORE_ALIASES)) assert.equal(STORE_ALIASES[target], undefined);
});
