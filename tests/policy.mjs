import * as E from '../src/engine.mjs';
import {CARDS} from '../src/content.mjs';

export function rateCard(s,card){
 const d=CARDS[card.id],c=s.combat;let value=0;
 const intent=c?c.enemies.filter(e=>e.hp>0).reduce((n,e)=>n+E.enemyIntentDamage(e),0):15;
 for(const [k,b,u]of d.effects){const n=b+(card.up?u:0);value+=({hit:1,allHit:1.9,block:c&&c.block>=intent?.12:.95,draw:4,energy:7,heal:s.hp<s.maxHp-8?2:0,loseHp:-2,strength:c?.turn<4?10:4,dexterity:9,thorns:7,plating:10,spellPower:7,venomBlade:11,poison:2.6,allPoison:4,burn:2.3,allBurn:3.8,weak:3,vulnerable:3,shieldHit:1.5,execute:1.5,poisonHit:2,doublePoison:8,doubleBurn:7})[k]*n||0;}
 if(c&&d.id==='riposte')value+=c.block;
 if(c&&d.id==='assassinate')value+=Math.max(...c.enemies.map(e=>e.status.poison))*3;
 if(c&&d.id==='spread')value+=Math.max(...c.enemies.map(e=>e.status.poison))*2;
 if(c&&d.id==='catalyst')value+=Math.max(...c.enemies.map(e=>e.status.burn))*2;
 return value/(.65+d.cost*.65);
}
export function chooseCombatAction(s){
 const c=s.combat,card=[...c.hand].filter(x=>E.canPlay(s,x)).sort((a,b)=>rateCard(s,b)-rateCard(s,a))[0];
 if(!card)return null;
 const d=CARDS[card.id];const damage=d.effects.filter(([k])=>['hit','shieldHit','execute','poisonHit'].includes(k)).reduce((n,[k,b,u])=>n+b+(card.up?u:0)+(k==='shieldHit'?c.block:0)+c.status.strength,0);
 let targets=c.enemies.filter(e=>e.hp>0);
 const poison=d.effects.some(([k])=>['poison','doublePoison','poisonHit'].includes(k)),burn=d.effects.some(([k])=>['burn','doubleBurn'].includes(k));
 if(d.effects.some(([k])=>['doublePoison','poisonHit'].includes(k)))targets.sort((a,b)=>b.status.poison-a.status.poison);
 else if(d.effects.some(([k])=>k==='doubleBurn'))targets.sort((a,b)=>b.status.burn-a.status.burn);
 else targets.sort((a,b)=>{const killA=damage>=a.hp+a.block?1:0,killB=damage>=b.hp+b.block?1:0;return killB-killA||((poison?a.status.poison:burn?a.status.burn:0)-(poison?b.status.poison:burn?b.status.burn:0))||a.hp-b.hp;});
 return {uid:card.uid,target:targets[0]?.uid};
}
const rewardRatings={rage:100,thorn:88,bastion:98,fortify:70,riposte:70,cleave:75,crush:82,charge:65,double:62,execute:78,defiance:75,rally:75,blood:40,
 astral:87,inferno:100,catalyst:90,firestorm:85,comet:75,nova:85,mana:80,focus:75,barrier:73,weave:82,frost:70,pulse:70,
 plague:100,spread:95,envenom:90,toxic:88,assassinate:90,flurry:82,triple:80,dash:72,nightfall:85,accelerate:78,backstab:75,ambush:75,wraith:70,venom:85,
 resolve:85,bandage:88,prism:85,insight:60,wall:60,heavy:60};
export function stepRun(s){
 if(s.phase==='map'){
  const nodes=E.availableNodes(s);const rank=n=>n.type==='rest'?(s.hp<s.maxHp*.75?100:70):n.type==='shop'?(s.gold>90?85:5):n.type==='event'?65:n.type==='elite'?(s.hp>s.maxHp*.85&&s.act>0?35:-10):30;
  nodes.sort((a,b)=>rank(b)-rank(a));E.selectNode(s,nodes[0].id);
 }else if(s.phase==='combat'){
  if(s.hp<s.maxHp-20&&s.potions.includes('heal')){E.usePotion(s,s.potions.indexOf('heal'));return;}
  const incoming=s.combat.enemies.filter(e=>e.hp>0).reduce((n,e)=>n+E.enemyIntentDamage(e),0);
  if(incoming>s.combat.block+8&&s.potions.includes('shield')){E.usePotion(s,s.potions.indexOf('shield'));return;}
  if(s.combat.enemies.filter(e=>e.hp>0).length>1&&s.potions.includes('fire')){E.usePotion(s,s.potions.indexOf('fire'));return;}
  const action=chooseCombatAction(s);if(action)E.playCard(s,action.uid,action.target);else if(s.potions.includes('energy'))E.usePotion(s,s.potions.indexOf('energy'));else E.endTurn(s);
 }else if(s.phase==='reward'){
  if(!s.reward.cardTaken&&s.deck.length<21){const id=[...s.reward.cards].sort((a,b)=>(rewardRatings[b]||50)-(rewardRatings[a]||50))[0];E.takeReward(s,'card',id);}
  else if(s.reward.relics.length&&!s.reward.relicTaken){const ranking=['feather','crown','whetstone','needle','cloak','heart','lantern','boots','shell','fern','coin','bell','orb'];E.takeReward(s,'relic',[...s.reward.relics].sort((a,b)=>ranking.indexOf(a)-ranking.indexOf(b))[0]);}
  else if(s.reward.potion&&!s.reward.potionTaken&&s.potions.length<3)E.takeReward(s,'potion',s.reward.potion);else E.leaveReward(s);
 }else if(s.phase==='rest'){if(s.hp<s.maxHp*.78)E.rest(s,'heal');else if(s.deck.some(c=>!c.up&&CARDS[c.id].type!=='curse'))E.rest(s,'upgrade');else E.rest(s,'heal');}
 else if(s.phase==='chooseCard'){
  let cards=s.deck.filter(c=>s.picker.mode==='remove'||(!c.up&&CARDS[c.id].type!=='curse'));
  cards.sort((a,b)=>s.picker.mode==='remove'?((CARDS[a.id].type==='curse'?-100:CARDS[a.id].rarity==='basic'?0:50)-(CARDS[b.id].type==='curse'?-100:CARDS[b.id].rarity==='basic'?0:50)):(rewardRatings[b.id]||40)-(rewardRatings[a.id]||40));E.chooseCard(s,cards[0].uid);
 }else if(s.phase==='shop'){
  const relic=s.shop.relics.findIndex(x=>!x.sold&&x.price<=s.gold);
  const potion=s.shop.potions.findIndex(x=>x.id==='heal'&&!x.sold&&x.price<=s.gold&&s.potions.length<3);
  const card=s.shop.cards.findIndex(x=>!x.sold&&x.price<=s.gold&&(rewardRatings[x.id]||0)>75&&s.deck.length<19);
  if(relic>=0)E.buy(s,'relics',relic);else if(potion>=0)E.buy(s,'potions',potion);else if(card>=0)E.buy(s,'cards',card);else if(!s.shop.removed&&s.gold>=s.shop.removePrice&&s.deck.length>9)E.openRemove(s);else E.leaveShop(s);
 }else if(s.phase==='event'){
  if(s.event.resolved)E.leaveEvent(s);else{const event=E.eventDefinition(s);let indices=event.id==='well'?[s.hp<s.maxHp-18?0:1,2]:event.id==='smith'?[s.hp>s.maxHp*.6?0:1,1,2]:event.id==='altar'?[0,1,2]:[0,1,2];const index=indices.find(i=>E.eventAvailable(s,i));E.chooseEvent(s,index);}
 }
}
export function simulate(hero,seed,difficulty='normal',checkpoint=true){
 let s=E.newRun(hero,seed,difficulty),steps=0;
 while(!['victory','defeat'].includes(s.phase)&&steps++<5000){stepRun(s);E.validate(s);if(checkpoint&&steps%13===0)s=E.deserialize(E.serialize(s));}
 if(steps>=5000)throw new Error(`Run did not terminate: ${hero} ${seed}`);
 return {s,steps};
}
