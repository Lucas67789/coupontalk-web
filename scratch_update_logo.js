const fs = require('fs'); 
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => { 
    const [k, v] = line.split('='); 
    if(k && v) acc[k.trim()] = v.trim(); 
    return acc; 
}, {}); 

const { createClient } = require('@supabase/supabase-js'); 
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY); 

const logoHtml = '<a target="_blank" href="https://click.linkprice.com/click.php?m=agoda&a=A100703639&l=0013&u_id="><img src="https://img.linkprice.com/files/glink/agoda/20191122/5dd79f9315f7b_120_60.jpg" border="0" width="120" height="60"></a> <img src="https://track.linkprice.com/lpshow.php?m_id=agoda&a_id=A100703639&p_id=0000&l_id=0013&l_cd1=2&l_cd2=0" width="1" height="1" border="0" nosave style="display:none">'; 

supabase.from('stores').update({logo: logoHtml}).eq('id', 'agoda').then(res => console.log('Updated', res)).catch(err => console.error(err));
