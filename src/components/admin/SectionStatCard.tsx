"use client";

import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface SectionStatCardProps {
    title: string;
    icon: LucideIcon;
    color: string;
    href?: string;
    stats: { label: string; value: string | number }[];
}

export default function SectionStatCard({ title, icon: Icon, color, href, stats }: SectionStatCardProps) {
    return (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm relative overflow-hidden group">
            {/* Color Accent Line */}
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: color }}></div>
            
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 font-bold text-gray-900 text-lg">
                    <Icon size={20} style={{ color }} />
                    {title}
                </div>
                {href && (
                    <Link href={href} className="text-gray-400 hover:text-gray-900 transition-colors">
                        <ArrowUpRight size={20} />
                    </Link>
                )}
            </div>

            <div className="flex flex-col gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
                        <span className="text-base font-bold text-gray-900">{stat.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
