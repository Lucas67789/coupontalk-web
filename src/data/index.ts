export type Coupon = {
    id: string;
    title: string;
    code: string;
    discount: string;
    condition: string;
    expiry: string;
    affiliateUrl: string;
};

export type Store = {
    id: string;
    name: string;
    description: string;
    logo: string;
    rating: number;
    tags: string[];
    coupons: Coupon[];
    events: { title: string; date: string }[];
    faqs: { question: string; answer: string }[];
};

export type Category = {
    id: string;
    name: string;
    icon: string;
    description: string;
};

export const categories: Category[] = [
    { id: 'travel', name: '호텔·항공권', icon: 'Plane', description: '알뜰한 여행을 위한 예약 할인' },
    { id: 'fashion', name: '명품·패션', icon: 'ShoppingBag', description: '트렌디한 아이템 할인 정보' },
    { id: 'electronics', name: '전자제품', icon: 'Laptop', description: '최신 가전/IT기기 할인 모음' },
    { id: 'health', name: '건강식품', icon: 'Heart', description: '내 몸을 위한 영양제 특가' },
    { id: 'lifestyle', name: '라이프스타일', icon: 'Coffee', description: '일상의 소소한 행복, 리빙/홈 카테고리' },
];

export const stores: Store[] = [
    {
        id: 'aliexpress',
        name: '알리익스프레스',
        description: '전 세계의 다양한 상품을 저렴하게 직구하세요.',
        logo: 'https://img.alicdn.com/tfs/TB1V2eKwwDqK1RjSZSyXXaxEVXa-340-100.png',
        rating: 4.8,
        tags: ['electronics', 'fashion', 'lifestyle'],
        coupons: [
            {
                id: 'ali-1',
                title: '$50 이상 구매 시 $6 할인',
                code: 'ALI6',
                discount: '$6',
                condition: '$50 이상 구매 시',
                expiry: '2026.12.31',
                affiliateUrl: 'https://s.click.aliexpress.com/e/_example1'
            },
            {
                id: 'ali-2',
                title: '$100 이상 구매 시 $15 할인',
                code: 'ALI15',
                discount: '$15',
                condition: '$100 이상 구매 시',
                expiry: '2026.12.31',
                affiliateUrl: 'https://s.click.aliexpress.com/e/_example2'
            }
        ],
        events: [
            { title: '[설레는 특가전]', date: '2026.02.09 ~ 02.24' },
            { title: '[미리 만나는 봄]', date: '2026.02.15 ~ 02.23' }
        ],
        faqs: [
            {
                question: '알리익스프레스 할인코드는 어떻게 사용하나요?',
                answer: '결제 시 프로모션 코드 입력란에 발급받은 코드를 입력하고 적용 버튼을 누르시면 됩니다.'
            }
        ]
    },
    {
        id: 'agoda',
        name: '아고다',
        description: '전 세계 호텔 예약 최저가 보장, 시크릿 특가 혜택',
        logo: 'https://cdn6.agoda.net/images/agodavip/logo-agoda-vip.png',
        rating: 4.9,
        tags: ['travel'],
        coupons: [
            {
                id: 'agoda-1',
                title: '전 세계 숙소 7% 추가 할인',
                code: 'AGODA7',
                discount: '7%',
                condition: '앱으로 첫 예약 시',
                expiry: '2026.06.30',
                affiliateUrl: 'https://agoda.com/example'
            }
        ],
        events: [],
        faqs: []
    },
    {
        id: 'coupang',
        name: '쿠팡',
        description: '로켓배송으로 내일 당장 받아보세요.',
        logo: 'https://image9.coupangcdn.com/image/coupang/common/logo_coupang_w350.png',
        rating: 4.9,
        tags: ['lifestyle', 'electronics', 'fashion'],
        coupons: [
            {
                id: 'coupang-1',
                title: '로켓와우 첫 달 무료체험',
                code: 'NO_CODE_REQUIRED',
                discount: '무료체험',
                condition: '신규 와우 회원 한정',
                expiry: '상시진행',
                affiliateUrl: 'https://m.coupang.com/example'
            }
        ],
        events: [],
        faqs: []
    }
];

export function getStoreById(id: string) {
    return stores.find(store => store.id === id);
}

export function getStoresByCategory(categoryId: string) {
    return stores.filter(store => store.tags.includes(categoryId));
}
