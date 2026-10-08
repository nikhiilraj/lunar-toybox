import {Howl,Howler,type HowlOptions} from 'howler';
import {AudioMix,parseAudioPreferences,type AudioFrame,type AudioPreferences,type AudioCue} from './audio-mix';
export const AUDIO_STORAGE_KEY='nikhil-lunar-audio-v1';
export function readAudioPreferences(){if(typeof window==='undefined')return parseAudioPreferences(null);try{return parseAudioPreferences(localStorage.getItem(AUDIO_STORAGE_KEY));}catch{return parseAudioPreferences(null);}}
export interface AudioSnapshot{preferences:AudioPreferences;unlocked:boolean;loading:boolean;errors:string[];}
const loopNames=['engine-idle','engine-drive','void-ambience','moon-music','ufo-hover'] as const;
const names=[...loopNames,'engine-start','engine-rev','ufo-approach','ufo-depart'] as const;
type SoundName=typeof names[number];
const blankFrame:AudioFrame={dt:1/60,speed:0,throttle:0,worldActive:false,paused:false,visitorPhase:'waiting',visitorPan:0};
export interface AudioVoice{
 state():string;load():unknown;unload():unknown;play(id?:number):number;pause(id?:number):unknown;stop():unknown;playing(id?:number):boolean;
 volume(value?:number):unknown;rate(value?:number):unknown;stereo(value:number):unknown;
}
export class WorkshopAudio{
 readonly mix=new AudioMix(readAudioPreferences());
 private sounds={} as Record<SoundName,AudioVoice>;
 private loops=new Map<SoundName,{id:number;playing:boolean}>();
 private cues=new Map<AudioCue,{id:number;paused:boolean}>();
 private pending=new Set<string>();private errors=new Set<string>();private suspended=false;private disposed=false;
 private frame:AudioFrame={...blankFrame};private listener?:()=>void;
 constructor(private notify:(state:AudioSnapshot)=>void=()=>{},makeSound:(options:HowlOptions)=>AudioVoice=options=>new Howl(options)){
  for(const name of names){this.sounds[name]=makeSound({src:[`/assets/audio/${name}.ogg`,`/assets/audio/${name}.mp3`],preload:false,loop:(loopNames as readonly string[]).includes(name),volume:0,
   onload:()=>{this.pending.delete(name);this.errors.delete(name);this.emit();this.render();},
   onloaderror:()=>{this.pending.delete(name);this.errors.add(name);this.emit();},
   onplayerror:()=>{this.errors.add(name);const active=this.loops.get(name);if(active)active.playing=false;this.emit();},
  });}
  if(typeof document!=='undefined'){this.listener=()=>document.hidden?this.pause():this.resume();document.addEventListener('visibilitychange',this.listener);}
 }
 get diagnostics(){return{context:Howler.ctx?.state??'unavailable',unlocked:this.mix.unlocked,muted:this.mix.preferences.muted,music:this.mix.preferences.music,hidden:this.suspended,sounds:Object.fromEntries(names.map(name=>[name,{loaded:this.sounds[name].state(),playing:this.sounds[name].playing(),volume:this.sounds[name].volume(),rate:this.sounds[name].state()==='loaded'?this.sounds[name].rate():null,pan:name.startsWith('ufo')?this.frame.visitorPan:0}]))};}
 get enabled(){return !this.mix.preferences.muted;}
 get snapshot():AudioSnapshot{return{preferences:{...this.mix.preferences},unlocked:this.mix.unlocked,loading:this.pending.size>0,errors:[...this.errors]};}
 private emit(){if(!this.disposed)this.notify(this.snapshot);}
 private load(name:SoundName){const s=this.sounds[name];if(s.state()==='unloaded'&&!this.pending.has(name)&&!this.errors.has(name)){this.pending.add(name);s.load();}}
 prime(){for(const name of names.filter(name=>name!=='moon-music'))this.load(name);this.emit();}
 unlock(){if(this.disposed||this.mix.unlocked&&this.errors.size===0&&Howler.ctx?.state==='running')return;this.mix.unlock();void Howler.ctx?.resume().catch(()=>{});for(const name of this.errors){this.sounds[name as SoundName].unload();this.loops.delete(name as SoundName);this.cues.delete(name as AudioCue);}this.errors.clear();this.emit();this.render();}
 setPreferences(patch:Partial<AudioPreferences>){this.mix.setPreferences(patch);try{if(typeof window!=='undefined')localStorage.setItem(AUDIO_STORAGE_KEY,JSON.stringify(this.mix.preferences));}catch{}if(this.mix.preferences.muted||!this.mix.preferences.effects){for(const name of ['engine-start','engine-rev','ufo-approach','ufo-depart'] as const)this.sounds[name].stop();this.cues.clear();}this.render();this.emit();}
 toggle(){const muted=this.enabled;this.setPreferences({muted});if(!muted)this.unlock();return this.enabled;}
 toggleMusic(){const music=!this.mix.preferences.music;this.setPreferences(music?{music,muted:false}:{music});if(music)this.unlock();}
 update(frame:AudioFrame){if(this.disposed)return;this.frame=frame;this.render();}
 setWorldActive(active:boolean){this.frame={...this.frame,worldActive:active,speed:0,throttle:0,visitorPhase:'waiting'};if(!active){this.stopVisitor();for(const name of ['engine-start','engine-rev'] as const){this.sounds[name].stop();this.cues.delete(name);}}this.render();}
 private loop(name:SoundName,volume:number,rate=1,pan=0){
  const sound=this.sounds[name];let voice=this.loops.get(name);
  const active=!this.suspended&&!this.errors.has(name)&&volume>.0001;
  if(active){this.load(name);if(sound.state()!=='loaded')return;sound.volume(volume);sound.rate(rate);if(name==='ufo-hover')sound.stereo(pan);if(!voice){voice={id:sound.play(),playing:true};this.loops.set(name,voice);}else if(!voice.playing){sound.play(voice.id);voice.playing=true;}}
  else if(voice?.playing){sound.pause(voice.id);voice.playing=false;}
 }
 private render(){if(this.disposed)return;const out=this.mix.step(this.suspended?{...this.frame,paused:true}:this.frame);const audible=this.suspended?0:out.master;
  this.loop('engine-idle',out.idleGain*audible,out.idleRate);
  this.loop('engine-drive',out.driveGain*audible,out.driveRate);
  this.loop('void-ambience',out.ambientGain*audible);
  this.loop('moon-music',out.musicGain*audible);
  this.loop('ufo-hover',out.hoverGain*audible,1,out.visitorPan);
  for(const [name,voice]of this.cues){const sound=this.sounds[name];if(sound.state()!=='loaded')continue;if(name.startsWith('ufo'))sound.stereo(out.visitorPan);sound.volume(out.cueGain*(name.startsWith('ufo')?.7:1)*audible);if((this.frame.paused||this.suspended)&&sound.playing(voice.id)){sound.pause(voice.id);voice.paused=true;}else if(!this.frame.paused&&!this.suspended&&voice.paused&&audible){sound.play(voice.id);voice.paused=false;}}
  for(const cue of out.events){if(!audible||this.errors.has(cue))continue;this.load(cue);const sound=this.sounds[cue];sound.stop();sound.volume(out.cueGain*(cue.startsWith('ufo')?.7:1));if(cue.startsWith('ufo'))sound.stereo(out.visitorPan);this.cues.set(cue,{id:sound.play(),paused:false});}
 }
 stopVisitor(){for(const name of ['ufo-approach','ufo-hover','ufo-depart'] as const){this.sounds[name].stop();this.loops.delete(name);this.cues.delete(name as AudioCue);}this.frame.visitorPhase='waiting';this.render();}
 pause(){if(this.suspended)return;this.suspended=true;for(const [name,voice]of this.loops){this.sounds[name].pause(voice.id);voice.playing=false;}for(const [name,voice]of this.cues){if(this.sounds[name].playing(voice.id)){this.sounds[name].pause(voice.id);voice.paused=true;}}}
 resume(){if(!this.suspended)return;this.suspended=false;this.render();}
 dispose(){if(this.disposed)return;this.disposed=true;if(this.listener)document.removeEventListener('visibilitychange',this.listener);for(const s of Object.values(this.sounds))s.unload();this.loops.clear();}
}
