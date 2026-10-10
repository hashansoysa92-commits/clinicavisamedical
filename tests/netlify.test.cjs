const {test}=require('node:test'),assert=require('node:assert/strict');
const {CoordinatedDrive}=require('../server/coordinated-drive.cjs');
const {createHandler}=require('../server/netlify-handler.cjs');
function harness(){
 let pointer={revision:0,folder:'private-folder-123',file_id:null},n=0;const objects=new Map();
 const query=async(sql,args)=>{
  if(sql.startsWith('INSERT'))return [];
  if(sql.startsWith('SELECT'))return [{...pointer}];
  if(String(pointer.revision)!==String(args[2]))return [];
  pointer={folder:args[0],file_id:args[1],revision:pointer.revision+1};return [{revision:pointer.revision}];
 };
 class Store extends CoordinatedDrive{
  async verify(){}
  async request(url,init){
   if(url.startsWith('upload/')){
    assert.equal(init.method,'POST','snapshots must never overwrite an existing object');
    const bytes=init.body.toString(),parts=bytes.split('\r\n');const metadata=JSON.parse(parts[3]);
    const json=parts.slice(7,-1).join('\r\n');const id='file-'+(++n);objects.set(id,{name:metadata.name,parent:metadata.parents[0],data:JSON.parse(json)});return {json:async()=>({id})};
   }
   if(url.startsWith('drive/v3/files?'))return {json:async()=>({files:[...objects].filter(([,f])=>f.parent===this.folder).map(([id])=>({id}))})};
   const id=url.split('/')[3].split('?')[0];return {json:async()=>structuredClone(objects.get(id).data)};
  }
 }
 // Use the real coordinated upload naming, with the mocked Drive transport above.
 Store.prototype.upload=CoordinatedDrive.prototype.upload;
 return {Store,query,objects,pointer:()=>pointer};
}
const state=label=>({version:1,props:{label},files:{},folders:{},dbs:{},cache:{}});
test('two instances never overwrite each other; restart sees the winning snapshot',async()=>{
 const h=harness(),a=new h.Store({},h.query),b=new h.Store({},h.query);
 await a.load();await b.load();
 await a.save(state('winner'));await assert.rejects(b.save(state('loser')),e=>e.status===409);
 assert.equal(h.pointer().revision,1);assert.equal(h.objects.size,2);
 const c=new h.Store({},h.query);assert.equal((await c.load()).props.label,'winner');
 assert.notEqual(a.fileId,b.fileId);
});
test('failed Drive upload leaves the pointer intact and selected folders persist',async()=>{
 const h=harness(),a=new h.Store({},h.query);await a.load();await a.save(state('old'));const before=h.pointer();
 const broken=new h.Store({},h.query);await broken.load();broken.upload=async()=>{throw Error('Drive unavailable')};
 await assert.rejects(broken.save(state('lost')),/unavailable/);assert.deepEqual(h.pointer(),before);
 a.folder='new-private-folder-456';a.fileId=null;await a.load();await a.save(state('moved'));
 const restarted=new h.Store({},h.query);assert.equal((await restarted.load()).props.label,'moved');assert.equal(restarted.folder,a.folder);
});
test('an unconfigured serverless deployment cannot issue ephemeral login sessions',async()=>{
 const handle=createHandler({env:{URL:'https://clinic.example'},query:async()=>{throw Error('must not query')}});
 const response=await handle(new Request('https://clinic.example/api/rpc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'passwordLogin',args:['admin','secret']})}));
 assert.equal(response.status,503);assert.match((await response.json()).error,/Setup required/);
});
