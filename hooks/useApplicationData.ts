import { useState, useEffect, useCallback } from 'react';
import { User, ApplicationStatusData, ApplicationStatusEnum } from '../types';

export const useApplicationData = (user: User | null) => {
  const [statusData, setStatusData] = useState<ApplicationStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!user) {
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);

    // MOCK IMPLEMENTATION: Simulates fetching data from a server.
    // In a real application, this would be a fetch call to an API endpoint.
    await new Promise(resolve => setTimeout(resolve, 1000));

    // We'll return different mock data based on keywords in the user's email
    // to demonstrate different application states.
    const email = user.email.toLowerCase();
    let mockData: ApplicationStatusData;

    if (email.includes('valid')) {
        mockData = {
            status: ApplicationStatusEnum.VALID,
            details: 'Chúc mừng! Hồ sơ của bạn đã được duyệt và hợp lệ. Vui lòng đợi thông báo tiếp theo về kết quả xét tuyển.',
            timeline: [
                { stage: 'Nộp hồ sơ', date: '10/11/2024', completed: true, current: false },
                { stage: 'Phòng tuyển sinh xử lý', date: '12/11/2024', completed: true, current: false },
                { stage: 'Hồ sơ hợp lệ', date: '16/11/2024', completed: true, current: true },
            ]
        };
    } else if (email.includes('invalid')) {
        mockData = {
            status: ApplicationStatusEnum.INVALID,
            details: 'Rất tiếc, hồ sơ của bạn không hợp lệ do không đáp ứng tiêu chí về điểm trung bình tốt nghiệp. Mọi thắc mắc vui lòng liên hệ phòng tuyển sinh.',
            timeline: [
                { stage: 'Nộp hồ sơ', date: '17/10/2025', completed: true, current: false },
                { stage: 'Phòng Sau đại học xử lý', date: '11/11/2025', completed: true, current: false },
                { stage: 'Hồ sơ không hợp lệ', date: '14/11/2025', completed: true, current: true },
            ]
        };
    } else if (email.includes('processing')) {
         mockData = {
            status: ApplicationStatusEnum.PROCESSING,
            details: 'Hồ sơ của bạn đã được tiếp nhận và đang trong quá trình xử lý. Vui lòng quay lại sau để cập nhật trạng thái.',
            timeline: [
                { stage: 'Nộp hồ sơ', date: '17/10/2025', completed: true, current: false },
                { stage: 'Phòng tuyển sinh xử lý', date: null, completed: false, current: true },
                { stage: 'Hoàn tất xét duyệt', date: null, completed: false, current: false },
            ]
        };
    } else {
        // Default case: needs update
         mockData = {
            status: ApplicationStatusEnum.NEEDS_UPDATE,
            details: 'Hồ sơ của bạn thiếu bản scan công chứng bằng tốt nghiệp đại học. Vui lòng truy cập trang "Đăng ký & Cập nhật Hồ sơ" để bổ sung trước ngày 25/12/2025.',
            timeline: [
                { stage: 'Nộp hồ sơ', date: '17/10/2025', completed: true, current: false },
                { stage: 'Phòng Sau đại học xử lý', date: '12/11/2025', completed: true, current: false },
                { stage: 'Yêu cầu bổ sung', date: '15/11/2025', completed: false, current: true },
                { stage: 'Hoàn tất xét duyệt', date: null, completed: false, current: false },
            ]
        };
    }

    setStatusData(mockData);
    setLoading(false);

  }, [user]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { statusData, loading, error, refetch: fetchStatus };
};