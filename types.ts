
export type Theme = 'mint' | 'lavender' | 'graphite' | 'solarized' | 'clay';

export interface ThemeConfig {
  nameKey: string;
  background: string;
  cardBackground: string;
  textColor: string;
  accentColor: string;
  headerStyle: string;
}

export interface ShareContent {
  title: string;
  content: string;
  timestamp: string;
}
