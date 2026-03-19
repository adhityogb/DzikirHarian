self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  const data = event.data?.json?.() ?? {};
  const title = data.title || 'Dzikir Harian';
  const options = {
    body: data.body || 'Waktunya membuka dzikir harian.',
    tag: data.tag || 'dzikir-reminder',
    renotify: true,
    icon: data.icon || '/icons/android-chrome-192x192.png',
    badge: data.badge || '/icons/favicon-48x48.png',
    data: {
      url: data.url || '/',
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
