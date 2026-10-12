import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Award,
  TrendingUp,
  BarChart3,
  BookOpen,
  Download,
  Filter,
  Plus,
  Sparkles,
  MapPin,
  ShieldCheck,
  Calendar,
  Key,
} from 'lucide-react';
import {
  ActivityRecord,
  ClassSummary,
  EnvironmentalTopicItem,
  GameType,
  GreenActionTopic,
  LearningLesson,
  LearningQuestion,
  NavTab,
  SchoolClass,
  StudentProfile,
  TeacherAccount,
} from '../types';
import { AuthUser } from '../services/authService';
import { storageService, ENVIRONMENTAL_TOPICS } from '../services/storageService';
import { playSound } from '../utils/audio';

import { TeacherOverviewTab } from './teacher/TeacherOverviewTab';
import { TeacherClassManagementTab } from './teacher/TeacherClassManagementTab';
import { TeacherLearningMonitoringTab } from './teacher/TeacherLearningMonitoringTab';
import { TeacherStatisticsTab } from './teacher/TeacherStatisticsTab';
import { TeacherLearningMaterialsTab } from './teacher/TeacherLearningMaterialsTab';
import { TeacherReportsTab } from './teacher/TeacherReportsTab';
import { BulkStudentGeneratorModal } from './teacher/BulkStudentGeneratorModal';

export type TeacherDashboardTab =
  | 'overview'
  | 'classes'
  | 'monitoring'
  | 'statistics'
  | 'materials'
  | 'reports';

interface TeacherDashboardViewProps {
  profiles: StudentProfile[];
  activities: ActivityRecord[];
  onRefresh: () => void;
  onShowToast?: (title: string, desc?: string, type?: 'success' | 'reward' | 'info' | 'error') => void;
  onNavigate?: (tab: NavTab) => void;
  currentUser?: AuthUser | null;
  isOnline?: boolean;
}

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({
  profiles,
  activities,
  onRefresh,
  onShowToast,
  onNavigate,
  currentUser,
  isOnline = true,
}) => {
  // Navigation sub-tab
  const [activeTab, setActiveTab] = useState<TeacherDashboardTab>('overview');

  // Filter states
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');

  // School Classes, Teachers, Lessons, Questions from storage
  const [schoolClasses, setSchoolClasses] = useState<SchoolClass[]>(() => storageService.getSchoolClasses());
  const [teachers, setTeachers] = useState<TeacherAccount[]>(() => storageService.getTeachers());
  const [lessons, setLessons] = useState<LearningLesson[]>(() => storageService.getLessons());
  const [questions, setQuestions] = useState<LearningQuestion[]>(() => storageService.getQuestions());

  // Quick challenge modal
  const [showAddChallengeModal, setShowAddChallengeModal] = useState<boolean>(false);
  const [challengeTitle, setChallengeTitle] = useState<string>('');
  const [challengeTargetClass, setChallengeTargetClass] = useState<string>('3A1');
  const [challengeReward, setChallengeReward] = useState<number>(50);

  // Student code creation modal
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentNickname, setNewStudentNickname] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('1A1');
  const [newStudentPin, setNewStudentPin] = useState('1234');
  const [createdStudentResult, setCreatedStudentResult] = useState<{
    studentCode: string;
    pin: string;
    nickname: string;
  } | null>(null);

  // Bulk Auto-Generate Students Modal
  const [showBulkStudentsModal, setShowBulkStudentsModal] = useState(false);
  const [bulkDefaultClass, setBulkDefaultClass] = useState('1A1');

  // Respect Teacher RBAC & assigned classes
  useEffect(() => {
    if (currentUser?.role === 'teacher' && currentUser.assignedClasses && currentUser.assignedClasses.length > 0) {
      // Default to teacher's primary assigned class if not ALL
      if (selectedClass === 'ALL' && currentUser.assignedClasses.length === 1) {
        setSelectedClass(currentUser.assignedClasses[0]);
      }
    }
  }, [currentUser]);

  // Sync data on reload
  const refreshStorageData = () => {
    setSchoolClasses(storageService.getSchoolClasses());
    setTeachers(storageService.getTeachers());
    setLessons(storageService.getLessons());
    setQuestions(storageService.getQuestions());
    onRefresh();
  };

  const classSummaries: ClassSummary[] = storageService.getClassSummaries();
  const gameHistory = storageService.getGameHistory();
  const topicStruggleList = storageService.getTopicStruggleAnalysis(selectedClass);
  const prePostComparison = storageService.getPrePostComparison(selectedClass);
  const submissionReviewStats = storageService.getSubmissionReviewStats(selectedClass);

  // Multi-dimensional filters
  const filteredProfiles = profiles.filter((p) => {
    const matchesClass = selectedClass === 'ALL' || p.className === selectedClass;
    const matchesGrade = selectedGrade === 'ALL' || String(p.grade) === selectedGrade;
    return matchesClass && matchesGrade;
  });

  const filteredActivities = activities.filter((a) => {
    const matchesClass = selectedClass === 'ALL' || a.className === selectedClass;
    const matchesGrade = selectedGrade === 'ALL' || String(a.grade) === selectedGrade;
    return matchesClass && matchesGrade;
  });

  // Calculate totals
  const totalClassesCount = schoolClasses.length;
  const totalStudentsCount = profiles.length;
  const totalActivitiesCount = activities.length;
  const completedTasksCount = activities.filter((a) => a.activityType === 'green_action' || a.activityType === 'ai_quiz').length;
  const pendingSubmissionsCount = submissionReviewStats.pendingCount;

  // Handlers for Class Management
  const handleAddClass = (cls: Omit<SchoolClass, 'id' | 'createdAt'>) => {
    storageService.addSchoolClass(cls);
    refreshStorageData();
    onShowToast?.('Tạo lớp thành công! 🏫', `Đã thêm lớp ${cls.name} vào hệ thống.`, 'success');
  };

  const handleUpdateClass = (id: string, updates: Partial<SchoolClass>) => {
    storageService.updateSchoolClass(id, updates);
    refreshStorageData();
    onShowToast?.('Cập nhật lớp thành công!', 'Thông tin lớp đã được lưu.', 'info');
  };

  const handleDeleteClass = (id: string) => {
    storageService.deleteSchoolClass(id);
    refreshStorageData();
    onShowToast?.('Đã xóa lớp học', 'Dữ liệu lớp đã được gỡ bỏ.', 'info');
  };

  const handleAssignTeacher = (teacherId: string, className: string) => {
    storageService.assignTeacherToClass(teacherId, className);
    refreshStorageData();
    onShowToast?.('Đã phân công giáo viên! 👩‍🏫', `Phụ trách lớp ${className}.`, 'success');
  };

  const handleResetClasses = () => {
    storageService.resetSchoolClassesToDefault();
    refreshStorageData();
    onShowToast?.('Đã khôi phục lớp mặc định', 'Danh sách 5 lớp tiêu chuẩn Sa Pa.', 'info');
  };

  const handleUpdateStudent = (id: string, updates: Partial<StudentProfile>) => {
    storageService.updateStudentProfile(id, updates);
    refreshStorageData();
    onShowToast?.('Cập nhật học sinh thành công!', 'Thông tin học sinh đã được lưu.', 'success');
  };

  const handleDeleteStudent = (id: string) => {
    storageService.deleteStudentProfile(id);
    refreshStorageData();
    onShowToast?.('Đã xóa học sinh', 'Tài khoản học sinh đã được gỡ bỏ.', 'info');
  };

  // Handlers for Learning Materials
  const handleAddLesson = (lesson: Omit<LearningLesson, 'id' | 'createdAt'>) => {
    storageService.addLesson(lesson);
    refreshStorageData();
  };

  const handleDeleteLesson = (id: string) => {
    storageService.deleteLesson(id);
    refreshStorageData();
    onShowToast?.('Đã xóa bài học', 'Bài học đã gỡ khỏi thư viện.', 'info');
  };

  const handleApproveLesson = (id: string) => {
    storageService.approveLesson(id);
    refreshStorageData();
    onShowToast?.('Đã duyệt bài học!', 'Bài học đã sẵn sàng cho học sinh.', 'success');
  };

  const handleAddQuestion = (question: Omit<LearningQuestion, 'id' | 'createdAt'>) => {
    storageService.addQuestion(question);
    refreshStorageData();
  };

  const handleDeleteQuestion = (id: string) => {
    storageService.deleteQuestion(id);
    refreshStorageData();
    onShowToast?.('Đã xóa câu hỏi', 'Câu hỏi đã gỡ khỏi kho đề.', 'info');
  };

  const handleApproveQuestion = (id: string) => {
    storageService.approveQuestion(id);
    refreshStorageData();
    onShowToast?.('Đã duyệt câu hỏi!', 'Câu hỏi đã đưa vào kho đề thi AI.', 'success');
  };

  const handleAssignGame = (gameType: GameType, targetClassInput: string, targetScore: number, pointsReward: number) => {
    storageService.addTeacherGameTask({
      title: `Thử thách trò chơi sinh thái: ${gameType}`,
      gameType,
      targetClass: targetClassInput,
      targetScore,
      pointsReward,
      assignedBy: currentUser?.displayName || 'Thầy Cô Giáo Sa Pa',
    });
    refreshStorageData();
  };

  // Handler for creating student code
  const handleCreateStudentCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentNickname.trim()) return;

    playSound('badge');
    const studentCount = profiles.filter((p) => p.className === newStudentClass).length + 1;
    const generatedCode = `SPA-${newStudentClass}-${String(studentCount).padStart(2, '0')}`;

    const newProfile: StudentProfile = {
      id: 'hs-' + Date.now(),
      nickname: newStudentNickname.trim(),
      realNamePreview: newStudentNickname.trim().slice(0, 1) + '. ' + newStudentClass,
      grade: Number(newStudentClass[0]) || 3,
      className: newStudentClass,
      avatar: '🌱',
      greenPoints: 100,
      badges: ['Tân Binh Xanh'],
      sortGamesPlayed: 0,
      quizzesCompleted: 0,
      actionsLogged: 0,
      scansCompleted: 0,
    };

    storageService.saveProfile(newProfile);
    setCreatedStudentResult({
      studentCode: generatedCode,
      pin: newStudentPin,
      nickname: newStudentNickname.trim(),
    });

    onShowToast?.('Cấp mã thành công! 🌱', `Đã tạo mã ${generatedCode} cho em ${newStudentNickname}`, 'reward');
    refreshStorageData();
  };

  // Handler for challenge creation
  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeTitle.trim()) return;

    playSound('badge');
    storageService.addActivity({
      studentId: 'teacher-sys',
      studentNickname: currentUser?.displayName || 'Thầy Cô Giáo',
      className: challengeTargetClass,
      grade: parseInt(challengeTargetClass[0]) || 3,
      activityType: 'green_action',
      title: `Thử Thách Mới: ${challengeTitle}`,
      score: 100,
      maxScore: 100,
      greenPointsEarned: challengeReward,
      details: `Giao cho toàn bộ học sinh lớp ${challengeTargetClass}`,
    });

    setChallengeTitle('');
    setShowAddChallengeModal(false);
    refreshStorageData();
    onShowToast?.('Đã phát động thử thách! 🏆', `Giao cho lớp ${challengeTargetClass}.`, 'reward');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Teacher Header Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>GREEN DASHBOARD – Bảng Điều Khiển Giáo Viên</span>
            </span>

            {currentUser && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {currentUser.role === 'admin'
                    ? 'Quyền Quản Trị / Ban Giám Hiệu'
                    : `Giáo viên: ${currentUser.displayName}`}
                </span>
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Quản Lý Giáo Dục Xanh & Công Dân Số Nhí Sa Pa
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi lớp học, đánh giá kết quả rèn luyện thực tế, quản lý học liệu và xuất báo cáo sư phạm
          </p>
        </div>

        {/* Global Multi-dimensional Filters */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Lọc:</span>
          </div>

          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => {
              playSound('click');
              setSelectedClass(e.target.value);
            }}
            className="bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-hidden"
          >
            <option value="ALL">Toàn Trường</option>
            {schoolClasses.map((cls) => (
              <option key={cls.id} value={cls.name}>
                Lớp {cls.name}
              </option>
            ))}
          </select>

          {/* Grade Filter */}
          <select
            value={selectedGrade}
            onChange={(e) => {
              playSound('click');
              setSelectedGrade(e.target.value);
            }}
            className="bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-hidden"
          >
            <option value="ALL">Tất Cả Khối</option>
            <option value="1">Khối 1</option>
            <option value="2">Khối 2</option>
            <option value="3">Khối 3</option>
            <option value="4">Khối 4</option>
            <option value="5">Khối 5</option>
          </select>
        </div>
      </div>

      {/* Main 6 Navigation Tabs (Mobile-Friendly Horizontal Touch Scroll) */}
      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max bg-white p-1.5 rounded-2xl border border-emerald-100 shadow-xs">
          <button
            onClick={() => {
              playSound('click');
              setActiveTab('overview');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>1. Tổng Quan</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setActiveTab('classes');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'classes'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>2. Quản Lý Lớp &amp; Học Sinh (Thêm, Sửa, Xóa)</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setActiveTab('monitoring');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'monitoring'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>3. Theo Dõi Học Tập</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setActiveTab('statistics');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'statistics'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>4. Thống Kê & Biểu Đồ</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setActiveTab('materials');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'materials'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>5. Quản Lý Học Liệu</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setActiveTab('reports');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'reports'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>6. Xuất Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <TeacherOverviewTab
          totalClasses={totalClassesCount}
          totalStudents={totalStudentsCount}
          totalActivitiesCount={totalActivitiesCount}
          completedTasksCount={completedTasksCount}
          pendingSubmissionsCount={pendingSubmissionsCount}
          classSummaries={classSummaries}
          selectedClass={selectedClass}
          onSelectClass={setSelectedClass}
          filteredActivities={filteredActivities}
          onOpenAddClass={() => {
            setActiveTab('classes');
          }}
          onOpenAddStudent={() => {
            setShowAddStudentModal(true);
            setCreatedStudentResult(null);
          }}
          onOpenBulkStudents={() => {
            setBulkDefaultClass(selectedClass === 'ALL' ? '1A1' : selectedClass);
            setShowBulkStudentsModal(true);
          }}
          onOpenAddChallenge={() => setShowAddChallengeModal(true)}
          onOpenExportReport={() => setActiveTab('reports')}
          onNavigate={onNavigate}
        />
      )}

      {/* Tab 2: Class Management */}
      {activeTab === 'classes' && (
        <TeacherClassManagementTab
          classes={schoolClasses}
          teachers={teachers}
          profiles={profiles}
          selectedClass={selectedClass}
          onSelectClass={setSelectedClass}
          onAddClass={handleAddClass}
          onUpdateClass={handleUpdateClass}
          onDeleteClass={handleDeleteClass}
          onAssignTeacher={handleAssignTeacher}
          onOpenAddStudentModal={(defaultClass) => {
            if (defaultClass) setNewStudentClass(defaultClass);
            setShowAddStudentModal(true);
            setCreatedStudentResult(null);
          }}
          onOpenBulkStudentsModal={(defaultClass) => {
            setBulkDefaultClass(defaultClass || (selectedClass === 'ALL' ? '1A1' : selectedClass));
            setShowBulkStudentsModal(true);
          }}
          onResetClasses={handleResetClasses}
          onUpdateStudent={handleUpdateStudent}
          onDeleteStudent={handleDeleteStudent}
        />
      )}

      {/* Tab 3: Learning Monitoring */}
      {activeTab === 'monitoring' && (
        <TeacherLearningMonitoringTab
          selectedClass={selectedClass}
          gameHistory={gameHistory}
          activities={activities}
          profiles={profiles}
          classSummaries={classSummaries}
          topicStruggleList={topicStruggleList}
          onQuickAssignReinforcement={(topic) => {
            setActiveTab('materials');
            onShowToast?.('Gợi ý củng cố chủ đề!', `Đã chuyển sang kho học liệu để giao bài ôn tập cho chủ đề này.`, 'info');
          }}
        />
      )}

      {/* Tab 4: Statistics */}
      {activeTab === 'statistics' && (
        <TeacherStatisticsTab
          selectedClass={selectedClass}
          topicStruggleList={topicStruggleList}
          prePostComparison={prePostComparison}
          submissionReviewStats={submissionReviewStats}
          activities={activities}
        />
      )}

      {/* Tab 5: Learning Materials */}
      {activeTab === 'materials' && (
        <TeacherLearningMaterialsTab
          lessons={lessons}
          questions={questions}
          environmentalTopics={ENVIRONMENTAL_TOPICS}
          onAddLesson={handleAddLesson}
          onDeleteLesson={handleDeleteLesson}
          onApproveLesson={handleApproveLesson}
          onAddQuestion={handleAddQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onApproveQuestion={handleApproveQuestion}
          onAssignGame={handleAssignGame}
          onShowToast={onShowToast}
          isOnline={isOnline}
        />
      )}

      {/* Tab 6: Reports */}
      {activeTab === 'reports' && (
        <TeacherReportsTab
          profiles={profiles}
          activities={activities}
          classSummaries={classSummaries}
          selectedClass={selectedClass}
          onSelectClass={setSelectedClass}
          onShowToast={onShowToast}
        />
      )}

      {/* MODAL: ADD CHALLENGE */}
      {showAddChallengeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-emerald-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>Giao Thử Thách Xanh Cho Lớp</span>
              </h3>
              <button
                onClick={() => setShowAddChallengeModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateChallenge} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên Thử Thách Hoặc Chủ Đề Bài Tập:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Phân loại 100% vỏ hộp sữa học đường..."
                  value={challengeTitle}
                  onChange={(e) => setChallengeTitle(e.target.value)}
                  className="w-full bg-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Lớp Áp Dụng:
                  </label>
                  <select
                    value={challengeTargetClass}
                    onChange={(e) => setChallengeTargetClass(e.target.value)}
                    className="w-full bg-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden font-bold"
                  >
                    {schoolClasses.map((cls) => (
                      <option key={cls.id} value={cls.name}>
                        Lớp {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Điểm Xanh Thưởng:
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    value={challengeReward}
                    onChange={(e) => setChallengeReward(Number(e.target.value))}
                    className="w-full bg-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddChallengeModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-md shadow-emerald-600/20"
                >
                  Phát Động Thử Thách
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE STUDENT CODE */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-teal-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-700" />
                <span>Cấp Mã Học Sinh Mới (Không Cần Email)</span>
              </h3>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {createdStudentResult ? (
              <div className="space-y-4 text-center py-2 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mx-auto shadow-inner">
                  🎉
                </div>
                <div>
                  <h4 className="font-black text-lg text-slate-800">Cấp Mã Thành Công!</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thầy cô hãy gửi thông tin này cho em {createdStudentResult.nickname}:
                  </p>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 text-left space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold">Mã Học Sinh:</span>
                    <span className="font-mono font-black text-base text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                      {createdStudentResult.studentCode}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold">Mã PIN Khởi Tạo:</span>
                    <span className="font-mono font-black text-base text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                      {createdStudentResult.pin}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddStudentModal(false);
                    setCreatedStudentResult(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-extrabold text-xs shadow-md shadow-teal-700/20"
                >
                  Hoàn Tất & Đóng
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateStudentCode} className="space-y-3.5 text-xs">
                <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200 text-teal-900 text-[11px] leading-relaxed">
                  Trẻ em tiểu học không có email cá nhân. Hệ thống tự động tạo mã định danh theo chuẩn{' '}
                  <strong>SPA-LỚP-STT</strong> và mã PIN 4 số.
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Biệt Danh Hoặc Họ Tên Học Sinh:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Em Vàng Thị Mây"
                    value={newStudentNickname}
                    onChange={(e) => setNewStudentNickname(e.target.value)}
                    className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-teal-500 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Lớp Phân Bổ:
                    </label>
                    <select
                      value={newStudentClass}
                      onChange={(e) => setNewStudentClass(e.target.value)}
                      className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden font-bold"
                    >
                      {schoolClasses.map((cls) => (
                        <option key={cls.id} value={cls.name}>
                          Lớp {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Mã PIN Ban Đầu (4-6 số):
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={newStudentPin}
                      onChange={(e) => setNewStudentPin(e.target.value)}
                      className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddStudentModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-bold"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-extrabold shadow-md shadow-teal-700/20"
                  >
                    Tạo Mã Cho Học Sinh
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Bulk Auto-Generate Students Modal */}
      <BulkStudentGeneratorModal
        isOpen={showBulkStudentsModal}
        onClose={() => setShowBulkStudentsModal(false)}
        classes={schoolClasses}
        existingProfiles={profiles}
        defaultClass={bulkDefaultClass}
        teacherName={currentUser?.displayName || 'Cô Hoàng Thị Kim Hoa'}
        onProfilesGenerated={() => {
          refreshStorageData();
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
};
