import test from 'node:test';import assert from 'node:assert/strict';
import {WorkshopAudio} from '../src/audio';
import type {HowlOptions} from 'howler';
class Voice{
 loaded=false;voices=new Map<number,boolean>();next=0;gain=0;pitch=1;pan=0;
 state(){return this.loaded?'loaded':'unloaded';}load(){this.loaded=true;}unload(){this.loaded=false;this.voices.clear();}
 play(id?:number){const n=id??++this.next;this.voices.set(n,true);return n;}pause(id?:number){for(const n of this.voices.keys())if(id===undefined||id===n)this.voices.set(n,false);}stop(){this.pause();}
 playing(id?:number){return id===undefined?[...this.voices.values()].some(Boolean):!!this.voices.get(id);}
 volume(value?:number){if(value!==undefined)this.gain=value;return this.gain;}rate(value?:number){if(!this.loaded&&value===undefined)throw Error('No voice yet');if(value!==undefined)this.pitch=value;return this.pitch;}stereo(value:number){this.pan=value;}
}
function fixture(){const voices=new Map<string,Voice>();const audio=new WorkshopAudio(()=>{},(options:HowlOptions)=>{const voice=new Voice();voices.set(String(options.src[0]).split('/').at(-1)!.replace('.ogg',''),voice);return voice;});return{audio,voices};}
const frame={dt:1/60,speed:3,throttle:1,worldActive:true,paused:false,visitorPhase:'arriving' as const,visitorPan:-.7};
test('unloaded diagnostics are safe and hidden-tab resume reuses loop and cue voices',()=>{const{audio,voices}=fixture();assert.doesNotThrow(()=>audio.diagnostics);audio.prime();audio.unlock();audio.update(frame);const idle=voices.get('engine-idle')!,start=voices.get('engine-start')!;assert.equal(idle.playing(),true);assert.equal(start.playing(),true);audio.pause();assert.ok([...voices.values()].every(v=>!v.playing()));audio.resume();assert.equal(idle.playing(),true);assert.equal(start.playing(),true);assert.equal(idle.next,1);assert.equal(start.next,1);audio.dispose();assert.ok([...voices.values()].every(v=>!v.playing()));});
test('muting remains silent through movement and returning from a hidden tab',()=>{const{audio,voices}=fixture();audio.prime();audio.unlock();audio.update(frame);audio.toggle();audio.pause();audio.resume();audio.update({...frame,speed:5});assert.ok([...voices.values()].every(v=>!v.playing()));audio.unlock();assert.ok([...voices.values()].every(v=>!v.playing()));audio.dispose();});
test('disabling music while muted does not unexpectedly unmute effects',()=>{const{audio}=fixture();audio.toggleMusic();audio.toggle();audio.toggleMusic();assert.equal(audio.snapshot.preferences.muted,true);assert.equal(audio.snapshot.preferences.music,false);audio.dispose();});
