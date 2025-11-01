import React, { useState } from 'react';
import { Page, User } from '../types';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import ForgotPasswordForm from '../components/ForgotPasswordForm';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface AuthPageProps {
  initialPage: Page;
  onLoginSuccess: (user: User) => void;
  navigate: (page: Page) => void;
  user: User | null;
  onLogout: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ initialPage, onLoginSuccess, navigate, user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState<Page>(initialPage);

  const renderForm = () => {
    switch (currentPage) {
      case Page.Login:
        return <LoginForm onLoginSuccess={onLoginSuccess} navigate={setCurrentPage} />;
      case Page.Register:
        return <RegisterForm navigate={setCurrentPage} />;
      case Page.ForgotPassword:
        return <ForgotPasswordForm navigate={setCurrentPage} />;
      default:
        return <LoginForm onLoginSuccess={onLoginSuccess} navigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header user={user} onLogout={onLogout} navigate={navigate} isAuthPage />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
          {renderForm()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AuthPage;