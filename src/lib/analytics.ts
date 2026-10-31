export const SESSION_TIMEOUT = 30 * 60 * 1000;
export type AnalyticsEvent = {
  id: string;
  created_at: string;
  event_name: string;
  session_id: string;
  visitor_id: string;
  path: string;
  landing_path: string;
  source: string;
  keyword?: string | null;
  store_id?: string | null;
  coupon_id?: string | null;
  product_id?: string | null;
  subscription_slug?: string | null;
  target_host?: string | null;
  button_label?: string | null;
  device?: string;
  is_test?: boolean;
};
export function attribution(referrer: string) {
  try {
    const u = new URL(referrer),
      h = u.hostname;
    const source = /(^|\.)naver\.com$/.test(h)
      ? "네이버"
      : /(^|\.)google\.[a-z.]+$/.test(h)
        ? "구글"
        : /(^|\.)bing\.com$/.test(h)
          ? "빙"
          : /(^|\.)coupontalk\.kr$/.test(h)
            ? "내부 이동"
            : h;
    const key =
      source === "네이버"
        ? "query"
        : ["구글", "빙"].includes(source)
          ? "q"
          : null;
    return {
      source,
      keyword: key ? u.searchParams.get(key)?.slice(0, 150) || null : null,
    };
  } catch {
    return { source: "직접/출처 불명", keyword: null };
  }
}
export function koreaDay(time = Date.now()) {
  return new Date(time + 9 * 3600000).toISOString().slice(0, 10);
}
export function dateRange(start: string, end: string, now = Date.now()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end))
    throw Error("날짜를 선택해주세요.");
  const from = Date.parse(start + "T00:00:00+09:00"),
    to = Date.parse(end + "T00:00:00+09:00") + 86400000;
  if (
    !Number.isFinite(from) ||
    !Number.isFinite(to) ||
    koreaDay(from) !== start ||
    koreaDay(to - 86400000) !== end ||
    from >= to ||
    to - from > 90 * 86400000
  )
    throw Error("최대 90일 범위로 선택해주세요.");
  const until = Math.min(to, now),
    span = until - from;
  if (span <= 0) throw Error("미래 기간은 조회할 수 없습니다.");
  const previousFrom = from - (to - from);
  return { from, to: until, previousFrom, previousTo: previousFrom + span };
}
export function metrics(events: AnalyticsEvent[]) {
  const views = events.filter((e) => e.event_name === "page_view"),
    sessions = new Set(events.map((e) => e.session_id)),
    clicks = events.filter((e) => e.event_name === "affiliate_click"),
    clicked = new Set(clicks.map((e) => e.session_id));
  return {
    sessions: sessions.size,
    views: views.length,
    clicks: clicks.length,
    clickedSessions: clicked.size,
    copies: events.filter((e) => e.event_name === "code_copy").length,
    rate: sessions.size ? (100 * clicked.size) / sessions.size : 0,
  };
}
export function groupEvents(
  events: AnalyticsEvent[],
  key: (e: AnalyticsEvent) => string,
) {
  const groups = new Map<string, AnalyticsEvent[]>();
  for (const e of events) {
    const k = key(e);
    if (!k) continue;
    const list = groups.get(k) || [];
    list.push(e);
    groups.set(k, list);
  }
  return [...groups]
    .map(([name, rows]) => ({ name, ...metrics(rows) }))
    .sort((a, b) => b.sessions - a.sessions || b.clicks - a.clicks);
}
