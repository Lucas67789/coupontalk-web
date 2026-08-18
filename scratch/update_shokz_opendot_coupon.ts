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
    const affiliateUrl = 'http://app.ac/l3MKP0J23';
    const contentBody = `
<div style="display: flex; gap: 10px; margin-bottom: 20px; overflow-x: auto;">
  <img src="/images/shokz_opendot_1.png" alt="샥즈 오픈닷 원" style="border-radius: 12px; width: 32%; object-fit: cover;" />
  <img src="/images/shokz_opendot_2.png" alt="샥즈 오픈닷 원 케이스" style="border-radius: 12px; width: 32%; object-fit: cover;" />
  <img src="/images/shokz_opendot_3.png" alt="샥즈 오픈닷 원 구조" style="border-radius: 12px; width: 32%; object-fit: cover;" />
</div>

## 🎧 샥즈(Shokz) 오픈닷 원 20% 특별 할인코드 안내

운동할 때나 일상생활에서 귀를 막지 않고 주변 소리를 들으면서 안전하고 편안하게 고음질의 음악을 즐길 수 있는 혁신적인 샥즈(Shokz) 무선 이어폰을 놀라운 가격에 만나보실 수 있는 기회입니다.

이번 프로모션에서는 뛰어난 가성비와 컴팩트한 디자인을 자랑하는 매력적인 입문형 모델, **'오픈닷 원(OpenDot One)'** 전용 20% 특별 할인코드가 발급되었습니다. 처음 오픈형 이어폰을 경험하시는 분들이라도 전혀 부담 없이 완벽한 핏감과 선명한 사운드를 즐기실 수 있는 가장 현명한 선택지가 될 것입니다.

오직 공식 스토어에서만 제공되는 파격적인 20% 할인 혜택을 절대 놓치지 마시고, 지금 바로 아래의 전용 링크를 통해 오픈닷 원을 저렴하게 구매해 보세요!

### 🎁 프로모션 상세 정보
- **할인코드**: \`shokz2608\` (결제 단계에서 입력)
- **할인 혜택**: 오픈닷 원 제품 20% 즉시 할인 적용
- **프로모션 기간**: 2026.08.18 ~ 2026.08.31 (기간 한정)

### 💡 이용 유의사항
- 본 쿠폰은 **오픈닷 원 상품**에 한하여 적용됩니다. (오픈핏 2 등 기타 모델 적용 불가)
- 다른 쿠폰이나 묶음 프로모션 코드와 중복 사용이 불가합니다.
- 상세 페이지 및 장바구니 내 **[Npay 구매(네이버페이)]** 버튼으로 바로 구매 시에는 쿠폰 시스템상 사용이 불가합니다. 반드시 '구매하기' 버튼을 눌러 일반 결제창으로 이동 후 할인코드를 적용해 주세요.

[▶ 샥즈 오픈닷 원 20% 할인받고 구매하기](${affiliateUrl})
`;

    const { data, error } = await supabase
        .from('coupons')
        .update({ content_body: contentBody.trim() })
        .ilike('title', '%오픈닷 원%')
        .eq('code', 'shokz2608');
        
    if (error) {
        console.error("Error updating OpenDot One coupon:", error);
    } else {
        console.log("Successfully updated Shokz OpenDot One coupon content!");
    }
}

main();
