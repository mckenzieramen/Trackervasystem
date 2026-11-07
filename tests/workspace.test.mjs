import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
const dir=mkdtempSync(resolve(tmpdir(),'va-test-')),base='http://localhost:3107';let proc,cookie='',csrf='';
async function call(path,method='GET',body,auth=true,origin=base){const r=await fetch(base+path,{method,headers:{Origin:origin,'Content-Type':'application/json',...(auth?{Cookie:cookie,'X-CSRF-Token':csrf}:{})},...(body===undefined?{}:{body:JSON.stringify(body)}),redirect:'manual'});const x=await r.json().catch(()=>({}));return{status:r.status,x,cookie:r.headers.get('set-cookie')}}
before(async()=>{proc=spawn(process.execPath,['server.mjs'],{cwd:resolve(import.meta.dirname,'..'),env:{...process.env,PORT:'3107',APP_URL:base,DATA_DIR:dir,SETUP_CODE:'private-test-setup-code',ENCRYPTION_KEY:'a'.repeat(64),GOOGLE_CLIENT_ID:'',OPENAI_API_KEY:''},stdio:['ignore','pipe','pipe']});await new Promise((done,reject)=>{const timeout=setTimeout(()=>reject(Error('Server did not start')),10000);proc.stdout.on('data',x=>{if(x.toString().includes('running')){clearTimeout(timeout);done()}});proc.on('exit',()=>reject(Error('Server exited')))});});
after(()=>{proc?.kill();rmSync(dir,{recursive:true,force:true})});
test('private owner workspace, validation, concurrency and integration boundaries',async()=>{
 assert.equal((await call('/api/data')).status,401);
 assert.equal((await call('/api/auth/register','POST',{setupCode:'wrong'},false)).status,403);
 const reg=await call('/api/auth/register','POST',{setupCode:'private-test-setup-code',name:'Cliff Medrano',email:'cliff@example.com',password:'long-secure-test-password'},false);assert.equal(reg.status,201);cookie=reg.cookie.split(';')[0];csrf=reg.x.csrf;
 assert.equal((await call('/api/auth/register','POST',{},false)).status,409);
 assert.equal((await call('/api/auth/login','POST',{email:'cliff@example.com',password:'wrong'},false)).status,401);
 assert.equal((await call('/api/records/tasks','POST',{title:'Blocked',status:'To Do'},true,'https://evil.example')).status,403);
 const csrfRes=await fetch(base+'/api/records/tasks',{method:'POST',headers:{Origin:base,Cookie:cookie,'Content-Type':'application/json'},body:'{}'});assert.equal(csrfRes.status,403);
 const client=(await call('/api/records/clients','POST',{name:'Client',email:'alex@example.com'}));assert.equal(client.status,201);
 const task=(await call('/api/records/tasks','POST',{title:'Follow up',status:'To Do',client:client.x.id})).x;assert.equal(task._version,1);
 const updated=await call('/api/records/tasks/'+task.id,'PUT',{...task,status:'Completed'});assert.equal(updated.status,200);assert.equal(updated.x._version,2);
 assert.equal((await call('/api/records/tasks/'+task.id,'PUT',{...task,status:'In Progress'})).status,409);
 assert.equal((await call('/api/records/tasks','POST',{title:'Bad',status:'Invalid'})).status,400);
 assert.equal((await call('/api/records/events','POST',{title:'Bad dates',start:'2026-01-02',end:'2026-01-01'})).status,400);
 assert.equal((await call('/api/records/time','POST',{seconds:-1})).status,400);
 assert.equal((await call('/api/records/files','POST',{title:'Bad link',url:'javascript:alert(1)'})).status,400);
 // Retry of the same submission cannot create a second task.
 const key='stable-test-key';for(let i=0;i<2;i++){const r=await fetch(base+'/api/records/tasks',{method:'POST',headers:{Origin:base,Cookie:cookie,'X-CSRF-Token':csrf,'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify({title:'Single write',status:'To Do'})});assert.ok(r.ok)}
 let state=(await call('/api/data')).x;assert.equal(state.tasks.filter(t=>t.title==='Single write').length,1);assert.equal(state.tasks.find(t=>t.id===task.id).status,'Completed');
 // Starting in two windows uses one server-side timer. Pausing/stopping is atomic.
 await Promise.all([call('/api/timer','POST',{action:'start',title:'Research'}),call('/api/timer','POST',{action:'start',title:'Research'})]);state=(await call('/api/data')).x;assert.equal(state.timer.length,1);
 await new Promise(r=>setTimeout(r,1100));await call('/api/timer','POST',{action:'pause'});
 const stopped=await Promise.all([call('/api/timer','POST',{action:'stop',date:'2026-11-07'}),call('/api/timer','POST',{action:'stop',date:'2026-11-07'})]);assert.equal(stopped.filter(r=>r.status===200).length,1);state=(await call('/api/data')).x;assert.equal(state.time.length,1);assert.equal(state.timer.length,0);
 assert.equal((await call('/api/integrations')).x.gmail.connected,false);assert.equal((await call('/api/ai','POST',{prompt:'Hello'})).status,409);assert.equal((await call('/api/gmail')).status,409);
 assert.equal((await call('/api/profile','PUT',{name:'Cliff',timezone:'Invalid/Timezone'})).status,400);
 assert.equal((await call('/api/profile','PUT',{name:'Cliff',timezone:'Asia/Manila',hours:'9 AM – 6 PM'})).status,200);
 assert.equal((await call('/api/records/tasks/'+task.id,'DELETE')).status,200);
 assert.equal((await call('/api/records/tasks/'+task.id,'DELETE')).status,404);
 await call('/api/auth/logout','POST',{});assert.equal((await call('/api/data')).status,401);
 const login=await call('/api/auth/login','POST',{email:'cliff@example.com',password:'long-secure-test-password'},false);assert.equal(login.status,200);cookie=login.cookie.split(';')[0];csrf=login.x.csrf;assert.equal((await call('/api/data')).x.clients.length,1);
});
