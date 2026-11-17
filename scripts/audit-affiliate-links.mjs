import fs from 'node:fs';
import {safeAffiliateUrl} from '../src/lib/affiliate.ts';
import {couponStatus} from '../src/lib/utils.ts';

// Input: bounded export of stores, coupons and products. No credentials required.
const snapshot = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const now = process.argv[3] ? Date.parse(process.argv[3]) : Date.now();
const ready = row => row.status === 'published' && (!row.published_at || Date.parse(row.published_at) <= now);
const destination = row => {
  let url = row.affiliate_url || row.affiliateUrl || '';
  try { const condition = JSON.parse(row.condition); if (typeof condition?.url === 'string' && condition.url) url = condition.url; } catch {}
  return url;
};
const coupons = snapshot.coupons.map(row => ({id:row.id, store:row.store_id, state:ready(row) ? couponStatus(row, now) : 'unpublished', url:destination(row), allowed:!!safeAffiliateUrl(destination(row))}));
const products = (snapshot.products || []).map(row => ({id:row.id, store:row.store_id, live:ready(row), url:row.affiliate_url, allowed:!!safeAffiliateUrl(row.affiliate_url)}));
const stores = snapshot.stores.map(row => {
  // Mirror the shared store landing's active-offer fallback.
  const active = snapshot.coupons.filter(c => c.store_id === row.id && ready(c) && couponStatus(c, now) === 'active')
    .sort((a,b) => Date.parse(b.created_at || b.published_at) - Date.parse(a.created_at || a.published_at));
  const url = safeAffiliateUrl(row.website_url) || (active.length ? safeAffiliateUrl(destination(active[0])) : null);
  return {id:row.id, direct:row.website_url, effective:url, activeOffers:active.length};
});
const failures = [
  ...coupons.filter(c => ['active','upcoming'].includes(c.state) && !c.allowed).map(c => ({type:'active_coupon',...c})),
  ...products.filter(p => p.live && !p.allowed).map(p => ({type:'product',...p})),
  ...stores.filter(s => s.activeOffers && !s.effective).map(s => ({type:'store',...s})),
];
const report = {checkedAt:new Date(now).toISOString(), counts:{stores:stores.length,coupons:coupons.length,products:products.length,activeCoupons:coupons.filter(c=>c.state==='active').length,upcomingCoupons:coupons.filter(c=>c.state==='upcoming').length,expiredCoupons:coupons.filter(c=>c.state==='expired').length,unpublishedCoupons:coupons.filter(c=>c.state==='unpublished').length},failures,nonActiveBlocked:coupons.filter(c=>c.state!=='active'&&!c.allowed),storesWithoutDirectLink:stores.filter(s=>!s.direct)};
console.log(JSON.stringify(report,null,2));
if(failures.length) process.exitCode=1;
