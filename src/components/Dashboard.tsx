import React from 'react';
import { User } from '../types/user';
import { AlertPanel } from './AlertPanel';
import IncidentList from './IncidentList';
import NetworkMonitor from './NetworkMonitor';
import SystemStatus from './SystemStatus';
import ThreatDetectionPanel from './ThreatDetectionPanel';
import ThreatMap from './ThreatMap';
import SystemAlertPanel from './SystemAlertPanel';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Security Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user.name}</span>
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 xl:col-span-2">
            <SystemStatus />
          </div>
          <div>
            <AlertPanel />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <NetworkMonitor />
          <ThreatDetectionPanel />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <div>
            <IncidentList />
          </div>
          <div>
            <ThreatMap />
          </div>
        </div>

        <div className="mb-8">
          <SystemAlertPanel />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;