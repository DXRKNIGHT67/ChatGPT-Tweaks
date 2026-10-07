'use strict';
const fs=require('node:fs');const path=require('node:path');const {fileURLToPath}=require('node:url');
function canonical(file,{platform=process.platform,realpath=fs.realpathSync.native}={}){
 const paths=platform==='win32'?path.win32:path.posix;const absolute=paths.resolve(file);const archive=/\.asar(?=[\\/]|$)/i.exec(absolute);
 const physical=archive?absolute.slice(0,archive.index+5):absolute;const remainder=archive?absolute.slice(archive.index+5):'';
 const resolved=paths.normalize(realpath(physical));
 return (platform==='win32'?resolved.toLowerCase():resolved)+remainder;
}
function trustedFileURL(url,index,options={}){try{const parsed=new URL(url);if(parsed.protocol!=='file:'||parsed.search||parsed.hash)return false;const windows=(options.platform||process.platform)==='win32';return canonical(fileURLToPath(parsed,{windows}),options)===canonical(index,options);}catch{return false;}}
module.exports={trustedFileURL,canonical};
