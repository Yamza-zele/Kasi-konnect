import { useState } from 'react';
import { useAuth } from '../context/auth-context.tsx';
import { Button } from '../../components/ui/button';
import { Menu, X, LogOut } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

export function Navbar({ onNavigate, currentPage }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onNavigate('home');
    setMobileMenuOpen(false);
  };

  const handleNavigation = (page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleNavigation('home')}
          >
            <img
              src="/images/kasi-logo.png.jpeg"
              alt="Kasi Konnect"
              className="h-10 w-auto"
            />
            <span className="text-xl text-gray-800">Kasi Konnect</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => handleNavigation('home')}
              className={`${
                currentPage === 'home' ? 'text-blue-500' : 'text-gray-600 hover:text-blue-500'
              } transition-colors`}
            >
              Home
            </button>
            
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    if (user?.role === 'business') handleNavigation('business-dashboard');
                    else if (user?.role === 'freelancer') handleNavigation('freelancer-dashboard');
                    else if (user?.role === 'municipal') handleNavigation('municipal-dashboard');
                  }}
                  className={`${
                    currentPage.includes('dashboard') ? 'text-blue-500' : 'text-gray-600 hover:text-blue-500'
                  } transition-colors`}
                >
                  Dashboard
                </button>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm text-gray-800">{user?.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-red-500"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigation('login')}
                  className="text-gray-600 hover:text-blue-500 transition-colors"
                >
                  Login
                </button>
                <Button
                  onClick={() => handleNavigation('register')}
                  className="bg-blue-400 hover:bg-blue-500 text-white"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-blue-500"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleNavigation('home')}
                className={`${
                  currentPage === 'home' ? 'text-blue-500' : 'text-gray-600'
                } text-left`}
              >
                Home
              </button>
              
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      if (user?.role === 'business') handleNavigation('business-dashboard');
                      else if (user?.role === 'freelancer') handleNavigation('freelancer-dashboard');
                      else if (user?.role === 'municipal') handleNavigation('municipal-dashboard');
                    }}
                    className={`${
                      currentPage.includes('dashboard') ? 'text-blue-500' : 'text-gray-600'
                    } text-left`}
                  >
                    Dashboard
                  </button>
                  <div className="py-2 border-t border-gray-200">
                    <div className="text-sm text-gray-800">{user?.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="justify-start text-red-500 border-red-300 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleNavigation('login')}
                    className="text-gray-600 text-left"
                  >
                    Login
                  </button>
                  <Button
                    onClick={() => handleNavigation('register')}
                    className="bg-blue-400 hover:bg-blue-500 text-white"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
