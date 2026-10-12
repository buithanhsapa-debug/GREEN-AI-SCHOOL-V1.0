import React, { useState } from 'react';
import { User, ShieldCheck, Award, LogOut, CheckCircle2, Lock, School, Key, Sparkles, BookOpen, ArrowLeft } from 'lucide-react';
import { authService, AuthUser } from '../services/authService';
import { playSound } from '../utils/audio';
import { NavTab } from '../types';

interface UserProfileViewProps {
  currentUser: AuthUser | null;
  onUserUpdated: (user: AuthUser) => void;
  onLogout: () => void;
  onOpenLogin: () => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'reward' | 'info' | 'error') => void;
  onNavigate?: (tab: NavTab) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  currentUser,
  onUserUpdated,
  onLogout,
  onOpenLogin,
  onShowToast,
  onNavigate,
}) => {
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '🌱');
  const [isSaving, setIsSaving] = useState(false);

  if (!currentUser) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center max-w-md mx-auto border border-emerald-100 shadow-sm space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto">
          🔒
        </div>
        <h3 className="font-extrabold text-lg text-slate-800">
          Chưa Đăng Nhập Tài Khoản
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Vui lòng đăng nhập bằng Mã học sinh (đối với học sinh) hoặc Email (đối với giáo viên / quản trị) để xem hồ sơ và phân quyền của bạn.
        </p>
        <button
          onClick={onOpenLogin}
          className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
        >
          Mở Cửa Sổ Đăng Nhập
        </button>
      </div>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    playSound('click');
    setIsSaving(true);
    try {
      const updated = await authService.updateProfile(displayName, avatar);
      onUserUpdated(updated);
      onShowToast('Thành công', 'Đã cập nhật hồ sơ người dùng!', 'success');
    } catch (err: any) {
      onShowToast('Lỗi cập nhật', err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const AVATAR_OPTIONS = ['🌱', '🐿️', '🕊️', '🐼', '⭐', '🦅', '👩‍🏫', '👨‍🏫', '👨‍💼', '🌸'];

  const roleBadge = () => {
    if (currentUser.role === 'admin') {
      return (
        <span className="bg-purple-100 text-purple-900 border border-purple-300 text-xs font-black px-3 py-1 rounded-full inline-flex items-center gap-1">
          <span>👑</span>
          <span>QUẢN TRỊ VIÊN NHÀ TRƯỜNG</span>
        </span>
      );
    }
    if (currentUser.role === 'teacher') {
      return (
        <span className="bg-teal-100 text-teal-900 border border-teal-300 text-xs font-black px-3 py-1 rounded-full inline-flex items-center gap-1">
          <span>👩‍🏫</span>
          <span>GIÁO VIÊN TIỂU HỌC</span>
        </span>
      );
    }
    return (
      <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black px-3 py-1 rounded-full inline-flex items-center gap-1">
        <span>🎒</span>
        <span>HỌC SINH SA PA</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hồ Sơ & Quyền Hạn Tài Khoản</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">
              Hồ Sơ Người Dùng Green Edu AI School
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Bảo mật phân tầng RBAC – Kiểm soát quyền truy cập chặt chẽ ở cả giao diện và máy chủ
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-extrabold text-xs border border-rose-200 transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng Xuất</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* User Card (5 cols) */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm text-center space-y-4">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-100 to-teal-100 border-2 border-emerald-200 text-5xl flex items-center justify-center mx-auto shadow-inner">
            {currentUser.avatar}
          </div>

          <div>
            <h3 className="font-black text-xl text-slate-800">
              {currentUser.displayName}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {currentUser.username}
            </p>
          </div>

          <div className="pt-1">{roleBadge()}</div>

          {/* Details list */}
          <div className="pt-3 border-t border-slate-100 text-xs text-left space-y-2">
            {currentUser.role === 'student' && (
              <>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Mã học sinh:</span>
                  <span className="font-mono font-bold text-emerald-800">{currentUser.username}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Lớp học:</span>
                  <span className="font-bold text-slate-700">Lớp {currentUser.className} (Khối {currentUser.grade})</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Bảo mật riêng tư:</span>
                  <span className="font-bold text-emerald-600">Được mã hóa</span>
                </div>
              </>
            )}

            {currentUser.role === 'teacher' && (
              <>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-400">Email công vụ:</span>
                  <span className="font-mono font-bold text-teal-800">{currentUser.username}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Lớp phân công:</span>
                  <span className="font-bold text-slate-700">{currentUser.assignedClasses?.join(', ') || 'Chưa phân công'}</span>
                </div>
              </>
            )}

            {currentUser.role === 'admin' && (
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-[11px] text-purple-900 leading-relaxed font-semibold">
                Toàn quyền quản trị hệ thống: Quản lý giáo viên, duyệt phân lớp, cấu hình nền tảng và xem báo cáo toàn diện.
              </div>
            )}
          </div>
        </div>

        {/* Security & Permissions Info + Profile Editor (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          {/* Security & Isolation Highlights */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-3">
            <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cơ Chế Phân Quyền & Bảo Vệ Dữ Liệu An Toàn</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 block">Cách ly dữ liệu học sinh (Data Isolation):</strong>
                  <span className="text-slate-500">Học sinh chỉ được phép xem bài tập, điểm số và nhật ký của chính mình. Máy chủ và Firebase Rules chặn tuyệt đối mọi hành vi xem dữ liệu của bạn khác.</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 block">Chống tự nâng quyền (Anti-Privilege Escalation):</strong>
                  <span className="text-slate-500">Thuộc tính vai trò (Role) được bảo vệ nghiêm ngặt ở tầng máy chủ, người dùng không thể tự sửa đổi quyền hạn.</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                <Key className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 block">Không lưu mật khẩu dạng văn bản (Hashed & Salted):</strong>
                  <span className="text-slate-500">Mật khẩu và mã PIN được mã hóa bằng thuật toán PBKDF2 và muối (Salt) ngẫu nhiên trước khi lưu trữ.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-4">
            <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Chỉnh Sửa Thông Tin Hiển Thị</span>
            </h4>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Họ Tên / Biệt Danh Hiển Thị:
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-100 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Chọn Biểu Tượng Đại Diện (Avatar):
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setAvatar(av)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                        avatar === av
                          ? 'bg-emerald-100 border-2 border-emerald-500 scale-110 shadow-xs'
                          : 'bg-slate-50 border border-slate-200 hover:bg-emerald-50'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving || !displayName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold shadow-md shadow-emerald-600/20 transition-all"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
