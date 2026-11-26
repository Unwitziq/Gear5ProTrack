// Offline-Cache. Bei jedem Build ändert sich die Versionsnummer, dann wird der Cache erneuert.
const CACHE="protrack-1795720398314";
const FILES=["./","index.html","manifest.webmanifest","icon-180.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).catch(()=>{}).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
const clean=r=>!r||!r.redirected?r:r.blob().then(b=>new Response(b,{status:r.status,statusText:r.statusText,headers:r.headers}));
const shell=()=>caches.match("index.html",{ignoreSearch:true}).then(h=>h||caches.match("./",{ignoreSearch:true})).then(h=>h?clean(h):Response.error());
self.addEventListener("fetch",e=>{
  const q=e.request;if(q.method!=="GET"||new URL(q.url).origin!==self.location.origin)return;
  if(q.mode==="navigate"){
    e.respondWith(new Promise(res=>{let ok=false;
      const t=setTimeout(()=>{if(!ok){ok=true;res(shell());}},2500);
      fetch(q).then(r=>{if(r&&r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put("index.html",cp)).catch(()=>{});}
        if(!ok){ok=true;clearTimeout(t);res(r&&(r.ok||r.type==="opaqueredirect")?clean(r):shell());}}).catch(()=>{if(!ok){ok=true;clearTimeout(t);res(shell());}});}));
    return;}
  e.respondWith(caches.match(q,{ignoreSearch:true}).then(hit=>{
    const net=fetch(q).then(r=>{if(r&&r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(q,cp)).catch(()=>{});}return r;}).catch(()=>hit||Response.error());
    return hit?clean(hit):net;
  }));
});
