/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'axis-blue': '#00E5FF',
        'axis-purple': '#a855f7',
        'axis-dark': '#01041a',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-left': 'fadeInLeft 0.8s ease-out forwards',
        'fade-in-right': 'fadeInRight 0.8s ease-out forwards',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'blink-cursor': 'blinkCursor 0.8s step-end infinite',

        /* ここから追加: 無限ロゴ帯 */
        marquee:  'marquee 22s linear infinite',
        marquee2: 'marquee 22s linear infinite reverse',
        // 速度を変えたいときは 22s を 12s / 30s などに変更
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0)' },
          '100%': { transform: 'scale(1)' },
        },
        blinkCursor: {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'white' },
        },

        /* ここから追加: 無限ロゴ帯 */
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          // 並べた要素を 2 セットにしておけば -50% まで流すと継ぎ目なし
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [require('daisyui')],
}
