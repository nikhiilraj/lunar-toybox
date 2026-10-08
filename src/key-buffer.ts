export class KeyBuffer {
 private keys=new Map<string,{until:number;held:boolean}>();
 press(code:string,now:number){if(!this.keys.get(code)?.held)this.keys.set(code,{until:now+90,held:true});}
 release(code:string,now:number){const key=this.keys.get(code);if(!key)return;if(now>=key.until)this.keys.delete(code);else key.held=false;}
 has(code:string,now:number){const key=this.keys.get(code);if(!key)return false;if(key.held||now<key.until)return true;this.keys.delete(code);return false;}
 clear(){this.keys.clear();}
}
