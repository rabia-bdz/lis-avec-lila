/* Lis avec Lila – jeux sur les histoires (moteur commun) */
(function(){
const D=window.STORY;
const $=s=>document.querySelector(s);
const main=$('#main'),bubble=$('#bubble'),lila=$('#lila');
let level=1,score=0,audio=null,cur=null;
const ROUNDS=5;
const EMO={content:['😊','content'],rit:['😂','rit'],triste:['😢','triste'],peur:['😨','a peur'],fatigue:['😴','fatigué'],surpris:['😮','surpris'],froid:['🥶','a froid']};
const GAMES={
 ordre:{t:"Remets l'histoire dans l'ordre",s:"Qu'est-ce qui arrive en premier ?",ic:'🔢',img:D.order[0]},
 qui:{t:'Qui est-ce ?',s:'Qui a dit ça ? Qui fait ça ?',ic:'💬',img:D.thumbs.qui},
 vf:{t:'Vrai ou faux ?',s:"C'est dans l'histoire ?",ic:'👍',img:D.thumbs.vf},
 emo:{t:'Comment il se sent ?',s:'Content, triste, peur…',ic:'😊',img:D.thumbs.emo},
 trouve:{t:'Cherche et trouve',s:"Touche l'image au bon endroit",ic:'🔍',img:D.thumbs.trouve},
 manque:{t:'Le mot qui manque',s:'Complète la phrase',ic:'✏️',img:D.thumbs.manque}
};
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const sc=n=>`img/s${String(n).padStart(2,'0')}.jpg`;
function play(src){try{if(audio){audio.pause()}if(!src)return;audio=new Audio(src);audio.play().catch(()=>{})}catch(e){}}
function say(t,src,mood){bubble.textContent=t;lila.className='lila '+(mood||'talk');void lila.offsetWidth;play(src)}
function star(){score++;$('#score').textContent=score}
function party(){const p=$('#party');const c=['#1DB584','#FFC83D','#FF7A2F','#4F8DF7',D.col[1]];for(let i=0;i<60;i++){const s=document.createElement('span');s.style.left=Math.random()*100+'%';s.style.background=c[i%c.length];s.style.animationDelay=Math.random()*.6+'s';p.appendChild(s)}setTimeout(()=>p.innerHTML='',3500)}
const P=(k)=>`../snd/${k}.mp3`;      // phrases communes de Lila
const S=(k)=>`snd/${k}.mp3`;         // phrases de l'histoire
const good=()=>{star();play(D.bravo)};
const bad=()=>{play(D.presque);lila.className='lila sad'};

/* --------- accueil de l'histoire --------- */
function home(){
 cur=null;
 say(`Coucou ! On joue avec l'histoire ?`,P('q_accueil'));
 main.innerHTML=`<section class="hst"><img src="img/couv.jpg" alt="">
  <div><small>Le son ${D.letter}</small><h1>${D.title}</h1>
  <p>Écoute l'histoire, puis joue avec Lila !</p>
  <div class="cast">${D.chars.map(c=>`<button data-c="${c}"><img src="img/p_${c}.jpg" alt=""><span>${D.names[c][0]}</span></button>`).join('')}</div>
  ${D.video?`<a class="yt" href="${D.video}" target="_blank" rel="noopener"><i>▶</i>Regarder l'histoire</a>`:''}</div></section>
  <h2 class="t">Les jeux de l'histoire</h2>
  <div class="menu">${Object.entries(GAMES).map(([k,g])=>`<button class="mbtn" data-g="${k}"><div class="th"><img src="${sc(g.img)}" alt=""><div class="ic">${g.ic}</div></div><b>${g.t}</b><span>${g.s}</span></button>`).join('')}</div>`;
 main.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{const c=b.dataset.c;say(`Voici ${D.names[c][1]} !`,D.names[c][2])});
 main.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>start(b.dataset.g));
 window.scrollTo(0,0);
}
function start(g){cur={g,i:0,list:null};window.scrollTo(0,0);NEXT[g](true)}
function frame(inner){
 const g=GAMES[cur.g];
 main.innerHTML=`<div class="panel"><div class="gtitle">${g.ic} ${g.t}</div>${inner}<div class="prog">${Array.from({length:cur.n},(_,i)=>`<i class="${i<cur.i?'ok':''}"></i>`).join('')}</div></div>`;
}
function advance(delay){
 setTimeout(()=>{cur.i++;if(cur.i>=cur.n)return end();NEXT[cur.g](false)},delay||1300);
}
function end(){
 party();say('Bravo ! Tu connais bien l\'histoire !',D.fini,'happy');
 main.innerHTML=`<div class="panel end"><img src="${D.lilaBravo}" alt=""><div><h2>Bravo !</h2><p>Tu as gagné des étoiles. On rejoue ?</p>
 <div class="row"><button class="btn b1" id="again">↻ Encore</button><button class="btn b2" id="other">▦ Autres jeux</button></div></div></div>`;
 $('#again').onclick=()=>start(cur.g);$('#other').onclick=home;
}
function pick(arr,n){return shuf(arr).slice(0,n)}
function lvlItems(a){return a.filter(x=>!x.l||x.l===level)}

/* --------- 1. remettre dans l'ordre --------- */
function ordre(first){
 const N=level===1?3:5;
 if(first){cur.n=3;cur.i=0;say("Touche les images dans l'ordre de l'histoire.",P('q_ordre'))}
 // choisir N scènes bien réparties
 const o=D.order;let ids;
 do{ids=pick(o,N).sort((a,b)=>a-b)}while(N===3&&ids[2]-ids[0]<3);
 let k=0;
 frame(`<div class="slots">${ids.map((_,i)=>`<div class="slot" data-s="${i}">${i+1}</div>`).join('')}</div>
  <div class="pile">${shuf(ids).map(s=>`<button class="pc" data-x="${s}"><img src="${sc(s)}" alt=""></button>`).join('')}</div>`);
 main.querySelectorAll('.pc').forEach(b=>b.onclick=()=>{
  const s=+b.dataset.x;
  if(s===ids[k]){const sl=main.querySelector(`[data-s="${k}"]`);sl.innerHTML=`<img src="${sc(s)}" alt=""><em>${k+1}</em>`;sl.classList.add('fill');b.classList.add('used');k++;
    if(D.scene[s])say(D.scene[s],S('s'+s));
    if(k===N){good();say('Bravo ! C\'est le bon ordre !',null,'happy');advance(2200)}}
  else{b.classList.remove('bad');void b.offsetWidth;b.classList.add('bad');bad();say('Regarde bien : qu\'est-ce qui arrive avant ?')}
 });
}
/* --------- 2. qui est-ce --------- */
function qui(first){
 if(first){cur.list=pick(D.qui,ROUNDS);cur.n=cur.list.length;say('Écoute bien. Qui est-ce ?',P('q_qui'))}
 const it=cur.list[cur.i];
 const others=shuf(D.chars.filter(c=>c!==it.who&&(!it.not||!it.not.includes(c)))).slice(0,level===1?1:2);
 frame(`<div class="sent"><span class="quote">${it.t}</span></div><button class="say" id="say">🔊 Écouter</button>
  <div class="opts">${shuf([it.who,...others]).map(c=>`<button class="opt" data-c="${c}"><img src="img/p_${c}.jpg" alt=""><b>${D.names[c][0]}</b></button>`).join('')}</div>`);
 const rd=()=>play(S(it.id));rd();$('#say').onclick=rd;
 main.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
  if(b.dataset.c===it.who){b.classList.add('good');good();say(`Oui ! C'est ${D.names[it.who][1]} !`,null,'happy');advance()}
  else{b.classList.remove('bad');void b.offsetWidth;b.classList.add('bad');bad();say('Non, essaie encore !')}
 });
}
/* --------- 3. vrai ou faux --------- */
function vf(first){
 if(first){cur.list=pick(D.vf,ROUNDS);cur.n=cur.list.length;say('Écoute bien. C\'est vrai ou faux ?',P('q_vf'))}
 const it=cur.list[cur.i];
 frame(`<div class="sent">${it.t}</div><button class="say" id="say">🔊 Écouter</button>
  ${level===1?`<img class="scene sm" src="${sc(it.s)}" alt="">`:''}
  <div class="vf"><button class="v" data-a="1"><span>👍</span>Vrai</button><button class="f" data-a="0"><span>👎</span>Faux</button></div>`);
 const rd=()=>play(S(it.id));rd();$('#say').onclick=rd;
 main.querySelectorAll('.vf button').forEach(b=>b.onclick=()=>{
  if((b.dataset.a==='1')===it.v){b.classList.add('good');good();say(it.v?'Oui, c\'est vrai !':'Oui, c\'est faux ! '+(it.fix||''),null,'happy');advance(it.fix?2600:1400)}
  else{b.classList.remove('bad');void b.offsetWidth;b.classList.add('bad');bad();say('Hum… regarde encore l\'histoire.')}
 });
}
/* --------- 4. émotions --------- */
function emo(first){
 if(first){cur.list=pick(D.emo,ROUNDS);cur.n=cur.list.length;say('Regarde bien son visage. Comment il se sent ?',P('q_emo'))}
 const it=cur.list[cur.i];
 const others=shuf(Object.keys(EMO).filter(e=>e!==it.e&&!(it.not||[]).includes(e))).slice(0,level===1?1:3);
 frame(`<div class="sent">${it.q}</div><img class="scene sm" src="${sc(it.s)}" alt="">
  <div class="opts">${shuf([it.e,...others]).map(e=>`<button class="opt" data-e="${e}"><span class="em">${EMO[e][0]}</span><b>${EMO[e][1]}</b></button>`).join('')}</div>`);

 main.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
  if(b.dataset.e===it.e){b.classList.add('good');good();say(it.a,null,'happy');advance(2000)}
  else{b.classList.remove('bad');void b.offsetWidth;b.classList.add('bad');bad();say('Regarde ses yeux et sa bouche.')}
 });
}
/* --------- 5. cherche et trouve --------- */
function trouve(first){
 if(first){cur.list=shuf(lvlItems(D.trouve)).slice(0,ROUNDS);cur.n=cur.list.length;say('Cherche bien dans l\'image et touche !',P('q_trouve'))}
 const it=cur.list[cur.i];
 frame(`<div class="sent">Trouve ${it.t} !</div><button class="say" id="say">🔊 Écouter</button><div class="find" id="find"><img src="${sc(it.s)}" alt=""></div>`);
 const fk='f_'+it.t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z]/g,'_');
 const rd=()=>play(S(fk));setTimeout(rd,cur.i===0?2600:0);$('#say').onclick=rd;

 let done=false;
 $('#find').onclick=e=>{
  if(done)return;const r=e.currentTarget.getBoundingClientRect();const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  const hit=it.z.find(([zx,zy,zr])=>Math.hypot(x-zx,y-zy)<=zr+.04);
  if(hit){done=true;const g=document.createElement('div');g.className='ring';g.style.left=hit[0]*100+'%';g.style.top=hit[1]*100+'%';g.style.width=g.style.height=hit[2]*200+'%';g.style.height=hit[2]*2*r.width+'px';g.style.width=hit[2]*2*r.width+'px';e.currentTarget.appendChild(g);good();say('Bravo, tu l\'as trouvé !',null,'happy');advance(1600)}
  else{const m=document.createElement('div');m.className='miss';m.textContent='❓';m.style.left=x*100+'%';m.style.top=y*100+'%';e.currentTarget.appendChild(m);setTimeout(()=>m.remove(),1000);bad();say('Pas ici… cherche encore !')}
 };
}
/* --------- 6. le mot qui manque --------- */
function manque(first){
 if(first){cur.list=pick(D.manque,ROUNDS);cur.n=cur.list.length;say('Lis la phrase. Quel mot manque ?',P('q_manque'))}
 const it=cur.list[cur.i];
 const words=shuf([it.ok,...(level===1?it.f.slice(0,1):it.f.slice(0,2))]);
 const card=w=>{
  if(level===2)return `<button class="opt word" data-w="${w}"><b>${w}</b></button>`;
  const pic=D.chars.includes(D.key[w]||w)?`<img src="img/p_${D.key[w]||w}.jpg" alt="">`:(D.colors[w]?`<span class="sw" style="background:${D.colors[w]}"></span>`:(D.icons[w]?`<span class="em">${D.icons[w]}</span>`:''));
  return `<button class="opt" data-w="${w}">${pic}<b>${w}</b></button>`};
 frame(`<div class="sent">${it.a}<span class="gap" id="gap">${it.ok}</span>${it.b}</div>
  ${level===1?`<img class="scene sm" src="${sc(it.s)}" alt="">`:''}
  <div class="opts">${words.map(card).join('')}</div>`);
 main.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
  if(b.dataset.w===it.ok){b.classList.add('good');$('#gap').classList.add('ok');good();say(it.a+it.ok+it.b,S(it.id),'happy');advance(2600)}
  else{b.classList.remove('bad');void b.offsetWidth;b.classList.add('bad');bad();say('Non, essaie un autre mot.')}
 });
}
const NEXT={ordre,qui,vf,emo,trouve,manque};

/* --------- en-tête --------- */
$('#l1').onclick=()=>{level=1;$('#l1').classList.add('on');$('#l2').classList.remove('on');cur?start(cur.g):0};
$('#l2').onclick=()=>{level=2;$('#l2').classList.add('on');$('#l1').classList.remove('on');cur?start(cur.g):0};
$('#games').onclick=e=>{e.preventDefault();home()};
lila.onclick=()=>say(bubble.textContent,null);
home();
})();
