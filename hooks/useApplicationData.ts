import { useState, useEffect, useCallback } from 'react';
import { User, ApplicationStatusData, ApplicationStatusEnum, TimelineEvent } from '../types';
import { SCRIPT_URL, MAJORS_DATA } from '../constants';

// This is the real script URL
const getUrlWithCacheBuster = () => {
  return `${SCRIPT_URL}?v=${new Date().getTime()}`;
};

const processResponse = async (response: Response) => {
    const textResult = await response.text();
    try {
      return JSON.parse(textResult);
    } catch (e) {
      return { status: 'error', success: false, message: textResult || 'Lỗi không xác định từ máy chủ.' };
    }
};

const formatDate = (dateValue: any): string | null => {
    if (!dateValue) return null;
    const dateString = dateValue.toString();
    // Handle cases where it might already be in DD/MM/YYYY format, potentially with time
    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}/)) {
        return dateString.split(' ')[0];
    }
    // Handle cases where Google Sheets sends a full ISO string
    if (dateString.includes('T')) {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return null; // Invalid date
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return null; // Could not parse
        }
    }
    return null; // Return null if format is not recognized
};


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

    try {
      const payload = { action: 'getApplicationData', email: user.email };
      const response = await fetch(getUrlWithCacheBuster(), {
          method: 'POST',
          cache: 'no-cache',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
          redirect: 'follow',
      });

      if (!response.ok) {
        throw new Error('Lỗi mạng khi tải dữ liệu.');
      }

      const result = await processResponse(response);

      if (!result.success || !result.data || !result.data[Object.keys(result.data)[0]]) {
        setStatusData({
            status: ApplicationStatusEnum.NOT_SUBMITTED,
            details: 'Bạn chưa nộp hồ sơ. Vui lòng hoàn thành và lưu thông tin tại trang hồ sơ.',
            timeline: [
                { stage: 'Nộp hồ sơ', date: null, completed: false, current: true },
                { stage: 'Phòng Sau đại học xử lý', date: null, completed: false, current: false },
                { stage: 'Hoàn tất xét duyệt', date: null, completed: false, current: false },
            ],
            admissionResult: 'Chưa có',
        });
        setLoading(false);
        return;
      }
      
      const data = result.data;
      
      const cleanAndNormalize = (str: string): string => {
        if (typeof str !== 'string' || !str) return '';
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") 
            .replace(/đ/g, "d")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');
      };
      
      const findKey = (name: string) => {
        const cleanedNameToFind = cleanAndNormalize(name);
        return Object.keys(data).find(key => cleanAndNormalize(key) === cleanedNameToFind);
      };

      const submissionDate = formatDate(data[findKey('Thời gian')]);
      const processingDate = formatDate(data[findKey('Ngày xử lý')]);
      const statusUpdateDate = formatDate(data[findKey('Ngày cập nhật trạng thái')]);
      const detailsMessage = data[findKey('Ghi chú')];
      const profileStatusRaw = data[findKey('Kết quả hồ sơ')] || '';
      
      let finalStatusData: ApplicationStatusData;

      // ===================================================================
      // NEW LOGIC IMPLEMENTATION STARTS HERE
      // ===================================================================

      // STEP 1: MANDATORY FILE CHECK (HIGHEST PRIORITY)
      const allDocuments = [
          { key: 'Link Ảnh thẻ', name: '1. Ảnh thẻ 4x6', isRequired: () => true },
          { key: 'Link Bằng tốt nghiệp', name: '2. Bản scan Bằng tốt nghiệp đại học', isRequired: () => true },
          { key: 'Link Bảng điểm', name: '3. Bản scan Bảng điểm đại học', isRequired: () => true },
          { key: 'Link Chứng chỉ NN', name: '4. Bản scan Chứng chỉ ngoại ngữ', isRequired: () => true },
          { 
              key: 'Link Ưu tiên', 
              name: '5. Minh chứng đối tượng ưu tiên', 
              isRequired: () => {
                  const priorityKey = findKey('Ưu tiên');
                  return !!(priorityKey && data[priorityKey] && data[priorityKey] !== '0');
              } 
          },
          { 
              key: 'Link NCKH và thành tích khác', 
              name: '6. Minh chứng NCKH & thành tích khác',
              isRequired: () => {
                  const researchKey = findKey('Nghiên cứu khoa học');
                  const otherAchievementsKey = findKey('Thành tích khác');
                  const researchSelected = !!(researchKey && data[researchKey] && data[researchKey] !== 'NCKH0');
                  const otherSelected = !!(otherAchievementsKey && data[otherAchievementsKey] && data[otherAchievementsKey] !== 'KHAC0');
                  return researchSelected || otherSelected;
              }
          },
      ];

      const requiredDocuments = allDocuments.filter(doc => doc.isRequired());
      const missingDocs = requiredDocuments
          .filter(doc => {
              const key = findKey(doc.key);
              return !key || !data[key] || String(data[key]).trim() === '';
          })
          .map(doc => doc.name);

      if (missingDocs.length > 0) {
          // If files are missing, this status OVERRIDES everything else.
          finalStatusData = {
              status: ApplicationStatusEnum.NEEDS_UPDATE,
              details: 'Hồ sơ của bạn cần bổ sung các mục sau để được xét duyệt. Vui lòng quay lại trang "Hồ sơ dự tuyển" để tải lên các tệp còn thiếu:',
              missingDocuments: missingDocs,
              timeline: [
                  { stage: 'Nộp hồ sơ', date: submissionDate, completed: true, current: false },
                  { stage: 'Yêu cầu bổ sung (tự động)', date: new Date().toLocaleDateString('vi-VN'), completed: false, current: true },
                  { stage: 'Phòng Sau đại học xử lý', date: null, completed: false, current: false },
                  { stage: 'Hoàn tất xét duyệt', date: null, completed: false, current: false },
              ]
          };
      } else {
          // STEP 2: IF ALL FILES ARE PRESENT, READ ADMIN'S DECISION
          const profileStatusCleaned = cleanAndNormalize(profileStatusRaw);

          if (profileStatusRaw.toLowerCase().includes('bổ sung')) {
              // Admin manually requested updates.
              finalStatusData = {
                status: ApplicationStatusEnum.NEEDS_UPDATE,
                details: profileStatusRaw, // Use the admin's exact words.
                timeline: [
                    { stage: 'Nộp hồ sơ', date: submissionDate, completed: true, current: false },
                    { stage: 'Phòng Sau đại học xử lý', date: processingDate, completed: true, current: false },
                    { stage: 'Yêu cầu bổ sung', date: statusUpdateDate, completed: false, current: true },
                    { stage: 'Hoàn tất xét duyệt', date: null, completed: false, current: false },
                ]
              };
          } else if (profileStatusCleaned.includes('dudieukien') && !profileStatusCleaned.includes('khong')) {
              // Profile is Valid.
              finalStatusData = {
                status: ApplicationStatusEnum.VALID,
                details: detailsMessage || 'Chúc mừng! Hồ sơ của bạn đã đáp ứng đủ các tiêu chí và được đánh giá là hợp lệ. Vui lòng đợi thông báo tiếp theo về kết quả trúng tuyển.',
                timeline: [
                    { stage: 'Nộp hồ sơ', date: submissionDate, completed: true, current: false },
                    { stage: 'Phòng Sau đại học xử lý', date: processingDate || statusUpdateDate, completed: true, current: false },
                    { stage: 'Hoàn tất xét duyệt', date: statusUpdateDate, completed: true, current: true }
                ]
              };
          } else if (profileStatusRaw.trim() !== '') {
              // Any other text means Invalid.
              finalStatusData = {
                status: ApplicationStatusEnum.INVALID,
                details: profileStatusRaw, // Use admin's text as the reason.
                timeline: [
                    { stage: 'Nộp hồ sơ', date: submissionDate, completed: true, current: false },
                    { stage: 'Phòng Sau đại học xử lý', date: processingDate || statusUpdateDate, completed: true, current: false },
                    { stage: 'Hoàn tất xét duyệt', date: statusUpdateDate, completed: true, current: true }
                ]
              };
          } else {
              // If the cell is empty, it's Processing.
              finalStatusData = {
                status: ApplicationStatusEnum.PROCESSING,
                details: detailsMessage || 'Hồ sơ của bạn đã đủ các giấy tờ bắt buộc. Phòng Sau đại học sẽ sớm tiến hành xét duyệt. Vui lòng quay lại sau để xem kết quả cuối cùng.',
                timeline: [
                    { stage: 'Nộp hồ sơ', date: submissionDate, completed: true, current: false },
                    { stage: 'Phòng Sau đại học xử lý', date: processingDate, completed: false, current: true },
                    { stage: 'Hoàn tất xét duyệt', date: null, completed: false, current: false },
                ]
              };
          }
      }

      // ===================================================================
      // REMAINDER OF THE LOGIC (Review Details & Admission Status)
      // This part remains largely unchanged as it depends on the `finalStatusData`
      // which has been correctly determined above.
      // ===================================================================

      if (finalStatusData.status === ApplicationStatusEnum.VALID || finalStatusData.status === ApplicationStatusEnum.INVALID || finalStatusData.status === ApplicationStatusEnum.PROCESSING) {
        const graduationScore = parseFloat(String(data[findKey('Điểm TB (hệ 10)')] || '0').replace(',', '.')) || 0;
        const researchValue = data[findKey('Nghiên cứu khoa học')];
        const otherAchievementsValue = data[findKey('Thành tích khác')];
        const priorityValue = data[findKey('Ưu tiên')];
        const scholarshipValue = data[findKey('Học bổng')] || 'Không';
    
        const hasResearchBonus = !!(researchValue && researchValue !== 'NCKH0');
        const hasOtherAchievementsBonus = !!(otherAchievementsValue && otherAchievementsValue !== 'KHAC0');
        const priorityScore = (priorityValue && priorityValue !== '0') ? 0.50 : 0.00;
        
        const totalScore = Math.min(10.00, graduationScore + priorityScore);
        
        finalStatusData.reviewDetails = {
            graduationScore: graduationScore,
            hasResearchBonus: hasResearchBonus,
            hasOtherAchievementsBonus: hasOtherAchievementsBonus,
            priorityScore: priorityScore,
            totalScore: totalScore,
            scholarshipPolicy: scholarshipValue,
        };
      }
      
      let admissionStatus: 'Trúng tuyển' | 'Không trúng tuyển' | 'Chưa có' = 'Chưa có';
      
      if (finalStatusData.status === ApplicationStatusEnum.INVALID) {
          admissionStatus = 'Không trúng tuyển';
      } else if (finalStatusData.status !== ApplicationStatusEnum.VALID) {
          admissionStatus = 'Chưa có';
      } else {
          const admissionResultRaw = data[findKey('Kết quả trúng tuyển')] || '';
          const admissionResultCleaned = cleanAndNormalize(admissionResultRaw);
          const IS_ADMITTED = admissionResultCleaned.includes('trungtuyen');
          const IS_REJECTED = admissionResultCleaned.includes('khongtrungtuyen');

          if (IS_REJECTED) {
              admissionStatus = 'Không trúng tuyển';
          } else if (IS_ADMITTED) {
              admissionStatus = 'Trúng tuyển';
          } else {
              admissionStatus = 'Chưa có';
          }
      }
      
      if (admissionStatus === 'Trúng tuyển') {
          let admittedMajor = 'Đang cập nhật';
          let admittedOrientation = 'Đang cập nhật';
          const admissionResultRaw = data[findKey('Kết quả trúng tuyển')]?.toUpperCase() || '';
          
          const majorCodeToNameMap = MAJORS_DATA.reduce((acc, major) => {
              acc[major.code] = major.name;
              return acc;
          }, {} as Record<string, string>);
          const getMajorNameByCode = (code: string) => majorCodeToNameMap[code] || code || 'Không xác định';

          if (admissionResultRaw.includes('NV1')) {
              const majorCode = data[findKey('Nguyện vọng 1')];
              admittedMajor = majorCode ? getMajorNameByCode(majorCode) : 'Không tìm thấy';
              admittedOrientation = data[findKey('Định hướng NV1')] || 'Không tìm thấy';
          } else if (admissionResultRaw.includes('NV2')) {
              const majorCode = data[findKey('Nguyện vọng 2')];
              admittedMajor = majorCode ? getMajorNameByCode(majorCode) : 'Không tìm thấy';
              admittedOrientation = data[findKey('Định hướng NV2')] || 'Không tìm thấy';
          } else if (admissionResultRaw.includes('NV3')) {
              const majorCode = data[findKey('Nguyện vọng 3')];
              admittedMajor = majorCode ? getMajorNameByCode(majorCode) : 'Không tìm thấy';
              admittedOrientation = data[findKey('Định hướng NV3')] || 'Không tìm thấy';
          } else {
              admittedMajor = data[findKey('Ngành trúng tuyển')] || 'Đang cập nhật';
              admittedOrientation = data[findKey('Định hướng trúng tuyển')] || 'Đang cập nhật';
          }

          finalStatusData.admissionDetails = {
              admittedMajor: admittedMajor,
              admittedOrientation: admittedOrientation,
          };
      }

      finalStatusData.admissionResult = admissionStatus;

      setStatusData(finalStatusData);

    } catch (e: any) {
        console.error("Failed to fetch application data:", e);
        setError(e.message || 'Đã xảy ra lỗi khi tải trạng thái.');
    } finally {
        setLoading(false);
    }

  }, [user]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { statusData, loading, error, refetch: fetchStatus };
};