import {mkdirSync,readFileSync,writeFileSync,renameSync,readdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';

export const terminalStatuses = new Set(['completed','failed','cancelled','conflict','interrupted']);
const validId = id => typeof id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(id);
export function createRunStore(dataPath) {
  const root=join(dataPath,'runs');mkdirSync(root,{recursive:true});
  function file(id){if(!validId(id))throw Error('Invalid design run ID.');return join(root,id,'job.json');}
  function put(job){const path=file(job.id);mkdirSync(join(root,job.id),{recursive:true});const {child,...record}=job;const temp=path+'.tmp';writeFileSync(temp,JSON.stringify(record,null,2));renameSync(temp,path);return record;}
  function get(id){const path=file(id);if(!existsSync(path))return null;try{return JSON.parse(readFileSync(path,'utf8'));}catch{return null;}}
  function list(projectId){return readdirSync(root,{withFileTypes:true}).filter(d=>d.isDirectory()&&validId(d.name)).map(d=>get(d.name)).filter(j=>j&&(!projectId||j.projectId===projectId)).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}
  function recover(){for(const job of list())if(!terminalStatuses.has(job.status)){put({...job,status:'interrupted',stage:'interrupted',message:'The studio restarted before this run finished. Your saved canvas is safe. Retry to start a new run.',finishedAt:new Date().toISOString()});}}
  return {put,get,list,recover};
}

export function safeRunError(error) {
  const text=String(error?.message||error||'Codex returned no design.');
  if(/usage limit|rate limit|quota|exceeded.*limit/i.test(text))return 'Codex usage limit reached. Wait for your allowance to reset, then retry.';
  if(/login|authenticate|unauthorized|401|sign.?in/i.test(text))return 'Codex needs to be signed in. Run codex login on this computer, then retry.';
  if(/ENOENT|not recognized|could not find.*codex/i.test(text))return 'Codex could not be found. Install the Codex CLI or set CODEX_COSMIC_CLI to its executable, then retry.';
  if(/Could not find home|resolve CODEX_HOME/i.test(text))return 'Codex could not locate your user profile. Launch Cosmic from your signed-in desktop session, then retry.';
  return text.replace(/\x1b\[[0-9;]*m/g,'').replace(/Bearer\s+\S+|sk-[A-Za-z0-9_-]+/g,'[redacted]').slice(-1800);
}
