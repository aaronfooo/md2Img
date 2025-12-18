
import React, { useState, useRef, useEffect } from 'react';
import { 
  Clipboard, 
  Download, 
  Sparkles, 
  Trash2, 
  Check, 
  Image as ImageIcon,
  Loader2,
  Share2,
  AlertCircle,
  Smartphone,
  Cpu,
  Languages
} from 'lucide-react';
import { toBlob, toPng } from 'html-to-image';
import { THEMES } from './constants';
import { Theme } from './types';
import MarkdownRenderer from './components/MarkdownRenderer';
import { generateAITitle } from './services/geminiService';
import { LANGUAGES, TRANSLATIONS, LanguageCode } from './i18n';

// 使用 nameKey 进行完全本地化
const AI_MODELS = [
  { id: '', nameKey: 'noSource' },
  { id: '豆包', nameKey: 'ai_doubao' },
  { id: 'DeepSeek', nameKey: 'ai_deepseek' },
  { id: '通义千问', nameKey: 'ai_tongyi' },
  { id: 'ChatGPT', nameKey: 'ai_chatgpt' },
  { id: 'Gemini', nameKey: 'ai_gemini' },
  { id: '文心一言', nameKey: 'ai_wenxin' },
];

const App: React.FC = () => {
  const [lang, setLang] = useState<LanguageCode>('zh-CN');
  const t = TRANSLATIONS[lang];

  const [markdown, setMarkdown] = useState<string>('');
  const [title, setTitle] = useState<string>(t.defaultTitle);
  const [selectedAI, setSelectedAI] = useState<string>('');
  const [theme, setTheme] = useState<Theme>('gradient');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const captureRef = useRef<HTMLDivElement>(null);
  const currentTheme = THEMES[theme];

  // 当语言切换时，如果标题是默认的，则更新标题
  useEffect(() => {
    const isDefaultTitle = Object.values(TRANSLATIONS).some(trans => trans.defaultTitle === title);
    if (isDefaultTitle) {
      setTitle(t.defaultTitle);
    }
  }, [lang]);

  const handleGenerateTitle = async () => {
    if (!markdown.trim()) return;
    setIsAILoading(true);
    setError(null);
    const newTitle = await generateAITitle(markdown);
    setTitle(newTitle);
    setIsAILoading(false);
  };

  const captureOptions = {
    quality: 1,
    pixelRatio: 3, 
    backgroundColor: 'transparent',
    filter: (node: HTMLElement) => {
      const exclusionClasses = ['animate-pulse', 'animate-spin'];
      return !exclusionClasses.some(cls => node.classList?.contains(cls));
    },
    skipFonts: false,
  };

  const copyImageToClipboard = async () => {
    if (!captureRef.current || isGenerating) return;
    
    setIsGenerating(true);
    setIsCopied(false);
    setError(null);

    try {
      if (!navigator.clipboard || !window.ClipboardItem) {
        throw new Error(lang === 'zh-CN' ? "浏览器不支持直接复制图片。请使用下载按钮。" : "Browser doesn't support clipboard imaging. Please use download button.");
      }

      const blobPromise = toBlob(captureRef.current, captureOptions).then(blob => {
        if (!blob) throw new Error("Failed to generate image");
        return blob;
      });

      const clipboardItem = new ClipboardItem({
        'image/png': blobPromise
      });

      await navigator.clipboard.write([clipboardItem]);
      
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err: any) {
      console.error('Clipboard Error:', err);
      setError(err.message || (lang === 'zh-CN' ? "复制失败。可能是由于内容过多或浏览器权限限制。" : "Copy failed."));
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!captureRef.current || isGenerating) return;
    setIsGenerating(true);
    setError(null);
    try {
      const dataUrl = await toPng(captureRef.current, {
        ...captureOptions,
      });
      const link = document.createElement('a');
      link.download = `${title.slice(0, 10)}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err: any) {
      console.error('Download Error:', err);
      setError(lang === 'zh-CN' ? "下载失败。内容可能过长。" : "Download failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 获取选中的 AI 的本地化名称
  const selectedAIName = AI_MODELS.find(m => m.id === selectedAI)?.nameKey ? t[AI_MODELS.find(m => m.id === selectedAI)!.nameKey] : '';

  return (
    <div className={`min-h-screen transition-colors duration-500 bg-slate-950 flex flex-col items-center p-4 md:p-8`}>
      <header className="w-full max-w-6xl flex justify-between items-center mb-8 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
            <Share2 className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            {t.appTitle}
          </h1>
        </div>

        {/* 语言选择器 */}
        <div className="flex items-center gap-2 bg-slate-900/50 backdrop-blur-md border border-slate-800 p-1.5 rounded-2xl">
          <Languages size={18} className="text-slate-500 ml-2" />
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value as LanguageCode)}
            className="bg-transparent text-slate-300 text-sm font-medium outline-none px-2 py-1 cursor-pointer hover:text-white transition-colors"
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code} className="bg-slate-900">{l.name}</option>
            ))}
          </select>
        </div>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <section className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-slate-300">{t.pasteLabel}</label>
              <button 
                onClick={() => setMarkdown('')} 
                className="text-slate-500 hover:text-red-400 transition-colors"
                title={t.clearTooltip}
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder={t.placeholder}
              className="w-full h-80 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-300 focus:ring-2 focus:ring-blue-500/50 outline-none resize-none font-mono text-sm transition-all"
            />

            <div className="mt-6 space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300">{t.titleLabel}</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" 
                  />
                  <button 
                    onClick={handleGenerateTitle} 
                    disabled={isAILoading || !markdown} 
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 rounded-xl flex items-center gap-2 transition-all active:scale-95"
                  >
                    {isAILoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    <span className="whitespace-nowrap">{t.aiNameBtn}</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-300">{t.aiSourceLabel}</label>
                <div className="grid grid-cols-4 gap-2">
                  {AI_MODELS.map((ai) => (
                    <button
                      key={ai.id}
                      onClick={() => setSelectedAI(ai.id)}
                      className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                        selectedAI === ai.id 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {t[ai.nameKey]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block">{t.themePreviewLabel}</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {(Object.keys(THEMES) as Theme[]).map((tKey) => (
                    <button 
                      key={tKey} 
                      onClick={() => setTheme(tKey)} 
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        theme === tKey 
                        ? 'bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-4 ring-offset-slate-900 shadow-lg shadow-blue-500/20' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {t[THEMES[tKey].nameKey]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={copyImageToClipboard} 
                disabled={!markdown || isGenerating} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-blue-900/20"
              >
                {isGenerating ? <Loader2 className="animate-spin" /> : isCopied ? <Check className="text-emerald-300" /> : <Clipboard />}
                {isCopied ? t.copiedText : t.generateBtn}
              </button>
              <button 
                onClick={downloadImage} 
                disabled={!markdown || isGenerating} 
                className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all disabled:opacity-50 active:scale-95 border border-slate-700"
                title={t.saveTooltip}
              >
                <Download size={20} />
              </button>
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 text-red-400 text-sm animate-in fade-in zoom-in duration-300">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
          </div>
        </section>

        <section className="sticky top-8">
          <div className="flex items-center justify-between mb-4 text-slate-400">
            <div className="flex items-center gap-2">
              <ImageIcon size={18} />
              <span className="text-sm font-medium">{t.previewLabel}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] bg-slate-800/80 backdrop-blur-sm border border-slate-700 px-2.5 py-1.5 rounded-full">
              <Smartphone size={12} />
              <span className="font-bold tracking-tight">MOBILE OPTIMIZED</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-800 shadow-2xl bg-slate-900 flex justify-center p-4 sm:p-6 ring-1 ring-white/5">
            <div 
              ref={captureRef}
              className={`${currentTheme.background} p-6 sm:p-8 w-full max-w-xl flex flex-col items-center transition-colors duration-500`}
            >
              <div className={`${currentTheme.cardBackground} w-full rounded-[1.5rem] overflow-hidden flex flex-col transition-all duration-500 relative`}>
                <div className="absolute inset-0 pointer-events-none rounded-[1.5rem] ring-1 ring-inset ring-white/10 opacity-50"></div>
                
                <div className={`${currentTheme.headerStyle} px-7 py-6 flex justify-between items-start z-10`}>
                  <div className="space-y-1">
                    <h2 className={`text-xl font-extrabold tracking-tight ${currentTheme.textColor}`}>{title}</h2>
                    {selectedAI && (
                      <div className={`flex items-center gap-1.5 text-[11px] font-bold py-0.5 px-2 rounded-full bg-black/5 w-fit border border-black/5 ${currentTheme.accentColor}`}>
                        <Cpu size={10} />
                        {selectedAIName} {t.aiSuffix}
                      </div>
                    )}
                  </div>
                  <div className="bg-white/10 p-2 rounded-xl border border-white/5 shadow-inner">
                    <Sparkles className={currentTheme.accentColor} size={20} />
                  </div>
                </div>

                <div className="px-7 py-8 min-h-[120px] z-10">
                  {markdown ? (
                    <MarkdownRenderer content={markdown} themeTextColor={currentTheme.textColor} />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500 opacity-20">
                      <ImageIcon size={48} strokeWidth={1} />
                      <p className="mt-4 text-sm font-medium">{lang === 'zh-CN' ? '输入内容后预览' : 'Preview after input'}</p>
                    </div>
                  )}
                </div>

                <div className="px-7 py-5 bg-black/[0.04] flex justify-between items-center border-t border-black/5 backdrop-blur-sm z-10">
                  <div className={`flex items-center gap-2 text-[11px] font-black tracking-[0.2em] ${currentTheme.accentColor}`}>
                    {t.branding}
                  </div>
                  <div className={`text-[10px] font-medium tracking-wide opacity-30 ${currentTheme.textColor}`}>
                    {new Date().toLocaleDateString(lang, { year: 'numeric', month: '2-digit', day: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-5 bg-blue-900/10 border border-blue-800/20 rounded-2xl flex gap-4 items-center">
            <div className="bg-blue-600/20 p-2 rounded-lg">
              <Check size={20} className="text-blue-400" />
            </div>
            <p className="text-xs text-blue-300 leading-relaxed">
              {t.infoText}
            </p>
          </div>
        </section>
      </main>

      <footer className="mt-auto py-10 text-slate-500 text-sm flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 opacity-60">
          <span className="w-8 h-px bg-slate-800"></span>
          <span>{t.branding} &copy; {new Date().getFullYear()}</span>
          <span className="w-8 h-px bg-slate-800"></span>
        </div>
        <p className="text-[10px] tracking-widest uppercase opacity-40">AI-Powered Conversation Exporter</p>
      </footer>
    </div>
  );
};

export default App;
