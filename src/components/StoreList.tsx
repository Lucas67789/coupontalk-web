"use client";

import { useState } from 'react';
import StoreCard from '@/components/StoreCard';
import { Search } from 'lucide-react';

export default function StoreList({ initialStores }: { initialStores: any[] }) {
    const [searchQuery, setSearchQuery] = useState("");

    // Filter stores based on search query matching name, description, or tags
    const filteredStores = initialStores.filter(store => {
        const query = searchQuery.toLowerCase();
        const matchName = store.name.toLowerCase().includes(query);
        const matchDesc = store.description?.toLowerCase().includes(query);
        const matchTags = store.tags?.some((tag: string) => tag.toLowerCase().includes(query));

        return matchName || matchDesc || matchTags;
    });

    return (
        <div className="relative isolate px-6 lg:px-8">
            {/* Background Gradients */}
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-300 to-blue-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
            </div>

            <div className="text-center py-16 mb-8 animate-fade-in">
                <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-sm font-bold tracking-wider mb-6">
                    수시로 추가되는 혜택
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
                    전체 스토어 <span className="text-blue-600">목록</span>
                </h1>
                <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
                    쿠폰톡이 제공하는 모든 오픈 혜택과 시크릿 링크를 한눈에 둘러보세요.
                </p>

                <div className="max-w-md mx-auto relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="스토어 이름이나 카테고리를 검색해 보세요..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {filteredStores.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
                    {filteredStores.map((store: any) => (
                        <StoreCard key={store.id} store={store} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                    <p className="text-2xl text-gray-500 font-bold mb-4">"{searchQuery}" 에 대한 결과가 없네요. 😢</p>
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
