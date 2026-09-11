import {createDemo,validateDocument,layerSchema,objectSchema} from './model.mjs';
export const templates=[
 ['blank','Blank canvas','A fresh start, entirely yours.','blank'],
 ['mobile','Mobile app','Small screen. Thoughtful details.','mobile'],
 ['slides','Slides','A story, one frame at a time.','slides'],
 ['document','Document','Give your ideas a clear structure.','document'],
 ['wireframe','Wireframe','Explore the shape of an idea.','wireframe'],
 ['animation','Animation','Bring a composition to life.','animation'],
 ['ui','UI mockup','Build something people can use.','ui'],
 ['components','Working UI','Controls, connected values, and motion.','ui'],
 ['resume','Résumé','Experience, beautifully presented.','document'],
 ['3d','3D object','Shape a scene with Three.js.','cube'],
 ['research','Research board','Organize references and findings.','research'],
 ['email','HTML email concept','Design your next announcement.','email'],
 ['palette','Color + type','Find your visual language.','palette'],
 ['diagram','Diagram','Make the connections clear.','diagram'],
 ['flier','Flier','Make something worth noticing.','flier']
].map(([id,name,description,icon])=>({id,name,description,icon}));
export function fromTemplate(template='blank',name,brief=''){
 if(!templates.some(t=>t.id===template))throw Error('Unknown template');
 if(template==='ui'){const d=createDemo();d.name=name||'New UI mockup';if(brief)d.brief=brief;return d;}
 const d=validateDocument({version:1,revision:0,name:name||templates.find(t=>t.id===template).name,brief,kind:template==='3d'?'scene':'canvas',boards:[{id:'page-1',name:'Page 1',width:1120,height:820,fill:'#f6f4ef'}],layers:[],assets:[],reviews:[]});
 const b=d.boards[0];let n=0;
 const add=(type,x,y,width,height,props={})=>d.layers.push(layerSchema.parse({id:'layer-'+(++n),boardId:b.id,type,name:props.text?.split('\n')[0].slice(0,60)||type,x,y,width,height,fill:type==='text'?'transparent':'#deddd7',...props}));
 const text=(s,x,y,w,h,size=24,props={})=>add('text',x,y,w,h,{text:s,fontSize:size,...props});
 const box=(x,y,w,h,fill='#deddd7',radius=10)=>add('shape',x,y,w,h,{fill,radius});
 if(template==='components'){
  Object.assign(b,{name:'Component playground',width:1120,height:820,fill:'#f5f4f0'});
  d.brief=brief||'A working component playground. Switch to Preview to test controls, connected values, hover motion, validation and local feedback. Configure behavior in the inspector.';
  text('FORM / FUNCTION',48,36,800,24,13,{color:'#6e766f',fontFamily:'mono'});
  text('A design you can use.',48,84,970,65,48,{fontFamily:'serif',color:'#233f35'});
  text('Slide, switch, type, and explore. Every control is alive in Preview.',50,165,980,32,18,{color:'#69736a'});
  box(40,230,506,528,'#ffffff',20);box(570,230,510,528,'#ffffff',20);
  const control=(id,type,x,y,w,h,extra)=>add(type,x,y,w,h,{id,fill:'transparent',fontSize:16,color:'#356650',...extra});
  text('Make it yours',66,260,432,38,25,{fontWeight:600,color:'#233f35'});
  control('intensity','slider',66,320,430,40,{name:'Intensity',value:35,suffix:'%'});
  control('intensity-label','text',66,378,430,30,{text:'Intensity is {{value}}%',name:'Connected value label',valueSource:'intensity',fontSize:18});
  control('intensity-progress','progress',66,427,430,24,{name:'Intensity progress',valueSource:'intensity',suffix:'%'});
  control('less','button',66,485,90,38,{text:'− Less',fill:'#edf2ed',radius:9,action:'decrement',actionTarget:'intensity'});
  control('more','button',166,485,90,38,{text:'+ More',fill:'#edf2ed',radius:9,action:'increment',actionTarget:'intensity'});
  control('reset-controls','button',386,485,110,38,{text:'Reset',fill:'#f2f2ef',radius:9,action:'reset'});
  control('notifications','toggle',66,556,290,35,{name:'Notifications',text:'Notifications',checked:true});
  control('notification-state','text',386,559,110,28,{name:'Notification status',text:'{{value}}',valueSource:'notifications',align:'right'});
  control('view-tabs','tabs',66,622,430,48,{name:'View options',text:'Overview\nActivity\nSettings',radius:10});
  control('tab-result','text',66,690,430,30,{text:'Viewing {{value}}',valueSource:'view-tabs',fontSize:16,color:'#6e766f'});
  text('Keep in touch',596,260,436,38,25,{fontWeight:600,color:'#233f35'});
  control('email','input',596,318,434,45,{name:'Email address',text:'Your email address',inputType:'email',required:true,radius:9,color:'#233f35'});
  control('topic','select',596,380,434,44,{name:'Topic',text:'Product updates\nDesign notes\nNew releases',radius:9,color:'#233f35'});
  control('consent','checkbox',596,444,434,30,{name:'Consent',text:'I would like to receive updates',required:true});
  control('subscribe','button',596,494,434,48,{name:'Check subscription form',text:'Try this form',fill:'#356650',color:'#ffffff',radius:10,action:'submit',actionMessage:'Looks good — fields validated locally. No data was sent.',hoverEffect:'lift',hoverColor:'#284e3d'});
  control('more-info','accordion',596,575,434,136,{name:'About this prototype',text:'What happens when I interact?\nThe UI responds locally. Sliders share values, tabs stay selected, and this panel expands. No account or backend is needed.',radius:10,color:'#465e51'});
  text('EDIT to compose  ·  PREVIEW to interact  ·  EXPORT to share the working HTML',48,784,1000,22,12,{fontFamily:'mono',color:'#747c75'});
 }else if(template==='3d'){
  d.scene.objects=[objectSchema.parse({id:'sculpture',name:'Orbital sculpture',geometry:'torus',position:[0,1.8,0],rotation:[25,-20,0],scale:[1.4,1.4,1.4],color:'#baa5ff',metalness:.55,roughness:.22}),objectSchema.parse({id:'core',name:'Ceramic core',geometry:'sphere',position:[0,1.8,0],scale:[.6,.6,.6],color:'#e8eddf'}),objectSchema.parse({id:'plinth',name:'Display plinth',geometry:'cylinder',position:[0,.22,0],scale:[1.55,.35,1.55],color:'#444959',metalness:.3})];
 }else if(template==='mobile'){
  Object.assign(b,{width:390,height:844,name:'Mobile'});text('Lumen',28,34,300,50,32,{fontFamily:'serif'});text('A little more present.',28,110,325,95,38,{fontFamily:'serif'});box(28,228,334,224,'#ccd9c0',28);box(150,267,90,90,'#f1dfb4',50);text('Your daily pause',50,389,270,30,21);text('Make space for a calmer day.',28,488,335,60,18);add('button',28,580,334,54,{text:'Begin a session',fill:'#344c3c',color:'#ffffff',radius:28,fontSize:17,targetBoard:'session'});add('slider',28,690,334,32,{name:'Session length',color:'#344c3c',fill:'transparent'});
  d.boards.push({...b,id:'session',name:'Session'});d.layers.push(layerSchema.parse({id:'session-title',boardId:'session',type:'text',name:'Session heading',text:'Take a breath.',x:30,y:210,width:330,height:100,fontSize:42,fill:'transparent',fontFamily:'serif'}),layerSchema.parse({id:'session-back',boardId:'session',type:'button',name:'Back',text:'Back to home',targetBoard:b.id,x:28,y:500,width:334,height:50,fill:'#344c3c',color:'#ffffff',radius:25,fontSize:17}));
 }else if(template==='slides'){
  Object.assign(b,{width:1280,height:720,name:'01 / The idea',fill:'#222a35'});text('FIELD NOTES / 2026',70,58,600,25,16,{color:'#b4c3db'});text('A better way\nto begin.',70,204,1050,240,92,{fontFamily:'serif',color:'#f1f0e9'});text('A product vision for the next chapter.',75,581,850,42,25,{color:'#c2c9d4'});d.boards.push({...b,id:'slide-2',name:'02 / The opportunity',fill:'#f1f0e9'});d.layers.push(layerSchema.parse({id:'slide-two-title',boardId:'slide-2',type:'text',name:'Opportunity',text:'Start with the problem.',x:70,y:70,width:1100,height:120,fontSize:64,fill:'transparent'}));
 }else if(['document','resume','research','email'].includes(template)){
  Object.assign(b,{width:template==='email'?640:794,height:1123,name:templates.find(t=>t.id===template).name});const w=b.width-112;const title={document:'The next chapter',resume:'Alex Morgan',research:'What we learned',email:'Something good\nis on the way.'}[template];text(title,56,60,w,130,template==='email'?48:45,{fontFamily:'serif'});text({document:'A working document / September 2026',resume:'Product designer · Portfolio · Contact',research:'Research notes / Project overview',email:'A note from Studio North'}[template],56,206,w,70,17,{color:'#6b706b'});box(56,306,w,2,'#b9c1b9',0);text(template==='resume'?'Experience':'The story so far',56,352,w,50,29);text('Add your own content here. This is a visual starting point for your ideas, references, and supporting details.',56,435,w,125,22,{color:'#575f58'});text(template==='resume'?'Selected work':'Next steps',56,664,w,45,29);text('Describe what matters, who it is for, and what comes next.',56,744,w,110,22,{color:'#575f58'});if(template==='email')add('button',56,915,w,56,{text:'Find out more',fill:'#344c3c',color:'#ffffff',fontSize:18,radius:8});
 }else if(template==='wireframe'){
  b.fill='#ffffff';box(32,32,1056,65,'#e3e5e7',0);text('LOGO',54,50,190,32,22);text('Navigation     Navigation     Account',590,52,465,30,18);box(40,146,640,340,'#eceef0',0);text('Primary headline',720,160,330,100,42);text('Supporting information and a clear call to action.',720,300,325,90,21);add('button',720,423,275,52,{text:'Primary action',fill:'#38414a',color:'#ffffff',fontSize:18});for(let i=0;i<3;i++){box(40+i*365,546,335,205,'#eceef0',0);text('Content '+(i+1),62+i*365,623,290,50,26);}
 }else if(template==='animation'){
  b.fill='#182824';text('A moment\nin motion.',70,205,850,250,88,{fontFamily:'serif',color:'#edecd9',animation:'slide',duration:1.4});box(860,92,120,120,'#d9b970',80);d.layers.at(-1).animation='scale';d.layers.at(-1).duration=2;text('Switch to Preview to play. Select a layer to adjust its entrance.',74,651,880,65,23,{color:'#aabdaf',animation:'fade',delay:.5,duration:1.5});
 }else if(template==='palette'){
  text('Soft structure',55,50,900,95, 60,{fontFamily:'serif'});text('Warm neutrals. Deep green. A little room to breathe.',59,176,920,52,24);['#253c32','#93a48b','#d7c6a4','#f0ece3','#ac745d'].forEach((c,i)=>{box(56+i*202,296,186,236,c,12);text(c,56+i*202,554,186,28,19,{fontFamily:'mono'});});text('Aa',56,655,300,100,76,{fontFamily:'serif'});text('A clear voice, at every size.',368,675,690,74,32);
 }else if(template==='diagram'){
  text('From idea to impact',56,55,920,80,48);box(213,391,691,4,'#91a0b7',0);['Discover','Design','Test'].forEach((t,i)=>{box(75+i*365,306,240,170,['#d7e4da','#d6def0','#ecdec4'][i],18);text(t,90+i*365,368,210,50,28,{align:'center'});});text('Observe the need',81,525,275,50,18);text('Explore a solution',449,525,275,50,18);text('Learn and improve',804,525,275,50,18);
 }else if(template==='flier'){
  Object.assign(b,{width:700,height:990,fill:'#dfed58'});text('NORTH / STUDIO',42,46,605,30,17);text('MAKE\nSOME\nSPACE.',42,158,620,437,112,{fontWeight:700});text('An evening of ideas, objects,\nand unexpected connections.',46,667,605,92,25);box(42,825,610,2,'#182022',0);text('24 OCTOBER / 6–10 PM\nTHE DESIGN HOUSE',46,861,595,80,20,{fontFamily:'mono'});
 }
 return validateDocument(d);
}
