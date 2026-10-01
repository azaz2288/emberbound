// Locally composed music and layered procedural Foley, no remote assets.
let context=null,master=null,musicBus=null,musicTimer=null,nextBeat=0,beat=0;
const active=new Set();let voices=0;
export const preferences={sound:true,volume:.55,music:true,reducedMotion:false};
const MELODY=[0,7,12,10,7,3,5,7,0,7,15,12,10,7,5,3,-2,5,10,7,5,2,3,5,-5,2,7,10,7,5,3,2];
const CHORDS=[[0,3,7],[-5,0,3],[-2,2,5],[-7,-2,2]];
const frequency=n=>146.832*Math.pow(2,n/12);
function voice(ctx,out,freq,t,length,level=.15,type='sine',end=null){
 const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(end)o.frequency.exponentialRampToValueAtTime(end,t+length);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(level,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+length);
 o.connect(g);g.connect(out);o.start(t);o.stop(t+length+.02);o.onended=()=>{o.disconnect();g.disconnect();active.delete(o);};return o;
}
function noise(ctx,out,t,length,level=.22,cutoff=1800){
 const b=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*length),ctx.sampleRate),data=b.getChannelData(0);let rng=71;
 for(let i=0;i<data.length;i++){rng=(Math.imul(rng,1664525)+1013904223)>>>0;data[i]=(rng/2147483648-1)*(1-i/data.length);}
 const n=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();n.buffer=b;f.type='lowpass';f.frequency.value=cutoff;g.gain.value=level;
 n.connect(f);f.connect(g);g.connect(out);n.start(t);n.onended=()=>{n.disconnect();f.disconnect();g.disconnect();active.delete(n);};return n;
}
export function renderTone(ctx,out,kind='click',t=ctx.currentTime){
 const track=[];const v=(f,l,d=0,level=.2,type='sine',end=null)=>track.push(voice(ctx,out,f,t+d,l,level,type,end));const n=(l,level=.25,d=0,cutoff=2300)=>track.push(noise(ctx,out,t+d,l,level,cutoff));
 if(kind==='hit'){n(.32,.4,0,4000);v(210,.23,0,.4,'triangle',47);v(960,.16,.01,.12,'sawtooth',230);}
 else if(kind==='spell'){n(.6,.12,0,3800);v(260,.5,0,.16,'triangle',1100);v(520,.5,.09,.13,'sine',1800);}
 else if(kind==='block'){n(.2,.22,0,5300);v(420,.38,0,.28,'triangle');v(870,.45,.015,.17);v(1320,.3,.01,.07);}
 else if(kind==='card'){n(.18,.3,0,2900);v(330,.2,0,.15);v(660,.3,.08,.15);}
 else if(kind==='heal'||kind==='combo'){[392,523,659,784].forEach((f,i)=>v(f,.5,i*.1,.19));}
 else if(kind==='win'){[261,330,392,523,659,784].forEach((f,i)=>v(f,.9,i*.15,.22));}
 else if(kind==='lose'){[220,164,110,82].forEach((f,i)=>v(f,.8,i*.22,.24,'triangle'));}
 else {v(660,.12,0,.18);v(990,.12,.02,.06);}return track;
}
export function renderMusicBeat(ctx,out,step,t){
 const chord=CHORDS[Math.floor(step/8)%4],melody=MELODY[step%32],track=[];
 track.push(voice(ctx,out,frequency(melody+12),t,.68,.06,'sine'));track.push(voice(ctx,out,frequency(chord[step%3]+12),t+.22,.5,.027,'triangle'));
 if(step%4===0){track.push(voice(ctx,out,frequency(chord[0]-12),t,1.75,.07,'triangle'));for(const n of chord)track.push(voice(ctx,out,frequency(n),t,1.7,.02,'sine'));}return track;
}
function remember(nodes){for(const n of nodes)active.add(n);voices+=nodes.length;}
function stopMusic(){clearInterval(musicTimer);musicTimer=null;if(musicBus)musicBus.gain.setTargetAtTime(0,context.currentTime,.04);}
function startMusic(){if(musicTimer||!context||context.state!=='running'||!preferences.music)return;musicBus?.disconnect();musicBus=context.createGain();musicBus.gain.value=1;musicBus.connect(master);nextBeat=context.currentTime+.05;
 const schedule=()=>{if(context.state!=='running'){nextBeat=context.currentTime+.05;return;}while(nextBeat<context.currentTime+.4){remember(renderMusicBeat(context,musicBus,beat++,nextBeat));nextBeat+=.48;}};schedule();musicTimer=setInterval(schedule,100);
}
export function unlock(){
 if(!context){try{context=new(window.AudioContext||window.webkitAudioContext)();master=context.createGain();master.gain.value=preferences.volume;const limiter=context.createDynamicsCompressor();limiter.threshold.value=-10;limiter.knee.value=12;limiter.ratio.value=6;master.connect(limiter);limiter.connect(context.destination);}catch{return;}}
 if(context.state==='suspended')context.resume().then(startMusic).catch(()=>{});else startMusic();
}
export function tone(kind='click'){if(!preferences.sound||preferences.volume===0)return;unlock();if(context)remember(renderTone(context,master,kind,context.currentTime+.015));}
export function updateAudio(){if(master)master.gain.setTargetAtTime(preferences.volume,context.currentTime,.025);if(preferences.music){unlock();startMusic();}else stopMusic();}
export function audioState(){return {state:context?.state||'未解锁',volume:preferences.volume,sound:preferences.sound,music:preferences.music,voices,active:active.size};}
