/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
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
    },
  },
  plugins: [],
};
