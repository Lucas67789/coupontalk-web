import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const redirects=JSON.parse(readFileSync(new URL('../src/lib/coupon-redirects.json',import.meta.url),'utf8'));
test('coupon consolidation uses unique permanent same-store destinations without chains',()=>{
 const sources=new Set(redirects.map(r=>r.source));assert.equal(sources.size,redirects.length);
 for(const r of redirects){assert.equal(r.statusCode,301);assert.notEqual(r.source,r.destination);assert.equal(r.source.split('/')[2],r.destination.split('/')[2]);assert(!sources.has(r.destination));assert(r.destination.startsWith('/store/'));}
});
