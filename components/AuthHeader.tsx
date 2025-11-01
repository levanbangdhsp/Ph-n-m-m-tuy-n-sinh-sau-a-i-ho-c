import React from 'react';
import { Page } from '../types';

interface AuthHeaderProps {
  navigate: (page: Page) => void;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ navigate }) => {
  return (
    <header className="w-full bg-white p-4 rounded-t-lg shadow-lg border-b border-gray-200">
      <div className="flex justify-end">
        <button
          onClick={() => navigate(Page.Landing)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 ease-in-out"
        >
          Về Trang chủ
        </button>
      </div>
    </header>
  );
};

export default AuthHeader;