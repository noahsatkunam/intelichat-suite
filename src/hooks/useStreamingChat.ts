import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface StreamMessage {
  type: 'metadata' | 'content' | 'error' | 'done' | 'failover';
  content?: string;
  provider?: string;
  model?: string;
  sources?: any[];
  message?: string;
}

interface UseStreamingChatOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: string) => void;
  onMetadata?: (metadata: any) => void;
}

export function useStreamingChat(options: UseStreamingChatOptions = {}) {
  const { session } = useAuth();
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [metadata, setMetadata] = useState<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const streamMessage = useCallback(async (
    conversationId: string,
    message: string,
    userId: string,
    useKnowledgeBase: boolean = false,
    chatbotId: string | null = null
  ) => {
    if (isStreaming) {
      console.warn('[useStreamingChat] Already streaming, ignoring request');
      return;
    }

    setIsStreaming(true);
    setCurrentResponse('');
    setMetadata(null);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(
        'https://onvnvlnxmilotkxkfddu.supabase.co/functions/v1/ai-chat-stream',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            chatbot_id: chatbotId,
            message,
            conversation_id: conversationId,
            user_id: userId,
            use_knowledge_base: useKnowledgeBase
          }),
          signal: abortControllerRef.current.signal
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';
      let accumulatedResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: StreamMessage = JSON.parse(line.slice(6));

              switch (data.type) {
                case 'metadata':
                  const meta = {
                    provider: data.provider,
                    model: data.model,
                    sources: data.sources || []
                  };
                  setMetadata(meta);
                  options.onMetadata?.(meta);
                  break;

                case 'content':
                  if (data.content) {
                    accumulatedResponse += data.content;
                    setCurrentResponse(accumulatedResponse);
                    options.onChunk?.(data.content);
                  }
                  break;

                case 'failover':
                  toast.info('Switching providers', {
                    description: data.message || 'Trying backup provider...',
                    duration: 2000
                  });
                  break;

                case 'error':
                  const errorMsg = data.content || 'Unknown error';
                  options.onError?.(errorMsg);
                  toast.error('AI Error', { description: errorMsg });
                  break;

                case 'done':
                  options.onComplete?.(accumulatedResponse);
                  break;
              }
            } catch (parseError) {
              console.error('[useStreamingChat] Parse error:', parseError, line);
            }
          }
        }
      }

      return {
        response: accumulatedResponse,
        metadata
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('[useStreamingChat] Stream aborted by user');
        toast.info('Response cancelled');
      } else {
        console.error('[useStreamingChat] Streaming error:', error);
        const errorMsg = error.message || 'Failed to get AI response';
        options.onError?.(errorMsg);
        toast.error('Streaming failed', { description: errorMsg });
      }
      throw error;
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [isStreaming, session, options]);

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      toast.info('Stopping response...');
    }
  }, []);

  const reset = useCallback(() => {
    setCurrentResponse('');
    setMetadata(null);
    setIsStreaming(false);
  }, []);

  return {
    streamMessage,
    cancelStream,
    reset,
    isStreaming,
    currentResponse,
    metadata
  };
}
