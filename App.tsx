import React from 'react';
import { AppProvider, useApp } from './AppContext';
import { AuthPage } from './pages/AuthPage';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { ClientDashboard } from './pages/ClientDashboard';
import { Navbar } from './components/Navbar';
import { UserRole } from './types';

const MainLayout = () => {
  const { user } = useApp();

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        {user.role === UserRole.OWNER ? <OwnerDashboard /> : <ClientDashboard />}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;