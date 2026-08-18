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
    const storeId = 'hotelskr';
    const affiliateUrl = 'http://app.ac/ttVcPkM73';
    
    // Disable old LP005 coupons to avoid duplicates
    await supabase.from('coupons').update({ status: 'draft' }).eq('code', 'LP005');
    
    const timestamp = Date.now();
    const newCoupon = {
        id: `coupon-${timestamp}-hotelskr`,
        store_id: storeId,
        title: '[호텔스닷컴] 8~9월 전 지역 5% 할인코드 제공!',
        code: 'LP005',
        discount: '전 지역 5% 할인',
        condition: JSON.stringify({
            text: "원화 결제 시에만 사용 가능",
            url: affiliateUrl,
            v: true
        }),
        expiry: '2026.09.30',
        is_verified: true,
        status: 'published',
        published_at: new Date().toISOString(),
        seo_title: '호텔스닷컴 8월~9월 전 지역 5% 할인코드 (LP005)',
        seo_description: '호텔스닷컴 전 지역 5% 할인코드를 제공합니다. 할인코드 LP005를 입력하고 저렴하게 예약하세요. 숙박기간은 2027년 6월 30일까지 가능합니다.',
        content_body: `## 🏨 호텔스닷컴 전 지역 5% 스페셜 할인코드 안내\n\n호텔스닷컴에서 전 세계 모든 지역 숙소 예약 시 즉시 5% 할인을 받을 수 있는 스페셜 코드를 제공합니다.\n\n- **할인코드**: \`LP005\`\n- **할인 혜택**: 전 지역 5% 즉시 할인 적용\n- **예약 기간**: 2026.08.01 ~ 2026.09.30 까지\n- **숙박 기간**: ~ 2027.06.30 까지\n\n### 💡 유의사항 및 이용약관\n- 본 쿠폰은 **원화 결제 시**에만 정상적으로 적용됩니다.\n- 반드시 하단의 전용 링크를 통해 접속해야 코드가 활성화됩니다.\n\n[호텔스닷컴 5% 할인 전용 페이지 접속하기](${affiliateUrl})\n\n> **쿠폰 이용약관 상세 확인**: [이용약관 페이지](https://kr.hotels.com/lp/b/couponsTermsAndConditions?campaignId=57108)`,
        affiliate_url: affiliateUrl
    };

    const { data, error } = await supabase.from('coupons').insert([newCoupon]);
    if (error) {
        console.error("Error inserting coupon:", error);
    } else {
        console.log("Successfully inserted new Hotels.com coupon:", newCoupon.title);
    }
}

main();
