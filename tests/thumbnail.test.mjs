import {test} from 'node:test';
import assert from 'node:assert/strict';
import {squareThumbnail,publicContentImages,contentImages} from '../src/lib/content-images.ts';
test('body photos retain their aspect ratio while search thumbnails remain square',()=>{
 assert.equal(publicContentImages('![a](/images/a.png)'), '![a](https://coupontalk.kr/coupon-images/_site/a.png)');
 assert.equal(publicContentImages('https://other.example/images/a.png'), 'https://other.example/images/a.png');
 const src='https://coupontalk.kr/coupon-images/thumbnails/banner.png?version=2';
 const out= squareThumbnail(src);
 assert.equal(new URL(out).searchParams.get('version'),'2');
 assert.equal(new URL(out).searchParams.get('fit'),'square-v1');
 assert.equal(squareThumbnail(out),out);
 assert.equal(publicContentImages(publicContentImages(src)),src);
 assert.equal(publicContentImages(out),src);
 assert.equal(contentImages(`![a](${src})`)[0],out);
 assert.equal(publicContentImages(`<p><img src="${out}" alt="banner"></p>`),`<p><img src="${src}" alt="banner"></p>`);
 assert.equal(contentImages(publicContentImages(`![a](${out})`))[0],out);
 assert.equal(squareThumbnail('https://other.example/banner.png'), 'https://other.example/banner.png');
 assert.equal(publicContentImages('https://coupontalk.kr/store/shokz'), 'https://coupontalk.kr/store/shokz');
});
