export type Faq = { question: string; answer: string };
export type CouponRow = {
    id: string; store_id: string; title: string; code: string; discount: string;
    condition: string; expiry: string; affiliate_url: string; affiliateUrl?: string;
    created_at: string; updated_at?: string; published_at: string; status: string;
    is_verified: boolean; seo_title: string; seo_description: string; content_body: string;
    click_count: number; isExpired?: boolean; stores?: StoreRow;
};
export type ProductRow = {
    id: string; store_id: string; title: string; image_url: string; price: string;
    original_price: string; discount_badge: string; affiliate_url: string; description: string;
    status: string; published_at: string; created_at: string; stores?: StoreRow;
};
export type StoreRow = {
    id: string; name: string; description: string; logo: string; rating: number;
    tags: string[]; events: { title: string; date: string }[]; faqs: Faq[];
    website_url: string; guide_content: string; created_at: string; updated_at?: string;
    coupons: CouponRow[]; products: ProductRow[];
};

export type StoreSummary = Pick<StoreRow, 'id' | 'name' | 'description' | 'rating' | 'tags' | 'events'> & { coupons: Pick<CouponRow, 'id' | 'title' | 'expiry'>[] };
