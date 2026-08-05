"use client";

import Link from 'next/link';

interface TopRankingItem {
    id: string;
    title: string;
    subtitle?: string;
    val1: number;
    val2?: number;
    val3?: number;
    icon?: React.ReactNode;
}

interface TopRankingTableProps {
    title: React.ReactNode;
    items: TopRankingItem[];
    col1Label: string;
    col2Label?: string;
    col3Label?: string;
    viewAllHref?: string;
}

export default function TopRankingTable({ title, items, col1Label, col2Label, col3Label, viewAllHref }: TopRankingTableProps) {
    return (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {title}
                </h3>
                {viewAllHref && (
                    <Link href={viewAllHref} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        전체보기 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
                    </Link>
                )}
            </div>

            <div className="flex flex-col gap-4">
                {items.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-sm">데이터가 없습니다.</div>
                ) : (
                    items.map((item, idx) => (
                        <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 group hover:bg-gray-50 p-2 rounded-xl transition-colors">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                {item.icon ? (
                                    item.icon
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                        {idx + 1}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0 pr-4">
                                    <p className="font-bold text-gray-900 truncate">{item.title}</p>
                                    {item.subtitle && <p className="text-xs text-gray-500 truncate mt-0.5">{item.subtitle}</p>}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0 text-right">
                                <div className="flex flex-col items-center min-w-[40px]">
                                    <span className="font-black text-gray-900">{item.val1}</span>
                                    <span className="text-[10px] text-gray-400">{col1Label}</span>
                                </div>
                                {col2Label && (
                                    <div className="flex flex-col items-center min-w-[40px]">
                                        <span className="font-black text-gray-900">{item.val2 || 0}</span>
                                        <span className="text-[10px] text-gray-400">{col2Label}</span>
                                    </div>
                                )}
                                {col3Label && (
                                    <div className="flex flex-col items-center min-w-[40px] hidden sm:flex">
                                        <span className="font-black text-gray-900">{item.val3 || 0}</span>
                                        <span className="text-[10px] text-gray-400">{col3Label}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
