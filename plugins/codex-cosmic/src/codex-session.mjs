import {spawn} from 'node:child_process';
import {resolveCodexCli} from './runtime-paths.mjs';

export const MODEL_EFFORTS={'gpt-6-astra':['low','medium','high','xhigh','max','ultra'],'gpt-5.6-sol':['low','medium','high','xhigh','max','ultra'],'gpt-5.6-terra':['low','medium','high','xhigh','max','ultra'],'gpt-5.6-luna':['low','medium','high','xhigh','max'],'gpt-5.5':['low','medium','high','xhigh'],'gpt-5.3-codex-spark':['low','medium','high','xhigh']};
export const responseSchema={type:'object',properties:{operations:{type:'array',items:{type:'string'}},summary:{type:'string'}},required:['operations','summary'],additionalProperties:false};
export function buildSessionParams({cwd,model,effort,prompt,images=[]}){
  if(!MODEL_EFFORTS[model]?.includes(effort))throw Error('This model and effort combination is not supported.');
  return {
    thread:{cwd,model,ephemeral:true,approvalPolicy:'never',sandbox:'read-only',environments:[],selectedCapabilityRoots:[],
      baseInstructions:'You are Cosmic’s native design engine. Follow the supplied design specification. Return structured design data only. Never execute commands, access other local files, install software, call external tools, or delegate work.',
      config:{'web_search':'disabled','features.shell_tool':false,'features.multi_agent':false}},
    turn:{cwd,model,effort,approvalPolicy:'never',sandboxPolicy:{type:'readOnly',networkAccess:false},environments:[],outputSchema:responseSchema,
      input:[{type:'text',text:prompt,text_elements:[]},...images.map(path=>({type:'localImage',path}))]}
  };
}

// One isolated, in-memory Codex session per design. No credentials are read or copied.
export function startCodexSession(options){
  const {cwd,onText=()=>{},onStatus=()=>{},spawnProcess=spawn,resolveCli=resolveCodexCli,rpcTimeoutMs=45000}=options;
  let child,seq=0,line='',stderr='',settled=false,threadId,turnId,finalText='';
  const pending=new Map(),messages=new Map();
  let resolveDone,rejectDone;
  const done=new Promise((resolve,reject)=>{resolveDone=resolve;rejectDone=reject;});
  function finish(error,text){if(settled)return;settled=true;for(const p of pending.values()){clearTimeout(p.timer);p.reject(error||Error('Session ended.'));}pending.clear();error?rejectDone(error):resolveDone(text);child?.stdin.end();child?.kill();}
  function write(message){if(child?.stdin.writable)child.stdin.write(JSON.stringify(message)+'\n');}
  function rpc(method,params){return new Promise((resolve,reject)=>{if(settled)return reject(Error('Session ended.'));const id=++seq;const timer=setTimeout(()=>{pending.delete(id);reject(Error('Codex did not respond to '+method+'. Check your sign-in and connection, then retry.'));},rpcTimeoutMs);pending.set(id,{resolve,reject,timer});write({id,method,params});});}
  function receive(message){
    if(settled)return;
    if(message.id!==undefined&&!message.method){const p=pending.get(message.id);if(p){pending.delete(message.id);clearTimeout(p.timer);message.error?p.reject(Error(message.error.message)):p.resolve(message.result);}return;}
    if(message.id!==undefined){write({id:message.id,error:{code:-32601,message:'This design session cannot execute external tools or request permissions.'}});return;}
    const p=message.params||{};
    if(threadId&&p.threadId&&p.threadId!==threadId)return;
    if(message.method==='item/agentMessage/delta'){
      const text=(messages.get(p.itemId)||'')+p.delta;if(text.length>4e6)return finish(Error('The design response is too large. Retry with a smaller scope.'));
      messages.set(p.itemId,text);onText(text,p.itemId);return;
    }
    if(message.method==='item/completed'&&p.item?.type==='agentMessage'){
      const text=p.item.text||messages.get(p.item.id)||'';if(text.trim().startsWith('{')){finalText=text;onText(text,p.item.id);}
    }
    if(message.method==='turn/started'){turnId=p.turn?.id;onStatus('Codex is planning the layout. Elements will appear as they are written.','design');}
    if(message.method==='error'&&!p.willRetry)return finish(Error(p.error?.message||p.message||'Codex reported an error.'));
    if(message.method==='turn/completed'){
      if(p.turn?.status==='completed')finish(null,finalText||[...messages.values()].findLast(t=>t.trim().startsWith('{'))||'');
      else finish(Error(p.turn?.error?.message||'Codex stopped before completing the design.'));
    }
  }
  try{
    const params=buildSessionParams(options);
    child=spawnProcess(resolveCli(),['app-server','--listen','stdio://'],{cwd,env:process.env,windowsHide:true,stdio:['pipe','pipe','pipe'],shell:false});
    child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');
    child.stdout.on('data',chunk=>{line+=chunk;let end;while((end=line.indexOf('\n'))>=0){const next=line.slice(0,end);line=line.slice(end+1);try{receive(JSON.parse(next));}catch(e){finish(e);}}if(line.length>4e6)finish(Error('Invalid response from Codex.'));});
    child.stderr.on('data',chunk=>{stderr=(stderr+chunk).slice(-10000);});child.stdin.on('error',e=>finish(e));
    child.on('error',e=>finish(e));child.on('close',code=>{if(!settled)finish(Error(stderr||'Codex disconnected before the design finished (exit '+code+').'));});
    (async()=>{
      await rpc('initialize',{clientInfo:{name:'codex_cosmic',title:'Codex Cosmic',version:'0.1.0'},capabilities:{experimentalApi:true}});
      write({method:'initialized',params:{}});onStatus('Connected to Codex. Opening a design session.','starting');
      const started=await rpc('thread/start',params.thread);threadId=started.thread.id;
      const turn=await rpc('turn/start',{...params.turn,threadId});turnId=turn.turn.id;
    })().catch(e=>finish(e));
  }catch(e){queueMicrotask(()=>finish(e));}
  return {done,cancel(){if(threadId&&turnId)write({id:++seq,method:'turn/interrupt',params:{threadId,turnId}});finish(Error('Design run stopped.'));}};
}
