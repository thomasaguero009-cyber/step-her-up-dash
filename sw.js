// Service worker mínimo: deja instalar el dashboard como app y, sin internet, abre la última pantalla guardada.
// Siempre pide primero a la red, así nunca se queda con una versión vieja. Las consultas de datos no se guardan.
const V = 'shu-dash-v1';
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(['/', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'])).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  if (r.mode === 'navigate' && (u.pathname === '/' || u.pathname === '/index.html')) {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put('/', cp)); return res; }).catch(() => caches.match('/')));
    return;
  }
  if (/^\/(icon-|manifest|apple-touch)/.test(u.pathname)) {
    e.respondWith(fetch(r).catch(() => caches.match(r)));
  }
});
