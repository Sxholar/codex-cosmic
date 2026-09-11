import {readFileSync} from 'node:fs';
import {designSkillsSchema} from './model.mjs';

// The original user-supplied Markdown is bundled with the plugin, independent of Downloads.
export function loadDefaultDesignSkills(){
 return designSkillsSchema.parse([{id:'astra-ui-ux',name:'UI MASTER SKILL.md',content:readFileSync(new URL('../skills/codex-cosmic/references/ui-master-skill.md',import.meta.url),'utf8'),enabled:true}]);
}
