import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Sparkles,
  CheckCircle2,
  Award,
  Calendar,
  Heart,
  ShieldCheck,
  Filter,
  Clock,
  Send,
  MessageSquare,
  AlertCircle,
  Image,
  FileText,
  Palette,
  Layers,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Check,
  Edit3,
  Trash2,
  Gamepad2,
  MapPin,
  Bot,
  UserCheck,
  Upload,
  ArrowLeft
} from 'lucide-react';
import {
  GreenAction,
  GreenActionTopic,
  NavTab,
  StudentProfile,
  TeacherGreenTask
} from '../types';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import { AuthUser } from '../services/authService';
import { playSound } from '../utils/audio';

interface GreenDiaryViewProps {
  activeProfile: StudentProfile;
  onProfileUpdated: (updated: StudentProfile) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'reward' | 'info' | 'error') => void;
  currentUser?: AuthUser | null;
  onNavigate?: (tab: NavTab) => void;
  isOnline?: boolean;
}

const ACTION_TOPICS: {
  id: GreenActionTopic;
  label: string;
  icon: string;
  color: string;
  defaultPoints: number;
}[] = [
  { id: 'waste', label: 'Rác thải & Tái chế', icon: '♻️', color: 'text-amber-700 bg-amber-50', defaultPoints: 30 },
  { id: 'water', label: 'Tiết kiệm nước sạch', icon: '💧', color: 'text-sky-700 bg-sky-50', defaultPoints: 25 },
  { id: 'electricity', label: 'Tiết kiệm điện năng', icon: '💡', color: 'text-yellow-700 bg-yellow-50', defaultPoints: 20 },
  { id: 'trees', label: 'Chăm sóc cây xanh', icon: '🌸', color: 'text-emerald-700 bg-emerald-50', defaultPoints: 35 },
  { id: 'general', label: 'Hành động sinh thái chung', icon: '🌱', color: 'text-teal-700 bg-teal-50', defaultPoints: 20 },
];

export const GreenDiaryView: React.FC<GreenDiaryViewProps> = ({
  activeProfile,
  onProfileUpdated,
  onShowToast,
  currentUser,
  onNavigate,
  isOnline = true,
}) => {
  // Main view tab: 'feed' (Nhật ký toàn trường) | 'tasks' (Nhiệm vụ được giao) | 'my_actions' (Bài nộp của em) | 'teacher_review' (Duyệt & Quản lý)
  const [activeTab, setActiveTab] = useState<'feed' | 'tasks' | 'my_actions' | 'teacher_review'>('feed');

  // Actions & Tasks state
  const [actions, setActions] = useState<GreenAction[]>([]);
  const [tasks, setTasks] = useState<TeacherGreenTask[]>([]);

  // Filter states
  const [filterTopic, setFilterTopic] = useState<string>('ALL');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterTime, setFilterTime] = useState<'all' | 'today' | 'week'>('all');

  // Student Log / Submit Modal
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [selectedTaskForSubmission, setSelectedTaskForSubmission] = useState<TeacherGreenTask | null>(null);
  const [subTitle, setSubTitle] = useState<string>('');
  const [subTopic, setSubTopic] = useState<GreenActionTopic>('waste');
  const [subDescription, setSubDescription] = useState<string>('');
  const [subProductType, setSubProductType] = useState<'text_reflection' | 'drawing' | 'poster' | 'article'>('text_reflection');
  const [subImageUrl, setSubImageUrl] = useState<string>('');
  const [editingActionId, setEditingActionId] = useState<string | null>(null);

  // Teacher Task Creation Modal
  const [showCreateTaskModal, setShowCreateTaskModal] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskTopic, setNewTaskTopic] = useState<GreenActionTopic>('waste');
  const [newTaskClass, setNewTaskClass] = useState<string>('3A1');
  const [newTaskInstructions, setNewTaskInstructions] = useState<string>('');
  const [newTaskDeadline, setNewTaskDeadline] = useState<string>('2026-10-25');
  const [newTaskAllowImage, setNewTaskAllowImage] = useState<boolean>(false);
  const [newTaskPoints, setNewTaskPoints] = useState<number>(30);
  const [isAiSuggestingTasks, setIsAiSuggestingTasks] = useState<boolean>(false);

  // Teacher Review & AI states
  const [reviewFeedbackInput, setReviewFeedbackInput] = useState<Record<string, string>>({});
  const [isAiSuggestingFeedback, setIsAiSuggestingFeedback] = useState<Record<string, boolean>>({});
  const [classAiSummary, setClassAiSummary] = useState<string | null>(null);
  const [isGeneratingAiSummary, setIsGeneratingAiSummary] = useState<boolean>(false);

  // In-app deletion & confirmation states (Never use window.confirm in iframe)
  const [actionToDelete, setActionToDelete] = useState<GreenAction | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TeacherGreenTask | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const isTeacherOrAdmin = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, [activeProfile.id]);

  const loadAllData = () => {
    setActions(storageService.getGreenActions());
    setTasks(storageService.getTeacherGreenTasks());
  };

  // Reset sample test data for teachers
  const handleResetSampleData = () => {
    setShowResetConfirm(true);
  };

  const handleConfirmResetSampleData = () => {
    playSound('badge');
    const freshActions = storageService.resetGreenActionsToDefault();
    const freshTasks = storageService.resetTeacherGreenTasksToDefault();
    setActions(freshActions);
    setTasks(freshTasks);
    onShowToast('Đã nạp lại dữ liệu mẫu! 🔄', 'Toàn bộ nhiệm vụ và bài nộp mẫu Sa Pa đã được khôi phục.', 'success');
    setShowResetConfirm(false);
  };

  // Student: Open submit modal for a specific teacher task or general log
  const handleOpenSubmitTaskModal = (task?: TeacherGreenTask) => {
    playSound('click');
    setEditingActionId(null);
    if (task) {
      setSelectedTaskForSubmission(task);
      setSubTitle(`Hoàn thành: ${task.title}`);
      setSubTopic(task.topic);
      setSubDescription('');
      setSubProductType('text_reflection');
      setSubImageUrl('');
    } else {
      setSelectedTaskForSubmission(null);
      setSubTitle('');
      setSubTopic('waste');
      setSubDescription('');
      setSubProductType('text_reflection');
      setSubImageUrl('');
    }
    setShowLogModal(true);
  };

  // Confirm delete action
  const handleConfirmDeleteAction = () => {
    if (!actionToDelete) return;
    playSound('click');
    storageService.deleteGreenAction(actionToDelete.id);
    setActions(storageService.getGreenActions());
    onProfileUpdated(storageService.getActiveProfile());
    onShowToast('Đã xóa bài viết! 🗑️', `Bài viết "${actionToDelete.title}" đã được gỡ khỏi hệ thống.`, 'info');
    setActionToDelete(null);
  };

  // Confirm delete task
  const handleConfirmDeleteTask = () => {
    if (!taskToDelete) return;
    playSound('click');
    storageService.deleteTeacherGreenTask(taskToDelete.id);
    setTasks(storageService.getTeacherGreenTasks());
    onShowToast('Đã xóa nhiệm vụ! 🗑️', `Nhiệm vụ "${taskToDelete.title}" đã được gỡ khỏi danh sách.`, 'info');
    setTaskToDelete(null);
  };

  // Student: Edit existing pending or needs_revision action
  const handleOpenEditAction = (action: GreenAction) => {
    playSound('click');
    setEditingActionId(action.id);
    setSelectedTaskForSubmission(null);
    setSubTitle(action.title);
    setSubTopic(action.topic || 'waste');
    setSubDescription(action.description);
    setSubProductType(action.productType || 'text_reflection');
    setSubImageUrl(action.imageUrl || '');
    setShowLogModal(true);
  };

  // Student submit action handler
  const handleSubmitAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subTitle.trim() || !subDescription.trim()) {
      onShowToast('Thiếu thông tin', 'Vui lòng điền đầy đủ tên việc làm và nội dung phản hồi ngắn!', 'info');
      return;
    }

    playSound('badge');
    const topicObj = ACTION_TOPICS.find((t) => t.id === subTopic) || ACTION_TOPICS[0];
    const productTypeMap = {
      text_reflection: 'Cảm nhận ngắn',
      drawing: 'Tranh vẽ sáng tạo',
      poster: 'Poster cổ động',
      article: 'Bài viết học tập',
    };

    if (editingActionId) {
      // Update existing action
      const updated = storageService.updateGreenAction(editingActionId, {
        title: subTitle.trim(),
        description: subDescription.trim(),
        topic: subTopic,
        topicLabel: topicObj.label,
        productType: subProductType,
        productTypeLabel: productTypeMap[subProductType],
        imageUrl: subImageUrl.trim() || undefined,
        status: 'pending', // Re-submit for review
      });
      if (updated) {
        setActions(storageService.getGreenActions());
        onShowToast('Đã cập nhật bài nộp! 📝', 'Bài viết đã được gửi lại cho thầy cô xét duyệt.', 'success');
      }
    } else {
      // Create new action
      const reward = selectedTaskForSubmission ? selectedTaskForSubmission.rewardPoints : topicObj.defaultPoints;
      const created = storageService.addGreenAction({
        taskId: selectedTaskForSubmission?.id,
        taskTitle: selectedTaskForSubmission?.title,
        studentId: activeProfile.id,
        studentNickname: activeProfile.nickname,
        className: activeProfile.className,
        grade: activeProfile.grade,
        title: subTitle.trim(),
        category: (subTopic === 'trees' ? 'tree_planting' : subTopic === 'water' ? 'water_saving' : subTopic === 'electricity' ? 'energy_saving' : 'plastic_free') as any,
        categoryLabel: topicObj.label,
        topic: subTopic,
        topicLabel: topicObj.label,
        description: subDescription.trim(),
        productType: subProductType,
        productTypeLabel: productTypeMap[subProductType],
        imageUrl: subImageUrl.trim() || undefined,
        status: 'pending',
        points: reward,
        icon: topicObj.icon,
      });

      setActions(storageService.getGreenActions());
      onProfileUpdated(storageService.getActiveProfile());
      onShowToast('Gửi nhật ký thành công! 🌱✨', 'Hành động xanh của em đang chờ thầy cô duyệt điểm thưởng.', 'reward');
    }

    setShowLogModal(false);
  };

  // Teacher: AI Suggest Green Tasks
  const handleAiSuggestTasks = async () => {
    playSound('click');
    setIsAiSuggestingTasks(true);
    try {
      const res = await aiService.suggestGreenTasks(newTaskTopic, newTaskClass, parseInt(newTaskClass[0]) || 3);
      if (res.tasks && res.tasks.length > 0) {
        const picked = res.tasks[0];
        setNewTaskTitle(picked.title);
        setNewTaskInstructions(picked.instructions);
        setNewTaskPoints(picked.rewardPoints || 30);
        setNewTaskAllowImage(picked.allowImageUpload || false);
        onShowToast('AI đã gợi ý nhiệm vụ! ✨', `Đã điền nhiệm vụ "${picked.title}" phù hợp chủ đề`, 'success');
      }
    } catch {
      onShowToast('Không thể kết nối AI', 'Đã chuyển sang bộ nhiệm vụ mẫu có sẵn.', 'info');
    } finally {
      setIsAiSuggestingTasks(false);
    }
  };

  // Teacher: Create a new Green Task
  const handleCreateTeacherTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskInstructions.trim()) return;

    playSound('badge');
    const topicObj = ACTION_TOPICS.find((t) => t.id === newTaskTopic) || ACTION_TOPICS[0];
    const created = storageService.addTeacherGreenTask({
      title: newTaskTitle.trim(),
      topic: newTaskTopic,
      topicLabel: topicObj.label,
      targetClass: newTaskClass,
      instructions: newTaskInstructions.trim(),
      deadline: newTaskDeadline,
      allowImageUpload: newTaskAllowImage,
      rewardPoints: newTaskPoints,
      createdBy: currentUser?.displayName || 'Thầy Cô Giáo Sa Pa',
    });

    setTasks(storageService.getTeacherGreenTasks());
    setShowCreateTaskModal(false);
    setNewTaskTitle('');
    setNewTaskInstructions('');
    onShowToast('Đã phát động nhiệm vụ xanh! 🎯', `Giao cho lớp ${created.targetClass}: ${created.title}`, 'reward');
  };

  // Teacher: Trigger delete task modal
  const handleDeleteTask = (task: TeacherGreenTask) => {
    setTaskToDelete(task);
  };

  // Teacher: Review action (approve or needs_revision)
  const handleReviewAction = (actionId: string, status: 'approved' | 'needs_revision') => {
    playSound('badge');
    const currentFeedback = reviewFeedbackInput[actionId];
    const reviewerName = currentUser?.displayName || 'Thầy Cô Sa Pa';

    const updated = storageService.reviewGreenAction(
      actionId,
      status,
      currentFeedback,
      undefined,
      reviewerName
    );

    if (updated) {
      setActions(storageService.getGreenActions());
      onProfileUpdated(storageService.getActiveProfile());
      onShowToast(
        status === 'approved' ? 'Đã duyệt hành động xanh! ✅' : 'Đã yêu cầu bổ sung',
        status === 'approved' ? 'Học sinh được cộng điểm thưởng vào hồ sơ.' : 'Đã gửi lời dặn dò cho học sinh.',
        status === 'approved' ? 'success' : 'info'
      );
    }
  };

  // Teacher: AI Suggest encouraging feedback for student
  const handleAiSuggestFeedback = async (action: GreenAction) => {
    playSound('click');
    setIsAiSuggestingFeedback((prev) => ({ ...prev, [action.id]: true }));
    try {
      const res = await aiService.suggestTeacherFeedback(
        action.title,
        action.description,
        action.studentNickname,
        'approved'
      );
      if (res.feedback) {
        setReviewFeedbackInput((prev) => ({ ...prev, [action.id]: res.feedback }));
        onShowToast('AI gợi ý lời khen ấm áp! 💬', 'Thầy cô có thể chỉnh sửa trước khi duyệt.', 'success');
      }
    } catch {
      onShowToast('Lỗi gợi ý', 'Thầy cô có thể tự nhập lời nhận xét.', 'info');
    } finally {
      setIsAiSuggestingFeedback((prev) => ({ ...prev, [action.id]: false }));
    }
  };

  // Teacher: AI Synthesize approved actions summary
  const handleGenerateClassSummary = async () => {
    playSound('click');
    setIsGeneratingAiSummary(true);
    const approvedActions = actions.filter(
      (a) => a.status === 'approved' && (filterClass === 'ALL' || a.className === filterClass)
    );

    try {
      const res = await aiService.summarizeApprovedActions(
        filterClass === 'ALL' ? 'Toàn Trường Tiểu Học Sa Pa' : filterClass,
        approvedActions
      );
      setClassAiSummary(res.summary);
      onShowToast('Đã tổng hợp kết quả xanh! 🌿', 'Bản tin thi đua đã sẵn sàng.', 'success');
    } catch {
      setClassAiSummary('Tập thể học sinh trường Tiểu học Sa Pa đã tích cực tham gia bảo vệ môi trường vùng cao.');
    } finally {
      setIsGeneratingAiSummary(false);
    }
  };

  // Filter actions for feed
  const filteredActions = actions.filter((act) => {
    const matchTopic = filterTopic === 'ALL' || act.topic === filterTopic || act.category === filterTopic;
    const matchClass = filterClass === 'ALL' || act.className === filterClass;
    const matchStatus = filterStatus === 'ALL' || (act.status || 'approved') === filterStatus;

    let matchTime = true;
    if (filterTime === 'today') {
      const todayStart = new Date().setHours(0, 0, 0, 0);
      matchTime = act.timestamp >= todayStart;
    } else if (filterTime === 'week') {
      const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000;
      matchTime = act.timestamp >= weekStart;
    }

    return matchTopic && matchClass && matchStatus && matchTime;
  });

  // Filter tasks for student class
  const classTasks = tasks.filter(
    (t) => t.targetClass === 'TOÀN TRƯỜNG' || t.targetClass === activeProfile.className
  );

  // Student's own submissions
  const mySubmissions = actions.filter(
    (a) => a.studentId === activeProfile.id || a.studentNickname === activeProfile.nickname
  );

  // Progress metrics
  const totalApproved = actions.filter((a) => a.status === 'approved').length;
  const pendingCount = actions.filter((a) => a.status === 'pending').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner & Navigation Header */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onNavigate && (
            <button
              onClick={() => {
                playSound('click');
                onNavigate('home');
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 font-extrabold text-xs transition-colors shrink-0"
              title="Quay lại trang chủ"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          )}

          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>GREEN ACTION – Nhật Ký Hành Động Xanh</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800">
              Hành Động Nhỏ – Sa Pa Xanh Bền Vững
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Ghi nhận việc tốt bảo vệ môi trường, nộp sản phẩm học tập và cùng thầy cô lan tỏa lối sống xanh.
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-extrabold">
          <button
            onClick={() => {
              playSound('click');
              setActiveTab('feed');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              activeTab === 'feed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Nhật Ký Trường ({filteredActions.length})</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setActiveTab('tasks');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              activeTab === 'tasks'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Nhiệm Vụ Thầy Cô ({classTasks.length})</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setActiveTab('my_actions');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              activeTab === 'my_actions'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Bài Của Em ({mySubmissions.length})</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setActiveTab('teacher_review');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              activeTab === 'teacher_review'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Thầy Cô Quản Lý</span>
            {pendingCount > 0 && (
              <span className="bg-amber-400 text-slate-900 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Safety & Non-Competitive Assurance Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 rounded-2xl p-4 border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-emerald-950 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Giáo dục vì môi trường:</strong> Không xếp hạng ganh đua cá nhân; bảo vệ hình ảnh và danh tính học sinh. Hỗ trợ ghi nhật ký 100% bằng bài viết mà không bắt buộc tải ảnh lên.
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isTeacherOrAdmin && (
            <button
              onClick={handleResetSampleData}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg transition-all"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Nạp lại dữ liệu mẫu</span>
            </button>
          )}
          <button
            onClick={() => handleOpenSubmitTaskModal()}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-1.5 rounded-xl shadow-xs transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ghi Nhật Ký Mới</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          TAB 1: NHẬT KÝ HOẠT ĐỘNG TOÀN TRƯỜNG (FEED)
      ======================================================== */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          {/* Multi-criteria filter strip */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Topic Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => {
                  playSound('click');
                  setFilterTopic('ALL');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all border ${
                  filterTopic === 'ALL'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50'
                }`}
              >
                Tất cả chủ đề
              </button>

              {ACTION_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => {
                    playSound('click');
                    setFilterTopic(topic.id);
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all border ${
                    filterTopic === topic.id
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50'
                  }`}
                >
                  <span>{topic.icon}</span>
                  <span>{topic.label}</span>
                </button>
              ))}
            </div>

            {/* Class, Status & Time filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700"
              >
                <option value="ALL">Tất cả lớp</option>
                <option value="1A1">Lớp 1A1</option>
                <option value="2A2">Lớp 2A2</option>
                <option value="3A1">Lớp 3A1</option>
                <option value="4B">Lớp 4B</option>
                <option value="5A">Lớp 5A</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700"
              >
                <option value="ALL">Mọi trạng thái</option>
                <option value="approved">✓ Đã duyệt</option>
                <option value="pending">⏳ Chờ duyệt</option>
                <option value="needs_revision">⚠️ Cần chỉnh sửa</option>
              </select>

              <select
                value={filterTime}
                onChange={(e) => setFilterTime(e.target.value as any)}
                className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700"
              >
                <option value="all">Toàn bộ thời gian</option>
                <option value="today">Hôm nay</option>
                <option value="week">Trong tuần này</option>
              </select>
            </div>
          </div>

          {/* Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredActions.map((act) => {
              const dateStr = new Date(act.timestamp).toLocaleDateString('vi-VN');
              const timeStr = new Date(act.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
              const isMine = act.studentId === activeProfile.id || act.studentNickname === activeProfile.nickname;

              return (
                <div
                  key={act.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    {/* Header: Topic & Points */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-lg shrink-0 border border-emerald-100">
                          {act.icon}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                              {act.topicLabel || act.categoryLabel}
                            </span>
                            {act.productTypeLabel && (
                              <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                                {act.productTypeLabel}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {dateStr} lúc {timeStr}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-xl">
                          +{act.points} Điểm
                        </span>
                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                            act.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-900'
                              : act.status === 'needs_revision'
                              ? 'bg-rose-100 text-rose-900'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {act.status === 'approved'
                            ? '✓ Đã duyệt'
                            : act.status === 'needs_revision'
                            ? '⚠️ Cần chỉnh sửa'
                            : '⏳ Chờ duyệt'}
                        </span>
                      </div>
                    </div>

                    {/* Task association banner if applicable */}
                    {act.taskTitle && (
                      <div className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-xl mb-2 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">Nhiệm vụ: {act.taskTitle}</span>
                      </div>
                    )}

                    <h3 className="font-black text-base text-slate-800 leading-snug">
                      {act.title}
                    </h3>

                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                      {act.description}
                    </p>

                    {/* Optional Image Illustration */}
                    {act.imageUrl && (
                      <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mt-2">
                        <img
                          src={act.imageUrl}
                          alt={act.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Teacher Feedback Note */}
                    {act.teacherFeedback && (
                      <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200 text-xs text-amber-950 mt-2 space-y-0.5">
                        <div className="font-extrabold text-[11px] text-amber-900 flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                          <span>Lời dặn của {act.reviewedBy || 'Thầy Cô'}:</span>
                        </div>
                        <p className="font-medium leading-relaxed">{act.teacherFeedback}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer info & student action */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span className="flex items-center gap-1.5 text-emerald-900 font-bold">
                      <span>🌱 {act.studentNickname}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-normal">
                        Lớp {act.className}
                      </span>
                    </span>

                    {(isTeacherOrAdmin || isMine) && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditAction(act)}
                          className="flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-xl transition-all"
                          title="Chỉnh sửa bài viết"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Sửa</span>
                        </button>
                        <button
                          onClick={() => setActionToDelete(act)}
                          className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
                          title="Xóa bài viết"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredActions.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 text-xs font-bold space-y-2">
              <BookOpen className="w-10 h-10 mx-auto opacity-40 text-emerald-600" />
              <p>Chưa có hành động nào phù hợp với bộ lọc hiện tại.</p>
              <button
                onClick={() => handleOpenSubmitTaskModal()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Ghi việc tốt đầu tiên</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: NHIỆM VỤ XANH THẦY CÔ GIAO (TASKS LIST)
      ======================================================== */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-teal-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Award className="w-6 h-6 text-teal-600" />
                <span>Nhiệm Vụ Xanh Lớp {activeProfile.className}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Các thử thách môi trường do thầy cô chủ nhiệm và tổng phụ trách phát động.
              </p>
            </div>

            <div className="text-xs font-bold bg-teal-50 text-teal-900 border border-teal-200 px-3.5 py-1.5 rounded-xl">
              {classTasks.length} Thử thách đang diễn ra
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classTasks.map((t) => {
              const mySubmissionForTask = actions.find(
                (a) => a.taskId === t.id && (a.studentId === activeProfile.id || a.studentNickname === activeProfile.nickname)
              );
              const isCompleted = mySubmissionForTask?.status === 'approved';

              return (
                <div
                  key={t.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase bg-teal-100 text-teal-900 px-2 py-0.5 rounded-md">
                          {t.topicLabel}
                        </span>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          Áp dụng: {t.targetClass}
                        </span>
                      </div>
                      <span className="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                        +{t.rewardPoints} Điểm
                      </span>
                    </div>

                    <h4 className="font-black text-slate-900 text-base leading-snug">
                      {t.title}
                    </h4>

                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                      <strong className="block text-slate-900 mb-1 text-[11px] font-bold">
                        📋 Hướng dẫn thực hiện:
                      </strong>
                      {t.instructions}
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
                      <span className="flex items-center gap-1 text-rose-600 font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Hạn hoàn thành: {t.deadline}</span>
                      </span>
                      <span>
                        {t.allowImageUpload ? '📸 Được gửi ảnh minh chứng' : '📝 Nhật ký văn bản không cần ảnh'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Giao bởi: {t.createdBy}</span>

                    {isCompleted ? (
                      <span className="flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Đã Hoàn Thành</span>
                      </span>
                    ) : mySubmissionForTask ? (
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-xl">
                        ⏳ Đã nộp bài, chờ duyệt
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenSubmitTaskModal(t)}
                        className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs transition-all hover:scale-105 active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Báo Cáo Hoàn Thành</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: BÀI NỘP CỦA HỌC SINH (MY ACTIONS)
      ======================================================== */}
      {activeTab === 'my_actions' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-sky-600" />
                <span>Nhật Ký Của Bạn {activeProfile.nickname}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Theo dõi trạng thái các bài nộp của em: Chờ duyệt, Đã duyệt công nhận hoặc Cần chỉnh sửa.
              </p>
            </div>

            <button
              onClick={() => handleOpenSubmitTaskModal()}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-sky-600/20 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Ghi Nhật Ký Mới</span>
            </button>
          </div>

          <div className="space-y-4">
            {mySubmissions.map((act) => (
              <div
                key={act.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{act.icon}</span>
                    <div>
                      <h4 className="font-black text-slate-900 text-base">{act.title}</h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(act.timestamp).toLocaleDateString('vi-VN')} • Hình thức: {act.productTypeLabel || 'Cảm nhận ngắn'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-md ${
                        act.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-900'
                          : act.status === 'needs_revision'
                          ? 'bg-rose-100 text-rose-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {act.status === 'approved'
                        ? '✓ Đã duyệt (+ Điểm Xanh)'
                        : act.status === 'needs_revision'
                        ? '⚠️ Cần chỉnh sửa'
                        : '⏳ Chờ duyệt'}
                    </span>
                    <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      +{act.points}đ
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 font-medium">
                  {act.description}
                </div>

                {/* Teacher feedback if any */}
                {act.teacherFeedback && (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                    <div className="font-extrabold text-[11px] text-amber-900 flex items-center gap-1 mb-0.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                      <span>Lời nhận xét của thầy cô:</span>
                    </div>
                    <p className="font-medium">{act.teacherFeedback}</p>
                  </div>
                )}

                {/* Edit & Delete action buttons if needs revision or pending */}
                {act.status !== 'approved' && (
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleOpenEditAction(act)}
                      className="flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-200 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Chỉnh sửa nội dung & gửi lại</span>
                    </button>
                    <button
                      onClick={() => setActionToDelete(act)}
                      className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hủy bài nộp</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {mySubmissions.length === 0 && (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 text-slate-400 text-xs font-bold space-y-2">
                <p>Em chưa ghi hành động nào. Hãy chọn một nhiệm vụ để bắt đầu nhé!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: THẦY CÔ QUẢN LÝ, DUYỆT & GIAO NHIỆM VỤ
      ======================================================== */}
      {activeTab === 'teacher_review' && (
        <div className="space-y-6">
          {/* Header controls: Create Task & AI Summary */}
          <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-amber-600" />
                <span>Bảng Điều Khiển Sư Phạm – GREEN ACTION</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tạo nhiệm vụ theo lớp, duyệt sản phẩm học tập với trợ lý AI và tổng hợp kết quả thi đua.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleGenerateClassSummary}
                disabled={isGeneratingAiSummary}
                className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold px-3.5 py-2.5 rounded-2xl text-xs transition-all hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>{isGeneratingAiSummary ? 'AI Đang tổng hợp...' : 'AI Tổng Hợp Thi Đua'}</span>
              </button>

              <button
                onClick={() => {
                  playSound('click');
                  setShowCreateTaskModal(true);
                }}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Giao Nhiệm Vụ Xanh Mới</span>
              </button>
            </div>
          </div>

          {/* AI Summary Banner if generated */}
          {classAiSummary && (
            <div className="p-5 rounded-3xl bg-indigo-50/90 border border-indigo-200 text-indigo-950 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-xs text-indigo-900 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Bản Tin Tổng Hợp Thi Đua Xanh (Do AI Trợ Giúp)</span>
                </div>
                <button
                  onClick={() => setClassAiSummary(null)}
                  className="text-xs text-indigo-500 hover:text-indigo-800 font-bold"
                >
                  ✕ Đóng
                </button>
              </div>
              <p className="text-xs font-semibold leading-relaxed">{classAiSummary}</p>
            </div>
          )}

          {/* Pending Submissions Review Section */}
          <div className="space-y-4">
            <h4 className="text-base font-extrabold text-slate-800 flex items-center justify-between">
              <span>Danh Sách Bài Nộp Chờ Duyệt ({pendingCount} bài)</span>
              <span className="text-xs text-slate-400 font-normal">
                Không xếp hạng ganh đua, luôn gửi phản hồi khích lệ
              </span>
            </h4>

            {actions
              .filter((a) => a.status === 'pending')
              .map((act) => (
                <div
                  key={act.id}
                  className="bg-white rounded-3xl p-5 border border-amber-200 shadow-sm space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span className="text-lg">{act.icon}</span>
                      <span>{act.title}</span>
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-black px-2 py-0.5 rounded">
                        {act.topicLabel}
                      </span>
                    </div>

                    <div className="text-slate-400 text-[11px]">
                      Học sinh: <strong className="text-slate-700">{act.studentNickname}</strong> (Lớp {act.className}) • {new Date(act.timestamp).toLocaleString('vi-VN')}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
                    {act.description}
                  </div>

                  {act.imageUrl && (
                    <div className="relative aspect-16/9 max-w-sm rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img src={act.imageUrl} alt={act.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Teacher Feedback input with AI button */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                        <span>Lời nhận xét của thầy cô (Ấm áp, khích lệ):</span>
                      </label>

                      <button
                        onClick={() => handleAiSuggestFeedback(act)}
                        disabled={isAiSuggestingFeedback[act.id]}
                        className="text-[11px] font-extrabold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-xl transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{isAiSuggestingFeedback[act.id] ? 'AI đang viết...' : 'AI Gợi Ý Lời Khen'}</span>
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={reviewFeedbackInput[act.id] || ''}
                      onChange={(e) =>
                        setReviewFeedbackInput({
                          ...reviewFeedbackInput,
                          [act.id]: e.target.value,
                        })
                      }
                      placeholder="Nhập lời khen ngợi sự nỗ lực hoặc dặn dò nhẹ nhàng..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden"
                    />

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setActionToDelete(act)}
                        className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Xóa bài viết này khỏi hệ thống"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa bài</span>
                      </button>
                      <button
                        onClick={() => handleReviewAction(act.id, 'needs_revision')}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                      >
                        Yêu Cầu Bổ Sung
                      </button>
                      <button
                        onClick={() => handleReviewAction(act.id, 'approved')}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20"
                      >
                        ✓ Duyệt & Khen Thưởng (+{act.points}đ)
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            {pendingCount === 0 && (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-slate-400 text-xs font-bold">
                🎉 Tất cả các bài nộp của học sinh đều đã được duyệt xong!
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: HỌC SINH NỘP BÀI / GHI NHẬT KÝ XANH
      ======================================================== */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-emerald-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌱</span>
                <h3 className="text-base sm:text-lg font-black text-slate-800">
                  {editingActionId
                    ? 'Chỉnh Sửa Bài Nộp'
                    : selectedTaskForSubmission
                    ? `Báo Cáo: ${selectedTaskForSubmission.title}`
                    : 'Ghi Nhận Hành Động Xanh Hôm Nay'}
                </h3>
              </div>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAction} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 mb-1 block">Tên việc tốt em đã làm:</label>
                <input
                  type="text"
                  required
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  placeholder="Ví dụ: Nhặt 5 vỏ hộp sữa và gấp phẳng, khóa vòi nước..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Chủ đề môi trường:</label>
                  <select
                    value={subTopic}
                    onChange={(e) => setSubTopic(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                  >
                    {ACTION_TOPICS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.icon} {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Hình thức sản phẩm:</label>
                  <select
                    value={subProductType}
                    onChange={(e) => setSubProductType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                  >
                    <option value="text_reflection">📝 Phản hồi / Cảm nhận ngắn</option>
                    <option value="drawing">🎨 Tranh vẽ sáng tạo</option>
                    <option value="poster">📢 Poster cổ động</option>
                    <option value="article">📖 Bài viết học tập</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">
                  Nội dung phản hồi / mô tả chi tiết:
                </label>
                <textarea
                  rows={3}
                  required
                  value={subDescription}
                  onChange={(e) => setSubDescription(e.target.value)}
                  placeholder="Kể ngắn gọn em đã thực hiện việc này ở đâu, cùng với ai, và cảm xúc của em..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 focus:outline-hidden"
                />
              </div>

              {/* Optional image link only when allowed by teacher or for creative artwork */}
              {(selectedTaskForSubmission?.allowImageUpload || !selectedTaskForSubmission) && (
                <div>
                  <label className="font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Hình ảnh minh chứng (Không bắt buộc):</span>
                    <span className="text-[10px] text-slate-400 font-normal">Chỉ chụp đồ vật/cây xanh, không chụp mặt</span>
                  </label>
                  <input
                    type="url"
                    value={subImageUrl}
                    onChange={(e) => setSubImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800"
                  />
                </div>
              )}

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                <span>Điểm Xanh dự kiến nhận:</span>
                <strong className="text-sm font-extrabold text-emerald-700">
                  +{selectedTaskForSubmission ? selectedTaskForSubmission.rewardPoints : 30} Điểm
                </strong>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md shadow-emerald-600/20"
                >
                  Gửi Nhật Ký Xanh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: THẦY CÔ TẠO NHIỆM VỤ MỚI
      ======================================================== */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-emerald-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📋</span>
                <h3 className="text-base sm:text-lg font-black text-slate-800">
                  Tạo Nhiệm Vụ Xanh Mới Cho Lớp
                </h3>
              </div>
              <button
                onClick={() => setShowCreateTaskModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTeacherTask} className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">Chủ đề nhiệm vụ:</label>
                <button
                  type="button"
                  onClick={handleAiSuggestTasks}
                  disabled={isAiSuggestingTasks}
                  className="text-[11px] font-extrabold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-xl transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isAiSuggestingTasks ? 'AI đang nghĩ...' : 'AI Gợi Ý Nhiệm Vụ'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newTaskTopic}
                  onChange={(e) => setNewTaskTopic(e.target.value as any)}
                  className="p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                >
                  <option value="waste">♻️ Rác thải & Tái chế</option>
                  <option value="water">💧 Tiết kiệm nước sạch</option>
                  <option value="electricity">💡 Tiết kiệm điện năng</option>
                  <option value="trees">🌸 Chăm sóc cây xanh</option>
                </select>

                <select
                  value={newTaskClass}
                  onChange={(e) => setNewTaskClass(e.target.value)}
                  className="p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                >
                  <option value="TOÀN TRƯỜNG">Toàn Trường</option>
                  <option value="1A1">Lớp 1A1</option>
                  <option value="2A2">Lớp 2A2</option>
                  <option value="3A1">Lớp 3A1</option>
                  <option value="4B">Lớp 4B</option>
                  <option value="5A">Lớp 5A</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Tên nhiệm vụ xanh:</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Ví dụ: Chiến sĩ gấp hộp sữa học đường..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Hướng dẫn thực hiện cho học sinh:</label>
                <textarea
                  rows={3}
                  required
                  value={newTaskInstructions}
                  onChange={(e) => setNewTaskInstructions(e.target.value)}
                  placeholder="Các bước cụ thể học sinh cần làm..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Hạn hoàn thành:</label>
                  <input
                    type="date"
                    required
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Điểm Xanh thưởng:</label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    step={5}
                    value={newTaskPoints}
                    onChange={(e) => setNewTaskPoints(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-200 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="allow-img-check"
                  checked={newTaskAllowImage}
                  onChange={(e) => setNewTaskAllowImage(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="allow-img-check" className="font-semibold text-slate-700">
                  Cho phép học sinh đính kèm ảnh minh chứng (nếu có)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md shadow-emerald-600/20"
                >
                  Phát Động Nhiệm Vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: XÁC NHẬN XÓA BÀI VIẾT (IN-APP CONFIRMATION)
      ======================================================== */}
      {actionToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-rose-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl">
              🗑️
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-800">
                Xác Nhận Xóa Bài Viết
              </h3>
              <p className="text-xs text-slate-500">
                Thầy cô / Quản trị viên có chắc chắn muốn gỡ bài viết này khỏi hệ thống GREEN ACTION?
              </p>
            </div>

            <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200 text-xs space-y-1">
              <div className="font-extrabold text-slate-800 line-clamp-2">
                {actionToDelete.title}
              </div>
              <div className="text-slate-500 text-[11px] flex items-center gap-2 pt-0.5">
                <span>Tác giả: <strong>{actionToDelete.studentNickname}</strong> (Lớp {actionToDelete.className})</span>
                <span>•</span>
                <span>+{actionToDelete.points} Điểm</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActionToDelete(null)}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAction}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 transition-colors cursor-pointer"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: XÁC NHẬN XÓA NHIỆM VỤ THẦY CÔ
      ======================================================== */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-rose-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl">
              🎯
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-800">
                Xóa Nhiệm Vụ Xanh
              </h3>
              <p className="text-xs text-slate-500">
                Thầy cô có chắc chắn muốn gỡ nhiệm vụ này khỏi danh sách thử thách của lớp?
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="font-extrabold text-slate-800">
                {taskToDelete.title}
              </div>
              <div className="text-slate-500 text-[11px]">
                Áp dụng: {taskToDelete.targetClass} • Thưởng: +{taskToDelete.rewardPoints}đ
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Giữ Lại
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTask}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 transition-colors cursor-pointer"
              >
                Xóa Nhiệm Vụ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: XÁC NHẬN NẠP LẠI DỮ LIỆU MẪU
      ======================================================== */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-amber-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-2xl">
              🔄
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-800">
                Nạp Lại Dữ Liệu Mẫu
              </h3>
              <p className="text-xs text-slate-500">
                Khôi phục lại toàn bộ nhiệm vụ và bài nộp mẫu thử nghiệm Sa Pa ban đầu?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmResetSampleData}
                className="py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md shadow-amber-600/20 transition-colors cursor-pointer"
              >
                Đồng Ý Nạp Lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
