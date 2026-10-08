import test from 'node:test';
import assert from 'node:assert/strict';
// @ts-expect-error Small Node deployment module has no TypeScript declaration.
import {assertDeploymentAccount,NIKHIL_ACCOUNT_ID} from '../scripts/deployment-account.mjs';
test('deployment accepts only Nikhil’s account and rejects a conflicting environment',()=>{
 assert.doesNotThrow(()=>assertDeploymentAccount(NIKHIL_ACCOUNT_ID,undefined));
 assert.doesNotThrow(()=>assertDeploymentAccount(NIKHIL_ACCOUNT_ID,NIKHIL_ACCOUNT_ID));
 assert.throws(()=>assertDeploymentAccount('another-account',undefined),/Deployment blocked/);
 assert.throws(()=>assertDeploymentAccount(NIKHIL_ACCOUNT_ID,'another-account'),/Deployment blocked/);
});
