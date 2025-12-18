
import { ThemeConfig, Theme } from './types';

// 通用细微边框
const LIGHT_BORDER = 'border border-black/[0.04]';
const DARK_BORDER = 'border border-white/[0.08]';

export const THEMES: Record<Theme, ThemeConfig> = {
  solarized: {
    nameKey: 'theme_solarized',
    background: 'bg-[#F4F4F9]',
    cardBackground: `bg-[#FDFCF0] ${LIGHT_BORDER}`,
    textColor: 'text-[#2D2D2E]',
    accentColor: '',
    headerStyle: 'border-transparent'
  },
  mint: {
    nameKey: 'theme_mint',
    background: 'bg-[#ECFDF5]',
    cardBackground: `bg-[#D1FAE5] ${LIGHT_BORDER}`,
    textColor: 'text-[#064E3B]',
    accentColor: '',
    headerStyle: 'border-transparent'
  },
  lavender: {
    nameKey: 'theme_lavender',
    background: 'bg-[#F5F3FF]',
    cardBackground: `bg-[#EDE9FE] ${LIGHT_BORDER}`,
    textColor: 'text-[#4C1D95]',
    accentColor: '',
    headerStyle: 'border-transparent'
  },
  graphite: {
    nameKey: 'theme_graphite',
    background: 'bg-[#0F172A]',
    cardBackground: `bg-[#1E293B] ${DARK_BORDER}`,
    textColor: 'text-[#E2E8F0]',
    accentColor: '',
    headerStyle: 'border-transparent'
  },
  clay: {
    nameKey: 'theme_clay',
    background: 'bg-[#FFF7ED]',
    cardBackground: `bg-[#FFEDD5] ${LIGHT_BORDER}`,
    textColor: 'text-[#7C2D12]',
    accentColor: '',
    headerStyle: 'border-transparent'
  }
};
