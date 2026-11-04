import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
import * as affiliate from '../src/lib/affiliate.ts';

test('copying a code never opens a seller and only a successful copy is recorded',async()=>{
 const events=[];const exports={};
 const source=ts.transpile(readFileSync(new URL('../src/lib/coupon-action.ts',import.meta.url),'utf8'),{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022});
 let fail=false;
 runInNewContext(source,{exports,require:name=>name==='./affiliate'?affiliate:{trackEvent:(...a)=>events.push(a)},navigator:{clipboard:{writeText:async()=>{if(fail)throw Error('denied');}}},window:{open:()=>events.push(['opened'])}});
 await exports.copyCouponCode({id:'c',code:'SAVE'});assert.equal(events.length,1);assert.equal(events[0][0],'code_copy');
 fail=true;await exports.copyCouponCode({id:'c',code:'SAVE'});assert.equal(events.length,1);
 await exports.openCouponLink({id:'c',code:'SAVE'},'https://www.gamsgo.com/partner/rQT9a','브랜드',false);
 assert.deepEqual(events.slice(1).map(x=>x[0]),['opened','affiliate_click']);
});
test('every underserved store has a contextual inbound link, without self-links',()=>{
 const d=JSON.parse(readFileSync(new URL('../src/lib/related-stores.json',import.meta.url),'utf8'));
 const incoming=new Set();
 for(const [,,ids]of d.groups)for(const id of ids){assert.ok(d.names[id]);const i=ids.indexOf(id);const links=[...ids.slice(i+1),...ids.slice(0,i)].slice(0,4);assert.ok(!links.includes(id));for(const next of links)incoming.add(next);}
 for(const id of ['11st','antonioli','clubclio','dosirak1','gmarket','gocity','halfclub1','hcombine2','himart','iherb','lgecom','marshall','naturerepublic','nordvpn2','rakutentr','re4akor','surfshark','wconcept','베이비뵨','socar'])assert.ok(incoming.has(id),id);
});
