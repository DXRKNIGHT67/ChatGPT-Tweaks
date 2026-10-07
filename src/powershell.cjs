'use strict';
const {execFile}=require('node:child_process');
function runPowerShell(script,{timeout=30000,executable='powershell.exe'}={}){
  if(typeof script!=='string')throw new TypeError('PowerShell script must be a string');
  const wrapped=`& { $ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue'; [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false); try { ${script}\n } catch { [Console]::Error.WriteLine($_.Exception.Message); exit 1 } }`;
  return new Promise((resolve,reject)=>execFile(executable,['-NoLogo','-NoProfile','-NonInteractive','-Command',wrapped],{windowsHide:true,timeout,maxBuffer:8*1024*1024,encoding:'utf8'},(error,stdout,stderr)=>{if(error){reject(new Error(error.killed?'Windows operation timed out; check Recovery before retrying.':stderr.trim()||error.message));return;}resolve(stdout.replace(/^\uFEFF/,'').trim());}));
}
const psQuote=s=>"'"+String(s).replaceAll("'","''")+"'";
module.exports={runPowerShell,psQuote};
