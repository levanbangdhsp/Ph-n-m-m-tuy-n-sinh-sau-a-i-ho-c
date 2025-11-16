import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, ApplicationFormData, Page } from '../types';
import RadioGroup from '../components/RadioGroup';
import Alert from '../components/Alert';
import { SCRIPT_URL, NATIONALITIES, GENDERS, MAJORS_DATA, DEGREE_CLASSIFICATIONS, GRADUATION_SYSTEMS, LANGUAGES, LANGUAGE_CERT_TYPES, TRAINING_FACILITIES, CITIES, ETHNICITIES, PRIORITY_CATEGORIES, SCHOLARSHIP_POLICIES, RESEARCH_ACHIEVEMENT_CATEGORIES, OTHER_ACHIEVEMENT_CATEGORIES } from '../constants';
import { apiCall } from '../hooks/useMockAuth';
import AcademicCapIcon from '../components/icons/AcademicCapIcon';
import Footer from '../components/Footer';
import FileUploadField from '../components/FileUploadField';
import UserCircleIcon from '../components/icons/UserCircleIcon';
import DocumentTextIcon from '../components/icons/DocumentTextIcon';
import GlobeAltIcon from '../components/icons/GlobeAltIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import UserGroupIcon from '../components/icons/UserGroupIcon';
import ClipboardCheckIcon from '../components/icons/ClipboardCheckIcon';
import UploadIcon from '../components/icons/UploadIcon';
import ExclamationTriangleIcon from '../components/icons/ExclamationTriangleIcon';
import ApplicationFormStepper from '../components/ApplicationFormStepper';
import PencilIcon from '../components/icons/PencilIcon';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import ArrowRightIcon from '../components/icons/ArrowRightIcon';

interface ApplicationFormPageProps {
  user: User;
  onLogout: () => void;
  navigateBack: () => void;
  navigate: (page: Page) => void;
}

const keyToHeaderMap: { [key in keyof ApplicationFormData]?: string } = {
    fullName: 'Họ và tên',
    gender: 'Giới tính',
    dob: 'Ngày sinh',
    pob: 'Nơi sinh',
    ethnicity: 'Dân tộc',
    nationality: 'Quốc tịch',
    idCardNumber: 'Số CCCD',
    idCardIssueDate: 'Ngày cấp CCCD',
    idCardIssuePlace: 'Nơi cấp CCCD',
    phone: 'Số điện thoại',
    email: 'Email',
    contactAddress: 'Địa chỉ liên hệ',
    workplace: 'Cơ quan công tác',
    trainingFacility: 'Cơ sở đào tạo',
    firstChoiceMajor: 'Nguyện vọng 1',
    secondChoiceMajor: 'Nguyện vọng 2',
    thirdChoiceMajor: 'Nguyện vọng 3',
    firstChoiceOrientation: 'Định hướng NV1',
    secondChoiceOrientation: 'Định hướng NV2',
    thirdChoiceOrientation: 'Định hướng NV3',
    university: 'Trường tốt nghiệp đại học',
    graduationYear: 'Năm TN',
    gpa10: 'Điểm TB (hệ 10)',
    gpa4: 'Điểm TB (hệ 4)',
    graduationMajor: 'Ngành tốt nghiệp',
    degreeClassification: 'Loại TN',
    graduationSystem: 'Hệ TN',
    supplementaryCert: 'Bổ sung kiến thức',
    language: 'Ngoại ngữ',
    languageCertType: 'Loại bằng NN',
    languageCertIssuer: 'Trường cấp bằng NN',
    languageScore: 'Điểm NN',
    languageCertDate: 'Ngày cấp NN',
    researchAchievements: 'Nghiên cứu khoa học',
    otherAchievements: 'Thành tích khác',
    priorityCategory: 'Ưu tiên',
    scholarshipPolicy: 'Học bổng',
    linkPhieuDangKy: 'Link Phiếu đăng ký dự tuyển',
    linkSoYeuLyLich: 'Link Sơ yếu lý lịch',
    linkMinhChungLePhi: 'Link Minh chứng lệ phí',
    linkAnhThe: 'Link Ảnh thẻ',
    linkBangTotNghiep: 'Link Bằng tốt nghiệp',
    linkBangDiem: 'Link Bảng điểm',
    linkChungChiNN: 'Link Chứng chỉ NN',
    linkGiayChungNhanBSKT: 'Link Giấy chứng nhận BSKT',
    linkUuTien: 'Link Ưu tiên',
    linkNCKH: 'Link NCKH và thành tích khác',
};

const STEPS = [
    { step: 1, title: 'Thông tin cá nhân', sections: ['section-1'] },
    { step: 2, title: 'Đăng ký dự tuyển', sections: ['section-2'] },
    { step: 3, title: 'Trình độ học vấn', sections: ['section-3', 'section-4'] },
    { step: 4, title: 'Tiêu chí phụ', sections: ['section-5', 'section-6', 'section-7'] },
    { step: 5, title: 'Tài liệu đính kèm', sections: ['section-8'] },
    { step: 6, title: 'Xem lại và Xác nhận', sections: [] },
];

const ICONS_BY_SECTION_ID: { [id: string]: React.ReactNode } = {
  'section-1': <UserCircleIcon className="w-6 h-6 text-sky-700" />,
  'section-2': <AcademicCapIcon className="w-6 h-6 text-sky-700" />,
  'section-3': <DocumentTextIcon className="w-6 h-6 text-sky-700" />,
  'section-4': <GlobeAltIcon className="w-6 h-6 text-sky-700" />,
  'section-5': <SparklesIcon className="w-6 h-6 text-sky-700" />,
  'section-6': <UserGroupIcon className="w-6 h-6 text-sky-700" />,
  'section-7': <ClipboardCheckIcon className="w-6 h-6 text-sky-700" />,
  'section-8': <UploadIcon className="w-6 h-6 text-sky-700" />,
};


const SECTIONS = [
    { id: 'section-1', title: 'I. Thông tin người dự tuyển' },
    { id: 'section-2', title: 'II. Thông tin đăng ký dự tuyển' },
    { id: 'section-3', title: 'III. Thông tin về văn bằng' },
    { id: 'section-4', title: 'IV. Thông tin về trình độ ngoại ngữ' },
    { id: 'section-5', title: 'V. Thông tin về điểm thưởng' },
    { id: 'section-6', title: 'VI. Thông tin về đối tượng ưu tiên' },
    { id: 'section-7', title: 'VII. Chính sách học bổng' },
    { id: 'section-8', title: 'VIII. Tài liệu đính kèm' },
];

const FIELD_TO_SECTION_MAP: Record<keyof ApplicationFormData, string> = {
  // Section I -> Step 1
  fullName: 'section-1', gender: 'section-1', dob: 'section-1', pob: 'section-1', ethnicity: 'section-1', nationality: 'section-1', idCardNumber: 'section-1', idCardIssueDate: 'section-1', idCardIssuePlace: 'section-1', phone: 'section-1', email: 'section-1', contactAddress: 'section-1', workplace: 'section-1',
  // Section II -> Step 2
  trainingFacility: 'section-2', firstChoiceMajor: 'section-2', secondChoiceMajor: 'section-2', thirdChoiceMajor: 'section-2', firstChoiceOrientation: 'section-2', secondChoiceOrientation: 'section-2', thirdChoiceOrientation: 'section-2',
  // Section III -> Step 3
  university: 'section-3', graduationYear: 'section-3', gpa10: 'section-3', gpa4: 'section-3', graduationMajor: 'section-3', degreeClassification: 'section-3', graduationSystem: 'section-3', supplementaryCert: 'section-3',
  // Section IV -> Step 3
  language: 'section-4', languageCertType: 'section-4', languageCertIssuer: 'section-4', languageScore: 'section-4', languageCertDate: 'section-4',
  // Section V -> Step 4
  researchAchievements: 'section-5', otherAchievements: 'section-5',
  // Section VI -> Step 4
  priorityCategory: 'section-6',
  // Section VII -> Step 4
  scholarshipPolicy: 'section-7',
  // Section VIII -> Step 5
  linkPhieuDangKy: 'section-8', linkSoYeuLyLich: 'section-8', linkMinhChungLePhi: 'section-8',
  linkAnhThe: 'section-8', linkBangTotNghiep: 'section-8', linkBangDiem: 'section-8', linkChungChiNN: 'section-8',
  linkGiayChungNhanBSKT: 'section-8', linkUuTien: 'section-8', linkNCKH: 'section-8',
};

const SECTION_TO_STEP_MAP: Record<string, number> = {};
STEPS.forEach(step => {
    step.sections.forEach(sectionId => {
        SECTION_TO_STEP_MAP[sectionId] = step.step;
    });
});


const headerToKeyMap: { [key: string]: string } = Object.entries(keyToHeaderMap).reduce((acc, [key, value]) => ({ ...acc, [value as string]: key }), {});

const createReverseMap = (options: {label: string, value: string}[]) => {
    const map: Record<string, string> = {};
    options.forEach(option => {
        map[option.label] = option.value;
    });
    return map;
};

const degreeReverseMap = createReverseMap(DEGREE_CLASSIFICATIONS);
const graduationSystemReverseMap = createReverseMap(GRADUATION_SYSTEMS);
const languageReverseMap = createReverseMap(LANGUAGES);
const languageCertTypeReverseMap = createReverseMap(LANGUAGE_CERT_TYPES);
const priorityCategoryReverseMap = createReverseMap(PRIORITY_CATEGORIES);
const scholarshipReverseMap = createReverseMap(SCHOLARSHIP_POLICIES);
const researchAchievementsReverseMap = createReverseMap(RESEARCH_ACHIEVEMENT_CATEGORIES);
const otherAchievementsReverseMap = createReverseMap(OTHER_ACHIEVEMENT_CATEGORIES);

scholarshipReverseMap['0'] = 'Không';
scholarshipReverseMap['M100'] = 'Miễn 100%';
scholarshipReverseMap['G75'] = 'Giảm 75%';
scholarshipReverseMap['G50'] = 'Giảm 50%';

const mapOrientationFromSheet = (value: string): 'research' | 'applied' | '' => {
    if (value === 'Nghiên cứu') return 'research';
    if (value === 'Ứng dụng') return 'applied';
    return '';
};

const formatDateFromISO = (dateString: string): string => {
  if (!dateString) return '';
  if (dateString.includes('T') && dateString.includes('Z')) {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      const day = String(date.getUTCDate()).padStart(2, '0');
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const year = date.getUTCFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateString;
    }
  }
  return dateString;
};

const specialSections = ['section-5', 'section-6', 'section-7'];
const specialSectionFields: Record<string, { key: keyof ApplicationFormData; label: string }[]> = {
    'section-5': [
        { key: 'researchAchievements', label: '1. Thành tích và giải thưởng nghiên cứu khoa học' },
        { key: 'otherAchievements', label: '2. Các thành tích khác' },
    ],
    'section-6': [
        { key: 'priorityCategory', label: 'Ưu tiên' },
    ],
    'section-7': [
        { key: 'scholarshipPolicy', label: 'Học bổng' },
    ]
};

const ApplicationFormPage: React.FC<ApplicationFormPageProps> = ({ user, onLogout, navigateBack, navigate }) => {
  const [targetUser, setTargetUser] = useState<User | null>(null);

  const initialFormState: ApplicationFormData = {
    fullName: targetUser?.fullName || '',
    gender: '',
    dob: '',
    pob: '',
    ethnicity: '',
    nationality: 'Việt Nam',
    idCardNumber: '',
    idCardIssueDate: '',
    idCardIssuePlace: '',
    phone: targetUser?.phone || '',
    email: targetUser?.email || '',
    contactAddress: '',
    workplace: '',
    trainingFacility: '',
    firstChoiceMajor: '',
    secondChoiceMajor: '',
    thirdChoiceMajor: '',
    firstChoiceOrientation: '',
    secondChoiceOrientation: '',
    thirdChoiceOrientation: '',
    university: '',
    graduationYear: '',
    gpa10: '',
    gpa4: '',
    graduationMajor: '',
    degreeClassification: '',
    graduationSystem: '',
    supplementaryCert: 'Không',
    language: '',
    languageCertType: '',
    languageCertIssuer: '',
    languageScore: '',
    languageCertDate: '',
    researchAchievements: 'NCKH0',
    otherAchievements: 'KHAC0',
    priorityCategory: '0',
    scholarshipPolicy: 'Không',
    linkPhieuDangKy: '',
    linkSoYeuLyLich: '',
    linkMinhChungLePhi: '',
    linkAnhThe: '',
    linkBangTotNghiep: '',
    linkBangDiem: '',
    linkChungChiNN: '',
    linkGiayChungNhanBSKT: '',
    linkUuTien: '',
    linkNCKH: '',
  };

  const [formData, setFormData] = useState<ApplicationFormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitMessageType, setSubmitMessageType] = useState<'success' | 'error'>('error');
  const [errors, setErrors] = useState<Partial<Record<keyof ApplicationFormData, string>>>({});
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [errorSummaryList, setErrorSummaryList] = useState<{ key: keyof ApplicationFormData; label: string; message: string; }[]>([]);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [erroredSteps, setErroredSteps] = useState<Set<number>>(new Set());
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [scrollToField, setScrollToField] = useState<string | null>(null);
  
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftMessage, setDraftMessage] = useState({ text: '', type: 'success' as 'success' | 'error' });

  const dobRef = useRef<HTMLInputElement>(null);
  const idCardNumberRef = useRef<HTMLInputElement>(null);
  const idCardIssueDateRef = useRef<HTMLInputElement>(null);
  const idCardIssuePlaceRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const languageCertDateRef = useRef<HTMLInputElement>(null);
  const gpa10Ref = useRef<HTMLInputElement>(null);
  const gpa4Ref = useRef<HTMLInputElement>(null);
  const languageScoreRef = useRef<HTMLInputElement>(null);
  const pageTopRef = useRef<HTMLDivElement>(null);
  
  const majorNameToCodeMap = useMemo(() => MAJORS_DATA.reduce((acc, major) => ({ ...acc, [major.name]: major.code }), {} as Record<string, string>), []);
  
  const getSectionTitleById = (id: string) => SECTIONS.find(s => s.id === id)?.title || '';

  const documentsList = useMemo(() => [
    { key: 'linkPhieuDangKy', label: '1. Phiếu đăng ký dự tuyển', isRequired: () => true, description: "File PDF hoặc ảnh chụp rõ nét. (Tối đa 5MB)" },
    { key: 'linkSoYeuLyLich', label: '2. Sơ yếu lý lịch', description: "Có xác nhận của cơ quan công tác hoặc chính quyền địa phương. (PDF/JPG/PNG, Tối đa 5MB)", isRequired: () => true },
    { key: 'linkMinhChungLePhi', label: '3. Minh chứng về nộp lệ phí dự tuyển', description: "Ảnh chụp màn hình hoặc biên lai chuyển khoản. (PDF/JPG/PNG, Tối đa 5MB)", isRequired: () => true },
    { key: 'linkAnhThe', label: '4. Ảnh thẻ 4x6', isRequired: () => true, description: "Yêu cầu ảnh chụp rõ mặt, nền trắng. (JPG, PNG, PDF. Tối đa 5MB)" },
    { key: 'linkBangVaBangDiem_combined', label: '5. Bản scan Bằng tốt nghiệp và Bảng điểm đại học', isRequired: () => true, description: "Vui lòng gom Bằng tốt nghiệp và Bảng điểm vào một file PDF duy nhất để tải lên. (PDF, Tối đa 10MB)" },
    { key: 'linkChungChiNN', label: '6. Bản scan Chứng chỉ ngoại ngữ', isRequired: () => true, description: "File PDF hoặc ảnh chụp rõ nét, có công chứng. (JPG, PNG, PDF. Tối đa 5MB)" },
    { key: 'linkGiayChungNhanBSKT', label: '7. Giấy chứng nhận hoàn thành bổ sung kiến thức (nếu có)', isRequired: (data: ApplicationFormData) => data.supplementaryCert === 'Có', description: "File PDF hoặc ảnh chụp rõ nét. (JPG, PNG, PDF. Tối đa 5MB)" },
    { key: 'linkUuTien', label: '8. Minh chứng đối tượng ưu tiên (nếu có)', isRequired: (data: ApplicationFormData) => data.priorityCategory !== '0', description: "File PDF hoặc ảnh chụp các giấy tờ xác nhận. (JPG, PNG, PDF. Tối đa 5MB)" },
    { key: 'linkNCKH', label: '9. Minh chứng NCKH & thành tích khác (nếu có)', isRequired: (data: ApplicationFormData) => data.researchAchievements !== 'NCKH0' || data.otherAchievements !== 'KHAC0', description: "Gom các minh chứng vào một file PDF duy nhất để tải lên. (PDF, Tối đa 10MB)" }
  ], []);

  useEffect(() => {
    const targetStep = sessionStorage.getItem('targetStep');
    if (targetStep) {
      const stepNumber = parseInt(targetStep, 10);
      if (!isNaN(stepNumber) && stepNumber >= 1 && stepNumber <= STEPS.length) {
        setCurrentStep(stepNumber);
        
        const fieldToScroll = sessionStorage.getItem('scrollToField');
        if (fieldToScroll) {
          setScrollToField(fieldToScroll);
          sessionStorage.removeItem('scrollToField');
        }
      }
      sessionStorage.removeItem('targetStep');
    }
  }, []);

  useEffect(() => {
    const userToEditJson = sessionStorage.getItem('userToEdit');
    if ((user.role === 'admin' || user.role === 'sub-admin') && userToEditJson) {
      const userToEdit = JSON.parse(userToEditJson);
      setTargetUser({
        ...user,
        id: userToEdit.id,
        email: userToEdit.email,
        fullName: userToEdit.hoTen,
        phone: userToEdit.phone,
        role: 'applicant',
      });
    } else {
      setTargetUser(user);
    }
  }, [user]);

  useEffect(() => {
    if (currentStep === 5 && scrollToField) {
      const element = document.getElementById(`file-upload-wrapper-${scrollToField}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add highlight effect
        element.style.backgroundColor = 'rgba(253, 224, 71, 0.3)'; // yellow-200 with opacity
        element.style.transition = 'background-color 500ms ease-in-out';
        setTimeout(() => {
          element.style.backgroundColor = '';
        }, 2500);
      }
      setScrollToField(null); // Reset state after scrolling
    }
  }, [currentStep, scrollToField]);

  const SelectField = ({ label, id, error, options, placeholder, disabled, required, ...props }: any) => {
    const isObjectOptions = Array.isArray(options) && options.length > 0 && typeof options[0] === 'object' && 'label' in options[0] && 'value' in options[0];

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                id={id}
                disabled={disabled}
                {...props}
                className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {isObjectOptions ?
                    options.map((option: { label: string, value: string }) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    )) :
                    (Array.isArray(options) ? options.map((option: string) => (
                        <option key={option} value={option}>{option}</option>
                    )) : null)
                }
            </select>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
  };

  const getOrientationOptionsForMajor = (majorCode: string, facility: string) => {
    if (!majorCode || !facility) return [];
    const major = MAJORS_DATA.find(m => m.code === majorCode);
    if (!major || !major.availability[facility]) return [];

    const options = [];
    const availableOrientations = major.availability[facility];
    if (availableOrientations.includes('research')) {
        options.push({ value: 'research', label: 'Nghiên cứu' });
    }
    if (availableOrientations.includes('applied')) {
        options.push({ value: 'applied', label: 'Ứng dụng' });
    }
    return options;
  };

  const validateAllFields = (data: ApplicationFormData, context: 'ui' | 'submission' = 'ui') => {
    const newErrors: Partial<Record<keyof ApplicationFormData, string>> = {};
    
    const requiredFieldConfig: { key: keyof ApplicationFormData; label: string }[] = [
        { key: 'gender', label: 'Giới tính' },
        { key: 'dob', label: 'Ngày sinh' },
        { key: 'pob', label: 'Nơi sinh' },
        { key: 'ethnicity', label: 'Dân tộc' },
        { key: 'nationality', label: 'Quốc tịch' },
        { key: 'idCardNumber', label: 'Số CCCD' },
        { key: 'idCardIssueDate', label: 'Ngày cấp CCCD' },
        { key: 'idCardIssuePlace', label: 'Nơi cấp CCCD' },
        { key: 'contactAddress', label: 'Địa chỉ liên hệ' },
        { key: 'trainingFacility', label: 'Cơ sở đào tạo' },
        { key: 'firstChoiceMajor', label: 'Nguyện vọng 1' },
        { key: 'university', label: 'Trường tốt nghiệp đại học' },
        { key: 'graduationYear', label: 'Năm tốt nghiệp' },
        { key: 'gpa10', label: 'Điểm TB (hệ 10)' },
        { key: 'graduationMajor', label: 'Ngành tốt nghiệp' },
        { key: 'degreeClassification', label: 'Loại tốt nghiệp' },
        { key: 'graduationSystem', label: 'Hệ tốt nghiệp' },
        { key: 'supplementaryCert', label: 'Giấy chứng nhận hoàn thành bổ sung kiến thức' },
        { key: 'language', label: 'Ngoại ngữ' },
        { key: 'researchAchievements', label: 'Thành tích và giải thưởng nghiên cứu khoa học' },
        { key: 'otherAchievements', label: 'Các thành tích khác' },
        { key: 'priorityCategory', label: 'Thông tin về đối tượng ưu tiên' },
        { key: 'scholarshipPolicy', label: 'Chính sách học bổng' },
    ];

    requiredFieldConfig.forEach(({ key, label }) => {
        const value = data[key];
        if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
            if (!newErrors[key]) {
                const message = `${label} là trường bắt buộc.`;
                newErrors[key] = message;
            }
        }
    });

    // Explicit validation for documents
    if (!data.linkPhieuDangKy) newErrors.linkPhieuDangKy = 'Phiếu đăng ký dự tuyển là tài liệu bắt buộc.';
    if (!data.linkSoYeuLyLich) newErrors.linkSoYeuLyLich = 'Sơ yếu lý lịch là tài liệu bắt buộc.';
    if (!data.linkMinhChungLePhi) newErrors.linkMinhChungLePhi = 'Minh chứng lệ phí là tài liệu bắt buộc.';
    if (!data.linkAnhThe) newErrors.linkAnhThe = 'Ảnh thẻ 4x6 là tài liệu bắt buộc.';
    if (!data.linkBangTotNghiep) newErrors.linkBangTotNghiep = 'Bằng tốt nghiệp và Bảng điểm là tài liệu bắt buộc.';
    
    // Flexible requirements: show UI error, but allow submission
    if (context !== 'submission') {
      if (!data.linkChungChiNN) {
        newErrors.linkChungChiNN = 'Chứng chỉ ngoại ngữ là tài liệu bắt buộc.';
      }
      if (data.supplementaryCert === 'Có' && !data.linkGiayChungNhanBSKT) {
        newErrors.linkGiayChungNhanBSKT = 'Minh chứng Bổ sung kiến thức là tài liệu bắt buộc.';
      }
    }

    if (data.priorityCategory !== '0' && !data.linkUuTien) {
        newErrors.linkUuTien = 'Minh chứng đối tượng ưu tiên là tài liệu bắt buộc.';
    }
    if ((data.researchAchievements !== 'NCKH0' || data.otherAchievements !== 'KHAC0') && !data.linkNCKH) {
        newErrors.linkNCKH = 'Minh chứng NCKH & thành tích khác là tài liệu bắt buộc.';
    }

    const choices = [
        { major: data.firstChoiceMajor, orientation: data.firstChoiceOrientation },
        { major: data.secondChoiceMajor, orientation: data.secondChoiceOrientation },
        { major: data.thirdChoiceMajor, orientation: data.thirdChoiceOrientation },
    ];
    const choiceStrings = choices.map(c => (c.major && c.orientation) ? `${c.major}-${c.orientation}` : null);
    const seen = new Map<string, number>();
    const duplicateIndices = new Set<number>();

    choiceStrings.forEach((choice, index) => {
        if (choice) {
            if (seen.has(choice)) {
                duplicateIndices.add(seen.get(choice)!);
                duplicateIndices.add(index);
            } else {
                seen.set(choice, index);
            }
        }
    });

    if (duplicateIndices.size > 0) {
        const errorMsg = 'Nguyện vọng và định hướng này không được trùng lặp.';
        if (duplicateIndices.has(0)) newErrors.firstChoiceMajor = errorMsg;
        if (duplicateIndices.has(1)) newErrors.secondChoiceMajor = errorMsg;
        if (duplicateIndices.has(2)) newErrors.thirdChoiceMajor = errorMsg;
    }

    const choicesForOrientationCheck: { majorKey: keyof ApplicationFormData; orientationKey: keyof ApplicationFormData }[] = [
      { majorKey: 'firstChoiceMajor', orientationKey: 'firstChoiceOrientation' },
      { majorKey: 'secondChoiceMajor', orientationKey: 'secondChoiceOrientation' },
      { majorKey: 'thirdChoiceMajor', orientationKey: 'thirdChoiceOrientation' },
    ];

    choicesForOrientationCheck.forEach(({ majorKey, orientationKey }) => {
      if (newErrors[majorKey]) return;

      const majorCode = data[majorKey];
      const orientationValue = data[orientationKey];
      
      if (majorCode && !orientationValue) {
        const orientationOptions = getOrientationOptionsForMajor(majorCode, data.trainingFacility);
        if (orientationOptions.length > 1) {
          newErrors[majorKey] = 'Bạn phải chọn 1 định hướng cho ngành đã chọn.';
        }
      }
    });

    const isLowGraduation = ['TB', 'TBK', 'KXL'].includes(data.degreeClassification);
    const hasNoQualifyingPaper = !['NCKH3', 'NCKH4', 'NCKH5'].includes(data.researchAchievements);
    const researchOrientationError = "Nếu Bạn tốt nghiệp loại Trung bình hoặc Trung bình khá và chọn định hướng Nghiên cứu, bạn phải có bài báo khoa học.";

    if (isLowGraduation && hasNoQualifyingPaper) {
        if (data.firstChoiceOrientation === 'research') newErrors.firstChoiceMajor = researchOrientationError;
        if (data.secondChoiceOrientation === 'research') newErrors.secondChoiceMajor = researchOrientationError;
        if (data.thirdChoiceOrientation === 'research') newErrors.thirdChoiceMajor = researchOrientationError;
    }

    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (data.dob && !dateRegex.test(data.dob.trim())) newErrors.dob = 'Định dạng ngày phải là DD/MM/YYYY.';
    
    const cccdRegex = /^\d{12}$/;
    if (data.idCardNumber && !cccdRegex.test(data.idCardNumber.trim())) newErrors.idCardNumber = 'Số CCCD không hợp lệ. Vui lòng nhập đúng 12 chữ số.';

    if (data.idCardIssueDate && !dateRegex.test(data.idCardIssueDate.trim())) newErrors.idCardIssueDate = 'Định dạng ngày phải là DD/MM/YYYY.';

    const phoneRegex = /^\d{10}$/;
    if (data.phone && !phoneRegex.test(data.phone.trim())) newErrors.phone = 'Số điện thoại không hợp lệ. Vui lòng nhập đúng 10 chữ số.';
    
    if (data.languageCertDate && !dateRegex.test(data.languageCertDate.trim())) newErrors.languageCertDate = 'Định dạng ngày phải là DD/MM/YYYY.';

    const numericRegex = /^\d+(\.\d{1,2})?$/;
    
    if (data.languageScore) {
        if (data.languageScore.includes(',')) newErrors.languageScore = 'Vui lòng dùng dấu chấm "." cho số thập phân, không dùng dấu phẩy ",".';
        else if (!numericRegex.test(data.languageScore)) newErrors.languageScore = 'Điểm không hợp lệ. Dùng dấu "." và tối đa 2 chữ số thập phân.';
    }

    if (data.gpa10) {
        if (data.gpa10.includes(',')) newErrors.gpa10 = 'Vui lòng dùng dấu chấm "." cho số thập phân, không dùng dấu phẩy ",".';
        else if (!numericRegex.test(data.gpa10)) newErrors.gpa10 = 'Điểm không hợp lệ. Dùng dấu "." và tối đa 2 chữ số thập phân.';
        else {
            const gpa10Value = parseFloat(data.gpa10);
            if (gpa10Value < 0 || gpa10Value > 10) newErrors.gpa10 = 'Điểm hệ 10 phải từ 0 đến 10.';
        }
    }

    if (data.gpa4) {
        if (data.gpa4.includes(',')) newErrors.gpa4 = 'Vui lòng dùng dấu chấm "." cho số thập phân, không dùng dấu phẩy ",".';
        else if (!numericRegex.test(data.gpa4)) newErrors.gpa4 = 'Điểm không hợp lệ. Dùng dấu "." và tối đa 2 chữ số thập phân.';
        else {
            const gpa4Value = parseFloat(data.gpa4);
            if (gpa4Value < 0 || gpa4Value > 4) newErrors.gpa4 = 'Điểm hệ 4 phải từ 0 đến 4.';
        }
    }
    
    const finalErrorSummary = Object.entries(newErrors).map(([key, message]) => ({
      key: key as keyof ApplicationFormData,
      label: keyToHeaderMap[key as keyof ApplicationFormData] || key,
      message: message as string,
    }));

    return { newErrors, finalErrorSummary, isValid: Object.keys(newErrors).length === 0 };
  }


  useEffect(() => {
    const fetchApplicationData = async () => {
        if (!targetUser || !targetUser.id) return;

        setIsFetchingData(true);
        setSubmitMessage(''); 
        try {
            const payload = {
                action: 'getApplicationData',
                id: targetUser.id,
                email: targetUser.email,
            };
            
            const result = await apiCall(payload);

            if (result.success && result.data && Object.keys(result.data).length > 1) {
                const sheetData = result.data;
                const newFormData = { ...initialFormState, fullName: targetUser.fullName, email: targetUser.email, phone: targetUser.phone };

                for (const header in sheetData) {
                    const key = headerToKeyMap[header];
                    if (key && sheetData[header] !== null && sheetData[header] !== undefined && sheetData[header] !== '') {
                        const rawValue = sheetData[header];
                        let processedValue: any;
    
                        if (key === 'firstChoiceMajor' || key === 'secondChoiceMajor' || key === 'thirdChoiceMajor') {
                            const rawValueStr = rawValue.toString();
                            const isCode = MAJORS_DATA.some(m => m.code === rawValueStr);
                            if (isCode) {
                                processedValue = rawValueStr;
                            } else {
                                processedValue = majorNameToCodeMap[rawValueStr] || '';
                            }
                        } else if (key === 'degreeClassification') {
                            processedValue = degreeReverseMap[rawValue] || rawValue.toString();
                        } else if (key === 'graduationSystem') {
                            processedValue = graduationSystemReverseMap[rawValue] || rawValue.toString();
                        } else if (key === 'language') {
                            processedValue = languageReverseMap[rawValue] || rawValue.toString();
                        } else if (key === 'languageCertType') {
                            processedValue = languageCertTypeReverseMap[rawValue] || rawValue.toString();
                        } else if (key === 'priorityCategory') {
                            processedValue = priorityCategoryReverseMap[rawValue] || rawValue.toString();
                        } else if (key === 'scholarshipPolicy') {
                            processedValue = scholarshipReverseMap[rawValue] || rawValue.toString();
                        } else if (key === 'researchAchievements') {
                            const allAchievementsReverseMap = {...researchAchievementsReverseMap, ...otherAchievementsReverseMap};
                            const mappedValue = allAchievementsReverseMap[rawValue] || rawValue.toString();
                            if (RESEARCH_ACHIEVEMENT_CATEGORIES.some(o => o.value === mappedValue)) {
                                processedValue = mappedValue;
                            } else if (OTHER_ACHIEVEMENT_CATEGORIES.some(o => o.value === mappedValue)) {
                                (newFormData as any)['otherAchievements'] = mappedValue;
                                processedValue = 'NCKH0';
                            } else {
                                processedValue = rawValue.toString();
                            }
                        } else if (key === 'otherAchievements') {
                            processedValue = otherAchievementsReverseMap[rawValue] || rawValue.toString();
                        } else if (key.includes('Orientation')) {
                            processedValue = mapOrientationFromSheet(rawValue.toString());
                        } else if (key === 'dob' || key === 'idCardIssueDate' || key === 'languageCertDate') {
                            processedValue = formatDateFromISO(rawValue.toString());
                        } else {
                            const valueStr = rawValue.toString();
                            if (valueStr.toUpperCase().startsWith('=HYPERLINK')) {
                                const urlMatch = valueStr.match(/=HYPERLINK\s*\(\s*"([^"]+)"/i);
                                if (urlMatch && urlMatch[1]) {
                                    processedValue = urlMatch[1];
                                } else {
                                    processedValue = valueStr;
                                }
                            } else {
                                processedValue = valueStr.startsWith("'") ? valueStr.substring(1) : valueStr;
                            }
                        }
                        (newFormData as any)[key] = processedValue;
                    }
                }
                setFormData(newFormData);

                const { newErrors } = validateAllFields(newFormData);
                const erroredStepsOnLoad = new Set<number>();
                Object.keys(newErrors).forEach(fieldKey => {
                    const sectionId = FIELD_TO_SECTION_MAP[fieldKey as keyof ApplicationFormData];
                    if (sectionId) {
                        const step = SECTION_TO_STEP_MAP[sectionId];
                        if (step) {
                            erroredStepsOnLoad.add(step);
                        }
                    }
                });
                
                const allSteps = new Set(STEPS.map(s => s.step).filter(s => s < 6));
                const completedStepsOnLoad = new Set([...allSteps].filter(x => !erroredStepsOnLoad.has(x)));

                setCompletedSteps(completedStepsOnLoad);
                setErroredSteps(erroredStepsOnLoad);
                setIsUpdateMode(true);
            } else {
                setFormData({ ...initialFormState, fullName: targetUser.fullName, email: targetUser.email, phone: targetUser.phone });
                setIsUpdateMode(false);
            }
        } catch (error: any) {
            console.error("Failed to fetch application data:", error);
            setSubmitMessage(`Không thể tải dữ liệu hồ sơ: ${error.message}. Bạn có thể điền mới hoặc thử lại sau.`);
            setSubmitMessageType('error');
            setIsUpdateMode(false);
        } finally {
            setIsFetchingData(false);
        }
    };
    
    fetchApplicationData();
  }, [targetUser, majorNameToCodeMap, documentsList]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setErrorSummaryList([]);
    const { name, value } = e.target;
    
    setFormData(prev => {
        const newState = { ...prev, [name]: value };

        if (name === 'trainingFacility') {
            newState.firstChoiceMajor = '';
            newState.firstChoiceOrientation = '';
            newState.secondChoiceMajor = '';
            newState.secondChoiceOrientation = '';
            newState.thirdChoiceMajor = '';
            newState.thirdChoiceOrientation = '';
        }

        if (name.endsWith('Major')) {
            const orientationField = name.replace('Major', 'Orientation') as keyof ApplicationFormData;
            const majorCode = value;
            const orientationOptions = getOrientationOptionsForMajor(majorCode, newState.trainingFacility);
            newState[orientationField] = '';
            if (orientationOptions.length === 1) {
                newState[orientationField] = orientationOptions[0].value as 'research' | 'applied';
            }
        }
        
        return newState;
    });

    if (errors[name as keyof ApplicationFormData]) {
      setErrors(prev => ({...prev, [name]: ''}));
    }
  };
  
  const handleFileUploadComplete = (field: keyof ApplicationFormData, url: string) => {
    setFormData(prev => ({
        ...prev,
        [field]: url,
    }));
  };

  const handleFileDelete = (field: keyof ApplicationFormData) => {
      setFormData(prev => ({
          ...prev,
          [field]: '',
      }));
  };

  const handleNumericBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if ((name === 'gpa10' || name === 'gpa4' || name === 'languageScore') && value) {
      const parsed = parseFloat(value.replace(',', '.'));
      if (!isNaN(parsed)) {
        setFormData(prev => ({ ...prev, [name]: parsed.toFixed(2) }));
      }
    }
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value as 'research' | 'applied' }));
  };
  
  const availableMajorsForFacility = useMemo(() => {
    if (!formData.trainingFacility) return [];
    return MAJORS_DATA
        .filter(major => major.availability[formData.trainingFacility])
        .map(major => ({ label: major.name, value: major.code }));
  }, [formData.trainingFacility]);

  const isLimitedFacility = useMemo(() => ['Gia Lai', 'Long An'].includes(formData.trainingFacility), [formData.trainingFacility]);

  const validateCurrentStep = () => {
    const currentStepConfig = STEPS.find(s => s.step === currentStep);
    if (!currentStepConfig) return true;
  
    const { newErrors } = validateAllFields(formData, 'ui');
    
    const stepErrors: Partial<Record<keyof ApplicationFormData, string>> = {};
    let hasBlockingError = false;
  
    currentStepConfig.sections.forEach(sectionId => {
        (Object.keys(FIELD_TO_SECTION_MAP) as (keyof ApplicationFormData)[]).forEach(field => {
            if (FIELD_TO_SECTION_MAP[field] === sectionId && newErrors[field as keyof ApplicationFormData]) {
                stepErrors[field as keyof ApplicationFormData] = newErrors[field as keyof ApplicationFormData];
  
                // Flexible documents (NN, BSKT) don't block navigation from step 5.
                const isFlexibleDocumentError = currentStep === 5 && (field === 'linkChungChiNN' || field === 'linkGiayChungNhanBSKT');
                if (!isFlexibleDocumentError) {
                    hasBlockingError = true;
                }
            }
        });
    });
  
    setErrors(stepErrors);
    if (hasBlockingError) {
        pageTopRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    return !hasBlockingError;
  };
  
  const handleNext = () => {
    if (validateCurrentStep()) {
        setErroredSteps(prev => {
            const newSet = new Set(prev);
            newSet.delete(currentStep);
            return newSet;
        });
        setCompletedSteps(prev => new Set(prev).add(currentStep));
        setCurrentStep(prev => prev + 1);
        pageTopRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
        setErroredSteps(prev => new Set(prev).add(currentStep));
    }
  };

  const handleBack = () => {
      setCurrentStep(prev => prev - 1);
      pageTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const goToStep = (step: number) => {
    setCurrentStep(step);
    pageTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSupplementClick = (fieldKey: string) => {
    setCurrentStep(5);
    setScrollToField(fieldKey);
  };

  const handleSaveDraft = async () => {
    if (!targetUser) {
        setDraftMessage({ text: 'Lỗi: Không xác định được người dùng.', type: 'error' });
        return;
    }
    setIsSavingDraft(true);
    setDraftMessage({ text: '', type: 'success' });

    const payload: { [key: string]: any } = {
        action: 'submitApplication', // Fix: Use the valid 'submitApplication' action for saving drafts.
        client_version: '2.0.1'
    };

    (Object.keys(formData) as Array<keyof ApplicationFormData>).forEach(key => {
        const headerName = keyToHeaderMap[key];
        if (headerName) {
            let value = formData[key];
            if (key.endsWith('Orientation')) {
                value = value === 'research' ? 'Nghiên cứu' : value === 'applied' ? 'Ứng dụng' : '';
            }
            if ((key === 'phone' || key === 'idCardNumber') && typeof value === 'string') {
                value = value ? `'${value.trim()}` : '';
            }
            payload[headerName] = value;
        }
    });

    const now = new Date();
    const timestamp = `'${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    payload['Thời gian cập nhật cuối'] = timestamp;

    payload['Người cập nhật cuối'] = user.email;
    payload['Vai trò người cập nhật'] = user.role;
    payload.id = targetUser.id;
    payload.email = targetUser.email;

    try {
        const result = await apiCall(payload);
        if (result.status === 'success' || result.success) {
            setDraftMessage({ text: 'Đã lưu bản nháp thành công!', type: 'success' });
        } else {
            let errorMessage = result.message || 'Lưu nháp thất bại.';
            if (errorMessage.includes('Đã hết hạn nộp hồ sơ là ngày')) {
                errorMessage = errorMessage.replace('là ngày', 'vào lúc');
            }
            setDraftMessage({ text: `Lưu nháp thất bại: ${errorMessage}`, type: 'error' });
        }
    } catch (error: any) {
        console.error('Save draft error:', error);
        setDraftMessage({ text: `Đã có lỗi mạng xảy ra khi lưu nháp: ${error.message}.`, type: 'error' });
    } finally {
        setIsSavingDraft(false);
        setTimeout(() => {
            setDraftMessage({ text: '', type: 'success' });
        }, 5000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser) {
        setSubmitMessage('Lỗi: Không xác định được người dùng để lưu hồ sơ.');
        setSubmitMessageType('error');
        return;
    }
    setIsSubmitting(true);
    setSubmitMessage('');
    setErrors({});
    setErrorSummaryList([]);
    setErroredSteps(new Set());
    
    // First, validate against 'submission' rules to see if we can proceed.
    const submissionValidation = validateAllFields(formData, 'submission');
  
    // If submission validation fails, it means there are blocking errors.
    if (!submissionValidation.isValid) {
        // For display, get all UI errors (including non-blocking ones).
        const uiValidation = validateAllFields(formData, 'ui');
        setErrors(uiValidation.newErrors);
        setErrorSummaryList(uiValidation.finalErrorSummary);
  
        // Update errored steps based on all UI errors.
        const newErroredSteps = new Set<number>();
        Object.keys(uiValidation.newErrors).forEach(fieldKey => {
            const sectionId = FIELD_TO_SECTION_MAP[fieldKey as keyof ApplicationFormData];
            if (sectionId) {
                const step = SECTION_TO_STEP_MAP[sectionId];
                if (step) {
                    newErroredSteps.add(step);
                }
            }
        });
        setErroredSteps(newErroredSteps);
  
        setIsSubmitting(false);
        pageTopRef.current?.scrollIntoView({ behavior: 'smooth' });
        return; // Stop the submission.
    }
    
    const payload: { [key: string]: any } = {
        action: 'submitApplication',
        client_version: '2.0.1'
    };

    (Object.keys(formData) as Array<keyof ApplicationFormData>).forEach(key => {
        const headerName = keyToHeaderMap[key];
        if (headerName) {
            let value = formData[key];
            if (key.endsWith('Orientation')) {
                value = value === 'research' ? 'Nghiên cứu' : value === 'applied' ? 'Ứng dụng' : '';
            }
            if ((key === 'phone' || key === 'idCardNumber') && typeof value === 'string') {
                value = value ? `'${value.trim()}` : '';
            }
            
            payload[headerName] = value;
        }
    });
    
    const now = new Date();
    const timestamp = `'${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    payload['Thời gian cập nhật cuối'] = timestamp;

    payload['Người cập nhật cuối'] = user.email;
    payload['Vai trò người cập nhật'] = user.role;
    payload.id = targetUser.id;
    payload.email = targetUser.email;

    try {
        const result = await apiCall(payload);
        
        if (result.status === 'success' || result.success) {
            setSubmitMessage("Hồ sơ của bạn đã được nộp thành công! Vui lòng kiểm tra trang 'Trạng thái hồ sơ' để theo dõi tiến trình.");
            setSubmitMessageType('success');
        } else {
            let errorMessage = result.message || 'Lỗi không xác định';
            if (errorMessage.includes('Đã hết hạn nộp hồ sơ là ngày')) {
                errorMessage = errorMessage.replace('là ngày', 'vào lúc');
            }
            setSubmitMessage(`Lưu thông tin thất bại: ${errorMessage}`);
            setSubmitMessageType('error');
        }
    } catch (error: any) {
        console.error('Application submission error:', error);
        setSubmitMessage(`Đã có lỗi mạng xảy ra khi lưu thông tin: ${error.message}. Vui lòng kiểm tra lại đường truyền và thử lại.`);
        setSubmitMessageType('error');
    } finally {
        setIsSubmitting(false);
        pageTopRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handlePrint = () => {
    if (!targetUser) return;
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();

    const checkedBox = '&#9746;';
    const uncheckedBox = '&#9744;';

    const getMajorName = (code: string) => MAJORS_DATA.find(m => m.code === code)?.name || code || '';
    const getOrientationLabel = (value: string) => {
      if (value === 'research') return 'Nghiên cứu';
      if (value === 'applied') return 'Ứng dụng';
      return '';
    };
    const getDegreeLabel = (value: string) => DEGREE_CLASSIFICATIONS.find(o => o.value === value)?.label || value || '';
    const getGradSystemLabel = (value: string) => GRADUATION_SYSTEMS.find(o => o.value === value)?.label || value || '';
    const getLanguageLabel = (value: string) => LANGUAGES.find(o => o.value === value)?.label || value || '';
    const getLanguageCertLabel = (value: string) => LANGUAGE_CERT_TYPES.find(o => o.value === value)?.label || value || '';
    const getPriorityLabel = (value: string) => PRIORITY_CATEGORIES.find(o => o.value === value)?.label || value || '';
    const getResearchAchievementLabel = (value: string) => RESEARCH_ACHIEVEMENT_CATEGORIES.find(o => o.value === value)?.label || value || '';
    const getOtherAchievementLabel = (value: string) => OTHER_ACHIEVEMENT_CATEGORIES.find(o => o.value === value)?.label || value || '';

    const numberToVietnameseWords = (numStr: string): string => {
        if (!numStr || typeof numStr !== 'string' || !numStr.trim()) return '';
        const sanitizedNumStr = numStr.replace(',', '.');
        if (isNaN(parseFloat(sanitizedNumStr))) return '';

        const units = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

        const readTwoDigits = (twoDigits: string): string => {
            const num = parseInt(twoDigits, 10);
            if (num === 0) return 'không';
            if (num < 10) return units[num];
            
            const ten = Math.floor(num / 10);
            const unit = num % 10;
            
            let str = '';
            if (ten === 1) {
                str = 'mười';
                if (unit === 5) str += ' lăm';
                else if (unit !== 0) str += ' ' + units[unit];
            } else {
                str = units[ten] + ' mươi';
                if (unit === 1) str += ' mốt';
                else if (unit === 5) str += ' lăm';
                else if (unit !== 0) str += ' ' + units[unit];
            }
            return str;
        };

        const readThreeDigits = (threeDigits: string): string => {
            const num = parseInt(threeDigits, 10);
            if (num === 0 && threeDigits.length === 1) return 'không';
            if (num < 100) return readTwoDigits(String(num));
            
            const hundred = Math.floor(num / 100);
            const remainder = num % 100;
            let str = units[hundred] + ' trăm';
            
            if (remainder > 0) {
                if (remainder < 10) {
                    str += ' linh ' + units[remainder];
                } else {
                    str += ' ' + readTwoDigits(String(remainder));
                }
            }
            return str;
        };

        const [integerPart, decimalPart] = sanitizedNumStr.split('.');
        
        let integerWords = readThreeDigits(integerPart);

        if (decimalPart === undefined) {
            return integerWords;
        }

        let decimalWords = '';
        for (const digit of decimalPart) {
            const digitNum = parseInt(digit, 10);
            if (!isNaN(digitNum) && digitNum >= 0 && digitNum <= 9) {
                decimalWords += units[digitNum] + ' ';
            }
        }
        
        decimalWords = decimalWords.trim();
        
        return `${integerWords} chấm ${decimalWords}`;
    };

    const gpa10Words = formData.gpa10 ? `(bằng chữ: ${numberToVietnameseWords(formData.gpa10)})` : '';
    const gpa4Words = formData.gpa4 ? `(bằng chữ: ${numberToVietnameseWords(formData.gpa4)})` : '';
    const languageScoreWords = formData.languageScore ? `(bằng chữ: ${numberToVietnameseWords(formData.languageScore)})` : '';

    const content = `
    <html>
      <head>
        <title>Phiếu Đăng ký dự tuyển</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; color: #000; margin: 0; padding: 0; line-height: 1.15; }
          .page-container { width: 210mm; min-height: 297mm; padding: 0.5in; margin: 0 auto; box-sizing: border-box; position: relative; }
          .header, .title { text-align: center; }
          .header { margin-bottom: 0.5em; line-height: 1.2; }
          .title { font-weight: bold; font-size: 13pt; margin-bottom: 0.5em; margin-top: 1em; }
          .section-title { font-weight: bold; margin-top: 0.5em; margin-bottom: 0.2em; }
          .section-content { padding-left: 1.5em; }
          p { margin-top: 0.5em; margin-bottom: 0.5em; }
          .data { font-weight: bold; }
          .signature-block { float: right; width: 45%; text-align: center; margin-top: 1em; }
          .signature-block .date { font-style: italic; }
          .signature-block .role { font-weight: bold; }
          .signature-block .name-placeholder { margin-top: 40px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 0.2em; }
          td { padding: 0 4px 0 0; vertical-align: top; }
          .checkbox-label { margin-left: 5px; margin-right: 15px; }
          .full-width { display: block; margin-bottom: 0.2em; }
          .footer-id { position: absolute; bottom: 0.5in; left: 0.5in; }
          @media print { @page { size: A4; margin: 0.3in; } body, .page-container { margin: 0; padding: 0; width: auto; min-height: 0; } .footer-id { position: fixed; bottom: 0.1in; left: 0.3in; } }
        </style>
      </head>
      <body>
        <div class="page-container">
          <div class="header"><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br/><strong><u>Độc lập – Tự do – Hạnh phúc</u></strong></div>
          <div class="title">PHIẾU ĐĂNG KÝ DỰ TUYỂN TRÌNH ĐỘ THẠC SĨ NĂM 2026</div>
          <div class="section-title">I. Thông tin về người dự tuyển</div>
          <div class="section-content">
            <table>
                <tr><td style="width:50%;">1. Họ và tên: <span class="data">${formData.fullName}</span></td><td>2. Giới tính: <span class="data">${formData.gender}</span></td></tr>
                <tr><td>3. Sinh ngày: <span class="data">${formData.dob}</span></td><td>4. Nơi sinh: <span class="data">${formData.pob}</span></td></tr>
                <tr><td>5. Dân tộc: <span class="data">${formData.ethnicity}</span></td><td>6. Quốc tịch: <span class="data">${formData.nationality}</span></td></tr>
                <tr><td>7. Số CCCD: <span class="data">${formData.idCardNumber}</span></td><td>8. Thời gian cấp: <span class="data">${formData.idCardIssueDate}</span></td></tr>
            </table>
            <div class="full-width">9. Nơi cấp: <span class="data">${formData.idCardIssuePlace}</span></div>
            <table><tr><td style="width:50%;">10. Điện thoại: <span class="data">${formData.phone}</span></td><td>11. Email: <span class="data">${formData.email}</span></td></tr></table>
            <div class="full-width">12. Địa chỉ liên hệ: <span class="data">${formData.contactAddress}</span></div>
            <div class="full-width">13. Cơ quan công tác: <span class="data">${formData.workplace || 'Không'}</span></div>
          </div>
          <div class="section-title">II. Thông tin về cơ sở đào tạo, nguyện vọng đăng ký ngành dự tuyển và chương trình đào tạo</div>
          <div class="section-content">
            <div class="full-width">Cơ sở đào tạo tại: <span class="data">${formData.trainingFacility}</span></div>
            <table>
                <tr><td style="width: 70%;">1. NV1: <span class="data">${getMajorName(formData.firstChoiceMajor)}</span></td><td style="padding-left: 0.5cm;">Định hướng: <span class="data">${getOrientationLabel(formData.firstChoiceOrientation)}</span></td></tr>
                <tr><td style="width: 70%;">2. NV2: <span class="data">${getMajorName(formData.secondChoiceMajor)}</span></td><td style="padding-left: 0.5cm;">Định hướng: <span class="data">${getOrientationLabel(formData.secondChoiceOrientation)}</span></td></tr>
                <tr><td style="width: 70%;">3. NV3: <span class="data">${getMajorName(formData.thirdChoiceMajor)}</span></td><td style="padding-left: 0.5cm;">Định hướng: <span class="data">${getOrientationLabel(formData.thirdChoiceOrientation)}</span></td></tr>
            </table>
          </div>
          <div class="section-title">III. Thông tin về văn bằng</div>
          <div class="section-content">
            <div>1. Văn bằng đại học: ${formData.graduationYear ? checkedBox : uncheckedBox} <span class="checkbox-label">Đã tốt nghiệp</span> ${!formData.graduationYear ? checkedBox : uncheckedBox} <span class="checkbox-label">Đã đủ điều kiện công nhận tốt nghiệp</span> ${uncheckedBox} <span class="checkbox-label">Khác</span></div>
            <div>Cơ sở cấp: <span class="data">${formData.university}</span><span style="display:inline-block; width: 50px;"></span>Năm tốt nghiệp: <span class="data">${formData.graduationYear}</span></div>
            <div>Điểm trung bình chung: <span class="data">${formData.gpa10 || '...'}</span>/10 ${gpa10Words} hoặc <span class="data">${formData.gpa4 || '...'}</span>/4 ${gpa4Words}</div>
            <table>
                <tr><td style="width:50%;">Ngành tốt nghiệp: <span class="data">${formData.graduationMajor}</span></td><td>Loại tốt nghiệp: <span class="data">${getDegreeLabel(formData.degreeClassification)}</span></td></tr>
                <tr><td colspan="2">Hình thức đào tạo: <span class="data">${getGradSystemLabel(formData.graduationSystem)}</span></td></tr>
            </table>
            <div>2. Giấy chứng nhận hoàn thành chương trình bổ sung kiến thức ngành: ${formData.supplementaryCert === 'Có' ? checkedBox : uncheckedBox} <span class="checkbox-label">Có</span> ${formData.supplementaryCert === 'Không' ? checkedBox : uncheckedBox} <span class="checkbox-label">Không</span></div>
          </div>
          <div class="section-title">IV. Thông tin về năng lực ngoại ngữ: ${formData.language ? checkedBox : uncheckedBox} <span class="checkbox-label">Đáp ứng về NLNN</span> ${uncheckedBox} <span class="checkbox-label">Thi đánh giá NLNN</span></div>
          <div class="section-content">
            <div>1. Đối với văn bằng của Trường ĐHSP Tp.HCM: ${uncheckedBox} Đã tốt nghiệp ${uncheckedBox} Đã đủ điều kiện công nhận tốt nghiệp ${uncheckedBox} Khác</div>
            <div>2. Đối với chứng chỉ: ${formData.languageCertType ? checkedBox : uncheckedBox} <span class="checkbox-label">Đã có chứng chỉ</span> ${!formData.languageCertType ? checkedBox : uncheckedBox} <span class="checkbox-label">Đã đủ điều kiện cấp chứng chỉ</span> ${uncheckedBox} <span class="checkbox-label">Khác</span></div>
            <table><tr><td style="width:40%;">Ngoại ngữ: <span class="data">${getLanguageLabel(formData.language)}</span></td><td>Loại bằng/Chứng chỉ: <span class="data">${getLanguageCertLabel(formData.languageCertType)}</span></td></tr></table>
            <div>Điểm ngoại ngữ: <span class="data">${formData.languageScore || '...'}</span> ${languageScoreWords}</div>
            <table><tr><td style="width:50%;">Ngày cấp: <span class="data">${formData.languageCertDate}</span></td><td>Cơ sở cấp: <span class="data">${formData.languageCertIssuer}</span></td></tr></table>
          </div>
          <div class="section-title">V. Thông tin về điểm thưởng</div>
          <div class="section-content">
            <p>1. Thành tích và giải thưởng nghiên cứu khoa học: <span class="data">${getResearchAchievementLabel(formData.researchAchievements)}</span></p>
            <div>Trong đó: ${uncheckedBox} <span class="checkbox-label">Tác giả chính hoặc chủ nhiệm đề tài</span> ${uncheckedBox} <span class="checkbox-label">Đồng tác giả hoặc thành viên đề tài</span></div>
            <p>2. Các thành tích khác: <span class="data">${getOtherAchievementLabel(formData.otherAchievements)}</span></p>
          </div>
          <div class="section-title">VI. Thông tin về đối tượng ưu tiên: <span class="data">${getPriorityLabel(formData.priorityCategory)}</span></div>
          <p style="margin-top: 1em; text-align: justify; line-height: 1.3;">Tôi xin cam kết chấp hành đúng Quy chế Tuyển sinh và đào tạo trình độ thạc sĩ hiện hành. Những lời khai trên của tôi là đúng sự thật, nếu có sai sót tôi xin chịu hoàn toàn trách nhiệm./.</p>
          <div class="signature-block">
              <div class="date">Thành phố Hồ Chí Minh, ngày ${day} tháng ${month} năm ${year}</div>
              <div class="role">Người dự tuyển</div>
              <em>(Ký tên, ghi rõ họ và tên)</em>
              <div class="name-placeholder"><span class="data">${formData.fullName}</span></div>
          </div>
          <div style="clear: both;"></div>
          <div class="footer-id">ID: <span class="data">${targetUser.id}</span></div>
        </div>
      </body>
    </html>`;
    
    const printWindow = window.open('', '_blank', 'height=800,width=800');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } else {
      alert('Vui lòng cho phép cửa sổ pop-up để in hồ sơ.');
    }
  };

  const handleQrCodeClick = () => {
    if (!formData.phone || !formData.fullName) {
      alert('Vui lòng điền đầy đủ Họ và tên và Số điện thoại trong hồ sơ để tạo mã QR.');
      return;
    }
    const noiDung = `XTSDH26 ${formData.phone.trim()} ${formData.fullName.trim()}`;
    const url = `https://tracuu.hcmue.edu.vn/vietqr?bank=VCB&sotien=750000&noidung=${encodeURIComponent(noiDung)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!targetUser) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="flex items-center gap-3 text-lg text-gray-700">
                <svg className="animate-spin h-6 w-6 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Đang khởi tạo...</span>
            </div>
        </div>
    );
  }

  const getDisplayValue = (key: string, value: any): string => {
      if (!value) return '';
      switch(key) {
          case 'gender': return value;
          case 'firstChoiceOrientation':
          case 'secondChoiceOrientation':
          case 'thirdChoiceOrientation':
              return value === 'research' ? 'Nghiên cứu' : value === 'applied' ? 'Ứng dụng' : '';
          case 'firstChoiceMajor':
          case 'secondChoiceMajor':
          case 'thirdChoiceMajor':
              return MAJORS_DATA.find(m => m.code === value)?.name || value;
          case 'degreeClassification':
              return DEGREE_CLASSIFICATIONS.find(o => o.value === value)?.label || value;
          case 'graduationSystem':
              return GRADUATION_SYSTEMS.find(o => o.value === value)?.label || value;
          case 'language':
              return LANGUAGES.find(o => o.value === value)?.label || value;
          case 'languageCertType':
              return LANGUAGE_CERT_TYPES.find(o => o.value === value)?.label || value;
          case 'priorityCategory':
              return PRIORITY_CATEGORIES.find(o => o.value === value)?.label || value;
          case 'scholarshipPolicy':
              return SCHOLARSHIP_POLICIES.find(o => o.value === value)?.label || value;
          case 'researchAchievements':
              return RESEARCH_ACHIEVEMENT_CATEGORIES.find(o => o.value === value)?.label || value;
          case 'otherAchievements':
              return OTHER_ACHIEVEMENT_CATEGORIES.find(o => o.value === value)?.label || value;
          default:
              return String(value);
      }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col" ref={pageTopRef}>
       <header className="bg-sky-100 text-slate-800 shadow-sm w-full sticky top-0 z-50 border-b border-sky-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
            <div className="flex items-center gap-3">
                <AcademicCapIcon className="w-8 h-8 text-sky-700" />
                <span className="text-xl font-bold text-slate-800 hidden sm:block">Hồ sơ dự tuyển</span>
            </div>
            <nav className="flex items-center gap-2">
                <button
                    onClick={() => navigate(Page.Help)}
                    className="px-4 py-2 text-sky-700 font-semibold rounded-md hover:bg-sky-200/60 transition-colors text-sm"
                >
                    Hướng dẫn
                </button>
                <span className="text-slate-600 hidden md:block">Xin chào, <span className="font-semibold">{user.fullName}</span>!</span>
                <button onClick={navigateBack} className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition-colors text-sm">
                  {user.role === 'admin' || user.role === 'sub-admin' ? 'Về Bảng điều khiển' : 'Về Trang chủ'}
                </button>
                {(user.role === 'admin' || user.role === 'sub-admin') && (
                  <button onClick={() => navigate(Page.AdminDashboard)} className="px-4 py-2 bg-slate-600 text-white font-semibold rounded-md hover:bg-slate-700 transition-colors text-sm">Admin</button>
                )}
                <button onClick={onLogout} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors text-sm">Đăng xuất</button>
            </nav>
            </div>
        </div>
        </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
        <div className="max-w-4xl mx-auto">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md relative">
                {isFetchingData && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                    <div className="flex items-center gap-3 text-lg text-gray-700">
                    <svg className="animate-spin h-6 w-6 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>Đang tải dữ liệu hồ sơ...</span>
                    </div>
                </div>
                )}
                
                <ApplicationFormStepper 
                    steps={STEPS}
                    currentStep={currentStep}
                    erroredSteps={erroredSteps}
                    completedSteps={completedSteps}
                    onStepClick={goToStep}
                    isUpdateMode={isUpdateMode}
                />

                {(errorSummaryList.length > 0 && currentStep === 6) && (
                  <div className="mb-6 p-4 border border-red-300 bg-red-50 rounded-md">
                      <div className="flex items-start gap-3">
                          <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                              <h3 className="font-bold text-red-800">Vui lòng kiểm tra lại các mục sau:</h3>
                              <ul className="mt-2 list-disc list-inside text-sm text-red-700 space-y-1">
                                  {errorSummaryList.map(error => (
                                      <li key={error.key}><span className="font-semibold">{error.label}:</span> {error.message}</li>
                                  ))}
                              </ul>
                          </div>
                      </div>
                  </div>
                )}

                {submitMessage && (
                <div className="mb-6">
                    <Alert type={submitMessageType} message={submitMessage} onClose={() => setSubmitMessage('')} />
                </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {currentStep === 1 && (
                      <section aria-labelledby="section-1-heading">
                          <div className="bg-sky-50 p-3 rounded-t-lg border border-sky-200 flex items-center gap-3">
                              <UserCircleIcon className="w-6 h-6 text-sky-700" />
                              <h2 id="section-1-heading" className="text-lg font-bold text-sky-800">I. Thông tin người dự tuyển</h2>
                          </div>
                          <div className="p-6 border-x border-b border-sky-200 rounded-b-lg">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  <InputField label="Họ và tên" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} disabled />
                                  <SelectField label="Giới tính" id="gender" name="gender" value={formData.gender} onChange={handleChange} options={GENDERS} placeholder="Chọn giới tính" required error={errors.gender} />
                                  <InputField ref={dobRef} label="Ngày sinh" id="dob" name="dob" type="text" placeholder="DD/MM/YYYY" value={formData.dob} onChange={handleChange} required error={errors.dob} />
                                  <SelectField label="Nơi sinh" id="pob" name="pob" value={formData.pob} onChange={handleChange} options={CITIES} placeholder="Chọn nơi sinh" required error={errors.pob} />
                                  <SelectField label="Dân tộc" id="ethnicity" name="ethnicity" value={formData.ethnicity} onChange={handleChange} options={ETHNICITIES} placeholder="Chọn dân tộc" required error={errors.ethnicity} />
                                  <SelectField label="Quốc tịch" id="nationality" name="nationality" value={formData.nationality} onChange={handleChange} options={NATIONALITIES} placeholder="Chọn quốc tịch" required error={errors.nationality}/>
                                  <InputField ref={idCardNumberRef} label="Số CCCD" id="idCardNumber" name="idCardNumber" value={formData.idCardNumber} onChange={handleChange} required error={errors.idCardNumber} />
                                  <InputField ref={idCardIssueDateRef} label="Ngày cấp CCCD" id="idCardIssueDate" name="idCardIssueDate" type="text" placeholder="DD/MM/YYYY" value={formData.idCardIssueDate} onChange={handleChange} required error={errors.idCardIssueDate} />
                                  <InputField ref={idCardIssuePlaceRef} label="Nơi cấp CCCD" id="idCardIssuePlace" name="idCardIssuePlace" value={formData.idCardIssuePlace} onChange={handleChange} required error={errors.idCardIssuePlace}/>
                                  <InputField ref={phoneRef} label="Số điện thoại" id="phone" name="phone" value={formData.phone} onChange={handleChange} error={errors.phone} disabled />
                                  <div className="lg:col-span-2">
                                      <InputField label="Email" id="email" name="email" value={formData.email} onChange={handleChange} disabled />
                                  </div>
                                  <InputField label="Địa chỉ liên hệ" id="contactAddress" name="contactAddress" value={formData.contactAddress} onChange={handleChange} required error={errors.contactAddress} />
                                  <div className="lg:col-span-2">
                                      <InputField label="Cơ quan công tác" id="workplace" name="workplace" value={formData.workplace} onChange={handleChange} />
                                  </div>
                              </div>
                          </div>
                      </section>
                    )}
                    
                    {currentStep === 2 && (
                      <section aria-labelledby="section-2-heading">
                          <div className="bg-sky-50 p-3 rounded-t-lg border border-sky-200 flex items-center gap-3">
                              <AcademicCapIcon className="w-6 h-6 text-sky-700" />
                              <h2 id="section-2-heading" className="text-lg font-bold text-sky-800">II. Thông tin đăng ký dự tuyển</h2>
                          </div>
                          <div className="p-6 border-x border-b border-sky-200 rounded-b-lg">
                              {isLimitedFacility && (
                                  <div className="text-sm text-yellow-800 bg-yellow-50 p-3 rounded-md mb-6 border border-yellow-200">
                                      <b>Lưu ý:</b> Đối với cơ sở đào tạo tại <b>{formData.trainingFacility}</b>, thí sinh chỉ được đăng ký 1 nguyện vọng duy nhất.
                                  </div>
                              )}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <SelectField label="Cơ sở đào tạo" id="trainingFacility" name="trainingFacility" value={formData.trainingFacility} onChange={handleChange} options={TRAINING_FACILITIES} placeholder="Chọn cơ sở" required error={errors.trainingFacility} />
                                  <div className="md:col-span-2 -mb-2"></div>
                                  <SelectField label="Nguyện vọng 1" id="firstChoiceMajor" name="firstChoiceMajor" value={formData.firstChoiceMajor} onChange={handleChange} options={availableMajorsForFacility} placeholder="Chọn ngành" required error={errors.firstChoiceMajor} disabled={!formData.trainingFacility} />
                                  {getOrientationOptionsForMajor(formData.firstChoiceMajor, formData.trainingFacility).length > 0 && (
                                      <RadioGroup label="Định hướng NV1" name="firstChoiceOrientation" selectedValue={formData.firstChoiceOrientation} onChange={handleRadioChange} options={getOrientationOptionsForMajor(formData.firstChoiceMajor, formData.trainingFacility)} />
                                  )}
                                  <div className="md:col-span-2 border-t mt-4 mb-2"></div>
                                  <SelectField label="Nguyện vọng 2" id="secondChoiceMajor" name="secondChoiceMajor" value={formData.secondChoiceMajor} onChange={handleChange} options={availableMajorsForFacility} placeholder="Chọn ngành" error={errors.secondChoiceMajor} disabled={!formData.trainingFacility || isLimitedFacility} />
                                  {getOrientationOptionsForMajor(formData.secondChoiceMajor, formData.trainingFacility).length > 0 && !isLimitedFacility && (
                                      <RadioGroup label="Định hướng NV2" name="secondChoiceOrientation" selectedValue={formData.secondChoiceOrientation} onChange={handleRadioChange} options={getOrientationOptionsForMajor(formData.secondChoiceMajor, formData.trainingFacility)} />
                                  )}
                                  <div className="md:col-span-2 border-t mt-4 mb-2"></div>
                                  <SelectField label="Nguyện vọng 3" id="thirdChoiceMajor" name="thirdChoiceMajor" value={formData.thirdChoiceMajor} onChange={handleChange} options={availableMajorsForFacility} placeholder="Chọn ngành" error={errors.thirdChoiceMajor} disabled={!formData.trainingFacility || isLimitedFacility} />
                                  {getOrientationOptionsForMajor(formData.thirdChoiceMajor, formData.trainingFacility).length > 0 && !isLimitedFacility && (
                                      <RadioGroup label="Định hướng NV3" name="thirdChoiceOrientation" selectedValue={formData.thirdChoiceOrientation} onChange={handleRadioChange} options={getOrientationOptionsForMajor(formData.thirdChoiceMajor, formData.trainingFacility)} />
                                  )}
                              </div>
                          </div>
                      </section>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-8">
                        <section aria-labelledby="section-3-heading">
                            <div className="bg-sky-50 p-3 rounded-t-lg border border-sky-200 flex items-center gap-3">
                                <DocumentTextIcon className="w-6 h-6 text-sky-700" />
                                <h2 id="section-3-heading" className="text-lg font-bold text-sky-800">III. Thông tin về văn bằng</h2>
                            </div>
                            <div className="p-6 border-x border-b border-sky-200 rounded-b-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2"><InputField label="Trường tốt nghiệp đại học" id="university" name="university" value={formData.university} onChange={handleChange} required error={errors.university} /></div>
                                    <InputField label="Năm tốt nghiệp" id="graduationYear" name="graduationYear" type="number" value={formData.graduationYear} onChange={handleChange} required error={errors.graduationYear}/>
                                    <InputField ref={gpa10Ref} label="Điểm TB (hệ 10)" id="gpa10" name="gpa10" type="text" value={formData.gpa10} onChange={handleChange} onBlur={handleNumericBlur} required error={errors.gpa10} placeholder="Ví dụ: 8.50" />
                                    <InputField ref={gpa4Ref} label="Điểm TB (hệ 4)" id="gpa4" name="gpa4" type="text" value={formData.gpa4} onChange={handleChange} onBlur={handleNumericBlur} error={errors.gpa4} placeholder="Ví dụ: 3.20" />
                                    <div className="lg:col-span-1"></div>
                                    <InputField label="Ngành tốt nghiệp" id="graduationMajor" name="graduationMajor" value={formData.graduationMajor} onChange={handleChange} required error={errors.graduationMajor} />
                                    <SelectField label="Loại tốt nghiệp" id="degreeClassification" name="degreeClassification" value={formData.degreeClassification} onChange={handleChange} options={DEGREE_CLASSIFICATIONS} placeholder="Chọn loại" required error={errors.degreeClassification} />
                                    <SelectField label="Hệ tốt nghiệp" id="graduationSystem" name="graduationSystem" value={formData.graduationSystem} onChange={handleChange} options={GRADUATION_SYSTEMS} placeholder="Chọn hệ" required error={errors.graduationSystem} />
                                    <div className="lg:col-span-3"><SelectField label="Giấy chứng nhận hoàn thành bổ sung kiến thức" id="supplementaryCert" name="supplementaryCert" value={formData.supplementaryCert} onChange={handleChange} options={['Có', 'Không']} placeholder="Chọn..." required error={errors.supplementaryCert} /></div>
                                </div>
                            </div>
                        </section>
                        <section aria-labelledby="section-4-heading">
                            <div className="bg-sky-50 p-3 rounded-t-lg border border-sky-200 flex items-center gap-3">
                                <GlobeAltIcon className="w-6 h-6 text-sky-700" />
                                <h2 id="section-4-heading" className="text-lg font-bold text-sky-800">IV. Thông tin về trình độ ngoại ngữ</h2>
                            </div>
                            <div className="p-6 border-x border-b border-sky-200 rounded-b-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <SelectField label="Ngoại ngữ" id="language" name="language" value={formData.language} onChange={handleChange} options={LANGUAGES} placeholder="Chọn ngoại ngữ" required error={errors.language} />
                                    <SelectField label="Loại bằng/chứng chỉ" id="languageCertType" name="languageCertType" value={formData.languageCertType} onChange={handleChange} options={LANGUAGE_CERT_TYPES} placeholder="Chọn loại"/>
                                    <InputField label="Nơi cấp" id="languageCertIssuer" name="languageCertIssuer" value={formData.languageCertIssuer} onChange={handleChange}/>
                                    <InputField ref={languageScoreRef} label="Điểm ngoại ngữ" id="languageScore" name="languageScore" type="text" value={formData.languageScore} onChange={handleChange} onBlur={handleNumericBlur} error={errors.languageScore} placeholder="Ví dụ: 6.50"/>
                                    <InputField ref={languageCertDateRef} label="Ngày cấp" id="languageCertDate" name="languageCertDate" type="text" placeholder="DD/MM/YYYY" value={formData.languageCertDate} onChange={handleChange} error={errors.languageCertDate} />
                                </div>
                            </div>
                        </section>
                      </div>
                    )}
                    
                    {currentStep === 4 && (
                        <div className="space-y-8">
                            <section aria-labelledby="section-5-heading">
                                <div className="bg-sky-50 p-3 rounded-t-lg border border-sky-200 flex items-center gap-3"><SparklesIcon className="w-6 h-6 text-sky-700" /><h2 id="section-5-heading" className="text-lg font-bold text-sky-800">V. Thông tin về điểm thưởng (nếu có) *</h2></div>
                                <div className="p-6 border-x border-b border-sky-200 rounded-b-lg"><div className="pl-4 md:pl-6 space-y-6"><SelectField label="1. Thành tích và giải thưởng nghiên cứu khoa học" id="researchAchievements" name="researchAchievements" value={formData.researchAchievements} onChange={handleChange} options={RESEARCH_ACHIEVEMENT_CATEGORIES} required error={errors.researchAchievements} /><SelectField label="2. Các thành tích khác" id="otherAchievements" name="otherAchievements" value={formData.otherAchievements} onChange={handleChange} options={OTHER_ACHIEVEMENT_CATEGORIES} required error={errors.otherAchievements} /></div></div>
                            </section>
                            <section aria-labelledby="section-6-heading">
                                <div className="bg-sky-50 p-3 rounded-t-lg border border-sky-200 flex items-center gap-3"><UserGroupIcon className="w-6 h-6 text-sky-700" /><h2 id="section-6-heading" className="text-lg font-bold text-sky-800">VI. Thông tin về đối tượng ưu tiên (nếu có) *</h2></div>
                                <div className="p-6 border-x border-b border-sky-200 rounded-b-lg"><SelectField label="Đối tượng ưu tiên" id="priorityCategory" name="priorityCategory" value={formData.priorityCategory} onChange={handleChange} options={PRIORITY_CATEGORIES} required error={errors.priorityCategory} /></div>
                            </section>
                            <section aria-labelledby="section-7-heading">
                                <div className="bg-sky-50 p-3 rounded-t-lg border border-sky-200 flex items-center gap-3"><ClipboardCheckIcon className="w-6 h-6 text-sky-700" /><h2 id="section-7-heading" className="text-lg font-bold text-sky-800">VII. Chính sách học bổng (nếu có) *</h2></div>
                                <div className="p-6 border-x border-b border-sky-200 rounded-b-lg"><SelectField label="Chính sách học bổng" id="scholarshipPolicy" name="scholarshipPolicy" value={formData.scholarshipPolicy} onChange={handleChange} options={SCHOLARSHIP_POLICIES} required error={errors.scholarshipPolicy} /></div>
                            </section>
                        </div>
                    )}
                    
                    {currentStep === 5 && (
                        <section aria-labelledby="section-8-heading">
                            <div className="bg-sky-50 p-3 rounded-t-lg border border-sky-200 flex items-center gap-3"><UploadIcon className="w-6 h-6 text-sky-700" /><h2 id="section-8-heading" className="text-lg font-bold text-sky-800">VIII. Tài liệu đính kèm</h2></div>
                            <div className="p-6 border-x border-b border-sky-200 rounded-b-lg">
                                <div className="space-y-6">
                                    <div id="file-upload-wrapper-linkPhieuDangKy"><FileUploadField user={targetUser} label="1. Phiếu đăng ký dự tuyển" description="File PDF hoặc ảnh chụp rõ nét. (Tối đa 5MB)" targetFileName="PhieuDangKy" linkColumnHeader="Link Phiếu đăng ký dự tuyển" value={formData.linkPhieuDangKy} onUploadComplete={(url) => handleFileUploadComplete('linkPhieuDangKy', url)} onDelete={() => handleFileDelete('linkPhieuDangKy')} error={errors.linkPhieuDangKy} /></div>
                                    <div id="file-upload-wrapper-linkSoYeuLyLich"><FileUploadField user={targetUser} label="2. Sơ yếu lý lịch" description="Có xác nhận của cơ quan công tác hoặc chính quyền địa phương. (PDF/JPG/PNG, Tối đa 5MB)" targetFileName="SoYeuLyLich" linkColumnHeader="Link Sơ yếu lý lịch" value={formData.linkSoYeuLyLich} onUploadComplete={(url) => handleFileUploadComplete('linkSoYeuLyLich', url)} onDelete={() => handleFileDelete('linkSoYeuLyLich')} error={errors.linkSoYeuLyLich} /></div>
                                    <div id="file-upload-wrapper-linkMinhChungLePhi"><FileUploadField user={targetUser} label="3. Minh chứng về nộp lệ phí dự tuyển" description="Ảnh chụp màn hình hoặc biên lai chuyển khoản. (PDF/JPG/PNG, Tối đa 5MB)" targetFileName="MinhChungLePhi" linkColumnHeader="Link Minh chứng lệ phí" value={formData.linkMinhChungLePhi} onUploadComplete={(url) => handleFileUploadComplete('linkMinhChungLePhi', url)} onDelete={() => handleFileDelete('linkMinhChungLePhi')} error={errors.linkMinhChungLePhi} /></div>
                                    <div id="file-upload-wrapper-linkAnhThe"><FileUploadField user={targetUser} label="4. Ảnh thẻ 4x6" description="Yêu cầu ảnh chụp rõ mặt, nền trắng. (Định dạng: JPG, PNG, PDF. Tối đa 5MB)" targetFileName="AnhThe" linkColumnHeader="Link Ảnh thẻ" value={formData.linkAnhThe} onUploadComplete={(url) => handleFileUploadComplete('linkAnhThe', url)} onDelete={() => handleFileDelete('linkAnhThe')} error={errors.linkAnhThe} /></div>
                                    <div id="file-upload-wrapper-linkBangVaBangDiem_combined">
                                        <FileUploadField 
                                            user={targetUser} 
                                            label="5. Bản scan Bằng tốt nghiệp và Bảng điểm đại học" 
                                            description="Vui lòng gom Bằng tốt nghiệp và Bảng điểm vào một file PDF duy nhất để tải lên. (Định dạng: PDF. Tối đa 10MB)" 
                                            targetFileName="BangVaBangDiem" 
                                            linkColumnHeader="Link Bằng tốt nghiệp" 
                                            value={formData.linkBangTotNghiep} 
                                            onUploadComplete={(url) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    linkBangTotNghiep: url,
                                                    linkBangDiem: url,
                                                }));
                                            }} 
                                            onDelete={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    linkBangTotNghiep: '',
                                                    linkBangDiem: '',
                                                }));
                                            }} 
                                            acceptedFileTypes={['application/pdf']}
                                            maxFileSizeMB={10}
                                            error={errors.linkBangTotNghiep || errors.linkBangDiem} 
                                        />
                                    </div>
                                    <div id="file-upload-wrapper-linkChungChiNN"><FileUploadField user={targetUser} label="6. Bản scan Chứng chỉ ngoại ngữ" description="File PDF hoặc ảnh chụp rõ nét, có công chứng. (Định dạng: JPG, PNG, PDF. Tối đa 5MB)" targetFileName="ChungChiNN" linkColumnHeader="Link Chứng chỉ NN" value={formData.linkChungChiNN} onUploadComplete={(url) => handleFileUploadComplete('linkChungChiNN', url)} onDelete={() => handleFileDelete('linkChungChiNN')} error={errors.linkChungChiNN} /></div>
                                    <div id="file-upload-wrapper-linkGiayChungNhanBSKT"><FileUploadField user={targetUser} label="7. Giấy chứng nhận hoàn thành bổ sung kiến thức (nếu có)" description="File PDF hoặc ảnh chụp rõ nét. (JPG, PNG, PDF. Tối đa 5MB)" targetFileName="GiayChungNhanBSKT" linkColumnHeader="Link Giấy chứng nhận BSKT" value={formData.linkGiayChungNhanBSKT} onUploadComplete={(url) => handleFileUploadComplete('linkGiayChungNhanBSKT', url)} onDelete={() => handleFileDelete('linkGiayChungNhanBSKT')} error={errors.linkGiayChungNhanBSKT} /></div>
                                    <div id="file-upload-wrapper-linkUuTien"><FileUploadField user={targetUser} label="8. Minh chứng đối tượng ưu tiên (nếu có)" description="File PDF hoặc ảnh chụp các giấy tờ xác nhận. (Định dạng: JPG, PNG, PDF. Tối đa 5MB)" targetFileName="UuTien" linkColumnHeader="Link Ưu tiên" value={formData.linkUuTien} onUploadComplete={(url) => handleFileUploadComplete('linkUuTien', url)} onDelete={() => handleFileDelete('linkUuTien')} error={errors.linkUuTien} /></div>
                                    <div id="file-upload-wrapper-linkNCKH"><FileUploadField user={targetUser} label="9. Minh chứng NCKH & thành tích khác (nếu có)" description="Gom các minh chứng vào một file PDF duy nhất để tải lên. (Định dạng: PDF. Tối đa 10MB)" targetFileName="NCKH_ThanhTich" linkColumnHeader="Link NCKH và thành tích khác" value={formData.linkNCKH} onUploadComplete={(url) => handleFileUploadComplete('linkNCKH', url)} onDelete={() => handleFileDelete('linkNCKH')} acceptedFileTypes={['application/pdf']} maxFileSizeMB={10} error={errors.linkNCKH} /></div>
                                </div>
                            </div>
                        </section>
                    )}

                    {currentStep === 6 && (
                        <section aria-labelledby="review-heading">
                            <div className="bg-sky-50 p-3 rounded-t-lg border border-sky-200 flex items-center gap-3"><ClipboardCheckIcon className="w-6 h-6 text-sky-700" /><h2 id="review-heading" className="text-lg font-bold text-sky-800">Xem lại và Xác nhận</h2></div>
                            <div className="p-6 border-x border-b border-sky-200 rounded-b-lg space-y-6">
                                <p className="text-gray-600">Vui lòng kiểm tra kỹ tất cả thông tin bạn đã cung cấp trước khi lưu hồ sơ. Bạn có thể nhấp vào nút "Chỉnh sửa" để quay lại và thay đổi thông tin.</p>
                                {SECTIONS.map(section => {
                                    const stepToJump = STEPS.find(s => s.sections.includes(section.id))?.step;
                                    const hasContent = Object.entries(formData).some(([key, value]) => {
                                        if (FIELD_TO_SECTION_MAP[key as keyof ApplicationFormData] === section.id && value) {
                                            if (key === 'researchAchievements' && value === 'NCKH0') return false;
                                            if (key === 'otherAchievements' && value === 'KHAC0') return false;
                                            if (key === 'priorityCategory' && value === '0') return false;
                                            return true;
                                        }
                                        return false;
                                    });

                                    const shouldRenderSection = specialSections.includes(section.id) || section.id === 'section-8' || hasContent;
                                    if (!shouldRenderSection) return null;

                                    return (
                                        <div key={section.id}>
                                            <div className="flex justify-between items-center mb-2 pb-2 border-b">
                                                <h3 className="font-semibold text-gray-800">{section.title}</h3>
                                                {stepToJump && <button type="button" onClick={() => goToStep(stepToJump)} className="flex items-center gap-1 text-sm text-sky-600 hover:underline font-medium"><PencilIcon className="w-4 h-4" /> Chỉnh sửa</button>}
                                            </div>
                                            {specialSections.includes(section.id) ? (
                                                <div className="pt-2 text-sm space-y-1">
                                                    {specialSectionFields[section.id].map(({ key, label }) => {
                                                        const value = formData[key as keyof ApplicationFormData];
                                                        const friendlyValue = getDisplayValue(key, value);
                                                        return (
                                                            <div key={key} className="py-1">
                                                                <p className="text-gray-900 break-words leading-relaxed">
                                                                    <span className="font-semibold text-gray-500">{label}:</span>
                                                                    {' '}
                                                                    <span className="font-medium">{friendlyValue}</span>
                                                                </p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : section.id === 'section-8' ? (
                                                <div className="space-y-2 pt-2">
                                                    {documentsList.map(doc => {
                                                        let url: string;
                                                        let isRequired: boolean;
                                                        let docKeyForSupplement: string;

                                                        if (doc.key === 'linkBangVaBangDiem_combined') {
                                                            url = formData.linkBangTotNghiep; // Use one of the two synced links
                                                            isRequired = doc.isRequired(formData);
                                                            docKeyForSupplement = doc.key;
                                                        } else {
                                                            url = formData[doc.key as keyof ApplicationFormData];
                                                            isRequired = doc.isRequired(formData);
                                                            docKeyForSupplement = doc.key;
                                                        }
                                                        
                                                        return (
                                                            <div key={doc.key} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                                                                <span className="text-sm text-gray-800">{doc.label}:</span>
                                                                <div className="flex items-center gap-4">
                                                                    {url ? (
                                                                        <>
                                                                            <span className="text-sm font-semibold text-green-600">Đã tải</span>
                                                                            <a href={url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-colors">
                                                                                Xem file
                                                                            </a>
                                                                        </>
                                                                    ) : isRequired ? (
                                                                        <>
                                                                            <span className="text-sm font-bold text-red-600">Cần bổ sung</span>
                                                                            <button type="button" onClick={() => handleSupplementClick(docKeyForSupplement)} className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">
                                                                                Bổ sung
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <span className="text-sm font-medium text-gray-500">Không yêu cầu</span>
                                                                             <button type="button" onClick={() => handleSupplementClick(docKeyForSupplement)} className="px-3 py-1 text-sm font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600 transition-colors">
                                                                                Thay đổi
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm pt-2">
                                                    {Object.entries(formData).map(([key, value]) => {
                                                        if (FIELD_TO_SECTION_MAP[key as keyof ApplicationFormData] === section.id && value) {
                                                            const friendlyValue = getDisplayValue(key, value);
                                                            return (
                                                                <div key={key} className="grid grid-cols-3 gap-1 py-1">
                                                                    <dt className="text-gray-500 col-span-1">{keyToHeaderMap[key as keyof ApplicationFormData]}:</dt>
                                                                    <dd className="text-gray-900 font-medium col-span-2 break-words">{friendlyValue}</dd>
                                                                </div>
                                                            )
                                                        }
                                                        return null;
                                                    })}
                                                </dl>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-8 border-t">
                        <div className="flex-shrink-0">
                            {currentStep > 1 && (
                                <button type="button" onClick={handleBack} className="flex items-center gap-2 px-6 py-2 bg-sky-100 border border-sky-300 text-sky-700 font-semibold rounded-md hover:bg-sky-200 transition-colors">
                                    <ArrowLeftIcon className="w-5 h-5" />
                                    <span>Quay lại</span>
                                </button>
                            )}
                        </div>
                        <div className="flex-shrink-0 flex flex-col items-center">
                            {currentStep < STEPS.length && (
                                <button
                                    type="button"
                                    onClick={handleSaveDraft}
                                    disabled={isSavingDraft}
                                    className="px-6 py-2 bg-slate-500 text-white font-semibold rounded-md hover:bg-slate-600 transition-colors disabled:bg-slate-300"
                                >
                                    {isSavingDraft ? 'Đang lưu...' : 'Lưu nháp'}
                                </button>
                            )}
                            {draftMessage.text && (
                                <span className={`mt-2 text-xs font-medium ${draftMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                    {draftMessage.text}
                                </span>
                            )}
                        </div>

                        <div className="flex-shrink-0">
                            {currentStep < STEPS.length ? (
                                <button type="button" onClick={handleNext} className="flex items-center gap-2 px-6 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition-colors">
                                    <span>Tiếp theo</span>
                                    <ArrowRightIcon className="w-5 h-5" />
                                </button>
                            ) : (
                                <div className="flex flex-wrap items-center justify-center gap-3">
                                    <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors disabled:bg-green-300">{isSubmitting ? 'Đang nộp...' : 'Nộp hồ sơ'}</button>
                                    <button type="button" onClick={handlePrint} className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition-colors">In thông tin</button>
                                    <button type="button" onClick={() => navigate(Page.ApplicationStatus)} className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition-colors">Xem hồ sơ</button>
                                    <button type="button" onClick={handleQrCodeClick} className="px-6 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors">QR Code lệ phí</button>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
      </main>
      <Footer navigate={navigate} />
    </div>
  );
};

const InputField = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string, error?: string, required?: boolean }>(({ label, id, error, required, ...props }, ref) => {
    const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500';
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
            <input ref={ref} id={id} {...props} className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm disabled:bg-gray-100 ${errorClasses}`} />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
});
InputField.displayName = "InputField";

export default ApplicationFormPage;