import React, { useState } from 'react';
import { Download, FileSpreadsheet, Filter, Calendar, Users, Eye, CheckCircle2 } from 'lucide-react';
import { ActivityRecord, ClassSummary, StudentProfile } from '../../types';
import { playSound } from '../../utils/audio';

interface TeacherReportsTabProps {
  profiles: StudentProfile[];
  activities: ActivityRecord[];
  classSummaries: ClassSummary[];
  selectedClass: string;
  onSelectClass: (className: string) => void;
  onShowToast?: (title: string, desc?: string, type?: 'success' | 'reward' | 'info' | 'error') => void;
}

export const TeacherReportsTab: React.FC<TeacherReportsTabProps> = ({
  profiles,
  activities,
  classSummaries,
  selectedClass,
  onSelectClass,
  onShowToast,
}) => {
  const [timeFilter, setTimeFilter] = useState<'7days' | '30days' | 'semester' | 'all'>('all');
  const [reportType, setReportType] = useState<'students' | 'activities' | 'class_summary'>('students');

  // Filter activities by time
  const now = Date.now();
  const filteredActivities = activities.filter(a => {
    const matchClass = selectedClass === 'ALL' || a.className === selectedClass;
    if (!matchClass) return false;

    if (timeFilter === '7days') return now - a.timestamp <= 7 * 24 * 60 * 60 * 1000;
    if (timeFilter === '30days') return now - a.timestamp <= 30 * 24 * 60 * 60 * 1000;
    if (timeFilter === 'semester') return now - a.timestamp <= 120 * 24 * 60 * 60 * 1000;
    return true;
  });

  const filteredProfiles = profiles.filter(p => selectedClass === 'ALL' || p.className === selectedClass);

  // Export CSV Function (With UTF-8 BOM so Excel opens Vietnamese characters perfectly)
  const handleDownloadCSV = () => {
    playSound('click');

    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `Bao_Cao_SaPa_${selectedClass}_${timeFilter}.csv`;

    if (reportType === 'students') {
      headers = [
        'Mã Định Danh Nội Bộ',
        'Biệt Danh Học Sinh',
        'Tên Viết Tắt (Bảo Vệ)',
        'Lớp',
        'Khối',
        'Điểm Xanh Tích Lũy',
        'Số Lượt Phân Loại',
        'Số Bài Trắc Nghiệm',
        'Số Nhật Ký Hoàn Thành',
        'Huy Hiệu Đã Đạt',
      ];
      rows = filteredProfiles.map(p => [
        `SPA-${p.className}-${p.id.slice(-2)}`,
        `"${p.nickname}"`,
        `"${p.realNamePreview}"`,
        p.className,
        p.grade,
        p.greenPoints,
        p.sortGamesPlayed,
        p.quizzesCompleted,
        p.actionsLogged || 0,
        `"${p.badges.join('; ')}"`,
      ]);
    } else if (reportType === 'activities') {
      headers = [
        'Thời Gian',
        'Mã Học Sinh',
        'Biệt Danh',
        'Lớp',
        'Loại Hoạt Động',
        'Tên Hoạt Động / Nhiệm Vụ',
        'Điểm Số',
        'Điểm Xanh Thưởng',
        'Chi Tiết Thực Hiện',
      ];
      rows = filteredActivities.map(a => [
        `"${new Date(a.timestamp).toLocaleString('vi-VN')}"`,
        a.studentId,
        `"${a.studentNickname}"`,
        a.className,
        a.activityType,
        `"${a.title.replace(/"/g, '""')}"`,
        a.score ?? 'N/A',
        a.greenPointsEarned,
        `"${(a.details || '').replace(/"/g, '""')}"`,
      ]);
    } else {
      headers = [
        'Lớp Học',
        'Khối',
        'Tổng Học Sinh',
        'Tỷ Lệ Phân Loại Rác (%)',
        'Số Bài Trắc Nghiệm Hoàn Thành',
        'Tổng Điểm Xanh Của Lớp',
      ];
      rows = classSummaries.map(c => [
        c.className,
        c.grade,
        c.totalStudents,
        `${c.avgSortingScore}%`,
        c.completedQuizzes,
        c.totalGreenPoints,
      ]);
    }

    // Include UTF-8 Byte Order Mark (BOM) \uFEFF
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onShowToast?.('Đã xuất báo cáo thành công! 📊', `Tệp ${filename} đã tải xuống máy tính.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Xuất Báo Cáo & Thống Kê Sư Phạm (Excel / CSV)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Báo cáo định dạng chuẩn UTF-8 tương thích Microsoft Excel, hỗ trợ tiếng Việt có dấu đầy đủ
          </p>
        </div>

        <button
          onClick={handleDownloadCSV}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Tải File Báo Cáo Về Máy (.CSV / Excel)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Report Type Selector */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-600">Loại Báo Cáo:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setReportType('students')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                reportType === 'students' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Học Sinh & Điểm Xanh
            </button>
            <button
              onClick={() => setReportType('activities')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                reportType === 'activities' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Nhật Ký Hoạt Động Chi Tiết
            </button>
            <button
              onClick={() => setReportType('class_summary')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                reportType === 'class_summary' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Tổng Hợp Theo Lớp
            </button>
          </div>
        </div>

        {/* Scope and Time filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => onSelectClass(e.target.value)}
            className="bg-slate-100 text-slate-800 font-bold px-3 py-1.5 rounded-xl border border-slate-200"
          >
            <option value="ALL">Toàn Bộ Lớp</option>
            <option value="1A1">Lớp 1A1</option>
            <option value="2A2">Lớp 2A2</option>
            <option value="3A1">Lớp 3A1</option>
            <option value="4B">Lớp 4B</option>
            <option value="5A">Lớp 5A</option>
          </select>

          {/* Time Filter */}
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="bg-slate-100 text-slate-800 font-bold px-3 py-1.5 rounded-xl border border-slate-200"
          >
            <option value="7days">7 Ngày Vừa Qua</option>
            <option value="30days">30 Ngày Gần Nhất</option>
            <option value="semester">Toàn Bộ Học Kỳ Này</option>
            <option value="all">Tất Cả Thời Gian</option>
          </select>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-600" />
            <h4 className="font-extrabold text-sm text-slate-800">
              Xem Trước Dữ Liệu Báo Cáo Trước Khi Tải Về
            </h4>
          </div>
          <span className="text-[11px] text-slate-400 font-bold">
            Hiển thị 10 hàng đầu tiên
          </span>
        </div>

        <div className="overflow-x-auto">
          {reportType === 'students' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Mã Học Sinh</th>
                  <th className="py-2.5 px-3">Biệt Danh</th>
                  <th className="py-2.5 px-3">Lớp</th>
                  <th className="py-2.5 px-3 text-center">Phân Loại Rác</th>
                  <th className="py-2.5 px-3 text-center">Trắc Nghiệm</th>
                  <th className="py-2.5 px-3 text-right">Điểm Xanh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProfiles.slice(0, 10).map(p => (
                  <tr key={p.id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-600">
                      SPA-{p.className}-{p.id.slice(-2)}
                    </td>
                    <td className="py-2.5 px-3 font-extrabold text-slate-800">
                      {p.avatar} {p.nickname}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-700">Lớp {p.className}</td>
                    <td className="py-2.5 px-3 text-center">{p.sortGamesPlayed} lượt</td>
                    <td className="py-2.5 px-3 text-center">{p.quizzesCompleted} bài</td>
                    <td className="py-2.5 px-3 text-right font-black text-emerald-700">{p.greenPoints}đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'activities' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Thời Gian</th>
                  <th className="py-2.5 px-3">Học Sinh</th>
                  <th className="py-2.5 px-3">Lớp</th>
                  <th className="py-2.5 px-3">Hoạt Động</th>
                  <th className="py-2.5 px-3 text-right">Điểm Thưởng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredActivities.slice(0, 10).map(a => (
                  <tr key={a.id}>
                    <td className="py-2.5 px-3 text-slate-400">
                      {new Date(a.timestamp).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{a.studentNickname}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-700">Lớp {a.className}</td>
                    <td className="py-2.5 px-3 text-emerald-800 font-medium">{a.title}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-600">+{a.greenPointsEarned}đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'class_summary' && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Lớp Học</th>
                  <th className="py-2.5 px-3">Khối</th>
                  <th className="py-2.5 px-3">Sĩ Số</th>
                  <th className="py-2.5 px-3 text-center">Đúng Phân Loại</th>
                  <th className="py-2.5 px-3 text-right">Tổng Điểm Xanh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classSummaries.map(c => (
                  <tr key={c.className}>
                    <td className="py-2.5 px-3 font-extrabold text-slate-800">Lớp {c.className}</td>
                    <td className="py-2.5 px-3">Khối {c.grade}</td>
                    <td className="py-2.5 px-3">{c.totalStudents} em</td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{c.avgSortingScore}%</td>
                    <td className="py-2.5 px-3 text-right font-black text-amber-600">{c.totalGreenPoints}đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
