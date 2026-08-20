// Hitung rasio kontras WCAG (relative luminance) untuk pasangan warna komponen
function lum(hex) {
    const c = hex.replace('#', '');
    const [r, g, b] = [0, 2, 4].map((i) => {
        const v = parseInt(c.slice(i, i + 2), 16) / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) {
    const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
    return ((l1 + 0.05) / (l2 + 0.05)).toFixed(2);
}
const pairs = [
    ['Header: judul/teks utama', '#ffffff', '#2d2d2d (ujung terang gradien)'],
    ['Header: jam/ikon (slate-200)', '#e2e8f0', '#2d2d2d'],
    ['Header: teks sekunder (slate-300)', '#cbd5e1', '#2d2d2d'],
    ['Header: putih di titik hitam', '#ffffff', '#000000'],
    ['Sidebar: link gray-800/putih', '#383838', '#ffffff'],
    ['Sidebar: hover link gray-800/gray-100', '#383838', '#f4f4f4'],
    ['Sidebar: aktif gray-900/menu-active', '#222222', '#efefef'],
    ['Sidebar: section header #737373/putih', '#737373', '#ffffff'],
    ['Sidebar: ikon putih/chip gray-500 (non-teks)', '#ffffff', '#919191'],
    ['Sidebar: ikon putih/chip aktif hitam', '#ffffff', '#1f2225'],
    ['Dropdown: teks gray-800/putih', '#383838', '#ffffff'],
    ['Dropdown: waktu slate-500/putih', '#64748b', '#ffffff'],
];
for (const [label, fg, bg] of pairs) {
    const bgHex = bg.split(' ')[0];
    const r = ratio(fg, bgHex);
    console.log(`${r.padStart(5)} : 1  ${r >= 4.5 ? 'AA✓' : r >= 3 ? 'AA-large/non-teks✓' : 'GAGAL'}  ${label}`);
}

// Verifikasi palet warna ikon (strong di atas tint; putih di atas strong untuk chip aktif)
const iconPalette = {
    blue: ['#007AFF', '#d9ebff'],
    green: ['#318d41', '#e4f9e8'],
    orange: ['#bf7000', '#ffefd9'],
    red: ['#d93229', '#ffe2e0'],
    pink: ['#d92648', '#ffe0e6'],
    indigo: ['#5856D6', '#e6e6f9'],
    cyan: ['#3b82a3', '#e6f7fe'],
    yellow: ['#a68500', '#fff7d9'],
    teal: ['#399869', '#e6fcf1'],
    purple: ['#b503ff', '#f4d9ff'],
    gray: ['#64748b', '#e8eaee'],
};
console.log('\nPalet warna ikon (target non-teks ≥3:1):');
for (const [name, [strong, tint]] of Object.entries(iconPalette)) {
    const rGlyph = ratio(strong, tint);
    const rActive = ratio('#ffffff', strong);
    console.log(
        `${name.padEnd(7)} glyph/tint: ${String(rGlyph).padStart(5)}:1 ${rGlyph >= 3 ? '✓' : 'GAGAL'}   aktif putih/strong: ${String(rActive).padStart(5)}:1 ${rActive >= 3 ? '✓' : 'GAGAL'}`,
    );
}
