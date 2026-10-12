import React, { useState, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Award,
  BookOpen,
  HelpCircle,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  Edit3,
  Check,
  Plus,
  AlertCircle,
  Lightbulb,
  ExternalLink,
  GraduationCap,
  Users,
  ArrowLeft
} from 'lucide-react';
import { AssignmentItem, ExerciseQuestion, NavTab, StudentProfile } from '../types';
import { AuthUser } from '../services/authService';
import { aiService } from '../services/aiService';
import { storageService } from '../services/storageService';
import { playSound, speakText, stopSpeaking } from '../utils/audio';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
  source?: 'gemini' | 'safety_guard';
  rating?: 'helpful' | 'unhelpful';
}

interface AiAssistantViewProps {
  activeProfile: StudentProfile;
  onProfileUpdated: (updated: StudentProfile) => void;
  isOnline: boolean;
  currentUser?: AuthUser | null;
  onShowToast?: (title: string, desc?: string, type?: 'success' | 'reward' | 'info' | 'error') => void;
  onNavigate?: (tab: NavTab) => void;
}

// 6 Core Environmental Topics with Curated Inquiries
const TOPIC_CATEGORIES = [
  {
    id: 'waste',
    label: 'Rác Thải',
    icon: '🗑️',
    color: 'emerald',
    questions: [
      'Hộp sữa học đường uống xong phân loại thế nào?',
      'Tại sao không nên vứt túi ni-lông ra suối Sa Pa?',
      'Pin đồ chơi cũ hết điện xử lý thế nào cho an toàn?'
    ]
  },
  {
    id: 'water',
    label: 'Nước Sạch',
    icon: '💧',
    color: 'sky',
    questions: [
      'Tại sao cần khóa vòi nước khi xoa xà phòng rửa tay?',
      'Suối Mường Hoa có ý nghĩa gì đối với bản làng Sa Pa?',
      'Làm thế nào để trường học chúng mình tiết kiệm nước sạch?'
    ]
  },
  {
    id: 'energy',
    label: 'Năng Lượng',
    icon: '⚡',
    color: 'amber',
    questions: [
      'Cách tiết kiệm điện trong phòng tin học của trường?',
      'Năng lượng mặt trời và gió Tây Bắc hoạt động thế nào?',
      'Vì sao nên rút phích sạc thiết bị điện tử khi pin đã đầy?'
    ]
  },
  {
    id: 'trees',
    label: 'Cây Xanh',
    icon: '🌲',
    color: 'teal',
    questions: [
      'Rừng Hoàng Liên bảo vệ đất sườn đồi Sa Pa như thế nào?',
      'Tại sao cây xanh được gọi là nhà máy lọc không khí tự nhiên?',
      'Học sinh chúng mình có thể làm gì để chăm sóc bồn hoa lớp?'
    ]
  },
  {
    id: 'animals',
    label: 'Động Vật',
    icon: '🐾',
    color: 'orange',
    questions: [
      'Những loài động vật quý hiếm nào sống ở Vườn quốc gia Hoàng Liên?',
      'Vì sao chúng mình không được săn bắt chim rừng Sa Pa?',
      'Rác thải nhựa ảnh hưởng đến các loài thú và chim ra sao?'
    ]
  },
  {
    id: 'climate',
    label: 'Khí Hậu',
    icon: '🌡️',
    color: 'purple',
    questions: [
      'Biến đổi khí hậu làm mùa đông Sa Pa thay đổi như thế nào?',
      'Khái niệm "Dấu chân carbon" có ý nghĩa gì với học sinh?',
      'Một công dân số xanh có thể làm gì để chống biến đổi khí hậu?'
    ]
  }
];

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  activeProfile,
  onProfileUpdated,
  isOnline,
  currentUser,
  onShowToast,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'exercise_solve' | 'exercise_create'>('chat');
  const [aiMode, setAiMode] = useState<'socratic' | 'direct'>('direct');
  const [remainingQuota, setRemainingQuota] = useState<number>(30);

  // --- CHAT STATE ---
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Chào bạn ${activeProfile.nickname} (Lớp ${activeProfile.className})! 🌱 Mình là **Bé Mầm Xanh AI (AI GREEN GUIDE)**.\n\n✨ Mình sẵn sàng **trả lời trực tiếp, chính xác và đúng trọng tâm** mọi câu hỏi về **Rác thải, Nước sạch, Năng lượng, Cây xanh Sa Pa và Biến đổi khí hậu**! Bạn hãy gõ câu hỏi hoặc chọn các chủ đề gợi ý bên dưới nhé! 🏔️✨`,
      timestamp: Date.now(),
      source: 'gemini',
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('waste');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // --- STUDENT ASSIGNMENT SOLVER STATE ---
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [activeAssignment, setActiveAssignment] = useState<AssignmentItem | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState<Record<number, any>>({});
  const [essayInputs, setEssayInputs] = useState<Record<number, string>>({});
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);
  const [assignmentResult, setAssignmentResult] = useState<{
    score: number;
    correctCount: number;
    totalQuestions: number;
    greenPointsEarned: number;
  } | null>(null);

  // --- TEACHER EXERCISE GENERATOR STATE ---
  const [genGrade, setGenGrade] = useState<number>(activeProfile.grade || 3);
  const [genTopic, setGenTopic] = useState<string>('rác thải');
  const [genDifficulty, setGenDifficulty] = useState<'dễ' | 'trung bình' | 'nâng cao'>('trung bình');
  const [genTargetClass, setGenTargetClass] = useState<string>(activeProfile.className || '3A1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAssignment, setGeneratedAssignment] = useState<AssignmentItem | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  // Fetch initial assignments list
  useEffect(() => {
    loadAssignments();
  }, [activeProfile.className, activeProfile.grade]);

  const loadAssignments = async () => {
    try {
      const list = await aiService.getAssignments();
      setAssignments(list);
      if (list.length > 0 && !selectedAssignmentId) {
        setSelectedAssignmentId(list[0].id);
        setActiveAssignment(list[0]);
      }
    } catch {
      console.warn('Could not load assignments');
    }
  };

  // Handle Send Question to AI
  const handleSend = async (questionToSend?: string) => {
    const q = (questionToSend || inputQuestion).trim();
    if (!q || isAsking) return;

    playSound('click');
    const userMsg: Message = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: q,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuestion('');
    setIsAsking(true);

    try {
      const res = await aiService.askQuestion(
        q,
        String(activeProfile.grade || 3),
        activeProfile.nickname,
        aiMode
      );

      if (res.remainingQuota !== undefined) {
        setRemainingQuota(res.remainingQuota);
      }

      const aiMsg: Message = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: res.reply,
        timestamp: Date.now(),
        source: res.source === 'safety_guard' ? 'safety_guard' : 'gemini',
      };

      setMessages(prev => [...prev, aiMsg]);
      playSound('correct');

      // Record Green Activity Points
      storageService.addActivity({
        studentId: activeProfile.id,
        studentNickname: activeProfile.nickname,
        className: activeProfile.className,
        grade: activeProfile.grade,
        activityType: 'ai_ask',
        title: 'Hỏi Bé Mầm Xanh AI',
        greenPointsEarned: 15,
        details: `Hỏi chủ đề: ${q.slice(0, 50)}...`,
      });
      onProfileUpdated(storageService.getActiveProfile());
    } catch {
      const fallbackMsg: Message = {
        id: 'ai-err-' + Date.now(),
        sender: 'ai',
        text: 'Bé Mầm Xanh AI luôn đồng hành cùng các bạn học sinh Sa Pa: Hãy luôn vứt rác đúng thùng màu quy định (Xanh lá - Hữu cơ, Vàng - Tái chế, Xám - Vô cơ, Đỏ - Nguy hại) và tiết kiệm nước sạch nhé! 🌱🏔️',
        timestamp: Date.now(),
        source: 'gemini',
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsAsking(false);
    }
  };

  // Clear Chat History
  const handleClearChat = () => {
    playSound('click');
    setMessages([
      {
        id: 'welcome-reset-' + Date.now(),
        sender: 'ai',
        text: `Chào bạn ${activeProfile.nickname}! 🌱 Bé Mầm Xanh đã sẵn sàng cho buổi học tập môi trường mới. Em hãy chọn một câu hỏi gợi ý bên dưới hoặc gõ câu hỏi bất kỳ nhé! 🏔️✨`,
        timestamp: Date.now(),
        source: 'gemini',
      }
    ]);
    setShowClearConfirm(false);
    if (onShowToast) {
      onShowToast('Đã làm mới hội thoại', 'Bắt đầu phiên học tập mới cùng Bé Mầm Xanh.', 'info');
    }
  };

  // Feedback on Answer (Helpful / Unhelpful)
  const handleRateAnswer = async (msgId: string, rating: 'helpful' | 'unhelpful', text: string) => {
    playSound('badge');
    setMessages(prev =>
      prev.map(m => (m.id === msgId ? { ...m, rating } : m))
    );
    await aiService.sendFeedback(msgId, rating, text.slice(0, 100));

    if (onShowToast) {
      onShowToast(
        rating === 'helpful' ? 'Đã ghi nhận 👍' : 'Cảm ơn góp ý 🤝',
        rating === 'helpful'
          ? 'Bé Mầm Xanh rất vui vì câu trả lời giúp ích cho bạn nhỏ!'
          : 'Bé Mầm Xanh sẽ cải thiện câu trả lời rõ ràng hơn!',
        rating === 'helpful' ? 'reward' : 'info'
      );
    }
  };

  // Speech TTS toggle
  const handleToggleSpeak = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      stopSpeaking();
      setSpeakingMsgId(null);
    } else {
      stopSpeaking();
      setSpeakingMsgId(msgId);
      // Clean markdown tags for clear speech
      const cleanSpeech = text.replace(/[*#_`]/g, '');
      speakText(cleanSpeech, () => {
        setSpeakingMsgId(null);
      });
    }
  };

  // --- STUDENT ASSIGNMENT FUNCTIONS ---
  const handleSelectAssignment = (assignId: string) => {
    const found = assignments.find(a => a.id === assignId);
    if (found) {
      setSelectedAssignmentId(assignId);
      setActiveAssignment(found);
      setCurrentQIndex(0);
      setStudentAnswers({});
      setEssayInputs({});
      setAssignmentResult(null);
      playSound('click');
    }
  };

  const handleSelectOptionAnswer = (optIndex: number) => {
    setStudentAnswers(prev => ({
      ...prev,
      [activeAssignment!.questions[currentQIndex].id]: optIndex,
    }));
    playSound('click');
  };

  const handleSelectBooleanAnswer = (boolVal: boolean) => {
    setStudentAnswers(prev => ({
      ...prev,
      [activeAssignment!.questions[currentQIndex].id]: boolVal,
    }));
    playSound('click');
  };

  const handleEssayChange = (text: string) => {
    const qId = activeAssignment!.questions[currentQIndex].id;
    setEssayInputs(prev => ({ ...prev, [qId]: text }));
    setStudentAnswers(prev => ({ ...prev, [qId]: text }));
  };

  const handleSubmitAssignment = async () => {
    if (!activeAssignment) return;
    setIsSubmittingAssignment(true);
    playSound('combo');

    try {
      const res = await aiService.submitAssignment(activeAssignment.id, studentAnswers);
      if (res.success) {
        setAssignmentResult({
          score: res.score || 0,
          correctCount: res.correctCount || 0,
          totalQuestions: res.totalQuestions || activeAssignment.questions.length,
          greenPointsEarned: res.greenPointsEarned || 50,
        });

        playSound(res.score && res.score >= 70 ? 'victory' : 'combo');

        storageService.addActivity({
          studentId: activeProfile.id,
          studentNickname: activeProfile.nickname,
          className: activeProfile.className,
          grade: activeProfile.grade,
          activityType: 'ai_quiz',
          title: `Hoàn thành: ${activeAssignment.title}`,
          score: res.score,
          maxScore: 100,
          greenPointsEarned: res.greenPointsEarned || 50,
          details: `Đúng ${res.correctCount}/${activeAssignment.questions.length} câu`,
        });
        onProfileUpdated(storageService.getActiveProfile());

        if (onShowToast) {
          onShowToast(
            'Hoàn thành bài tập! 🎉',
            `Bạn đạt ${res.score}% và nhận được +${res.greenPointsEarned} Điểm Xanh`,
            'reward'
          );
        }
      }
    } catch (err: any) {
      console.error('Submit error:', err);
    } finally {
      setIsSubmittingAssignment(false);
    }
  };

  // --- TEACHER EXERCISE GENERATION & EDITING ---
  const handleGenerateTeacherExercise = async () => {
    setIsGenerating(true);
    playSound('click');

    try {
      const res = await aiService.generateExercise(genGrade, genTopic, genDifficulty);
      const newAssign: AssignmentItem = {
        id: 'draft-' + Date.now(),
        title: res.title,
        grade: genGrade,
        className: genTargetClass,
        topic: genTopic,
        difficulty: genDifficulty,
        teacherId: currentUser?.id || 'teacher-default',
        teacherName: currentUser?.displayName || 'Thầy Cô Sa Pa',
        createdAt: Date.now(),
        questions: res.questions,
        submissionsCount: 0,
      };

      setGeneratedAssignment(newAssign);
      setEditedTitle(newAssign.title);
      playSound('combo');

      if (onShowToast) {
        onShowToast('Đã tạo bài tập mới! ✨', 'Thầy cô vui lòng xem trước, chỉnh sửa và bấm Duyệt giao bài.', 'success');
      }
    } catch {
      if (onShowToast) {
        onShowToast('Lỗi tạo bài tập', 'Vui lòng thử lại sau giây lát.', 'error');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateQuestion = (qIndex: number, updatedFields: Partial<ExerciseQuestion>) => {
    if (!generatedAssignment) return;
    const nextQuestions = [...generatedAssignment.questions];
    nextQuestions[qIndex] = { ...nextQuestions[qIndex], ...updatedFields };
    setGeneratedAssignment({ ...generatedAssignment, questions: nextQuestions });
  };

  const handleApproveAndPublish = async () => {
    if (!generatedAssignment) return;
    playSound('badge');

    const toPublish = {
      ...generatedAssignment,
      title: editedTitle.trim() || generatedAssignment.title,
    };

    const res = await aiService.createAssignment(toPublish);
    if (res.success && res.assignment) {
      setAssignments(prev => [res.assignment!, ...prev]);
      setActiveAssignment(res.assignment);
      setSelectedAssignmentId(res.assignment.id);
      setGeneratedAssignment(null);
      setActiveTab('exercise_solve');

      if (onShowToast) {
        onShowToast('Đã duyệt và giao bài tập! 🚀', `Đã giao thành công cho lớp ${toPublish.className}`, 'reward');
      }
    } else {
      if (onShowToast) {
        onShowToast('Lỗi lưu bài tập', res.error || 'Vui lòng kiểm tra lại quyền giáo viên', 'error');
      }
    }
  };

  const currentTopic = TOPIC_CATEGORIES.find(t => t.id === selectedTopicId) || TOPIC_CATEGORIES[0];

  return (
    <div className="space-y-6">
      {/* TOP NAVIGATION BAR: 3 PILLARS */}
      <div className="bg-white rounded-3xl p-3 border border-emerald-100 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Universal Back Button */}
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

          {/* Tab 1: AI Chat */}
          <button
            onClick={() => {
              playSound('click');
              setActiveTab('chat');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'chat'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI GREEN GUIDE (Hỏi Đáp)</span>
          </button>

          {/* Tab 2: Solve Assignments */}
          <button
            onClick={() => {
              playSound('click');
              setActiveTab('exercise_solve');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'exercise_solve'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Làm Bài Tập Môi Trường</span>
            <span className="bg-amber-400 text-slate-900 text-[10px] px-2 py-0.5 rounded-full font-black">
              10 Câu Hỏi
            </span>
          </button>

          {/* Tab 3: Teacher Exercise Generator */}
          <button
            onClick={() => {
              playSound('click');
              setActiveTab('exercise_create');
              if (!generatedAssignment) {
                handleGenerateTeacherExercise();
              }
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'exercise_create'
                ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
                : 'text-teal-700 hover:bg-teal-50'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Soạn & Duyệt Bài Tập</span>
            <span className="bg-teal-200 text-teal-900 text-[10px] px-2 py-0.5 rounded-full font-black">
              10 Câu Chuẩn
            </span>
          </button>
        </div>

        {/* Status Quota & Mode Pill */}
        <div className="flex items-center gap-2">
          {/* Gemini AI Status */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-black border border-emerald-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Gemini AI: Trực Tuyến 100%</span>
          </div>

          {/* Socratic Mode Toggle */}
          <button
            onClick={() => {
              playSound('click');
              setAiMode(prev => (prev === 'socratic' ? 'direct' : 'socratic'));
            }}
            title={aiMode === 'socratic' ? 'Chuyển sang chế độ giải thích trực tiếp' : 'Chuyển sang chế độ gợi mở tư duy'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              aiMode === 'socratic'
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-emerald-50 text-emerald-900 border-emerald-300'
            }`}
          >
            <Lightbulb className={`w-3.5 h-3.5 ${aiMode === 'socratic' ? 'text-amber-600' : 'text-emerald-600'}`} />
            <span className="hidden sm:inline">
              {aiMode === 'socratic' ? 'Chế độ Gợi Mở' : 'Chế độ Tường Tận'}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================
          PILLAR 1: SMART AI CHAT (HỎI ĐÁP THÔNG MINH SƯ PHẠM)
      ======================================================== */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Box */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-emerald-100 shadow-sm flex flex-col h-[700px] overflow-hidden">
            {/* Chat Top Header */}
            <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-b border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-md shadow-emerald-600/20">
                  🌱
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-800 flex flex-wrap items-center gap-2">
                    <span>Bé Mầm Xanh AI (AI GREEN GUIDE)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Gemini AI: Trực Tuyến 24/7
                    </span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                      Lớp {activeProfile.grade} Sa Pa
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                    <span>Phương pháp:</span>
                    <span className="font-bold text-emerald-700">
                      {aiMode === 'socratic' ? 'Gợi mở tư duy & Hướng dẫn kiểm chứng' : 'Giải thích dễ hiểu có ví dụ gần gũi'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Chat Header Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowClearConfirm(true)}
                  title="Xóa toàn bộ hội thoại"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold transition-all border border-slate-200 hover:border-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Xóa hội thoại</span>
                </button>
              </div>
            </div>

            {/* Clear Confirm Modal */}
            {showClearConfirm && (
              <div className="bg-amber-50 p-3 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Em có chắc muốn xóa lịch sử trò chuyện để bắt đầu phiên học tập mới không?</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleClearChat}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
                  >
                    Xóa ngay
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {/* Messages Scrollable Container */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] sm:max-w-[80%] rounded-3xl p-4 sm:p-5 shadow-xs transition-all ${
                      m.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-xs'
                        : m.source === 'safety_guard'
                        ? 'bg-amber-50 text-amber-950 border-2 border-amber-300 rounded-bl-xs'
                        : 'bg-white text-slate-800 border border-emerald-100 rounded-bl-xs'
                    }`}
                  >
                    {/* Message Header */}
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <span className="text-xs font-bold opacity-80 flex items-center gap-1.5">
                        {m.sender === 'user' ? (
                          <>
                            <span>🎒</span>
                            <span>Bạn {activeProfile.nickname}</span>
                          </>
                        ) : m.source === 'safety_guard' ? (
                          <>
                            <ShieldAlert className="w-4 h-4 text-amber-600" />
                            <span className="font-extrabold text-amber-800">Cảnh Báo An Toàn Học Đường</span>
                          </>
                        ) : (
                          <>
                            <span>🌱</span>
                            <span className="font-extrabold text-emerald-800">Bé Mầm Xanh AI</span>
                          </>
                        )}
                      </span>

                      {/* AI Toolbar: TTS & Badge & Rating */}
                      {m.sender === 'ai' && (
                        <div className="flex items-center gap-1.5">
                          {/* Text-To-Speech */}
                          <button
                            onClick={() => handleToggleSpeak(m.id, m.text)}
                            title={speakingMsgId === m.id ? 'Dừng đọc' : 'Nghe giọng đọc'}
                            className="p-1 rounded-lg hover:bg-emerald-50 text-emerald-700 transition-colors"
                          >
                            {speakingMsgId === m.id ? (
                              <VolumeX className="w-4 h-4 text-rose-500 animate-pulse" />
                            ) : (
                              <Volume2 className="w-4 h-4 text-emerald-600" />
                            )}
                          </button>

                          {/* Source badge */}
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>{m.source === 'safety_guard' ? 'Bảo Vệ Số' : 'Gemini AI'}</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Message Body */}
                    <div className="text-sm leading-relaxed whitespace-pre-line font-medium">
                      {m.text}
                    </div>

                    {/* AI Feedback Buttons (Helpful / Unhelpful) */}
                    {m.sender === 'ai' && m.id !== 'welcome' && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-semibold text-[11px]">
                          Câu trả lời này có hữu ích với bạn không?
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleRateAnswer(m.id, 'helpful', m.text)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              m.rating === 'helpful'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700'
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>Hữu ích</span>
                          </button>

                          <button
                            onClick={() => handleRateAnswer(m.id, 'unhelpful', m.text)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                              m.rating === 'unhelpful'
                                ? 'bg-rose-500 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700'
                            }`}
                          >
                            <ThumbsDown className="w-3 h-3" />
                            <span>Chưa rõ</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isAsking && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-3xl p-4 border border-emerald-100 flex items-center gap-3 text-emerald-800 text-xs font-bold shadow-xs">
                    <span className="text-2xl animate-spin">🌱</span>
                    <div>
                      <div>Bé Mầm Xanh đang tìm câu trả lời chuẩn xác...</div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        Trả lời đúng trọng tâm câu hỏi, chuẩn xác 100% gắn liền với Sa Pa
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 sm:p-4 bg-white border-t border-emerald-100 space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  placeholder={`Đặt câu hỏi môi trường cho Bé Mầm Xanh (Ví dụ: "Hộp sữa giấy bỏ vào thùng rác nào?")...`}
                  disabled={isAsking}
                  className="flex-1 bg-slate-100/80 focus:bg-white text-slate-800 text-sm px-4 py-3.5 rounded-2xl border border-transparent focus:border-emerald-400 focus:outline-hidden transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!inputQuestion.trim() || isAsking}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 text-white font-bold px-5 py-3.5 rounded-2xl shadow-md shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all shrink-0 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Hỏi AI</span>
                </button>
              </form>

              {/* Safety notice banner */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium px-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">
                  An toàn học đường: Không chia sẻ thông tin cá nhân. Hãy hỏi về 6 chủ đề bảo vệ môi trường Sa Pa!
                </span>
              </div>
            </div>
          </div>

          {/* Quick Suggestions Sidebar: 6 Environmental Topics */}
          <div className="space-y-4">
            {/* Topic Category Selector */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-emerald-600" />
                  <span>Chủ Đề Giáo Dục:</span>
                </h4>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  6 Lĩnh Vực
                </span>
              </div>

              {/* Topic Selector Tabs */}
              <div className="grid grid-cols-3 gap-1.5">
                {TOPIC_CATEGORIES.map((topic) => {
                  const isActive = topic.id === selectedTopicId;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => {
                        playSound('click');
                        setSelectedTopicId(topic.id);
                      }}
                      className={`p-2 rounded-xl text-center transition-all flex flex-col items-center gap-1 ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800'
                      }`}
                    >
                      <span className="text-base">{topic.icon}</span>
                      <span className="text-[10px] font-extrabold truncate w-full">{topic.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Questions for Active Topic */}
              <div className="pt-2 space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <span>{currentTopic.icon}</span>
                  <span>Câu hỏi gợi ý ({currentTopic.label}):</span>
                </div>
                {currentTopic.questions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    disabled={isAsking}
                    className="w-full text-left p-3 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100 text-xs font-semibold text-emerald-950 border border-emerald-200/60 hover:border-emerald-300 transition-all flex items-start gap-2 group"
                  >
                    <span className="text-emerald-500 group-hover:translate-x-0.5 transition-transform mt-0.5">🌱</span>
                    <span className="leading-snug">{q}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Socratic Inquiry Explainer Card */}
            <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-3xl p-5 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💡</span>
                <h5 className="font-extrabold text-sm text-emerald-200">Phương Pháp Gợi Mở Tư Duy</h5>
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed font-medium">
                Bé Mầm Xanh không chỉ đưa ra đáp án, mà còn đặt lại câu hỏi gợi mở để giúp em tự suy nghĩ, quan sát khuôn viên trường học Sa Pa và kiểm chứng thông tin thực tế!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PILLAR 2: STUDENT ASSIGNMENT SOLVER (LÀM BÀI TẬP)
      ======================================================== */}
      {activeTab === 'exercise_solve' && (
        <div className="space-y-6">
          {/* Assignment Selector Bar */}
          <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <span>📝</span>
                <span>Bộ Bài Tập Môi Trường (Được Thầy Cô & AI Phê Duyệt)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bao gồm 3 dạng: Trắc nghiệm, Đúng/Sai và Tự luận ngắn gợi mở suy nghĩ
              </p>
            </div>

            {/* Assignment Switcher */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600 shrink-0">Chọn bài tập:</label>
              <select
                value={selectedAssignmentId}
                onChange={(e) => handleSelectAssignment(e.target.value)}
                className="bg-slate-100 text-slate-800 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-400"
              >
                {assignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    Lớp {a.grade} ({a.className}): {a.title.slice(0, 45)}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Assignment Workspace */}
          {activeAssignment && !assignmentResult && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm space-y-6">
              {/* Assignment Meta Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                      Câu {currentQIndex + 1} / {activeAssignment.questions.length}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Khối Lớp {activeAssignment.grade} • Lớp {activeAssignment.className}
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Mức độ: {activeAssignment.difficulty}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-base text-slate-800 mt-2">
                    {activeAssignment.title}
                  </h4>
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  Giáo viên giao: <span className="font-bold text-slate-700">{activeAssignment.teacherName}</span>
                </div>
              </div>

              {/* Current Question Block */}
              {(() => {
                const q = activeAssignment.questions[currentQIndex];
                const currentAnswer = studentAnswers[q.id];

                return (
                  <div className="space-y-5">
                    {/* Question Prompt */}
                    <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-100 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          q.type === 'trắc nghiệm'
                            ? 'bg-blue-100 text-blue-800'
                            : q.type === 'đúng_sai'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          Dạng: {q.type === 'trắc nghiệm' ? 'Trắc Nghiệm' : q.type === 'đúng_sai' ? 'Đúng / Sai' : 'Tự Luận Ngắn'}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                        {q.prompt}
                      </h3>
                    </div>

                    {/* Guide Tip (Câu hỏi gợi mở tư duy) */}
                    {q.guideTip && (
                      <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-medium">
                        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-amber-950">Gợi ý tư duy của Bé Mầm Xanh: </span>
                          <span>{q.guideTip}</span>
                        </div>
                      </div>
                    )}

                    {/* Answer Inputs based on Question Type */}
                    {/* TYPE 1: TRẮC NGHIỆM */}
                    {q.type === 'trắc nghiệm' && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = currentAnswer === oIdx;
                          const letter = String.fromCharCode(65 + oIdx);

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectOptionAnswer(oIdx)}
                              className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 text-sm ${
                                isSelected
                                  ? 'bg-emerald-100 text-emerald-950 border-emerald-500 font-bold shadow-xs'
                                  : 'bg-slate-50 hover:bg-emerald-50 text-slate-800 border-slate-200 hover:border-emerald-300'
                              }`}
                            >
                              <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 ${
                                isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                              }`}>
                                {letter}
                              </span>
                              <span className="flex-1 font-medium">{opt}</span>
                              {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* TYPE 2: ĐÚNG / SAI */}
                    {q.type === 'đúng_sai' && (
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => handleSelectBooleanAnswer(true)}
                          className={`p-5 rounded-2xl border text-center font-extrabold text-sm sm:text-base transition-all flex flex-col items-center justify-center gap-2 ${
                            currentAnswer === true
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-500 shadow-md ring-2 ring-emerald-400'
                              : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span className="text-3xl">✅</span>
                          <span>ĐÚNG</span>
                        </button>

                        <button
                          onClick={() => handleSelectBooleanAnswer(false)}
                          className={`p-5 rounded-2xl border text-center font-extrabold text-sm sm:text-base transition-all flex flex-col items-center justify-center gap-2 ${
                            currentAnswer === false
                              ? 'bg-rose-100 text-rose-900 border-rose-500 shadow-md ring-2 ring-rose-400'
                              : 'bg-slate-50 hover:bg-rose-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span className="text-3xl">❌</span>
                          <span>SAI</span>
                        </button>
                      </div>
                    )}

                    {/* TYPE 3: TỰ LUẬN NGẮN / GỢI MỞ SUY NGHĨ */}
                    {q.type === 'tự_luận_ngắn' && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>Câu trả lời của em (Gõ suy nghĩ của em bằng tiếng Việt):</span>
                          <span className="text-[11px] text-slate-400">Tối thiểu 10 ký tự</span>
                        </label>
                        <textarea
                          rows={3}
                          value={essayInputs[q.id] || ''}
                          onChange={(e) => handleEssayChange(e.target.value)}
                          placeholder="Ví dụ: Em sẽ mang bình nước cá nhân và nhắc nhở bạn bè không dùng đồ nhựa một lần..."
                          className="w-full p-4 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:outline-hidden text-sm text-slate-800 bg-slate-50/50 focus:bg-white transition-all font-medium"
                        />
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <button
                        onClick={() => {
                          playSound('click');
                          setCurrentQIndex(prev => Math.max(0, prev - 1));
                        }}
                        disabled={currentQIndex === 0}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-30 transition-all hover:bg-slate-50"
                      >
                        Câu trước
                      </button>

                      {currentQIndex < activeAssignment.questions.length - 1 ? (
                        <button
                          onClick={() => {
                            playSound('click');
                            setCurrentQIndex(prev => prev + 1);
                          }}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all"
                        >
                          <span>Câu tiếp theo</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={handleSubmitAssignment}
                          disabled={isSubmittingAssignment}
                          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isSubmittingAssignment ? 'Đang chấm điểm...' : 'Nộp Bài Tập Hoàn Thành'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Assignment Completion & Results Screen */}
          {assignmentResult && (
            <div className="bg-white rounded-3xl p-8 text-center border border-emerald-100 shadow-xl max-w-xl mx-auto space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center text-4xl mx-auto shadow-inner">
                🏆
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-slate-800">
                  Hoàn Thành Bài Tập Xanh!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Chúc mừng bạn {activeProfile.nickname} đã nộp bài tập môn Môi trường Sa Pa
                </p>
              </div>

              {/* Score & Points Pill */}
              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 inline-block w-full">
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Điểm Số Đạt Được
                </div>
                <div className="text-4xl font-extrabold text-emerald-700 mt-1">
                  {assignmentResult.score} / 100
                </div>
                <div className="text-sm font-semibold text-slate-600 mt-1">
                  Đúng {assignmentResult.correctCount} / {assignmentResult.totalQuestions} câu hỏi
                </div>
                <div className="text-xs text-amber-700 font-extrabold mt-2 flex items-center justify-center gap-1">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>+{assignmentResult.greenPointsEarned} Điểm Xanh đã được cộng vào hồ sơ của em!</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setAssignmentResult(null);
                    setCurrentQIndex(0);
                    setStudentAnswers({});
                    setEssayInputs({});
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-2.5 rounded-2xl shadow-md shadow-emerald-600/20 text-xs sm:text-sm transition-all"
                >
                  Làm Lại Bài Này
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-2xl text-xs sm:text-sm transition-all"
                >
                  Trở Về Hỏi Đáp AI
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          PILLAR 3: TEACHER EXERCISE GENERATOR & REVIEWER
      ======================================================== */}
      {activeTab === 'exercise_create' && (
        <div className="space-y-6">
          {/* Generator Controls */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-teal-100 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-teal-600" />
                  <span>AI GREEN GUIDE: Soạn & Duyệt Bộ Bài Tập Phân Hóa</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Thầy cô lựa chọn khối lớp, chủ đề và mức độ để AI biên soạn 3 dạng câu hỏi. Thầy cô xem trước, chỉnh sửa và bấm duyệt để giao cho học sinh.
                </p>
              </div>

              {/* Primary Action Button */}
              <button
                onClick={handleGenerateTeacherExercise}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-200 text-white font-extrabold px-5 py-3 rounded-2xl text-xs shadow-md shadow-teal-600/20 transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'AI đang soạn câu hỏi...' : 'AI Soạn Bộ Bài Tập Mới'}</span>
              </button>
            </div>

            {/* Selectors Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {/* Grade Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">Khối Lớp:</label>
                <select
                  value={genGrade}
                  onChange={(e) => setGenGrade(Number(e.target.value))}
                  className="w-full bg-slate-100 text-slate-800 text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-teal-400"
                >
                  <option value={1}>Lớp 1 (Nhận biết ban đầu)</option>
                  <option value={2}>Lớp 2 (Hành động xanh)</option>
                  <option value={3}>Lớp 3 (Đặc biệt khuyến nghị)</option>
                  <option value={4}>Lớp 4 (Đặc biệt khuyến nghị)</option>
                  <option value={5}>Lớp 5 (Đặc biệt khuyến nghị)</option>
                </select>
              </div>

              {/* Topic Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">Chủ đề giáo dục:</label>
                <select
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  className="w-full bg-slate-100 text-slate-800 text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-teal-400"
                >
                  <option value="rác thải">🗑️ Rác thải & Phân loại</option>
                  <option value="nước sạch">💧 Nước sạch & Suối Mường Hoa</option>
                  <option value="năng lượng">⚡ Năng lượng tái tạo sạch</option>
                  <option value="cây xanh">🌲 Cây xanh & Rừng Hoàng Liên</option>
                  <option value="động vật">🐾 Động vật & Đa dạng sinh học</option>
                  <option value="biến đổi khí hậu">🌡️ Biến đổi khí hậu Sa Pa</option>
                </select>
              </div>

              {/* Difficulty Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">Mức độ phân hóa:</label>
                <select
                  value={genDifficulty}
                  onChange={(e) => setGenDifficulty(e.target.value as any)}
                  className="w-full bg-slate-100 text-slate-800 text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-teal-400"
                >
                  <option value="dễ">Dễ (Nhận biết & Nhớ)</option>
                  <option value="trung bình">Trung bình (Hiểu & Vận dụng)</option>
                  <option value="nâng cao">Nâng cao (Phân tích & Đề xuất)</option>
                </select>
              </div>

              {/* Target Class */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">Giao cho lớp học:</label>
                <select
                  value={genTargetClass}
                  onChange={(e) => setGenTargetClass(e.target.value)}
                  className="w-full bg-slate-100 text-slate-800 text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-teal-400"
                >
                  <option value="3A1">Lớp 3A1 (Sa Pa)</option>
                  <option value="4B">Lớp 4B (Sa Pa)</option>
                  <option value="5A">Lớp 5A (Sa Pa)</option>
                  <option value="2A2">Lớp 2A2 (Sa Pa)</option>
                  <option value="ALL">Toàn trường tiểu học</option>
                </select>
              </div>
            </div>
          </div>

          {/* Generated Exercise Preview & Live Edit Card */}
          {generatedAssignment && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-100 shadow-sm space-y-6">
              {/* Header Title Editor */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-teal-800 bg-teal-100 px-3 py-1 rounded-full uppercase">
                      Bản thảo chờ duyệt
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Giao cho: {genTargetClass} • Lớp {genGrade}
                    </span>
                  </div>

                  {isEditingTitle ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="flex-1 font-extrabold text-base text-slate-800 px-3 py-1.5 rounded-xl border border-teal-400 focus:outline-hidden"
                      />
                      <button
                        onClick={() => setIsEditingTitle(false)}
                        className="px-3 py-1.5 bg-teal-600 text-white font-bold text-xs rounded-xl"
                      >
                        Lưu
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <h3 className="font-extrabold text-lg text-slate-900">
                        {editedTitle || generatedAssignment.title}
                      </h3>
                      <button
                        onClick={() => setIsEditingTitle(true)}
                        className="p-1 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-slate-100"
                        title="Chỉnh sửa tiêu đề"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Approve Button */}
                <button
                  onClick={handleApproveAndPublish}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3 rounded-2xl shadow-lg shadow-emerald-600/20 text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all shrink-0"
                >
                  <Check className="w-4 h-4" />
                  <span>Phê Duyệt & Giao Cho Học Sinh</span>
                </button>
              </div>

              {/* Questions List for Editing */}
              <div className="space-y-6">
                {generatedAssignment.questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-teal-700 text-white text-xs font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                          q.type === 'trắc nghiệm'
                            ? 'bg-blue-100 text-blue-800'
                            : q.type === 'đúng_sai'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {q.type}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-semibold">
                        Thầy cô có thể chỉnh sửa trực tiếp nội dung bên dưới
                      </span>
                    </div>

                    {/* Question Prompt Input */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                        Nội dung câu hỏi:
                      </label>
                      <input
                        type="text"
                        value={q.prompt}
                        onChange={(e) => handleUpdateQuestion(idx, { prompt: e.target.value })}
                        className="w-full font-bold text-sm text-slate-800 p-3 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-teal-400"
                      />
                    </div>

                    {/* Options (for trắc nghiệm) */}
                    {q.type === 'trắc nghiệm' && q.options && (
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-600 block">
                          Các đáp án (Chọn radio để đánh dấu đáp án đúng):
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                              <input
                                type="radio"
                                name={`correct-${idx}`}
                                checked={q.correctAnswer === oIdx}
                                onChange={() => handleUpdateQuestion(idx, { correctAnswer: oIdx })}
                                className="w-4 h-4 text-emerald-600"
                              />
                              <span className="text-xs font-extrabold text-slate-500 w-5">
                                {String.fromCharCode(65 + oIdx)}.
                              </span>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const nextOpts = [...q.options!];
                                  nextOpts[oIdx] = e.target.value;
                                  handleUpdateQuestion(idx, { options: nextOpts });
                                }}
                                className="flex-1 text-xs font-medium text-slate-800 focus:outline-hidden"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Correct answer toggle for Đúng/Sai */}
                    {q.type === 'đúng_sai' && (
                      <div className="flex items-center gap-3">
                        <label className="text-[11px] font-bold text-slate-600">Đáp án chuẩn:</label>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuestion(idx, { correctAnswer: true })}
                          className={`px-3 py-1 rounded-xl text-xs font-extrabold ${
                            q.correctAnswer === true
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          ĐÚNG
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuestion(idx, { correctAnswer: false })}
                          className={`px-3 py-1 rounded-xl text-xs font-extrabold ${
                            q.correctAnswer === false
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          SAI
                        </button>
                      </div>
                    )}

                    {/* Sample answer for Tự luận ngắn */}
                    {q.type === 'tự_luận_ngắn' && (
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                          Câu trả lời mẫu gợi ý:
                        </label>
                        <input
                          type="text"
                          value={String(q.correctAnswer || '')}
                          onChange={(e) => handleUpdateQuestion(idx, { correctAnswer: e.target.value })}
                          className="w-full text-xs font-medium text-slate-800 p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-teal-400"
                        />
                      </div>
                    )}

                    {/* Explanation & GuideTip */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                          Lời giải thích sư phạm:
                        </label>
                        <textarea
                          rows={2}
                          value={q.explanation}
                          onChange={(e) => handleUpdateQuestion(idx, { explanation: e.target.value })}
                          className="w-full text-xs font-medium text-slate-800 p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-teal-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                          Gợi ý tư duy cho học sinh (guideTip):
                        </label>
                        <textarea
                          rows={2}
                          value={q.guideTip || ''}
                          onChange={(e) => handleUpdateQuestion(idx, { guideTip: e.target.value })}
                          className="w-full text-xs font-medium text-slate-800 p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-teal-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Approve Button */}
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={handleApproveAndPublish}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 text-sm hover:scale-105 active:scale-95 transition-all"
                >
                  <Check className="w-5 h-5" />
                  <span>Hoàn Tất & Phê Duyệt Giao Bài</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
