import React from 'react';
import { CodeBlock } from './CodeBlock';

interface MessageContentProps {
  content: string;
  className?: string;
}

export function MessageContent({ content, className }: MessageContentProps) {
  // Parse content for code blocks
  const parseContent = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const inlineCodeRegex = /`([^`]+)`/g;
    
    const parts = [];
    let lastIndex = 0;
    let match;

    // Find code blocks
    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const textBefore = text.slice(lastIndex, match.index);
        parts.push(parseInlineCode(textBefore));
      }

      // Add code block
      const language = match[1] || 'text';
      const code = match[2].trim();
      parts.push(
        <CodeBlock key={match.index} language={language}>
          {code}
        </CodeBlock>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      parts.push(parseInlineCode(remainingText));
    }

    return parts.length > 0 ? parts : [parseInlineCode(text)];
  };

  const parseInlineCode = (text: string) => {
    const inlineCodeRegex = /`([^`]+)`/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = inlineCodeRegex.exec(text)) !== null) {
      // Add text before inline code
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Add inline code
      parts.push(
        <code
          key={match.index}
          className="bg-accent px-1.5 py-0.5 rounded text-sm font-mono border border-chat-border"
        >
          {match[1]}
        </code>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const parsedContent = parseContent(content);

  return (
    <div className={className}>
      {parsedContent.map((part, index) => (
        <React.Fragment key={index}>
          {typeof part === 'string' ? (
            <span className="leading-relaxed whitespace-pre-wrap">{part}</span>
          ) : (
            part
          )}
        </React.Fragment>
      ))}
    </div>
  );
}