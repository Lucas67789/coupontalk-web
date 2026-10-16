import test from 'node:test';
import assert from 'node:assert/strict';
import {hasStoreGuide,storeGuideTitle} from '../src/lib/store-guide.ts';
import {parseFaqs} from '../src/lib/faq.ts';
import {safeAffiliateUrl} from '../src/lib/affiliate.ts';

test('store guides are opt-in and accept editable markdown or HTML headings',()=>{
    assert.equal(hasStoreGuide(['travel']),false);
    assert.equal(hasStoreGuide(['travel','store-guide']),true);
    assert.equal(storeGuideTitle('브랜드','## 브랜드 상품 안내\n\n본문'),'브랜드 상품 안내');
    assert.equal(storeGuideTitle('브랜드','<h2><strong>브랜드</strong> 구매 안내</h2>'),'브랜드 구매 안내');
    assert.equal(storeGuideTitle('브랜드',null),'브랜드 상품·이용 가이드');
    assert.deepEqual(parseFaqs('{broken'),[]);
    assert.deepEqual(parseFaqs('[{"question":"질문","answer":"답"},{"question":12}]'),[{question:'질문',answer:'답'}]);
});

test('store affiliate link preserves merchant, media and attribution parameters',()=>{
    const link='https://linkmoa.kr/click.php?m=gmarket&a=A100703639&l=0000';
    assert.equal(safeAffiliateUrl(link),link);
    assert.equal(safeAffiliateUrl('javascript:alert(1)'),null);
    assert.equal(safeAffiliateUrl('https://user:password@example.com'),null);
});
