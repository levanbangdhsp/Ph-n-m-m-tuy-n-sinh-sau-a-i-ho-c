import { useState } from 'react';
import { User } from '../types';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyM8Tv6HFfGjMeRweutboOoz89Ex3HvCO2NN05J4W74M3vcuLp94bU8800cazcCPbTg/exec';

export const useMockAuth = () => {
  const [loading, setLoading] = useState(false);

  // Helper to create a cache-busting URL
  const getUrlWithCacheBuster = () => {
    return `${SCRIPT_URL}?v=${new Date().getTime()}`;
  };

  const register = async (fullName: string, email: string, phone: string, password: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    const payload = {
      action: 'register',
      sheetName: 'UserName',
      fullName,
      email,
      phone: `'${phone.trim()}`,
      password,
    };

    try {
      const response = await fetch(getUrlWithCacheBuster(), {
        method: 'POST',
        body: JSON.stringify(payload),
        redirect: 'follow',
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        return { success: true, message: 'Đăng ký thành công, bạn vui lòng đăng nhập!!!' };
      } else {
        if (result.message && result.message.toLowerCase().includes('email exists')) {
          return { success: false, message: "Email này đã được đăng ký trong hệ thống. Bạn có thể vào trang Đăng nhâp và bấm vào Quên mật khẩu để lấy lại mật khẩu, hoặc đăng ký tài khoản mới bằng email khác!" };
        }
        return { success: false, message: result.message || 'Đăng ký thất bại. Vui lòng thử lại.' };
      }
    } catch (error) {
      console.error('Register API error:', error);
      return { success: false, message: 'Đã xảy ra lỗi kết nối. Vui lòng kiểm tra đường truyền mạng và thử lại.' };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
    setLoading(true);
    
    const normalizedEmail = email.toLowerCase().trim();
    const trimmedPassword = password.trim();

    const payload = {
      action: 'login',
      email: normalizedEmail,
      password: trimmedPassword,
      sheetName: 'UserName',
    };

    try {
      const response = await fetch(getUrlWithCacheBuster(), {
        method: 'POST',
        body: JSON.stringify(payload),
        redirect: 'follow',
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        const user: User = {
          id: result.data.id || `gsheet-${result.data.email}`,
          fullName: result.data.fullName || '',
          email: result.data.email,
          phone: result.data.phone || '',
          passwordHash: '',
        };
        return { success: true, message: 'Đăng nhập thành công!', user };
      } else {
        return { success: false, message: result.message || 'Email hoặc mật khẩu không chính xác.' };
      }
    } catch (error) {
      console.error('Login API error:', error);
      return { success: false, message: 'Đã xảy ra lỗi kết nối. Vui lòng kiểm tra đường truyền mạng và thử lại.' };
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async (email: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    const payload = { action: 'sendOtpRequest', email, sheetName: 'UserName' };
    try {
      const response = await fetch(getUrlWithCacheBuster(), { method: 'POST', body: JSON.stringify(payload), redirect: 'follow' });
      if (!response.ok) throw new Error('Network error');
      const result = await response.json();
      return { success: result.success, message: result.message || 'Lỗi không xác định' };
    } catch (error) {
      console.error('Request OTP error:', error);
      return { success: false, message: 'Lỗi kết nối khi gửi yêu cầu OTP.' };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    const payload = { action: 'verifyOtp', email, otpEntered: otp, sheetName: 'UserName' };
    try {
      const response = await fetch(getUrlWithCacheBuster(), { method: 'POST', body: JSON.stringify(payload), redirect: 'follow' });
      if (!response.ok) throw new Error('Network error');
      const result = await response.json();
      return { success: result.success, message: result.message || 'Lỗi không xác định' };
    } catch (error) {
      console.error('Verify OTP error:', error);
      return { success: false, message: 'Lỗi kết nối khi xác thực OTP.' };
    } finally {
      setLoading(false);
    }
  };
  
  const resetPassword = async (email: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    const payload = { action: 'resetPassword', email, otpEntered: otp, newPassword, sheetName: 'UserName' };
    try {
      const response = await fetch(getUrlWithCacheBuster(), { method: 'POST', body: JSON.stringify(payload), redirect: 'follow' });
      if (!response.ok) throw new Error('Network error');
      const result = await response.json();
       if (result.success) {
        return { success: true, message: 'Cập nhật mật khẩu thành công! Vui lòng đăng nhập lại.' };
      }
      return { success: result.success, message: result.message || 'Lỗi không xác định' };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, message: 'Lỗi kết nối khi đặt lại mật khẩu.' };
    } finally {
      setLoading(false);
    }
  };


  return { register, login, requestOtp, verifyOtp, resetPassword, loading };
};