import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env.local');
const envFile = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envFile.split(/\r?\n/).forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
    }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const storeId = 'shokz';
    const affiliateUrl = 'http://app.ac/l3MKP0J23';
    
    // Create new coupon for OpenDot One
    const timestamp = Date.now();
    const newCoupon = {
        id: `coupon-${timestamp}-${storeId}`,
        store_id: storeId,
        title: '[샥즈 전체 할인코드] 오픈닷 원(OpenDot One) 전용 20% 할인',
        code: 'shokz2608',
        discount: '20% 할인',
        condition: JSON.stringify({
            text: "오픈닷 원 상품 전용",
            url: affiliateUrl,
            v: true
        }),
        expiry: '2026.08.31',
        is_verified: true,
        status: 'published',
        published_at: new Date().toISOString(),
        seo_title: '샥즈(Shokz) 오픈닷 원 20% 할인코드 (shokz2608)',
        seo_description: '샥즈 오픈닷 원(OpenDot One) 전용 20% 할인코드를 제공합니다. 결제 시 shokz2608을 입력하세요.',
        content_body: `## 🎧 샥즈(Shokz) 오픈닷 원 20% 특별 할인코드 안내\n\n운동할 때나 일상생활에서 귀를 막지 않고 주변 소리를 들으면서 안전하고 편안하게 고음질의 음악을 즐길 수 있는 혁신적인 샥즈 이어폰을 특별한 가격에 만나보세요.\n\n이번 프로모션에서는 뛰어난 가성비와 컴팩트한 디자인을 자랑하는 매력적인 모델, **'오픈닷 원(OpenDot One)'** 전용 20% 할인코드가 발급되었습니다. 처음 샥즈를 입문하시는 분들에게도 부담 없는 훌륭한 선택지가 될 것입니다.\n\n공식 스토어에서만 제공되는 20% 혜택을 놓치지 마시고, 지금 바로 아래 링크를 통해 오픈닷 원을 할인된 가격에 구매해 보세요!\n\n### 🎁 프로모션 상세 정보\n- **할인코드**: \`shokz2608\` (결제 단계에서 입력)\n- **할인 혜택**: 오픈닷 원 제품 20% 즉시 할인 적용\n- **프로모션 기간**: 2026.08.18 ~ 2026.08.31 (기간 한정)\n\n### 💡 이용 유의사항\n- 본 쿠폰은 **오픈닷 원 상품**에 한하여 적용됩니다. (기타 모델 적용 불가)\n- 다른 쿠폰이나 프로모션 코드와 중복 사용이 불가합니다.\n- 상세 페이지 및 장바구니 내 **[Npay 구매(네이버페이)]** 버튼으로 바로 구매 시에는 쿠폰 사용이 불가합니다. 반드시 '구매하기' 버튼을 눌러 일반 결제창에서 할인코드를 적용해 주세요.\n\n[▶ 샥즈 오픈닷 원 20% 할인받고 구매하기](${affiliateUrl})`,
        affiliate_url: affiliateUrl
    };

    const { error: couponError } = await supabase.from('coupons').insert([newCoupon]);
    if (couponError) {
        console.error("Error inserting coupon:", couponError);
    } else {
        console.log("Successfully inserted new Shokz OpenDot One coupon:", newCoupon.title);
    }
}

main();
