// Presentation only: never resolves rules or mutates the saved run.
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function effectAt(rect,kind,color){
 if(!rect)return;
 const el=document.createElement('div');el.className='battle-fx '+kind;el.style.cssText=`left:${rect.left+rect.width/2}px;top:${rect.top+rect.height*.46}px;--fx-color:${color}`;
 el.innerHTML=kind==='slash'?'<svg viewBox="0 0 200 160"><path d="M15 144Q82 2 189 15L185 29Q80 48 15 144Z" fill="currentColor"/><path d="m52 120 128-95" stroke="#fff8dd" stroke-width="4"/></svg>':kind==='shield'?'<svg viewBox="0 0 180 180"><path d="M26 35 90 12 154 35 145 114 90 163 35 114Z" fill="currentColor" fill-opacity=".2" stroke="currentColor" stroke-width="6"/><path d="M90 36v98M53 81h74" stroke="#e8f8ff" stroke-width="4"/></svg>':'<svg viewBox="0 0 180 180"><circle cx="90" cy="90" r="52" fill="currentColor" fill-opacity=".18" stroke="currentColor" stroke-width="5"/><path d="m90 0 11 63 48-39-31 57 62 9-64 12 35 50-50-36-11 64-11-64-52 37 37-51L0 90l64-10-35-53 49 36Z" fill="currentColor" fill-opacity=".7"/></svg>';
 document.body.appendChild(el);setTimeout(()=>el.remove(),900);
}
export function feedbackTimeline(effects){let time=210;return effects.map(e=>{const item={...e,at:time};time+=e.type==='enemyAttack'?240:e.type==='damage'?130:75;return item;});}
export function cardMotionPlan(before,after,playedUid=null){
 const a=before?.phase==='combat'?before.combat:null,b=after.combat;
 if(!b)return {discard:[],draw:[],played:null,destination:null,reshuffle:false};
 const ended=!!a&&b.turn>a.turn,played=!!a&&after.stats.cardsPlayed>before.stats.cardsPlayed?a.hand.find(c=>playedUid?c.uid===playedUid:b.discard.some(x=>x.uid===c.uid)||b.exhaust.some(x=>x.uid===c.uid)):null;
 const old=a?.hand.filter(c=>c.uid!==played?.uid)||[];
 const drawn=after.phase==='combat'?b.hand.filter(c=>ended||!old.some(x=>x.uid===c.uid)):[];
 return {discard:ended?a.hand:[],draw:drawn,played,destination:played?(b.exhaust.some(c=>c.uid===played.uid)?'exhaust':'discard'):null,reshuffle:!!a&&drawn.length>a.draw.length};
}
function pileRect(app,id){return app.querySelector(`[data-action="pile"][data-id="${id}"]`)?.getBoundingClientRect();}
function flyBetween(source,from,to,kind,delay=0){
 if(!source||!from||!to)return Promise.resolve();
 const ghost=source.cloneNode(true);ghost.removeAttribute('data-action');ghost.classList.add('pile-flight',kind);
 ghost.style.cssText=`position:fixed;left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;--pile-x:${to.left+to.width/2-from.left-from.width/2}px;--pile-y:${to.top+to.height/2-from.top-from.height/2}px;--pile-delay:${delay}ms`;
 document.body.appendChild(ghost);return wait(delay+540).then(()=>ghost.remove());
}
export async function discardFeedback(app,cards,tone,reduced){
 if(!cards.length||reduced)return;
 const tasks=cards.map((c,i)=>{const el=app.querySelector(`[data-action="play"][data-id="${c.uid}"]`);if(!el)return Promise.resolve();const task=flyBetween(el,el.getBoundingClientRect(),pileRect(app,'discard'),'discard-flight',i*55);el.classList.add('motion-hidden');return task;});tone('card');await Promise.all(tasks);
}
export async function drawFeedback(app,cards,reshuffle,tone,reduced){
 if(reduced||!cards.length)return;
 const els=cards.map(c=>app.querySelector(`[data-action="play"][data-id="${c.uid}"]`));els.forEach(el=>el?.classList.add('motion-hidden'));
 if(reshuffle){const el=document.createElement('div');el.className='reshuffle-notice';el.textContent='弃牌洗回抽牌堆';document.body.appendChild(el);const source=app.querySelector('[data-id="discard"].pile-btn');await flyBetween(source,pileRect(app,'discard'),pileRect(app,'draw'),'shuffle-flight');el.remove();}
 const tasks=els.map((el,i)=>{if(!el)return Promise.resolve();const target=el.getBoundingClientRect(),pile=pileRect(app,'draw');if(!pile){el.classList.remove('motion-hidden');return Promise.resolve();}
  const from={left:pile.left+pile.width/2-45,top:pile.top+pile.height/2-65,width:90,height:130};
  const ghost=el.cloneNode(true);ghost.classList.remove('motion-hidden');const task=flyBetween(ghost,from,target,'draw-flight',i*85);return task.then(()=>{el.classList.remove('motion-hidden');tone('card');});});await Promise.all(tasks);
}
export async function playedToPile(app,card,destination,tone,reduced){
 if(!card||reduced)return;const el=app.querySelector(`[data-action="play"][data-id="${card.uid}"]`);if(!el)return;
 const r=el.getBoundingClientRect(),from={left:innerWidth*.48,top:innerHeight*.3,width:r.width,height:r.height};tone('card');await flyBetween(el,from,pileRect(app,destination),destination==='exhaust'?'exhaust-flight':'discard-flight');
}
export async function battleFeedback(app,before,after,card,effects,tone,reduced){
 if(reduced){tone(card?'card':'hit');await wait(60);return;}
 const color=before.hero==='mage'?'#b9c6ff':before.hero==='rogue'?'#9de8b7':'#ffd28e';
 const entity=id=>app.querySelector(`[data-entity="${id}"]`),rect=id=>entity(id)?.getBoundingClientRect();
 if(card){
  const el=app.querySelector(`[data-action="play"][data-id="${card.uid}"]`);if(el){const r=el.getBoundingClientRect(),ghost=el.cloneNode(true);ghost.classList.add('flying-card');ghost.style.cssText=`position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;--fly-x:${innerWidth*.48-r.left}px;--fly-y:${innerHeight*.3-r.top}px`;ghost.removeAttribute('data-action');document.body.appendChild(ghost);setTimeout(()=>ghost.remove(),700);el.classList.add('played-card');}
  entity('hero')?.classList.add('attack');tone(before.hero==='mage'?'spell':'hit');
 }else tone('card');
 const timeline=feedbackTimeline(effects),hp=new Map([['hero',before.hp],...before.combat.enemies.map(e=>[e.uid,e.hp])]);let elapsed=0;
 for(const e of timeline){await wait(e.at-elapsed);elapsed=e.at;const el=entity(e.target),r=rect(e.target);if(!r)continue;
  if(e.type==='enemyAttack'){el.classList.remove('attack');void el.offsetWidth;el.classList.add('attack');continue;}
  if(e.type==='damage'){
   el?.classList.remove('hitflash');void el?.offsetWidth;el?.classList.add('hitflash');
   effectAt(r,e.amount===0?'shield':before.hero==='mage'&&e.target!=='hero'?'burst':'slash',e.target==='hero'?'#ffab8d':color);
   if(e.target==='hero')tone(e.amount===0?'block':'hit');
   const value=Math.max(0,hp.get(e.target)-e.amount);hp.set(e.target,value);const max=e.target==='hero'?before.maxHp:before.combat.enemies.find(x=>x.uid===e.target)?.maxHp;
   if(el?.querySelector('.hptext'))el.querySelector('.hptext').textContent=`${value} / ${max}`;
   if(el?.querySelector('.hpfill'))el.querySelector('.hpfill').style.width=value/max*100+'%';
   if(value===0)el?.classList.add('death-fade');
  }else if(e.type==='block'){effectAt(r,'shield','#bce8ff');tone('block');}else if(e.type==='heal'||e.type==='combo'){effectAt(r,'burst',e.type==='heal'?'#b9efb8':'#ffdfa0');tone(e.type);}
  if(e.type==='damage'||e.amount>0){const n=document.createElement('span');n.className=`float-number ${e.type}`;n.textContent=e.type==='damage'?e.amount===0?'格挡':'−'+e.amount:e.type==='combo'?'连携！':'+'+e.amount;n.style.left=r.left+r.width/2-20+'px';n.style.top=r.top+r.height*.34+'px';document.body.appendChild(n);setTimeout(()=>n.remove(),1000);}
 }
 if(!effects.length)effectAt(rect('hero'),'burst',color);
 await wait(500);
}
