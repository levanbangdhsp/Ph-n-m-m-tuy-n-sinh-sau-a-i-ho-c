import React from 'react';
import { User, Page, ApplicationStatusEnum, TimelineEvent } from '../types';
import { useApplicationData } from '../hooks/useApplicationData';
import Footer from '../components/Footer';
import ClipboardCheckIcon from '../components/icons/ClipboardCheckIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import ClockIcon from '../components/icons/ClockIcon';
import InformationCircleIcon from '../components/icons/InformationCircleIcon';

const ApplicationStatusPage: React.FC<{
  user: User;
  onLogout: () => void;
  navigate: (page: Page) => void;
}> = ({ user, onLogout, navigate }) => {
  const { statusData, loading, error } = useApplicationData(user);

  const getStatusChip = (status: ApplicationStatusEnum) => {
    const baseClasses = 'px-3 py-1 text-sm font-bold rounded-full inline-block';
    switch (status) {
      case ApplicationStatusEnum.VALID:
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>{status}</span>;
      case ApplicationStatusEnum.NEEDS_UPDATE:
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>{status}</span>;
      case ApplicationStatusEnum.INVALID:
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>{status}</span>;
      case ApplicationStatusEnum.PROCESSING:
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>{status}</span>;
      case ApplicationStatusEnum.SUBMITTED:
        return <span className={`${baseClasses} bg-sky-100 text-sky-800`}>{status}</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  const getTimelineIcon = (item: TimelineEvent) => {
    if (item.completed) {
      return <CheckCircleIcon className="w-6 h-6 text-white" />;
    }
    if (item.current) {
      return <ClockIcon className="w-6 h-6 text-white" />;
    }
    return <div className="w-3 h-3 bg-gray-300 rounded-full"></div>;
  };
  
  const getTimelineIconBg = (item: TimelineEvent) => {
     if (item.completed) return 'bg-green-500';
     if (item.current) return 'bg-sky-500 animate-pulse';
     return 'bg-gray-300';
  };


  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center gap-3 text-lg text-gray-700 py-10">
          <svg className="animate-spin h-6 w-6 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Đang tải trạng thái hồ sơ...</span>
        </div>
      );
    }

    if (error || !statusData) {
      return (
        <div className="text-center py-10">
          <p className="text-red-600">Không thể tải được trạng thái hồ sơ. Vui lòng thử lại sau.</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-600 mb-2">Trạng thái hiện tại</h2>
          {getStatusChip(statusData.status)}
        </div>

        {statusData.details && (
          <div className="bg-sky-50 border border-sky-200 p-4 rounded-lg flex items-start gap-4">
            <InformationCircleIcon className="w-6 h-6 text-sky-600 flex-shrink-0 mt-1" />
            <div>
                <h3 className="font-bold text-sky-800">Thông báo từ Phòng Sau đại học</h3>
                <p className="text-sky-700 mt-1">{statusData.details}</p>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-gray-600 mb-6">Quy trình xét duyệt</h2>
          <div className="relative pl-6 border-l-2 border-gray-200">
            {statusData.timeline.map((item, index) => (
              <div key={index} className="mb-8 relative">
                <div className={`absolute -left-[33px] top-0 w-12 h-12 rounded-full flex items-center justify-center ${getTimelineIconBg(item)}`}>
                  {getTimelineIcon(item)}
                </div>
                <div className="ml-8">
                  <p className={`font-bold text-gray-800 ${item.current ? 'text-sky-600' : ''}`}>{item.stage}</p>
                  {item.date && <p className="text-sm text-gray-500">{item.date}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
       <header className="bg-sky-100 text-slate-800 shadow-sm w-full sticky top-0 z-50 border-b border-sky-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
                <div className="flex items-center gap-3">
                    <ClipboardCheckIcon className="w-8 h-8 text-sky-700" />
                    <span className="text-xl font-bold text-slate-800 hidden sm:block">
                    Trạng thái xét hồ sơ
                    </span>
                </div>
                <nav className="flex items-center gap-2">
                    <span className="text-slate-600 hidden md:block">
                    Xin chào, <span className="font-semibold">{user.fullName}</span>!
                    </span>
                    <button
                        onClick={() => navigate(Page.Landing)}
                        className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition-colors text-sm"
                        >
                    Về Trang chủ
                    </button>
                    <button
                        onClick={onLogout}
                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors text-sm"
                    >
                    Đăng xuất
                    </button>
                </nav>
            </div>
        </div>
        </header>
      
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Tổng quan hồ sơ dự tuyển</h1>
            {renderContent()}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApplicationStatusPage;