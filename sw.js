/* O Enfermeiro CP — service worker. A versão do cache muda sozinha em cada publicação (build.mjs). */
const CACHE = "ec-mutmyvb7";
const EXTRA = ["img/00fc363149.webp","img/2b27b664f1.webp","img/2eb6e7a8a2.webp","img/30f78f4760.webp","img/3719be319a.webp","img/4b4a48e446.webp","img/4c09dfcc0a.webp","img/68851d1b0d.webp","img/7523381ad5.webp","img/77ef8791bd.webp","img/81008a93a3.png","img/81d386df91.webp","img/90ee950391.webp","img/96e46fc03f.png","img/9e5db6eeac.webp","img/a1ca6a50f1.png","img/a3d5c70dfe.webp","img/b6b71a99b3.webp","img/bdd4d0d045.webp","img/be302a3d86.webp","img/bf98e0744d.webp","img/c4b569e547.webp","img/c6e9e7a901.webp","img/c959e86f85.png","img/d1e94dd69f.png","img/de28f2d422.webp","img/e6b2c5758c.webp","img/f27a4af9ad.webp","img/f61b4aae02.webp","img/og-banner-v2.jpg","pdf/Enfermeiro_Competente_Manual.pdf","pdf/Lista_Nacional_Medicamentos_Essenciais_Mocambique_2017.pdf","pdf/Manual_Gastrite_Ulcerativa_Karlyon_2026.pdf","vendor/pdfjs/LICENSE","vendor/pdfjs/pdf.min.mjs","vendor/pdfjs/pdf.worker.min.mjs","js/ec-leitor.js","js/app-card.js","js/app-01.js","js/app-02.js","js/app-03.js","js/app-04.js","js/app-05.js","js/app-06.js","js/app-07.js","js/app-08.js","js/app-09.js","js/app-10.js","js/app-11.js","js/app-12.js","js/app-13.js","js/app-14.js","js/app-15.js","js/app-16.js","js/app-17.js","js/app-18.js"];
const CORE = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'cms-biblioteca.js', 'site.js', 'deeplink.js', 'js/ec-leitor.js', 'js/app-card.js', 'guias.css', 'conteudo.json', 'favicon.ico', 'apple-touch-icon.png', 'android-chrome-192x192.png', 'android-chrome-512x512.png', 'og-image.jpg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.concat(EXTRA).map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

const netFirst = req => fetch(req).then(res => {
  if (res.status === 200) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {}); }
  return res;
}).catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : Response.error())));

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/admin')) return;
  // Páginas, conteúdo e script da biblioteca: rede primeiro (sempre actualizado), cache como reserva offline
  if (req.mode === 'navigate' || /\/(conteudo\.json|cms-biblioteca\.js|site\.js|deeplink\.js|guias\.css|calc\.js|sw\.js|ec-leitor\.js|app-card\.js)$/.test(url.pathname) || /\/js\/app-\d+\.js$/.test(url.pathname)) { e.respondWith(netFirst(req)); return; }
  // Imagens, PDFs e restantes: cache primeiro
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.status === 200) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {}); }
    return res;
  })));
});
