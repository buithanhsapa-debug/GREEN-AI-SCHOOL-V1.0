import React, { useState } from 'react';
import { LogIn, Key, User, ShieldCheck, Sparkles, AlertCircle, CheckCircle2, Lock, School, Search } from 'lucide-react';
import { authService, AuthUser } from '../services/authService';
import { OFFICIAL_TEACHERS_LIST } from '../data/teachersData';
import { playSound } from '../utils/audio';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'reward' | 'info' | 'error') => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onShowToast,
}) => {
  const [tab, setTab] = useState<'student' | 'staff'>('student');
  const [studentCode, setStudentCode] = useState('');
  const [studentPin, setStudentPin] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const { user } = await authService.login(studentCode, studentPin, 'student');
      playSound('combo');
      onLoginSuccess(user);
      onShowToast('Đăng nhập thành công! 🌱', `Chào mừng bạn ${user.displayName} (Lớp ${user.className})!`, 'success');
      onClose();
    } catch (err: any) {
      playSound('wrong');
      setErrorMessage(err.message || 'Mã học sinh hoặc mã PIN chưa chính xác.');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const { user } = await authService.login(staffEmail, staffPassword, 'standard');
      playSound('victory');
      onLoginSuccess(user);
      onShowToast('Đăng nhập thành công! 👩‍🏫', `Chào mừng ${user.displayName} (${user.role === 'admin' ? 'Quản trị viên' : 'Giáo viên'})!`, 'success');
      onClose();
    } catch (err: any) {
      playSound('wrong');
      setErrorMessage(err.message || 'Email hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickStudent = (code: string, pin: string) => {
    playSound('click');
    setStudentCode(code);
    setStudentPin(pin);
    setErrorMessage(null);
  };

  const fillQuickStaff = (email: string, pass: string) => {
    playSound('click');
    setStaffEmail(email);
    setStaffPassword(pass);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-emerald-100 space-y-5 animate-in zoom-in-95 duration-150 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20 text-2xl">
            🌱
          </div>
          <h3 className="font-extrabold text-xl text-slate-800">
            Đăng Nhập Green Edu AI School
          </h3>
          <p className="text-xs text-slate-500">
            Hệ thống phân quyền: Học Sinh • Giáo Viên • Quản Trị Viên
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setTab('student');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
              tab === 'student'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🎒 Học Sinh (Mã Code)
          </button>
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setTab('staff');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all ${
              tab === 'staff'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            👩‍🏫 Thầy Cô & Quản Trị
          </button>
        </div>

        {/* Error banner */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: STUDENT LOGIN FORM */}
        {tab === 'student' && (
          <form onSubmit={handleStudentLogin} className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-emerald-900 leading-relaxed text-[11px]">
              🔒 <strong>Thân thiện & Bảo mật:</strong> Học sinh tiểu học <strong>không cần email</strong>. Các em đăng nhập bằng Mã học sinh và mã PIN 4 số do thầy cô giáo cấp.
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Mã Học Sinh (Do giáo viên cấp):
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: SPA-3A1-01"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                className="w-full bg-slate-100 uppercase tracking-wide font-black text-slate-800 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Mã PIN 4 Số Bí Mật:
              </label>
              <input
                type="password"
                required
                maxLength={8}
                placeholder="••••"
                value={studentPin}
                onChange={(e) => setStudentPin(e.target.value)}
                className="w-full bg-slate-100 font-black tracking-widest text-slate-800 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 text-xs"
              />
            </div>

            {/* Quick test chips */}
            <div className="pt-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                Chọn tài khoản mẫu để thử nghiệm nhanh:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => fillQuickStudent('SPA-3A1-01', '1234')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100/70 hover:bg-emerald-200 text-emerald-900 text-[11px] font-bold border border-emerald-200 transition-colors"
                >
                  🌱 Bé Mầm Xanh (3A1)
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickStudent('SPA-3A1-02', '2345')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold border border-slate-200 transition-colors"
                >
                  🐿️ Sóc Nâu (3A1)
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickStudent('SPA-5A1-01', '5678')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold border border-slate-200 transition-colors"
                >
                  🦅 Đại Bàng (5A1)
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !studentCode.trim() || !studentPin.trim()}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold shadow-md shadow-emerald-600/20 text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập Học Sinh'}</span>
            </button>
          </form>
        )}

        {/* TAB 2: STAFF (TEACHER & ADMIN) LOGIN FORM */}
        {tab === 'staff' && (
          <form onSubmit={handleStaffLogin} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Tài Khoản / Email (Ban Giám Hiệu &amp; Thầy Cô):
              </label>
              <input
                type="text"
                required
                placeholder="VD: buithanhsapa hoặc kimhoa.gv@sapa.edu.vn"
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                className="w-full bg-slate-100 text-slate-800 font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Mật Khẩu Tài Khoản:
              </label>
              <input
                type="password"
                required
                placeholder="Mật khẩu bảo mật..."
                value={staffPassword}
                onChange={(e) => setStaffPassword(e.target.value)}
                className="w-full bg-slate-100 text-slate-800 font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 text-xs"
              />
            </div>

            {/* Quick test chips & 35 Teachers Dropdown */}
            <div className="pt-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  Chọn nhanh tài khoản thầy cô &amp; Quản trị viên:
                </span>
                <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full">
                  35 GV &amp; Thầy Bùi Xuân Thành
                </span>
              </div>

              {/* Select from 35 teachers & admin */}
              <div className="relative">
                <select
                  aria-label="Chọn tài khoản giáo viên"
                  onChange={(e) => {
                    const selId = e.target.value;
                    if (!selId) return;
                    const teacher = OFFICIAL_TEACHERS_LIST.find(t => t.id === selId);
                    if (teacher) {
                      const pass = teacher.role === 'admin' 
                        ? (teacher.email === 'buithanhsapa' ? 'buithanhsapa' : 'Admin@123')
                        : 'GiaoVien@123';
                      fillQuickStaff(teacher.email, pass);
                    }
                  }}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold py-2 px-3 rounded-xl focus:outline-hidden focus:border-teal-600 cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>-- 📋 Chọn nhanh 35 Giáo Viên &amp; Thầy Bùi Xuân Thành --</option>
                  <optgroup label="👑 Cán Bộ Quản Lý &amp; Quản Trị Viên">
                    {OFFICIAL_TEACHERS_LIST.filter(t => t.role === 'admin').map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} – {t.title} ({t.email})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="👩‍🏫 35 Giáo Viên Chủ Nhiệm (Lớp 1A1 - 5A7)">
                    {OFFICIAL_TEACHERS_LIST.filter(t => t.role === 'teacher').map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} – {t.title} ({t.email})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => fillQuickStaff('buithanhsapa', 'buithanhsapa')}
                  className="w-full text-left p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-[11px] font-bold transition-all flex items-center justify-between shadow-2xs cursor-pointer group"
                >
                  <span className="flex items-center gap-1.5">
                    <span>👑 Thầy Bùi Xuân Thành (Quản trị viên &amp; Ban Giám Hiệu)</span>
                  </span>
                  <span className="font-mono text-[10px] bg-purple-200/80 px-2 py-0.5 rounded text-purple-950 font-bold">
                    buithanhsapa / buithanhsapa
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => fillQuickStaff('kimhoa.gv@sapa.edu.vn', 'GiaoVien@123')}
                  className="w-full text-left p-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-[11px] font-bold transition-all flex items-center justify-between shadow-2xs cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <span>👩‍🏫 Giáo Viên Mặc Định (Cô Hoàng Thị Kim Hoa)</span>
                  </span>
                  <span className="opacity-80 font-mono text-[10px] bg-teal-200/80 px-2 py-0.5 rounded text-teal-950 font-bold">
                    kimhoa.gv@sapa.edu.vn
                  </span>
                </button>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500 leading-tight">
                💡 <span className="font-semibold text-slate-700">Ghi chú mật khẩu:</span> Mật khẩu giáo viên là <code className="bg-slate-200 px-1 rounded font-bold text-slate-800">GiaoVien@123</code> (hoặc số điện thoại của thầy cô). Ban Giám Hiệu dùng <code className="bg-slate-200 px-1 rounded font-bold text-slate-800">Admin@123</code>.
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !staffEmail.trim() || !staffPassword.trim()}
              className="w-full py-3 rounded-2xl bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white font-extrabold shadow-md shadow-teal-700/20 text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập Thầy Cô & Quản Trị'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
