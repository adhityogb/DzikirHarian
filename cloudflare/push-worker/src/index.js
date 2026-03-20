const json = (body, init = {}) => new Response(JSON.stringify(body), {
  ...init,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    ...(init.headers || {}),
  },
});

const toErrorMessage = (error) => {
  if (error instanceof Error && error.message) return error.message;
  return 'Terjadi kesalahan yang tidak diketahui.';
};

const getAllowedOrigin = (request, env) => {
  const requestOrigin = request.headers.get('Origin');
  const rawOrigins = (env.APP_ORIGIN || '').split(',').map((item) => item.trim()).filter(Boolean);

  if (!requestOrigin) {
    return rawOrigins[0] || '*';
  }

  if (rawOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  return rawOrigins[0] || '*';
};

const withCors = (request, env, response) => {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', getAllowedOrigin(request, env));
  headers.set('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Max-Age', '86400');
  headers.set('Vary', 'Origin');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

const pad = (value) => String(value).padStart(2, '0');

const getZonedParts = (date, timezone) => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(date);
  const get = (type) => Number(parts.find((item) => item.type === type)?.value || 0);

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  };
};

const addCalendarDays = ({ year, month, day }, days) => {
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
};

const zonedDateTimeToUtcMs = ({ timezone, year, month, day, hour, minute, second = 0 }) => {
  let guess = Date.UTC(year, month - 1, day, hour, minute, second);

  for (let step = 0; step < 3; step += 1) {
    const parts = getZonedParts(new Date(guess), timezone);
    const expected = Date.UTC(year, month - 1, day, hour, minute, second);
    const received = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    const diff = expected - received;

    if (diff === 0) break;
    guess += diff;
  }

  return guess;
};

const getLocalDateKey = (date, timezone) => {
  const parts = getZonedParts(date, timezone);
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
};

const getNextOccurrenceIso = ({ timezone, hour, minute, fromDate = new Date() }) => {
  const localNow = getZonedParts(fromDate, timezone);
  const todayTargetMs = zonedDateTimeToUtcMs({
    timezone,
    year: localNow.year,
    month: localNow.month,
    day: localNow.day,
    hour,
    minute,
  });

  if (todayTargetMs > fromDate.getTime() + 30_000) {
    return new Date(todayTargetMs).toISOString();
  }

  const tomorrow = addCalendarDays(localNow, 1);
  return new Date(zonedDateTimeToUtcMs({ timezone, ...tomorrow, hour, minute })).toISOString();
};

const readJson = async (request) => {
  try {
    return await request.json();
  } catch {
    throw new Error('Body JSON tidak valid.');
  }
};

const validateSubscriptionPayload = (body) => {
  if (!body?.subscription?.endpoint || !body.subscription.keys?.p256dh || !body.subscription.keys?.auth) {
    throw new Error('Payload subscription tidak lengkap.');
  }

  const timezone = body.preferences?.timezone || 'UTC';
  const locale = body.preferences?.locale || 'id-ID';
  const morningHour = Number(body.preferences?.morningHour ?? 5);
  const morningMinute = Number(body.preferences?.morningMinute ?? 30);
  const eveningHour = Number(body.preferences?.eveningHour ?? 17);
  const eveningMinute = Number(body.preferences?.eveningMinute ?? 0);

  if (Number.isNaN(morningHour) || Number.isNaN(morningMinute) || Number.isNaN(eveningHour) || Number.isNaN(eveningMinute)) {
    throw new Error('Jam pengingat tidak valid.');
  }

  return {
    subscription: body.subscription,
    preferences: {
      timezone,
      locale,
      morningHour,
      morningMinute,
      eveningHour,
      eveningMinute,
    },
  };
};

const sha256Hex = async (value) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((item) => item.toString(16).padStart(2, '0')).join('');
};

const decodeBase64Url = (value) => {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
};

const encodeBase64Url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

const derToJose = (signature, size = 32) => {
  const bytes = signature instanceof Uint8Array ? signature : new Uint8Array(signature);

  if (bytes[0] !== 0x30) {
    if (bytes.length === size * 2) return bytes;
    throw new Error('Format signature ECDSA tidak valid.');
  }

  let offset = 2;
  if (bytes[1] > 0x80) {
    offset = 2 + (bytes[1] - 0x80);
  }

  if (bytes[offset] !== 0x02) {
    throw new Error('Format signature ECDSA tidak valid.');
  }

  const rLength = bytes[offset + 1];
  const r = bytes.slice(offset + 2, offset + 2 + rLength);
  offset = offset + 2 + rLength;

  if (bytes[offset] !== 0x02) {
    throw new Error('Format signature ECDSA tidak valid.');
  }

  const sLength = bytes[offset + 1];
  const s = bytes.slice(offset + 2, offset + 2 + sLength);
  const jose = new Uint8Array(size * 2);
  jose.set(r.slice(-size), size - Math.min(size, r.length));
  jose.set(s.slice(-size), (size * 2) - Math.min(size, s.length));
  return jose;
};

const importVapidPrivateKey = async (publicKey, privateKey) => {
  const publicBytes = decodeBase64Url(publicKey);
  const privateBytes = decodeBase64Url(privateKey);

  if (publicBytes.length !== 65 || publicBytes[0] !== 4 || privateBytes.length !== 32) {
    throw new Error('Format VAPID key tidak valid. Pastikan memakai output base64url standar.');
  }

  return crypto.subtle.importKey('jwk', {
    kty: 'EC',
    crv: 'P-256',
    x: encodeBase64Url(publicBytes.slice(1, 33)),
    y: encodeBase64Url(publicBytes.slice(33, 65)),
    d: encodeBase64Url(privateBytes),
    ext: false,
  }, {
    name: 'ECDSA',
    namedCurve: 'P-256',
  }, false, ['sign']);
};

const createVapidJwt = async (endpoint, env) => {
  const audience = new URL(endpoint).origin;
  const header = {
    alg: 'ES256',
    typ: 'JWT',
  };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + (12 * 60 * 60),
    sub: env.VAPID_SUBJECT,
  };
  const encodedHeader = encodeBase64Url(new TextEncoder().encode(JSON.stringify(header)));
  const encodedPayload = encodeBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const privateKey = await importVapidPrivateKey(env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
  const derSignature = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, new TextEncoder().encode(signingInput)));
  const joseSignature = derToJose(derSignature);

  return `${signingInput}.${encodeBase64Url(joseSignature)}`;
};

const sendWebPush = async ({ endpoint, topic, env }) => {
  const token = await createVapidJwt(endpoint, env);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      TTL: '3600',
      Urgency: 'high',
      Topic: topic,
      Authorization: `vapid t=${token}, k=${env.VAPID_PUBLIC_KEY}`,
      'Crypto-Key': `p256ecdsa=${env.VAPID_PUBLIC_KEY}`,
      'Content-Length': '0',
    },
  });

  if (!response.ok) {
    const error = new Error(`Push service menolak request dengan status ${response.status}.`);
    error.status = response.status;
    throw error;
  }
};

const upsertSubscription = async (request, env) => {
  const body = validateSubscriptionPayload(await readJson(request));
  const endpointHash = await sha256Hex(body.subscription.endpoint);
  const nowIso = new Date().toISOString();
  const nextMorningAt = getNextOccurrenceIso({
    timezone: body.preferences.timezone,
    hour: body.preferences.morningHour,
    minute: body.preferences.morningMinute,
  });
  const nextEveningAt = getNextOccurrenceIso({
    timezone: body.preferences.timezone,
    hour: body.preferences.eveningHour,
    minute: body.preferences.eveningMinute,
  });

  await env.DB.prepare(`
    INSERT INTO push_subscriptions (
      endpoint_hash,
      endpoint,
      subscription_json,
      timezone,
      locale,
      morning_hour,
      morning_minute,
      evening_hour,
      evening_minute,
      next_morning_at,
      next_evening_at,
      is_active,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    ON CONFLICT(endpoint_hash) DO UPDATE SET
      endpoint = excluded.endpoint,
      subscription_json = excluded.subscription_json,
      timezone = excluded.timezone,
      locale = excluded.locale,
      morning_hour = excluded.morning_hour,
      morning_minute = excluded.morning_minute,
      evening_hour = excluded.evening_hour,
      evening_minute = excluded.evening_minute,
      next_morning_at = excluded.next_morning_at,
      next_evening_at = excluded.next_evening_at,
      is_active = 1,
      updated_at = excluded.updated_at
  `)
    .bind(
      endpointHash,
      body.subscription.endpoint,
      JSON.stringify(body.subscription),
      body.preferences.timezone,
      body.preferences.locale,
      body.preferences.morningHour,
      body.preferences.morningMinute,
      body.preferences.eveningHour,
      body.preferences.eveningMinute,
      nextMorningAt,
      nextEveningAt,
      nowIso,
      nowIso,
    )
    .run();

  return json({
    ok: true,
    endpointHash,
    nextMorningAt,
    nextEveningAt,
  });
};

const deactivateSubscription = async (request, env) => {
  const body = await readJson(request);

  if (!body?.endpoint) {
    throw new Error('Endpoint subscription wajib dikirim saat unsubscribe.');
  }

  const endpointHash = await sha256Hex(body.endpoint);
  await env.DB.prepare('DELETE FROM push_subscriptions WHERE endpoint_hash = ?').bind(endpointHash).run();

  return json({ ok: true, endpointHash });
};

const sendTestNotification = async (request, env) => {
  const body = validateSubscriptionPayload(await readJson(request));
  await sendWebPush({
    endpoint: body.subscription.endpoint,
    topic: 'dzikir-test',
    env,
  });

  return json({ ok: true });
};

const updateScheduleAfterSend = async ({ env, row, kind, sentAt }) => {
  const localSentDate = getLocalDateKey(sentAt, row.timezone);

  if (kind === 'morning') {
    const nextMorningAt = getNextOccurrenceIso({
      timezone: row.timezone,
      hour: row.morning_hour,
      minute: row.morning_minute,
      fromDate: new Date(sentAt.getTime() + 60_000),
    });

    await env.DB.prepare(`
      UPDATE push_subscriptions
      SET next_morning_at = ?, last_morning_sent_on = ?, updated_at = ?
      WHERE endpoint_hash = ?
    `).bind(nextMorningAt, localSentDate, sentAt.toISOString(), row.endpoint_hash).run();

    return;
  }

  const nextEveningAt = getNextOccurrenceIso({
    timezone: row.timezone,
    hour: row.evening_hour,
    minute: row.evening_minute,
    fromDate: new Date(sentAt.getTime() + 60_000),
  });

  await env.DB.prepare(`
    UPDATE push_subscriptions
    SET next_evening_at = ?, last_evening_sent_on = ?, updated_at = ?
    WHERE endpoint_hash = ?
  `).bind(nextEveningAt, localSentDate, sentAt.toISOString(), row.endpoint_hash).run();
};

const deactivateBrokenSubscription = async (env, row) => {
  await env.DB.prepare('DELETE FROM push_subscriptions WHERE endpoint_hash = ?').bind(row.endpoint_hash).run();
};

const processDueRows = async ({ env, rows, kind }) => {
  const now = new Date();
  const topic = kind === 'morning' ? 'dzikir-pagi' : 'dzikir-petang';

  await Promise.allSettled(rows.map(async (row) => {
    try {
      await sendWebPush({
        endpoint: row.endpoint,
        topic,
        env,
      });
      await updateScheduleAfterSend({ env, row, kind, sentAt: now });
    } catch (error) {
      const status = error?.status;
      if (status === 404 || status === 410) {
        await deactivateBrokenSubscription(env, row);
        return;
      }

      throw error;
    }
  }));
};

const runScheduledDispatch = async (env) => {
  const nowIso = new Date().toISOString();
  const morningRows = await env.DB.prepare(`
    SELECT * FROM push_subscriptions
    WHERE is_active = 1
      AND next_morning_at IS NOT NULL
      AND next_morning_at <= ?
  `).bind(nowIso).all();
  const eveningRows = await env.DB.prepare(`
    SELECT * FROM push_subscriptions
    WHERE is_active = 1
      AND next_evening_at IS NOT NULL
      AND next_evening_at <= ?
  `).bind(nowIso).all();

  await processDueRows({ env, rows: morningRows.results || [], kind: 'morning' });
  await processDueRows({ env, rows: eveningRows.results || [], kind: 'evening' });
};

const handleRequest = async (request, env) => {
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  if (request.method === 'GET' && url.pathname === '/api/health') {
    return json({ ok: true, service: 'dzikir-push-worker' });
  }

  if (request.method === 'POST' && url.pathname === '/api/subscriptions') {
    return upsertSubscription(request, env);
  }

  if (request.method === 'DELETE' && url.pathname === '/api/subscriptions') {
    return deactivateSubscription(request, env);
  }

  if (request.method === 'POST' && url.pathname === '/api/dispatch/test') {
    return sendTestNotification(request, env);
  }

  return json({ error: 'Route tidak ditemukan.' }, { status: 404 });
};

export default {
  async fetch(request, env) {
    try {
      const response = await handleRequest(request, env);
      return withCors(request, env, response);
    } catch (error) {
      return withCors(request, env, json({ error: toErrorMessage(error) }, { status: 500 }));
    }
  },

  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(runScheduledDispatch(env));
  },
};
