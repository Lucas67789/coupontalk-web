export function searchText(value: string) {
    return value.normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
}
export function matchesSearch(value: string, query: string) {
    const haystack = searchText(value);
    return searchText(query).split(' ').every(word => haystack.includes(word));
}
export type SearchOffer = { id: string; storeId: string; storeName: string; title: string; discount: string; href: string; keywords: string };
