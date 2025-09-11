import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, LogOut, User, Home, History, Settings, TrendingUp, Users, Trophy, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

  // Mock stats data - will be replaced with real data later
  const stats = [
    {
      title: 'Active Giveaways',
      value: '0',
      description: 'Currently running',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Participants',
      value: '0',
      description: 'All time participants',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Winners Selected',
      value: '0',
      description: 'Total winners picked',
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Completed Giveaways',
      value: '0',
      description: 'Successfully finished',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="min-h-screen bg-background" data-testid="dashboard">
      {/* Enhanced Header */}
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
        {/* Sidebar Navigation */}
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

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
                <p className="text-muted-foreground">Manage your Telegram giveaways and track performance</p>
              </div>
              <Link to={ROUTES.CREATE_GIVEAWAY}>
                <Button size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Giveaway
                </Button>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.title} className="bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <div className={`p-2 rounded-full ${stat.bgColor}`}>
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                      <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Main Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Welcome Card */}
              <div className="lg:col-span-2">
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-foreground">Welcome to Telegive Dashboard</CardTitle>
                    <CardDescription>
                      Start creating engaging giveaways for your Telegram community
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Trophy className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Get Started</h3>
                      <p className="text-muted-foreground mb-6">
                        Create your first giveaway to engage your Telegram audience and grow your community!
                      </p>
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

              {/* Quick Actions */}
              <div className="space-y-6">
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-foreground">Quick Actions</CardTitle>
                    <CardDescription>Common tasks and shortcuts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link to={ROUTES.CREATE_GIVEAWAY} className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Giveaway
                      </Button>
                    </Link>
                    <Link to={ROUTES.HISTORY} className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <History className="mr-2 h-4 w-4" />
                        View History
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Tips Card */}
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-foreground">Pro Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <p className="font-medium text-primary">💡 Engagement Tip</p>
                      <p className="text-muted-foreground">
                        Add attractive prizes and clear rules to increase participation rates.
                      </p>
                    </div>
                    <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                      <p className="font-medium text-green-600">✅ Best Practice</p>
                      <p className="text-muted-foreground">
                        Set appropriate duration and winner count for your community size.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;

