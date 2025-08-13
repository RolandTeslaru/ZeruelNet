import type { Config } from "tailwindcss"

const config = {
  darkMode:  "class",
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../SharedUI/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: "",
  theme: {
    typography: {
      DEFAULT: {

      }
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        
        'popover': 'var(--popover)',
        'border-popover': 'var(--border-popover)',


        'primary-opaque': 'var(--primary-opaque)',
        'primary-thick': 'var(--primary-thick)',
        'primary-regular': 'var(--primary-regular)',
        'primary-thin': 'var(--primary-thin)',

        'secondary-opaque': 'var(--secondary-opaque)',
        'secondary-thick': 'var(--secondary-thick)',
        'secondary-regular': 'var(--secondary-regular)',
        'secondary-thin': 'var(--secondary-thin)',

        'tertiary-opaque': 'var(--tertiary-opaque)',
        'tertiary-thick': 'var(--tertiary-thick)',
        'tertiary-regular': 'var(--tertiary-regular)',
        'tertiary-thin': 'var(--tertiary-thin)',

        'quaternary-opaque': 'var(--quaternary-opaque)',
        'quaternary-thick': 'var(--quaternary-thick)',
        'quaternary-regular': 'var(--quaternary-regular)',
        'quaternary-thin': 'var(--quaternary-thin)',

        'background': 'var(--background)',
        'background-opaque': 'var(--background-opaque)',
        'border-background': 'var(--border-background)',

        
        'foreground': 'var(--foreground)',
        'foreground-shadow': 'var(--foreground-shadow)',
        'border-accent': 'var(--border-accent)',
        'label-primary': 'var(--label-primary)',
        'label-secondary': 'var(--label-secondary)',
        'label-tertiary': 'var(--label-tertiary)',
        'label-quaternary': 'var(--label-quaternary)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        destructive: 'var(--destructive)',
        'destructive-foreground': 'var(--destructive-foreground)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        'chart-1': 'var(--chart-1)',
        'chart-2': 'var(--chart-2)',
        'chart-3': 'var(--chart-3)',
        'chart-4': 'var(--chart-4)',
        'chart-5': 'var(--chart-5)',
        sidebar: 'var(--sidebar)',
        'sidebar-foreground': 'var(--sidebar-foreground)',
        'sidebar-primary': 'var(--sidebar-primary)',
        'sidebar-primary-foreground': 'var(--sidebar-primary-foreground)',
        'sidebar-accent': 'var(--sidebar-accent)',
        'sidebar-accent-foreground': 'var(--sidebar-accent-foreground)',
        'sidebar-border': 'var(--sidebar-border)',
        'sidebar-ring': 'var(--sidebar-ring)'
      },
      boxShadow: {
        "contextItem": "0 0 5px black "
      },
      fontSize: {
        "xss": '8px', // 10px
      },
      margin: {
        'containerDesktop': 'calc(3vh + 50px) calc(1vw + 70px) 3vh 1vw ',
        'containerMobile': 'calc(3vh + 50px) 1vw 3vh 1vw ',
        'scrollDesktop': 'calc(3vh + 50px) calc(1vw + 70px) 0 1vw ',
      },
      gridTemplateColumns: {
        '3upper': '1.05fr 1.9fr 1.05fr'
      },
      fontFamily: {
        'sans-menlo': ['"Sans Menlo"', 'sans-serif'],
        'roboto-mono': ['"Roboto Mono"', 'monospace'],
        'work-sans': ['"Work Sans"', 'sans-serif'],
        'inter': ['"Inter"', 'sans-serif'],
        'nippo': ['"Nippo"', 'sans-serif'],
        'nippo-variable': ['"Nippo-Variable"', 'sans-serif']
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "moveBackground": {
          '0%': { backgroundPosition: '0 0' }, // Starting position
          '100%': { backgroundPosition: '40px 40px' } // Move 40px in both directions (diagonally)
        },
        shake : {
          '10%, 90%': {
              transform: 'translate3d(-1px, 0, 0)'
          },
          '20%, 80%': {
              transform: 'translate3d(2px, 0, 0)'
          },
          '30%, 50%, 70%': {
              transform: 'translate3d(-4px, 0, 0)'
          },
          '40%, 60%': {
              transform: 'translate3d(4px, 0, 0)'
          }
        },
        "gradient": {
          '0%': { 'background-position': '0% 50%' },
          '100%': { 'background-position': '100% 50%' },
        },
        "shimmer": {
          '0%': { 
            'background-position': '200% center',
          },
          '100%': { 
            'background-position': '-200% center',
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "moveBackground": 'moveBackground 2s linear infinite', 
        shake:'shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        "gradient": "gradient 3s linear infinite alternate",
        "shimmer": "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate')
  ],
  
} satisfies Config

export default config