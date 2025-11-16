import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Page } from '../types';
import Footer from '../components/Footer';
import { apiCall } from '../hooks/useMockAuth';
import UserGroupIcon from '../components/icons/UserGroupIcon';
import DocumentTextIcon from '../components/icons/DocumentTextIcon';
import AcademicCapIcon from '../components/icons/AcademicCapIcon';
import Alert from '../components/Alert';
import InputField from '../components/InputField';
import { validatePassword, PasswordValidationResult, formatFullName } from '../utils/validation';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import SearchIcon from '../components/icons/SearchIcon';
import EyeIcon from '../components/icons/EyeIcon';

// Type definitions for the data fetched from the backend
interface Stats {
  totalApplications: number;
  totalWishes: number;
  totalNV1: number;
  totalNV2: number;
  totalNV3: number;
  uniqueMajorCount: number;
  visitorCount?: number;
}

interface MajorStat {
  name: string;
  nv1: number;
  nv2: number;
  nv3: number;
  total: number;
}

interface Candidate {
  id: string;
  email: string;
  hoTen: string;
  phone: string;
  ngaySinh: string;
  noiSinh: string;
}

interface StaffMember {
  fullName: string;
  email: string;
  canEdit: boolean;
  status: string;
}

interface Deadline {
    display: string;
    iso: string;
}

interface DashboardData {
  stats: Stats;
  majorStats: MajorStat[];
  candidates: Candidate[];
  staff: StaffMember[];
  deadline: Deadline;
}

const ADMIN_EMAIL = 'banglv@hcmue.edu.vn';

const AdminDashboardPage: React.FC<{
  user: User;
  onLogout: () => void;
  navigate: (page: Page) => void;
}> = ({ user, onLogout, navigate }) => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // State for candidate search
    const [searchTerm, setSearchTerm] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    
    // State for viewing a specific applicant's full data
    const [selectedApplicant, setSelectedApplicant] = useState<Candidate | null>(null);
    const [selectedApplicantData, setSelectedApplicantData] = useState<Record<string, any> | null>(null);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [modalError, setModalError] = useState('');

    // State for deadline management
    const [deadlineInput, setDeadlineInput] = useState('');
    const [deadlineMessage, setDeadlineMessage] = useState({ text: '', type: 'success' as 'success' | 'error' });
    const [isDeadlineSaving, setIsDeadlineSaving] = useState(false);
    
    // State for staff management
    const [staffActionStatus, setStaffActionStatus] = useState<Record<string, { [action: string]: boolean }>>({});
    const [newStaffFullName, setNewStaffFullName] = useState('');
    const [newStaffEmail, setNewStaffEmail] = useState('');
    const [newStaffPassword, setNewStaffPassword] = useState('');
    const [newStaffCanEdit, setNewStaffCanEdit] = useState(false);
    const [staffMessage, setStaffMessage] = useState({ text: '', type: 'success' as 'success' | 'error' });
    const [isAddingStaff, setIsAddingStaff] = useState(false);
    const [staffFormErrors, setStaffFormErrors] = useState({ fullName: '', email: '', password: '' });
    const [staffPasswordValidation, setStaffPasswordValidation] = useState<PasswordValidationResult | null>(null);
    const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
    const [lastUpdated, setLastUpdated] = useState('');


    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiCall({ action: 'getAdminDashboardData' });
            if (result.success && result.data) {
                setData(result.data);
                const now = new Date();
                const formattedTimestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} ngày ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
                setLastUpdated(formattedTimestamp);
                if (result.data.deadline?.iso) {
                    const d = new Date(result.data.deadline.iso);
                    const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                    setDeadlineInput(formatted);
                }
            } else {
                throw new Error(result.message || 'Không thể tải dữ liệu dashboard.');
            }
        } catch (e: any) {
            setError(e.message);
            console.error("Failed to fetch dashboard data:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const filteredCandidates = useMemo(() => {
        if (!searchTerm.trim()) {
            return [];
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return data?.candidates.filter(candidate =>
            (candidate.hoTen && candidate.hoTen.toLowerCase().includes(lowercasedFilter)) ||
            (candidate.email && candidate.email.toLowerCase().includes(lowercasedFilter)) ||
            (candidate.phone && candidate.phone.includes(lowercasedFilter)) ||
            (candidate.ngaySinh && candidate.ngaySinh.includes(lowercasedFilter))
        ) || [];
    }, [searchTerm, data?.candidates]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        if (e.target.value.trim() !== '' && !hasSearched) {
            setHasSearched(true);
        }
    };
    
    const handleViewProfile = async (applicant: Candidate) => {
        setSelectedApplicant(applicant);
        setIsModalLoading(true);
        setModalError('');
        try {
            const result = await apiCall({ action: 'getApplicationData', id: applicant.id, email: applicant.email });
            if (result.success && result.data) {
                setSelectedApplicantData(result.data);
            } else {
                throw new Error(result.message || "Không thể tải chi tiết hồ sơ.");
            }
        } catch (e: any) {
            setModalError(e.message);
        } finally {
            setIsModalLoading(false);
        }
    };

    const handleEditProfile = (applicant: Candidate) => {
        sessionStorage.setItem('userToEdit', JSON.stringify(applicant));
        navigate(Page.Application);
    };

    const handleSaveDeadline = async () => {
        if (!deadlineInput) {
            setDeadlineMessage({ text: 'Vui lòng chọn ngày giờ.', type: 'error' });
            return;
        }
        setIsDeadlineSaving(true);
        setDeadlineMessage({ text: '', type: 'success' });
        try {
            const result = await apiCall({ action: 'setDeadline', deadline: deadlineInput });
            if (result.success) {
                setDeadlineMessage({ text: 'Lưu hạn nộp thành công!', type: 'success' });
                fetchDashboardData();
            } else {
                throw new Error(result.message);
            }
        } catch (e: any) {
            setDeadlineMessage({ text: e.message || 'Lỗi khi lưu hạn nộp.', type: 'error' });
        } finally {
            setIsDeadlineSaving(false);
        }
    };
    
    const handleFullNameBlur = () => {
        setNewStaffFullName(prev => formatFullName(prev));
    };

    const handleStaffAction = async (email: string, actionName: string, additionalPayload: { [key: string]: any } = {}) => {
        if (!email) {
            console.error("Email is required for handleStaffAction");
            setStaffMessage({ text: 'Lỗi nội bộ: Thiếu email khi thực hiện hành động.', type: 'error' });
            return;
        }

        setStaffActionStatus(prev => ({ ...prev, [email]: { ...prev[email], [actionName]: true } }));
        try {
            const payloadToSend = {
                action: actionName,
                email: email,
                ...additionalPayload
            };
            const result = await apiCall(payloadToSend);
            if (!result.success) {
                throw new Error(result.message);
            }
            fetchDashboardData(); // Refresh data on success
        } catch (e: any) {
            setStaffMessage({ text: `Lỗi khi thực hiện '${actionName}': ${e.message}`, type: 'error' });
        } finally {
            setStaffActionStatus(prev => ({ ...prev, [email]: { ...prev[email], [actionName]: false } }));
        }
    };
    
    const confirmDeleteStaff = async () => {
        if (!staffToDelete) return;
        await handleStaffAction(staffToDelete.email, 'deleteStaff');
        setStaffToDelete(null); // Close modal after action completes
    };

    const handlePermissionChange = async (email: string, canEdit: boolean) => {
        await handleStaffAction(email, 'updateStaffCanEdit', { canEdit });
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setStaffMessage({ text: '', type: 'success' });
        setStaffFormErrors({ fullName: '', email: '', password: '' });

        const newErrors = { fullName: '', email: '', password: '' };
        let hasError = false;

        // 1. Validate Full Name
        if (!newStaffFullName.trim()) {
            newErrors.fullName = 'Họ và tên không được để trống.';
            hasError = true;
        }

        // 2. Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!newStaffEmail.trim()) {
            newErrors.email = 'Email không được để trống.';
            hasError = true;
        } else if (!emailRegex.test(newStaffEmail)) {
            newErrors.email = 'Định dạng email không hợp lệ.';
            hasError = true;
        } else {
            const adminEmail = user.email.toLowerCase();
            if (data?.staff.some(s => s.email.toLowerCase() === newStaffEmail.toLowerCase().trim()) || newStaffEmail.toLowerCase().trim() === adminEmail) {
                newErrors.email = 'Email này đã tồn tại trong hệ thống.';
                hasError = true;
            }
        }
        
        // 3. Validate Password
        const passwordCheck = validatePassword(newStaffPassword);
        setStaffPasswordValidation(passwordCheck); // Update for indicator
        if (!newStaffPassword) {
            newErrors.password = 'Mật khẩu không được để trống.';
            hasError = true;
        } else if (!passwordCheck.valid) {
            newErrors.password = 'Mật khẩu chưa đáp ứng đủ các yêu cầu bảo mật.';
            hasError = true;
        }

        if (hasError) {
            setStaffFormErrors(newErrors);
            return;
        }

        setIsAddingStaff(true);
        const formattedFullName = formatFullName(newStaffFullName);
        setNewStaffFullName(formattedFullName); // Ensure UI reflects formatted name

        try {
            const result = await apiCall({ 
                action: 'addStaff', 
                fullName: formattedFullName,
                email: newStaffEmail.trim(), 
                password: newStaffPassword, 
                canEdit: newStaffCanEdit 
            });
            if (result.success) {
                setStaffMessage({ text: 'Thêm cán bộ thành công!', type: 'success' });
                setNewStaffFullName('');
                setNewStaffEmail('');
                setNewStaffPassword('');
                setNewStaffCanEdit(false);
                setStaffPasswordValidation(null);
                fetchDashboardData();
            } else {
                throw new Error(result.message);
            }
        } catch (e: any) {
            setStaffMessage({ text: e.message || 'Thêm cán bộ thất bại.', type: 'error' });
        } finally {
            setIsAddingStaff(false);
        }
    };

    const AdminHeader = () => (
         <header className="bg-sky-100 text-slate-800 shadow-sm w-full sticky top-0 z-50 border-b border-sky-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-3">
                <div className="flex items-center gap-3">
                    <AcademicCapIcon className="w-8 h-8 text-sky-700" />
                    <span className="text-xl font-bold text-slate-800 hidden sm:block">
                      Bảng điều khiển Admin
                    </span>
                </div>
                <nav className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(Page.Help)}
                        className="px-4 py-2 text-sky-700 font-semibold rounded-md hover:bg-sky-200/60 transition-colors text-sm"
                    >
                        Hướng dẫn
                    </button>
                    <span className="text-slate-600 hidden md:block">
                        Xin chào, <span className="font-semibold">{user.fullName}</span>!
                    </span>
                    {user.role === 'admin' && (
                        <button
                            onClick={() => navigate(Page.Landing)}
                            className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition-colors text-sm"
                        >
                            Về Trang chủ
                        </button>
                    )}
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
    );

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">Lỗi: {error}</div>;
    }

    const stats = data?.stats;

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <AdminHeader />
            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md flex items-start gap-4">
                        <div className="bg-blue-100 p-3 rounded-full"><UserGroupIcon className="w-6 h-6 text-blue-500" /></div>
                        <div>
                            <p className="text-3xl font-bold text-blue-600">{stats?.totalApplications || 0}</p>
                            <p className="text-sm text-gray-500">Tổng số hồ sơ</p>
                            <p className="text-sm text-gray-600 font-medium mt-1">Tổng số hồ sơ đã được tạo</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md flex items-start gap-4">
                        <div className="bg-green-100 p-3 rounded-full"><DocumentTextIcon className="w-6 h-6 text-green-500" /></div>
                        <div>
                            <p className="text-3xl font-bold text-green-600">{stats?.totalWishes || 0}</p>
                            <p className="text-sm text-gray-500">Tổng số nguyện vọng</p>
                            <p className="text-sm text-gray-600 font-medium mt-1">NV1: {stats?.totalNV1 || 0} | NV2: {stats?.totalNV2 || 0} | NV3: {stats?.totalNV3 || 0}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md flex items-start gap-4">
                        <div className="bg-yellow-100 p-3 rounded-full"><AcademicCapIcon className="w-6 h-6 text-yellow-500" /></div>
                        <div>
                            <p className="text-3xl font-bold text-yellow-600">{stats?.uniqueMajorCount || 0}</p>
                            <p className="text-sm text-gray-500">Tổng số ngành đã đăng ký</p>
                             <p className="text-sm text-gray-600 font-medium mt-1">Tính đến: {lastUpdated}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-sky-800 pb-2 mb-4 border-b">Thống kê Nguyện vọng theo Ngành</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-white uppercase bg-sky-600 font-semibold">
                                <tr>
                                    <th scope="col" className="px-2 py-3 w-16 text-center">STT</th>
                                    <th scope="col" className="px-2 py-3">Tên ngành</th>
                                    <th scope="col" className="px-2 py-3 text-center">NV1</th>
                                    <th scope="col" className="px-2 py-3 text-center">NV2</th>
                                    <th scope="col" className="px-2 py-3 text-center">NV3</th>
                                    <th scope="col" className="px-2 py-3 text-center">Tổng cộng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data && data.majorStats.length > 0 ? data.majorStats.map((major, index) => (
                                    <tr key={major.name} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-2 py-4 text-center font-medium text-gray-700">{index + 1}</td>
                                        <td className="px-2 py-4 font-medium text-gray-900">{major.name}</td>
                                        <td className="px-2 py-4 text-center">{major.nv1}</td>
                                        <td className="px-2 py-4 text-center">{major.nv2}</td>
                                        <td className="px-2 py-4 text-center">{major.nv3}</td>
                                        <td className="px-2 py-4 text-center font-bold">{major.total}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={6} className="text-center py-4">Chưa có dữ liệu nguyện vọng.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-sky-800 pb-2 mb-4 border-b">Danh sách thí sinh</h2>
                    <div className="relative mb-4">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Nhập họ tên, email, SĐT hoặc ngày sinh để tìm kiếm..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                    </div>
                    {hasSearched && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-white uppercase bg-sky-600 font-semibold">
                                    <tr>
                                        <th scope="col" className="px-2 py-3 w-16 text-center">STT</th>
                                        <th scope="col" className="px-4 py-3">Họ và tên</th>
                                        <th scope="col" className="px-4 py-3">Email</th>
                                        <th scope="col" className="px-4 py-3">Số điện thoại</th>
                                        <th scope="col" className="px-4 py-3">Ngày sinh</th>
                                        <th scope="col" className="px-4 py-3">Nơi sinh</th>
                                        <th scope="col" className="px-4 py-3 text-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCandidates.length > 0 ? filteredCandidates.map((candidate, index) => (
                                        <tr key={candidate.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-2 py-4 text-center font-medium text-gray-700">{index + 1}</td>
                                            <td className="px-4 py-4 font-medium text-gray-900">{candidate.hoTen}</td>
                                            <td className="px-4 py-4">{candidate.email}</td>
                                            <td className="px-4 py-4">{candidate.phone}</td>
                                            <td className="px-4 py-4">{candidate.ngaySinh}</td>
                                            <td className="px-4 py-4">{candidate.noiSinh}</td>
                                            <td className="px-4 py-4 text-center">
                                                <button onClick={() => handleViewProfile(candidate)} className="font-medium text-sky-600 hover:underline">
                                                    Xem hồ sơ
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={7} className="text-center py-4 text-red-500 font-semibold">Không tìm thấy thí sinh nào khớp với điều kiện tìm kiếm.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-sky-800 pb-2 mb-4 border-b">Quản lý Hạn nộp Hồ sơ</h2>
                    <p className="text-sm text-gray-600">Đặt ngày và giờ cuối cùng để thí sinh có thể nộp và chỉnh sửa hồ sơ.</p>
                    <p className="text-sm text-gray-600 mb-2">Hạn nộp hiện tại: <span className="font-bold">{data?.deadline?.display || 'Chưa đặt'}</span></p>
                    <div className="flex items-center gap-2 mt-4">
                        <input 
                          type="datetime-local" 
                          value={deadlineInput} 
                          onChange={e => setDeadlineInput(e.target.value)} 
                          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          disabled={isDeadlineSaving || user.role !== 'admin'}
                        />
                        <button 
                          onClick={handleSaveDeadline} 
                          disabled={isDeadlineSaving || user.role !== 'admin'} 
                          className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 disabled:bg-sky-300"
                        >
                            {isDeadlineSaving ? 'Đang lưu...' : 'Lưu Hạn nộp'}
                        </button>
                    </div>
                    {deadlineMessage.text && <p className={`text-sm mt-2 ${deadlineMessage.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>{deadlineMessage.text}</p>}
                    <p className="text-xs text-red-600 font-semibold mt-2">
                        Sau thời gian này, thí sinh lưu hồ sơ sẽ nhận thông báo: "Lưu thông tin thất bại: Đã hết hạn nộp hồ sơ vào lúc {data?.deadline?.display || '[giờ] ngày [ngày]'}, bạn liên hệ Phòng Sau đại học để được tư vấn!"
                    </p>
                </div>
                
                {/* Staff Management - Visible to Admin and Sub-Admin */}
                {(user.role === 'admin' || user.role === 'sub-admin') && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-sky-800 pb-2 mb-4 border-b">Quản lý Cán bộ</h2>
                    
                    {/* Admin-only: Add staff form */}
                    {user.role === 'admin' && (
                        <>
                        {staffMessage.text && <Alert type={staffMessage.type} message={staffMessage.text} onClose={() => setStaffMessage({ text: '', type: 'success' })} />}
                        <form onSubmit={handleAddStaff} noValidate className="mb-6 p-4 border rounded-md bg-gray-50">
                            <h3 className="font-semibold mb-2">Thêm cán bộ mới</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                <div>
                                    <InputField 
                                        id="newStaffFullName" 
                                        label="Họ và tên Cán bộ:" 
                                        type="text" 
                                        value={newStaffFullName} 
                                        onBlur={handleFullNameBlur}
                                        onChange={e => {
                                            setNewStaffFullName(e.target.value);
                                            if (staffFormErrors.fullName) setStaffFormErrors(prev => ({ ...prev, fullName: '' }));
                                        }}
                                    />
                                    {staffFormErrors.fullName && <p className="text-xs text-red-600 mt-1">{staffFormErrors.fullName}</p>}
                                </div>
                                <div>
                                    <InputField 
                                        id="newStaffEmail" 
                                        label="Email Cán bộ:" 
                                        type="email" 
                                        value={newStaffEmail} 
                                        onChange={e => {
                                            setNewStaffEmail(e.target.value);
                                            if (staffFormErrors.email) setStaffFormErrors(prev => ({ ...prev, email: '' }));
                                        }}
                                    />
                                    {staffFormErrors.email && <p className="text-xs text-red-600 mt-1">{staffFormErrors.email}</p>}
                                </div>
                                <div>
                                    <InputField 
                                        id="newStaffPassword" 
                                        label="Mật khẩu:" 
                                        type="password" 
                                        value={newStaffPassword} 
                                        onChange={e => {
                                            const pass = e.target.value;
                                            setNewStaffPassword(pass);
                                            if (staffFormErrors.password) setStaffFormErrors(prev => ({ ...prev, password: '' }));
                                            setStaffPasswordValidation(validatePassword(pass));
                                        }}
                                    />
                                    {staffFormErrors.password && <p className="text-xs text-red-600 mt-1">{staffFormErrors.password}</p>}
                                    {newStaffPassword && staffPasswordValidation && <PasswordStrengthIndicator validationResult={staffPasswordValidation} />}
                                </div>
                                <div className="flex items-center pt-8">
                                    <input type="checkbox" id="newStaffCanEdit" checked={newStaffCanEdit} onChange={e => setNewStaffCanEdit(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
                                    <label htmlFor="newStaffCanEdit" className="ml-2 block text-sm text-gray-900">Quyền Ghi</label>
                                </div>
                            </div>
                            <button type="submit" disabled={isAddingStaff} className="mt-4 px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-green-300">
                                {isAddingStaff ? 'Đang thêm...' : 'Thêm Cán bộ'}
                            </button>
                        </form>
                        </>
                    )}

                    {/* Staff List Table - Visible to both, but actions/edits depend on role */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                             <thead className="text-xs text-white uppercase bg-sky-600 font-semibold">
                                <tr>
                                    <th scope="col" className="px-2 py-3 w-16 text-center">STT</th>
                                    <th className="px-6 py-3">Họ và tên</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Quyền hạn</th>
                                    <th className="px-6 py-3">Trạng thái</th>
                                    <th className="px-6 py-3">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.staff.map((staff, index) => {
                                    const isRowForLoggedInUser = staff.email.toLowerCase() === user.email.toLowerCase();
                                    // The original logic mistakenly identified any logged-in staff as the main admin.
                                    // This is now corrected by checking against a defined ADMIN_EMAIL.
                                    const isRowForMainAdmin = staff.email.toLowerCase() === ADMIN_EMAIL;
                                    
                                    let emailLabel = '';
                                    if (isRowForMainAdmin) {
                                        emailLabel = ' (Admin)';
                                    }
                                    // A sub-admin viewing their own row should see "(Bạn)" instead of "(Admin)".
                                    if (isRowForLoggedInUser && user.role === 'sub-admin') {
                                        emailLabel = ' (Bạn)';
                                    }

                                    return (
                                        <tr key={staff.email} className="bg-white border-b">
                                            <td className="px-2 py-4 text-center font-medium text-gray-700">{index + 1}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{staff.fullName}</td>
                                            <td className="px-6 py-4 font-medium">{staff.email}{emailLabel}</td>
                                            <td className="px-6 py-4">
                                                {/* The "Toàn quyền" status should only apply to the main admin, not any logged-in user. */}
                                                {isRowForMainAdmin ? (
                                                    <span className="font-bold text-blue-600">Toàn quyền</span>
                                                ) : user.role === 'admin' ? (
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id={`canEdit-${staff.email}`}
                                                            checked={staff.canEdit}
                                                            onChange={(e) => handlePermissionChange(staff.email, e.target.checked)}
                                                            disabled={staffActionStatus[staff.email]?.['updateStaffCanEdit']}
                                                            className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500 cursor-pointer disabled:cursor-wait"
                                                        />
                                                         <label
                                                            htmlFor={`canEdit-${staff.email}`}
                                                            className={`ml-2 text-sm select-none cursor-pointer ${staff.canEdit ? 'font-semibold text-green-700' : 'text-gray-600'}`}
                                                        >
                                                            {staff.canEdit ? 'Đọc và Ghi' : 'Chỉ đọc'}
                                                        </label>
                                                    </div>
                                                ) : ( // Sub-admin view
                                                    <div className="flex items-center">
                                                        <input
                                                          type="checkbox"
                                                          checked={staff.canEdit}
                                                          disabled
                                                          className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500 cursor-not-allowed"
                                                        />
                                                        <span className={`ml-2 text-sm select-none ${staff.canEdit ? 'font-semibold text-green-700' : 'text-gray-600'}`}>
                                                          {staff.canEdit ? 'Đọc và Ghi' : 'Chỉ đọc'}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className={`px-6 py-4 font-semibold ${staff.status === 'Hoạt động' ? 'text-green-600' : 'text-orange-500'}`}>{staff.status}</td>
                                            <td className="px-6 py-4">
                                                {/* Actions should also be restricted based on the main admin role. */}
                                                {isRowForMainAdmin ? (
                                                    <span className="font-semibold text-blue-600">Toàn quyền</span>
                                                ) : user.role === 'admin' ? (
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <button onClick={() => handleStaffAction(staff.email, 'updateStaffStatus', { status: staff.status === 'Hoạt động' ? 'Tạm dừng' : 'Hoạt động' })}
                                                                disabled={staffActionStatus[staff.email]?.['updateStaffStatus']}
                                                                className="text-blue-600 hover:underline disabled:text-gray-400">
                                                            {staffActionStatus[staff.email]?.['updateStaffStatus'] ? 'Đang xử lý...' : (staff.status === 'Hoạt động' ? 'Tạm dừng' : 'Bỏ tạm dừng')}
                                                        </button>
                                                        <span>|</span>
                                                        <button onClick={() => setStaffToDelete(staff)}
                                                                disabled={staffActionStatus[staff.email]?.['deleteStaff']}
                                                                className="text-red-600 hover:underline disabled:text-gray-400">
                                                            Xóa quyền
                                                        </button>
                                                    </div>
                                                ) : ( // Sub-admin view
                                                     // Text changed from "Chỉ xem" to "Admin quyết định" per user request.
                                                     <span className="text-gray-500 italic">Admin quyết định</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
                )}


            </main>
            {selectedApplicant && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
                         <div className="flex justify-between items-center border-b p-4">
                            <h3 className="text-xl font-bold">Hồ sơ thí sinh - {selectedApplicant.email}</h3>
                            <button onClick={() => setSelectedApplicant(null)} className="text-gray-400 hover:text-gray-800 text-3xl font-light">&times;</button>
                        </div>
                        <div className="p-4 max-h-[75vh] overflow-y-auto">
                            {isModalLoading ? <p>Đang tải chi tiết hồ sơ...</p> : modalError ? <p className="text-red-500">{modalError}</p> : (
                                <dl>
                                    {selectedApplicantData && Object.entries(selectedApplicantData).map(([header, value]) => {
                                        if (!value || String(value).trim() === '') return null;
                                        let displayValue = String(value);
                                        const isLink = displayValue.toLowerCase().startsWith('http');
                                        
                                        return (
                                            <div key={header} className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 py-2 border-b last:border-b-0">
                                                <dt className="font-semibold text-gray-600">{header}</dt>
                                                <dd className="col-span-2 text-gray-800 break-words">
                                                    {isLink ? (
                                                        <a href={displayValue} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">
                                                            Mở liên kết
                                                        </a>
                                                    ) : ( displayValue )}
                                                </dd>
                                            </div>
                                        );
                                    })}
                                </dl>
                            )}
                        </div>
                         <div className="border-t p-4 flex justify-end items-center gap-3">
                             {(user.role === 'admin' || user.canEdit) && (
                                <button 
                                    onClick={() => handleEditProfile(selectedApplicant)}
                                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
                                >
                                    Chỉnh sửa Hồ sơ
                                </button>
                             )}
                             <button onClick={() => setSelectedApplicant(null)} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition-colors">
                                Đóng
                            </button>
                         </div>
                    </div>
                </div>
            )}
            {staffToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300">
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
                                        Xác nhận Xóa Cán bộ
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600">
                                            Bạn có chắc chắn muốn xóa quyền của cán bộ <span className="font-semibold">{staffToDelete.fullName}</span> ({staffToDelete.email})?
                                        </p>
                                        <p className="text-sm text-red-700 font-semibold mt-1">
                                            Hành động này không thể hoàn tác.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                            <button
                                type="button"
                                onClick={confirmDeleteStaff}
                                disabled={staffActionStatus[staffToDelete.email]?.['deleteStaff']}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-red-300 disabled:cursor-wait"
                            >
                                {staffActionStatus[staffToDelete.email]?.['deleteStaff'] ? 'Đang xóa...' : 'Xác nhận Xóa'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setStaffToDelete(null)}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Footer navigate={navigate} />
        </div>
    );
};

export default AdminDashboardPage;