
import React, { useState, useRef, useEffect } from 'react';
import { apiCall } from '../hooks/useMockAuth';

// ==================================================================================
// 1. KHU VỰC ĐỊNH NGHĨA ICON (Tích hợp sẵn để không cần file ngoài)
// ==================================================================================

const ChatBubbleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.701 6.162.477.44.64.636.561.781l-.624 1.286a.383.383 0 00.296.515z" clipRule="evenodd" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PaperAirplaneIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

const MicrophoneIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
    <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-3a6.75 6.75 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
  </svg>
);

const PhotoIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
  </svg>
);

const ExclamationTriangleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const CheckCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const XCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

// --- 2. COMPONENT LOADING GEMINI (Vòng mỏng, Logo to) ---
const GeminiLoader = () => (
  <div className="relative flex items-center justify-center w-8 h-8">
    {/* Vòng tròn xoay: strokeWidth="1" (Mỏng tinh tế) */}
    <svg className="animate-spin absolute inset-0 w-full h-full" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />   {/* Xanh dương */}
          <stop offset="100%" stopColor="#a855f7" />  {/* Tím */}
        </linearGradient>
      </defs>
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="#cbd5e1" strokeWidth="1" fill="none"></circle>
      <path className="opacity-90" d="M12 2 A 10 10 0 0 1 22 12" stroke="url(#spinnerGradient)" strokeWidth="1" fill="none" strokeLinecap="round"></path>
    </svg>
    
    {/* Logo Gemini: w-5 h-5 (To hơn cho cân đối) */}
    <svg className="w-5 h-5 z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 0C12 6.62742 17.3726 12 24 12C17.3726 12 12 17.3726 12 24C12 17.3726 6.62742 12 0 12C6.62742 12 12 6.62742 12 0Z" fill="url(#geminiLogoGradient)"/>
        <defs>
            <linearGradient id="geminiLogoGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2563eb"/>
                <stop offset="1" stopColor="#d946ef"/>
            </linearGradient>
        </defs>
    </svg>
  </div>
);

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  image?: string;
}

const Chatbot: React.FC = () => {
  const MODEL_NAME = "gemini-2.5-flash"; 

  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Chào bạn! Tôi là trợ lý AI tư vấn Tuyển sinh Sau đại học của Trường ĐHSP TP.HCM. Tôi có thể giúp gì cho bạn?",
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [apiKey, setApiKey] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [keyStatus, setKeyStatus] = useState<'idle' | 'checking' | 'ok' | 'dead'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
        setApiKey(savedKey);
        setTempApiKey(savedKey);
    } else if (isOpen) {
        setShowSettings(true);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, isLoading, isOpen, showSettings]);

  // --- HÀM GỌI API TRỰC TIẾP ---
  const callGeminiDirectly = async (key: string, payload: any) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${key}`;
      const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });

      if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP Error: ${response.status}`);
      }
      return await response.json();
  };

  const testAndSaveKey = async () => {
      if (!tempApiKey.trim()) { setStatusMsg("Vui lòng nhập API Key."); return; }
      setKeyStatus('checking'); setStatusMsg("Đang kiểm tra...");
      try {
          await callGeminiDirectly(tempApiKey.trim(), {
              contents: [{ parts: [{ text: "Hello" }] }]
          });
          
          setKeyStatus('ok'); setStatusMsg("Đã lưu Key thành công!");
          setApiKey(tempApiKey.trim()); localStorage.setItem('gemini_api_key', tempApiKey.trim());
          setTimeout(() => { setShowSettings(false); setKeyStatus('idle'); setStatusMsg(""); }, 1000);
      } catch (e: any) {
          setKeyStatus('dead');
          if (e.message.includes('429') || e.message.includes('404')) setStatusMsg(`Lỗi: ${e.message}`);
          else setStatusMsg("Lỗi: Key không hợp lệ hoặc mạng lỗi.");
      }
  };

  // --- RENDER TEXT FORMATTED ---
  const renderFormattedText = (text: string, messageId: number) => {
    const WARNING_TEXT = "Tôi có thể hỗ trợ kiểm tra sơ bộ, nhưng để chính xác 100% bạn vui lòng mang hồ sơ gốc đến phòng SĐH để được tư vấn trực tiếp.";
    const parts = text.split('---GỢI Ý---');
    let mainContent = parts[0];
    const suggestions = parts[1] ? parts[1].split('|').map(s => s.trim().replace(/[\[\]]/g, '')).filter(s => s) : [];

    let warningContent = null;
    if (mainContent.includes(WARNING_TEXT)) {
        const contentParts = mainContent.split(WARNING_TEXT);
        mainContent = contentParts[0];
        warningContent = WARNING_TEXT;
    }

    const renderBold = (content: string) => {
        const parts = content.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                const innerText = part.substring(2, part.length - 2);
                // PX-0.5 để chữ không đẩy dấu câu ra xa
                return (
                    <strong key={index} className="font-bold bg-green-100 text-green-800 px-0.5 rounded border border-green-200">
                        {innerText}
                    </strong>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <>
            {mainContent.split('\n').map((line, i) => {
                if (!line.trim()) return null;
                return <p key={`p-${i}`} className="mb-1 last:mb-0 leading-relaxed">{renderBold(line)}</p>;
            })}
            {warningContent && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex gap-2 items-start">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800 italic leading-relaxed">{warningContent}</p>
                </div>
            )}
            {suggestions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {suggestions.map((suggestion, idx) => (
                        <button key={`sug-${messageId}-${idx}`} onClick={() => handleSuggestionClick(suggestion)} disabled={isLoading} className="text-xs bg-white border border-sky-200 text-sky-700 px-3 py-1.5 rounded-full hover:bg-sky-50 hover:border-sky-400 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-left">
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}
        </>
    );
  };

  const handleSuggestionClick = (text: string) => {
      setInput(text);
      sendMessageInternal(text, null); 
  };

  const sendMessageInternal = async (textMsg: string, imageBase64: string | null) => {
      const textToSend = textMsg.trim();
      if ((!textToSend && !imageBase64) || isLoading) return;

      if (!apiKey) {
          setMessages(prev => [...prev, { id: Date.now(), text: textToSend, sender: 'user', image: imageBase64 || undefined }]);
          setTimeout(() => {
              setMessages(prev => [...prev, { id: Date.now() + 1, text: "⚠️ Bạn chưa nhập API Key. Vui lòng bấm vào bánh răng để nhập.", sender: 'bot' }]);
              setShowSettings(true);
          }, 500);
          return;
      }

      const userMessage: Message = { id: Date.now(), text: textToSend, sender: 'user', image: imageBase64 || undefined };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setSelectedImage(null);
      setIsLoading(true);
      setError(null);

      const generateWithRetry = async (payload: any, retryCount = 0): Promise<any> => {
          try {
              return await callGeminiDirectly(apiKey, payload);
          } catch (err: any) {
              const msg = err.message || "";
              if ((msg.includes('429') || msg.includes('quota') || msg.includes('overloaded')) && retryCount < 3) {
                  const waitTime = 1000 * (retryCount + 1);
                  await new Promise(resolve => setTimeout(resolve, waitTime));
                  return generateWithRetry(payload, retryCount + 1);
              }
              throw err;
          }
      };

      try {
        // Lọc dữ liệu bằng RAG từ Google Sheet (Sử dụng apiCall thật)
        const knowledgeBaseResult = await apiCall({ action: 'getKnowledgeBase' });
        // Check success status from standard apiCall response
        const knowledgeBase = (knowledgeBaseResult.success || knowledgeBaseResult.status === 'success') 
            ? (knowledgeBaseResult.data || "") 
            : "";
            
        const todayStr = new Date().toLocaleDateString('en-GB');

        const systemInstruction = `
        *** NHIỆM VỤ CỐT LÕI ***
        Bạn là "Trợ lý Tuyển sinh SĐH" của trường Đại học Sư phạm TP.HCM.
        Nhiệm vụ của bạn là trả lời câu hỏi của thí sinh dựa trên BỐI CẢNH (CONTEXT) được cung cấp và HÌNH ẢNH (nếu có).
        HÔM NAY LÀ NGÀY: ${todayStr}

        *** QUY TẮC XỬ LÝ CÂU HỎI (THEO THỨ TỰ ƯU TIÊN TỪ 1 ĐẾN 8) ***

        1. 🛡️ **QUY TẮC 1: BỘ LỌC SƯ PHẠM (ƯU TIÊN CAO NHẤT)**
           Nếu câu hỏi hoặc ngôn từ của thí sinh mang tính bạo lực, kích động, dung tục, thô lỗ, chửi thề, hoặc trái với thuần phong mỹ tục Việt Nam, bạn **BẮT BUỘC** phải dừng suy luận và trả lời nguyên văn câu sau:
           "Chào bạn, cảm ơn bạn đã quan tâm đến Cổng thông tin tuyển sinh sau đại học. Tuy nhiên, đây là môi trường sư phạm, nên nội dung trao đổi cần đảm bảo tính văn hóa và chuẩn mực. Do vậy, tôi xin phép không bàn luận về vấn đề bạn vừa hỏi. Cảm ơn bạn!"

        2. 👁️ QUY TẮC 2: XỬ LÝ HÌNH ẢNH VĂN BẰNG/CHỨNG CHỈ (QUAN TRỌNG) Khi thí sinh gửi ảnh văn bằng/chứng chỉ ngoại ngữ, hãy thực hiện quy trình sau:
           • TRƯỜNG HỢP A: Văn bằng (Degree). BẰNG CỬ NHÂN (ĐẠI HỌC)
              Dấu hiệu nhận biết: Các từ khóa như "Bằng tốt nghiệp", "Bằng Cử nhân", "Cử nhân" (Bachelor), "Kỹ sư", "Kiến trúc sư", "Bằng Thạc sĩ" (Master), "Bằng Tiến sĩ" (Doctor/PhD).
              
              BƯỚC 1: NHẬN DIỆN NGÀNH TRÊN BẰNG (QUAN TRỌNG NHẤT)
                Hãy xác định xem tên ngành trên bằng có thuộc nhóm "NGÔN NGỮ NƯỚC NGOÀI" (Anh, Pháp, Trung, Nhật, Nga, Hàn, Đức...) hay không?

                🔴 NHÓM 1: NẾU KHÔNG PHẢI BẰNG NGÔN NGỮ (Ví dụ: Toán, Lý, CNTT, GD Chính trị, Văn học, Sử học...)
                  -> HÀNH ĐỘNG BẮT BUỘC:
                      1. TUYỆT ĐỐI KHÔNG đề cập đến cụm từ "ngoại ngữ", "miễn thi", hay "đáp ứng điều kiện ngoại ngữ". (Vì bằng này không có chức năng xét miễn ngoại ngữ).
                      2. CHUYỂN NGAY lập tức sang BƯỚC 2 để kiểm tra chuyên môn (Ngành đúng/Ngành gần).

                🟢 NHÓM 2: NẾU LÀ BẰNG NGÔN NGỮ NƯỚC NGOÀI
                  -> HÀNH ĐỘNG: Lúc này mới được phép nhận xét về ngoại ngữ theo logic sau:
                      - Nếu ngành dự tuyển TRÙNG với ngôn ngữ trên bằng (Ví dụ: Bằng Anh -> thi Thạc sĩ PPDH Tiếng Anh):
                        -> Kết luận: "Về ngoại ngữ: Do ngành dự tuyển trùng với ngôn ngữ trên bằng, văn bằng này KHÔNG được dùng để miễn thi. Bạn cần minh chứng Ngoại ngữ 2."
                      - Nếu ngành dự tuyển KHÁC với ngôn ngữ trên bằng (Ví dụ: Bằng Anh -> thi Thạc sĩ Toán/Văn/QLGD...):
                        -> Kết luận: "Về ngoại ngữ: Văn bằng này ĐÃ ĐÁP ỨNG điều kiện miễn thi ngoại ngữ đầu vào."

              BƯỚC 2: KIỂM TRA XẾP LOẠI & TRA CỨU NGÀNH (Áp dụng cho cả Hướng 1 và Hướng 2)
                 - Thực hiện logic tra cứu "Ngành đúng/Ngành gần" như Quy tắc 5.
                 - Kiểm tra xếp loại Trung bình / Trung bình khá: Cảnh báo "Bạn đủ điều kiện dự thi hướng Ứng dụng. Nếu muốn thi hướng Nghiên cứu, bạn cần có thêm ít nhất 01 bài báo khoa học."
                 - Kiểm tra xếp loại Khá / Giỏi / Xuất sắc: Khẳng định "Bạn đủ điều kiện dự tuyển cả định hướng Nghiên cứu và Ứng dụng (tùy thuộc vào ngành bạn đăng ký có mở các định hướng này hay không)."

            • NHÓM B: CHỨNG CHỈ (CERTIFICATE)
                Dấu hiệu: Các chứng chỉ năng lực ngoại ngữ như IELTS, TOEIC, TOEFL, VSTEP, JLPT, HSK...
                1. Xử lý Thời hạn (Áp dụng cho tất cả):
                  Tìm "Ngày thi" (Date of Exam) hoặc "Ngày cấp" (Date of Issue).
                  Công thức: Hạn sử dụng = Ngày đó + 02 năm (24 tháng).
                  So Sánh:
                  Nếu Hạn sử dụng >= ${todayStr} (Hôm nay) --> Kết luận: CÒN HIỆU LỰC tại thời điểm nộp hồ sơ này.
                  Nếu Hạn sử dụng < ${todayStr} (Hôm nay) --> Kết luận: HẾT HIỆU LỰC.
                2. Xử lý Đơn vị cấp (CHỈ ÁP DỤNG CHO VSTEP / KNLNN 6 Bậc):
                  Đọc tên "Đơn vị tổ chức thi/cấp bằng" trên ảnh.
                  Tra cứu trong BỐI CẢNH xem đơn vị này có trong "Danh sách các đơn vị được Bộ GD&ĐT công nhận" không.
                  Kết luận:
                  Nếu CÓ: Ghi chú "Đơn vị cấp chứng chỉ này nằm trong danh sách được Bộ GD&ĐT cho phép tổ chức thi."
                  Nếu KHÔNG: Đưa ra CẢNH BÁO ĐỎ: "Cảnh báo: Tôi không tìm thấy tên đơn vị cấp chứng chỉ này trong danh sách được Bộ GD&ĐT cho phép tổ chức thi (theo dữ liệu hiện hành). Bạn vui lòng kiểm tra kỹ lại tính pháp lý của chứng chỉ này."
              BƯỚC 2: XUẤT KẾT QUẢ KÈM CẢNH BÁO (BẮT BUỘC)
                Trả lời kết quả kiểm tra (Hợp lệ/Không hợp lệ) dựa trên tính toán trên.
                BẮT BUỘC kết thúc câu trả lời bằng câu sau: "Tôi có thể hỗ trợ kiểm tra sơ bộ, nhưng để chính xác 100% bạn vui lòng mang hồ sơ gốc đến phòng SĐH để được tư vấn trực tiếp."

        3. 🏆 **QUY TẮC 3: XỬ LÝ HÌNH ẢNH GIẤY KHEN / THÀNH TÍCH**
           Khi thí sinh gửi ảnh Giấy khen, Bằng khen, Giấy chứng nhận giải thưởng, hãy thực hiện:
           
           **BƯỚC 1: XÁC ĐỊNH CẤP KHEN THƯỞNG**
           * **Cấp Bộ/Quốc gia:** (Do Bộ trưởng, Thủ tướng, TW Đoàn... ký).
           * **Cấp Tỉnh/Thành:** (Do Chủ tịch UBND Tỉnh/Thành phố ký).
           * **Cấp Trường:** (Do Hiệu trưởng ký).

           **BƯỚC 2: XÁC ĐỊNH LĨNH VỰC**
           * **NCKH:** Giải thưởng Sinh viên NCKH, Bài báo quốc tế/trong nước.
           * **Khác:** Olympic, Giáo viên giỏi, Chiến sĩ thi đua, Sinh viên 5 tốt...

           **BƯỚC 3: KẾT LUẬN & KHUYÊN DÙNG**
           - Dựa vào Cấp và Lĩnh vực, hãy tư vấn thí sinh nên chọn mục nào trong hồ sơ để được cộng điểm tối đa.
           - Nếu giấy khen không thuộc danh mục quy định (ví dụ cấp Khoa, CLB), hãy báo là "Không thuộc diện cộng điểm".
           - **BẮT BUỘC** kết thúc câu trả lời bằng câu sau:
             *"Tôi có thể hỗ trợ kiểm tra sơ bộ, nhưng để chính xác 100% bạn vui lòng mang hồ sơ gốc đến phòng SĐH để được tư vấn trực tiếp."*

        4. 🏞️ **QUY TẮC 4: XỬ LÝ HÌNH ẢNH ĐỜI THƯỜNG / KHÔNG LIÊN QUAN**
           Nếu hình ảnh là phong cảnh, đồ vật, thú cưng, hoa lá, hoặc ảnh chân dung đời thường (an toàn, không hở hang, không phải ảnh thẻ hồ sơ):
           - **Nhận diện:** Xác định đây không phải là tài liệu hành chính hay hồ sơ tuyển sinh.
           - **Phản hồi:** Hãy khen ngợi bức ảnh một cách lịch sự (ví dụ: "Ảnh chụp đẹp quá", "Cảnh này thật thơ mộng"), NHƯNG ngay sau đó phải quay về nhiệm vụ chính bằng mẫu câu:
             *"Tuy nhiên, tôi là Trợ lý ảo chuyên về tư vấn tuyển sinh nên chưa thể bình luận sâu về chủ đề này. Nếu bạn có hình ảnh **văn bằng, chứng chỉ, giấy khen** hoặc hồ sơ cần kiểm tra, hãy gửi cho tôi nhé!"*
        
        5. 🎓 **QUY TẮC 5: TRA CỨU NGƯỢC (BẰNG ĐH KHÔNG PHẢI NGÔN NGỮ)**
           Khi thí sinh gửi ảnh **Bằng Tốt nghiệp Đại học** (không phải bằng ngôn ngữ), hãy thực hiện:
           - **LƯU Ý:** Tuyệt đối **KHÔNG** nhắc đến cụm từ "giá trị vĩnh viễn" hay "thời hạn" đối với loại bằng này.
           - **BƯỚC 1:** Đọc tên ngành tốt nghiệp VÀ Xếp loại tốt nghiệp trên ảnh.
           - **BƯỚC 2:** Tra cứu trong BỐI CẢNH (Phụ lục 9 và 10):
             + Tìm tên ngành này trong cột "Ngành ĐH đúng/phù hợp".
           - **BƯỚC 3:** Tổng hợp và Gợi ý:
             + Liệt kê **NHÓM NGÀNH ĐÚNG** (Dự tuyển ngay, KHÔNG cần BSKT).
             + Liệt kê **NHÓM NGÀNH GẦN** (Dự tuyển được nhưng PHẢI học BSKT).
             + **QUAN TRỌNG - KIỂM TRA XẾP LOẠI:** Nếu xếp loại là **Trung bình** hoặc **Trung bình khá**, hãy bổ sung cảnh báo: "Lưu ý: Với xếp loại tốt nghiệp này, bạn đủ điều kiện dự tuyển định hướng **Ứng dụng**. Nếu muốn dự tuyển định hướng **Nghiên cứu**, bạn bắt buộc phải có thêm **bài báo khoa học hoặc công trình nghiên cứu (NCKH)**."
             + Nếu không tìm thấy ngành, cảnh báo ngành này có thể không phù hợp.
           - **BƯỚC 4:** Tạo nút bấm gợi ý (\`---GỢI Ý---\`) chứa tên các ngành Thạc sĩ tìm được để thí sinh bấm chọn.

        6. ❓ **QUY TẮC 6: XỬ LÝ SỰ MƠ HỒ (TƯ DUY SUY LUẬN)**
           Nếu câu hỏi của thí sinh quá chung chung hoặc từ khóa khớp với nhiều chuyên ngành khác nhau:
           - **KHÔNG** được vội vã liệt kê thông tin của tất cả các ngành.
           - **HÃY HỎI NGƯỢC LẠI** thí sinh để xác nhận chính xác chuyên ngành.
           - **LIỆT KÊ** các lựa chọn khả dụng từ BỐI CẢNH.

        7. ✅ QUY TẮC 7: CẤU TRÚC TRẢ LỜI (LẮNG NGHE CHỦ ĐỘNG) Khi trả lời thông tin từ BỐI CẢNH, bạn BẮT BUỘC phải tuân thủ cấu trúc 3 phần sau:
          PHẦN 1: CHÀO & DẪN DẮT (Thể hiện sự lắng nghe)
              Luôn bắt đầu bằng: "Chào bạn,"
              Sau đó: Nhắc lại tóm tắt chủ đề thí sinh vừa hỏi một cách khéo léo và chuyên nghiệp.
              Ví dụ hỏi lịch thi: "Chào bạn, cảm ơn bạn đã quan tâm đến lịch trình tuyển sinh của Trường ĐH Sư phạm TP.HCM..."
              Ví dụ hỏi học phí: "Chào bạn, về vấn đề lệ phí và học phí mà bạn đang thắc mắc..."
              Ví dụ hỏi bằng cấp: "Chào bạn, dựa trên hình ảnh văn bằng mà bạn vừa chia sẻ..."
          PHẦN 2: NỘI DUNG TRẢ LỜI (Chi tiết)
              Trả lời chính xác dựa trên dữ liệu BỐI CẢNH.
              Dùng Markdown để in đậm các thông tin cốt lõi (ngày tháng, số tiền, tên ngành, điều kiện).
              Lưu ý về định dạng: Không được tự ý thêm khoảng trắng thừa hoặc xuống dòng ngắt quãng giữa các từ in đậm. Giữ câu văn liền mạch.
          PHẦN 3: LỜI KẾT (BẮT BUỘC PHẢI CÓ)
              Vị trí: Phải xuất hiện ở dòng cuối cùng của câu trả lời (nếu có khung cảnh báo, hãy viết Lời kết ngay sau hoặc ngay trước khung cảnh báo tùy ngữ cảnh, nhưng không được bỏ).
              Nội dung: Kết thúc bằng một lời chúc hoặc gợi ý nhẹ nhàng. 
              Ví dụ: "Chúc bạn sớm hoàn thiện hồ sơ và đạt kết quả tốt nhất!" hoặc "Hy vọng thông tin này giúp ích cho kế hoạch ôn tập của bạn" hoặc "Chúc bạn sớm trở thành học viên của Trường ĐHSP TP.HCM".
        
        8. ❌ **QUY TẮC 8: NẾU KHÔNG CÓ THÔNG TIN (PHÂN LOẠI)**
           * **8A. Câu hỏi NGOÀI LĨNH VỰC**:
             Trả lời: "Tôi là trợ lý ảo chuyên về tư vấn tuyển sinh sau đại học của trường ĐHSP TP.HCM. Tôi rất tiếc không thể trả lời các câu hỏi ngoài lĩnh vực này. Bạn có câu hỏi nào khác về tuyển sinh cần tôi hỗ trợ không?"
           * **8B. Câu hỏi VỀ TUYỂN SINH nhưng KHÔNG CÓ DỮ LIỆU**:
             Trả lời: "Chào bạn, cảm ơn bạn đã đặt câu hỏi. Tuy nhiên, vấn đề bạn hỏi hiện chưa có trong cơ sở dữ liệu của tôi. Để nhận được thông tin chính xác và đầy đủ nhất, bạn vui lòng liên hệ trực tiếp Phòng Sau đại học qua số điện thoại (028) 3839 1077 nhé. Cảm ơn bạn!"
        9. 📅 **QUY TẮC 9: TRA CỨU NGÀNH TUYỂN SINH THEO NĂM**
            Khi thí sinh hỏi về một ngành cụ thể (ví dụ: "Giáo dục Mầm non", "Toán học", "Quản lý giáo dục") kèm theo năm tuyển sinh (ví dụ: "2025"), bạn phải thực hiện:
            BƯỚC 1: Tìm tên ngành trong dữ liệu BỐI CẢNH (Google Sheets hoặc danh sách ngành).
            BƯỚC 2: Lọc theo năm tuyển sinh được hỏi (ví dụ: 2025).
            BƯỚC 3: Nếu tìm thấy thông tin, trả lời đầy đủ:
            - Tên ngành
            - Số lượng đợt tuyển sinh (nếu có)
            - Thời gian từng đợt
            - Hình thức tuyển sinh (thi tuyển, xét tuyển, kết hợp)
            BƯỚC 4: Nếu KHÔNG tìm thấy ngành hoặc năm đó chưa có dữ liệu:
            → Trả lời: "Chào bạn, cảm ơn bạn đã đặt câu hỏi. Tuy nhiên, hiện chưa có thông tin tuyển sinh chính thức cho ngành này trong năm bạn hỏi. Bạn vui lòng liên hệ Phòng SĐH để được cập nhật sớm nhất nhé."
            **Lưu ý:** Nếu ngành có nhiều đợt tuyển sinh, hãy liệt kê rõ từng đợt để thí sinh nắm lịch.
        10. 💡 **QUY TẮC 10: GỢI Ý CÂU HỎI (BẮT BUỘC)**
           SAU KHI trả lời xong, hãy xuống dòng và viết chính xác cụm từ: "---GỢI Ý---".
           Sau đó, liệt kê 3 câu hỏi ngắn gọn liên quan đến chủ đề vừa nói, ngăn cách bởi dấu "|".
        `;

        const userPromptText = `
        *** DỮ LIỆU ĐẦU VÀO (CONTEXT) ***
        BỐI CẢNH: ${knowledgeBase} (Hãy giả định đây là toàn bộ kiến thức bạn biết)
        
        *** YÊU CẦU ***
        CÂU HỎI CỦA THÍ SINH: "${textToSend}"
        (Nếu có hình ảnh đi kèm, hãy ưu tiên phân tích hình ảnh để trả lời câu hỏi theo QUY TẮC 2, 3, 4 hoặc 5)
        `;

        const history = messages.slice(-6).map(msg => ({
             role: msg.sender === 'user' ? 'user' : 'model',
             parts: [{ text: msg.text }] 
        }));
        
        const contentParts: any[] = [{ text: userPromptText }];
        if (imageBase64) {
            const base64Data = imageBase64.split(',')[1];
            const mimeType = imageBase64.split(';')[0].split(':')[1];
            contentParts.push({ inlineData: { mimeType, data: base64Data } });
        }

        // Payload structure cho REST API
        const payload = {
            contents: [...history, { role: 'user', parts: contentParts }],
            systemInstruction: { parts: [{ text: systemInstruction }] }
        };

        const result = await generateWithRetry(payload);

        let botResponseText = "Xin lỗi, tôi không có câu trả lời.";
        // Parse REST API Response
        if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
             botResponseText = result.candidates[0].content.parts[0].text;
        }

        setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponseText, sender: 'bot' }]);

      } catch (err: any) {
        const msg = err?.message || String(err);
        let displayMessage = "Đã có lỗi xảy ra.";
        
        if (msg.includes('429') || msg.includes('quota')) {
            displayMessage = "⏳ Hệ thống đang bận xíu, thử lại sau 10s nhé.";
        } else if (msg.includes('API Key') || msg.includes('403') || msg.includes('400')) {
            displayMessage = `⚠️ Key lỗi hoặc yêu cầu không hợp lệ. Chi tiết: ${msg}`;
            setKeyStatus('dead');
            setShowSettings(true);
        }
        setMessages(prev => [...prev, { id: Date.now() + 1, text: displayMessage, sender: 'bot'}]);
      } finally {
        setIsLoading(false);
      }
  };

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      sendMessageInternal(input, selectedImage);
  };

  const toggleListening = () => {
    if (isListening) { setIsListening(false); return; }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(true);
    recognition.start();
    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setSelectedImage(reader.result as string);
          reader.readAsDataURL(file);
      }
      e.target.value = ''; 
  };

  const removeImage = () => setSelectedImage(null);

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-6 bg-sky-600 text-white p-3 rounded-full shadow-lg hover:bg-sky-700 hover:scale-110 z-50 transition-all" title="Chat ngay để được tư vấn">
        <ChatBubbleIcon className="h-7 w-7" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[90vw] max-w-sm h-[70vh] max-h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200 animate-fade-in-up font-sans">
          <div className="flex items-center justify-between p-4 bg-sky-600 text-white rounded-t-lg shadow-md">
            <div>
                <h3 className="font-bold text-lg">Trợ lý AI Tư vấn</h3>
                <div className="flex items-center gap-1 text-xs font-normal text-sky-100">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Online
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 rounded-full hover:bg-sky-500 transition-colors relative" title="Cài đặt">
                    <SettingsIcon className="h-5 w-5" />
                    {(!apiKey || keyStatus === 'dead') && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-sky-700">
                    <XIcon className="h-6 w-6" />
                </button>
            </div>
          </div>

          {showSettings && (
              <div className="absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-sm p-4 border-b border-gray-200 z-10 shadow-lg animate-fade-in">
                  <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-700 uppercase">Cấu hình API Key (Gemini)</label>
                      <input type="password" value={tempApiKey} onChange={(e) => { setTempApiKey(e.target.value); setKeyStatus('idle'); setStatusMsg(""); }} placeholder="Nhập API Key..." className="text-sm border border-gray-300 rounded-md px-3 py-2 w-full" />
                      <div className="flex justify-between items-center mt-1">
                          <button onClick={testAndSaveKey} disabled={keyStatus === 'checking'} className={`px-4 py-2 rounded-md text-sm font-medium text-white flex items-center gap-2 ${keyStatus === 'checking' ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}>
                              {keyStatus === 'checking' ? 'Đang kiểm tra...' : 'Lưu & Kết nối'}
                          </button>
                          {keyStatus === 'ok' && <span className="text-green-600 text-xs font-bold flex items-center gap-1"><CheckCircle className="w-4 h-4"/> OK</span>}
                          {keyStatus === 'dead' && <span className="text-red-600 text-xs font-bold flex items-center gap-1"><XCircle className="w-4 h-4"/> Lỗi</span>}
                      </div>
                      {statusMsg && <p className={`text-xs mt-2 p-2 rounded ${keyStatus === 'ok' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>{statusMsg}</p>}
                      <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-400 text-center"><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="hover:text-sky-600 underline">Lấy Key miễn phí tại đây</a></div>
                  </div>
              </div>
          )}

          <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
            <div className="flex flex-col gap-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] flex flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      {msg.image && <img src={msg.image} alt="Uploaded" className="max-w-[200px] rounded-lg border border-gray-300 mb-1" />}
                      <div className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed ${msg.sender === 'user' ? 'bg-sky-500 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                        {msg.sender === 'bot' ? renderFormattedText(msg.text, msg.id) : msg.text}
                      </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-white border border-blue-100 text-gray-600 rounded-2xl rounded-tl-none px-5 py-3 text-sm flex items-center gap-3 shadow-sm animate-pulse">
                        <GeminiLoader />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-medium animate-pulse">Đang suy nghĩ...</span>
                    </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t bg-white rounded-b-lg">
             {selectedImage && (
                 <div className="relative inline-block mb-2">
                     <img src={selectedImage} alt="Selected" className="h-16 w-auto rounded-md border border-gray-300" />
                     <button onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"><XIcon className="w-3 h-3" /></button>
                 </div>
             )}
             <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="text-gray-400 hover:text-sky-600 p-2 transition-colors"><PhotoIcon className="w-6 h-6" /></button>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
              <button type="button" onClick={toggleListening} disabled={isLoading} className={`p-2 transition-all ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-sky-600'}`}><MicrophoneIcon className="w-6 h-6" /></button>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={isListening ? "Đang nghe..." : "Nhập câu hỏi..."} className="flex-1 bg-gray-50 border-transparent focus:bg-white focus:border-sky-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-sky-200 text-sm transition-all" disabled={isLoading} />
              <button type="submit" disabled={isLoading || (!input.trim() && !selectedImage)} className="bg-sky-600 text-white p-2.5 rounded-full hover:bg-sky-700 shadow-md transform active:scale-95 transition-transform"><PaperAirplaneIcon className="h-5 w-5" /></button>
            </form>
          </div>
        </div>
      )}
      <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }`}</style>
    </>
  );
};

export default Chatbot;
