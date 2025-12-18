
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
    ? 'text-[20px] sm:text-[22px] leading-[1.8] space-y-6' 
    : 'text-[16px] sm:text-[17px] leading-[1.6] space-y-4';

  return (
    <div 
      className={`md-content ${fontSizeClasses} ${themeTextColor}`}
      style={{ '--md-font-scale': fontSize === 'large' ? '1.25' : '1' } as any}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default MarkdownRenderer;
