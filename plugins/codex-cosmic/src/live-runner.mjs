import {createRunStore,safeRunError} from './run-store.mjs';
import {startCodexSession,MODEL_EFFORTS} from './codex-session.mjs';
import {operationStrings} from './design-stream.mjs';
import {buildDesignPrompt} from './design-prompt.mjs';
import {parseRunOperations} from './design-operations.mjs';
import {mkdirSync,writeFileSync,readFileSync,existsSync,renameSync} from 'node:fs';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
export function createRunner({dataPath,read,save,apply,summary,onProgress=()=>{},sessionFactory=startCodexSession,timeoutMs=15*60*1000,previewIntervalMs=350}){
  const jobs=new Map(),store=createRunStore(dataPath);store.recover();let active=null;
  function publicJob(job){const {session,timer,previewTimer,previewDocument,pendingText,...record}=job;return record;}
  function publish(job,message,stage=job.stage||'design'){
    job.message=String(message).slice(0,2000);job.stage=stage;job.updatedAt=new Date().toISOString();
    job.events=[...(job.events||[]),{at:job.updatedAt,stage,message:job.message}].slice(-40);store.put(publicJob(job));
    onProgress(job.projectId,{runId:job.id,stage:stage==='interrupted'?'error':stage,message:job.message,status:job.status==='running'?'running':job.status==='completed'?'completed':'failed'});
  }
  function finish(job,status,message){if(job.status!=='running')return;job.status=status;job.finishedAt=new Date().toISOString();clearTimeout(job.timer);clearTimeout(job.previewTimer);if(active===job.id)active=null;publish(job,message,status==='completed'?'complete':'error');}
  function lookup(id){const job=jobs.get(id)||store.get(id);if(!job){const e=Error('This run is no longer available. Your prompt is saved; retry to start a new run.');e.code='RUN_NOT_FOUND';throw e;}return job;}
  function preview(id){const job=lookup(id);if(!job.previewVersion)throw Error('This run has no completed draft elements yet.');if(job.previewDocument)return structuredClone(job.previewDocument);const dir=join(dataPath,'runs',job.id);return apply(JSON.parse(readFileSync(join(dir,'canvas-before.json'),'utf8')),JSON.parse(readFileSync(join(dir,'preview-operations.json'),'utf8')));}
  function start(args){
    if(active&&jobs.get(active)?.status==='running')throw Error('A design run is already in progress. Open its project or stop it before starting another.');
    if(typeof args.prompt!=='string'||!args.prompt.trim()||args.prompt.length>10000)throw Error('Enter a design request under 10,000 characters.');
    if(!MODEL_EFFORTS[args.model]?.includes(args.effort))throw Error('Unsupported model or reasoning effort.');
    const snapshot=structuredClone(read(args.projectId)),jobId=randomUUID(),dir=join(dataPath,'runs',jobId);mkdirSync(dir,{recursive:true});
    writeFileSync(join(dir,'canvas-before.json'),JSON.stringify(snapshot));
    const job={id:jobId,status:'running',model:args.model,effort:args.effort,prompt:args.prompt,createdAt:new Date().toISOString(),projectId:snapshot.projectId,baseRevision:snapshot.revision,previewVersion:0,operationCount:0};
    jobs.set(jobId,job);active=jobId;publish(job,'Connecting to Codex…','starting');let lastEncoded='';
    function updatePreview(text){
      if(job.status!=='running')return;
      const strings=operationStrings(text),encoded=JSON.stringify(strings);if(!strings.length||encoded===lastEncoded)return;
      const ops=parseRunOperations(JSON.stringify(strings.map(s=>JSON.parse(s))));
      if(args.review&&ops.some(o=>o.type!=='add-review'))throw Error('A review may only add review notes.');
      // A forward reference is held until the whole prefix validates.
      let next;try{next=apply(snapshot,ops);}catch{return;}
      lastEncoded=encoded;job.previewDocument=next;job.previewVersion++;job.operationCount=ops.length;
      job.boardIds=next.boards.filter(b=>!snapshot.boards.some(old=>old.id===b.id)).map(b=>b.id);
      job.previewLayerCount=next.layers.length;job.previewObjectCount=next.scene?.objects.length||0;
      writeFileSync(join(dir,'preview-operations.json.tmp'),JSON.stringify(ops));renameSync(join(dir,'preview-operations.json.tmp'),join(dir,'preview-operations.json'));
      publish(job,(snapshot.kind==='scene'?job.previewObjectCount+' objects':next.layers.length+' elements')+' in the live draft.','canvas');
    }
    function flushPreview(){clearTimeout(job.previewTimer);job.previewTimer=null;try{if(job.pendingText)updatePreview(job.pendingText);}catch(e){finish(job,'failed',safeRunError(e));job.session?.cancel();}}
    try{
      const images=summary(snapshot).assets.filter(a=>a.localPath&&existsSync(a.localPath)).slice(0,4).map(a=>a.localPath);
      job.session=sessionFactory({cwd:dir,model:args.model,effort:args.effort,images,prompt:buildDesignPrompt(snapshot,args,summary),
        onText(text){if(job.status!=='running')return;job.pendingText=text;if(!job.previewTimer)job.previewTimer=setTimeout(flushPreview,previewIntervalMs);},
        onStatus(message,stage){if(job.status==='running')publish(job,message,stage);}});
      job.session.done.then(text=>{
        if(job.status!=='running')return;
        job.pendingText=text;flushPreview();if(job.status!=='running')return;
        const result=JSON.parse(text);if(!Array.isArray(result.operations))throw Error('Codex returned no design operations.');
        const ops=parseRunOperations(JSON.stringify(result.operations.map(s=>JSON.parse(s))));
        if(args.review&&ops.some(o=>o.type!=='add-review'))throw Error('A review may only add review notes.');
        if(!ops.length||(!args.review&&!ops.some(o=>['add-layer','patch-layer','add-object','patch-object'].includes(o.type))))throw Error('Codex returned no visible design changes. Retry with a more specific request.');
        const next=apply(snapshot,ops);writeFileSync(join(dir,'proposed-design.json'),JSON.stringify(next));
        if(read(snapshot.projectId).revision!==snapshot.revision){finish(job,'conflict','Your canvas changed during this run. Open the generated draft as a new project to keep both versions.');return;}
        job.boardIds=next.boards.filter(b=>!snapshot.boards.some(old=>old.id===b.id)).map(b=>b.id);job.operationCount=ops.length;
        save(next,snapshot.revision,snapshot.projectId);finish(job,'completed',result.summary||'Design saved. Try it in Preview.');
      }).catch(e=>finish(job,'failed',safeRunError(e)));
      job.timer=setTimeout(()=>{flushPreview();finish(job,'failed','This run timed out. Your saved canvas is safe. Keep the partial draft or retry a smaller request.');job.session?.cancel();},timeoutMs);job.timer.unref?.();
    }catch(e){finish(job,'failed',safeRunError(e));}
    return publicJob(job);
  }
  return {start,preview,list(projectId){return store.list(projectId).slice(0,20);},get(id){return publicJob(lookup(id));},
    cancel(id){const job=lookup(id);if(job.status==='running'){finish(job,'cancelled','Design stopped. Your saved canvas is unchanged; any partial draft is available.');job.session?.cancel();}return publicJob(job);},
    shutdown(){for(const job of jobs.values())if(job.status==='running'){finish(job,'interrupted','The studio stopped before this design finished. Reopen its draft or retry.');job.session?.cancel();}}
  };
}
