import * as E from './engine.mjs';
import {HEROES,CARDS,TYPES,RELICS,POTIONS,ACTS,KEYWORDS,cardText,catalogCards} from './content.mjs';
import {icon,heroArt,enemyArt,cardArt,landscape,uri} from './art.mjs';
import {tone,unlock,preferences,updateAudio,audioState} from './audio.mjs';
import {battleFeedback,cardMotionPlan,discardFeedback,drawFeedback,playedToPile} from './fx.mjs';

const app=document.querySelector('#app'),overlays=document.querySelector('#overlay-root');
const SAVE='emberbound.run.v1',SETTINGS='emberbound.settings.v1',HISTORY='emberbound.history.v1';
let s=null,page='title',selectedHero='knight',difficulty='normal',selectedCard=null,overlay=null,busy=false,timer=null,saveWarning='',tutorial=true;
const cache=new Map();const art=(key,fn)=>{if(!cache.has(key))cache.set(key,uri(fn()));return cache.get(key);};
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const imgHero=id=>art('hero-'+id,()=>heroArt(id));const imgEnemy=id=>art('enemy-'+id,()=>enemyArt(id));
const button=(label,action,cls='',disabled=false,attrs='')=>`<button class="btn ${cls}" data-action="${action}" ${disabled?'disabled':''} ${attrs}>${label}</button>`;
const names={battle:'遭遇',elite:'精英',boss:'首领',rest:'篝火',shop:'商店',event:'奇遇'};
const glyph={battle:'sword',elite:'elite',boss:'skull',rest:'rest',shop:'shop',event:'question'};
const statusNames={strength:'力量',dexterity:'敏捷',weak:'虚弱',vulnerable:'易伤',poison:'中毒',burn:'灼烧',thorns:'反伤',plating:'护甲',spellPower:'织焰',venomBlade:'蛇吻'};
try{const stored=JSON.parse(localStorage.getItem(SETTINGS)||'{}');for(const k of ['sound','music','reducedMotion'])if(typeof stored[k]==='boolean')preferences[k]=stored[k];if(typeof stored.volume==='number'&&Number.isFinite(stored.volume))preferences.volume=Math.max(0,Math.min(.8,stored.volume));tutorial=stored.tutorial!==false;}catch{saveWarning='设置读取失败，已使用默认设置。';}
document.body.classList.toggle('reduced-motion',preferences.reducedMotion);
function getSaved(){try{const raw=localStorage.getItem(SAVE);return raw?E.deserialize(raw):null;}catch{saveWarning='发现损坏或旧版存档，无法继续。开始新远征会覆盖它。';return null;}}
let saved=getSaved();
function persistSettings(){try{localStorage.setItem(SETTINGS,JSON.stringify({...preferences,tutorial}));}catch{toast('浏览器拒绝写入设置。');}}
function save(){try{localStorage.setItem(SAVE,E.serialize(s));saved=structuredClone(s);}catch(error){toast(`存档失败：${error.message}。请勿关闭页面。`);}}
function archive(){if(!['victory','defeat'].includes(s.phase))return;try{const history=JSON.parse(localStorage.getItem(HISTORY)||'[]');const key=`${s.seed}:${s.hero}:${s.stats.turns}`;if(!history.some(x=>x.key===key)){history.unshift({key,hero:s.hero,seed:s.seed,outcome:s.phase,act:s.act,battles:s.stats.battles,date:new Date().toISOString()});localStorage.setItem(HISTORY,JSON.stringify(history.slice(0,20)));}}catch{/* History never blocks gameplay. */}}
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>el.classList.remove('show'),3500);}
function backdrop(act=0,title=false){document.querySelector('#backdrop').style.backgroundImage=`url("${art(`land-${act}-${title}`,()=>landscape(act,title))}")`;}
document.querySelector('#particles').innerHTML=Array.from({length:15},(_,i)=>`<i class="mote" style="left:${(i*47)%100}%;top:${30+(i*13)%60}%;animation-delay:${-i*1.5}s;animation-duration:${9+i%6}s"></i>`).join('');

function title(){
 backdrop(0,true);
 return `<div class="title-screen"><div class="brandbar"><div class="brandmark">${icon('flame')} EMBERBOUND <span class="pill">独立卡牌肉鸽</span></div><div style="display:flex;gap:8px">${button('玩法说明','help','ghost')}${button(icon('gear'),'settings','ghost')}</div></div>
 <div class="title-content"><div class="title-copy"><div class="eyebrow">一副牌 · 三段旅途 · 最后的黎明</div><h1>灰烬远征</h1><div class="english">EMBERBOUND</div><p>世界只剩下一点余火。<br>选择你的道路，将每一次战斗，<br>铸成属于你的牌组。</p><div class="title-actions">${button('开始远征 '+icon('arrow'),'select','primary')}${saved&&!['victory','defeat'].includes(saved.phase)?button('继续旅途','continue'):''}${button('旅途记录','history','ghost')}</div>${saveWarning?`<p class="small gold" style="margin-top:15px">${esc(saveWarning)}</p>`:''}</div>
 <div class="hero-stage"><div class="rune"></div><img src="${imgHero('mage')}" alt="持杖的焰语师"><img src="${imgHero('knight')}" alt="持剑盾的余烬骑士"><img src="${imgHero('rogue')}" alt="双刃夜行客"></div></div>
 <div class="title-foot"><span>逐卡原创插画 · 三章完整远征</span>${button('卡牌图鉴 · 全部 56 张','catalog','ghost')}<span>v1.1 · 中文版</span></div></div>`;
}
function selection(){
 backdrop(0);
 return `<section class="selection-screen"><div class="sectionhead">${button('← 返回','menu','ghost')}<span class="label">CHOOSE YOUR EMBER</span>${button('玩法说明','help','ghost')}</div><h1>选择你的余火</h1><p class="muted small" style="text-align:center;margin-top:8px">每位英雄，都有自己的战斗节奏。</p><div class="hero-select">${Object.entries(HEROES).map(([id,h])=>`<button class="hero-option ${id===selectedHero?'selected':''}" data-action="hero" data-id="${id}" aria-pressed="${id===selectedHero}"><img src="${imgHero(id)}" alt="${h.name}"><h2>${h.name}</h2><div class="tagline">${h.title}</div><p>${h.mechanic}</p><span class="pill">${icon('heart')} ${h.hp} 生命 · 10 张起始牌</span></button>`).join('')}</div>
 <div class="run-options"><div class="difficulty" aria-label="难度">${[['story','旅人 · 轻松'],['normal','冒险 · 标准'],['hard','绝境 · 困难']].map(([id,label])=>`<button data-action="difficulty" data-id="${id}" class="${difficulty===id?'selected':''}" aria-pressed="${difficulty===id}">${label}</button>`).join('')}</div><input class="seed-input" id="seed" maxlength="80" placeholder="自定义种子（可留空）" aria-label="远征种子"></div><p class="small muted" style="text-align:center;margin-bottom:18px">旅人模式：敌人生命和伤害降低。进度自动保存，可随时暂歇、稍后继续。</p><div class="start-row">${button('点燃余火，出发 '+icon('arrow'),'start','primary')}</div></section>`;
}
function shell(body){
 const h=HEROES[s.hero];
 return `<div class="game-shell"><header class="topbar"><div class="run-brand">${icon('flame')}<div><h1>灰烬远征</h1><small>${h.name}</small></div></div><div class="resources"><span class="res healthtext" title="生命归零，远征结束">${icon('heart')}${s.hp} / ${s.maxHp}</span><span class="res gold">${icon('coin')}${s.gold}</span><span class="res muted">第 ${s.act+1} 章 · ${s.floor+1}/8 层</span></div><div class="top-buttons"><button class="iconbtn" data-action="deck">${icon('deck')}<span>卡组 ${s.deck.length}</span></button><button class="iconbtn" data-action="help">${icon('question')}<span>说明</span></button><button class="iconbtn" data-action="settings">${icon('gear')}<span>设置</span></button><button class="iconbtn" data-action="pause">${icon('map')}<span>保存退出</span></button></div></header><div class="relicbar"><div class="relics">${s.relics.map(id=>`<span class="relic" tabindex="0" title="${RELICS[id].name}：${RELICS[id].text}">${icon(RELICS[id].icon)}</span>`).join('')}</div><div class="potions">${[0,1,2].map(i=>{const id=s.potions[i];return id?`<button class="potion" style="color:${POTIONS[id].color}" data-action="potion" data-index="${i}" aria-label="${POTIONS[id].name}" title="${POTIONS[id].name}：${POTIONS[id].text}${s.phase==='combat'?' 点击使用。':' 点击查看或丢弃。'}">${icon('potion')}</button>`:`<span class="potion empty" title="空药水栏">${icon('potion')}</span>`;}).join('')}</div></div>${body}<div class="screen-footer"><span class="saved">自动存档</span> · ${esc(s.seed)} · ${s.difficulty==='story'?'旅人':s.difficulty==='hard'?'绝境':'冒险'}模式</div></div>`;
}
function map(){
 const available=new Set(E.availableNodes(s).map(n=>n.id));const visited=new Set(s.visited);const x=c=>155+c*165,y=r=>640-r*77;
 let routes='';for(const row of s.map)for(const n of row)for(const col of n.links){const next=s.map[n.row+1]?.find(m=>m.col===col);if(next)routes+=`<path class="route ${visited.has(n.id)&&visited.has(next.id)?'traveled':''}" d="M${x(n.col)} ${y(n.row)-24} C${x(n.col)} ${y(n.row)-48},${x(col)} ${y(next.row)+48},${x(col)} ${y(next.row)+24}"/>`;}
 const nodes=s.map.flat().map(n=>`<g class="node ${available.has(n.id)?'available':visited.has(n.id)?'visited':'locked'}" ${available.has(n.id)?`data-action="node" data-id="${n.id}" role="button" tabindex="0" aria-label="第${n.row+1}层${names[n.type]}"`:''}><title>${n.row+1} 层 · ${names[n.type]}${available.has(n.id)?' — 可前往':''}</title><circle cx="${x(n.col)}" cy="${y(n.row)}" r="${n.type==='boss'?29:23}"/><g transform="translate(${x(n.col)-12} ${y(n.row)-13})" style="color:${visited.has(n.id)?'#1c383d':available.has(n.id)?'#efdab1':'#a2baac'}">${icon(glyph[n.type]).replace('viewBox=', 'width="24" height="26" viewBox=')}</g><text x="${x(n.col)}" y="${y(n.row)+41}">${names[n.type]}</text></g>`).join('');
 return `<div class="screen-caption"><div><div class="label">ACT ${s.act+1} / THE JOURNEY</div><h2>${ACTS[s.act].name}</h2></div><p>点击亮起的节点，选择下一段道路</p></div><div class="map-layout"><div class="map-frame"><svg class="map-svg" viewBox="0 0 640 700" aria-label="分支远征路线图">${routes}${nodes}${Array.from({length:8},(_,i)=>`<text x="48" y="${y(i)+4}" fill="#7f9d94" font-size="11">${String(i+1).padStart(2,'0')}</text>`).join('')}</svg><div class="map-note">向上探索 · 路线一旦选定不可回退</div></div><aside class="map-side"><div class="panel"><div class="chapter-num">0${s.act+1}</div><h3>${ACTS[s.act].subtitle}</h3><p class="muted small">危险的道路藏着更强的遗物。<br>也别忘了，篝火是活着抵达终点的理由。</p><div class="legend">${Object.entries(names).map(([id,name])=>`<span>${icon(glyph[id])}${name}</span>`).join('')}</div></div><div class="panel"><div class="label">BUILD YOUR STORY</div><h3 style="font-size:19px">旅途回声</h3>${s.log.slice(-5).reverse().map(t=>`<div class="logline">${esc(t)}</div>`).join('')}</div><div class="muted small">${HEROES[s.hero].mechanic}<div style="margin-top:10px">${button('查看我的卡组','deck','ghost')}</div></div></aside></div>`;
}
function cardMarkup(card,{action=null,attrs='',disabled=false,selected=false}={}){
 const d=CARDS[card.id];const texts=cardText(card).split('。').filter(Boolean);
 attrs+=` data-card-id="${card.id}" data-card-up="${card.up?'yes':'no'}"`;
 return `<${action?'button':'div'} class="card ${d.rarity==='rare'?'rare':''} ${card.up?'upgraded':''} ${d.type==='curse'?'curse':''} ${selected?'selected':''} ${action==='play'&&!disabled?'playable':''}" ${action?`data-action="${action}"`:''} ${attrs} ${disabled&&action?'disabled':''} title="${esc(d.name+(card.up?'+':'')+'：'+cardText(card))}"><span class="cost">${d.type==='curse'?'×':d.cost}</span><div class="card-name">${d.name}${card.up?'+':''}</div><img class="card-art" src="${art('card-'+d.id,()=>cardArt(d.id,d.type,d.hero))}" alt=""><div class="card-type">${TYPES[d.type]}</div><div class="card-description">${texts.join('<br>')}</div><div class="card-footer">${d.rarity==='rare'?'稀有':d.rarity==='basic'?'基础':d.rarity==='curse'?'诅咒':'普通'} · ${d.hero==='neutral'?'旅途':HEROES[d.hero].name}</div></${action?'button':'div'}>`;
}
function statuses(stats){return Object.entries(stats).filter(([,n])=>n>0).map(([id,n])=>`<span class="status ${['poison','burn','weak','vulnerable'].includes(id)?'harmful':''}" title="${KEYWORDS[id]||statusNames[id]}">${statusNames[id]} ${n}</span>`).join('');}
function hpbar(hp,maxHp){return `<div class="hpbar"><div class="hpfill" style="width:${Math.max(0,hp/maxHp*100)}%"></div><div class="hptext">${hp} / ${maxHp}</div></div>`;}
function intentDescription(e){const a=e.intent;let parts=[];if(a.damage)parts.push(`攻击 ${E.enemyIntentDamage(e)}${a.hits>1?`（${a.hits} 次）`:''}`);if(a.block)parts.push(`格挡 ${a.block}`);if(a.strength)parts.push(`力量 +${a.strength}`);if(a.poison)parts.push(`施加 ${a.poison} 中毒`);if(a.weak)parts.push(`施加 ${a.weak} 虚弱`);return parts.join('，');}
function combat(){
 const c=s.combat,h=HEROES[s.hero],combo=s.hero==='mage'?c.spells:s.hero==='rogue'?c.attacks:null;
 return `${tutorial?`<div class="tutorial-banner"><span>① 点选卡牌 ② 需要目标时点击怪物 ③ 能量用完后结束回合。敌人头上的数字是本回合意图。</span><button data-action="dismissTutorial">知道了 ×</button></div>`:''}<div class="combat-caption"><span>${ACTS[s.act].name} / ${names[c.type]}战</span><span>回合 ${c.turn} · ${c.enemies.some(e=>e.intent.damage&&e.hp>0)?'观察敌人意图，攻守之间做出选择':'敌人正在准备，抓住时机'}</span></div>
 <div class="battlefield"><div class="combatant hero" data-entity="hero"><img class="figure" src="${imgHero(s.hero)}" alt="${h.name}"><div class="name">${h.name}</div>${hpbar(s.hp,s.maxHp)}${c.block?`<span class="blockbadge" title="${KEYWORDS.block}">${c.block}</span>`:''}<div class="statusbar">${statuses(c.status)}</div></div><div class="enemy-group">${c.enemies.map(e=>`<button class="combatant enemy ${e.hp<=0?'dead':''} ${selectedCard&&e.hp>0?'targeted':''}" data-action="target" data-id="${e.uid}" data-entity="${e.uid}" aria-label="${e.name}，生命 ${e.hp}，${intentDescription(e)}" ${e.hp<=0?'disabled':''}><span class="intent-tip">${e.hp>0?'下一步意图':'已击败'}</span><span class="intent ${e.intent.damage?'':'support'}" title="${intentDescription(e)}">${icon(e.intent.damage?'sword':e.intent.block?'shield':'star')}${e.hp<=0?'—':e.intent.damage?`${Math.floor((e.intent.damage+e.status.strength)*(e.status.weak>0?.75:1))}${e.intent.hits>1?' × '+e.intent.hits:''}`:e.intent.block?'+'+e.intent.block:'强化'}${e.intent.poison?'<small>☠</small>':''}${e.intent.weak?'<small>↓</small>':''}</span><img class="figure" src="${imgEnemy(e.art)}" alt="${e.name}"><div class="name">${e.name}</div>${hpbar(e.hp,e.maxHp)}${e.block?`<span class="blockbadge" title="格挡">${e.block}</span>`:''}<div class="statusbar">${statuses(e.status)}</div></button>`).join('')}</div></div>
 <div class="turn-area"><div style="display:flex;align-items:center;gap:22px"><div><div class="energy-orb">${c.energy}<small>/${3+(s.relics.includes('crown')?1:0)}</small></div><div class="energy-label">能量</div></div><div class="combo-meter">${combo!==null?`<span>${s.hero==='mage'?'法术连携':'影刃连击'}</span>${[1,2,3].map(i=>`<i class="combo-dot ${combo>=i?'on':''}"></i>`).join('')}`:`<span title="${h.mechanic}">${icon('shield')} 誓约护盾 · ${c.knightShield?'已触发':'首次格挡 +2'}</span>`}</div></div><div class="combat-controls"><button class="pile-btn" data-action="pile" data-id="draw">${icon('deck')}抽牌 ${c.draw.length}</button><button class="pile-btn" data-action="pile" data-id="discard">${icon('deck')}弃牌 ${c.discard.length}</button>${button('结束回合 <small>[空格]</small>','endTurn','primary',busy)}</div></div>
 <div class="hand ${c.hand.length>7?'large':''}">${c.hand.map((card,i)=>cardMarkup(card,{action:'play',attrs:`data-id="${card.uid}" style="--rotation:${(i-(c.hand.length-1)/2)*1.3}deg" aria-label="手牌 ${i+1} ${CARDS[card.id].name}"`,disabled:busy||!E.canPlay(s,card),selected:selectedCard===card.uid})).join('')}${!c.hand.length?'<p class="muted small">手牌已用完。结束回合，抽取新的牌。</p>':''}</div><div class="hand-hint ${selectedCard?'targeting':''}">${selectedCard?'点击要攻击的敌人 · Esc 取消':`数字键 1–9 选牌 · 空格结束回合 · 药水点击使用 · D 查看卡组`}</div>`;
}
function reward(){const r=s.reward;return `<section class="reward-layout"><div class="reward-header"><div class="label">VICTORY / A NEW POSSIBILITY</div><h2>${r.type==='boss'?'首领已败':'余火未熄'}</h2><p class="subtitle">${r.type==='boss'?'你走过了最深的长夜。下一段旅途，等着你。':'胜利不只意味着活下来，也意味着更多选择。'}</p><span class="reward-line">${icon('coin')} 已获得 ${r.gold} 金币</span></div><div class="divider"></div><div class="label">${r.cardTaken?'已加入卡组':'选择一张卡牌 · 也可以不拿，保持卡组精简'}</div><div class="reward-cards">${r.cards.map(id=>cardMarkup({id,up:false},{action:'rewardCard',attrs:`data-id="${id}"`,disabled:r.cardTaken})).join('')}</div>${r.relics.length?`<div class="label">${r.relicTaken?'遗物已获得':'选择一件遗物'}</div><div class="reward-relics">${r.relics.map(id=>`<button class="relic-choice" data-action="rewardRelic" data-id="${id}" ${r.relicTaken?'disabled':''}>${icon(RELICS[id].icon)}<h3>${RELICS[id].name}</h3><p>${RELICS[id].text}</p></button>`).join('')}</div>`:''}<div class="reward-actions">${r.potion&&!r.potionTaken?button(icon('potion')+' 拿取'+POTIONS[r.potion].name,'rewardPotion','',s.potions.length>=3,`data-id="${r.potion}"`):''}${button(r.type==='boss'?(s.act===2?'带回黎明':'进入下一章'):'继续前进 '+icon('arrow'),'leaveReward','primary')}</div>${r.potion&&!r.potionTaken&&s.potions.length>=3?'<p class="small muted">药水栏已满；点击顶部药水，可选择丢弃。</p>':''}</section>`;}
function restScene(){return `<section class="scene-layout"><div class="scene-illustration">${icon('rest','big-symbol')}</div><div class="scene-content panel"><div class="label">A MOMENT OF PEACE</div><h2>尚有温度的篝火</h2><p>火星慢慢升起。远处的怪物声，终于安静了片刻。<br>你可以歇息，也可以在火光中磨亮兵刃。</p><button class="choice" data-action="rest" data-id="heal"><strong>休息 ${icon('heart')}</strong><span>恢复 ${Math.ceil(s.maxHp*.3)+(s.relics.includes('fern')?10:0)} 生命（当前 ${s.hp}/${s.maxHp}）</span></button><button class="choice" data-action="rest" data-id="upgrade" ${s.deck.some(c=>!c.up&&CARDS[c.id].type!=='curse')?'':'disabled'}><strong>淬炼 ${icon('sword')}</strong><span>永久升级一张卡牌，让它更强</span></button></div></section>`;}
function eventScene(){const event=E.eventDefinition(s);return `<section class="scene-layout"><div class="scene-illustration">${icon(event.id==='smith'?'sword':event.id==='traveler'?'lantern':event.id==='archive'?'deck':event.id==='altar'?'star':'orb','big-symbol')}</div><div class="scene-content panel"><div class="label">AN UNWRITTEN STORY</div><h2>${event.name}</h2><p>${event.story}</p>${s.event.resolved?`<div class="divider"></div><p class="gold">${esc(s.event.result)}</p><div style="margin-top:20px">${button('继续前进 '+icon('arrow'),'leaveEvent','primary')}</div>`:event.choices.map((c,i)=>`<button class="choice" data-action="eventChoice" data-index="${i}" ${E.eventAvailable(s,i)?'':'disabled'}><strong>${c.label}</strong><span>${c.detail}</span></button>`).join('')}</div></section>`;}
function shop(){return `<section class="shop-layout"><div class="screen-caption"><div><div class="label">THE WANDERING MERCHANT</div><h2>余烬行商</h2></div><p>「路很长，带点能让你活下去的东西吧。」</p></div><div class="shop-cards">${s.shop.cards.map((item,i)=>`<div class="shop-item">${cardMarkup({id:item.id,up:false})}${button(item.sold?'已售出':icon('coin')+' '+item.price,'buy','pricebtn',item.sold||s.gold<item.price,`data-kind="cards" data-index="${i}"`)}</div>`).join('')}</div><div class="shop-lower"><div class="shop-section panel"><h3>旅途遗物</h3>${s.shop.relics.map((item,i)=>`<div class="shop-relic">${icon(RELICS[item.id].icon)}<div><span class="small gold">${RELICS[item.id].name}</span><p>${RELICS[item.id].text}</p></div>${button(item.sold?'售出':item.price+' 金','buy','',item.sold||s.gold<item.price,`data-kind="relics" data-index="${i}"`)}</div>`).join('')}</div><div class="shop-section panel"><h3>应急补给</h3>${s.shop.potions.map((item,i)=>`<div class="shop-relic">${icon('potion')}<div><span class="small gold">${POTIONS[item.id].name}</span><p>${POTIONS[item.id].text}</p></div>${button(item.sold?'售出':item.price+' 金','buy','',item.sold||s.gold<item.price||s.potions.length>=3,`data-kind="potions" data-index="${i}"`)}</div>`).join('')}</div><div class="shop-section panel"><h3>忘却一张牌</h3><p class="small muted">精简卡组，更容易抽到关键牌。也可以移除诅咒。</p>${button(s.shop.removed?'本店已使用':`移除卡牌 · ${s.shop.removePrice} 金`,'remove','pricebtn',s.shop.removed||s.gold<s.shop.removePrice||s.deck.length<=1)}</div></div><div class="shop-end">${button('离开商店 '+icon('arrow'),'leaveShop','primary')}</div></section>`;}
function picker(){const upgrade=s.picker.mode==='upgrade';return `<section class="picker-screen"><div class="label">REFINE YOUR DECK</div><h2>${upgrade?'淬炼一张牌':'遗忘一张牌'}</h2><p>${upgrade?'点击卡牌，先比较升级前后效果；确认后才会消耗本次淬炼。':'点击要永久移除的卡牌。此操作不能撤销。'}</p><div class="picker-grid">${s.deck.map(c=>cardMarkup(c,{action:'chooseCard',attrs:`data-id="${c.uid}"`,disabled:upgrade&&(c.up||CARDS[c.id].type==='curse')})).join('')}</div><div style="margin:20px">${button('返回','cancelPicker','ghost')}</div></section>`;}
function ending(){const won=s.phase==='victory';return `<section class="ending panel"><div>${icon(won?'star':'flame','big-symbol')}</div><div class="label">${won?'THE DAWN RETURNS':'EVERY EMBER LEAVES A TRACE'}</div><h2>${won?'你带回了黎明':'余火熄灭'}</h2><p>${won?'当无光之主倒下，天空第一次露出了颜色。<br>你手里的牌不再是武器，而是一段有人记得的故事。':'旅途在这里停下，但选择留下了痕迹。<br>换一条道路，精简牌组，下一次或许能走得更远。'}</p><div class="ending-stats">${[['章节',s.act+1],['战斗',s.stats.battles],['出牌',s.stats.cardsPlayed],['遗物',s.relics.length]].map(([label,n])=>`<div class="ending-stat"><strong>${n}</strong><small>${label}</small></div>`).join('')}</div><p class="small muted">${HEROES[s.hero].name} · 种子 ${esc(s.seed)} · ${s.difficulty==='story'?'旅人':s.difficulty==='hard'?'绝境':'冒险'}模式</p><div class="divider"></div>${button('再启远征','select','primary')}${button('查看本局卡组','deck')}${button('回到主菜单','menu','ghost')}</section>`;}
function render(){
 const handScroll=app.querySelector('.hand')?.scrollLeft||0;
 if(page==='title')app.innerHTML=title();else if(page==='select')app.innerHTML=selection();else{backdrop(s.act);const body=({map,combat,reward,rest:restScene,event:eventScene,shop,chooseCard:picker,victory:ending,defeat:ending})[s.phase]();app.innerHTML=shell(body);if(s.phase==='map'){const frame=app.querySelector('.map-frame');const currentY=640-(s.floor+1)*77;requestAnimationFrame(()=>{frame.scrollTop=Math.max(0,currentY*frame.clientWidth/640-frame.clientHeight*.62);});}}
 window.scrollTo(0,0);const hand=app.querySelector('.hand');if(hand)hand.scrollLeft=handScroll;
 app.querySelector('[data-action="deck"]')?.setAttribute('aria-label',s?`查看卡组 ${s.deck.length} 张`:'查看卡组');app.querySelector('[data-action="help"]')?.setAttribute('aria-label','玩法说明');app.querySelector('[data-action="settings"]')?.setAttribute('aria-label','设置');app.querySelector('[data-action="pause"]')?.setAttribute('aria-label','保存退出');
 if(page==='game')app.querySelector('.top-buttons')?.insertAdjacentHTML('afterbegin',button('图鉴','catalog','ghost'));
 if(s?.phase==='combat'&&page==='game')app.querySelector('[data-action="endTurn"]')?.insertAdjacentHTML('beforebegin',`<button class="pile-btn" data-action="pile" data-id="exhaust">${icon('flame')}消耗 ${s.combat.exhaust.length}</button>`);
 renderOverlay();
}
function dialog(title,body){return `<div class="overlay" role="dialog" aria-modal="true" aria-label="${title}"><div class="dialog"><div class="sectionhead"><h2>${title}</h2><button class="close" data-action="close" aria-label="关闭">${icon('close')}</button></div>${body}</div></div>`;}
function renderOverlay(){
 if(!overlay){overlays.innerHTML='';return;}
 let content='';
 if(overlay.type==='catalog'){
  const f=overlay.filters||{},list=catalogCards(f),select=(id,label,options)=>`<label>${label}<select data-catalog="${id}">${options.map(([v,n])=>`<option value="${v}" ${(f[id]||'all')===v?'selected':''}>${n}</option>`).join('')}</select></label>`;
  content=dialog('卡牌图鉴 · 全部 56 张',`<p>所有职业与中立牌，无需获得即可查看。点击卡面放大，对比升级效果。</p><div class="catalog-filters"><label class="catalog-search">搜索牌名 / 效果<input data-catalog="query" aria-label="搜索图鉴" placeholder="例如：中毒、格挡、星火" value="${esc(f.query||'')}"></label>${select('hero','职业',[['all','全部'],...Object.entries(HEROES).map(([id,h])=>[id,h.name]),['neutral','旅途 · 中立']])}${select('type','类型',[['all','全部'],...Object.entries(TYPES)])}${select('rarity','稀有度',[['all','全部'],['basic','基础'],['common','普通'],['rare','稀有'],['curse','诅咒']])}<label class="catalog-up"><input type="checkbox" data-catalog="up" ${f.up?'checked':''}>显示升级版</label>${button('清空筛选','resetCatalog','ghost')}</div><div class="catalog-count">显示 ${list.length} / 56 张</div><div class="deck-grid catalog-grid">${list.map(c=>cardMarkup(c,{action:'inspect',attrs:`data-id="${c.id}" data-up="${c.up?'yes':'no'}"`})).join('')||'<p>没有匹配的卡牌，试试其他关键词。</p>'}</div>`);
 }
 if(overlay.type==='help')content=dialog('如何带回黎明',`<div class="help-grid">${[['01','构筑','从 10 张牌开始。战后可以选一张新牌，也可以跳过。卡组越大，越难抽到关键牌。'],['02','战斗','每回合通常有 3 能量。先看敌人头顶意图，再选择进攻或格挡。点选卡牌后，点击怪物指定目标。'],['03','道路','每章 8 层，共 3 章。精英提供遗物但更危险；篝火能回血或升级；商店能购买或删牌。'],['04','职业','骑士首次格挡 +2；法师第三张职业法术返还能量并抽牌；夜行客第三张攻击让全体敌人中毒。']].map(([n,title,text])=>`<div class="help-item"><h3><span class="help-step">${n}</span>${title}</h3><p>${text}</p></div>`).join('')}</div><div class="divider"></div><div class="label">关键词速查</div><div class="keyword-grid">${Object.entries(KEYWORDS).map(([id,text])=>`<p><span class="gold">${statusNames[id]||({block:'格挡',exhaust:'消耗',upgrade:'升级',spell:'法术'})[id]||id}</span> · ${text}</p>`).join('')}</div><div class="divider"></div><p>快捷键：数字 1–9 选牌 · 空格结束回合 · D 卡组 · Esc 取消/关闭。<br>进度自动保存到此浏览器。没有 AI 调用或网络依赖。</p>`);
 if(overlay.type==='deck'||overlay.type==='pile'){
  const list=overlay.type==='deck'?s.deck:s.combat[overlay.pile];const sorted=[...list].sort((a,b)=>a.id.localeCompare(b.id)||Number(b.up)-Number(a.up));
  content=dialog(overlay.type==='deck'?`远征卡组 · ${list.length} 张`:`${{draw:'抽牌堆（顺序隐藏）',discard:'弃牌堆',exhaust:'消耗牌堆'}[overlay.pile]} · ${list.length} 张`,`<p class="small muted" style="margin-bottom:17px">点击任意卡牌放大，并查看升级效果。绿色牌名代表已升级。其他界面可右键卡牌查看。</p><div class="deck-grid">${sorted.map(c=>cardMarkup(c,{action:'inspect',attrs:`data-id="${c.id}" data-up="${c.up?'yes':'no'}"`})).join('')||'<p>这里暂时没有卡牌。</p>'}</div>`);
 }
 if(overlay.type==='settings')content=dialog('旅途设置',`<div class="setting-row"><span>效果音 · 兵刃 / 护盾 / 法术</span>${button(preferences.sound?'已开启':'已关闭','toggleSound')}</div><div class="setting-row"><span>主音量</span><input aria-label="音量" data-setting="volume" type="range" min="0" max="0.8" step="0.05" value="${preferences.volume}"></div><div class="setting-row"><span>原创配乐 · 余火之歌 <small class="muted">（旋律 / 和声 / 低音）</small></span>${button(preferences.music?'已开启':'已关闭','toggleMusic')}</div><div class="setting-row"><span>声音状态：${audioState().state==='running'?'已运行':audioState().state} · ${Math.round(preferences.volume*100)}%<br><small class="muted">测试按钮会开启效果音；如果静音会恢复到 55%。</small></span>${button('测试音效','testAudio')}</div><div class="setting-row"><span>减少动态效果</span>${button(preferences.reducedMotion?'已开启':'已关闭','toggleMotion')}</div><div class="setting-row"><span>新手提示</span>${button(tutorial?'已开启':'已关闭','toggleTutorial')}</div><div class="setting-row"><span>存档备份 <small class="muted">（仅在本机处理）</small></span><div>${button('导出存档','exportSave','',!s&&!saved)} ${button('导入存档','importSave')}</div><input id="import-save" type="file" accept=".json,application/json" hidden></div><div class="divider"></div><p>声音在首次点击后启动。旧版关闭的音乐设置会保留，可在这里重新开启。<br>网页与桌面版存档分开保存；用导出 / 导入 JSON 迁移旅途，无需重新开始。系统音量仍由你控制。</p>`);
 if(overlay.type==='upgrade'||overlay.type==='inspect'){
  const upgrading=overlay.type==='upgrade',before=upgrading?overlay.before:{...overlay.card,up:false},after=upgrading?overlay.after:{...overlay.card,up:true},curse=CARDS[before.id].type==='curse';
  const oldLines=cardText(before).split('。').filter(Boolean),newLines=cardText(after).split('。').filter(Boolean);
  content=dialog(upgrading?'淬炼预览 · 确认前不会升级':'卡牌图鉴 · 升级对比',`<div class="upgrade-comparison"><section><div class="label">${overlay.card?.up?'原始效果':'升级前'}</div>${cardMarkup(before)}</section>${curse?'':`<div class="upgrade-arrow">→</div><section><div class="label">升级后</div>${cardMarkup(after)}</section>`}</div><div class="upgrade-diff">${curse?'<p>诅咒不能升级。</p>':newLines.map((line,i)=>line===oldLines[i]?'':`<p><span>${esc(oldLines[i]||'')}</span> <b>→ ${esc(line)}</b></p>`).join('')}</div><p class="small muted">${upgrading?'这里只展示卡牌基础数值，实战还会受到力量、敏捷和敌人状态影响。取消不消耗淬炼机会。':overlay.card.up?'这张牌已升级。':'卡组、奖励和手牌中都可右键查看此对比。'}</p><div class="preview-actions">${button(upgrading?'取消，重新选牌':'返回',upgrading?'close':'inspectBack')} ${upgrading?button('确认升级 '+CARDS[before.id].name,'confirmUpgrade','primary'):''}</div>`);
 }
 if(overlay.type==='pause')content=dialog('旅途已暂歇',`<p>当前远征已自动保存。你可以回到菜单，稍后继续。</p><div class="divider"></div>${button('继续游戏','close','primary')} ${button('保存并回到菜单','menu')} ${button('开始新的远征','select','danger')}`);
 if(overlay.type==='newConfirm')content=dialog('点燃新的余火？',`<p>开始新的远征将覆盖当前进行中的存档。旧旅途无法恢复。</p><div class="divider"></div>${button('取消','close')} ${button('确认开始','confirmedStart','primary')}`);
 if(overlay.type==='importConfirm')content=dialog('替换当前存档？',`<p>即将导入 ${HEROES[overlay.candidate.hero].name} 的第 ${overlay.candidate.act+1} 章进度。此操作覆盖当前本地存档，建议先导出备份。</p><div class="divider"></div>${button('取消','close')} ${button('确认导入','confirmImport','primary')}`);
 if(overlay.type==='export')content=dialog('备份你的旅途',`<p>下面是完整 JSON 存档。可以下载文件，或复制内容自行保存。导入时也支持粘贴，不依赖浏览器的下载功能。</p><textarea class="save-textarea" aria-label="备份 JSON" id="export-json" readonly>${esc(E.serialize(s||saved))}</textarea><div class="divider"></div>${button('下载 JSON 文件','downloadSave','primary')} ${button('复制内容','copySave')} ${button('返回','close')}`);
 if(overlay.type==='import')content=dialog('导入旅途备份',`<p>粘贴之前保存的 JSON，或选择本机文件。数据只在本机验证，不会上传到服务器。</p><textarea class="save-textarea" aria-label="待导入的 JSON" id="paste-json" placeholder="在这里粘贴 JSON 存档"></textarea><div class="divider"></div>${button('验证并导入','parsePastedSave','primary')} ${button('选择 JSON 文件','selectSaveFile')} ${button('取消','close')}<input id="import-save" type="file" accept=".json,application/json" hidden>`);
 if(overlay.type==='potion'){const id=s.potions[overlay.index];if(!id){overlay=null;overlays.innerHTML='';return;}content=dialog(POTIONS[id].name,`<p>${POTIONS[id].text}</p><p class="small muted">${s.phase==='combat'?'使用药水不消耗能量。':'仅可在战斗中使用。'}</p><div class="divider"></div>${s.phase==='combat'?button('使用','usePotion','primary',false,`data-index="${overlay.index}"`):''} ${button('丢弃这瓶药水','discardPotion','danger',false,`data-index="${overlay.index}"`)} ${button('返回','close')}`);}
 if(overlay.type==='history'){
  let list=[];try{const raw=JSON.parse(localStorage.getItem(HISTORY)||'[]');if(Array.isArray(raw))list=raw.filter(x=>x&&Object.hasOwn(HEROES,x.hero)&&['victory','defeat'].includes(x.outcome)&&Number.isInteger(x.act)&&x.act>=0&&x.act<3&&Number.isInteger(x.battles)&&typeof x.seed==='string').slice(0,20);}catch{}
  content=dialog('旅途记录',list.length?list.map(x=>`<div class="setting-row"><span>${HEROES[x.hero].name} · <span class="gold">${x.outcome==='victory'?'带回黎明':'第'+(x.act+1)+'章止步'}</span><br><small class="muted">种子 ${esc(x.seed)} · ${x.battles} 场胜利</small></span><small class="muted">${esc(String(x.date).slice(0,10))}</small></div>`).join(''):'<p>还没有结束的远征。你的第一段故事，等着被写下。</p>');
 }
 overlays.innerHTML=content;requestAnimationFrame(()=>{if(document.activeElement?.dataset.catalog!=='query')overlays.querySelector('.close')?.focus({preventScroll:true});});
}
function animate(effects,locations){
 for(const e of effects){const figure=app.querySelector(`[data-entity="${e.target}"]`);if(e.type==='enemyAttack'){figure?.classList.add('attack');continue;}if(e.type==='damage')figure?.classList.add('hitflash');const rect=figure?.getBoundingClientRect()||locations[e.target];if(!rect)continue;if(e.amount===0)continue;const el=document.createElement('span');el.className=`float-number ${e.type}`;el.textContent=e.type==='combo'?'连携！':e.type==='damage'?'-'+e.amount:'+'+e.amount;el.style.left=rect.left+rect.width/2-15+'px';el.style.top=rect.top+rect.height/2+'px';document.body.appendChild(el);setTimeout(()=>el.remove(),900);}
}
async function transaction(fn,sound='click'){
 if(busy)return;const previous=structuredClone(s);const oldPhase=s.phase;
 try{if(s.combat)s.combat.effects=[];const result=fn();E.validate(s);save();archive();selectedCard=null;tone(sound);
  const effects=s.combat?.effects||[],motion=cardMotionPlan(previous,s,result?.uid);
  if((oldPhase==='combat'&&sound!=='click')||s.phase==='combat'&&oldPhase!=='combat'){
   busy=true;app.classList.add('resolving');app.setAttribute('aria-busy','true');
   if(oldPhase==='combat'){
    await discardFeedback(app,motion.discard,tone,preferences.reducedMotion);
    await battleFeedback(app,previous,s,motion.played,effects,tone,preferences.reducedMotion);
    await playedToPile(app,motion.played,motion.destination,tone,preferences.reducedMotion);
   }
   render();await drawFeedback(app,motion.draw,motion.reshuffle,tone,preferences.reducedMotion);
   busy=false;app.classList.remove('resolving');app.setAttribute('aria-busy','false');render();
   if(s.phase==='reward')tone('win');if(s.phase==='defeat')tone('lose');
  }else render();
 }catch(error){busy=false;app.classList.remove('resolving');app.setAttribute('aria-busy','false');s=previous;save();toast(error.message);render();}
}
function begin(){const seed=document.querySelector('#seed')?.value.trim()||`ASH-${Date.now().toString(36).toUpperCase()}`;s=E.newRun(selectedHero,seed,difficulty);page='game';overlay=null;selectedCard=null;save();render();tone('heal');}
function act(action,el){
 unlock();const id=el?.dataset.id,index=Number(el?.dataset.index);
 if(busy)return;
 switch(action){
  case 'select':overlay=null;page='select';render();break;
  case 'menu':if(s&&page==='game')save();overlay=null;page='title';saved=getSaved();render();break;
  case 'hero':selectedHero=id;{const seed=document.querySelector('#seed')?.value||'';render();document.querySelector('#seed').value=seed;}tone();break;
  case 'difficulty':difficulty=id;{const seed=document.querySelector('#seed')?.value||'';render();document.querySelector('#seed').value=seed;}tone();break;
  case 'start':if(saved&&!['victory','defeat'].includes(saved.phase)){overlay={type:'newConfirm'};renderOverlay();}else begin();break;
  case 'confirmedStart':begin();break;
  case 'continue':s=getSaved();if(!s){toast(saveWarning||'没有可继续的存档');return;}page='game';overlay=null;render();break;
  case 'help':case 'settings':case 'history':overlay={type:action};renderOverlay();break;
  case 'catalog':overlay={type:'catalog',filters:{hero:'all',type:'all',rarity:'all',query:'',up:false}};renderOverlay();break;
  case 'resetCatalog':overlay.filters={hero:'all',type:'all',rarity:'all',query:'',up:false};renderOverlay();break;
  case 'deck':if(!s)return;overlay={type:'deck'};renderOverlay();break;
  case 'pile':overlay={type:'pile',pile:id};renderOverlay();break;
  case 'pause':save();overlay={type:'pause'};renderOverlay();break;
  case 'close':overlay=null;renderOverlay();break;
  case 'node':transaction(()=>E.selectNode(s,id));break;
  case 'play':{
   const card=s.combat.hand.find(c=>c.uid===id);if(!card||!E.canPlay(s,card))return;
   if(E.needsTarget(card)&&s.combat.enemies.filter(e=>e.hp>0).length>1){selectedCard=selectedCard===id?null:id;render();tone();}
   else transaction(()=>E.playCard(s,id),CARDS[card.id].type==='attack'?'hit':'block');
   break;
  }
  case 'target':if(selectedCard)transaction(()=>E.playCard(s,selectedCard,id),'hit');else toast('先点选一张卡牌，再选择目标。');break;
  case 'endTurn':transaction(()=>E.endTurn(s),'hit');break;
  case 'rewardCard':transaction(()=>E.takeReward(s,'card',id),'card');break;
  case 'rewardRelic':transaction(()=>E.takeReward(s,'relic',id),'heal');break;
  case 'rewardPotion':transaction(()=>E.takeReward(s,'potion',id),'card');break;
  case 'leaveReward':transaction(()=>E.leaveReward(s),'heal');break;
  case 'rest':transaction(()=>E.rest(s,id),id==='heal'?'heal':'click');break;
  case 'eventChoice':transaction(()=>E.chooseEvent(s,index),'card');break;
  case 'leaveEvent':transaction(()=>E.leaveEvent(s));break;
  case 'buy':transaction(()=>E.buy(s,el.dataset.kind,index),'card');break;
  case 'remove':transaction(()=>E.openRemove(s));break;
  case 'leaveShop':transaction(()=>E.leaveShop(s));break;
  case 'chooseCard':if(s.picker.mode==='upgrade'){try{const preview=E.previewUpgrade(s,id);overlay={type:'upgrade',uid:id,...preview};renderOverlay();tone('card');}catch(error){toast(error.message);}}else transaction(()=>E.chooseCard(s,id),'card');break;
  case 'confirmUpgrade':{const uid=overlay?.uid;if(!uid)return;overlay=null;transaction(()=>E.chooseCard(s,uid),'heal');break;}
  case 'inspect':overlay={type:'inspect',card:{id,up:el.dataset.up==='yes'},back:overlay};renderOverlay();break;
  case 'inspectBack':overlay=overlay.back||null;renderOverlay();break;
  case 'testAudio':preferences.sound=true;if(preferences.volume===0)preferences.volume=.55;persistSettings();updateAudio();tone('win');setTimeout(()=>{if(overlay?.type==='settings')renderOverlay();},150);break;
  case 'cancelPicker':transaction(()=>E.cancelPicker(s));break;
  case 'potion':if(s.phase==='combat')transaction(()=>E.usePotion(s,index),'heal');else{overlay={type:'potion',index};renderOverlay();}break;
  case 'usePotion':overlay=null;transaction(()=>E.usePotion(s,index),'heal');break;
  case 'discardPotion':overlay=null;transaction(()=>E.discardPotion(s,index));break;
  case 'dismissTutorial':tutorial=false;persistSettings();render();break;
  case 'toggleSound':preferences.sound=!preferences.sound;persistSettings();renderOverlay();tone();break;
  case 'toggleMusic':preferences.music=!preferences.music;persistSettings();updateAudio();renderOverlay();break;
  case 'toggleMotion':preferences.reducedMotion=!preferences.reducedMotion;document.body.classList.toggle('reduced-motion',preferences.reducedMotion);persistSettings();renderOverlay();break;
  case 'toggleTutorial':tutorial=!tutorial;persistSettings();renderOverlay();break;
  case 'exportSave':{
   try{if(!s&&!saved)throw new Error('没有存档');E.validate(s||saved);overlay={type:'export'};renderOverlay();}catch(error){toast(error.message);}break;
  }
  case 'downloadSave':{try{const blob=new Blob([E.serialize(s||saved)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Emberbound-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);toast('已请求下载。若浏览器未下载，请复制 JSON 内容。');}catch(error){toast(error.message);}break;}
  case 'copySave':{const box=document.querySelector('#export-json');box.select();const copied=document.execCommand('copy');toast(copied?'已复制备份 JSON。':'请按 Ctrl+C 手动复制选中的 JSON。');break;}
  case 'importSave':overlay={type:'import'};renderOverlay();break;
  case 'selectSaveFile':document.querySelector('#import-save')?.click();break;
  case 'parsePastedSave':try{const candidate=E.deserialize(document.querySelector('#paste-json').value);overlay={type:'importConfirm',candidate};renderOverlay();}catch(error){toast('无法导入：'+error.message);}break;
  case 'confirmImport':s=overlay.candidate;page='game';overlay=null;selectedCard=null;save();render();toast('已导入并验证存档。');break;
 }
}
document.addEventListener('click',event=>{const el=event.target.closest('[data-action]');if(!el||el.disabled)return;act(el.dataset.action,el);});
document.addEventListener('contextmenu',event=>{const el=event.target.closest('[data-card-id]');if(!el||busy)return;event.preventDefault();act('inspect',{dataset:{id:el.dataset.cardId,up:el.dataset.cardUp}});});
document.addEventListener('input',event=>{if(event.target.dataset.setting==='volume'){preferences.volume=Number(event.target.value);persistSettings();updateAudio();}if(event.target.dataset.catalog==='query'){const cursor=event.target.selectionStart;overlay.filters.query=event.target.value;renderOverlay();const input=document.querySelector('[data-catalog="query"]');input.focus();input.setSelectionRange(cursor,cursor);}});
document.addEventListener('change',event=>{const key=event.target.dataset.catalog;if(!key||key==='query'||overlay?.type!=='catalog')return;overlay.filters[key]=key==='up'?event.target.checked:event.target.value;renderOverlay();});
document.addEventListener('change',async event=>{if(event.target.id!=='import-save')return;const file=event.target.files?.[0];if(!file)return;try{if(file.size>300000)throw new Error('存档文件过大');const candidate=E.deserialize(await file.text());overlay={type:'importConfirm',candidate};renderOverlay();}catch(error){toast('无法导入：'+error.message);event.target.value='';}});
document.addEventListener('keydown',event=>{
 if(busy){if(event.code==='Space')event.preventDefault();return;}
 if(event.key==='Escape'){if(overlay){overlay=null;renderOverlay();}else if(selectedCard){selectedCard=null;render();}else if(page==='game'){overlay={type:'pause'};renderOverlay();}return;}
 if(overlay){if(event.key==='Tab'){const list=[...overlays.querySelectorAll('button:not(:disabled),input:not([hidden]),textarea,[tabindex="0"]')];if(list.length){const i=list.indexOf(document.activeElement);if(event.shiftKey&&(i<=0)){event.preventDefault();list.at(-1).focus();}else if(!event.shiftKey&&i===list.length-1){event.preventDefault();list[0].focus();}}}return;}
 if(event.target.matches('input,textarea,select'))return;
 if((event.key==='Enter'||event.key===' ')&&event.target.matches('.node.available')){event.preventDefault();act('node',event.target);return;}
 if(page!=='game'||busy)return;
 if(event.key.toLowerCase()==='d'){event.preventDefault();act('deck');return;}
 if(s.phase==='combat'){
  if(event.code==='Space'&&!event.repeat){event.preventDefault();act('endTurn');}
  else if(/^[1-9]$/.test(event.key)&&!event.repeat){event.preventDefault();const card=s.combat.hand[Number(event.key)-1];const el=card&&app.querySelector(`[data-action="play"][data-id="${card.uid}"]`);if(el&&!el.disabled)act('play',el);}
 }
});
window.addEventListener('beforeunload',()=>{if(s&&page==='game')save();});
render();
