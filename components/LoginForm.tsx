
import React, { useState } from 'react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success && result.user) {
      onLoginSuccess(result.user);
    } else {
      setError(result.message);
    }
  };

  return (
    <div>
        <h2 className="text-center text-2xl font-bold text-blue-600 mb-6">Đăng nhập tài khoản</h2>
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        <form onSubmit={handleSubmit}>
            <InputField id="email" label="Email:" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <InputField id="password" label="Mật khẩu:" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <div className="flex items-center justify-between mt-6">
                <a href="#" onClick={(e) => { e.preventDefault(); navigate(Page.ForgotPassword); }} className="text-sm text-blue-600 hover:underline">
                    Quên mật khẩu?
                </a>
            </div>
            <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-200 disabled:bg-blue-300"
            >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
            <p className="text-center mt-4 text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); navigate(Page.Register); }} className="font-medium text-blue-600 hover:underline">
                    Đăng ký ngay
                </a>
            </p>
        </form>
    </div>
  );
};

export default LoginForm;
