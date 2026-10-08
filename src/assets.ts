import * as T from 'three/webgpu';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import type { Font } from 'three/addons/loaders/FontLoader.js';
import { uv, smoothstep, length, vec2 } from 'three/tsl';

export const palette={ivory:0xf2ead6, cream:0xe0d5bd, stone:0xc7c3b3, ink:0x304342, dark:0x243636, leaf:0x789878, moss:0x98ad84, amber:0xe8a746, wood:0xb98858, rust:0xb96445, sky:0xe9e8df};
const materials=new Map<string,T.MeshStandardMaterial>();
export function material(color:number,roughness=0.78,metalness=0){
 const key=`${color}:${roughness}:${metalness}`;
 if(!materials.has(key)) materials.set(key,new T.MeshStandardMaterial({color,roughness,metalness}));
 return materials.get(key)!;
}
export function box(parent:T.Object3D,w:number,h:number,d:number,x:number,y:number,z:number,color:number,r=.06){
 const mesh=new T.Mesh(r>0?new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)):new T.BoxGeometry(w,h,d),material(color));
 mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
export function cylinder(parent:T.Object3D,r1:number,r2:number,h:number,x:number,y:number,z:number,color:number,segments=24){
 const mesh=new T.Mesh(new T.CylinderGeometry(r1,r2,h,segments),material(color));
 mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
export function sphere(parent:T.Object3D,r:number,x:number,y:number,z:number,color:number,detail=1){
 const mesh=new T.Mesh(new T.IcosahedronGeometry(r,detail),material(color));mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
export function text3D(parent:T.Object3D,font:Font,text:string,size:number,x:number,y:number,z:number,color:number,depth=.025){
 const geo=new TextGeometry(text,{font,size,depth,curveSegments:4,bevelEnabled:true,bevelThickness:.005,bevelSize:.003,bevelSegments:1});
 geo.computeBoundingBox();const width=geo.boundingBox!.max.x;
 const mesh=new T.Mesh(geo,material(color));mesh.position.set(x-width/2,y,z);mesh.castShadow=true;parent.add(mesh);return mesh;
}
export function ring(parent:T.Object3D,r:number,tube:number,x:number,y:number,z:number,color:number){
 const mesh=new T.Mesh(new T.TorusGeometry(r,tube,8,48),material(color));mesh.rotation.x=-Math.PI/2;mesh.position.set(x,y,z);parent.add(mesh);return mesh;
}
export function shadow(parent:T.Object3D,w:number,d:number,x:number,z:number,opacity=.2){
 const mat=new T.MeshBasicNodeMaterial({transparent:true,depthWrite:false,color:0x29372b});
 mat.opacityNode=smoothstep(.51,.18,length(uv().sub(vec2(.5)))).mul(opacity);
 const mesh=new T.Mesh(new T.PlaneGeometry(w,d),mat);mesh.rotation.x=-Math.PI/2;mesh.position.set(x,.016,z);parent.add(mesh);return mesh;
}
export interface RobotRig {root:T.Group;body:T.Group;wheels:T.Group[];light:T.Mesh;antenna:T.Object3D;halo:T.Mesh}
export function createRobot():RobotRig{
 const root=new T.Group();root.name='Explorer robot';const body=new T.Group();root.add(body);
 box(body,.96,.44,1.03,0,.58,0,palette.ivory,.14);
 box(body,.92,.09,.91,0,.83,-.025,palette.cream,.035);
 box(body,.87,.1,.95,0,.32,0,palette.ink,.03);
 box(body,.71,.19,.048,0,.64,.517,palette.dark,.055);
 const led=new T.MeshStandardMaterial({color:0xffca65,emissive:0xffa62a,emissiveIntensity:.6});
 const light=box(body,.53,.038,.03,0,.65,.548,palette.amber,.014);light.material=led;
 for(const x of [-.29,.29]){cylinder(body,.04,.04,.035,x,.5,.536,palette.cream).rotation.x=Math.PI/2;}
 for(let i=0;i<4;i++) box(body,.26,.012,.028,0,.885,-.19+i*.08,palette.ink,.005);
 box(body,.13,.016,.19,.25,.889,.21,palette.amber,.008);
 // A stylized likeness based on Nikhil's supplied portrait: swept hair,
 // strong brows, warm face panel and a subtle charcoal jaw detail.
 cylinder(body,.15,.18,.16,0,.94,0,palette.ink,16);
 const face=box(body,.64,.58,.57,0,1.22,.035,0xc58f62,.15);
 const jaw=box(body,.52,.14,.13,0,1.008,.29,0x755d48,.055);
 box(body,.42,.13,.14,0,1.048,.32,0xc58f62,.06);
 for(const side of [-1,1]){
  sphere(body,.075,side*.327,1.19,.07,0xb78259,2).scale.set(.55,1,.8);
  box(body,.163,.1,.045,side*.153,1.253,.327,0xe6d7b5,.036);
  sphere(body,.04,side*.151,1.255,.354,0x2c3029,2).scale.set(1,1,.48);
  sphere(body,.012,side*.144,1.268,.372,0xfff3d9,1);
  const brow=box(body,.198,.045,.041,side*.153,1.345,.334,0x26312b,.015);brow.rotation.z=-side*.1;
 }
 box(body,.078,.108,.08,0,1.181,.361,0xd39e71,.033);
 box(body,.195,.022,.02,0,1.075,.391,0x795743,.01);
 box(body,.66,.23,.61,0,1.48,.012,0x202c29,.12);
 for(let i=0;i<6;i++){
  const lock=sphere(body,.18,-.25+i*.1,1.535+Math.sin(i/5*Math.PI)*.065,.02,i%2?0x273530:0x21302b,2);
  lock.scale.set(.65,.73,1.65);lock.rotation.set(-.1,-.18,-.25);
 }
 box(body,.065,.25,.27,-.303,1.353,-.084,0x202c29,.04);
 box(body,.065,.22,.27,.303,1.353,-.084,0x202c29,.04);
 const wheels:T.Group[]=[];
 for(const x of [-.58,.58]){
  const wheel=new T.Group();wheel.position.set(x,.32,.04);root.add(wheel);wheels.push(wheel);
  const tire=cylinder(wheel,.32,.32,.21,0,0,0,palette.dark,32);tire.rotation.z=Math.PI/2;
  for(const side of [-1,1]){const hub=cylinder(wheel,.19,.19,.024,side*.112,0,0,palette.cream);hub.rotation.z=Math.PI/2;
   const axle=cylinder(wheel,.075,.075,.03,side*.13,0,0,palette.ink);axle.rotation.z=Math.PI/2;
   for(let k=0;k<5;k++){const a=k*Math.PI*2/5;const screw=cylinder(wheel,.025,.025,.03,side*.129,Math.cos(a)*.13,Math.sin(a)*.13,palette.wood,8);screw.rotation.z=Math.PI/2;}}
  for(let n=0;n<16;n++){const a=n*Math.PI/8;const tread=box(wheel,.2,.02,.065,0,Math.cos(a)*.314,Math.sin(a)*.314,0x41514c,.005);tread.rotation.x=a;}
 }
 const caster=sphere(root,.115,0,.17,-.4,palette.ink,2);caster.scale.z=.8;
 cylinder(body,.024,.025,.31,-.27,1.02,-.27,palette.ink,8);
 const antenna=sphere(body,.049,-.39,1.12,-.35,palette.amber,1);
 const halo=ring(root,.82,.014,0,.025,0,palette.amber);halo.visible=false;
 return {root,body,wheels,light,antenna,halo};
}
export function planter(parent:T.Object3D,x:number,z:number,r=1){
 cylinder(parent,r,r*.9,.4,x,.2,z,palette.cream,32);
 cylinder(parent,r*.94,r*.94,.06,x,.415,z,0x6d7c5b,32);
 shadow(parent,r*3,r*3,x,z,.19);
}
export function tree(parent:T.Object3D,x:number,z:number,scale=1,seed=1){
 const group=new T.Group();group.position.set(x,0,z);group.scale.setScalar(scale);parent.add(group);
 cylinder(group,.13,.21,2.4,0,1.2,0,palette.wood,9);
 for(let i=0;i<3;i++){const branch=cylinder(group,.06,.09,1.1,Math.cos(i*2.4)*.2,1.95,Math.sin(i*2.4)*.2,palette.wood,7);branch.rotation.z=(i-1)*.5;}
 const colors=[0x91a77a,0x819b6c,0xa1b687,0x728c65];
 for(let i=0;i<9;i++){const a=i*2.4+seed,r=i===0?0:.65;const leaf=sphere(group,.9+(i%3)*.1,Math.cos(a)*r,2.5+(i%3)*.43,Math.sin(a)*r,colors[i%4],1);leaf.scale.set(1,1.12,.9);}
 shadow(parent,scale*4,scale*4,x,z,.24);return group;
}
export function grass(parent:T.Object3D,x:number,z:number,scale=1){
 const group=new T.Group();group.position.set(x,.04,z);group.scale.setScalar(scale);parent.add(group);
 for(let i=0;i<5;i++){
  const a=i*2.4;const blade=new T.Mesh(new T.ConeGeometry(.095,.52+(i%2)*.2,3),material(i%2?palette.leaf:palette.moss));
  blade.position.set(Math.cos(a)*.12,.22,Math.sin(a)*.12);blade.rotation.set(Math.sin(a)*.3,a,Math.cos(a)*.35);blade.castShadow=true;group.add(blade);
 }
}
export function pathLine(parent:T.Object3D,points:T.Vector3[],color=palette.amber,r=.025){
 const curve=new T.CatmullRomCurve3(points);const line=new T.Mesh(new T.TubeGeometry(curve,Math.max(points.length*8,24),r,5,false),material(color));parent.add(line);return line;
}
export function indicatorMaterial(color:number){return material(color).clone();}
