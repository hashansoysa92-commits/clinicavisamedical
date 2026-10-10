const {createApp}=require('./app.cjs');
const {CoordinatedDrive}=require('./coordinated-drive.cjs');
function createHandler({query,env=process.env,Store=CoordinatedDrive,appFactory=createApp}){
 let app=null,chain=Promise.resolve();
 async function run(request){
  const send=(status,value)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
  if(request.method!=='POST')return send(405,{error:'POST required'});
  const origin=request.headers.get('origin'),site=env.APP_URL||env.URL;
  if(origin&&(!site||origin!==new URL(site).origin))return send(403,{error:'Origin denied'});
  if(!request.headers.get('content-type')?.startsWith('application/json'))return send(415,{error:'JSON required'});
  if(env.CONTEXT&&env.CONTEXT!=='production')return send(503,{error:'Hospital storage is enabled only on the production deployment.'});
  if(!env.GOOGLE_CLIENT_ID||!env.GOOGLE_CLIENT_SECRET||!env.GOOGLE_REFRESH_TOKEN||!(env.DRIVE_FOLDER_ID||env.DRIVE_CONFIG_FOLDER_ID))return send(503,{error:'Setup required: configure private Google Drive authorization and storage on Netlify before signing in.'});
  try{
   const body=await request.text();if(Buffer.byteLength(body)>4000000)return send(413,{error:'Upload is too large. Use a file smaller than 2.8 MB.'});
   const {name,args}=JSON.parse(body);
   if(typeof name!=='string'||!Array.isArray(args))return send(400,{error:'Invalid operation'});
   const store=app?.store||new Store({...env,DRIVE_FOLDER_ID:env.DRIVE_FOLDER_ID||env.DRIVE_CONFIG_FOLDER_ID},query);
   const pointer=await store.pointer();
   if(!app||String(pointer.revision)!==app.store.revision||pointer.folder!==app.store.folder){
    app=null;
    app=await appFactory({env:{...env,STATELESS_HOST:'false',APP_URL:site},store:new Store({...env,DRIVE_FOLDER_ID:env.DRIVE_FOLDER_ID||env.DRIVE_CONFIG_FOLDER_ID},query)});
   }
   return send(200,{result:await app.call(name,args)});
  }catch(error){app=null;return send(error.status||400,{error:error.message});}
 }
 return request=>{const job=chain.then(()=>run(request));chain=job.catch(()=>{});return job;};
}
module.exports={createHandler};
