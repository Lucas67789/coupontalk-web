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
    // 1. Update OpenFit 2
    await supabase.from('coupons').update({
        seo_title: '샥즈(Shokz) 오픈핏2 20% 할인코드 (shokz2608) - 무선 오픈형 이어폰 추천',
        seo_description: '운동 및 일상용으로 완벽한 안전하고 편안한 오픈형 무선 이어폰, 샥즈(Shokz) 오픈핏2 전용 20% 특별 할인코드(shokz2608)를 제공합니다. 공식 스토어에서 할인받고 구매하세요.'
    }).ilike('title', '%오픈핏%').eq('code', 'shokz2608');

    // 2. Update OpenDot One
    await supabase.from('coupons').update({
        seo_title: '샥즈(Shokz) 오픈닷 원 20% 할인코드 (shokz2608) - 가성비 입문용 이어폰',
        seo_description: '가성비 끝판왕 무선 이어폰, 샥즈(Shokz) 오픈닷 원 전용 20% 특별 할인코드(shokz2608)를 제공합니다. 입문용 오픈형 이어폰을 공식 스토어 혜택으로 저렴하게 만나보세요.'
    }).ilike('title', '%오픈닷%').eq('code', 'shokz2608');

    console.log("SEO metadata successfully optimized for Naver.");
}

main();
