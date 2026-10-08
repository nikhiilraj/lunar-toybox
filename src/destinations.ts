import {Vector3} from 'three';
import {MOON_RADIUS,UP} from './lunar-motion';
export type StopId='work'|'about'|'resume'|'arcade'|'lab'|'contact';
export type DestinationId=StopId|'lookout';
export interface Destination{id:DestinationId;label:string;short:string;action:string;color:string;normal:readonly [number,number,number];radius:number;range:number;}
export const stops:readonly Destination[]=[
 {id:'work',label:'Project Hangar',short:'Work',action:'Open projects',color:'#91b9a9',normal:[-1,9.5,-2.65],radius:2.8,range:4.4},
 {id:'about',label:'Mission Control',short:'About',action:'Meet Nikhil',color:'#e9c78c',normal:[-7.2,7.5,3.5],radius:1.55,range:3.25},
 {id:'resume',label:'Résumé Pod',short:'Résumé',action:'Read résumé',color:'#b1bdd8',normal:[1.6,8.7,7.4],radius:.85,range:2.5},
 {id:'arcade',label:'Lunar Arcade',short:'Arcade',action:'Play a game',color:'#df9f89',normal:[8,1,-5.4],radius:1.65,range:3.3},
 {id:'lab',label:'Experiment Lab',short:'Lab',action:'Try an experiment',color:'#9ecdc5',normal:[-6,-5,-6],radius:1.1,range:2.9},
 {id:'contact',label:'Signal Tower',short:'Contact',action:'Open contact',color:'#d5c7a2',normal:[6,-6,5],radius:.8,range:2.6},
];
export const lookout:Destination={id:'lookout',label:'Far-side Lookout',short:'Lookout',action:'Take a lunar postcard',color:'#e9e3d0',normal:[.2,-.93,-.31],radius:1.3,range:3.1};
export const destinations=[...stops,lookout];
export const destination=(id:DestinationId)=>destinations.find(s=>s.id===id)!;
export const normalOf=(stop:Destination)=>new Vector3(...stop.normal).normalize();
export const distanceTo=(normal:Vector3,stop:Destination)=>normal.angleTo(normalOf(stop))*MOON_RADIUS;
/** Search a ring beyond every footprint, retaining an unobstructed approach to the chosen stop. */
export function approachFor(stop:Destination){const n=normalOf(stop);let tangent=UP.clone().projectOnPlane(n);if(tangent.lengthSq()<.01)tangent=new Vector3(0,0,1).projectOnPlane(n);tangent.normalize();for(let i=0;i<72;i++){const offset=tangent.clone().applyAxisAngle(n,i*Math.PI/36);const normal=n.clone().multiplyScalar(Math.cos((stop.radius+.85)/MOON_RADIUS)).addScaledVector(offset,Math.sin((stop.radius+.85)/MOON_RADIUS)).normalize();if(destinations.every(other=>distanceTo(normal,other)>other.radius+.55))return{normal,heading:n.clone().projectOnPlane(normal).normalize()};}throw Error(`No safe approach for ${stop.label}`);}
