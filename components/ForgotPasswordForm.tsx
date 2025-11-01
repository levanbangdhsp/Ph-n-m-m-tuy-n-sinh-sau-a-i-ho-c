import React, { useState } from 'react';
import { Page } from '../types';
import InputField from './InputField';
import { useMockAuth } from '../hooks/useMockAuth';
import Alert from './Alert';
import { validatePassword } from '../utils/validation';

interface ForgotPasswordFormProps {
  navigate: (page: Page) => void;
}

type ForgotPasswordStep = 'enterEmail' | 'enterOtp' | 'resetPassword';

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ navigate }) => {
  const [step, setStep] = useState<ForgotPasswordStep>('enterEmail');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  
  const { checkEmailExists, updatePassword, loading } = useMockAuth();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const result = await checkEmailExists(email);
    setMessage(result.message);
    if(result.exists) {
        setMessageType('success');
        setStep('enterOtp');
    } else {
        setMessageType('error');
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    // Mock OTP check
    if (otp === '819434') { 
      setMessage('Xác nhận OTP thành công.');
      setMessageType('success');
      setStep('resetPassword');
    } else {
      setMessage('Mã OTP không đúng.');
      setMessageType('error');
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
        setMessage('Mật khẩu mới không đáp ứng yêu cầu bảo mật. Vui lòng kiểm tra lại.');
        setMessageType('error');
        return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Mật khẩu không khớp.');
      setMessageType('error');
      return;
    }
    
    const result = await updatePassword(email, newPassword);
    setMessage(result.message);
    setMessageType(result.success ? 'success' : 'error');
    if (result.success) {
      setTimeout(() => navigate(Page.Login), 2000);
    }
  };

  return (
    <div>
      <div className="bg-green-600 text-white text-center py-4">
        <h2 className="text-2xl font-bold">Quên mật khẩu</h2>
      </div>
      <div className="p-8">
        {message && <Alert type={messageType} message={message} onClose={() => setMessage('')} />}
        
        {step === 'enterEmail' && (
          <form onSubmit={handleEmailSubmit}>
            <InputField id="email" label="Email:" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Nhập email của bạn" required />
            <button type="submit" disabled={loading} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md disabled:bg-green-300">
              {loading ? 'Đang kiểm tra...' : 'Gửi yêu cầu'}
            </button>
          </form>
        )}

        {step === 'enterOtp' && (
          <form onSubmit={handleOtpSubmit}>
              <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                  <input value={email} disabled className="shadow-sm bg-gray-100 appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight" />
              </div>
              <InputField id="otp" label="Nhập mã OTP:" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Mã OTP..." required />
              <button type="submit" className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md">
                  Xác nhận OTP
              </button>
          </form>
        )}

        {step === 'resetPassword' && (
          <form onSubmit={handlePasswordResetSubmit}>
             <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                <input value={email} disabled className="shadow-sm bg-gray-100 appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight" />
            </div>
            <InputField id="newPassword" label="Mật khẩu mới:" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            <InputField id="confirmPassword" label="Nhập lại mật khẩu mới:" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            <button type="submit" disabled={loading} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md disabled:bg-green-300">
                {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
        </form>
        )}

        <p className="text-center mt-4 text-sm text-gray-600">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate(Page.Login); }} className="font-medium text-sky-600 hover:underline">
            Quay lại Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;