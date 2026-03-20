const PUSH_WORKER_URL = import.meta.env.VITE_PUSH_WORKER_URL?.replace(/\/$/, '') || '';
const WEB_PUSH_PUBLIC_KEY = import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY || '';

export const PUSH_CONFIG_READY = Boolean(PUSH_WORKER_URL && WEB_PUSH_PUBLIC_KEY);

const ensureJson = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    if (!response.ok) {
      throw new Error('Server push worker merespons format yang tidak dikenali.');
    }

    return null;
  }

  return response.json();
};

const request = async (path, options = {}) => {
  if (!PUSH_WORKER_URL) {
    throw new Error('VITE_PUSH_WORKER_URL belum diatur.');
  }

  const response = await fetch(`${PUSH_WORKER_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await ensureJson(response);

  if (!response.ok) {
    throw new Error(payload?.error || 'Push worker tidak dapat memproses permintaan.');
  }

  return payload;
};

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
};

export const getPushSupport = () => ({
  notifications: 'Notification' in window,
  serviceWorker: 'serviceWorker' in navigator,
  pushManager: 'PushManager' in window,
  configReady: PUSH_CONFIG_READY,
  workerUrl: PUSH_WORKER_URL,
});

export const getPushPreferencesPayload = () => ({
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  locale: navigator.language || 'id-ID',
  morningHour: 5,
  morningMinute: 30,
  eveningHour: 17,
  eveningMinute: 0,
});

export const syncPushSubscriptionState = async (registration) => {
  if (!registration?.pushManager) return null;
  return registration.pushManager.getSubscription();
};

export const upsertPushSubscription = async ({ registration }) => {
  if (!registration?.pushManager) {
    throw new Error('PushManager tidak tersedia di browser ini.');
  }

  if (!WEB_PUSH_PUBLIC_KEY) {
    throw new Error('VITE_WEB_PUSH_PUBLIC_KEY belum diatur.');
  }

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(WEB_PUSH_PUBLIC_KEY),
    });
  }

  await request('/api/subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      subscription: subscription.toJSON(),
      preferences: getPushPreferencesPayload(),
    }),
  });

  return subscription;
};

export const removePushSubscription = async ({ registration }) => {
  if (!registration?.pushManager) return;

  const existingSubscription = await registration.pushManager.getSubscription();

  if (existingSubscription) {
    await request('/api/subscriptions', {
      method: 'DELETE',
      body: JSON.stringify({
        endpoint: existingSubscription.endpoint,
      }),
    }).catch(() => null);

    await existingSubscription.unsubscribe();
  }
};

export const sendPushTest = async ({ registration }) => {
  if (!registration?.pushManager) {
    throw new Error('PushManager tidak tersedia di browser ini.');
  }

  const existingSubscription = await registration.pushManager.getSubscription();

  if (!existingSubscription) {
    throw new Error('Subscription push belum aktif di perangkat ini.');
  }

  return request('/api/dispatch/test', {
    method: 'POST',
    body: JSON.stringify({
      subscription: existingSubscription.toJSON(),
      preferences: getPushPreferencesPayload(),
    }),
  });
};
