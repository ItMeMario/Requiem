export const THEME_LABELS = {
  medieval: {
    dashboardTitle: 'Your Lore',
  },
  cyberpunk: {
    dashboardTitle: 'Mainframe Access',
  },
  vampire: {
    dashboardTitle: 'Bloodline Records',
  },
};

export function getThemeLabels(theme: string) {
  return THEME_LABELS[theme as keyof typeof THEME_LABELS] || THEME_LABELS.medieval;
}
