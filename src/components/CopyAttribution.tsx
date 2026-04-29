"use client";

import { useEffect } from 'react';

export default function CopyAttribution() {
    useEffect(() => {
        const handleCopy = (e: ClipboardEvent) => {
            const selection = window.getSelection();
            if (!selection) return;

            const selectedText = selection.toString();
            // Only add attribution if they copied a substantial amount of text (e.g., more than 30 chars)
            if (selectedText.length < 30) return;

            const url = window.location.href;
            // Provide attribution text
            const attribution = `\n\n[출처] 쿠폰톡\n[원문] ${url}`;

            // We must prevent default behavior to override clipboard content
            e.preventDefault();

            if (e.clipboardData) {
                e.clipboardData.setData('text/plain', selectedText + attribution);
            }
        };

        document.addEventListener('copy', handleCopy);

        return () => {
            document.removeEventListener('copy', handleCopy);
        };
    }, []);

    return null;
}
