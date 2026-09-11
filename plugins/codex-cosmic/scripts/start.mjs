// Portable entry point: dependencies and user data live outside the installed plugin cache.
import {existsSync,readFileSync,mkdirSync,cpSync,writeFileSync,openSync,closeSync,unlinkSync,statSync,readdirSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {cosmicDataPath} from '../src/runtime-paths.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
if(Number(process.versions.node.split('.')[0])<20)throw Error('Codex Cosmic requires Node.js 20 or newer.');
const data=cosmicDataPath(root);mkdirSync(data,{recursive:true});
const hash=createHash('sha256');
function hashPath(path){for(const entry of readdirSync(path,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const file=join(path,entry.name);hash.update(entry.name);if(entry.isDirectory())hashPath(file);else hash.update(readFileSync(file));}}
for(const f of ['package.json','package-lock.json','server.mjs','dist/index.html','.codex-plugin/plugin.json'])hash.update(readFileSync(join(root,f)));
hashPath(join(root,'src'));hashPath(join(root,'skills'));
const runtime=join(data,'runtime',hash.digest('hex').slice(0,16)+'-'+process.platform+'-'+process.arch);
const ready=join(runtime,'.ready');const lock=runtime+'.lock';mkdirSync(dirname(runtime),{recursive:true});
const npmCandidates=[process.env.npm_execpath,join(dirname(process.execPath),'node_modules/npm/bin/npm-cli.js'),resolve(dirname(process.execPath),'../lib/node_modules/npm/bin/npm-cli.js')];
for(const dir of (process.env.PATH||'').split(process.platform==='win32'?';':':'))npmCandidates.push(join(dir,'node_modules/npm/bin/npm-cli.js'),resolve(dir,'../lib/node_modules/npm/bin/npm-cli.js'));
let owned=false;
try{
  for(let attempt=0;!existsSync(ready);attempt++){
    try{const fd=openSync(lock,'wx');closeSync(fd);owned=true;break;}catch(e){if(e.code!=='EEXIST')throw e;}
    try{if(Date.now()-statSync(lock).mtimeMs>5*60*1000)throw Error('A previous setup did not finish. Remove the stale runtime lock in '+data+' and reopen Cosmic.');}catch(e){if(e.code!=='ENOENT')throw e;}
    if(attempt>600)throw Error('Dependency setup is taking too long. Reopen Cosmic after it finishes.');
    await new Promise(r=>setTimeout(r,200));
  }
  if(owned&&!existsSync(ready)){
    mkdirSync(runtime,{recursive:true});
    for(const f of ['package.json','package-lock.json','server.mjs','src','dist','assets','skills','.codex-plugin'])cpSync(join(root,f),join(runtime,f),{recursive:true});
    const npm=npmCandidates.find(p=>p&&existsSync(p));
    if(!npm)throw Error('npm was not found. Install Node.js including npm, then reopen Cosmic.');
    console.error('Codex Cosmic: preparing dependencies for this computer…');
    await new Promise((resolveInstall,reject)=>{
      const child=spawn(process.execPath,[npm,'ci','--omit=dev','--ignore-scripts','--no-audit','--no-fund'],{cwd:runtime,env:process.env,windowsHide:true,stdio:['ignore','ignore','pipe']});let detail='';
      child.stderr.on('data',c=>{detail=(detail+c).slice(-1500);});child.on('error',reject);child.on('close',code=>code===0?resolveInstall():reject(Error('Cosmic dependency setup failed. Check your network, then reopen. '+detail)));
    });
    writeFileSync(ready,'ready');
  }
}finally{if(owned&&existsSync(lock))unlinkSync(lock);}
process.env.CODEX_COSMIC_DATA_DIR=data;
await import(pathToFileURL(join(runtime,'server.mjs')).href);
