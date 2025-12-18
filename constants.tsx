
import { ThemeConfig, Theme } from './types';

export const THEMES: Record<Theme, ThemeConfig> = {
  gradient: {
    nameKey: 'theme_gradient',
    background: 'bg-slate-50',
    cardBackground: 'bg-white border border-slate-100 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.12),0_10px_20px_-5px_rgba(0,0,0,0.04)]',
    textColor: 'text-slate-800',
    accentColor: 'text-orange-500',
    headerStyle: 'border-b border-slate-50'
  },
  modern: {
    nameKey: 'theme_modern',
    background: 'bg-slate-900',
    cardBackground: 'bg-slate-800 border border-slate-700/50 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)]',
    textColor: 'text-slate-100',
    accentColor: 'text-blue-400',
    headerStyle: 'border-b border-slate-700'
  },
  glass: {
    nameKey: 'theme_glass',
    background: 'bg-gradient-to-br from-indigo-900 to-purple-900',
    cardBackground: 'bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)]',
    textColor: 'text-white',
    accentColor: 'text-pink-300',
    headerStyle: 'border-b border-white/10'
  },
  midnight: {
    nameKey: 'theme_midnight',
    background: 'bg-black',
    cardBackground: 'bg-zinc-900 border border-zinc-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)]',
    textColor: 'text-zinc-100',
    accentColor: 'text-emerald-400',
    headerStyle: 'border-b border-zinc-800'
  },
  solarized: {
    nameKey: 'theme_solarized',
    background: 'bg-[#002b36]',
    cardBackground: 'bg-[#073642] border border-[#586e75]/30 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)]',
    textColor: 'text-[#839496]',
    accentColor: 'text-[#268bd2]',
    headerStyle: 'border-b border-[#586e75]'
  }
};
