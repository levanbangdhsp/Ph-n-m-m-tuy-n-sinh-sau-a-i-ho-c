import React, { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import ApplicationFormPage from './pages/ApplicationFormPage';
import LandingPage from './pages/LandingPage';
import ApplicationStatusPage from './pages/ApplicationStatusPage';
import { Page } from './types';
import { User } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Landing);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is "logged in" from a previous session
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
    // Always start at the landing page, which will adapt based on login state
    setCurrentPage(Page.Landing);
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    sessionStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
    setCurrentPage(Page.Landing);
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('loggedInUser');
    setCurrentPage(Page.Landing);
  };
  
  const navigate = (page: Page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.Landing:
        return <LandingPage navigate={navigate} user={user} onLogout={handleLogout} />;
      case Page.Login:
      case Page.Register:
      case Page.ForgotPassword:
        return <AuthPage initialPage={currentPage} onLoginSuccess={handleLoginSuccess} navigate={navigate} user={user} onLogout={handleLogout} />;
      case Page.Application:
        if (user) {
          return <ApplicationFormPage user={user} onLogout={handleLogout} navigateBack={() => navigate(Page.Landing)} />;
        }
        // If user is null but page is Application, redirect to Login
        setCurrentPage(Page.Login);
        return <AuthPage initialPage={Page.Login} onLoginSuccess={handleLoginSuccess} navigate={navigate} user={user} onLogout={handleLogout} />;
      case Page.ApplicationStatus:
        if (user) {
          return <ApplicationStatusPage user={user} onLogout={handleLogout} navigate={navigate} />;
        }
        // If user is null, redirect to Login
        setCurrentPage(Page.Login);
        return <AuthPage initialPage={Page.Login} onLoginSuccess={handleLoginSuccess} navigate={navigate} user={user} onLogout={handleLogout} />;
      default:
        return <LandingPage navigate={navigate} user={user} onLogout={handleLogout}/>;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      {renderPage()}
    </div>
  );
};

export default App;