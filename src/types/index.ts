export type UserRole = 'admin' | 'teacher' | 'student';

export type NavTab = 'home' | 'ai' | 'game' | 'scanner' | 'map' | 'diary' | 'teacher' | 'evaluation' | 'admin' | 'profile' | 'settings';

export type WasteCategory = 'organic' | 'recyclable' | 'inorganic' | 'hazardous';

export interface WasteItem {
  id: string;
  name: string;
  category: WasteCategory;
  materialGroup?: 'giấy' | 'nhựa' | 'kim_loại' | 'hữu_cơ' | 'khác';
  emoji: string;
  description: string;
  funFact: string;
  decomposeTime: string;
}

export interface BinInfo {
  id: WasteCategory;
  name: string;
  subName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  examples: string;
}

export interface StudentProfile {
  id: string;
  nickname: string;
  realNamePreview: string; // Tên viết tắt bảo vệ quyền riêng tư, vd: Vàng A D.
  grade: number; // 1 -> 5
  className: string;
  avatar: string;
  greenPoints: number;
  badges: string[];
  sortGamesPlayed: number;
  quizzesCompleted: number;
  actionsLogged: number;
  scansCompleted: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type ExerciseQuestionType = 'trắc nghiệm' | 'đúng_sai' | 'tự_luận_ngắn';

export interface ExerciseQuestion {
  id: number;
  type: ExerciseQuestionType;
  prompt: string;
  options?: string[]; // for trắc nghiệm (4 options)
  correctAnswer: number | boolean | string;
  explanation: string;
  guideTip?: string; // Gợi ý tư duy và hướng dẫn kiểm chứng
}

export interface AssignmentItem {
  id: string;
  title: string;
  grade: number;
  className: string;
  topic: string;
  difficulty: 'dễ' | 'trung bình' | 'nâng cao';
  teacherId: string;
  teacherName: string;
  createdAt: number;
  questions: ExerciseQuestion[];
  submissionsCount: number;
}

export interface AiFeedbackItem {
  id: string;
  messageId: string;
  rating: 'helpful' | 'unhelpful';
  questionSnippet?: string;
  createdAt: number;
}

export type GameType =
  | 'waste_sorting'
  | 'water_saving'
  | 'electricity_saving'
  | 'tree_protection'
  | 'eco_quiz';

export interface GameHistoryItem {
  id: string;
  gameType: GameType;
  gameTitle: string;
  score: number;
  maxScore: number;
  correctAnswers: number;
  totalQuestions: number;
  badge?: string;
  timestamp: number;
  studentNickname: string;
  className: string;
}

export interface ActivityRecord {
  id: string;
  studentId: string;
  studentNickname: string;
  className: string;
  grade: number;
  activityType:
    | 'waste_sorting'
    | 'water_saving'
    | 'electricity_saving'
    | 'tree_protection'
    | 'eco_quiz'
    | 'ai_quiz'
    | 'ai_ask'
    | 'waste_scan'
    | 'green_action';
  title: string;
  score?: number;
  maxScore?: number;
  greenPointsEarned: number;
  timestamp: number;
  details?: string;
}

export interface ClassSummary {
  className: string;
  grade: number;
  totalStudents: number;
  avgSortingScore: number;
  completedQuizzes: number;
  totalGreenPoints: number;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. '3A1'
  grade: number; // 1 -> 5
  headTeacherId?: string;
  headTeacherName: string;
  room?: string;
  schoolYear: string;
  targetStudents: number;
  description?: string;
  createdAt: number;
}

export interface TeacherAccount {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'teacher' | 'admin';
  title: string;
  assignedClasses: string[];
  stt?: number;
  birthDate?: string;
  gender?: 'Nam' | 'Nữ';
  ethnicity?: string;
  phone?: string;
  status?: string;
  position?: 'Giáo viên' | 'Cán bộ quản lý' | 'Nhân viên';
}

export interface LearningLesson {
  id: string;
  title: string;
  topic: GreenActionTopic;
  topicLabel: string;
  grade: number;
  summary: string;
  content: string;
  author: string;
  createdAt: number;
  isAiGenerated?: boolean;
  isApproved: boolean;
}

export interface LearningQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: GreenActionTopic;
  topicLabel: string;
  grade: number;
  author: string;
  createdAt: number;
  isAiGenerated?: boolean;
  isApproved: boolean;
}

export interface EnvironmentalTopicItem {
  id: GreenActionTopic;
  name: string;
  icon: string;
  color: string;
  description: string;
  keyPoints: string[];
}

export type GreenActionTopic = 'waste' | 'water' | 'electricity' | 'trees' | 'general';

export interface TeacherGreenTask {
  id: string;
  title: string;
  topic: GreenActionTopic;
  topicLabel: string;
  targetClass: string;
  instructions: string;
  deadline: string;
  allowImageUpload: boolean;
  rewardPoints: number;
  createdAt: number;
  createdBy: string;
  suggestedByAi?: boolean;
}

export interface GreenAction {
  id: string;
  taskId?: string;
  taskTitle?: string;
  studentId: string;
  studentNickname: string;
  className: string;
  grade?: number;
  title: string;
  category: 'tree_planting' | 'plastic_free' | 'water_saving' | 'cleanup' | 'energy_saving' | 'waste_sorting';
  categoryLabel: string;
  topic?: GreenActionTopic;
  topicLabel?: string;
  description: string;
  productType?: 'text_reflection' | 'drawing' | 'poster' | 'article';
  productTypeLabel?: string;
  imageUrl?: string;
  status?: 'pending' | 'approved' | 'needs_revision';
  teacherFeedback?: string;
  points: number;
  timestamp: number;
  reviewedAt?: number;
  reviewedBy?: string;
  icon: string;
  verified: boolean;
}

export type SchoolCampusZone =
  | 'san_truong'
  | 'vuon_cay'
  | 'lop_hoc'
  | 'thung_rac'
  | 'nuoc_sach'
  | 'nang_luong'
  | string;

export interface CampusZoneItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgLight: string;
  borderColor: string;
  description: string;
  isCustom?: boolean;
}

export interface GreenMapMission {
  title: string;
  description: string;
  type: 'quiz' | 'action_report' | 'game_link';
  question?: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
  actionPrompt?: string;
  linkedGame?: 'waste_sorting' | 'water_saving' | 'electricity_saving' | 'tree_protection' | 'eco_quiz';
  linkedTab?: 'game' | 'diary' | 'ai' | 'scanner';
  attachedLesson?: {
    topic: string;
    takeaway: string;
  };
}

export interface GreenMapPoint {
  id: string;
  name: string;
  zone: string;
  zoneNameVi: string;
  description: string;
  imageUrl?: string;
  icon: string;
  xPercent: number; // 0 - 100 for interactive map coordinate
  yPercent: number; // 0 - 100
  pointsReward: number;
  tips: string;
  safetyNote?: string;
  mission: GreenMapMission;
  createdBy: string;
  isApprovedByTeacher: boolean;
  createdAt: number;
}

// Backward-compatible alias
export type GreenMapLocation = GreenMapPoint;

export interface MapTaskSubmission {
  id: string;
  pointId: string;
  pointName: string;
  studentId: string;
  studentNickname: string;
  className: string;
  grade: number;
  submittedAnswer?: string | number;
  notes?: string;
  teacherFeedback?: string;
  status: 'pending' | 'approved' | 'rejected';
  pointsAwarded: number;
  submittedAt: number;
  reviewedBy?: string;
  reviewedAt?: number;
}


export interface NewsArticle {
  id: string;
  title: string;
  tag: string;
  summary: string;
  content: string;
  date: string;
  author: string;
  icon: string;
  readMinutes: number;
}

export type WasteMaterialGroup =
  | 'giấy_bìa'
  | 'nhựa'
  | 'kim_loại'
  | 'hữu_cơ'
  | 'chưa_xác_định';

export interface WasteScanResult {
  itemName: string;
  materialGroup: WasteMaterialGroup;
  materialGroupNameVi: string;
  category: 'organic' | 'recyclable' | 'inorganic' | 'hazardous' | 'unknown';
  categoryNameVi: string;
  binColor: string;
  confidence: number;
  confidenceLevel?: 'cao' | 'trung_bình' | 'thấp' | 'chưa_rõ';
  explanation: string;
  teacherApprovedGuidance: string;
  ecoTip?: string;
  funFact?: string;
  decomposeTime?: string;
  isUnidentified?: boolean;
  isFaceDetected?: boolean;
  safetyNotice?: string;
  detectedPackagingText?: string; // Nội dung chữ / nhãn mác trên bao bì
  brandOrLabel?: string; // Tên nhãn hiệu / loại bao bì phát hiện được
  packagingMaterial?: string; // Chất liệu bao bì (Ví dụ: Giấy kraft nguyên sinh, Màng nhựa PE, Bột giấy 3 lớp...)
  recyclingSymbol?: string; // Ký hiệu tái chế (Ví dụ: ♻️ Giấy tái chế, ♳ PET 01, ♴ HDPE 02...)
}

export interface ScanFeedbackReport {
  id: string;
  scannedItemName: string;
  predictedGroup: WasteMaterialGroup;
  userSuggestedItem: string;
  userSuggestedGroup: WasteMaterialGroup;
  notes?: string;
  reporterNickname: string;
  className: string;
  createdAt: number;
}

export interface TeacherSamplePhoto {
  id: string;
  title: string;
  materialGroup: WasteMaterialGroup;
  materialGroupNameVi: string;
  imageUrl: string;
  expectedCategory: 'organic' | 'recyclable' | 'inorganic' | 'hazardous';
  expectedCategoryNameVi: string;
  description: string;
  approvedByTeacher: string;
  createdAt: number;
  isDefault?: boolean;
}

// --- IMPACT ASSESSMENT & EVALUATION MODULE (BÁO CÁO & ĐÁNH GIÁ HIỆU QUẢ) ---

export type SurveyPhase = 'pre' | 'post';

export interface SurveyQuestion {
  id: string;
  phase: 'both' | 'pre' | 'post';
  type: 'knowledge' | 'habit' | 'skill';
  typeLabel: string;
  topic: GreenActionTopic;
  topicLabel: string;
  prompt: string;
  options?: string[]; // 4 choices for knowledge
  correctIndex?: number;
  scaleOptions?: { label: string; points: number }[]; // 3-4 scale choices for habits
  explanation?: string;
}

export interface StudentSurveyResponse {
  id: string;
  studentId: string;
  studentNickname: string;
  className: string;
  grade: number;
  phase: SurveyPhase;
  knowledgeScore: number; // 0 - 100
  habitScore: number; // 0 - 100
  sortingPracticeScore: number; // 0 - 100
  compositeScore: number; // 0 - 100
  completedAt: number;
  answers: Record<string, number>;
}

export interface EvidenceItem {
  id: string;
  title: string;
  category: 'activity_photo' | 'student_product' | 'field_work' | 'award';
  categoryLabel: string;
  imageUrl?: string;
  className: string;
  studentNickname?: string;
  date: string;
  description: string;
  verifiedBy: string;
  isApprovedForReport: boolean;
  competitionTag?: string; // Tag danh mục hồ sơ dự thi
}

export interface EvaluationCriteria {
  knowledgeWeight: number; // e.g., 35%
  habitWeight: number; // e.g., 35%
  practiceWeight: number; // e.g., 30%
  targetPassRate: number; // e.g., 80%
  academicTerm: string; // e.g., 'Học Kỳ 1 - Năm học 2025-2026'
  schoolName: string;
}

export interface QualitativeNote {
  id: string;
  date: string;
  author: string;
  className: string;
  observationTopic: string;
  notes: string;
  studentEngagementLevel: 'rất_hào_hứng' | 'tích_cực' | 'bình_thường' | 'cần_động_viên';
}


