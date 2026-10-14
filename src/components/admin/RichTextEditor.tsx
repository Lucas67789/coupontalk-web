"use client";
import TiptapEditor from './TiptapEditor';

export default function RichTextEditor({ value, onChange, draftKey }: { value: string; onChange: (value: string) => void; placeholder?: string; draftKey?: string }) {
    return <TiptapEditor initialContent={value} onChange={onChange} draftKey={draftKey || "store-guide-new"} />;
}
