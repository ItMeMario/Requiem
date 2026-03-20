import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export function useCyberpunkGate() {
  const { theme } = useTheme();
  // Se não for cyberpunk, consideramos o terminal já aberto/pulado
  const [hasBooted, setHasBooted] = useState(theme !== 'cyberpunk');

  return {
    showTerminalGate: !hasBooted && theme === 'cyberpunk',
    openTerminal: () => setHasBooted(true),
  };
}
