"use client";

import React, { useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import 'react-quill-new/dist/quill.snow.css';

// Forwarding ref to dynamically loaded ReactQuill
const ReactQuill = dynamic(
    async () => {
        const { default: RQ } = await import('react-quill-new');
        return function ForwardedQuill({ forwardedRef, ...props }: any) {
            return <RQ ref={forwardedRef} {...props} />;
        };
    },
    { ssr: false, loading: () => <div className="h-[400px] bg-gray-50 animate-pulse rounded-xl border border-gray-200" /> }
);

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const quillRef = useRef<any>(null);

    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `editor_images/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('images').getPublicUrl(filePath);
            return data.publicUrl;
        } catch (error) {
            console.error('Image upload failed:', error);
            alert('이미지 업로드에 실패했습니다.');
            return null;
        }
    };

    const imageHandler = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files ? input.files[0] : null;
            if (!file) return;

            const quill = quillRef.current?.getEditor();
            if (!quill) return;

            // Save current cursor state
            const range = quill.getSelection(true);

            // Insert temporary loading placeholder or just wait
            // quill.insertText(range.index, '업로드 중...', 'user');

            const url = await uploadImage(file);
            
            if (url) {
                quill.insertEmbed(range.index, 'image', url);
                quill.setSelection(range.index + 1);
            }
        };
    }, []);

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                [{ 'color': [] }, { 'background': [] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        },
        // We can add clipboard matchers if needed, but intercepting paste globally is easier
        clipboard: {
            matchVisual: false
        }
    }), [imageHandler]);

    const formats = [
        'header', 'size', 'color', 'background',
        'bold', 'italic', 'underline', 'strike',
        'list', 'align', 'link', 'image'
    ];

    const handlePaste = async (e: React.ClipboardEvent) => {
        const clipboardData = e.clipboardData;
        if (!clipboardData || !clipboardData.items) return;

        let hasImage = false;
        for (let i = 0; i < clipboardData.items.length; i++) {
            const item = clipboardData.items[i];
            if (item.type.indexOf('image') !== -1) {
                hasImage = true;
                e.preventDefault(); // Stop default paste (which converts to base64)
                const file = item.getAsFile();
                if (file) {
                    const quill = quillRef.current?.getEditor();
                    if (!quill) return;

                    const range = quill.getSelection(true);
                    const url = await uploadImage(file);
                    
                    if (url) {
                        quill.insertEmbed(range.index, 'image', url);
                        quill.setSelection(range.index + 1);
                    }
                }
            }
        }
    };

    return (
        <div className="rich-text-editor-wrapper bg-white" onPaste={handlePaste}>
            <ReactQuill
                forwardedRef={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder || '내용을 입력하세요... (이미지 Ctrl+V 붙여넣기 지원)'}
                className="h-[400px] pb-12"
            />
        </div>
    );
}
