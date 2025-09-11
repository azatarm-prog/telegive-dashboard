import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, LogOut, User, Home, History, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';

const DashboardPage: React.FC = () => {
  const { account, logout } = useAuth();
  const location = useLocation();

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
      current: location.pathname === ROUTES.DASHBOARD,
    },
    {
      name: 'Create Giveaway',
      href: ROUTES.CREATE_GIVEAWAY,
      icon: Plus,
      current: location.pathname === ROUTES.CREATE_GIVEAWAY,
    },
    {
      name: 'History',
      href: ROUTES.HISTORY,
      icon: History,
      current: location.pathname === ROUTES.HISTORY,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50" data-testid="dashboard">
      {/* Enhanced Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Telegive Dashboard</h1>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome back, {account?.first_name || 'User'}!
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-500 text-white">
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
        {/* Sidebar Navigation */}
        <aside className="w-64 min-h-screen bg-white border-r shadow-sm">
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
                          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
                <AvatarFallback className="bg-gray-500 text-white text-xs">
                  {getInitials(account?.first_name || 'User', account?.last_name)}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {account?.first_name} {account?.last_name}
                </p>
                <p className="text-xs text-gray-500">Bot ID: {account?.id}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
              <p className="text-gray-600">Manage your Telegram giveaways</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Welcome to Telegive Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Get Started</h3>
                  <p className="text-gray-600 mb-4">Create your first giveaway to engage your Telegram audience!</p>
                  <Link to={ROUTES.CREATE_GIVEAWAY}>
                    <Button size="lg">
                      <Plus className="mr-2 h-5 w-5" />
                      Create Your First Giveaway
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;

