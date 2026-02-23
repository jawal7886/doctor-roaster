/**
 * File: components/layout/AppLayout.tsx
 * Purpose: Main layout wrapper that combines sidebar, header, and content area.
 * Provides the shell structure for all pages.
 */

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  /** Page title shown in the header */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
}

const AppLayout = ({ title, subtitle }: AppLayoutProps) => {
  /** Track mobile sidebar open/close state */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Mobile overlay */}
      <div className={cn(
        'fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )} onClick={() => setSidebarOpen(false)} />
      
      {/* Sidebar wrapper */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <AppSidebar />
      </div>

      {/* Main content area */}
      <div className="lg:pl-64">
        <AppHeader
          title={title}
          subtitle={subtitle}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
