import { z } from 'zod';
import {createPrototypeRuntime,prototypeStyles} from './prototype.mjs';

const rawLayerSchema = z.object({
  id: z.string().min(1).max(100), boardId: z.string().min(1).max(100),
  type: z.enum(['text', 'shape', 'image', 'button','input','slider','toggle','select','checkbox','textarea','tabs','accordion','progress']), name: z.string().max(200),
  x: z.number().finite().min(-10000).max(10000), y: z.number().finite().min(-10000).max(10000),
  width: z.number().finite().min(1).max(10000), height: z.number().finite().min(1).max(10000),
  text: z.string().max(20000).default(''), fill: z.string().regex(/^(#[0-9a-fA-F]{6}|transparent)$/).default('#ffffff'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#182022'),
  fontSize: z.number().min(6).max(400).default(24), fontWeight: z.number().min(100).max(900).default(400),
  fontFamily: z.enum(['sans', 'serif', 'mono']).default('sans'), align: z.enum(['left','center','right']).default('left'),
  radius: z.number().min(0).max(1000).default(0), opacity: z.number().min(0).max(1).default(1),
  rotation: z.number().min(-360).max(360).default(0), assetId: z.string().max(100).optional(),
  fit: z.enum(['cover','contain']).default('cover'), locked: z.boolean().default(false), hidden: z.boolean().default(false),
  targetBoard: z.string().max(100).default(''), animation: z.enum(['none','fade','slide','scale']).default('none'), delay:z.number().min(0).max(9).default(0),duration:z.number().min(0.1).max(10).default(0.8),
  value:z.union([z.string().max(20000),z.number().finite().min(-1000000).max(1000000)]).default(''),min:z.number().finite().min(-1000000).max(1000000).default(0),max:z.number().finite().min(-1000000).max(1000000).default(100),step:z.number().finite().min(.000001).max(1000000).default(1),suffix:z.string().max(30).default(''),checked:z.boolean().default(false),disabled:z.boolean().default(false),required:z.boolean().default(false),inputType:z.enum(['text','email','number','password','search']).default('text'),
  valueSource:z.string().max(100).default(''),action:z.enum(['auto','none','navigate','toggle','increment','decrement','reset','submit','message']).default('auto'),actionTarget:z.string().max(100).default(''),actionMessage:z.string().max(1000).default(''),optionTargets:z.array(z.string().max(100)).max(40).default([]),hoverEffect:z.enum(['auto','none','lift','glow','zoom']).default('auto'),hoverColor:z.string().regex(/^(#[0-9a-fA-F]{6}|)$/).default(''),tooltip:z.string().max(300).default('')
}).strict().superRefine((l,ctx)=>{if(l.max<=l.min)ctx.addIssue({code:z.ZodIssueCode.custom,message:'Maximum must be greater than minimum',path:['max']});});
export const layerSchema=z.preprocess(input=>input&&typeof input==='object'&&input.type==='text'&&input.fill===undefined?{...input,fill:'transparent'}:input,rawLayerSchema);
export const boardSchema = z.object({id:z.string().min(1).max(100),name:z.string().min(1).max(100),width:z.number().min(100).max(4000),height:z.number().min(100).max(8000),fill:z.string().regex(/^#[0-9a-fA-F]{6}$/)}).strict();
export const assetSchema = z.object({id:z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/),name:z.string().max(200),data:z.string().max(22000000).regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/),width:z.number().min(1).max(20000),height:z.number().min(1).max(20000),role:z.enum(['asset','reference']),notes:z.string().max(4000).default('')}).strict();
const vector=z.tuple([z.number().finite().min(-1000).max(1000),z.number().finite().min(-1000).max(1000),z.number().finite().min(-1000).max(1000)]);
export const objectSchema=z.object({id:z.string().min(1).max(100),name:z.string().min(1).max(200),geometry:z.enum(['box','sphere','torus','cylinder','cone','plane']),position:vector.default([0,1,0]),rotation:vector.default([0,0,0]),scale:z.tuple([z.number().min(.01).max(100),z.number().min(.01).max(100),z.number().min(.01).max(100)]).default([1,1,1]),color:z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#9baefb'),metalness:z.number().min(0).max(1).default(.2),roughness:z.number().min(0).max(1).default(.35),visible:z.boolean().default(true)}).strict();
export const sceneSchema=z.object({background:z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#151820'),grid:z.boolean().default(true),objects:z.array(objectSchema).max(150).default([])}).strict();
export const designSkillsSchema=z.array(z.object({id:z.string().min(1).max(100),name:z.string().min(1).max(200),content:z.string().min(1).max(40000),enabled:z.boolean().default(true)}).strict()).max(12).refine(files=>files.reduce((sum,f)=>sum+f.content.length,0)<=60000,'Keep design skills under 60,000 characters total');
export const documentSchema = z.object({designSkills:designSkillsSchema.default([]),version:z.literal(1),projectId:z.string().regex(/^[a-zA-Z0-9_-]+$/).max(100).optional(),kind:z.enum(['canvas','scene']).default('canvas'),scene:sceneSchema.default({}),revision:z.number().int().min(0),name:z.string().min(1).max(200),brief:z.string().max(10000),boards:z.array(boardSchema).min(1).max(30),layers:z.array(layerSchema).max(600),assets:z.array(assetSchema).max(80),references:z.array(z.object({id:z.string().min(1).max(100),url:z.string().url().refine(v=>/^https?:\/\//.test(v)),notes:z.string().max(4000)})).max(60).default([]),reviews:z.array(z.object({id:z.string(),text:z.string().max(10000),layerId:z.string().optional(),createdAt:z.string()})).max(200)}).strict();
export function validateDocument(input) {
  const doc=documentSchema.parse(input);
  for(const key of ['boards','layers','assets']) if(new Set(doc[key].map(v=>v.id)).size!==doc[key].length) throw Error(`Duplicate ${key} IDs`);
  if(new Set(doc.scene.objects.map(o=>o.id)).size!==doc.scene.objects.length)throw Error('Duplicate object IDs');
  for(const l of doc.layers){if(!doc.boards.some(b=>b.id===l.boardId)) throw Error('Layer has unknown board');if(l.assetId&&!doc.assets.some(a=>a.id===l.assetId)) throw Error('Layer has unknown asset');}
  return doc;
}
export function createDemo() {
  const l=(id,type,x,y,width,height,extra={})=>layerSchema.parse({id,boardId:'desktop',type,name:id.replaceAll('-',' '),x,y,width,height,...(type==='text'?{fill:'transparent'}:{}),...extra});
  return validateDocument({version:1,revision:0,name:'A quieter kind of travel',brief:'An editorial travel website for Still. Quiet typography, generous space, forest green and warm white. Help visitors find thoughtful places to stay. This is a sample canvas; replace it with your own brief.',boards:[{id:'desktop',name:'Still / Desktop',width:1120,height:820,fill:'#f7f8f4'}],assets:[],reviews:[],layers:[
    l('wordmark','text',56,30,120,40,{text:'still.',fontSize:36,fontWeight:700,color:'#244c41',fontFamily:'serif'}),
    l('navigation','text',652,44,260,24,{text:'Places       Journal       About',fontSize:15,color:'#44534b'}),
    l('nav-button','button',953,33,112,40,{text:'Find a stay',fontSize:14,fill:'#244c41',color:'#ffffff',radius:24}),
    l('hero-title','text',56,154,555,166,{text:'Somewhere\nto slow down.',fontSize:74,fontFamily:'serif',color:'#244c41'}),
    l('hero-description','text',60,345,370,70,{text:'Thoughtful places. Unhurried days.\nFind a little room to just be.',fontSize:19,color:'#5a675d'}),
    l('hero-button','button',60,446,190,49,{text:'Explore places',fontSize:15,fill:'#244c41',color:'#ffffff',radius:26}),
    l('image-frame','shape',651,124,414,436,{fill:'#dce6da',radius:180}),
    l('sun','shape',790,168,110,110,{fill:'#f6ce85',radius:80}),
    l('hill-back','shape',673,316,365,184,{fill:'#8eaa91',radius:120,rotation:-14}),
    l('hill-front','shape',697,391,337,160,{fill:'#386954',radius:100,rotation:8}),
    l('intro-heading','text',60,622,450,40,{text:'Find your own pace.',fontSize:34,fontFamily:'serif',color:'#244c41'}),
    l('intro-copy','text',60,680,490,49,{text:'Cabins, coastlines, and corners of the world\nthat feel a little closer to yourself.',fontSize:17,color:'#5a675d'}),
    l('footer-note','text',846,733,210,24,{text:'Thoughtfully chosen stays',fontSize:13,color:'#5a675d'})
  ]});
}
export function applyOperations(input,ops) {
  let doc=structuredClone(input);
  if(!Array.isArray(ops)||ops.length>650) throw Error('Expected up to 650 operations');
  for(const op of ops){
    switch(op.type){
      case 'patch-layer': {const i=doc.layers.findIndex(l=>l.id===op.id);if(i<0) throw Error('Unknown layer');doc.layers[i]=layerSchema.parse({...doc.layers[i],...op.patch,id:op.id});break;}
      case 'add-layer': {const layer=layerSchema.parse(op.layer);if(doc.layers.some(l=>l.id===layer.id))throw Error('Layer ID exists');doc.layers.push(layer);break;}
      case 'delete-layer': doc.layers=doc.layers.filter(l=>l.id!==op.id).map(l=>({...l,valueSource:l.valueSource===op.id?'':l.valueSource,actionTarget:l.actionTarget===op.id?'':l.actionTarget}));break;
      case 'reorder': {const i=doc.layers.findIndex(l=>l.id===op.id);if(i<0)throw Error('Unknown layer');const [layer]=doc.layers.splice(i,1);doc.layers.splice(Math.max(0,Math.min(doc.layers.length,Number(op.index)||0)),0,layer);break;}
      case 'patch-board': {const i=doc.boards.findIndex(b=>b.id===op.id);if(i<0)throw Error('Unknown board');doc.boards[i]=boardSchema.parse({...doc.boards[i],...op.patch,id:op.id});break;}
      case 'add-board': doc.boards.push(boardSchema.parse(op.board));break;
      case 'delete-board': if(doc.boards.length<=1)throw Error('Keep at least one page');doc.boards=doc.boards.filter(b=>b.id!==op.id);doc.layers=doc.layers.filter(l=>l.boardId!==op.id).map(l=>({...l,targetBoard:l.targetBoard===op.id?'':l.targetBoard,optionTargets:l.optionTargets.map(id=>id===op.id?'':id)}));break;
      case 'add-object': doc.scene.objects.push(objectSchema.parse(op.object));break;
      case 'patch-object': {const i=doc.scene.objects.findIndex(o=>o.id===op.id);if(i<0)throw Error('Unknown object');doc.scene.objects[i]=objectSchema.parse({...doc.scene.objects[i],...op.patch,id:op.id});break;}
      case 'delete-object': doc.scene.objects=doc.scene.objects.filter(o=>o.id!==op.id);break;
      case 'patch-scene': doc.scene=sceneSchema.parse({...doc.scene,...op.patch,objects:doc.scene.objects});break;
      case 'delete-asset': doc.assets=doc.assets.filter(a=>a.id!==op.id);doc.layers=doc.layers.map(l=>l.assetId===op.id?{...l,assetId:undefined}:l);break;
      case 'patch-project': {if(op.name!==undefined)doc.name=op.name;if(op.brief!==undefined)doc.brief=op.brief;if(op.designSkills!==undefined)doc.designSkills=op.designSkills;break;}
      case 'add-asset': doc.assets.push(assetSchema.parse(op.asset));break;
      case 'patch-asset': {const i=doc.assets.findIndex(a=>a.id===op.id);if(i<0)throw Error('Unknown asset');doc.assets[i]=assetSchema.parse({...doc.assets[i],...op.patch,id:op.id});break;}
      case 'add-review': doc.reviews.push({id:crypto.randomUUID(),createdAt:new Date().toISOString(),text:op.text,...(op.layerId?{layerId:op.layerId}:{})});break;
      case 'add-reference': doc.references.push({id:crypto.randomUUID(),url:op.url,notes:op.notes||''});break;
      case 'delete-reference': doc.references=doc.references.filter(r=>r.id!==op.id);break;
      default: throw Error(`Unknown operation: ${op.type}`);
    }
  }
  return validateDocument(doc);
}
export const fonts={sans:'Arial, Helvetica, sans-serif',serif:'Georgia, serif',mono:'Consolas, monospace'};
export function layerStyle(l){return {position:'absolute',left:`${l.x}px`,top:`${l.y}px`,width:`${l.width}px`,height:`${l.height}px`,background:l.fill,color:l.color,fontSize:`${l.fontSize}px`,fontWeight:String(l.fontWeight),fontFamily:fonts[l.fontFamily],textAlign:l.align,borderRadius:`${l.radius}px`,opacity:String(l.opacity),transform:`rotate(${l.rotation}deg)`,display:l.hidden?'none':l.type==='button'?'flex':'block',alignItems:'center',justifyContent:'center',whiteSpace:'pre-wrap',lineHeight:l.type==='text'?'1.12':'1.3',overflow:'hidden',boxSizing:'border-box'}};
export function escapeHtml(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');}
export function exportHtml(input){
 const doc=validateDocument(input),e=escapeHtml;
 const boards=doc.boards.map((b,i)=>`<section class="export-board" id="board-${e(b.id)}" ${i?'hidden':''} aria-label="${e(b.name)}" style="position:relative;width:${b.width}px;height:${b.height}px;background:${b.fill};overflow:hidden;margin:0 auto">${doc.layers.filter(l=>l.boardId===b.id&&!l.hidden).map(l=>{const style=Object.entries(layerStyle(l)).map(([k,v])=>`${k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}:${v}`).join(';');return `<div data-layer="${e(l.id)}" style="${e(style)};overflow:visible"><div class="layer-content">${l.type==='slider'?`<input type="range" aria-label="${e(l.name)}" min="${l.min}" max="${l.max}" step="${l.step}" value="${e(l.value)}">`:e(l.text)}</div></div>`;}).join('')}</section>`).join('\n');
 const runtimeDoc={name:doc.name,projectId:doc.projectId,boards:doc.boards,layers:doc.layers,assets:doc.assets.filter(a=>doc.layers.some(l=>!l.hidden&&l.assetId===a.id)).map(({id,name,data})=>({id,name,data}))};
 const json=JSON.stringify(runtimeDoc).replace(/[<>&\u2028\u2029]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0'));
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${e(doc.name)}</title><style>[hidden]{display:none!important}body{margin:0;background:#edf0ed}nav{display:flex;align-items:center;gap:8px;padding:12px;font:13px Arial}nav button{padding:8px 12px;border:1px solid #0002;background:#fff;border-radius:8px;cursor:pointer}nav button[aria-current=page]{background:#dcdedb}nav #reset-prototype{margin-left:auto}.layer-content{width:100%;height:100%;border-radius:inherit}.proto-image{overflow:hidden}@keyframes cosmic-fade{from{opacity:0}}@keyframes cosmic-slide{from{opacity:0;translate:0 36px}}@keyframes cosmic-scale{from{opacity:0;scale:.8}}@media(prefers-reduced-motion:reduce){[data-layer]{animation:none!important}}${prototypeStyles}</style></head><body><nav aria-label="Prototype pages">${doc.boards.map(b=>`<button data-target="board-${e(b.id)}">${e(b.name)}</button>`).join('')}<button id="reset-prototype">Reset preview</button></nav>${boards}<script>
const design=${json};
function navigate(id){document.querySelectorAll('.export-board').forEach(b=>b.hidden=b.id!=='board-'+id);document.querySelectorAll('nav [data-target]').forEach(b=>b.setAttribute('aria-current',b.dataset.target==='board-'+id?'page':'false'));}
const runtime=(${createPrototypeRuntime.toString()})({onNavigate:navigate});runtime.beginFrame(design,true);
for(const el of document.querySelectorAll('[data-layer]')){const l=design.layers.find(l=>l.id===el.dataset.layer);const c=el.firstElementChild;c.replaceChildren();runtime.mount(l,c,design.assets.find(a=>a.id===l.assetId));if(l.animation!=='none')el.style.animation='cosmic-'+l.animation+' '+l.duration+'s ease '+l.delay+'s both';}
document.querySelectorAll('nav [data-target]').forEach(b=>b.onclick=()=>navigate(b.dataset.target.slice(6)));document.getElementById('reset-prototype').onclick=()=>runtime.reset();navigate(design.boards[0].id);
</script></body></html>`;
}
