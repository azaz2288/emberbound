import {simulate} from './policy.mjs';
const report=[];
for(const difficulty of ['story','normal','hard'])for(const hero of ['knight','mage','rogue']){
 let wins=0,actSum=0,battles=0,turns=0,steps=0;
 for(let i=0;i<30;i++){const result=simulate(hero,`BALANCE-${i}`,difficulty);wins+=result.s.phase==='victory'?1:0;actSum+=result.s.act+1;battles+=result.s.stats.battles;turns+=result.s.stats.turns;steps+=result.steps;}
 report.push({difficulty,hero,runs:30,wins,meanAct:Number((actSum/30).toFixed(2)),battles,turns,steps});
}
console.log(JSON.stringify({note:'Heuristic automated policy, not a human playtest or final balance claim.',totalRuns:270,report},null,2));
