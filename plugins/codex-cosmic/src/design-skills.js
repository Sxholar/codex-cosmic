import {escapeHtml as esc,designSkillsSchema} from './model.mjs';
export async function readSkillFiles(incoming,current=[]){
 const next=structuredClone(current);
 for(const file of incoming){
  if(!/\.(md|txt)$/i.test(file.name))throw Error('Choose SKILL.md, Markdown (.md), or text (.txt) files.');
  if(file.size>80000)throw Error(`${file.name} is too large. Use a file under 80 KB.`);
  const content=(await file.text()).replace(/^\uFEFF/,'').trim();if(!content||content.includes('\0'))throw Error(`${file.name} must contain readable text.`);
  const previous=next.findIndex(s=>s.name===file.name),skill={id:previous>=0?next[previous].id:crypto.randomUUID(),name:file.name,content,enabled:true};
  if(previous>=0)next[previous]=skill;else next.push(skill);
 }
 return designSkillsSchema.parse(next);
}
export function openSkills({getSkills,setSkills,dialog,toast}){
 dialog('UI / UX design skills','<div id="design-skills-manager"></div>');
 const $=s=>document.querySelector(s);
 function render(){const skills=getSkills();$('#design-skills-manager').innerHTML=`<p>Attach design guidance for this project. Active files are included in each design run.</p><button id="skill-drop" class="skill-drop">Drop skill files here<span>SKILL.md · .md · .txt</span><small>or click to browse · up to 12 files / 60,000 characters total</small></button><input id="skill-file-input" type="file" accept=".md,.txt,text/markdown,text/plain" multiple hidden><div class="skill-file-list">${skills.map(s=>`<article class="skill-file"><div><label><input type="checkbox" data-skill-enabled="${esc(s.id)}" ${s.enabled?'checked':''}> <strong>${esc(s.name)}</strong></label><small>${s.content.length.toLocaleString()} characters · ${s.enabled?'Active':'Paused'}</small></div><button data-skill-view="${esc(s.id)}">Review</button><button data-skill-remove="${esc(s.id)}" aria-label="Remove ${esc(s.name)}">×</button><pre id="skill-content-${esc(s.id)}" hidden>${esc(s.content)}</pre></article>`).join('')||'<p class="muted">Add typography, spacing, accessibility, motion, or component guidance.</p>'}</div><p class="muted">Files are saved with your project as design guidance. Adding a file here does not install a global Codex skill or run its scripts.</p>`;
  const drop=$('#skill-drop');drop.onclick=()=>$('#skill-file-input').click();drop.ondragover=e=>{e.preventDefault();drop.classList.add('over');};drop.ondragleave=()=>drop.classList.remove('over');drop.ondrop=async e=>{e.preventDefault();drop.classList.remove('over');await attach(e.dataTransfer.files);};$('#skill-file-input').onchange=async e=>attach(e.target.files);
  document.querySelectorAll('[data-skill-enabled]').forEach(el=>el.onchange=async()=>{await setSkills(getSkills().map(s=>s.id===el.dataset.skillEnabled?{...s,enabled:el.checked}:s));render();});
  document.querySelectorAll('[data-skill-remove]').forEach(el=>el.onclick=async()=>{await setSkills(getSkills().filter(s=>s.id!==el.dataset.skillRemove));render();});
  document.querySelectorAll('[data-skill-view]').forEach(el=>el.onclick=()=>{const pre=document.getElementById('skill-content-'+el.dataset.skillView);pre.hidden=!pre.hidden;el.textContent=pre.hidden?'Review':'Hide';});
 }
 async function attach(files){try{await setSkills(await readSkillFiles(files,getSkills()));render();toast('Design skills attached.');}catch(e){toast(e.issues?'Use up to 12 text files, 40,000 characters each and 60,000 total.':e.message);}}
 render();
}
