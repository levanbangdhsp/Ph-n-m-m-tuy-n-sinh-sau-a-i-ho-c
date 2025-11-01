import React, { useState, useEffect } from 'react';
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
      setTimeout(() => navigate(Page.Login), 2000);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-blue-600">ĐĂNG KÝ TÀI KHOẢN</h2>
      </div>
      
      {message && <Alert type={messageType} message={message} onClose={() => setMessage('')} />}
      
      <form onSubmit={handleSubmit}>
        <InputField id="fullName" label="Họ tên:" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <InputField id="email" label="Email:" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <InputField id="password" label="Mật khẩu:" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        
        {passwordValidation && <PasswordStrengthIndicator validationResult={passwordValidation} />}

        <InputField id="confirmPassword" label="Nhập lại mật khẩu:" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        <InputField id="phone" label="Số điện thoại:" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        
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
        <a href="#" onClick={(e) => { e.preventDefault(); navigate(Page.Login); }} className="font-medium text-blue-600 hover:underline">
          Đăng nhập
        </a>
      </p>
    </div>
  );
};

export default RegisterForm;