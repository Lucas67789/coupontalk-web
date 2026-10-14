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
