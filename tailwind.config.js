/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: { DEFAULT: '#0891b2', dark: '#0e7490', light: '#22d3ee', 50: '#ecfeff' },
            },
            fontFamily: {
                sans: ['Sarabun', 'Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
