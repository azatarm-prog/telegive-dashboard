import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/common/Header';
import Sidebar from '@/components/common/Sidebar';
import ActiveGiveaway from '@/components/giveaway/ActiveGiveaway';
import CurrentSettingsPanel from '@/components/giveaway/CurrentSettingsPanel';
import { useNavigate } from 'react-router-dom';
import { useGiveaway } from '@/hooks/useGiveaway';

const ActiveGiveawayPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeGiveaway } = useGiveaway();

  const handleGoBack = () => {
    navigate(-1);
  };

  // Mock active giveaway data if none exists (for demonstration)
  const mockGiveaway = {
    id: '1',
    title: 'Amazing Prize Giveaway',
    main_body: 'Win an incredible prize by participating in our giveaway!',
    winner_count: 3,
    participant_count: 127,
    status: 'active' as const,
    channel_name: '@testgiveawaychannel',
    created_at: new Date().toISOString(),
    account_id: '262662172',
  };

  const currentGiveaway = activeGiveaway || mockGiveaway;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <aside className="w-64 min-h-screen bg-card border-r shadow-sm">
          <Sidebar />
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
                <h1 className="text-3xl font-bold text-foreground">Active Giveaway</h1>
                <p className="text-muted-foreground">
                  Monitor and manage your active giveaway
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Giveaway Management */}
              <div className="lg:col-span-2">
                <ActiveGiveaway />
              </div>

              {/* Current Settings Panel */}
              <div className="lg:col-span-1">
                <CurrentSettingsPanel giveaway={currentGiveaway} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ActiveGiveawayPage;

