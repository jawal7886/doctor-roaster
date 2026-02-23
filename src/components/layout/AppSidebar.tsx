/**
 * File: components/layout/AppSidebar.tsx
 * Purpose: Main sidebar navigation component.
 * Renders the navigation menu with icons, active state, and branding.
 */

import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  CalendarOff,
  Bell,
  BarChart3,
  Activity,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { NAV_ITEMS } from '@/constants';
import { cn } from '@/lib/utils';
import { useHospitalSettings } from '@/contexts/HospitalSettingsContext';
import { useUser } from '@/contexts/UserContext';

/** Icon mapping from string to Lucide component */
const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  CalendarOff,
  Bell,
  BarChart3,
};

const AppSidebar = () => {
  const location = useLocation();
  const { settings } = useHospitalSettings();
  const { currentUser } = useUser();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col overflow-hidden bg-sidebar text-sidebar-foreground shadow-lg">
      {/* Brand header with logo */}
      <div className="flex h-20 shrink-0 items-center gap-3 border-b border-sidebar-border px-6 bg-gradient-to-r from-primary/10 to-accent/10">
        {settings?.hospital_logo ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden bg-white shadow-lg">
            <img 
              src={settings.hospital_logo} 
              alt={settings.hospital_name || 'Hospital Logo'} 
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
            <Activity className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>
        )}
        <div>
          <h1 className="text-lg font-bold text-sidebar-primary-foreground">
            {settings?.hospital_name || 'MedScheduler'}
          </h1>
          <p className="text-[11px] text-sidebar-muted font-medium">Hospital Management</p>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="sidebar-scroll flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary shadow-sm'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )}
            >
              {Icon && <Icon className="h-4.5 w-4.5 shrink-0" />}
              <span>{item.label}</span>
              {/* Active indicator */}
              {isActive && (
                <ChevronRight className="ml-auto h-4 w-4 text-sidebar-primary" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User profile section */}
      <div className="shrink-0 border-t border-sidebar-border bg-sidebar-accent/20">
        {/* Settings link */}
        <div className="p-3">
          <NavLink
            to="/settings"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              location.pathname === '/settings'
                ? 'bg-sidebar-accent text-sidebar-primary'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            )}
          >
            <Settings className="h-4.5 w-4.5" />
            <span>Settings</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
