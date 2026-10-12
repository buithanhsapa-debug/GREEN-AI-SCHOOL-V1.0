import React, { useState } from 'react';
import { Settings, Volume2, VolumeX, Mic, School, ShieldCheck, RefreshCw, Award, CheckCircle2, User, ArrowLeft } from 'lucide-react';
import { StudentProfile, NavTab } from '../types';
import { storageService, AppSettings } from '../services/storageService';
import { isSoundEnabled, setSoundEnabled, playSound } from '../utils/audio';

interface SettingsViewProps {
  activeProfile: StudentProfile;
  onProfileUpdated: (updated: StudentProfile) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'reward' | 'info' | 'error') => void;
  onRefreshAllData: () => void;
  onNavigate?: (tab: NavTab) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  activeProfile,
  onProfileUpdated,
  onShowToast,
  onRefreshAllData,
  onNavigate,
}) => {
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled());
  const [avatarInput, setAvatarInput] = useState<string>(activeProfile.avatar);
  const [nicknameInput, setNicknameInput] = useState<string>(activeProfile.nickname);

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    const updated = { ...settings, soundEnabled: next };
    setSettings(updated);
    storageService.saveSettings(updated);
    if (next) playSound('click');
    onShowToast('Cài đặt âm thanh', next ? 'Đã bật hiệu ứng âm thanh' : 'Đã tắt hiệu ứng âm thanh', 'info');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicknameInput.trim()) return;

    playSound('click');
    const updated: StudentProfile = {
      ...activeProfile,
      nickname: nicknameInput.trim(),
      avatar: avatarInput,
    };

    storageService.saveProfile(updated);
    onProfileUpdated(updated);
    onShowToast('Thành công', 'Đã cập nhật biệt danh và biểu tượng học sinh!', 'success');
  };

  const handleResetData = () => {
    if (confirm('Bạn có chắc chắn muốn đặt lại dữ liệu mẫu về mặc định ban đầu không?')) {
      playSound('click');
      storageService.resetAll();
      onRefreshAllData();
      onShowToast('Đã đặt lại dữ liệu', 'Toàn bộ dữ liệu mẫu đã được khôi phục nguyên bản.', 'info');
    }
  };

  const AVATAR_OPTIONS = ['🌱', '🐿️', '🕊️', '🐼', '⭐', '🦅', '🦊', '🌸', '🌲', '🦁'];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm flex items-center justify-between gap-4">
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
            <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
              <Settings className="w-3.5 h-3.5 text-slate-600" />
              <span>Tùy Chỉnh Ứng Dụng</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">
              Cài Đặt & Cấu Hình Hệ Thống
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Thiết lập âm thanh, giọng đọc trợ lý AI và thông tin học tập của em
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card & Avatar Customizer */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            <span>Hồ Sơ Học Tập Của Em</span>
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">
                Chọn Biểu Tượng Đại Diện:
              </label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setAvatarInput(av)}
                    className={`w-10 h-10 rounded-2xl text-xl flex items-center justify-center transition-all ${
                      avatarInput === av
                        ? 'bg-emerald-100 border-2 border-emerald-500 scale-110 shadow-xs'
                        : 'bg-slate-50 border border-slate-200 hover:bg-emerald-50'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Biệt Danh Học Tập (Bảo vệ quyền riêng tư):
              </label>
              <input
                type="text"
                required
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                className="w-full bg-slate-100 text-slate-800 font-bold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-emerald-900 font-semibold">
              <span>Lớp học: <strong>Lớp {activeProfile.className}</strong></span>
              <span className="text-amber-700 font-bold">{activeProfile.greenPoints} Điểm Xanh</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-md shadow-emerald-600/20 transition-all"
            >
              Lưu Thay Đổi Hồ Sơ
            </button>
          </form>
        </div>

        {/* Audio & Accessibility Settings */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-600" />
            <span>Âm Thanh & Giọng Đọc Trợ Lý AI</span>
          </h3>

          <div className="space-y-4 text-xs">
            {/* Sound toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div>
                <strong className="text-slate-800 block">Hiệu ứng âm thanh trò chơi</strong>
                <span className="text-slate-500 text-[11px]">Tiếng chuông chúc mừng, combo và âm thanh vui nhộn</span>
              </div>
              <button
                type="button"
                onClick={handleToggleSound}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  soundOn ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    soundOn ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* School Info Box */}
            <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 space-y-1 text-teal-950">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <School className="w-4 h-4 text-teal-700" />
                <span>Đơn vị triển khai dự án:</span>
              </div>
              <p className="text-xs font-extrabold">Trường Tiểu Học Sa Pa</p>
              <p className="text-[11px] text-teal-800">Thị xã Sa Pa, Tỉnh Lào Cai – Việt Nam</p>
            </div>

            {/* Privacy notice */}
            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 space-y-1 text-sky-950">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-sky-700" />
                <span>An Toàn & Bảo Mật Dữ Liệu:</span>
              </div>
              <p className="text-[11px] text-sky-900 leading-relaxed">
                Nền tảng không yêu cầu thông tin nhạy cảm của học sinh. Toàn bộ tính toán được xử lý an toàn với mô hình trí tuệ nhân tạo giáo dục.
              </p>
            </div>

            {/* Reset sample data */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetData}
                className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Đặt Lại Dữ Liệu Mẫu Kiểm Thử</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
