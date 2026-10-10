/** Add temporarily to the existing Visa Medical Apps Script project.
 * Run as its owner. The output is private; never commit it to GitHub. */
function exportForGitHubMigration(){
 editorOwner_();
 const props=props_().getProperties(),out={version:1,props,cache:{},files:{},folders:{},dbs:{}};
 const normalize=v=>Object.prototype.toString.call(v)==='[object Date]'?v.toISOString():Array.isArray(v)?v.map(normalize):v;
 for(const id of [...new Set([props.DB_ID,props.REGISTER_FO_ID,props.REGISTER_ADMIN_ID].filter(Boolean))]){
 const db=SpreadsheetApp.openById(id);out.dbs[id]=db.getSheets().map(s=>({name:s.getName(),data:normalize(s.getDataRange().getValues())}));out.files[id]={name:db.getName(),mime:'text/plain',data:''};}
 const skip=new Set(packageAssets_().map(a=>a.name));
 for(const key of ['ROOT_ID','TEMPLATES_ID','RECORDS_ID','SIGNATURES_ID','EXPORTS_ID','REQUESTS_ID']){
 const id=props[key];if(!id)continue;const folder=DriveApp.getFolderById(id);out.folders[id]={name:folder.getName(),files:[]};const it=folder.getFiles();while(it.hasNext()){const f=it.next();if(skip.has(f.getName())||out.dbs[f.getId()])continue;out.folders[id].files.push(f.getId());out.files[f.getId()]={name:f.getName(),mime:f.getMimeType(),data:Utilities.base64Encode(f.getBlob().getBytes())};}}
 const f=DriveApp.getFolderById(props.ROOT_ID).createFile('clinicavisamedical-migration.json',JSON.stringify(out),'application/json');console.log(f.getUrl());return f.getUrl();
}
