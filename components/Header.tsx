import React from 'react';
import { Page, User } from '../types';
import AcademicCapIcon from './icons/AcademicCapIcon';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  navigate: (page: Page) => void;
  isAuthPage?: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, navigate, isAuthPage }) => {
  return (
    <header className="bg-sky-100 text-slate-800 shadow-sm w-full sticky top-0 z-50 border-b border-sky-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo and Title */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate(Page.Landing)}
          >
            <AcademicCapIcon className="w-8 h-8 text-sky-700" />
            <span className="text-xl font-bold text-slate-800 hidden sm:block">
              Tuyển sinh Sau đại học HCMUE.EDU.VN
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            {isAuthPage ? (
              <button
                onClick={() => navigate(Page.Landing)}
                className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition-colors text-sm"
              >
                Về Trang chủ
              </button>
            ) : user ? (
              <>
                <span className="text-slate-600 hidden md:block">
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
                  className="px-4 py-2 text-sky-700 font-semibold rounded-md hover:bg-sky-200/60 transition-colors text-sm"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => navigate(Page.Register)}
                  className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition-colors text-sm"
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