'use strict';
const {app,BrowserWindow,ipcMain,shell,dialog}=require('electron');
const os=require('node:os');const path=require('node:path');const fs=require('node:fs/promises');const {trustedFileURL}=require('./trusted-frame.cjs');
const {tweaks,available,profile}=require('./catalog.cjs');const {Engine,Journal}=require('./engine.cjs');const {WindowsAdapter}=require('./windows-adapter.cjs');const {runPowerShell}=require('./powershell.cjs');const {measure}=require('./network.cjs');
const index=path.join(__dirname,'index.html');
let engine,win,lastScan,networkBusy=false,previousCPU;
const storage=path.join(app.getPath('appData'),'agent-tweaks');
require('node:fs').mkdirSync(storage,{recursive:true});
app.setPath('userData',storage);
function handler(channel,fn){ipcMain.handle(channel,async(event,...args)=>{if(event.sender!==win?.webContents||event.senderFrame!==event.sender.mainFrame||!trustedFileURL(event.senderFrame?.url,index))throw new Error('Untrusted application frame');return fn(...args);});}
async function scan(){lastScan=undefined;if(process.platform!=='win32'){lastScan={platform:process.platform,scanComplete:false,cpu:os.cpus()[0]?.model||'Unknown',cores:os.cpus().length,logicalCores:os.cpus().length,ram:os.totalmem(),ramUsed:os.totalmem()-os.freemem(),gpu:[],disks:[],network:[],powerPlans:[],os:os.type(),desktop:false,preview:true,warnings:['Windows is required to scan GPU/drives and apply optimizations.']};return lastScan;}
 const script=await fs.readFile(path.join(__dirname,'../scripts/scan.ps1'),'utf8');const result=JSON.parse(await runPowerShell(script,{timeout:45000}));if(!result.scanComplete||!result.cpu||!Number.isFinite(result.ram)||result.ram<=0||!Array.isArray(result.gpu)||!Array.isArray(result.disks))throw new Error('Hardware scan returned incomplete data. Applying tweaks is disabled.');lastScan=result;return result;}
function metrics(){const cpu=os.cpus().reduce((v,c)=>{v.idle+=c.times.idle;v.total+=Object.values(c.times).reduce((a,b)=>a+b,0);return v;},{idle:0,total:0});let load=null;if(previousCPU){const delta=cpu.total-previousCPU.total;if(delta>0)load=Math.max(0,Math.min(100,Math.round(100*(1-(cpu.idle-previousCPU.idle)/delta))));}previousCPU=cpu;return {cpu:load,ram:os.totalmem(),ramUsed:os.totalmem()-os.freemem()};}
function requireWindowsScan(){if(process.platform!=='win32'||!lastScan?.scanComplete)throw new Error('Complete a successful Windows scan before changing settings.');}
function settings(section){const allowed={graphics:'ms-settings:display-advancedgraphics',startup:'ms-settings:startupapps',apps:'ms-settings:appsfeatures',network:'ms-settings:network-status',power:'ms-settings:powersleep',gaming:'ms-settings:gaming-gamemode',display:'ms-settings:display-advanced',storage:'ms-settings:storagesense',mouse:'ms-settings:mousetouchpad'};if(!allowed[section])throw new Error('Unknown settings page');if(process.platform==='win32')return shell.openExternal(allowed[section]);throw new Error('Windows settings are unavailable in preview mode');}
app.whenReady().then(async()=>{
 if(!app.requestSingleInstanceLock()){app.quit();return;}
 const root=app.getPath('userData');let legacy=path.join(root,'registry-backup.json');try{await fs.access(legacy);}catch{legacy=path.join(app.getPath('appData'),'Agent Tweaks','registry-backup.json');}
 engine=new Engine({catalog:tweaks,adapter:new WindowsAdapter(),journal:new Journal(path.join(root,'recovery-v2.json'),legacy),applicable:t=>available(t,lastScan).available});
 handler('scan',scan);handler('metrics',metrics);
 handler('catalog',async()=>{const status=await engine.status();return {tweaks:tweaks.map(t=>({...t,...available(t,lastScan)})),entries:status.entries,history:status.history,active:Object.entries(status.entries).filter(([,b])=>b.status==='applied').map(([id])=>id),pending:Object.keys(status.entries),windows:process.platform==='win32',version:app.getVersion()};});
 handler('profile',mode=>{if(!['recommended','performance'].includes(mode))throw new Error('Unknown profile');return profile(lastScan,mode);});
 handler('apply',ids=>{requireWindowsScan();return engine.apply(ids);});handler('restore',()=>{if(process.platform!=='win32')throw new Error('Restore requires Windows');return engine.restore();});
 handler('network',async()=>{if(networkBusy)throw new Error('A connection test is already running');networkBusy=true;try{return await measure();}finally{networkBusy=false;}});handler('settings',settings);
 handler('report',async()=>{const status=await engine.status();const result=await dialog.showSaveDialog(win,{title:'Save local diagnostics',defaultPath:'Agent-Tweaks-Diagnostics.json',filters:[{name:'JSON',extensions:['json']}]});if(result.canceled)return false;await fs.writeFile(result.filePath,JSON.stringify({version:app.getVersion(),scan:lastScan,recovery:status,generatedAt:new Date().toISOString()},null,2));return true;});
 handler('backup-folder',()=>shell.openPath(root));
 win=new BrowserWindow({width:1480,height:1000,minWidth:1000,minHeight:680,backgroundColor:'#080a0f',title:'Agent Tweaks — Your path for glory',icon:path.join(__dirname,'icon.png'),webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true}});win.setMenuBarVisibility(false);win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',e=>e.preventDefault());win.webContents.session.setPermissionRequestHandler((_,__,callback)=>callback(false));await win.loadFile(index);app.on('second-instance',()=>{if(win.isMinimized())win.restore();win.focus();});
}).catch(error=>{dialog.showErrorBox('Agent Tweaks could not start',error.message);app.quit();});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
