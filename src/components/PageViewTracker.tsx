"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics-client";
export default function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const view = () => {
      if (document.visibilityState === "visible") void trackEvent("page_view");
    };
    if (document.visibilityState === "visible") view();
    else document.addEventListener("visibilitychange", view, { once: true });
    return () => document.removeEventListener("visibilitychange", view);
  }, [pathname]);
  useEffect(() => {
    const click = (event: MouseEvent) => {
      if (event.type === "auxclick" && event.button !== 1) return;
      const a = (event.target as Element)?.closest?.(
        'a[rel~="sponsored"]',
      ) as HTMLAnchorElement | null;
      if (a)
        void trackEvent("affiliate_click", {
          target_url: a.href,
          store_id: a.dataset.storeAffiliate,
          button_label: (a.textContent || "제휴 링크").trim().slice(0, 100),
        });
    };
    document.addEventListener("click", click);
    document.addEventListener("auxclick", click);
    return () => {
      document.removeEventListener("click", click);
      document.removeEventListener("auxclick", click);
    };
  }, []);
  return null;
}
