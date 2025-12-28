/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        // Renaming the custom palette to a Blue theme
        'edu-blue': '#5aa9e6',
        'edu-pale': '#f0f7fd',
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6', /* Primary Blue */
          600: '#2563eb',
          900: '#1e3a8a',
        }
      }
    }
  },
  plugins: []
};