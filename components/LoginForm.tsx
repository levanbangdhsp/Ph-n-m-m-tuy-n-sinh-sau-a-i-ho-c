import React, { useState, useRef } from 'react';
import { Page } from '../types';
import InputField from './InputField';
import { useMockAuth } from '../hooks/useMockAuth';
import Alert from './Alert';
import { User } from '../types';

interface LoginFormProps {
  navigate: (page: Page) => void;
  onLoginSuccess: (user: User) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ navigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useMockAuth();

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationErrorMsg = "Vui lòng điền thông tin đầy đủ vào ô này.";

    if (!email.trim()) {
      setError(validationErrorMsg);
      emailRef.current?.focus();
      return;
    }

    if (!password.trim()) {
      setError(validationErrorMsg);
      passwordRef.current?.focus();
      return;
    }

    const result = await login(email, password);
    if (result.success && result.user) {
      onLoginSuccess(result.user);
    } else {
      setError(result.message);
    }
  };

  return (
    <div>
        <div className="bg-sky-600 text-white text-center py-4">
            <h2 className="text-2xl font-bold">Đăng nhập tài khoản</h2>
        </div>
        <div className="p-8">
            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            <form onSubmit={handleSubmit} noValidate>
                <InputField ref={emailRef} id="email" label="Email:" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <InputField ref={passwordRef} id="password" label="Mật khẩu:" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <div className="flex items-center justify-between mt-6">
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate(Page.ForgotPassword); }} className="text-sm text-sky-600 hover:underline">
                        Quên mật khẩu?
                    </a>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-200 disabled:bg-sky-300"
                >
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
                <p className="text-center mt-4 text-sm text-gray-600">
                    Chưa có tài khoản?{' '}
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate(Page.Register); }} className="font-medium text-sky-600 hover:underline">
                        Đăng ký ngay
                    </a>
                </p>
            </form>
        </div>
    </div>
  );
};

export default LoginForm;