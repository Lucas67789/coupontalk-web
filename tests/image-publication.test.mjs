import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {assertPublicationImages} from '../src/lib/image-publication.ts';
import {displayImages} from '../src/lib/content-images.ts';
const url='https://coupontalk.kr/coupon-images/thumbnails/agoda-megasale-20261117.png';
const coupon={status:'published',content_body:`![배너](${url})`};
test('publication blocks missing, broken, tiny and padded images, permits original campaign banner',async()=>{
 await assertPublicationImages(coupon,async()=>({width:600,height:300}));
 await assert.rejects(assertPublicationImages({status:'published'},async()=>({width:600,height:300})),/게시 차단/);
 await assert.rejects(assertPublicationImages(coupon,async()=>{throw Error('404')}),/불러올/);
 await assert.rejects(assertPublicationImages(coupon,async()=>({width:1,height:1})),/너무 작/);
 await assert.rejects(assertPublicationImages({...coupon,content_body:`![배너](${url}?fit=square-v1)`},async()=>({width:1200,height:1200})),/원본 이미지/);
 await assertPublicationImages({status:'draft'},async()=>{throw Error('must not inspect')});
});
test('Agoda padded search derivative cannot reach store banner or shared screen thumbnail',()=>{
 assert.deepEqual(displayImages(`![배너](${url}?fit=square-v1)`),[url]);
 const landing=fs.readFileSync('src/components/AliStoreLanding.tsx','utf8');
 assert.match(landing,/displayImages\(coupon.content_body\)/);
 assert.doesNotMatch(landing,/contentImages\(coupon.content_body\)/);
 assert.match(landing,/data-coupon-banner><img[^>]+h-auto/);
 assert.doesNotMatch(landing,/aspect-\[3\/1\]/);
 assert.match(fs.readFileSync('src/components/CouponThumbnail.tsx','utf8'),/map\(publicContentImages\)/);
 assert.match(fs.readFileSync('src/app/admin/coupons/page.tsx','utf8'),/await assertPublicationImages\(payload, inspectBrowserImage\)/);
});
