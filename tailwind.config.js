import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './resources/js/**/*.{vue,js}',
    ],
    // Dark mode via kelas `.dark` pada <html> — lihat resources/css/app.css untuk token CSS variable
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Brand: Color Admin theme "black" (DIPERTAHANKAN) — 500 = #1f2225
                // Tint ke putih untuk 50–400, shade ke hitam untuk 600–900 (900 = #000000)
                brand: {
                    50: '#e9e9e9',
                    100: '#d2d3d3',
                    200: '#a5a7a8',
                    300: '#797a7c',
                    400: '#4c4e51',
                    500: '#1f2225',
                    600: '#191b1e',
                    700: '#131416',
                    800: '#0c0e0f',
                    900: '#000000',
                    950: '#000000',
                },
                // Status: Color Admin varian "apple" — tint 80/90% untuk 100/50, shade 20/40% untuk 600/700
                success: {
                    DEFAULT: '#4CD964',
                    50: '#edfbf0',
                    100: '#dbf7e0',
                    500: '#4CD964',
                    600: '#3dae50',
                    700: '#2e823c',
                },
                warning: {
                    DEFAULT: '#FF9500',
                    50: '#fff4e6',
                    100: '#ffeacc',
                    500: '#FF9500',
                    600: '#cc7700',
                    700: '#995900',
                },
                danger: {
                    DEFAULT: '#FF3B30',
                    50: '#ffebea',
                    100: '#ffd8d6',
                    500: '#FF3B30',
                    600: '#cc2f26',
                    700: '#99231d',
                },
                info: {
                    DEFAULT: '#5AC8FA',
                    50: '#effafe',
                    100: '#def4fe',
                    500: '#5AC8FA',
                    600: '#48a0c8',
                    700: '#367896',
                },
                // dark = apple gray-800 (mix 10% putih ke #222); light = permukaan sekunder
                dark: '#383838',
                light: '#f2f3f4',
                'body-bg': '#e4e7e8',
                surface: '#ffffff',
                // Palet warna ikon ala iOS (Settings app) — tiap ikon menu punya warna sendiri.
                // DEFAULT = warna penuh; tint = 15% warna di atas putih (latar chip normal);
                // strong = shade lebih gelap — dipakai untuk glyph di atas tint DAN latar chip aktif
                // (beberapa warna apple terlalu terang untuk kontras ≥3:1 tanpa shade, mis. green/yellow).
                icon: {
                    blue: { DEFAULT: '#007AFF', tint: '#d9ebff', strong: '#007AFF' },
                    green: { DEFAULT: '#4CD964', tint: '#e4f9e8', strong: '#318d41' },
                    orange: { DEFAULT: '#FF9500', tint: '#ffefd9', strong: '#bf7000' },
                    red: { DEFAULT: '#FF3B30', tint: '#ffe2e0', strong: '#d93229' },
                    pink: { DEFAULT: '#FF2D55', tint: '#ffe0e6', strong: '#d92648' },
                    indigo: { DEFAULT: '#5856D6', tint: '#e6e6f9', strong: '#5856D6' },
                    cyan: { DEFAULT: '#5AC8FA', tint: '#e6f7fe', strong: '#3b82a3' },
                    yellow: { DEFAULT: '#FFCC00', tint: '#fff7d9', strong: '#a68500' },
                    teal: { DEFAULT: '#58eaa1', tint: '#e6fcf1', strong: '#399869' },
                    purple: { DEFAULT: '#b503ff', tint: '#f4d9ff', strong: '#b503ff' },
                    gray: { DEFAULT: '#64748b', tint: '#e8eaee', strong: '#64748b' },
                },
                // Skema menu sidebar sesuai template apple (_variables.scss bagian 20.0)
                menu: {
                    link: '#383838', // $app-sidebar-menu-link-color = gray-800
                    hover: '#f4f4f4', // $app-sidebar-menu-link-hover-bg = gray-100
                    active: '#efefef', // $app-sidebar-component-active-bg = lighten(gray-200, 2.5%)
                    'active-text': '#222222', // $app-sidebar-component-active-color = gray-900
                    // Template memakai gray-500 #919191 (3.15:1) — digelapkan ke #737373 demi kontras AA 4.5:1
                    header: '#737373',
                    chip: '#919191', // $app-sidebar-menu-icon-bg = gray-500 (ikon putih di atasnya, non-teks 3.15:1)
                    'grid-border': '#d3d3d3', // $app-sidebar-grid-border-color = gray-300 (opsi app-sidebar-grid)
                },
            },
            // Border: apple gray-300 (mix 80% putih ke #222)
            borderColor: {
                DEFAULT: '#d3d3d3',
            },
            // Radius apple: sm 3px, md 4px, lg 6px
            borderRadius: {
                sm: '3px',
                DEFAULT: '4px',
                md: '4px',
                lg: '6px',
            },
            // Shadow apple
            boxShadow: {
                sm: '0 .125rem .25rem rgba(0,0,0,.075)',
                md: '0 .5rem 1rem rgba(0,0,0,.15)',
                lg: '0 1rem 3rem rgba(0,0,0,.175)',
            },
            // Font apple: system-ui stack (tanpa webfont — menggantikan Open Sans)
            fontFamily: {
                sans: [
                    'system-ui',
                    '-apple-system',
                    '"Segoe UI"',
                    'Roboto',
                    '"Helvetica Neue"',
                    'Arial',
                    'sans-serif',
                ],
            },
            // Gradient enabled (Color Admin): gradien brand hitam untuk header inverse & sidebar aktif.
            // Varian `glass` (opacity ~90%) dipakai bersama backdrop-blur pada header.
            backgroundImage: {
                'gradient-brand': 'linear-gradient(135deg, #000000 0%, #2d2d2d 100%)',
                'gradient-brand-glass': 'linear-gradient(135deg, rgba(0,0,0,.9) 0%, rgba(45,45,45,.9) 100%)',
            },
        },
    },
    plugins: [forms],
};
