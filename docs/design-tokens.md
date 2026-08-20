# Design Tokens — Perjadin UI

Fondasi visual Perjadin dimigrasikan dari `sikkepo-v4-ui` dan dipertahankan sebagai sistem token generik. Gunakan kelas Tailwind yang tersedia; jangan menambah nilai warna langsung di template.

## Warna

| Kegunaan | Token utama |
| --- | --- |
| Aksi utama dan identitas | `brand-500` (`#1f2225`) |
| Berhasil | `success-500` |
| Peringatan | `warning-500` |
| Galat | `danger-500` |
| Informasi | `info-500` |
| Halaman, kartu, teks | `body-bg`, `surface`, `dark`, `light` |

Gunakan skala warna yang tersedia untuk hover, teks, atau latar ringan, misalnya `bg-brand-50`, `text-brand-700`, dan `hover:bg-brand-600`.

## Layout

- Header memakai `bg-gradient-brand-glass` dan teks terang.
- Sidebar memakai `surface`; menu aktif memakai `menu-active` dengan indikator `border-l-brand-500`.
- Kartu memakai kelas `.card` atau `AppCard`: border halus, radius `rounded-lg`, dan `shadow-md`.
- Kontrol interaktif memiliki tinggi minimum 40px (`min-h-10`).

## Ikon dan Status

Gunakan `icon.<warna>.tint` untuk chip ikon biasa dan `icon.<warna>.strong` untuk glyph atau status aktif. Seluruh pasangan warna penting telah diperiksa oleh `tools/contrast-check.mjs`; teks normal harus mencapai rasio minimal 4.5:1 dan elemen non-teks minimal 3:1.

## Aturan Penggunaan

- Gunakan `AppButton`, `AppAlert`, `AppCard`, dan komponen form bersama sebelum membuat varian baru.
- Semua input memiliki label yang terlihat; tombol yang hanya berisi ikon membutuhkan `aria-label`.
- Bahasa tampilan menggunakan Bahasa Indonesia. Nama komponen dan kode tetap menggunakan Bahasa Inggris.
- Dark mode menggunakan kelas `.dark` pada elemen `<html>`; perluas token CSS di `resources/css/app.css` bila mode ini diaktifkan penuh.
