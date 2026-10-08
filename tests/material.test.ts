import test from 'node:test';
import assert from 'node:assert/strict';
import {indicatorMaterial,material,palette} from '../src/assets';
test('changing an interactive indicator does not recolor static props',()=>{
 const prop=material(palette.amber),indicator=indicatorMaterial(palette.amber);
 const original=prop.color.getHex();indicator.color.setHex(0x8fba79);
 assert.equal(prop.color.getHex(),original);
});
