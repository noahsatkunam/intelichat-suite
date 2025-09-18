import React from 'react';
import { Brain, Zap, Search, Wind, Cog } from 'lucide-react';

interface ProviderLogoProps {
  provider: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ProviderLogo: React.FC<ProviderLogoProps> = ({ 
  provider, 
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const getProviderIcon = () => {
    const lowerProvider = provider.toLowerCase();
    
    if (lowerProvider === 'openai') {
      return (
        <div className={`${sizeClasses[size]} ${className} bg-black rounded-sm flex items-center justify-center`}>
          <svg viewBox="0 0 24 24" className="w-3/4 h-3/4 fill-white">
            <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
          </svg>
        </div>
      );
    }
    
    if (lowerProvider === 'anthropic' || lowerProvider === 'claude') {
      return (
        <div className={`${sizeClasses[size]} ${className} bg-orange-500 rounded-sm flex items-center justify-center`}>
          <Brain className="w-3/4 h-3/4 text-white" />
        </div>
      );
    }
    
    if (lowerProvider === 'google' || lowerProvider === 'gemini') {
      return (
        <div className={`${sizeClasses[size]} ${className} bg-blue-500 rounded-sm flex items-center justify-center`}>
          <Search className="w-3/4 h-3/4 text-white" />
        </div>
      );
    }
    
    if (lowerProvider === 'mistral') {
      return (
        <div className={`${sizeClasses[size]} ${className} bg-red-500 rounded-sm flex items-center justify-center`}>
          <Wind className="w-3/4 h-3/4 text-white" />
        </div>
      );
    }
    
    if (lowerProvider === 'ollama') {
      return (
        <div className={`${sizeClasses[size]} ${className} bg-green-600 rounded-sm flex items-center justify-center`}>
          <svg viewBox="0 0 24 24" className="w-3/4 h-3/4 fill-white">
            <path d="M12 2C11.73 2 11.5 2.17 11.5 2.44V4.56C8.18 5.84 6 9.06 6 12.5C6 16.64 9.36 20 13.5 20C17.64 20 21 16.64 21 12.5C21 9.06 18.82 5.84 15.5 4.56V2.44C15.5 2.17 15.27 2 15 2H12ZM13.5 18C10.46 18 8 15.54 8 12.5C8 9.46 10.46 7 13.5 7C16.54 7 19 9.46 19 12.5C19 15.54 16.54 18 13.5 18Z"/>
          </svg>
        </div>
      );
    }
    
    // Default for custom or unknown providers
    return (
      <div className={`${sizeClasses[size]} ${className} bg-gray-500 rounded-sm flex items-center justify-center`}>
        <Cog className="w-3/4 h-3/4 text-white" />
      </div>
    );
  };

  return getProviderIcon();
};

export default ProviderLogo;