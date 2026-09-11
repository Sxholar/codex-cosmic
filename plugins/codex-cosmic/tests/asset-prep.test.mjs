import {test} from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {prepareAsset,clearBorderBackground} from '../src/asset-prep.mjs';
test('flat background removal preserves enclosed white icon details',()=>{
 const data=Buffer.alloc(5*5*4,255);for(let y=1;y<=3;y++)for(let x=1;x<=3;x++)if(x!==2||y!==2){const i=(y*5+x)*4;data[i]=data[i+1]=data[i+2]=0;}
 clearBorderBackground(data,5,5,'#ffffff',0);assert.equal(data[3],0);assert.equal(data[(2*5+2)*4+3],255);assert.equal(data[(1*5+1)*4+3],255);
});
test('sheet crops have real dimensions, alpha and immutable source; invalid batch is rejected',async()=>{
 const data=await sharp({create:{width:20,height:10,channels:4,background:'#ffffff'}}).png().toBuffer();
 const source={id:'sheet',data:'data:image/png;base64,'+data.toString('base64')},original=source.data;
 const args={assetId:'sheet',baseRevision:1,regions:[{name:'icon',left:5,top:0,width:10,height:10}],background:{color:'#ffffff',tolerance:0}};
 const [out]=await prepareAsset(source,args);assert.equal(out.width,10);assert.equal(out.height,10);assert.equal(source.data,original);
 const raw=await sharp(Buffer.from(out.data.split(',')[1],'base64')).raw().toBuffer();assert.equal(raw[3],0);
 await assert.rejects(prepareAsset(source,{...args,regions:[...args.regions,{name:'bad',left:19,top:0,width:5,height:5}]}),/outside/);
});
