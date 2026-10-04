// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        red: {
          750: '#702a22', // Custom shade: red-750
        },
        'custom-brown': '#911924', // Custom named color
      },
    },
  },
  plugins: [],
};