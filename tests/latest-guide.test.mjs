import {test} from 'node:test';
import assert from 'node:assert/strict';
import {latestGuideTitle, uniqueGuideTitle, latestGuideDescription, guideSubject, matchesGuideTopic} from '../src/lib/latest-guide.ts';
import {isCouponExpired, promotionStartsAt} from '../src/lib/utils.ts';
test('evergreen guide retains model intent while expired code stays expired', () => {
 assert.equal(latestGuideTitle('샥즈','[종료] [샥즈 할인코드] 오픈닷 원(OpenDot One) 전용 20% 할인!!'), '샥즈 오픈닷 원 최신 할인 안내');
 assert.equal(isCouponExpired('2026.08.31','[종료] 과거 코드',Date.parse('2026-10-28')),true);
 assert.equal(promotionStartsAt('| 행사 기간 | 2026.10.30 ~ 2026.11.12 |'), Date.parse('2026-10-30T00:00:00+09:00'));
 assert.equal(promotionStartsAt('숙박기간: 2027.01.01 ~ 2027.12.31'),null);
 assert.equal(promotionStartsAt('예약 기간: 상품별 확인'),null);
});

test('expired search titles use period and benefit instead of redemption codes', () => {
 const rows = [
  {id:'a',title:'호텔스닷컴 10% 할인코드 SPECIAL10',code:'SPECIAL10',expiry:'2026.09.30'},
  {id:'b',title:'호텔스닷컴 5% 할인코드 LP005',code:'LP005',expiry:'2026.09.30'},
 ];
 const titles = rows.map(c => uniqueGuideTitle('호텔스닷컴',c,rows));
 assert.ok(titles.every(t => !/SPECIAL10|LP005/.test(t)));
 assert.notEqual(titles[0],titles[1]);
 assert.match(titles[0],/10%/);
 assert.match(uniqueGuideTitle('슈마커',{id:'c',title:'슈마커 47BR 15% 할인',code:'SHOEMARKER47BR'},[]),/47BR/);
 assert.doesNotMatch(uniqueGuideTitle('호텔스닷컴',{id:'d',title:'호텔스닷컴 JUNE15 할인',code:'JUNE15'},[]),/JUNE15/);
});

test('legacy Myrealtrip records distinguish lodging from tours without changing codes', () => {
 const rows = [
  {id:'coupon-1785854835495-myrealtrip-za7j6',title:'[종료] 마이리얼트립 8월 프로모션 할인코드',code:'LINKPRICESTAY1000',expiry:'2026.08.31'},
  {id:'coupon-1785854835312-myrealtrip-k57mv',title:'[종료] 마이리얼트립 8월 프로모션 할인코드',code:'LINKPRICE2000',expiry:'2026.08.31'},
 ];
 assert.notEqual(uniqueGuideTitle('마이리얼트립',rows[0],rows),uniqueGuideTitle('마이리얼트립',rows[1],rows));
 assert.notEqual(latestGuideDescription('마이리얼트립',rows[0]),latestGuideDescription('마이리얼트립',rows[1]));
 assert.equal(matchesGuideTopic(guideSubject(rows[0]),'마이리얼트립 할인코드 11월 · 해외숙소'),true);
 assert.equal(matchesGuideTopic(guideSubject(rows[0]),'마이리얼트립 할인코드 11월 · 투어'),false);
 assert.equal(matchesGuideTopic(guideSubject(rows[1]),'마이리얼트립 할인코드 11월 · 투어 해외 투어·관광지 입장권·체험 예약 할인.'),true);
 assert.equal(matchesGuideTopic(guideSubject(rows[1]),'마이리얼트립 할인코드 11월 · 해외숙소 해외 호텔·숙소 예약 금액별 할인.'),false);
 assert.equal(guideSubject({id:'unknown',title:'[종료] 기존 행사'}),'기존 행사');
});
