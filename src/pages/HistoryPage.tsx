import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/common/Header';
import Sidebar from '@/components/common/Sidebar';
import GiveawayHistory from '@/components/giveaway/GiveawayHistory';
import { useNavigate } from 'react-router-dom';

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();

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
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="flex items-center"
                data-testid="history-tab"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Giveaway History</h1>
                <p className="text-gray-600">
                  View and analyze your past giveaways
                </p>
              </div>
            </div>

            {/* History Component */}
            <GiveawayHistory />
          </div>
        </main>
      </div>
    </div>
  );
};

export default HistoryPage;

