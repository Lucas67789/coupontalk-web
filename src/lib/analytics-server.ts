import { createClient } from "@supabase/supabase-js";
export function analyticsDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
export async function isAnalyticsAdmin(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) return false;
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
      global: { headers: { Authorization: "Bearer " + token } },
    },
  );
  const { data, error } = await db.rpc("is_admin");
  return !error && data === true;
}
