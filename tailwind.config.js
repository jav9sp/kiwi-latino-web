/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1a6b3c',
        'primary-dark': '#145530',
        'primary-light': '#e8f5ee',
        community: '#F44336',
        trips: '#9C27B0',
        housing: '#4CAF50',
        jobs: '#2196F3',
        marketplace: '#FF9800',
      },
    },
  },
  plugins: [],
};
