import {test} from 'node:test';
import assert from 'node:assert/strict';
import {attribution,dateRange,metrics,groupEvents,koreaDay} from '../src/lib/analytics.ts';
test('Korean day boundaries and elapsed previous period',()=>{const now=Date.parse('2026-10-31T03:00:00Z');const r=dateRange('2026-10-31','2026-10-31',now);assert.equal(r.to-r.from,12*3600000);assert.equal(r.previousTo-r.previousFrom,r.to-r.from);assert.equal(r.previousFrom,Date.parse('2026-10-30T00:00:00+09:00'));assert.equal(koreaDay(Date.parse('2026-10-30T15:00:00Z')),'2026-10-31');assert.throws(()=>dateRange('2026-02-30','2026-03-01',now));assert.throws(()=>dateRange('2026-01-01','2026-10-31',now));});
test('Attribution never invents keywords from missing referrers',()=>{assert.deepEqual(attribution('https://search.naver.com/search.naver?where=nexearch'),{source:'네이버',keyword:null});assert.equal(attribution('https://search.naver.com/?query=쿠폰').keyword,'쿠폰');assert.equal(attribution('https://naver.com.evil.example').source,'naver.com.evil.example');assert.equal(attribution('').source,'직접/출처 불명');});
test('Click session rate counts sessions, not repeat clicks or copies',()=>{const events=[{event_name:'page_view',session_id:'a',source:'네이버'},{event_name:'page_view',session_id:'b',source:'구글'},{event_name:'affiliate_click',session_id:'a',source:'네이버'},{event_name:'affiliate_click',session_id:'a',source:'네이버'},{event_name:'code_copy',session_id:'b',source:'구글'}];assert.equal(metrics(events).rate,50);assert.equal(metrics(events).clicks,2);assert.equal(metrics(events).copies,1);assert.equal(groupEvents(events,e=>e.source).find(r=>r.name==='구글').clicks,0);});
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
import {randomUUID} from 'node:crypto';
import * as analytics from '../src/lib/analytics.ts';
test('Client session expires after 30 minutes and duplicate transport retries keep event ID',async()=>{
 let now=1_800_000_000_000; const saved=new Map(),sent=[];let fail=true;
 const exports={};const source=ts.transpile(readFileSync(new URL('../src/lib/analytics-client.ts',import.meta.url),'utf8'),{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022});
 runInNewContext(source,{exports,require:n=>n==='./analytics'?analytics:{supabase:{auth:{getSession:async()=>({data:{session:null}})}}},Date:{now:()=>now},crypto:{randomUUID},localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)},location:{pathname:'/subscriptions/netflix-discount',hostname:'coupontalk.kr'},document:{referrer:'https://search.naver.com/'},navigator:{userAgent:'Mobile'},fetch:async(_,o)=>{sent.push(JSON.parse(o.body));if(fail){fail=false;throw Error('network');}return{ok:true,status:200};}});
 await exports.trackEvent('page_view');assert.equal(sent.length,2);assert.equal(sent[0].id,sent[1].id);
 await exports.trackEvent('page_view');assert.equal(sent.length,2);
 now+=1000;await exports.trackEvent('affiliate_click');assert.equal(sent[2].session_id,sent[0].session_id);
 now+=31*60000;await exports.trackEvent('page_view');assert.notEqual(sent[3].session_id,sent[0].session_id);assert.equal(sent[3].visitor_id,sent[0].visitor_id);assert.equal(sent[3].keyword,null);
});

test('visitor metrics distinguish repeated page views, multiple pages and repeated clicks',()=>{
 const rows=[
 {event_name:'page_view',visitor_id:'a',session_id:'s1',path:'/one'},
 {event_name:'page_view',visitor_id:'a',session_id:'s2',path:'/one'},
 {event_name:'page_view',visitor_id:'a',session_id:'s2',path:'/two'},
 {event_name:'page_view',visitor_id:'b',session_id:'s3',path:'/one'},
 {event_name:'affiliate_click',visitor_id:'a',session_id:'s1',path:'/one'},
 {event_name:'affiliate_click',visitor_id:'a',session_id:'s2',path:'/one'}];
 const m=metrics(rows);assert.equal(m.visitors,2);assert.equal(m.sessions,3);assert.equal(m.repeatViews,1);assert.equal(m.clickedVisitors,1);assert.equal(m.clicks,2);assert.equal(m.visitorClickRate,50);
 assert.equal(metrics([]).visitorClickRate,0);
});
test('Google inspection and synthetic audits are detected without excluding normal browsers',()=>{
 for(const ua of ['Mozilla/5.0 Google-InspectionTool/1.0','GoogleOther','Chrome-Lighthouse','HeadlessChrome','Googlebot','Yeti crawler'])assert.equal(analytics.isInspectionAgent(ua),true);
 assert.equal(analytics.isInspectionAgent('Mozilla/5.0 Chrome/130.0 Safari/537.36'),false);
});

test('inspection browser sends no events; an admin visit persists test mode',async()=>{
 const saved=new Map(),sent=[];const exports={};const source=ts.transpile(readFileSync(new URL('../src/lib/analytics-client.ts',import.meta.url),'utf8'),{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022});
 const location={pathname:'/store/charlesnk',hostname:'coupontalk.kr',search:''};const navigator={userAgent:'Google-InspectionTool/1.0',webdriver:false};
 runInNewContext(source,{exports,require:n=>n==='./analytics'?analytics:{supabase:{auth:{getSession:async()=>({data:{session:null}})}}},Date,URLSearchParams,crypto:{randomUUID},localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)},location,document:{referrer:''},navigator,fetch:async(_,o)=>{sent.push(JSON.parse(o.body));return{ok:true,status:200};}});
 await exports.trackEvent('page_view');assert.equal(sent.length,0);
 navigator.userAgent='Chrome';navigator.webdriver=true;await exports.trackEvent('page_view');assert.equal(sent.length,0);
 navigator.webdriver=false;location.pathname='/admin';await exports.trackEvent('page_view');assert.equal(saved.get('ct_analytics_test'),'1');
 location.pathname='/store/charlesnk';await exports.trackEvent('page_view');assert.equal(sent[0].is_test,true);
});
test('paired probes are flagged but not silently removed, and engaged visitors are not flagged',()=>{
 const rows=[{event_name:'page_view',visitor_id:'a',session_id:'1',path:'/p',source:'직접/출처 불명',device:'desktop',created_at:'2026-11-05T01:00:00Z'},{event_name:'page_view',visitor_id:'b',session_id:'2',path:'/p',source:'직접/출처 불명',device:'mobile',created_at:'2026-11-05T01:00:01Z'}];
 assert.equal(analytics.possibleInspectionVisitors(rows),2);assert.equal(metrics(rows).visitors,2);
 assert.equal(analytics.possibleInspectionVisitors([...rows,{...rows[0],event_name:'affiliate_click'}]),0);
});
