# Dzikir Harian

Aplikasi dzikir pagi dan petang berbasis React + Vite + PWA.

## Menjalankan frontend
```bash
npm install
npm run dev
```

## Dukungan offline (tanpa internet)
Aplikasi kini dapat tetap dibuka saat perangkat offline setelah kunjungan pertama berhasil memuat app shell.
Service Worker akan:
- Menyimpan halaman utama (`/` dan `index.html`) serta aset manifest/icon ke cache.
- Menggunakan cache runtime untuk file JS/CSS/gambar yang sudah pernah diakses.
- Memakai fallback ke `index.html` saat navigasi dilakukan ketika offline.

## Konfigurasi Web Push Cloudflare
Frontend sekarang memakai Cloudflare Worker untuk menyimpan Web Push subscription dan mengirim pengingat saat app sedang tertutup.

### 1. Isi env frontend
Salin `.env.example` menjadi `.env` lalu isi:
```bash
VITE_PUSH_WORKER_URL=https://dzikir-push-worker.<subdomain>.workers.dev
VITE_WEB_PUSH_PUBLIC_KEY=<public-vapid-key>
```

### 2. Deploy worker
Lihat panduan lengkap di `cloudflare/push-worker/README.md`.

### 3. Jalankan frontend
```bash
npm run dev
```

## Arsitektur notifikasi
- Browser membuat `PushSubscription` lewat Service Worker.
- Frontend mengirim subscription itu ke Cloudflare Worker.
- Worker menyimpan subscription di D1 bersama timezone dan jadwal pagi/petang.
- Cron Trigger Worker berjalan setiap menit untuk mengirim Web Push yang jatuh tempo.
- Service Worker frontend menerima event `push` dan menampilkan notifikasi.

## Catatan
- iPhone/iPad tetap memerlukan mode Home Screen app untuk Web Push.
- Tanpa env push yang valid, toggle pengingat akan menampilkan status bahwa worker belum dikonfigurasi.
