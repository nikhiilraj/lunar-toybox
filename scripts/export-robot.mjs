import {writeFile} from 'node:fs/promises';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {createRobot} from '../src/assets.ts';
// GLTFExporter uses browser FileReader for Blob -> ArrayBuffer conversion.
// This local authoring script supplies the equivalent Node-only adapter.
globalThis.FileReader=class{
 result=null;onloadend=null;onerror=null;
 readAsArrayBuffer(blob){blob.arrayBuffer().then(value=>{this.result=value;this.onloadend?.();}).catch(error=>this.onerror?.(error));}
 readAsDataURL(blob){blob.arrayBuffer().then(value=>{this.result=`data:${blob.type};base64,${Buffer.from(value).toString('base64')}`;this.onloadend?.();}).catch(error=>this.onerror?.(error));}
};
const robot=createRobot();
robot.root.name='Nikhil guide bot';robot.body.name='Chassis and portrait head';
robot.wheels.forEach((wheel,i)=>wheel.name=i?'Right wheel':'Left wheel');
robot.light.name='Status light';
const result=await new GLTFExporter().parseAsync(robot.root,{binary:true,onlyVisible:true});
if(!(result instanceof ArrayBuffer))throw new Error('Expected binary GLB');
const path=new URL('../public/assets/nikhil-bot.glb',import.meta.url);
await writeFile(path,Buffer.from(result));
console.log(`Exported ${path.pathname} (${result.byteLength} bytes)`);
