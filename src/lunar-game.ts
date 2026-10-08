import * as T from 'three/webgpu';
import {VisitorFlight} from './visitor-flight';
import {LunarMotion,VisitorSchedule,visitorMessages,UP,homeNormal,MOON_RADIUS} from './lunar-motion';
import {createLunarWorld,surfaceHeight,type LunarWorld} from './lunar-world';
import {KeyBuffer} from './key-buffer';import {destinations,destination,normalOf,quickTravel,distanceTo,type DestinationId}from './destinations';import type{WorkshopAudio}from './audio';
export interface LunarState{ready:boolean;started:boolean;nearby:DestinationId|null;visitor:string|null;visitorX:number;visitorY:number;distance:number;phase:string;fps:number;error:string|null;normal:[number,number,number];target:DestinationId|null;targetDistance:number;routeProgress:number;}
export class LunarGame{
 scene=new T.Scene();camera=new T.PerspectiveCamera(38,1,.1,220);renderer!:T.WebGPURenderer;world!:LunarWorld;motion=new LunarMotion();visitor=new VisitorSchedule();private flight=new VisitorFlight();private visitorPan=0;
 state:LunarState={ready:false,started:false,nearby:null,visitor:null,visitorX:50,visitorY:28,distance:0,phase:'waiting',fps:0,error:null,normal:homeNormal.toArray(),target:null,targetDistance:0,routeProgress:0};
 private photo=false;private routeStart=0;private captureRequest:((canvas:HTMLCanvasElement)=>void)|null=null;private keys=new KeyBuffer();private touch={x:0,z:0};private paused=false;private visitors=true;private disposed=false;private cleanup:(()=>void)[]=[];private time=0;private previous=0;private zoomBlend=0;private frame=new T.Quaternion().setFromUnitVectors(UP,homeNormal);private orbit={theta:.1,phi:.86,zoom:1};private dirty=0;private trailIndex=0;private trailDistance=0;private drag: {x:number;y:number}|null=null;private pointers=new Map<number,{x:number;y:number}>();private pinch=0;private fps:number[]=[];
 private reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;private low=innerWidth<700||new URLSearchParams(location.search).get('quality')==='low';
 constructor(private container:HTMLElement,private audio:WorkshopAudio,private notify:(state:LunarState)=>void,private interact:(area:DestinationId)=>void){}
 private emit(){this.notify({...this.state});}
 async init(){try{
  this.scene.background=new T.Color(0x13121c);
  this.renderer=new T.WebGPURenderer({antialias:true,forceWebGL:new URLSearchParams(location.search).get('renderer')==='webgl',powerPreference:'high-performance'});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,this.low?1.25:1.6));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.05;this.container.appendChild(this.renderer.domElement);await this.renderer.init();
  this.scene.add(new T.AmbientLight(0xc4c8dc,.62));this.scene.add(new T.HemisphereLight(0xffeed6,0x697384,.85));
  const sun=new T.DirectionalLight(0xffefd8,2.8);sun.position.set(-16,28,18);sun.castShadow=true;sun.shadow.mapSize.setScalar(this.low?1024:2048);sun.shadow.camera.left=sun.shadow.camera.bottom=-17;sun.shadow.camera.right=sun.shadow.camera.top=17;sun.shadow.camera.near=.1;sun.shadow.camera.far=75;sun.shadow.normalBias=.035;sun.shadow.bias=-.00008;this.scene.add(sun);
  const fill=new T.DirectionalLight(0xadccec,1);fill.position.set(12,5,-16);this.scene.add(fill);
  const underside=new T.DirectionalLight(0xaab3ca,1.2);underside.position.set(2,-20,7);this.scene.add(underside);
  this.world=await createLunarWorld(this.scene);if(this.disposed){this.dispose();return;}
  this.updateRobot(0);this.resize();this.updateCamera(1,true);await this.renderer.compileAsync(this.scene,this.camera);this.renderer.render(this.scene,this.camera);this.state.ready=true;this.audio.prime();this.audio.setWorldActive(true);this.installInput();this.emit();this.renderer.setAnimationLoop(t=>this.tick(t));
 }catch(e){console.error('Lunar world failed',e);this.state.error='The 3D world could not load. Your portfolio is still available below.';this.emit();this.renderer?.setAnimationLoop(null);}}
 private listen(target:EventTarget,type:string,callback:EventListener,options?:AddEventListenerOptions){target.addEventListener(type,callback,options);this.cleanup.push(()=>target.removeEventListener(type,callback,options));}
 private installInput(){
  const canvas=this.renderer.domElement;canvas.setAttribute('aria-label','Drag to orbit the moon. Use WASD or arrow keys to move the robot.');canvas.tabIndex=0;
  this.listen(window,'resize',()=>this.resize());
  this.listen(window,'keydown',((e:KeyboardEvent)=>{if(this.paused)return;if(e.target instanceof HTMLElement&&e.target.closest('button,a,input,textarea,select,[contenteditable=true],[role=dialog]'))return;
   const movement=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowLeft','ArrowDown','ArrowRight'];
   if(movement.includes(e.code)){e.preventDefault();this.start();this.keys.press(e.code,performance.now());}if(e.code.startsWith('Shift'))this.keys.press(e.code,performance.now());
   if(!e.repeat&&(e.code==='KeyE'||e.code==='Enter')&&this.state.nearby){e.preventDefault();this.interact(this.state.nearby);}if(e.code==='KeyR'){e.preventDefault();this.home();}
  })as EventListener);
  this.listen(window,'keyup',((e:KeyboardEvent)=>this.keys.release(e.code,performance.now()))as EventListener);
  this.listen(window,'blur',()=>this.clear());this.listen(document,'visibilitychange',()=>{this.clear();this.previous=0;if(document.hidden)this.audio.pause();else this.audio.resume();});
  this.listen(canvas,'pointerdown',((e:PointerEvent)=>{if(this.paused&&!this.photo)return;canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});this.drag={x:e.clientX,y:e.clientY};if(this.pointers.size===2){const p=[...this.pointers.values()];this.pinch=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);}})as EventListener);
  this.listen(canvas,'pointermove',((e:PointerEvent)=>{if(this.paused&&!this.photo||!this.pointers.has(e.pointerId))return;this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(this.pointers.size===2){const p=[...this.pointers.values()];const distance=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);if(this.pinch>0)this.orbit.zoom=T.MathUtils.clamp(this.orbit.zoom*this.pinch/distance,.76,1.6);this.pinch=distance;}else if(this.drag){this.orbit.theta-=(e.clientX-this.drag.x)*.005;this.orbit.phi=T.MathUtils.clamp(this.orbit.phi+(e.clientY-this.drag.y)*.005,.12,Math.PI-.12);}this.drag={x:e.clientX,y:e.clientY};})as EventListener);
  const release=((e:PointerEvent)=>{this.pointers.delete(e.pointerId);this.drag=null;this.pinch=0;})as EventListener;this.listen(canvas,'pointerup',release);this.listen(canvas,'pointercancel',release);this.listen(canvas,'lostpointercapture',release);
  this.listen(canvas,'wheel',((e:WheelEvent)=>{if(this.paused&&!this.photo)return;e.preventDefault();this.orbit.zoom=T.MathUtils.clamp(this.orbit.zoom+e.deltaY*.0006,.76,1.6);})as EventListener,{passive:false});
 }
 start(){if(!this.state.ready||this.paused)return;this.audio.unlock();if(!this.state.started){this.state.started=true;this.emit();}}
 setTouch(x:number,z:number){if(this.paused)return;this.touch={x,z};if(Math.hypot(x,z)>.02)this.start();}
 clear(){this.keys.clear();this.touch={x:0,z:0};this.pointers.clear();this.drag=null;this.motion.stop();}
 setPaused(paused:boolean){this.paused=paused;this.clear();}
 setVisitors(enabled:boolean){this.visitors=enabled;if(!enabled){this.visitor.reset();this.audio.stopVisitor();this.state.phase='waiting';this.state.visitor=null;if(this.world)this.world.ufo.visible=false;this.emit();}}
 hailVisitor(){if(!this.state.ready||!this.visitors)return;this.flight.randomize();this.audio.stopVisitor();this.visitor.phase="arriving";this.state.phase="arriving";this.visitor.elapsed=0;this.visitor.message=Math.floor(Math.random()*visitorMessages.length);}
 home(){this.motion.reset();this.frame.setFromUnitVectors(UP,homeNormal);this.orbit={theta:.1,phi:.86,zoom:1};this.clear();}
 setTarget(id:DestinationId|null){this.state.target=id;this.routeStart=id?distanceTo(this.motion.normal,destination(id)):0;this.state.targetDistance=this.routeStart;this.state.routeProgress=0;this.world.routeBeacon.visible=!!id;if(id){const n=normalOf(destination(id));this.world.routeBeacon.position.copy(n).multiplyScalar(surfaceHeight(n));this.world.routeBeacon.quaternion.setFromUnitVectors(UP,n);}this.emit();}
 travel(id:DestinationId){if(!this.state.ready)return;const approach=quickTravel(this.motion,destination(id),this.world.obstacles);this.clear();this.frame.setFromUnitVectors(UP,approach.normal);this.orbit={theta:.1,phi:.86,zoom:1};this.state.started=true;this.zoomBlend=1;this.state.nearby=id;this.state.normal=approach.normal.toArray();this.updateRobot(0);this.updateCamera(1,true);this.emit();}
 setPhoto(enabled:boolean){this.photo=enabled;this.setPaused(enabled);this.state.visitor=null;this.emit();}
 capturePostcard():Promise<Blob>{return new Promise((resolve,reject)=>{if(!this.state.ready||!this.photo){reject(Error('Enter photo mode before exporting.'));return;}if(this.captureRequest){reject(Error('A postcard is already being prepared.'));return;}this.captureRequest=canvas=>{try{const print=document.createElement('canvas');print.width=canvas.width;print.height=canvas.height;const context=print.getContext('2d');if(!context)throw Error('Your browser could not prepare a postcard.');context.drawImage(canvas,0,0);const size=Math.max(14,Math.round(print.width*.02));context.fillStyle='#15151fe6';context.fillRect(0,print.height-size*4,print.width,size*4);context.fillStyle='#f3e8d1';context.font=`600 ${size}px Manrope, sans-serif`;context.fillText('NIKHIL RAJ / LUNAR TOYBOX',size*1.5,print.height-size*2);context.font=`${Math.round(size*.7)}px Manrope, sans-serif`;context.fillText('A postcard from the other side.',size*1.5,print.height-size*.8);print.toBlob(blob=>blob?resolve(blob):reject(Error('PNG export failed. Please try again.')),'image/png');}catch(error){reject(error);}};});}
 private resize(){if(!this.renderer)return;this.renderer.setSize(this.container.clientWidth,this.container.clientHeight);this.camera.aspect=this.container.clientWidth/this.container.clientHeight;this.camera.updateProjectionMatrix();if(this.world)this.world.earth.position.x=this.camera.aspect<.8?-15:-30;}
 private updateCamera(dt:number,snap=false){
  this.zoomBlend=T.MathUtils.damp(this.zoomBlend,this.state.started?1:0,this.reduced?100:1.45,dt);
  const narrow=this.camera.aspect<.8;const fullDistance=narrow?64:42;const distance=T.MathUtils.lerp(narrow?44:20,fullDistance,this.zoomBlend)*this.orbit.zoom;
  const target=this.motion.normal.clone().multiplyScalar(T.MathUtils.lerp(narrow?6.6:10.6,2.7,this.zoomBlend));
  const offset=new T.Vector3().setFromSphericalCoords(distance,this.orbit.phi,this.orbit.theta).applyQuaternion(this.frame);
  const position=target.clone().add(offset);this.camera.position.lerp(position,snap?1:1-Math.exp(-dt*5));
  this.camera.up.copy(UP).applyQuaternion(this.frame);this.camera.lookAt(target);
 }
 private updateRobot(dt:number){
  const n=this.motion.normal;const r=this.world.robot;const right=new T.Vector3().crossVectors(n,this.motion.heading).normalize();
  const basis=new T.Matrix4().makeBasis(right,n,this.motion.heading);r.root.quaternion.setFromRotationMatrix(basis);r.root.position.copy(n).multiplyScalar(surfaceHeight(n)+.035);
  const speed=this.motion.velocity.length();r.body.rotation.x=T.MathUtils.damp(r.body.rotation.x,-speed*.018,8,dt);for(const w of r.wheels)w.rotation.x+=speed*dt/.32;
  if(speed>.3&&this.motion.distance-this.trailDistance>.15){this.trailDistance=this.motion.distance;const dummy=new T.Object3D();for(const side of [-1,1]){const mark=n.clone().addScaledVector(right,side*.84/MOON_RADIUS).normalize();dummy.position.copy(mark).multiplyScalar(surfaceHeight(mark)+.027);dummy.quaternion.copy(r.root.quaternion);dummy.updateMatrix();this.world.trails.setMatrixAt(this.trailIndex%700,dummy.matrix);this.trailIndex++;}this.world.trails.count=Math.min(700,this.trailIndex);this.world.trails.instanceMatrix.needsUpdate=true;}
 }
 private updateVisitor(dt:number){
  const previous=this.visitor.phase;const phase=this.visitor.step(dt,this.visitors,this.paused);if(phase==='arriving'&&previous!=='arriving')this.flight.randomize();const ufo=this.world.ufo;ufo.visible=this.visitors&&phase!=='waiting';this.state.phase=phase;
  if(!ufo.visible){this.state.visitor=null;this.visitorPan=0;return;}
  const right=new T.Vector3().setFromMatrixColumn(this.camera.matrixWorld,0),up=new T.Vector3().setFromMatrixColumn(this.camera.matrixWorld,1);
  const forward=this.camera.getWorldDirection(new T.Vector3());const distance=55;const halfHeight=Math.tan(T.MathUtils.degToRad(this.camera.fov/2))*distance;const halfWidth=halfHeight*this.camera.aspect;
  const flight=this.flight.sample(phase,this.visitor.elapsed,this.camera.aspect);this.visitorPan=flight.pan;
  ufo.position.copy(this.camera.position).addScaledVector(forward,distance).addScaledVector(up,halfHeight*flight.y).addScaledVector(right,halfWidth*flight.x);ufo.quaternion.copy(this.camera.quaternion);ufo.rotateX(.28);ufo.rotateZ(Math.sin(this.time*.7)*.07);if(!this.reduced)ufo.position.addScaledVector(up,Math.sin(this.time*1.4)*.16);
  this.state.visitor=phase==='admiring'&&!this.photo?visitorMessages[this.visitor.message]:null;
  const point=ufo.position.clone().addScaledVector(up,-1.3).project(this.camera);const bubbleWidth=this.container.clientWidth<600?205:242;const inset=(bubbleWidth/2+16)/this.container.clientWidth*100;
  this.state.visitorX=T.MathUtils.clamp((point.x+1)*50,inset,100-inset);this.state.visitorY=T.MathUtils.clamp((1-point.y)*50,17,70);
 }
 private tick(timestamp:number){if(this.disposed||document.hidden){this.previous=0;return;}const raw=this.previous?(timestamp-this.previous)/1000:1/60;this.previous=timestamp;const dt=Math.min(.04,Math.max(0,raw));this.time+=dt;let throttle=0;
  if(!this.paused){const now=performance.now();const has=(s:string)=>this.keys.has(s,now);const x=Number(has('KeyD')||has('ArrowRight'))-Number(has('KeyA')||has('ArrowLeft'))+this.touch.x;const z=Number(has('KeyS')||has('ArrowDown'))-Number(has('KeyW')||has('ArrowUp'))+this.touch.z;
   const right=new T.Vector3().setFromMatrixColumn(this.camera.matrixWorld,0).projectOnPlane(this.motion.normal).normalize();if(right.lengthSq()<.1)right.set(1,0,0).applyQuaternion(this.frame);
   const forward=new T.Vector3().crossVectors(this.motion.normal,right).normalize();const direction=right.multiplyScalar(x).addScaledVector(forward,-z);if(direction.length()>1)direction.normalize();
   throttle=direction.length();const q=this.motion.step(direction,dt,has('ShiftLeft')||has('ShiftRight'),this.world.obstacles);this.frame.premultiply(q);this.updateRobot(dt);
   if(!this.reduced){this.world.globe.rotation.y+=dt*.012;this.world.sculpture.rotation.y+=dt*.3;this.world.sculpture.rotation.z=Math.sin(this.time*.3)*.2;for(const a of this.world.asteroids)a.rotation.y+=dt*.035;}
  }
  let nearest:DestinationId|null=null;let best=Infinity;for(const stop of destinations){const d=distanceTo(this.motion.normal,stop);if(d<stop.range&&d<best){best=d;nearest=stop.id;}const marker=this.world.beaconMeshes[stop.id];if(marker){const mat=marker.material as T.MeshBasicMaterial;mat.opacity=stop.id===nearest?.8:.3;}}
  this.state.nearby=nearest;this.state.normal=this.motion.normal.toArray();this.state.distance=this.motion.distance;if(this.state.target){this.state.targetDistance=distanceTo(this.motion.normal,destination(this.state.target));this.state.routeProgress=this.routeStart?T.MathUtils.clamp(1-this.state.targetDistance/this.routeStart,0,1):1;this.world.routeBeacon.rotateY(dt*.6);}
  this.updateCamera(dt);this.updateVisitor(dt);this.audio.update({dt,speed:this.motion.velocity.length(),throttle,worldActive:true,paused:this.paused,visitorPhase:this.visitor.phase,visitorPan:this.visitorPan});
  if(this.photo)this.world.ufo.visible=false;this.renderer.render(this.scene,this.camera);if(this.captureRequest){const request=this.captureRequest;this.captureRequest=null;request(this.renderer.domElement);}if(raw<.2)this.fps.push(raw);if(this.fps.length>90)this.fps.shift();if(++this.dirty%8===0){this.state.fps=Math.round(this.fps.length/this.fps.reduce((a,b)=>a+b,0));this.emit();}
  if(new URLSearchParams(location.search).has('debug')){this.container.dataset.normal=this.motion.normal.toArray().map(n=>n.toFixed(3)).join(',');this.container.dataset.radius=(this.world.robot.root.position.length()).toFixed(3);this.container.dataset.camera=this.camera.position.toArray().map(n=>n.toFixed(2)).join(',');this.container.dataset.phase=this.visitor.phase;this.container.dataset.fps=String(this.state.fps);this.container.dataset.visitorEntry=this.flight.entrySide;this.container.dataset.visitorExit=this.flight.exitSide;this.container.dataset.visitorPan=this.visitorPan.toFixed(3);this.container.dataset.audio=JSON.stringify(this.audio.diagnostics);}
 }
 dispose(){this.disposed=true;this.audio.setWorldActive(false);this.cleanup.forEach(fn=>fn());this.renderer?.setAnimationLoop(null);this.scene.traverse(obj=>{if(obj instanceof T.Mesh){obj.geometry.dispose();for(const mat of Array.isArray(obj.material)?obj.material:[obj.material])mat.dispose();}});this.renderer?.dispose();this.renderer?.domElement.remove();}
}
