// Service worker – estrategia network-first (se actualiza solo cuando hay señal)
const CACHE='servicio-medico-v5';
const ARCHIVOS=['./','./index.html','./panel.html','./manifest.json','./icon.svg','./manifest-panel.json','./icon-panel.svg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ARCHIVOS).catch(()=>{})));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
// Apertura rápida aunque la señal sea débil: si la red no responde en 3 segundos se abre la copia guardada
// (y la red la actualiza por detrás). Antes, con poca señal, la app se quedaba congelada en el ícono.
const TIEMPO_RED = 3000;
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const red = fetch(req, { cache: 'no-store' }).then(r => {
    if (r && r.ok && r.type === 'basic') { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)).catch(() => {}); }
    return r;
  });
  e.waitUntil(red.then(() => {}, () => {}));
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const guardado = (await c.match(req)) || (await c.match(req, { ignoreSearch: true })) ||
      (req.mode === 'navigate' ? ((await c.match('./index.html')) || (await c.match('./'))) : undefined);
    if (!guardado) return red.catch(() => Response.error());
    const r = await Promise.race([red.catch(() => null), new Promise(res => setTimeout(() => res(null), TIEMPO_RED))]);
    return (r && r.ok) ? r : guardado;
  })());
});
