import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envFile = fs.readFileSync(path.resolve('.env.local'), 'utf-8');
const env: any = {};
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const storeId = "호텔스닷컴";
    const now = new Date().toISOString();

    const commonContent = `
### 💡 홍보 추천 특가 숙소 (할인은 호텔스닷컴 회원 기준)
*   **부산 엘시티 레지던스 와이 컬렉션**: 럭셔리 레지던스 + 높은 할인율 (49% 할인)
*   **부산 르 컬렉티브 해운대 패러그라프**: 해운대 위치 + 높은 할인율 (23% 할인)
*   **발리 사누르 발리 에멜랄드 빌라**: 럭셔리 빌라 + 높은 할인율 (51~59% 할인)
*   **쿠알라룸프르 임페리얼 럭셔리 스위트 KLCC 바이 문웨이**: 높은 할인율 (72% 할인)
*   **파타야 트로피카나 풀빌라**: 높은 할인율 (65% 할인)

### 📌 에디터 참고사항
*   가족 여행에 적합한 숙소 단독 특가에 10% 추가 할인 적용 가능한 할인코드로 강력 추천합니다!
*   해당 쿠폰들은 **특가 전용 페이지 외의 일반 숙소에도 적용 가능**하니 꼭 확인해 보세요.
*   **[꿀팁]** 5월 25일까지는 12% 쿠폰도 별도로 제공됩니다. 결제 금액 구간에 따라 가장 유리한 할인 조건이 상이하니 결제 전 비교해 보시는 것을 권장합니다! (12% 쿠폰 상세 안내: [클릭하기](https://ac.linkprice.net/events/6077/original))
    `.trim();

    const coupons = [
        {
            id: `coupon-${Date.now()}-june15`,
            store_id: storeId,
            title: "호텔스닷컴 6월 전 세계 숙소 15% 추가 할인",
            discount: "15% 할인 (최대 7만원)",
            code: "JUNE15",
            expiry: "2026.12.31",
            content_body: `
![썸네일](/images/hotels_june15_kr.png)

호텔스닷컴 6월 전용 시크릿 할인코드가 오픈되었습니다. 예약 기간은 6월 한 달간 진행되며, 올 연말 숙박까지 적용되니 여름휴가뿐만 아니라 겨울 여행 계획도 미리 세워보세요!

*   **예약기간**: 2026.06.01 ~ 2026.06.30
*   **숙박기간**: ~ 2026.12.31 까지
*   **할인혜택**: 숙소 15% 할인 (최대 7만원 할인)
*   **유의사항**: **반드시 원화 결제 시에만 적용 가능합니다.**

${commonContent}
            `.trim(),
            status: "published",
            published_at: now,
            condition: JSON.stringify({
                text: "원화 결제 시에만 사용 가능",
                url: "http://app.ac/iApOuF533",
                v: true
            })
        },
        {
            id: `coupon-${Date.now()}-lp005`,
            store_id: storeId,
            title: "전 지역 제한 없이 5% 무제한 추가 할인",
            discount: "5% 무제한 할인",
            code: "LP005",
            expiry: "2027.06.30",
            content_body: `
![썸네일](/images/hotels_lp005.png)

할인 한도 제한 없이 전 세계 어디든 무조건 5%가 추가 할인되는 꿀코드입니다! 비싼 럭셔리 리조트나 긴 일정 예약 시 최대의 혜택을 누릴 수 있습니다.

*   **예약기간**: 2026.05.01 ~ 2026.06.30 까지
*   **숙박기간**: ~ 2027.06.30 까지 (내년 여름휴가까지 넉넉하게!)
*   **할인혜택**: 조건 없이 전 지역 5% 할인 적용
*   **이용약관**: [이용약관 상세 보기](https://kr.hotels.com/lp/b/couponsTermsAndConditions?campaignId=57108)
*   **유의사항**: **반드시 원화 결제 시에만 사용 가능합니다.**

${commonContent}
            `.trim(),
            status: "published",
            published_at: now,
            condition: JSON.stringify({
                text: "원화 결제 시에만 사용 가능",
                url: "http://app.ac/9qV09w233",
                v: true
            })
        },
        {
            id: `coupon-${Date.now()}-vrlp10`,
            store_id: storeId,
            title: "여름방학 맞이 전 세계 숙소 10% 추가 할인",
            discount: "10% 추가 할인",
            code: "VRLP10",
            expiry: "2026.09.30",
            content_body: `
![썸네일](/images/hotels_vrlp10.png)

다양한 숙소 라인업에 자유롭게 쓸 수 있는 10% 만능 할인코드입니다. 특가 페이지에 없는 숙소라도 결제 단계에서 이 코드를 입력하면 무조건 10% 깎입니다.

*   **예약기간**: 2026.05.18 ~ 2026.06.17
*   **숙박기간**: ~ 2026.09.30 까지
*   **할인혜택**: 숙소 10% 할인 (특가 페이지 외 숙소도 적용 가능)
*   **유의사항**: **원화 결제 시에만 적용 가능합니다.**

${commonContent}
            `.trim(),
            status: "published",
            published_at: now,
            condition: JSON.stringify({
                text: "원화 결제 시에만 사용 가능",
                url: "http://app.ac/lbwyuMl53",
                v: true
            })
        }
    ];

    const { data, error } = await supabase.from('coupons').insert(coupons);
    if (error) {
        console.error("Error inserting coupons:", error);
    } else {
        console.log("Successfully inserted 3 coupons.");
    }
}

run();
