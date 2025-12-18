
import React, { useMemo } from 'react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
  themeTextColor: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, themeTextColor }) => {
  const htmlContent = useMemo(() => {
    try {
      // 配置 marked 以增强安全性并支持 GFM
      return marked.parse(content, {
        gfm: true,
        breaks: true,
      }) as string;
    } catch (e) {
      console.error('Markdown parsing failed', e);
      return content;
    }
  }, [content]);

  return (
    <div 
      className={`md-content leading-relaxed text-[16px] sm:text-[17px] ${themeTextColor}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default MarkdownRenderer;
