import React, { useState, useEffect, useRef } from 'react';
import { Page, User } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import ExclamationTriangleIcon from '../components/icons/ExclamationTriangleIcon';
import InformationCircleIcon from '../components/icons/InformationCircleIcon';

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
  
  const ImagePlaceholder = ({ src, alt, size = '100%' }: { src: string, alt: string, size?: '50%' | '75%' | '100%' }) => {
      let containerWidthClass = 'w-full';
      if (size === '75%') {
          containerWidthClass = 'lg:w-3/4';
      } else if (size === '50%') {
          containerWidthClass = 'lg:w-1/2';
      }

      return (
          <div className="my-6 flex justify-center">
              <div className={`border rounded-lg overflow-hidden shadow-md bg-gray-50 w-full ${containerWidthClass}`}>
                  <img src={src} alt={alt} className="w-full h-auto" />
                  <p className="text-center text-sm text-gray-500 p-2 bg-gray-100"><i>{alt}</i></p>
              </div>
          </div>
      );
  };

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

            {renderSection('tong-quan', 'Chào mừng đến với Cổng thông tin Tuyển sinh HCMUE', 0,
              <>
                <p>Tài liệu này cung cấp hướng dẫn chi tiết về cách sử dụng các tính năng của Cổng thông tin Tuyển sinh Sau đại học HCMUE. Vui lòng chọn một mục từ thanh điều hướng bên trái để xem chi tiết.</p>
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
                    <div className="my-6 p-4 rounded-md border-l-4 border-yellow-500 bg-yellow-50 flex items-start gap-4">
                        <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-yellow-800">Lưu ý quan trọng khi đăng ký hồ sơ</h4>
                            <p className="mt-1">
                                Các thông tin này sẽ <strong>không thể thay đổi</strong> sau khi đăng ký để đảm bảo tính xác thực của hồ sơ.
                            </p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li><strong>Họ và tên:</strong> Vui lòng nhập đầy đủ họ tên bằng tiếng Việt có dấu.</li>
                                <li><strong>Email và Số điện thoại:</strong> Phải là thông tin chính xác và bạn đang sử dụng thường xuyên. Đây sẽ là kênh liên lạc chính trong suốt quá trình xét tuyển.</li>
                            </ul>
                        </div>
                    </div>
                    <ImagePlaceholder src="/images/dang-ky.png" alt="Giao diện form đăng ký tài khoản." size="50%" />
                </>
            )}

            {renderSection('dang-nhap', 'Đăng nhập', 3, 
                <>
                    <p>Sau khi có tài khoản, bạn có thể đăng nhập vào hệ thống bằng cách nhấn nút "Đăng nhập" ở trang chủ.</p>
                    <p>Điền Email và Mật khẩu đã đăng ký, sau đó nhấn nút "Đăng nhập".</p>
                    <ImagePlaceholder src="/images/dang-nhap.png" alt="Giao diện form đăng nhập." size="50%" />
                </>
            )}

            {renderSection('quen-mat-khau', 'Quên mật khẩu', 3,
                <>
                    <p>Nếu bạn quên mật khẩu, hãy nhấp vào liên kết "Quên mật khẩu?" trên trang đăng nhập.</p>
                     <ol className="list-decimal list-inside space-y-2">
                        <li><b>Bước 1:</b> Nhập địa chỉ email của bạn và nhấn "Gửi yêu cầu". Một mã OTP sẽ được gửi đến email của bạn.</li>
                        <ImagePlaceholder src="/images/quen-mat-khau-1.png" alt="Bước 1: Nhập email để lấy lại mật khẩu." size="50%" />
                        <li><b>Bước 2:</b> Kiểm tra hộp thư, nhập mã OTP nhận được và nhấn "Xác thực".</li>
                        <li><b>Bước 3:</b> Tạo mật khẩu mới và xác nhận. Sau khi thành công, bạn sẽ được chuyển về trang đăng nhập.</li>
                         <ImagePlaceholder src="/images/quen-mat-khau-2.png" alt="Bước 2 & 3: Nhập OTP và đặt mật khẩu mới." size="50%" />
                    </ol>
                </>
            )}

            {renderSection('nop-ho-so', '2. Nộp Hồ sơ Dự tuyển', 2,
                <>
                    <p>Sau khi đăng nhập, bạn sẽ thấy các chức năng chính. Chọn "Đi đến hồ sơ" để bắt đầu.</p>
                     <p>Quy trình nộp hồ sơ gồm 6 bước. Bạn có thể di chuyển giữa các bước bằng cách nhấp vào thanh tiến trình ở trên hoặc dùng nút "Tiếp theo" / "Quay lại".</p>
                    <ImagePlaceholder src="/images/ho-so-cac-buoc.png" alt="Thanh tiến trình các bước nộp hồ sơ." />
                    
                    <h4 className="font-bold text-xl mt-6 mb-2">Chi tiết các bước</h4>

                    <h5 className="font-semibold text-lg mt-4">Bước 1: Thông tin cá nhân</h5>
                    <p>Đây là bước điền các thông tin cơ bản của bạn. Các trường có dấu <span className="text-red-500">*</span> là bắt buộc.</p>
                    <div className="my-4 p-4 rounded-md border-l-4 border-blue-500 bg-blue-50 flex items-start gap-4">
                        <InformationCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-blue-800">Lưu ý quan trọng</h4>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li><strong>Ngày sinh, Ngày cấp CCCD:</strong> Luôn nhập theo định dạng <code>DD/MM/YYYY</code> (ví dụ: <code>25/12/2000</code>).</li>
                                <li><strong>Số CCCD:</strong> Phải nhập chính xác 12 chữ số. Hệ thống sẽ tự động kiểm tra định dạng này.</li>
                                <li><strong>Nơi sinh, Nơi cấp CCCD:</strong> Chọn từ danh sách có sẵn để đảm bảo tính nhất quán.</li>
                            </ul>
                        </div>
                    </div>
                    <ImagePlaceholder src="/images/help-step1.png" alt="Minh họa điền thông tin cá nhân." />

                    <h5 className="font-semibold text-lg mt-4">Bước 2: Thông tin đăng ký dự tuyển</h5>
                    <p>Chọn cơ sở đào tạo và các nguyện vọng của bạn.</p>
                    <div className="my-4 p-4 rounded-md border-l-4 border-blue-500 bg-blue-50 flex items-start gap-4">
                        <InformationCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-blue-800">Lưu ý quan trọng</h4>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Sau khi chọn "Cơ sở đào tạo", danh sách ngành học sẽ được cập nhật tương ứng.</li>
                                <li>Nguyện vọng 1 là bắt buộc.</li>
                                <li>Một số ngành yêu cầu chọn "Định hướng" (Nghiên cứu hoặc Ứng dụng). Nếu ngành bạn chọn chỉ có 1 định hướng, hệ thống sẽ tự động chọn.</li>
                                <li>Các nguyện vọng (bao gồm cả ngành và định hướng) không được trùng lặp.</li>
                            </ul>
                        </div>
                    </div>
                    <ImagePlaceholder src="/images/help-step2.png" alt="Minh họa đăng ký nguyện vọng." />

                    <h5 className="font-semibold text-lg mt-4">Bước 3: Trình độ học vấn & Ngoại ngữ</h5>
                    <p>Khai báo thông tin về bằng đại học và năng lực ngoại ngữ.</p>
                    <div className="my-4 p-4 rounded-md border-l-4 border-blue-500 bg-blue-50 flex items-start gap-4">
                        <InformationCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-blue-800">Lưu ý quan trọng</h4>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li><strong>Điểm TB (hệ 10 và hệ 4), Điểm ngoại ngữ:</strong> Vui lòng sử dụng dấu chấm <code>.</code> cho phần thập phân (ví dụ: <code>8.50</code>), không dùng dấu phẩy <code>,</code>.</li>
                                <li>Các mục chọn như "Loại tốt nghiệp", "Hệ tốt nghiệp" đã được chuẩn hóa, bạn chỉ cần chọn từ danh sách.</li>
                            </ul>
                        </div>
                    </div>
                    <ImagePlaceholder src="/images/help-step3.png" alt="Minh họa điền trình độ học vấn." />

                    <h5 className="font-semibold text-lg mt-4">Bước 4: Tiêu chí phụ</h5>
                    <p>Bước này bao gồm các thông tin về: Điểm thưởng (Nghiên cứu khoa học, Thành tích khác), Đối tượng ưu tiên, và Chính sách học bổng.</p>
                    <div className="my-4 p-4 rounded-md border-l-4 border-blue-500 bg-blue-50 flex items-start gap-4">
                        <InformationCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-blue-800">Yêu cầu về minh chứng</h4>
                            <p className="mt-1">
                                Đối với tất cả các mục trong bước này, <strong>nếu bạn chọn bất kỳ mục nào khác "Không", bạn sẽ cần phải tải lên minh chứng tương ứng ở Bước 5.</strong>
                            </p>
                            <p className="mt-1 text-sm">
                                Ví dụ: Nếu bạn chọn "Con liệt sĩ" ở mục Đối tượng ưu tiên, hệ thống sẽ yêu cầu bạn phải tải lên "Minh chứng đối tượng ưu tiên" ở bước tiếp theo.
                            </p>
                        </div>
                    </div>
                    <ImagePlaceholder src="/images/help-step4.png" alt="Minh họa chọn các tiêu chí phụ." />

                    <h5 className="font-semibold text-lg mt-4">Bước 5: Tài liệu đính kèm</h5>
                    <p>Tải lên các file minh chứng theo danh sách.</p>
                    <div className="my-4 p-4 rounded-md border-l-4 border-blue-500 bg-blue-50 flex items-start gap-4">
                        <InformationCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-blue-800">Lưu ý quan trọng</h4>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Mỗi mục tải lên đều có ghi chú về định dạng file (<code>PDF</code>, <code>JPG</code>,...) và dung lượng tối đa cho phép.</li>
                                <li>Đặc biệt, "Bằng tốt nghiệp và Bảng điểm" cần được gộp chung thành <strong>một file PDF duy nhất</strong>.</li>
                                <li>Các mục có ghi "(nếu có)" chỉ bắt buộc tải lên khi bạn đã khai báo thông tin tương ứng ở các bước trước (ví dụ: nếu bạn thuộc đối tượng ưu tiên thì phải tải minh chứng ưu tiên).</li>
                            </ul>
                        </div>
                    </div>
                    <ImagePlaceholder src="/images/help-step5.png" alt="Minh họa giao diện tải file đính kèm." />

                    <h4 className="font-bold text-xl mt-6 mb-2">Chức năng Lưu nháp</h4>
                    <p>Bạn có thể nhấn nút <strong>"Lưu nháp"</strong> bất kỳ lúc nào để lưu lại tiến trình và quay lại hoàn thành sau.</p>
                    <ImagePlaceholder src="/images/ho-so-luu-nhap.png" alt="Chức năng Lưu nháp và điều hướng." />
                    
                    <h5 className="font-semibold text-lg mt-4">Bước 6: Xem lại và Nộp hồ sơ</h5>
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
                        <ImagePlaceholder src="/images/trang-thai-cho-xu-ly.png" alt="Ví dụ về trạng thái đang xử lý." size="50%" />
                        <li><b>Yêu cầu bổ sung:</b> Hồ sơ của bạn còn thiếu hoặc sai sót. Vui lòng đọc kỹ thông báo và nhấn "Cập nhật hồ sơ ngay" để bổ sung.</li>
                        <ImagePlaceholder src="/images/trang-thai-can-bo-sung.png" alt="Ví dụ về trạng thái cần bổ sung." size="50%" />
                        <li><b>Hồ sơ hợp lệ:</b> Chúc mừng! Hồ sơ của bạn đã hợp lệ. Đây là điều kiện cần để được xét trúng tuyển.</li>
                        <ImagePlaceholder src="/images/trang-thai-hop-le.png" alt="Ví dụ về trạng thái hồ sơ hợp lệ." size="50%" />
                        <li><b>Kết quả trúng tuyển:</b> Khi có kết quả cuối cùng, trang "Kết quả trúng tuyển" sẽ hiển thị thông báo. Nếu trúng tuyển, hệ thống sẽ ghi rõ Ngành và Định hướng bạn đã trúng tuyển.</li>
                        <ImagePlaceholder src="/images/ket-qua-trung-tuyen.png" alt="VíV dụ về kết quả trúng tuyển, hiển thị rõ ngành và định hướng." size="50%" />
                        <li><b>Không trúng tuyển:</b> Mặc dù hồ sơ của bạn hợp lệ, kết quả cuối cùng phụ thuộc vào điểm xét tuyển và chỉ tiêu của ngành. Rất tiếc bạn đã không trúng tuyển đợt này.</li>
                        <ImagePlaceholder src="/images/ket-qua-khong-trung-tuyen.png" alt="Ví dụ về kết quả không trúng tuyển." size="50%" />
                        <li><b>Hồ sơ không hợp lệ:</b> Rất tiếc, hồ sơ của bạn không hợp lệ. Lý do sẽ được ghi rõ trong thông báo.</li>
                        <ImagePlaceholder src="/images/trang-thai-khong-hop-le.png" alt="Ví dụ về trạng thái hồ sơ không hợp lệ." size="50%" />
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
                            <ImagePlaceholder src="/images/admin-dashboard.png" alt="Giao diện bảng điều khiển của Admin." size="75%" />
                        </>
                    )}

                    {renderSection('admin-search', '2. Tìm kiếm và Xem hồ sơ', 2, 
                        <>
                            <p>Sử dụng thanh tìm kiếm trong phần "Danh sách thí sinh" để tìm kiếm nhanh một thí sinh theo Họ tên, Email, Số điện thoại hoặc Ngày sinh.</p>
                            <p>Nhấn vào "Xem hồ sơ" để xem chi tiết toàn bộ thông tin và các tài liệu mà thí sinh đã nộp. Tại đây, bạn cũng có thể chọn "Chỉnh sửa Hồ sơ" để thay đổi thông tin nếu cần.</p>
                            <ImagePlaceholder src="/images/admin-tim-kiem.png" alt="Chức năng tìm kiếm và xem hồ sơ thí sinh." size="75%" />
                        </>
                    )}

                    {renderSection('admin-deadline', '3. Quản lý Hạn nộp', 2, 
                        <>
                            <p>Chức năng này cho phép Admin đặt thời hạn cuối cùng cho việc nộp và chỉnh sửa hồ sơ. Sau thời gian này, thí sinh sẽ không thể lưu hồ sơ được nữa.</p>
                            <p>Chọn ngày và giờ, sau đó nhấn "Lưu Hạn nộp".</p>
                            <ImagePlaceholder src="/images/admin-quan-ly-han-nop.png" alt="Giao diện quản lý hạn nộp hồ sơ." size="75%" />
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
                            <ImagePlaceholder src="/images/admin-quan-ly-can-bo.png" alt="Giao diện quản lý cán bộ dành cho Admin." size="75%" />
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