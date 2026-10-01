import packager from '@electron/packager';
import {mkdir,copyFile,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),stage=path.join(root,'build','desktop-stage');
await mkdir(path.join(stage,'build'),{recursive:true});await mkdir(path.join(stage,'desktop'),{recursive:true});await mkdir(path.join(stage,'assets'),{recursive:true});
// Original 64px flame-on-shield icon encoded as a Windows DIB ICO.
const size=64,bitmap=Buffer.alloc(40+size*size*4+size*size/8);bitmap.writeUInt32LE(40,0);bitmap.writeInt32LE(size,4);bitmap.writeInt32LE(size*2,8);bitmap.writeUInt16LE(1,12);bitmap.writeUInt16LE(32,14);bitmap.writeUInt32LE(size*size*4,20);
for(let y=0;y<size;y++)for(let x=0;x<size;x++){
 let col=[20,38,49,255];const dx=x-32,dy=y-29;
 if(y>9&&y<54&&Math.abs(dx)<22-(Math.max(0,y-38)*.75))col=[52,83,96,255];
 if(y>11&&y<52&&Math.abs(dx)>18-(Math.max(0,y-37)*.7)&&Math.abs(dx)<21-(Math.max(0,y-38)*.7))col=[222,183,119,255];
 if(dy>-14&&dy<19&&Math.abs(dx)<(dy<0?dy+16:17-dy*.55))col=dy>4&&Math.abs(dx)<7?[255,227,164,255]:[240,148,85,255];
 const i=40+((size-y-1)*size+x)*4;bitmap[i]=col[2];bitmap[i+1]=col[1];bitmap[i+2]=col[0];bitmap[i+3]=255;
}
const head=Buffer.alloc(22);head.writeUInt16LE(1,2);head.writeUInt16LE(1,4);head[6]=size;head[7]=size;head.writeUInt16LE(1,10);head.writeUInt16LE(32,12);head.writeUInt32LE(bitmap.length,14);head.writeUInt32LE(22,18);
await writeFile(path.join(root,'assets','Emberbound.ico'),Buffer.concat([head,bitmap]));
for(const name of ['desktop/main.cjs','desktop/selftest.cjs','build/Emberbound.html','assets/Emberbound.ico','README.md','LICENSE'])await copyFile(path.join(root,name),path.join(stage,name));
const pkg=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
await writeFile(path.join(stage,'package.json'),JSON.stringify({name:'emberbound',productName:'灰烬远征',version:pkg.version,main:'desktop/main.cjs',author:pkg.author,description:pkg.description,license:'MIT'}));
const paths=await packager({dir:stage,name:'Emberbound',platform:'win32',arch:'x64',electronVersion:pkg.devDependencies.electron,electronZipDir:process.env.EMBERBOUND_ELECTRON_ZIP_DIR||undefined,out:path.join(root,'releases'),asar:true,overwrite:false,icon:path.join(root,'assets','Emberbound.ico'),appVersion:pkg.version,win32metadata:{CompanyName:'Emberbound',FileDescription:'灰烬远征 — Offline deckbuilding roguelike',ProductName:'Emberbound'}});
console.log('Standalone Windows app: '+paths.join(', '));
