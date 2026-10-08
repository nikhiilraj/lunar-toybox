// Edit this file to publish real projects and contact details. No model export needed.
export const identity={name:'Nikhil Raj',role:'',bio:'',email:'',github:'https://github.com/nikhiilraj',linkedin:'',availability:'',resume:'/resume/nikhil-raj-backend.pdf'};
export type {StopId as AreaId} from './destinations';
import type {StopId as AreaId} from './destinations';
export function safeLink(value?:string):string|null {
 if(!value||!value.trim())return null;
 try{const url=new URL(value.trim());return ['https:','mailto:'].includes(url.protocol)?url.href:null;}catch{return null;}
}
export interface Project{title:string;category:string;summary:string;contribution:string;image?:string;href?:string;placeholder:boolean}
export const project:Project={title:'The next thing starts here.',category:'SELECTED PROJECT / 01',summary:'A home for one project worth exploring in depth. The real story, screenshots, and details will live here.',contribution:'Project title, your role, the problem, and the outcome are ready to replace with your own work.',placeholder:true};
export const experiments=[{title:'Small ideas. Real possibilities.',description:'A place for experiments with technology and interaction.',tag:'EXPERIMENT / 01'},{title:'Always a work in progress.',description:'A place for the things that start with “what if?”.',tag:'EXPERIMENT / 02'}];
export const isArea=(value:string):value is AreaId=>['work','lab','about','resume','arcade','contact'].includes(value);

export function contactEmptyState(details:Pick<typeof identity,'email'|'linkedin'|'availability'>):string|null {const missing:string[]=[];if(!safeLink(details.email?`mailto:${details.email}`:undefined))missing.push('Email');if(!safeLink(details.linkedin))missing.push('LinkedIn');if(!details.availability.trim())missing.push('availability');if(!missing.length)return null;const names=missing.length===1?missing[0]:`${missing.slice(0,-1).join(', ')} and ${missing[missing.length-1]}`;return `${names[0].toUpperCase()+names.slice(1)} ${missing.length===1?'has':'have'} not been added yet.`;}
