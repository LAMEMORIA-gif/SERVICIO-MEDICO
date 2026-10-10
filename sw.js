// Service worker – estrategia network-first (se actualiza solo cuando hay señal)
const CACHE='servicio-medico-v2';
const ARCHIVOS=['./','./index.html','./panel.html','./manifest.json','./icon.svg','./manifest-panel.json','./icon-panel.svg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ARCHIVOS).catch(()=>{})));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();if(r.ok&&new URL(e.request.url).origin===location.origin)caches.open(CACHE).then(c=>c.put(e.request,cp));return r;})
    .catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('./index.html'))));
});
