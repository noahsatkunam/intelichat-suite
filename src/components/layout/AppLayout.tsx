import React from 'react';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

function MainContent({ children }: { children: React.ReactNode }) {
  const { state, open } = useSidebar();
  
  return (
    <main 
      className={cn(
        "min-h-screen transition-all duration-300 ease-in-out",
        "bg-background",
        // Dynamic margin based on sidebar state
        open 
          ? "ml-[260px]" // sidebar width (240px) + buffer (20px)
          : state === "collapsed" 
            ? "ml-[80px]" // collapsed width (60px) + buffer (20px)
            : "ml-0"
      )}
    >
      <div className="h-full w-full px-6 py-6">
        {children}
      </div>
    </main>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen w-full bg-background">
        <AppSidebar />
        <MainContent>
          {children}
        </MainContent>
      </div>
    </SidebarProvider>
  );
}