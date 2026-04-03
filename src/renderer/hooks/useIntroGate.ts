import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

type Theme = 'medieval' | 'cyberpunk' | 'vampire';

const seenIntros = new Set<Theme>();

export function useIntroGate() {
  const { theme } = useTheme();
  // Safe cast since theme is guaranteed to be one of the themes
  const currentTheme = theme as Theme;
  
  const [hasSeenIntro, setHasSeenIntro] = useState(seenIntros.has(currentTheme));

  const showIntro = !hasSeenIntro;

  const dismissIntro = () => {
    seenIntros.add(currentTheme);
    setHasSeenIntro(true);
  };

  return { showIntro, dismissIntro };
}
