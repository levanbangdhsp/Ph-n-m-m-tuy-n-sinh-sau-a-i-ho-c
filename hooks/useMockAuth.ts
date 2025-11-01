import { useState } from 'react';
import { User } from '../types';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxrgsiRzWbM42ctjT-DMOnx4y0cwwOCaSGql_trkfbRBrzlHLjdj03i8Ykj5ZtHyaD4/exec';

export const useMockAuth = () => {
  const [loading, setLoading] = useState(false);

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
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
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
        // Handle specific error for existing email as requested by user
        if (result.message && result.message.toLowerCase().includes('email exists')) {
          return { success: false, message: "Email này đã được đăng ký trong hệ thống. Bạn có thể vào trang Đăng nhập và bấm vào Quên mật khẩu để lấy lại mật khẩu, hoặc đăng ký tài khoản mới bằng email khác!" };
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
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
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
          passwordHash: '', // Password hash is not needed as auth is handled by Google Sheet
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

  const checkEmailExists = async (email: string): Promise<{ exists: boolean; message: string }> => {
     setLoading(true);
     const payload = {
        action: 'checkEmailExists',
        email,
        sheetName: 'UserName'
     };
     try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload),
            redirect: 'follow',
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const result = await response.json();
        if (result.exists) {
            return { exists: true, message: 'Đã gửi mã OTP. Vui lòng kiểm tra email của bạn.' };
        } else {
            return { exists: false, message: 'Email không tồn tại trong hệ thống.' };
        }
     } catch (error) {
        console.error('Check email exists error:', error);
        return { exists: false, message: 'Đã xảy ra lỗi kết nối. Vui lòng thử lại.' };
     } finally {
        setLoading(false);
     }
  };

  const updatePassword = async (email: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    const payload = {
        action: 'updatePassword',
        email,
        password: newPassword,
        sheetName: 'UserName'
    };
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload),
            redirect: 'follow',
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const result = await response.json();
        if (result.status === 'success') {
            return { success: true, message: 'Cập nhật mật khẩu thành công. Vui lòng đăng nhập lại.' };
        } else {
            return { success: false, message: result.message || 'Đã xảy ra lỗi. Vui lòng thử lại.' };
        }
    } catch (error) {
        console.error('Update password error:', error);
        return { success: false, message: 'Đã xảy ra lỗi kết nối. Vui lòng thử lại.' };
    } finally {
        setLoading(false);
    }
  };


  return { register, login, checkEmailExists, updatePassword, loading };
};