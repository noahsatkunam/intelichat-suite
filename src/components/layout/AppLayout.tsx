import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
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
        <SidebarInset className="flex-1 min-w-0">
          <header className="flex h-14 items-center border-b px-4 md:px-6">
            <SidebarTrigger className="p-2 hover:bg-accent rounded-lg transition-colors" />
          </header>
          <main className="h-full w-full p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}