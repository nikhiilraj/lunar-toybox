import {stops,type StopId} from './destinations';
export const STAMP_KEY='lunar-toybox.visited.v1';
const valid=(value:unknown):value is StopId=>typeof value==='string'&&stops.some(s=>s.id===value);
export function readStamps(storage:Pick<Storage,'getItem'>|undefined=undefined):StopId[]{try{const source=storage??localStorage;const value:unknown=JSON.parse(source.getItem(STAMP_KEY)||'[]');return Array.isArray(value)?[...new Set(value.filter(valid))]:[];}catch{return[];}}
export function writeStamps(stamps:StopId[],storage:Pick<Storage,'setItem'>|undefined=undefined){try{(storage??localStorage).setItem(STAMP_KEY,JSON.stringify([...new Set(stamps.filter(valid))]));}catch{/* Optional souvenirs never block exploration. */}}
export function readBest(key:'snake'|'ladders'){try{const value=Number(localStorage.getItem(`lunar-toybox.best.${key}`));return Number.isSafeInteger(value)&&value>0?value:0;}catch{return 0;}}
export function saveBest(key:'snake'|'ladders',value:number){try{localStorage.setItem(`lunar-toybox.best.${key}`,String(value));}catch{/* A game remains playable without storage. */}}
