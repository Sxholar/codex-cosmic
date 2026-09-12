const allowed=new Set(['patch-layer','add-layer','delete-layer','reorder','patch-board','add-board','patch-project','add-review','add-object','patch-object','delete-object','patch-scene']);
export function parseRunOperations(json){
  const input=JSON.parse(json);
  if(!Array.isArray(input))throw Error('Codex returned invalid design operations.');
  return input.map(o=>{
    if(!o||typeof o!=='object'||Array.isArray(o))throw Error('Invalid operation');
    if(o.type&&o.op&&o.type!==o.op)throw Error('Ambiguous operation');
    const type=o.type||o.op;
    if(!allowed.has(type))throw Error('The proposed design contained an unsupported operation.');
    const {op,...rest}=o;return {...rest,type};
  });
}
