import * as T from 'three/webgpu';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TTFLoader} from 'three/addons/loaders/TTFLoader.js';
import {box,cylinder,sphere,ring,material,text3D,createRobot} from './assets';
import {MOON_RADIUS,UP,type Obstacle} from './lunar-motion';
import {destinations,normalOf,destination,navigationObstacles,type DestinationId} from './destinations';
import {batchStatic} from './batch';

export function seeded(seed=71){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const random=seeded();
const unit=()=>new T.Vector3().setFromSphericalCoords(1,Math.acos(2*random()-1),random()*Math.PI*2);
const craters=Array.from({length:125},()=>({n:unit(),radius:.035+random()*.13,depth:.12+random()*.32}));
export function surfaceHeight(n:T.Vector3){
 let h=Math.sin(n.x*62+n.y*28)*Math.sin(n.z*49-n.y*34)*.016+Math.sin(n.z*22+n.x*33)*.025;
 for(const c of craters){const dot=n.dot(c.n);if(dot<Math.cos(c.radius*1.4))continue;const q=Math.acos(Math.min(1,dot))/c.radius;
  if(q<1)h-=c.depth*Math.pow(1-q*q,2);h+=Math.exp(-Math.pow((q-1.04)*8,2))*c.depth*.32;
 }
 // The home clearing is gently graded so wheels, doors and pads meet the ground.
 const a=n.angleTo(UP);const flat=1-T.MathUtils.smoothstep(a,.18,.34);return MOON_RADIUS+h*(1-flat*.85);
}
function anchorNormal(parent:T.Object3D,n:T.Vector3,height=0){const g=new T.Group();g.position.copy(n).multiplyScalar(surfaceHeight(n)+height);g.quaternion.setFromUnitVectors(UP,n);parent.add(g);return{g,n};}
function anchor(parent:T.Object3D,x:number,z:number,height=0){return anchorNormal(parent,new T.Vector3(x,MOON_RADIUS,z).normalize(),height);}
function lightMaterial(color:number,intensity=1){return new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:intensity,roughness:.45});}
export async function createLunarWorld(scene:T.Scene){
 const font=new FontLoader().parse(await new TTFLoader().loadAsync('/assets/manrope-bold.ttf'));
 const land=new T.Group();land.name='Lunar Toybox';scene.add(land);
 const geo=new T.SphereGeometry(MOON_RADIUS,256,160);const positions=geo.attributes.position;const colors=new Float32Array(positions.count*3);const v=new T.Vector3();const tint=new T.Color();
 for(let i=0;i<positions.count;i++){v.fromBufferAttribute(positions,i).normalize();const h=surfaceHeight(v);positions.setXYZ(i,v.x*h,v.y*h,v.z*h);const shade=.84+Math.sin(v.x*128+v.y*21)*Math.sin(v.z*139-v.y*84)*.018+(h-MOON_RADIUS)*.3;tint.setRGB(shade,shade*.956,shade*.9);colors.set([tint.r,tint.g,tint.b],i*3);}
 geo.setAttribute('color',new T.BufferAttribute(colors,3));geo.computeVertexNormals();
 const grain=document.createElement('canvas');grain.width=grain.height=256;const cx=grain.getContext('2d')!;const data=cx.createImageData(256,256);for(let i=0;i<data.data.length;i+=4){const c=180+random()*70;data.data[i]=data.data[i+1]=data.data[i+2]=c;data.data[i+3]=255;}cx.putImageData(data,0,0);const dust=new T.CanvasTexture(grain);dust.wrapS=dust.wrapT=T.RepeatWrapping;dust.repeat.set(16,8);
 const regolith=await new T.TextureLoader().loadAsync('/assets/lunar-dust.png');regolith.colorSpace=T.SRGBColorSpace;regolith.wrapS=regolith.wrapT=T.RepeatWrapping;regolith.repeat.set(10,5);regolith.anisotropy=4;
 const moon=new T.Mesh(geo,new T.MeshStandardMaterial({color:0xf1ede7,vertexColors:true,map:regolith,roughness:1,bumpMap:dust,bumpScale:.055}));moon.material.color.multiplyScalar(1.65);moon.receiveShadow=true;moon.castShadow=true;land.add(moon);
 const mint=0x7da69d,cream=0xf2e5ca,coral=0xc68b72,dark=0x273737;
 const workshop=anchor(land,-1,-2.65);const shop=workshop.g;shop.scale.setScalar(1.25);shop.rotation.y=-.04;
 cylinder(shop,2.78,2.9,1.0,0,-.35,0,0xada797,64);
 box(shop,4.55,2.5,2.65,0,1.3,0,mint,.34);
 box(shop,4.2,.22,2.65,0,2.56,0,0x97b6a6,.1);
 // Deep doorway, illuminated interior, work bench and open sliding leaves.
 box(shop,1.95,1.83,.12,.23,1.03,1.33,0x263b39,.1);
 const back=box(shop,1.5,1.4,.03,.23,1.07,1.407,0x765c3c,.04);back.material=lightMaterial(0x95683c,.3);
 box(shop,1.4,.1,.3,.23,.57,1.56,cream,.02);for(const x of [-.37,.87])box(shop,.08,.5,.08,x,.3,1.57,dark,.01);
 box(shop,.57,.37,.065,.03,.89,1.51,0x263e3b,.035);box(shop,.49,.28,.015,.03,.9,1.55,0xdcb369,.01);
 for(let i=0;i<3;i++)box(shop,.09,.22,.12,.5+i*.12,.73,1.52,[coral,cream,mint][i],.013);
 for(const x of [-.92,1.36])box(shop,.28,1.84,.23,x,1.03,1.44,cream,.09);
 box(shop,2.68,.2,.56,.22,1.94,1.5,cream,.08);const strip=box(shop,2.27,.045,.07,.2,1.83,1.75,cream,.01);strip.material=lightMaterial(0xffd793,2.3);
 // Small portholes, radiator slats and ceramic service details.
 for(const x of [-1.68,1.93]){box(shop,.35,.91,.15,x,1.24,1.32,cream,.12);const w=box(shop,.2,.63,.045,x,1.28,1.418,0xe6bb76,.07);w.material=lightMaterial(0xf2be71,.65);}
 for(let i=0;i<5;i++)box(shop,.44,.035,.05,-1.66,.56+i*.085,1.37,dark,.009);
 box(shop,3.65,.67,.18,0,2.18,1.47,cream,.12);text3D(shop,font,'NIKHIL RAJ',.42,0,2.02,1.58,dark,.024);
 const roof=sphere(shop,.6,-.78,2.72,-.17,mint,3);roof.scale.set(1,.48,1);cylinder(shop,.49,.49,.08,-.78,2.65,-.17,cream,40);
 box(shop,.87,.26,.69,1.06,2.72,-.48,0x577b76,.08);for(let i=0;i<5;i++)box(shop,.045,.02,.51,.8+i*.12,2.866,-.48,dark,.006);
 cylinder(shop,.024,.024,1.3,-1.82,3.05,-.65,cream,8);sphere(shop,.07,-1.82,3.72,-.65,cream,2);
 const dish=new T.Mesh(new T.SphereGeometry(.37,24,12,0,Math.PI*2,0,.92),material(cream));dish.position.set(1.64,2.72,.2);dish.rotation.z=-.5;shop.add(dish);
 for(const x of [-1.06,-.41,.24,.89,1.54])box(shop,.53,.06,.67,x,.08,1.97,0xc8c2b2,.04);
 const dock=anchorNormal(land,normalOf(destination('lab')));const dg=dock.g;dg.scale.setScalar(1.13);
 cylinder(dg,1.0,1.06,.16,0,.09,.27,cream,64);cylinder(dg,.83,.85,.08,0,.21,.27,0xc4b9a8,64);ring(dg,.73,.025,0,.257,.27,0xffdb98).material=lightMaterial(0xf6c77f,1.8);
 box(dg,1.36,1.86,.42,0,1.0,-.39,coral,.31);box(dg,1.0,1.52,.06,0,1.03,-.154,dark,.22);
 box(dg,.63,.1,.12,0,.42,-.08,mint,.035);
 // Extruded physical bolt based on Lucide Zap's path, separate from the UI icon.
 const bolt=new T.Shape();bolt.moveTo(.1,1.62);bolt.lineTo(-.24,1.13);bolt.lineTo(.04,1.13);bolt.lineTo(-.09,.71);bolt.lineTo(.29,1.25);bolt.lineTo(.02,1.25);bolt.closePath();
 const boltMesh=new T.Mesh(new T.ExtrudeGeometry(bolt,{depth:.04,bevelEnabled:true,bevelSize:.01,bevelThickness:.01,bevelSegments:2,steps:1}),lightMaterial(0xffe7a8,1.4));boltMesh.position.set(0,0,-.085);dg.add(boltMesh);
 for(const x of [-.35,.35])box(dg,.12,.02,.42,x,.26,.23,0xbda886,.018);
 const banner=anchor(land,-3.7,2.65);const bg=banner.g;bg.rotation.y=.1;
 box(bg,4.6,.42,.69,0,.19,0,0x8f9088,.15);text3D(bg,font,'NIKHIL RAJ',.64,0,.36,.19,cream,.18);
 text3D(bg,font,'A SMALL WORLD OF IDEAS',.105,0,.14,.37,0xe0d9ca,.009);
 // A small experiment on the far hemisphere rewards a full lap.
 const far=new T.Group();const farNormal=normalOf(destination('lookout'));far.position.copy(farNormal).multiplyScalar(surfaceHeight(farNormal));far.quaternion.setFromUnitVectors(UP,farNormal);land.add(far);
 cylinder(far,1.2,1.3,.15,0,.08,0,cream,48);const sculpture=new T.Group();sculpture.position.y=1;far.add(sculpture);
 sphere(sculpture,.27,0,0,0,coral,2);for(let i=0;i<3;i++){const m=ring(sculpture,.6+i*.15,.027,0,0,0,i===1?mint:cream);m.rotation.set(i*.7,.8+i,i*.8);}
 text3D(far,font,'THE OTHER SIDE',.19,0,.16,.95,dark,.02);
 // New landmarks all sit on local tangent frames, including the far hemisphere.
 const control=anchorNormal(land,normalOf(destination('about'))).g;
 cylinder(control,1.45,1.6,.3,0,.12,0,cream,48);const dome=sphere(control,1.3,0,.38,0,mint,3);dome.scale.y=.75;
 box(control,1.35,.52,.12,0,.64,1.12,0xffd391,.14);box(control,.4,.7,.4,.5,1.45,0,dark,.06);const telescope=cylinder(control,.16,.24,1.3,.5,1.85,.2,cream,24);telescope.rotation.x=.9;
 const kiosk=anchorNormal(land,normalOf(destination('resume'))).g;
 cylinder(kiosk,.8,.94,.18,0,.09,0,cream,40);box(kiosk,1.05,1.7,.42,0,.98,0,0xa4b3cc,.18);box(kiosk,.76,1.05,.05,0,1.12,.235,dark,.08);for(let i=0;i<4;i++)box(kiosk,.51,.045,.02,0,1.4-i*.17,.27,cream,.01);box(kiosk,.4,.06,.18,0,.49,.3,mint,.02);
 const arcade=anchorNormal(land,normalOf(destination('arcade'))).g;
 cylinder(arcade,1.55,1.7,.22,0,.1,0,cream,48);const shell=sphere(arcade,1.5,0,.52,0,coral,3);shell.scale.y=.85;box(arcade,.85,1.15,.15,0,.65,1.38,dark,.24);for(const x of [-.9,.9]){const glow=sphere(arcade,.19,x,.9,1.05,cream,2);glow.material=lightMaterial(0xffd79c,1.4);}text3D(arcade,font,'PLAY',.28,0,1.48,1.03,cream,.03);
 const tower=anchorNormal(land,normalOf(destination('contact'))).g;
 cylinder(tower,.74,.88,.25,0,.12,0,mint,40);cylinder(tower,.1,.21,3.3,0,1.7,0,cream,16);const antenna=ring(tower,.55,.065,0,3.15,0,coral);antenna.rotation.x=Math.PI/2;cylinder(tower,.035,.035,1.4,0,3.6,0,dark,8);
 const indicators=new T.Group();land.add(indicators);const beaconMeshes:Partial<Record<DestinationId,T.Mesh>>={};
 for(const stop of destinations){const g=anchorNormal(indicators,normalOf(stop)).g;const marker=ring(g,stop.radius+.12,.035,0,.12,0,new T.Color(stop.color).getHex());marker.material=new T.MeshStandardMaterial({color:stop.color,emissive:stop.color,emissiveIntensity:.5,transparent:true,opacity:.32,depthWrite:false});beaconMeshes[stop.id]=marker;const pole=cylinder(g,.025,.025,.8,0,1.8,-stop.radius,cream,8);pole.material=lightMaterial(new T.Color(stop.color).getHex(),.7);text3D(g,font,stop.short.toUpperCase(),.19,0,2.25,-stop.radius,cream,.018);}
 const routeBeacon=new T.Group();routeBeacon.visible=false;indicators.add(routeBeacon);const beam=cylinder(routeBeacon,.045,.045,4,0,3,0,cream,12);beam.material=new T.MeshStandardMaterial({color:0xffdf9b,emissive:0xffdf9b,emissiveIntensity:1,transparent:true,opacity:.85});ring(routeBeacon,.65,.065,0,.3,0,cream).material=lightMaterial(0xffdf9b,2);
 const obstacles:Obstacle[]=navigationObstacles();
 const rockGeo=new T.IcosahedronGeometry(1,0);const rocks=new T.InstancedMesh(rockGeo,material(0xaca89f),370);const dummy=new T.Object3D();let count=0;
 while(count<370){const n=unit();if(obstacles.some(o=>n.angleTo(o.normal)*MOON_RADIUS<o.radius+1.1)||n.angleTo(new T.Vector3(.5,9.5,2.9).normalize())<.14)continue;const scale=.075+Math.pow(random(),3)*.4;dummy.position.copy(n).multiplyScalar(surfaceHeight(n)+scale*.2);dummy.quaternion.setFromUnitVectors(UP,n);dummy.rotateY(random()*6);dummy.scale.set(scale*(.7+random()),scale*.55,scale);dummy.updateMatrix();rocks.setMatrixAt(count++,dummy.matrix);}
 rocks.castShadow=true;rocks.receiveShadow=true;land.add(rocks);
 // Gravel, instanced rather than hundreds of separate draw calls.
 const gravel=new T.InstancedMesh(new T.IcosahedronGeometry(1,0),material(0x888780),1000);for(let i=0;i<1000;i++){const n=unit();const s=.02+random()*.047;dummy.position.copy(n).multiplyScalar(surfaceHeight(n)+s*.2);dummy.quaternion.setFromUnitVectors(UP,n);dummy.scale.set(s,s*.55,s);dummy.updateMatrix();gravel.setMatrixAt(i,dummy.matrix);}land.add(gravel);
 const robot=createRobot();robot.root.scale.setScalar(1.58);land.add(robot.root);
 const starGeo=new T.BufferGeometry();const stars=new Float32Array(1300*3);for(let i=0;i<1300;i++){const n=unit().multiplyScalar(100+random()*60);stars.set(n.toArray(),i*3);}starGeo.setAttribute('position',new T.BufferAttribute(stars,3));const starfield=new T.Points(starGeo,new T.PointsMaterial({color:0xc9d4eb,size:.105,sizeAttenuation:true,transparent:true,opacity:.65,depthWrite:false}));scene.add(starfield);
 const earthTex=await new T.TextureLoader().loadAsync('/assets/earth.jpg');earthTex.colorSpace=T.SRGBColorSpace;
 const earth=new T.Group();earth.position.set(-30,-2,-48);scene.add(earth);
 const globe=new T.Mesh(new T.SphereGeometry(5.5,64,48),new T.MeshStandardMaterial({map:earthTex,roughness:.85,emissive:0x142846,emissiveIntensity:.22}));globe.rotation.set(.15,2.5,-.18);earth.add(globe);
 const atmosphere=new T.Mesh(new T.SphereGeometry(5.59,48,32),new T.MeshBasicMaterial({color:0x569cef,transparent:true,opacity:.1,side:T.BackSide,depthWrite:false}));earth.add(atmosphere);
 const asteroids:T.Mesh[]=[];for(let i=0;i<17;i++){const n=unit().multiplyScalar(21+random()*13);if(n.y>4&&n.z>8)continue;const m=new T.Mesh(rockGeo,material(0x767681));m.position.copy(n);m.scale.setScalar(.15+random()*.4);m.rotation.set(random()*3,random()*3,random()*3);scene.add(m);asteroids.push(m);}
 const ufo=new T.Group();ufo.visible=false;scene.add(ufo);const hull=sphere(ufo,.82,0,0,0,0x91a7a7,3);hull.scale.set(1,.21,1);const glass=sphere(ufo,.42,0,.12,0,0x94c9ba,3);glass.scale.y=.72;
 ring(ufo,.63,.055,0,-.1,0,0xdcb880).material=lightMaterial(0xffd38f,1.3);for(let i=0;i<8;i++){const a=i*Math.PI/4;sphere(ufo,.045,Math.cos(a)*.7,-.045,Math.sin(a)*.7,0xffe4a9,1).material=lightMaterial(0xffd38f,2);}
 const trailGeo=new T.PlaneGeometry(.085,.13);trailGeo.rotateX(-Math.PI/2);const trails=new T.InstancedMesh(trailGeo,new T.MeshBasicMaterial({color:0x6e6961,transparent:true,opacity:.2,depthWrite:false,side:T.DoubleSide}),700);trails.count=0;land.add(trails);
 batchStatic(land,new Set([moon,robot.root,sculpture,indicators]));batchStatic(robot.body,new Set([robot.light,robot.antenna]));for(const wheel of robot.wheels)batchStatic(wheel);
 const destinationNormals=Object.fromEntries(destinations.map(s=>[s.id,normalOf(s)])) as Record<DestinationId,T.Vector3>;
 return{land,moon,robot,earth,globe,ufo,asteroids,sculpture,trails,obstacles,destinations:destinationNormals,beaconMeshes,routeBeacon,font};
}
export type LunarWorld=Awaited<ReturnType<typeof createLunarWorld>>;
