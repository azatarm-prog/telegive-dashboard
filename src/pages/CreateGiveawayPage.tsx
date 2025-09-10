import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '@/components/common/Header';
import Sidebar from '@/components/common/Sidebar';
import GiveawayForm from '@/components/giveaway/GiveawayForm';
import { useGiveaway } from '@/hooks/useGiveaway';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';

const CreateGiveawayPage: React.FC = () => {
  const navigate = useNavigate();
  const { account } = useAuth();
  const { activeGiveaway, fetchActiveGiveaway } = useGiveaway();

  useEffect(() => {
    if (account) {
      fetchActiveGiveaway(account.id);
    }
  }, [account, fetchActiveGiveaway]);

  // Redirect if there's already an active giveaway
  if (activeGiveaway) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const handleSuccess = () => {
    navigate(ROUTES.DASHBOARD);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <aside className="w-64 min-h-screen bg-white border-r">
          <Sidebar />
        </aside>
        
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
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
                <h1 className="text-3xl font-bold text-gray-900">Create Giveaway</h1>
                <p className="text-gray-600">
                  Set up a new giveaway for your Telegram channel
                </p>
              </div>
            </div>

            {/* Information Alert */}
            <Alert>
              <AlertDescription>
                <strong>Before you start:</strong> Make sure your bot is added to your Telegram channel 
                as an administrator with permission to post messages and manage the channel.
              </AlertDescription>
            </Alert>

            {/* Giveaway Form */}
            <div className="flex justify-center">
              <GiveawayForm onSuccess={handleSuccess} />
            </div>

            {/* Help Section */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  How it works
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                      1
                    </div>
                    <p>
                      Fill in the giveaway details including title, description, and number of winners
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                      2
                    </div>
                    <p>
                      Optionally upload an image or video to make your giveaway more engaging
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                      3
                    </div>
                    <p>
                      Click "Publish Giveaway" to post it to your Telegram channel
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                      4
                    </div>
                    <p>
                      Monitor participants and configure finish messages from the dashboard
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateGiveawayPage;

