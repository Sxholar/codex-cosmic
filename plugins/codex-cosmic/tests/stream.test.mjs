import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {operationStrings} from '../src/design-stream.mjs';
import {createLibrary} from '../src/library.mjs';
test('every streaming cut yields only complete JSON operations, including escapes and Unicode',()=>{
 const ops=[JSON.stringify({type:'patch-project',name:'Quotes " and slash \\ and newline\n\u2605'}),JSON.stringify({type:'add-review',text:'Astral 🪐 and punctuation ],"operations":['})];
 const text=JSON.stringify({operations:ops,summary:'Done'});
 for(let i=0;i<=text.length;i++){const parsed=operationStrings(text.slice(0,i));assert.deepEqual(parsed,ops.slice(0,parsed.length));for(const op of parsed)assert.ok(JSON.parse(op).type);}
 assert.deepEqual(operationStrings(text),ops);assert.deepEqual(operationStrings(JSON.stringify({summary:'Done',operations:ops})),ops);
});
test('fresh requests start empty, while opened projects and templates keep their designs',()=>{
 const dir=mkdtempSync(join(tmpdir(),'cosmic-fresh-')),lib=createLibrary(dir);assert.equal(lib.read().layers.length,0);
 const original=lib.create({templateId:'mobile'});assert.ok(original.layers.length>0);const next=lib.create({templateId:'mobile',fresh:true,brief:'A different design'});
 assert.equal(next.layers.length,0);assert.equal(next.assets.length,0);assert.equal(next.boards[0].width,original.boards[0].width);assert.notEqual(next.projectId,original.projectId);assert.deepEqual(lib.open(original.projectId).layers,original.layers);
 assert.equal(createLibrary(dir).read(original.projectId).layers.length,original.layers.length);
});
