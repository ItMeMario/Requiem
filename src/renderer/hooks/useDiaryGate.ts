import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export function useDiaryGate() {
  const { theme } = useTheme();
  // Se não for medieval, consideramos o diário já aberto
  const [hasOpenedDiary, setHasOpenedDiary] = useState(theme !== 'medieval');

  return {
    showDiaryGate: !hasOpenedDiary && theme === 'medieval',
    openDiary: () => setHasOpenedDiary(true),
  };
}
