import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/auth-context.tsx';
import { DataProvider } from './context/data-context.tsx';
import { Navbar } from './layouts/Navbar.jsx';
import { Footer } from './layouts/Footer.jsx';
import { Home } from '../pages/Home.tsx';
import { Login } from '../pages/Login.tsx';
import { Register } from '../pages/Register.tsx';
import { BusinessDashboard } from '../pages/BusinessDashboard.tsx';
import { FreelancerDashboard } from '../pages/FreelancerDashboard.tsx';
import { MunicipalDashboard } from '../pages/MunicipalDashboard.tsx';
import { Toaster } from '../components/ui/sonner.tsx';

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');

  // Redirect to appropriate dashboard if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (currentPage === 'home' || currentPage === 'login' || currentPage === 'register') {
        if (user.role === 'business') {
          setCurrentPage('business-dashboard');
        } else if (user.role === 'freelancer') {
          setCurrentPage('freelancer-dashboard');
        } else if (user.role === 'municipal') {
          setCurrentPage('municipal-dashboard');
        } else if (user.role === 'client') {
          setCurrentPage('client-dashboard');
        }
      }
    }
  }, [isAuthenticated, user, currentPage]);

  // Redirect to home if not authenticated and trying to access dashboard
  useEffect(() => {
    if (!isAuthenticated && currentPage.includes('dashboard')) {
      setCurrentPage('home');
    }
  }, [isAuthenticated, currentPage]);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'login':
        return <Login onNavigate={handleNavigate} />;
      case 'register':
        return <Register onNavigate={handleNavigate} />;
      case 'business-dashboard':
        return isAuthenticated && user?.role === 'business' ? (
          <BusinessDashboard />
        ) : (
          <Home onNavigate={handleNavigate} />
        );
      case 'freelancer-dashboard':
        return isAuthenticated && user?.role === 'freelancer' ? (
          <FreelancerDashboard />
        ) : (
          <Home onNavigate={handleNavigate} />
        );
      case 'municipal-dashboard':
        return isAuthenticated && user?.role === 'municipal' ? (
          <MunicipalDashboard />
        ) : (
          <Home onNavigate={handleNavigate} />
        );
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
