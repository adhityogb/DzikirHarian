const APP_CACHE_VERSION = 'dzikir-harian-v1';
const APP_SHELL_CACHE = `app-shell-${APP_CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${APP_CACHE_VERSION}`;

const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons/android-chrome-192x192.png',
  '/icons/android-chrome-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(APP_SHELL_CACHE);
    await cache.addAll(APP_SHELL_URLS);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    const validCaches = [APP_SHELL_CACHE, RUNTIME_CACHE];

    await Promise.all(
      keys
        .filter((key) => !validCaches.includes(key))
        .map((key) => caches.delete(key)),
    );

    await self.clients.claim();
  })());
});

const isHttpRequest = (request) => request.url.startsWith('http');

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET' || !isHttpRequest(request)) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(request);
        const runtimeCache = await caches.open(RUNTIME_CACHE);
        runtimeCache.put(request, networkResponse.clone());
        return networkResponse;
      } catch {
        const cachedPage = await caches.match(request);
        if (cachedPage) return cachedPage;

        const appShell = await caches.match('/index.html');
        if (appShell) return appShell;

        return Response.error();
      }
    })());

    return;
  }

  event.respondWith((async () => {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok && request.url.startsWith(self.location.origin)) {
        const runtimeCache = await caches.open(RUNTIME_CACHE);
        runtimeCache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch {
      return Response.error();
    }
  })());
});

const getFallbackReminder = () => {
  const hour = new Date().getHours();

  if (hour >= 3 && hour < 12) {
    return {
      title: 'Dzikir Pagi',
      body: 'Waktunya dzikir pagi. Awali hari dengan tenang dan mengingat Allah.',
      tag: 'dzikir-pagi',
      url: '/?reminder=pagi',
    };
  }

  return {
    title: 'Dzikir Petang',
    body: 'Waktunya dzikir petang. Tutup sore dengan dzikir dan doa.',
    tag: 'dzikir-petang',
    url: '/?reminder=petang',
  };
};

const getPushPayload = (event) => {
  if (!event.data) return getFallbackReminder();

  try {
    return {
      ...getFallbackReminder(),
      ...event.data.json(),
    };
  } catch {
    return {
      ...getFallbackReminder(),
      body: event.data.text(),
    };
  }
};

self.addEventListener('push', (event) => {
  const data = getPushPayload(event);
  const title = data.title || 'Dzikir Harian';
  const options = {
    body: data.body || 'Waktunya membuka dzikir harian.',
    tag: data.tag || 'dzikir-reminder',
    renotify: true,
    icon: data.icon || '/icons/android-chrome-192x192.png',
    badge: data.badge || '/icons/favicon-48x48.png',
    data: {
      url: data.url || '/',
      source: data.source || 'cloudflare-worker',
      sentAt: data.sentAt || new Date().toISOString(),
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const destination = event.notification.data?.url || '/';

  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const existingClient = allClients.find((client) => 'focus' in client);

    if (existingClient) {
      await existingClient.focus();
      if ('navigate' in existingClient) {
        await existingClient.navigate(destination);
      }
      return;
    }

    await self.clients.openWindow(destination);
  })());
});
