import {test} from 'node:test';
import assert from 'node:assert/strict';
import {squareThumbnail,publicContentImages,contentImages} from '../src/lib/content-images.ts';
test('square thumbnail URLs agree across metadata, body and repeated rendering',()=>{
 assert.equal(publicContentImages('![a](/images/a.png)'), '![a](https://coupontalk.kr/coupon-images/_site/a.png?fit=square-v1)');
 assert.equal(publicContentImages('https://other.example/images/a.png'), 'https://other.example/images/a.png');
 const src='https://coupontalk.kr/coupon-images/thumbnails/banner.png?version=2';
 const out= squareThumbnail(src);
 assert.equal(new URL(out).searchParams.get('version'),'2');
 assert.equal(new URL(out).searchParams.get('fit'),'square-v1');
 assert.equal(squareThumbnail(out),out);
 assert.equal(publicContentImages(publicContentImages(src)),out);
 assert.equal(contentImages(`![a](${src})`)[0],publicContentImages(src));
 assert.equal(squareThumbnail('https://other.example/banner.png'), 'https://other.example/banner.png');
 assert.equal(publicContentImages('https://coupontalk.kr/store/shokz'), 'https://coupontalk.kr/store/shokz');
});
