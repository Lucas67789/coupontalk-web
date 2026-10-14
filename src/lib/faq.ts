import type { Faq } from './models';

export function parseFaqs(value: unknown): Faq[] {
    try {
        const faqs = typeof value === 'string' ? JSON.parse(value) : value;
        return Array.isArray(faqs) ? faqs.filter((faq) =>
            typeof faq?.question === 'string' && typeof faq?.answer === 'string') : [];
    } catch {
        return [];
    }
}

export function defaultStoreFaqs(name: string): Faq[] {
    return [
        { question: `${name} 할인코드는 어떻게 사용하나요?`, answer: '쿠폰의 대상 조건과 유효기간을 확인하고 코드를 결제 화면에 입력하세요. 전용 링크형 혜택은 연결된 프로모션 페이지의 안내에 따라 적용합니다. 결제 전에 할인액이 반영되었는지 확인하세요.' },
        { question: '쿠폰이 적용되지 않으면 무엇을 확인하나요?', answer: '대상 상품·모델·지역, 신규 고객 조건, 최소 결제 금액, 유효기간을 확인하세요. 앱·웹 제한이나 전용 링크 접속 조건이 있을 수 있습니다.' },
        { question: '카드·간편결제 혜택과 중복 적용할 수 있나요?', answer: '중복 적용 여부는 각 프로모션 조건에 따라 다릅니다. 할인율을 더해서 계산하지 말고 지정 결제수단과 최대 할인액을 확인한 뒤 최종 금액을 비교하세요.' },
        { question: '취소하거나 환불하면 쿠폰이 복구되나요?', answer: '쿠폰 복구와 재사용 여부는 판매처의 취소·환불 정책 및 해당 프로모션 약관에 따릅니다. 결제 전 연결된 페이지에서 조건을 확인하세요.' },
    ];
}
