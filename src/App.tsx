import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { OfflineIndicator } from '@/components/ui/offline-indicator';
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import HomePage from "./pages/HomePage";
import About from "./pages/About";
import LoginPage from "./pages/LoginPage";
import ContactPage from "./pages/ContactPage";
import ChatHistory from "./pages/ChatHistory";
import KnowledgeBase from "./pages/KnowledgeBase";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import TenantManagement from "./pages/admin/TenantManagement";
import UserManagement from "./pages/admin/UserManagement";
import WorkflowAutomation from "./pages/admin/WorkflowAutomation";
import APISettings from "./pages/admin/APISettings";
import AuditLogs from "./pages/admin/AuditLogs";
import SystemMonitoring from "./pages/admin/SystemMonitoring";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="zyria-theme">
      <ErrorBoundary>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected Routes with Layout */}
              <Route path="/dashboard" element={<AppLayout><Index /></AppLayout>} />
              <Route path="/history" element={<AppLayout><ChatHistory /></AppLayout>} />
              <Route path="/knowledge" element={<AppLayout><KnowledgeBase /></AppLayout>} />
              <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
              <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
              <Route path="/admin/tenants" element={<AppLayout><TenantManagement /></AppLayout>} />
              <Route path="/admin/users" element={<AppLayout><UserManagement /></AppLayout>} />
              <Route path="/admin/workflows" element={<AppLayout><WorkflowAutomation /></AppLayout>} />
              <Route path="/admin/api" element={<AppLayout><APISettings /></AppLayout>} />
              <Route path="/admin/audit" element={<AppLayout><AuditLogs /></AppLayout>} />
              <Route path="/admin/monitoring" element={<AppLayout><SystemMonitoring /></AppLayout>} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <OfflineIndicator />
        </TooltipProvider>
      </ErrorBoundary>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
