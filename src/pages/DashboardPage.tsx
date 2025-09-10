import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, History, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/common/Header';
import Sidebar from '@/components/common/Sidebar';
import ActiveGiveaway from '@/components/giveaway/ActiveGiveaway';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useGiveaway } from '@/hooks/useGiveaway';
import { ROUTES } from '@/utils/constants';

const DashboardPage: React.FC = () => {
  const { account } = useAuth();
  const { activeGiveaway, loading, fetchActiveGiveaway } = useGiveaway();

  useEffect(() => {
    if (account) {
      fetchActiveGiveaway(account.id);
    }
  }, [account, fetchActiveGiveaway]);

  return (
    <div className="min-h-screen bg-gray-50" data-testid="dashboard">
      <Header />
      
      <div className="flex">
        <aside className="w-64 min-h-screen bg-white border-r">
          <Sidebar />
        </aside>
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">
                  Welcome back, {account?.first_name}! Manage your giveaways here.
                </p>
              </div>
              
              {!activeGiveaway && (
                <Link to={ROUTES.CREATE_GIVEAWAY}>
                  <Button data-testid="create-giveaway-button">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Giveaway
                  </Button>
                </Link>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Giveaway
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {activeGiveaway ? '1' : '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activeGiveaway ? 'Currently running' : 'No active giveaway'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Participants
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {activeGiveaway?.participant_count || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    In current giveaway
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Winners to Select
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {activeGiveaway?.winner_count || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    When giveaway ends
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Giveaway Section */}
              <div className="lg:col-span-2">
                {loading ? (
                  <Card>
                    <CardContent className="p-6">
                      <LoadingSpinner size="lg" text="Loading dashboard..." />
                    </CardContent>
                  </Card>
                ) : (
                  <ActiveGiveaway />
                )}
              </div>

              {/* Quick Actions Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Common tasks and shortcuts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {!activeGiveaway && (
                      <Link to={ROUTES.CREATE_GIVEAWAY} className="block">
                        <Button variant="outline" className="w-full justify-start">
                          <Plus className="mr-2 h-4 w-4" />
                          Create New Giveaway
                        </Button>
                      </Link>
                    )}
                    
                    <Link to={ROUTES.HISTORY} className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <History className="mr-2 h-4 w-4" />
                        View History
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Tips Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium text-blue-900">💡 Pro Tip</p>
                      <p className="text-blue-700">
                        Configure finish messages before your giveaway gets too many participants for easier management.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="font-medium text-green-900">✅ Best Practice</p>
                      <p className="text-green-700">
                        Add engaging media to your giveaways to increase participation rates.
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

