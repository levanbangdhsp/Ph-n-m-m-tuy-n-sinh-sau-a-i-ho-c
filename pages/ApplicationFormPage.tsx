import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { User, ApplicationFormData } from '../types';
import SelectField from '../components/SelectField';
import RadioGroup from '../components/RadioGroup';
import TextAreaField from '../components/TextAreaField';
import SparklesIcon from '../components/icons/SparklesIcon';
import Alert from '../components/Alert';
import { CITIES, NATIONALITIES, ETHNICITIES, GENDERS, MAJORS, DEGREE_CLASSIFICATIONS, GRADUATION_SYSTEMS, LANGUAGES, LANGUAGE_CERT_TYPES, TRAINING_FACILITIES } from '../constants';

interface ApplicationFormPageProps {
  user: User;
  onLogout: () => void;
  navigateBack: () => void;
}

const applicationFormSchema = {
    type: Type.OBJECT,
    properties: {
        fullName: { type: Type.STRING, description: "Full name of the applicant."},
        gender: { type: Type.STRING, description: "Gender of the applicant (Nam, Nữ, or Khác)."},
        dob: { type: Type.STRING, description: "Date of birth in DD/MM/YYYY format."},
        pob: { type: Type.STRING, description: "Place of birth (City name)."},
        ethnicity: { type: Type.STRING, description: "Applicant's ethnicity."},
        nationality: { type: Type.STRING, description: "Applicant's nationality."},
        idCardNumber: { type: Type.STRING, description: "National ID card number."},
        idCardIssueDate: { type: Type.STRING, description: "ID card issue date in DD/MM/YYYY format."},
        idCardIssuePlace: { type: Type.STRING, description: "Place where the ID card was issued."},
        phone: { type: Type.STRING, description: "Applicant's phone number."},
        contactAddress: { type: Type.STRING, description: "Current contact address."},
        workplace: { type: Type.STRING, description: "Current workplace or company."},
        trainingFacility: { type: Type.STRING, description: "The training facility or university they are applying to."},
        firstChoiceMajor: { type: Type.STRING, description: "First choice of major."},
        secondChoiceMajor: { type: Type.STRING, description: "Second choice of major."},
        thirdChoiceMajor: { type: Type.STRING, description: "Third choice of major."},
        firstChoiceOrientation: { type: Type.STRING, description: "Orientation for the first choice major ('research' or 'applied')."},
        secondChoiceOrientation: { type: Type.STRING, description: "Orientation for the second choice major ('research' or 'applied')."},
        thirdChoiceOrientation: { type: Type.STRING, description: "Orientation for the third choice major ('research' or 'applied')."},
        university: { type: Type.STRING, description: "University from which the applicant graduated."},
        graduationYear: { type: Type.STRING, description: "Year of university graduation."},
        gpa10: { type: Type.STRING, description: "GPA on a 10-point scale."},
        gpa4: { type: Type.STRING, description: "GPA on a 4-point scale."},
        graduationMajor: { type: Type.STRING, description: "Major of study at university."},
        degreeClassification: { type: Type.STRING, description: "Degree classification (e.g., Excellent, Good)."},
        graduationSystem: { type: Type.STRING, description: "The system of study (e.g., Full-time, Part-time)."},
        supplementaryCert: { type: Type.STRING, description: "Details about any supplementary certificates."},
        language: { type: Type.STRING, description: "Foreign language proficiency (e.g., English, French)."},
        languageCertType: { type: Type.STRING, description: "Type of language certificate (e.g., IELTS, TOEFL)."},
        languageCertIssuer: { type: Type.STRING, description: "Issuer of the language certificate."},
        languageScore: { type: Type.STRING, description: "Score obtained on the language test."},
        languageCertDate: { type: Type.STRING, description: "Date the language certificate was issued in DD/MM/YYYY format."},
    },
};

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzC3eVx1nX2dW1i7Z45PqUNvTba0OgJay6sWkEPtX0YKAU-zu0LFY_hsKiJotHkbqhC/exec';


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
    supplementaryCert: '',
    language: '',
    languageCertType: '',
    languageCertIssuer: '',
    languageScore: '',
    languageCertDate: '',
    bonusPoints: 'Không',
    priorityCategory: 'Không',
    scholarshipPolicy: 'Không',
  };

  const [formData, setFormData] = useState<ApplicationFormData>(initialFormState);
  const [aiInputText, setAiInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiMessageType, setAiMessageType] = useState<'success' | 'error'>('error');
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitMessageType, setSubmitMessageType] = useState<'success' | 'error'>('error');
  const [errors, setErrors] = useState<Partial<Record<keyof ApplicationFormData, string>>>({});

  // Refs for focusing on validation error
  const dobRef = useRef<HTMLInputElement>(null);
  const idCardNumberRef = useRef<HTMLInputElement>(null);
  const idCardIssueDateRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const languageCertDateRef = useRef<HTMLInputElement>(null);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ApplicationFormData]) {
      setErrors(prev => ({...prev, [name]: ''}));
    }
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value as 'research' | 'applied' }));
  };
  
  const handleAiFill = async () => {
    if (!aiInputText.trim()) {
      setAiMessage('Vui lòng nhập thông tin vào ô CV/Sơ yếu lý lịch.');
      setAiMessageType('error');
      return;
    }
    setIsAiLoading(true);
    setAiMessage('');
    setAiMessageType('error');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Bạn là một trợ lý tuyển sinh chuyên nghiệp. Nhiệm vụ của bạn là phân tích văn bản do người dùng cung cấp (ví dụ: CV, sơ yếu lý lịch) và trích xuất thông tin để điền vào đơn đăng ký sau đại học.
      Vui lòng trả về dữ liệu được trích xuất ở định dạng JSON tuân thủ theo cấu trúc đã cho. Nếu không tìm thấy một thông tin nào đó trong văn bản, hãy để trống trường tương ứng hoặc trả về giá trị null.
      
      Dưới đây là văn bản của người dùng:
      ---
      ${aiInputText}
      ---
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: applicationFormSchema,
        },
      });
      
      const jsonStr = response.text.trim();
      const extractedData = JSON.parse(jsonStr);

      const updatedFields: Partial<ApplicationFormData> = {};
      for (const key in extractedData) {
          if (Object.prototype.hasOwnProperty.call(extractedData, key) && extractedData[key]) {
              updatedFields[key as keyof ApplicationFormData] = extractedData[key];
          }
      }

      setFormData(prev => ({ ...prev, ...updatedFields }));
      setAiMessage('Đã điền thông tin thành công! Vui lòng kiểm tra lại.');
      setAiMessageType('success');

    } catch (error) {
      console.error("AI Fill Error:", error);
      setAiMessage('Đã xảy ra lỗi khi sử dụng AI để điền thông tin. Vui lòng thử lại.');
      setAiMessageType('error');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Helper to create a cache-busting URL
  const getUrlWithCacheBuster = () => {
    return `${SCRIPT_URL}?v=${new Date().getTime()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setErrors({});

    // --- VALIDATION ---
    const newErrors: Partial<Record<keyof ApplicationFormData, string>> = {};
    let firstErrorRef: React.RefObject<HTMLInputElement> | null = null;
    
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

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsSubmitting(false);
        if (firstErrorRef?.current) {
            firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstErrorRef.current.focus();
        }
        return;
    }

    // --- DATA FORMATTING ---
    const mapOrientation = (orientation: 'research' | 'applied' | '') => {
        if (orientation === 'research') return 'Nghiên cứu';
        if (orientation === 'applied') return 'Ứng dụng';
        return '';
    };

    const sheetData = {
        'ID': user.id,
        'Email': user.email,
        'Họ và tên': formData.fullName,
        'Số điện thoại': `'${formData.phone.trim()}`,
        'Giới tính': formData.gender,
        'Địa chỉ liên hệ': formData.contactAddress,
        'Cơ quan công tác': formData.workplace,
        'Ngày sinh': formData.dob,
        'Nơi sinh': formData.pob,
        'Dân tộc': formData.ethnicity,
        'Quốc tịch': formData.nationality,
        'Trường tốt nghiệp ĐH': formData.university,
        'Năm TN': formData.graduationYear,
        'Điểm TB (hệ 10)': formData.gpa10,
        'Điểm TB (hệ 4)': formData.gpa4,
        'Loại TN': formData.degreeClassification,
        'Hệ TN': formData.graduationSystem,
        'Ngành TN': formData.graduationMajor,
        'Ngoại ngữ': formData.language,
        'Loại bằng NN': formData.languageCertType,
        'Trường cấp bằng NN': formData.languageCertIssuer,
        'Điểm NN': formData.languageScore,
        'Ngày cấp NN': formData.languageCertDate,
        'Số CCCD': formData.idCardNumber,
        'Ngày cấp CCCD': formData.idCardIssueDate,
        'Nơi cấp CCCD': formData.idCardIssuePlace,
        'Ưu tiên': formData.priorityCategory,
        'Nghiên cứu khoa học': formData.bonusPoints,
        'Nguyện vọng 1': formData.firstChoiceMajor,
        'Định hướng NV1': mapOrientation(formData.firstChoiceOrientation),
        'Nguyện vọng 2': formData.secondChoiceMajor,
        'Định hướng NV2': mapOrientation(formData.secondChoiceOrientation),
        'Nguyện vọng 3': formData.thirdChoiceMajor,
        'Định hướng NV3': mapOrientation(formData.thirdChoiceOrientation),
        'Học bổng': formData.scholarshipPolicy,
        'Bổ sung kiến thức': formData.supplementaryCert,
        'Cơ sở đào tạo': formData.trainingFacility,
    };

    const payload = {
        action: 'submitApplication',
        sheetName: 'DataDangky',
        email: user.email,
        ...sheetData
    };

    try {
        const response = await fetch(getUrlWithCacheBuster(), {
            method: 'POST',
            cache: 'no-cache',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'success' || result.success) {
            setSubmitMessage('Thông tin đã được lưu thành công!');
            setSubmitMessageType('success');
        } else {
            setSubmitMessage(`Lưu thông tin thất bại: ${result.message || 'Lỗi không xác định'}`);
            setSubmitMessageType('error');
        }
    } catch (error) {
        console.error('Application submission error:', error);
        setSubmitMessage('Đã có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.');
        setSubmitMessageType('error');
    } finally {
        setIsSubmitting(false);
        window.scrollTo(0, 0); // Scroll to top to show the message
    }
  };
  
  const handlePrint = () => {
      window.print();
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 border-b pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-sky-800 uppercase">Đăng ký hồ sơ dự tuyển</h1>
            <p className="text-gray-600 mt-1">Chào mừng, {user.fullName}!</p>
          </div>
          <div className="flex items-center gap-2 mt-4 sm:mt-0 flex-shrink-0">
            <button type="button" onClick={navigateBack} className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors text-sm">
              Về Trang chủ
            </button>
            <button type="button" onClick={onLogout} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors text-sm">
              Đăng xuất
            </button>
          </div>
        </div>
        
        {submitMessage && (
          <div className="mb-6">
            <Alert type={submitMessageType} message={submitMessage} onClose={() => setSubmitMessage('')} />
          </div>
        )}

        <div className="mb-8 p-6 bg-sky-50 border border-sky-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <SparklesIcon className="w-8 h-8 text-sky-600" />
            <h2 className="text-xl font-semibold text-gray-800">Trợ lý AI - Điền hồ sơ nhanh</h2>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            Dán nội dung CV hoặc sơ yếu lý lịch của bạn vào đây, AI sẽ giúp bạn điền các thông tin tương ứng vào biểu mẫu bên dưới một cách nhanh chóng.
          </p>
          
          {aiMessage && <Alert type={aiMessageType} message={aiMessage} onClose={() => setAiMessage('')} />}

          <TextAreaField 
            id="aiInput"
            label=""
            value={aiInputText}
            onChange={(e) => setAiInputText(e.target.value)}
            placeholder="Dán CV/Sơ yếu lý lịch của bạn tại đây..."
            rows={6}
          />
          <button
            type="button"
            onClick={handleAiFill}
            disabled={isAiLoading}
            className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-600 text-white font-semibold rounded-md hover:from-sky-600 hover:to-cyan-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAiLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>AI đang phân tích...</span>
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5" />
                <span>Điền hồ sơ với AI</span>
              </>
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section I */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">I. Thông tin người dự tuyển</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField label="Họ và tên" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} />
              <SelectField label="Giới tính" id="gender" value={formData.gender} onChange={handleChange} options={GENDERS} placeholder="Chọn giới tính" />
              <InputField ref={dobRef} label="Ngày sinh" id="dob" name="dob" type="text" placeholder="DD/MM/YYYY" value={formData.dob} onChange={handleChange} error={errors.dob} />
              <SelectField label="Nơi sinh" id="pob" value={formData.pob} onChange={handleChange} options={CITIES} placeholder="Chọn nơi sinh"/>
              <SelectField label="Dân tộc" id="ethnicity" value={formData.ethnicity} onChange={handleChange} options={ETHNICITIES} placeholder="Chọn dân tộc"/>
              <SelectField label="Quốc tịch" id="nationality" value={formData.nationality} onChange={handleChange} options={NATIONALITIES} placeholder="Chọn quốc tịch"/>
              <InputField ref={idCardNumberRef} label="Số CCCD" id="idCardNumber" name="idCardNumber" value={formData.idCardNumber} onChange={handleChange} error={errors.idCardNumber} />
              <InputField ref={idCardIssueDateRef} label="Ngày cấp" id="idCardIssueDate" name="idCardIssueDate" type="text" placeholder="DD/MM/YYYY" value={formData.idCardIssueDate} onChange={handleChange} error={errors.idCardIssueDate} />
              <InputField label="Nơi cấp" id="idCardIssuePlace" name="idCardIssuePlace" value={formData.idCardIssuePlace} onChange={handleChange} />
              <InputField ref={phoneRef} label="Số điện thoại" id="phone" name="phone" value={formData.phone} onChange={handleChange} error={errors.phone} />
              <div className="lg:col-span-2">
                 <InputField label="Email" id="email" name="email" value={formData.email} onChange={handleChange} disabled />
              </div>
              <InputField label="Địa chỉ liên hệ" id="contactAddress" name="contactAddress" value={formData.contactAddress} onChange={handleChange} />
              <div className="lg:col-span-2">
                <InputField label="Cơ quan công tác" id="workplace" name="workplace" value={formData.workplace} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Section II */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">II. Thông tin đăng ký dự tuyển</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <SelectField label="Cơ sở đào tạo" id="trainingFacility" value={formData.trainingFacility} onChange={handleChange} options={TRAINING_FACILITIES} placeholder="Chọn cơ sở" />
                 <div></div>
                 <SelectField label="Nguyện vọng 1" id="firstChoiceMajor" value={formData.firstChoiceMajor} onChange={handleChange} options={MAJORS} placeholder="Chọn ngành"/>
                 <RadioGroup label="Định hướng" name="firstChoiceOrientation" selectedValue={formData.firstChoiceOrientation} onChange={handleRadioChange} options={[{value: 'research', label: 'Nghiên cứu'}, {value: 'applied', label: 'Ứng dụng'}]} />
                 <SelectField label="Nguyện vọng 2" id="secondChoiceMajor" value={formData.secondChoiceMajor} onChange={handleChange} options={MAJORS} placeholder="Chọn ngành"/>
                 <RadioGroup label="Định hướng" name="secondChoiceOrientation" selectedValue={formData.secondChoiceOrientation} onChange={handleRadioChange} options={[{value: 'research', label: 'Nghiên cứu'}, {value: 'applied', label: 'Ứng dụng'}]} />
                 <SelectField label="Nguyện vọng 3" id="thirdChoiceMajor" value={formData.thirdChoiceMajor} onChange={handleChange} options={MAJORS} placeholder="Chọn ngành"/>
                 <RadioGroup label="Định hướng" name="thirdChoiceOrientation" selectedValue={formData.thirdChoiceOrientation} onChange={handleRadioChange} options={[{value: 'research', label: 'Nghiên cứu'}, {value: 'applied', label: 'Ứng dụng'}]} />
             </div>
          </div>
          
          {/* Section III */}
          <div className="border-b pb-6">
             <h2 className="text-xl font-semibold text-gray-700 mb-4">III. Thông tin về văn bằng</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <InputField label="Trường tốt nghiệp đại học" id="university" name="university" value={formData.university} onChange={handleChange}/>
                </div>
                 <InputField label="Năm tốt nghiệp" id="graduationYear" name="graduationYear" type="number" value={formData.graduationYear} onChange={handleChange}/>
                 <InputField label="Điểm TB (hệ 10)" id="gpa10" name="gpa10" type="number" value={formData.gpa10} onChange={handleChange}/>
                 <InputField label="Điểm TB (hệ 4)" id="gpa4" name="gpa4" type="number" value={formData.gpa4} onChange={handleChange}/>
                  <div className="lg:col-span-1"></div>
                 <InputField label="Ngành tốt nghiệp" id="graduationMajor" name="graduationMajor" value={formData.graduationMajor} onChange={handleChange}/>
                 <SelectField label="Loại tốt nghiệp" id="degreeClassification" value={formData.degreeClassification} onChange={handleChange} options={DEGREE_CLASSIFICATIONS} placeholder="Chọn loại"/>
                 <SelectField label="Hệ tốt nghiệp" id="graduationSystem" value={formData.graduationSystem} onChange={handleChange} options={GRADUATION_SYSTEMS} placeholder="Chọn hệ"/>
                 <div className="lg:col-span-3">
                    <InputField label="Giấy chứng nhận hoàn thành chương trình bổ sung kiến thức" id="supplementaryCert" name="supplementaryCert" value={formData.supplementaryCert} onChange={handleChange}/>
                 </div>
             </div>
          </div>
          
           {/* Section IV */}
          <div className="border-b pb-6">
             <h2 className="text-xl font-semibold text-gray-700 mb-4">IV. Thông tin về trình độ ngoại ngữ</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <SelectField label="Ngoại ngữ" id="language" value={formData.language} onChange={handleChange} options={LANGUAGES} placeholder="Chọn ngoại ngữ"/>
                 <SelectField label="Loại bằng/chứng chỉ" id="languageCertType" value={formData.languageCertType} onChange={handleChange} options={LANGUAGE_CERT_TYPES} placeholder="Chọn loại"/>
                 <InputField label="Nơi cấp" id="languageCertIssuer" name="languageCertIssuer" value={formData.languageCertIssuer} onChange={handleChange}/>
                 <InputField label="Điểm ngoại ngữ" id="languageScore" name="languageScore" type="number" value={formData.languageScore} onChange={handleChange}/>
                 <InputField ref={languageCertDateRef} label="Ngày cấp" id="languageCertDate" name="languageCertDate" type="text" placeholder="DD/MM/YYYY" value={formData.languageCertDate} onChange={handleChange} error={errors.languageCertDate} />
             </div>
          </div>
          
          {/* Other sections */}
           <InputField label="V. Thông tin về điểm thưởng (nếu có)" id="bonusPoints" name="bonusPoints" value={formData.bonusPoints} onChange={handleChange} />
           <InputField label="VI. Thông tin về đối tượng ưu tiên (nếu có)" id="priorityCategory" name="priorityCategory" value={formData.priorityCategory} onChange={handleChange} />
           <InputField label="VII. Chính sách học bổng (nếu có)" id="scholarshipPolicy" name="scholarshipPolicy" value={formData.scholarshipPolicy} onChange={handleChange} />


          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors disabled:bg-green-300">
              {isSubmitting ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
            <button type="button" onClick={handlePrint} className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition-colors">
              In thông tin
            </button>
             <button type="button" onClick={() => alert('QR Code functionality to be implemented.')} className="px-6 py-2 bg-gray-800 text-white font-semibold rounded-md hover:bg-black transition-colors">
              QR Code lệ phí
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string, error?: string }>(({ label, id, error, ...props }, ref) => {
    const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500';
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input ref={ref} id={id} {...props} className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm disabled:bg-gray-100 ${errorClasses}`} />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
});
InputField.displayName = "InputField";

export default ApplicationFormPage;
