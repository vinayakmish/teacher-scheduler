import { createTheme, ThemeOptions } from '@mui/material/styles';

export const getDesignTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';
  const palette: ThemeOptions['palette'] = {
    mode,
    // Reduced, calmer brand palette (fewer saturated accents)
    primary: {
      main: '#2563eb',
      light: '#3b82f6',
      dark: '#1e40af',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    background: {
      // Slightly higher contrast neutral backgrounds
      default: isDark ? '#0d1320' : '#f5f7fa',
      paper: isDark ? '#1b2533' : '#ffffff',
    },
    text: {
      // Boost secondary contrast for readability (WCAG AA)
      primary: isDark ? '#f1f5f9' : '#111827',
      secondary: isDark ? '#cbd5e1' : '#475569',
    },
    grey: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    error: {
      main: '#dc2626',
      light: '#f87171',
      dark: '#b91c1c',
      contrastText: '#fff',
    },
    warning: {
      main: '#d97706',
      light: '#fbbf24',
      dark: '#b45309',
      contrastText: '#fff',
    },
    success: {
      main: '#059669',
      light: '#34d399',
      dark: '#047857',
      contrastText: '#fff',
    },
    info: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#fff',
    },
    divider: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
  };

  return createTheme({
    palette,
    typography: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontSize: '2.25rem',
        fontWeight: 700,
        lineHeight: 1.1,
        letterSpacing: '-0.025em',
        color: isDark ? '#f8fafc' : '#0f172a',
      },
      h2: {
        fontSize: '1.875rem',
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
        color: isDark ? '#f1f5f9' : '#0f172a',
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
        color: isDark ? '#f1f5f9' : '#0f172a',
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.3,
        color: isDark ? '#f1f5f9' : '#0f172a',
      },
      h5: {
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.4,
        color: isDark ? '#f1f5f9' : '#0f172a',
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.5,
        color: isDark ? '#f1f5f9' : '#0f172a',
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
        color: isDark ? '#e2e8f0' : '#1f2937',
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
        color: isDark ? '#94a3b8' : '#4b5563',
      },
      button: {
        fontWeight: 600,
        letterSpacing: '0.01em',
        textTransform: 'none' as const,
      },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFeatureSettings: '"rlig" 1, "calt" 1',
            backgroundImage: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundColor: isDark ? '#1e2733' : '#ffffff',
            border: `1px solid ${
              isDark ? 'rgba(255,255,255,0.07)' : '#e2e8f0'
            }`,
            boxShadow: isDark
              ? '0 1px 2px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.02)'
              : '0 1px 2px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02)',
            transition: 'background-color 0.25s ease, box-shadow 0.25s ease',
            '&:hover': {
              boxShadow: isDark
                ? '0 4px 12px rgba(0,0,0,0.65)'
                : '0 4px 12px rgba(0,0,0,0.08)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 8,
            fontWeight: 600,
            letterSpacing: '0.01em',
            padding: '0.625rem 1.25rem',
            textTransform: 'none',
            boxShadow: 'none',
            '&:focus-visible': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: '2px',
            },
            '&:active': { transform: 'translateY(1px)' },
          }),
          contained: ({ theme }) => ({
            backgroundColor: theme.palette.primary.main,
            color: '#fff',
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
              boxShadow: 'none',
            },
          }),
          outlined: {
            borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#d1d5db',
            '&:hover': {
              borderColor: isDark ? 'rgba(255,255,255,0.35)' : '#9ca3af',
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundImage: 'none',
            backgroundColor: isDark ? '#1b2533' : '#ffffff',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
              transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
              '& fieldset': {
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#d1d5db',
              },
              '&:hover fieldset': {
                borderColor: isDark ? 'rgba(255,255,255,0.25)' : '#9ca3af',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#2563eb',
                borderWidth: 2,
              },
            },
            '& .MuiInputLabel-root': {
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: isDark ? '#94a3b8' : '#64748b',
              margin: '-5px',
            },
            '& .MuiOutlinedInput-input': {
              padding: '14px 16px',
              fontSize: '0.9rem',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark
              ? 'rgba(13,19,32,0.85)'
              : 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            border: 0,
            boxShadow: 'none',
            borderBottom: `1px solid ${
              isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'
            }`,
          },
        },
      },
      MuiTabs: {
        styleOverrides: { indicator: { height: 3, borderRadius: 3 } },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 600, letterSpacing: '0.02em' } },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 18,
            backgroundColor: isDark ? '#16202b' : '#ffffff',
          },
        },
      },
    },
  });
};

export const theme = getDesignTheme('light');
export default theme;
