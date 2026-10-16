(function(){
if(window.LVA)return;
const css=`@keyframes lvTwinkle{0%,100%{opacity:.3}50%{opacity:1}}
@keyframes lvRise{0%{transform:translateY(0);opacity:0}12%{opacity:.75}88%{opacity:.75}100%{transform:translateY(-760px);opacity:0}}
@keyframes lvSway{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}
@keyframes lvPage{0%{transform:translate(0,0) rotate(-10deg);opacity:0}15%{opacity:.55}85%{opacity:.55}100%{transform:translate(50px,-720px) rotate(24deg);opacity:0}}
@keyframes lvOrbit{to{transform:rotate(360deg)}}
@keyframes lvFlow{to{stroke-dashoffset:-40}}
@keyframes lvGlitch{0%,100%{transform:translate(0);filter:none;clip-path:none}20%{transform:translate(-4px,1px);filter:hue-rotate(60deg) saturate(2)}40%{transform:translate(4px,-1px);clip-path:inset(12% 0 34% 0)}60%{transform:translate(-2px,0);clip-path:inset(52% 0 6% 0)}80%{transform:translate(2px,1px);filter:saturate(3)}}
@keyframes lvBroken{0%,86%,100%{transform:translate(0);opacity:.6}88%{transform:translate(-3px,0);opacity:.25}90%{transform:translate(3px,1px);opacity:.8}93%{transform:translate(0);opacity:.35}}
@keyframes lvRing{0%{transform:scale(1);opacity:.8}100%{transform:scale(1.7);opacity:0}}
@keyframes lvStarIn{0%{transform:translateY(-80px) scale(2.4) rotate(-70deg);opacity:0}60%{transform:translateY(4px) scale(.9) rotate(8deg);opacity:1}100%{transform:none;opacity:1}}
@keyframes lvLiquid{to{background-position:-200% 0}}
@keyframes lvPower{0%{filter:brightness(.4) grayscale(1);transform:scale(.9)}35%{filter:brightness(2.6);transform:scale(1.18)}100%{filter:none;transform:scale(1)}}
@keyframes lvUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes lvRowLit{0%,100%{box-shadow:0 0 0 rgba(34,197,94,0)}50%{box-shadow:0 0 24px rgba(34,197,94,.7)}}
@keyframes lvCaret{50%{opacity:0}}
@keyframes lvTrace{from{transform:translateX(-80px)}to{transform:translateX(1400px)}}
@keyframes lvBurst{0%{transform:scale(.2) rotate(0);opacity:0}30%{opacity:1}100%{transform:scale(1.4) rotate(40deg);opacity:0}}
@keyframes lvPulseDot{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.6)}50%{box-shadow:0 0 0 8px rgba(16,185,129,0)}}
.lv-rm *{animation:none!important;transition:none!important}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
a{color:#00d4ff}a:hover{color:#67e8f9}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
if(!document.querySelector('link[data-lv-fonts]')){const l=document.createElement('link');l.rel='stylesheet';l.dataset.lvFonts='1';l.href='https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap';document.head.appendChild(l);}

const TRACKS={
 menu:{bpm:72,arp:[440,523,659,784,659,523,440,392],t:'triangle',pad:[220,262,330],len:.55},
 map:{bpm:108,arp:[523,659,784,659,587,698,880,698],t:'square',hat:1,bass:[131,131,175,147],len:.14},
 valley:{bpm:80,arp:[523,0,0,0,784,0,0,0],t:'sine',pad:[262,392],len:.4},
 nexus:{bpm:100,arp:[330,392,494,330,392,494,587,494,392],t:'square',len:.1,bass:[82,82,98,110]},
 gardens:{bpm:88,arp:[392,0,494,587,0,494,659,587],t:'sine',pad:[196,247,294],len:.18,marimba:1},
 gardensThin:{bpm:88,arp:[392,0,0,587,0,0,659,0],t:'sine',len:.18},
 library:{bpm:70,arp:[349,0,440,0,523,0,440,659],t:'triangle',pad:[175,220,262],crackle:1,len:.35},
 caverns:{bpm:64,arp:[1318,0,0,988,0,1175,0,0],t:'sine',pad:[220,330],len:1.3,drip:1},
 foundry:{bpm:116,arp:[196,0,196,233,0,196,262,0],t:'square',hat:1,clank:1,len:.12},
 memory:{bpm:96,arp:[440,0,440,0,523,0,440,0],t:'sine',tick:1,pad:[220,277,330],len:.2}
};
const L={ctx:null,muted:false,mv:.5,sv:.8,track:'',subs:new Set(),
 rm(){return document.documentElement.classList.contains('lv-rm')||matchMedia('(prefers-reduced-motion: reduce)').matches},
 notify(){this.subs.forEach(f=>{try{f(this)}catch(e){}})},
 sub(f){this.subs.add(f);return()=>this.subs.delete(f)},
 init(){
  if(this.ctx){this.ctx.resume();return this.ctx}
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
  const c=new C();this.ctx=c;
  this.out=c.createGain();this.out.connect(c.destination);
  this.sfxB=c.createGain();this.sfxB.connect(this.out);
  this.dk=c.createGain();this.dk.connect(this.out);
  this.musB=c.createGain();this.musB.connect(this.dk);
  const nb=c.createBuffer(1,c.sampleRate,c.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;this.nb=nb;
  this.vol();this.notify();return c;
 },
 vol(){if(!this.ctx)return;const t=this.ctx.currentTime;this.out.gain.setTargetAtTime(this.muted?0:1,t,.03);this.sfxB.gain.setTargetAtTime(this.sv*.7,t,.03);this.musB.gain.setTargetAtTime(this.seq?this.mv*.4:0,t,.08)},
 setMv(v){this.mv=v;this.vol();this.notify()},
 setSv(v){this.sv=v;this.vol();this.notify()},
 toggleMute(){if(!this.ctx){this.init();this.play('menu');return}this.muted=!this.muted;this.vol();this.notify()},
 wake(){if(!this.ctx){this.init();this.play('menu')}},
 tone(f,d,o={}){const c=this.ctx;if(!c)return;const t=c.currentTime+(o.at||0),os=c.createOscillator(),g=c.createGain();os.type=o.type||'sine';os.frequency.setValueAtTime(f,t);if(o.to)os.frequency.exponentialRampToValueAtTime(o.to,t+d);const v=o.vol==null?.2:o.vol;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+(o.atk||.005));g.gain.exponentialRampToValueAtTime(.0001,t+d);os.connect(g);g.connect(o.bus||this.sfxB);os.start(t);os.stop(t+d+.05)},
 noise(d,o={}){const c=this.ctx;if(!c)return;const t=c.currentTime+(o.at||0),s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=this.nb;f.type=o.f||'bandpass';f.frequency.value=o.freq||2000;f.Q.value=o.q||1;const v=o.vol==null?.2:o.vol;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+(o.atk||.003));g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(g);g.connect(o.bus||this.sfxB);s.start(t,Math.random()*.5,d+.05)},
 duck(on){if(this.ctx)this.dk.gain.setTargetAtTime(on?.35:1,this.ctx.currentTime,.12)},
 play(k){
  const c=this.init();if(!c)return;const T=TRACKS[k];if(!T)return;
  const go=()=>{clearInterval(this.seq);let i=0;const ms=60000/T.bpm/2,M={bus:this.musB};
   const step=()=>{const f=T.arp[i%T.arp.length];
    if(f)this.tone(f,T.len,{...M,type:T.t,vol:T.t==='square'?.04:.09});
    if(T.marimba&&f)this.tone(f*2,.08,{...M,type:'triangle',vol:.03});
    if(T.bass&&i%2===0)this.tone(T.bass[(i/2|0)%T.bass.length],.22,{...M,type:'triangle',vol:.12});
    if(T.hat&&i%2===1)this.noise(.03,{...M,freq:8000,f:'highpass',vol:.05});
    if(T.clank&&i%4===2)this.noise(.09,{...M,freq:2600,q:8,vol:.14});
    if(T.tick&&i%2===0)this.tone(3200,.015,{...M,type:'square',vol:.03});
    if(T.drip&&Math.random()<.18)this.tone(1800+Math.random()*900,.12,{...M,vol:.05,to:900});
    if(T.crackle)for(let j=0;j<3;j++)if(Math.random()<.4)this.noise(.006,{...M,freq:4500,vol:.06,at:Math.random()*ms/1000});
    if(T.pad&&i%16===0)T.pad.forEach(p=>this.tone(p,ms*16/1000,{...M,vol:.04,atk:.9}));
    i++;};
   this.seq=setInterval(step,ms);step();this.track=k;this.musB.gain.cancelScheduledValues(c.currentTime);this.musB.gain.setTargetAtTime(this.mv*.4,c.currentTime,.25);this.notify();};
  if(this.seq){this.musB.gain.setTargetAtTime(0,c.currentTime,.15);clearTimeout(this.xf);this.xf=setTimeout(go,500)}else go();
 },
 stop(){clearInterval(this.seq);this.seq=null;this.track='';this.vol();this.notify()},
 enter(k){if(this.seq&&this.track!==k)this.play(k)},
 type(text,mood,onStep){let n=0;const self=this;if(this.rm()){onStep(text.length,true);return()=>{}}this.duck(true);const iv=setInterval(()=>{n++;if(n%3===0)self.S.blip(mood);const done=n>=text.length;onStep(n,done);if(done){clearInterval(iv);self.duck(false)}},26);return()=>{clearInterval(iv);self.duck(false)}}
};
const T=(...a)=>L.tone(...a),N=(...a)=>L.noise(...a);
L.S={
 hover:()=>T(2200,.025,{type:'square',vol:.02}),
 click:()=>{T(720,.06,{type:'triangle',vol:.18});T(1440,.04,{type:'square',vol:.035,at:.012})},
 toggle:on=>{N(.015,{freq:4000,vol:.2});T(on?880:520,.07,{type:'square',vol:.06,at:.01})},
 page:()=>N(.24,{freq:1600,vol:.16,atk:.07}),
 flip:v=>{N(.025,{freq:3800,vol:.28});T(v===1?1046:v===0?523:330,.07,{type:'triangle',vol:.14,at:.012})},
 snap:()=>{N(.02,{freq:5200,vol:.3});T(1800,.04,{type:'square',vol:.05})},
 unsnap:()=>T(900,.1,{type:'triangle',vol:.1,to:280}),
 place:()=>{T(180,.14,{vol:.28,to:90});N(.05,{freq:1200,vol:.15})},
 chime:()=>[784,988,1175,1568].forEach((f,i)=>T(f,.9,{vol:.12,at:i*.07})),
 buzz:()=>{T(110,.26,{type:'sawtooth',vol:.11,to:70});N(.2,{freq:900,q:.6,vol:.18});N(.05,{freq:5000,vol:.12,at:.12})},
 ding:()=>{T(1568,1.1,{vol:.13});T(2349,.7,{vol:.05})},
 star:n=>{const b=[659,784,988][n]||659;T(b,.55,{type:'triangle',vol:.15});T(b*2,.35,{vol:.06,at:.04});T(b*1.5,.3,{vol:.05,at:.08})},
 xp:()=>T(2500+Math.random()*400,.02,{type:'square',vol:.025}),
 levelUp:()=>{[523,659,784,1046,1318].forEach((f,i)=>T(f,i===4?1.4:.4,{type:'square',vol:.06,at:i*.09}));[262,330,392].forEach(f=>T(f,1.6,{type:'triangle',vol:.06,at:.45,atk:.05}))},
 achieve:()=>[1046,1318,1568,2093].forEach((f,i)=>T(f,.6,{type:'triangle',vol:.1,at:i*.06})),
 powerOn:()=>{T(70,1.1,{type:'sawtooth',vol:.08,to:900,atk:.3});N(1,{freq:600,vol:.1,atk:.4});T(1318,1.2,{vol:.1,at:.95})},
 swell:()=>[262,330,392,523].forEach(f=>T(f,2.2,{type:'triangle',vol:.05,atk:.9})),
 hop:()=>{T(420,.1,{type:'square',vol:.05,to:840});T(620,.08,{type:'square',vol:.04,at:.55})},
 blip:m=>{const b={idle:520,happy:660,excited:780,curious:600,confused:380,thinking:460,celebrate:880}[m]||560;T(b*(.85+Math.random()*.4),.04,{type:'square',vol:.03})}
};
window.LVA=L;
document.addEventListener('pointerdown',()=>L.wake(),{once:true,capture:true});
})();
