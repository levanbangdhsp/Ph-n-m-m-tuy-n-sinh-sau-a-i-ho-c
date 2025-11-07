import React, { useState, useEffect } from 'react';
import { User, Page, ApplicationStatusEnum, TimelineEvent } from '../types';
import { useApplicationData } from '../hooks/useApplicationData';
import Footer from '../components/Footer';
import ClipboardCheckIcon from '../components/icons/ClipboardCheckIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import ClockIcon from '../components/icons/ClockIcon';
import InformationCircleIcon from '../components/icons/InformationCircleIcon';
import XCircleIcon from '../components/icons/XCircleIcon';
import AcademicCapIcon from '../components/icons/AcademicCapIcon';

const ApplicationStatusPage: React.FC<{
  user: User;
  onLogout: () => void;
  navigate: (page: Page) => void;
}> = ({ user, onLogout, navigate }) => {
  const { statusData, loading, error, refetch } = useApplicationData(user);
  const [view, setView] = useState<'review' | 'admission'>('review');

  useEffect(() => {
    const storedView = sessionStorage.getItem('statusPageView') as 'review' | 'admission' | null;
    if (storedView) {
      setView(storedView);
    }
  }, []);

  const pageConfig = {
    review: {
        title: 'Trạng thái xét hồ sơ',
        icon: <ClipboardCheckIcon className="w-8 h-8 text-sky-700" />,
        mainHeading: 'Tổng quan hồ sơ dự tuyển',
    },
    admission: {
        title: 'Kết quả trúng tuyển',
        icon: <AcademicCapIcon className="w-8 h-8 text-yellow-500" />,
        mainHeading: 'Thông báo Kết quả trúng tuyển',
    }
  };

  const currentConfig = pageConfig[view];


  const getStatusChip = (status: ApplicationStatusEnum) => {
    const baseClasses = 'px-3 py-1 text-sm font-bold rounded-full inline-block';
    switch (status) {
      case ApplicationStatusEnum.VALID:
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>{status}</span>;
      case ApplicationStatusEnum.NEEDS_UPDATE:
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>{status}</span>;
      case ApplicationStatusEnum.INVALID:
        return <span className={`${baseClasses} bg-red-600 text-white`}>{status}</span>;
      case ApplicationStatusEnum.PROCESSING:
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>{status}</span>;
      case ApplicationStatusEnum.SUBMITTED:
        return <span className={`${baseClasses} bg-sky-100 text-sky-800`}>{status}</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  const getTimelineIcon = (item: TimelineEvent, isLast: boolean) => {
    if (item.completed && isLast) {
      return statusData?.status === ApplicationStatusEnum.INVALID 
        ? <XCircleIcon className="w-6 h-6 text-white" />
        : <CheckCircleIcon className="w-6 h-6 text-white" />;
    }
    if (item.completed) {
      return <CheckCircleIcon className="w-6 h-6 text-white" />;
    }
    if (item.current) {
      return <ClockIcon className="w-6 h-6 text-white" />;
    }
    return <div className="w-3 h-3 bg-gray-300 rounded-full"></div>;
  };
  
  const getTimelineIconBg = (item: TimelineEvent, isLast: boolean) => {
    if (item.completed && isLast) {
      return statusData?.status === ApplicationStatusEnum.INVALID ? 'bg-red-500' : 'bg-green-500';
    }
    if (item.completed) {
      return 'bg-green-500';
    }
    if (item.current) return 'bg-sky-500 animate-pulse';
    return 'bg-gray-300';
  };

  const renderReviewContent = () => (
    <>
      <div>
        <h2 className="text-lg font-semibold text-gray-600 mb-2">Trạng thái hiện tại</h2>
        {getStatusChip(statusData!.status)}
      </div>

      {statusData!.details && (
        <div className="bg-sky-50 border border-sky-200 p-4 rounded-lg flex items-start gap-4">
          <InformationCircleIcon className="w-6 h-6 text-sky-600 flex-shrink-0 mt-1" />
          <div>
              <h3 className="font-bold text-sky-800">Thông báo từ Phòng Sau đại học</h3>
              <p className={`${
                  (statusData!.status === ApplicationStatusEnum.NEEDS_UPDATE && !statusData!.details.startsWith('Hồ sơ của bạn cần bổ sung'))
                  ? 'text-red-600 font-semibold' 
                  : 'text-red-700'
              } mt-1`}>
                  {statusData!.details}
              </p>
              {statusData!.missingDocuments && statusData!.missingDocuments.length > 0 && (
                <ul className="list-disc list-inside mt-2 space-y-1 text-red-600 font-medium">
                  {statusData!.missingDocuments.map((doc, index) => (
                    <li key={index}>{doc}</li>
                  ))}
                </ul>
              )}
               {statusData!.status === ApplicationStatusEnum.NEEDS_UPDATE && (
                  <button
                    onClick={() => navigate(Page.Application)}
                    className="mt-3 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 transition-colors text-sm"
                  >
                    Cập nhật hồ sơ ngay
                  </button>
               )}
          </div>
        </div>
      )}

      {statusData!.reviewDetails && (statusData!.status === ApplicationStatusEnum.VALID || statusData!.status === ApplicationStatusEnum.INVALID || statusData!.status === ApplicationStatusEnum.PROCESSING) && (
          <div>
              <h2 className="text-lg font-semibold text-gray-600 mb-4">Chi tiết xét duyệt hồ sơ</h2>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <dl className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                          <dt className="text-gray-600">Điểm Tốt nghiệp (hệ 10):</dt>
                          <dd className="font-semibold text-gray-900">{statusData!.reviewDetails.graduationScore.toFixed(2)}</dd>
                      </div>
                      <div className="flex justify-between items-center">
                          <dt className="text-gray-600">Điểm thưởng NCKH:</dt>
                          <dd className="font-semibold text-gray-900">{statusData!.reviewDetails.hasResearchBonus ? 'Có' : 'Không'}</dd>
                      </div>
                      <div className="flex justify-between items-center">
                          <dt className="text-gray-600">Điểm thưởng Các thành tích khác:</dt>
                          <dd className="font-semibold text-gray-900">{statusData!.reviewDetails.hasOtherAchievementsBonus ? 'Có' : 'Không'}</dd>
                      </div>
                      <div className="flex justify-between items-center">
                          <dt className="text-gray-600">Điểm ưu tiên:</dt>
                          <dd className="font-semibold text-gray-900">{`${statusData!.reviewDetails.priorityScore.toFixed(2)}`}</dd>
                      </div>
                      <div className="border-t border-gray-200 !my-2"></div>
                      <div className="flex justify-between items-center text-base">
                          <dt className="font-bold text-gray-800">Tổng điểm hồ sơ:</dt>
                          <dd className="font-bold text-sky-600">{statusData!.reviewDetails.totalScore.toFixed(2)}</dd>
                      </div>
                      <div className="border-t border-gray-200 !my-2"></div>
                       <div className="flex justify-between items-center">
                          <dt className="text-gray-600">Chính sách học bổng:</dt>
                          <dd className="font-semibold text-gray-900">{statusData!.reviewDetails.scholarshipPolicy}</dd>
                      </div>
                  </dl>
                  {statusData!.status === ApplicationStatusEnum.PROCESSING && (
                      <p className="mt-4 text-xs text-red-600 font-semibold italic text-center">
                          Lưu ý: Đây là điểm số tạm tính dựa trên thông tin bạn đã cung cấp và có thể thay đổi sau khi có kết quả xét duyệt chính thức.
                      </p>
                  )}
              </div>
          </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-600 mb-6">Quy trình xét duyệt</h2>
        <div className="relative pl-6 border-l-2 border-gray-200">
          {statusData!.timeline.map((item, index) => (
            <div key={index} className="mb-8 relative last:mb-0">
              <div className={`absolute -left-[33px] top-0 w-12 h-12 rounded-full flex items-center justify-center ${getTimelineIconBg(item, index === statusData!.timeline.length - 1)}`}>
                {getTimelineIcon(item, index === statusData!.timeline.length - 1)}
              </div>
              <div className="ml-8 pt-2">
                <p className={`font-bold text-gray-800 ${item.current ? 'text-sky-600' : ''}`}>{item.stage}</p>
                {item.date && <p className="text-sm text-gray-500">{item.date}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderAdmissionContent = () => (
    <>
      {statusData!.admissionResult === 'Trúng tuyển' ? (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-start gap-4">
                  <AcademicCapIcon className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                      <h3 className="font-bold text-lg text-green-800">Chúc mừng! Bạn đã trúng tuyển.</h3>
                      {statusData!.admissionDetails && (
                          <dl className="mt-3 space-y-2 text-sm text-green-900">
                              <div className="flex">
                                  <dt className="w-32 font-semibold">Ngành trúng tuyển:</dt>
                                  <dd className="font-semibold">{statusData!.admissionDetails.admittedMajor}</dd>
                              </div>
                              <div className="flex">
                                  <dt className="w-32 font-semibold">Định hướng:</dt>
                                  <dd className="font-semibold">{statusData!.admissionDetails.admittedOrientation}</dd>
                              </div>
                          </dl>
                      )}
                      <p className="mt-4 text-sm text-green-700 bg-green-100 p-2 rounded-md">
                          <strong>Hướng dẫn tiếp theo:</strong> Giấy báo trúng tuyển và nhập học trình độ thạc sĩ sẽ được gửi qua email bạn đã đăng ký.
                      </p>
                  </div>
              </div>
          </div>
      ) : statusData!.admissionResult === 'Không trúng tuyển' ? (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-start gap-4">
                  <XCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                      <h3 className="font-bold text-lg text-red-800">Rất tiếc, bạn không trúng tuyển.</h3>
                      <p className="mt-2 text-sm text-red-700">
                          Cảm ơn bạn đã quan tâm đến chương trình tuyển sinh của trường. Chúc bạn may mắn trong những cơ hội sắp tới.
                      </p>
                  </div>
              </div>
          </div>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
            <InformationCircleIcon className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-gray-700">Chưa có kết quả trúng tuyển</h3>
            <p className="mt-2 text-sm text-gray-600">
                Kết quả sẽ được công bố sau khi quá trình xét duyệt hồ sơ hoàn tất. Vui lòng quay lại sau.
            </p>
        </div>
      )}
    </>
  );


  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center gap-3 text-lg text-gray-700 py-10">
          <svg className="animate-spin h-6 w-6 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Đang tải dữ liệu...</span>
        </div>
      );
    }

    if (error || !statusData) {
      return (
        <div className="text-center py-10">
          <p className="text-red-600">Không thể tải được dữ liệu. Vui lòng thử lại sau.</p>
           <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition-colors text-sm"
            >
            Thử lại
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {view === 'review' ? renderReviewContent() : renderAdmissionContent()}
      </div>
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
       <header className="bg-sky-100 text-slate-800 shadow-sm w-full sticky top-0 z-50 border-b border-sky-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
                <div className="flex items-center gap-3">
                    {currentConfig.icon}
                    <span className="text-xl font-bold text-slate-800 hidden sm:block">
                      {currentConfig.title}
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
            <div className="flex justify-between items-center border-b pb-4 mb-6">
                 <h1 className="text-2xl font-bold text-gray-800">{currentConfig.mainHeading}</h1>
                 <button
                    onClick={refetch}
                    disabled={loading}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 font-semibold rounded-md hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
                    >
                    Làm mới
                </button>
            </div>
            {renderContent()}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApplicationStatusPage;