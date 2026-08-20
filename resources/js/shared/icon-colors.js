/*
 * Pemetaan kunci warna ikon → kelas Tailwind LENGKAP untuk chip ikon sidebar.
 * PENTING: jangan membangun nama kelas secara dinamis (`bg-icon-${color}-tint`)
 * karena akan hilang saat Tailwind purge. Semua pasangan kelas ditulis eksplisit di sini.
 *
 * Pendekatan chip:
 * - normal : latar tint lembut (15% warna) + glyph warna `strong` (kontras ≥3:1)
 * - aktif  : latar warna `strong` penuh + glyph putih (menonjol, kontras ≥3:1)
 */
export const iconColorMap = {
    blue: {
        chip: 'bg-icon-blue-tint text-icon-blue-strong',
        chipActive: 'bg-icon-blue-strong text-white',
    },
    green: {
        chip: 'bg-icon-green-tint text-icon-green-strong',
        chipActive: 'bg-icon-green-strong text-white',
    },
    orange: {
        chip: 'bg-icon-orange-tint text-icon-orange-strong',
        chipActive: 'bg-icon-orange-strong text-white',
    },
    red: {
        chip: 'bg-icon-red-tint text-icon-red-strong',
        chipActive: 'bg-icon-red-strong text-white',
    },
    pink: {
        chip: 'bg-icon-pink-tint text-icon-pink-strong',
        chipActive: 'bg-icon-pink-strong text-white',
    },
    indigo: {
        chip: 'bg-icon-indigo-tint text-icon-indigo-strong',
        chipActive: 'bg-icon-indigo-strong text-white',
    },
    cyan: {
        chip: 'bg-icon-cyan-tint text-icon-cyan-strong',
        chipActive: 'bg-icon-cyan-strong text-white',
    },
    yellow: {
        chip: 'bg-icon-yellow-tint text-icon-yellow-strong',
        chipActive: 'bg-icon-yellow-strong text-white',
    },
    teal: {
        chip: 'bg-icon-teal-tint text-icon-teal-strong',
        chipActive: 'bg-icon-teal-strong text-white',
    },
    purple: {
        chip: 'bg-icon-purple-tint text-icon-purple-strong',
        chipActive: 'bg-icon-purple-strong text-white',
    },
    gray: {
        chip: 'bg-icon-gray-tint text-icon-gray-strong',
        chipActive: 'bg-icon-gray-strong text-white',
    },
};

// Fallback bila item menu tidak punya field `color` — chip abu template
export const iconColorFallback = {
    chip: 'bg-menu-chip text-white',
    chipActive: 'bg-brand-500 text-white',
};

export function resolveIconColor(color) {
    return iconColorMap[color] ?? iconColorFallback;
}
