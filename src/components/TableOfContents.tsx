"use client";

import { useEffect, useState } from 'react';
import { List } from 'lucide-react';

interface TOCItem {
    id: string;
    text: string;
    level: number;
}

export default function TableOfContents({ content }: { content?: string }) {
    const [items, setItems] = useState<TOCItem[]>([]);

    useEffect(() => {
        if (!content) return;

        // Extract ## and ### headings
        const headings: TOCItem[] = [];
        const lines = content.split('\n');

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
                const level = trimmed.startsWith('### ') ? 3 : 2;
                const text = trimmed.replace(/^#+\s/, '');
                const id = text.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9가-힣-]/g, '');
                headings.push({ id, text, level });
            }
        });

        setItems(headings);
    }, [content]);

    if (items.length === 0) return null;

    const scrollToId = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            // Add a brief highlight effect
            element.classList.add('bg-blue-50', 'transition-colors', 'duration-500');
            setTimeout(() => element.classList.remove('bg-blue-50'), 1500);
        }
    };

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 md:p-6 mb-8 w-full md:w-3/4 lg:w-2/3 mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <List size={20} className="text-gray-500" /> 목차
            </h3>
            <ul className="flex flex-col gap-2">
                {items.map((item, index) => (
                    <li 
                        key={`${item.id}-${index}`} 
                        className={`${item.level === 3 ? 'ml-4 text-sm' : 'font-medium text-[15px]'} text-gray-700`}
                    >
                        <a 
                            href={`#${item.id}`} 
                            onClick={(e) => scrollToId(e, item.id)}
                            className="hover:text-blue-600 hover:underline underline-offset-2 transition-colors block py-0.5"
                        >
                            {item.level === 2 ? '📌 ' : '• '} {item.text}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
