/** @type {import('tailwindcss').Config} */
/** @type {import("@types/tailwindcss/tailwind-config").TailwindConfig } */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontFamily: {
      proxima: ['Proxima Nova'],
      candara: ['Candara'],
    },
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        primary: '#02B89D',
        secondary: '#0281B9',
        pureWhite: '#FFF',
        pureBlack: '#000',
        errorColor: '#F8D7DA',
        warningColor: '#FFF3CD',
        infoColor: '#E7F1FF',
        defaultRed: "#DC3545",
        whiteSmoke: '#F6F6F6',
        darkCharcoal: '#333333',
        lightSilver: '#D8D8D8',
        slatyGrey: '#6E6D7A',
        lightGray: '#F4F4F4',
        darkSmoke: '#E6E6E6',
      },
      screens: {
        'xs': '230px',
        'xsm': '440px',
        'sm': '640px',
        'md': '768px',
        'laptop': '992px',
        'laptopMd': '1024px',
        'lg': '1080px',
        'xl': '1280px',
        'hd': '1366px',
        '2xl': '1440px',
        '3xl': '1536px',
        'smFooter': '300px',
        'lgFooter': '640px',
      },

      animation: { 'spin-y': 'spin-y 0.6s infinite linear' },
      keyframes: {
        'spin-y': {
          '0%': {
            transform: 'translateY(-7em)',
          },
          '40%': {
            transform: 'translateY(0)',
          },
          '100%': {
            transform: 'translateY(1em)',
          },
        },
      },
    },
  },
  plugins: [],
}
