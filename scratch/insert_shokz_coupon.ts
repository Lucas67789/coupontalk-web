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
    const storeName = '샥즈';
    const affiliateUrl = 'http://app.ac/cEC8P6S83';

    // 1. Create store if it doesn't exist
    const { data: existingStore } = await supabase.from('stores').select('id').eq('id', storeId).single();
    if (!existingStore) {
        const newStore = {
            id: storeId,
            name: storeName,
            description: '샥즈(Shokz) 공식 스토어 할인 및 프로모션 정보를 제공합니다. 오픈핏, 골전도 이어폰 등 최신 제품들을 특별한 혜택으로 만나보세요.',
            
        };
        const { error: storeError } = await supabase.from('stores').insert([newStore]);
        if (storeError) {
            console.error("Error creating store:", storeError);
            return;
        }
        console.log("Created Shokz store.");
    }

    // 2. Create coupon
    const timestamp = Date.now();
    const newCoupon = {
        id: `coupon-${timestamp}-${storeId}`,
        store_id: storeId,
        title: '[샥즈 전체 할인코드] 오픈핏 2, 오픈닷 원 전용 20% 할인',
        code: 'shokz2608',
        discount: '20% 할인',
        condition: JSON.stringify({
            text: "오픈핏2 및 오픈닷 원 상품 전용",
            url: affiliateUrl,
            v: true
        }),
        expiry: '2026.08.31',
        is_verified: true,
        status: 'published',
        published_at: new Date().toISOString(),
        seo_title: '샥즈(Shokz) 오픈핏2 20% 할인코드 (shokz2608)',
        seo_description: '샥즈 오픈핏2 및 오픈닷 원 전용 20% 할인코드를 제공합니다. 결제 시 shokz2608을 입력하세요.',
        content_body: `![Shokz OpenFit](https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800)\n\n## 🎧 샥즈(Shokz) 공식 스토어 20% 특별 할인코드 안내\n\n운동할 때나 일상생활에서 안전하고 편안하게 음악을 즐길 수 있는 **샥즈 오픈핏 2**와 **오픈닷 원** 전용 20% 할인코드가 발급되었습니다.\n\n- **할인코드**: \`shokz2608\`\n- **할인 혜택**: 대상 제품 20% 할인 적용\n- **프로모션 기간**: 2026.08.18 ~ 2026.08.31\n\n### 💡 이용 유의사항\n- 본 쿠폰은 **오픈핏 2 및 오픈닷 원 상품**에 한하여 적용됩니다.\n- 다른 쿠폰과 중복 사용이 불가합니다.\n- 상세 페이지 및 장바구니 내 **[Npay 구매(네이버페이)]** 버튼으로 구매 시 쿠폰 사용이 불가하므로, 일반 결제창을 이용해 주세요.\n\n[▶ 샥즈 20% 할인받고 구매하기](${affiliateUrl})`,
        affiliate_url: affiliateUrl
    };

    const { error: couponError } = await supabase.from('coupons').insert([newCoupon]);
    if (couponError) {
        console.error("Error inserting coupon:", couponError);
    } else {
        console.log("Successfully inserted new Shokz coupon:", newCoupon.title);
    }
}

main();
