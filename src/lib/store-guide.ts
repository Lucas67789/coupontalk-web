// Opt-in via the existing admin tags field; coupon stores keep their current layout.
export function hasStoreGuide(tags?: string[] | null) {
    return tags?.includes('store-guide') === true;
}

export function storeGuideTitle(name: string, content?: string | null) {
    const heading = content?.match(/^##\s+(.+)$/m)?.[1] || content?.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)?.[1];
    return heading?.replace(/<[^>]*>|[*_`]/g, '').trim() || `${name} 상품·이용 가이드`;
}
