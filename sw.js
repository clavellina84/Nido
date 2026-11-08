// NIDO 8213451903: funciona sin internet. La app se guarda al instalarla; las fuentes se guardan la primera vez que cargan.
const CACHE = 'nido-8213451903';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE && k.startsWith('nido-')).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (u.origin === location.origin) { e.respondWith(fetch(e.request).then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))); return; }
  if (/fonts\.(googleapis|gstatic)\.com/.test(u.host)) e.respondWith(caches.open('nido-fonts').then((c) => c.match(e.request).then((hit) => hit || fetch(e.request).then((r) => { c.put(e.request, r.clone()); return r; }))));
});
// Avisos: el servidor manda {title, body, tag}; al tocarlo se abre NIDO.
self.addEventListener('push', (e) => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { d = { title: 'NIDO', body: e.data ? e.data.text() : '' }; }
  try { if (d.badge != null && self.navigator.setAppBadge) self.navigator.setAppBadge(d.badge); } catch (x) { }
  e.waitUntil(self.registration.showNotification(d.title || 'NIDO', { body: d.body || '', tag: d.tag || 'nido', renotify: true, icon: 'icon-192.png', badge: 'icon-192.png', data: { url: './' } }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => { for (const c of cs) if ('focus' in c) return c.focus(); return self.clients.openWindow('./'); }));
});
