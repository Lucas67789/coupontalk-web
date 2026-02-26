import { supabase } from '@/lib/supabase';
import StoreList from '@/components/StoreList';

export const revalidate = 3600;

export default async function AllStoresPage() {
    // Note: We need to pull tags and description to allow search matching
    const { data: stores } = await supabase.from('stores').select('*, coupons(*)');

    return (
        <div className="container mx-auto">
            <StoreList initialStores={stores || []} />
        </div>
    );
}
