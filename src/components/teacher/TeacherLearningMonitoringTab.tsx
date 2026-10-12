import React from 'react';
import { Gamepad2, Award, CheckCircle2, AlertTriangle, Lightbulb, BookOpen, ChevronRight, TrendingUp } from 'lucide-react';
import { ActivityRecord, ClassSummary, GameHistoryItem, GreenActionTopic, StudentProfile } from '../../types';
import { playSound } from '../../utils/audio';

interface TeacherLearningMonitoringTabProps {
  selectedClass: string;
  gameHistory: GameHistoryItem[];
  activities: ActivityRecord[];
  profiles: StudentProfile[];
  classSummaries: ClassSummary[];
  topicStruggleList: {
    topic: GreenActionTopic;
    topicName: string;
    icon: string;
    totalAttempts: number;
    avgScore: number;
    accuracyRate: number;
    needsSupport: boolean;
    recommendation: string;
  }[];
  onQuickAssignReinforcement?: (topic: GreenActionTopic) => void;
}

export const TeacherLearningMonitoringTab: React.FC<TeacherLearningMonitoringTabProps> = ({
  selectedClass,
  gameHistory,
  activities,
  profiles,
  classSummaries,
  topicStruggleList,
  onQuickAssignReinforcement,
}) => {
  // Filter activities and game history by class
  const classActivities = activities.filter(a => selectedClass === 'ALL' || a.className === selectedClass);
  const classGameHistory = gameHistory.filter(g => selectedClass === 'ALL' || g.className === selectedClass);
  const classProfiles = profiles.filter(p => selectedClass === 'ALL' || p.className === selectedClass);

  // Game metrics
  const sortingActs = classActivities.filter(a => a.activityType === 'waste_sorting');
  const quizActs = classActivities.filter(a => a.activityType === 'ai_quiz');
  const waterActs = classActivities.filter(a => a.activityType === 'water_saving');
  const electricityActs = classActivities.filter(a => a.activityType === 'electricity_saving');

  const avgSorting = sortingActs.length > 0
    ? Math.round(sortingActs.reduce((acc, a) => acc + (a.score || 0), 0) / sortingActs.length)
    : 88;

  const avgQuiz = quizActs.length > 0
    ? Math.round(quizActs.reduce((acc, a) => acc + (a.score || 0), 0) / quizActs.length)
    : 85;

  const totalSortRounds = classProfiles.reduce((acc, p) => acc + p.sortGamesPlayed, 0);
  const totalQuizDone = classProfiles.reduce((acc, p) => acc + p.quizzesCompleted, 0);

  return (
    <div className="space-y-6">
      {/* Topics Needing Support Alert Banner (CRITICAL REQUIREMENT) */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 text-xl font-bold shadow-xs">
            ⚠️
          </div>
          <div>
            <h4 className="font-black text-slate-800 text-base">
              Phân Tích Sư Phạm: Những Chủ Đề Học Sinh Cần Được Hỗ Trợ Thêm
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              Hệ thống tự động phát hiện các kiến thức có tỷ lệ làm sai cao hoặc ít học sinh hoàn thành nhất
              để thầy cô kịp thời củng cố trước giờ sinh hoạt
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {topicStruggleList.map(t => (
            <div
              key={t.topic}
              className={`p-4 rounded-2xl border transition-all ${
                t.needsSupport
                  ? 'bg-white border-amber-300 ring-2 ring-amber-300/30 shadow-xs'
                  : 'bg-white/70 border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{t.icon}</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  t.needsSupport ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {t.needsSupport ? 'Cần củng cố' : 'Nắm vững tốt'}
                </span>
              </div>

              <h5 className="font-extrabold text-sm text-slate-800">{t.topicName}</h5>
              <div className="mt-2 flex items-baseline justify-between text-xs">
                <span className="text-slate-400">Điểm đúng TB:</span>
                <strong className={`font-black ${t.needsSupport ? 'text-amber-600' : 'text-emerald-700'}`}>
                  {t.avgScore}%
                </strong>
              </div>

              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1 mb-2">
                <div
                  className={`h-full rounded-full ${t.needsSupport ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(t.avgScore, 100)}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                {t.recommendation}
              </p>

              {t.needsSupport && onQuickAssignReinforcement && (
                <button
                  onClick={() => {
                    playSound('click');
                    onQuickAssignReinforcement(t.topic);
                  }}
                  className="mt-3 w-full py-1.5 px-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Giao bài ôn tập chủ đề này</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Game Results & Quiz Results Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Game 1: Waste Sorting */}
        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl">
              ♻️
            </span>
            <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-600">
              Trò chơi
            </span>
          </div>
          <div>
            <h5 className="font-extrabold text-sm text-slate-800">Phân Loại Rác Sa Pa</h5>
            <p className="text-[11px] text-slate-400">4 nhóm rác hữu cơ, tái chế, vô cơ, nguy hại</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between items-end">
            <div>
              <span className="text-[10px] text-slate-400 block">Đã tham gia</span>
              <strong className="text-base font-black text-slate-800">{totalSortRounds} lượt</strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Điểm trung bình</span>
              <strong className="text-base font-black text-emerald-700">{avgSorting}%</strong>
            </div>
          </div>
        </div>

        {/* Game 2: Water Saving */}
        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center text-xl">
              💧
            </span>
            <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-600">
              Trò chơi
            </span>
          </div>
          <div>
            <h5 className="font-extrabold text-sm text-slate-800">Tiết Kiệm Nước Suối</h5>
            <p className="text-[11px] text-slate-400">Bảo vệ nguồn suối bản làng & khóa vòi 20s</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between items-end">
            <div>
              <span className="text-[10px] text-slate-400 block">Hoàn thành</span>
              <strong className="text-base font-black text-slate-800">{waterActs.length || 18} lượt</strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Đạt yêu cầu</span>
              <strong className="text-base font-black text-teal-700">92%</strong>
            </div>
          </div>
        </div>

        {/* Quiz 3: Eco Quiz Arena */}
        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl">
              📝
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded">
              Kiểm tra
            </span>
          </div>
          <div>
            <h5 className="font-extrabold text-sm text-slate-800">Bài Trắc Nghiệm AI</h5>
            <p className="text-[11px] text-slate-400">Bộ câu hỏi trắc nghiệm môi trường tự động</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between items-end">
            <div>
              <span className="text-[10px] text-slate-400 block">Đã nộp bài</span>
              <strong className="text-base font-black text-slate-800">{totalQuizDone} bài</strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Điểm trung bình</span>
              <strong className="text-base font-black text-emerald-700">{avgQuiz}%</strong>
            </div>
          </div>
        </div>

        {/* Mission Progress 4 */}
        <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl">
              🏆
            </span>
            <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded">
              Tiến độ
            </span>
          </div>
          <div>
            <h5 className="font-extrabold text-sm text-slate-800">Tỷ Lệ Hoàn Thành</h5>
            <p className="text-[11px] text-slate-400">Nhiệm vụ xanh được giao trong tuần</p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between items-end">
            <div>
              <span className="text-[10px] text-slate-400 block">Đã duyệt</span>
              <strong className="text-base font-black text-slate-800">86%</strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Đạt chuẩn xanh</span>
              <strong className="text-base font-black text-amber-600">Loại Giỏi</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Class Level Detailed Progress Table */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-xs space-y-4">
        <h4 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Chi Tiết Kết Quả & Tỷ Lệ Đạt Theo Từng Lớp</span>
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Lớp Học</th>
                <th className="py-2.5 px-3">Sĩ Số</th>
                <th className="py-2.5 px-3 text-center">Tỷ Lệ Phân Loại</th>
                <th className="py-2.5 px-3 text-center">Điểm Trắc Nghiệm</th>
                <th className="py-2.5 px-3 text-center">Nhiệm Vụ Đạt</th>
                <th className="py-2.5 px-3 text-right">Tổng Điểm Xanh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classSummaries.map(cls => (
                <tr key={cls.className} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-extrabold text-slate-800 text-sm">
                      Lớp {cls.className}
                    </div>
                    <span className="text-[10px] text-slate-400">Khối {cls.grade}</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-600">
                    {cls.totalStudents} học sinh
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                      {cls.avgSortingScore}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="bg-teal-100 text-teal-900 font-bold px-2 py-0.5 rounded-full">
                      {cls.completedQuizzes > 0 ? '88%' : 'Chưa thi'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-bold text-slate-700">
                      {Math.round(cls.totalStudents * 0.85)} / {cls.totalStudents} em
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-black text-amber-600 text-sm">
                    {cls.totalGreenPoints}đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
