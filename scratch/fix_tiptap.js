const fs = require('fs');
let content = fs.readFileSync('src/components/admin/TiptapEditor.tsx', 'utf-8');
content = content.replace('import { createClient } from "@/utils/supabase/client";', 'import { supabase } from "@/lib/supabase";');
content = content.replace('const supabase = createClient();', '');
fs.writeFileSync('src/components/admin/TiptapEditor.tsx', content);
