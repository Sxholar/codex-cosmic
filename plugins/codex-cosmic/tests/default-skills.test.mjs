import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {loadDefaultDesignSkills} from '../src/default-skills.mjs';
import {createLibrary} from '../src/library.mjs';
import {applyOperations} from '../src/model.mjs';
import {designRunContext} from '../src/runner.mjs';

test('bundled master skill reaches new projects and enabled runner context in full',()=>{
 const defaults=loadDefaultDesignSkills(),content=readFileSync(new URL('../skills/codex-cosmic/references/ui-master-skill.md',import.meta.url),'utf8');
 const library=createLibrary(mkdtempSync(join(tmpdir(),'cosmic-master-')),{defaultDesignSkills:defaults});const project=library.create({templateId:'mobile'});
 assert.equal(project.designSkills[0].content,content);assert.equal(project.designSkills[0].id,'astra-ui-ux');assert.ok(content.includes('## 18. Sources & Attribution'));assert.equal(designRunContext(project).designSkills[0].content,content);
 assert.deepEqual(library.list().defaultDesignSkills,defaults);assert.deepEqual(designRunContext({...project,designSkills:[{...defaults[0],enabled:false}]}).designSkills,[]);
});
test('explicit opt-out, paused templates and imported projects retain their choices',()=>{
 const root=mkdtempSync(join(tmpdir(),'cosmic-master-choice-')),defaults=loadDefaultDesignSkills(),library=createLibrary(root,{defaultDesignSkills:defaults});
 const empty=library.create({templateId:'blank',designSkills:[]});assert.deepEqual(empty.designSkills,[]);
 const paused=library.create({designSkills:[{...defaults[0],enabled:false}]});const template=library.saveTemplate(paused.projectId,'Paused master').templates.find(t=>t.custom);assert.equal(template.designSkills[0].enabled,false);
 const copy=library.create({templateId:template.id});assert.equal(copy.designSkills[0].enabled,false);assert.deepEqual(library.create({document:empty}).designSkills,[]);
 const removed=library.save(applyOperations(copy,[{type:'patch-project',designSkills:[]}]),copy.revision,copy.projectId);assert.deepEqual(createLibrary(root,{defaultDesignSkills:defaults}).read(removed.projectId).designSkills,[]);
});
