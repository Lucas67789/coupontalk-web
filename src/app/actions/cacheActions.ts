"use server";

import { revalidatePath } from "next/cache";
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function clearAllCache() {
  const cookieStore = await cookies();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          cookie: cookieStore.toString(),
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("Unauthorized");
  }

  revalidatePath("/", "layout");
}
