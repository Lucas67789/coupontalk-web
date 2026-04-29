import React from 'react';
import SafeImage from '@/components/SafeImage';

export function MarkdownRenderer({ content, storeName }: { content: string, storeName?: string }) {
    if (!content) return null;

    // Normalize <img ... /> tags to standard ![Image](url) so they don't break across newlines
    const normalizedContent = content.replace(/<img[^>]*>/gi, (match) => {
        const srcMatch = match.match(/src=["'](.*?)["']/);
        if (srcMatch) {
            return `![Image](${srcMatch[1]})`;
        }
        return match;
    });

    const lines = normalizedContent.split('\n');
    const elements: React.ReactNode[] = [];
    let key = 0;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            elements.push(<div key={key++} className="h-3" />);
        } else if (trimmed.startsWith('### ')) {
            const text = trimmed.slice(4);
            const id = text.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9가-힣-]/g, '');
            elements.push(
                <h3 id={id} key={key++} className="text-lg font-bold text-gray-800 mt-6 mb-2 scroll-mt-24">
                    {text}
                </h3>
            );
        } else if (trimmed.startsWith('## ')) {
            const text = trimmed.slice(3);
            const id = text.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9가-힣-]/g, '');
            elements.push(
                <h2 id={id} key={key++} className="text-xl font-bold text-gray-900 mt-8 mb-3 pb-2 border-b border-gray-100 scroll-mt-24">
                    {text}
                </h2>
            );
        } else if (trimmed.startsWith('- ')) {
            elements.push(
                <li key={key++} className="ml-4 text-gray-700 leading-relaxed list-disc">
                    {trimmed.slice(2)}
                </li>
            );
        } else if (/^\d+\.\s/.test(trimmed)) {
            const text = trimmed.replace(/^\d+\.\s/, '');
            elements.push(
                <li key={key++} className="ml-4 text-gray-700 leading-relaxed list-decimal">
                    {text}
                </li>
            );
        } else if (trimmed === '/>' || trimmed === '>') {
            continue;
        } else if (trimmed.match(/!\[(.*?)\]\((.*?)\)/)) {
            const match = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
            if (match) {
                // Determine ALT text: if user didn't write anything meaningful (e.g. 'Image' or empty), generate SEO friendly one
                let altText = match[1];
                if (!altText || altText === 'Image') {
                    altText = storeName ? `${storeName} 관련 이미지` : '쿠폰 혜택 이미지';
                }
                
                elements.push(
                    <div key={key++} className="my-6">
                        <SafeImage 
                            src={match[2]} 
                            alt={altText} 
                            className="rounded-xl border border-gray-100 max-w-full h-auto shadow-sm" 
                            lazyLoad={true}
                        />
                    </div>
                );
            }
        } else {
            elements.push(
                <p key={key++} className="text-gray-700 leading-relaxed">
                    {trimmed}
                </p>
            );
        }
    }
    return <>{elements}</>;
}
