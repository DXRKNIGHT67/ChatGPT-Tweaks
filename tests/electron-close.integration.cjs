'use strict';
const {_electron:electron}=require('playwright');
const fs=require('node:fs/promises');const os=require('node:os');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{
 if(process.platform!=='win32')throw new Error('Windows desktop test required');
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'agent-close-'));const marker=path.join(dir,'operation.txt');let app,child;
 try{
  app=await electron.launch({args:[path.resolve(__dirname,'..')],timeout:60000});
  child=app.process();
  const window=await app.firstWindow();await window.waitForFunction(()=>document.getElementById('scan-badge').textContent==='● PC SCANNED',{},{timeout:60000});
  // Replace only the mutation body in this test process; exercise real IPC and window lifecycle.
  await app.evaluate(({app},marker)=>{
   const require=process.getBuiltinModule('module').createRequire(app.getAppPath()+'/package.json');
   const path=require('node:path');const fs=require('node:fs/promises');
   require(path.join(app.getAppPath(),'src/engine.cjs')).Engine.prototype.apply=async()=>{
    await fs.writeFile(marker,'started');let released=false;for(let i=0;i<300;i++){try{await fs.access(marker+'.finish');released=true;break;}catch{}await new Promise(r=>setTimeout(r,50));}if(!released)throw new Error('Test did not release operation');await fs.writeFile(marker,'completed');return [];
   };
  },marker);
  await window.evaluate(()=>{window.agent.apply([]).catch(()=>{});});
  for(let i=0;i<100;i++){try{if(await fs.readFile(marker,'utf8')==='started')break;}catch{}await new Promise(r=>setTimeout(r,50));}
  assert.equal(await fs.readFile(marker,'utf8'),'started');
  const exited=new Promise(resolve=>child.once('exit',resolve));
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].close());
  assert.equal(await fs.readFile(marker,'utf8'),'started','Window close must not cancel the running operation');
  assert.equal(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].isVisible()),false);
  await app.evaluate(({app})=>{app.emit('second-instance');});
  assert.equal(await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].isVisible()),true);
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].close());
  await fs.writeFile(marker+'.finish','finish');
  let timer;try{await Promise.race([exited,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('App did not exit after completion')),15000);})]);}finally{clearTimeout(timer);}
  assert.equal(await fs.readFile(marker,'utf8'),'completed');
  console.log('PASS: closing the actual window allows the in-flight operation to finish, then exits. No Windows setting changed.');
 }finally{await fs.writeFile(marker+'.finish','finish');if(app&&child&&child.exitCode===null&&child.signalCode===null)await app.close();await fs.rm(dir,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
