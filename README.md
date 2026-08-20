# Perjadin UI

Frontend Perjalanan Dinas berbasis Vue 3, Vite, dan Tailwind CSS. UI menggunakan `VITE_PERJADIN_API_URL` untuk mengakses Laravel Perjadin API; data pegawai selalu melalui proxy Perjadin ke SIKKEPO.

```bash
cp .env.example .env
npm install
npm run dev
```

Halaman inti: dashboard, daftar dan pembuatan SPT, detail dan pelaksana SPT, pembuatan SPPD, serta pencarian pegawai read-only.
