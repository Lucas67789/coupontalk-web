import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { assertCouponPublishable } from '../src/lib/affiliate.ts';

const affiliate = 'http://app.ac/pEwL6dS53';
const id = 'shokz-opendot-one-20261117';
const title = '샥즈 오픈닷 원 할인코드｜20% 할인가에 3만원 추가 할인';
const body = `![샥즈 오픈닷 원 제품 이미지](https://coupontalk.kr/coupon-images/thumbnails/shokz-opendot1-prod1.jpg)

## 샥즈 오픈닷 원 할인코드·혜택 비교

샥즈 오픈닷 원 구매 시 기존 **20% 할인가에 3만원 추가 할인**을 받을 수 있습니다. 결제 페이지에서 **shokz2611**을 입력하고 3만원 할인이 적용됐는지 확인하세요.

| 항목 | 내용 |
| --- | --- |
| 할인코드 | shokz2611 |
| 할인 혜택 | 기존 20% 할인가에 30,000원 추가 할인 |
| 대상 상품 | 오픈닷 원 |
| 쿠폰 발급 기간 | 2026.11.17 ~ 2026.11.30 |
| 다른 쿠폰 중복 | 불가 |
| Npay 구매 버튼 | 쿠폰 사용 불가 |

### 오픈닷 원 행사 혜택과 조건

안내된 최종 할인율은 **약 32% 수준**입니다. 이는 행사 안내 기준이며, 실제 판매가격과 최종 결제금액에 따라 달라질 수 있습니다. 20%와 추가 할인액을 각각 확인하세요.

[샥즈 오픈닷 원 할인 적용하러 가기](${affiliate})

### 공식 홈페이지 구매 혜택

- 신규회원 최대 7,300 포인트 제공
- 무료배송 지원
- 2년 무상 A/S 제공

포인트 지급·사용 조건은 공식몰에서 확인하세요. 포인트 전액을 이번 주문에 즉시 사용할 수 있다는 의미는 아닙니다.

### 네이버페이 카드 결제 할인 · 11월 혜택

샥즈 공식몰의 현재 결제 배너에서 **Npay 신한·농협·우리카드 5% 즉시 할인**을 확인했습니다.

| 항목 | 적용 조건 |
| --- | --- |
| 행사 기간 | 2026.11.06 ~ 2026.11.30 |
| 결제수단 | Npay에 등록한 신한·농협·우리카드 |
| 최소 결제금액 | 25만원 이상 |
| 할인율·한도 | 5% 즉시 할인, 최대 4만원 |
| 구매 경로 | 상품 상세 페이지·장바구니의 Npay 구매 버튼 |
| 중복 제한 | 공식몰 할인쿠폰·포인트와 함께 사용 불가 |

**shokz2611의 3만원 할인과 네이버페이 카드 5% 할인은 합산할 수 없습니다.** 일반 결제에서 코드를 적용한 금액과 Npay 대상 카드 결제금액을 각각 비교해 선택하세요. 25만원 미만 주문은 이번 카드 할인의 최소 금액 조건을 충족하지 않습니다.

카드 종류별 제외 조건·잔여 예산·실제 할인 적용 여부는 Npay 결제 단계에서 확인하세요. 결제 완료 전 화면에 표시된 할인액이 기준입니다.

공식몰 결제 배너 확인: 2026.11.17, 샥즈 오픈닷 원 상품 페이지.

![샥즈 공식 Npay 카드 할인 배너: 신한·농협·우리카드 25만원 이상 5%, 최대 4만원, 11월 6~30일](https://static.shokz.co.kr/resource/2026/11/04/1793760781869_6aeaaab36182c.webp)

[샥즈에서 코드 할인과 결제 혜택 비교하기](http://app.ac/pEwL6dS53)

### 할인코드 사용법

1. 위 제휴 링크를 통해 샥즈 공식몰에 접속합니다.
2. 오픈닷 원 상품을 선택하고 결제 페이지로 이동합니다.
3. 할인코드 입력란에 **shokz2611**을 입력합니다.
4. **적용하기**를 누르고 3만원 추가 할인을 확인합니다.
5. 최종 결제금액을 확인한 뒤 주문합니다.

### 자주 묻는 질문

**기존 20% 할인과 함께 적용되나요?**  
네. 이번 공지는 기존 20% 할인가에 3만원 추가 할인을 제공하는 내용입니다.

**다른 쿠폰도 함께 사용할 수 있나요?**  
다른 쿠폰과 중복 사용은 불가합니다.

**샥즈의 모든 상품에 적용되나요?**  
아니요. 오픈닷 원 상품에 한하여 적용됩니다.

**Npay구매 버튼으로 결제해도 되나요?**  
상세 페이지와 장바구니의 Npay구매 버튼으로 구매하면 쿠폰 사용이 불가합니다.

**기간은 언제까지인가요?**  
안내된 쿠폰 발급 기간은 2026년 11월 17일부터 11월 30일까지입니다. 구체적인 마감 시각과 발급 후 사용기한은 공식몰에서 확인하세요.

[샥즈 할인코드와 전체 혜택 보기](/store/shokz)

이 글의 제휴 링크를 통해 구매하면 쿠폰톡이 일정 수수료를 받을 수 있습니다.
`;

const row = {
  id, store_id: 'shokz', title, code: 'shokz2611',
  discount: '20% 할인가에 3만원 추가 할인',
  condition: JSON.stringify({text: '오픈닷 원 한정 · 11/17~11/30 발급 · 다른 쿠폰 중복 불가 · 상세 페이지/장바구니 Npay구매 버튼 이용 시 적용 불가', url: affiliate, v: false}),
  expiry: '2026.11.30', affiliate_url: affiliate, status: 'published',
  is_verified: false,
  seo_title: title,
  seo_description: '샥즈 오픈닷 원 할인코드 shokz2611. 11월 17~30일 기존 20% 할인가에 3만원 추가 할인. 신규회원 최대 7,300 포인트, 무료배송, 2년 무상 A/S와 사용 조건을 확인하세요.',
  content_body: body,
};

if (!process.argv.includes('--publish')) {
  console.log(JSON.stringify({state: 'prepared_not_published', row}, null, 2));
} else {
  assertCouponPublishable(row);
  const env = Object.fromEntries(fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).filter(l => l.includes('=')).map(l => {
    const i = l.indexOf('=');
    return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')];
  }));
  const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const {data: store, error: storeError} = await db.from('stores').select('id').eq('id', 'shokz').single();
  if (storeError || !store) throw storeError || Error('Store missing');
  const {data: existing, error: lookupError} = await db.from('coupons').select('id,code').eq('store_id', 'shokz').or(`id.eq.${id},code.eq.shokz2611`);
  if (lookupError) throw lookupError;
  if (existing.length) throw Error('Matching coupon already exists; review before changing it.');
  const {data: inserted, error} = await db.from('coupons').insert({...row, published_at: new Date().toISOString()}).select('id,code,status,affiliate_url').single();
  if (error) throw error;
  console.log(JSON.stringify({state: 'published', inserted, url: `https://coupontalk.kr/store/shokz/coupon/${id}`, searchAdvisor: 'not_submitted'}));
  if (env.REVALIDATE_SECRET) {
    const response = await fetch('https://coupontalk.kr/api/revalidate', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({secret: env.REVALIDATE_SECRET})});
    if (!response.ok) throw Error(`Published but cache refresh failed: ${response.status}`);
    console.log('Cache refresh completed');
  }
}
