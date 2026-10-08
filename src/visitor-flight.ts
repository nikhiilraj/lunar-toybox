import type {VisitorAudioPhase} from './audio-mix';
type Side='left'|'right'|'top'|'bottom';
type Point={x:number;y:number};
const sides:Side[]=['left','right','top','bottom'];
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
/** Camera-relative paths keep distant visitors legible while the moon rotates. */
export class VisitorFlight{
 entrySide:Side='left';exitSide:Side='right';
 private entry:Point={x:-1.5,y:.4};private exit:Point={x:1.5,y:.7};private hover:Point={x:-.65,y:.55};
 constructor(private random= Math.random){}
 private edge(side:Side):Point{const cross=(this.random()-.5)*1.6;return side==='left'?{x:-1.5,y:cross}:side==='right'?{x:1.5,y:cross}:side==='top'?{x:cross,y:1.5}:{x:cross,y:-1.5};}
 randomize(){
  const entryIndex=Math.floor(this.random()*4);this.entrySide=sides[entryIndex];this.exitSide=sides[(entryIndex+1+Math.floor(this.random()*3))%4];
  this.entry=this.edge(this.entrySide);this.exit=this.edge(this.exitSide);
  this.hover={x:(this.random()<.5?-1:1)*(.55+this.random()*.17),y:.43+this.random()*.2};
 }
 sample(phase:VisitorAudioPhase,elapsed:number,aspect:number){
  const rest={x:this.hover.x*(aspect<.8?.7:1),y:this.hover.y};
  const t=Math.min(1,Math.max(0,elapsed/7));let point=rest;
  if(phase==='arriving'){const ease=1-(1-t)**3;point={x:lerp(this.entry.x,rest.x,ease),y:lerp(this.entry.y,rest.y,ease)};}
  if(phase==='leaving'){const ease=t*t;point={x:lerp(rest.x,this.exit.x,ease),y:lerp(rest.y,this.exit.y,ease)};}
  return{...point,pan:Math.max(-1,Math.min(1,point.x))};
 }
}
