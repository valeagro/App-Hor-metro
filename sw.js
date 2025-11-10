const CACHE_NAME = 'horimetro-pro-v3'; // Mudamos para v3 para forçar atualização

// Lista APENAS arquivos locais essenciais.
// Removemos links externos (CDN) para evitar erros de CORS.
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  // Adicione seus ícones aqui APENAS se você tiver certeza que eles existem na pasta correta:
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (e) => {
  console.log('[SW] Instalando...');
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cacheando arquivos essenciais');
      // Usamos map + catch para que se UM arquivo falhar, não quebre tudo.
      return Promise.all(
        ASSETS_TO_CACHE.map(url => {
          return cache.add(url).catch(err => {
            console.warn('[SW] Falha ao cachear:', url, err);
            return Promise.resolve(); // Continua mesmo com erro
          });
        })
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  console.log('[SW] Ativado');
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[SW] Removendo cache antigo:', key);
          return caches.delete(key);
        }
      }));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Estratégia: Tenta a rede primeiro, se falhar, usa o cache.
  // Ideal para apps que precisam de dados atualizados (como o Firebase).
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Opcional: Poderíamos atualizar o cache aqui com a nova resposta bem-sucedida
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});


