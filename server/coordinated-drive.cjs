const {randomUUID}=require('node:crypto');
const {DriveStore,folderId}=require('./drive.cjs');
class CoordinatedDrive extends DriveStore {
 constructor(env,query){super(env);this.query=query;this.revision=null;this.selectedFolder=null;}
 async pointer(){
  await this.query('INSERT INTO clinica_drive_pointer (id,revision,folder) VALUES (1,0,$1) ON CONFLICT (id) DO NOTHING',[this.folder||this.anchor||null]);
  const rows=await this.query('SELECT revision,folder,file_id FROM clinica_drive_pointer WHERE id=1',[]);
  if(!rows[0]?.folder)throw Error('Configure DRIVE_FOLDER_ID with a dedicated Google Drive folder');
  return rows[0];
 }
 async assertEmpty(){
  await this.verify(this.folder);
  const q="'"+this.folder+"' in parents and trashed = false and (name = 'clinicavisamedical-state.json' or name contains 'clinicavisamedical-state-')";
  const result=await(await this.request('drive/v3/files?'+new URLSearchParams({q,fields:'files(id)',pageSize:'1',supportsAllDrives:'true',includeItemsFromAllDrives:'true'}))).json();
  if(result.files.length)throw Error('This folder already contains hospital snapshots. Restore its database pointer instead of creating a new database.');
 }
 async load(){
  if(this.selectedFolder&&this.folder!==this.selectedFolder){await this.assertEmpty();return null;}
  const row=await this.pointer();this.revision=String(row.revision);this.folder=folderId(row.folder);this.selectedFolder=this.folder;
  if(row.file_id)return this.loadFile(row.file_id);
  await this.assertEmpty();return null;
 }
 async upload(name,bytes,mime,id){
  if(name==='clinicavisamedical-state.json'){name='clinicavisamedical-state-'+randomUUID()+'.json';id=null;}
  return super.upload(name,bytes,mime,id);
 }
 async save(state){
  if(this.revision===null)throw Error('Load the storage pointer before saving');
  this.fileId=null;
  await super.save(state);
  const rows=await this.query('UPDATE clinica_drive_pointer SET folder=$1,file_id=$2,revision=revision+1 WHERE id=1 AND revision=$3 RETURNING revision',[this.folder,this.fileId,this.revision]);
  if(!rows.length){const error=Error('Another user saved an update. Reload the latest data and try again.');error.status=409;throw error;}
  this.revision=String(rows[0].revision);this.selectedFolder=this.folder;
 }
}
module.exports={CoordinatedDrive};
