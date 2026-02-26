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
                            가장 최신의 검증된 할인코드만 모았습니다.<br />
                            직접 테스트하고 매일 업데이트합니다.
                        </p>
                        <div className="flex items-center gap-4" style={{ color: 'var(--text-tertiary)' }}>
                            <a href="#" className="hover:text-blue-600 transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="hover:text-blue-600 transition-colors"><Facebook size={20} /></a>
                            <a href="#" className="hover:text-blue-600 transition-colors"><Mail size={20} /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4 text-gray-900">카테고리</h4>
                        <ul className="flex flex-col gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <li><Link href="/category/travel" className="hover:text-blue-600">호텔·항공권</Link></li>
                            <li><Link href="/category/fashion" className="hover:text-blue-600">명품·패션</Link></li>
                            <li><Link href="/category/electronics" className="hover:text-blue-600">전자제품</Link></li>
                            <li><Link href="/category/health" className="hover:text-blue-600">건강식품</Link></li>
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
                        제휴 마케팅 링크가 포함될 수 있으며, 링크를 통해 구매 시 쿠폰톡이 일정액의 수수료를 제공받을 수 있습니다.<br />
                        이러한 수수료는 더 나은 할인 정보를 제공하는 데 사용됩니다.
                    </p>
                    <p className="mt-4">
                        &copy; {new Date().getFullYear()} coupontalk. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
