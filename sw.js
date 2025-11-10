const CACHE_NAME = 'horimetro-pro-v2'; // Alterado para v2 para forçar a atualização
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest'
];

// Instalação do Service Worker e cache dos recursos estáticos
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pula a espera e ativa o novo SW imediatamente
      self.skipWaiting();
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('Limpando cache antigo:', key);
          return caches.delete(key);
        }
      }));
    }).then(() => self.clients.claim()) // Controla a página imediatamente
  );
});

// Interceptação de requisições (Network First)
self.addEventListener('fetch', (e) => {
  // Não cacheia requisições do Firebase
  if (e.request.url.includes('firestore.googleapis.com') || e.request.url.includes('firebase')) {
      return;
  }

  e.respondWith(
    fetch(e.request)
      .catch(() => caches.match(e.request))
  );
});
