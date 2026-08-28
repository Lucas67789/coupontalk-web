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

const targetLinks = {
    'agoda': 'http://app.ac/j3M3ANJ23',
    'hotelskr': 'http://app.ac/iAGAWH593',
    'klook-test': 'http://app.ac/N3M3AzJ63',
    'myrealtrip': 'http://app.ac/1AGAWJ543',
    'kkday': 'http://app.ac/oqnq8h233', // Guessing ID, might need to check
    'airalo': 'http://app.ac/htVtKhM53', // Guessing ID
    'usimsa': 'http://app.ac/YECEt0S33',
    'traveloka': 'http://app.ac/bECEt7S13',
    'charlesnk': 'http://app.ac/6tVtKdM13',
    '레노버': 'http://app.ac/7ECEthS43',
    'smk': 'http://app.ac/aECEtUS23',
    'snaps': 'http://app.ac/GjwjqSa03',
    'mootoon': 'http://app.ac/Rjwjqda23',
    'qtoon': 'http://app.ac/mjwjq4a33'
};

async function verifyLinks() {
    const { data: stores } = await supabase.from('stores').select('id, name, affiliate_url');
    console.log("=== STORES ===");
    for (const [key, link] of Object.entries(targetLinks)) {
        const store = stores?.find(s => s.id === key || s.name.includes(key));
        if (store) {
            if (store.affiliate_url !== link) {
                console.log(`[MISMATCH] Store ${store.name} (${store.id}): DB=${store.affiliate_url} | Target=${link}`);
            } else {
                console.log(`[MATCH] Store ${store.name} (${store.id})`);
            }
        } else {
            console.log(`[NOT FOUND] Store key: ${key}`);
        }
    }
}
verifyLinks();
