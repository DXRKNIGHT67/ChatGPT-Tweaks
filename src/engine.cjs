'use strict';
const fs=require('node:fs/promises');const path=require('node:path');const crypto=require('node:crypto');
const {isDeepStrictEqual}=require('node:util');
function same(a,b){return a?.exists===b?.exists&&(!a?.exists||(a.kind===b.kind&&isDeepStrictEqual(a.value,b.value)));}
function desired(t){return {exists:true,kind:t.action==='power'?'PowerPlan':t.type,value:t.value};}
class Journal {
 constructor(file,legacyFile){this.file=file;this.legacyFile=legacyFile;}
 async read(){let data;try{data=JSON.parse(await fs.readFile(this.file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw new Error('Recovery data is unreadable. No settings were changed.');if(this.legacyFile){try{const old=JSON.parse(await fs.readFile(this.legacyFile,'utf8'));data={version:2,entries:Object.fromEntries(Object.entries(old).map(([id,value])=>[id,{original:{exists:value.exists,kind:value.kind,value:value.value},status:'legacy',savedAt:value.savedAt}]))};}catch(err){if(err.code!=='ENOENT')throw new Error('Version 1 backup is unreadable. No settings were changed.');}}}
 if(!data)return {version:2,entries:{},history:[]};
 if(data.version!==2||!data.entries||typeof data.entries!=='object'||Array.isArray(data.entries))throw new Error('Unsupported recovery journal. No settings were changed.');
 for(const entry of Object.values(data.entries)){if(typeof entry.original?.exists!=='boolean'||(entry.original.exists&&(!['DWord','String','ExpandString','QWord','Binary','MultiString','PowerPlan'].includes(entry.original.kind)||entry.original.value===undefined)))throw new Error('Invalid original setting in recovery journal. No settings were changed.');}
 data.history??=[];return data;
 }
 async write(data){await fs.mkdir(path.dirname(this.file),{recursive:true});const tmp=this.file+'.'+crypto.randomUUID()+'.tmp';const handle=await fs.open(tmp,'wx',0o600);try{await handle.writeFile(JSON.stringify(data,null,2));await handle.sync();}finally{await handle.close();}try{await fs.rename(tmp,this.file);}catch(e){await fs.rm(tmp,{force:true});throw e;}}
}
class Engine {
 constructor({catalog,adapter,journal,applicable=()=>true}){this.catalog=catalog;this.adapter=adapter;this.journal=journal;this.applicable=applicable;this.busy=false;}
 validate(ids){if(!Array.isArray(ids)||ids.length>this.catalog.length||ids.some(id=>typeof id!=='string'||!this.catalog.some(t=>t.id===id)))throw new Error('Invalid tweak selection');const selected=[...new Set(ids)].map(id=>this.catalog.find(t=>t.id===id));const groups=new Set();for(const t of selected){if(t.exclusive){if(groups.has(t.exclusive))throw new Error('Select only one setting in '+t.exclusive);groups.add(t.exclusive);}}return selected;}
 async exclusive(fn){if(this.busy)throw new Error('Another operation is running');this.busy=true;try{return await fn();}finally{this.busy=false;}}
 async apply(ids){const selected=this.validate(ids);return this.exclusive(async()=>{const data=await this.journal.read();const results=[];for(const t of selected){try{
 if(!await this.applicable(t)) {results.push({id:t.id,status:'skipped',ok:false,error:'Not supported by the latest hardware scan'});continue;}
 const target=desired(t);const current=await this.adapter.read(t);
 if(same(current,target)&&!data.entries[t.id]){results.push({id:t.id,status:'already',ok:true});continue;}
 if(data.entries[t.id]&&!same(current,target)&&!same(current,data.entries[t.id].original))throw new Error('Setting changed outside Agent Tweaks. Restore or resolve the conflict first.');
 if(!data.entries[t.id])data.entries[t.id]={original:current,target,savedAt:new Date().toISOString(),status:'pending'};
 data.entries[t.id].target=target;data.entries[t.id].status='pending';await this.journal.write(data);
 await this.adapter.write(t,target);
 if(!same(await this.adapter.read(t),target))throw new Error('Read-back verification failed');
 data.entries[t.id].status='applied';delete data.entries[t.id].error;await this.journal.write(data);results.push({id:t.id,ok:true,status:'applied'});
 }catch(e){if(data.entries[t.id]){data.entries[t.id].status='failed';data.entries[t.id].error=e.message;try{await this.journal.write(data);}catch(writeError){results.push({id:t.id,status:'failed',ok:false,error:e.message+'; journal failure: '+writeError.message});break;}}results.push({id:t.id,status:'failed',ok:false,error:e.message});}}
 data.history=[...(data.history||[]),{time:new Date().toISOString(),operation:'apply',results}].slice(-50);await this.journal.write(data);return results;});}
 async restore(){return this.exclusive(async()=>{const data=await this.journal.read();const results=[];for(const [id,entry] of Object.entries(data.entries).reverse()){const t=this.catalog.find(t=>t.id===id);if(!t){results.push({id,ok:false,status:'failed',error:'Unknown setting; backup retained'});continue;}try{
 const current=await this.adapter.read(t);const target=entry.target||desired(t);
 if(!same(current,entry.original)&&!same(current,target))throw new Error('Setting changed outside Agent Tweaks; original backup retained to avoid overwriting your newer choice.');
 if(!same(current,entry.original)){if(entry.original.exists)await this.adapter.write(t,entry.original);else await this.adapter.remove(t);}
 if(!same(await this.adapter.read(t),entry.original))throw new Error('Restore verification failed; original backup retained');
 delete data.entries[id];await this.journal.write(data);results.push({id,ok:true,status:'restored'});
 }catch(e){results.push({id,ok:false,status:'failed',error:e.message});}}
 data.history=[...(data.history||[]),{time:new Date().toISOString(),operation:'restore',results}].slice(-50);await this.journal.write(data);return results;});}
 async status(){const data=await this.journal.read();return {entries:data.entries,history:data.history||[]};}
}
module.exports={Journal,Engine,same,desired};
