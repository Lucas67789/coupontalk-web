const { createClient } = require('@supabase/supabase-js');
const url = 'https://wzirrauymhavgvqcmhok.supabase.co';
const key = 'sb_publishable_Q_DQb2TjzVkcvB_scFmB9A_yKcX-NmC';
const supabase = createClient(url, key);

async function check() {
    const storeId = decodeURIComponent('%EC%95%BC%EB%86%80%EC%9E%90-nol');
    const { data, error } = await supabase
        .from('stores')
        .select('*, coupons(*)')
        .eq('id', storeId)
        .single();
    console.log("Store Data:", JSON.stringify(data, null, 2));
    console.log("Error:", error);
}

check();
