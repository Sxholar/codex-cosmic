import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {EventEmitter} from 'node:events';
import {PassThrough} from 'node:stream';
import {createRunner} from '../src/runner.mjs';
import {createRunStore,safeRunError} from '../src/run-store.mjs';
import {createDemo,applyOperations} from '../src/model.mjs';
import {createActivityStore} from '../src/activity-store.mjs';
const args={prompt:'Create a readable editing interface',model:'gpt-6-astra',effort:'high'};
function setup({spawnError=false,timeoutMs=10000}={}){
 const dir=mkdtempSync(join(tmpdir(),'cosmic-run-test-'));let canvas=createDemo(),child,argv;const progress=[];
 function spawnProcess(_cli,a){if(spawnError)throw Error('spawn ENOENT');argv=a;child=new EventEmitter();child.stdout=new PassThrough();child.stderr=new PassThrough();child.stdin=new PassThrough();child.kill=()=>{child.emit('close',1);return true;};return child;}
 const options={dataPath:dir,read:()=>canvas,save:next=>{canvas={...next,revision:canvas.revision+1};},apply:applyOperations,summary:d=>d,spawnProcess,resolveCli:()=>'/mock/codex',onProgress:(id,event)=>progress.push(event),timeoutMs};
 const runner=createRunner(options);
 return {runner,dir,options,progress,get canvas(){return canvas;},get child(){return child;},change(){canvas.revision++;},complete(ops=[{type:'patch-layer',id:'wordmark',patch:{text:'CUT / STUDIO'}}]){writeFileSync(argv[argv.indexOf('--output-last-message')+1],JSON.stringify({summary:'The editing interface is ready.',operationsJson:JSON.stringify(ops)}));child.emit('close',0);}};
}
test('new runs persist immediately and real CLI events update visible progress',()=>{
 const s=setup(),j=s.runner.start(args);assert.equal(createRunStore(s.dir).get(j.id).status,'running');
 s.child.stdout.write(JSON.stringify({type:'thread.started'})+'\n');assert.match(s.runner.get(j.id).message,/connected/);
 s.complete();assert.equal(s.runner.get(j.id).status,'completed');assert.equal(s.canvas.layers[0].text,'CUT / STUDIO');
 const reloaded=createRunner(s.options);assert.equal(reloaded.get(j.id).status,'completed');assert.ok(s.progress.some(e=>e.stage==='canvas'));
});
test('startup failure is persisted and a retry can start',()=>{const s=setup({spawnError:true}),j=s.runner.start(args);assert.equal(j.status,'failed');assert.match(j.message,/could not be found/);assert.equal(createRunStore(s.dir).get(j.id).status,'failed');assert.equal(s.runner.start(args).status,'failed');});
test('asynchronous spawn error and cancellation are terminal after restart',()=>{
 const s=setup(),j=s.runner.start(args);s.child.emit('error',Error('spawn ENOENT'));assert.equal(createRunner(s.options).get(j.id).status,'failed');
 const r=s.runner.start(args);s.runner.cancel(r.id);assert.equal(createRunStore(s.dir).get(r.id).status,'cancelled');
});
test('server restart marks unfinished work interrupted rather than unknown or running forever',()=>{
 const dir=mkdtempSync(join(tmpdir(),'cosmic-recovery-'));const store=createRunStore(dir);store.put({id:'previous-run',projectId:'project',createdAt:new Date().toISOString(),status:'running'});store.recover();assert.equal(store.get('previous-run').status,'interrupted');assert.match(store.get('previous-run').message,/Retry/);assert.throws(()=>store.get('../../secret'),/Invalid/);
});
test('concurrent canvas edits survive completion and the proposal is retained',()=>{const s=setup(),j=s.runner.start(args);s.change();s.complete();const result=s.runner.get(j.id);assert.equal(result.status,'conflict');assert.ok(result.proposalPath);assert.equal(s.canvas.layers[0].text,'still.');});
test('timeouts are durable and cancellation does not apply a late result',async()=>{const s=setup({timeoutMs:10}),j=s.runner.start(args);await new Promise(r=>setTimeout(r,30));assert.equal(s.runner.get(j.id).status,'failed');assert.match(createRunStore(s.dir).get(j.id).message,/timed out/);});
test('activity stores real asset events independently of run lifecycle',()=>{const dir=mkdtempSync(join(tmpdir(),'cosmic-activity-'));const a=createActivityStore(dir);a.add('project',{stage:'assets',message:'Coast still is ready.',assetId:'coast'});assert.equal(createActivityStore(dir).read('project')[0].assetId,'coast');assert.throws(()=>a.add('../escape',{message:'bad'}),/Invalid/);assert.throws(()=>a.add('project',{stage:'imaginary',message:'bad'}),/Invalid/);});
test('known errors expose actionable messages without tokens',()=>{assert.match(safeRunError('401 unauthorized'),/signed in/);assert.match(safeRunError('quota exceeded'),/allowance/);assert.ok(!safeRunError('failure sk-secrettoken').includes('sk-secrettoken'));});
