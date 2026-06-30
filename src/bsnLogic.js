// bsnLogic.js
// The original BSN application logic, extracted verbatim from the bundled page.
// NOTE: All backend/API calls (bsnjavabackend.onrender.com, Razorpay, Google
// Calendar) are kept EXACTLY as in the original — do not change any API here.
//
// In the original page this class ran inside a tiny "dc-runtime" that mimicked a
// React component lifecycle. Here we provide the same lifecycle hooks and run it
// from BSNSite.jsx inside a useEffect, so behaviour is identical.

import * as THREE from 'three';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import SplitType from 'split-type';

// The original code looks these up as globals on `window`.
if (typeof window !== 'undefined') {
  window.THREE = window.THREE || THREE;
  window.gsap = window.gsap || gsap;
  window.ScrollTrigger = window.ScrollTrigger || ScrollTrigger;
  window.Lenis = window.Lenis || Lenis;
  window.SplitType = window.SplitType || SplitType;
}

// Minimal stand-in for the dc-runtime base class. The Component below only relies
// on the componentDidMount / componentWillUnmount lifecycle, which we drive
// manually from React.
class DCLogic {}

/* ===================== ORIGINAL APP LOGIC (verbatim) ===================== */
class Component extends DCLogic {
  componentDidMount() {
    // SINGLETON (newest wins): a prior instance can linger across reloads/double-mount.
    // Kill the old one's loops/Lenis, then ALWAYS initialize this one so the loader
    // runs and scroll unlocks — never block the mount (that was what locked scrolling).
    try {
      const prev = window.__bsnInst;
      if (prev && prev !== this) {
        prev._alive = false;
        if (prev._lenis && prev._lenis.destroy) prev._lenis.destroy();
        (prev._sts||[]).forEach(t=>{try{t.kill();}catch(e){}});
      }
    } catch(e) {}
    window.__bsnInst = this;
    this._alive = true;
    this.mxN = 0; this.myN = 0; this.scroll = 0;
    this._injectStyles();
    this._waitForLibs().then(() => {
      if (!this._alive) return;
      this.gsap = window.gsap; this.ST = window.ScrollTrigger;
      if (this.gsap && this.ST) this.gsap.registerPlugin(this.ST);
      [['_initGrain'],['_initCursor'],['_initLenis'],['_initReactor'],['_initTicker'],['_initScrollRig'],['_initReveals'],['_initManifesto'],['_initCycle'],['_initNav'],['_initInteractions'],['_initAuth'],['_initMerge'],['_restore']].forEach(([fn]) => { try { this[fn](); } catch(e){ console.warn(fn, e); } });
      try { this._runLoader(); } catch(e){ this._forceShow(); }
    });
  }
  componentWillUnmount() {
    if (window.__bsnInst === this) window.__bsnInst = null;
    this._alive = false;
    [this._raf,this._curRaf].forEach(r=>r&&cancelAnimationFrame(r));
    if (this._lenis&&this._lenis.destroy) this._lenis.destroy();
    (this._sts||[]).forEach(t=>{try{t.kill();}catch(e){}});
    (this._tweens||[]).forEach(t=>{try{t.scrollTrigger&&t.scrollTrigger.kill();t.kill();}catch(e){}});
    if (this._onResize) window.removeEventListener('resize', this._onResize);
    if (this._onDocClick) document.removeEventListener('click', this._onDocClick);
  }
  _ST(c){const t=this.ST.create(c);(this._sts=this._sts||[]).push(t);return t;}
  _track(t){(this._tweens=this._tweens||[]).push(t);return t;}
  _waitForLibs(){return new Promise((res)=>{const t0=Date.now();let last=null,stable=0;const c=()=>{if(!this._alive)return res();const ok=window.THREE&&window.gsap&&window.ScrollTrigger&&window.Lenis;if(ok){if(window.ScrollTrigger===last)stable++;else{stable=0;last=window.ScrollTrigger;}}if((ok&&stable>=4)||Date.now()-t0>9000)res();else setTimeout(c,70);};c();});}
  _id(i){return document.getElementById(i);}
  _qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}

  _injectStyles(){
    const css=".bsn-flabel{display:block;font-size:10px;letter-spacing:0.16em;color:rgba(234,241,236,0.4);margin-bottom:9px;margin-top:18px}.bsn-input{width:100%;padding:14px 0;background:transparent;border:none;border-bottom:1px solid rgba(234,241,236,0.18);color:#fff;font-size:15px;transition:border-color .3s}.bsn-input:focus{border-color:#2BCB86}.bsn-submit{width:100%;margin-top:32px;padding:16px;background:#2BCB86;color:#040506;border:none;font-family:'Space Mono';font-size:12px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700}.bsn-pbtn{width:100%;padding:12px;background:transparent;font-size:11px;letter-spacing:0.1em;text-transform:uppercase}.bsn-prow{transition:background .3s}.bsn-prow:hover{background:rgba(234,241,236,0.03)}";
    const s=document.createElement('style');s.textContent=css;document.head.appendChild(s);
  }
  _initGrain(){const n=this._id('bsn-grain');if(!n)return;const svg="<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>";n.style.backgroundImage="url(\"data:image/svg+xml,"+svg.replace(/#/g,'%23')+"\")";}

  /* CURSOR */
  _initCursor(){
    const disc=this._id('bsn-cur-disc');const label=this._id('bsn-cur-label');if(!disc)return;
    let mx=innerWidth/2,my=innerHeight/2,cx=mx,cy=my,lx=mx,ly=my;
    addEventListener('mousemove',(e)=>{mx=e.clientX;my=e.clientY;this.mxN=(e.clientX/innerWidth)-0.5;this.myN=(e.clientY/innerHeight)-0.5;});
    const loop=()=>{if(!this._alive)return;cx+=(mx-cx)*0.85;cy+=(my-cy)*0.85;lx+=(mx-lx)*0.18;ly+=(my-ly)*0.18;disc.style.transform='translate('+cx+'px,'+cy+'px)';label.style.transform='translate('+lx+'px,'+ly+'px)';this._curRaf=requestAnimationFrame(loop);};loop();
    const bind=()=>{this._qa('[data-cursor-label],a,button,input,[data-magnetic]').forEach(el=>{if(el._cb)return;el._cb=true;const txt=el.getAttribute('data-cursor-label');el.addEventListener('mouseenter',()=>{disc.style.width=txt?'46px':'38px';disc.style.height=txt?'46px':'38px';disc.style.left=(txt?-23:-19)+'px';disc.style.top=(txt?-23:-19)+'px';if(txt){label.textContent=txt;label.style.opacity='1';}});el.addEventListener('mouseleave',()=>{disc.style.width='12px';disc.style.height='12px';disc.style.left='-6px';disc.style.top='-6px';label.style.opacity='0';});});};
    bind();this._bindCursor=bind;
  }

  _initLenis(){
    if(!window.Lenis)return;
    try{if(window.__bsnLenis&&window.__bsnLenis.destroy)window.__bsnLenis.destroy();}catch(e){}
    const lenis=new window.Lenis({duration:1.2,lerp:0.08,smoothWheel:true});this._lenis=lenis;window.__bsnLenis=lenis;
    if(this.ST)lenis.on('scroll',()=>this.ST.update());
    const raf=(t)=>{if(!this._alive)return;try{lenis.raf(t);}catch(e){}requestAnimationFrame(raf);};requestAnimationFrame(raf);
    this._qa('a[href^="#"]').forEach(a=>{a.addEventListener('click',(e)=>{const id=a.getAttribute('href');if(id.length>1){const t=document.querySelector(id);if(t){e.preventDefault();lenis.scrollTo(t,{offset:id==='#top'?-400:-10});}}});});
    const pb=this._id('bsn-prog');lenis.on('scroll',()=>{const h=document.documentElement.scrollHeight-innerHeight;const p=h>0?scrollY/h:0;if(pb)pb.style.width=Math.min(100,p*100)+'%';});
  }

  /* ===== PERSISTENT WEBGL REACTOR ===== */
  _initReactor(){
    const THREE=window.THREE;const canvas=this._id('bsn-canvas');if(!THREE||!canvas)return;
    const W=()=>innerWidth,H=()=>innerHeight;
    const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setSize(W(),H());renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));this._renderer=renderer;
    const scene=new THREE.Scene();this._fog=new THREE.FogExp2(0x040506,0.018);scene.fog=this._fog;
    const camera=new THREE.PerspectiveCamera(52,W()/H(),0.1,600);this._cam=camera;
    const rig=new THREE.Group();scene.add(rig);

    // backdrop gradient sphere
    const bg=new THREE.Mesh(new THREE.SphereGeometry(300,32,32),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{cT:{value:new THREE.Color(0x081310)},cB:{value:new THREE.Color(0x020303)}},vertexShader:'varying float vy;void main(){vy=normalize(position).y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying float vy;uniform vec3 cT,cB;void main(){gl_FragColor=vec4(mix(cB,cT,smoothstep(-0.4,0.7,vy)),1.0);}'}));scene.add(bg);this._bgMat=bg.material;

    // sprite
    const tc=document.createElement('canvas');tc.width=tc.height=64;const tx=tc.getContext('2d');const gr=tx.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.35,'rgba(255,255,255,0.55)');gr.addColorStop(1,'rgba(255,255,255,0)');tx.fillStyle=gr;tx.fillRect(0,0,64,64);const spr=new THREE.CanvasTexture(tc);this._spr=spr;

    const core=new THREE.Group();rig.add(core);this._core=core;
    // crystal core
    const ico=new THREE.IcosahedronGeometry(4,1);
    const wire=new THREE.LineSegments(new THREE.WireframeGeometry(ico),new THREE.LineBasicMaterial({color:0x2BCB86,transparent:true,opacity:0.5}));core.add(wire);this._wire=wire;
    const solid=new THREE.Mesh(new THREE.IcosahedronGeometry(3.86,1),new THREE.MeshBasicMaterial({color:0x05140d,transparent:true,opacity:0.6}));core.add(solid);
    const cpts=new THREE.Points(new THREE.IcosahedronGeometry(4,1),new THREE.PointsMaterial({size:0.34,map:spr,color:0xbdffe2,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));core.add(cpts);
    // glow
    const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:spr,color:0x10b981,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0.6}));glow.scale.set(22,22,1);core.add(glow);this._glow=glow;

    // gimbal rings
    const rings=[];const rc=[0x2BCB86,0xbdffe2,0x0e8f63];
    for(let i=0;i<3;i++){const t=new THREE.Mesh(new THREE.TorusGeometry(7+i*1.6,0.045,8,180),new THREE.MeshBasicMaterial({color:rc[i],transparent:true,opacity:0.4,blending:THREE.AdditiveBlending,depthWrite:false}));t.rotation.x=Math.PI/2+(i-1)*0.55;t.rotation.y=i*0.5;rings.push(t);core.add(t);}
    this._rings=rings;

    // particle shells (the transforming matter)
    const N=4200;const base=new Float32Array(N*3);const col=new Float32Array(N*3);const rad=new Float32Array(N);
    const cA=new THREE.Color(0x2BCB86),cB=new THREE.Color(0xbdffe2),cC=new THREE.Color(0xD8BC86),tmp=new THREE.Color();
    for(let i=0;i<N;i++){const u=(i+0.5)/N;const inc=Math.acos(1-2*u);const az=Math.PI*(1+Math.sqrt(5))*i;const r=9+(i%3)*2.4+Math.random()*0.6;rad[i]=r;base[i*3]=r*Math.sin(inc)*Math.cos(az);base[i*3+1]=r*Math.cos(inc);base[i*3+2]=r*Math.sin(inc)*Math.sin(az);tmp.copy(cA).lerp(cB,(base[i*3+1]/14+0.5));if(Math.random()<0.06)tmp.copy(cC);col[i*3]=tmp.r;col[i*3+1]=tmp.g;col[i*3+2]=tmp.b;}
    const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(base),3));pg.setAttribute('color',new THREE.BufferAttribute(col,3));
    const shell=new THREE.Points(pg,new THREE.PointsMaterial({size:0.13,map:spr,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0.9}));rig.add(shell);
    this._shell=shell;this._base=base;this._N=N;this._rad=rad;this._grid=this._buildGrid(N);

    // far dust
    const DN=900;const dp=new Float32Array(DN*3);for(let i=0;i<DN;i++){const r=40+Math.random()*120;const a=Math.random()*6.28,b=Math.acos(2*Math.random()-1);dp[i*3]=r*Math.sin(b)*Math.cos(a);dp[i*3+1]=r*Math.cos(b);dp[i*3+2]=r*Math.sin(b)*Math.sin(a);}const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.BufferAttribute(dp,3));const dust=new THREE.Points(dg,new THREE.PointsMaterial({size:0.22,map:spr,color:0x2BCB86,transparent:true,opacity:0.5,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(dust);this._dust=dust;

    // DATA TUNNEL (streams along world Z)
    const TN=2400;const tun=new Float32Array(TN*3);const tcol=new Float32Array(TN*3);const tA=new THREE.Color(0x2BCB86),tB=new THREE.Color(0xbdffe2),tD=new THREE.Color(0x39a0ff);
    for(let i=0;i<TN;i++){const ang=Math.random()*Math.PI*2;const rr=4+Math.random()*16;tun[i*3]=Math.cos(ang)*rr;tun[i*3+1]=Math.sin(ang)*rr;tun[i*3+2]=-150+Math.random()*190;const m=Math.random();tmp.copy(tA).lerp(tB,m);if(Math.random()<0.18)tmp.lerp(tD,0.6);tcol[i*3]=tmp.r;tcol[i*3+1]=tmp.g;tcol[i*3+2]=tmp.b;}
    const tgeo=new THREE.BufferGeometry();tgeo.setAttribute('position',new THREE.BufferAttribute(tun,3));tgeo.setAttribute('color',new THREE.BufferAttribute(tcol,3));
    const tunnel=new THREE.Points(tgeo,new THREE.PointsMaterial({size:0.3,map:spr,vertexColors:true,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(tunnel);this._tunnel=tunnel;this._tun=tun;this._TN=TN;

    // EARTH (global network)
    const earth=new THREE.Group();earth.scale.setScalar(0.001);scene.add(earth);this._earth=earth;const ER=12;
    const EN=1600;const ep=new Float32Array(EN*3);const esurf=[];for(let i=0;i<EN;i++){const u=(i+0.5)/EN;const inc=Math.acos(1-2*u);const az=Math.PI*(1+Math.sqrt(5))*i;const x=ER*Math.sin(inc)*Math.cos(az),y=ER*Math.cos(inc),z=ER*Math.sin(inc)*Math.sin(az);ep[i*3]=x;ep[i*3+1]=y;ep[i*3+2]=z;if(i%11===0)esurf.push(new THREE.Vector3(x,y,z));}
    const egeo=new THREE.BufferGeometry();egeo.setAttribute('position',new THREE.BufferAttribute(ep,3));this._earthPts=new THREE.PointsMaterial({size:0.2,map:spr,color:0x2BCB86,transparent:true,opacity:0.9,depthWrite:false,blending:THREE.AdditiveBlending});earth.add(new THREE.Points(egeo,this._earthPts));
    this._earthCore=new THREE.MeshBasicMaterial({color:0x041a10,transparent:true,opacity:0.65});earth.add(new THREE.Mesh(new THREE.SphereGeometry(ER*0.96,32,32),this._earthCore));
    earth.add(new THREE.Mesh(new THREE.SphereGeometry(ER*1.18,32,32),new THREE.ShaderMaterial({transparent:true,blending:THREE.AdditiveBlending,side:THREE.BackSide,depthWrite:false,uniforms:{uColor:{value:new THREE.Color(0x2BCB86)}},vertexShader:'varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec3 vN;uniform vec3 uColor;void main(){float i=pow(0.62-dot(vN,vec3(0.,0.,1.)),2.6);gl_FragColor=vec4(uColor,1.)*i*0.9;}'})));
    const earcs=[];this._earcMats=[];for(let k=0;k<10;k++){const a=esurf[(Math.random()*esurf.length)|0],b=esurf[(Math.random()*esurf.length)|0];if(!a||!b)continue;const mid=a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(ER*(1.3+Math.random()*0.4));const cv=new THREE.QuadraticBezierCurve3(a.clone(),mid,b.clone());const lm=new THREE.LineBasicMaterial({color:0x2BCB86,transparent:true,opacity:0.32,blending:THREE.AdditiveBlending,depthWrite:false});this._earcMats.push(lm);earth.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(cv.getPoints(36)),lm));const pl=new THREE.Sprite(new THREE.SpriteMaterial({map:spr,color:0xeafff6,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));pl.scale.setScalar(1.1);earth.add(pl);earcs.push({cv,pl,t:Math.random(),sp:0.004+Math.random()*0.004});}
    this._earcs=earcs;

    // camera + state keyframes by scroll 0..1
    // f:scroll  r:radius theta:azimuth phi:polar(from y) fov  cs:coreScale rs:ringSpread dsp:disperse(0=sphere,1=out,2=grid) hue bloom fogT(0 dark..1 light)
    this._K=[
      {f:0.00,r:15,th:0.0,ph:1.55,fov:52,cs:1.0,rs:1.0,dsp:0.0,bloom:0.6,light:0.0,tunnel:0,earth:0},
      {f:0.12,r:11,th:0.5,ph:1.35,fov:58,cs:1.15,rs:1.25,dsp:0.15,bloom:0.5,light:1.0,tunnel:0,earth:0},
      {f:0.26,r:20,th:1.6,ph:1.55,fov:50,cs:0.9,rs:1.6,dsp:1.0,bloom:0.7,light:0.0,tunnel:0.3,earth:0},
      {f:0.42,r:30,th:2.6,ph:1.5,fov:74,cs:0.6,rs:1.4,dsp:1.0,bloom:0.6,light:0.0,tunnel:1.0,earth:0},
      {f:0.56,r:22,th:3.4,ph:1.2,fov:50,cs:0.85,rs:1.3,dsp:2.0,bloom:0.55,light:0.0,tunnel:0.25,earth:0.2},
      {f:0.72,r:34,th:4.2,ph:1.5,fov:46,cs:0.5,rs:1.0,dsp:0.3,bloom:0.6,light:0.0,tunnel:0,earth:1.0},
      {f:0.88,r:16,th:4.9,ph:1.5,fov:54,cs:1.1,rs:1.15,dsp:0.1,bloom:0.7,light:0.0,tunnel:0,earth:0.15},
      {f:1.00,r:19,th:5.6,ph:1.5,fov:52,cs:1.3,rs:1.5,dsp:0.0,bloom:0.95,light:0.0,tunnel:0,earth:0}
    ];

    const clock=new THREE.Clock();
    const lerp=(a,b,t)=>a+(b-a)*t;
    const sampleK=(s)=>{const K=this._K;let i=0;while(i<K.length-1&&s>K[i+1].f)i++;const a=K[i],b=K[Math.min(i+1,K.length-1)];const span=(b.f-a.f)||1;let t=(s-a.f)/span;t=Math.max(0,Math.min(1,t));t=t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;const o={};['r','th','ph','fov','cs','rs','dsp','bloom','light','tunnel','earth'].forEach(k=>o[k]=lerp(a[k],b[k],t));return o;};
    const darkC=new THREE.Color(0x040506),lightC=new THREE.Color(0xE9E5DC),tmpFog=new THREE.Color();
    const pos=pg.attributes.position.array;

    const render=()=>{if(!this._alive)return;const t=clock.getElapsedTime();const s=this.scroll;const st=sampleK(s);
      // camera spherical + mouse parallax + gentle hero auto-orbit
      const auto=(1-Math.min(1,s/0.12))*t*0.06;const th=st.th+auto+this.mxN*0.5;const ph=st.ph-this.myN*0.35;
      const cr=st.r;camera.position.set(cr*Math.sin(ph)*Math.cos(th),cr*Math.cos(ph),cr*Math.sin(ph)*Math.sin(th));camera.fov+=(st.fov-camera.fov)*0.1;camera.updateProjectionMatrix();camera.lookAt(0,0,0);
      // core
      core.scale.setScalar(st.cs*(1+Math.sin(t*0.9)*0.02));core.rotation.y+=0.0022;core.rotation.x=Math.sin(t*0.25)*0.12;
      this._wire.material.opacity=0.3+st.light*0.4;this._glow.material.opacity=st.bloom*(0.5+Math.sin(t*1.4)*0.15);this._glow.scale.setScalar(18+st.bloom*10);
      rings[0].rotation.z+=0.004;rings[1].rotation.z-=0.003;rings[2].rotation.x+=0.0026;rings.forEach((rg,i)=>rg.scale.setScalar(st.rs));
      // particle morph: dsp 0=sphere,1=dispersed,2=grid
      const dsp=st.dsp;const dShell=Math.max(0,1-Math.abs(dsp-1));const dGrid=Math.max(0,Math.min(1,dsp-1));
      for(let i=0;i<this._N;i++){const ix=i*3;const out=1+dShell*1.4;const wob=Math.sin(t*0.8+i*0.4)*0.12*dShell;
        let x=base[ix]*out,y=base[ix+1]*out+wob,z=base[ix+2]*out;
        if(dGrid>0){x=lerp(x,this._grid[ix],dGrid);y=lerp(y,this._grid[ix+1],dGrid);z=lerp(z,this._grid[ix+2],dGrid);}
        pos[ix]=x;pos[ix+1]=y;pos[ix+2]=z;}
      pg.attributes.position.needsUpdate=true;shell.rotation.y+=0.0009;
      // DATA TUNNEL: stream along +Z, wrap; fade by st.tunnel
      const tv=st.tunnel;this._tunnel.material.opacity=tv*0.95;
      if(tv>0.01){const tp=tgeo.attributes.position.array;const sp=1.4+tv*2.6;for(let i=0;i<this._TN;i++){let z=tp[i*3+2]+sp;if(z>30){z-=190;}tp[i*3+2]=z;}tgeo.attributes.position.needsUpdate=true;this._tunnel.material.size=0.26+tv*0.22;}
      // EARTH: scale up + spin; fade by st.earth
      const ev=st.earth;earth.visible=ev>0.01;if(earth.visible){earth.scale.setScalar(Math.max(0.001,ev));earth.rotation.y+=0.0016;this._earthPts.opacity=0.9*ev;this._earthCore.opacity=0.65*ev;this._earcMats.forEach(m=>m.opacity=0.32*ev);this._earcs.forEach(a=>{a.t+=a.sp;if(a.t>1)a.t=0;a.pl.position.copy(a.cv.getPoint(a.t));a.pl.material.opacity=Math.sin(a.t*Math.PI)*ev;});}
      // atmosphere
      tmpFog.copy(darkC).lerp(lightC,st.light);this._fog.color.copy(tmpFog);this._fog.density=lerp(0.018,0.05,st.light);
      this._bgMat.uniforms.cT.value.copy(new THREE.Color(0x081310)).lerp(lightC,st.light*0.85);this._bgMat.uniforms.cB.value.copy(darkC).lerp(new THREE.Color(0xcfc7b6),st.light*0.7);
      dust.rotation.y-=0.0003;
      renderer.render(scene,camera);this._raf=requestAnimationFrame(render);};
    render();
    this._onResize=()=>{camera.aspect=W()/H();camera.updateProjectionMatrix();renderer.setSize(W(),H());};
    addEventListener('resize',this._onResize);
  }
  _buildGrid(N){const g=new Float32Array(N*3);const per=Math.ceil(Math.cbrt(N));const sp=2.4;const off=(per-1)*sp/2;let i=0;for(let x=0;x<per&&i<N;x++)for(let y=0;y<per&&i<N;y++)for(let z=0;z<per&&i<N;z++){g[i*3]=x*sp-off;g[i*3+1]=y*sp-off;g[i*3+2]=z*sp-off;i++;}return g;}

  /* master scroll → this.scroll + HUD act label */
  _initScrollRig(){
    if(!this.ST){return;}
    const main=this._id('top');
    this._ST({trigger:main,start:'top top',end:'bottom bottom',scrub:0.6,onUpdate:(self)=>{this.scroll=self.progress;}});
    const hud=this._id('bsn-hud-act');
    this._qa('[data-actname]').forEach(sec=>{this._ST({trigger:sec,start:'top 55%',end:'bottom 55%',onToggle:(self)=>{if(self.isActive&&hud)hud.textContent=sec.getAttribute('data-actname');}});});
  }

  _initTicker(){const tk=this._id('bsn-ticker');if(!tk)return;let x=0;const step=()=>{if(!this._alive)return;try{const half=tk.scrollWidth/2;const v=this._tvel||1;x-=(0.5+Math.min(4,Math.abs(v))*0.4);if(half>0&&x<=-half)x=0;tk.style.transform='translateX('+x+'px)';}catch(e){}requestAnimationFrame(step);};requestAnimationFrame(step);if(this._lenis)this._lenis.on('scroll',(e)=>{this._tvel=e.velocity||1;});}

  _maskReveal(el){const gsap=this.gsap;let lines=[el];if(window.SplitType){try{const s=new window.SplitType(el,{types:'lines'});lines=s.lines;lines.forEach(l=>{const w=document.createElement('span');w.className='bsn-line-mask';l.parentNode.insertBefore(w,l);w.appendChild(l);});}catch(e){}}gsap.set(el,{opacity:1});this._track(gsap.from(lines,{yPercent:118,duration:1.05,ease:'power4.out',stagger:0.08,scrollTrigger:{trigger:el,start:'top 86%'}}));}
  _initReveals(){const gsap=this.gsap;if(!gsap||!this.ST){this._qa('[data-reveal],[data-fade]').forEach(el=>el.style.opacity='1');return;}this._qa('[data-reveal]').forEach(el=>this._maskReveal(el));this._qa('[data-fade]').forEach(el=>{gsap.set(el,{opacity:1});this._track(gsap.from(el,{y:30,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 90%'}}));});this._qa('[data-capbeat]').forEach(el=>{this._track(gsap.from(el,{filter:'blur(8px)',duration:1,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 80%'}}));});}

  _initManifesto(){const el=this._id('bsn-manifesto-text');if(!el||!window.SplitType||!this.gsap||!this.ST){if(el)el.style.opacity='1';return;}const s=new window.SplitType(el,{types:'words'});this.gsap.set(s.words,{opacity:0.22});this._track(this.gsap.to(s.words,{opacity:1,stagger:0.4,ease:'none',scrollTrigger:{trigger:el,start:'top 82%',end:'bottom 68%',scrub:0.6}}));}

  _initCycle(){const path=this._id('bsn-cycle-path');const sec=this._id('model');if(!path||!sec||!this.gsap||!this.ST)return;const len=path.getTotalLength();this.gsap.set(path,{strokeDasharray:len,strokeDashoffset:len});this._track(this.gsap.to(path,{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:sec,start:'top 65%',end:'bottom 75%',scrub:0.8}}));const steps=this._qa('.bsn-cyc-step');steps.forEach(s=>s.style.opacity='0.4');let act=-1;const set=(i)=>{if(i===act)return;act=i;steps.forEach(s=>s.style.opacity=parseInt(s.getAttribute('data-step'))===i?'1':'0.4');};set(0);this._ST({trigger:sec,start:'top 60%',end:'bottom 75%',scrub:true,onUpdate:(self)=>set(Math.min(2,Math.floor(self.progress*2.999)))});}

  _initNav(){const nav=this._id('bsn-nav');if(!nav)return;const upd=()=>{const y=scrollY||pageYOffset;if(y>30){nav.style.background='rgba(4,5,6,0.7)';nav.style.backdropFilter='blur(16px)';nav.style.borderBottomColor='rgba(234,241,236,0.1)';nav.style.padding='14px clamp(18px,4vw,44px)';}else{nav.style.background='transparent';nav.style.backdropFilter='none';nav.style.borderBottomColor='transparent';nav.style.padding='22px clamp(18px,4vw,44px)';}};upd();addEventListener('scroll',upd,{passive:true});if(this._lenis)this._lenis.on('scroll',upd);
    const burger=this._id('bsn-burger');const menu=this._id('bsn-mobile-menu');if(burger&&menu){const lines=this._qa('.bsn-bl',burger);let open=false;const set=(v)=>{open=v;menu.classList.toggle('open',v);if(this._lenis){v?this._lenis.stop():this._lenis.start();}if(lines[0])lines[0].style.transform=v?'translateY(3.25px) rotate(45deg)':'none';if(lines[1])lines[1].style.transform=v?'translateY(-3.25px) rotate(-45deg)':'none';};burger.addEventListener('click',()=>set(!open));this._qa('[data-mlink]',menu).forEach(a=>a.addEventListener('click',()=>set(false)));const md=this._id('bsn-m-demo');if(md)md.addEventListener('click',()=>{set(false);this._bookDemo();});const mj=this._id('bsn-m-join');if(mj)mj.addEventListener('click',()=>{set(false);if(this._lenis)this._lenis.scrollTo(this._id('join'));});const ma=this._id('bsn-m-auth');if(ma)ma.addEventListener('click',()=>{set(false);this._showModal('login');});}
    ['bsn-demo-btn','bsn-hero-demo','bsn-consult-demo'].forEach(id=>{const b=this._id(id);if(b)b.addEventListener('click',(e)=>{e.preventDefault();this._bookDemo();});});}

  _initInteractions(){const gsap=this.gsap;this._qa('[data-magnetic]').forEach(el=>{el.addEventListener('mousemove',(e)=>{const r=el.getBoundingClientRect();gsap.to(el,{x:(e.clientX-(r.left+r.width/2))*0.3,y:(e.clientY-(r.top+r.height/2))*0.4,duration:0.6,ease:'power3.out'});});el.addEventListener('mouseleave',()=>gsap.to(el,{x:0,y:0,duration:0.7,ease:'elastic.out(1,0.45)'}));});}

  _bookDemo(){const start=new Date(Date.now()+864e5);start.setMinutes(0,0,0);const end=new Date(start.getTime()+18e5);const fmt=(d)=>d.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';const p=new URLSearchParams({action:'TEMPLATE',text:'BSN 3D AI Strategy Session',dates:fmt(start)+'/'+fmt(end),details:'30-minute call with Aryan for BSN AI agents, 3D AI strategy, and business automation roadmap.',add:'aryan.datta.940@gmail.com'});window.open('https://calendar.google.com/calendar/render?'+p.toString(),'_blank');}

  _initAuth(){const wrap=this._id('bsn-profile-wrap');const btn=this._id('bsn-profile-btn');const dd=this._id('bsn-auth-dd');let po=false;const setDD=(v)=>{po=v;if(dd){dd.style.opacity=v?'1':'0';dd.style.pointerEvents=v?'all':'none';dd.style.transform=v?'none':'translateY(-8px)';}};if(btn)btn.addEventListener('click',(e)=>{e.stopPropagation();setDD(!po);});this._onDocClick=(e)=>{if(wrap&&!wrap.contains(e.target))setDD(false);};document.addEventListener('click',this._onDocClick);
    const modal=this._id('bsn-modal');this._showModal=(tab)=>{if(modal){modal.style.display='flex';if(this._lenis)this._lenis.stop();}this._switchTab(tab||'login');setDD(false);};this._closeModal=()=>{if(modal){modal.style.display='none';if(this._lenis)this._lenis.start();}};
    this._switchTab=(t)=>{const tl=this._id('bsn-tab-login'),tr=this._id('bsn-tab-reg'),fl=this._id('bsn-form-login'),fr=this._id('bsn-form-reg'),ti=this._id('bsn-modal-title');if(tl){tl.style.borderBottomColor=t==='login'?'#2BCB86':'transparent';tl.style.color=t==='login'?'#EAF1EC':'rgba(234,241,236,0.4)';}if(tr){tr.style.borderBottomColor=t==='register'?'#2BCB86':'transparent';tr.style.color=t==='register'?'#EAF1EC':'rgba(234,241,236,0.4)';}if(fl)fl.style.display=t==='login'?'block':'none';if(fr)fr.style.display=t==='register'?'block':'none';if(ti)ti.textContent=t==='login'?'Enter the mission.':'Join the mission.';};
    const x=this._id('bsn-modal-x');if(x)x.addEventListener('click',()=>this._closeModal());if(modal)modal.addEventListener('click',(e)=>{if(e.target===modal)this._closeModal();});const tl=this._id('bsn-tab-login');if(tl)tl.addEventListener('click',()=>this._switchTab('login'));const tr=this._id('bsn-tab-reg');if(tr)tr.addEventListener('click',()=>this._switchTab('register'));const dl=this._id('bsn-dd-login');if(dl)dl.addEventListener('click',()=>this._showModal('login'));const drg=this._id('bsn-dd-reg');if(drg)drg.addEventListener('click',()=>this._showModal('register'));const dlo=this._id('bsn-dd-logout');if(dlo)dlo.addEventListener('click',()=>{this._logout();setDD(false);});this._qa('[data-open-reg]').forEach(b=>b.addEventListener('click',()=>this._showModal('register')));const dol=this._id('bsn-do-login');if(dol)dol.addEventListener('click',()=>this._login());const dor=this._id('bsn-do-reg');if(dor)dor.addEventListener('click',()=>this._register());}
  async _login(){const email=(this._id('bsn-l-email').value||'').trim();const pass=this._id('bsn-l-pass').value;if(!email||!pass){alert('Please fill in email and password.');return;}try{const res=await fetch('https://bsnjavabackend.onrender.com/api/users/login',{method:'POST',headers:{'accept':'*/*','Content-Type':'application/json'},body:JSON.stringify({email,password:pass})});if(!res.ok)throw 0;const data=await res.json();const name=data.fullName||email.split('@')[0];const user=Object.assign({name,email:data.email||email},data);localStorage.setItem('bsnUser',JSON.stringify(user));this._loginUser(user);this._closeModal();}catch(e){alert('Login failed. Check email/password or backend/CORS.');}}
  async _register(){const v=(id)=>(this._id(id).value||'').trim();const name=v('bsn-r-name'),email=v('bsn-r-email'),phone=v('bsn-r-phone'),role=v('bsn-r-role'),lookingFor=v('bsn-r-looking'),pass=this._id('bsn-r-pass').value;if(!name||!email||!phone||!role||!lookingFor||!pass){alert('Please fill in all fields.');return;}try{const res=await fetch('https://bsnjavabackend.onrender.com/api/users',{method:'POST',headers:{'accept':'*/*','Content-Type':'application/json'},body:JSON.stringify({fullName:name,email,phone,role,lookingFor,password:pass})});if(!res.ok)throw 0;const data=await res.json();const user=Object.assign({name:data.fullName||name,email:data.email||email},data);localStorage.setItem('bsnUser',JSON.stringify(user));this._loginUser(user);this._closeModal();}catch(e){alert('Signup failed. Check backend/CORS or try again.');}}
  _loginUser(u){const out=this._id('bsn-dd-out'),inn=this._id('bsn-dd-in');if(out)out.style.display='none';if(inn)inn.style.display='block';const nm=u.name||u.fullName||'User';const av=this._id('bsn-dd-avatar');if(av)av.textContent=nm.charAt(0).toUpperCase();const n=this._id('bsn-dd-name');if(n)n.textContent=nm;const em=this._id('bsn-dd-email');if(em)em.textContent=u.email||'';const dot=this._id('bsn-online-dot');if(dot)dot.style.display='block';}
  _logout(){try{localStorage.removeItem('bsnUser');}catch(e){}const out=this._id('bsn-dd-out'),inn=this._id('bsn-dd-in');if(out)out.style.display='block';if(inn)inn.style.display='none';const dot=this._id('bsn-online-dot');if(dot)dot.style.display='none';}
  _restore(){try{const s=JSON.parse(localStorage.getItem('bsnUser')||'null');if(s&&s.email)this._loginUser(s);}catch(e){}}

  _runLoader(){const loader=this._id('bsn-loader');const pct=this._id('bsn-pct');const bar=this._id('bsn-bar');const boot=this._id('bsn-boot');if(!loader)return;const lines=['> igniting BSN reactor ...','> spinning gimbal rings ...','> loading autonomous agents ...','> linking research mission ...','> reactor stable.'];lines.forEach((b,i)=>setTimeout(()=>{if(boot)boot.innerHTML+=(i?'<br>':'')+b;},250+i*340));let v=0;this._dismissed=false;const tick=setInterval(()=>{v+=Math.max(1.4,(100-v)*0.06);if(v>=100){v=100;clearInterval(tick);setTimeout(()=>this._dismiss(),360);}if(pct)pct.textContent=String(Math.round(v)).padStart(3,'0');if(bar)bar.style.width=v+'%';},34);setTimeout(()=>{clearInterval(tick);if(pct)pct.textContent='100';if(bar)bar.style.width='100%';this._dismiss();},4200);}
  _dismiss(){if(this._dismissed)return;this._dismissed=true;const loader=this._id('bsn-loader');if(loader){loader.style.transition='transform .9s cubic-bezier(.76,0,.24,1)';loader.style.transform='translateY(-101%)';setTimeout(()=>{loader.style.display='none';},900);}
    // unlock scroll no matter what
    if(this._lenis)this._lenis.start();
    document.documentElement.classList.remove('lenis-stopped');
    if(this.ST)setTimeout(()=>{try{this.ST.refresh();}catch(e){}},920);
    this._voidIntro();
    // failsafe: guarantee the page is scrollable even if anything above failed
    setTimeout(()=>{try{if(this._lenis)this._lenis.start();document.documentElement.classList.remove('lenis-stopped');}catch(e){}},2500);}
  _voidIntro(){const gsap=this.gsap;const v=this._id('bsn-void');const l1=this._id('bsn-void-1'),l2=this._id('bsn-void-2');
    if(!gsap||!v||!l1){this._revealHero();return;}
    // if user already scrolled past the top, skip the intro
    if((window.scrollY||0)>40){this._revealHero();return;}
    const tl=gsap.timeline({onComplete:()=>this._revealHero()});
    tl.set(v,{opacity:1});
    tl.to(l1,{opacity:1,filter:'blur(0px)',duration:1.1,ease:'power3.out'});
    tl.to(l1,{opacity:0,filter:'blur(6px)',duration:0.7,ease:'power2.in'},'+=0.7');
    tl.to(l2,{opacity:1,filter:'blur(0px)',duration:1.1,ease:'power3.out'},'-=0.1');
    tl.to(l2,{opacity:0,filter:'blur(6px)',duration:0.7,ease:'power2.in'},'+=0.8');
    tl.to(v,{opacity:0,duration:0.8,ease:'power2.inOut'},'-=0.2');
  }
  _revealHero(){const gsap=this.gsap;const h=document.querySelector('[data-hero-head]');if(h){let lines=[h];if(window.SplitType){try{const s=new window.SplitType(h,{types:'lines'});lines=s.lines;lines.forEach(l=>{const w=document.createElement('span');w.className='bsn-line-mask';l.parentNode.insertBefore(w,l);w.appendChild(l);});}catch(e){}}gsap.set(h,{opacity:1});gsap.from(lines,{yPercent:120,duration:1.2,ease:'power4.out',stagger:0.12});}gsap.set('[data-hero]',{opacity:1});gsap.from('[data-hero]',{y:24,opacity:0,duration:1,ease:'power3.out',stagger:0.08,delay:0.15});}
  _forceShow(){const l=this._id('bsn-loader');if(l)l.style.display='none';this._qa('[data-hero],[data-hero-head],[data-reveal],[data-fade]').forEach(e=>e.style.opacity='1');}

  /* ===== MERGED: session helpers ===== */
  _user(){try{return JSON.parse(localStorage.getItem('bsnUser')||'null');}catch(e){return null;}}
  _fmtINR(n){return '\u20B9'+Number(n||0).toLocaleString('en-IN');}
  _toast(msg){const t=this._id('bsn-toast');if(!t)return;t.textContent=msg;t.style.display='block';clearTimeout(this._toastT);this._toastT=setTimeout(function(){t.style.display='none';},3200);}
  _hide(id){const e=this._id(id);if(e)e.style.display='none';}

  /* ===== MERGED: wire forgot-password + marketplace ===== */
  _initMerge(){
    const self=this;
    const origShow=this._showModal;
    this._showModal=function(tab){const ff=self._id('bsn-form-forgot');if(ff)ff.style.display='none';const tb=self._id('bsn-tabbar');if(tb)tb.style.display='flex';if(origShow)origShow(tab);};
    const fl=this._id('bsn-forgot-link');if(fl)fl.addEventListener('click',function(e){e.preventDefault();self._showForgot();});
    const fb=this._id('bsn-fp-back');if(fb)fb.addEventListener('click',function(e){e.preventDefault();self._backToLogin();});
    const fs=this._id('bsn-fp-send');if(fs)fs.addEventListener('click',function(){self._forgotSend();});
    const frs=this._id('bsn-fp-resend');if(frs)frs.addEventListener('click',function(e){e.preventDefault();self._forgotSend();});
    const fr=this._id('bsn-fp-reset');if(fr)fr.addEventListener('click',function(){self._forgotReset();});
    ['bsn-tab-login','bsn-tab-reg'].forEach(function(id){const b=self._id(id);if(b)b.addEventListener('click',function(){const ff=self._id('bsn-form-forgot');if(ff)ff.style.display='none';const tb=self._id('bsn-tabbar');if(tb)tb.style.display='flex';});});

    const dash=this._id('bsn-dd-dash');if(dash)dash.addEventListener('click',function(e){e.preventDefault();self._openMarket();});
    const mx=this._id('bsn-market-x');if(mx)mx.addEventListener('click',function(){self._closeMarket();});
    const market=this._id('bsn-market');if(market)market.addEventListener('click',function(e){if(e.target===market)self._closeMarket();});
    const px=this._id('bsn-pay-x');if(px)px.addEventListener('click',function(){self._hide('bsn-pay');});
    const pay=this._id('bsn-pay');if(pay)pay.addEventListener('click',function(e){if(e.target===pay)self._hide('bsn-pay');});
    const ppx=this._id('bsn-ppc-x');if(ppx)ppx.addEventListener('click',function(){self._hide('bsn-ppc');});
    const ppc=this._id('bsn-ppc');if(ppc)ppc.addEventListener('click',function(e){if(e.target===ppc)self._hide('bsn-ppc');});
    const grid=this._id('bsn-mkt-grid');if(grid)grid.addEventListener('click',function(e){const b=e.target.closest?e.target.closest('[data-act]'):null;if(!b)return;const id=b.getAttribute('data-agent-id');const act=b.getAttribute('data-act');const list=self._agents||[];let ag=null;for(let i=0;i<list.length;i++){if(list[i].id===id){ag=list[i];break;}}if(act==='demo'){self._bookDemo();return;}if(!ag)return;if(act==='choose')self._choosePay(ag);else if(act==='deploy')self._deployAgent(ag);else if(act==='open'){if(ag.deployUrl)window.open(ag.deployUrl,'_blank');}});
  }

  _showForgot(){const fl=this._id('bsn-form-login'),fr=this._id('bsn-form-reg'),ff=this._id('bsn-form-forgot'),tb=this._id('bsn-tabbar');if(fl)fl.style.display='none';if(fr)fr.style.display='none';if(tb)tb.style.display='none';if(ff)ff.style.display='block';const s1=this._id('bsn-fp-step1'),s2=this._id('bsn-fp-step2');if(s1)s1.style.display='block';if(s2)s2.style.display='none';const le=this._id('bsn-l-email'),fe=this._id('bsn-fp-email');if(le&&fe&&le.value)fe.value=le.value.trim();}
  _backToLogin(){const ff=this._id('bsn-form-forgot'),tb=this._id('bsn-tabbar');if(ff)ff.style.display='none';if(tb)tb.style.display='flex';if(this._switchTab)this._switchTab('login');}

  _forgotSend(){const self=this;const email=(this._id('bsn-fp-email').value||'').trim();if(!email){alert('Please enter your email.');return;}fetch('https://bsnjavabackend.onrender.com/api/users/forgot-password',{method:'POST',headers:{'accept':'*/*','Content-Type':'application/json'},body:JSON.stringify({email:email})}).then(function(r){if(!r.ok)throw 0;const es=self._id('bsn-fp-emailshow');if(es)es.textContent=email;const s1=self._id('bsn-fp-step1'),s2=self._id('bsn-fp-step2');if(s1)s1.style.display='none';if(s2)s2.style.display='block';}).catch(function(){alert('Could not send reset code. Check the email or try again.');});}
  _forgotReset(){const self=this;const email=(this._id('bsn-fp-email').value||'').trim();const otp=(this._id('bsn-fp-otp').value||'').trim();const pass=this._id('bsn-fp-pass').value;if(!otp||!pass){alert('Please enter the code and a new password.');return;}if(pass.length<6){alert('New password must be at least 6 characters.');return;}fetch('https://bsnjavabackend.onrender.com/api/users/reset-password',{method:'POST',headers:{'accept':'*/*','Content-Type':'application/json'},body:JSON.stringify({email:email,otp:otp,newPassword:pass})}).then(function(r){if(!r.ok)throw 0;alert('Password updated! Sign in with your new password.');self._backToLogin();const le=self._id('bsn-l-email');if(le)le.value=email;const lp=self._id('bsn-l-pass');if(lp)lp.value='';}).catch(function(){alert('Could not reset password. Check the code and try again.');});}

  /* ===== MERGED: agent marketplace + payments ===== */
  _fallbackAgents(){return [
    {id:'investment',icon:'\uD83D\uDCCA',name:'Investment Analyzer',tag:'LIVE',description:'AI-powered analysis of investment memos, pitch decks & financials. Confidence scores, risk flags, and follow-up questions instantly.',features:['Confidence scoring','Risk & red-flag detection','Follow-up questions'],priceInr:4999,purchasable:true,owned:false,deployed:false},
    {id:'3d-world',icon:'\uD83C\uDF10',name:'3D World Architect',tag:'BETA',description:'Design, simulate and deploy immersive 3D business environments. Build photorealistic digital twins of your operations.',features:['Virtual environment builder','Real-time physics sim','Export to Unity / Unreal'],priceInr:14999,purchasable:true,owned:false,deployed:false},
    {id:'ops',icon:'\uD83E\uDD16',name:'Autonomous Ops Agent',tag:'LIVE',description:'Deploy intelligent agents that automate operations end-to-end — procurement, scheduling, reporting — slashing costs by 70%+.',features:['Workflow automation','Cost reduction analytics','24/7 agent monitoring'],priceInr:9999,purchasable:true,owned:false,deployed:false},
    {id:'digital-twin',icon:'\u267E\uFE0F',name:'Digital Twin Engine',tag:'BETA',description:'Create real-time AI digital twins for any industry — manufacturing, healthcare, logistics — and run predictive simulations.',features:['Real-time sensor sync','Predictive failure modeling','Industry templates'],priceInr:12999,purchasable:true,owned:false,deployed:false},
    {id:'ocean',icon:'\uD83C\uDF0A',name:'Ocean Revival Agent',tag:'RESEARCH',description:'Monitor marine ecosystems, coordinate AI-guided ocean cleanup fleets, and track real-time health metrics globally.',features:['Satellite data ingestion','Cleanup fleet coordination','Ecosystem health reports'],priceInr:0,purchasable:false,owned:false,deployed:false},
    {id:'multiverse',icon:'\uD83C\uDF0C',name:'Multiverse Explorer',tag:'SOON',description:'Theoretical AI research into consciousness across dimensions. Access multiverse simulations and emotion-driven energy mappings.',features:['Consciousness mapping AI','Dimension-shift modeling','Research paper access'],priceInr:0,purchasable:false,owned:false,deployed:false}
  ];}

  _openMarket(){const u=this._user();if(!u||!u.email){this._showModal('login');return;}const m=this._id('bsn-market');if(m)m.style.display='block';if(this._lenis)this._lenis.stop();this._loadAgents();}
  _closeMarket(){const m=this._id('bsn-market');if(m)m.style.display='none';if(this._lenis)this._lenis.start();}

  _loadAgents(){const self=this;const u=this._user();if(!u||!u.email)return;const grid=this._id('bsn-mkt-grid');if(grid)grid.innerHTML='<div class="mono" style="grid-column:1/-1;padding:30px;text-align:center;color:rgba(234,241,236,0.4);font-size:12px;letter-spacing:0.1em">LOADING AGENTS\u2026</div>';fetch('https://bsnjavabackend.onrender.com/api/agents?email='+encodeURIComponent(u.email)).then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(data){self._agents=(Array.isArray(data)&&data.length)?data:self._fallbackAgents();self._renderAgents();}).catch(function(){self._agents=self._fallbackAgents();self._renderAgents();});}

  _renderAgents(){const self=this;const grid=this._id('bsn-mkt-grid');if(!grid)return;const esc=function(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');};const list=this._agents||[];const html=list.map(function(a){
    const soon=a.tag==='SOON';
    let status='';
    if(a.deployed)status='<span class="bsn-ag-tag" style="color:#34d399;border-color:rgba(52,211,153,0.4)">\u25CF DEPLOYED</span>';
    else if(a.owned)status='<span class="bsn-ag-tag" style="color:#38bdf8;border-color:rgba(56,189,248,0.4)">OWNED</span>';
    let priceRow;
    if(a.purchasable)priceRow='<span class="bsn-ag-price">'+self._fmtINR(a.priceInr)+'</span> <span class="mono" style="font-size:10px;color:rgba(234,241,236,0.35)">ONE-TIME</span>';
    else priceRow='<span class="mono" style="font-size:12px;color:#2BCB86">'+(soon?'COMING SOON':'RESEARCH ACCESS')+'</span>';
    const feats=(a.features||[]).map(function(f){return '<div>\u2192 '+esc(f)+'</div>';}).join('');
    let actions='';
    if(a.purchasable&&!a.owned)actions+='<button class="bsn-ag-btn bsn-ag-buy" data-act="choose" data-agent-id="'+esc(a.id)+'">Buy '+self._fmtINR(a.priceInr)+' \u2192</button>';
    if(a.owned&&!a.deployed)actions+='<button class="bsn-ag-btn bsn-ag-deploy" data-act="deploy" data-agent-id="'+esc(a.id)+'">Deploy Agent \u26A1</button>';
    if(a.deployed)actions+='<button class="bsn-ag-btn bsn-ag-open" data-act="open" data-agent-id="'+esc(a.id)+'">Open Agent \u2192</button>';
    actions+='<button class="bsn-ag-btn bsn-ag-ghost" data-act="demo" data-agent-id="'+esc(a.id)+'">Book Demo</button>';
    return '<div class="bsn-ag">'+
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px"><div style="font-size:24px">'+esc(a.icon)+'</div><div style="display:flex;flex-direction:column;gap:5px;align-items:flex-end"><span class="bsn-ag-tag">'+esc(a.tag)+'</span>'+status+'</div></div>'+
      '<div class="bsn-ag-name">'+esc(a.name)+'</div>'+
      '<div class="bsn-ag-desc">'+esc(a.description)+'</div>'+
      '<div class="bsn-ag-feat">'+feats+'</div>'+
      '<div style="margin-top:2px">'+priceRow+'</div>'+
      actions+
    '</div>';
  }).join('');
  grid.innerHTML=html||'<div class="mono" style="grid-column:1/-1;padding:30px;text-align:center;color:rgba(234,241,236,0.4)">NO AGENTS AVAILABLE.</div>';}

  _choosePay(a){const self=this;if(!a)return;const nm=this._id('bsn-pay-name');if(nm)nm.textContent=a.name;const pr=this._id('bsn-pay-price');if(pr)pr.textContent='Choose a payment method \u00B7 '+this._fmtINR(a.priceInr);const pay=this._id('bsn-pay');if(pay)pay.style.display='flex';const rzp=this._id('bsn-pay-rzp');if(rzp)rzp.onclick=function(){self._hide('bsn-pay');self._buyRazorpay(a);};const ppl=this._id('bsn-pay-ppl');if(ppl)ppl.onclick=function(){self._hide('bsn-pay');self._buyPaypal(a);};}

  _loadRazorpay(){if(window.Razorpay)return Promise.resolve(true);return new Promise(function(res){const s=document.createElement('script');s.src='https://checkout.razorpay.com/v1/checkout.js';s.onload=function(){res(true);};s.onerror=function(){res(false);};document.head.appendChild(s);});}

  _buyRazorpay(a){const self=this;const u=this._user();if(!u||!u.email){this._showModal('login');return;}fetch('https://bsnjavabackend.onrender.com/api/agents/order',{method:'POST',headers:{'accept':'*/*','Content-Type':'application/json'},body:JSON.stringify({email:u.email,agentId:a.id})}).then(function(r){return r.json().then(function(order){if(!r.ok){self._toast(order.message||'Could not start payment.');return null;}return order;});}).then(function(order){if(!order)return;self._loadRazorpay().then(function(ok){if(!ok){self._toast('Could not load Razorpay checkout.');return;}const rzp=new window.Razorpay({key:order.key,amount:order.amount,currency:order.currency||'INR',order_id:order.orderId,name:'BSN \u2014 '+(order.agentName||a.name),description:'AI Agent \u2014 one-time purchase',prefill:{email:u.email,name:u.name||u.fullName||''},theme:{color:'#2BCB86'},handler:function(resp){fetch('https://bsnjavabackend.onrender.com/api/agents/verify',{method:'POST',headers:{'accept':'*/*','Content-Type':'application/json'},body:JSON.stringify({email:u.email,agentId:a.id,razorpay_order_id:resp.razorpay_order_id,razorpay_payment_id:resp.razorpay_payment_id,razorpay_signature:resp.razorpay_signature})}).then(function(v){if(v.ok){self._toast('\u2705 '+a.name+' purchased \u2014 deploy it anytime.');self._loadAgents();}else{v.json().then(function(e){self._toast(e.message||'Payment verification failed.');}).catch(function(){self._toast('Payment verification failed.');});}}).catch(function(){self._toast('Payment verification failed.');});}});rzp.open();});}).catch(function(){self._toast('Payment setup failed. Please try again.');});}

  _buyPaypal(a){const self=this;const u=this._user();if(!u||!u.email){this._showModal('login');return;}fetch('https://bsnjavabackend.onrender.com/api/agents/paypal/checkout',{method:'POST',headers:{'accept':'*/*','Content-Type':'application/json'},body:JSON.stringify({email:u.email,agentId:a.id})}).then(function(r){return r.json().then(function(data){if(!r.ok||!data.payUrl){self._toast(data.message||'Could not start PayPal checkout.');return null;}return data;});}).then(function(data){if(!data)return;window.open(data.payUrl,'_blank','noopener');const nm=self._id('bsn-ppc-name');if(nm)nm.textContent=a.name+' ('+self._fmtINR(a.priceInr)+')';const lk=self._id('bsn-ppc-link');if(lk)lk.href=data.payUrl;const ppc=self._id('bsn-ppc');if(ppc)ppc.style.display='flex';const cf=self._id('bsn-ppc-confirm');if(cf)cf.onclick=function(){self._confirmPaypal(a);};}).catch(function(){self._toast('Could not reach the backend. Try again shortly.');});}

  _confirmPaypal(a){const self=this;const u=this._user();if(!u||!u.email)return;fetch('https://bsnjavabackend.onrender.com/api/agents/paypal/confirm',{method:'POST',headers:{'accept':'*/*','Content-Type':'application/json'},body:JSON.stringify({email:u.email,agentId:a.id})}).then(function(r){if(r.ok){self._hide('bsn-ppc');self._toast('\u2705 '+a.name+' unlocked \u2014 deploy it anytime.');self._loadAgents();}else{r.json().then(function(e){self._toast(e.message||'Could not confirm payment.');}).catch(function(){self._toast('Could not confirm payment.');});}}).catch(function(){self._toast('Could not reach the backend. Try again shortly.');});}

  _deployAgent(a){const self=this;const u=this._user();if(!u||!u.email)return;fetch('https://bsnjavabackend.onrender.com/api/agents/deploy',{method:'POST',headers:{'accept':'*/*','Content-Type':'application/json'},body:JSON.stringify({email:u.email,agentId:a.id})}).then(function(r){if(r.ok){self._toast('\u26A1 '+a.name+' deployed.');self._loadAgents();}else{r.json().then(function(e){self._toast(e.message||'Deploy failed.');}).catch(function(){self._toast('Deploy failed.');});}}).catch(function(){self._toast('Could not reach the backend. Try again shortly.');});}

  renderVals(){return {};}
}
/* =================== END ORIGINAL APP LOGIC (verbatim) =================== */

// Drive the original lifecycle from React. Returns a cleanup function.
export function mountBSN() {
  const inst = new Component();
  try { inst.componentDidMount(); } catch (e) { console.error('[BSN] mount error', e); }
  return () => {
    try { inst.componentWillUnmount(); } catch (e) { /* ignore */ }
  };
}

export default Component;
