import React, { useState } from 'react';
import {
  Sparkles,
  Users,
  FileText,
  CheckCircle2,
  Copy,
  Download,
  Printer,
  X,
  Plus,
  RefreshCw,
  ShieldCheck,
  Check,
  ArrowRight,
} from 'lucide-react';
import { SchoolClass, StudentProfile } from '../../types';
import { storageService, ALL_35_CLASS_NAMES } from '../../services/storageService';
import { playSound } from '../../utils/audio';

interface BulkStudentGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: SchoolClass[];
  existingProfiles: StudentProfile[];
  onProfilesGenerated: (newProfiles: StudentProfile[]) => void;
  onShowToast?: (title: string, desc?: string, type?: 'success' | 'reward' | 'info' | 'error') => void;
  defaultClass?: string;
  teacherName?: string;
}

// Realistic Vietnamese & Sa Pa names for authentic student simulation
const VIETNAMESE_SURNAMES = [
  'Vàng', 'Nguyễn', 'Trần', 'Lê', 'Chảo', 'Giàng', 'Hầu', 'Lò', 'Phạm',
  'Hoàng', 'Thào', 'Sùng', 'Đỗ', 'Bùi', 'Đặng', 'Lý', 'Ma', 'Cầm'
];

const VIETNAMESE_MIDDLES_BOYS = [
  'A', 'Văn', 'Đức', 'Bảo', 'Minh', 'Gia', 'Tuấn', 'Hải', 'Quang', 'Trọng'
];

const VIETNAMESE_MIDDLES_GIRLS = [
  'Thị', 'Ngọc', 'Mai', 'Phương', 'Thu', 'Thảo', 'Hương', 'Mây', 'Linh'
];

const VIETNAMESE_GIVEN_BOYS = [
  'Dũng', 'Nam', 'An', 'Bình', 'Cường', 'Đạt', 'Hiếu', 'Huy', 'Hùng',
  'Khoa', 'Kiên', 'Long', 'Minh', 'Phong', 'Phúc', 'Quân', 'Sơn', 'Thịnh',
  'Trí', 'Trung', 'Tú', 'Tuấn', 'Tùng', 'Vinh'
];

const VIETNAMESE_GIVEN_GIRLS = [
  'Mây', 'Hoa', 'Anh', 'Chi', 'Dung', 'Giang', 'Hà', 'Hằng', 'Hương',
  'Khánh', 'Lam', 'Lan', 'Linh', 'Mai', 'My', 'Nga', 'Ngân', 'Ngọc',
  'Nhi', 'Nhung', 'Quỳnh', 'Thảo', 'Trang', 'Trâm', 'Uyên', 'Vân', 'Vy', 'Yến'
];

const ECO_AVATARS = ['🌱', '🌿', '🌸', '🐿️', '🕊️', '🐼', '🦅', '⭐', '🦊', '🍀', '🌻', '🌲', '🐝', '🐾'];

export const BulkStudentGeneratorModal: React.FC<BulkStudentGeneratorModalProps> = ({
  isOpen,
  onClose,
  classes,
  existingProfiles,
  onProfilesGenerated,
  onShowToast,
  defaultClass = '1A1',
  teacherName = 'Cô Hoàng Thị Kim Hoa',
}) => {
  const [activeTab, setActiveTab] = useState<'auto' | 'paste'>('auto');
  const [targetScope, setTargetScope] = useState<string>(defaultClass || 'ALL');
  const [countPerClass, setCountPerClass] = useState<number>(10);
  const [defaultPin, setDefaultPin] = useState<string>('1234');
  const [pinType, setPinType] = useState<'fixed' | 'random'>('fixed');
  const [initialPoints, setInitialPoints] = useState<number>(100);
  const [pastedText, setPastedText] = useState<string>('');
  const [pastedClass, setPastedClass] = useState<string>(defaultClass || '1A1');

  // Generation status & result display
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedList, setGeneratedList] = useState<{
    profile: StudentProfile;
    pin: string;
  }[] | null>(null);
  const [copiedState, setCopiedState] = useState(false);

  if (!isOpen) return null;

  // Compute clean list of class names (all 35 classes)
  const classList = classes.length > 0 ? classes.map(c => c.name) : ALL_35_CLASS_NAMES;

  // Helper to generate a realistic student name
  const generateStudentName = (idx: number, genderRatio: number = 0.5): string => {
    const isBoy = (idx % 2 === 0) ? Math.random() > 0.4 : Math.random() < 0.6;
    const surname = VIETNAMESE_SURNAMES[(idx * 7 + Math.floor(Math.random() * 5)) % VIETNAMESE_SURNAMES.length];
    
    if (isBoy) {
      const middle = VIETNAMESE_MIDDLES_BOYS[(idx * 3 + Math.floor(Math.random() * 3)) % VIETNAMESE_MIDDLES_BOYS.length];
      const given = VIETNAMESE_GIVEN_BOYS[(idx + Math.floor(Math.random() * 4)) % VIETNAMESE_GIVEN_BOYS.length];
      return `${surname} ${middle} ${given}`;
    } else {
      const middle = VIETNAMESE_MIDDLES_GIRLS[(idx * 3 + Math.floor(Math.random() * 3)) % VIETNAMESE_MIDDLES_GIRLS.length];
      const given = VIETNAMESE_GIVEN_GIRLS[(idx + Math.floor(Math.random() * 4)) % VIETNAMESE_GIVEN_GIRLS.length];
      return `${surname} ${middle} ${given}`;
    }
  };

  // Helper to generate random 4-digit PIN
  const generatePin = (): string => {
    if (pinType === 'fixed') return defaultPin || '1234';
    return String(Math.floor(1000 + Math.random() * 9000));
  };

  // Parse pasted text into student names
  const parsePastedNames = (text: string): string[] => {
    return text
      .split('\n')
      .map(line => {
        // Strip leading numbers like "1.", "01 -", "1/", tabs, etc.
        return line.replace(/^[\s\d\.\-\/\)\:]+/, '').trim();
      })
      .filter(line => line.length > 1);
  };

  const parsedNamesCount = parsePastedNames(pastedText).length;

  // Execute Auto Generation
  const handleRunAutoGenerate = async () => {
    playSound('badge');
    setIsGenerating(true);

    const targetClasses = targetScope === 'ALL' ? classList : [targetScope];
    const results: { profile: StudentProfile; pin: string }[] = [];
    const now = Date.now();

    // Map existing student count per class
    const existingCountMap: Record<string, number> = {};
    for (const p of existingProfiles) {
      existingCountMap[p.className] = (existingCountMap[p.className] || 0) + 1;
    }

    let globalCounter = 0;
    for (const cls of targetClasses) {
      const grade = parseInt(cls[0]) || 3;
      let startIdx = (existingCountMap[cls] || 0) + 1;

      for (let i = 0; i < countPerClass; i++) {
        const studentIndex = startIdx + i;
        const studentCode = `SPA-${cls}-${String(studentIndex).padStart(2, '0')}`;
        const fullName = generateStudentName(globalCounter++);
        const pin = generatePin();
        const avatar = ECO_AVATARS[(studentIndex + globalCounter) % ECO_AVATARS.length];

        const profile: StudentProfile = {
          id: `hs-${cls.toLowerCase()}-${studentIndex}-${now}`,
          nickname: fullName,
          realNamePreview: fullName.slice(0, 1) + '. ' + cls,
          grade,
          className: cls,
          avatar,
          greenPoints: initialPoints,
          badges: ['Tân Binh Xanh Sa Pa'],
          sortGamesPlayed: 0,
          quizzesCompleted: 0,
          actionsLogged: 0,
          scansCompleted: 0,
        };

        results.push({ profile, pin });
      }
    }

    // Save locally
    const createdProfiles = results.map(r => r.profile);
    storageService.saveProfilesBulk(createdProfiles);

    // Call backend API if possible
    try {
      await fetch('/api/teacher/students/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('green_sapa_auth_session_v1') ? JSON.parse(localStorage.getItem('green_sapa_auth_session_v1')!).token : ''}`,
        },
        body: JSON.stringify({
          students: results.map(r => ({
            id: r.profile.id,
            nickname: r.profile.nickname,
            className: r.profile.className,
            grade: r.profile.grade,
            pin: r.pin,
            avatar: r.profile.avatar,
            studentCode: `SPA-${r.profile.className}-${String(results.indexOf(r) + 1).padStart(2, '0')}`,
          })),
        }),
      });
    } catch {
      // Offline fallback
    }

    setIsGenerating(false);
    setGeneratedList(results);
    onProfilesGenerated(createdProfiles);
    onShowToast?.(
      'Tạo danh sách thành công! 🎉',
      `Đã tạo ${results.length} học sinh cho ${targetClasses.length} lớp học.`,
      'reward'
    );
  };

  // Execute Paste/Import Generation
  const handleRunPasteGenerate = async () => {
    const names = parsePastedNames(pastedText);
    if (names.length === 0) return;

    playSound('badge');
    setIsGenerating(true);

    const cls = pastedClass;
    const grade = parseInt(cls[0]) || 3;
    const now = Date.now();
    const existingInClass = existingProfiles.filter(p => p.className === cls).length;
    const results: { profile: StudentProfile; pin: string }[] = [];

    for (let i = 0; i < names.length; i++) {
      const studentIndex = existingInClass + i + 1;
      const studentCode = `SPA-${cls}-${String(studentIndex).padStart(2, '0')}`;
      const fullName = names[i];
      const pin = generatePin();
      const avatar = ECO_AVATARS[(i) % ECO_AVATARS.length];

      const profile: StudentProfile = {
        id: `hs-${cls.toLowerCase()}-${studentIndex}-${now}`,
        nickname: fullName,
        realNamePreview: fullName.slice(0, 1) + '. ' + cls,
        grade,
        className: cls,
        avatar,
        greenPoints: initialPoints,
        badges: ['Tân Binh Xanh Sa Pa'],
        sortGamesPlayed: 0,
        quizzesCompleted: 0,
        actionsLogged: 0,
        scansCompleted: 0,
      };

      results.push({ profile, pin });
    }

    // Save locally
    const createdProfiles = results.map(r => r.profile);
    storageService.saveProfilesBulk(createdProfiles);

    // Call backend API if possible
    try {
      await fetch('/api/teacher/students/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('green_sapa_auth_session_v1') ? JSON.parse(localStorage.getItem('green_sapa_auth_session_v1')!).token : ''}`,
        },
        body: JSON.stringify({
          students: results.map(r => ({
            id: r.profile.id,
            nickname: r.profile.nickname,
            className: r.profile.className,
            grade: r.profile.grade,
            pin: r.pin,
            avatar: r.profile.avatar,
            studentCode: `SPA-${r.profile.className}-${String(results.indexOf(r) + 1).padStart(2, '0')}`,
          })),
        }),
      });
    } catch {
      // Offline fallback
    }

    setIsGenerating(false);
    setGeneratedList(results);
    onProfilesGenerated(createdProfiles);
    onShowToast?.(
      'Nhập danh sách thành công! 📝',
      `Đã tạo ${results.length} học sinh cho lớp ${cls}.`,
      'reward'
    );
  };

  // Copy to clipboard formatted TSV table
  const handleCopyClipboard = () => {
    if (!generatedList) return;
    playSound('click');
    const header = "STT\tMã Học Sinh\tHọ và Tên / Biệt Danh\tLớp\tMã PIN\tĐiểm Khởi Đầu\n";
    const rows = generatedList
      .map((item, idx) => {
        const studentCode = `SPA-${item.profile.className}-${String(idx + 1).padStart(2, '0')}`;
        return `${idx + 1}\t${studentCode}\t${item.profile.nickname}\t${item.profile.className}\t${item.pin}\t${item.profile.greenPoints}`;
      })
      .join('\n');

    navigator.clipboard.writeText(header + rows);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2500);
    onShowToast?.('Đã sao chép danh sách! 📋', 'Có thể dán trực tiếp vào file Excel hoặc Word.', 'success');
  };

  // Export CSV file (with UTF-8 BOM)
  const handleExportCSV = () => {
    if (!generatedList) return;
    playSound('click');
    const bom = '\uFEFF';
    const header = 'STT,Mã Học Sinh,Họ Và Tên,Lớp,Khối,Mã PIN,Điểm Xanh,Giáo Viên Phụ Trách\n';
    const rows = generatedList
      .map((item, idx) => {
        const studentCode = `SPA-${item.profile.className}-${String(idx + 1).padStart(2, '0')}`;
        return `"${idx + 1}","${studentCode}","${item.profile.nickname}","${item.profile.className}","${item.profile.grade}","${item.pin}","${item.profile.greenPoints}","${teacherName}"`;
      })
      .join('\n');

    const blob = new Blob([bom + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Danh_Sach_Cap_Ma_Hoc_Sinh_Sa_Pa_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast?.('Đã tải xuống file CSV! 📥', 'File đã lưu về máy tính của bạn.', 'success');
  };

  // Print view
  const handlePrint = () => {
    playSound('click');
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-teal-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-teal-900 text-white p-5 sm:p-6 flex items-start justify-between shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-400/20 text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full mb-1.5 border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>HỆ THỐNG CÔNG DÂN SỐ XANH SA PA • 35 LỚP HỌC (1A1 - 5A7)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-300" />
              <span>Tự Động Tạo Danh Sách Nhiều Học Sinh Cùng Lúc</span>
            </h2>
            <p className="text-xs text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
              Cấp hàng loạt mã định danh an toàn <strong>SPA-LỚP-STT</strong> và mã PIN 4 số cho học sinh tiểu học (Zero-PII, không cần email cá nhân).
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {!generatedList ? (
            <>
              {/* Tabs Switcher */}
              <div className="flex border-b border-slate-200 pb-1 gap-2">
                <button
                  onClick={() => {
                    playSound('click');
                    setActiveTab('auto');
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
                    activeTab === 'auto'
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Tự Động Sinh Danh Sách Nhanh Theo Lớp</span>
                </button>

                <button
                  onClick={() => {
                    playSound('click');
                    setActiveTab('paste');
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
                    activeTab === 'paste'
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Dán Danh Sách Họ Tên Từ Excel / Word</span>
                </button>
              </div>

              {/* TAB 1: AUTO GENERATE */}
              {activeTab === 'auto' && (
                <div className="space-y-5 text-xs">
                  {/* Select Scope */}
                  <div>
                    <label className="font-extrabold text-slate-800 block mb-1.5 flex items-center justify-between">
                      <span>Phạm Vi Áp Dụng:</span>
                      <span className="text-[11px] text-teal-700 font-semibold">
                        {targetScope === 'ALL' ? 'Toàn bộ 35 lớp từ 1A1 đến 5A7' : `Chỉ áp dụng lớp ${targetScope}`}
                      </span>
                    </label>
                    <select
                      value={targetScope}
                      onChange={(e) => setTargetScope(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 font-bold text-slate-800 focus:outline-hidden focus:border-teal-600"
                    >
                      <option value="ALL">🌟 TẤT CẢ 35 LỚP HỌC (Từ 1A1 đến 5A7 - Toàn trường)</option>
                      <optgroup label="Khối 1 (7 Lớp: 1A1 - 1A7)">
                        {['1A1', '1A2', '1A3', '1A4', '1A5', '1A6', '1A7'].map(c => (
                          <option key={c} value={c}>Lớp {c}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Khối 2 (7 Lớp: 2A1 - 2A7)">
                        {['2A1', '2A2', '2A3', '2A4', '2A5', '2A6', '2A7'].map(c => (
                          <option key={c} value={c}>Lớp {c}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Khối 3 (7 Lớp: 3A1 - 3A7)">
                        {['3A1', '3A2', '3A3', '3A4', '3A5', '3A6', '3A7'].map(c => (
                          <option key={c} value={c}>Lớp {c}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Khối 4 (7 Lớp: 4A1 - 4A7)">
                        {['4A1', '4A2', '4A3', '4A4', '4A5', '4A6', '4A7'].map(c => (
                          <option key={c} value={c}>Lớp {c}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Khối 5 (7 Lớp: 5A1 - 5A7)">
                        {['5A1', '5A2', '5A3', '5A4', '5A5', '5A6', '5A7'].map(c => (
                          <option key={c} value={c}>Lớp {c}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Count per class */}
                  <div>
                    <label className="font-extrabold text-slate-800 block mb-1.5 flex items-center justify-between">
                      <span>Số Lượng Học Sinh Cần Tạo Cho Mỗi Lớp:</span>
                      <span className="text-[11px] font-bold text-emerald-700">
                        {countPerClass} em / lớp
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {[5, 10, 15, 20, 25, 30, 35].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setCountPerClass(num)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                            countPerClass === num
                              ? 'bg-teal-700 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {num} em
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={countPerClass}
                      onChange={(e) => setCountPerClass(Math.max(1, Math.min(50, Number(e.target.value))))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold focus:outline-hidden"
                    />
                  </div>

                  {/* PIN & Initial points */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-extrabold text-slate-800 block mb-1.5">
                        Kiểu Mã PIN Đăng Nhập (4 số):
                      </label>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setPinType('fixed')}
                          className={`p-2 rounded-xl text-center font-bold text-xs ${
                            pinType === 'fixed'
                              ? 'bg-teal-700 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          Đồng bộ (1234)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPinType('random')}
                          className={`p-2 rounded-xl text-center font-bold text-xs ${
                            pinType === 'random'
                              ? 'bg-teal-700 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          Ngẫu nhiên (4 số)
                        </button>
                      </div>
                      {pinType === 'fixed' && (
                        <input
                          type="text"
                          maxLength={6}
                          value={defaultPin}
                          onChange={(e) => setDefaultPin(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold"
                          placeholder="Mã PIN mặc định (VD: 1234)"
                        />
                      )}
                    </div>

                    <div>
                      <label className="font-extrabold text-slate-800 block mb-1.5">
                        Điểm Xanh Khởi Tạo:
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        step={10}
                        value={initialPoints}
                        onChange={(e) => setInitialPoints(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold focus:outline-hidden"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Tặng điểm khuyến khích học sinh tham gia rèn luyện nếp sống xanh
                      </span>
                    </div>
                  </div>

                  {/* Summary Callout */}
                  <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-teal-900 block">
                        Dự Kiến Khởi Tạo:
                      </span>
                      <span className="text-sm font-black text-teal-800">
                        {targetScope === 'ALL'
                          ? `35 Lớp × ${countPerClass} em = ${35 * countPerClass} học sinh toàn trường`
                          : `Lớp ${targetScope}: ${countPerClass} học sinh`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-teal-700 block font-semibold">
                        Chuẩn mã định danh:
                      </span>
                      <span className="font-mono text-xs font-extrabold bg-teal-200 text-teal-950 px-2 py-0.5 rounded">
                        SPA-[LỚP]-STT
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-2xl text-slate-600 hover:bg-slate-100 font-bold"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={handleRunAutoGenerate}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white font-black shadow-md shadow-teal-700/20"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Đang Khởi Tạo...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Tự Động Tạo Danh Sách Ngay</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: PASTE / TEXT IMPORT */}
              {activeTab === 'paste' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-extrabold text-slate-800 block mb-1.5">
                      Chọn Lớp Học Tiếp Nhận Danh Sách:
                    </label>
                    <select
                      value={pastedClass}
                      onChange={(e) => setPastedClass(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 font-bold text-slate-800 focus:outline-hidden"
                    >
                      {classList.map(c => (
                        <option key={c} value={c}>Lớp {c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-extrabold text-slate-800">
                        Dán Danh Sách Họ Tên Học Sinh (Mỗi em một dòng):
                      </label>
                      <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                        Đã nhận diện: {parsedNamesCount} học sinh
                      </span>
                    </div>
                    <textarea
                      rows={8}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder={`Ví dụ copy từ Excel hoặc Word dán vào đây:
1. Nguyễn Bảo Nam
2. Trần Phương Linh
3. Vàng A Dũng
4. Giàng Thị Mây
5. Chảo A San
6. Lê Gia Huy`}
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 font-mono text-xs focus:outline-hidden focus:border-teal-600"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      💡 Mẹo: Hệ thống tự động loại bỏ số thứ tự ("1.", "01 -"), khoảng trắng thừa và dòng trống.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Mã PIN Ban Đầu:
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={defaultPin}
                        onChange={(e) => setDefaultPin(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Điểm Xanh Khởi Tạo:
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={initialPoints}
                        onChange={(e) => setInitialPoints(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-2xl text-slate-600 hover:bg-slate-100 font-bold"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      type="button"
                      disabled={parsedNamesCount === 0 || isGenerating}
                      onClick={handleRunPasteGenerate}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white font-black shadow-md shadow-teal-700/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Tạo Mã Cho {parsedNamesCount} Học Sinh</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* RESULT TABLE & EXPORT ACTIONS */
            <div className="space-y-4">
              {/* Success Banner */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-emerald-900 text-sm">
                      Đã Tạo Thành Công {generatedList.length} Hồ Sơ Học Sinh!
                    </h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Dữ liệu đã được lưu vào hệ thống và sẵn sàng để học sinh đăng nhập.
                    </p>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleCopyClipboard}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-300 transition-all shadow-2xs"
                  >
                    {copiedState ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedState ? 'Đã Sao Chép!' : 'Sao Chép'}</span>
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs transition-all shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải File CSV</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In Danh Sách</span>
                  </button>
                </div>
              </div>

              {/* Table of Generated Students */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[46vh] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">STT</th>
                      <th className="py-2.5 px-3">Mã Học Sinh</th>
                      <th className="py-2.5 px-3">Họ Và Tên</th>
                      <th className="py-2.5 px-3">Lớp</th>
                      <th className="py-2.5 px-3">Mã PIN</th>
                      <th className="py-2.5 px-3">Điểm Khởi Đầu</th>
                      <th className="py-2.5 px-3 text-center">Biểu Tượng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {generatedList.map((item, idx) => {
                      const studentCode = `SPA-${item.profile.className}-${String(idx + 1).padStart(2, '0')}`;
                      return (
                        <tr key={item.profile.id} className="hover:bg-teal-50/40 transition-colors">
                          <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                          <td className="py-2 px-3 font-mono font-bold text-teal-800 bg-teal-50/50">
                            {studentCode}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900">{item.profile.nickname}</td>
                          <td className="py-2 px-3 font-extrabold text-emerald-700">Lớp {item.profile.className}</td>
                          <td className="py-2 px-3 font-mono font-black text-amber-700">{item.pin}</td>
                          <td className="py-2 px-3 text-emerald-600 font-bold">+{item.profile.greenPoints}</td>
                          <td className="py-2 px-3 text-center text-base">{item.profile.avatar}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGeneratedList(null)}
                  className="flex items-center gap-1.5 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Tạo Tiếp Danh Sách Khác</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-2xl bg-teal-700 hover:bg-teal-600 text-white font-extrabold text-xs shadow-md shadow-teal-700/20"
                >
                  Hoàn Tất & Đóng Cửa Sổ
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
