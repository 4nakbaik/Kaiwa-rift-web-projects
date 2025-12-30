/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Serif JP"', 'serif'],
        calligraphy: ['"Yuji Syuku"', 'serif'],
        brush: ['"Shippori Mincho"', 'serif'], // Tambahan untuk variasi teks buku tua
      },
      colors: {
        // Palet "Sumi-e" (Tinta & Kertas)
        'sumi-900': '#0a0a0a', // Hitam Tinta Pekat
        'sumi-800': '#1c1c1c', // Arang
        'sumi-700': '#2d2d2d',
        'washi-100': '#e6e2d3', // Kertas Putih Tulang
        'washi-200': '#c2b8a3', // Kertas Usang
        'vermilion': '#cd3f3e', // Merah Stempel
        'indigo-dye': '#2b3a42', // Biru Kain Kuno
        'gold-dust': '#a89f80', // Emas Pudar
        'ink-black': '#080808', // Alias untuk ink-black agar konsisten dengan Dashboard.tsx
        'ink-gray': '#1c1c1c',
        'paper-worn': '#e3dac9',
        'blood-rust': '#8a1c1c',
        'blade-silver': '#c0c0c0',
      },
      backgroundImage: {
        'texture-paper': "url('https://www.transparenttextures.com/patterns/natural-paper.png')",
        'texture-ink': "url('https://www.transparenttextures.com/patterns/black-felt.png')",
        'rice-paper': "url('https://www.transparenttextures.com/patterns/rice-paper-3.png')",
      },
      dropShadow: {
        'ink': '2px 4px 6px rgba(0,0,0,0.8)',
      },
      animation: {
        'ink-flow': 'inkFlow 3s ease-in-out infinite',
      },
      keyframes: {
        inkFlow: {
          '0%, 100%': { opacity: 0.8 },
          '50%': { opacity: 0.4 },
        }
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide') 
  ],
}