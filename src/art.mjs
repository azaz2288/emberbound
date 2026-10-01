// Original procedural vector illustrations. No downloaded/copyrighted game assets.
import {illustratedCard} from './card-scenes.mjs';
const wrap=(body,view='0 0 240 280')=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}" aria-hidden="true">${body}</svg>`;
export const uri=svg=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
const defs=`<defs><linearGradient id="steel" x2=".8" y2="1"><stop stop-color="#d4ddd6"/><stop offset=".45" stop-color="#687d84"/><stop offset="1" stop-color="#263c48"/></linearGradient><linearGradient id="cloth" x2="1" y2="1"><stop stop-color="#48646c"/><stop offset="1" stop-color="#162731"/></linearGradient><linearGradient id="gold" x2=".4" y2="1"><stop stop-color="#f9d994"/><stop offset="1" stop-color="#9a643b"/></linearGradient><radialGradient id="glow"><stop stop-color="#ffc174" stop-opacity=".9"/><stop offset="1" stop-color="#ff8c46" stop-opacity="0"/></radialGradient><radialGradient id="aura"><stop stop-color="#8cdbd0" stop-opacity=".5"/><stop offset="1" stop-color="#8cdbd0" stop-opacity="0"/></radialGradient></defs>`;
const icons={
 sword:'<path d="M11 25 24 5 29 4 29 9 15 29Z"/><path d="m8 23 10 7M9 29l-4 5"/>',
 shield:'<path d="M17 3 30 8v12c0 8-13 14-13 14S4 28 4 20V8Z"/><path d="m10 18 5 5 10-12"/>',
 flame:'<path d="M20 3c2 9-7 11-3 16 2-3 5-4 6-9 9 10 10 21-2 24C3 36 0 23 9 14c-1 9 4 7 4 2 0-6 5-9 7-13Z"/>',
 star:'<path d="m17 2 4 11 12 3-10 7 1 12-7-7-8 7 1-12L1 16l12-3Z"/>',
 skull:'<path d="M7 25C-1 15 5 3 17 3s18 12 10 22v8H7Z"/><circle cx="11" cy="17" r="3"/><circle cx="23" cy="17" r="3"/><path d="m15 24 2-4 2 4M12 29v5m5-5v5m5-5v5"/>',
 coin:'<circle cx="17" cy="18" r="14"/><path d="M22 11h-9v6h8v7h-9m5-17v21"/>',
 heart:'<path d="M17 32C-3 21 1 6 10 6c4 0 7 4 7 4s3-4 7-4c11 0 13 16-7 22Z"/>',
 gem:'<path d="m4 12 7-8h13l7 8-14 21Z"/><path d="m4 12 27 0M11 4l6 29 7-29"/>',
 leaf:'<path d="M29 3C4 3-2 18 8 29 20 35 34 19 29 3Z"/><path d="M4 34 25 9m-15 16 1-12m5 6 10 1"/>',
 feather:'<path d="M5 32C-3 15 22 0 30 4c6 10-11 27-25 28Z"/><path d="M2 35 26 9M10 26V14m5 7 12-2"/>',
 crown:'<path d="m3 10 8 7 6-13 6 13 8-7-4 21H7Z"/>',
 bell:'<path d="M5 27h24l-4-7v-7a8 8 0 0 0-16 0v7Zm8 3a4 4 0 0 0 8 0M17 2v4"/>',
 fang:'<path d="M8 3C4 24 12 34 26 34 14 24 18 13 26 3Z"/>',
 orb:'<circle cx="17" cy="18" r="12"/><path d="M4 27 30 9M8 5l18 26"/>',
 boots:'<path d="M12 3h13v17l7 4v8H4v-7l8-6Z"/>',
 cloak:'<path d="M17 3c-7 0-9 6-9 11L2 32h30l-6-18c0-5-2-11-9-11Z"/><path d="M10 13c5 4 10 4 14 0M17 17v15"/>',
 needle:'<path d="M27 3 6 33 19 6Z"/><path d="M22 8 25 5"/>',
 lantern:'<path d="M11 7a6 6 0 0 1 12 0M7 8h20l-3 5v14l3 6H7l3-6V13Z"/><path d="M17 15v11m-4-7 8 3"/>',
 shop:'<path d="M3 15 6 5h22l3 10M6 16v16h22V16M3 15c2 5 5 5 7 0 2 5 5 5 7 0 2 5 5 5 7 0 2 5 5 5 7 0M13 32V21h8v11"/>',
 question:'<path d="M9 11c0-10 17-10 17 0 0 7-9 5-9 12m0 6v3"/>',
 elite:'<path d="m17 2 5 8 10 4-8 8-1 11-6-5-6 5-1-11-8-8 10-4Z"/><path d="m11 15 4 4m8-4-4 4"/>',
 rest:'<path d="m4 33 26-8M4 25l26 8M18 4c2 8-7 8-4 13 2-1 4-3 4-6 8 5 9 14-1 15C4 25 6 18 10 13"/>',
 map:'<path d="m3 8 10-4 9 4 10-4v25l-10 4-9-4-10 4ZM13 4v25M22 8v25"/>',
 deck:'<rect x="9" y="3" width="21" height="27" rx="3"/><path d="M5 9H3v25h21v-2m-8-16 4-6 4 6-4 6Z"/>',
 gear:'<path d="m13 2 8 0 1 5 5 2 4-2 4 7-4 3v5l4 3-4 7-4-2-5 2-1 5h-8l-1-5-5-2-4 2-4-7 4-3v-5l-4-3 4-7 4 2 5-2Z"/><circle cx="17" cy="19" r="6"/>',
 sound:'<path d="M3 13h7l10-8v27l-10-8H3Zm22-2c7 4 7 12 0 16m4-21c10 7 10 19 0 26"/>',
 arrow:'<path d="M5 18h25M20 7l11 11-11 11"/>',
 close:'<path d="m8 8 20 20M28 8 8 28"/>',
 potion:'<path d="M12 3h10v4h-2v8c15 11 14 19-3 19S-1 26 14 15V7h-2Zm-5 22h20"/>',
 snow:'<path d="M17 2v32M3 10l28 16M3 26 31 10m-19-23 5 5 5-5M12 29l5-5 5 5"/>'
};
export function icon(name,cls=''){return `<svg class="icon ${cls}" viewBox="0 0 36 38" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.star}</svg>`;}
export function heroArt(id){
 const common=`${defs}<ellipse cx="120" cy="264" rx="72" ry="9" fill="#000" opacity=".3"/>`;
 if(id==='knight')return wrap(common+`
 <circle cx="124" cy="154" r="115" fill="url(#glow)" opacity=".25"/>
 <path d="M105 86C80 99 63 162 51 243l48-17 50 16 40-5c-15-79-16-134-46-155Z" fill="#763f38" stroke="#bd7460" stroke-width="2"/>
 <path d="M92 160 84 247l20 5 20-79 9 79 22-3-10-94" fill="#1c3039" stroke="#72939b" stroke-width="2"/>
 <path d="m84 238-12 20 31 3 6-20m23-3-2 21 34-1-10-20" fill="url(#steel)" stroke="#121f29" stroke-width="3"/>
 <path d="M87 98 105 80h37l27 30-21 65-47-2-22-47Z" fill="url(#steel)" stroke="#b5c3bd" stroke-width="2"/>
 <path d="m105 83 14 35 23-36m-23 36 1 42m-31-33 28 13 34-14" fill="none" stroke="#dbc696" stroke-width="3"/>
 <path d="m82 97-19 15 7 29 27-13m62-31 22 18-8 31-25-18" fill="url(#steel)" stroke="#a8b5ad" stroke-width="2"/>
 <path d="m167 130 13 30 19-9-23-28" fill="url(#steel)"/>
 <path d="M103 45c-8 10-5 35 11 40h20c11-7 16-24 7-39Z" fill="url(#steel)" stroke="#cbd7cf" stroke-width="2"/>
 <path d="m105 50 22-13 19 17-22 12Z" fill="#4d656e"/>
 <path d="m106 65 34-3-3 10-29 2Z" fill="#142129"/><path d="m112 66 7 0m9-1 7 0" stroke="#ffc987" stroke-width="3"/>
 <path d="m124 39 7-19 4 22" fill="#b3624b"/>
 <g transform="rotate(12 194 164)"><path d="m190 140 4-114 8 114Z" fill="#dae1d8" stroke="#6d929e" stroke-width="2"/><path d="M179 145h35m-20 0v33" stroke="#d6b979" stroke-width="5"/></g>
 <path d="m53 124 27 4 10 22-11 64-31-27-4-46Z" fill="#263f49" stroke="#d3bd88" stroke-width="3"/><path d="m64 136 5 15 13 7-15 8-5 23-5-23-8-12 12-4Z" fill="url(#gold)"/>
 <path d="m101 172 40 1-3 9-35-1Z" fill="#453631"/><rect x="116" y="171" width="14" height="12" rx="2" fill="url(#gold)"/>
 <path d="m45 243 2-5m18-11 2-4m110 13 3-6" stroke="#ffb16b" opacity=".7"/>`);
 if(id==='mage')return wrap(common+`
 <circle cx="120" cy="140" r="104" fill="url(#aura)"/>
 <path d="M102 93C67 127 56 203 39 251l53-11 29 21 27-20 49 6c-20-55-23-107-49-151Z" fill="#292a50" stroke="#8a96c5" stroke-width="2"/>
 <path d="M110 96 81 231l40 21 31-21-17-137Z" fill="#555486"/>
 <path d="m119 106-13 119 15 24 10-25-9-118M72 205l44 27m47-34-34 33" fill="none" stroke="#c5bba5" stroke-width="2"/>
 <path d="m98 94-20 20 15 27 23-24 21 26 22-30-25-23" fill="#343953" stroke="#cac4ba" stroke-width="2"/>
 <path d="M101 55v27c4 24 35 20 40 1V56Z" fill="#d6bda2"/><path d="M99 68 88 90c-4-37 15-61 38-57 23 5 32 32 19 62l-6-38-12 12-13-10Z" fill="#e1d9c3"/>
 <path d="m111 76 7 0m11 0 6-1" stroke="#4d485a" stroke-width="2"/><path d="m121 88 8 0" stroke="#9c766b"/>
 <path d="M96 109 69 136 51 117l-9 11 31 36 34-32" fill="#454873" stroke="#9aadd0" stroke-width="2"/>
 <path d="m147 112 26 21 18-34 11 8-18 55-39-29" fill="#454873" stroke="#9aadd0" stroke-width="2"/>
 <circle cx="46" cy="88" r="38" fill="url(#glow)"/>
 <path d="M47 116C17 100 45 90 38 63c20 15 36 33 9 53Z" fill="#ffb369"/><path d="M45 110C28 103 50 94 47 81c12 12 17 26-2 29Z" fill="#fff1b5"/>
 <path d="m195 54-6 192" stroke="#a7a293" stroke-width="6"/><path d="m178 48 18-21 16 25-20 22Z" fill="#9eafeb" stroke="#d8d7c7" stroke-width="3"/>
 <path d="m177 35 16 31 19-30" fill="none" stroke="#e1bd78" stroke-width="2"/>
 <path d="m120 137 7 12-7 12-7-12Z" fill="#ffe6a4"/><circle cx="121" cy="32" r="4" fill="#d5d5ef"/>
 <g fill="#b3cfff"><circle cx="25" cy="157" r="2"/><circle cx="60" cy="62" r="2"/><circle cx="174" cy="192" r="2"/><circle cx="151" cy="33" r="2"/></g>`);
 return wrap(common+`
 <circle cx="120" cy="150" r="105" fill="url(#aura)" opacity=".55"/>
 <path d="M92 75C61 102 53 178 34 244l55-22 31 22 34-18 47 4-48-147Z" fill="#193e3a" stroke="#53877c" stroke-width="2"/>
 <path d="m96 165-14 79 23 5 18-62 15 63 22-8-14-80Z" fill="#1a3035" stroke="#60877e" stroke-width="2"/>
 <path d="m81 240-10 19h34l5-20m26 1-2 19h37l-15-22" fill="#344e51"/>
 <path d="m104 89-21 28 14 62 48-3 15-65-25-23Z" fill="#3c5a56" stroke="#97b5a1" stroke-width="2"/>
 <path d="m96 110 43 43m-45-23 34 35M105 96l17 66" stroke="#283934" stroke-width="7"/>
 <path d="M97 77c-2-19 2-45 25-46 29 1 34 30 27 57l-26-14Z" fill="#183835" stroke="#8cbaaa" stroke-width="2"/>
 <path d="m103 68 19-20 22 21-8 31-20-2Z" fill="#112322"/><path d="m109 71 10 2m9 0 10-2" stroke="#b1e2d5" stroke-width="3"/>
 <path d="m113 82 22 0-9 17-12-2" fill="#53716a"/>
 <path d="m86 113-28 28 10 22 30-22m55-23 27 26-7 27-28-30" fill="#37544e" stroke="#92a99d" stroke-width="2"/>
 <path d="m57 152-20-13-17-45 37 38 8 15Z" fill="#bdcec5" stroke="#5f9d98" stroke-width="2"/>
 <path d="m177 157 22-17 22-41-39 32-13 20Z" fill="#bdcec5" stroke="#5f9d98" stroke-width="2"/>
 <path d="m97 172 47-1" stroke="#bc9870" stroke-width="6"/><path d="m104 179-8 28 16 0 5-27" fill="#897957"/>
 <path d="M34 239c21-38 23-74 36-105M185 224l-30-95" fill="none" stroke="#5fbaaa" opacity=".5"/>
 <g fill="#78caba"><circle cx="33" cy="187" r="2"/><circle cx="185" cy="71" r="2"/><circle cx="187" cy="242" r="2"/></g>`);
}
export function enemyArt(id){
 const b=defs+'<ellipse cx="120" cy="260" rx="75" ry="10" fill="#000" opacity=".35"/>';
 if(id==='slime')return wrap(b+`<path d="M45 240C18 213 46 122 89 107c5-46 28-62 42-22 64 10 86 109 65 155-30 21-121 24-151 0Z" fill="#529f8d" stroke="#a5d7ad" stroke-width="3"/><path d="M61 203c3-53 32-89 51-67m30-23c31 8 47 39 44 59" fill="none" stroke="#b0dbb6" stroke-width="9" opacity=".35"/><ellipse cx="91" cy="189" rx="10" ry="14" fill="#143936"/><ellipse cx="148" cy="189" rx="10" ry="14" fill="#143936"/><path d="m107 213 18 3 13-5" stroke="#204f46" stroke-width="4" fill="none"/><g fill="#cfeec0" opacity=".6"><circle cx="75" cy="153" r="5"/><circle cx="153" cy="133" r="7"/><circle cx="167" cy="222" r="4"/></g>`);
 if(id==='wolf')return wrap(b+`<path d="m45 186 20-34 69-24 48 36 17 25-32 0-8 41-22 10-3-48-40 3-6 41-27 6 7-53Z" fill="#607582" stroke="#8fa5a8" stroke-width="2"/><path d="m133 142 6-58 22 26 14-34 17 62 23 17-17 22-49-5Z" fill="#889298" stroke="#bac5bb" stroke-width="2"/><path d="m161 147 7-4m17 0 8 3" stroke="#f2c78a" stroke-width="4"/><path d="m185 162 29-6-5 18-27-3" fill="#2b3941"/><path d="m188 173 4 9 6-9" fill="#f8e6c3"/><path d="m63 162-38-44-5 43 37 31" fill="#677e85"/><path d="m105 137 11 20 14-27 7 18 12-7" fill="#9bada9"/>`);
 if(id==='spider')return wrap(b+`<g fill="none" stroke="#7c6e89" stroke-width="8" stroke-linejoin="round"><path d="m88 177-45-39-29 92m79-38-45 1-28 54m66-56-53-68-1 50m112 24 55-30 29 95m-74-52 47 9 22 52m-67-70 54-67 1 49"/></g><ellipse cx="121" cy="151" rx="41" ry="50" fill="#483d55" stroke="#a18aab" stroke-width="3"/><ellipse cx="119" cy="196" rx="35" ry="29" fill="#77637f"/><path d="m103 215-8 22 13-10m19-10 17 15-5-24" fill="#d1b8b9"/><g fill="#eea2a4"><circle cx="101" cy="188" r="4"/><circle cx="115" cy="193" r="5"/><circle cx="129" cy="193" r="5"/><circle cx="141" cy="188" r="4"/></g><path d="m115 114 11 19-9 27-11-19Z" fill="#b39dbe"/>`);
 if(id==='eye')return wrap(b+`<circle cx="120" cy="143" r="86" fill="url(#aura)"/><path d="M39 142c37-79 126-72 170 0-42 80-133 73-170 0Z" fill="#89809c" stroke="#d4b4be" stroke-width="3"/><path d="M57 142c29-48 92-45 132 0-31 47-95 45-132 0Z" fill="#eadccb"/><ellipse cx="122" cy="142" rx="24" ry="37" fill="#af775d"/><ellipse cx="122" cy="142" rx="6" ry="34" fill="#2c2538"/><path d="M72 183c-18 26-5 42-20 65m38-46c6 23-12 34-3 54m65-55c18 13 2 41 18 48m15-64c25 28 2 43 18 50" fill="none" stroke="#7b708c" stroke-width="5"/>`);
 if(['cultist','reaper','oracle'].includes(id)){
 const boss=id==='oracle',reaper=id==='reaper';
 return wrap(b+`<circle cx="120" cy="126" r="${boss?105:75}" fill="url(#aura)"/><path d="M99 89C64 108 50 191 34 248l42-10 40 23 45-22 48 9c-25-51-27-119-64-161Z" fill="${boss?'#4e526f':reaper?'#414152':'#394d46'}" stroke="#9aa6a2" stroke-width="2"/><path d="m111 104-21 130 27 12 23-16-13-126" fill="#1e3037"/><path d="m97 83-9-21 27-39 38 28-4 41-23-15Z" fill="#263b40" stroke="#9cb0ab" stroke-width="2"/><path d="m107 56 19-9 19 14-8 25-23-3Z" fill="#e1d4b8"/><path d="m116 64 7 3m9-3 6 2" stroke="#243b40" stroke-width="4"/><path d="m102 111-35 39-17-10m96-29 34 37 21-11" stroke="#9aafa8" stroke-width="8" fill="none"/>
 ${reaper?'<path d="M191 53v180m0-178c-39-43-88-26-105-1 42-13 66 0 105 14" fill="#a8b9b1" stroke="#9dad9f" stroke-width="5"/>':'<path d="M47 103v153" stroke="#a69070" stroke-width="5"/><circle cx="47" cy="91" r="17" fill="none" stroke="#c7b68f" stroke-width="3"/><circle cx="47" cy="91" r="7" fill="#9de2d1"/>'}
 ${boss?'<circle cx="127" cy="41" r="47" fill="none" stroke="#d7b27f" stroke-width="2"/><path d="m89 26 11-22 24 17 28-19 11 27" fill="none" stroke="#b0bdd0" stroke-width="4"/>':''}<path d="m73 220 35 17m34-5 34-15" stroke="#8f947e" fill="none"/>`);
 }
 if(id==='warden')return wrap(b+`<circle cx="120" cy="143" r="114" fill="url(#aura)"/><path d="m84 151-39 73-15 22 51-7 25-44 9 56 21 9 3-70 36 53 36 3-18-25-34-69Z" fill="#5a6855" stroke="#9c9a77" stroke-width="3"/><path d="m86 92-22 83 44 26 52-31-18-82Z" fill="#667663" stroke="#bcc29c" stroke-width="3"/><path d="m108 120 8 27-12 19 27-9 4-24" fill="#233d37"/><path d="m75 118-38 27-23 61 24-12 15-34 37-21m56-20 47 27 19 60-27-17-12-33-39-16" fill="#526451" stroke="#89967a" stroke-width="3"/><path d="m99 63-33-14-18-30 29 10 16 24m43 13 25-14 25-31-4 38-34 19m-38-20-2-41 13 23 7-29 7 47" fill="none" stroke="#9b9b77" stroke-width="8"/><path d="m89 68 33-14 30 14-7 40-20 14-29-21Z" fill="#7a8b69" stroke="#b7b895" stroke-width="3"/><path d="m98 81 13 3m21-2 12-4" stroke="#f8d695" stroke-width="4"/><path d="m114 101 21-2-13 9Z" fill="#233b32"/><g fill="#aac99b"><path d="m45 62-17-24 27 8Zm139-24 20-18-2 28ZM48 183l-27-13 9 25Z"/></g>`);
 if(id==='sovereign')return wrap(b+`<circle cx="121" cy="130" r="111" fill="url(#glow)" opacity=".65"/><circle cx="121" cy="106" r="77" fill="none" stroke="#d7ad6a" stroke-width="2" stroke-dasharray="4 11"/><path d="m97 92-38 45-27 116 54-24 34 31 37-32 59 24-44-137-28-24Z" fill="#232b3f" stroke="#897695" stroke-width="3"/><path d="m97 113 27-13 28 16-16 98-15 38-16-36Z" fill="#66506d"/><path d="m102 131 24 17 21-16m-36 46 25 0" fill="none" stroke="#d7b179" stroke-width="3"/><path d="m100 62 4-29 18 14 20-17 3 38-8 26-22 0Z" fill="url(#gold)" stroke="#f5d19a" stroke-width="2"/><path d="m110 66 12 6 14-8-6 15-11 0Z" fill="#182435"/><path d="m107 42-8-23 23 8 21-10-3 25" fill="none" stroke="#e6bf84" stroke-width="3"/><path d="m89 121-31 29-23-34m123 5 36 27 21-34" fill="none" stroke="#b7a3be" stroke-width="9"/><circle cx="29" cy="102" r="16" fill="#e7b684"/><circle cx="215" cy="100" r="15" fill="#bba4d8"/><path d="m121 125 9 16-9 15-9-15Z" fill="#f8ce8d"/><path d="M50 222c24-8 22-67 36-73m108 73c-20-9-20-50-39-70" stroke="#b7a2ad" fill="none" stroke-width="2"/>`);
 // Sentinel, knight and golem share a constructed armor language, distinct silhouette.
 const big=id==='golem',col=big?'#6e7390':id==='sentinel'?'#56685e':'#666578';
 return wrap(b+`<path d="m93 171-9 71 25 15 18-67 14 66 26-17-14-70" fill="${col}" stroke="#a5b2a5" stroke-width="3"/><path d="m73 99 34-14 44 6 29 30-20 65-66-5-27-51Z" fill="${col}" stroke="#b0b5a3" stroke-width="3"/><path d="m99 104 22 51 23-48m-55 25 31 20 38-17" fill="none" stroke="#c6b48b" stroke-width="3"/><path d="m80 102-30 20 1 39 30-9m92-41 28 18-7 46-30-21" fill="${col}" stroke="#afb6a6" stroke-width="3"/><path d="m106 44-11 18 10 32 30 2 16-33-13-24Z" fill="${col}" stroke="#b2bcae" stroke-width="3"/><path d="m108 67 30-1-4 11-23 0" fill="#172b31"/><path d="m111 70 23-1" stroke="${big?'#adb8ff':'#ebbc84'}" stroke-width="3"/>
 ${big?'<path d="m106 114 16 18 15-18-15-14Z" fill="#a8b9ee"/><path d="m54 157-12 27 10 18 19-14-1-31m122 1 9 26-8 19-18-16 2-30" fill="#858da2"/>':'<path d="m195 136 6-99 9 99-7 34Z" fill="#c2c7b5"/><path d="M186 144h32" stroke="#c6b28b" stroke-width="5"/><path d="m45 137 21 1 10 46-25 33-20-49Z" fill="#34474b" stroke="#a9af98" stroke-width="3"/>'}
 ${id==='sentinel'?'<path d="m75 113-28-16 5 22m96-56 23-28-6 31m-17 118 22 19-25-4" fill="#81a47b"/>':''}`);
}
export function cardArt(id,type,hero){return illustratedCard(id,hero);}
function legacyCardArt(id,type,hero){
 const hue=hero==='mage'?'#a7b4ee':hero==='rogue'?'#86c6b0':'#d8a679';
 let symbol=type==='attack'?'sword':type==='power'?'star':'shield';
 if(/fire|ignite|burn|spark|inferno|weave|ember|nova|comet/.test(id))symbol='flame';
 if(/poison|venom|toxic|plague|spread/.test(id))symbol='fang';
 if(/focus|echo|insight|mana|prism|astral/.test(id))symbol='gem';
 if(id==='bandage')symbol='heart';if(type==='curse')symbol='skull';
 return wrap(`<defs><radialGradient id="cg"><stop stop-color="${hue}" stop-opacity=".32"/><stop offset="1" stop-color="#111e28"/></radialGradient></defs><rect width="200" height="110" fill="#172631"/><rect width="200" height="110" fill="url(#cg)"/><path d="M0 105 32 47 48 78 92 16 145 91 171 56 200 105Z" fill="#223943" opacity=".7"/><circle cx="103" cy="53" r="40" fill="none" stroke="${hue}" stroke-opacity=".25"/><circle cx="103" cy="53" r="32" fill="none" stroke="${hue}" stroke-opacity=".12"/><g transform="translate(80 26) scale(1.35)" stroke="${hue}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="${hue}" fill-opacity=".16">${icons[symbol]}</g><g fill="${hue}" opacity=".6"><circle cx="42" cy="35" r="1"/><circle cx="155" cy="25" r="1.5"/><circle cx="161" cy="83" r="1"/><circle cx="53" cy="91" r="1.5"/></g>`,'0 0 200 110');
}
export function landscape(act=0,title=false){
 const palettes=[['#101f29','#243e42','#31534d','#98b8a1'],['#111e30','#273e56','#324e64','#b5c6d5'],['#211e32','#403249','#655049','#e1c396']];const [sky,mid,near,light]=palettes[act];
 let body=`<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${sky}"/><stop offset="1" stop-color="${mid}"/></linearGradient><radialGradient id="moon"><stop stop-color="${light}" stop-opacity=".22"/><stop offset="1" stop-color="${light}" stop-opacity="0"/></radialGradient></defs><rect width="1440" height="800" fill="url(#sky)"/><circle cx="1080" cy="145" r="240" fill="url(#moon)"/><circle cx="1080" cy="145" r="47" fill="${light}" opacity=".57"/><circle cx="1097" cy="128" r="46" fill="${sky}"/>`;
 for(let i=0;i<65;i++){const x=(i*137+37)%1440,y=(i*79+11)%380;body+=`<circle cx="${x}" cy="${y}" r="${i%7===0?1.4:.65}" fill="${light}" opacity="${.15+(i%4)*.1}"/>`;}
 body+=`<path d="M0 367 165 239 236 297 377 187 501 336 698 220 881 347 1032 250 1152 319 1324 200 1440 301v499H0Z" fill="${mid}" opacity=".75"/><path d="M0 467 132 404 254 440 381 353 520 466 731 338 898 434 1103 351 1280 461 1440 370v430H0Z" fill="${near}" opacity=".5"/>`;
 if(act===0){
  for(let i=0;i<20;i++){let x=i*84-50,h=150+(i*41)%180,y=510-(i%3)*20;body+=`<path d="m${x} ${y} 15-${h} 15 ${h}Z" fill="#132b31"/><path d="m${x+15} ${y-h-60}-45 106 26-8-48 94 29-8-48 85h172l-46-83 29 8-49-96 29 10Z" fill="#19353a"/>`;}
  body+=`<path d="M0 549c180-50 235 53 453-6s361 44 572-5 271 4 415-1v263H0Z" fill="#12292e"/>`;
 }else{
  for(let i=0;i<9;i++){let x=i*183-60,h=80+(i*53)%240;body+=`<path d="m${x} 568v-${h}h24v-23h11v23h24v${h}Z" fill="#172a39"/><path d="m${x-10} ${568-h} 44-43 43 43" fill="${near}"/>`;}
  body+=`<path d="M0 574 323 544 706 570 1052 529 1440 557v243H0Z" fill="#182b35"/>`;
 }
 body+=`<path d="M0 678c231-61 389-14 590-32s400-15 850-44v198H0Z" fill="#0d1d25"/><path d="M508 800c39-95 233-111 416-204-41 68-206 130-230 204Z" fill="${near}" opacity=".4"/>`;
 if(title)body+=`<g fill="#192b35" stroke="#58706c" stroke-width="1"><path d="M1020 492V271h44v-69l28-48 28 48v69h49v221Z"/><path d="M970 515V343h38v-39l21-31 20 31v212m99-11V321h36v-40l21-33 20 33v225"/><path d="M1018 279h153m-112-59h65"/><path d="m1080 420 0-47q11-21 24 0v47Z" fill="#dbb57c" opacity=".8"/></g>`;
 return wrap(body,'0 0 1440 800');
}
