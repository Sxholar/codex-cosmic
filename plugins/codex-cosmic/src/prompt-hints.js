// Hints are decorative placeholder text. They never change the person's input.
export function attachPromptHints(input,host){
 const lines=['Design a 3D object with soft, cinematic lighting.','Turn my screenshot into an editable UI.','Create a calm, beautifully simple dashboard.','Build a mobile app I can click and explore.','Bring my images together in a new landing page.','Make a little space for a big idea.'];
 const overlay=document.createElement('div');overlay.className='prompt-hints';overlay.setAttribute('aria-hidden','true');
 const text=document.createElement('span'),cursor=document.createElement('i');cursor.className='hint-caret';overlay.append(text,cursor);host.append(overlay);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let timer,phrase=0,length=0,deleting=false,disposed=false;
 function visible(){return !document.hidden&&document.body.classList.contains('home-visible')&&!input.value&&document.activeElement!==input;}
 function tick(){clearTimeout(timer);if(disposed)return;const idle=visible();host.classList.toggle('show-hint',idle);if(!idle)return;if(reduced.matches){text.textContent=lines[0];return;}const line=lines[phrase];length+=deleting?-1:1;text.textContent=line.slice(0,length);let delay=deleting?24:48;if(length===line.length){deleting=true;delay=2200;}else if(length===0){deleting=false;phrase=(phrase+1)%lines.length;delay=420;}timer=setTimeout(tick,delay);}
 function sync(){clearTimeout(timer);host.classList.toggle('show-hint',visible());if(visible()){if(reduced.matches)text.textContent=lines[0];else timer=setTimeout(tick,350);}}
 ['input','focus','blur'].forEach(e=>input.addEventListener(e,sync));document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
 const observer=new MutationObserver(sync);observer.observe(document.body,{attributes:true,attributeFilter:['class']});sync();
 window.addEventListener('pagehide',()=>{disposed=true;clearTimeout(timer);observer.disconnect();document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',sync);},{once:true});
}
