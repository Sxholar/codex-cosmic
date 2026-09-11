import sharp from 'sharp';
import {z} from 'zod';

export const prepareAssetSchema=z.object({
 assetId:z.string(),baseRevision:z.number().int(),projectId:z.string().optional(),
 regions:z.array(z.object({name:z.string().min(1).max(200),left:z.number().int().nonnegative(),top:z.number().int().nonnegative(),width:z.number().int().positive(),height:z.number().int().positive(),outputWidth:z.number().int().min(16).max(4096).optional()})).min(1).max(32),
 background:z.object({color:z.string().regex(/^#[0-9a-fA-F]{6}$/),tolerance:z.number().min(0).max(80).default(12)}).optional()
});

// Remove only matching background connected to the crop border. Interior details remain.
export function clearBorderBackground(data,width,height,color,tolerance){
 const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
 const seen=new Uint8Array(width*height),queue=new Uint32Array(width*height);let head=0,tail=0;
 const add=i=>{if(seen[i])return;seen[i]=1;const p=i*4;if(data[p+3]===0||Math.max(...rgb.map((v,c)=>Math.abs(data[p+c]-v)))<=tolerance)queue[tail++]=i;};
 for(let x=0;x<width;x++){add(x);add((height-1)*width+x);}for(let y=0;y<height;y++){add(y*width);add(y*width+width-1);}
 while(head<tail){const i=queue[head++],x=i%width,y=Math.floor(i/width);data[i*4+3]=0;if(x)add(i-1);if(x<width-1)add(i+1);if(y)add(i-width);if(y<height-1)add(i+width);}
 return data;
}

export async function prepareAsset(source,args){
 const input=prepareAssetSchema.parse(args),buf=Buffer.from(source.data.split(',')[1],'base64');
 const meta=await sharp(buf,{limitInputPixels:32e6}).metadata();
 for(const r of input.regions)if(r.left+r.width>meta.width||r.top+r.height>meta.height)throw Error('A crop extends outside the source image. Inspect the image before choosing bounds.');
 if(input.regions.reduce((sum,r)=>sum+r.width*r.height,0)>64e6)throw Error('Crop batch is too large. Prepare fewer regions at a time.');
 const out=[];
 for(const r of input.regions){
  let img=sharp(buf,{limitInputPixels:32e6}).extract({left:r.left,top:r.top,width:r.width,height:r.height}).ensureAlpha();
  if(input.background){const {data,info}=await img.raw().toBuffer({resolveWithObject:true});clearBorderBackground(data,info.width,info.height,input.background.color,input.background.tolerance);img=sharp(data,{raw:{width:info.width,height:info.height,channels:4}});}
  if(r.outputWidth)img=img.resize({width:r.outputWidth,withoutEnlargement:true});
  const {data,info}=await img.png().toBuffer({resolveWithObject:true});
  out.push({name:r.name,data:'data:image/png;base64,'+data.toString('base64'),width:info.width,height:info.height,role:'asset',notes:JSON.stringify({sourceAssetId:source.id,crop:r,background:input.background||null})});
 }
 return out;
}
