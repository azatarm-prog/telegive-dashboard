import React, { useEffect } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, LogOut, Home, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import GiveawayForm from '@/components/giveaway/GiveawayForm';
import DefaultSettingsPanel from '@/components/giveaway/DefaultSettingsPanel';
import { useGiveaway } from '@/hooks/useGiveaway';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';

const CreateGiveawayPage: React.FC = () => {
  const navigate = useNavigate();
  const { account, logout } = useAuth();
  const { activeGiveaway, fetchActiveGiveaway } = useGiveaway();

  useEffect(() => {
    // Temporarily disabled again - causing navigation issues due to account validation failures
    // Will re-enable once Auth Service account validation is fixed
    // if (account) {
    //   fetchActiveGiveaway(account.id);
    // }
  }, [account, fetchActiveGiveaway]);

  // Redirect if there's already an active giveaway
  // Temporarily disabled due to account validation issues
  // if (activeGiveaway) {
  //   return <Navigate to={ROUTES.DASHBOARD} replace />;
  // }

  const handleSuccess = () => {
    navigate(ROUTES.DASHBOARD);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const getInitials = (firstName: string, lastName?: string) => {
    const first = firstName?.charAt(0)?.toUpperCase() || 'U';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last;
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: ROUTES.DASHBOARD,
      icon: Home,
      current: false,
    },
    {
      name: 'Create Giveaway',
      href: ROUTES.CREATE_GIVEAWAY,
      icon: Plus,
      current: true,
    },
    {
      name: 'History',
      href: ROUTES.HISTORY,
      icon: History,
      current: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-foreground">Telegive Dashboard</h1>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome back, {account?.first_name || 'User'}!
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(account?.first_name || 'User', account?.last_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {account?.first_name} {account?.last_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        Bot ID: {account?.id}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-card border-r shadow-sm">
          <div className="p-6">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${
                        item.current
                          ? 'bg-primary/10 text-primary border-r-2 border-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }
                    `}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 w-64 p-6 border-t">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                  {getInitials(account?.first_name || 'User', account?.last_name)}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-foreground">
                  {account?.first_name} {account?.last_name}
                </p>
                <p className="text-xs text-muted-foreground">Bot ID: {account?.id}</p>
              </div>
            </div>
          </div>
        </aside>
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div>
                <h2 className="text-3xl font-bold text-foreground">Create Giveaway</h2>
                <p className="text-muted-foreground">Set up a new giveaway for your Telegram community</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Giveaway Form */}
              <div className="lg:col-span-2">
                <GiveawayForm onSuccess={handleSuccess} />
              </div>

              {/* Default Settings Panel */}
              <div className="lg:col-span-1">
                <DefaultSettingsPanel 
                  channelName={account?.channelName || '@yourchannel'}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateGiveawayPage;

