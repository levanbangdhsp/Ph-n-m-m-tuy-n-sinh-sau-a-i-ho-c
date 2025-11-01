import { useState } from 'react';
import { User } from '../types';

const USERS_DB_KEY = 'admissions_users';

// Simple hash function for demonstration. DO NOT USE IN PRODUCTION.
const simpleHash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h.toString();
};

export const useMockAuth = () => {
  const [loading, setLoading] = useState(false);
  
  const getUsers = (): User[] => {
    const usersJson = localStorage.getItem(USERS_DB_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  };

  const register = (fullName: string, email: string, phone: string, password: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    return new Promise(resolve => {
      setTimeout(() => {
        const users = getUsers();
        if (users.some(u => u.email === email)) {
          setLoading(false);
          resolve({ success: false, message: 'Email này đã được đăng ký tài khoản, bạn vui lòng đăng ký bằng tài khoản khác!!!' });
          return;
        }
        
        const newUser: User = {
          id: Date.now().toString(),
          fullName,
          email,
          phone,
          passwordHash: simpleHash(password),
        };

        users.push(newUser);
        saveUsers(users);
        setLoading(false);
        resolve({ success: true, message: 'Đăng ký thành công, bạn vui lòng đăng nhập!!!' });
      }, 1000);
    });
  };

  const login = (email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
    setLoading(true);
    // Temporarily reverted to localStorage-based login to ensure app functionality.
    // The Google Sheet API code is commented out below for future re-activation.
    return new Promise(resolve => {
        setTimeout(() => {
            const users = getUsers();
            const normalizedEmail = email.toLowerCase().trim();
            const passwordHash = simpleHash(password.trim());
            
            const foundUser = users.find(u => u.email.toLowerCase() === normalizedEmail && u.passwordHash === passwordHash);
            
            setLoading(false);
            if (foundUser) {
                resolve({ success: true, message: 'Đăng nhập thành công!', user: foundUser });
            } else {
                resolve({ success: false, message: 'Email hoặc mật khẩu không chính xác.' });
            }
        }, 1000);
    });
  };

  /*
  // --- GOOGLE SHEET LOGIN LOGIC (TEMPORARILY DISABLED) ---
  const login = async (email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
    setLoading(true);
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwm4CTauViN8qGCFzhvZg6OfMakCK0HEOAVcD2LPfg4J2AdDwRVyh-mwhTmLwaEUpw/exec';
    
    // Normalize email to lowercase and trim whitespace.
    const normalizedEmail = email.toLowerCase().trim();
    // Trim whitespace from password to prevent issues with copy-pasting.
    const trimmedPassword = password.trim();

    const payload = {
      action: 'login',
      email: normalizedEmail,
      password: trimmedPassword,
      sheetName: 'UserName',
    };

    try {
      const response = await fetch(scriptURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Use text/plain to avoid CORS preflight with Google Scripts
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        const user: User = {
          id: `gsheet-${result.data.email}`,
          fullName: result.data.fullName,
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
  */

  const checkEmailExists = (email: string): Promise<{ exists: boolean; message: string }> => {
     setLoading(true);
     return new Promise(resolve => {
        setTimeout(() => {
            const users = getUsers();
            const exists = users.some(u => u.email === email);
            setLoading(false);
            if(exists) {
                resolve({ exists: true, message: 'Đã gửi mã OTP. Vui lòng kiểm tra email của bạn.' });
            } else {
                resolve({ exists: false, message: 'Email không tồn tại trong hệ thống.' });
            }
        }, 1000);
     });
  };

  const updatePassword = (email: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    return new Promise(resolve => {
        setTimeout(() => {
            let users = getUsers();
            const userIndex = users.findIndex(u => u.email === email);
            if (userIndex !== -1) {
                users[userIndex].passwordHash = simpleHash(newPassword);
                saveUsers(users);
                setLoading(false);
                resolve({ success: true, message: 'Cập nhật mật khẩu thành công. Vui lòng đăng nhập lại.' });
            } else {
                setLoading(false);
                resolve({ success: false, message: 'Đã xảy ra lỗi. Vui lòng thử lại.' });
            }
        }, 1000);
    });
  };


  return { register, login, checkEmailExists, updatePassword, loading };
};