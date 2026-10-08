import test from 'node:test';
import assert from 'node:assert/strict';
import { identity, safeLink } from '../src/content';
test('permanent identity uses the confirmed name',()=>assert.equal(identity.name,'Nikhil Raj'));
test('unset and dangerous contact links are unavailable',()=>{
 for(const url of [undefined,'','javascript:alert(1)','data:text/html,hi','http://example.com','//example.com']) assert.equal(safeLink(url),null);
 assert.equal(safeLink('https://example.com/work'),'https://example.com/work');
 assert.equal(safeLink('mailto:hello@example.com'),'mailto:hello@example.com');
});
