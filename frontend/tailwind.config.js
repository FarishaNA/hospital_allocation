/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                primary: '#EF4444', // Emergency Red
                secondary: '#3B82F6', // Medical Blue
                success: '#10B981',
                warning: '#F59E0B',
                critical: '#DC2626',
                dark: '#111827',
                light: '#F9FAFB'
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
}
