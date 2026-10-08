export interface AudioPreferences {
  muted:boolean; music:boolean; effects:boolean; ambience:boolean;
  musicVolume:number; effectsVolume:number; ambienceVolume:number;
}
export const defaultAudioPreferences:AudioPreferences={muted:false,music:false,effects:true,ambience:true,musicVolume:.4,effectsVolume:.7,ambienceVolume:.5};
export const clamp=(value:number,min=0,max=1)=>Math.min(max,Math.max(min,value));
export function parseAudioPreferences(raw:string|null):AudioPreferences{
  const prefs={...defaultAudioPreferences};
  try{const value=JSON.parse(raw||'{}');if(!value||typeof value!=='object')return prefs;
    for(const key of ['muted','music','effects','ambience'] as const)if(typeof value[key]==='boolean')prefs[key]=value[key];
    for(const key of ['musicVolume','effectsVolume','ambienceVolume'] as const)if(typeof value[key]==='number'&&Number.isFinite(value[key]))prefs[key]=clamp(value[key]);
  }catch{/* Unavailable or corrupt storage must not break the game. */}
  return prefs;
}
export type VisitorAudioPhase='waiting'|'arriving'|'admiring'|'leaving';
export interface AudioFrame{dt:number;speed:number;throttle:number;worldActive:boolean;paused:boolean;visitorPhase:VisitorAudioPhase;visitorPan:number;}
export type AudioCue='engine-start'|'engine-rev'|'ufo-approach'|'ufo-depart';
export class AudioMix{
  preferences:AudioPreferences;
  unlocked=false;
  private drive=0;private driving=false;private started=false;private cooldown=0;private visitor:VisitorAudioPhase='waiting';
  constructor(preferences:AudioPreferences={...defaultAudioPreferences}){this.preferences={...preferences};}
  unlock(){this.unlocked=true;}
  setPreferences(patch:Partial<AudioPreferences>){this.preferences=parseAudioPreferences(JSON.stringify({...this.preferences,...patch}));}
  step(frame:AudioFrame){
    const p=this.preferences,dt=clamp(frame.dt,0,.1);this.cooldown=Math.max(0,this.cooldown-dt);
    const moving=frame.worldActive&&!frame.paused&&(frame.throttle>.08||frame.speed>.25);
    const master=this.unlocked&&!p.muted?1:0;const effects=master&&p.effects;
    const events:AudioCue[]=[];
    if(moving&&!this.driving&&this.cooldown===0){if(effects)events.push(this.started?'engine-rev':'engine-start');this.started=true;this.cooldown=.9;}
    if(frame.worldActive&&!frame.paused&&frame.visitorPhase!==this.visitor&&effects){if(frame.visitorPhase==='arriving')events.push('ufo-approach');if(frame.visitorPhase==='leaving')events.push('ufo-depart');}
    this.visitor=frame.visitorPhase;this.driving=moving;
    const target=frame.worldActive&&!frame.paused?clamp(frame.speed/5.4):0;
    this.drive+=(target-this.drive)*(1-Math.exp(-dt*7));
    const world=frame.worldActive&&!frame.paused?1:0;
    const visitorActive=frame.worldActive&&!frame.paused&&frame.visitorPhase!=='waiting';
    return{master,events,musicOn:p.music,ambientOn:p.ambience,
      idleGain:effects?(.34-.22*this.drive)*p.effectsVolume*world:0,
      driveGain:effects?this.drive*.62*p.effectsVolume*world:0,
      driveRate:.8+this.drive*.52,idleRate:.92+this.drive*.12,
      ambientGain:master&&p.ambience?.48*p.ambienceVolume*(frame.paused?.65:1):0,
      musicGain:master&&p.music?.65*p.musicVolume*(visitorActive?.68:frame.paused?.78:1):0,
      hoverGain:effects&&frame.worldActive&&!frame.paused&&frame.visitorPhase==='admiring'?.3*p.effectsVolume:0,
      visitorPan:clamp(frame.visitorPan,-1,1),visitorActive,
      cueGain:effects?.62*p.effectsVolume:0,
    };
  }
}
