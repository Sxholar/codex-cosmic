import {existsSync,mkdirSync,readFileSync,writeFileSync,renameSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {validateDocument,designSkillsSchema} from './model.mjs';
import {templates,fromTemplate} from './templates.mjs';
export function createLibrary(root,{defaultDesignSkills=[]}={}){
 const defaults=designSkillsSchema.parse(defaultDesignSkills);
 const projects=join(root,'projects'),custom=join(root,'templates'),state=join(root,'library.json');mkdirSync(projects,{recursive:true});mkdirSync(custom,{recursive:true});
 const templatePrefs=join(root,'template-library.json');
 function hiddenTemplates(){return existsSync(templatePrefs)?JSON.parse(readFileSync(templatePrefs,'utf8')).deletedBuiltins||[]:[];}
 function templateMetadata(file){const t=JSON.parse(readFileSync(join(custom,file),'utf8'));return{id:t.id,name:t.name,description:'Your saved template',icon:t.document.kind==='scene'?'cube':'ui',custom:true,designSkills:designSkillsSchema.parse(t.document.designSkills||[])};}
 function atomic(file,data){const tmp=file+'.'+randomUUID()+'.tmp';writeFileSync(tmp,JSON.stringify(data));renameSync(tmp,file);}
 function validId(id){if(typeof id!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(id))throw Error('Invalid project ID');return id;}
 function config(){return JSON.parse(readFileSync(state,'utf8'));}
 function entry(id){return JSON.parse(readFileSync(join(projects,validId(id)+'.json'),'utf8'));}
 function put(e){atomic(join(projects,validId(e.document.projectId)+'.json'),e);return e.document;}
 function create({templateId='blank',name,brief='',document,designSkills,fresh=false}={}){
  let d=document?validateDocument(document):templateId.startsWith('custom-')?validateDocument(JSON.parse(readFileSync(join(custom,validId(templateId)+'.json'),'utf8')).document):fromTemplate(templateId,name,brief);
  if(fresh&&!document)d={...d,layers:[],assets:[],references:[],reviews:[],scene:{...d.scene,objects:[]}};
  d.designSkills=designSkills!==undefined?designSkillsSchema.parse(designSkills):!document&&!templateId.startsWith('custom-')?structuredClone(defaults):d.designSkills;
  d={...d,projectId:randomUUID(),revision:0,name:name?.trim()||d.name,brief:brief||d.brief};d=validateDocument(d);put({document:d,updatedAt:new Date().toISOString(),deleted:false});atomic(state,{activeId:d.projectId});return d;
 }
 if(!existsSync(state)){const old=join(root,'project.json');create({document:existsSync(old)?JSON.parse(readFileSync(old,'utf8')):fromTemplate('blank')});}
 function read(id=config().activeId){const e=entry(id);if(e.deleted)throw Error('This project is in Trash. Restore it first.');return validateDocument(e.document);}
 function save(doc,revision,id=doc.projectId||config().activeId){const e=entry(id);if(e.deleted)throw Error('This project was moved to Trash. Restore it first.');if(revision!==undefined&&revision!==e.document.revision){const err=Error('The project changed elsewhere. Reload before applying this edit.');err.status=409;throw err;}const next=validateDocument({...doc,projectId:id,revision:e.document.revision+1});return put({...e,document:next,updatedAt:new Date().toISOString()});}
 function list(){const deleted=hiddenTemplates(),files=readdirSync(custom);return {defaultDesignSkills:structuredClone(defaults),activeId:config().activeId,projects:readdirSync(projects).filter(f=>f.endsWith('.json')).map(f=>{const e=JSON.parse(readFileSync(join(projects,f),'utf8')),d=e.document;return{id:d.projectId,name:d.name,kind:d.kind||'canvas',updatedAt:e.updatedAt,deleted:e.deleted,boardCount:d.boards.length,layerCount:d.layers.length,objectCount:d.scene?.objects.length||0,preview:{board:d.boards[0],layers:d.layers.filter(l=>l.boardId===d.boards[0].id).slice(0,35).map(({text,fill,color,type,x,y,width,height,radius,fontSize,fontFamily})=>({text,fill,color,type,x,y,width,height,radius,fontSize,fontFamily}))}};}).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)),templates:[...templates.filter(t=>!deleted.includes(t.id)),...files.filter(f=>f.endsWith('.json')).map(templateMetadata)],deletedTemplates:[...templates.filter(t=>deleted.includes(t.id)),...files.filter(f=>f.endsWith('.json.deleted')).map(templateMetadata)]};}
 function open(id){const d=read(id);atomic(state,{activeId:id});return d;}
 function trash(id,deleted){const e=entry(id);put({...e,deleted,updatedAt:new Date().toISOString()});if(deleted&&config().activeId===id){const other=list().projects.find(p=>!p.deleted);if(other)atomic(state,{activeId:other.id});else create({name:'Untitled canvas'});}return list();}
 function rename(id,name){const e=entry(id);if(!name?.trim()||name.length>200)throw Error('Enter a project name under 200 characters');return put({...e,document:validateDocument({...e.document,name:name.trim(),revision:e.document.revision+1}),updatedAt:new Date().toISOString()});}
 function saveTemplate(id,name){const d=read(id);const tid='custom-'+randomUUID();if(!name?.trim()||name.length>200)throw Error('Enter a template name');atomic(join(custom,tid+'.json'),{id:tid,name:name.trim(),document:{...d,projectId:undefined,name:name.trim()}});return list();}
 function deleteTemplate(id){validId(id);if(templates.some(t=>t.id===id)){atomic(templatePrefs,{deletedBuiltins:[...new Set([...hiddenTemplates(),id])]});}else{const file=join(custom,id+'.json');if(!id.startsWith('custom-')||!existsSync(file))throw Error('Unknown template');renameSync(file,file+'.deleted');}return list();}
 function restoreTemplate(id){validId(id);if(templates.some(t=>t.id===id)){atomic(templatePrefs,{deletedBuiltins:hiddenTemplates().filter(v=>v!==id)});}else{const file=join(custom,id+'.json');if(!id.startsWith('custom-')||!existsSync(file+'.deleted')||existsSync(file))throw Error('No deleted template with that ID');renameSync(file+'.deleted',file);}return list();}
 return{read,save,create,list,open,trash,rename,saveTemplate,deleteTemplate,restoreTemplate};
}
