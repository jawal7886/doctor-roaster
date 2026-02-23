/**
 * File: components/layout/AppHeader.tsx
 * Purpose: Top header bar with search, notifications, and user profile.
 * Appears above the main content area.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Menu, UserCog, LogOut, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getNotificationStats } from '@/services/notificationService';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import EditProfileModal from '@/components/modals/EditProfileModal';

interface AppHeaderProps {
  /** Title of the current page */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Toggle mobile sidebar */
  onMenuToggle?: () => void;
}

const AppHeader = ({ title, subtitle, onMenuToggle }: AppHeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, logout } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    // Listen for notification events
    const handleNotificationUpdate = () => {
      fetchUnreadCount();
    };
    
    window.addEventListener('notificationCreated', handleNotificationUpdate);
    window.addEventListener('notificationRead', handleNotificationUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationCreated', handleNotificationUpdate);
      window.removeEventListener('notificationRead', handleNotificationUpdate);
    };
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const stats = await getNotificationStats();
      setUnreadCount(stats.unread);
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    }
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Left side — menu toggle + page title */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right side — search + notifications + avatar */}
      <div className="flex items-center gap-3">
        {/* Search bar */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="h-9 w-64 pl-9 text-sm"
          />
        </div>

        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          onClick={handleNotificationClick}
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive p-0 text-[10px] text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* User avatar with dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-auto py-1 px-2 hover:bg-accent">
              {currentUser?.avatar ? (
                <div className="h-8 w-8 rounded-full overflow-hidden bg-white border border-border">
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {currentUser?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-foreground">{currentUser?.name || 'User'}</p>
                <p className="text-[10px] text-muted-foreground">{currentUser?.roleDisplay || currentUser?.role || 'Staff'}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{currentUser?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{currentUser?.email || ''}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setEditProfileOpen(true)}>
              <UserCog className="mr-2 h-4 w-4" />
              <span>Edit Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal open={editProfileOpen} onOpenChange={setEditProfileOpen} />
    </header>
  );
};

export default AppHeader;
