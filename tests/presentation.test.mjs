import test from 'node:test';import assert from 'node:assert/strict';
import {CARDS,cardText,catalogCards} from '../src/content.mjs';import {cardArt} from '../src/art.mjs';import {CARD_SCENES} from '../src/card-scenes.mjs';import {feedbackTimeline,cardMotionPlan} from '../src/fx.mjs';import * as E from '../src/engine.mjs';
test('every card has an individually authored non-icon scene',()=>{
 assert.deepEqual(Object.keys(CARD_SCENES).sort(),Object.keys(CARDS).sort());
 const compositions=Object.values(CARD_SCENES).map(fn=>fn());assert.equal(new Set(compositions).size,56);
 for(const d of Object.values(CARDS)){const svg=cardArt(d.id,d.type,d.hero);assert(svg.startsWith('<svg'));assert(svg.includes('viewBox="0 0 360 220"'));assert(svg.includes(CARD_SCENES[d.id]()));assert(!svg.includes('undefined'));}
 assert.throws(()=>cardArt('missing','attack','knight'));
});
for(const d of Object.values(CARDS).filter(d=>d.type!=='curse'))test(`preview ${d.id}: immutable, then exact one-card confirmation`,()=>{
 const s=E.newRun(d.hero==='neutral'?'knight':d.hero,'PREVIEW');const c=E.addCard(s,d.id);s.phase='rest';E.rest(s,'upgrade');const original=E.serialize(s),rng=s.rng,gold=s.gold,hp=s.hp;
 const p=E.previewUpgrade(s,c.uid);assert.equal(E.serialize(s),original);assert.equal(p.before.up,false);assert.equal(p.after.up,true);assert.notEqual(cardText(p.before),cardText(p.after));
 p.after.up=false;assert.equal(c.up,false);E.chooseCard(s,c.uid);assert.equal(c.up,true);assert.equal(s.deck.filter(x=>x.up).length,1);assert.equal(s.phase,'map');assert.equal(s.rng,rng);assert.equal(s.gold,gold);assert.equal(s.hp,hp);E.validate(s);assert.throws(()=>E.chooseCard(s,c.uid));
});
test('preview rejects invalid, upgraded and cursed cards without mutation',()=>{
 const s=E.newRun();E.addCard(s,'cut',true);E.addCard(s,'falter');s.phase='rest';E.rest(s,'upgrade');const before=E.serialize(s);
 for(const uid of ['bad',...s.deck.filter(c=>c.up||CARDS[c.id].type==='curse').map(c=>c.uid)]){assert.throws(()=>E.previewUpgrade(s,uid));assert.equal(E.serialize(s),before);}
 E.cancelPicker(s);const canceled=E.serialize(s);assert.equal(s.phase,'rest');assert.throws(()=>E.previewUpgrade(s,s.deck[0].uid));assert.equal(E.serialize(s),canceled);
});
test('feedback queue preserves every multi-hit event in chronological order',()=>{
 const events=[{type:'enemyAttack',target:'e0'},{type:'damage',amount:7,target:'hero'},{type:'damage',amount:7,target:'hero'},{type:'enemyAttack',target:'e1'},{type:'damage',amount:0,target:'hero'}];const copy=structuredClone(events),queue=feedbackTimeline(events);
 assert.deepEqual(events,copy);assert.deepEqual(queue.map(({at,...rest})=>rest),events);assert(queue.every((e,i)=>!i||e.at>queue[i-1].at));assert(queue.at(-1).at<2000);
});
test('encyclopedia contains all cards with independent combinable filters',()=>{
 assert.equal(catalogCards().length,56);assert.equal(catalogCards({hero:'mage'}).length,16);assert.equal(catalogCards({hero:'neutral'}).length,8);
 const poison=catalogCards({hero:'rogue',query:'中毒'});assert(poison.length>0);assert(poison.every(c=>CARDS[c.id].hero==='rogue'&&cardText(c).includes('中毒')));
 assert(catalogCards({type:'attack',rarity:'rare'}).every(c=>CARDS[c.id].type==='attack'&&CARDS[c.id].rarity==='rare'));
 assert.equal(catalogCards({query:'不存在的卡'}).length,0);assert.equal(catalogCards({query:' 星火 '})[0].id,'spark');
 assert(catalogCards({up:true}).every(c=>c.up===(CARDS[c.id].type!=='curse')));
});
test('card motion plan: opening draw, played/discard, redraw recycled UID and exhaust',()=>{
 const s=E.newRun('knight','MOTION'),original=structuredClone(s);E.startBattle(s,'battle',['golem']);let p=cardMotionPlan(original,s);assert.equal(p.draw.length,5);assert.equal(p.discard.length,0);
 let before=structuredClone(s),c=s.combat.hand.find(c=>c.id==='cut');if(!c){E.drawCards(s,5);before=structuredClone(s);c=s.combat.hand.find(c=>c.id==='cut');}E.playCard(s,c.uid);p=cardMotionPlan(before,s);assert.equal(p.played.uid,c.uid);assert.equal(p.destination,'discard');assert.equal(p.draw.length,0);
 before=structuredClone(s);E.endTurn(s);p=cardMotionPlan(before,s);assert.equal(p.discard.length,before.combat.hand.length);assert.equal(p.draw.length,s.combat.hand.length);assert.equal(p.reshuffle,p.draw.length>before.combat.draw.length);
 before=structuredClone(s);E.endTurn(s);p=cardMotionPlan(before,s);assert.equal(p.draw.length,5);assert(p.reshuffle);assert.equal(p.played,null);
 const m=E.newRun('mage','DRAW');E.startBattle(m,'battle',['golem']);E.drawCards(m,3);c=m.combat.hand.find(c=>c.id==='focus');before=structuredClone(m);E.playCard(m,c.uid);p=cardMotionPlan(before,m);assert.equal(p.destination,'exhaust');assert.equal(p.played.id,'focus');assert.deepEqual(p.draw.map(c=>c.uid),m.combat.hand.filter(c=>!before.combat.hand.some(x=>x.uid===c.uid)).map(c=>c.uid));
});
test('draw-card may reshuffle itself back into hand without losing presentation identity',()=>{
 const s=E.newRun('mage','RECYCLE');s.deck=[];const card=E.addCard(s,'echo');E.startBattle(s,'battle',['golem']);const before=structuredClone(s);const result=E.playCard(s,card.uid);assert(s.combat.hand.some(c=>c.uid===card.uid));const p=cardMotionPlan(before,s,result.uid);assert.equal(p.played.uid,card.uid);assert.equal(p.destination,'discard');assert.equal(p.draw[0].uid,card.uid);assert(p.reshuffle);E.validate(s);
});
