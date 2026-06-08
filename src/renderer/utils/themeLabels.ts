export const THEME_LABELS = {
  medieval: {
    dashboardTitle: 'Your Lore',
    dashboardName: 'Chronicles',
  },
  cyberpunk: {
    dashboardTitle: 'Mainframe Access',
    dashboardName: 'Mainframe',
  },
  vampire: {
    dashboardTitle: 'Bloodline Records',
    dashboardName: 'Bloodlines',
  },
};

export function getThemeLabels(theme: string) {
  return THEME_LABELS[theme as keyof typeof THEME_LABELS] || THEME_LABELS.medieval;
}
