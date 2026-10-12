/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActivityRecord, NavTab, StudentProfile, UserRole } from './types';
import { storageService } from './services/storageService';
import { aiService } from './services/aiService';
import { authService, AuthUser } from './services/authService';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { AiAssistantView } from './components/AiAssistantView';
import { GreenGameHubView } from './components/GreenGameHubView';
import { WasteScannerView } from './components/WasteScannerView';
import { GreenMapView } from './components/GreenMapView';
import { GreenDiaryView } from './components/GreenDiaryView';
import { TeacherDashboardView } from './components/TeacherDashboardView';
import { AdminManagementView } from './components/AdminManagementView';
import { UserProfileView } from './components/UserProfileView';
import { SettingsView } from './components/SettingsView';
import { OfflineNotice } from './components/OfflineNotice';
import { LoginModal } from './components/LoginModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Leaf, ShieldCheck, Heart, ArrowLeft, Lock } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(authService.getUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<StudentProfile | null>(null);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Show Toast Helper
  const showToast = (title: string, description?: string, type: 'success' | 'reward' | 'info' | 'error' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    setToasts(prev => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Initialize data on mount
  useEffect(() => {
    const loadedProfiles = storageService.getProfiles();
    const active = storageService.getActiveProfile();
    const loadedActivities = storageService.getActivities();

    setProfiles(loadedProfiles);
    setActiveProfile(active);
    setActivities(loadedActivities);

    // Check existing auth session
    authService.checkCurrentSession().then(user => {
      if (user) {
        setCurrentUser(user);
        syncActiveStudentWithUser(user, loadedProfiles);
      }
    });

    // Online/Offline detection
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Đã kết nối Internet', 'Hệ thống đã chuyển sang chế độ trực tuyến.', 'info');
    };
    const handleOffline = () => {
      // Re-verify server status before flagging offline
      aiService.checkServerStatus().then(status => {
        if (!status.isOnline) {
          setIsOnline(false);
          showToast('Đang chạy Ngoại tuyến', 'Các trò chơi và bài tập tiếp tục hoạt động từ bộ nhớ đệm.', 'info');
        }
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check - keep online
    aiService.checkServerStatus().then(status => {
      setIsOnline(status.isOnline);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncActiveStudentWithUser = (user: AuthUser, allProfiles: StudentProfile[]) => {
    if (user.role === 'student') {
      const match = allProfiles.find(p => p.id === user.id || p.nickname.toLowerCase() === user.displayName.toLowerCase());
      if (match) {
        storageService.setActiveProfile(match.id);
        setActiveProfile(match);
      }
    }
  };

  // Route selector with Strict RBAC Guards
  const handleSelectTab = (tab: NavTab) => {
    const role = currentUser?.role || 'student';

    // Strict Guard: Admin Only
    if (tab === 'admin') {
      if (role !== 'admin') {
        showToast('Truy cập trái phép!', 'Chức năng Quản Trị chỉ dành riêng cho Ban Giám Hiệu nhà trường.', 'error');
        return;
      }
    }

    // Strict Guard: Teacher & Admin Only
    if (tab === 'teacher') {
      if (role !== 'teacher' && role !== 'admin') {
        showToast('Giới hạn quyền hạn', 'Trang Quản Lý Lớp Học chỉ dành riêng cho Thầy Cô Giáo.', 'error');
        return;
      }
    }

    setCurrentTab(tab);
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    const loadedProfiles = storageService.getProfiles();
    syncActiveStudentWithUser(user, loadedProfiles);

    if (user.role === 'admin') {
      setCurrentTab('admin');
    } else if (user.role === 'teacher') {
      setCurrentTab('teacher');
    } else {
      setCurrentTab('home');
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setCurrentTab('home');
    showToast('Đã đăng xuất', 'Bạn đã đăng xuất khỏi hệ thống Green Edu AI School an toàn.', 'info');
  };

  const handleProfileUpdated = (updated: StudentProfile) => {
    setActiveProfile(updated);
    setProfiles(storageService.getProfiles());
    setActivities(storageService.getActivities());
  };

  // Seamless Role Switching for Teachers, Admin, and Students
  const handleToggleRole = (newRole: UserRole) => {
    if (newRole === 'admin') {
      const all35Classes = [
        '1A1', '1A2', '1A3', '1A4', '1A5', '1A6', '1A7',
        '2A1', '2A2', '2A3', '2A4', '2A5', '2A6', '2A7',
        '3A1', '3A2', '3A3', '3A4', '3A5', '3A6', '3A7',
        '4A1', '4A2', '4A3', '4A4', '4A5', '4A6', '4A7',
        '5A1', '5A2', '5A3', '5A4', '5A5', '5A6', '5A7',
      ];
      const adminUser: AuthUser = {
        id: 'user-admin-buithanh',
        username: 'buithanhsapa',
        role: 'admin',
        displayName: 'Thầy Bùi Xuân Thành – Cán bộ quản lý & Quản trị viên',
        avatar: '👨‍💼',
        assignedClasses: all35Classes,
        createdAt: Date.now(),
      };
      setCurrentUser(adminUser);
      showToast('Đã kích hoạt vai trò: Cán bộ quản lý & Quản trị viên 👑', 'Chào mừng Thầy Bùi Xuân Thành! Toàn quyền quản trị hệ thống 35 lớp học.', 'success');
    } else if (newRole === 'teacher') {
      const all35Classes = [
        '1A1', '1A2', '1A3', '1A4', '1A5', '1A6', '1A7',
        '2A1', '2A2', '2A3', '2A4', '2A5', '2A6', '2A7',
        '3A1', '3A2', '3A3', '3A4', '3A5', '3A6', '3A7',
        '4A1', '4A2', '4A3', '4A4', '4A5', '4A6', '4A7',
        '5A1', '5A2', '5A3', '5A4', '5A5', '5A6', '5A7',
      ];
      const teacherUser: AuthUser = {
        id: 'user-teacher-kimhoa',
        username: 'kimhoa.gv@sapa.edu.vn',
        role: 'teacher',
        displayName: 'Cô Hoàng Thị Kim Hoa',
        avatar: '👩‍🏫',
        assignedClasses: all35Classes,
        createdAt: Date.now(),
      };
      setCurrentUser(teacherUser);
      showToast('Đã kích hoạt vai trò: Giáo Viên 👩‍🏫', 'Chào mừng Cô Hoàng Thị Kim Hoa! Quyền quản trị 35 lớp học.', 'success');
    } else {
      const currentProfile = activeProfile || storageService.getActiveProfile();
      const studentUser: AuthUser = {
        id: currentProfile ? currentProfile.id : 'default-student',
        username: currentProfile ? `SPA-${currentProfile.className}-01` : 'SPA-3A1-01',
        role: 'student',
        displayName: currentProfile ? currentProfile.nickname : 'Bé Mầm Xanh',
        className: currentProfile ? currentProfile.className : '3A1',
        grade: currentProfile ? currentProfile.grade : 3,
        avatar: currentProfile ? currentProfile.avatar : '🌱',
        createdAt: Date.now(),
        isStudentCodeLogin: true,
      };
      setCurrentUser(studentUser);
      showToast('Đã chuyển sang vai trò: Học Sinh 🌱', `Đang tham gia dưới tên bạn ${studentUser.displayName}`, 'info');
    }
  };

  const handleSelectProfile = (profile: StudentProfile) => {
    const selected = storageService.setActiveProfile(profile.id);
    setActiveProfile(selected);
    showToast(`Đã chọn học sinh ${selected.nickname}`, `Lớp ${selected.className} • ${selected.greenPoints} Điểm Xanh`, 'info');
  };

  const handleRefreshData = () => {
    setProfiles(storageService.getProfiles());
    setActiveProfile(storageService.getActiveProfile());
    setActivities(storageService.getActivities());
  };

  if (!activeProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
          <p className="font-bold text-emerald-800 text-sm">Đang tải Green Edu AI School...</p>
        </div>
      </div>
    );
  }

  const handleReconnect = async () => {
    await aiService.checkServerStatus();
    setIsOnline(true);
    showToast('Đã kết nối trực tuyến', 'Hệ thống Green Edu AI School đang hoạt động trực tuyến!', 'success');
  };

  return (
    <div className="min-h-screen flex flex-col bg-emerald-50/30">
      {/* Offline Alert Strip */}
      <OfflineNotice isOnline={isOnline} onReconnect={handleReconnect} />

      {/* Main App Navigation Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        activeProfile={activeProfile}
        profiles={profiles}
        onSelectProfile={handleSelectProfile}
        isOnline={isOnline}
        onToggleRole={handleToggleRole}
      />

      {/* Main View Router with RBAC */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-12">
        {currentTab === 'home' && (
          <HomeView
            activeProfile={activeProfile}
            onNavigate={handleSelectTab}
            role={currentUser?.role || 'student'}
            onToggleRole={handleToggleRole}
          />
        )}

        {currentTab === 'ai' && (
          <AiAssistantView
            activeProfile={activeProfile}
            onProfileUpdated={handleProfileUpdated}
            isOnline={isOnline}
            currentUser={currentUser}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'game' && (
          <GreenGameHubView
            activeProfile={activeProfile}
            onProfileUpdated={handleProfileUpdated}
            currentUser={currentUser}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'scanner' && (
          <WasteScannerView
            activeProfile={activeProfile}
            onProfileUpdated={handleProfileUpdated}
            onShowToast={showToast}
            currentUser={currentUser}
            isOnline={isOnline}
          />
        )}

        {currentTab === 'map' && (
          <GreenMapView
            activeProfile={activeProfile}
            onProfileUpdated={handleProfileUpdated}
            onShowToast={showToast}
            currentUser={currentUser}
            onNavigate={handleSelectTab}
            isOnline={isOnline}
          />
        )}

        {currentTab === 'diary' && (
          <GreenDiaryView
            activeProfile={activeProfile}
            onProfileUpdated={handleProfileUpdated}
            onShowToast={showToast}
            currentUser={currentUser}
            onNavigate={handleSelectTab}
            isOnline={isOnline}
          />
        )}

        {/* Protected: Teacher & Admin */}
        {currentTab === 'teacher' && (
          (currentUser?.role === 'teacher' || currentUser?.role === 'admin') ? (
            <TeacherDashboardView
              profiles={profiles}
              activities={activities}
              onRefresh={handleRefreshData}
              onShowToast={showToast}
              onNavigate={handleSelectTab}
              currentUser={currentUser}
              isOnline={isOnline}
            />
          ) : (
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto border border-teal-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSelectTab('home')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 font-extrabold text-xs transition-colors shrink-0"
                    title="Quay lại trang chủ"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Quay lại</span>
                  </button>
                  <div>
                    <span className="text-xs font-black text-teal-800 bg-teal-100 px-3 py-0.5 rounded-full uppercase">
                      GREEN DASHBOARD
                    </span>
                    <h3 className="font-black text-xl text-slate-800 mt-1">
                      Bảng Điều Khiển Môi Trường Trường Học Sa Pa
                    </h3>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center text-xl font-bold">
                  📊
                </div>
              </div>

              {/* Schoolwide Impact Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="text-2xl font-black text-emerald-700">
                    {profiles.reduce((acc, p) => acc + (p.greenPoints || 0), 0)}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-900 mt-0.5">Điểm Xanh Toàn Trường</div>
                </div>
                <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100">
                  <div className="text-2xl font-black text-sky-700">
                    {activities.filter(a => a.activityType === 'waste_scan').length}
                  </div>
                  <div className="text-[11px] font-bold text-sky-900 mt-0.5">Lượt Quét Rác AI</div>
                </div>
                <div className="p-3 bg-teal-50 rounded-2xl border border-teal-100">
                  <div className="text-2xl font-black text-teal-700">
                    {activities.filter(a => a.activityType === 'green_action').length}
                  </div>
                  <div className="text-[11px] font-bold text-teal-900 mt-0.5">Hành Động Xanh</div>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                  <div className="text-2xl font-black text-amber-700">
                    {profiles.length}
                  </div>
                  <div className="text-[11px] font-bold text-amber-900 mt-0.5">Học Sinh Nhí</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                Khu vực quản lý sư phạm chuyên sâu (giao bài tập, cấp mã học sinh, đánh giá rèn luyện và xuất báo cáo PDF/Excel) dành riêng cho thầy cô giáo và ban giám hiệu nhà trường.
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-700 hover:bg-teal-600 text-white font-black text-xs shadow-md shadow-teal-700/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <Lock className="w-4 h-4" />
                  <span>Đăng Nhập Thầy Cô Giáo</span>
                </button>
                <button
                  onClick={() => handleSelectTab('home')}
                  className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Về Trang Chủ
                </button>
              </div>
            </div>
          )
        )}

        {/* Protected: Admin Only */}
        {currentTab === 'admin' && (
          currentUser?.role === 'admin' ? (
            <AdminManagementView
              currentUser={currentUser}
              onShowToast={showToast}
              onNavigate={handleSelectTab}
              onRefreshAllData={handleRefreshData}
            />
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center max-w-md mx-auto border border-rose-200 shadow-sm space-y-4">
              <div className="text-4xl">🚫</div>
              <h3 className="font-extrabold text-lg text-slate-800">Truy Cập Bị Từ Chối</h3>
              <p className="text-xs text-slate-500">Chức năng này được bảo vệ nghiêm ngặt chỉ dành riêng cho Quản Trị Viên nhà trường.</p>
              <button
                onClick={() => setCurrentTab('home')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                Về Trang Chủ
              </button>
            </div>
          )
        )}

        {/* User Profile Page */}
        {currentTab === 'profile' && (
          <UserProfileView
            currentUser={currentUser}
            onUserUpdated={setCurrentUser}
            onLogout={handleLogout}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onShowToast={showToast}
            onNavigate={handleSelectTab}
          />
        )}

        {/* Platform Settings */}
        {currentTab === 'settings' && (
          <SettingsView
            activeProfile={activeProfile}
            onProfileUpdated={handleProfileUpdated}
            onShowToast={showToast}
            onRefreshAllData={handleRefreshData}
            onNavigate={handleSelectTab}
          />
        )}
      </main>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onShowToast={showToast}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Footer */}
      <footer className="bg-white border-t border-emerald-100 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5" />
            </div>
            <span>Green Edu AI School – Trường Học Xanh, Công Dân Số Xanh</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Bảo mật phân tầng RBAC & Cách ly dữ liệu học sinh
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              Dành tặng thầy cô & học sinh Sa Pa
            </span>
          </div>
        </div>

        {/* Dòng dưới cùng của phần mềm */}
        <div className="border-t border-emerald-200/70 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 py-3 text-center">
          <p className="text-xs sm:text-sm font-bold text-emerald-900 tracking-wide">
            Thiết kế Bởi: Thầy: Bùi Xuân Thành - Trường Tiểu học Sa Pa
          </p>
        </div>
      </footer>
    </div>
  );
}
