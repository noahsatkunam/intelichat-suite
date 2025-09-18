import React from 'react';
import { Badge } from '@/components/ui/badge';

interface AIProviderBadgeProps {
  provider: string;
  model?: string;
  className?: string;
}

const getProviderIcon = (provider: string) => {
  const lowerProvider = provider.toLowerCase();
  if (lowerProvider.includes('openai')) return '🤖';
  if (lowerProvider.includes('claude') || lowerProvider.includes('anthropic')) return '🧠';
  if (lowerProvider.includes('google') || lowerProvider.includes('gemini')) return '🔍';
  if (lowerProvider.includes('mistral')) return '🌬️';
  if (lowerProvider.includes('ollama')) return '🦙';
  return '⚙️';
};

export const AIProviderBadge: React.FC<AIProviderBadgeProps> = ({ 
  provider, 
  model, 
  className 
}) => {
  const displayText = model ? `${provider} ${model}` : provider;
  
  return (
    <Badge 
      variant="secondary" 
      className={`text-xs flex items-center gap-1 ${className || ''}`}
    >
      <span>{getProviderIcon(provider)}</span>
      <span>Powered by {displayText}</span>
    </Badge>
  );
};