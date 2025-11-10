const CACHE_NAME = 'horimetro-pro-v1';
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
          return caches.delete(key);
        }
      }));
    })
  );
});

// Interceptação de requisições (Estratégia: Network First, fallback to Cache)
// Isso garante que o usuário sempre tente pegar a versão mais recente dos dados,
// mas se estiver offline, carrega a interface do cache.
self.addEventListener('fetch', (e) => {
  // Não cacheia requisições do Firebase/Firestore para evitar dados obsoletos
  if (e.request.url.includes('firestore.googleapis.com') || e.request.url.includes('firebase')) {
      return;
  }

  e.respondWith(
    fetch(e.request)
      .catch(() => caches.match(e.request))
  );
});