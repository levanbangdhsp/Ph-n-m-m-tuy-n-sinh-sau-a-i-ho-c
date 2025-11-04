import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, ApplicationFormData } from '../types';
import RadioGroup from '../components/RadioGroup';
import Alert from '../components/Alert';
import { NATIONALITIES, GENDERS, MAJORS_DATA, DEGREE_CLASSIFICATIONS, GRADUATION_SYSTEMS, LANGUAGES, LANGUAGE_CERT_TYPES, TRAINING_FACILITIES, CITIES, ETHNICITIES, PRIORITY_CATEGORIES, SCHOLARSHIP_POLICIES, RESEARCH_ACHIEVEMENT_CATEGORIES, OTHER_ACHIEVEMENT_CATEGORIES } from '../constants';
import AcademicCapIcon from '../components/icons/AcademicCapIcon';
import Footer from '../components/Footer';

interface ApplicationFormPageProps {
  user: User;
  onLogout: () => void;
  navigateBack: () => void;
}

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz7w4xs_00awOzkc5ZAOIxjcRIhy-dCeVB2wvysWzrHVVtJ4Am6jQ4rjC-cnhs0HRYs/exec';

const keyToHeaderMap: { [key: string]: string } = {
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
    // Fix: Corrected a duplicate property name. Changed `secondChoiceOrientation` to `thirdChoiceOrientation`.
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
    researchAchievements: 'Nghiên cứu khoa học',
    otherAchievements: 'Thành tích khác',
    priorityCategory: 'Ưu tiên',
    scholarshipPolicy: 'Học bổng',
};

const headerToKeyMap: { [key: string]: string } = Object.entries(keyToHeaderMap).reduce((acc, [key, value]) => ({ ...acc, [value]: key }), {});

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

const ApplicationFormPage: React.FC<ApplicationFormPageProps> = ({ user, onLogout, navigateBack }) => {
  const initialFormState: ApplicationFormData = {
    fullName: user.fullName,
    gender: '',
    dob: '',
    pob: '',
    ethnicity: '',
    nationality: 'Việt Nam',
    idCardNumber: '',
    idCardIssueDate: '',
    idCardIssuePlace: '',
    phone: user.phone,
    email: user.email,
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
  };

  const [formData, setFormData] = useState<ApplicationFormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitMessageType, setSubmitMessageType] = useState<'success' | 'error'>('error');
  const [errors, setErrors] = useState<Partial<Record<keyof ApplicationFormData, string>>>({});
  const [isFetchingData, setIsFetchingData] = useState(true);

  const dobRef = useRef<HTMLInputElement>(null);
  const idCardNumberRef = useRef<HTMLInputElement>(null);
  const idCardIssueDateRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const languageCertDateRef = useRef<HTMLInputElement>(null);
  const gpa10Ref = useRef<HTMLInputElement>(null);
  const gpa4Ref = useRef<HTMLInputElement>(null);
  const languageScoreRef = useRef<HTMLInputElement>(null);
  
  const majorNameToCodeMap = useMemo(() => MAJORS_DATA.reduce((acc, major) => ({ ...acc, [major.name]: major.code }), {} as Record<string, string>), []);

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

  const getUrlWithCacheBuster = () => {
    return `${SCRIPT_URL}?v=${new Date().getTime()}`;
  };

  const processResponse = async (response: Response) => {
    const textResult = await response.text();
    try {
      return JSON.parse(textResult);
    } catch (e) {
      // If parsing fails, it's not a valid JSON. Return it as an error message.
      return { status: 'error', success: false, message: textResult || 'Lỗi không xác định từ máy chủ.' };
    }
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


  useEffect(() => {
    const fetchApplicationData = async () => {
        if (!user.email) return;

        setIsFetchingData(true);
        setSubmitMessage(''); 
        try {
            const payload = {
                action: 'getApplicationData',
                email: user.email,
            };
            const response = await fetch(getUrlWithCacheBuster(), {
                method: 'POST',
                cache: 'no-cache',
                headers: {
                  'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(payload),
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }

            const result = await processResponse(response);

            if (result.success && result.data) {
                const sheetData = result.data;
                const newFormData = { ...initialFormState };

                for (const header in sheetData) {
                    const key = headerToKeyMap[header];
                    if (key && sheetData[header] !== null && sheetData[header] !== undefined) {
                        const rawValue = sheetData[header];
                        let processedValue: string;
    
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
                                processedValue = 'NCKH0'; // Default for research.
                            } else {
                                processedValue = rawValue.toString(); // Fallback
                            }
                        } else if (key === 'otherAchievements') {
                            processedValue = otherAchievementsReverseMap[rawValue] || rawValue.toString();
                        } else if (key.includes('Orientation')) {
                            processedValue = mapOrientationFromSheet(rawValue.toString());
                        } else if (key === 'dob' || key === 'idCardIssueDate' || key === 'languageCertDate') {
                            processedValue = formatDateFromISO(rawValue.toString());
                        } else {
                            processedValue = rawValue.toString();
                            processedValue = processedValue.startsWith("'") ? processedValue.substring(1) : processedValue;
                        }
                        (newFormData as any)[key] = processedValue;
                    }
                }
                setFormData(newFormData);
            }
        } catch (error) {
            console.error("Failed to fetch application data:", error);
            setSubmitMessage('Không thể tải dữ liệu hồ sơ. Bạn có thể điền mới hoặc thử lại sau.');
            setSubmitMessageType('error');
        } finally {
            setIsFetchingData(false);
        }
    };
    
    fetchApplicationData();
  }, [user.email, majorNameToCodeMap]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setErrors({});

    const newErrors: Partial<Record<keyof ApplicationFormData, string>> = {};
    let firstErrorRef: React.RefObject<HTMLInputElement> | null = null;
    
    // --- START: REQUIRED FIELD VALIDATION ---
    const requiredFieldConfig: { key: keyof ApplicationFormData; label: string }[] = [
        { key: 'gender', label: 'Giới tính' },
        { key: 'dob', label: 'Ngày sinh' },
        { key: 'pob', label: 'Nơi sinh' },
        { key: 'ethnicity', label: 'Dân tộc' },
        { key: 'nationality', label: 'Quốc tịch' },
        { key: 'idCardNumber', label: 'Số CCCD' },
        { key: 'idCardIssueDate', label: 'Ngày cấp CCCD' },
        { key: 'phone', label: 'Số điện thoại' },
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
        const value = formData[key];
        if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
            if (!newErrors[key]) {
                newErrors[key] = `${label} là trường bắt buộc.`;
            }
        }
    });
    // --- END: REQUIRED FIELD VALIDATION ---

    const choices = [
        { major: formData.firstChoiceMajor, orientation: formData.firstChoiceOrientation },
        { major: formData.secondChoiceMajor, orientation: formData.secondChoiceOrientation },
        { major: formData.thirdChoiceMajor, orientation: formData.thirdChoiceOrientation },
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

      const majorCode = formData[majorKey];
      const orientationValue = formData[orientationKey];
      
      if (majorCode && !orientationValue) {
        const orientationOptions = getOrientationOptionsForMajor(majorCode, formData.trainingFacility);
        if (orientationOptions.length > 1) {
          newErrors[majorKey] = 'Bạn phải chọn 1 định hướng cho ngành đã chọn.';
        }
      }
    });

    const isLowGraduation = ['TB', 'TBK', 'KXL'].includes(formData.degreeClassification);
    const hasNoQualifyingPaper = !['NCKH3', 'NCKH4', 'NCKH5'].includes(formData.researchAchievements);
    const researchOrientationError = "Nếu Bạn tốt nghiệp loại Trung bình hoặc Trung bình khá và chọn định hướng Nghiên cứu, bạn phải có bài báo khoa học.";

    if (isLowGraduation && hasNoQualifyingPaper) {
        if (formData.firstChoiceOrientation === 'research') {
            newErrors.firstChoiceMajor = researchOrientationError;
        }
        if (formData.secondChoiceOrientation === 'research') {
            newErrors.secondChoiceMajor = researchOrientationError;
        }
        if (formData.thirdChoiceOrientation === 'research') {
            newErrors.thirdChoiceMajor = researchOrientationError;
        }
    }

    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (formData.dob && !dateRegex.test(formData.dob.trim())) {
        newErrors.dob = 'Định dạng ngày phải là DD/MM/YYYY.';
        if (!firstErrorRef) firstErrorRef = dobRef;
    }
    
    const cccdRegex = /^\d{12}$/;
    if (formData.idCardNumber && !cccdRegex.test(formData.idCardNumber.trim())) {
        newErrors.idCardNumber = 'Số CCCD không hợp lệ. Vui lòng nhập đúng 12 chữ số.';
        if (!firstErrorRef) firstErrorRef = idCardNumberRef;
    }

    if (formData.idCardIssueDate && !dateRegex.test(formData.idCardIssueDate.trim())) {
        newErrors.idCardIssueDate = 'Định dạng ngày phải là DD/MM/YYYY.';
        if (!firstErrorRef) firstErrorRef = idCardIssueDateRef;
    }

    const phoneRegex = /^\d{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.trim())) {
        newErrors.phone = 'Số điện thoại không hợp lệ. Vui lòng nhập đúng 10 chữ số.';
        if (!firstErrorRef) firstErrorRef = phoneRef;
    }
    
    if (formData.languageCertDate && !dateRegex.test(formData.languageCertDate.trim())) {
        newErrors.languageCertDate = 'Định dạng ngày phải là DD/MM/YYYY.';
        if (!firstErrorRef) firstErrorRef = languageCertDateRef;
    }

    const numericRegex = /^\d+(\.\d{1,2})?$/;
    
    if (formData.languageScore) {
        if (formData.languageScore.includes(',')) {
            newErrors.languageScore = 'Vui lòng dùng dấu chấm "." cho số thập phân, không dùng dấu phẩy ",".';
            if (!firstErrorRef) firstErrorRef = languageScoreRef;
        } else if (!numericRegex.test(formData.languageScore)) {
            newErrors.languageScore = 'Điểm không hợp lệ. Dùng dấu "." và tối đa 2 chữ số thập phân.';
            if (!firstErrorRef) firstErrorRef = languageScoreRef;
        }
    }

    if (formData.gpa10) {
        if (formData.gpa10.includes(',')) {
             newErrors.gpa10 = 'Vui lòng dùng dấu chấm "." cho số thập phân, không dùng dấu phẩy ",".';
             if (!firstErrorRef) firstErrorRef = gpa10Ref;
        } else if (!numericRegex.test(formData.gpa10)) {
            newErrors.gpa10 = 'Điểm không hợp lệ. Dùng dấu "." và tối đa 2 chữ số thập phân.';
            if (!firstErrorRef) firstErrorRef = gpa10Ref;
        } else {
            const gpa10Value = parseFloat(formData.gpa10);
            if (gpa10Value < 0 || gpa10Value > 10) {
                newErrors.gpa10 = 'Điểm hệ 10 phải từ 0 đến 10.';
                if (!firstErrorRef) firstErrorRef = gpa10Ref;
            }
        }
    }

    if (formData.gpa4) {
        if (formData.gpa4.includes(',')) {
             newErrors.gpa4 = 'Vui lòng dùng dấu chấm "." cho số thập phân, không dùng dấu phẩy ",".';
             if (!firstErrorRef) firstErrorRef = gpa4Ref;
        } else if (!numericRegex.test(formData.gpa4)) {
            newErrors.gpa4 = 'Điểm không hợp lệ. Dùng dấu "." và tối đa 2 chữ số thập phân.';
            if (!firstErrorRef) firstErrorRef = gpa4Ref;
        } else {
            const gpa4Value = parseFloat(formData.gpa4);
            if (gpa4Value < 0 || gpa4Value > 4) {
                newErrors.gpa4 = 'Điểm hệ 4 phải từ 0 đến 4.';
                if (!firstErrorRef) firstErrorRef = gpa4Ref;
            }
        }
    }

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsSubmitting(false);
        if (firstErrorRef?.current) {
            firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstErrorRef.current.focus();
        } else {
           window.scrollTo(0, 0); 
        }
        return;
    }

    const now = new Date();
    const submissionTimestamp = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const mapOrientation = (orientation: 'research' | 'applied' | '') => {
        if (orientation === 'research') return 'Nghiên cứu';
        if (orientation === 'applied') return 'Ứng dụng';
        return '';
    };

    const sheetDataForUpdate = {
        'Thời gian': `'${submissionTimestamp}`,
        'Số điện thoại': `'${formData.phone.trim()}`,
        'Giới tính': formData.gender,
        'Địa chỉ liên hệ': formData.contactAddress,
        'Cơ quan công tác': formData.workplace,
        'Ngày sinh': formData.dob,
        'Nơi sinh': formData.pob,
        'Dân tộc': formData.ethnicity,
        'Quốc tịch': formData.nationality,
        'Trường tốt nghiệp đại học': formData.university,
        'Năm TN': formData.graduationYear,
        'Điểm TB (hệ 10)': formData.gpa10,
        'Điểm TB (hệ 4)': formData.gpa4,
        'Loại TN': formData.degreeClassification,
        'Hệ TN': formData.graduationSystem,
        'Ngành tốt nghiệp': formData.graduationMajor,
        'Ngoại ngữ': formData.language,
        'Loại bằng NN': formData.languageCertType,
        'Trường cấp bằng NN': formData.languageCertIssuer,
        'Điểm NN': formData.languageScore,
        'Ngày cấp NN': formData.languageCertDate,
        'Số CCCD': `'${formData.idCardNumber.trim()}`,
        'Ngày cấp CCCD': formData.idCardIssueDate,
        'Nơi cấp CCCD': formData.idCardIssuePlace,
        'Ưu tiên': formData.priorityCategory,
        'Nghiên cứu khoa học': formData.researchAchievements,
        'Thành tích khác': formData.otherAchievements, // Đảm bảo dữ liệu từ mục 'Các thành tích khác' được gửi đi
        'Nguyện vọng 1': formData.firstChoiceMajor,
        'Định hướng NV1': mapOrientation(formData.firstChoiceOrientation),
        'Nguyện vọng 2': isLimitedFacility ? '' : formData.secondChoiceMajor,
        'Định hướng NV2': isLimitedFacility ? '' : mapOrientation(formData.secondChoiceOrientation),
        'Nguyện vọng 3': isLimitedFacility ? '' : formData.thirdChoiceMajor,
        'Định hướng NV3': isLimitedFacility ? '' : mapOrientation(formData.thirdChoiceOrientation),
        'Học bổng': formData.scholarshipPolicy,
        'Bổ sung kiến thức': formData.supplementaryCert,
        'Cơ sở đào tạo': formData.trainingFacility,
    };

    const payload = {
        action: 'submitApplication',
        sheetName: 'DataDangky',
        email: user.email,
        ...sheetDataForUpdate
    };

    try {
        const response = await fetch(getUrlWithCacheBuster(), {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        
        const result = await processResponse(response);
        
        if (result.status === 'success' || result.success) {
            setSubmitMessage('Thông tin đã được lưu thành công!');
            setSubmitMessageType('success');
        } else {
            setSubmitMessage(`Lưu thông tin thất bại: ${result.message || 'Lỗi không xác định'}`);
            setSubmitMessageType('error');
        }
    } catch (error) {
        console.error('Application submission error:', error);
        setSubmitMessage('Đã có lỗi mạng xảy ra khi lưu thông tin (thường do CORS hoặc kết nối). Vui lòng kiểm tra lại đường truyền và thử lại.');
        setSubmitMessageType('error');
    } finally {
        setIsSubmitting(false);
        window.scrollTo(0, 0);
    }
  };
  
  const handlePrint = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();

    const checkedBox = '&#9746;'; // Checked box
    const uncheckedBox = '&#9744;'; // Unchecked box

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
            } else { // ten > 1
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
          body { 
            font-family: 'Times New Roman', Times, serif; 
            font-size: 11pt; 
            color: #000;
            margin: 0;
            padding: 0;
            line-height: 1.15;
          }
          .page-container {
            width: 210mm;
            min-height: 297mm;
            padding: 0.5in;
            margin: 0 auto;
            box-sizing: border-box;
            position: relative;
          }
          .header, .title { text-align: center; }
          .header { margin-bottom: 0.5em; line-height: 1.2; }
          .title { font-weight: bold; font-size: 13pt; margin-bottom: 0.5em; margin-top: 1em; }
          .section-title { font-weight: bold; margin-top: 0.5em; margin-bottom: 0.2em; }
          .section-content { padding-left: 1.5em; }
          p { margin-top: 0.5em; margin-bottom: 0.5em; }
          .data { font-weight: bold; }
          .signature-block { 
            float: right; 
            width: 45%; 
            text-align: center; 
            margin-top: 1em; 
          }
          .signature-block .date { font-style: italic; }
          .signature-block .role { font-weight: bold; }
          .signature-block .name-placeholder { margin-top: 40px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 0.2em; }
          td { padding: 0 4px 0 0; vertical-align: top; }
          .checkbox-label { margin-left: 5px; margin-right: 15px; }
          .dotted-line { border-bottom: 1px dotted #000; display: inline-block; min-width: 100px; }
          .full-width { display: block; margin-bottom: 0.2em; }
          .footer-id {
            position: absolute;
            bottom: 0.5in;
            left: 0.5in;
          }
          @media print {
            @page {
              size: A4;
              margin: 0.3in;
            }
            body, .page-container {
              margin: 0;
              padding: 0;
              width: auto;
              min-height: 0;
            }
            .footer-id {
                position: fixed;
                bottom: 0.1in;
                left: 0.3in;
            }
          }
        </style>
      </head>
      <body>
        <div class="page-container">
          <div class="header">
              <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br/>
              <strong><u>Độc lập – Tự do – Hạnh phúc</u></strong>
          </div>

          <div class="title">PHIẾU ĐĂNG KÝ DỰ TUYỂN TRÌNH ĐỘ THẠC SĨ NĂM 2026</div>

          <div class="section-title">I. Thông tin về người dự tuyển</div>
          <div class="section-content">
            <table>
                <tr>
                    <td style="width:50%;">1. Họ và tên: <span class="data">${formData.fullName}</span></td>
                    <td>2. Giới tính: <span class="data">${formData.gender}</span></td>
                </tr>
                <tr>
                    <td>3. Sinh ngày: <span class="data">${formData.dob}</span></td>
                    <td>4. Nơi sinh: <span class="data">${formData.pob}</span></td>
                </tr>
                <tr>
                    <td>5. Dân tộc: <span class="data">${formData.ethnicity}</span></td>
                    <td>6. Quốc tịch: <span class="data">${formData.nationality}</span></td>
                </tr>
                <tr>
                    <td>7. Số CCCD: <span class="data">${formData.idCardNumber}</span></td>
                    <td>8. Thời gian cấp: <span class="data">${formData.idCardIssueDate}</span></td>
                </tr>
            </table>
            <div class="full-width">9. Nơi cấp: <span class="data">${formData.idCardIssuePlace}</span></div>
            <table>
                <tr>
                    <td style="width:50%;">10. Điện thoại: <span class="data">${formData.phone}</span></td>
                    <td>11. Email: <span class="data">${formData.email}</span></td>
                </tr>
            </table>
            <div class="full-width">12. Địa chỉ liên hệ: <span class="data">${formData.contactAddress}</span></div>
            <div class="full-width">13. Cơ quan công tác: <span class="data">${formData.workplace || 'Không'}</span></div>
          </div>
          
          <div class="section-title">II. Thông tin về cơ sở đào tạo, nguyện vọng đăng ký ngành dự tuyển và chương trình đào tạo</div>
           <div class="section-content">
            <div class="full-width">Cơ sở đào tạo tại: <span class="data">${formData.trainingFacility}</span></div>
            <table>
                <tr>
                    <td style="width: 70%;">1. NV1: <span class="data">${getMajorName(formData.firstChoiceMajor)}</span></td>
                    <td style="padding-left: 0.5cm;">Định hướng: <span class="data">${getOrientationLabel(formData.firstChoiceOrientation)}</span></td>
                </tr>
                <tr>
                    <td style="width: 70%;">2. NV2: <span class="data">${getMajorName(formData.secondChoiceMajor)}</span></td>
                    <td style="padding-left: 0.5cm;">Định hướng: <span class="data">${getOrientationLabel(formData.secondChoiceOrientation)}</span></td>
                </tr>
                <tr>
                    <td style="width: 70%;">3. NV3: <span class="data">${getMajorName(formData.thirdChoiceMajor)}</span></td>
                    <td style="padding-left: 0.5cm;">Định hướng: <span class="data">${getOrientationLabel(formData.thirdChoiceOrientation)}</span></td>
                </tr>
            </table>
          </div>

          <div class="section-title">III. Thông tin về văn bằng</div>
          <div class="section-content">
            <div>1. Văn bằng đại học: 
                ${formData.graduationYear ? checkedBox : uncheckedBox} <span class="checkbox-label">Đã tốt nghiệp</span>
                ${!formData.graduationYear ? checkedBox : uncheckedBox} <span class="checkbox-label">Đã đủ điều kiện công nhận tốt nghiệp</span>
                ${uncheckedBox} <span class="checkbox-label">Khác</span>
            </div>
            <div>Cơ sở cấp: <span class="data">${formData.university}</span><span style="display:inline-block; width: 50px;"></span>Năm tốt nghiệp: <span class="data">${formData.graduationYear}</span></div>
            <div>Điểm trung bình chung: <span class="data">${formData.gpa10 || '...'}</span>/10 ${gpa10Words} hoặc <span class="data">${formData.gpa4 || '...'}</span>/4 ${gpa4Words}</div>
            <table>
                <tr>
                    <td style="width:50%;">Ngành tốt nghiệp: <span class="data">${formData.graduationMajor}</span></td>
                    <td>Loại tốt nghiệp: <span class="data">${getDegreeLabel(formData.degreeClassification)}</span></td>
                </tr>
                <tr>
                    <td colspan="2">Hình thức đào tạo: <span class="data">${getGradSystemLabel(formData.graduationSystem)}</span></td>
                </tr>
            </table>
            <div>2. Giấy chứng nhận hoàn thành chương trình bổ sung kiến thức ngành:
                ${formData.supplementaryCert === 'Có' ? checkedBox : uncheckedBox} <span class="checkbox-label">Có</span>
                ${formData.supplementaryCert === 'Không' ? checkedBox : uncheckedBox} <span class="checkbox-label">Không</span>
            </div>
          </div>

          <div class="section-title">IV. Thông tin về năng lực ngoại ngữ: 
              ${formData.language ? checkedBox : uncheckedBox} <span class="checkbox-label">Đáp ứng về NLNN</span>
              ${uncheckedBox} <span class="checkbox-label">Thi đánh giá NLNN</span>
          </div>
          <div class="section-content">
            <div>1. Đối với văn bằng của Trường ĐHSP Tp.HCM: ${uncheckedBox} Đã tốt nghiệp ${uncheckedBox} Đã đủ điều kiện công nhận tốt nghiệp ${uncheckedBox} Khác</div>
            <div>2. Đối với chứng chỉ: 
                ${formData.languageCertType ? checkedBox : uncheckedBox} <span class="checkbox-label">Đã có chứng chỉ</span>
                ${!formData.languageCertType ? checkedBox : uncheckedBox} <span class="checkbox-label">Đã đủ điều kiện cấp chứng chỉ</span>
                ${uncheckedBox} <span class="checkbox-label">Khác</span>
            </div>
            <table>
                <tr>
                    <td style="width:40%;">Ngoại ngữ: <span class="data">${getLanguageLabel(formData.language)}</span></td>
                    <td>Loại bằng/Chứng chỉ: <span class="data">${getLanguageCertLabel(formData.languageCertType)}</span></td>
                </tr>
            </table>
            <div>Điểm ngoại ngữ: <span class="data">${formData.languageScore || '...'}</span> ${languageScoreWords}</div>
            <table>
                <tr>
                    <td style="width:50%;">Ngày cấp: <span class="data">${formData.languageCertDate}</span></td>
                    <td>Cơ sở cấp: <span class="data">${formData.languageCertIssuer}</span></td>
                </tr>
            </table>
          </div>

          <div class="section-title">V. Thông tin về điểm thưởng</div>
          <div class="section-content">
            <p>1. Thành tích và giải thưởng nghiên cứu khoa học: <span class="data">${getResearchAchievementLabel(formData.researchAchievements)}</span></p>
            <div>Trong đó: 
                ${uncheckedBox} <span class="checkbox-label">Tác giả chính hoặc chủ nhiệm đề tài</span>
                ${uncheckedBox} <span class="checkbox-label">Đồng tác giả hoặc thành viên đề tài</span>
            </div>
            <p>2. Các thành tích khác: <span class="data">${getOtherAchievementLabel(formData.otherAchievements)}</span></p>
          </div>

          <div class="section-title">VI. Thông tin về đối tượng ưu tiên: <span class="data">${getPriorityLabel(formData.priorityCategory)}</span></div>

          <p style="margin-top: 1em; text-align: justify; line-height: 1.3;">
              Tôi xin cam kết chấp hành đúng Quy chế Tuyển sinh và đào tạo trình độ thạc sĩ hiện hành. Những lời khai trên của tôi là đúng sự thật, nếu có sai sót tôi xin chịu hoàn toàn trách nhiệm./.
          </p>

          <div class="signature-block">
              <div class="date">Thành phố Hồ Chí Minh, ngày ${day} tháng ${month} năm ${year}</div>
              <div class="role">Người dự tuyển</div>
              <em>(Ký tên, ghi rõ họ và tên)</em>
              <div class="name-placeholder"><span class="data">${formData.fullName}</span></div>
          </div>
          
          <div style="clear: both;"></div>
          <div class="footer-id">ID: <span class="data">${user.id}</span></div>

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

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
       <header className="bg-sky-100 text-slate-800 shadow-sm w-full sticky top-0 z-50 border-b border-sky-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
            <div className="flex items-center gap-3">
                <AcademicCapIcon className="w-8 h-8 text-sky-700" />
                <span className="text-xl font-bold text-slate-800 hidden sm:block">
                Hồ sơ dự tuyển
                </span>
            </div>
            <nav className="flex items-center gap-2">
                <span className="text-slate-600 hidden md:block">
                Xin chào, <span className="font-semibold">{user.fullName}</span>!
                </span>
                <button
                    onClick={navigateBack}
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
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md relative">
            {isFetchingData && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                <div className="flex items-center gap-3 text-lg text-gray-700">
                <svg className="animate-spin h-6 w-6 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Đang tải dữ liệu hồ sơ...</span>
                </div>
            </div>
            )}
            
            {submitMessage && (
            <div className="mb-6">
                <Alert type={submitMessageType} message={submitMessage} onClose={() => setSubmitMessage('')} />
            </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
            <div className="border-b pb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">I. Thông tin người dự tuyển</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InputField label="Họ và tên" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} disabled />
                <SelectField label="Giới tính" id="gender" name="gender" value={formData.gender} onChange={handleChange} options={GENDERS} placeholder="Chọn giới tính" required error={errors.gender} />
                <InputField ref={dobRef} label="Ngày sinh" id="dob" name="dob" type="text" placeholder="DD/MM/YYYY" value={formData.dob} onChange={handleChange} required error={errors.dob} />
                <SelectField label="Nơi sinh" id="pob" name="pob" value={formData.pob} onChange={handleChange} options={CITIES} placeholder="Chọn nơi sinh" required error={errors.pob} />
                <SelectField label="Dân tộc" id="ethnicity" name="ethnicity" value={formData.ethnicity} onChange={handleChange} options={ETHNICITIES} placeholder="Chọn dân tộc" required error={errors.ethnicity} />
                <SelectField label="Quốc tịch" id="nationality" name="nationality" value={formData.nationality} onChange={handleChange} options={NATIONALITIES} placeholder="Chọn quốc tịch" required error={errors.nationality}/>
                <InputField ref={idCardNumberRef} label="Số CCCD" id="idCardNumber" name="idCardNumber" value={formData.idCardNumber} onChange={handleChange} required error={errors.idCardNumber} />
                <InputField ref={idCardIssueDateRef} label="Ngày cấp CCCD" id="idCardIssueDate" name="idCardIssueDate" type="text" placeholder="DD/MM/YYYY" value={formData.idCardIssueDate} onChange={handleChange} required error={errors.idCardIssueDate} />
                <InputField label="Nơi cấp CCCD" id="idCardIssuePlace" name="idCardIssuePlace" value={formData.idCardIssuePlace} onChange={handleChange} error={errors.idCardIssuePlace}/>
                <InputField ref={phoneRef} label="Số điện thoại" id="phone" name="phone" value={formData.phone} onChange={handleChange} required error={errors.phone} />
                <div className="lg:col-span-2">
                    <InputField label="Email" id="email" name="email" value={formData.email} onChange={handleChange} disabled />
                </div>
                <InputField label="Địa chỉ liên hệ" id="contactAddress" name="contactAddress" value={formData.contactAddress} onChange={handleChange} required error={errors.contactAddress} />
                <div className="lg:col-span-2">
                    <InputField label="Cơ quan công tác" id="workplace" name="workplace" value={formData.workplace} onChange={handleChange} />
                </div>
                </div>
            </div>

            <div className="border-b pb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">II. Thông tin đăng ký dự tuyển</h2>
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
            
            <div className="border-b pb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">III. Thông tin về văn bằng</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                    <InputField label="Trường tốt nghiệp đại học" id="university" name="university" value={formData.university} onChange={handleChange} required error={errors.university} />
                    </div>
                    <InputField label="Năm tốt nghiệp" id="graduationYear" name="graduationYear" type="number" value={formData.graduationYear} onChange={handleChange} required error={errors.graduationYear}/>
                    <InputField ref={gpa10Ref} label="Điểm TB (hệ 10)" id="gpa10" name="gpa10" type="text" value={formData.gpa10} onChange={handleChange} onBlur={handleNumericBlur} required error={errors.gpa10} placeholder="Ví dụ: 8.50" />
                    <InputField ref={gpa4Ref} label="Điểm TB (hệ 4)" id="gpa4" name="gpa4" type="text" value={formData.gpa4} onChange={handleChange} onBlur={handleNumericBlur} error={errors.gpa4} placeholder="Ví dụ: 3.20" />
                    <div className="lg:col-span-1"></div>
                    <InputField label="Ngành tốt nghiệp" id="graduationMajor" name="graduationMajor" value={formData.graduationMajor} onChange={handleChange} required error={errors.graduationMajor} />
                    <SelectField label="Loại tốt nghiệp" id="degreeClassification" name="degreeClassification" value={formData.degreeClassification} onChange={handleChange} options={DEGREE_CLASSIFICATIONS} placeholder="Chọn loại" required error={errors.degreeClassification} />
                    <SelectField label="Hệ tốt nghiệp" id="graduationSystem" name="graduationSystem" value={formData.graduationSystem} onChange={handleChange} options={GRADUATION_SYSTEMS} placeholder="Chọn hệ" required error={errors.graduationSystem} />
                    <div className="lg:col-span-3">
                        <SelectField label="Giấy chứng nhận hoàn thành bổ sung kiến thức" id="supplementaryCert" name="supplementaryCert" value={formData.supplementaryCert} onChange={handleChange} options={['Có', 'Không']} placeholder="Chọn..." required error={errors.supplementaryCert} />
                    </div>
                </div>
            </div>
            
            <div className="border-b pb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">IV. Thông tin về trình độ ngoại ngữ</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SelectField label="Ngoại ngữ" id="language" name="language" value={formData.language} onChange={handleChange} options={LANGUAGES} placeholder="Chọn ngoại ngữ" required error={errors.language} />
                    <SelectField label="Loại bằng/chứng chỉ" id="languageCertType" name="languageCertType" value={formData.languageCertType} onChange={handleChange} options={LANGUAGE_CERT_TYPES} placeholder="Chọn loại"/>
                    <InputField label="Nơi cấp" id="languageCertIssuer" name="languageCertIssuer" value={formData.languageCertIssuer} onChange={handleChange}/>
                    <InputField ref={languageScoreRef} label="Điểm ngoại ngữ" id="languageScore" name="languageScore" type="text" value={formData.languageScore} onChange={handleChange} onBlur={handleNumericBlur} error={errors.languageScore} placeholder="Ví dụ: 6.50"/>
                    <InputField ref={languageCertDateRef} label="Ngày cấp" id="languageCertDate" name="languageCertDate" type="text" placeholder="DD/MM/YYYY" value={formData.languageCertDate} onChange={handleChange} error={errors.languageCertDate} />
                </div>
            </div>
            
            <div className="border-b pb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">V. Thông tin về điểm thưởng (nếu có) *</h2>
                <div className="pl-4 md:pl-6 space-y-6">
                    <SelectField 
                        label="1. Thành tích và giải thưởng nghiên cứu khoa học" 
                        id="researchAchievements" 
                        name="researchAchievements" 
                        value={formData.researchAchievements} 
                        onChange={handleChange} 
                        options={RESEARCH_ACHIEVEMENT_CATEGORIES} 
                        required error={errors.researchAchievements} 
                    />
                    <SelectField 
                        label="2. Các thành tích khác" 
                        id="otherAchievements" 
                        name="otherAchievements" 
                        value={formData.otherAchievements} 
                        onChange={handleChange} 
                        options={OTHER_ACHIEVEMENT_CATEGORIES} 
                        required 
                        error={errors.otherAchievements} 
                    />
                </div>
            </div>

            <div className="border-b pb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">VI. Thông tin về đối tượng ưu tiên (nếu có) *</h2>
                <SelectField 
                    label="Đối tượng ưu tiên" 
                    id="priorityCategory" 
                    name="priorityCategory" 
                    value={formData.priorityCategory} 
                    onChange={handleChange} 
                    options={PRIORITY_CATEGORIES} 
                    required error={errors.priorityCategory} 
                />
            </div>
            
            <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">VII. Chính sách học bổng (nếu có) *</h2>
                <SelectField 
                    label="Chính sách học bổng" 
                    id="scholarshipPolicy" 
                    name="scholarshipPolicy" 
                    value={formData.scholarshipPolicy} 
                    onChange={handleChange} 
                    options={SCHOLARSHIP_POLICIES} 
                    required error={errors.scholarshipPolicy} 
                />
            </div>


            <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors disabled:bg-green-300">
                {isSubmitting ? 'Đang lưu...' : 'Lưu thông tin'}
                </button>
                <button type="button" onClick={handlePrint} className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition-colors">
                In thông tin
                </button>
                <button type="button" onClick={handleQrCodeClick} className="px-6 py-2 bg-gray-800 text-white font-semibold rounded-md hover:bg-black transition-colors">
                QR Code lệ phí
                </button>
            </div>
            </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const InputField = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string, error?: string, required?: boolean }>(({ label, id, error, required, ...props }, ref) => {
    const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500';
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input ref={ref} id={id} {...props} className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm disabled:bg-gray-100 ${errorClasses}`} />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
});
InputField.displayName = "InputField";

export default ApplicationFormPage;