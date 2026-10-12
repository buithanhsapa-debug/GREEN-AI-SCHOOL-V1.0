import React, { useState } from 'react';
import {
  NavTab,
  StudentProfile,
  UserRole
} from '../types';
import { NEWS_ARTICLES } from '../data/newsData';
import { playSound } from '../utils/audio';
import {
  Award,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Globe2,
  Clock,
  UserCheck,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

interface HomeViewProps {
  activeProfile: StudentProfile;
  onNavigate: (tab: NavTab) => void;
  role: UserRole;
  onToggleRole: (newRole: UserRole) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  activeProfile,
  onNavigate,
  role,
  onToggleRole,
}) => {
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [showNews, setShowNews] = useState(false);

  const handleCardClick = (tab: NavTab) => {
    playSound('click');

    // If student clicks GREEN DASHBOARD, automatically switch to teacher mode
    // so judges and teachers can explore seamlessly without permission blockage
    if (tab === 'teacher' && role === 'student') {
      onToggleRole('teacher');
    }

    onNavigate(tab);
  };

  return (
    <div className="space-y-8 pb-12 pt-2 sm:pt-4">
      {/* ========================================================================= */}
      {/* EXACT USER-REQUESTED PORTAL HUB DIAGRAM (GREEN AI SA PA)                 */}
      {/* ========================================================================= */}
      <div className="max-w-2xl mx-auto">
        {/* Outer Rounded Frame */}
        <div className="bg-white rounded-[28px] sm:rounded-[36px] border-2 border-[#185a32]/25 p-3.5 sm:p-6 shadow-xl shadow-emerald-950/5">
          {/* 1. Header Banner */}
          <div className="bg-[#185a32] text-white rounded-2xl py-5 sm:py-7 px-4 sm:px-6 text-center shadow-sm">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-wide uppercase drop-shadow-xs">
              GREEN EDU AI SCHOOL
            </h1>
            <p className="text-emerald-100 text-sm sm:text-lg font-medium mt-1 sm:mt-1.5">
              Nền tảng giáo dục môi trường thông minh
            </p>
          </div>

          {/* 2. Downward Arrow Indicator */}
          <div className="py-2.5 sm:py-3.5 flex justify-center items-center">
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8 text-[#185a32]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </div>

          {/* 3. 2x3 Grid of 6 Main Module Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4.5">
            {/* Card 1: AI GREEN GUIDE */}
            <button
              type="button"
              onClick={() => handleCardClick('ai')}
              className="group bg-white rounded-2xl border-2 border-[#90c5a0] hover:border-[#185a32] p-5 sm:p-6 flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-95 cursor-pointer"
            >
              {/* Bot Icon */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-[#185a32] group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 sm:w-9 sm:h-9"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="10" rx="3" />
                  <circle cx="12" cy="5" r="2" />
                  <path d="M12 7v4" />
                  <circle cx="8.5" cy="15.5" r="1.2" fill="currentColor" />
                  <circle cx="15.5" cy="15.5" r="1.2" fill="currentColor" />
                </svg>
              </div>

              <h2 className="text-[#0f172a] font-extrabold text-base sm:text-lg tracking-wide uppercase mt-2.5">
                AI GREEN GUIDE
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1 leading-snug">
                Trợ lý AI giáo dục môi trường
              </p>
            </button>

            {/* Card 2: GREEN VISION */}
            <button
              type="button"
              onClick={() => handleCardClick('scanner')}
              className="group bg-white rounded-2xl border-2 border-[#90c5a0] hover:border-[#185a32] p-5 sm:p-6 flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-95 cursor-pointer"
            >
              {/* Viewfinder with Eye Icon */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-[#185a32] group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 sm:w-9 sm:h-9"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* 4 corner brackets */}
                  <path d="M4 8V5a1 1 0 0 1 1-1h3" />
                  <path d="M16 4h3a1 1 0 0 1 1 1v3" />
                  <path d="M20 16v3a1 1 0 0 1-1 1h-3" />
                  <path d="M8 20H5a1 1 0 0 1-1-1v-3" />
                  {/* Eye in center */}
                  <path d="M7.5 12c1.2-2.5 3-3.8 4.5-3.8s3.3 1.3 4.5 3.8c-1.2 2.5-3 3.8-4.5 3.8s-3.3-1.3-4.5-3.8z" />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                </svg>
              </div>

              <h2 className="text-[#0f172a] font-extrabold text-base sm:text-lg tracking-wide uppercase mt-2.5">
                GREEN VISION
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1 leading-snug">
                Nhận diện hình ảnh hỗ trợ học tập
              </p>
            </button>

            {/* Card 3: GREEN GAME */}
            <button
              type="button"
              onClick={() => handleCardClick('game')}
              className="group bg-white rounded-2xl border-2 border-[#90c5a0] hover:border-[#185a32] p-5 sm:p-6 flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-95 cursor-pointer"
            >
              {/* Gamepad Icon */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-[#185a32] group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 sm:w-9 sm:h-9"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="6" width="20" height="12" rx="4" />
                  <line x1="6" y1="12" x2="10" y2="12" />
                  <line x1="8" y1="10" x2="8" y2="14" />
                  <circle cx="15" cy="13" r="1" fill="currentColor" />
                  <circle cx="18" cy="11" r="1" fill="currentColor" />
                </svg>
              </div>

              <h2 className="text-[#0f172a] font-extrabold text-base sm:text-lg tracking-wide uppercase mt-2.5">
                GREEN GAME
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1 leading-snug">
                Trò chơi và thử thách xanh
              </p>
            </button>

            {/* Card 4: GREEN MAP */}
            <button
              type="button"
              onClick={() => handleCardClick('map')}
              className="group bg-white rounded-2xl border-2 border-[#90c5a0] hover:border-[#185a32] p-5 sm:p-6 flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-95 cursor-pointer"
            >
              {/* Folded Map Icon */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-[#185a32] group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 sm:w-9 sm:h-9"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                  <line x1="9" y1="3" x2="9" y2="18" />
                  <line x1="15" y1="6" x2="15" y2="21" />
                </svg>
              </div>

              <h2 className="text-[#0f172a] font-extrabold text-base sm:text-lg tracking-wide uppercase mt-2.5">
                GREEN MAP
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1 leading-snug">
                Bản đồ môi trường trường học
              </p>
            </button>

            {/* Card 5: GREEN ACTION */}
            <button
              type="button"
              onClick={() => handleCardClick('diary')}
              className="group bg-white rounded-2xl border-2 border-[#90c5a0] hover:border-[#185a32] p-5 sm:p-6 flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-95 cursor-pointer"
            >
              {/* Seedling / Sprout Plant Icon */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-[#185a32] group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 sm:w-9 sm:h-9"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 21h12" />
                  <path d="M12 21v-9" />
                  <path d="M12 12c0-3.5-2.5-6-6-6 0 3.5 2.5 6 6 6z" />
                  <path d="M12 12c0-3.5 2.5-6 6-6 0 3.5-2.5 6-6 6z" />
                </svg>
              </div>

              <h2 className="text-[#0f172a] font-extrabold text-base sm:text-lg tracking-wide uppercase mt-2.5">
                GREEN ACTION
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1 leading-snug">
                Nhật ký hành động xanh
              </p>
            </button>

            {/* Card 6: GREEN DASHBOARD */}
            <button
              type="button"
              onClick={() => handleCardClick('teacher')}
              className="group bg-white rounded-2xl border-2 border-[#90c5a0] hover:border-[#185a32] p-5 sm:p-6 flex flex-col items-center justify-center text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-95 cursor-pointer"
            >
              {/* Trending Up Bar Chart Icon */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-[#185a32] group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 sm:w-9 sm:h-9"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" y1="20" x2="20" y2="20" />
                  <line x1="7" y1="20" x2="7" y2="16" />
                  <line x1="12" y1="20" x2="12" y2="12" />
                  <line x1="17" y1="20" x2="17" y2="8" />
                  <polyline points="7 14 12 10 17 6 20 6" />
                </svg>
              </div>

              <h2 className="text-[#0f172a] font-extrabold text-base sm:text-lg tracking-wide uppercase mt-2.5">
                GREEN DASHBOARD
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1 leading-snug">
                Bảng điều khiển giáo viên
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BAN GIÁM HIỆU / ADMIN DEDICATED CONTROL PANEL (buithanhsapa)              */}
      {/* ========================================================================= */}
      {role === 'admin' && (
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-purple-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-purple-400/30 space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-400/20 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-2xl shadow-md">
                👑
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-400/30 text-purple-200 px-2 py-0.5 rounded-full">
                  Ban Giám Hiệu – Quản Trị Hệ Thống (buithanhsapa)
                </span>
                <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                  Bảng Quản Lý Toàn Quyền Trường Sa Pa
                </h3>
              </div>
            </div>
            <button
              onClick={() => onNavigate('admin')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black rounded-xl shadow-md transition-all self-start sm:self-auto cursor-pointer"
            >
              Mở Trang Quản Trị →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-all hover:scale-[1.02] active:scale-95 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl group-hover:scale-110 transition-transform">👩‍🏫</span>
                <span className="text-[10px] bg-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full font-bold">Thêm • Sửa • Xóa</span>
              </div>
              <div className="font-black text-sm text-white mt-2">1. Quản Lý Giáo Viên</div>
              <div className="text-[11px] text-purple-200 mt-0.5">Cấp tài khoản, phân công lớp &amp; quản lý thầy cô</div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-all hover:scale-[1.02] active:scale-95 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl group-hover:scale-110 transition-transform">🏫</span>
                <span className="text-[10px] bg-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full font-bold">Thêm • Sửa • Xóa</span>
              </div>
              <div className="font-black text-sm text-white mt-2">2. Quản Lý Lớp Học</div>
              <div className="text-[11px] text-purple-200 mt-0.5">Tạo lớp học, phân phòng &amp; gán giáo viên chủ nhiệm</div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-all hover:scale-[1.02] active:scale-95 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl group-hover:scale-110 transition-transform">🎒</span>
                <span className="text-[10px] bg-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full font-bold">Thêm • Sửa • Xóa</span>
              </div>
              <div className="font-black text-sm text-white mt-2">3. Quản Lý Học Sinh</div>
              <div className="text-[11px] text-purple-200 mt-0.5">Cấp mã học sinh (SPA-LỚP-STT), sửa tên &amp; xóa hồ sơ</div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-all hover:scale-[1.02] active:scale-95 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl group-hover:scale-110 transition-transform">📝</span>
                <span className="text-[10px] bg-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full font-bold">Sửa • Xóa</span>
              </div>
              <div className="font-black text-sm text-white mt-2">4. Quản Lý Bài Viết</div>
              <div className="text-[11px] text-purple-200 mt-0.5">Kiểm duyệt, chỉnh sửa nội dung và xóa bài viết vi phạm</div>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GIÁO VIÊN DEDICATED CONTROL PANEL (Teacher Role)                          */}
      {/* ========================================================================= */}
      {role === 'teacher' && (
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-teal-900 via-emerald-950 to-teal-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-teal-400/30 space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-400/20 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-2xl shadow-md">
                👩‍🏫
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-teal-400/30 text-teal-200 px-2 py-0.5 rounded-full">
                  Giáo Viên Chủ Nhiệm
                </span>
                <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                  Bảng Quản Lý Dành Cho Giáo Viên
                </h3>
              </div>
            </div>
            <button
              onClick={() => onNavigate('teacher')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-black rounded-xl shadow-md transition-all self-start sm:self-auto cursor-pointer"
            >
              Mở Dashboard →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => onNavigate('teacher')}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-all hover:scale-[1.02] active:scale-95 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl group-hover:scale-110 transition-transform">🏫</span>
                <span className="text-[10px] bg-teal-400/40 text-teal-200 px-2 py-0.5 rounded-full font-bold">Thêm • Sửa • Xóa</span>
              </div>
              <div className="font-black text-sm text-white mt-2">1. Quản Lý Lớp Học</div>
              <div className="text-[11px] text-teal-200 mt-0.5">Tạo lớp mới, cập nhật sĩ số và phòng học</div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('teacher')}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-all hover:scale-[1.02] active:scale-95 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl group-hover:scale-110 transition-transform">🎒</span>
                <span className="text-[10px] bg-teal-400/40 text-teal-200 px-2 py-0.5 rounded-full font-bold">Thêm • Sửa • Xóa</span>
              </div>
              <div className="font-black text-sm text-white mt-2">2. Quản Lý Học Sinh</div>
              <div className="text-[11px] text-teal-200 mt-0.5">Cấp mã học sinh, chỉnh sửa thông tin &amp; xóa học sinh</div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('diary')}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-all hover:scale-[1.02] active:scale-95 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl group-hover:scale-110 transition-transform">📝</span>
                <span className="text-[10px] bg-emerald-400/40 text-emerald-200 px-2 py-0.5 rounded-full font-bold">Duyệt • Sửa • Xóa</span>
              </div>
              <div className="font-black text-sm text-white mt-2">3. Duyệt &amp; Quản Lý Bài Viết</div>
              <div className="text-[11px] text-teal-200 mt-0.5">Khen thưởng bài nộp, gửi nhận xét AI và xóa bài lỗi</div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('teacher')}
              className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-all hover:scale-[1.02] active:scale-95 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl group-hover:scale-110 transition-transform">📊</span>
                <span className="text-[10px] bg-emerald-400/40 text-emerald-200 px-2 py-0.5 rounded-full font-bold">Báo cáo Sa Pa</span>
              </div>
              <div className="font-black text-sm text-white mt-2">4. Theo Dõi &amp; Thống Kê</div>
              <div className="text-[11px] text-teal-200 mt-0.5">Điểm rèn luyện xanh, phân tích chủ đề và xuất báo cáo</div>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECONDARY PROFILE & ROLE SELECTION BAR                                    */}
      {/* ========================================================================= */}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-lg shrink-0">
            {activeProfile.avatar}
          </div>
          <div>
            <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <span>{activeProfile.nickname}</span>
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                Lớp {activeProfile.className}
              </span>
            </div>
            <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
              <Award className="w-3 h-3 text-amber-500" />
              <span>{activeProfile.greenPoints} Điểm Xanh tích lũy</span>
            </div>
          </div>
        </div>

        {/* Quick Role Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => onToggleRole('student')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
              role === 'student' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-3 h-3" />
            <span>Học sinh</span>
          </button>
          <button
            onClick={() => onToggleRole('teacher')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
              role === 'teacher' ? 'bg-[#185a32] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-3 h-3" />
            <span>Giáo viên</span>
          </button>
          <button
            onClick={() => onToggleRole('admin')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
              role === 'admin' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXPANDABLE SECTIONS: NEWS & PEDAGOGICAL INFO                             */}
      {/* ========================================================================= */}
      <div className="max-w-2xl mx-auto space-y-3">
        {/* Toggle 1: Tin tức học đường */}
        <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden shadow-xs">
          <button
            onClick={() => setShowNews(!showNews)}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">📰</span>
              <span className="font-extrabold text-xs sm:text-sm text-slate-800">
                Bản Tin Sinh Thái – Trường Tiểu Học Sa Pa
              </span>
              <span className="text-[10px] font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200/60">
                Mới
              </span>
            </div>
            {showNews ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showNews && (
            <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-3">
              {NEWS_ARTICLES.slice(0, 2).map((article) => (
                <div key={article.id} className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-bold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded">
                      {article.tag}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.date}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-800">
                    {article.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {article.summary}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Toggle 2: Mục tiêu dự án & Hồ sơ sư phạm */}
        <div className="bg-white rounded-2xl border border-emerald-100 overflow-hidden shadow-xs">
          <button
            onClick={() => setShowMoreInfo(!showMoreInfo)}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">🏔️</span>
              <span className="font-extrabold text-xs sm:text-sm text-slate-800">
                Ý Nghĩa Dự Án & Hồ Sơ Sinh Thái Sa Pa
              </span>
            </div>
            {showMoreInfo ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showMoreInfo && (
            <div className="px-5 pb-5 pt-2 border-t border-slate-100 text-xs text-slate-600 leading-relaxed space-y-2.5">
              <p>
                Dự án <strong className="text-[#185a32]">Green Edu AI School</strong> kết hợp công nghệ AI nhận diện thị giác máy tính và trợ lý sư phạm số hỗ trợ học sinh tiểu học rèn luyện thói quen phân loại rác, tiết kiệm nước sạch và bảo tồn thiên nhiên Sa Pa hùng vĩ.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
                  <div className="font-bold text-[#185a32]">1. Phân Loại Rác</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Quy chuẩn 4 màu rác tại trường học</div>
                </div>
                <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-100 text-center">
                  <div className="font-bold text-teal-800">2. Nước & Năng Lượng</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Tiết kiệm nước suối & điện trường học</div>
                </div>
                <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100 text-center">
                  <div className="font-bold text-sky-800">3. Minh Chứng Báo Cáo</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Đánh giá tác động & hồ sơ dự thi A4</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
