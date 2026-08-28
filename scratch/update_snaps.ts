import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envFile = fs.readFileSync(path.resolve('.env.local'), 'utf-8');
const env: any = {};
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

const guide_content = `
### 💡 나만의 특별한 굿즈와 포토북, 스냅스(Snaps)에서 완성하세요!
스냅스는 스마트폰 속 사진을 꺼내 포토북, 사진 인화, 달력은 물론, 아크릴 키링, 스티커, 포토카드 등 다양한 커스텀 굿즈를 쉽고 빠르게 제작할 수 있는 국내 1위 온라인 서비스입니다. 
소중한 추억을 간직하고 싶을 때, 혹은 세상에 단 하나뿐인 특별한 선물을 준비하고 싶다면 스냅스를 활용해 보세요. 이번 **스냅스 할인코드**를 적용하시면 더욱 합리적인 가격에 고퀄리티 나만의 아이템을 만나보실 수 있습니다.

---

### 📌 스냅스 할인코드 사용 방법
할인코드 적용이 처음이신가요? 아래 단계를 따라 쉽고 빠르게 추가 할인을 받아보세요.
1. 본 페이지의 **[쿠폰 복사하기]** 버튼을 클릭하여 스냅스 프로모션 코드를 복사합니다.
2. **[스냅스 바로가기]**를 통해 공식 홈페이지 또는 스냅스 앱에 접속합니다.
3. 원하는 포토북, 굿즈 등을 자유롭게 디자인하고 장바구니에 담습니다.
4. 결제 페이지 하단의 **'쿠폰/할인코드' 입력란**에 복사한 코드를 붙여넣고 적용 버튼을 누릅니다.
5. 즉시 할인된 최종 결제 금액을 확인하고 기분 좋게 결제를 완료합니다!

---

### 🎁 스냅스 추천 상품! 할인코드 적용 필수템
스냅스 쿠폰으로 어떤 상품을 만들면 좋을지 고민되시나요? 스냅스에서 가장 인기 있는 추천 아이템입니다.
* **포토북 & 사진 인화:** 바캉스, 여행에서 찍은 인생샷들을 스마트폰에만 두지 마세요. 스냅스만의 선명한 화질로 생생하게 간직해 보세요.
* **아이돌/최애 커스텀 굿즈:** 내가 직접 디자인하는 나만의 덕질템! 포토카드, 띠부띠부씰, 아크릴 스탠드, 스마트톡 등을 할인받아 제작해 보세요. 1개부터 소량 제작도 가능합니다.
* **디자인 어패럴 (티셔츠/에코백):** 나만의 로고나 그림, 문구를 넣어 세상에 하나뿐인 커스텀 패션 아이템을 완성할 수 있습니다.
`;

const faqs = [
    {
        question: "스냅스 할인코드는 누구나 사용할 수 있나요?",
        answer: "네, 본 페이지에서 제공하는 프로모션 코드는 스냅스 회원이라면 누구나 등록 후 사용할 수 있습니다. (단, 일부 특가 진행 중인 상품은 적용이 제한될 수 있습니다.)"
    },
    {
        question: "무료배송 쿠폰과 중복 적용이 가능한가요?",
        answer: "스냅스 정책상 대부분의 장바구니 할인코드와 배송비 쿠폰은 중복 적용이 어렵습니다. 결제 단계에서 가장 혜택 금액이 큰 쿠폰을 하나 선택하여 적용해 주시기 바랍니다."
    },
    {
        question: "타이틀에 '카드 프로모션'이 있는데 어떤 혜택인가요?",
        answer: "스냅스에서는 매월 특정 신용카드(KB국민, 삼성카드, 현대카드 등) 및 간편결제(네이버페이, 카카오페이 등) 이용 시 추가 청구할인이나 포인트 적립 혜택을 제공하고 있습니다. 이번 달의 정확한 결제 혜택은 스냅스 결제 창에서 꼭 확인해 보세요."
    }
];

async function run() {
    console.log("Updating Snaps store...");
    const { error } = await supabase.from('stores').update({ 
        guide_content: guide_content,
        faqs: faqs
    }).eq('id', 'snaps');
    
    if (error) {
        console.error("Error updating store:", error.message);
    } else {
        console.log("Successfully updated Snaps store with SEO text and FAQs!");
    }
}

run();
