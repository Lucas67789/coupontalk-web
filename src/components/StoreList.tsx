"use client";
import type { StoreSummary } from '@/lib/models';

import { useState } from 'react';
import StoreCard from '@/components/StoreCard';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { matchesSearch, type SearchOffer } from '@/lib/search';

export default function StoreList({ initialStores, initialQuery = "", offers = [] }: { initialStores: StoreSummary[]; initialQuery?: string; offers?: SearchOffer[] }) {
    // 홈 화면의 SearchAction(구글/네이버 사이트링크 검색창) 또는 ?q= 링크로 들어왔을 때
    // 초기 검색어로 반영되도록 함
    const [searchQuery, setSearchQuery] = useState(initialQuery);

    // Filter stores based on search query matching name, description, or tags
    const matchingOffers = searchQuery.trim() ? offers.filter(offer => matchesSearch(`${offer.storeName} ${offer.title} ${offer.discount} ${offer.keywords}`, searchQuery)) : [];
    const filteredStores = initialStores.filter(store => matchesSearch(`${store.name} ${store.description} ${store.tags?.join(' ')}`, searchQuery) || matchingOffers.some(offer => offer.storeId === store.id));

    return (
        <div className="relative isolate px-6 lg:px-8">
            {/* Background Gradients */}
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-300 to-blue-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
            </div>

            <div className="text-center py-8 mb-6">
                <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-sm font-bold tracking-wider mb-6">
                    수시로 추가되는 혜택
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
                    브랜드·상품 <span className="text-blue-600">할인 검색</span>
                </h1>
                <p className="text-base text-gray-600 mb-6 max-w-2xl mx-auto">
                    브랜드 이름이나 정확한 모델번호로 쿠폰, 상품과 이용 가이드를 찾아보세요.
                </p>

                <div className="max-w-md mx-auto relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    </div>
                    <input
                        type="text"
                        aria-label="브랜드, 상품명, 모델번호 검색"
                        placeholder="브랜드, 상품명, 모델번호 검색"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {searchQuery.trim() && matchingOffers.length > 0 && <section className="mb-8" aria-live="polite">
                <h2 className="text-xl font-bold mb-4">관련 쿠폰·상품 {matchingOffers.length}개</h2>
                <div className="grid gap-3">{matchingOffers.map(offer => <Link key={offer.id} href={offer.href} className="rounded-xl border border-gray-200 bg-white p-5 hover:border-blue-500"><p className="text-sm text-blue-700 mb-1">{offer.storeName} · {offer.discount}</p><h3 className="font-bold">{offer.title}</h3></Link>)}</div>
            </section>}
            {searchQuery.trim() && filteredStores.length > 0 && <h2 className="text-xl font-bold mb-4" aria-live="polite">관련 스토어 {filteredStores.length}곳</h2>}
            {filteredStores.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
                    {filteredStores.map((store: StoreSummary) => (
                        <StoreCard key={store.id} store={store} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                    <p className="text-2xl text-gray-500 font-bold mb-4">&quot;{searchQuery}&quot; 에 대한 결과가 없네요. 😢</p>
                    <p className="text-gray-400 mb-6">다른 스토어 이름이나 할인 카테고리를 검색해 보시겠어요?</p>
                    <button
                        onClick={() => setSearchQuery('')}
                        className="btn-primary"
                    >
                        전체 목록 다시 보기
                    </button>
                </div>
            )}

            {/* Bottom Gradient */}
            <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
                <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-purple-300 to-blue-500 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
            </div>
        </div>
    );
}
