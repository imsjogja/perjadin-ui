# Shared UI — Perjadin

Direktori ini memuat material antarmuka yang dimigrasikan dari `sikkepo-v4-ui` dan digunakan ulang oleh seluruh konteks Perjadin. Komponen memakai Vue 3 `<script setup>`, Tailwind token, serta pola aksesibilitas dasar.

## Komponen yang Dipakai

- `AppButton`, `AppAlert`, `AppCard`, `AppBadge`, `AppModal`, dan `AppToast` untuk aksi, pesan, dan kontainer.
- `FormInput`, `FormDatePicker`, `FormSelect`, dan `FormField` untuk formulir berlabel dan validasi.
- `DataTable`, `LoadingSpinner`, `EmptyState`, `ErrorState`, dan `PageHeader` untuk halaman data.
- `AppShell` menyediakan header, sidebar responsif, dan menu Perjadin.

Contoh:

```vue
<AppCard title="Surat Tugas">
    <FormInput v-model="form.dasar" label="Dasar" required />
    <AppButton :loading="saving">Simpan</AppButton>
</AppCard>
```

## Composable dan Data Bersama

- `useAuth` menyimpan token Sanctum Perjadin pada `localStorage`.
- `useToast` menampilkan notifikasi global.
- `useClock`, `useEcho`, dan `usePermissions` adalah utilitas generik yang dapat dipakai ketika modul membutuhkannya.
- `menu-catalog.json` dan `icon-colors.js` mengatur navigasi serta warna ikon; ubah keduanya saat menambah modul.

Komponen domain tidak boleh memanggil `fetch` langsung. Gunakan `resources/js/services/perjadinApi.js` agar URL API, token, dan galat diperlakukan konsisten.
