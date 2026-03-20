# Dzikir Push Worker

Cloudflare Worker ini menangani Web Push subscription, penyimpanan subscription di D1, dan pengiriman notifikasi terjadwal via Cron Trigger supaya pengingat tetap masuk saat aplikasi sedang tertutup.

## Fitur
- `POST /api/subscriptions` untuk upsert subscription browser.
- `DELETE /api/subscriptions` untuk unsubscribe perangkat.
- `POST /api/dispatch/test` untuk mengirim push uji ke subscription aktif.
- Cron Worker setiap menit untuk mencari jadwal yang jatuh tempo dan mengirim push pagi/petang.
- D1 dipakai agar query pengiriman berdasarkan `next_morning_at` / `next_evening_at` efisien tanpa full scan global.
- Tidak bergantung pada library push eksternal; Worker mengirim Web Push request langsung memakai VAPID key.

## Setup
1. Masuk ke folder worker.
2. Generate VAPID key.
3. Buat D1 database.
4. Jalankan migration.
5. Simpan secret ke Worker.
6. Deploy.

### Perintah
```bash
cd cloudflare/push-worker
npm run generate:vapid
npx wrangler d1 create dzikir_push
npx wrangler d1 execute dzikir_push --file=./migrations/0001_init.sql
npx wrangler secret put VAPID_PUBLIC_KEY
npx wrangler secret put VAPID_PRIVATE_KEY
npx wrangler deploy
```

## Environment Worker
- `APP_ORIGIN`: origin frontend yang diizinkan mengakses API worker, mis. `https://dzikir.example.com`.
- `VAPID_SUBJECT`: email atau URL identitas pengirim web push, mis. `mailto:admin@example.com`.
- `VAPID_PUBLIC_KEY`: public VAPID key hasil `npm run generate:vapid`.
- `VAPID_PRIVATE_KEY`: private VAPID key hasil `npm run generate:vapid`.

## Environment Frontend
Isi `.env` atau secret build frontend:
```bash
VITE_PUSH_WORKER_URL=https://dzikir-push-worker.<subdomain>.workers.dev
VITE_WEB_PUSH_PUBLIC_KEY=<public-vapid-key>
```

## Catatan penting
- iOS tetap mensyaratkan PWA dipasang ke Home Screen untuk menerima Web Push.
- Cron Worker tiap menit dipilih agar jadwal tetap presisi tanpa bergantung pada tab aktif.
- Worker mengirim payload-less push yang aman dan ringan; Service Worker frontend menentukan tampilan pesan berdasarkan waktu kedatangan notifikasi.
- Jika subscription menjadi invalid (`404/410`), Worker otomatis menghapusnya dari D1.
