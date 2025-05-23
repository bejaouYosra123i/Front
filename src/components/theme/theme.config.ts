export const theme = {
  colors: {
    yazaki: {
      red: '#ED1C24',
      black: '#1A1A1A',
      darkGray: '#333333',
      gray: '#E5E5E5',
      lightGray: '#F5F5F5',
      white: '#FFFFFF',
      blue: '#0072C6', // accent optionnel
    },
    primary: {
      DEFAULT: '#ED1C24',
      dark: '#B71C1C',
      light: '#F87171',
    },
    secondary: {
      DEFAULT: '#333333',
      light: '#E5E5E5',
      dark: '#1A1A1A',
    },
    background: {
      light: '#F5F5F5',
      dark: '#1A1A1A',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#333333',
      light: '#FFFFFF',
    },
    success: {
      DEFAULT: '#22c55e',
    },
    error: {
      DEFAULT: '#ef4444',
    },
    warning: {
      DEFAULT: '#f59e0b',
    },
    info: {
      DEFAULT: '#0072C6',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  transitions: {
    default: 'all 0.3s ease',
    fast: 'all 0.15s ease',
    slow: 'all 0.5s ease',
  },
} as const;

export type Theme = typeof theme; 