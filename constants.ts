export const GENDERS = ['Nam', 'Nữ', 'Khác'];
export const NATIONALITIES = ['Việt Nam', 'Lào', 'Campuchia', 'Thái Lan', 'Trung Quốc', 'Nhật Bản', 'Hàn Quốc', 'Khác'];

export const MAJORS_DATA = [
    { code: 'DAIS', name: 'Đại số và lý thuyết số', availability: { 'Tp.HCM': ['research'] } },
    { code: 'DLHO', name: 'Địa lý học', availability: { 'Tp.HCM': ['research', 'applied'] } },
    { code: 'GDCT', name: 'Giáo dục học (Giáo dục chính trị)', availability: { 'Tp.HCM': ['research'] } },
    { code: 'GDHO', name: 'Giáo dục học', availability: { 'Tp.HCM': ['research', 'applied'] } },
    { code: 'GDMN', name: 'Giáo dục học (Giáo dục mầm non)', availability: { 'Tp.HCM': ['research', 'applied'], 'Gia Lai': ['applied'] } },
    { code: 'GDTC', name: 'Giáo dục học (Giáo dục thể chất)', availability: { 'Tp.HCM': ['research'] } },
    { code: 'GDTH', name: 'Giáo dục học (Giáo dục tiểu học)', availability: { 'Tp.HCM': ['research', 'applied'], 'Long An': ['applied'], 'Gia Lai': ['applied'] } },
    { code: 'GITI', name: 'Toán giải tích', availability: { 'Tp.HCM': ['research'] } },
    { code: 'HHTP', name: 'Hình học và tôpô', availability: { 'Tp.HCM': ['research'] } },
    { code: 'HOHC', name: 'Hóa hữu cơ', availability: { 'Tp.HCM': ['research'] } },
    { code: 'HOVC', name: 'Hóa vô cơ', availability: { 'Tp.HCM': ['research'] } },
    { code: 'KHMT', name: 'Khoa học máy tính', availability: { 'Tp.HCM': ['research', 'applied'] } },
    { code: 'LLVH', name: 'Lý luận văn học', availability: { 'Tp.HCM': ['research'] } },
    { code: 'LPTQ', name: 'Lý luận và phương pháp dạy học bộ môn tiếng Trung Quốc', availability: { 'Tp.HCM': ['research', 'applied'] } },
    { code: 'LSTG', name: 'Lịch sử thế giới', availability: { 'Tp.HCM': ['research', 'applied'] } },
    { code: 'LSVN', name: 'Lịch sử Việt Nam', availability: { 'Tp.HCM': ['research', 'applied'] } },
    { code: 'NNHO', name: 'Ngôn ngữ học', availability: { 'Tp.HCM': ['research'] } },
    { code: 'PHAP', name: 'Lý luận và phương pháp dạy học bộ môn tiếng Pháp', availability: { 'Tp.HCM': ['research', 'applied'] } },
    { code: 'PPHH', name: 'Lý luận và phương pháp dạy học bộ môn Hóa học', availability: { 'Tp.HCM': ['research', 'applied'] } },
    { code: 'PPTA', name: 'Lý luận và phương pháp dạy học bộ môn tiếng Anh', availability: { 'Tp.HCM': ['applied'] } },
    { code: 'PPVA', name: 'Lý luận và phương pháp dạy học bộ môn Ngữ văn', availability: { 'Tp.HCM': ['research'] } },
    { code: 'QLGD', name: 'Quản lý giáo dục', availability: { 'Tp.HCM': ['research', 'applied'] } },
    { code: 'STHO', name: 'Sinh thái học', availability: { 'Tp.HCM': ['research', 'applied'] } },
    { code: 'TALI', name: 'Tâm lý học', availability: { 'Tp.HCM': ['research', 'applied'] } },
    { code: 'TOAN', name: 'Lý luận và phương pháp dạy học bộ môn Toán', availability: { 'Tp.HCM': ['research', 'applied'] } },
    { code: 'VATL', name: 'Lý luận và phương pháp dạy học bộ môn Vật lý', availability: { 'Tp.HCM': ['research', 'applied'] } },
    { code: 'VHNN', name: 'Văn học nước ngoài', availability: { 'Tp.HCM': ['research'] } },
    { code: 'VHVN', name: 'Văn học Việt Nam', availability: { 'Tp.HCM': ['research'] } },
    { code: 'VLNT', name: 'Vật lý nguyên tử và hạt nhân', availability: { 'Tp.HCM': ['research'] } },
];


export const DEGREE_CLASSIFICATIONS = [
  { label: 'Xuất sắc', value: 'XS' },
  { label: 'Giỏi', value: 'G' },
  { label: 'Khá', value: 'K' },
  { label: 'Trung bình khá', value: 'TBK' },
  { label: 'Trung bình', value: 'TB' },
  { label: 'Không xếp loại', value: 'KXL' },
];

export const GRADUATION_SYSTEMS = [
  { label: 'Chính quy', value: 'CQ' },
  { label: 'Chuyên tu', value: 'CT' },
  { label: 'Không chính quy', value: 'KCQ' },
  { label: 'Khác', value: 'KH' },
  { label: 'Mở rộng', value: 'MR' },
  { label: 'Tại chức', value: 'TC' },
  { label: 'Từ xa', value: 'TX' },
  { label: 'Văn bằng 2', value: 'VB2' },
  { label: 'Vừa học vừa làm', value: 'VHVL' },
  { label: 'Vừa làm vừa học', value: 'VLVH' },
];

export const LANGUAGES = [
    { label: 'Tiếng Anh', value: 'Anh' },
    { label: 'Tiếng Pháp', value: 'Pháp' },
    { label: 'Tiếng Đức', value: 'Đức' },
    { label: 'Tiếng Nga', value: 'Nga' },
    { label: 'Tiếng Trung', value: 'Trung' },
    { label: 'Tiếng Nhật', value: 'Nhật' },
    { label: 'Tiếng Hàn', value: 'Hàn' },
    { label: 'Khác', value: 'Khác' },
];

export const PRIORITY_CATEGORIES = [
    { label: 'Không', value: '0' },
    { label: 'Người có thời gian công tác liên tục từ 02 năm trở lên ở khu vực 1.', value: 'KV1' },
    { label: 'Thương binh, người hưởng chính sách như thương binh.', value: 'TB' },
    { label: 'Con liệt sĩ.', value: 'CLS' },
    { label: 'Anh hùng lực lượng vũ trang, anh hùng lao động.', value: 'AHLĐ' },
    { label: 'Người dân tộc thiểu số có hộ khẩu thường trú từ 02 năm trở lên ở khu vực 1.', value: 'DTTS' },
    { label: 'Con đẻ của người hoạt động kháng chiến bị nhiễm chất độc hóa học.', value: 'CCĐMDC' },
];

export const SCHOLARSHIP_POLICIES = [
  { label: 'Không', value: 'Không' },
  { label: 'Sinh viên tốt nghiệp Trường ĐHSP Tp.HCM đạt thành tích học tập cao nhất trường.', value: 'Miễn 100%' },
  { label: 'Sinh viên tốt nghiệp trường khác đạt thành tích học tập cao nhất trường TN.', value: 'Giảm 75%' },
  { label: 'Sinh viên tốt nghiệp Trường ĐHSP Tp.HCM đạt thành tích học tập cao nhất khoa.', value: 'Giảm 50%' },
];


export const LANGUAGE_CERT_TYPES = [
    { label: 'Bằng đại học', value: 'Bằng ĐH' },
    { label: 'Bảng điểm tốt nghiệp ĐHSP', value: 'ĐHSP (bảng điểm)' },
    { label: 'B1', value: 'B1' },
    { label: 'B2', value: 'B2' },
    { label: 'C1', value: 'C1' },
    { label: 'C2', value: 'C2' },
    { label: 'TOEFL iBT', value: 'TOEFL iBT' },
    { label: 'TOEFL ITP', value: 'TOEFL ITP' },
    { label: 'IELTS', value: 'IELTS' },
    { label: 'Linguaskill', value: 'Linguaskill' },
    { label: 'TOEIC', value: 'TOEIC' },
    { label: 'Pearson Test of English Academic', value: 'PTE Academic' },
    { label: 'Pearson English International Certificate', value: 'PEIC' },
    { label: 'Aptis ESOL', value: 'Aptis ESOL' },
    { label: 'Tiếng Pháp', value: 'CIEP' },
    { label: 'Nga', value: 'Tiếng Nga' },
    { label: 'HSK', value: 'HSK' },
    { label: 'JLPT', value: 'JLPT' },
    { label: 'Tiếng Đức', value: 'Tiếng Đức' },
    { label: 'Tiếng Hàn', value: 'Tiếng Hàn' },
    { label: 'Tiếng Khác', value: 'Tiếng Khác' },
    { label: 'Chưa có ngoại ngữ', value: 'Chưa có NN' },
];
export const TRAINING_FACILITIES = ['Tp.HCM', 'Long An', 'Gia Lai'];

export const CITIES = [
  'Hà Nội', 'Huế', 'Lai Châu', 'Điện Biên', 'Sơn La', 'Lạng Sơn', 'Quảng Ninh',
  'Thanh Hoá', 'Nghệ An', 'Hà Tĩnh', 'Cao Bằng', 'Tuyên Quang', 'Lào Cai',
  'Thái Nguyên', 'Phú Thọ', 'Bắc Ninh', 'Hưng Yên', 'Hải Phòng', 'Ninh Bình',
  'Quảng Trị', 'Đà Nẵng', 'Quảng Ngãi', 'Gia Lai', 'Khánh Hoà', 'Lâm Đồng',
  'Đắk Lắk', 'Tp.HCM', 'Đồng Nai', 'Tây Ninh', 'Cần Thơ', 'Vĩnh Long',
  'Đồng Tháp', 'Cà Mau', 'An Giang', 'Khác', 'Nước ngoài'
];

export const ETHNICITIES = [
  'Kinh', 'Tày', 'Thái', 'Hoa', 'Khơ-me', 'Mường', 'Nùng', 'HMông', 'Dao',
  'Gia-rai', 'Ngái', 'Ê-đê', 'Ba na', 'Xơ-Đăng', 'Sán Chay', 'Cơ-ho',
  'Chăm', 'Sán Dìu', 'Hrê', 'Mnông', 'Ra-glai', 'Xtiêng', 'Bru-Vân Kiều',
  'Thổ', 'Giáy', 'Cơ-tu', 'Gié Triêng', 'Mạ', 'Khơ-mú', 'Co', 'Tà-ôi',
  'Chơ-ro', 'Kháng', 'Xinh-mun', 'Hà Nhì', 'Chu ru', 'Lào', 'La Chí', 'La Ha',
  'Phù Lá', 'La Hủ', 'Lự', 'Lô Lô', 'Chứt', 'Mảng', 'Pà Thẻn', 'Co Lao',
  'Cống', 'Bố Y', 'Si La', 'Pu Péo', 'Brâu', 'Ơ Đu', 'Rơ măm',
  'Người nước ngoài', 'Không xác định'
];

export const BONUS_POINTS_CATEGORIES = [
  { label: 'Không', value: 'NCKH0' },
  { label: 'Đạt giải Nhất, Nhì, Ba sinh viên NCKH cấp Bộ hoặc tương đương.', value: 'NCKH1' },
  { label: 'Đạt giải Nhất, Nhì, Ba sinh viên NCKH cấp Trường hoặc tương đương.', value: 'NCKH2' },
  { label: 'Có kết quả NCKH đã được công bố trong các ấn phẩm thuộc danh mục Web of Science hoặc Scopus hoặc bài báo đã được đăng trên các tạp chí khoa học quốc tế uy tín khác có mã số chuẩn ISSN.', value: 'NCKH3' },
  { label: 'Có bài báo đã được đăng trên các tạp chí khoa học trong nước có mã số chuẩn ISSN được Hội đồng Giáo sư nhà nước công nhận.', value: 'NCKH4' },
  { label: 'Có bài báo đã được đăng trên các Kỷ yếu của Hội nghị, Hội thảo Khoa học trong nước hoặc quốc tế có mã số chuẩn ISSN/ISBN.', value: 'NCKH5' },
  { label: 'Đề tài nghiên cứu khoa học cấp cơ sở hoặc tương đương trở lên và phải có kết quả nghiệm thu từ mức đạt trở lên.', value: 'NCKH6' },
  { label: 'Đạt giải Nhất, Nhì, Ba các kỳ thi Olympic sinh viên toàn quốc hoặc tương đương.', value: 'NCKH7' },
  { label: 'Giáo viên giỏi cấp quốc gia hoặc tương đương.', value: 'NCKH8' },
  { label: 'Giáo viên giỏi cấp tỉnh/thành hoặc tương đương.', value: 'NCKH9' },
  { label: 'Các thành tích hoặc giải thưởng nghiên cứu khoa học khác.', value: 'NCKH10' },
  { label: 'Các loại thành tích khác', value: 'KHAC11' },
];