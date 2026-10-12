import React, { useState } from 'react';
import { BookOpen, HelpCircle, Gamepad2, Sparkles, Plus, Check, Trash2, Edit2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { EnvironmentalTopicItem, GameType, GreenActionTopic, LearningLesson, LearningQuestion } from '../../types';
import { playSound } from '../../utils/audio';

interface TeacherLearningMaterialsTabProps {
  lessons: LearningLesson[];
  questions: LearningQuestion[];
  environmentalTopics: EnvironmentalTopicItem[];
  onAddLesson: (lesson: Omit<LearningLesson, 'id' | 'createdAt'>) => void;
  onDeleteLesson: (id: string) => void;
  onApproveLesson: (id: string) => void;
  onAddQuestion: (question: Omit<LearningQuestion, 'id' | 'createdAt'>) => void;
  onDeleteQuestion: (id: string) => void;
  onApproveQuestion: (id: string) => void;
  onAssignGame: (gameType: GameType, targetClass: string, targetScore: number, rewardPoints: number) => void;
  onShowToast?: (title: string, desc?: string, type?: 'success' | 'reward' | 'info' | 'error') => void;
  isOnline?: boolean;
}

export const TeacherLearningMaterialsTab: React.FC<TeacherLearningMaterialsTabProps> = ({
  lessons,
  questions,
  environmentalTopics,
  onAddLesson,
  onDeleteLesson,
  onApproveLesson,
  onAddQuestion,
  onDeleteQuestion,
  onApproveQuestion,
  onAssignGame,
  onShowToast,
  isOnline = true,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'lessons' | 'questions' | 'games' | 'topics'>('lessons');

  // Form states for creating lesson
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonTopic, setLessonTopic] = useState<GreenActionTopic>('waste');
  const [lessonGrade, setLessonGrade] = useState<number>(3);
  const [lessonSummary, setLessonSummary] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [isAiGeneratingLesson, setIsAiGeneratingLesson] = useState(false);

  // Form states for creating question
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [qText, setQText] = useState('');
  const [qTopic, setQTopic] = useState<GreenActionTopic>('waste');
  const [qGrade, setQGrade] = useState<number>(3);
  const [opt0, setOpt0] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [correctIdx, setCorrectIdx] = useState<number>(0);
  const [qExplanation, setQExplanation] = useState('');
  const [isAiGeneratingQuestions, setIsAiGeneratingQuestions] = useState(false);

  // Form states for assigning game
  const [showAssignGameModal, setShowAssignGameModal] = useState(false);
  const [selectedGameType, setSelectedGameType] = useState<GameType>('waste_sorting');
  const [targetClass, setTargetClass] = useState<string>('3A1');
  const [targetScore, setTargetScore] = useState<number>(80);
  const [gameReward, setGameReward] = useState<number>(50);

  // Handle AI suggest lesson
  const handleAiSuggestLesson = async () => {
    playSound('click');
    setIsAiGeneratingLesson(true);
    try {
      const res = await fetch('/api/ai/suggest-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: lessonTopic, grade: lessonGrade }),
      });
      const data = await res.json();
      if (data.lesson) {
        setLessonTitle(data.lesson.title || '');
        setLessonSummary(data.lesson.summary || '');
        setLessonContent(data.lesson.content || '');
        onShowToast?.('AI đã gợi ý bài học! ✨', 'Thầy cô hãy xem lại, chỉnh sửa nếu cần và bấm Lưu bài học.', 'reward');
      }
    } catch {
      onShowToast?.('Không thể kết nối AI', 'Đang dùng mẫu bài học chuẩn sư phạm có sẵn.', 'info');
    } finally {
      setIsAiGeneratingLesson(false);
    }
  };

  // Handle AI suggest question
  const handleAiSuggestQuestion = async () => {
    playSound('click');
    setIsAiGeneratingQuestions(true);
    try {
      const res = await fetch('/api/ai/suggest-quiz-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: qTopic, grade: qGrade, count: 1 }),
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        const q = data.questions[0];
        setQText(q.question);
        setOpt0(q.options[0] || '');
        setOpt1(q.options[1] || '');
        setOpt2(q.options[2] || '');
        setOpt3(q.options[3] || '');
        setCorrectIdx(q.correctIndex || 0);
        setQExplanation(q.explanation || '');
        onShowToast?.('AI đã gợi ý câu hỏi trắc nghiệm! 🤖', 'Thầy cô hãy duyệt nội dung và lưu vào thư viện.', 'reward');
      }
    } catch {
      onShowToast?.('Không thể kết nối AI', 'Đang dùng bộ câu hỏi mẫu có sẵn.', 'info');
    } finally {
      setIsAiGeneratingQuestions(false);
    }
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !lessonContent.trim()) return;

    const topicLabels: Record<string, string> = {
      waste: 'Rác thải & Tái chế',
      water: 'Tiết kiệm nước sạch',
      electricity: 'Tiết kiệm điện năng',
      trees: 'Cây xanh & Rừng Sa Pa',
      general: 'Bảo vệ môi trường chung',
    };

    onAddLesson({
      title: lessonTitle.trim(),
      topic: lessonTopic,
      topicLabel: topicLabels[lessonTopic] || 'Môi trường',
      grade: lessonGrade,
      summary: lessonSummary.trim() || lessonTitle.trim(),
      content: lessonContent.trim(),
      author: 'Giáo viên Trường Sa Pa',
      isApproved: true,
    });

    onShowToast?.('Đã lưu bài học thành công! 📚', `Bài học "${lessonTitle}" đã vào thư viện học liệu.`, 'success');
    setShowAddLessonModal(false);
    setLessonTitle('');
    setLessonSummary('');
    setLessonContent('');
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim() || !opt0.trim() || !opt1.trim()) return;

    const topicLabels: Record<string, string> = {
      waste: 'Rác thải & Tái chế',
      water: 'Tiết kiệm nước sạch',
      electricity: 'Tiết kiệm điện năng',
      trees: 'Cây xanh & Rừng Sa Pa',
    };

    onAddQuestion({
      question: qText.trim(),
      options: [opt0.trim(), opt1.trim(), opt2.trim() || 'Phương án khác', opt3.trim() || 'Phương án khác'],
      correctIndex: correctIdx,
      explanation: qExplanation.trim() || 'Câu trả lời đúng theo chuẩn bảo vệ môi trường Sa Pa.',
      topic: qTopic,
      topicLabel: topicLabels[qTopic] || 'Môi trường',
      grade: qGrade,
      author: 'Giáo viên Trường Sa Pa',
      isApproved: true,
    });

    onShowToast?.('Đã lưu câu hỏi trắc nghiệm! 📝', 'Câu hỏi đã được đưa vào kho kiểm tra trắc nghiệm AI.', 'success');
    setShowAddQuestionModal(false);
    setQText('');
    setOpt0('');
    setOpt1('');
    setOpt2('');
    setOpt3('');
    setQExplanation('');
  };

  const handleSaveGameTask = (e: React.FormEvent) => {
    e.preventDefault();
    onAssignGame(selectedGameType, targetClass, targetScore, gameReward);
    onShowToast?.('Đã giao trò chơi cho lớp! 🎮', `Giao cho lớp ${targetClass} mục tiêu ${targetScore} điểm.`, 'reward');
    setShowAssignGameModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <span>Quản Lý Học Liệu Số & Nội Dung Giáo Dục Sa Pa</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Xây dựng bài học, ngân hàng câu hỏi trắc nghiệm, giao trò chơi và kiểm duyệt nội dung AI
          </p>
        </div>

        {/* Sub-tabs selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveSubTab('lessons')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'lessons' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            📚 Bài Học ({lessons.length})
          </button>
          <button
            onClick={() => setActiveSubTab('questions')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'questions' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            ❓ Câu Hỏi ({questions.length})
          </button>
          <button
            onClick={() => setActiveSubTab('games')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'games' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            🎮 Giao Trò Chơi
          </button>
          <button
            onClick={() => setActiveSubTab('topics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'topics' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            🌿 4 Chủ Đề Sa Pa
          </button>
        </div>
      </div>

      {/* Subtab 1: Lessons */}
      {activeSubTab === 'lessons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-slate-700">
              Thư Viện Bài Học Môi Trường Trường Học Sa Pa
            </h4>
            <button
              onClick={() => {
                playSound('click');
                setShowAddLessonModal(true);
              }}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-2xl text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo Bài Học Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessons.map(les => (
              <div key={les.id} className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Khối {les.grade} • {les.topicLabel}
                    </span>
                    {les.isApproved ? (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đã Duyệt
                      </span>
                    ) : (
                      <button
                        onClick={() => onApproveLesson(les.id)}
                        className="text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold px-2 py-0.5 rounded-full"
                      >
                        Bấm để duyệt
                      </button>
                    )}
                  </div>

                  <h5 className="font-extrabold text-base text-slate-800">{les.title}</h5>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{les.summary}</p>

                  <div className="mt-3 p-3 bg-slate-50 rounded-2xl text-xs text-slate-700 leading-relaxed border border-slate-100">
                    {les.content}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Tác giả: <strong>{les.author}</strong></span>
                  <button
                    onClick={() => {
                      if (confirm('Xác nhận xóa bài học này khỏi thư viện?')) {
                        onDeleteLesson(les.id);
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 2: Questions */}
      {activeSubTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-slate-700">
              Ngân Hàng Câu Hỏi Trắc Nghiệm Môi Trường
            </h4>
            <button
              onClick={() => {
                playSound('click');
                setShowAddQuestionModal(true);
              }}
              className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-600 text-white font-bold px-3 py-2 rounded-2xl text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo Câu Hỏi Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white rounded-3xl p-5 border border-teal-100 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                    Câu {idx + 1} • Khối {q.grade} • {q.topicLabel}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm('Xác nhận xóa câu hỏi này?')) {
                        onDeleteQuestion(q.id);
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h5 className="font-bold text-sm text-slate-800 leading-snug">{q.question}</h5>

                <div className="space-y-1.5">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-2 rounded-xl text-xs border flex items-center justify-between ${
                        oIdx === q.correctIndex
                          ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                      {oIdx === q.correctIndex && (
                        <span className="text-[10px] text-emerald-700 font-bold">✓ Đáp án đúng</span>
                      )}
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    💡 <strong>Giải thích sư phạm:</strong> {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 3: Games */}
      {activeSubTab === 'games' && (
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-base text-slate-800">
                Giao Thử Thách Trò Chơi Môi Trường Cho Các Lớp
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Chỉ định trò chơi sinh thái cho lớp rèn luyện kèm mục tiêu điểm số và phần thưởng Điểm Xanh
              </p>
            </div>
            <button
              onClick={() => {
                playSound('click');
                setShowAssignGameModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Giao Thử Thách Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <span className="text-2xl">♻️</span>
              <h5 className="font-extrabold text-sm text-slate-800">Phân Loại Rác 4 Ngăn</h5>
              <p className="text-xs text-slate-600">Rèn luyện phản xạ nhận diện rác học đường</p>
              <span className="text-[10px] bg-white border border-amber-300 font-bold text-amber-800 px-2 py-0.5 rounded-full inline-block">
                Đang mở cho toàn trường
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2">
              <span className="text-2xl">💧</span>
              <h5 className="font-extrabold text-sm text-slate-800">Tiết Kiệm Nước Suối</h5>
              <p className="text-xs text-slate-600">Quy tắc khóa vòi 20s và giữ sạch nguồn nước</p>
              <span className="text-[10px] bg-white border border-teal-300 font-bold text-teal-800 px-2 py-0.5 rounded-full inline-block">
                Khối 2, 3, 4
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <span className="text-2xl">⚡</span>
              <h5 className="font-extrabold text-sm text-slate-800">Tự Quản Năng Lượng</h5>
              <p className="text-xs text-slate-600">Tắt đèn quạt và máy tính trước khi về</p>
              <span className="text-[10px] bg-white border border-amber-300 font-bold text-amber-800 px-2 py-0.5 rounded-full inline-block">
                Khối 4, 5
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <span className="text-2xl">🌲</span>
              <h5 className="font-extrabold text-sm text-slate-800">Bảo Vệ Cây Xanh Sa Pa</h5>
              <p className="text-xs text-slate-600">Chăm sóc vườn hoa trường và phòng chống cháy rừng</p>
              <span className="text-[10px] bg-white border border-emerald-300 font-bold text-emerald-800 px-2 py-0.5 rounded-full inline-block">
                Toàn trường
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 4: Topics */}
      {activeSubTab === 'topics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {environmentalTopics.map(top => (
            <div key={top.id} className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{top.icon}</span>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  Chủ Đề Trọng Tâm
                </span>
              </div>
              <h5 className="font-extrabold text-base text-slate-800">{top.name}</h5>
              <p className="text-xs text-slate-500">{top.description}</p>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-700 block">Nội dung cốt lõi:</span>
                <div className="flex flex-wrap gap-1.5">
                  {top.keyPoints.map((kp, kIdx) => (
                    <span key={kIdx} className="text-[11px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-lg">
                      • {kp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Lesson */}
      {showAddLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-emerald-100 space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Soạn Bài Học Môi Trường Mới</span>
              </h3>
              <button
                onClick={() => setShowAddLessonModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* AI Assistant button */}
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between gap-2">
              <div className="text-xs text-emerald-900">
                <strong>Trợ lý AI Sa Pa:</strong> Gợi ý nội dung bài học theo chuẩn sư phạm phù hợp khối lớp
              </div>
              <button
                type="button"
                onClick={handleAiSuggestLesson}
                disabled={isAiGeneratingLesson}
                className="shrink-0 flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAiGeneratingLesson ? 'Đang tạo...' : 'Nhờ AI Gợi Ý'}</span>
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chủ Đề:</label>
                  <select
                    value={lessonTopic}
                    onChange={(e) => setLessonTopic(e.target.value as GreenActionTopic)}
                    className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-hidden"
                  >
                    <option value="waste">Rác thải & Tái chế</option>
                    <option value="water">Tiết kiệm nước sạch</option>
                    <option value="electricity">Tiết kiệm điện năng</option>
                    <option value="trees">Cây xanh & Rừng Sa Pa</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Khối Lớp:</label>
                  <select
                    value={lessonGrade}
                    onChange={(e) => setLessonGrade(Number(e.target.value))}
                    className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-hidden"
                  >
                    {[1, 2, 3, 4, 5].map(g => (
                      <option key={g} value={g}>Khối {g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tiêu Đề Bài Học:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Bí kíp 3 bước gấp bẹp vỏ hộp sữa học đường..."
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full bg-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 font-bold focus:outline-hidden text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tóm Tắt Ngắn:</label>
                <input
                  type="text"
                  placeholder="VD: Hướng dẫn học sinh phân loại rác tái chế sau giờ ăn xế"
                  value={lessonSummary}
                  onChange={(e) => setLessonSummary(e.target.value)}
                  className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nội Dung Chi Tiết:</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Nội dung bài học dễ hiểu, các bước hành động cụ thể cho học sinh..."
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  className="w-full bg-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden text-xs leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddLessonModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-md shadow-emerald-600/20"
                >
                  Lưu Bài Học Vào Thư Viện
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Question */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-teal-100 space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-teal-700" />
                <span>Soạn Câu Hỏi Trắc Nghiệm Mới</span>
              </h3>
              <button
                onClick={() => setShowAddQuestionModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200 flex items-center justify-between gap-2">
              <div className="text-xs text-teal-900">
                <strong>Trợ lý AI:</strong> Gợi ý câu hỏi trắc nghiệm 4 đáp án kèm lời giải thích chuẩn sư phạm
              </div>
              <button
                type="button"
                onClick={handleAiSuggestQuestion}
                disabled={isAiGeneratingQuestions}
                className="shrink-0 flex items-center gap-1 bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAiGeneratingQuestions ? 'Đang tạo...' : 'Gợi Ý AI'}</span>
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Chủ Đề:</label>
                  <select
                    value={qTopic}
                    onChange={(e) => setQTopic(e.target.value as GreenActionTopic)}
                    className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-hidden"
                  >
                    <option value="waste">Rác thải & Tái chế</option>
                    <option value="water">Tiết kiệm nước sạch</option>
                    <option value="electricity">Tiết kiệm điện năng</option>
                    <option value="trees">Cây xanh & Rừng Sa Pa</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Khối Lớp:</label>
                  <select
                    value={qGrade}
                    onChange={(e) => setQGrade(Number(e.target.value))}
                    className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-hidden"
                  >
                    {[1, 2, 3, 4, 5].map(g => (
                      <option key={g} value={g}>Khối {g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nội Dung Câu Hỏi:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="VD: Vỏ hộp sữa sau khi uống xong ở trường nên bỏ vào thùng màu gì?"
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-hidden text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">4 Phương Án (Chọn ô tròn đáp án đúng):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={correctIdx === 0}
                    onChange={() => setCorrectIdx(0)}
                    className="w-4 h-4 text-emerald-600"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Phương án A"
                    value={opt0}
                    onChange={(e) => setOpt0(e.target.value)}
                    className="w-full bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={correctIdx === 1}
                    onChange={() => setCorrectIdx(1)}
                    className="w-4 h-4 text-emerald-600"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Phương án B"
                    value={opt1}
                    onChange={(e) => setOpt1(e.target.value)}
                    className="w-full bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={correctIdx === 2}
                    onChange={() => setCorrectIdx(2)}
                    className="w-4 h-4 text-emerald-600"
                  />
                  <input
                    type="text"
                    placeholder="Phương án C"
                    value={opt2}
                    onChange={(e) => setOpt2(e.target.value)}
                    className="w-full bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={correctIdx === 3}
                    onChange={() => setCorrectIdx(3)}
                    className="w-4 h-4 text-emerald-600"
                  />
                  <input
                    type="text"
                    placeholder="Phương án D"
                    value={opt3}
                    onChange={(e) => setOpt3(e.target.value)}
                    className="w-full bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Giải Thích Sư Phạm:</label>
                <textarea
                  rows={2}
                  placeholder="Giải thích vì sao câu này đúng..."
                  value={qExplanation}
                  onChange={(e) => setQExplanation(e.target.value)}
                  className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-extrabold shadow-md shadow-teal-700/20"
                >
                  Lưu Câu Hỏi Vào Kho Đề
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Game */}
      {showAssignGameModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-indigo-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-indigo-600" />
                <span>Giao Thử Thách Trò Chơi Mới Cho Lớp</span>
              </h3>
              <button
                onClick={() => setShowAssignGameModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGameTask} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Chọn Trò Chơi Sinh Thái:</label>
                <select
                  value={selectedGameType}
                  onChange={(e) => setSelectedGameType(e.target.value as GameType)}
                  className="w-full bg-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 font-bold focus:outline-hidden"
                >
                  <option value="waste_sorting">♻️ Phân Loại Rác Sa Pa</option>
                  <option value="water_saving">💧 Tiết Kiệm Nước Suối</option>
                  <option value="electricity_saving">⚡ Tiết Kiệm Điện Năng</option>
                  <option value="tree_protection">🌲 Chăm Sóc Cây Xanh Hoàng Liên</option>
                  <option value="eco_quiz">📝 Đấu Trường Đố Vui Xanh</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lớp Áp Dụng:</label>
                  <select
                    value={targetClass}
                    onChange={(e) => setTargetClass(e.target.value)}
                    className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-hidden"
                  >
                    <option value="ALL">Toàn Trường</option>
                    <option value="1A1">Lớp 1A1</option>
                    <option value="2A2">Lớp 2A2</option>
                    <option value="3A1">Lớp 3A1</option>
                    <option value="4B">Lớp 4B</option>
                    <option value="5A">Lớp 5A</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mục Tiêu Đạt Chuẩn:</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={targetScore}
                    onChange={(e) => setTargetScore(Number(e.target.value))}
                    className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Điểm Xanh Khen Thưởng:</label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={gameReward}
                  onChange={(e) => setGameReward(Number(e.target.value))}
                  className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignGameModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-md shadow-indigo-600/20"
                >
                  Phát Động Trò Chơi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
