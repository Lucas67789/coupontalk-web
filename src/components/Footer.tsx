import Link from 'next/link';
import { Tag, Mail, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="mt-auto border-t" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
            <div className="container mx-auto py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="bg-blue-600 text-white p-1.5 rounded-md">
                                <Tag size={18} color="var(--bg-secondary)" />
                            </div>
                            <span className="text-lg font-bold" style={{ color: 'var(--brand-primary)' }}>
                                쿠폰톡
                            </span>
                        </Link>
                        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                            브랜드별 할인코드와 적용 조건을 모았습니다.<br />
                            프로모션 조건과 유효기간을 확인하세요.
                        </p>

                    </div>

                    <div>
                        <h4 className="font-semibold mb-4 text-gray-900">카테고리</h4>
                        <ul className="flex flex-col gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <li><Link href="/category/travel" className="hover:text-blue-600">호텔·항공권</Link></li>
                            <li><Link href="/category/fashion" className="hover:text-blue-600">명품·패션</Link></li>
                            <li><Link href="/category/electronics" className="hover:text-blue-600">전자제품</Link></li>
                            <li><Link href="/category/health" className="hover:text-blue-600">건강식품</Link></li>
                            <li><Link href="/subscriptions" className="hover:text-blue-600">구독 할인 비교</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4 text-gray-900">정보</h4>
                        <ul className="flex flex-col gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <li><Link href="/about" className="hover:text-blue-600">쿠폰톡 소개</Link></li>
                            <li><Link href="/faq" className="hover:text-blue-600">자주 묻는 질문</Link></li>
                            <li><Link href="/contact" className="hover:text-blue-600">제휴 안내</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4 text-gray-900">법적고지</h4>
                        <ul className="flex flex-col gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <li><Link href="/terms" className="hover:text-blue-600">이용약관</Link></li>
                            <li><Link href="/privacy" className="hover:text-blue-600">개인정보처리방침</Link></li>
                        </ul>
                    </div>

                </div>

                <div className="mt-12 pt-8 border-t text-sm text-center" style={{ borderColor: 'var(--border-color)', color: 'var(--text-tertiary)' }}>
                    <p>
                        &copy; {new Date().getFullYear()} coupontalk. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
