import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {assertDeploymentAccount} from './deployment-account.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const config=JSON.parse(readFileSync(new URL('../wrangler.jsonc',import.meta.url),'utf8'));
assertDeploymentAccount(config.account_id,process.env.CLOUDFLARE_ACCOUNT_ID);
const wrangler=fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js',import.meta.url));
const result=spawnSync(process.execPath,[wrangler,'deploy','--config','wrangler.jsonc'],{
  cwd:root,stdio:'inherit',env:{...process.env,CLOUDFLARE_ACCOUNT_ID:config.account_id},
});
if(result.error)throw result.error;
process.exit(result.status??1);
