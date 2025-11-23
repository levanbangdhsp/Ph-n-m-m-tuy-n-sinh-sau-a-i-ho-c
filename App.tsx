import React, { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import ApplicationFormPage from './pages/ApplicationFormPage';
import LandingPage from './pages/LandingPage';
import ApplicationStatusPage from './pages/ApplicationStatusPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import HelpPage from './pages/HelpPage';
import { Page } from './types';
import { User } from './types';
import { apiCall } from './hooks/useMockAuth';
import Chatbot from './components/Chatbot';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Landing);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Record visit once per session
    const visitRecorded = sessionStorage.getItem('visitRecorded');
    if (!visitRecorded) {
      const recordVisit = async () => {
        try {
          // Fire-and-forget request using the centralized apiCall
          await apiCall({ action: 'recordVisit' });
          sessionStorage.setItem('visitRecorded', 'true');
        } catch (e) {
          // Do nothing on error, to not affect user experience
          console.error("Could not record visit:", e);
        }
      };
      // Temporarily disabled as per user request to debug persistent network errors.
      // recordVisit();
    }
  }, []);

  useEffect(() => {
    // Check if user is "logged in" from a previous session
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    if (loggedInUser) {
      const parsedUser: User = JSON.parse(loggedInUser);
      setUser(parsedUser);
      if (parsedUser.role === 'admin' || parsedUser.role === 'sub-admin') {
        setCurrentPage(Page.AdminDashboard);
        return; // Exit early for admin/sub-admin
      }
    }
    // For regular users or logged-out users, start at Landing page.
    setCurrentPage(Page.Landing);
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    sessionStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
    if (loggedInUser.role === 'admin' || loggedInUser.role === 'sub-admin') {
      setCurrentPage(Page.AdminDashboard);
    } else {
      setCurrentPage(Page.Landing);
    }
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('loggedInUser');
    sessionStorage.removeItem('userToEdit'); // Clean up on logout
    setCurrentPage(Page.Landing);
  };
  
  const navigate = (page: Page) => {
    // When we are about to navigate AWAY from a page, store it.
    // But don't store the Help page itself as a "previous page"
    // to prevent getting stuck in a loop if the user goes Help -> Back -> Help -> Back.
    if (currentPage !== Page.Help) {
        sessionStorage.setItem('previousPage', String(currentPage));
    }
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
          const navigateBack = () => {
            // If an admin is editing a user, clear the session storage and navigate back to the dashboard.
            if (user.role === 'admin' || user.role === 'sub-admin') {
              sessionStorage.removeItem('userToEdit');
              navigate(Page.AdminDashboard);
            } else {
              navigate(Page.Landing);
            }
          };
          return <ApplicationFormPage user={user} onLogout={handleLogout} navigateBack={navigateBack} navigate={navigate} />;
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
       case Page.AdminDashboard:
        if (user && (user.role === 'admin' || user.role === 'sub-admin')) {
          return <AdminDashboardPage user={user} onLogout={handleLogout} navigate={navigate} />;
        }
        // If not an admin, redirect to landing
        setCurrentPage(Page.Landing);
        return <LandingPage navigate={navigate} user={user} onLogout={handleLogout} />;
      case Page.Help:
        return <HelpPage user={user} onLogout={handleLogout} navigate={navigate} />;
      default:
        return <LandingPage navigate={navigate} user={user} onLogout={handleLogout}/>;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      {renderPage()}
      <Chatbot />
    </div>
  );
};

export default App;
