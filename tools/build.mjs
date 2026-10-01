// Tiny, project-specific zero-dependency module packer. Outputs a directly openable offline HTML.
import {readFile,mkdir,writeFile,copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';import path from 'node:path';import vm from 'node:vm';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const modules=[['Content','content'],['CardScenes','card-scenes'],['Art','art'],['Audio','audio'],['FX','fx'],['Engine','engine'],['App','app']];
const substitutions={
 "import {battleFeedback,cardMotionPlan,discardFeedback,drawFeedback,playedToPile} from './fx.mjs';":"const {battleFeedback,cardMotionPlan,discardFeedback,drawFeedback,playedToPile}=FX;",
 "import {illustratedCard} from './card-scenes.mjs';":"const {illustratedCard}=CardScenes;",
 "import * as E from './engine.mjs';":"const E=Engine;",
 "import {HEROES,CARDS,RELICS,POTIONS,ACTS,ENEMIES,EVENTS} from './content.mjs';":"const {HEROES,CARDS,RELICS,POTIONS,ACTS,ENEMIES,EVENTS}=Content;",
 "import {HEROES,CARDS,TYPES,RELICS,POTIONS,ACTS,KEYWORDS,cardText,catalogCards} from './content.mjs';":"const {HEROES,CARDS,TYPES,RELICS,POTIONS,ACTS,KEYWORDS,cardText,catalogCards}=Content;",
 "import {icon,heroArt,enemyArt,cardArt,landscape,uri} from './art.mjs';":"const {icon,heroArt,enemyArt,cardArt,landscape,uri}=Art;",
 "import {tone,unlock,preferences,updateAudio,audioState} from './audio.mjs';":"const {tone,unlock,preferences,updateAudio,audioState}=Audio;"
};
let packed='/* Emberbound — original game and artwork, MIT license. */\n';
for(const [name,file]of modules){let source=await readFile(path.join(root,'src',file+'.mjs'),'utf8');const exports=[...source.matchAll(/export\s+(?:async\s+)?(?:const|function)\s+(\w+)/g)].map(m=>m[1]);for(const [from,to]of Object.entries(substitutions))source=source.replace(from,to);source=source.replace(/export\s+(?=(?:async\s+)?(?:const|function)\s)/g,'');if(/^import\s/m.test(source))throw new Error('Unresolved import in '+file);packed+=`const ${name}=(()=>{\n${source}\nreturn {${exports.join(',')}};\n})();\n`;}
new vm.Script(packed);
const css=await readFile(path.join(root,'style.css'),'utf8');let html=await readFile(path.join(root,'index.html'),'utf8');
const favicon=await readFile(path.join(root,'assets','favicon.svg'),'utf8');html=html.replace('href="assets/favicon.svg"',`href="data:image/svg+xml,${encodeURIComponent(favicon)}"`).replace('<link rel="stylesheet" href="style.css">',`<style>${css}</style>`).replace('<script type="module" src="src/app.mjs"></script>',`<script>${packed.replace(/<\/script/gi,'<\\/script')}</script>`);
await mkdir(path.join(root,'build'),{recursive:true});await writeFile(path.join(root,'build','Emberbound.html'),html);await copyFile(path.join(root,'LICENSE'),path.join(root,'build','LICENSE.txt'));
await copyFile(path.join(root,'README.md'),path.join(root,'build','README.md'));
console.log(`Offline HTML built: ${Buffer.byteLength(html)} bytes. No external dependencies.`);
