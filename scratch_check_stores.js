const { createClient } = require('@supabase/supabase-js');
const url = 'https://wzirrauymhavgvqcmhok.supabase.co';
const key = 'sb_publishable_Q_DQb2TjzVkcvB_scFmB9A_yKcX-NmC';
const supabase = createClient(url, key);

async function check() {
    const { data, error } = await supabase
        .from('stores')
        .select('*')
        .limit(1);
    console.log("Data:", data);
    console.log("Error:", error);
}

check();
