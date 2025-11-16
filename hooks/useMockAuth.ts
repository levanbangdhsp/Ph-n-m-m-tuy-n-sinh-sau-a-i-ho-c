import { useState } from 'react';
import { User } from '../types';
import { SCRIPT_URL } from '../constants';

/**
 * A centralized API call function to interact with the Google Apps Script backend.
 * This version sends the payload as a raw JSON string with `Content-Type: text/plain`,
 * which is a robust method for Google Apps Script as it can reliably read the
 * entire body from `e.postData.contents`. This avoids CORS preflight issues and
 * problems with `application/x-www-form-urlencoded` parsing on the server.
 *
 * This version also includes `credentials: 'omit'` to prevent sending cookies,
 * which can help avoid complex CORS redirect issues with Google's authentication.
 *
 * @param payload The action and data to send to the backend.
 * @returns The parsed JSON response from the backend.
 * @throws An error if the network request fails, the server responds with an error status,
 *         or the server's response is not valid JSON.
 */
export const apiCall = async (payload: object): Promise<any> => {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'omit', // Prevent sending cookies to avoid CORS redirect issues.
      redirect: 'follow', // Explicitly follow redirects to improve robustness.
      // The persistent `NetworkError` strongly suggests a CORS preflight issue.
      // Using `Content-Type: 'application/json'` triggers a preflight (OPTIONS)
      // request which appears to be failing due to network intermediaries or
      // backend configuration.
      // To resolve this, we revert to a "simple request" that does not trigger
      // a preflight. By removing the `headers` object, we let the browser
      // automatically set `Content-Type` to `text/plain` for the string body.
      // This is the most robust method for Google Apps Script as it bypasses
      // the OPTIONS request and is less likely to be blocked.
      body: JSON.stringify(payload),
    });

    const textResult = await response.text();

    if (!response.ok) {
      if (textResult && textResult.trim().toLowerCase().startsWith('<!doctype html>')) {
        throw new Error('Yêu cầu đến máy chủ thất bại. Phản hồi không hợp lệ (có thể là trang đăng nhập của Google). Vui lòng kiểm tra lại cấu hình Google Apps Script.');
      }
      throw new Error(`Lỗi mạng: ${response.statusText} (mã lỗi: ${response.status}).`);
    }
    
    try {
      // Attempt to parse the successful response as JSON.
      return JSON.parse(textResult);
    } catch (e) {
      // If parsing fails, it means the server, despite a 200 OK, sent invalid JSON.
      // This is an error condition. We throw an error with the server's raw response.
      const jsonError = e as SyntaxError;
      throw new Error(`Đã xảy ra lỗi máy chủ: ${jsonError.message}`);
    }
  } catch (error: any) {
    // This catch block handles network failures (e.g., no internet) 
    // or errors thrown from the logic above.
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Lỗi mạng khi thực hiện yêu cầu. Vui lòng kiểm tra kết nối internet của bạn và thử lại.');
    }
    // Re-throw other errors (like the ones we created above).
    throw error;
  }
};


export const useMockAuth = () => {
  const [loading, setLoading] = useState(false);

  const register = async (fullName: string, email: string, phone: string, password: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    
    // Lấy ngày giờ hệ thống và định dạng thành chuỗi 'DD/MM/YYYY HH:mm:ss'
    // Thêm dấu nháy đơn (') ở đầu để đảm bảo Google Sheet lưu dưới dạng văn bản thuần túy.
    const now = new Date();
    const timestamp = `'${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const payload = {
      action: 'register',
      // The `sheetName` property is removed. The backend script will now handle
      // the logic of writing to both 'UserName' and 'DataDangky' sheets
      // based on the 'register' action.
      fullName,
      email,
      phone: `'${phone.trim()}`,
      password,
      // Thêm timestamp để ghi lại thời điểm đăng ký
      'Thời gian': timestamp,
    };

    try {
      const result = await apiCall(payload);

      if (result.status === 'success') {
        return { success: true, message: 'Đăng ký thành công, bạn vui lòng đăng nhập!!!' };
      } else {
        if (result.message && result.message.toLowerCase().includes('email exists')) {
          return { success: false, message: "Email này đã được đăng ký trong hệ thống. Bạn có thể vào trang Đăng nhâp và bấm vào Quên mật khẩu để lấy lại mật khẩu, hoặc đăng ký tài khoản mới bằng email khác!" };
        }
        return { success: false, message: result.message || 'Đăng ký thất bại. Vui lòng thử lại.' };
      }
    } catch (error: any) {
      console.error('Register API error:', error);
      return { success: false, message: error.message || 'Đã xảy ra lỗi kết nối. Vui lòng kiểm tra đường truyền mạng và thử lại.' };
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
    };

    try {
      const result = await apiCall(payload);
      
      if (result.status === 'success' && result.data) {
        const user: User = {
          id: result.data.id || `gsheet-${result.data.email}`,
          fullName: result.data.fullName || '',
          email: result.data.email,
          phone: result.data.phone || '',
          passwordHash: '',
          // The backend now determines the role and returns it in the `role` property.
          // This allows multiple admins/sub-admins from the StaffAccounts sheet.
          role: result.data.role || 'applicant',
          canEdit: result.data.canEdit, // Add canEdit property from backend response
        };
        return { success: true, message: 'Đăng nhập thành công!', user };
      } else {
        return { success: false, message: result.message || 'Email hoặc mật khẩu không chính xác.' };
      }
    } catch (error: any) {
      console.error('Login API error:', error);
      return { success: false, message: error.message || 'Đã xảy ra lỗi kết nối. Vui lòng kiểm tra đường truyền mạng và thử lại.' };
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async (email: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    const payload = { action: 'sendOtpRequest', email, sheetName: 'UserName' };
    try {
      const result = await apiCall(payload);
      return { success: result.success, message: result.message || 'Lỗi không xác định' };
    } catch (error: any) {
      console.error('Request OTP error:', error);
      return { success: false, message: error.message || 'Lỗi kết nối khi gửi yêu cầu OTP.' };
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    const payload = { action: 'verifyOtp', email, otpEntered: otp, sheetName: 'UserName' };
    try {
      const result = await apiCall(payload);
      return { success: result.success, message: result.message || 'Lỗi không xác định' };
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      return { success: false, message: error.message || 'Lỗi kết nối khi xác thực OTP.' };
    } finally {
      setLoading(false);
    }
  };
  
  const resetPassword = async (email: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    const payload = { action: 'resetPassword', email, otpEntered: otp, newPassword, sheetName: 'UserName' };
    try {
      const result = await apiCall(payload);
       if (result.success) {
        return { success: true, message: 'Cập nhật mật khẩu thành công! Vui lòng đăng nhập lại.' };
      }
      return { success: result.success, message: result.message || 'Lỗi không xác định' };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { success: false, message: error.message || 'Lỗi kết nối khi đặt lại mật khẩu.' };
    } finally {
      setLoading(false);
    }
  };


  return { register, login, requestOtp, verifyOtp, resetPassword, loading };
};