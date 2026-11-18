/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'tall': { raw: '(min-height: 760px)' },
        'short': { raw: '(max-height: 759px)' },
        'xshort': { raw: '(max-height: 600px)' },
      },
      colors: {
        'ios-label': {
          DEFAULT: '#000000',
          primary: '#000000',
          secondary: 'rgba(60, 60, 67, 0.60)',
          tertiary: 'rgba(60, 60, 67, 0.30)',
          quaternary: 'rgba(60, 60, 67, 0.18)',
        },
      },
      fontSize: {
        'ios-large-title': ['2.125rem', { lineHeight: '2.5625rem', letterSpacing: '-0.025em', fontWeight: '700' }],
        'ios-title-1': ['1.75rem', { lineHeight: '2.125rem', letterSpacing: '-0.02em', fontWeight: '700' }],
        'ios-title-2': ['1.375rem', { lineHeight: '1.75rem', letterSpacing: '-0.015em', fontWeight: '700' }],
        'ios-title-3': ['1.25rem', { lineHeight: '1.5625rem', letterSpacing: '-0.01em', fontWeight: '600' }],
        'ios-headline': ['1.0625rem', { lineHeight: '1.375rem', letterSpacing: '-0.025em', fontWeight: '600' }],
        'ios-body': ['1.0625rem', { lineHeight: '1.375rem', letterSpacing: '-0.025em', fontWeight: '400' }],
        'ios-callout': ['1.0rem', { lineHeight: '1.3125rem', letterSpacing: '-0.015em', fontWeight: '400' }],
        'ios-subheadline': ['0.9375rem', { lineHeight: '1.25rem', letterSpacing: '-0.01em', fontWeight: '400' }],
        'ios-footnote': ['0.8125rem', { lineHeight: '1.125rem', letterSpacing: '-0.005em', fontWeight: '400' }],
        'ios-caption-1': ['0.75rem', { lineHeight: '1.0rem', letterSpacing: '0px', fontWeight: '500' }],
        'ios-caption-2': ['0.6875rem', { lineHeight: '0.8125rem', letterSpacing: '0.01em', fontWeight: '600' }],
        'ios-lockpad-digit': ['2.125rem', { lineHeight: '2.375rem', letterSpacing: '0px', fontWeight: '300' }],
        'ios-lockpad-subtext': ['0.625rem', { lineHeight: '0.75rem', letterSpacing: '0.08em', fontWeight: '700' }],
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          'Inter',
          '-system-ui',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        handwriting: ['"Shantell Sans"', 'cursive', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
