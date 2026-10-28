import {test} from 'node:test';
import assert from 'node:assert/strict';
import {couponStatus} from '../src/lib/utils.ts';
import {matchesGuideTopic, uniqueGuideTitle} from '../src/lib/latest-guide.ts';
import {xmlText,cdata} from '../src/lib/rss.ts';
test('promotion status distinguishes future, ongoing and explicit early termination',()=>{
 const c={title:'행사',expiry:'2026.11.12',content_body:'| 행사 기간 | 2026.10.30 ~ 2026.11.12 |'};
 assert.equal(couponStatus(c,Date.parse('2026-10-28T12:00:00+09:00')),'upcoming');
 assert.equal(couponStatus(c,Date.parse('2026-10-30T00:00:00+09:00')),'active');
 assert.equal(couponStatus({...c,title:'[종료] 행사'},Date.parse('2026-10-28')),'expired');
 assert.equal(couponStatus({...c,content_body:'숙박기간: 2027.01.01 ~ 2027.12.31'},Date.parse('2026-10-28')),'active');
});
test('recommendations require explicit model, payment and destination match',()=>{
 assert.equal(matchesGuideTopic('샥즈 오픈닷 원 할인','샥즈 블랙프라이데이 최대 20%'),false);
 assert.equal(matchesGuideTopic('샥즈 오픈닷 원 shokz2609 할인','샥즈 OpenDot One 할인'),true);
 assert.equal(matchesGuideTopic('클룩 일본 렌터카 할인','클룩 일본 호텔 할인'),false);
 assert.equal(matchesGuideTopic('아고다 카카오페이 할인','아고다 네이버페이 할인'),false);
 const rows=[{id:'a',title:'아고다 5% 할인',expiry:'2026.08.31',code:'AUG'},{id:'b',title:'아고다 8% 할인',expiry:'2026.09.30',code:'SEP'}];
 assert.notEqual(uniqueGuideTitle('아고다',rows[0],rows),uniqueGuideTitle('아고다',rows[1],rows));
});
test('RSS preserves XML validity for merchant text and CDATA closing sequences',()=>{
 assert.equal(xmlText('A&B <sale>'),'A&amp;B &lt;sale&gt;');
 assert.equal(cdata('a]]>b'),'<![CDATA[a]]]]><![CDATA[>b]]>');
});
