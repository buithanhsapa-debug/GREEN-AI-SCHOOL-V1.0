import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Plus,
  Award,
  BookOpen,
  Settings,
  AlertTriangle,
  CheckCircle2,
  School,
  Trash2,
  Key,
  ArrowLeft,
  Edit2,
  Search,
  Filter,
  RefreshCw,
  Lock,
  Sparkles,
  FileText,
  Copy,
  Phone,
  Check,
  Download
} from 'lucide-react';
import { AuthUser, authService } from '../services/authService';
import { storageService } from '../services/storageService';
import { GreenAction, NavTab, SchoolClass, StudentProfile, TeacherAccount } from '../types';
import { playSound } from '../utils/audio';
import { BulkStudentGeneratorModal } from './teacher/BulkStudentGeneratorModal';

interface AdminManagementViewProps {
  currentUser: AuthUser;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'reward' | 'info' | 'error') => void;
  onNavigate?: (tab: NavTab) => void;
  onRefreshAllData?: () => void;
}

export const AdminManagementView: React.FC<AdminManagementViewProps> = ({
  currentUser,
  onShowToast,
  onNavigate,
  onRefreshAllData,
}) => {
  const [activeTab, setActiveTab] = useState<'teachers' | 'students' | 'actions' | 'classes' | 'system'>('teachers');

  // Stores state
  const [teachers, setTeachers] = useState<TeacherAccount[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [actions, setActions] = useState<GreenAction[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);

  // Search & filter
  const [searchTeacher, setSearchTeacher] = useState('');
  const [filterTeacherPosition, setFilterTeacherPosition] = useState('ALL');
  const [filterTeacherGrade, setFilterTeacherGrade] = useState('ALL');
  const [copiedTeacherId, setCopiedTeacherId] = useState<string | null>(null);
  const [searchStudent, setSearchStudent] = useState('');
  const [filterStudentClass, setFilterStudentClass] = useState('ALL');
  const [filterActionTopic, setFilterActionTopic] = useState('ALL');

  // Modal: Add Teacher
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newClasses, setNewClasses] = useState('3A1');
  const [newPassword, setNewPassword] = useState('GiaoVien@123');

  // Modal: Edit Teacher
  const [editingTeacher, setEditingTeacher] = useState<TeacherAccount | null>(null);
  const [editTeacherName, setEditTeacherName] = useState('');
  const [editTeacherClasses, setEditTeacherClasses] = useState('');
  const [editTeacherPassword, setEditTeacherPassword] = useState('');

  // Modal: Add Student
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentNickname, setNewStudentNickname] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('3A1');
  const [newStudentGrade, setNewStudentGrade] = useState(3);
  const [newStudentPin, setNewStudentPin] = useState('1234');

  // Modal: Edit Student
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [editStudentNickname, setEditStudentNickname] = useState('');
  const [editStudentClass, setEditStudentClass] = useState('');
  const [editStudentGrade, setEditStudentGrade] = useState(3);
  const [editStudentPoints, setEditStudentPoints] = useState(0);

  // Modal: Edit Action / Post
  const [editingAction, setEditingAction] = useState<GreenAction | null>(null);
  const [editActionTitle, setEditActionTitle] = useState('');
  const [editActionDesc, setEditActionDesc] = useState('');
  const [editActionPoints, setEditActionPoints] = useState(30);
  const [editActionStatus, setEditActionStatus] = useState<'pending' | 'approved' | 'needs_revision'>('approved');

  // Modal: Add / Edit Class
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [classNameInput, setClassNameInput] = useState('');
  const [gradeInput, setGradeInput] = useState(3);
  const [roomInput, setRoomInput] = useState('');
  const [showBulkStudentsModal, setShowBulkStudentsModal] = useState(false);

  // Reliable in-app confirmation modal (eliminates iframe confirm() blockage)
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    title: string;
    desc: string;
    onConfirm: () => void;
  } | null>(null);

  const loadData = () => {
    setTeachers(storageService.getTeachers());
    setStudents(storageService.getProfiles());
    setActions(storageService.getGreenActions());
    setClasses(storageService.getSchoolClasses());
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- TEACHER ACTIONS ---
  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) return;

    playSound('click');
    try {
      const assigned = newClasses.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
      // Save locally
      storageService.addTeacher({
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        avatar: '👩‍🏫',
        assignedClasses: assigned,
        role: 'teacher',
        title: 'Giáo viên bộ môn',
      });

      // Try server sync
      try {
        await authService.createTeacher({
          email: newEmail.trim().toLowerCase(),
          displayName: newName.trim(),
          assignedClasses: assigned,
          password: newPassword.trim(),
        });
      } catch {
        // Local state already updated
      }

      playSound('badge');
      onShowToast('Cấp tài khoản thành công! 👩‍🏫', `Đã cấp tài khoản giáo viên cho ${newName}`, 'success');
      setShowAddTeacherModal(false);
      setNewEmail('');
      setNewName('');
      loadData();
      onRefreshAllData?.();
    } catch (err: any) {
      onShowToast('Lỗi tạo tài khoản', err.message, 'error');
    }
  };

  const handleOpenEditTeacher = (t: TeacherAccount) => {
    playSound('click');
    setEditingTeacher(t);
    setEditTeacherName(t.name);
    setEditTeacherClasses(t.assignedClasses.join(', '));
    setEditTeacherPassword('');
  };

  const handleSaveTeacherEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher || !editTeacherName.trim()) return;

    playSound('badge');
    const assigned = editTeacherClasses.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    storageService.updateTeacher(editingTeacher.id, {
      name: editTeacherName.trim(),
      assignedClasses: assigned,
    });

    try {
      await authService.updateTeacher(editingTeacher.id, {
        displayName: editTeacherName.trim(),
        assignedClasses: assigned,
        password: editTeacherPassword.trim() || undefined,
      });
    } catch {
      // Local fallback already updated
    }

    onShowToast('Cập nhật thành công! ✨', `Thông tin giáo viên ${editTeacherName} đã được lưu`, 'success');
    setEditingTeacher(null);
    loadData();
    onRefreshAllData?.();
  };

  const handleDeleteTeacher = (id: string, name: string) => {
    setDeleteConfirmDialog({
      title: 'Xóa Tài Khoản Giáo Viên',
      desc: `Ban Quản Trị có chắc chắn muốn xóa tài khoản giáo viên "${name}" khỏi hệ thống không?`,
      onConfirm: async () => {
        playSound('click');
        storageService.deleteTeacher(id);
        try {
          await authService.deleteTeacher(id);
        } catch {
          // Local fallback handled
        }
        onShowToast('Đã xóa giáo viên', `Tài khoản ${name} đã được gỡ bỏ khỏi hệ thống.`, 'info');
        loadData();
        onRefreshAllData?.();
      }
    });
  };

  const handleResetTeachersToDefault = () => {
    playSound('click');
    setDeleteConfirmDialog({
      title: 'Khôi phục đúng 35 Giáo Viên & Thầy Bùi Xuân Thành?',
      desc: 'Hệ thống sẽ đồng bộ lại chuẩn xác danh sách đúng 35 giáo viên tương ứng 35 lớp học và Cán bộ quản lý / Quản trị viên: Thầy Bùi Xuân Thành (đã xóa hết các giáo viên thừa còn lại).',
      onConfirm: () => {
        playSound('victory');
        const resetList = storageService.resetTeachersToDefault();
        setTeachers(resetList);
        onShowToast('Đã khôi phục thành công! 👩‍🏫', 'Hệ thống đã cập nhật chuẩn 35 giáo viên 35 lớp và Thầy Bùi Xuân Thành.', 'success');
        setDeleteConfirmDialog(null);
        onRefreshAllData?.();
      }
    });
  };

  const handleCopyAllTeacherAccounts = () => {
    playSound('click');
    const header = "STT\tHọ và tên\tChức vụ\tSĐT\tEmail Đăng Nhập\tMật Khẩu Mặc Định\tLớp Phụ Trách";
    const rows = teachers.map((t, idx) => {
      const pass = t.role === 'admin' 
        ? (t.email === 'buithanhsapa' ? 'buithanhsapa' : 'Admin@123') 
        : 'GiaoVien@123';
      return `${t.stt || idx + 1}\t${t.name}\t${t.position || t.title}\t${t.phone || ''}\t${t.email}\t${pass}\t${(t.assignedClasses || []).join(', ')}`;
    });
    const content = [header, ...rows].join('\n');
    navigator.clipboard.writeText(content);
    playSound('badge');
    onShowToast(`Đã sao chép ${teachers.length} tài khoản! 📋`, 'Đã lưu danh sách tài khoản vào clipboard để dán vào Excel/Word.', 'success');
  };

  const handleCopySingleTeacherAccount = (t: TeacherAccount) => {
    playSound('click');
    const pass = t.role === 'admin' 
      ? (t.email === 'buithanhsapa' ? 'buithanhsapa' : 'Admin@123') 
      : 'GiaoVien@123';
    const text = `Tài khoản: ${t.name}\nEmail: ${t.email}\nMật khẩu: ${pass}\nSĐT: ${t.phone || 'Chưa cập nhật'}\nLớp: ${(t.assignedClasses || []).join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopiedTeacherId(t.id);
    setTimeout(() => setCopiedTeacherId(null), 2000);
    onShowToast('Đã sao chép tài khoản! 🔑', `${t.name} (${t.email})`, 'info');
  };

  // --- STUDENT ACTIONS ---
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentNickname.trim()) return;

    playSound('badge');
    const studentCount = students.filter(s => s.className === newStudentClass).length + 1;
    const generatedCode = `SPA-${newStudentClass}-${String(studentCount).padStart(2, '0')}`;

    const newStudent: StudentProfile = {
      id: 'hs-' + Date.now(),
      nickname: newStudentNickname.trim(),
      realNamePreview: newStudentNickname.trim().slice(0, 1) + '. ' + newStudentClass,
      grade: newStudentGrade,
      className: newStudentClass,
      avatar: '🌱',
      greenPoints: 100,
      badges: ['Tân Binh Xanh'],
      sortGamesPlayed: 0,
      quizzesCompleted: 0,
      actionsLogged: 0,
      scansCompleted: 0,
    };

    storageService.saveProfile(newStudent);
    onShowToast('Cấp tài khoản học sinh thành công! 🌱', `Mã ${generatedCode} cho em ${newStudentNickname}`, 'reward');
    setShowAddStudentModal(false);
    setNewStudentNickname('');
    loadData();
    onRefreshAllData?.();
  };

  const handleOpenEditStudent = (s: StudentProfile) => {
    playSound('click');
    setEditingStudent(s);
    setEditStudentNickname(s.nickname);
    setEditStudentClass(s.className);
    setEditStudentGrade(s.grade);
    setEditStudentPoints(s.greenPoints);
  };

  const handleSaveStudentEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editStudentNickname.trim()) return;

    playSound('badge');
    storageService.updateStudentProfile(editingStudent.id, {
      nickname: editStudentNickname.trim(),
      className: editStudentClass.trim().toUpperCase(),
      grade: editStudentGrade,
      greenPoints: editStudentPoints,
    });

    onShowToast('Cập nhật học sinh thành công! ✨', `Đã lưu hồ sơ em ${editStudentNickname}`, 'success');
    setEditingStudent(null);
    loadData();
    onRefreshAllData?.();
  };

  const handleDeleteStudent = (id: string, name: string) => {
    setDeleteConfirmDialog({
      title: 'Xóa Tài Khoản Học Sinh',
      desc: `Ban Quản Trị có chắc chắn muốn xóa học sinh "${name}" khỏi hệ thống không?`,
      onConfirm: () => {
        playSound('click');
        storageService.deleteStudentProfile(id);
        onShowToast('Đã xóa học sinh', `Tài khoản học sinh ${name} đã được gỡ bỏ.`, 'info');
        loadData();
        onRefreshAllData?.();
      }
    });
  };

  // --- GREEN ACTION (POSTS) ACTIONS ---
  const handleOpenEditAction = (act: GreenAction) => {
    playSound('click');
    setEditingAction(act);
    setEditActionTitle(act.title);
    setEditActionDesc(act.description);
    setEditActionPoints(act.points);
    setEditActionStatus(act.status || 'approved');
  };

  const handleSaveActionEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAction || !editActionTitle.trim()) return;

    playSound('badge');
    storageService.updateGreenAction(editingAction.id, {
      title: editActionTitle.trim(),
      description: editActionDesc.trim(),
      points: editActionPoints,
      status: editActionStatus,
      verified: editActionStatus === 'approved',
    });

    onShowToast('Đã chỉnh sửa bài viết! 📝', `Bài viết "${editActionTitle}" đã được cập nhật.`, 'success');
    setEditingAction(null);
    loadData();
    onRefreshAllData?.();
  };

  const handleDeleteAction = (id: string, title: string) => {
    setDeleteConfirmDialog({
      title: 'Xóa Bài Viết',
      desc: `Ban Quản Trị có chắc chắn muốn xóa bài viết "${title}" khỏi hệ thống không?`,
      onConfirm: () => {
        playSound('click');
        storageService.deleteGreenAction(id);
        onShowToast('Đã xóa bài viết', `Bài viết "${title}" đã được gỡ khỏi nhật ký.`, 'info');
        loadData();
        onRefreshAllData?.();
      }
    });
  };

  // --- CLASSES ACTIONS ---
  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classNameInput.trim()) return;

    playSound('badge');
    if (editingClass) {
      storageService.updateSchoolClass(editingClass.id, {
        name: classNameInput.trim().toUpperCase(),
        grade: gradeInput,
        room: roomInput.trim(),
      });
      onShowToast('Cập nhật lớp thành công!', `Đã lưu thay đổi cho lớp ${classNameInput}`, 'success');
    } else {
      storageService.addSchoolClass({
        name: classNameInput.trim().toUpperCase(),
        grade: gradeInput,
        headTeacherName: 'Chưa phân công',
        room: roomInput.trim() || 'Phòng học Sa Pa',
        schoolYear: '2026-2027',
        targetStudents: 35,
      });
      onShowToast('Tạo lớp thành công! 🏫', `Đã thêm lớp ${classNameInput} vào hệ thống.`, 'success');
    }

    setShowClassModal(false);
    setEditingClass(null);
    setClassNameInput('');
    loadData();
    onRefreshAllData?.();
  };

  const handleDeleteClass = (id: string, name: string) => {
    setDeleteConfirmDialog({
      title: 'Xóa Lớp Học',
      desc: `Ban Quản Trị có chắc chắn muốn xóa lớp học "${name}" không?`,
      onConfirm: () => {
        playSound('click');
        storageService.deleteSchoolClass(id);
        onShowToast('Đã xóa lớp học', `Lớp ${name} đã được gỡ khỏi danh sách.`, 'info');
        loadData();
        onRefreshAllData?.();
      }
    });
  };

  // --- RESET SYSTEM & SEED SAMPLE DATA ---
  const handleResetSystemClean = () => {
    const confirmPrompt = confirm(
      'CẢNH BÁO QUẢN TRỊ VIÊN:\n\n' +
      'Thao tác này sẽ XÓA TẤT CẢ các lớp học, tài khoản thầy cô và học sinh trên phần mềm, CHỈ GIỮ LẠI DUY NHẤT TÀI KHOẢN QUẢN TRỊ (admin@sapa.edu.vn).\n\n' +
      'Các tài khoản khác sau đó sẽ do Ban Quản Trị tạo và cấp quyền theo thứ tự.\n\n' +
      'Bạn có chắc chắn muốn thực hiện khởi tạo hệ thống sạch không?'
    );

    if (confirmPrompt) {
      playSound('badge');
      storageService.resetToAdminOnly();
      try {
        authService.resetSystemToAdminOnly();
      } catch {
        // Fallback
      }
      onShowToast('Đã khởi tạo hệ thống sạch! 🛡️', 'Chỉ còn tài khoản Quản trị duy nhất trong hệ thống.', 'success');
      loadData();
      onRefreshAllData?.();
    }
  };

  const handleSeedSampleData = () => {
    if (confirm('Ban Quản Trị có muốn nạp bộ dữ liệu mẫu trường Tiểu học Sa Pa (gồm đầy đủ 35 lớp từ 1A1 đến 5A7, giáo viên Hoàng Thị Kim Hoa, các học sinh và hoạt động xanh) để trình diễn hoặc dự thi không?')) {
      playSound('badge');
      storageService.seedSampleData();
      onShowToast('Đã nạp bộ dữ liệu mẫu Sa Pa! 🌿', 'Hệ thống đã có đầy đủ lớp học, thầy cô và học sinh minh chứng.', 'reward');
      loadData();
      onRefreshAllData?.();
    }
  };

  const filteredStudents = students.filter(s => {
    const matchClass = filterStudentClass === 'ALL' || s.className === filterStudentClass;
    const matchSearch = s.nickname.toLowerCase().includes(searchStudent.toLowerCase()) ||
                        s.className.toLowerCase().includes(searchStudent.toLowerCase());
    return matchClass && matchSearch;
  });

  const filteredActions = actions.filter(a => {
    return filterActionTopic === 'ALL' || a.topic === filterActionTopic;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. Header with Universal Back Button */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onNavigate && (
            <button
              onClick={() => {
                playSound('click');
                onNavigate('home');
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 font-extrabold text-xs transition-colors shrink-0"
              title="Quay lại trang chủ"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          )}

          <div>
            <div className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-900 text-xs font-bold px-3 py-1 rounded-full mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
              <span>Khu Vực Quản Trị Hệ Thống – Ban Giám Hiệu</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800">
              Bảng Quản Trị Toàn Quyền Green Edu AI School
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý tài khoản thầy cô & học sinh, chỉnh sửa/xóa bài viết, kiểm soát phân quyền và khởi tạo hệ thống
            </p>
          </div>
        </div>

        {/* Admin Credentials Badge */}
        <div className="flex items-center gap-2 bg-purple-50 p-2.5 rounded-2xl border border-purple-200 text-xs">
          <div className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold">
            👑
          </div>
          <div>
            <div className="font-extrabold text-purple-900">{currentUser.displayName}</div>
            <div className="text-[10px] text-purple-700 font-mono">{currentUser.username}</div>
          </div>
        </div>
      </div>

      {/* 2. Top-Level Tab Switcher */}
      <div className="flex flex-wrap bg-white p-1.5 rounded-2xl border border-purple-100 shadow-xs gap-1">
        <button
          onClick={() => {
            playSound('click');
            setActiveTab('teachers');
          }}
          className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'teachers'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>👩‍🏫 1. Quản Lý Giáo Viên (Thêm, Sửa, Xóa)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'teachers' ? 'bg-purple-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {teachers.length}
          </span>
        </button>

        <button
          onClick={() => {
            playSound('click');
            setActiveTab('classes');
          }}
          className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'classes'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>🏫 2. Quản Lý Lớp Học (Thêm, Sửa, Xóa)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'classes' ? 'bg-purple-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {classes.length}
          </span>
        </button>

        <button
          onClick={() => {
            playSound('click');
            setActiveTab('students');
          }}
          className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'students'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>🎒 3. Quản Lý Học Sinh (Thêm, Sửa, Xóa)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'students' ? 'bg-purple-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {students.length}
          </span>
        </button>

        <button
          onClick={() => {
            playSound('click');
            setActiveTab('actions');
          }}
          className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'actions'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>📝 4. Quản Lý Bài Viết (Sửa, Xóa)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'actions' ? 'bg-purple-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {actions.length}
          </span>
        </button>

        <button
          onClick={() => {
            playSound('click');
            setActiveTab('system');
          }}
          className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'system'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>⚙️ 5. Khởi Tạo &amp; Hệ Thống</span>
        </button>
      </div>

      {/* =========================================================
          TAB 1: TEACHER MANAGEMENT (CẤP, SỬA TÊN, XÓA TÀI KHOẢN)
      ========================================================= */}
      {activeTab === 'teachers' && (
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-5">
          {/* Header & Stats */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-800">
                  Danh Sách 35 Giáo Viên Chủ Nhiệm &amp; Cán Bộ Quản Lý Trường TH Sa Pa
                </h3>
                <span className="bg-purple-100 text-purple-800 text-xs font-black px-2.5 py-0.5 rounded-full">
                  {teachers.length} Nhân Sự Chuẩn
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Đúng 35 giáo viên tương ứng 35 lớp từ 1A1 đến 5A7 và Cán bộ quản lý / Quản trị viên: Thầy Bùi Xuân Thành. Mật khẩu chuẩn: <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono font-bold">GiaoVien@123</code> (Thầy Thành: <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono font-bold">buithanhsapa</code>).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyAllTeacherAccounts}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                title="Sao chép toàn bộ danh sách tài khoản vào bộ nhớ tạm"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Sao Chép Danh Sách Tài Khoản</span>
              </button>

              <button
                type="button"
                onClick={handleResetTeachersToDefault}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs transition-all cursor-pointer"
                title="Đồng bộ lại danh sách chuẩn 35 giáo viên & Thầy Bùi Xuân Thành"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                <span>Khôi Phục Chuẩn 35 GV</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddTeacherModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-black text-xs shadow-md shadow-purple-700/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Giáo Viên Mới</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-purple-700 block">Tổng Nhân Sự</span>
                <span className="text-xl font-black text-purple-950">{teachers.length}</span>
              </div>
              <span className="text-2xl">🏫</span>
            </div>
            <div className="bg-teal-50/70 border border-teal-100 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-teal-700 block">Cán Bộ Quản Lý &amp; Quản Trị</span>
                <span className="text-xl font-black text-teal-950">
                  {teachers.filter(t => t.role === 'admin').length} (Thầy Bùi Xuân Thành)
                </span>
              </div>
              <span className="text-2xl">👑</span>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 block">Giáo Viên Chủ Nhiệm</span>
                <span className="text-xl font-black text-emerald-950">
                  {teachers.filter(t => t.role === 'teacher').length} Lớp (1A1 - 5A7)
                </span>
              </div>
              <span className="text-2xl">👩‍🏫</span>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo họ tên, email, số điện thoại hoặc lớp phụ trách..."
                value={searchTeacher}
                onChange={(e) => setSearchTeacher(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold pl-9 pr-3.5 py-2 rounded-xl focus:outline-hidden focus:border-purple-600 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                aria-label="Lọc theo vị trí công tác"
                value={filterTeacherPosition}
                onChange={(e) => setFilterTeacherPosition(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold py-2 px-3 rounded-xl focus:outline-hidden focus:border-purple-600"
              >
                <option value="ALL">Tất cả vị trí</option>
                <option value="admin">👑 Cán Bộ Quản Lý (Thầy Bùi Xuân Thành)</option>
                <option value="teacher">👩‍🏫 Giáo Viên Chủ Nhiệm (35 Lớp: 1A1 - 5A7)</option>
              </select>

              <select
                aria-label="Lọc theo khối lớp"
                value={filterTeacherGrade}
                onChange={(e) => setFilterTeacherGrade(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold py-2 px-3 rounded-xl focus:outline-hidden focus:border-purple-600"
              >
                <option value="ALL">Tất cả khối lớp</option>
                <option value="1">Khối 1 (1A1-1A7)</option>
                <option value="2">Khối 2 (2A1-2A7)</option>
                <option value="3">Khối 3 (3A1-3A7)</option>
                <option value="4">Khối 4 (4A1-4A7)</option>
                <option value="5">Khối 5 (5A1-5A7)</option>
              </select>

              {(searchTeacher || filterTeacherPosition !== 'ALL' || filterTeacherGrade !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTeacher('');
                    setFilterTeacherPosition('ALL');
                    setFilterTeacherGrade('ALL');
                  }}
                  className="px-2.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs"
                  title="Đặt lại bộ lọc"
                >
                  Xóa lọc
                </button>
              )}
            </div>
          </div>

          {/* Teachers Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3 text-center w-12">STT</th>
                  <th className="py-2.5 px-3">Giáo Viên / Nhân Viên</th>
                  <th className="py-2.5 px-3">Số Điện Thoại</th>
                  <th className="py-2.5 px-3">Email Đăng Nhập</th>
                  <th className="py-2.5 px-3">Mật Khẩu Khởi Tạo</th>
                  <th className="py-2.5 px-3">Lớp Phụ Trách</th>
                  <th className="py-2.5 px-3">Vai Trò</th>
                  <th className="py-2.5 px-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers
                  .filter((t) => {
                    if (searchTeacher.trim()) {
                      const q = searchTeacher.toLowerCase();
                      const matchName = t.name.toLowerCase().includes(q);
                      const matchEmail = t.email.toLowerCase().includes(q);
                      const matchPhone = t.phone ? t.phone.includes(q) : false;
                      const matchTitle = t.title ? t.title.toLowerCase().includes(q) : false;
                      const matchClass = t.assignedClasses ? t.assignedClasses.some(c => c.toLowerCase().includes(q)) : false;
                      if (!matchName && !matchEmail && !matchPhone && !matchTitle && !matchClass) return false;
                    }
                    if (filterTeacherPosition !== 'ALL') {
                      if (filterTeacherPosition === 'admin' && t.role !== 'admin') return false;
                      if (filterTeacherPosition === 'teacher' && (t.role !== 'teacher' || t.position === 'Nhân viên')) return false;
                      if (filterTeacherPosition === 'staff' && t.position !== 'Nhân viên') return false;
                    }
                    if (filterTeacherGrade !== 'ALL') {
                      const g = filterTeacherGrade;
                      const hasGrade = t.assignedClasses && t.assignedClasses.some(c => c.startsWith(g));
                      if (!hasGrade) return false;
                    }
                    return true;
                  })
                  .map((t, idx) => {
                    const defaultPw = t.role === 'admin'
                      ? (t.email === 'buithanhsapa' ? 'buithanhsapa' : 'Admin@123')
                      : 'GiaoVien@123';
                    const isCopied = copiedTeacherId === t.id;

                    return (
                      <tr key={t.id} className="hover:bg-purple-50/40 transition-colors">
                        <td className="py-3 px-3 text-center font-bold text-slate-400 font-mono text-[11px]">
                          {t.stt || idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl p-1 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
                              {t.avatar || (t.role === 'admin' ? '👩‍💼' : '👩‍🏫')}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-black text-slate-900 text-sm">{t.name}</span>
                                {t.gender && (
                                  <span className="text-[10px] text-slate-400 font-semibold">({t.gender})</span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                                <span className="font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded">
                                  {t.position || (t.role === 'admin' ? 'Cán bộ quản lý' : 'Giáo viên')}
                                </span>
                                {t.birthDate && <span>• Sinh: {t.birthDate}</span>}
                                {t.ethnicity && <span>• DT: {t.ethnicity}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-700">
                          {t.phone ? (
                            <span className="flex items-center gap-1 text-[11px]">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {t.phone}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-teal-800 text-[11px]">
                          {t.email}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                            {defaultPw}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {t.assignedClasses && t.assignedClasses.length > 0 ? (
                              t.assignedClasses.length > 10 ? (
                                <span className="bg-purple-100 text-purple-900 font-black px-2 py-0.5 rounded-md text-[10px]">
                                  Tất cả 35 lớp (Khối 1 - 5)
                                </span>
                              ) : (
                                t.assignedClasses.map((cls, cIdx) => (
                                  <span key={cIdx} className="bg-slate-100 font-extrabold text-slate-700 px-1.5 py-0.2 rounded text-[10px]">
                                    {cls}
                                  </span>
                                ))
                              )
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Chưa gán</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                            t.role === 'admin' ? 'bg-purple-100 text-purple-900' : 'bg-teal-100 text-teal-900'
                          }`}>
                            {t.role === 'admin' ? 'Quản Trị Viên' : 'Giáo Viên'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleCopySingleTeacherAccount(t)}
                              className={`p-1.5 rounded-lg font-bold transition-colors ${
                                isCopied ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                              }`}
                              title="Sao chép thông tin tài khoản"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditTeacher(t)}
                              className="p-1.5 bg-slate-100 hover:bg-teal-100 text-slate-700 hover:text-teal-900 rounded-lg transition-colors"
                              title="Chỉnh sửa phân công lớp"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {t.id !== 'user-admin-1' && t.id !== 'user-admin-buithanh' && (
                              <button
                                type="button"
                                onClick={() => handleDeleteTeacher(t.id, t.name)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors"
                                title="Xóa tài khoản"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>

            {teachers.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                Chưa có tài khoản giáo viên nào. Bấm &quot;Khôi Phục Chuẩn 60 GV&quot; để nạp danh sách nhà trường.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: STUDENT MANAGEMENT (THÊM, SỬA TÊN, XÓA TÀI KHOẢN)
      ========================================================= */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                Danh Sách Toàn Bộ Học Sinh Tiểu Học Sa Pa
              </h3>
              <p className="text-xs text-slate-400">
                Ban Quản Trị có quyền thêm, chỉnh sửa tên, điều chỉnh điểm xanh và xóa tài khoản học sinh.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowBulkStudentsModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800 hover:from-teal-600 hover:to-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-700/20 transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>⚡ Tự Động Tạo Danh Sách Học Sinh (35 Lớp)</span>
              </button>

              <button
                onClick={() => setShowAddStudentModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-purple-700 hover:bg-purple-600 text-white font-black text-xs shadow-md shadow-purple-700/20 transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Cấp Mã Học Sinh (Từng Em)</span>
              </button>
            </div>
          </div>

          {/* Search and class filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm học sinh theo tên hoặc lớp..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-full bg-transparent border-none focus:outline-hidden text-slate-800 font-bold"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500">Lớp:</span>
              <select
                value={filterStudentClass}
                onChange={(e) => setFilterStudentClass(e.target.value)}
                className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-hidden"
              >
                <option value="ALL">Toàn Trường</option>
                {classes.map(c => (
                  <option key={c.id} value={c.name}>Lớp {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Học Sinh</th>
                  <th className="py-2.5 px-3">Lớp Học</th>
                  <th className="py-2.5 px-3 text-center">Khối</th>
                  <th className="py-2.5 px-3 text-center">Việc Tốt Đã Làm</th>
                  <th className="py-2.5 px-3 text-center">Điểm Xanh</th>
                  <th className="py-2.5 px-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-purple-50/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{s.avatar || '🌱'}</span>
                        <div>
                          <span className="font-black text-slate-800 block text-sm">{s.nickname}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{s.realNamePreview} • Mã: SPA-{s.className}-{s.id.slice(-2)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-700">
                      Lớp {s.className}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-600">
                      Khối {s.grade}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full text-[11px]">
                        {s.actionsLogged || 0} hành động
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-black text-emerald-700 text-sm">
                        {s.greenPoints}đ
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditStudent(s)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-teal-100 text-slate-700 hover:text-teal-900 font-bold rounded-lg transition-colors flex items-center gap-1"
                          title="Sửa thông tin học sinh"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Sửa</span>
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(s.id, s.nickname)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition-colors flex items-center gap-1"
                          title="Xóa tài khoản học sinh"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredStudents.length === 0 && (
              <div className="py-10 text-center text-slate-400 text-xs">
                Chưa có học sinh nào phù hợp bộ lọc.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: GREEN ACTIONS (CHỈNH SỬA & XÓA BÀI VIẾT)
      ========================================================= */}
      {activeTab === 'actions' && (
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                Quản Lý Toàn Bộ Bài Viết & Hoạt Động Xanh (GREEN ACTION)
              </h3>
              <p className="text-xs text-slate-400">
                Ban Quản Trị có quyền chỉnh sửa tiêu đề, nội dung, điểm thưởng và xóa bài viết của thầy cô lẫn học sinh.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-500">Chủ đề:</span>
              <select
                value={filterActionTopic}
                onChange={(e) => setFilterActionTopic(e.target.value)}
                className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-hidden"
              >
                <option value="ALL">Tất Cả Chủ Đề</option>
                <option value="waste">Rác thải & Tái chế</option>
                <option value="water">Tiết kiệm nước</option>
                <option value="electricity">Tiết kiệm điện</option>
                <option value="trees">Chăm sóc cây xanh</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredActions.map((act) => (
              <div
                key={act.id}
                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{act.icon || '🌱'}</span>
                    <h4 className="font-black text-slate-800 text-sm">{act.title}</h4>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                      act.status === 'approved' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {act.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{act.description}</p>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>Tác giả: <strong>{act.studentNickname}</strong> (Lớp {act.className})</span>
                    <span>•</span>
                    <span>Thưởng: <strong className="text-amber-700">+{act.points}đ</strong></span>
                    <span>•</span>
                    <span>Ngày: {new Date(act.timestamp).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleOpenEditAction(act)}
                    className="px-3 py-1.5 bg-white hover:bg-teal-50 text-teal-800 border border-teal-200 font-extrabold text-xs rounded-xl transition-colors flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Sửa bài viết</span>
                  </button>
                  <button
                    onClick={() => handleDeleteAction(act.id, act.title)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs rounded-xl transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredActions.length === 0 && (
              <div className="py-10 text-center text-slate-400 text-xs">
                Chưa có bài viết nào trong danh mục này.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: CLASSES MANAGEMENT (THÊM, SỬA, XÓA LỚP)
      ========================================================= */}
      {activeTab === 'classes' && (
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                Danh Sách Lớp Học Sinh Thái Sa Pa
              </h3>
              <p className="text-xs text-slate-400">
                Tạo lớp học, phân bổ phòng và phân công phụ trách.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  if (confirm('Chuẩn hóa hệ thống về đúng 35 lớp (1A1-1A7, 2A1-2A7, 3A1-3A7, 4A1-4A7, 5A1-5A7), xóa hết các lớp khác và phân công tự động 35 giáo viên?')) {
                    const reset = storageService.resetSchoolClassesToDefault();
                    setClasses(reset);
                    onShowToast('Đã chuẩn hóa 35 lớp! 🏫', 'Đúng 35 lớp từ 1A1 đến 5A7, đã phân công 35 giáo viên và xóa hết các lớp khác.', 'success');
                    onRefreshAllData?.();
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-extrabold text-xs transition-colors shrink-0"
                title="Khôi phục chuẩn 35 lớp từ 1A1 đến 5A7 và phân công tự động 35 giáo viên"
              >
                <RefreshCw className="w-4 h-4 text-teal-600" />
                <span>Chuẩn Hóa 35 Lớp &amp; 35 GV</span>
              </button>

              <button
                onClick={() => {
                  setEditingClass(null);
                  setClassNameInput('');
                  setGradeInput(3);
                  setRoomInput('');
                  setShowClassModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-purple-700 hover:bg-purple-600 text-white font-black text-xs shadow-md shadow-purple-700/20 transition-all hover:scale-105 active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Lớp Mới</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <div key={cls.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-900 font-black flex items-center justify-center text-sm">
                    {cls.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingClass(cls);
                        setClassNameInput(cls.name);
                        setGradeInput(cls.grade);
                        setRoomInput(cls.room || '');
                        setShowClassModal(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-teal-700"
                      title="Sửa thông tin lớp"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClass(cls.id, cls.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-700"
                      title="Xóa lớp học"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h4 className="font-black text-slate-800 text-base">Lớp {cls.name} (Khối {cls.grade})</h4>
                <p className="text-xs text-slate-500">{cls.room || 'Phòng học trường Sa Pa'}</p>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200/60 flex justify-between">
                  <span>Chủ nhiệm:</span>
                  <strong className="text-teal-800">{cls.headTeacherName || 'Chưa phân công'}</strong>
                </div>
              </div>
            ))}
          </div>

          {classes.length === 0 && (
            <div className="py-10 text-center text-slate-400 text-xs">
              Hệ thống sạch: Chưa có lớp học nào. Bạn có thể bấm &quot;Thêm Lớp Mới&quot; hoặc nạp dữ liệu mẫu tại tab Khởi Tạo.
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 5: SYSTEM MANAGEMENT & ZERO-TRUST RESET
      ========================================================= */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-6">
          <div>
            <h3 className="font-extrabold text-base text-slate-800">
              Cấu Hình Hệ Thống, Bảo Mật Dữ Liệu & Khởi Tạo Sạch
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Bảo vệ an toàn trẻ em theo nguyên tắc Zero-Trust, phân tầng RBAC và tùy chọn khôi phục hệ sinh thái.
            </p>
          </div>

          {/* Security architecture card */}
          <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-black text-purple-900 text-sm">
              <ShieldCheck className="w-5 h-5 text-purple-700" />
              <span>Kiến Trúc An Toàn Thông Tin & Quyền Riêng Tư Học Đường</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              - <strong>Mã hóa mật khẩu:</strong> Thuật toán PBKDF2 chuẩn NIST với Salt ngẫu nhiên 16 bytes cho mỗi tài khoản.<br/>
              - <strong>Không thu thập dữ liệu nhạy cảm:</strong> Học sinh tiểu học đăng nhập bằng Mã học sinh (SPA-LỚP-STT) và mã PIN 4 chữ số, không yêu cầu email hoặc số điện thoại.<br/>
              - <strong>Cách ly dữ liệu (RBAC):</strong> Giáo viên chỉ xem và quản lý học sinh thuộc lớp được phân công. Học sinh chỉ thấy dữ liệu cá nhân của mình.
            </p>
          </div>

          {/* DANGER & RECOVERY ZONE */}
          <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-4">
            <div>
              <h4 className="font-black text-rose-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Khu Vực Quản Trị Khởi Tạo Hệ Sinh Thái (Admin Control)</span>
              </h4>
              <p className="text-xs text-rose-700 mt-1">
                Theo yêu cầu quản trị: Xóa tất cả các lớp, tài khoản thầy cô đã có, chỉ giữ lại tài khoản Quản trị.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Clean system button */}
              <button
                type="button"
                onClick={handleResetSystemClean}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white font-black text-xs shadow-md shadow-rose-900/20 active:scale-95 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Khởi Tạo Hệ Thống Sạch (Chỉ Giữ Tài Khoản Quản Trị)</span>
              </button>

              {/* Seed sample demo button */}
              <button
                type="button"
                onClick={handleSeedSampleData}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-black text-xs shadow-md shadow-teal-900/20 active:scale-95 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Nạp Bộ Dữ Liệu Mẫu Trường Sa Pa (Demo / Dự Thi)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE TEACHER --- */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-purple-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-800 flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-700" />
                <span>Cấp Tài Khoản Giáo Viên Mới</span>
              </h3>
              <button onClick={() => setShowAddTeacherModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Họ Và Tên Giáo Viên:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cô Nguyễn Hồng Hạnh"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Đăng Nhập:</label>
                <input
                  type="email"
                  required
                  placeholder="Ví dụ: hanh.gv@sapa.edu.vn"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-mono focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lớp Phân Công (Cách nhau dấu phẩy):</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 3A1, 3A2"
                  value={newClasses}
                  onChange={(e) => setNewClasses(e.target.value)}
                  className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold uppercase focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mật Khẩu Khởi Tạo:</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-mono focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddTeacherModal(false)} className="px-4 py-2 text-slate-500 font-bold">Hủy Bỏ</button>
                <button type="submit" className="px-5 py-2 bg-purple-700 text-white font-black rounded-xl shadow-md">Tạo Tài Khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: EDIT TEACHER --- */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-purple-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-800 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-purple-700" />
                <span>Chỉnh Sửa Giáo Viên: {editingTeacher.name}</span>
              </h3>
              <button onClick={() => setEditingTeacher(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleSaveTeacherEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Họ Và Tên Giáo Viên:</label>
                <input
                  type="text"
                  required
                  value={editTeacherName}
                  onChange={(e) => setEditTeacherName(e.target.value)}
                  className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lớp Phân Công (Cách nhau dấu phẩy):</label>
                <input
                  type="text"
                  value={editTeacherClasses}
                  onChange={(e) => setEditTeacherClasses(e.target.value)}
                  className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold uppercase focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mật Khẩu Mới (Để trống nếu không đổi):</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu mới nếu muốn đặt lại..."
                  value={editTeacherPassword}
                  onChange={(e) => setEditTeacherPassword(e.target.value)}
                  className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-mono focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingTeacher(null)} className="px-4 py-2 text-slate-500 font-bold">Hủy Bỏ</button>
                <button type="submit" className="px-5 py-2 bg-purple-700 text-white font-black rounded-xl shadow-md">Lưu Thay Đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE STUDENT --- */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-purple-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-800 flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-700" />
                <span>Cấp Mã Học Sinh Mới</span>
              </h3>
              <button onClick={() => setShowAddStudentModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên / Biệt Danh Học Sinh:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Vàng Thị Hoa"
                  value={newStudentNickname}
                  onChange={(e) => setNewStudentNickname(e.target.value)}
                  className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lớp Học:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 3A1"
                    value={newStudentClass}
                    onChange={(e) => setNewStudentClass(e.target.value.toUpperCase())}
                    className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold uppercase focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Khối Lớp (1-5):</label>
                  <select
                    value={newStudentGrade}
                    onChange={(e) => setNewStudentGrade(Number(e.target.value))}
                    className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-hidden"
                  >
                    {[1, 2, 3, 4, 5].map(g => (
                      <option key={g} value={g}>Khối {g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mã PIN Đăng Nhập (4 số):</label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={newStudentPin}
                  onChange={(e) => setNewStudentPin(e.target.value)}
                  className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold tracking-widest text-center text-base focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddStudentModal(false)} className="px-4 py-2 text-slate-500 font-bold">Hủy Bỏ</button>
                <button type="submit" className="px-5 py-2 bg-purple-700 text-white font-black rounded-xl shadow-md">Cấp Tài Khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: EDIT STUDENT --- */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-purple-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-800 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-purple-700" />
                <span>Sửa Học Sinh: {editingStudent.nickname}</span>
              </h3>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleSaveStudentEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên / Biệt Danh:</label>
                <input
                  type="text"
                  required
                  value={editStudentNickname}
                  onChange={(e) => setEditStudentNickname(e.target.value)}
                  className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lớp Học:</label>
                  <input
                    type="text"
                    required
                    value={editStudentClass}
                    onChange={(e) => setEditStudentClass(e.target.value.toUpperCase())}
                    className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold uppercase focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Khối Lớp:</label>
                  <select
                    value={editStudentGrade}
                    onChange={(e) => setEditStudentGrade(Number(e.target.value))}
                    className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-hidden"
                  >
                    {[1, 2, 3, 4, 5].map(g => (
                      <option key={g} value={g}>Khối {g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Điểm Xanh Tích Lũy:</label>
                <input
                  type="number"
                  min={0}
                  value={editStudentPoints}
                  onChange={(e) => setEditStudentPoints(Number(e.target.value))}
                  className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingStudent(null)} className="px-4 py-2 text-slate-500 font-bold">Hủy Bỏ</button>
                <button type="submit" className="px-5 py-2 bg-purple-700 text-white font-black rounded-xl shadow-md">Lưu Thay Đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: EDIT ACTION / POST --- */}
      {editingAction && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-purple-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-800 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-purple-700" />
                <span>Chỉnh Sửa Bài Viết Hành Động Xanh</span>
              </h3>
              <button onClick={() => setEditingAction(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleSaveActionEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tiêu Đề Bài Viết:</label>
                <input
                  type="text"
                  required
                  value={editActionTitle}
                  onChange={(e) => setEditActionTitle(e.target.value)}
                  className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nội Dung Mô Tả:</label>
                <textarea
                  rows={4}
                  required
                  value={editActionDesc}
                  onChange={(e) => setEditActionDesc(e.target.value)}
                  className="w-full bg-slate-100 p-3 rounded-xl border border-slate-200 font-medium focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Điểm Thưởng:</label>
                  <input
                    type="number"
                    min={0}
                    value={editActionPoints}
                    onChange={(e) => setEditActionPoints(Number(e.target.value))}
                    className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trạng Thái Phê Duyệt:</label>
                  <select
                    value={editActionStatus}
                    onChange={(e) => setEditActionStatus(e.target.value as any)}
                    className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-hidden"
                  >
                    <option value="approved">Đã duyệt (Công nhận)</option>
                    <option value="pending">Chờ xét duyệt</option>
                    <option value="needs_revision">Cần chỉnh sửa</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingAction(null)} className="px-4 py-2 text-slate-500 font-bold">Hủy Bỏ</button>
                <button type="submit" className="px-5 py-2 bg-purple-700 text-white font-black rounded-xl shadow-md">Lưu Bài Viết</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: ADD / EDIT CLASS --- */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-purple-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-slate-800 flex items-center gap-2">
                <School className="w-4 h-4 text-purple-700" />
                <span>{editingClass ? 'Sửa Lớp Học' : 'Tạo Lớp Học Mới'}</span>
              </h3>
              <button onClick={() => setShowClassModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tên Lớp (VD: 3A1):</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 3A2"
                    value={classNameInput}
                    onChange={(e) => setClassNameInput(e.target.value.toUpperCase())}
                    className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold uppercase focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Khối Lớp:</label>
                  <select
                    value={gradeInput}
                    onChange={(e) => setGradeInput(Number(e.target.value))}
                    className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-hidden"
                  >
                    {[1, 2, 3, 4, 5].map(g => (
                      <option key={g} value={g}>Khối {g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Vị Trí Phòng Học:</label>
                <input
                  type="text"
                  placeholder="VD: Phòng 201 Dãy Hoa Ban"
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowClassModal(false)} className="px-4 py-2 text-slate-500 font-bold">Hủy Bỏ</button>
                <button type="submit" className="px-5 py-2 bg-purple-700 text-white font-black rounded-xl shadow-md">Lưu Lớp Học</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Admin Deletions */}
      {deleteConfirmDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-rose-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl">
              ⚠️
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-800">
                {deleteConfirmDialog.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {deleteConfirmDialog.desc}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmDialog(null)}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteConfirmDialog.onConfirm();
                  setDeleteConfirmDialog(null);
                }}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 transition-colors cursor-pointer"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Student Generator Modal */}
      <BulkStudentGeneratorModal
        isOpen={showBulkStudentsModal}
        onClose={() => setShowBulkStudentsModal(false)}
        classes={classes}
        existingProfiles={students}
        defaultClass="1A1"
        teacherName="Cô Hoàng Thị Kim Hoa"
        onProfilesGenerated={() => {
          loadData();
          onRefreshAllData?.();
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
};
