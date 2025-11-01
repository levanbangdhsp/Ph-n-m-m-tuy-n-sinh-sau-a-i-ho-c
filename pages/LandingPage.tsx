import React from 'react';
import { Page, User } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UserCircleIcon from '../components/icons/UserCircleIcon';
import ClipboardCheckIcon from '../components/icons/ClipboardCheckIcon';
import AcademicCapIcon from '../components/icons/AcademicCapIcon';


interface LandingPageProps {
  navigate: (page: Page) => void;
  user: User | null;
  onLogout: () => void;
}

const ActionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
  status?: string;
  statusColor?: string;
}> = ({ icon, title, description, buttonText, onButtonClick, status, statusColor }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl hover:transform hover:-translate-y-1 transition-all duration-300 flex flex-col text-center items-center">
        <div className="mb-4 text-blue-600">{icon}</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4 flex-grow">{description}</p>
        {status && (
            <div className="mb-4">
                <span className="font-semibold text-gray-700">Trạng thái: </span>
                <span className={`font-bold ${statusColor}`}>{status}</span>
            </div>
        )}
        <button
            onClick={onButtonClick}
            className="mt-auto w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
            {buttonText}
        </button>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ navigate, user, onLogout }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} navigate={navigate} />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-12">
           <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4 leading-tight">
              Cổng Thông Tin Tuyển Sinh Sau Đại Học
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Nền tảng toàn diện để quản lý hồ sơ, theo dõi tiến độ và nhận kết quả tuyển sinh một cách nhanh chóng và minh bạch.
            </p>
        </div>

        {/* Conditional Content based on Login State */}
        <div className="max-w-5xl mx-auto">
            {!user ? (
                // Content for Logged-out users
                <div className="p-8 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Bắt đầu hành trình của bạn</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ActionCard
                            icon={<UserCircleIcon className="w-12 h-12" />}
                            title="Đăng nhập tài khoản"
                            description="Truy cập hồ sơ của bạn và tiếp tục quá trình đăng ký."
                            buttonText="Đăng nhập"
                            onButtonClick={() => navigate(Page.Login)}
                        />
                        <ActionCard
                            icon={<AcademicCapIcon className="w-12 h-12" />}
                            title="Tạo tài khoản mới"
                            description="Đăng ký tài khoản để bắt đầu nộp hồ sơ dự tuyển ngay hôm nay."
                            buttonText="Đăng ký ngay"
                            onButtonClick={() => navigate(Page.Register)}
                        />
                    </div>
                </div>
            ) : (
                // Content for Logged-in users
                <div>
                    {/* Section 2: Application Management */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-blue-600 pl-4">Quản lý hồ sơ</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ActionCard 
                                icon={<UserCircleIcon className="w-12 h-12 text-blue-600" />}
                                title="Đăng ký & Cập nhật Hồ sơ"
                                description="Điền mới hoặc chỉnh sửa thông tin hồ sơ dự tuyển của bạn."
                                buttonText="Đi đến hồ sơ"
                                onButtonClick={() => navigate(Page.Application)}
                            />
                        </div>
                    </div>

                    {/* Section 3: Results */}
                    <div>
                         <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-green-600 pl-4">Tra cứu kết quả</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ActionCard 
                                icon={<ClipboardCheckIcon className="w-12 h-12 text-green-600" />}
                                title="Kết quả xét hồ sơ"
                                description="Kiểm tra trạng thái và kết quả vòng xét duyệt hồ sơ."
                                buttonText="Xem kết quả"
                                onButtonClick={() => alert('Chức năng đang được phát triển.')}
                                status="Chưa có kết quả"
                                statusColor="text-gray-500"
                            />
                            <ActionCard 
                                icon={<AcademicCapIcon className="w-12 h-12 text-yellow-600" />}
                                title="Kết quả trúng tuyển"
                                description="Xem kết quả cuối cùng của kỳ xét tuyển."
                                buttonText="Xem kết quả"
                                onButtonClick={() => alert('Chức năng đang được phát triển.')}
                                status="Chưa có kết quả"
                                statusColor="text-gray-500"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
