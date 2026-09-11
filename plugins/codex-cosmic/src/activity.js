import {escapeHtml as esc} from './model.mjs';
export const finished = status => ['completed','failed','cancelled','conflict','interrupted'].includes(status);
export function elapsedTime(start,end){const seconds=Math.max(0,Math.floor(((end?Date.parse(end):Date.now())-Date.parse(start))/1000));return seconds<60?seconds+'s':Math.floor(seconds/60)+'m '+seconds%60+'s';}
export function createActivityView({onAsset,onActivity}){
  const $=s=>document.querySelector(s);let fingerprint='';
  return {render(state,doc){
    const job=state.jobs?.[0],events=state.activity||[],last=events.at(-1);
    const hostLatest=last&&!last.runId&&(!job||Date.parse(last.at)>Date.parse(job.updatedAt||job.createdAt));
    const hostRunning=hostLatest&&last.status==='running';
    const running=job?.status==='running'||hostRunning;
    const text=hostRunning?last.message:running?job.message:last?.message||'Ready for your next idea';
    const banner=$('#live-banner');banner.hidden=!running&&!events.length;
    $('#live-indicator').classList.toggle('running',!!running);
    $('#live-label').textContent=running?(hostRunning&&last.stage==='assets'?'Creating assets':'Design in progress'):last?.status==='failed'?'Needs attention':'Canvas up to date';
    $('#live-time').textContent=hostRunning?elapsedTime(last.at):job?elapsedTime(job.createdAt,job.finishedAt):'';
    $('#live-counts').textContent=doc.layers.length+' elements · '+doc.assets.length+' asset'+(doc.assets.length===1?'':'s');
    $('#live-details').onclick=onActivity;
    $('#activity-summary').textContent=hostLatest?last.message:job?.message||text;
    $('#activity-heading').textContent=running?'Creating your design':job?.status==='completed'?'Design ready':job&&finished(job.status)?'Run '+job.status:'Live activity';
    $('#activity-meta').textContent=job?[job.model,job.effort,elapsedTime(job.createdAt,job.finishedAt)].filter(Boolean).join(' · '):'Updates appear as work is saved';
    const key=events.map(e=>e.id).join('|')+doc.assets.map(a=>a.id).join('|');
    if(key===fingerprint)return;fingerprint=key;
    $('#activity-events').innerHTML=events.length?events.toReversed().map(e=>`<li class="activity-event ${esc(e.status)}"><span class="event-dot" aria-hidden="true"></span><div><span class="event-stage">${esc(e.stage)}</span><p>${esc(e.message)}</p><time>${new Date(e.at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</time></div></li>`).join(''):'<li class="activity-empty">Start a design to see its progress here. Imported artwork appears below as soon as it is ready.</li>';
    const assets=doc.assets.filter(a=>a.role==='asset').slice(-12);
    $('#live-assets').hidden=!assets.length;
    $('#live-assets-list').innerHTML=assets.map(a=>`<button class="live-asset" data-live-asset="${esc(a.id)}" title="Inspect ${esc(a.name)}"><img src="${a.data}" alt="${esc(a.name)}"><span>${esc(a.name)}</span><small>${doc.layers.some(l=>l.assetId===a.id)?'On canvas':'Ready to place'}</small></button>`).join('');
    document.querySelectorAll('[data-live-asset]').forEach(b=>b.onclick=()=>onAsset(b.dataset.liveAsset));
  }};
}
