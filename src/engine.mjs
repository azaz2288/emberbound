import {HEROES,CARDS,RELICS,POTIONS,ACTS,ENEMIES,EVENTS} from './content.mjs';

export const VERSION=1;
const phases=['map','combat','reward','rest','shop','event','chooseCard','victory','defeat'];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
export function hashSeed(seed){let n=2166136261;for(const c of String(seed)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return (n>>>0)||1;}
export function random(s){let n=s.rng>>>0;n^=n<<13;n^=n>>>17;n^=n<<5;s.rng=(n>>>0)||1;return s.rng/4294967296;}
export function pick(s,list){return list[Math.floor(random(s)*list.length)];}
function shuffle(s,list){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function note(s,message){s.log.push(message);s.log=s.log.slice(-70);}
function status(){return {strength:0,dexterity:0,weak:0,vulnerable:0,poison:0,burn:0,thorns:0,plating:0,spellPower:0,venomBlade:0};}
export function addCard(s,id,up=false){assert(CARDS[id],'未知卡牌');const card={id,uid:`c${s.nextUid++}`,up:!!up};s.deck.push(card);return card;}
export function newRun(hero='knight',seed=String(Date.now()),difficulty='normal'){
 assert(Object.hasOwn(HEROES,hero),'未知英雄');assert(['normal','story','hard'].includes(difficulty),'未知难度');
 seed=String(seed).slice(0,80);
 const s={version:VERSION,hero,seed:String(seed).slice(0,80),difficulty,rng:hashSeed(seed),phase:'map',act:0,floor:-1,col:1,nextUid:1,hp:HEROES[hero].hp,maxHp:HEROES[hero].hp,gold:95,deck:[],relics:[HEROES[hero].relic],potions:['heal'],map:[],visited:[],combat:null,reward:null,shop:null,event:null,picker:null,removed:0,stats:{battles:0,cardsPlayed:0,kills:0,damage:0,turns:0},log:[]};
 for(const id of HEROES[hero].deck)addCard(s,id);s.map=generateMap(s);note(s,`${HEROES[hero].name}踏入${ACTS[0].name}。`);return s;
}
export function generateMap(s){
 const map=[];
 for(let row=0;row<8;row++){
  const nodes=[];
  for(let col=0;col<3;col++){
   if(row===7&&col!==1)continue;
   let type='battle';
   if(row===7)type='boss';else if(row===6)type=['rest','elite','rest'][col];else if(row===0)type='battle';
   else if(row===3)type=['shop','event','rest'][col];
   else type=pick(s,['battle','battle','event','rest','elite',...(row>1?['shop']:[])]);
   nodes.push({id:`a${s.act}r${row}c${col}`,row,col,type,links:row===7?[]:row===6?[1]:[0,1,2].filter(c=>Math.abs(c-col)<=1)});
  }
  map.push(nodes);
 }
 return map;
}
export function availableNodes(s){if(s.phase!=='map')return[];const row=s.floor+1;if(row>=8)return[];const prev=s.floor<0?null:s.map[s.floor].find(n=>n.col===s.col);return s.map[row].filter(n=>!prev||prev.links.includes(n.col));}
export function selectNode(s,id){
 assert(s.phase==='map','现在不能选择道路');const node=availableNodes(s).find(n=>n.id===id);assert(node,'这条道路尚不可达');
 s.floor=node.row;s.col=node.col;s.visited.push(id);s.reward=null;s.shop=null;s.event=null;s.picker=null;
 if(['battle','elite','boss'].includes(node.type))startBattle(s,node.type);
 else if(node.type==='rest')s.phase='rest';
 else if(node.type==='shop'){s.shop=generateShop(s);s.phase='shop';}
 else if(node.type==='event'){s.event={id:pick(s,EVENTS).id,resolved:false,result:''};s.phase='event';}
 return node;
}
function encounter(s,type){
 if(type==='boss')return[ACTS[s.act].boss];
 const sets=[ [['wolf'],['slime','wolf'],['cultist'],['spider','slime']], [['knight'],['eye','spider'],['sentinel','cultist'],['slime','eye','wolf']], [['golem'],['reaper','eye'],['knight','spider','eye'],['golem','wolf']] ];
 if(type==='elite')return s.act===0?['sentinel','wolf']:s.act===1?['knight','eye']:['golem','reaper'];
 return pick(s,sets[s.act]);
}
export function startBattle(s,type='battle',enemyIds=null){
 assert(['battle','elite','boss'].includes(type),'未知战斗类型');
 const scale=s.difficulty==='story'?0.76:s.difficulty==='hard'?1.18:1;
 const ids=enemyIds||encounter(s,type);
 const enemies=ids.map((id,i)=>{assert(ENEMIES[id],'未知敌人');const d=ENEMIES[id];const hp=Math.round(d.hp*scale*(d.boss?1:1+s.act*.12));return{id,uid:`e${i}`,name:d.name,art:d.art,hp,maxHp:hp,block:0,status:status(),step:0,intent:null};});
 s.combat={type,turn:0,energy:0,block:0,status:status(),hand:[],draw:shuffle(s,s.deck.map(c=>({...c}))),discard:[],exhaust:[],enemies,attacks:0,spells:0,knightShield:false,lanternUsed:false,effects:[],};
 s.phase='combat';for(const e of enemies)setIntent(s,e);
 if(s.relics.includes('whetstone'))s.combat.status.strength+=2;
 if(s.relics.includes('boots'))s.combat.status.dexterity+=2;
 if(s.relics.includes('needle'))s.combat.status.thorns+=3;
 if(s.relics.includes('fang'))for(const e of enemies)e.status.poison+=2;
 beginTurn(s);if(s.phase==='combat'&&s.relics.includes('shell'))s.combat.block+=10;
 note(s,`${type==='boss'?'首领':type==='elite'?'精英':'遭遇'}战开始。`);
}
function setIntent(s,e){
 const d=ENEMIES[e.id],raw=d.cycle[e.step%d.cycle.length];const factor=s.difficulty==='story'?.82:s.difficulty==='hard'?1.15:1;
 e.intent={...raw,damage:raw.damage?Math.round(raw.damage*factor*(d.boss?1:1+s.act*.12)):0,hits:raw.hits||1};
}
export function drawCards(s,n){
 const c=s.combat;
 for(let i=0;i<n;i++){
  if(c.hand.length>=10)break;
  if(!c.draw.length){if(!c.discard.length)break;c.draw=shuffle(s,c.discard);c.discard=[];note(s,'弃牌堆洗入抽牌堆。');}
  c.hand.push(c.draw.pop());
 }
}
function effect(s,type,amount,target='hero'){s.combat.effects.push({type,amount,target});s.combat.effects=s.combat.effects.slice(-24);}
function heal(s,n){const old=s.hp;s.hp=clamp(s.hp+n,0,s.maxHp);if(s.combat)effect(s,'heal',s.hp-old);return s.hp-old;}
function heroDamage(s,n,ignoreBlock=false){
 const c=s.combat;let remaining=Math.max(0,Math.floor(n));if(!ignoreBlock){const absorbed=Math.min(c.block,remaining);c.block-=absorbed;remaining-=absorbed;}
 const old=s.hp;s.hp=Math.max(0,s.hp-remaining);s.stats.damage+=old-s.hp;effect(s,'damage',old-s.hp);
 if(s.hp>0&&s.hp<=s.maxHp/2&&s.relics.includes('lantern')&&!c.lanternUsed){c.lanternUsed=true;heal(s,8);note(s,'不熄灯为你恢复了 8 生命。');}
 if(s.hp<=0){s.phase='defeat';note(s,'你的余火熄灭了。');}return old-s.hp;
}
function enemyDamage(s,e,n,ignoreBlock=false){
 if(e.hp<=0)return 0;let remaining=Math.max(0,Math.floor(n));if(!ignoreBlock){const absorbed=Math.min(e.block,remaining);e.block-=absorbed;remaining-=absorbed;}
 const old=e.hp;e.hp=Math.max(0,e.hp-remaining);effect(s,'damage',old-e.hp,e.uid);if(!e.hp){s.stats.kills++;note(s,`${e.name}倒下。`);}return old-e.hp;
}
function hit(s,e,n){
 const c=s.combat;let amount=n+c.status.strength;if(c.status.weak>0)amount*=.75;if(e.status.vulnerable>0)amount*=1.5;
 enemyDamage(s,e,amount);if(e.hp>0&&c.status.venomBlade) e.status.poison+=c.status.venomBlade;
}
function gainBlock(s,n){const c=s.combat;let amount=Math.max(0,n+c.status.dexterity);if(s.hero==='knight'&&!c.knightShield){amount+=2;c.knightShield=true;}c.block+=amount;effect(s,'block',amount);}
function beginTurn(s){
 const c=s.combat;c.turn++;s.stats.turns++;c.block=0;c.knightShield=false;c.attacks=0;c.spells=0;c.energy=3+(s.relics.includes('crown')?1:0);
 if(c.status.poison){heroDamage(s,c.status.poison,true);c.status.poison=Math.max(0,c.status.poison-1);if(s.phase==='defeat')return;}
 c.block+=c.status.plating+(s.relics.includes('cloak')?3:0);
 let n=5+(s.relics.includes('feather')?1:0)-(s.relics.includes('crown')?1:0)+(c.turn===1&&s.relics.includes('lens')?2:0);
 drawCards(s,n);
}
export function needsTarget(card){return CARDS[card.id].effects.some(([k])=>['hit','shieldHit','execute','poisonHit','weak','vulnerable','poison','burn','doublePoison','doubleBurn'].includes(k));}
export function canPlay(s,card){return s.phase==='combat'&&CARDS[card.id].type!=='curse'&&s.combat.energy>=CARDS[card.id].cost;}
export function playCard(s,uid,targetUid=null){
 assert(s.phase==='combat','战斗已经结束');const c=s.combat,index=c.hand.findIndex(x=>x.uid===uid);assert(index>=0,'手牌不存在');
 const card=c.hand[index],d=CARDS[card.id];assert(canPlay(s,card),'能量不足或卡牌无法打出');
 const target=targetUid?c.enemies.find(e=>e.uid===targetUid&&e.hp>0):c.enemies.find(e=>e.hp>0);
 if(needsTarget(card))assert(target,'请选择存活的敌人');
 c.energy-=d.cost;c.hand.splice(index,1);(d.exhaust||d.type==='power'?c.exhaust:c.discard).push(card);s.stats.cardsPlayed++;
 if(d.type==='attack')c.attacks++;
 if(s.hero==='mage'&&d.hero==='mage')c.spells++;
 note(s,`打出${d.name}${card.up?'+':''}。`);
 for(const [k,b,u] of d.effects){
  if(s.phase==='defeat')break;const n=b+(card.up?u:0),living=c.enemies.filter(e=>e.hp>0);
  if(k==='hit'&&target.hp>0)hit(s,target,n);
  else if(k==='allHit')for(const e of living)hit(s,e,n);
  else if(k==='block')gainBlock(s,n);
  else if(k==='draw')drawCards(s,n);
  else if(k==='energy')c.energy+=n;
  else if(k==='heal')heal(s,n);
  else if(k==='loseHp')heroDamage(s,n,true);
  else if(['strength','dexterity','thorns','plating','spellPower','venomBlade'].includes(k))c.status[k]+=n;
  else if(['poison','weak','vulnerable'].includes(k)&&target.hp>0)target.status[k]+=n;
  else if(k==='burn'&&target.hp>0)target.status.burn+=n+c.status.spellPower;
  else if(k==='allPoison')for(const e of living)e.status.poison+=n;
  else if(k==='allBurn')for(const e of living)e.status.burn+=n+c.status.spellPower;
  else if(k==='shieldHit'&&target.hp>0)hit(s,target,n+c.block);
  else if(k==='execute'&&target.hp>0)hit(s,target,n*(target.hp<=target.maxHp/2?2:1));
  else if(k==='poisonHit'&&target.hp>0)hit(s,target,n+target.status.poison*3);
  else if(k==='doublePoison'&&target.hp>0)target.status.poison*=n+1;
  else if(k==='doubleBurn'&&target.hp>0)target.status.burn*=n+1;
 }
 if(s.phase==='combat'&&s.hero==='mage'&&d.hero==='mage'&&c.spells===3){c.energy++;drawCards(s,1);effect(s,'combo',1);note(s,'星火连携：+1 能量，抽 1 张。');}
 if(s.phase==='combat'&&s.hero==='rogue'&&d.type==='attack'&&c.attacks===3){for(const e of c.enemies.filter(e=>e.hp>0))e.status.poison+=2;effect(s,'combo',2);note(s,'影刃连携：所有敌人 +2 中毒。');}
 checkVictory(s);return card;
}
export function endTurn(s){
 assert(s.phase==='combat','现在无法结束回合');const c=s.combat;c.effects=[];
 c.discard.push(...c.hand);c.hand=[];if(c.status.weak>0)c.status.weak--;if(c.status.vulnerable>0)c.status.vulnerable--;
 for(const e of c.enemies){
  if(e.hp<=0)continue;
  if(e.status.poison){enemyDamage(s,e,e.status.poison,true);e.status.poison=Math.max(0,e.status.poison-1);}
  if(e.hp>0&&e.status.burn){enemyDamage(s,e,e.status.burn,true);e.status.burn=Math.max(0,e.status.burn-2);}
  if(e.hp<=0)continue;
  e.block=0;const a=e.intent;
  if(a.damage){effect(s,'enemyAttack',0,e.uid);for(let j=0;j<a.hits;j++){if(e.hp<=0||s.phase==='defeat')break;let n=a.damage+e.status.strength;if(e.status.weak>0)n*=.75;if(c.status.vulnerable>0)n*=1.5;heroDamage(s,n);if(c.status.thorns>0)enemyDamage(s,e,c.status.thorns,true);}}
  if(s.phase==='defeat')break;
  if(e.hp>0){if(a.block)e.block+=a.block;if(a.strength)e.status.strength+=a.strength;if(a.poison)c.status.poison+=a.poison;if(a.weak)c.status.weak+=a.weak;
   if(e.status.weak>0)e.status.weak--;if(e.status.vulnerable>0)e.status.vulnerable--;e.step++;setIntent(s,e);
  }
 }
 checkVictory(s);if(s.phase==='combat')beginTurn(s);
}
function cardPool(s,rareOnly=false){return Object.values(CARDS).filter(c=>['common','rare'].includes(c.rarity)&&(c.hero===s.hero||c.hero==='neutral')&&(!rareOnly||c.rarity==='rare')).map(c=>c.id);}
function choices(s,list,n){return shuffle(s,list).slice(0,n);}
function checkVictory(s){
 if(s.phase!=='combat'||s.combat.enemies.some(e=>e.hp>0))return;
 const type=s.combat.type;s.stats.battles++;const gold=Math.floor(19+random(s)*13)+(type==='elite'?22:type==='boss'?65:0)+(s.relics.includes('bell')?15:0);s.gold+=gold;
 if(s.relics.includes('coal'))heal(s,5);
 const possibleRelics=Object.keys(RELICS).filter(id=>!s.relics.includes(id)&&!['coal','lens','fang'].includes(id));
 s.reward={type,gold,cards:choices(s,cardPool(s,type==='boss'),3),cardTaken:false,relics:type==='battle'?[]:choices(s,possibleRelics,3),relicTaken:false,potion:random(s)<.35?pick(s,Object.keys(POTIONS)):null,potionTaken:false};
 s.phase='reward';note(s,`胜利！获得 ${gold} 金币。`);
}
export function takeReward(s,kind,id){
 assert(s.phase==='reward','现在没有战利品');const r=s.reward;
 if(kind==='card'){assert(!r.cardTaken&&r.cards.includes(id),'此卡牌不可选');addCard(s,id);r.cardTaken=true;note(s,`将${CARDS[id].name}加入卡组。`);}
 else if(kind==='relic'){assert(!r.relicTaken&&r.relics.includes(id),'此遗物不可选');addRelic(s,id);r.relicTaken=true;}
 else if(kind==='potion'){assert(!r.potionTaken&&r.potion===id,'药水不可选');assert(s.potions.length<3,'药水栏已满');s.potions.push(id);r.potionTaken=true;}
 else throw new Error('未知奖励');
}
export function leaveReward(s){
 assert(s.phase==='reward','现在没有战利品');const boss=s.reward.type==='boss';s.reward=null;s.combat=null;
 if(boss){if(s.act===2){s.phase='victory';note(s,'无光之主倒下。你带回了黎明。');}else{s.act++;s.floor=-1;s.col=1;s.map=generateMap(s);heal(s,Math.ceil(s.maxHp*.25));s.phase='map';note(s,`来到${ACTS[s.act].name}，恢复了 25% 最大生命。`);}}else s.phase='map';
}
export function addRelic(s,id){assert(RELICS[id]&&!s.relics.includes(id),'无法获得此遗物');s.relics.push(id);if(id==='heart'){s.maxHp+=12;heal(s,12);}note(s,`获得遗物：${RELICS[id].name}。`);}
export function usePotion(s,index){
 assert(s.phase==='combat','药水仅在战斗中使用');assert(Number.isInteger(index)&&index>=0&&index<s.potions.length,'没有这瓶药水');
 const id=s.potions.splice(index,1)[0];note(s,`使用${POTIONS[id].name}。`);
 if(id==='heal')heal(s,20);if(id==='fire')for(const e of s.combat.enemies.filter(e=>e.hp>0))enemyDamage(s,e,18);if(id==='shield')s.combat.block+=18;if(id==='energy'){s.combat.energy+=2;drawCards(s,2);}
 if(s.relics.includes('orb'))drawCards(s,2);checkVictory(s);
}
export function discardPotion(s,index){assert(Number.isInteger(index)&&index>=0&&index<s.potions.length,'没有这瓶药水');s.potions.splice(index,1);}
function price(s,n){return Math.floor(n*(s.relics.includes('coin')?.75:1));}
function generateShop(s){
 const cards=choices(s,cardPool(s),5).map(id=>({id,price:price(s,CARDS[id].rarity==='rare'?94:54),sold:false}));
 const relics=choices(s,Object.keys(RELICS).filter(id=>!s.relics.includes(id)&&!['coal','lens','fang'].includes(id)),2).map(id=>({id,price:price(s,145),sold:false}));
 const potions=choices(s,Object.keys(POTIONS),2).map(id=>({id,price:price(s,35),sold:false}));
 return{cards,relics,potions,removePrice:price(s,60+s.removed*15),removed:false};
}
export function buy(s,kind,index){
 assert(s.phase==='shop','现在不在商店');assert(['cards','relics','potions'].includes(kind),'未知商品');assert(Number.isInteger(index),'商品索引无效');
 const item=s.shop[kind][index];assert(item&&!item.sold,'商品已售出');assert(s.gold>=item.price,'金币不足');if(kind==='potions')assert(s.potions.length<3,'药水栏已满');
 if(kind==='cards')addCard(s,item.id);if(kind==='relics')addRelic(s,item.id);if(kind==='potions')s.potions.push(item.id);
 s.gold-=item.price;item.sold=true;
}
export function openRemove(s){
 assert(s.phase==='shop','现在不在商店');assert(!s.shop.removed&&s.gold>=s.shop.removePrice,'无法移除卡牌');assert(s.deck.length>1,'至少保留一张卡牌');s.picker={mode:'remove',from:'shop',cost:s.shop.removePrice};s.phase='chooseCard';
}
export function rest(s,choice){
 assert(s.phase==='rest','现在不在篝火');
 if(choice==='heal'){const n=heal(s,Math.ceil(s.maxHp*.3)+(s.relics.includes('fern')?10:0));note(s,`篝火休息，恢复 ${n} 生命。`);s.phase='map';}
 else if(choice==='upgrade'){assert(s.deck.some(c=>!c.up&&CARDS[c.id].type!=='curse'),'没有可升级的牌');s.picker={mode:'upgrade',from:'rest',cost:0};s.phase='chooseCard';}
 else throw new Error('未知篝火选项');
}
export function previewUpgrade(s,uid){
 assert(s.phase==='chooseCard'&&s.picker?.mode==='upgrade','当前不是升级操作');
 const card=s.deck.find(c=>c.uid===uid);assert(card&&!card.up&&CARDS[card.id].type!=='curse','此卡牌不能升级');
 return {before:{...card},after:{...card,up:true}};
}
export function chooseCard(s,uid){
 assert(s.phase==='chooseCard'&&s.picker,'当前没有选牌操作');const c=s.deck.find(x=>x.uid===uid);assert(c,'卡牌不存在');const p=s.picker;
 if(p.mode==='upgrade'){assert(!c.up&&CARDS[c.id].type!=='curse','这张牌无法升级');c.up=true;note(s,`升级了${CARDS[c.id].name}。`);}
 else if(p.mode==='remove'){assert(s.deck.length>1,'至少保留一张牌');assert(s.gold>=p.cost,'金币不足');s.gold-=p.cost;s.deck=s.deck.filter(x=>x.uid!==uid);s.removed++;if(p.from==='shop')s.shop.removed=true;note(s,`移除了${CARDS[c.id].name}。`);}
 else throw new Error('无效选牌操作');
 s.phase=p.from==='shop'?'shop':p.from==='event'?'event':'map';s.picker=null;if(p.from==='event')s.event.resolved=true;
}
export function cancelPicker(s){assert(s.phase==='chooseCard','没有选牌操作');const p=s.picker;s.phase=p.from;s.picker=null;if(p.from==='event')s.event.resolved=false;}
export function leaveShop(s){assert(s.phase==='shop','现在不在商店');s.phase='map';s.shop=null;}
export function eventDefinition(s){return EVENTS.find(e=>e.id===s.event?.id);}
export function eventAvailable(s,index){
 const choice=eventDefinition(s)?.choices[index];if(!choice||s.event.resolved)return false;
 const e=choice.effect;if(e==='offering')return s.gold>=35;if(e==='trade')return s.gold>=25&&s.potions.length<3;if(e==='forget')return s.deck.length>1;
 if(e==='smith')return s.hp>7;if(e==='sacrifice')return s.hp>10;return true;
}
export function chooseEvent(s,index){
 assert(s.phase==='event'&&Number.isInteger(index)&&eventAvailable(s,index),'无法选择此事件选项');const choice=eventDefinition(s).choices[index],e=choice.effect;
 if(e==='well'){heal(s,22);addCard(s,'falter');}
 if(['offering','sacrifice'].includes(e)){
  if(e==='offering')s.gold-=35;else s.hp-=10;
  const pool=Object.keys(RELICS).filter(id=>!s.relics.includes(id)&&!['coal','lens','fang'].includes(id));if(pool.length)addRelic(s,pick(s,pool));else{s.gold+=80;note(s,'遗物已经收齐，改为获得 80 金币。');}
 }
 if(e==='smith'){s.hp-=7;const cards=choices(s,s.deck.filter(c=>!c.up&&CARDS[c.id].type!=='curse'),2);for(const c of cards)c.up=true;}
 if(e==='herbs')heal(s,12);if(e==='rest')heal(s,10);if(e==='dust')s.gold+=45;if(e==='fire')s.gold+=30;
 if(e==='learn')addCard(s,pick(s,cardPool(s,true)));if(e==='trade'){s.gold-=25;s.potions.push('heal');}
 s.event.resolved=true;s.event.result=choice.detail;note(s,`${eventDefinition(s).name}：${choice.label}。`);
 if(e==='forget'){s.picker={mode:'remove',from:'event',cost:0};s.phase='chooseCard';}
}
export function leaveEvent(s){assert(s.phase==='event'&&s.event.resolved,'请先完成事件选择');s.event=null;s.phase='map';}
export function enemyIntentDamage(e){if(!e.intent.damage)return 0;return Math.floor((e.intent.damage+e.status.strength)*(e.status.weak>0?.75:1))*(e.intent.hits||1);}

// Strict allowlist validation; local save data is never executed as code.
export function validate(s){
 assert(s&&typeof s==='object'&&s.version===VERSION,'存档版本不兼容');assert(Object.hasOwn(HEROES,s.hero)&&['normal','story','hard'].includes(s.difficulty),'角色数据无效');
 assert(typeof s.seed==='string'&&s.seed.length<=80,'种子无效');assert(phases.includes(s.phase),'阶段无效');
 const integer=(x,lo,hi)=>Number.isInteger(x)&&x>=lo&&x<=hi;
 assert(integer(s.rng,1,4294967295)&&integer(s.nextUid,1,100000),'随机状态无效');
 assert(integer(s.act,0,2)&&integer(s.floor,-1,7)&&integer(s.col,0,2),'地图位置无效');
 assert(integer(s.maxHp,1,1000)&&integer(s.hp,0,s.maxHp)&&integer(s.gold,0,100000),'资源数据无效');
 assert((s.phase==='defeat')===(s.hp===0),'生命与阶段不一致');
 assert(Array.isArray(s.deck)&&s.deck.length>0&&s.deck.length<=250,'卡组无效');
 const ids=new Set();for(const card of s.deck){assert(Object.hasOwn(CARDS,card.id)&&typeof card.up==='boolean'&&/^c\d+$/.test(card.uid),'卡牌无效');assert(!ids.has(card.uid),'卡牌编号重复');assert(Number(card.uid.slice(1))<s.nextUid,'卡牌序号无效');ids.add(card.uid);}
 assert(Array.isArray(s.relics)&&s.relics.length<=Object.keys(RELICS).length&&new Set(s.relics).size===s.relics.length&&s.relics.every(id=>Object.hasOwn(RELICS,id)),'遗物无效');
 assert(Array.isArray(s.potions)&&s.potions.length<=3&&s.potions.every(id=>Object.hasOwn(POTIONS,id)),'药水无效');
 assert(Array.isArray(s.log)&&s.log.length<=70&&s.log.every(x=>typeof x==='string'&&x.length<=300),'记录无效');
 assert(Array.isArray(s.map)&&s.map.length===8,'路线图无效');
 for(let row=0;row<8;row++){assert(Array.isArray(s.map[row])&&s.map[row].length===(row===7?1:3),'地图层无效');const cols=new Set();for(const n of s.map[row]){assert(n.row===row&&integer(n.col,0,2)&&!cols.has(n.col)&&n.id===`a${s.act}r${row}c${n.col}`,'节点无效');cols.add(n.col);const expected=row===7?[]:row===6?[1]:[0,1,2].filter(c=>Math.abs(c-n.col)<=1);assert(['battle','elite','boss','rest','shop','event'].includes(n.type)&&Array.isArray(n.links)&&JSON.stringify(n.links)===JSON.stringify(expected),'节点内容无效');if(row===7)assert(n.type==='boss'&&n.col===1,'首领节点无效');}}
 assert(Array.isArray(s.visited)&&s.visited.length<=24&&s.visited.every(id=>/^a[0-2]r[0-7]c[0-2]$/.test(id)),'路线记录无效');
 assert(s.stats&&['battles','cardsPlayed','kills','damage','turns'].every(k=>integer(s.stats[k],0,1000000))&&integer(s.removed,0,250),'统计无效');
 const statValid=o=>o&&Object.keys(o).length===Object.keys(status()).length&&Object.keys(status()).every(k=>integer(o[k],0,100000));
 if(s.phase==='combat'||s.phase==='reward'){
  const c=s.combat;assert(c&&['battle','elite','boss'].includes(c.type)&&integer(c.turn,1,10000)&&integer(c.energy,0,10000)&&integer(c.block,0,100000)&&statValid(c.status),'战斗资源无效');
  assert(integer(c.attacks,0,10000)&&integer(c.spells,0,10000)&&typeof c.knightShield==='boolean'&&typeof c.lanternUsed==='boolean'&&Array.isArray(c.effects)&&c.effects.length<=24,'战斗计数无效');
  const seen=new Set();for(const pile of ['hand','draw','discard','exhaust']){assert(Array.isArray(c[pile])&&c[pile].length<=250,'牌堆无效');for(const x of c[pile]){const original=s.deck.find(d=>d.uid===x.uid);assert(original&&original.id===x.id&&original.up===x.up&&!seen.has(x.uid),'战斗牌堆无效');seen.add(x.uid);}}
  // Reward can already add cards to the persistent deck, but not this battle.
  if(s.phase==='combat')assert(seen.size===s.deck.length,'战斗卡牌丢失');
  assert(c.hand.length<=10&&Array.isArray(c.enemies)&&c.enemies.length>0&&c.enemies.length<=4,'敌人数据无效');
  const enemyIds=new Set();for(const e of c.enemies){assert(Object.hasOwn(ENEMIES,e.id)&&e.name===ENEMIES[e.id].name&&e.art===ENEMIES[e.id].art&&/^e\d+$/.test(e.uid)&&!enemyIds.has(e.uid)&&integer(e.maxHp,1,10000)&&integer(e.hp,0,e.maxHp)&&integer(e.block,0,100000)&&integer(e.step,0,10000)&&statValid(e.status)&&e.intent&&integer(e.intent.damage,0,10000)&&integer(e.intent.hits,1,20),'敌人无效');enemyIds.add(e.uid);for(const [k,n]of Object.entries(e.intent))assert(['damage','hits','block','strength','poison','weak'].includes(k)&&integer(n,0,10000),'敌人意图无效');}
  assert(s.phase==='reward'?c.enemies.every(e=>e.hp===0):c.enemies.some(e=>e.hp>0),'胜利状态无效');
 }
 if(s.phase==='reward'){const r=s.reward;assert(r&&['battle','elite','boss'].includes(r.type)&&integer(r.gold,0,1000)&&Array.isArray(r.cards)&&r.cards.every(id=>Object.hasOwn(CARDS,id))&&Array.isArray(r.relics)&&r.relics.every(id=>Object.hasOwn(RELICS,id))&&['cardTaken','relicTaken','potionTaken'].every(k=>typeof r[k]==='boolean')&&(!r.potion||Object.hasOwn(POTIONS,r.potion)),'战利品无效');}
 if(s.phase==='shop'||(s.phase==='chooseCard'&&s.picker?.from==='shop')){const shop=s.shop;assert(shop&&integer(shop.removePrice,0,10000)&&typeof shop.removed==='boolean','商店无效');for(const [key,pool]of [['cards',CARDS],['relics',RELICS],['potions',POTIONS]]){assert(Array.isArray(shop[key])&&shop[key].length<=8&&shop[key].every(i=>Object.hasOwn(pool,i.id)&&integer(i.price,0,10000)&&typeof i.sold==='boolean'),'商品无效');}}
 if(s.phase==='event'||(s.phase==='chooseCard'&&s.picker?.from==='event'))assert(eventDefinition(s)&&typeof s.event.resolved==='boolean'&&typeof s.event.result==='string','事件无效');
 if(s.phase==='chooseCard')assert(s.picker&&['upgrade','remove'].includes(s.picker.mode)&&['rest','shop','event'].includes(s.picker.from)&&integer(s.picker.cost,0,10000),'选牌状态无效');
 return true;
}
export function serialize(s){validate(s);return JSON.stringify(s);}
export function deserialize(text){assert(typeof text==='string'&&text.length<300000,'存档文件过大');let s;try{s=JSON.parse(text);}catch{throw new Error('存档不是有效的 JSON，请检查是否复制完整。');}validate(s);return s;}
