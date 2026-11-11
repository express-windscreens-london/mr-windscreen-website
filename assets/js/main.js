(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s);}, $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s));};
var IMG='assets/img/photos/';

/* theme */
(function(){
  var root=document.documentElement, btn=$('.theme-toggle'); if(!btn) return;
  function apply(t){ var d=t==='dark'; root.setAttribute('data-theme',d?'dark':'light'); btn.setAttribute('aria-pressed',d?'true':'false'); btn.setAttribute('aria-label',d?'Switch to light version':'Switch to dark version'); btn.title=btn.getAttribute('aria-label'); }
  btn.addEventListener('click',function(){ var n=root.getAttribute('data-theme')==='dark'?'light':'dark'; apply(n); try{localStorage.setItem('mrw-theme',n);}catch(e){} });
  apply(root.getAttribute('data-theme')==='dark'?'dark':'light');
})();

/* header, progress, menu */
(function(){
  var hdr=$('#hdr'), bar=$('#progress'), tog=$('.nav-toggle'); if(!hdr) return;
  function onScroll(){ var y=window.pageYOffset, h=document.documentElement.scrollHeight-window.innerHeight; hdr.classList.toggle('scrolled',y>20); if(bar) bar.style.width=(h>0?y/h*100:0)+'%'; }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
  if(tog) tog.addEventListener('click',function(){ var o=hdr.classList.toggle('menu-open'); tog.setAttribute('aria-expanded',o?'true':'false'); });
  var tt=$('#toTop'); if(tt) tt.addEventListener('click',function(){ window.scrollTo({top:0,behavior:'smooth'}); });
})();

/* reveal */
(function(){
  var els=$$('.reveal, .steps');
  if(!('IntersectionObserver' in window)){ els.forEach(function(e){e.classList.add('in');}); return; }
  var io=new IntersectionObserver(function(en){ en.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add('in'); io.unobserve(x.target); } }); },{threshold:.1,rootMargin:'0px 0px -4% 0px'});
  els.forEach(function(e){io.observe(e);});
  setTimeout(function(){ $$('.reveal:not(.in)').forEach(function(e){ var r=e.getBoundingClientRect(); if(r.top<innerHeight) e.classList.add('in'); }); },1200);
})();

/* tilt */
(function(){
  if(!window.matchMedia('(hover:hover)').matches) return;
  $$('.svc').forEach(function(c){
    c.addEventListener('pointermove',function(e){ var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height; c.style.setProperty('--ry',((x-.5)*8)+'deg'); c.style.setProperty('--rx',((.5-y)*8)+'deg'); c.style.setProperty('--mx',x*100+'%'); c.style.setProperty('--my',y*100+'%'); });
    c.addEventListener('pointerleave',function(){ c.style.setProperty('--ry','0deg'); c.style.setProperty('--rx','0deg'); });
  });
  var hero=$('.hero'), frame=$('.ws-frame'); if(!hero||!frame) return;
  hero.addEventListener('pointermove',function(e){ var r=hero.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5; frame.style.setProperty('--ry',(-7+x*9)+'deg'); frame.style.setProperty('--rx',(3-y*7)+'deg'); });
  hero.addEventListener('pointerleave',function(){ frame.style.setProperty('--ry','-7deg'); frame.style.setProperty('--rx','3deg'); });
})();

/* hero slider: slides left every 2 seconds; swipe or drag with a finger to change photo */
(function(){
  var track=$('.ws-track'); if(!track) return;
  var INTERVAL=2000,SLIDE=600,busy=false,timer;
  function dist(){ return track.children[1].offsetLeft-track.children[0].offsetLeft; }
  function next(){
    if(busy||track.children.length<3) return; var first=track.children[0],d=dist(); busy=true;
    track.style.transition='transform '+SLIDE+'ms ease-in-out'; track.style.transform='translateX('+(-d)+'px)';
    setTimeout(function(){ track.style.transition='none'; track.appendChild(first); track.style.transform='translateX(0)'; void track.offsetWidth; busy=false; },SLIDE+30);
  }
  function prev(){
    if(busy||track.children.length<3) return; var last=track.children[track.children.length-1]; busy=true;
    track.style.transition='none'; track.insertBefore(last,track.children[0]); var d=dist();
    track.style.transform='translateX('+(-d)+'px)'; void track.offsetWidth;
    track.style.transition='transform '+SLIDE+'ms ease-in-out'; track.style.transform='translateX(0)';
    setTimeout(function(){ track.style.transition='none'; busy=false; },SLIDE+30);
  }
  function start(){ clearInterval(timer); timer=setInterval(function(){ if(!document.hidden) next(); },INTERVAL); }
  start();
  var box=$('.ws-glass'), x0=null, y0=null;
  box.style.touchAction='pan-y';
  function down(x,y){ x0=x; y0=y; }
  function up(x,y){ if(x0===null) return; var dx=x-x0,dy=y-y0; x0=null; if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)){ if(dx<0) next(); else prev(); start(); } }
  box.addEventListener('touchstart',function(e){ down(e.touches[0].clientX,e.touches[0].clientY); },{passive:true});
  box.addEventListener('touchend',function(e){ up(e.changedTouches[0].clientX,e.changedTouches[0].clientY); },{passive:true});
  box.addEventListener('mousedown',function(e){ down(e.clientX,e.clientY); e.preventDefault(); });
  window.addEventListener('mouseup',function(e){ up(e.clientX,e.clientY); });
})();

/* drifting rows that you can also swipe (touch) or drag (mouse) */
function drift(rail,track,n,speed,reverse){
  rail.classList.add('swipe'); var pos=0,last=0,userAt=0,hover=false,half=0;
  function calc(){ half=track.children[n]?track.children[n].offsetLeft-track.children[0].offsetLeft:track.scrollWidth/2; }
  function touched(){ userAt=Date.now(); }
  ['touchstart','touchmove','wheel','pointerdown'].forEach(function(ev){ rail.addEventListener(ev,touched,{passive:true}); });
  rail.addEventListener('mouseenter',function(){ hover=true; }); rail.addEventListener('mouseleave',function(){ hover=false; drag=false; });
  var drag=false,dx0=0,sl0=0;
  rail.addEventListener('mousedown',function(e){ drag=true; dx0=e.clientX; sl0=rail.scrollLeft; rail.classList.add('dragging'); });
  window.addEventListener('mouseup',function(){ drag=false; rail.classList.remove('dragging'); });
  rail.addEventListener('mousemove',function(e){ if(drag){ rail.scrollLeft=sl0-(e.clientX-dx0); touched(); } });
  rail.addEventListener('dragstart',function(e){ e.preventDefault(); });
  function wrap(){ if(!half) calc(); if(!half) return; if(rail.scrollLeft>=half) rail.scrollLeft-=half; else if(rail.scrollLeft<=0) rail.scrollLeft+=half; }
  rail.addEventListener('scroll',function(){ if(Date.now()-userAt<1500) wrap(); },{passive:true});
  function frame(t){
    var dt=Math.min(.05,(t-last)/1000||0); last=t;
    if(!half) calc();
    if(half){
      if(reverse && !rail.__init){ rail.scrollLeft=half; rail.__init=1; pos=half; }
      var idle=Date.now()-userAt>1500 && !hover && !drag && !document.hidden;
      if(idle){ pos=(pos===0&&!rail.__s)?rail.scrollLeft:pos; if(Math.abs(pos-rail.scrollLeft)>2) pos=rail.scrollLeft; pos+=(reverse?-1:1)*speed*dt; if(pos>=half) pos-=half; if(pos<=0) pos+=half; rail.scrollLeft=pos; rail.__s=1; }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* gallery items from PHOTOS */
function galItem(p,seq){
  var n=('0'+p[0]).slice(-2);
  return '<button class="gal-item" type="button" data-id="'+p[0]+'" data-cat="'+p[1]+'" data-seq="'+seq+'" aria-label="Open photo: '+p[2].replace(/"/g,'')+'"><img src="'+IMG+'thumb/'+n+'.jpg" alt="'+p[2].replace(/"/g,'')+'" width="360" height="480" loading="lazy" decoding="async"></button>';
}
$$('[data-photos]').forEach(function(box){
  var P=window.PHOTOS||[], mode=box.getAttribute('data-photos'); var html='';
  if(mode==='rails'){
    var half=Math.ceil(P.length/2);
    [P.slice(0,half),P.slice(half)].forEach(function(arr,i){ html+='<div class="rail'+(i?' rev':'')+'"><div class="rail-track">'+arr.map(function(p){return galItem(p,P.indexOf(p));}).join('')+'</div></div>'; });
  } else { html=P.map(function(p,i){return galItem(p,i);}).join(''); }
  box.innerHTML=html;
});

/* rails */
$$('.rail').forEach(function(r){
  var track=r.querySelector('.rail-track'),kids=[].slice.call(track.children),n=kids.length;
  kids.forEach(function(k){ var c=k.cloneNode(true); c.setAttribute('data-clone','1'); c.setAttribute('aria-hidden','true'); c.tabIndex=-1; track.appendChild(c); });
  drift(r,track,n,38,r.classList.contains('rev'));
});

/* filters (gallery page) */
(function(){
  var chips=$$('.chip'); if(!chips.length) return;
  chips.forEach(function(c){ c.addEventListener('click',function(){
    chips.forEach(function(x){ x.classList.toggle('on',x===c); x.setAttribute('aria-pressed',x===c?'true':'false'); });
    var f=c.getAttribute('data-f'), n=0;
    $$('.gal-grid .gal-item').forEach(function(b){ var show=f==='all'||b.dataset.cat===f; b.hidden=!show; if(show) n++; });
    var cnt=$('#galCount'); if(cnt) cnt.textContent=n+' photos';
  }); });
})();

/* lightbox */
(function(){
  var lb=$('#lightbox'); if(!lb) return;
  var img=lb.querySelector('.lb-img'),count=lb.querySelector('.lb-count'),list=[],cur=0,lastFocus=null,startX=null;
  function collect(from){ var scope=from.closest('[data-photos]')||document; list=$$('.gal-item:not([data-clone])',scope).filter(function(b){return !b.hidden;}); list.sort(function(a,b){return a.dataset.seq-b.dataset.seq;}); }
  function show(i){ cur=(i+list.length)%list.length; var b=list[cur],t=b.querySelector('img'),n=('0'+b.dataset.id).slice(-2);
    img.style.animation='none'; void img.offsetWidth; img.style.animation=''; img.src=IMG+'full/'+n+'.jpg'; img.alt=t.alt; count.textContent=(cur+1)+' / '+list.length; }
  function open(b){ collect(b); cur=list.indexOf(b); if(cur<0){ list=[b]; cur=0; } lastFocus=document.activeElement; show(cur); lb.hidden=false; lb.classList.add('open'); document.body.style.overflow='hidden'; lb.querySelector('.lb-close').focus(); }
  function close(){ lb.classList.remove('open'); lb.hidden=true; document.body.style.overflow=''; img.removeAttribute('src'); if(lastFocus) lastFocus.focus(); }
  document.addEventListener('click',function(e){ var b=e.target.closest&&e.target.closest('.gal-item'); if(b) open(b); });
  lb.querySelector('.lb-close').addEventListener('click',close);
  lb.querySelector('.lb-prev').addEventListener('click',function(){show(cur-1);});
  lb.querySelector('.lb-next').addEventListener('click',function(){show(cur+1);});
  lb.addEventListener('click',function(e){ if(e.target===lb) close(); });
  document.addEventListener('keydown',function(e){ if(!lb.classList.contains('open')) return; if(e.key==='Escape') close(); else if(e.key==='ArrowLeft') show(cur-1); else if(e.key==='ArrowRight') show(cur+1); });
  lb.addEventListener('touchstart',function(e){startX=e.touches[0].clientX;},{passive:true});
  lb.addEventListener('touchend',function(e){ if(startX===null) return; var dx=e.changedTouches[0].clientX-startX; startX=null; if(Math.abs(dx)>50) show(cur+(dx<0?1:-1)); });
})();

/* Google reviews */
(function(){
  var R=window.REVIEWS||[]; if(!R.length) return;
  var G='<svg class="g-logo" viewBox="0 0 48 48" aria-label="Google"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
  var COL=['#1d5fc4','#2f7fe8','#0b6e8f','#5a4bc4','#c4501d','#188a5b','#a23b72','#3b6ea2'];
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function card(r,i){
    return '<article class="g-card"><div class="g-top"><span class="g-avatar" style="background:'+COL[i%COL.length]+'">'+esc(r.name.charAt(0).toUpperCase())+'</span><div class="g-who"><b>'+esc(r.name)+'</b><span>'+esc(r.meta||'')+'</span></div>'+G+'</div>'
      +'<div class="g-row"><span class="st" aria-label="5 out of 5 stars">★★★★★</span><span class="gl">'+(r.isNew?'<b style="color:#188a5b">NEW</b> · ':'')+esc(r.when||'')+'</span></div>'
      +'<p>'+esc(r.text)+'</p>'+(r.tag?'<span class="g-tag">'+esc(r.tag)+'</span>':'')+'</article>';
  }
  var track=$('#gTrack');
  if(track){
    var h=R.map(card).join(''); track.innerHTML=h+h; track.querySelectorAll('.g-card').forEach(function(c,i){ if(i>=R.length){ c.setAttribute('aria-hidden','true'); } });
    drift(track.parentNode,track,R.length,34,false);
  }
  var wall=$('#revWall'); if(wall) wall.innerHTML=R.map(card).join('');
})();

/* logo intro: once per visit, home page only */
(function(){
  var root=document.documentElement,sp=$('#splash'); if(!sp) return;
  if(!root.classList.contains('splash-on')){ sp.parentNode.removeChild(sp); return; }
  var done=false,timer;
  function finish(){ if(done) return; done=true; clearTimeout(timer); sp.classList.add('open'); root.classList.remove('hold'); setTimeout(function(){ root.classList.remove('splash-on'); if(sp.parentNode) sp.parentNode.removeChild(sp); },1100); }
  timer=setTimeout(finish,3500); sp.addEventListener('click',finish);
  try{ sessionStorage.setItem('mrw-intro','1'); }catch(e){}
})();

/* quote form -> opens an email draft */
(function(){
  var f=$('#quote-form'); if(!f) return;
  f.addEventListener('submit',function(e){ e.preventDefault();
    var v=function(n){ return (f.elements[n]&&f.elements[n].value||'').trim(); };
    var body='Name: '+v('name')+'\nPhone: '+v('phone')+'\nVehicle & reg: '+v('vehicle')+'\nDamage: '+v('damage')+'\n\n'+v('message');
    window.location.href='mailto:mrwindscreenlondon@gmail.com?subject='+encodeURIComponent('Quote request - '+(v('vehicle')||v('damage')))+'&body='+encodeURIComponent(body);
    var b=f.querySelector('.submit'); b.textContent='Opening your email app…';
  });
})();
})();
