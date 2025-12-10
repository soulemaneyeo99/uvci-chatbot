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
        uvci: {
          purple: '#8B1874',
          purpleDark: '#6B1058',
          purpleLight: '#A83389',
          green: '#00A651',
          greenDark: '#008741',
          greenLight: '#2ECC71',
          red: '#B8262F',
        },
      },
    },
  },
  plugins: [],
}
