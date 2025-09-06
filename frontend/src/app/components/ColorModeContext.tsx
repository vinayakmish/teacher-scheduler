import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getDesignTheme } from '../../theme';

interface ColorModeContextValue {
  mode: 'light' | 'dark';
  toggleColorMode: () => void;
}

export const ColorModeContext = React.createContext<ColorModeContextValue>({
  mode: 'light',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  toggleColorMode: () => {},
});

export const ColorModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = React.useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('color-mode');
      if (stored === 'light' || stored === 'dark') return stored;
      // Prefer system scheme
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  const toggleColorMode = React.useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('color-mode', next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const theme = React.useMemo(() => getDesignTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export const useColorMode = () => React.useContext(ColorModeContext);
