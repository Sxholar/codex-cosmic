import {mkdirSync,readFileSync,writeFileSync,renameSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';

export function createActivityStore(dataPath){
  const root=join(dataPath,'activity');mkdirSync(root,{recursive:true});
  function path(id){if(!/^[a-zA-Z0-9_-]{1,100}$/.test(id))throw Error('Invalid project ID.');return join(root,id+'.json');}
  function read(id){const p=path(id);if(!existsSync(p))return [];try{return JSON.parse(readFileSync(p,'utf8'));}catch{return [];}}
  function add(projectId,{message,stage='canvas',status='completed',assetId,assetName,runId}){
    if(typeof message!=='string'||!message.trim()||message.length>2000)throw Error('Progress messages must be between 1 and 2,000 characters.');
    if(!['starting','design','assets','canvas','review','complete','error'].includes(stage))throw Error('Invalid progress stage.');
    if(!['running','completed','failed','waiting'].includes(status))throw Error('Invalid progress status.');
    const event={id:randomUUID(),at:new Date().toISOString(),stage,status,message,...(assetId?{assetId}:{}),...(assetName?{assetName}:{}),...(runId?{runId}:{})};
    const p=path(projectId),events=[...read(projectId),event].slice(-80);writeFileSync(p+'.tmp',JSON.stringify(events));renameSync(p+'.tmp',p);return event;
  }
  return {read,add};
}
