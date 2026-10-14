// Keep old inbound links working while each brand has one public landing page.
export const STORE_ALIASES: Record<string, string> = {
    'klook-test': 'klook',
    '레노버': 'lenovo',
    '호텔스닷컴': 'hotelskr',
    'dswellife': 'daesang',
};
export const ALIAS_STORE_FILTER = `(${Object.keys(STORE_ALIASES).join(',')})`;
