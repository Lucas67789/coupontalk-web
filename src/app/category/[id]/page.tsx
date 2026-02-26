import { supabase } from '@/lib/supabase';
import StoreCard from '@/components/StoreCard';
import { notFound } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const params = await props.params;
    const { data: category } = await supabase.from('categories').select('*').eq('id', params.id).single();
    if (!category) return { title: 'Not Found' };

    return {
        title: `${category.name} 할인코드 및 프로모션 | 쿠폰톡`,
        description: `검증된 ${category.name} 관련 할인코드와 쿠폰을 확인하세요. ${category.description}`,
        openGraph: {
            title: `${category.name} 최신 할인 정보`,
            description: `검증된 ${category.name} 관련 할인코드와 쿠폰을 확인하세요.`,
        }
    };
}

export async function generateStaticParams() {
    const { data: categories } = await supabase.from('categories').select('id');
    return categories || [];
}

export default async function CategoryPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { data: category } = await supabase.from('categories').select('*').eq('id', params.id).single();

    if (!category) {
        notFound();
    }

    const { data: categoryStores } = await supabase
        .from('stores')
        .select('*, coupons(*)')
        .contains('tags', [category.id]);

    const storesList = categoryStores || [];
    const IconComponent = (LucideIcons as any)[category.icon];

    return (
        <div className="container mx-auto">

            {/* Breadcrumb / Back button */}
            <div className="mb-6">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                    <ArrowLeft size={16} /> 홈으로 돌아가기
                </Link>
            </div>

            {/* Category Header */}
            <div className="glass rounded-3xl p-8 md:p-12 mb-12 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply opacity-50 transform translate-x-1/2 -translate-y-1/2 blur-2xl"></div>

                <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg relative z-10 flex-shrink-0">
                    {IconComponent && <IconComponent size={40} />}
                </div>
                <div className="text-center md:text-left relative z-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{category.name}</h1>
                    <p className="text-gray-600 font-medium">{category.description}</p>
                </div>
            </div>

            {/* Stores Grid */}
            <div>
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-bold">진행 중인 {category.name} 할인 ({storesList.length})</h2>
                </div>

                {storesList.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {storesList.map(store => (
                            <StoreCard key={store.id} store={store} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <LucideIcons.SearchX size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">진행 중인 할인이 없습니다</h3>
                        <p className="text-gray-500">곧 새로운 할인 정보가 업데이트될 예정입니다.</p>
                    </div>
                )}
            </div>

        </div>
    );
}
