import test from 'node:test';
import assert from 'node:assert/strict';
import { identity, safeLink } from '../src/content';
test('permanent identity uses the confirmed name',()=>assert.equal(identity.name,'Nikhil Raj'));
test('unset and dangerous contact links are unavailable',()=>{
 for(const url of [undefined,'','javascript:alert(1)','data:text/html,hi','http://example.com','//example.com']) assert.equal(safeLink(url),null);
 assert.equal(safeLink('https://example.com/work'),'https://example.com/work');
 assert.equal(safeLink('mailto:hello@example.com'),'mailto:hello@example.com');
});
test('contact empty states track configured safe details',async()=>{const {contactEmptyState}=await import('../src/content');assert.equal(contactEmptyState({email:'',linkedin:'',availability:''}),'Email, LinkedIn and availability have not been added yet.');assert.equal(contactEmptyState({email:'nikhil@example.com',linkedin:'https://linkedin.com/in/example',availability:'By appointment'}),null);assert.equal(contactEmptyState({email:'nikhil@example.com',linkedin:'',availability:'By appointment'}),'LinkedIn has not been added yet.');assert.equal(contactEmptyState({email:'',linkedin:'javascript:alert(1)',availability:'By appointment'}),'Email and LinkedIn have not been added yet.');});
