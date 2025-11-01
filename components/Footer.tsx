import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 text-gray-800 mt-auto border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <p className="text-sm">
            &copy; 2026 Cổng thông tin tuyển sinh Sau đại học Trường Đại học Sư phạm Thành phố Hồ Chí Minh. Bảo lưu mọi quyền.
          </p>
          <p className="text-sm mt-2">
            Liên hệ hỗ trợ: <a href="mailto:support@university.edu" className="text-sky-600 hover:text-sky-700 hover:underline">support@university.edu</a> | Điện thoại: (123) 456-7890
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;