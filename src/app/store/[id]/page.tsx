import { supabase } from '@/lib/supabase';
import CouponCard from '@/components/CouponCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, ExternalLink, CalendarDays, HelpCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 3600;

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const params = await props.params;
    const { data: store } = await supabase.from('stores').select('*').eq('id', params.id).single();
    if (!store) return { title: 'Not Found' };

    return {
        title: `${store.name} 할인코드 ${new Date().getMonth() + 1}월 쿠폰 총정리 | 쿠폰톡`,
        description: `최대 할인율 적용! ${store.name} 할인코드 및 최신 이벤트 행사를 확인하세요. ${store.description}`,
        openGraph: {
            title: `${store.name} 프로모션 코드 및 할인 정보`,
            description: `최대 할인율 적용! ${store.name} 최신 할인코드 및 이벤트 행사를 매일 확인하세요.`,
        }
    };
}

export async function generateStaticParams() {
    const { data: stores } = await supabase.from('stores').select('id');
    return stores || [];
}

export default async function StorePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { data: store } = await supabase
        .from('stores')
        .select('*, coupons(*)')
        .eq('id', params.id)
        .single();

    if (!store) {
        notFound();
    }

    return (
        <div className="container mx-auto max-w-4xl border-x min-h-screen bg-white shadow-sm" style={{ borderColor: 'var(--border-color)' }}>
            {/* Back Button */}
            <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    <ArrowLeft size={16} /> 전체 목록으로
                </Link>
            </div>

            {/* Store Header */}
            <div className="p-6 md:p-10 border-b flex flex-col md:flex-row gap-8 items-start md:items-center relative overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply opacity-50 transform translate-x-1/2 -translate-y-1/2 blur-2xl"></div>

                <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden border border-gray-100 flex items-center justify-center bg-white p-4 shadow-md flex-shrink-0 relative z-10">
                    <img src={store.logo} alt={store.name} className="max-w-full max-h-full object-contain" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900">{store.name}</h1>
                        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-sm font-medium">
                            <Star size={16} className="fill-yellow-500 text-yellow-500" />
                            <span>{store.rating.toFixed(1)}</span>
                        </div>
                    </div>
                    <p className="text-lg text-gray-600 mb-4">{store.description}</p>
                    <a href="#" className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:underline">
                        {store.name} 바로가기 <ExternalLink size={14} />
                    </a>
                </div>
            </div>

            {/* Events / Notices */}
            {store.events?.length > 0 && (
                <div className="p-6 md:p-10 border-b bg-blue-50/50" style={{ borderColor: 'var(--border-color)' }}>
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-blue-900">
                        <CalendarDays size={20} className="text-blue-600" /> 이달의 프로모션 일정
                    </h2>
                    <ul className="flex flex-col gap-3">
                        {store.events?.map((event: any, i: number) => (
                            <li key={i} className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                                <span className="font-bold text-gray-900">{event.title}</span>
                                <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-700 rounded-full">{event.date}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Coupons List */}
            <div className="p-6 md:p-10 bg-gray-50/50">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    💰 사용 가능한 할인코드 <span className="text-blue-600">({store.coupons?.length || 0})</span>
                </h2>

                {store.coupons?.length > 0 ? (
                    <div className="flex flex-col gap-6">
                        {store.coupons?.map((coupon: any) => (
                            <CouponCard key={coupon.id} coupon={coupon} storeName={store.name} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-500">현재 사용 가능한 할인코드가 없습니다.</p>
                    </div>
                )}
            </div>

            {/* FAQs */}
            {store.faqs?.length > 0 && (
                <div className="p-6 md:p-10 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <HelpCircle size={24} className="text-blue-600" /> {store.name} 할인코드 FAQ
                    </h2>
                    <div className="flex flex-col gap-4">
                        {store.faqs?.map((faq: any, i: number) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-start gap-2">
                                    <span className="text-blue-600">Q.</span> {faq.question}
                                </h3>
                                <p className="text-gray-600 pl-6 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}
