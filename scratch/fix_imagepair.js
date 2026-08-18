const fs = require('fs');
let content = fs.readFileSync('src/components/admin/ImagePairExtension.tsx', 'utf-8');
content = content.replace('import { createClient } from "@/utils/supabase/client";', 'import { supabase } from "@/lib/supabase";');
content = content.replace('const supabase = createClient();', '');
fs.writeFileSync('src/components/admin/ImagePairExtension.tsx', content);
