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
    const { data: storeData } = await supabase.from('stores').select('id, name').ilike('name', '%호텔스닷컴%');
    console.log("Stores:", storeData);

    const { data: couponData } = await supabase.from('coupons').select('id, title, code, affiliate_url').or('code.ilike.%LP005%,title.ilike.%LP005%');
    console.log("Coupons with LP005:", couponData);
}

main();
