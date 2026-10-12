import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Trash2,
  Droplets,
  Zap,
  Trees,
  Trophy,
  History,
  GraduationCap,
  Award,
  Sparkles,
  CheckCircle2,
  Clock,
  Users,
  Plus,
  ShieldCheck,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { GameHistoryItem, GameType, NavTab, StudentProfile } from '../types';
import { AuthUser } from '../services/authService';
import { storageService, TeacherGameTask } from '../services/storageService';
import { WasteSortingGameView } from './WasteSortingGameView';
import { WaterSavingGameView } from './WaterSavingGameView';
import { ElectricitySavingGameView } from './ElectricitySavingGameView';
import { TreeProtectionGameView } from './TreeProtectionGameView';
import { EcoQuizArenaView } from './EcoQuizArenaView';
import { playSound } from '../utils/audio';

interface GreenGameHubViewProps {
  activeProfile: StudentProfile;
  onProfileUpdated: (updated: StudentProfile) => void;
  currentUser?: AuthUser | null;
  onShowToast?: (title: string, desc?: string, type?: 'success' | 'reward' | 'info' | 'error') => void;
  onNavigate?: (tab: NavTab) => void;
}

export const GreenGameHubView: React.FC<GreenGameHubViewProps> = ({
  activeProfile,
  onProfileUpdated,
  currentUser,
  onShowToast,
  onNavigate,
}) => {
  const [activeGame, setActiveGame] = useState<GameType | 'history' | 'teacher_tasks'>('waste_sorting');
  const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([]);
  const [teacherTasks, setTeacherTasks] = useState<TeacherGameTask[]>([]);

  // New task form state
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskGame, setNewTaskGame] = useState<GameType>('waste_sorting');
  const [newTaskClass, setNewTaskClass] = useState('3A1');
  const [newTaskScore, setNewTaskScore] = useState(80);
  const [newTaskReward, setNewTaskReward] = useState(50);

  useEffect(() => {
    loadHistoryAndTasks();
  }, [activeGame, activeProfile.id]);

  const loadHistoryAndTasks = () => {
    setGameHistory(storageService.getGameHistory(activeProfile.nickname));
    setTeacherTasks(storageService.getTeacherGameTasks());
  };

  const handleSelectTab = (tab: GameType | 'history' | 'teacher_tasks') => {
    playSound('click');
    setActiveGame(tab);
    if (tab === 'history' || tab === 'teacher_tasks') {
      loadHistoryAndTasks();
    }
  };

  const handleCreateTeacherTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    playSound('badge');
    const newTask = storageService.addTeacherGameTask({
      title: newTaskTitle.trim(),
      gameType: newTaskGame,
      targetClass: newTaskClass,
      targetScore: newTaskScore,
      pointsReward: newTaskReward,
      assignedBy: currentUser?.displayName || 'Thầy Cô Sa Pa',
    });

    setTeacherTasks(prev => [newTask, ...prev]);
    setShowNewTaskModal(false);
    setNewTaskTitle('');

    if (onShowToast) {
      onShowToast('Đã giao nhiệm vụ mới! 🎯', `Đã giao nhiệm vụ game cho lớp ${newTaskClass}`, 'success');
    }
  };

  const GAME_TABS = [
    {
      id: 'waste_sorting' as GameType,
      label: 'Phân Loại Rác',
      icon: '♻️',
      color: 'emerald',
      sub: 'Kéo thả 4 thùng rác',
    },
    {
      id: 'water_saving' as GameType,
      label: 'Tiết Kiệm Nước',
      icon: '💧',
      color: 'sky',
      sub: 'Tình huống suối Mường Hoa',
    },
    {
      id: 'electricity_saving' as GameType,
      label: 'Tiết Kiệm Điện',
      icon: '⚡',
      color: 'amber',
      sub: 'An toàn & tiết kiệm điện',
    },
    {
      id: 'tree_protection' as GameType,
      label: 'Bảo Vệ Cây Xanh',
      icon: '🌲',
      color: 'teal',
      sub: 'Nuôi cây lớn đơm hoa',
    },
    {
      id: 'eco_quiz' as GameType,
      label: 'Đấu Trường Tri Thức',
      icon: '🏆',
      color: 'purple',
      sub: 'Hẹn giờ & thi đấu nhóm',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Game Selector Hub Header */}
      <div className="bg-white rounded-3xl p-3 border border-emerald-100 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Universal Back Button */}
          {onNavigate && (
            <button
              onClick={() => {
                playSound('click');
                onNavigate('home');
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 font-extrabold text-xs transition-colors shrink-0"
              title="Quay lại trang chủ"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          )}

          {GAME_TABS.map((tab) => {
            const isActive = activeGame === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Utility Tabs: History & Teacher Tasks */}
        <div className="flex items-center gap-1.5">
          {/* History */}
          <button
            onClick={() => handleSelectTab('history')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all border ${
              activeGame === 'history'
                ? 'bg-amber-100 text-amber-950 border-amber-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5 text-amber-600" />
            <span>Lịch Sử & Huy Hiệu</span>
          </button>

          {/* Teacher Tasks */}
          <button
            onClick={() => handleSelectTab('teacher_tasks')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all border ${
              activeGame === 'teacher_tasks'
                ? 'bg-teal-700 text-white border-teal-700'
                : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border-teal-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Nhiệm Vụ Thầy Cô</span>
            {teacherTasks.length > 0 && (
              <span className="bg-amber-400 text-slate-900 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {teacherTasks.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================
          ACTIVE GAME VIEW CONTAINER
      ======================================================== */}
      {activeGame === 'waste_sorting' && (
        <WasteSortingGameView
          activeProfile={activeProfile}
          onProfileUpdated={onProfileUpdated}
          onShowToast={onShowToast}
        />
      )}

      {activeGame === 'water_saving' && (
        <WaterSavingGameView
          activeProfile={activeProfile}
          onProfileUpdated={onProfileUpdated}
          onShowToast={onShowToast}
        />
      )}

      {activeGame === 'electricity_saving' && (
        <ElectricitySavingGameView
          activeProfile={activeProfile}
          onProfileUpdated={onProfileUpdated}
          onShowToast={onShowToast}
        />
      )}

      {activeGame === 'tree_protection' && (
        <TreeProtectionGameView
          activeProfile={activeProfile}
          onProfileUpdated={onProfileUpdated}
          onShowToast={onShowToast}
        />
      )}

      {activeGame === 'eco_quiz' && (
        <EcoQuizArenaView
          activeProfile={activeProfile}
          onProfileUpdated={onProfileUpdated}
          onShowToast={onShowToast}
        />
      )}

      {/* ========================================================
          TAB: GAME HISTORY & BADGES (LỊCH SỬ & HUY HIỆU)
      ======================================================== */}
      {activeGame === 'history' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Top Info Banner */}
          <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-500" />
                <span>Bảng Vàng Huy Hiệu & Lịch Sử Trò Chơi</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Theo dõi quá trình học tập và rèn luyện của bạn <strong>{activeProfile.nickname}</strong> (Lớp {activeProfile.className})
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Bảo vệ quyền riêng tư: Chỉ dùng biệt danh</span>
            </div>
          </div>

          {/* Unlocked Badges Showcase */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Huy Hiệu Xanh Đã Mở Khóa:</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {[
                { name: 'Hiệp Sĩ Phân Loại', icon: '♻️', desc: 'Đạt từ 80 điểm phân loại rác' },
                { name: 'Giọt Nước Vàng', icon: '💧', desc: 'Tiết kiệm nước suối Mường Hoa' },
                { name: 'Năng Lượng Xanh', icon: '⚡', desc: 'Sử dụng an toàn & tiết kiệm điện' },
                { name: 'Vệ Sĩ Cây Rừng', icon: '🌲', desc: 'Chăm sóc và bảo vệ cây vườn' },
                { name: 'Trí Tuệ Xanh', icon: '🏆', desc: 'Chiến thắng Đấu trường tri thức' },
              ].map((badge, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-gradient-to-b from-amber-50/80 to-yellow-50/30 border border-amber-200 text-center space-y-1.5 hover:scale-105 transition-transform"
                >
                  <span className="text-3xl block">{badge.icon}</span>
                  <div className="font-black text-xs text-amber-950 leading-tight">{badge.name}</div>
                  <div className="text-[10px] text-amber-800/80 leading-snug">{badge.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Games History List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                <span>Nhật Ký Các Ván Chơi Gần Đây ({gameHistory.length} lượt):</span>
              </h4>
            </div>

            {gameHistory.length === 0 ? (
              <div className="text-center py-10 text-slate-400 space-y-2">
                <div className="text-4xl">🎮</div>
                <p className="text-xs font-medium">Chưa có lịch sử chơi game. Hãy chọn một trò chơi phía trên để bắt đầu!</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {gameHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-xs">
                        {item.gameType === 'waste_sorting' ? '♻️' : item.gameType === 'water_saving' ? '💧' : item.gameType === 'electricity_saving' ? '⚡' : item.gameType === 'tree_protection' ? '🌲' : '🏆'}
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-sm">{item.gameTitle}</div>
                        <div className="text-slate-500 text-[11px]">
                          Người chơi: <strong>{item.studentNickname}</strong> • {new Date(item.timestamp).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-black text-sm text-emerald-700 block">{item.score} / {item.maxScore} Điểm</span>
                        <span className="text-[11px] text-slate-500 font-medium">Đúng {item.correctAnswers}/{item.totalQuestions} câu</span>
                      </div>
                      {item.badge && (
                        <span className="bg-amber-100 text-amber-900 font-extrabold px-2.5 py-1 rounded-full text-[10px] border border-amber-300">
                          🏅 {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB: TEACHER GAME TASKS (NHIỆM VỤ GIÁO VIÊN GIAO)
      ======================================================== */}
      {activeGame === 'teacher_tasks' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-3xl p-6 border border-teal-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-teal-600" />
                <span>Nhiệm Vụ Trò Chơi Môi Trường Do Thầy Cô Giao</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Hoàn thành các thử thách được giáo viên chỉ định để nhận thêm Điểm Xanh thưởng!
              </p>
            </div>

            {/* Teacher Button to add Task */}
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs shadow-md shadow-teal-600/20 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Giao Thử Thách Mới</span>
            </button>
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            {teacherTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-teal-300 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center text-2xl shrink-0 border border-teal-100">
                    {task.gameType === 'waste_sorting' ? '♻️' : task.gameType === 'water_saving' ? '💧' : task.gameType === 'electricity_saving' ? '⚡' : task.gameType === 'tree_protection' ? '🌲' : '🏆'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-teal-100 text-teal-900">
                        Lớp nhận: {task.targetClass === 'ALL' ? 'Toàn trường' : task.targetClass}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        Giao bởi: <strong>{task.assignedBy}</strong>
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-base">{task.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Mục tiêu: Đạt tối thiểu <strong>{task.targetScore} điểm</strong> • Thưởng <strong>+{task.pointsReward} Điểm Xanh</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    playSound('click');
                    setActiveGame(task.gameType);
                  }}
                  className="flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  <span>Chơi Ngay</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* New Task Modal */}
          {showNewTaskModal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-teal-200 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    <h3 className="text-base font-black text-slate-800">
                      Thầy Cô Giao Nhiệm Vụ Trò Chơi
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowNewTaskModal(false)}
                    className="text-slate-400 hover:text-slate-700 font-bold"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateTeacherTask} className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 mb-1 block">Tên nhiệm vụ / thử thách:</label>
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Ví dụ: Đạt 90 điểm phân loại rác tuần này..."
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 focus:outline-hidden focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 mb-1 block">Chọn trò chơi:</label>
                    <select
                      value={newTaskGame}
                      onChange={(e) => setNewTaskGame(e.target.value as GameType)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-hidden"
                    >
                      <option value="waste_sorting">♻️ Trò chơi Phân loại rác</option>
                      <option value="water_saving">💧 Thử thách Tiết kiệm nước</option>
                      <option value="electricity_saving">⚡ Trường học Tiết kiệm điện</option>
                      <option value="tree_protection">🌲 Bảo vệ Cây xanh</option>
                      <option value="eco_quiz">🏆 Đấu trường Tri thức xanh</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 mb-1 block">Lớp nhận nhiệm vụ:</label>
                      <select
                        value={newTaskClass}
                        onChange={(e) => setNewTaskClass(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                      >
                        <option value="3A1">Lớp 3A1</option>
                        <option value="4B">Lớp 4B</option>
                        <option value="5A">Lớp 5A</option>
                        <option value="2A2">Lớp 2A2</option>
                        <option value="1A1">Lớp 1A1</option>
                        <option value="ALL">Toàn trường</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 mb-1 block">Điểm tối thiểu cần đạt:</label>
                      <input
                        type="number"
                        min={50}
                        max={100}
                        step={10}
                        value={newTaskScore}
                        onChange={(e) => setNewTaskScore(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 mb-1 block">Điểm Xanh thưởng khi hoàn thành:</label>
                    <input
                      type="number"
                      min={10}
                      max={200}
                      step={10}
                      value={newTaskReward}
                      onChange={(e) => setNewTaskReward(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowNewTaskModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black shadow-md shadow-teal-600/20"
                    >
                      Giao Cho Lớp
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
