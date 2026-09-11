import {spawn} from 'node:child_process';
import {cosmicDataPath} from './src/runtime-paths.mjs';
import {createActivityStore} from './src/activity-store.mjs';
import {loadDefaultDesignSkills} from './src/default-skills.mjs';
import { createServer } from 'node:http';
import { readFileSync,writeFileSync,mkdirSync,renameSync,existsSync } from 'node:fs';
import { dirname,resolve,join,extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { createDemo,validateDocument,applyOperations,layerSchema,exportHtml,designSkillsSchema } from './src/model.mjs';
import { createLibrary } from './src/library.mjs';
import { createRunner } from './src/runner.mjs';
import sharp from 'sharp';
import {prepareAsset,prepareAssetSchema} from './src/asset-prep.mjs';

const ROOT=dirname(fileURLToPath(import.meta.url));
const DATA=cosmicDataPath(ROOT);
const HTTP_MODE=process.argv.includes('--http');
const RUNTIME_VERSION='0.2.0-live';
const PORT=Number(process.env.CODEX_COSMIC_PORT||47831);
const URL_BASE=`http://127.0.0.1:${PORT}`;
mkdirSync(DATA,{recursive:true});mkdirSync(join(DATA,'images'),{recursive:true});
const library=createLibrary(DATA,{defaultDesignSkills:loadDefaultDesignSkills()});
const activity=createActivityStore(DATA);
const read=(id)=>library.read(id),save=(doc,rev,id)=>library.save(doc,rev,id);
function summary(doc){return {...doc,assets:doc.assets.map(({data,...a})=>({...a,...(data?{localPath:join(DATA,'images',a.id+({ 'image/png':'.png','image/jpeg':'.jpg','image/webp':'.webp'}[data.slice(5,data.indexOf(';'))]))}:{})}))};}
function imageType(buf){if(buf.length>12&&buf.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return 'image/png';if(buf[0]===255&&buf[1]===216&&buf[2]===255)return'image/jpeg';if(buf.toString('ascii',0,4)==='RIFF'&&buf.toString('ascii',8,12)==='WEBP')return'image/webp';throw Error('Use a PNG, JPEG, or WebP image.');}
function storeImage(asset){const buf=Buffer.from(asset.data.split(',')[1],'base64');if(buf.length>15*1024*1024)throw Error('Images must be under 15 MB.');const mime=imageType(buf);if(!asset.data.startsWith('data:'+mime+';base64,'))throw Error('Image type does not match data.');const ext={'image/png':'.png','image/jpeg':'.jpg','image/webp':'.webp'}[mime];writeFileSync(join(DATA,'images',asset.id+ext),buf);}
async function dispatch(name,args={}){
  const current=read(args.projectId);
  switch(name){
    case 'list_projects': return library.list();
    case 'create_project': {const document=library.create(args);for(const a of document.assets)storeImage(a);return {document};}
    case 'open_project': return {document:library.open(args.id)};
    case 'rename_project': return {document:library.rename(args.id,args.name)};
    case 'trash_project': return library.trash(args.id,args.deleted!==false);
    case 'save_template': return library.saveTemplate(args.id,args.name);
    case 'delete_template': return args.restore?library.restoreTemplate(args.id):library.deleteTemplate(args.id);

    case 'get_studio_status': return {projectId:current.projectId,revision:current.revision,runtimeVersion:RUNTIME_VERSION,jobs:runner.list(current.projectId),activity:activity.read(current.projectId),assets:summary(current).assets.map(({localPath,...a})=>a)};
    case 'report_design_progress': return {event:activity.add(current.projectId,args)};
    case 'open_studio': return {document:summary(current),url:URL_BASE,dataPath:DATA};
    case 'read_design': return {document:args.includeImages?current:summary(current),url:URL_BASE,dataPath:DATA};
    case 'apply_design_operations': {const next=applyOperations(current,args.operations);for(const a of next.assets.filter(a=>!current.assets.some(x=>x.id===a.id)))storeImage(a);const saved=save(next,args.baseRevision,current.projectId);recordChanges(current,saved);return {document:saved};}
    case 'replace_design': {const next=validateDocument(args.document);for(const a of next.assets)storeImage(a);return{document:save(next,args.baseRevision,current.projectId)};}
    case 'upsert_layers': {const ops=args.layers.map(l=>({type:current.layers.some(x=>x.id===l.id)?'patch-layer':'add-layer',id:l.id,patch:l,layer:l}));const saved=save(applyOperations(current,ops),args.baseRevision,current.projectId);recordChanges(current,saved);return{document:summary(saved)};}
    case 'import_image_asset': {const buf=readFileSync(args.path);if(buf.length>15*1024*1024)throw Error('Images must be under 15 MB.');const mime=imageType(buf);const meta=await sharp(buf,{limitInputPixels:32e6}).metadata();const asset={id:randomUUID(),name:args.name||'Generated image',data:`data:${mime};base64,${buf.toString('base64')}`,width:meta.width,height:meta.height,role:args.role||'asset',notes:args.notes||''};const next=applyOperations(current,[{type:'add-asset',asset}]);storeImage(asset);const saved=save(next,args.baseRevision,current.projectId);recordChanges(current,saved);return{asset:{...asset,data:undefined,localPath:args.path},document:summary(saved)};}
    case 'prepare_image_assets': {const input=prepareAssetSchema.parse(args);if(input.baseRevision!==current.revision)throw Error('The canvas changed. Read the current revision before preparing assets.');const source=current.assets.find(a=>a.id===input.assetId);if(!source)throw Error('Unknown source asset');const assets=(await prepareAsset(source,input)).map(a=>({...a,id:randomUUID()}));const next=applyOperations(current,assets.map(asset=>({type:'add-asset',asset})));const saved=save(next,input.baseRevision,current.projectId);assets.forEach(storeImage);recordChanges(current,saved);return{assets:assets.map(({data,...a})=>a),document:summary(saved)};}
    case 'read_asset': {const a=current.assets.find(a=>a.id===args.assetId);if(!a)throw Error('Unknown asset');return{asset:a};}
    case 'export_design': return{html:exportHtml(current),document:current};
    case 'start_design_run': return{job:runner.start(args)};
    case 'get_design_run': return{job:runner.get(args.id)};
    case 'cancel_design_run': return{job:runner.cancel(args.id)};
    default: throw Error('Unknown tool');
  }
}
function recordChanges(before,after){
  for(const asset of after.assets.filter(a=>!before.assets.some(b=>b.id===a.id)))activity.add(after.projectId,{stage:'assets',message:asset.name+' is ready.',assetId:asset.id,assetName:asset.name});
  const images=after.layers.filter(l=>l.type==='image'&&!before.layers.some(b=>b.id===l.id&&b.assetId===l.assetId));
  if(images.length)activity.add(after.projectId,{stage:'canvas',message:images.length+' image'+(images.length===1?'':'s')+' placed on the canvas.'});
  const added=after.layers.length-before.layers.length;if(added>0)activity.add(after.projectId,{stage:'canvas',message:added+' editable element'+(added===1?'':'s')+' added.'});
}
let runner=null;
function initializeRunner(){runner=createRunner({dataPath:DATA,read,save:(next,rev,id)=>{const before=read(id);const result=save(next,rev,id);recordChanges(before,result);return result;},apply:applyOperations,summary,onProgress:(id,event)=>activity.add(id,event)});}
function send(res,status,data,type='application/json'){res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(type==='application/json'?JSON.stringify(data):data);}
const http=createServer(async(req,res)=>{
  try{
    if(![`127.0.0.1:${PORT}`,`localhost:${PORT}`].includes(req.headers.host))return send(res,403,{error:'Invalid host'});
    if(req.headers.origin&&![URL_BASE,`http://localhost:${PORT}`].includes(req.headers.origin))return send(res,403,{error:'Invalid origin'});
    const url=new URL(req.url,URL_BASE);
    if(req.method==='GET'&&url.pathname==='/health')return send(res,200,{app:'codex-cosmic',dataPath:DATA,runtimeVersion:RUNTIME_VERSION,pid:process.pid});
    if(req.method==='GET'&&url.pathname==='/')return send(res,200,readFileSync(join(ROOT,'dist/index.html'),'utf8'),'text/html; charset=utf-8');
    if(req.method==='POST'&&url.pathname==='/api/tool'){
      if(!req.headers['content-type']?.startsWith('application/json'))return send(res,415,{error:'JSON required'});
      let size=0,body=[];for await(const chunk of req){size+=chunk.length;if(size>40*1024*1024){send(res,413,{error:'Project too large'});return;}body.push(chunk);}
      const {name,arguments:args}=JSON.parse(Buffer.concat(body).toString());return send(res,200,await dispatch(name,args));
    }
    if(req.method==='GET'&&url.pathname==='/prototype')return send(res,200,exportHtml(read(url.searchParams.get('projectId')||undefined)),'text/html; charset=utf-8');
    if(req.method==='GET'&&url.pathname==='/favicon.ico')return send(res,204,'','image/x-icon');
    return send(res,404,{error:'Not found'});
  }catch(e){send(res,e.status||400,{error:e.message,code:e.code});}
});
async function startHttp(){return new Promise((resolveStart,reject)=>{http.once('error',async e=>{if(e.code!=='EADDRINUSE')return reject(e);try{const info=await(await fetch(URL_BASE+'/health')).json();if(info.app!=='codex-cosmic'||resolve(info.dataPath)!==DATA)throw Error(`Port ${PORT} belongs to a different service.`);resolveStart(false);}catch(e){reject(e);}});http.listen(PORT,'127.0.0.1',()=>{try{initializeRunner();resolveStart(true);}catch(e){http.close();reject(e);}});});}
async function ensureDaemon(){
 const health=async()=>{try{const r=await fetch(URL_BASE+'/health',{signal:AbortSignal.timeout(1200)});const info=await r.json();if(info.app!=='codex-cosmic'||resolve(info.dataPath)!==DATA)throw Error('This port belongs to a different studio. Close it or set CODEX_COSMIC_PORT.');return info;}catch(e){if(e.message.includes('different studio'))throw e;return null;}};
 if(await health())return;
 const child=spawn(process.execPath,[fileURLToPath(import.meta.url),'--http'],{cwd:ROOT,env:process.env,detached:true,windowsHide:true,stdio:'ignore'});let launchError;child.on('error',e=>{launchError=e;});child.unref();
 for(let i=0;i<50;i++){if(launchError)throw launchError;if(await health())return;await new Promise(r=>setTimeout(r,100));}
 throw Error('The studio could not start. Run npm start from the Cosmic folder to see the startup error.');
}
if(HTTP_MODE)await startHttp();else await ensureDaemon();
if(HTTP_MODE){console.log(`Codex Cosmic ready at ${URL_BASE}`);}else{
 const server=new McpServer({name:'codex-cosmic',version:'0.1.0'});
 const uri='ui://codex-cosmic/studio.html';
 server.registerResource('studio',uri,{},async()=>({contents:[{uri,mimeType:'text/html;profile=mcp-app',text:readFileSync(join(ROOT,'dist/index.html'),'utf8'),_meta:{ui:{prefersBorder:false,csp:{connectDomains:[],resourceDomains:[]}}}}]}));
 const forward=async(name,args)=>{const r=await fetch(URL_BASE+'/api/tool',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,arguments:args})});const result=await r.json();if(!r.ok)throw Error(result.error);return result;};
 const tool=(name,description,schema,readOnly=false,render=false)=>server.registerTool(name,{description,inputSchema:{...schema,projectId:z.string().optional()},annotations:{readOnlyHint:readOnly,destructiveHint:false,openWorldHint:false},...(render?{_meta:{ui:{resourceUri:uri},'openai/outputTemplate':uri}}:{})},async args=>{try{const result=await forward(name,args);if(name==='read_asset'){const a=result.asset;return{content:[{type:'image',data:a.data.split(',')[1],mimeType:a.data.slice(5,a.data.indexOf(';'))},{type:'text',text:JSON.stringify({id:a.id,name:a.name,notes:a.notes})}]};}return{structuredContent:result,content:[{type:'text',text:name==='open_studio'?`Design studio is ready at ${URL_BASE}. The editor shares its saved canvas with these tools.`:JSON.stringify({...result,...(result.document?{document:summary(result.document)}:{})})}]};}catch(e){return{isError:true,content:[{type:'text',text:e.message}]};}});
 tool('list_projects','List saved local projects, Trash, and built-in or custom templates.',{},true);
 tool('create_project','Create a saved canvas or Three.js scene from a template. Existing projects remain saved.',{templateId:z.string().optional(),name:z.string().optional(),brief:z.string().optional(),document:z.record(z.unknown()).optional(),designSkills:designSkillsSchema.optional()});
 tool('open_project','Open an existing project by ID.',{id:z.string()});
 tool('rename_project','Rename an existing project.',{id:z.string(),name:z.string()});
 tool('trash_project','Move a project into recoverable Trash, or restore it with deleted:false.',{id:z.string(),deleted:z.boolean().optional()});
 tool('save_template','Save a project as a reusable custom template.',{id:z.string(),name:z.string()});
 tool('delete_template','Delete a built-in or custom template from the library, or restore a deleted one with restore:true. Projects made from it are preserved.',{id:z.string(),restore:z.boolean().optional()});
 tool('open_studio','Open the interactive Codex Cosmic canvas. Use for launch requests. If this host does not render the UI, open the returned local URL in the Codex browser panel.',{},true,true);
 tool('get_studio_status','Read durable run status, live asset activity and the saved canvas revision.',{},true);
 tool('report_design_progress','Report actual design or image-generation progress to the shared studio. Use only for work you are performing; never invent progress.',{message:z.string().min(1).max(2000),stage:z.enum(['starting','design','assets','canvas','review','complete','error']),status:z.enum(['running','completed','failed','waiting']).optional(),assetName:z.string().optional(),assetId:z.string().optional()});
 tool('read_design','Read the current boards, layers, brief, review notes, image metadata and local image paths. Read before editing; preserve the user’s edits.',{includeImages:z.boolean().optional()},true);
 tool('apply_design_operations','Apply a batch of canvas operations. Types: add-layer {layer}, patch-layer {id,patch}, delete-layer {id}, reorder {id,index}, add-board {board}, patch-board {id,patch}, patch-project {name?,brief?}, add-asset {asset}, patch-asset {id,patch}, add-review {text,layerId?}, add-reference {url,notes}, delete-reference {id}, delete-board {id}, delete-asset {id}, add-object {object}, patch-object {id,patch}, delete-object {id}, patch-scene {patch}. Object geometry: box/sphere/torus/cylinder/cone/plane; position/rotation(degrees)/scale are three-number arrays; color,metalness,roughness,visible. Edits immediately update the shared canvas.',{operations:z.array(z.record(z.unknown())).max(650),baseRevision:z.number().int().optional()});
 tool('replace_design','Replace a canvas with an explicitly imported or newly created design. Read the current revision first. Preserve existing work unless replacement was requested.',{document:z.record(z.unknown()),baseRevision:z.number().int()});
 tool('upsert_layers','Create or update native editable layers. Coordinates are relative to the board. Supported types: text, button, shape, image. Use existing asset IDs for image layers.',{layers:z.array(layerSchema).max(600),baseRevision:z.number().int().optional()});
 tool('import_image_asset','Import an existing local PNG, JPEG or WebP into the asset library. Generate images with the host image generation tool first, then pass its saved file path. This tool does not generate images.',{path:z.string(),name:z.string().optional(),width:z.number().optional(),height:z.number().optional(),role:z.enum(['asset','reference']).optional(),notes:z.string().optional(),baseRevision:z.number().int().optional()});
 tool('read_asset','View an image or reference from the studio by asset ID.',{assetId:z.string()},true);
 tool('prepare_image_assets','Non-destructively crop an inspected image or UI sheet into named PNG assets. Optional flat-color border background removal preserves enclosed details and alpha. Use host image editing for complex subject cutouts. Crops use source pixels. Originals remain saved; place returned IDs with native image layers.',prepareAssetSchema.shape);
 tool('export_design','Return the editable project JSON and a self-contained HTML visual prototype. Exported layout uses board pixel dimensions.',{},true);
 tool('start_design_run','Start a local Codex design generation or review run using the selected model and reasoning effort. Uses the signed-in Codex account and its usage. Only start when the user requests generation. This does not change the model of the host conversation.',{prompt:z.string().max(10000),model:z.string(),effort:z.string(),selectedIds:z.array(z.string()).optional(),boardId:z.string().optional(),review:z.boolean().optional()});
 tool('get_design_run','Read a design run status.',{id:z.string()},true);
 tool('cancel_design_run','Stop a running design request.',{id:z.string()});
 await server.connect(new StdioServerTransport());
 process.stdin.on('end',()=>{http.close();process.exit(0);});
}
