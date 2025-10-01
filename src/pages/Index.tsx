import { EnhancedEmptyState } from '@/components/ui/enhanced-empty-state';

const Index = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <EnhancedEmptyState
        variant="chat"
        title="Chat Interface"
        description="Chat functionality will be rebuilt from scratch"
      />
    </div>
  );
};

export default Index;
