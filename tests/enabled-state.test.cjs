'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const {Engine}=require('../src/engine.cjs');
const {OperationLifetime}=require('../src/operation-lifetime.cjs');
test('enabled state comes from Windows, not old history; failed reads stay unknown',async()=>{
 const catalog=['on','off','unknown','unsupported'].map(id=>({id,action:'registry',type:'DWord',value:1}));
 const engine=new Engine({catalog,applicable:t=>t.id!=='unsupported',journal:{read:async()=>{throw new Error('History must not decide current state');}},adapter:{read:async t=>{if(t.id==='unknown')throw new Error('Access denied');return {exists:true,kind:'DWord',value:t.id==='on'?1:0};}}});
 assert.deepEqual(await engine.inspect(),{on:{state:'enabled'},off:{state:'off'},unknown:{state:'unknown',error:'Access denied'}});
});
test('a failed or missing batch read never counts as enabled',async()=>{
 const engine=new Engine({catalog:[{id:'one',type:'DWord',value:1}],adapter:{readMany:async()=>[]}});
 assert.equal((await engine.inspect()).one.state,'unknown');
 engine.adapter.readMany=async()=>{throw new Error('PowerShell blocked');};
 assert.equal((await engine.inspect()).one.state,'unknown');
});
test('closing during changes waits for completion and exits only afterward',async()=>{
 let resolve,closed=false;const life=new OperationLifetime(()=>{closed=true;});
 const task=life.run(()=>new Promise(r=>{resolve=r;}));
 assert.equal(life.requestClose(),true);assert.equal(closed,false);
 await assert.rejects(life.run(()=>{}),/Another operation/);
 resolve('done');assert.equal(await task,'done');assert.equal(closed,true);assert.equal(life.busy,false);
});
test('failed background changes also release lifetime; idle close exits immediately',async()=>{
 let reject,closed=false;const life=new OperationLifetime(()=>{closed=true;});
 assert.equal(life.requestClose(),false);
 const task=life.run(()=>new Promise((_,r)=>{reject=r;}));life.requestClose();reject(new Error('write failed'));
 await assert.rejects(task,/write failed/);assert.equal(closed,true);assert.equal(life.busy,false);
});
