import React, { useState } from 'react';
import { Page, User } from '../types';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import ForgotPasswordForm from '../components/ForgotPasswordForm';
import AuthHeader from '../components/AuthHeader';

interface AuthPageProps {
  initialPage: Page;
  onLoginSuccess: (user: User) => void;
  navigate: (page: Page) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ initialPage, onLoginSuccess, navigate }) => {
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <AuthHeader navigate={navigate} />
        <div className="bg-white p-8 rounded-b-lg shadow-lg">
          {renderForm()}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;