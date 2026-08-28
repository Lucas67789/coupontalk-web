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

async function run() {
    const { data, error } = await supabase.from('coupons').select('*').eq('store_id', 'shokz').order('published_at', { ascending: false }).limit(1);
    if (data && data.length > 0) {
        const coupon = data[0];
        if (!coupon.content_body.includes('shokz_preorder.png')) {
            const newBody = '![썸네일](/images/shokz_preorder.png)\\n\\n' + coupon.content_body;
            await supabase.from('coupons').update({ content_body: newBody }).eq('id', coupon.id);
            console.log('Updated with thumbnail');
        } else {
             console.log('Thumbnail already exists');
        }
    } else {
        console.log('Not found');
    }
}
run();
