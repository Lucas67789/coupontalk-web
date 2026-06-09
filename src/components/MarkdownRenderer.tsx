import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import SafeImage from '@/components/SafeImage';

export function MarkdownRenderer({ content, storeName }: { content: string, storeName?: string }) {
    if (!content) return null;

    // Check if the content appears to be purely HTML (like from ReactQuill)
    const isHtml = /<[a-z][\s\S]*>/i.test(content);

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
    // We provide custom components to match our previous styling
    return (
        <div className="prose prose-blue max-w-none">
            <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                components={{
                    h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3 pb-2 border-b border-gray-100 scroll-mt-24" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-gray-800 mt-6 mb-2 scroll-mt-24" {...props} />,
                    p: ({ node, ...props }) => <p className="text-gray-700 leading-relaxed my-2" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc ml-4 my-2 text-gray-700" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal ml-4 my-2 text-gray-700" {...props} />,
                    li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
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
