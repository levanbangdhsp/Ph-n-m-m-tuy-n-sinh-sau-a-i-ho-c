import React from 'react';
import { Page, User } from '../types';
import AcademicCapIcon from './icons/AcademicCapIcon';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  navigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, navigate }) => {
  return (
    <header className="bg-white shadow-md w-full sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Title */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate(Page.Landing)}
          >
            <AcademicCapIcon className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800 hidden sm:block">
              Tuyển sinh Sau Đại học
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-gray-700 hidden md:block">
                  Xin chào, <span className="font-semibold">{user.fullName}</span>!
                </span>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate(Page.Login)}
                  className="px-4 py-2 text-blue-600 font-semibold rounded-md hover:bg-blue-50 transition-colors text-sm"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => navigate(Page.Register)}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Đăng ký
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
