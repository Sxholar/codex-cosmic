// Read only complete JSON strings from the top-level operations array.
// A cut-off token never becomes a canvas edit.
export function operationStrings(text) {
  let at=0;
  const space=()=>{while(/\s/.test(text[at]||'x'))at++;};
  function string(){
    if(text[at]!== '"')return null;
    const start=at++;let escaped=false;
    while(at<text.length){const c=text[at++];if(escaped){escaped=false;continue;}if(c==='\\'){escaped=true;continue;}if(c==='"')return JSON.parse(text.slice(start,at));}
    return null;
  }
  space();if(text[at++]!=='{')return [];
  while(at<text.length){
    space();const key=string();if(key===null)return [];space();if(text[at++]!==':')return [];space();
    if(key==='operations'){
      if(text[at++]!=='[')return [];const found=[];
      while(at<text.length){space();if(text[at]===']')return found;const op=string();if(op===null)return found;found.push(op);space();if(text[at++]!==',')return found;}
      return found;
    }
    // The only other schema field is a summary string.
    if(string()===null)return [];space();if(text[at++]!==',')return [];
  }
  return [];
}
