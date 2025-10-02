import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
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
        <main className="flex-1 min-w-0 p-4 md:p-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}