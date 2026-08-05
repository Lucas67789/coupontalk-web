"use client";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    colorScheme: 'green' | 'orange' | 'blue' | 'purple' | 'red' | 'yellow';
}

const colors = {
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', iconBg: 'bg-green-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', iconBg: 'bg-orange-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', iconBg: 'bg-blue-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', iconBg: 'bg-purple-100' },
    red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', iconBg: 'bg-red-100' },
    yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100', iconBg: 'bg-yellow-100' },
};

export default function StatCard({ title, value, subtitle, icon, colorScheme }: StatCardProps) {
    const c = colors[colorScheme];
    
    return (
        <div className={`${c.bg} border ${c.border} p-6 rounded-3xl flex flex-col`}>
            <div className={`flex items-center gap-2 ${c.text} font-bold mb-4 text-sm`}>
                <div className={`w-8 h-8 rounded-full ${c.iconBg} flex items-center justify-center`}>
                    {icon}
                </div>
                {title}
            </div>
            <div className={`text-4xl font-black ${c.text} mb-2`}>
                {value}
            </div>
            {subtitle && (
                <div className={`text-xs ${c.text} opacity-80 mt-auto`}>
                    {subtitle}
                </div>
            )}
        </div>
    );
}
