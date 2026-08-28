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
    let views: any[] = [];
    let fromViews = 0;
    while (true) {
        const { data, error } = await supabase
            .from('page_views')
            .select('path, session_id, store_id')
            .range(fromViews, fromViews + 999);
        console.log(`from ${fromViews}: returned ${data?.length} rows`);
        if (data) views = views.concat(data);
        if (error || !data || data.length < 1000) break;
        fromViews += 1000;
    }
    console.log("Total views:", views.length);
}
run();
