import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

interface ChatLayoutProps {
  children: React.ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <SidebarProvider 
      defaultOpen={true}
      style={{
        "--sidebar-width": "20rem",
        "--sidebar-width-icon": "4rem",
      } as React.CSSProperties}
    >
      <div className="flex min-h-svh w-full bg-background">
        <AppSidebar />
        <div className="flex-1 min-w-0 h-screen overflow-hidden">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
