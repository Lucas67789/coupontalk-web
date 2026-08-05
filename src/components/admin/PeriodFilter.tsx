"use client";

interface PeriodFilterProps {
    period: 'daily' | 'weekly' | 'monthly' | 'all';
    onChange: (period: 'daily' | 'weekly' | 'monthly' | 'all') => void;
    onClearCache?: () => void;
}

export default function PeriodFilter({ period, onChange, onClearCache }: PeriodFilterProps) {
    return (
        <div className="flex flex-col sm:flex-row items-center gap-4">
            {onClearCache && (
                <button 
                    onClick={onClearCache}
                    className="px-4 py-2 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    전체 캐시 초기화
                </button>
            )}
            <div className="flex bg-gray-100 p-1 rounded-xl">
                {[
                    { id: 'daily', label: '일간' },
                    { id: 'weekly', label: '주간' },
                    { id: 'monthly', label: '월간' },
                    { id: 'all', label: '전체 기간' }
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onChange(item.id as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            period === item.id 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
