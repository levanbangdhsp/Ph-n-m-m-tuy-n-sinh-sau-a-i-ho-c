import React, { useState, useEffect, useRef } from 'react';
import { Page } from '../types';
import InputField from './InputField';
import { useMockAuth } from '../hooks/useMockAuth';
import Alert from './Alert';
import { validatePassword, PasswordValidationResult } from '../utils/validation';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

interface RegisterFormProps {
  navigate: (page: Page) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ navigate }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult | null>(null);

  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const { register, loading } = useMockAuth();
  
  useEffect(() => {
    if (password) {
      setPasswordValidation(validatePassword(password));
    } else {
      setPasswordValidation(null);
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    const validationErrorMsg = "Vui lòng điền thông tin đầy đủ vào ô này.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10,}$/;

    if (!fullName.trim()) {
        setMessage(validationErrorMsg);
        setMessageType('error');
        fullNameRef.current?.focus();
        return;
    }
    if (!email.trim()) {
        setMessage(validationErrorMsg);
        setMessageType('error');
        emailRef.current?.focus();
        return;
    }
    if (!emailRegex.test(email)) {
        setMessage("Định dạng email không hợp lệ. Vui lòng kiểm tra lại.");
        setMessageType('error');
        emailRef.current?.focus();
        return;
    }
    if (!password.trim()) {
        setMessage(validationErrorMsg);
        setMessageType('error');
        passwordRef.current?.focus();
        return;
    }
    if (!confirmPassword.trim()) {
        setMessage(validationErrorMsg);
        setMessageType('error');
        confirmPasswordRef.current?.focus();
        return;
    }
    if (!phone.trim()) {
        setMessage(validationErrorMsg);
        setMessageType('error');
        phoneRef.current?.focus();
        return;
    }
    if (!phoneRegex.test(phone.trim())) {
        setMessage("Số điện thoại không hợp lệ. Vui lòng chỉ nhập số và đảm bảo có ít nhất 10 chữ số.");
        setMessageType('error');
        phoneRef.current?.focus();
        return;
    }

    const currentPasswordValidation = validatePassword(password);
    setPasswordValidation(currentPasswordValidation);

    if (!currentPasswordValidation.valid) {
      setMessage('Mật khẩu của bạn chưa đáp ứng đủ các yêu cầu bảo mật.');
      setMessageType('error');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Mật khẩu nhập lại không khớp.');
      setMessageType('error');
      return;
    }

    const result = await register(fullName, email, phone, password);
    setMessage(result.message);
    setMessageType(result.success ? 'success' : 'error');
    if (result.success) {
      setFullName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate(Page.Login), 10000);
    }
  };

  return (
    <div>
      <div className="bg-green-600 text-white text-center py-4">
        <h2 className="text-2xl font-bold">ĐĂNG KÝ TÀI KHOẢN</h2>
      </div>
      <div className="p-8">
        {message && <Alert type={messageType} message={message} onClose={() => setMessage('')} />}
        
        <form onSubmit={handleSubmit} noValidate>
          <InputField ref={fullNameRef} id="fullName" label="Họ tên:" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <InputField ref={emailRef} id="email" label="Email:" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <InputField ref={passwordRef} id="password" label="Mật khẩu:" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          
          {passwordValidation && <PasswordStrengthIndicator validationResult={passwordValidation} />}

          <InputField ref={confirmPasswordRef} id="confirmPassword" label="Nhập lại mật khẩu:" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <InputField ref={phoneRef} id="phone" label="Số điện thoại:" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-200 disabled:bg-green-300"
          >
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); navigate(Page.Login); }} className="font-medium text-sky-600 hover:underline">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
