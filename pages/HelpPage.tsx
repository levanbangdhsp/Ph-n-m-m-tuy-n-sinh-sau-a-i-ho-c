import React, { useState, useEffect, useRef } from 'react';
import { Page, User } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';

interface HelpPageProps {
  user: User | null;
  onLogout: () => void;
  navigate: (page: Page) => void;
}

const SECTIONS = [
  { id: 'tong-quan', title: 'Tổng quan', parent: '' },
  { id: 'applicant-guide', title: 'A. Dành cho Thí sinh', parent: '' },
  { id: 'tai-khoan', title: '1. Quản lý Tài khoản', parent: 'applicant-guide' },
  { id: 'dang-ky', title: 'Đăng ký', parent: 'tai-khoan' },
  { id: 'dang-nhap', title: 'Đăng nhập', parent: 'tai-khoan' },
  { id: 'quen-mat-khau', title: 'Quên mật khẩu', parent: 'tai-khoan' },
  { id: 'nop-ho-so', title: '2. Nộp Hồ sơ Dự tuyển', parent: 'applicant-guide' },
  { id: 'theo-doi', title: '3. Theo dõi Trạng thái', parent: 'applicant-guide' },
  { id: 'admin-guide', title: 'B. Dành cho Quản trị viên', parent: '' },
  { id: 'admin-dashboard', title: '1. Bảng điều khiển', parent: 'admin-guide' },
  { id: 'admin-search', title: '2. Tìm kiếm và Xem hồ sơ', parent: 'admin-guide' },
  { id: 'admin-deadline', title: '3. Quản lý Hạn nộp', parent: 'admin-guide' },
  { id: 'admin-staff', title: '4. Quản lý Cán bộ', parent: 'admin-guide' },
];

const HelpPage: React.FC<HelpPageProps> = ({ user, onLogout, navigate }) => {
  const [activeSection, setActiveSection] = useState('tong-quan');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const isManualScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<number | undefined>(undefined);
  const isAdmin = user && (user.role === 'admin' || user.role === 'sub-admin');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isManualScrollingRef.current) {
          return;
        }

        const intersectingEntry = entries.find(entry => entry.isIntersecting);
        if (intersectingEntry) {
            setActiveSection(prevActiveSection => {
              if (intersectingEntry.target.id !== prevActiveSection) {
                return intersectingEntry.target.id;
              }
              return prevActiveSection;
            });
        }
      },
      { rootMargin: '-20% 0px -75% 0px', threshold: 0.1 }
    );

    const observedElements = Object.values(sectionRefs.current).filter((el): el is HTMLElement => el !== null);

    observedElements.forEach((el) => {
      observer.observe(el);
    });

    return () => {
      observedElements.forEach((el) => {
        observer.unobserve(el);
      });
      window.clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const handleTocClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = sectionRefs.current[sectionId];
    if (element) {
      setActiveSection(sectionId);
      isManualScrollingRef.current = true;
      
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

      window.clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = window.setTimeout(() => {
        isManualScrollingRef.current = false;
      }, 1000); 
    }
  };

  const handleNavigateBack = () => {
    const previousPageStr = sessionStorage.getItem('previousPage');
    if (previousPageStr) {
      const previousPage = parseInt(previousPageStr, 10) as Page;
      sessionStorage.removeItem('previousPage'); 
      navigate(previousPage);
    } else {
      if (user && (user.role === 'admin' || user.role === 'sub-admin')) {
        navigate(Page.AdminDashboard);
      } else {
        navigate(Page.Landing);
      }
    }
  };

  const renderSection = (id: string, title: string, level: number, children: React.ReactNode) => {
      const HeadingTag = `h${level + 1}` as React.ElementType;
      return (
          <section id={id} ref={el => { sectionRefs.current[id] = el; }} className="mb-8 scroll-mt-24">
              <HeadingTag className={`font-bold text-sky-800 pb-2 mb-4 border-b border-sky-200 ${
                  level === 0 ? 'text-3xl' : level === 1 ? 'text-2xl' : 'text-xl'
              }`}>
                  {title}
              </HeadingTag>
              <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed space-y-4">
                  {children}
              </div>
          </section>
      );
  };
  
  const ImagePlaceholder = ({ src, alt }: { src: string, alt: string }) => (
      <div className="my-6 border rounded-lg overflow-hidden shadow-md bg-gray-50">
          <img src={src} alt={alt} className="w-full h-auto" />
          <p className="text-center text-sm text-gray-500 p-2 bg-gray-100"><i>{alt}</i></p>
      </div>
  );

  const visibleSections = isAdmin ? SECTIONS : SECTIONS.filter(s => s.id !== 'admin-guide' && !s.parent.startsWith('admin-guide'));

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} navigate={navigate} />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col lg:flex-row gap-4">
          <aside className="lg:w-72 flex-shrink-0">
            <nav className="sticky top-24">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Mục lục</h3>
              <ul className="space-y-1">
                {visibleSections.filter(s => !s.parent).map(section => (
                    <li key={section.id}>
                        <a href={`#${section.id}`} onClick={(e) => handleTocClick(e, section.id)} className={`block font-semibold py-1 rounded-md transition-colors ${activeSection === section.id ? 'text-sky-600' : 'text-gray-600 hover:text-sky-600'}`}>{section.title}</a>
                        <ul className="pl-4 mt-1 space-y-1 border-l-2">
                          {visibleSections.filter(s => s.parent === section.id).map(subSection => (
                              <li key={subSection.id}>
                                  <a href={`#${subSection.id}`} onClick={(e) => handleTocClick(e, subSection.id)} className={`block py-1 text-sm rounded-md transition-colors ${activeSection === subSection.id ? 'text-sky-600 font-semibold' : 'text-gray-500 hover:text-sky-600'}`}>{subSection.title}</a>
                                  <ul className="pl-4 mt-1 space-y-1 border-l-2">
                                    {visibleSections.filter(s => s.parent === subSection.id).map(item => (
                                        <li key={item.id}>
                                            <a href={`#${item.id}`} onClick={(e) => handleTocClick(e, item.id)} className={`block py-1 text-sm rounded-md transition-colors ${activeSection === item.id ? 'text-sky-600 font-semibold' : 'text-gray-500 hover:text-sky-600'}`}>{item.title}</a>
                                        </li>
                                    ))}
                                  </ul>
                              </li>
                          ))}
                        </ul>
                    </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="flex-1 bg-white p-8 rounded-lg shadow-md min-w-0">
            <button
              onClick={handleNavigateBack}
              className="mb-8 flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-md hover:bg-slate-200 transition-colors text-sm"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Quay lại trang trước</span>
            </button>

            {renderSection('tong-quan', 'Chào mừng đến với Cổng thông tin Tuyển sinh', 0,
              <>
                <p>Tài liệu này cung cấp hướng dẫn chi tiết về cách sử dụng các tính năng của Cổng thông tin Tuyển sinh Sau đại học. Vui lòng chọn một mục từ thanh điều hướng bên trái để xem chi tiết.</p>
                <p>Nếu bạn gặp bất kỳ khó khăn nào, vui lòng liên hệ với chúng tôi qua thông tin ở cuối trang.</p>
              </>
            )}

            {renderSection('applicant-guide', 'A. Dành cho Thí sinh', 1, <p>Phần này hướng dẫn thí sinh các thao tác cần thiết từ lúc tạo tài khoản đến khi xem kết quả trúng tuyển.</p>)}

            {renderSection('tai-khoan', '1. Quản lý Tài khoản', 2, <p>Các bước để tạo và quản lý tài khoản cá nhân của bạn.</p>)}

            {renderSection('dang-ky', 'Đăng ký', 3, 
                <>
                    <p>Để bắt đầu, bạn cần tạo một tài khoản. Từ trang chủ, nhấn nút "Đăng ký".</p>
                    <ol className="list-decimal list-inside space-y-2">
                        <li>Điền đầy đủ các thông tin: Họ tên, Email, Số điện thoại và Mật khẩu.</li>
                        <li>Mật khẩu cần đáp ứng các tiêu chí bảo mật được liệt kê.</li>
                        <li>Nhấn "Đăng ký" để hoàn tất. Hệ thống sẽ gửi thông báo và bạn sẽ được chuyển đến trang đăng nhập.</li>
                    </ol>
                    <ImagePlaceholder src="/images/dang-ky.png" alt="Giao diện form đăng ký tài khoản." />
                </>
            )}

            {renderSection('dang-nhap', 'Đăng nhập', 3, 
                <>
                    <p>Sau khi có tài khoản, bạn có thể đăng nhập vào hệ thống bằng cách nhấn nút "Đăng nhập" ở trang chủ.</p>
                    <p>Điền Email và Mật khẩu đã đăng ký, sau đó nhấn nút "Đăng nhập".</p>
                    <ImagePlaceholder src="/images/dang-nhap.png" alt="Giao diện form đăng nhập." />
                </>
            )}

            {renderSection('quen-mat-khau', 'Quên mật khẩu', 3,
                <>
                    <p>Nếu bạn quên mật khẩu, hãy nhấp vào liên kết "Quên mật khẩu?" trên trang đăng nhập.</p>
                     <ol className="list-decimal list-inside space-y-2">
                        <li><b>Bước 1:</b> Nhập địa chỉ email của bạn và nhấn "Gửi yêu cầu". Một mã OTP sẽ được gửi đến email của bạn.</li>
                        <ImagePlaceholder src="/images/quen-mat-khau-1.png" alt="Bước 1: Nhập email để lấy lại mật khẩu." />
                        <li><b>Bước 2:</b> Kiểm tra hộp thư, nhập mã OTP nhận được và nhấn "Xác thực".</li>
                        <li><b>Bước 3:</b> Tạo mật khẩu mới và xác nhận. Sau khi thành công, bạn sẽ được chuyển về trang đăng nhập.</li>
                         <ImagePlaceholder src="/images/quen-mat-khau-2.png" alt="Bước 2 & 3: Nhập OTP và đặt mật khẩu mới." />
                    </ol>
                </>
            )}

            {renderSection('nop-ho-so', '2. Nộp Hồ sơ Dự tuyển', 2,
                <>
                    <p>Sau khi đăng nhập, bạn sẽ thấy các chức năng chính. Chọn "Đi đến hồ sơ" để bắt đầu.</p>
                     <p>Quy trình nộp hồ sơ gồm 6 bước. Bạn có thể di chuyển giữa các bước bằng cách nhấp vào thanh tiến trình ở trên hoặc dùng nút "Tiếp theo" / "Quay lại".</p>
                    <ImagePlaceholder src="/images/ho-so-cac-buoc.png" alt="Thanh tiến trình các bước nộp hồ sơ." />
                    <p>Hãy điền đầy đủ và chính xác tất cả thông tin được yêu cầu ở mỗi bước. Ở Bước 5, bạn cần tải lên các tài liệu minh chứng theo yêu cầu.</p>
                     <p>Bạn có thể nhấn nút <strong>"Lưu nháp"</strong> bất kỳ lúc nào để lưu lại tiến trình và quay lại hoàn thành sau.</p>
                    <ImagePlaceholder src="/images/ho-so-luu-nhap.png" alt="Chức năng Lưu nháp và điều hướng." />
                    <p>Sau khi hoàn thành tất cả các bước, hãy đến Bước 6 để xem lại toàn bộ thông tin. Khi đã chắc chắn mọi thứ đều chính xác, nhấn nút <strong>"Nộp hồ sơ"</strong> để gửi hồ sơ đến phòng Sau đại học.</p>
                    <ImagePlaceholder src="/images/ho-so-nop.png" alt="Bước cuối cùng: Xem lại và Nộp hồ sơ." />
                </>
            )}

            {renderSection('theo-doi', '3. Theo dõi Trạng thái', 2,
                <>
                    <p>Sau khi nộp hồ sơ, bạn có thể theo dõi tiến trình xử lý bằng cách chọn "Kết quả xét hồ sơ" hoặc "Kết quả trúng tuyển" từ trang chủ.</p>
                    <p>Trang thái hồ sơ sẽ được cập nhật liên tục. Các trạng thái có thể bao gồm:</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li><b>Đang trong quá trình xử lý:</b> Hồ sơ của bạn đã được tiếp nhận và đang chờ xét duyệt.</li>
                        <ImagePlaceholder src="/images/trang-thai-cho-xu-ly.png" alt="Ví dụ về trạng thái đang xử lý." />
                        <li><b>Yêu cầu bổ sung:</b> Hồ sơ của bạn còn thiếu hoặc sai sót. Vui lòng đọc kỹ thông báo và nhấn "Cập nhật hồ sơ ngay" để bổ sung.</li>
                        <ImagePlaceholder src="/images/trang-thai-can-bo-sung.png" alt="Ví dụ về trạng thái cần bổ sung." />
                        <li><b>Hồ sơ hợp lệ:</b> Chúc mừng! Hồ sơ của bạn đã hợp lệ. Đây là điều kiện cần để được xét trúng tuyển.</li>
                        <ImagePlaceholder src="/images/trang-thai-hop-le.png" alt="Ví dụ về trạng thái hồ sơ hợp lệ." />
                        <li><b>Kết quả trúng tuyển:</b> Khi có kết quả cuối cùng, trang "Kết quả trúng tuyển" sẽ hiển thị thông báo. Nếu trúng tuyển, hệ thống sẽ ghi rõ Ngành và Định hướng bạn đã trúng tuyển.</li>
                        <ImagePlaceholder src="/images/ket-qua-trung-tuyen.png" alt="VíV dụ về kết quả trúng tuyển, hiển thị rõ ngành và định hướng." />
                        <li><b>Không trúng tuyển:</b> Mặc dù hồ sơ của bạn hợp lệ, kết quả cuối cùng phụ thuộc vào điểm xét tuyển và chỉ tiêu của ngành. Rất tiếc bạn đã không trúng tuyển đợt này.</li>
                        <ImagePlaceholder src="/images/ket-qua-khong-trung-tuyen.png" alt="Ví dụ về kết quả không trúng tuyển." />
                        <li><b>Hồ sơ không hợp lệ:</b> Rất tiếc, hồ sơ của bạn không hợp lệ. Lý do sẽ được ghi rõ trong thông báo.</li>
                        <ImagePlaceholder src="/images/trang-thai-khong-hop-le.png" alt="Ví dụ về trạng thái hồ sơ không hợp lệ." />
                    </ul>
                </>
            )}

            {isAdmin && (
                <>
                    {renderSection('admin-guide', 'B. Dành cho Quản trị viên', 1, <p>Phần này hướng dẫn các chức năng dành riêng cho Quản trị viên (Admin) và Cán bộ (Sub-admin).</p>)}

                    {renderSection('admin-dashboard', '1. Bảng điều khiển', 2, 
                        <>
                            <p>Sau khi đăng nhập với tài khoản Admin/Sub-admin, bạn sẽ được đưa đến Bảng điều khiển.</p>
                            <p>Tại đây, bạn có thể xem các số liệu thống kê tổng quan về số lượng hồ sơ, nguyện vọng và các ngành được đăng ký.</p>
                            <ImagePlaceholder src="/images/admin-dashboard.png" alt="Giao diện bảng điều khiển của Admin." />
                        </>
                    )}

                    {renderSection('admin-search', '2. Tìm kiếm và Xem hồ sơ', 2, 
                        <>
                            <p>Sử dụng thanh tìm kiếm trong phần "Danh sách thí sinh" để tìm kiếm nhanh một thí sinh theo Họ tên, Email, Số điện thoại hoặc Ngày sinh.</p>
                            <p>Nhấn vào "Xem hồ sơ" để xem chi tiết toàn bộ thông tin và các tài liệu mà thí sinh đã nộp. Tại đây, bạn cũng có thể chọn "Chỉnh sửa Hồ sơ" để thay đổi thông tin nếu cần.</p>
                            <ImagePlaceholder src="/images/admin-tim-kiem.png" alt="Chức năng tìm kiếm và xem hồ sơ thí sinh." />
                        </>
                    )}

                    {renderSection('admin-deadline', '3. Quản lý Hạn nộp', 2, 
                        <>
                            <p>Chức năng này cho phép Admin đặt thời hạn cuối cùng cho việc nộp và chỉnh sửa hồ sơ. Sau thời gian này, thí sinh sẽ không thể lưu hồ sơ được nữa.</p>
                            <p>Chọn ngày và giờ, sau đó nhấn "Lưu Hạn nộp".</p>
                            <ImagePlaceholder src="/images/admin-quan-ly-han-nop.png" alt="Giao diện quản lý hạn nộp hồ sơ." />
                        </>
                    )}

                    {renderSection('admin-staff', '4. Quản lý Cán bộ', 2, 
                        <>
                            <p>Chỉ tài khoản Admin chính mới có quyền thêm, xóa, và phân quyền cho các cán bộ (Sub-admin) khác.</p>
                            <ul className="list-disc list-inside space-y-2">
                                <li><b>Thêm cán bộ:</b> Điền thông tin và nhấn "Thêm Cán bộ".</li>
                                <li><b>Phân quyền:</b> Chọn giữa quyền "Chỉ đọc" hoặc "Đọc và Ghi". Quyền ghi cho phép cán bộ chỉnh sửa hồ sơ của thí sinh.</li>
                                <li><b>Quản lý trạng thái:</b> Có thể "Tạm dừng" hoặc "Bỏ tạm dừng" tài khoản của một cán bộ.</li>
                                <li><b>Xóa quyền:</b> Xóa hoàn toàn tài khoản của một cán bộ khỏi hệ thống.</li>
                            </ul>
                            <ImagePlaceholder src="/images/admin-quan-ly-can-bo.png" alt="Giao diện quản lý cán bộ dành cho Admin." />
                        </>
                    )}
                </>
            )}
          </div>
        </div>
      </main>
      <Footer navigate={navigate} />
    </div>
  );
};

export default HelpPage;
