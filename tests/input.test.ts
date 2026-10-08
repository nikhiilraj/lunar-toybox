import test from 'node:test';
import assert from 'node:assert/strict';
import {KeyBuffer} from '../src/key-buffer';
test('a short key tap survives long enough for the physics frame, then releases',()=>{
 const keys=new KeyBuffer();keys.press('KeyW',0);keys.release('KeyW',3);
 assert.equal(keys.has('KeyW',16),true);
 assert.equal(keys.has('KeyW',120),false);
});
test('clear on blur or modal open immediately cancels held keys and pending taps',()=>{
 const keys=new KeyBuffer();keys.press('KeyW',0);keys.press('KeyD',0);keys.release('KeyD',1);keys.clear();
 assert.equal(keys.has('KeyW',16),false);assert.equal(keys.has('KeyD',16),false);
});
