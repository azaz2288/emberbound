import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {once} from 'node:events';import {createHash} from 'node:crypto';import vm from 'node:vm';
import {fileURLToPath} from 'node:url';import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
test('local server, packed app, MIME, CSP hash and traversal protection',async t=>{
 const child=spawn(process.execPath,['server.mjs'],{cwd:root,env:{...process.env,EMBERBOUND_PORT:'0'},stdio:['ignore','pipe','pipe']});
 t.after(()=>{child.kill();});
 const origin=await new Promise((resolve,reject)=>{let output='';const timer=setTimeout(()=>reject(new Error('Server startup timeout')),5000);child.stdout.on('data',data=>{output+=data.toString();const match=output.match(/http:\/\/127\.0\.0\.1:\d+/);if(match){clearTimeout(timer);resolve(match[0]);}});child.on('error',reject);child.on('exit',code=>{if(code)reject(new Error('Server exited '+code));});});
 const index=await fetch(origin);assert.equal(index.status,200);assert.match(index.headers.get('content-type'),/text\/html/);assert.match(await index.text(),/灰烬远征/);
 const module=await fetch(origin+'/src/engine.mjs');assert.equal(module.status,200);assert.match(module.headers.get('content-type'),/javascript/);
 const head=await fetch(origin+'/style.css',{method:'HEAD'});assert.equal(head.status,200);assert.equal((await head.text()).length,0);
 assert.equal((await fetch(origin+'/does-not-exist')).status,404);assert.equal((await fetch(origin+'/',{method:'POST'})).status,405);
 assert.equal((await fetch(origin+'/%2e%2e%2fpackage.json')).status,403);
 const response=await fetch(origin+'/build/Emberbound.html');assert.equal(response.status,200);const html=await response.text(),script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];assert(script);assert.doesNotThrow(()=>new vm.Script(script));assert(!/<script[^>]+src=/.test(html));assert(!/<link[^>]+href="(?!data:)/.test(html));assert(!/url\(["']?https?:/.test(html));
 const hash=createHash('sha256').update(script).digest('base64');assert(response.headers.get('content-security-policy').includes(`'sha256-${hash}'`));assert(!response.headers.get('content-security-policy').includes("script-src 'unsafe-inline'"));
});
