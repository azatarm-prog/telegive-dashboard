import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';

const DashboardPage: React.FC = () => {
  const { account } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50" data-testid="dashboard">
      {/* Simple Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Telegive Dashboard</h1>
            <div className="text-sm text-gray-600">
              Welcome, {account?.first_name || 'User'}!
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Telegive Dashboard</h3>
                <p className="text-gray-600 mb-4">Create your first giveaway to get started!</p>
                <Link to={ROUTES.CREATE_GIVEAWAY}>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Giveaway
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;

