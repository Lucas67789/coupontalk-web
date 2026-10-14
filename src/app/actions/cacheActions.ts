"use server";

import { revalidatePath } from "next/cache";
import { createClient } from '@supabase/supabase-js';

export async function clearAllCache(access_token?: string) {
  if (!access_token) {
    throw new Error("Unauthorized");
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(access_token);
  
  if (error || !user) {
    throw new Error("Unauthorized");
  }

  const authorized = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${access_token}` } }, auth: { persistSession: false } }
  );
  const { data: isAdmin, error: roleError } = await authorized.rpc('is_admin');
  if (roleError || isAdmin !== true) throw new Error('Forbidden');
  revalidatePath("/", "layout");
}
