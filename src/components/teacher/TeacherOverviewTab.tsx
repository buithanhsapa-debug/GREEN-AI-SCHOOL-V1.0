import React from 'react';
import { LayoutDashboard, Users, Award, TrendingUp, CheckCircle2, Plus, Sparkles, MapPin, Download, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { ActivityRecord, ClassSummary, NavTab, StudentProfile } from '../../types';
import { playSound } from '../../utils/audio';

interface TeacherOverviewTabProps {
  totalClasses: number;
  totalStudents: number;
  totalActivitiesCount: number;
  completedTasksCount: number;
  pendingSubmissionsCount: number;
  classSummaries: ClassSummary[];
  selectedClass: string;
  onSelectClass: (className: string) => void;
  filteredActivities: ActivityRecord[];
  onOpenAddClass: () => void;
  onOpenAddStudent: () => void;
  onOpenBulkStudents?: () => void;
  onOpenAddChallenge: () => void;
  onOpenExportReport: () => void;
  onNavigate?: (tab: NavTab) => void;
}

export const TeacherOverviewTab: React.FC<TeacherOverviewTabProps> = ({
  totalClasses,
  totalStudents,
  totalActivitiesCount,
  completedTasksCount,
  pendingSubmissionsCount,
  classSummaries,
  selectedClass,
  onSelectClass,
  filteredActivities,
  onOpenAddClass,
  onOpenAddStudent,
  onOpenBulkStudents,
  onOpenAddChallenge,
  onOpenExportReport,
  onNavigate,
}) => {
  return (
    <div className="space-y-6">
      {/* 5 Overview KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* KPI 1 */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-emerald-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block mb-1">Lớp Quản Lý</span>
            <span className="text-xl sm:text-2xl font-black text-slate-800">{totalClasses} Lớp</span>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Toàn trường Sa Pa</span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg sm:text-xl">
            🏫
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-emerald-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block mb-1">Tổng Học Sinh</span>
            <span className="text-xl sm:text-2xl font-black text-slate-800">{totalStudents} Em</span>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Hồ sơ công dân số nhí</span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-lg sm:text-xl">
            🎒
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-emerald-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block mb-1">Hoạt Động Tổ Chức</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-700">{totalActivitiesCount}</span>
            <span className="text-[10px] text-teal-600 font-semibold block mt-1">Trò chơi & Thử thách</span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg sm:text-xl">
            🌿
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-emerald-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block mb-1">Nhiệm Vụ Đã Xong</span>
            <span className="text-xl sm:text-2xl font-black text-teal-700">{completedTasksCount}</span>
            <span className="text-[10px] text-teal-600 font-semibold block mt-1">Đã nộp & chấm điểm</span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg sm:text-xl">
            ✅
          </div>
        </div>

        {/* KPI 5: Pending Submissions Review */}
        <div
          onClick={() => {
            playSound('click');
            if (onNavigate) onNavigate('diary');
          }}
          className={`p-4 sm:p-5 rounded-3xl border shadow-xs flex items-center justify-between col-span-2 lg:col-span-1 cursor-pointer transition-all hover:scale-105 active:scale-95 ${
            pendingSubmissionsCount > 0 ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-300/30' : 'bg-white border-emerald-100 hover:border-emerald-300'
          }`}
          title="Nhấn để mở trang GREEN ACTION quản lý, duyệt và xóa bài viết"
        >
          <div>
            <span className="text-[11px] font-bold text-slate-400 block mb-1">Chờ Giáo Viên Duyệt</span>
            <span className={`text-xl sm:text-2xl font-black ${pendingSubmissionsCount > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
              {pendingSubmissionsCount} Bài
            </span>
            <span className="text-[10px] text-amber-700 font-semibold block mt-1">
              {pendingSubmissionsCount > 0 ? 'Nhấn để duyệt / xóa bài' : 'Đã duyệt xong hết'}
            </span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg sm:text-xl font-bold">
            ⏳
          </div>
        </div>
      </div>

      {/* Class Comparison Grid */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Tiến Độ Và Tỷ Lệ Hoàn Thành Từng Lớp Tại Sa Pa</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Nhấn vào từng lớp để lọc dữ liệu hoạt động và học sinh nhanh chóng
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectClass('ALL')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                selectedClass === 'ALL'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              Toàn Bộ Các Lớp
            </button>
          </div>
        </div>

        {classSummaries.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Chưa có lớp nào được đăng ký trong hệ thống.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {classSummaries.map((cls) => (
              <div
                key={cls.className}
                onClick={() => {
                  playSound('click');
                  onSelectClass(cls.className);
                }}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedClass === cls.className
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50/70 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-sm text-slate-800">
                    Lớp {cls.className}
                  </span>
                  <span className="text-[10px] bg-white border border-slate-200 font-bold px-1.5 py-0.5 rounded text-slate-600">
                    Khối {cls.grade}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                      <span>Đúng phân loại:</span>
                      <span className="text-emerald-700">{cls.avgSortingScore}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${Math.min(cls.avgSortingScore, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 pt-1 flex justify-between">
                    <span>Sĩ số: <strong>{cls.totalStudents} em</strong></span>
                    <strong className="text-amber-600">{cls.totalGreenPoints}đ</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real-time Activity Feed and Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Activity Feed (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-emerald-100 shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Nhật Ký Hoạt Động & Rèn Luyện Gần Nhất</span>
              </h3>
              <p className="text-xs text-slate-500">
                {selectedClass === 'ALL' ? 'Toàn bộ học sinh các lớp Sa Pa' : `Riêng học sinh lớp ${selectedClass}`}
              </p>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {filteredActivities.length} sự kiện
            </span>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <div className="text-3xl">📭</div>
              <p className="text-xs font-medium">Chưa ghi nhận hoạt động nào của lớp này.</p>
              <button
                onClick={onOpenAddChallenge}
                className="text-xs text-emerald-600 font-bold hover:underline"
              >
                + Giao thử thách đầu tiên cho lớp ngay
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
              {filteredActivities.slice(0, 12).map((act) => {
                const dateStr = new Date(act.timestamp).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                });

                return (
                  <div
                    key={act.id}
                    className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-emerald-200 transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-[11px] mb-0.5">
                        <span className="font-extrabold text-slate-800">
                          {act.studentNickname}
                        </span>
                        <span className="bg-slate-200/80 font-bold px-1.5 py-0.5 rounded text-[10px] text-slate-600">
                          Lớp {act.className}
                        </span>
                        <span className="text-slate-400 text-[10px]">{dateStr}</span>
                      </div>
                      <p className="font-bold text-emerald-800">{act.title}</p>
                      {act.details && (
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {act.details}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                        +{act.greenPointsEarned}đ Xanh
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Shortcuts & Navigation Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-linear-to-br from-teal-800 to-emerald-900 text-white rounded-3xl p-5 sm:p-6 shadow-md shadow-teal-900/10 space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-200 block mb-1">
                Lối Tắt Sư Phạm Nhanh
              </span>
              <h4 className="font-extrabold text-lg text-white">Thao Tác Thường Dùng</h4>
              <p className="text-xs text-teal-100/80 mt-1">
                Khởi tạo bài học, cấp mã không cần email cho học sinh tiểu học Sa Pa
              </p>
            </div>

            <div className="space-y-2 text-xs font-bold">
              {onOpenBulkStudents && (
                <button
                  onClick={() => {
                    playSound('click');
                    onOpenBulkStudents();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/30 transition-all text-left group"
                >
                  <span className="flex items-center gap-2 font-bold text-amber-200">
                    <Sparkles className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                    <span>⚡ Tự Động Tạo Danh Sách Học Sinh (35 Lớp)</span>
                  </span>
                  <span className="text-amber-200">→</span>
                </button>
              )}

              <button
                onClick={() => {
                  playSound('click');
                  onOpenAddStudent();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-left"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-300" />
                  <span>Cấp Mã Học Sinh (Từng Em)</span>
                </span>
                <span>→</span>
              </button>

              <button
                onClick={() => {
                  playSound('click');
                  onOpenAddClass();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-left"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-300" />
                  <span>Tạo Lớp Học Mới</span>
                </span>
                <span>→</span>
              </button>

              <button
                onClick={() => {
                  playSound('click');
                  onOpenAddChallenge();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-left"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Giao Thử Thách Xanh Cho Lớp</span>
                </span>
                <span>→</span>
              </button>

              {onNavigate && (
                <button
                  onClick={() => {
                    playSound('click');
                    onNavigate('map');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/30 transition-all text-left"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-300" />
                    <span>Mở Bản Đồ GREEN MAP</span>
                  </span>
                  <span>↗</span>
                </button>
              )}

              <button
                onClick={() => {
                  playSound('click');
                  onOpenExportReport();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all text-left"
              >
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>Xuất Báo Cáo Sư Phạm</span>
                </span>
                <span>📊</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
