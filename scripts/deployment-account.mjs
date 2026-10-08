export const NIKHIL_ACCOUNT_ID='063db0a1d331d97326b384d4c6847366';
export function assertDeploymentAccount(configured,environment){
 if(configured!==NIKHIL_ACCOUNT_ID||environment&&environment!==NIKHIL_ACCOUNT_ID){
  throw new Error('Deployment blocked: this portfolio must deploy only to Nikhil’s configured Cloudflare account.');
 }
}
