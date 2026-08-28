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

const updateLinks = {
    'agoda': 'http://app.ac/j3M3ANJ23',
    'hotelskr': 'http://app.ac/iAGAWH593',
    '호텔스닷컴': 'http://app.ac/iAGAWH593',
    'klook': 'http://app.ac/N3M3AzJ63',
    'klook-test': 'http://app.ac/N3M3AzJ63',
    'myrealtrip': 'http://app.ac/1AGAWJ543',
    'kkday': 'http://app.ac/oqnq8h233',
    'airalo': 'http://app.ac/htVtKhM53',
    'usimsa': 'http://app.ac/YECEt0S33',
    'traveloka': 'http://app.ac/bECEt7S13',
    'charlesnk': 'http://app.ac/6tVtKdM13',
    'lenovo': 'http://app.ac/7ECEthS43',
    '레노버': 'http://app.ac/7ECEthS43',
    'smk': 'http://app.ac/aECEtUS23',
    'snaps': 'http://app.ac/GjwjqSa03',
    'mootoon': 'http://app.ac/Rjwjqda23',
    'qtoon': 'http://app.ac/mjwjq4a33'
};

async function runUpdate() {
    console.log("Updating Stores...");
    for (const [storeId, affiliateUrl] of Object.entries(updateLinks)) {
        // 1. Update the store table (if affiliate_url column exists)
        // Wait, does the store table have affiliate_url?
        // It wasn't in our select from check_empty, but let's try.
        const { error: err1 } = await supabase.from('stores').update({ affiliate_url: affiliateUrl }).eq('id', storeId);
        if (err1) {
            console.log(`Failed to update store ${storeId} affiliate_url: ${err1.message}`);
        } else {
            console.log(`Store ${storeId} affiliate_url updated.`);
        }

        // 2. Update all coupons for this store
        const { error: err2 } = await supabase.from('coupons').update({ affiliate_url: affiliateUrl }).eq('store_id', storeId);
        if (err2) {
            console.log(`Failed to update coupons for store ${storeId}: ${err2.message}`);
        } else {
            console.log(`Coupons for store ${storeId} updated with ${affiliateUrl}`);
        }
    }
    console.log("Finished updating links!");
}
runUpdate();
