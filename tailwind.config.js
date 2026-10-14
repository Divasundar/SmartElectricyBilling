/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design system colors
        black: '#000000',
        white: '#FFFFFF',
        'gray-50': '#F5F6F8',
        'gray-100': '#F0F1F3',
        'gray-200': '#E5E7EB',
        'gray-400': '#9CA3AF',
        'gray-500': '#6B7280',
        'gray-600': '#555555',
        'gray-700': '#374151',
        'gray-800': '#1F2937',
        'gray-900': '#111827',
        // Primary accent: electricity green
        green: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },
        // Smart Billing brand green
        accent: {
          DEFAULT: '#3ECF6A',
          light: '#5DD97C',
          dark: '#2BB554',
          muted: '#E8F9EE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.06)',
        dropdown: '0 8px 24px rgba(0,0,0,0.12)',
        modal: '0 24px 48px rgba(0,0,0,0.18)',
      },
      fontSize: {
        xs: ['11px', '16px'],
        sm: ['13px', '20px'],
        base: ['14px', '22px'],
        md: ['15px', '24px'],
        lg: ['16px', '24px'],
        xl: ['18px', '28px'],
        '2xl': ['20px', '30px'],
        '3xl': ['24px', '32px'],
        '4xl': ['30px', '38px'],
        '5xl': ['36px', '44px'],
      },
    },
  },
  plugins: [],
}
