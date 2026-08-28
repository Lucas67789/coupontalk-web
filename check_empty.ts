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

async function checkEmptyData() {
    console.log("Checking stores...");
    const { data: stores } = await supabase.from('stores').select('id, name, description');
    if (stores) {
        stores.forEach(s => {
            if (!s.description || s.description.length < 30) {
                console.log(`Store [${s.name} / ${s.id}] has short/empty description: "${s.description}"`);
            }
        });
    }

    console.log("\nChecking coupons...");
    const { data: coupons } = await supabase.from('coupons').select('id, title, store_id, content_body, condition');
    if (coupons) {
        coupons.forEach(c => {
            if (!c.content_body || c.content_body.length < 50) {
                console.log(`Coupon [${c.title} / ${c.id}] has short/empty body: length ${c.content_body?.length || 0}`);
            }
        });
    }
}

checkEmptyData();
