import React, { useState, useEffect, useRef } from 'react';
import { Page } from '../types';
import InputField from './InputField';
import { useMockAuth } from '../hooks/useMockAuth';
import Alert from './Alert';
import { validatePassword } from '../utils/validation';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

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
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  const { requestOtp, verifyOtp, resetPassword, loading } = useMockAuth();
  
  const emailRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  // Fix: Explicitly initialize useRef with `undefined` to resolve "Expected 1 arguments, but got 0" error.
  const countdownIntervalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (step === 'enterOtp') {
      setIsResendDisabled(true);
      setCountdown(600);
      countdownIntervalRef.current = window.setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            window.clearInterval(countdownIntervalRef.current);
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => window.clearInterval(countdownIntervalRef.current);
  }, [step]);
  
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    if (!email.trim()) {
      setMessage('Vui lòng điền đầy đủ thông tin vào ô này!');
      setMessageType('error');
      emailRef.current?.focus();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại.');
      setMessageType('error');
      emailRef.current?.focus();
      return;
    }

    const result = await requestOtp(email);
    if (result.success) {
      setMessage(result.message || 'Mã OTP đã được gửi. Vui lòng kiểm tra email.');
      setMessageType('success');
      setStep('enterOtp');
    } else {
      setMessage(result.message || 'Không thể gửi OTP. Vui lòng thử lại.');
      setMessageType('error');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!otp.trim()) {
      setMessage('Vui lòng điền đầy đủ thông tin vào ô này!');
      setMessageType('error');
      otpRef.current?.focus();
      return;
    }

    const result = await verifyOtp(email, otp);
    if (result.success) {
      setMessage(result.message || 'Xác thực OTP thành công. Vui lòng đặt mật khẩu mới.');
      setMessageType('success');
      setStep('resetPassword');
      window.clearInterval(countdownIntervalRef.current);
    } else {
      setMessage(result.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
      setMessageType('error');
    }
  };
  
  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!newPassword.trim()) {
      setMessage('Vui lòng điền đầy đủ thông tin vào ô này!');
      setMessageType('error');
      newPasswordRef.current?.focus();
      return;
    }
    if (!confirmPassword.trim()) {
      setMessage('Vui lòng điền đầy đủ thông tin vào ô này!');
      setMessageType('error');
      confirmPasswordRef.current?.focus();
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      setMessage('Mật khẩu mới không đáp ứng yêu cầu bảo mật.');
      setMessageType('error');
      newPasswordRef.current?.focus();
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('Mật khẩu không khớp.');
      setMessageType('error');
      confirmPasswordRef.current?.focus();
      return;
    }
    const result = await resetPassword(email, otp, newPassword);
    setMessage(result.message);
    setMessageType(result.success ? 'success' : 'error');
    if (result.success) {
      setTimeout(() => navigate(Page.Login), 3000);
    }
  };

  const handleResendOtp = async () => {
     await handleEmailSubmit(new Event('submit') as any);
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <div className="bg-sky-600 text-white text-center py-4">
        <h2 className="text-2xl font-bold">Quên mật khẩu</h2>
      </div>
      <div className="p-8">
        {message && <Alert type={messageType} message={message} onClose={() => setMessage('')} />}
        
        {step === 'enterEmail' && (
          <form onSubmit={handleEmailSubmit} noValidate>
            <p className="text-sm text-gray-600 mb-4">Nhập email đã đăng ký để nhận mã OTP đặt lại mật khẩu.</p>
            <InputField ref={emailRef} id="email" label="Email:" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit" disabled={loading} className="w-full mt-4 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-md disabled:bg-sky-300">
              {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
          </form>
        )}

        {step === 'enterOtp' && (
          <form onSubmit={handleOtpSubmit} noValidate>
            <p className="text-sm text-gray-600 mb-4">Một mã OTP đã được gửi tới <strong>{email}</strong>. Mã sẽ hết hạn sau {formatTime(countdown)}.</p>
            <InputField ref={otpRef} id="otp" label="Mã OTP:" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required />
            <div className="flex items-center justify-between mt-4">
                 <button type="submit" disabled={loading || countdown === 0} className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-md disabled:bg-sky-300">
                    {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
                </button>
            </div>
             <div className="text-center mt-4">
                <button type="button" onClick={handleResendOtp} disabled={isResendDisabled || loading} className="text-sm text-sky-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed">
                    {loading ? '...' : 'Gửi lại mã OTP'}
                </button>
            </div>
          </form>
        )}

        {step === 'resetPassword' && (
          <form onSubmit={handlePasswordResetSubmit} noValidate>
            <p className="text-sm text-gray-600 mb-4">Vui lòng tạo mật khẩu mới cho tài khoản <strong>{email}</strong>.</p>
            <InputField ref={newPasswordRef} id="newPassword" label="Mật khẩu mới:" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            {newPassword && <PasswordStrengthIndicator validationResult={validatePassword(newPassword)} />}
            <InputField ref={confirmPasswordRef} id="confirmPassword" label="Nhập lại mật khẩu mới:" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            <button type="submit" disabled={loading} className="w-full mt-4 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-md disabled:bg-sky-300">
              {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
          </form>
        )}

        <p className="text-center mt-6 text-sm text-gray-600">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate(Page.Login); }} className="font-medium text-sky-600 hover:underline">
            Quay lại Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
