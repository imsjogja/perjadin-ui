# Perjadin UI

Frontend Perjalanan Dinas berbasis Vue 3, Vite, dan Tailwind CSS. UI menggunakan `VITE_PERJADIN_API_URL` untuk mengakses Laravel Perjadin API dan referensi pegawai yang disediakan aplikasi.

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Halaman inti: dashboard, daftar dan pembuatan SPT, detail dan pelaksana SPT, pembuatan SPPD, serta pencarian pegawai read-only.

## Docker lokal

Jalankan backend terlebih dahulu pada port `8000`, kemudian:

```bash
cp .env.local.example .env.local
docker compose build
docker compose up -d
```

UI tersedia di `http://localhost:5175`. Vite membaca `VITE_PERJADIN_API_URL` dari `.env.local` saat `npm run dev` maupun saat image Docker dibangun. File tersebut diabaikan Git; setelah mengubahnya, bangun ulang image dengan `docker compose build --no-cache ui` lalu jalankan `docker compose up -d --force-recreate ui`.
