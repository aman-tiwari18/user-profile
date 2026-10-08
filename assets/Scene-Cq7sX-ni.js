import{r as l,j as e}from"./motion-2NAx-m_q.js";import{u as R,a as x,M as v,T as F,F as V,R as U,D as O,C as W,A as _,E as H,L as p,S as B,b as y,V as K}from"./three-BiVFBSNF.js";import{s as j}from"./index-CaBTtY8n.js";const Y=`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`,$=`
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uSeed;
  uniform float uAlert;
  uniform float uDim;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7)) + uSeed * 17.0) * 43758.5453); }

  float box(vec2 p, vec2 c, vec2 h, float t) {
    vec2 d = abs(p - c) - h;
    float outer = step(max(d.x, d.y), 0.0);
    vec2 d2 = abs(p - c) - (h - t);
    float inner = step(max(d2.x, d2.y), 0.0);
    return outer - inner;
  }

  void main() {
    vec2 uv = vUv;
    // slight barrel distortion like a cheap CCTV lens
    vec2 cc = uv - 0.5;
    uv = 0.5 + cc * (1.0 + 0.12 * dot(cc, cc));

    // floor
    vec3 col = vec3(0.05, 0.07, 0.08) + 0.03 * hash(floor(uv * 6.0));

    // exam hall grid: desks with seated candidates
    vec2 grid = vec2(5.0, 4.0);
    vec2 g = uv * grid;
    vec2 id = floor(g);
    vec2 f = fract(g) - 0.5;
    float occupied = step(0.18, hash(id));
    float desk = step(abs(f.x), 0.36) * step(abs(f.y + 0.12), 0.1);
    col += desk * vec3(0.16, 0.17, 0.15);
    vec2 jitter = vec2(sin(uTime * 0.7 + hash(id) * 30.0), cos(uTime * 0.5 + hash(id) * 20.0)) * 0.03;
    float head = smoothstep(0.17, 0.12, length(f - vec2(0.0, 0.14) - jitter)) * occupied;
    col = mix(col, vec3(0.28, 0.3, 0.27), head);

    // detection box around one candidate per feed
    vec2 target = vec2(floor(hash(vec2(uSeed, 1.0)) * grid.x), floor(hash(vec2(uSeed, 2.0)) * grid.y));
    vec2 bc = (target + vec2(0.5, 0.62)) / grid;
    float b = box(uv, bc + jitter / grid, vec2(0.075, 0.1), 0.006);
    vec3 boxCol = mix(vec3(1.0, 0.69, 0.0), vec3(1.0, 0.29, 0.24), uAlert);
    col = mix(col, boxCol, b);

    // CCTV treatment: tint, scanlines, rolling bar, noise, vignette
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col, vec3(lum) * vec3(1.0, 0.93, 0.78), 0.55) + b * boxCol * 0.6;
    col *= 0.85 + 0.15 * sin(uv.y * 420.0);
    col += 0.06 * smoothstep(0.03, 0.0, abs(fract(uv.y - uTime * 0.15) - 0.5));
    col += (hash(uv * 400.0 + uTime) - 0.5) * 0.09;
    col *= smoothstep(0.85, 0.25, length(cc));
    col += uAlert * 0.08 * vec3(1.0, 0.1, 0.2) * (0.5 + 0.5 * sin(uTime * 12.0));

    // frame
    float edge = step(0.985, max(abs(cc.x), abs(cc.y)) * 2.0);
    col = mix(col, mix(vec3(0.2, 0.25, 0.3), vec3(1.0, 0.25, 0.35), uAlert), edge);

    gl_FragColor = vec4(col * uDim, 1.0);
  }
`,w=5,k=4,T=1.25,A=.82,z=.08,b=6;function N({index:t,position:a,rotation:d,dim:n,labels:h=!0}){const i=l.useRef(),c=l.useRef(),s=l.useMemo(()=>Math.random()*100,[]),o=l.useMemo(()=>({uTime:{value:0},uSeed:{value:s},uAlert:{value:0},uDim:{value:n}}),[s,n]),f=l.useMemo(()=>`CAM-${String(1e3+Math.floor(s*89)).padStart(4,"0")}`,[s]);return x(r=>{const u=r.clock.elapsedTime;o.uTime.value=u;const g=(u+s*3.7)%(9+t%5*2)<1.6?1:0;o.uAlert.value+=(g-o.uAlert.value)*.15,c.current&&(c.current.color=o.uAlert.value>.5?"#ff4b3e":"#ffcf66")}),e.jsxs("group",{position:a,rotation:d,children:[e.jsxs("mesh",{children:[e.jsx("planeGeometry",{args:[T,A]}),e.jsx("shaderMaterial",{ref:i,vertexShader:Y,fragmentShader:$,uniforms:o})]}),h&&e.jsx(F,{ref:c,position:[-T/2+.06,A/2-.07,.01],fontSize:.055,anchorX:"left",anchorY:"middle",color:"#ffcf66",children:`● ${f} · LIVE`})]})}function X(){const t=l.useRef(),{pointer:a,viewport:d,camera:n}=R(),h=l.useMemo(()=>{const s=[],o=(T+z)/b;for(let f=0;f<k;f++)for(let r=0;r<w;r++){const u=(r-(w-1)/2)*o;s.push({position:[Math.sin(u)*b,((k-1)/2-f)*(A+z),b-Math.cos(u)*b],rotation:[0,-u,0]})}return s},[]),i=d.width<7,c=i?[0,1.6,-4]:[2.9,.1,-2.6];return x(s=>{const o=t.current,f=j.progress;o.rotation.y=v.lerp(o.rotation.y,-.35+a.x*.15+Math.sin(s.clock.elapsedTime*.2)*.04,.05),o.rotation.x=v.lerp(o.rotation.x,-a.y*.08,.05);const r=Math.max(0,1-f*8);o.position.z=n.position.z-6+c[2],o.position.y=c[1]+f*70,o.scale.setScalar(v.lerp(o.scale.x,.6+r*.4,.1)),o.visible=r>.01}),e.jsx("group",{ref:t,position:c,children:h.map((s,o)=>e.jsx(N,{index:o,dim:i?.28:1,labels:!i,...s},o))})}const M={color:"#e9e4da",roughness:.32,metalness:.05,clearcoat:.8,clearcoatRoughness:.15},G={color:"#1d1b18",roughness:.35,metalness:.9};function m({position:t,rotation:a=[0,0,0],scale:d=1,phase:n=0}){const h=l.useRef(),i=l.useRef();return x(c=>{const s=c.clock.elapsedTime+n;h.current.rotation.y=Math.sin(s*.45)*.7,h.current.rotation.z=-.25+Math.sin(s*.3)*.08,i.current.emissiveIntensity=Math.sin(s*4)>0?6:.3}),e.jsxs("group",{position:t,rotation:a,scale:d,children:[e.jsx(U,{args:[.5,.7,.08],radius:.03,smoothness:6,position:[0,.2,-.55],children:e.jsx("meshPhysicalMaterial",{...M})}),e.jsxs("mesh",{position:[0,.2,-.3],rotation:[Math.PI/2,0,0],children:[e.jsx("cylinderGeometry",{args:[.06,.07,.45,32]}),e.jsx("meshPhysicalMaterial",{...M})]}),e.jsxs("mesh",{position:[0,.2,-.08],children:[e.jsx("sphereGeometry",{args:[.1,32,32]}),e.jsx("meshStandardMaterial",{...G})]}),e.jsx("group",{ref:h,position:[0,.2,-.08],children:e.jsxs("group",{position:[0,.16,.45],children:[e.jsxs("mesh",{rotation:[Math.PI/2,0,0],children:[e.jsx("capsuleGeometry",{args:[.2,.7,16,48]}),e.jsx("meshPhysicalMaterial",{...M})]}),e.jsxs("mesh",{position:[0,.16,.08],rotation:[Math.PI/2,0,0],children:[e.jsx("cylinderGeometry",{args:[.26,.26,.95,48,1,!0,-Math.PI/2.4,Math.PI/1.2]}),e.jsx("meshPhysicalMaterial",{...M,side:O})]}),e.jsxs("mesh",{position:[0,0,.52],rotation:[Math.PI/2,0,0],children:[e.jsx("cylinderGeometry",{args:[.15,.17,.12,48]}),e.jsx("meshStandardMaterial",{...G})]}),e.jsxs("mesh",{position:[0,0,.585],scale:[1,1,.45],children:[e.jsx("sphereGeometry",{args:[.12,48,48]}),e.jsx("meshPhysicalMaterial",{color:"#0a0d14",roughness:.02,metalness:.2,clearcoat:1,iridescence:1,iridescenceIOR:1.6,iridescenceThicknessRange:[200,600]})]}),e.jsxs("mesh",{position:[.11,-.11,.55],children:[e.jsx("sphereGeometry",{args:[.018,16,16]}),e.jsx("meshStandardMaterial",{ref:i,color:"#ff4b3e",emissive:"#ff4b3e",emissiveIntensity:4,toneMapped:!1})]})]})})]})}function D(t){return e.jsxs("mesh",{...t,children:[e.jsx("torusKnotGeometry",{args:[.7,.22,300,48]}),e.jsx("meshPhysicalMaterial",{color:"#ffd27a",transmission:1,thickness:1.2,roughness:.05,ior:1.45,clearcoat:1,attenuationColor:"#ffb000",attenuationDistance:1.5})]})}function q(t){return e.jsxs("mesh",{...t,children:[e.jsx("sphereGeometry",{args:[.75,96,96]}),e.jsx("meshPhysicalMaterial",{color:"#ffffff",metalness:1,roughness:.06,clearcoat:1})]})}function J(t){return e.jsxs("mesh",{...t,children:[e.jsx("capsuleGeometry",{args:[.38,1.1,24,64]}),e.jsx("meshPhysicalMaterial",{color:"#ff8a7a",transmission:.95,thickness:.8,roughness:.35,ior:1.4,attenuationColor:"#ff4b3e",attenuationDistance:1.2})]})}function Q(t){return e.jsxs("mesh",{...t,children:[e.jsx("torusGeometry",{args:[.8,.09,64,200]}),e.jsx("meshStandardMaterial",{color:"#d9a441",metalness:1,roughness:.22})]})}const E=[{C:m,at:.1,side:1,r:[0,-.7,0],s:1.6,phase:0},{C:D,at:.2,side:-1,s:1.3},{C:q,at:.32,side:1,s:1.2},{C:m,at:.43,side:-1,r:[0,.7,0],s:1.6,phase:2},{C:J,at:.55,side:1,r:[.4,0,.6],s:1.3},{C:Q,at:.66,side:-1,r:[1.1,.3,0],s:1.4},{C:D,at:.78,side:1,s:1.1},{C:m,at:.9,side:-1,r:[0,.7,0],s:1.6,phase:4}],L=9,Z=70;function ee(){const t=l.useRef(),a=l.useRef([]),d=l.useRef([]),{camera:n,viewport:h,size:i}=R();return x((c,s)=>{t.current.position.set(n.position.x*.5,n.position.y,n.position.z-L);const o=L*Math.tan(v.degToRad(n.fov/2)),f=o*(i.width/i.height),r=j.progress;E.forEach((u,C)=>{const g=a.current[C];if(!g)return;const I=(r-u.at)*Z;g.position.set(u.side*f*(i.width<760?1:.9),I,0),g.visible=Math.abs(I)<o+3;const P=d.current[C];P&&u.C!==m&&(P.rotation.y+=s*.3,P.rotation.x+=s*.12)})}),e.jsx("group",{ref:t,children:E.map(({C:c,r:s,s:o=1,phase:f},r)=>e.jsx("group",{ref:u=>a.current[r]=u,children:e.jsx(V,{speed:1.2,rotationIntensity:c===m?.15:.6,floatIntensity:.8,children:c===m?e.jsx(m,{rotation:s,scale:o,phase:f}):e.jsx("group",{ref:u=>d.current[r]=u,rotation:s||[0,0,0],scale:o,children:e.jsx(c,{})})})},r))})}const S=60;function te({count:t=4e3}){const a=l.useRef(),[d,n]=l.useMemo(()=>{const h=new Float32Array(t*3),i=new Float32Array(t*3),c=[new y("#ffb000"),new y("#ff4b3e"),new y("#f2ebdd"),new y("#7ee0a1")];for(let s=0;s<t;s++){const o=20+Math.random()*60,f=Math.random()*Math.PI*2;h[s*3]=Math.cos(f)*o,h[s*3+1]=(Math.random()-.5)*80,h[s*3+2]=-Math.random()*(S+60)+20;const r=c[Math.random()<.7?2:Math.floor(Math.random()*4)];i.set([r.r,r.g,r.b],s*3)}return[h,i]},[t]);return x((h,i)=>{a.current.rotation.z+=i*.01}),e.jsxs("points",{ref:a,children:[e.jsxs("bufferGeometry",{children:[e.jsx("bufferAttribute",{attach:"attributes-position",count:t,array:d,itemSize:3}),e.jsx("bufferAttribute",{attach:"attributes-color",count:t,array:n,itemSize:3})]}),e.jsx("pointsMaterial",{size:.12,vertexColors:!0,transparent:!0,opacity:.85,sizeAttenuation:!0,depthWrite:!1})]})}function se(){const{camera:t,pointer:a}=R(),d=l.useMemo(()=>new K,[]);return x(()=>{const n=6-j.progress*S;d.set(a.x*.6,a.y*.4-j.progress*2,n),t.position.lerp(d,.06),t.rotation.z=v.lerp(t.rotation.z,j.velocity*-8e-4,.1),t.lookAt(a.x*.3,a.y*.2,n-8)}),null}function ie(){return e.jsx("div",{className:"webgl","aria-hidden":"true",children:e.jsxs(W,{dpr:[1,1.75],camera:{position:[0,0,6],fov:55},gl:{antialias:!0,powerPreference:"high-performance",toneMapping:_,toneMappingExposure:1.1},children:[e.jsx("color",{attach:"background",args:["#0c0b09"]}),e.jsx("fog",{attach:"fog",args:["#0c0b09",8,34]}),e.jsx("ambientLight",{intensity:.15}),e.jsx("directionalLight",{position:[5,6,4],intensity:2.2,color:"#fff1d6"}),e.jsx("directionalLight",{position:[-6,-2,-3],intensity:1.2,color:"#ff4b3e"}),e.jsx("directionalLight",{position:[0,-4,6],intensity:.6,color:"#ffb000"}),e.jsxs(H,{resolution:256,frames:1,children:[e.jsx("color",{attach:"background",args:["#0d0b08"]}),e.jsx(p,{form:"rect",intensity:4,position:[0,6,0],"rotation-x":Math.PI/2,scale:[12,6,1],color:"#fff3dc"}),e.jsx(p,{form:"rect",intensity:2.5,position:[-6,1,2],"rotation-y":Math.PI/2,scale:[3,8,1],color:"#ffd18a"}),e.jsx(p,{form:"rect",intensity:2.5,position:[6,1,2],"rotation-y":-Math.PI/2,scale:[3,8,1],color:"#ffffff"}),e.jsx(p,{form:"ring",intensity:3,position:[2,2,7],scale:2.5,color:"#ffb000"}),e.jsx(p,{form:"rect",intensity:1.5,position:[0,-5,-4],"rotation-x":-Math.PI/2,scale:[10,2,1],color:"#ff4b3e"}),e.jsx(p,{form:"rect",intensity:1,position:[0,0,-8],scale:[14,1,1],color:"#ffe6b0"})]}),e.jsx(te,{}),e.jsx(B,{count:120,scale:[16,10,S],position:[0,0,-S/2],size:2.5,speed:.4,color:"#ffb000"}),e.jsx(X,{}),e.jsx(l.Suspense,{fallback:null,children:e.jsx(ee,{})}),e.jsx(se,{})]})})}export{ie as default};
