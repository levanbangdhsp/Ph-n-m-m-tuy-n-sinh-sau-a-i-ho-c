
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 text-gray-800 mt-auto border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Cổng thông tin tuyển sinh Sau đại học Trường Đại học Sư phạm Thành phố Hồ Chí Minh. Bảo lưu mọi quyền.
          </p>
          <p className="text-sm mt-2">
            <span>Liên hệ hỗ trợ: </span>
            <a href="http://hcmue.edu.vn" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700 hover:underline">Website: http://hcmue.edu.vn</a>
            <span className="mx-1">|</span>
            <a href="mailto:tuyensinhsdh@hcmue.edu.vn" className="text-sky-600 hover:text-sky-700 hover:underline">Email: tuyensinhsdh@hcmue.edu.vn</a>
            <span className="mx-1">|</span>
            <span>Điện thoại: 028.38391077, 028.38352020 - 184 (hoặc 183)</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
