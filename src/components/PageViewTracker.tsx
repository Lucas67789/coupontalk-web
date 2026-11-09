"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics-client";
export default function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      try { localStorage.setItem("ct_analytics_test", "1"); } catch {}
      return;
    }
    const view = () => {
      if (document.visibilityState === "visible") void trackEvent("page_view");
    };
    if (document.visibilityState === "visible") view();
    else document.addEventListener("visibilitychange", view, { once: true });
    return () => document.removeEventListener("visibilitychange", view);
  }, [pathname]);
  useEffect(() => {
    type CapturedClick = { id: string; path: string; target_url: string; store_id?: string; button_label: string; is_test: boolean; time: number };
    const capture = (window as Window & { __ctAffiliateClicks?: { pending(): CapturedClick[]; ack(id: string): void } }).__ctAffiliateClicks;
    const sending = new Set<string>();
    const flush = () => {
      for (const click of capture?.pending() || []) {
        if (sending.has(click.id)) continue;
        sending.add(click.id);
        const { time, ...details } = click;
        void trackEvent('affiliate_click', details).then(saved => {
          if (saved) capture?.ack(click.id);
        }).finally(() => sending.delete(click.id));
      }
    };
    window.addEventListener('ct:affiliate-click', flush);
    window.addEventListener('online', flush);
    flush();
    return () => {
      window.removeEventListener('ct:affiliate-click', flush);
      window.removeEventListener('online', flush);
    };
  }, []);
  return null;
}
