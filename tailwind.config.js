/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontSize: {
        '2xs': '11px',
        xs:    '13px',
        sm:    '15px',
        base:  '16px',
        lg:    '18px',
        xl:    '20px',
        '2xl': '22px',
        '3xl': '28px',
        '4xl': '34px',
      },
    },
  },
  plugins: [],
};
