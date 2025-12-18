
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Clipboard, 
  Download, 
  Sparkles, 
  Trash2, 
  Check, 
  Loader2, 
  Share2, 
  AlertCircle, 
  X, 
  Languages, 
  Sun, 
  Moon,
  AlertTriangle
} from 'lucide-react';
import { toBlob, toPng } from 'html-to-image';
import { THEMES } from './constants';
import { Theme } from './types';
import MarkdownRenderer from './components/MarkdownRenderer';
import { generateAITitle } from './services/geminiService';
import { LANGUAGES, TRANSLATIONS, LanguageCode } from './i18n';

const AI_MODELS = [
  { id: '', nameKey: 'noSource' },
  { id: '豆包', nameKey: 'ai_doubao' },
  { id: 'DeepSeek', nameKey: 'ai_deepseek' },
  { id: '通义千问', nameKey: 'ai_tongyi' },
  { id: 'ChatGPT', nameKey: 'ai_chatgpt' },
  { id: 'Gemini', nameKey: 'ai_gemini' },
  { id: '文心一言', nameKey: 'ai_wenxin' },
];

const TEXT_LENGTH_THRESHOLD = 6000;

const App: React.FC = () => {
  const [lang, setLang] = useState<LanguageCode>('zh-CN');
  const t = TRANSLATIONS[lang] || TRANSLATIONS['zh-CN'];

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('app-theme');
    return saved ? saved === 'dark' : false;
  });
  const [markdown, setMarkdown] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [selectedAI, setSelectedAI] = useState<string>('');
  const [theme, setTheme] = useState<Theme>('solarized'); 
  const [fontSize, setFontSize] = useState<'medium' | 'large'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const captureRef = useRef<HTMLDivElement>(null);
  const currentTheme = THEMES[theme];

  const isTooLong = useMemo(() => markdown.length > TEXT_LENGTH_THRESHOLD, [markdown]);

  useEffect(() => {
    localStorage.setItem('app-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const userLang = navigator.language.toLowerCase();
    const matchedLang = LANGUAGES.find(l => 
      userLang === l.code.toLowerCase() || userLang.startsWith(l.code.split('-')[0].toLowerCase())
    );
    if (matchedLang) setLang(matchedLang.code as LanguageCode);
  }, []);

  useEffect(() => {
    const isDefaultTitle = title === '' || Object.values(TRANSLATIONS).some(trans => trans.defaultTitle === title);
    if (isDefaultTitle) setTitle(t.defaultTitle);
  }, [lang, t.defaultTitle]);

  const handleGenerateTitle = async () => {
    if (!markdown.trim()) return;
    setIsAILoading(true);
    try {
      const newTitle = await generateAITitle(markdown);
      setTitle(newTitle);
    } catch (e) {
      setError("AI Naming Service Busy");
    } finally {
      setIsAILoading(false);
    }
  };

  const getCaptureOptions = () => ({
    pixelRatio: 2.5,
    backgroundColor: 'transparent',
    cacheBust: true,
    style: {
      transform: 'scale(1)',
    },
  });

  /**
   * 修复核心：
   * 在某些浏览器（尤其是 Safari）中，如果在用户点击事件和调用剪贴板写入之间存在较长的异步时间（如 toBlob 渲染），
   * 浏览器会认为该操作不是用户触发的，从而抛出 NotAllowedError。
   * 解决方法是：立即调用 navigator.clipboard.write，并传入一个返回 Blob 的 Promise。
   */
  const copyImageToClipboard = async () => {
    if (!captureRef.current || isGenerating) return;
    
    if (!navigator.clipboard || !window.ClipboardItem) {
      setError(lang === 'zh-CN' ? "您的浏览器不支持剪贴板图片写入" : "Clipboard API not supported");
      return;
    }

    setIsGenerating(true);
    setIsCopied(false);
    setError(null);

    try {
      const element = captureRef.current;
      const options = getCaptureOptions();

      // 创建一个能够异步解析 Blob 的 Promise
      const blobPromise = toBlob(element, options).then(blob => {
        if (!blob) throw new Error("Blob creation failed");
        if (blob.size > 15 * 1024 * 1024) throw new Error("IMAGE_TOO_LARGE");
        return blob;
      });

      // 关键：立即写入，利用 Promise 绕过用户激活过期问题
      const item = new ClipboardItem({
        'image/png': blobPromise as Promise<Blob>
      });

      await navigator.clipboard.write([item]);
      
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err: any) {
      console.error("Copy failed:", err);
      // 特殊处理：如果图片太大或权限被拒
      if (err.message === "IMAGE_TOO_LARGE") {
        setError(t.error_clipboard_size);
      } else if (err.name === 'NotAllowedError' || err.message?.includes('denied')) {
        setError(lang === 'zh-CN' ? "剪贴板访问被拒绝或操作超时，请重试或直接【下载图片】" : "Clipboard access denied or timed out. Please try again or Download.");
      } else {
        setError(t.error_gen_failed);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!captureRef.current || isGenerating) return;
    setIsGenerating(true);
    setError(null);
    try {
      const dataUrl = await toPng(captureRef.current, getCaptureOptions());
      const link = document.createElement('a');
      link.download = `AI-Snippet-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err: any) {
      setError(t.error_gen_failed);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedAIName = AI_MODELS.find(m => m.id === selectedAI)?.nameKey ? t[AI_MODELS.find(m => m.id === selectedAI)!.nameKey] : '';

  const bgColor = isDarkMode ? 'bg-[#0A0A0B]' : 'bg-[#F8F9FA]';
  const textColor = isDarkMode ? 'text-slate-200' : 'text-slate-800';
  const headerBg = isDarkMode ? 'bg-white/5' : 'bg-black/5';
  const cardBg = isDarkMode ? 'bg-[#1A1A1B]' : 'bg-white';
  const cardBorder = isDarkMode ? 'border-white/5' : 'border-black/10';
  const inputBg = isDarkMode ? 'bg-black/30' : 'bg-slate-50';
  const secondaryText = isDarkMode ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} flex flex-col items-center p-4 md:p-8 transition-colors duration-300`}>
      {error && (
        <div className="fixed top-6 z-50 animate-in fade-in slide-in-from-top-4 max-w-sm sm:max-w-md w-[90%]">
          <div className="bg-red-500 text-white px-4 py-3 rounded-2xl flex items-center gap-3 shadow-2xl">
            <AlertCircle size={20} className="shrink-0" />
            <span className="text-sm font-bold">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-black/10 rounded-lg transition-colors"><X size={16} /></button>
          </div>
        </div>
      )}

      <header className="w-full max-w-6xl flex justify-between items-center mb-10 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl backdrop-blur-md ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}>
            <Share2 className={isDarkMode ? 'text-white' : 'text-black'} size={24} />
          </div>
          <h1 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>{t.appTitle}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2.5 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10' : 'bg-black/5 border-black/10 text-indigo-600 hover:bg-black/10'}`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className={`flex items-center gap-2 backdrop-blur-md border p-1.5 rounded-2xl ${headerBg} ${cardBorder}`}>
            <Languages size={18} className={secondaryText} />
            <select value={lang} onChange={(e) => setLang(e.target.value as LanguageCode)} className="bg-transparent text-sm font-medium outline-none px-2 py-1 appearance-none cursor-pointer">
              {LANGUAGES.map(l => <option key={l.code} value={l.code} className={isDarkMode ? 'bg-[#1A1A1B] text-white' : 'bg-white text-black'}>{l.name}</option>)}
            </select>
          </div>
        </div>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <section className="space-y-6">
          <div className={`${cardBg} border ${cardBorder} rounded-[2rem] p-6 shadow-xl relative`}>
            <div className="flex items-center justify-between mb-4 px-2">
              <label className={`text-xs font-bold uppercase tracking-widest ${secondaryText}`}>{t.pasteLabel}</label>
              <div className="flex gap-4">
                {isTooLong && (
                  <span className="flex items-center gap-1.5 text-amber-500 text-[10px] font-bold animate-pulse">
                    <AlertTriangle size={12} /> {t.warning_too_long}
                  </span>
                )}
                <button onClick={() => setMarkdown('')} className={`${secondaryText} hover:text-red-400 transition-colors`}><Trash2 size={16} /></button>
              </div>
            </div>
            <textarea 
              value={markdown} 
              onChange={(e) => setMarkdown(e.target.value)} 
              placeholder={t.placeholder} 
              className={`w-full h-80 ${inputBg} border ${cardBorder} rounded-2xl p-5 outline-none resize-none font-mono text-sm transition-colors focus:ring-1 focus:ring-indigo-500/30`} 
            />
            
            <div className="mt-8 space-y-6 px-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`text-xs font-bold uppercase tracking-widest ${secondaryText}`}>{t.titleLabel}</label>
                  <div className="flex gap-2">
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={`flex-1 min-w-0 ${inputBg} border ${cardBorder} rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-indigo-500/30`} />
                    <button onClick={handleGenerateTitle} disabled={isAILoading || !markdown} className={`${isDarkMode ? 'bg-white text-black hover:bg-slate-200' : 'bg-black text-white hover:bg-slate-800'} disabled:opacity-30 px-4 rounded-xl flex items-center gap-2 font-bold text-sm transition-all active:scale-95`}>
                      {isAILoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className={`text-xs font-bold uppercase tracking-widest ${secondaryText}`}>{t.fontSizeLabel}</label>
                  <div className={`flex p-1 ${inputBg} border ${cardBorder} rounded-xl`}>
                    <button onClick={() => setFontSize('medium')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${fontSize === 'medium' ? (isDarkMode ? 'bg-white text-black' : 'bg-black text-white') : secondaryText}`}>
                      {t.fontMedium}
                    </button>
                    <button onClick={() => setFontSize('large')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${fontSize === 'large' ? (isDarkMode ? 'bg-white text-black' : 'bg-black text-white') : secondaryText}`}>
                      {t.fontLarge}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className={`text-xs font-bold uppercase tracking-widest ${secondaryText}`}>{t.aiSourceLabel}</label>
                <div className="flex flex-wrap gap-2">
                  {AI_MODELS.map((ai) => (
                    <button key={ai.id} onClick={() => setSelectedAI(ai.id)} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${selectedAI === ai.id ? (isDarkMode ? 'bg-white text-black border-white shadow-lg' : 'bg-black text-white border-black shadow-lg') : `bg-transparent ${secondaryText} border-slate-700/10 hover:border-slate-700/30`}`}>
                      {t[ai.nameKey]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className={`text-xs font-bold uppercase tracking-widest ${secondaryText}`}>{t.themePreviewLabel}</label>
                <div className="flex flex-wrap gap-3">
                  {(Object.keys(THEMES) as Theme[]).map((tKey) => (
                    <button key={tKey} onClick={() => setTheme(tKey)} className={`w-10 h-10 rounded-full border-2 transition-all ${theme === tKey ? 'border-indigo-500 scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'} ${THEMES[tKey].cardBackground.split(' ')[0]}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={copyImageToClipboard} 
              disabled={!markdown || isGenerating} 
              className={`flex-1 ${isDarkMode ? 'bg-white text-black hover:bg-slate-100' : 'bg-black text-white hover:bg-slate-800'} disabled:opacity-20 font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98]`}
            >
              {isGenerating ? <Loader2 className="animate-spin" /> : isCopied ? <Check /> : <Clipboard />}
              {isCopied ? t.copiedText : t.generateBtn}
            </button>
            <button 
              onClick={downloadImage} 
              disabled={!markdown || isGenerating} 
              className={`px-6 border transition-all active:scale-95 rounded-2xl ${isDarkMode ? 'bg-[#1A1A1B] text-white border-white/5 hover:bg-[#252526]' : 'bg-white text-black border-black/10 hover:bg-slate-50'}`}
              title={t.saveTooltip}
            >
              <Download size={20} />
            </button>
          </div>
        </section>

        <section className="sticky top-8">
          <div className={`flex justify-center p-8 rounded-[3rem] border overflow-hidden transition-colors ${isDarkMode ? 'bg-[#0F0F10] border-white/5' : 'bg-slate-200 border-black/5'}`}>
            <div ref={captureRef} className={`p-10 transition-colors duration-500 ${currentTheme.background}`}>
              <div className={`${currentTheme.cardBackground} w-[360px] min-h-[480px] flex flex-col transition-all duration-500 overflow-visible rounded-[2px] shadow-sm`}>
                <div className="p-10 flex-1">
                  <div className="mb-8">
                    <h2 className={`font-black tracking-tight leading-tight mb-3 ${currentTheme.textColor} ${fontSize === 'large' ? 'text-3xl' : 'text-2xl'}`}>{title}</h2>
                    {selectedAI && (
                      <div className={`text-[10px] font-bold uppercase tracking-widest opacity-30 ${currentTheme.textColor}`}>
                         {selectedAIName} {t.aiSuffix}
                      </div>
                    )}
                  </div>
                  <div className="markdown-note">
                    {markdown ? (
                      <MarkdownRenderer content={markdown} themeTextColor={currentTheme.textColor} fontSize={fontSize} />
                    ) : (
                      <div className="h-40 flex items-center justify-center opacity-5">
                        <Sparkles size={64} className={currentTheme.textColor} />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-10 pt-0 flex justify-between items-end opacity-20 pb-8">
                  <div className={`text-[9px] font-black tracking-[0.3em] uppercase ${currentTheme.textColor}`}>{t.branding}</div>
                  <div className={`text-[8px] font-bold ${currentTheme.textColor}`}>{new Date().toLocaleDateString(lang)}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
