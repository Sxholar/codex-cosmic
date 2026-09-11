import {homedir,platform} from 'node:os';
import {join,resolve} from 'node:path';
import {existsSync,readdirSync,statSync} from 'node:fs';

export function cosmicDataPath(root,env=process.env){
  if(env.CODEX_COSMIC_DATA_DIR)return resolve(env.CODEX_COSMIC_DATA_DIR);
  // Keep projects from the original standalone release in their existing location.
  if(existsSync(join(root,'data','library.json')))return join(root,'data');
  const home=homedir();
  if(platform()==='win32')return join(env.LOCALAPPDATA||join(home,'AppData','Local'),'Codex Cosmic');
  if(platform()==='darwin')return join(home,'Library','Application Support','Codex Cosmic');
  return join(env.XDG_DATA_HOME||join(home,'.local','share'),'codex-cosmic');
}
export function resolveCodexCli(env=process.env){
  if(env.CODEX_COSMIC_CLI)return env.CODEX_COSMIC_CLI;
  if(platform()==='win32'){
    const base=join(env.LOCALAPPDATA||join(homedir(),'AppData','Local'),'OpenAI','Codex','bin');
    if(existsSync(base)){
      const candidates=readdirSync(base,{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>join(base,d.name,'codex.exe')).filter(existsSync).sort((a,b)=>statSync(b).mtimeMs-statSync(a).mtimeMs);
      if(candidates[0])return candidates[0];
    }
  }
  if(platform()==='darwin')for(const path of ['/Applications/Codex.app/Contents/Resources/codex',join(homedir(),'Applications/Codex.app/Contents/Resources/codex')])if(existsSync(path))return path;
  return 'codex';
}
