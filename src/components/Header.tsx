import React, { useState } from 'react';
import {
  Leaf,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Award,
  ChevronDown,
  Menu,
  X,
  Home,
  Bot,
  Gamepad2,
  Camera,
  MapPin,
  BookOpen,
  LayoutDashboard,
  ShieldCheck,
  User,
  LogIn,
  LogOut,
  Settings,
  Sparkles
} from 'lucide-react';
import { NavTab, StudentProfile, UserRole } from '../types';
import { AuthUser } from '../services/authService';
import { isSoundEnabled, setSoundEnabled, playSound } from '../utils/audio';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUser: AuthUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  activeProfile: StudentProfile;
  profiles: StudentProfile[];
  onSelectProfile: (profile: StudentProfile) => void;
  isOnline: boolean;
  onToggleRole?: (newRole: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenLogin,
  onLogout,
  activeProfile,
  profiles,
  onSelectProfile,
  isOnline,
  onToggleRole,
}) => {
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) {
      playSound('click');
    }
  };

  const handleTabClick = (tab: NavTab) => {
    playSound('click');
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  const userRole: UserRole = currentUser?.role || 'student';

  // Base navigation items for everyone - GREEN DASHBOARD is dedicated on top toolbar
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Trang chủ', icon: <Home className="w-4 h-4 text-emerald-600" /> },
    { id: 'ai', label: 'AI GREEN GUIDE', icon: <Bot className="w-4 h-4 text-emerald-600" /> },
    { id: 'scanner', label: 'GREEN VISION', icon: <Camera className="w-4 h-4 text-sky-500" /> },
    { id: 'game', label: 'GREEN GAME', icon: <Gamepad2 className="w-4 h-4 text-amber-500" /> },
    { id: 'map', label: 'GREEN MAP', icon: <MapPin className="w-4 h-4 text-teal-500" /> },
    { id: 'diary', label: 'GREEN ACTION', icon: <BookOpen className="w-4 h-4 text-emerald-500" /> },
    {
      id: 'teacher',
      label: 'GREEN DASHBOARD',
      icon: <LayoutDashboard className="w-4 h-4 text-teal-600" />,
      badge: userRole === 'teacher' || userRole === 'admin' ? 'Thầy cô' : undefined,
    },
  ];

  // RBAC: Only Admins get System Admin Tab
  if (userRole === 'admin') {
    navItems.push({
      id: 'admin',
      label: 'Quản trị BGH',
      icon: <ShieldCheck className="w-4 h-4 text-purple-600" />,
      badge: 'BGH',
    });
  }

  // Settings & Profile
  navItems.push({ id: 'settings', label: 'Cài đặt', icon: <Settings className="w-4 h-4 text-slate-500" /> });

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-emerald-100 text-xs px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium truncate">
            <span className="text-amber-300">🏔️</span>
            <span className="truncate">GREEN EDU AI SCHOOL – TRƯỜNG HỌC XANH, CÔNG DÂN SỐ XANH</span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Gemini AI Always Online badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-700/90 text-emerald-100 border border-emerald-500/60 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Gemini AI: Trực Tuyến</span>
            </div>

            {/* Role Switcher & Authenticated user status */}
            {onToggleRole && (
              <div className="hidden md:flex items-center gap-1 bg-black/20 p-0.5 rounded-full text-[10px] font-bold border border-white/10">
                <button
                  type="button"
                  onClick={() => onToggleRole('student')}
                  className={`px-2 py-0.5 rounded-full transition-all ${
                    userRole === 'student' ? 'bg-emerald-500 text-white shadow-2xs' : 'text-emerald-200 hover:text-white'
                  }`}
                  title="Chuyển sang vai trò Học sinh"
                >
                  🌱 Học sinh
                </button>
                <button
                  type="button"
                  onClick={() => onToggleRole('teacher')}
                  className={`px-2 py-0.5 rounded-full transition-all ${
                    userRole === 'teacher' ? 'bg-teal-500 text-white shadow-2xs' : 'text-emerald-200 hover:text-white'
                  }`}
                  title="Chuyển sang vai trò Giáo viên"
                >
                  👩‍🏫 Giáo viên
                </button>
                <button
                  type="button"
                  onClick={() => onToggleRole('admin')}
                  className={`px-2 py-0.5 rounded-full transition-all ${
                    userRole === 'admin' ? 'bg-purple-600 text-white shadow-2xs' : 'text-emerald-200 hover:text-white'
                  }`}
                  title="Chuyển sang vai trò Ban Giám Hiệu (BGH)"
                >
                  👑 BGH (Admin)
                </button>
              </div>
            )}

            {/* Authenticated user role pill */}
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  currentUser.role === 'admin'
                    ? 'bg-purple-600 text-white'
                    : currentUser.role === 'teacher'
                    ? 'bg-teal-500 text-white'
                    : 'bg-emerald-500 text-white'
                }`}>
                  {currentUser.role === 'admin' ? '👑 Ban Giám Hiệu' : currentUser.role === 'teacher' ? '👩‍🏫 Giáo Viên' : '🎒 Học Sinh'}
                </span>
                <button
                  onClick={() => handleTabClick('profile')}
                  className="hidden sm:inline-block text-emerald-200 hover:text-white underline text-[11px] font-semibold"
                >
                  {currentUser.displayName}
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-900 px-3 py-0.5 rounded-full text-xs font-black shadow-xs transition-colors"
              >
                <LogIn className="w-3 h-3" />
                <span>Đăng Nhập</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Logo */}
        <button
          onClick={() => handleTabClick('home')}
          className="flex items-center gap-2.5 text-left group shrink-0"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-sky-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg text-emerald-900 tracking-tight">
                Green Edu AI School
              </span>
              <span className="hidden sm:inline-block bg-sky-100 text-sky-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md">
                Tiểu học
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold tracking-wide hidden sm:block">
              Trường Học Xanh – Công Dân Số Xanh
            </p>
          </div>
        </button>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-1 bg-emerald-50/80 p-1 rounded-2xl border border-emerald-100/80">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
                currentTab === item.id
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-100/50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span className="bg-sky-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* STANDALONE DEDICATED GREEN DASHBOARD ON TOP TOOLBAR */}
        <button
          onClick={() => handleTabClick('teacher')}
          className={`hidden md:flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black transition-all shadow-sm border ${
            currentTab === 'teacher'
              ? 'bg-[#185a32] text-white border-[#185a32] ring-2 ring-emerald-400/40 shadow-emerald-900/20 scale-105'
              : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white border-teal-600 hover:scale-105'
          }`}
          title="Xem Bảng Thống Kê & Báo Cáo Sinh Thái GREEN DASHBOARD"
        >
          <LayoutDashboard className="w-4 h-4 text-amber-300 animate-pulse" />
          <span className="tracking-wide">GREEN DASHBOARD</span>
          <span className="bg-amber-400 text-slate-900 text-[9px] px-1.5 py-0.5 rounded-full font-black">
            Báo cáo
          </span>
        </button>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Sound toggle */}
          <button
            onClick={toggleSound}
            title={soundOn ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh vui nhộn'}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* User Account / Profile Button */}
          {currentUser ? (
            <button
              onClick={() => handleTabClick('profile')}
              title="Xem trang hồ sơ người dùng"
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all ${
                currentTab === 'profile'
                  ? 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-400/20'
                  : 'bg-slate-50 border-slate-200 hover:bg-emerald-50'
              }`}
            >
              <span className="text-xl leading-none">{currentUser.avatar}</span>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-black text-slate-800 truncate max-w-[120px]">
                  {currentUser.displayName}
                </div>
                <div className="text-[10px] font-bold text-emerald-700">
                  {currentUser.role === 'admin' ? 'Quản trị' : currentUser.role === 'teacher' ? 'Giáo viên' : `Mã: ${currentUser.username}`}
                </div>
              </div>
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-xs transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng Nhập</span>
            </button>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl border border-emerald-200 text-emerald-800 hover:bg-emerald-50 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-emerald-100 px-4 py-3 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex items-center gap-2 p-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
                  currentTab === item.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-100'
                }`}
              >
                <div className={`p-1.5 rounded-xl ${currentTab === item.id ? 'bg-white/20 text-white' : 'bg-white'}`}>
                  {item.icon}
                </div>
                <div className="flex-1 truncate">
                  <div className="font-extrabold">{item.label}</div>
                  {item.badge && (
                    <span className="text-[9px] text-sky-600 font-bold bg-sky-50 px-1 rounded">
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            ))}

            {/* Profile Tab in mobile */}
            {currentUser && (
              <button
                onClick={() => handleTabClick('profile')}
                className={`col-span-2 flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold border transition-all ${
                  currentTab === 'profile'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Hồ Sơ: {currentUser.displayName} ({currentUser.role})</span>
                </span>
                <span className="text-[10px] underline">Chi tiết</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
