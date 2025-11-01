import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Cổng thông tin tuyển sinh Sau Đại học. Bảo lưu mọi quyền.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Liên hệ hỗ trợ: <a href="mailto:support@university.edu" className="text-blue-400 hover:underline">support@university.edu</a> | Điện thoại: (123) 456-7890
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
