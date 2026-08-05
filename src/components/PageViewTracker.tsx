"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function PageViewTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Exclude admin paths from tracking
        if (pathname?.startsWith('/admin')) {
            return;
        }

        const trackView = async () => {
            try {
                let sessionId = localStorage.getItem('ct_session_id');
                
                // Extract possible IDs from path
                let storeId = null;
                let couponId = null;
                
                if (pathname?.startsWith('/store/')) {
                    const parts = pathname.split('/');
                    if (parts.length >= 3) storeId = parts[2];
                    if (parts.length >= 5 && parts[3] === 'coupon') couponId = parts[4];
                }

                const response = await fetch('/api/track/view', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(sessionId ? { 'x-session-id': sessionId } : {})
                    },
                    body: JSON.stringify({
                        path: pathname,
                        store_id: storeId,
                        coupon_id: couponId,
                        referrer: document.referrer
                    }),
                });

                if (response.ok) {
                    const newSessionId = response.headers.get('x-session-id');
                    if (newSessionId && newSessionId !== sessionId) {
                        localStorage.setItem('ct_session_id', newSessionId);
                    }
                }
            } catch (err) {
                console.error('Failed to track page view', err);
            }
        };

        // Track after a short delay to ensure page is loaded
        const timer = setTimeout(trackView, 1000);
        return () => clearTimeout(timer);
    }, [pathname]);

    return null;
}
