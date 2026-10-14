import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { sanitizeContent } from '@/lib/content-safety';
import SafeImage from '@/components/SafeImage';

export function MarkdownRenderer({ content, storeName }: { content: string, storeName?: string }) {
    if (!content) return null;

    // Check if the content appears to be purely HTML (like from ReactQuill)
    const isHtml = /^\s*<(p|h[1-6]|ul|ol|blockquote|div)[\s>]/i.test(content);

    if (isHtml) {
        // 이 페이지에는 이미 별도의 <h1>(스토어명/쿠폰 제목)이 있으므로, 에디터(Tiptap 등)로
        // 작성된 본문에 <h1>이 섞여 있으면 h2로 강제 치환해 페이지당 H1이 항상 하나만 남도록 함
        // (네이버 서치어드바이저 "사이트 진단"에서 실제로 잡힌 <H1> 2개 이상 문제 대응)
        const safeContent = sanitizeContent(content);
        // If it contains HTML, render using dangerouslySetInnerHTML but with Tailwind Typography styles
        return (
            <div
                className="prose prose-blue max-w-none prose-img:rounded-xl prose-img:shadow-sm"
                dangerouslySetInnerHTML={{ __html: safeContent }}
            />
        );
    }

    // Otherwise, parse as Markdown + HTML hybrid using react-markdown
    // remarkGfm enables GitHub Flavored Markdown: tables, strikethrough, task lists, etc.
    return (
        <div className="prose prose-blue max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={{
                    // 주의: DB에 저장된 guide_content/content_body 안에 "# 제목"(H1)이 하나라도 섞여 있으면,
                    // 이 페이지에는 이미 <h1>(스토어명/쿠폰 제목)이 따로 있기 때문에 페이지에 <h1>이
                    // 2개가 되어버립니다(네이버 서치어드바이저 "사이트 진단"에서 실제로 잡힌 문제).
                    // h1을 h2와 동일한 스타일로 강제 치환해서, DB 콘텐츠에 어떤 헤딩이 들어와도
                    // 페이지의 진짜 H1은 항상 하나만 남도록 방어합니다.
                    h1: ({ node, ...props }) => <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3 pb-2 border-b border-gray-100 scroll-mt-24" {...props} />,
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
