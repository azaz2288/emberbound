export const HEROES = {
  knight: { name:'余烬骑士', title:'以铁为誓，以灰为盾', color:'#efaa62', hp:82, relic:'coal', mechanic:'每回合第一次获得格挡时，额外获得 2 点。适合格挡、反击与力量构筑。', deck:['cut','cut','cut','cut','guard','guard','guard','guard','bash','riposte'] },
  mage: { name:'焰语师', title:'让最后的星火，烧穿长夜', color:'#9dabf7', hp:68, relic:'lens', mechanic:'每回合打出第三张法术时，获得 1 能量并抽 1 张牌。适合灼烧、抽牌与法术连携。', deck:['spark','spark','spark','spark','ward','ward','ward','ward','ignite','focus'] },
  rogue: { name:'夜行客', title:'你听见的风，是最后的告别', color:'#76d9be', hp:72, relic:'fang', mechanic:'每回合打出第三张攻击时，对所有敌人施加 2 中毒。适合零费连击、中毒与虚弱。', deck:['stab','stab','stab','stab','dodge','dodge','dodge','dodge','venom','flurry'] }
};
// Effects: [kind, base, upgrade]. These are original card definitions.
const entries = [
 ['cut','断刃',1,'attack','knight','basic',[['hit',6,3]]],
 ['guard','铁壁',1,'skill','knight','basic',[['block',5,3]]],
 ['bash','破阵',2,'attack','knight','common',[['hit',9,3],['vulnerable',2,1]]],
 ['riposte','盾锋',1,'attack','knight','common',[['shieldHit',5,3]]],
 ['cleave','横扫',1,'attack','knight','common',[['allHit',7,3]]],
 ['fortify','堡垒',2,'skill','knight','common',[['block',15,5]]],
 ['rage','战意',1,'power','knight','rare',[['strength',2,1]]],
 ['charge','冲锋',1,'attack','knight','common',[['hit',8,3],['block',4,2]]],
 ['thorn','荆棘铠',1,'power','knight','rare',[['thorns',3,2]]],
 ['crush','碎甲',2,'attack','knight','rare',[['hit',19,6],['weak',1,1]]],
 ['rally','重整',0,'skill','knight','common',[['block',3,2],['draw',1,1]],true],
 ['bastion','坚守',1,'power','knight','rare',[['plating',3,2]]],
 ['blood','血誓',0,'skill','knight','common',[['loseHp',3,0],['energy',2,1]],true],
 ['double','双刃',1,'attack','knight','common',[['hit',4,2],['hit',4,2]]],
 ['execute','处决',2,'attack','knight','rare',[['execute',14,5]]],
 ['defiance','不屈',1,'skill','knight','common',[['block',7,3],['strength',1,0]],true],
 ['spark','星火',1,'attack','mage','basic',[['hit',6,3]]],
 ['ward','星幕',1,'skill','mage','basic',[['block',5,3]]],
 ['ignite','引燃',1,'attack','mage','common',[['hit',3,2],['burn',4,2]]],
 ['focus','凝神',0,'skill','mage','common',[['draw',2,1]],true],
 ['firestorm','火雨',2,'attack','mage','common',[['allHit',8,3],['allBurn',3,2]]],
 ['frost','寒潮',1,'attack','mage','common',[['hit',7,3],['weak',2,1]]],
 ['mana','虹吸',0,'skill','mage','common',[['energy',1,1]],true],
 ['nova','超新星',2,'attack','mage','rare',[['allHit',17,6]],true],
 ['inferno','焚城',2,'skill','mage','rare',[['allBurn',8,4]]],
 ['barrier','镜界',1,'skill','mage','common',[['block',9,3],['draw',1,0]]],
 ['catalyst','余火',1,'skill','mage','rare',[['doubleBurn',1,1]]],
 ['astral','星轨',1,'power','mage','rare',[['spellPower',2,1]]],
 ['echo','回响',1,'skill','mage','common',[['draw',3,1]]],
 ['pulse','脉冲',0,'attack','mage','common',[['hit',4,2]],true],
 ['comet','彗星',2,'attack','mage','rare',[['hit',22,7]]],
 ['weave','织焰',1,'skill','mage','common',[['block',7,3],['allBurn',2,1]]],
 ['stab','影刃',1,'attack','rogue','basic',[['hit',6,3]]],
 ['dodge','隐步',1,'skill','rogue','basic',[['block',5,3]]],
 ['venom','淬毒',1,'skill','rogue','common',[['poison',5,3]]],
 ['flurry','疾刃',0,'attack','rogue','common',[['hit',3,2]]],
 ['toxic','瘴雾',1,'skill','rogue','common',[['allPoison',3,2]]],
 ['backstab','背袭',1,'attack','rogue','common',[['hit',8,3],['vulnerable',1,1]]],
 ['dash','掠影',0,'skill','rogue','common',[['block',4,2]],true],
 ['ambush','伏击',2,'attack','rogue','rare',[['hit',16,5],['weak',2,1]]],
 ['envenom','蛇吻',1,'power','rogue','rare',[['venomBlade',2,1]]],
 ['accelerate','追风',0,'skill','rogue','common',[['draw',2,1]],true],
 ['assassinate','终夜',2,'attack','rogue','rare',[['poisonHit',8,4]]],
 ['wraith','残像',1,'skill','rogue','common',[['block',9,3],['weak',1,1]]],
 ['plague','蛇巢',2,'skill','rogue','rare',[['allPoison',7,3]]],
 ['spread','蔓延',1,'skill','rogue','rare',[['doublePoison',1,1]]],
 ['triple','三重影',1,'attack','rogue','common',[['hit',3,1],['hit',3,1],['hit',3,1]]],
 ['nightfall','月蚀',1,'power','rogue','rare',[['dexterity',2,1]]],
 ['insight','远见',1,'skill','neutral','common',[['draw',3,1]]],
 ['bandage','绷带',1,'skill','neutral','common',[['heal',6,3]],true],
 ['heavy','陨铁',2,'attack','neutral','common',[['hit',16,5]]],
 ['prism','棱光',1,'skill','neutral','rare',[['energy',2,1],['draw',1,1]],true],
 ['wall','避风港',2,'skill','neutral','common',[['block',13,5],['draw',1,0]]],
 ['resolve','决心',1,'power','neutral','rare',[['strength',1,1],['dexterity',1,1]]],
 ['falter','疲惫',1,'curse','neutral','curse',[]],
 ['ember','灼痕',0,'curse','neutral','curse',[['loseHp',2,0]],true]
];
export const CARDS = Object.fromEntries(entries.map(([id,name,cost,type,hero,rarity,effects,exhaust=false])=>[id,{id,name,cost,type,hero,rarity,effects,exhaust}]));
export const TYPES = {attack:'攻击',skill:'技巧',power:'能力',curse:'诅咒'};
export function catalogCards({hero='all',type='all',rarity='all',query='',up=false}={}){
 const q=String(query).trim().toLocaleLowerCase();
 return Object.values(CARDS).filter(c=>(hero==='all'||c.hero===hero)&&(type==='all'||c.type===type)&&(rarity==='all'||c.rarity===rarity)&&(!q||(c.name+' '+cardText({id:c.id,up})+' '+c.id).toLocaleLowerCase().includes(q))).map(c=>({id:c.id,up:!!up&&c.type!=='curse'}));
}
export const RELICS = {
 coal:{name:'誓约余炭',icon:'flame',text:'每场战斗结束恢复 5 生命。'},
 lens:{name:'星辉透镜',icon:'gem',text:'每场战斗第一回合额外抽 2 张牌。'},
 fang:{name:'蛇牙吊坠',icon:'fang',text:'战斗开始时，所有敌人获得 2 中毒。'},
 shell:{name:'玄铁壳',icon:'shield',text:'战斗开始获得 10 格挡。'},
 feather:{name:'风羽',icon:'feather',text:'每回合额外抽 1 张牌。'},
 crown:{name:'破碎王冠',icon:'crown',text:'每回合能量 +1，但每回合少抽 1 张牌。'},
 whetstone:{name:'磨刃石',icon:'sword',text:'战斗开始获得 2 力量。'},
 bell:{name:'暮钟',icon:'bell',text:'每场战斗结束额外获得 15 金币。'},
 heart:{name:'琥珀心',icon:'heart',text:'立即提高 12 最大生命并恢复 12 生命。'},
 cloak:{name:'影织披风',icon:'cloak',text:'每回合开始获得 3 格挡。'},
 fern:{name:'银蕨',icon:'leaf',text:'篝火休息额外恢复 10 生命。'},
 needle:{name:'赤铜针',icon:'needle',text:'战斗开始获得 3 反伤。'},
 coin:{name:'旅商印记',icon:'coin',text:'商店所有价格降低 25%。'},
 orb:{name:'潮汐珠',icon:'orb',text:'每次使用药水额外抽 2 张牌。'},
 boots:{name:'游侠靴',icon:'boots',text:'战斗开始获得 2 敏捷。'},
 lantern:{name:'不熄灯',icon:'lantern',text:'每场战斗首次生命低于一半时恢复 8 生命。'}
};
export const POTIONS = {
 heal:{name:'生命药剂',text:'恢复 20 生命。',color:'#ed7c7b'},
 fire:{name:'烈焰药剂',text:'对所有敌人造成 18 伤害。',color:'#ffaa61'},
 shield:{name:'坚壁药剂',text:'获得 18 格挡。',color:'#85bff5'},
 energy:{name:'灵泉药剂',text:'获得 2 能量，抽 2 张牌。',color:'#bea0ed'}
};
export const ACTS = [
 {name:'低语森林',subtitle:'树影之下，仍有余火',color:'#80b8a5',boss:'warden'},
 {name:'沉没王庭',subtitle:'王冠沉入水底，誓言没有',color:'#88a6d8',boss:'oracle'},
 {name:'无光天阶',subtitle:'最后一道门，在星辰之外',color:'#dda16a',boss:'sovereign'}
];
// Intent fields: damage, hits, block, strength, poison, weak, summon not used.
export const ENEMIES = {
 wolf:{name:'裂牙狼',art:'wolf',hp:28,cycle:[{damage:7},{damage:4,hits:2},{block:6,damage:5}]},
 slime:{name:'沼泽凝胶',art:'slime',hp:32,cycle:[{damage:6,weak:1},{block:8},{damage:10}]},
 cultist:{name:'枯枝祭徒',art:'cultist',hp:35,cycle:[{strength:2},{damage:9},{damage:6,hits:2}]},
 sentinel:{name:'苔铁守卫',art:'sentinel',hp:47,cycle:[{block:10},{damage:14},{damage:7,hits:2}]},
 spider:{name:'幽纹蛛',art:'spider',hp:29,cycle:[{damage:5,poison:3},{damage:8},{block:5,damage:6}]},
 knight:{name:'失誓骑士',art:'knight',hp:52,cycle:[{block:9,damage:8},{damage:17},{strength:3}]},
 eye:{name:'漂浮之眼',art:'eye',hp:42,cycle:[{damage:9,weak:2},{damage:6,hits:2},{strength:2}]},
 golem:{name:'星骸傀儡',art:'golem',hp:60,cycle:[{block:14},{damage:20},{damage:8,hits:2}]},
 reaper:{name:'烬翼收割者',art:'reaper',hp:55,cycle:[{damage:12},{damage:7,hits:3},{block:10,strength:2}]},
 warden:{name:'腐冠树王',art:'warden',hp:145,boss:true,cycle:[{damage:10},{block:12,strength:2},{damage:6,hits:3},{damage:20,weak:1}]},
 oracle:{name:'沉梦神谕',art:'oracle',hp:165,boss:true,cycle:[{damage:10,poison:3},{block:15,strength:2},{damage:8,hits:3},{damage:24}]},
 sovereign:{name:'无光之主',art:'sovereign',hp:195,boss:true,cycle:[{damage:14},{block:18,strength:3},{damage:9,hits:3},{damage:28,weak:2}]}
};
export const EVENTS = [
 {id:'well',name:'倒映之井',story:'井底映出的不是你的脸，而是一个仍然完好的世界。声音问：你愿意交换什么？',choices:[{label:'饮下井水',detail:'恢复 22 生命，获得一张「疲惫」',effect:'well'},{label:'投下一枚金币',detail:'花费 35 金币，获得随机遗物',effect:'offering'},{label:'离开',detail:'不做交换',effect:'leave'}]},
 {id:'smith',name:'流浪铸匠',story:'没有脸的铸匠坐在废墟里，手边的炉火还亮着。他指向你的牌，又指向你的伤口。',choices:[{label:'让他淬炼',detail:'失去 7 生命，随机升级两张牌',effect:'smith'},{label:'接受他的药草',detail:'恢复 12 生命',effect:'herbs'},{label:'点头离开',detail:'无事发生',effect:'leave'}]},
 {id:'archive',name:'忘却书库',story:'风吹过书架，每一本书都记载着你未曾选择的道路。有一页，正在缓慢燃烧。',choices:[{label:'遗忘一段过去',detail:'从卡组移除一张牌',effect:'forget'},{label:'记住新的知识',detail:'获得一张稀有卡牌',effect:'learn'},{label:'合上书',detail:'不做改变',effect:'leave'}]},
 {id:'traveler',name:'最后的旅人',story:'旅人将包裹放在地上。里面有几枚旧币，一瓶清澈的药水，还有一张褪色的地图。',choices:[{label:'交换补给',detail:'花费 25 金币，获得生命药剂',effect:'trade'},{label:'帮他生火',detail:'获得 30 金币',effect:'fire'},{label:'并肩歇息',detail:'恢复 10 生命',effect:'rest'}]},
 {id:'altar',name:'星尘祭坛',story:'祭坛上刻着一句话：星光不是免费的。你伸出手，指尖被温柔地刺痛。',choices:[{label:'献上鲜血',detail:'失去 10 生命，获得随机遗物',effect:'sacrifice'},{label:'收集星屑',detail:'获得 45 金币',effect:'dust'},{label:'转身离去',detail:'不做改变',effect:'leave'}]}
];
export const KEYWORDS = {
 block:'格挡吸收伤害，通常在你的下回合开始清空。',burn:'灼烧在敌人行动前造成伤害，再减少 2 点；不受格挡影响。',poison:'中毒在该角色回合开始造成伤害，再减少 1 点；不受格挡影响。',weak:'虚弱：攻击伤害降低 25%，按自身回合递减。',vulnerable:'易伤：受到的攻击伤害提高 50%，按自身回合递减。',strength:'力量：每次攻击额外造成等量伤害。',dexterity:'敏捷：每次卡牌获得的格挡增加等量。',thorns:'反伤：每次受攻击后，对攻击者造成等量伤害。',exhaust:'消耗：本场战斗不会再次抽到。能力牌使用后也移出本场牌堆。',upgrade:'升级：永久强化一张牌；每张牌只能升级一次。',spell:'法术：焰语师的全部职业牌。第三张法术触发连携。'
};
export function cardText(card) {
 const d=CARDS[card.id], up=card.up?1:0;
 const lines=d.effects.map(([k,b,u])=>{const n=b+u*up; return ({hit:`造成 ${n} 伤害`,allHit:`对所有敌人造成 ${n} 伤害`,block:`获得 ${n} 格挡`,draw:`抽 ${n} 张牌`,energy:`获得 ${n} 能量`,heal:`恢复 ${n} 生命`,loseHp:`失去 ${n} 生命`,strength:`获得 ${n} 力量`,dexterity:`获得 ${n} 敏捷`,thorns:`获得 ${n} 反伤`,plating:`每回合获得 ${n} 格挡`,spellPower:`本场灼烧施加量 +${n}`,venomBlade:`攻击附加 ${n} 中毒`,poison:`施加 ${n} 中毒`,allPoison:`所有敌人获得 ${n} 中毒`,burn:`施加 ${n} 灼烧`,allBurn:`所有敌人获得 ${n} 灼烧`,weak:`施加 ${n} 虚弱`,vulnerable:`施加 ${n} 易伤`,shieldHit:`造成 ${n} + 当前格挡的伤害`,execute:`造成 ${n} 伤害；敌人生命低于一半时翻倍`,poisonHit:`造成 ${n} + 目标中毒 × 3 的伤害`,doublePoison:`目标中毒变为 ${n+1} 倍`,doubleBurn:`目标灼烧变为 ${n+1} 倍`})[k];});
 if (d.type==='curse'&&!lines.length) lines.push('无法打出。占用一张手牌。');
 if(d.exhaust) lines.push('消耗'); if(d.type==='power')lines.push('本场持续生效');
 return lines.join('。')+'。';
}
