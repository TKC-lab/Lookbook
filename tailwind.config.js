/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#faf9f7',
        ink: '#111111',
        subtle: '#6b6b6b',
        line: '#eceae6'
      },
      boxShadow: {
        card: '0 2px 12px rgba(17, 17, 17, 0.06)',
        float: '0 8px 28px rgba(17, 17, 17, 0.12)'
      },
      borderRadius: {
        xl2: '1.25rem'
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'sans-serif']
      }
    }
  },
  plugins: []
}
