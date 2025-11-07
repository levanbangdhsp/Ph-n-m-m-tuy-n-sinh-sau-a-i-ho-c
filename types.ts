export enum Page {
  Landing,
  Login,
  Register,
  ForgotPassword,
  Application,
  ApplicationStatus,
}

export enum ApplicationStatusEnum {
  NOT_SUBMITTED = 'Chưa nộp hồ sơ',
  SUBMITTED = 'Đã nộp thành công',
  PROCESSING = 'Đang trong quá trình xử lý',
  NEEDS_UPDATE = 'Yêu cầu bổ sung',
  VALID = 'Hồ sơ hợp lệ',
  INVALID = 'Hồ sơ không hợp lệ',
}

export interface TimelineEvent {
    stage: string;
    date: string | null;
    completed: boolean;
    current: boolean;
}

export interface ApplicationReviewDetails {
  graduationScore: number;
  hasResearchBonus: boolean;
  hasOtherAchievementsBonus: boolean;
  priorityScore: number;
  totalScore: number;
  scholarshipPolicy: string;
}

export interface AdmissionDetails {
  admittedMajor: string;
  admittedOrientation: string;
}

export interface ApplicationStatusData {
  status: ApplicationStatusEnum;
  details: string;
  timeline: TimelineEvent[];
  missingDocuments?: string[];
  reviewDetails?: ApplicationReviewDetails;
  admissionResult?: 'Trúng tuyển' | 'Không trúng tuyển' | 'Chưa có';
  admissionDetails?: AdmissionDetails;
}


export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string; // In a real app, never store plain text passwords
}

export interface ApplicationFormData {
  // Section I
  fullName: string;
  gender: string;
  dob: string;
  pob: string;
  ethnicity: string;
  nationality: string;
  idCardNumber: string;
  idCardIssueDate: string;
  idCardIssuePlace: string;
  phone: string;
  email: string;
  contactAddress: string;
  workplace: string;

  // Section II
  trainingFacility: string;
  firstChoiceMajor: string;
  secondChoiceMajor: string;
  thirdChoiceMajor: string;
  firstChoiceOrientation: 'research' | 'applied' | '';
  secondChoiceOrientation: 'research' | 'applied' | '';
  thirdChoiceOrientation: 'research' | 'applied' | '';

  // Section III
  university: string;
  graduationYear: string;
  gpa10: string;
  gpa4: string;
  graduationMajor: string;
  degreeClassification: string;
  graduationSystem: string;
  supplementaryCert: string;

  // Section IV
  language: string;
  languageCertType: string;
  languageCertIssuer: string;
  languageScore: string;
  languageCertDate: string;

  // Section V
  researchAchievements: string;
  otherAchievements: string;
  // Section VI
  priorityCategory: string;
  // Section VII
  scholarshipPolicy: string;

  // Section VIII (File Links)
  linkAnhThe: string;
  linkBangTotNghiep: string;
  linkBangDiem: string;
  linkChungChiNN: string;
  linkUuTien: string;
  linkNCKH: string;
}