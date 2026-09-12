import test from 'node:test';
import assert from 'node:assert/strict';
import {createPrototypeRuntime} from '../src/prototype.mjs';
import {fromTemplate} from '../src/templates.mjs';
import {applyOperations,exportHtml} from '../src/model.mjs';

test('local filtering hides complete item layers, resets cleanly, and leaves the saved design unchanged',()=>{
 const previousDocument=globalThis.document;globalThis.document={createElement:()=>({dataset:{},style:{setProperty(){}},append(){},setAttribute(){}})};
 try{const r=createPrototypeRuntime(),query={id:'query',type:'input',value:''},item={id:'clip',type:'text',name:'Coast',text:'Coast arrival',filterSource:'query',filterText:'coast arrival'},parent={style:{}},d={projectId:'filter',boards:[],layers:[query,item]};r.beginFrame(d,true);r.mount(item,{parentElement:parent,append(){}});
  r.set('query',' COAST ');assert.equal(parent.style.visibility,'');r.set('query','horizon');assert.equal(parent.style.visibility,'hidden');r.reset();assert.equal(parent.style.visibility,'');assert.equal(query.value,'');
 }finally{globalThis.document=previousDocument;}
});

test('a text counter renders its own value and updates when a button increments it',()=>{
 const previousDocument=globalThis.document;
 globalThis.document={createElement:()=>({dataset:{},style:{setProperty(){}},append(){},setAttribute(){}})};
 try{const r=createPrototypeRuntime(),counter={id:'count',type:'text',name:'Count',text:'{{value}} folders',value:3,min:0,max:100,step:1};
  const d={projectId:'counter',boards:[],layers:[counter]};r.beginFrame(d,true);const mounted=r.mount(counter,{append(){}});assert.equal(mounted.textContent,'3 folders');
  r.activate({action:'increment',actionTarget:'count'});assert.equal(mounted.textContent,'4 folders');
  r.reset();assert.equal(mounted.textContent,'3 folders');r.beginFrame(d,false);assert.equal(r.mount(counter,{append(){}}).textContent,'3 folders');
 }finally{globalThis.document=previousDocument;}
});
test('preview state, connected values and actions do not mutate the design',()=>{
 const doc=fromTemplate('components'),original=JSON.stringify(doc),notices=[],r=createPrototypeRuntime({onNotice:m=>notices.push(m)});
 r.beginFrame(doc,true);assert.equal(r.read('intensity'),35);r.set('intensity',71);assert.equal(r.read('intensity-progress'),71);assert.equal(r.read('intensity-label'),71);
 r.activate(doc.layers.find(l=>l.id==='more'));assert.equal(r.read('intensity'),72);
 r.set('notifications',false);r.set('view-tabs','Settings');r.beginFrame(structuredClone(doc),true);assert.equal(r.read('notifications'),false);assert.equal(r.read('view-tabs'),'Settings');
 r.beginFrame(doc,false);assert.equal(r.read('intensity'),35);r.beginFrame(doc,true);assert.equal(r.read('intensity'),72);
 r.activate(doc.layers.find(l=>l.id==='reset-controls'));assert.equal(r.read('intensity'),35);assert.equal(r.read('notifications'),true);assert.equal(r.read('view-tabs'),'Overview');assert.equal(JSON.stringify(doc),original);
});
test('ranges clamp, configuration edits reset only affected state, and projects are isolated',()=>{
 const d=fromTemplate('components'),r=createPrototypeRuntime();r.beginFrame(d,true);r.set('intensity',1000);assert.equal(r.read('intensity'),100);r.set('intensity',-1);assert.equal(r.read('intensity'),0);r.set('view-tabs','Activity');
 const next=applyOperations(d,[{type:'patch-layer',id:'intensity',patch:{value:40,step:5}}]);r.beginFrame(next,true);assert.equal(r.read('intensity'),40);assert.equal(r.read('view-tabs'),'Activity');r.set('intensity',44);assert.equal(r.read('intensity'),45);
 assert.throws(()=>applyOperations(d,[{type:'patch-layer',id:'intensity',patch:{max:0}}]));r.beginFrame({...d,projectId:'another'},true);assert.equal(r.read('view-tabs'),'Overview');
});
test('navigation, disabled actions, missing targets, and cycles are safe',()=>{
 const d=fromTemplate('components'),nav=[],messages=[],r=createPrototypeRuntime({onNavigate:id=>nav.push(id),onNotice:m=>messages.push(m)});r.beginFrame(d,true);
 r.activate({action:'navigate',targetBoard:'page-1'});assert.deepEqual(nav,['page-1']);r.activate({action:'navigate',targetBoard:'missing'});assert.equal(nav.length,1);
 r.activate({action:'increment',actionTarget:'intensity',disabled:true});assert.equal(r.read('intensity'),35);
 r.activate({action:'toggle',actionTarget:'notifications'});assert.equal(r.read('notification-state'),false);
 const cycle=applyOperations(d,[{type:'patch-layer',id:'intensity-label',patch:{valueSource:'intensity-progress'}},{type:'patch-layer',id:'intensity-progress',patch:{valueSource:'intensity-label'}}]);r.beginFrame(cycle,true);assert.equal(r.read('intensity-label'),'');
 const removed=applyOperations(d,[{type:'delete-layer',id:'intensity'}]);assert.equal(removed.layers.find(l=>l.id==='more').actionTarget,'');assert.equal(removed.layers.find(l=>l.id==='intensity-progress').valueSource,'');
});
test('export executes the shared component renderer and safely serializes hostile content',()=>{
 const d=fromTemplate('components');d.layers.find(l=>l.id==='email').value='</script><script>alert(1)</script>';
 d.designSkills=[{id:'guide',name:'Private notes',content:'PRIVATE_GUIDANCE_SENTINEL',enabled:true}];d.brief='PRIVATE_BRIEF_SENTINEL';
 const html=exportHtml(d);assert.ok(html.includes('function createPrototypeRuntime'));assert.ok(!html.includes('<script>alert(1)'));assert.ok(html.includes('\\u003c/script\\u003e'));assert.ok(!html.includes('PRIVATE_GUIDANCE_SENTINEL'));assert.ok(!html.includes('PRIVATE_BRIEF_SENTINEL'));const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];assert.equal(scripts.length,1);assert.doesNotThrow(()=>new Function(scripts[0][1]));
});
