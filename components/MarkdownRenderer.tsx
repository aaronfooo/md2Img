
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
      // 确保使用同步解析，并开启 GFM 支持
      return marked.parse(content, {
        gfm: true,
        breaks: true,
      }) as string;
    } catch (e) {
      console.error('Markdown parsing failed', e);
      return content;
    }
  }, [content]);

  // 移除了 space-y-x 类，因为这会给 li 增加不必要的 margin-top 导致圆点错位
  const fontSizeClasses = fontSize === 'large' 
    ? 'text-[20px] sm:text-[22px] leading-[1.8]' 
    : 'text-[16px] sm:text-[17px] leading-[1.6]';

  return (
    <div 
      className={`md-content ${fontSizeClasses} ${themeTextColor}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default MarkdownRenderer;
