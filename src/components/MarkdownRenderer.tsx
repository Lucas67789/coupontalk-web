import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import SafeImage from '@/components/SafeImage';

export function MarkdownRenderer({ content, storeName }: { content: string, storeName?: string }) {
    if (!content) return null;

    // Check if the content appears to be purely HTML (like from ReactQuill)
    const isHtml = /^\s*<(p|h[1-6]|ul|ol|blockquote|div)[\s>]/i.test(content);

    if (isHtml) {
        // If it contains HTML, render using dangerouslySetInnerHTML but with Tailwind Typography styles
        return (
            <div 
                className="prose prose-blue max-w-none prose-img:rounded-xl prose-img:shadow-sm"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        );
    }

    // Otherwise, parse as Markdown + HTML hybrid using react-markdown
    // remarkGfm enables GitHub Flavored Markdown: tables, strikethrough, task lists, etc.
    return (
        <div className="prose prose-blue max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3 pb-2 border-b border-gray-100 scroll-mt-24" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-gray-800 mt-6 mb-2 scroll-mt-24" {...props} />,
                    p: ({ node, ...props }) => <p className="text-gray-700 leading-relaxed my-2" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc ml-4 my-2 text-gray-700" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal ml-4 my-2 text-gray-700" {...props} />,
                    li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                    table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-4">
                            <table className="min-w-full border border-gray-200 rounded-lg text-sm" {...props} />
                        </div>
                    ),
                    thead: ({ node, ...props }) => <thead className="bg-gray-50" {...props} />,
                    tbody: ({ node, ...props }) => <tbody className="divide-y divide-gray-100" {...props} />,
                    tr: ({ node, ...props }) => <tr className="hover:bg-gray-50 transition-colors" {...props} />,
                    th: ({ node, ...props }) => <th className="px-4 py-2 text-left font-semibold text-gray-700 border-b border-gray-200" {...props} />,
                    td: ({ node, ...props }) => <td className="px-4 py-2 text-gray-600" {...props} />,
                    img: ({ node, src, alt, ...props }) => {
                        let finalAlt = alt;
                        if (!finalAlt || finalAlt === 'Image') {
                            finalAlt = storeName ? `${storeName} 관련 이미지` : '쿠폰 혜택 이미지';
                        }
                        return (
                            <div className="my-6">
                                <SafeImage 
                                    src={String(src || '')} 
                                    alt={finalAlt} 
                                    className="rounded-xl border border-gray-100 max-w-full h-auto shadow-sm" 
                                    lazyLoad={true}
                                />
                            </div>
                        );
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
