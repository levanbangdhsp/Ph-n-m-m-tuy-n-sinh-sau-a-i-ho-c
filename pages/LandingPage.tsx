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
  description: React.ReactNode;
  buttonText: string;
  onButtonClick: () => void;
  status?: string;
  statusColor?: string;
}> = ({ icon, title, description, buttonText, onButtonClick, status, statusColor }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl hover:transform hover:-translate-y-1 transition-all duration-300 flex flex-col text-center items-center border">
        <div className="mb-4 text-sky-600">{icon}</div>
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
            className="mt-auto w-full bg-sky-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-sky-700 transition-colors"
        >
            {buttonText}
        </button>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ navigate, user, onLogout }) => {
  return (
    <div 
      className="flex flex-col min-h-screen bg-white"
    >
      <Header user={user} onLogout={onLogout} navigate={navigate} />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex items-center">
        {/* Conditional Content based on Login State */}
        <div className="max-w-5xl mx-auto w-full">
            {!user ? (
                // Content for Logged-out users
                <>
                  <div className="text-center mb-12">
                    <h1 
                      className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 leading-tight uppercase"
                    >
                      Cổng Thông Tin Tuyển Sinh Sau Đại Học
                    </h1>
                    <p 
                      className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto"
                    >
                      Nền tảng toàn diện để quản lý hồ sơ, theo dõi tiến độ và nhận kết quả tuyển sinh <br/> một cách nhanh chóng và minh bạch.
                    </p>
                  </div>
                   <div className="p-8 bg-sky-50/70 rounded-lg">
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
                </>
            ) : (
                // Content for Logged-in users
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <ActionCard 
                        icon={<UserCircleIcon className="w-12 h-12 text-sky-600" />}
                        title="Đăng ký & Cập nhật Hồ sơ"
                        description={<>Điền mới hoặc chỉnh sửa thông tin<br/>hồ sơ dự tuyển của bạn.</>}
                        buttonText="Đi đến hồ sơ"
                        onButtonClick={() => navigate(Page.Application)}
                    />
                    <ActionCard 
                        icon={<ClipboardCheckIcon className="w-12 h-12 text-green-600" />}
                        title="Kết quả xét hồ sơ"
                        description={<>Kiểm tra trạng thái và kết quả<br/>vòng xét duyệt hồ sơ.</>}
                        buttonText="Xem kết quả"
                        onButtonClick={() => alert('Chức năng đang được phát triển.')}
                        status="Chưa có kết quả"
                        statusColor="text-gray-500"
                    />
                    <ActionCard 
                        icon={<AcademicCapIcon className="w-12 h-12 text-yellow-600" />}
                        title="Kết quả trúng tuyển"
                        description={<>Xem kết quả cuối cùng<br/>của kỳ xét tuyển.</>}
                        buttonText="Xem kết quả"
                        onButtonClick={() => alert('Chức năng đang được phát triển.')}
                        status="Chưa có kết quả"
                        statusColor="text-gray-500"
                    />
                </div>
            )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;