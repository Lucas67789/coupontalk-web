import { attribution, SESSION_TIMEOUT, isInspectionAgent } from "./analytics";
type Session = {
  id: string;
  visitor: string;
  last: number;
  landing: string;
  source: string;
  keyword: string | null;
};
let memory: Session | undefined;
const recent = new Map<string, number>();
function context(): Session {
  const now = Date.now();
  let old = memory;
  try {
    old = JSON.parse(localStorage.getItem("ct_analytics_v2") || "null") || old;
  } catch {}
  if (!old || now - old.last >= SESSION_TIMEOUT)
    old = {
      id: crypto.randomUUID(),
      visitor: old?.visitor || crypto.randomUUID(),
      last: now,
      landing: location.pathname,
      ...attribution(document.referrer),
    };
  old.last = now;
  memory = old;
  try {
    localStorage.setItem("ct_analytics_v2", JSON.stringify(old));
  } catch {}
  return old;
}
export async function trackEvent(
  event_name: "page_view" | "affiliate_click" | "code_copy",
  details: Record<string, string | boolean | undefined> = {},
) {
  try {
    if (location.pathname.startsWith("/admin")) {
      try { localStorage.setItem("ct_analytics_test", "1"); } catch {}
      return;
    }
    if (isInspectionAgent(navigator.userAgent) || navigator.webdriver === true) return;
    try {
      if (new URLSearchParams(location.search || '').get('ct_test') === '1') localStorage.setItem('ct_analytics_test', '1');
    } catch {}
    const fingerprint =
        event_name + location.pathname + JSON.stringify(details),
      now = Date.now();
    if (!details.id && now - (recent.get(fingerprint) || 0) < 700) return true;
    recent.set(fingerprint, now);
    const s = context(),
      id = typeof details.id === "string" ? details.id : crypto.randomUUID(),
      path = location.pathname;
    let isTest = !["coupontalk.kr", "www.coupontalk.kr"].includes(
      location.hostname,
    );
    try {
      isTest ||= localStorage.getItem("ct_analytics_test") === "1";
    } catch {}
    const payload = {
      id,
      event_name,
      session_id: s.id,
      visitor_id: s.visitor,
      path,
      landing_path: s.landing,
      source: s.source,
      keyword: s.keyword,
      device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
      ...details,
      is_test: isTest || details.is_test === true,
    };
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    // Retrying the same event ID is safe because the DB rejects duplicate IDs.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const r = await fetch("/api/analytics/event", {
          method: "POST",
          keepalive: true,
          headers,
          body: JSON.stringify(payload),
        });
        if (r.ok) return true;
        if (r.status < 500) return false;
      } catch {}
    }
  } catch {
    /* Tracking must never block navigation. */
  }
  return false;
}
