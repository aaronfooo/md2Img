
import React, { useMemo } from 'react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
  themeTextColor: string;
  fontSize: 'medium' | 'large';
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, themeTextColor, fontSize }) => {
  const htmlContent = useMemo(() => {
    try {
      // 显式配置 marked 以确保输出标准的 HTML 标签
      return marked.parse(content, {
        gfm: true,
        breaks: true,
      }) as string;
    } catch (e) {
      console.error('Markdown parsing failed', e);
      return content;
    }
  }, [content]);

  const fontSizeClasses = fontSize === 'large' 
    ? 'text-[20px] sm:text-[22px] leading-[1.8]' 
    : 'text-[16px] sm:text-[17px] leading-[1.6]';

  return (
    <div className={`md-content-container ${fontSizeClasses} ${themeTextColor}`}>
      {/* 
        注入关键样式：
        1. 强制 strong 和 b 标签加粗，覆盖 Tailwind 重置
        2. 确保在 html-to-image 克隆时样式依然生效
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        .md-content strong, 
        .md-content b { 
          font-weight: 800 !important; 
          -webkit-font-smoothing: antialiased;
          display: inline;
        }
        .md-content em, 
        .md-content i { 
          font-style: italic !important; 
          display: inline;
        }
        /* 额外加固列表样式，防止在某些环境下圆点消失 */
        .md-content ul { list-style-type: disc !important; }
        .md-content ol { list-style-type: decimal !important; }
        .md-content li { display: list-item !important; }
      ` }} />
      <div 
        className="md-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};

export default MarkdownRenderer;
