import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2, ShieldCheck, Search, Filter, Key, Check, X, Award, Sparkles } from 'lucide-react';
import { SchoolClass, StudentProfile, TeacherAccount } from '../../types';
import { playSound } from '../../utils/audio';

interface TeacherClassManagementTabProps {
  classes: SchoolClass[];
  teachers: TeacherAccount[];
  profiles: StudentProfile[];
  selectedClass: string;
  onSelectClass: (className: string) => void;
  onAddClass: (cls: Omit<SchoolClass, 'id' | 'createdAt'>) => void;
  onUpdateClass: (id: string, updates: Partial<SchoolClass>) => void;
  onDeleteClass: (id: string) => void;
  onAssignTeacher: (teacherId: string, className: string) => void;
  onOpenAddStudentModal: (defaultClass?: string) => void;
  onOpenBulkStudentsModal?: (defaultClass?: string) => void;
  onResetClasses: () => void;
  onUpdateStudent?: (id: string, updates: Partial<StudentProfile>) => void;
  onDeleteStudent?: (id: string) => void;
}

export const TeacherClassManagementTab: React.FC<TeacherClassManagementTabProps> = ({
  classes,
  teachers,
  profiles,
  selectedClass,
  onSelectClass,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onAssignTeacher,
  onOpenAddStudentModal,
  onOpenBulkStudentsModal,
  onResetClasses,
  onUpdateStudent,
  onDeleteStudent,
}) => {
  const [searchStudent, setSearchStudent] = useState('');
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);

  // In-app deletion confirmation modal (removes iframe confirm blockage)
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    title: string;
    desc: string;
    onConfirm: () => void;
  } | null>(null);

  // Form states for student editing
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [editStudentNickname, setEditStudentNickname] = useState('');
  const [editStudentClass, setEditStudentClass] = useState('');
  const [editStudentGrade, setEditStudentGrade] = useState(3);
  const [editStudentPoints, setEditStudentPoints] = useState(0);

  // Form states for class creation/editing
  const [classNameInput, setClassNameInput] = useState('');
  const [gradeInput, setGradeInput] = useState<number>(3);
  const [teacherIdInput, setTeacherIdInput] = useState<string>('');
  const [roomInput, setRoomInput] = useState('');
  const [targetStudentsInput, setTargetStudentsInput] = useState<number>(35);
  const [descriptionInput, setDescriptionInput] = useState('');

  // Open modal for new class
  const handleOpenNewClass = () => {
    playSound('click');
    setEditingClass(null);
    setClassNameInput('');
    setGradeInput(3);
    setTeacherIdInput(teachers[0]?.id || '');
    setRoomInput('Phòng học Sa Pa');
    setTargetStudentsInput(35);
    setDescriptionInput('Lớp rèn luyện công dân số xanh');
    setShowCreateClassModal(true);
  };

  // Open modal for editing class
  const handleOpenEditClass = (cls: SchoolClass) => {
    playSound('click');
    setEditingClass(cls);
    setClassNameInput(cls.name);
    setGradeInput(cls.grade);
    setTeacherIdInput(cls.headTeacherId || '');
    setRoomInput(cls.room || '');
    setTargetStudentsInput(cls.targetStudents);
    setDescriptionInput(cls.description || '');
    setShowCreateClassModal(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classNameInput.trim()) return;

    const teacher = teachers.find(t => t.id === teacherIdInput);
    const teacherName = teacher?.name || 'Chưa phân công';

    if (editingClass) {
      onUpdateClass(editingClass.id, {
        name: classNameInput.trim().toUpperCase(),
        grade: gradeInput,
        headTeacherId: teacherIdInput,
        headTeacherName: teacherName,
        room: roomInput.trim(),
        targetStudents: targetStudentsInput,
        description: descriptionInput.trim(),
      });
    } else {
      onAddClass({
        name: classNameInput.trim().toUpperCase(),
        grade: gradeInput,
        headTeacherId: teacherIdInput,
        headTeacherName: teacherName,
        room: roomInput.trim(),
        schoolYear: '2025-2026',
        targetStudents: targetStudentsInput,
        description: descriptionInput.trim(),
      });
    }

    setShowCreateClassModal(false);
  };

  // Filter profiles
  const filteredProfiles = profiles.filter(p => {
    const matchClass = selectedClass === 'ALL' || p.className === selectedClass;
    const matchSearch = p.nickname.toLowerCase().includes(searchStudent.toLowerCase()) ||
                        p.className.toLowerCase().includes(searchStudent.toLowerCase()) ||
                        p.realNamePreview.toLowerCase().includes(searchStudent.toLowerCase());
    return matchClass && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-xs">
        <div>
          <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-700" />
            <span>Quản Lý Danh Sách Lớp & Học Sinh Sa Pa</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập lớp học, phân công giáo viên chủ nhiệm và cấp mã học sinh an toàn
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenBulkStudentsModal?.(selectedClass === 'ALL' ? '1A1' : selectedClass)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800 hover:from-teal-600 hover:to-emerald-500 text-white font-black px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-emerald-700/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>⚡ Tự Động Tạo Danh Sách Học Sinh (35 Lớp)</span>
          </button>

          <button
            onClick={handleOpenNewClass}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2.5 rounded-2xl text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Lớp Mới</span>
          </button>

          <button
            onClick={() => onOpenAddStudentModal(selectedClass === 'ALL' ? '1A1' : selectedClass)}
            className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-600 text-white font-bold px-3.5 py-2.5 rounded-2xl text-xs shadow-sm transition-all"
          >
            <Key className="w-4 h-4" />
            <span>Cấp Mã Học Sinh (Từng Em)</span>
          </button>
        </div>
      </div>

      {/* Class Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-sm text-slate-700">
            Các Lớp Học Hiện Có ({classes.length} Lớp)
          </h4>
          <button
            onClick={onResetClasses}
            className="text-[11px] text-slate-400 hover:text-slate-600 underline font-medium"
          >
            Khôi phục danh sách lớp mặc định
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {classes.map(cls => {
            const classStudentCount = profiles.filter(p => p.className === cls.name).length;
            const isSelected = selectedClass === cls.name;

            return (
              <div
                key={cls.id}
                onClick={() => {
                  playSound('click');
                  onSelectClass(cls.name);
                }}
                className={`p-4 rounded-3xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-teal-50/70 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                    : 'bg-white border-slate-200/80 hover:border-teal-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 font-black text-sm flex items-center justify-center">
                      {cls.name}
                    </span>
                    <div>
                      <h5 className="font-black text-slate-800 text-sm">Lớp {cls.name}</h5>
                      <span className="text-[10px] text-slate-400 font-semibold block">Khối {cls.grade} • Năm học {cls.schoolYear}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditClass(cls);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      title="Chỉnh sửa lớp"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {classes.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playSound('click');
                          setDeleteConfirmDialog({
                            title: 'Xóa Lớp Học',
                            desc: `Thầy cô có chắc chắn muốn xóa lớp ${cls.name} khỏi danh sách không?`,
                            onConfirm: () => {
                              playSound('click');
                              onDeleteClass(cls.id);
                            },
                          });
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Xóa lớp"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Giáo viên:</span>
                    <strong className="text-slate-700">{cls.headTeacherName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phòng học:</span>
                    <span className="text-slate-600">{cls.room || 'Phòng học chính'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-400">Sĩ số thực tế:</span>
                    <span className="font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-full text-[11px]">
                      {classStudentCount} / {cls.targetStudents} em
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Student List in Class with Search */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-extrabold text-base text-slate-800">
              Danh Sách Học Sinh: {selectedClass === 'ALL' ? 'Toàn Trường Sa Pa' : `Lớp ${selectedClass}`}
            </h4>
            <p className="text-xs text-slate-500">
              Bảo mật danh tính: Học sinh sử dụng biệt danh thân thiện kèm mã định danh nội bộ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm biệt danh hoặc lớp..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="bg-slate-100 text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-teal-500 w-44 sm:w-56"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Học Sinh</th>
                <th className="py-2.5 px-3">Lớp</th>
                <th className="py-2.5 px-3 text-center">Phân Loại Rác</th>
                <th className="py-2.5 px-3 text-center">Trắc Nghiệm</th>
                <th className="py-2.5 px-3 text-center">Nhật Ký Xanh</th>
                <th className="py-2.5 px-3 text-center">Điểm Xanh</th>
                <th className="py-2.5 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProfiles.map(p => (
                <tr key={p.id} className="hover:bg-teal-50/30 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{p.avatar}</span>
                      <div>
                        <div className="font-extrabold text-slate-800 text-sm">
                          {p.nickname}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {p.realNamePreview} • Mã: SPA-{p.className}-{p.id.slice(-2)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-700">
                    Lớp {p.className}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full text-[11px]">
                      {p.sortGamesPlayed} lượt
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="bg-teal-100 text-teal-900 font-bold px-2 py-0.5 rounded-full text-[11px]">
                      {p.quizzesCompleted} bài
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full text-[11px]">
                      {p.actionsLogged} việc tốt
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-sm font-black text-emerald-700">
                      {p.greenPoints}đ
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          playSound('click');
                          setEditingStudent(p);
                          setEditStudentNickname(p.nickname);
                          setEditStudentClass(p.className);
                          setEditStudentGrade(p.grade);
                          setEditStudentPoints(p.greenPoints);
                        }}
                        className="p-1.5 text-slate-400 hover:text-teal-700 rounded-lg hover:bg-teal-50"
                        title="Sửa học sinh"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          playSound('click');
                          setDeleteConfirmDialog({
                            title: 'Xóa Học Sinh Khỏi Lớp',
                            desc: `Thầy cô có chắc chắn muốn xóa học sinh "${p.nickname}" (Lớp ${p.className}) khỏi hệ thống không?`,
                            onConfirm: () => {
                              playSound('click');
                              onDeleteStudent?.(p.id);
                            },
                          });
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-700 rounded-lg hover:bg-rose-50 cursor-pointer"
                        title="Xóa học sinh"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProfiles.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-xs space-y-2">
              <div className="text-3xl">🌱</div>
              <p>Chưa có học sinh nào trong danh mục này.</p>
              <button
                onClick={() => onOpenAddStudentModal(selectedClass === 'ALL' ? '3A1' : selectedClass)}
                className="text-teal-700 font-bold hover:underline"
              >
                + Cấp mã học sinh mới cho lớp ngay
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create / Edit Class */}
      {showCreateClassModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-teal-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-700" />
                <span>{editingClass ? 'Chỉnh Sửa Lớp Học' : 'Tạo Lớp Học Mới'}</span>
              </h3>
              <button
                onClick={() => setShowCreateClassModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tên Lớp (VD: 3A1, 4B):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 3A3"
                    value={classNameInput}
                    onChange={(e) => setClassNameInput(e.target.value)}
                    className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold uppercase focus:outline-hidden focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Khối Lớp (1-5):
                  </label>
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
                <label className="font-bold text-slate-700 block mb-1">
                  Giáo Viên Chủ Nhiệm / Phụ Trách:
                </label>
                <select
                  value={teacherIdInput}
                  onChange={(e) => setTeacherIdInput(e.target.value)}
                  className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-hidden"
                >
                  <option value="">-- Chưa phân công --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.title})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Phòng Học:
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Phòng 302 Dãy Hoa Ban"
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value)}
                    className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Chỉ Tiêu Sĩ Số:
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="60"
                    value={targetStudentsInput}
                    onChange={(e) => setTargetStudentsInput(Number(e.target.value))}
                    className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Mô Tả / Khẩu Hiệu Lớp:
                </label>
                <textarea
                  rows={2}
                  placeholder="VD: Chi đội Mầm Xanh Sa Pa - Giữ gìn núi rừng sạch đẹp"
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateClassModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-extrabold shadow-md shadow-teal-700/20"
                >
                  {editingClass ? 'Cập Nhật Lớp' : 'Lưu Lớp Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal: Edit Student */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-teal-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-teal-700" />
                <span>Chỉnh Sửa Học Sinh: {editingStudent.nickname}</span>
              </h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editStudentNickname.trim()) return;
                playSound('badge');
                onUpdateStudent?.(editingStudent.id, {
                  nickname: editStudentNickname.trim(),
                  className: editStudentClass.trim().toUpperCase(),
                  grade: editStudentGrade,
                  greenPoints: editStudentPoints,
                });
                setEditingStudent(null);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên / Biệt Danh Học Sinh:
                </label>
                <input
                  type="text"
                  required
                  value={editStudentNickname}
                  onChange={(e) => setEditStudentNickname(e.target.value)}
                  className="w-full bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-hidden focus:border-teal-500"
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

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-extrabold shadow-md"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Teacher Deletions */}
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
    </div>
  );
};
