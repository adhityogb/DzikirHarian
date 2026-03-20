self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
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
