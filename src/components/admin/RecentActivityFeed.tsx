"use client";

import { Clock, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ActivityItem {
    id: string;
    type: string; // 'coupon_click', 'code_copy', 'product_click'
    targetTitle: string;
    storeName?: string;
    createdAt: string;
}

interface RecentActivityFeedProps {
    items: ActivityItem[];
}

export default function RecentActivityFeed({ items }: RecentActivityFeedProps) {
    const getActionLabel = (type: string) => {
        switch (type) {
            case 'code_copy': return { label: '코드 복사', color: 'bg-red-100 text-red-600' };
            case 'product_click': return { label: '상품 클릭', color: 'bg-blue-100 text-blue-600' };
            case 'coupon_click': 
            default: return { label: '할인 클릭', color: 'bg-green-100 text-green-600' };
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="text-blue-500" /> 실시간 클릭 로그
                </h3>
            </div>

            <div className="flex flex-col gap-3 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {items.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 text-sm">최근 클릭 기록이 없습니다.</div>
                ) : (
                    items.map((item) => {
                        const action = getActionLabel(item.type);
                        return (
                            <div key={item.id} className="flex items-center gap-4 py-3 px-4 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
                                <div className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-black ${action.color}`}>
                                    {action.label}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">
                                        {item.targetTitle || '알 수 없는 항목'}
                                    </p>
                                    {item.storeName && (
                                        <p className="text-xs text-gray-500 truncate mt-0.5">
                                            {item.storeName}
                                        </p>
                                    )}
                                </div>
                                <div className="flex-shrink-0 text-xs text-gray-400 font-medium whitespace-nowrap">
                                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: ko })}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #e5e7eb;
                    border-radius: 20px;
                }
            `}</style>
        </div>
    );
}
