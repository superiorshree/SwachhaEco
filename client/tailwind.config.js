/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        ring: 'var(--ring)',
        // Palette mapped from the new light theme
        primary: {
          DEFAULT: '#16793f',
          focus: '#239a4e',
          accent: '#75cf5e',
          light: '#b1e6a2',
          'on-dark': '#75cf5e',
        },
        ink: {
          DEFAULT: '#1c211e',
          muted80: '#333333',
          muted48: '#5f6761',
        },
        canvas: {
          DEFAULT: '#ffffff',
          parchment: '#fafafa',
        },
        surface: {
          pearl: '#eff1ee',
          tile1: '#1c211e',
          tile2: '#232925',
          tile3: '#151917',
          black: '#0f1712',
          chip: '#e6eae7',
        },
        border: {
          DEFAULT: '#dee3df',
          soft: '#eff1ee',
          hairline: '#dee3df',
        },
        chart: {
          1: '#16793f',
          2: '#239a4e',
          3: '#75cf5e',
          4: '#b1e6a2',
          5: '#4c524e',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          'system-ui',
          'sans-serif'
        ],
        mono: [
          '"Geist Mono"',
          'monospace'
        ],
        serif: [
          'Georgia',
          'serif'
        ]
      },
      borderRadius: {
        'xs': '5px',
        'sm': '8px',
        'md': '0.5rem',
        'lg': '18px',
        'pill': '9999px',
      },
      boxShadow: {
        'product': '0 3px 30px 0 rgba(0, 0, 0, 0.22)',
        'civic': '0px 1px 2px 0px rgba(0, 0, 0, 0.18)',
      },
      letterSpacing: {
        'tight-hero': '-0.28px',
        'tight-display': '-0.374px',
        'tight-caption': '-0.224px',
      }
    },
  },
  plugins: [],
}
