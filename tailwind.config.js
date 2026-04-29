/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: ['animate-pulse-pill', 'animate-banner-slide-in'],
  theme: {
    extend: {
      colors: {
        'bg-canvas': '#FAFAF9',
        'bg-surface': '#FFFFFF',
        'bg-surface-alt': '#F5F5F4',
        'border-soft': '#E7E5E4',
        'border-default': '#D6D3D1',
        'ink-primary': '#1C1917',
        'ink-secondary': '#57534E',
        'ink-tertiary': '#A8A29E',
        'health-green': '#16A34A',
        'health-amber': '#D97706',
        'health-red': '#DC2626',
        'tier-senior': '#1E40AF',
        'tier-churn': '#EA580C',
        'tier-standard': '#64748B',
        'flag-legal': '#7C3AED',
        'flag-protected': '#CA8A04',
        accent: '#2563EB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
      },
      boxShadow: {
        soft: '0 1px 3px rgba(0,0,0,0.04)',
        md: '0 4px 12px rgba(0,0,0,0.08)',
      },
      keyframes: {
        'pulse-pill': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.15)', opacity: '0.85' },
        },
        'banner-slide-in': {
          '0%': { transform: 'translateY(-12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'pulse-pill': 'pulse-pill 2s ease-in-out infinite',
        'banner-slide-in': 'banner-slide-in 200ms ease-out',
      },
    },
  },
  plugins: [],
};
