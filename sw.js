const V='chocachol-v7';
const SHELL=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
const put=(r,res)=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp));}return res;};
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET'||!/^https?:/.test(r.url))return;
  if(new URL(r.url).origin===location.origin){
    // own files: network first (always the latest version), cache only as offline fallback
    e.respondWith(fetch(r,{cache:'no-store'}).then(res=>put(r,res)).catch(()=>caches.match(r,{ignoreSearch:true}).then(h=>h||caches.match('index.html'))));
  }else{
    // CDN (Tailwind): cache first so the app also works offline
    e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>put(r,res))));
  }
});
