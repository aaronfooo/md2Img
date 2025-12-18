
import { ThemeConfig, Theme } from './types';

// 采用极细的半透明边框
const CARD_BORDER = 'border border-black/[0.05]';

export const THEMES: Record<Theme, ThemeConfig> = {
  solarized: {
    nameKey: 'theme_solarized',
    background: 'bg-[#F4F4F9]',
    cardBackground: `bg-[#FDFCF0] ${CARD_BORDER}`, // 用户上传的米白色
    textColor: 'text-[#2D2D2E]',
    accentColor: '',
    headerStyle: 'border-transparent'
  },
  gradient: {
    nameKey: 'theme_gradient',
    background: 'bg-[#F4F4F9]',
    cardBackground: `bg-[#FFE66E] ${CARD_BORDER}`,
    textColor: 'text-[#1C1C1E]',
    accentColor: '',
    headerStyle: 'border-transparent'
  },
  modern: {
    nameKey: 'theme_modern',
    background: 'bg-[#E5E5EA]',
    cardBackground: `bg-[#A2DFF7] ${CARD_BORDER}`,
    textColor: 'text-[#1C1C1E]',
    accentColor: '',
    headerStyle: 'border-transparent'
  },
  glass: {
    nameKey: 'theme_glass',
    background: 'bg-[#F2F2F7]',
    cardBackground: `bg-[#B4F0A7] ${CARD_BORDER}`,
    textColor: 'text-[#1C1C1E]',
    accentColor: '',
    headerStyle: 'border-transparent'
  },
  midnight: {
    nameKey: 'theme_midnight',
    background: 'bg-[#D1D1D6]',
    cardBackground: `bg-[#F9B4D1] ${CARD_BORDER}`,
    textColor: 'text-[#1C1C1E]',
    accentColor: '',
    headerStyle: 'border-transparent'
  }
};
