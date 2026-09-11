import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {readSkillFiles} from '../src/design-skills.js';
import {createLibrary} from '../src/library.mjs';
import {applyOperations} from '../src/model.mjs';
test('skill files import atomically, replace matching names, and reject unsupported or oversized content',async()=>{
 const files=await readSkillFiles([new File(['# UI guidance\nUse working controls.'],'SKILL.md')]);assert.equal(files.length,1);assert.equal(files[0].enabled,true);
 const replaced=await readSkillFiles([new File(['Updated design guidance'],'SKILL.md')],files);assert.equal(replaced.length,1);assert.equal(replaced[0].id,files[0].id);assert.notEqual(replaced[0].content,files[0].content);
 await assert.rejects(readSkillFiles([new File(['valid'],'valid.md'),new File(['no'],'run.exe')],files));assert.equal(files.length,1);
 await assert.rejects(readSkillFiles([new File(['x'.repeat(40001)],'large.md')]));await assert.rejects(readSkillFiles([new File(['a'.repeat(35000)],'a.md'),new File(['b'.repeat(35000)],'b.md')]));await assert.rejects(readSkillFiles([new File(['\0binary'],'invalid.txt')]));
});
test('enabled and paused design guidance survives saving, reopening, and template reuse',async()=>{
 const root=mkdtempSync(join(tmpdir(),'cosmic-skills-')),lib=createLibrary(root),d=lib.read();const files=await readSkillFiles([new File(['# Typography\nUse a clear hierarchy.'],'type.md'),new File(['# Motion\nRespect reduced motion.'],'motion.txt')]);files[1].enabled=false;
 lib.save(applyOperations(d,[{type:'patch-project',designSkills:files}]),d.revision,d.projectId);const saved=createLibrary(root).read(d.projectId);assert.deepEqual(saved.designSkills,files);
 const template=lib.saveTemplate(d.projectId,'With design guidance').templates.find(t=>t.custom);assert.deepEqual(lib.create({templateId:template.id}).designSkills,files);
});
