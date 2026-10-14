import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function fetchAllRows<T>(queryBuilder: { range(from: number, to: number): PromiseLike<{ data: T[] | null; error: unknown }> }) {
    let allData: T[] = [];
    let from = 0;
    while (true) {
        const { data, error } = await queryBuilder.range(from, from + 999);
        if (error) {
            console.error("fetchAllRows Error:", error);
            throw error;
        }
        if (data) allData = allData.concat(data);
        if (!data || data.length < 1000) break;
        from += 1000;
    }
    return { data: allData, error: null };
}
