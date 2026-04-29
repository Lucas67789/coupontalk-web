const { createClient } = require('@supabase/supabase-js');
const url = 'https://wzirrauymhavgvqcmhok.supabase.co';
const key = 'sb_publishable_Q_DQb2TjzVkcvB_scFmB9A_yKcX-NmC';
const supabase = createClient(url, key);

async function checkBuckets() {
    const { data, error } = await supabase.storage.listBuckets();
    console.log("Buckets:", data);
    console.log("Error:", error);
}

checkBuckets();
