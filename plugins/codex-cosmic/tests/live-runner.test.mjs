import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {setTimeout as delay} from 'node:timers/promises';
import {createRunner} from '../src/live-runner.mjs';
import {createRunStore,safeRunError} from '../src/run-store.mjs';
import {applyOperations} from '../src/model.mjs';
import {fromTemplate} from '../src/templates.mjs';
import {createActivityStore} from '../src/activity-store.mjs';
const args={prompt:'Create a readable editing interface',model:'gpt-6-astra',effort:'high'};
const op={type:'add-layer',layer:{id:'heading',boardId:'page-1',type:'text',name:'Heading',text:'CUT / STUDIO',x:20,y:20,width:400,height:50}};
const response=ops=>JSON.stringify({operations:ops.map(o=>JSON.stringify(o)),summary:'The editing interface is ready.'});
function setup({spawnError=false,timeoutMs=10000}={}){
 const dir=mkdtempSync(join(tmpdir(),'cosmic-run-test-'));let canvas=fromTemplate('blank'),sessionArgs,resolveDone,rejectDone,cancelled=false,saves=0;canvas.projectId='test-project';const progress=[];
 function sessionFactory(opts){if(spawnError)throw Error('spawn ENOENT');sessionArgs=opts;return {done:new Promise((resolve,reject)=>{resolveDone=resolve;rejectDone=reject;}),cancel(){cancelled=true;rejectDone(Error('Stopped'));}};}
 const options={dataPath:dir,read:()=>canvas,save:next=>{canvas={...next,revision:canvas.revision+1};saves++;},apply:applyOperations,summary:d=>d,sessionFactory,onProgress:(id,event)=>progress.push(event),timeoutMs,previewIntervalMs:1};
 const runner=createRunner(options);
 return {runner,dir,options,progress,get canvas(){return canvas;},get saves(){return saves;},get cancelled(){return cancelled;},change(){canvas.revision++;},emit(text){sessionArgs.onText(text);},complete(ops=[op]){resolveDone(response(ops));},fail(e){rejectDone(e);}};
}
test('completed operations appear in a separate live draft before final save',async()=>{
 const s=setup(),j=s.runner.start(args);assert.equal(createRunStore(s.dir).get(j.id).status,'running');
 const text=response([op]);s.emit(text.slice(0,text.indexOf(',"summary"')));await delay(10);
 assert.equal(s.runner.get(j.id).status,'running');assert.equal(s.runner.preview(j.id).layers[0].text,'CUT / STUDIO');assert.equal(s.canvas.layers.length,0);assert.equal(s.saves,0);
 s.complete();await delay(1);assert.equal(s.runner.get(j.id).status,'completed');assert.equal(s.canvas.layers[0].text,'CUT / STUDIO');assert.equal(s.saves,1);
 assert.equal(createRunner(s.options).get(j.id).status,'completed');assert.ok(s.progress.some(e=>e.stage==='canvas'));
});
test('duplicate submissions are rejected and a completed request can be followed by another',async()=>{const s=setup(),j=s.runner.start(args);assert.throws(()=>s.runner.start(args),/already in progress/);s.complete();await delay(1);assert.equal(s.runner.get(j.id).status,'completed');const next=s.runner.start(args);assert.equal(next.status,'running');s.runner.cancel(next.id);});
test('startup and asynchronous errors persist, release the run slot, and give actionable retry text',async()=>{const s=setup({spawnError:true}),j=s.runner.start(args);assert.equal(j.status,'failed');assert.match(j.message,/could not be found/);assert.equal(createRunStore(s.dir).get(j.id).status,'failed');assert.equal(s.runner.start(args).status,'failed');const a=setup(),r=a.runner.start(args);a.fail(Error('401 unauthorized'));await delay(1);assert.match(a.runner.get(r.id).message,/signed in/);});
test('cancel retains a reopenable draft and never applies a late result',async()=>{const s=setup(),j=s.runner.start(args);s.emit(response([op]));await delay(10);s.runner.cancel(j.id);s.complete();await delay(1);assert.equal(s.runner.get(j.id).status,'cancelled');assert.equal(s.saves,0);assert.equal(s.cancelled,true);assert.equal(createRunner(s.options).preview(j.id).layers.length,1);});
test('restart marks unfinished work interrupted and recovers completed partial elements',async()=>{const s=setup(),j=s.runner.start(args);s.emit(response([op]));await delay(10);s.runner.shutdown();const resumed=createRunner(s.options);assert.equal(resumed.get(j.id).status,'interrupted');assert.equal(resumed.preview(j.id).layers.length,1);const store=createRunStore(s.dir);store.put({id:'orphan',projectId:'test-project',createdAt:new Date().toISOString(),status:'running'});store.recover();assert.equal(store.get('orphan').status,'interrupted');assert.throws(()=>store.get('../../secret'),/Invalid/);});
test('concurrent canvas edits survive completion and the proposal remains recoverable',async()=>{const s=setup(),j=s.runner.start(args);s.change();s.complete();await delay(1);assert.equal(s.runner.get(j.id).status,'conflict');assert.equal(s.canvas.layers.length,0);assert.equal(s.saves,0);assert.equal(s.runner.preview(j.id).layers.length,1);assert.ok(existsSync(join(s.dir,'runs',j.id,'proposed-design.json')));});
test('timeouts stop the worker and cannot apply late output',async()=>{const s=setup({timeoutMs:10}),j=s.runner.start(args);await delay(30);s.complete();await delay(1);assert.equal(s.runner.get(j.id).status,'failed');assert.match(createRunStore(s.dir).get(j.id).message,/timed out/);assert.equal(s.cancelled,true);assert.equal(s.saves,0);});
test('invalid, empty, or review-mode visual changes fail without saving',async()=>{for(const [operations,review] of [[[],false],[[{...op,layer:{...op.layer,width:-1}}],false],[[op],true],[[{type:'run-shell'}],false]]){const s=setup(),j=s.runner.start({...args,review});s.complete(operations);await delay(1);assert.equal(s.runner.get(j.id).status,'failed');assert.equal(s.saves,0);}});
test('forward references wait for a valid prefix instead of corrupting the draft',async()=>{const s=setup(),j=s.runner.start(args);const heading={...op,layer:{...op.layer,boardId:'second'}};s.emit(response([heading]));await delay(10);assert.equal(s.runner.get(j.id).previewVersion,0);const board={type:'add-board',board:{id:'second',name:'Second',width:1000,height:800,fill:'#ffffff'}};s.emit(response([board,heading]));await delay(10);assert.equal(s.runner.preview(j.id).layers.length,1);s.runner.cancel(j.id);});
test('activity stores real asset events independently of run lifecycle',()=>{const dir=mkdtempSync(join(tmpdir(),'cosmic-activity-'));const a=createActivityStore(dir);a.add('project',{stage:'assets',message:'Coast still is ready.',assetId:'coast'});assert.equal(createActivityStore(dir).read('project')[0].assetId,'coast');assert.throws(()=>a.add('../escape',{message:'bad'}),/Invalid/);assert.throws(()=>a.add('project',{stage:'imaginary',message:'bad'}),/Invalid/);});
test('known errors expose actionable messages without tokens',()=>{assert.match(safeRunError('401 unauthorized'),/signed in/);assert.match(safeRunError('quota exceeded'),/allowance/);assert.ok(!safeRunError('failure sk-secrettoken').includes('sk-secrettoken'));});
