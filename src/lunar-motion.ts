import {Vector3,Quaternion} from 'three';
export const MOON_RADIUS=9.5;
export const UP=new Vector3(0,1,0);
export const homeNormal=new Vector3(.5,MOON_RADIUS,2.9).normalize();
export interface Obstacle{normal:Vector3;radius:number}
export class LunarMotion{
 normal=homeNormal.clone(); heading=new Vector3(0,0,1).projectOnPlane(this.normal).normalize(); velocity=new Vector3(); distance=0;
 reset(){this.normal.copy(homeNormal);this.heading.set(0,0,1).projectOnPlane(this.normal).normalize();this.velocity.set(0,0,0);}
 stop(){this.velocity.set(0,0,0);}
 step(direction:Vector3,delta:number,boost=false,obstacles:Obstacle[]=[]){
  const dt=Math.max(0,Math.min(delta,.04));const move=direction.clone().projectOnPlane(this.normal);const magnitude=Math.min(1,move.length());
  if(move.lengthSq()>1e-8)move.normalize().multiplyScalar(magnitude*(boost?5.4:3.25));
  this.velocity.lerp(move,1-Math.exp(-dt*(magnitude>.01?8:12))).projectOnPlane(this.normal);
  const speed=this.velocity.length();if(speed<.002)return new Quaternion();
  const axis=new Vector3().crossVectors(this.normal,this.velocity).normalize();const travel=speed*dt;
  const rotation=new Quaternion().setFromAxisAngle(axis,travel/MOON_RADIUS);
  const next=this.normal.clone().applyQuaternion(rotation).normalize();
  for(const obstacle of obstacles){
   const min=(obstacle.radius+.5)/MOON_RADIUS;
   if(next.angleTo(obstacle.normal)<min&&next.angleTo(obstacle.normal)<this.normal.angleTo(obstacle.normal)){
    const toward=obstacle.normal.clone().projectOnPlane(this.normal).normalize();this.velocity.addScaledVector(toward,-Math.max(0,this.velocity.dot(toward)));return new Quaternion();
   }
  }
  this.normal.copy(next);this.velocity.applyQuaternion(rotation).projectOnPlane(next);this.heading.applyQuaternion(rotation).projectOnPlane(next).normalize();
  if(magnitude>.01)this.heading.lerp(this.velocity.clone().normalize(),1-Math.exp(-dt*12)).normalize();
  this.distance+=travel;return rotation;
 }
}
export const visitorMessages=[
 'Came for the moon. Stayed for Nikhil’s ideas.',
 'Mission update: this little workshop has big energy.',
 'Nice work, Nikhil. The mothership is taking notes.',
 'Just passing through. Excellent parking. Excellent ideas.',
 'Earth called. They want their curious human back.',
];
export type VisitorPhase='waiting'|'arriving'|'admiring'|'leaving';
export class VisitorSchedule{
 phase:VisitorPhase='waiting';elapsed=0;wait:number;message=0;
 constructor(private random:()=>number=Math.random,first=true){this.wait=first?12+random()*9:this.nextInterval();}
 nextInterval(){return 38+Math.max(0,Math.min(1,this.random()))*47;}
 reset(){this.phase='waiting';this.elapsed=0;this.wait=this.nextInterval();}
 step(dt:number,enabled=true,paused=false){
  if(!enabled){if(this.phase!=='waiting')this.reset();return this.phase;}
  if(paused)return this.phase;
  this.elapsed+=Math.max(0,Math.min(.1,dt));
  const duration=this.phase==='waiting'?this.wait:this.phase==='admiring'?5:7;
  if(this.elapsed>=duration){this.elapsed=0;this.phase=this.phase==='waiting'?'arriving':this.phase==='arriving'?'admiring':this.phase==='admiring'?'leaving':'waiting';if(this.phase==='arriving')this.message=Math.floor(this.random()*visitorMessages.length)%visitorMessages.length;if(this.phase==='waiting')this.wait=this.nextInterval();}
  return this.phase;
 }
}

export const interactionRange=(area:string)=>area==='work'?4.2:3.3;
