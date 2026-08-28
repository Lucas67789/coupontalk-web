import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wzirrauymhavgvqcmhok.supabase.co';
const supabaseKey = 'sb_publishable_Q_DQb2TjzVkcvB_scFmB9A_yKcX-NmC';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data } = await supabase
        .from('coupons')
        .select('id, title, expiry, created_at, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
    
    console.log(JSON.stringify(data, null, 2));
}
check();
