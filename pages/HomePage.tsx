import React from 'react';
import { User, Page } from '../types';
import UserCircleIcon from '../components/icons/UserCircleIcon';
import ClipboardCheckIcon from '../components/icons/ClipboardCheckIcon';
import AcademicCapIcon from '../components/icons/AcademicCapIcon';


interface HomePageProps {
  user: User;
  onLogout: () => void;
  navigate: (page: Page) => void;
}

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  status?: string;
  statusColor?: string;
}> = ({ icon, title, description, actionText, onAction, status, statusColor }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl hover:transform hover:-translate-y-1 transition-all duration-300 flex flex-col">
    <div className="flex-grow">
        <div className="flex items-center gap-4 mb-4">
            {icon}
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        <p className="text-gray-600 mb-4">{description}</p>
        {status && (
            <div className="mb-4">
                <span className="font-semibold text-gray-700">Trạng thái: </span>
                <span className={`font-bold ${statusColor}`}>{status}</span>
            </div>
        )}
    </div>
    {actionText && onAction && (
      <button
        onClick={onAction}
        className="mt-auto w-full bg-sky-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-sky-700 transition-colors"
      >
        {actionText}
      </button>
    )}
  </div>
);


const HomePage: React.FC<HomePageProps> = ({ user, onLogout, navigate }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-sky-800">Cổng thông tin tuyển sinh</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 hidden sm:block">Chào mừng, <span className="font-semibold">{user.fullName}</span>!</span>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
                icon={<UserCircleIcon className="w-10 h-10 text-sky-600" />}
                title="Hồ sơ của bạn"
                description="Xem, chỉnh sửa và cập nhật thông tin hồ sơ dự tuyển của bạn."
                actionText="Cập nhật hồ sơ"
                onAction={() => navigate(Page.Application)}
            />
            <FeatureCard 
                icon={<ClipboardCheckIcon className="w-10 h-10 text-green-600" />}
                title="Kết quả xét hồ sơ"
                description="Kiểm tra trạng thái và kết quả vòng xét duyệt hồ sơ của bạn."
                status="Chưa có kết quả"
                statusColor="text-gray-500"
            />
            <FeatureCard 
                icon={<AcademicCapIcon className="w-10 h-10 text-yellow-600" />}
                title="Kết quả xét tuyển"
                description="Xem kết quả cuối cùng của kỳ xét tuyển sau đại học."
                status="Chưa có kết quả"
                statusColor="text-gray-500"
            />
        </div>
      </main>
    </div>
  );
};

export default HomePage;