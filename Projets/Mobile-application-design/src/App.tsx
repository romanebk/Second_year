import { useState } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SupabaseAuthProvider, useSupabaseAuthContext } from './contexts/SupabaseAuthContext';
import { USE_SUPABASE } from './config/app';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { RoleSelection } from './components/RoleSelection';
import { EmployeeRegistration } from './components/EmployeeRegistration';
import { SupervisorRegistration } from './components/SupervisorRegistration';
import { AdministratorRegistration } from './components/AdministratorRegistration';
import { EmployeeHome } from './components/EmployeeHome';
import { EmployeeMap } from './components/EmployeeMap';
import { SupervisorDashboard } from './components/SupervisorDashboard';
import { SupervisorSites } from './components/SupervisorSites';
import { SupervisorPairs } from './components/SupervisorPairs';
import { SupervisorAlerts } from './components/SupervisorAlerts';
import { AdminDashboard } from './components/AdminDashboard';
import { ProfileScreen } from './components/ProfileScreen';
import { MobileNav } from './components/MobileNav';
import { Login } from './components/Login';
import { Toaster } from './components/ui/sonner';
import { UserRole } from './types';
import { useLanguage } from './contexts/LanguageContext';
import { Logo } from './components/Logo';

function AppContent() {
  // Use the appropriate auth context based on configuration
  const authContext = USE_SUPABASE ? useSupabaseAuthContext() : useAuth();
  const { currentUser, logout } = authContext;
  const { t } = useLanguage();
  const [view, setView] = useState<'login' | 'roleSelect' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [currentView, setCurrentView] = useState('home');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setView('register');
  };

  // If user is logged in, show appropriate dashboard with mobile navigation
  if (currentUser) {
    // Set default view based on role
    if (currentView === 'home' && currentUser.role !== 'employee') {
      setCurrentView('dashboard');
    }

    const renderView = () => {
      // Employee views
      if (currentUser.role === 'employee') {
        switch (currentView) {
          case 'home':
            return <EmployeeHome />;
          case 'map':
            return <EmployeeMap />;
          case 'profile':
            return <ProfileScreen />;
          default:
            return <EmployeeHome />;
        }
      }

      // Supervisor views
      if (currentUser.role === 'supervisor') {
        switch (currentView) {
          case 'dashboard':
            return <SupervisorDashboard />;
          case 'sites':
            return <SupervisorSites />;
          case 'pairs':
            return <SupervisorPairs />;
          case 'alerts':
            return <SupervisorAlerts />;
          case 'profile':
            return <ProfileScreen />;
          default:
            return <SupervisorDashboard />;
        }
      }

      // Admin views
      if (currentUser.role === 'admin') {
        return currentView === 'profile' ? <ProfileScreen /> : <AdminDashboard />;
      }

      return null;
    };

    return (
      <div className="min-h-screen bg-background max-w-[390px] mx-auto shadow-2xl">
        {/* Mobile Header */}
        <header className="bg-card border-b sticky top-0 z-40 shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Logo size="sm" showText={false} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Two Workers</p>
                <h3 className="text-sm font-bold truncate">
                  {currentUser.first_name || currentUser.firstName} {currentUser.last_name || currentUser.lastName}
                </h3>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </header>
        
        {/* Main Content */}
        <main className="px-4 py-4 min-h-screen">
          {renderView()}
        </main>

        {/* Mobile Navigation - Hidden for administrators */}
        {currentUser.role !== 'admin' && (
          <MobileNav currentView={currentView} onNavigate={setCurrentView} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto">
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      
      {view === 'login' && (
        <Login onSwitchToRegister={() => setView('roleSelect')} />
      )}
      
      {view === 'roleSelect' && (
        <RoleSelection onSelectRole={handleRoleSelect} />
      )}
      
      {view === 'register' && selectedRole === 'employee' && (
        <EmployeeRegistration />
      )}
      
      {view === 'register' && selectedRole === 'supervisor' && (
        <SupervisorRegistration />
      )}
      
      {view === 'register' && selectedRole === 'admin' && (
        <AdministratorRegistration />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      {USE_SUPABASE ? (
        <SupabaseAuthProvider>
          <AppContent />
          <Toaster />
        </SupabaseAuthProvider>
      ) : (
        <AuthProvider>
          <AppContent />
          <Toaster />
        </AuthProvider>
      )}
    </LanguageProvider>
  );
}