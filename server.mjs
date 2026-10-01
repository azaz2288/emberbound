import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.dirname(fileURLToPath(import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.json':'application/json'};
const port=Number(process.env.EMBERBOUND_PORT||8787);
const server=http.createServer(async(req,res)=>{
 try{const url=new URL(req.url,'http://127.0.0.1');const pathname=decodeURIComponent(url.pathname);const filename=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(filename!==root&&!filename.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 if(!(await stat(filename)).isFile())throw new Error('not file');const bytes=await readFile(filename);let scriptPolicy="'self'";
 if(path.basename(filename)==='Emberbound.html'){const match=bytes.toString('utf8').match(/<script>([\s\S]*?)<\/script>/);if(match)scriptPolicy+=` 'sha256-${createHash('sha256').update(match[1]).digest('base64')}'`;}
 res.writeHead(200,{'Content-Type':types[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Content-Security-Policy':`default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src ${scriptPolicy}; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'`});res.end(req.method==='HEAD'?undefined:bytes);
 }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Emberbound: http://127.0.0.1:${server.address().port}`));
server.on('error',err=>{console.error(err.message);process.exitCode=1;});
