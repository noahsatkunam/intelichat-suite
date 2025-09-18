import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { OfflineIndicator } from '@/components/ui/offline-indicator';
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import HomePage from "./pages/HomePage";
import About from "./pages/About";
import AuthPage from "./pages/AuthPage";
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
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/auth" element={<AuthPage />} />
                
                {/* Protected Routes with Layout */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <AppLayout><Index /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/history" element={
                  <ProtectedRoute>
                    <AppLayout><ChatHistory /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/knowledge" element={
                  <ProtectedRoute>
                    <AppLayout><KnowledgeBase /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <AppLayout><Analytics /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <AppLayout><Settings /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/tenants" element={
                  <ProtectedRoute>
                    <AppLayout><TenantManagement /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute>
                    <AppLayout><UserManagement /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/workflows" element={
                  <ProtectedRoute>
                    <AppLayout><WorkflowAutomation /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/api" element={
                  <ProtectedRoute>
                    <AppLayout><APISettings /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/audit" element={
                  <ProtectedRoute>
                    <AppLayout><AuditLogs /></AppLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/monitoring" element={
                  <ProtectedRoute>
                    <AppLayout><SystemMonitoring /></AppLayout>
                  </ProtectedRoute>
                } />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <OfflineIndicator />
          </AuthProvider>
        </TooltipProvider>
      </ErrorBoundary>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
