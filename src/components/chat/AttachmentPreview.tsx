import React from 'react';
import { File, Image as ImageIcon, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AttachmentPreviewProps {
  attachment: {
    name: string;
    type: string;
    url: string;
  };
}

export function AttachmentPreview({ attachment }: AttachmentPreviewProps) {
  const isImage = attachment.type.startsWith('image/');

  const formatFileSize = (name: string) => {
    // Mock file size for demo
    return '2.4 MB';
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    link.click();
  };

  if (isImage) {
    return (
      <div className="relative group max-w-xs">
        <img
          src={attachment.url}
          alt={attachment.name}
          className="rounded-lg shadow-soft max-h-48 w-auto"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
          <Button
            variant="secondary"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity shadow-medium"
            onClick={handleDownload}
          >
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1 truncate">{attachment.name}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-accent/50 border border-chat-border rounded-lg hover:bg-accent/70 transition-colors group">
      <div className="text-muted-foreground">
        <File className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{attachment.name}</p>
        <p className="text-xs text-muted-foreground">{formatFileSize(attachment.name)}</p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleDownload}
        >
          <Download className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => window.open(attachment.url, '_blank')}
        >
          <ExternalLink className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}