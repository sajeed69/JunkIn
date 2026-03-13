/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#2ecc70',
                secondary: '#1abc9c',
                'background-light': '#f8faf9',
                'background-dark': '#0f1a14',
            },
            fontFamily: {
                display: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: '0.75rem',
                lg: '1rem',
                xl: '1.5rem',
                full: '9999px',
            },
            boxShadow: {
                'primary-sm': '0 4px 14px 0 rgba(46,204,112,0.15)',
                'primary-md': '0 8px 30px 0 rgba(46,204,112,0.25)',
            },
        },
    },
    plugins: [],
};
