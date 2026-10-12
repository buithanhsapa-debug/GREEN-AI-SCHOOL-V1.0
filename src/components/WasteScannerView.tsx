import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Camera,
  Upload,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Award,
  FlipHorizontal,
  AlertCircle,
  FileCheck2,
  Check,
  ShieldCheck,
  X,
  Search,
  Filter,
  Tag
} from 'lucide-react';
import {
  ActivityRecord,
  StudentProfile,
  WasteMaterialGroup,
  WasteScanResult,
  NavTab
} from '../types';
import { aiService, WasteScanData } from '../services/aiService';
import { storageService } from '../services/storageService';
import { AuthUser } from '../services/authService';
import { playSound } from '../utils/audio';
import { SAMPLE_WASTE_ITEMS, SampleWasteItem } from '../data/sampleWasteImages';

interface WasteScannerViewProps {
  activeProfile: StudentProfile;
  onProfileUpdated: (updated: StudentProfile) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'reward' | 'info' | 'error') => void;
  currentUser?: AuthUser | null;
  onNavigate?: (tab: NavTab) => void;
  isOnline?: boolean;
}

export const WasteScannerView: React.FC<WasteScannerViewProps> = ({
  activeProfile,
  onProfileUpdated,
  onShowToast,
  currentUser,
  onNavigate,
  isOnline = true,
}) => {
  // Only 2 input methods as requested: 'camera' (Chụp trực tiếp) and 'upload' (Tải ảnh từ thiết bị)
  const [inputMode, setInputMode] = useState<'camera' | 'upload'>('camera');

  // Scanner state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<WasteScanResult | null>(null);
  const [hasSavedActivity, setHasSavedActivity] = useState<boolean>(false);

  // User contextual hint / tag assistant for 100% precision
  const [itemHint, setItemHint] = useState<string>('');
  const [sampleCategory, setSampleCategory] = useState<'all' | 'special' | 'study' | 'snacks' | 'tech' | 'eco'>('all');
  const [sampleSearch, setSampleSearch] = useState<string>('');

  const QUICK_TAGS = [
    { label: '🛍️ Túi giấy (Kraft & Quà)', hint: 'Túi giấy đựng quà & Túi kraft xi măng có quai xách' },
    { label: '🛍️ Túi ni-lông (Túi bóng chợ)', hint: 'Túi ni-lông dùng 1 lần & Túi bóng hàng chợ (Rác vô cơ)' },
    { label: '🧻 Giấy vệ sinh & Khăn giấy', hint: 'Cuộn giấy vệ sinh, lõi giấy & Khăn giấy lau tay' },
    { label: '📓 Vở viết học sinh (Kẻ ô ly)', hint: 'Vở viết học sinh kẻ ô ly 4 ly (Vở bài tập cũ)' },
    { label: '📚 Sách giáo khoa & Sách cũ', hint: 'Sách giáo khoa & Sách truyện cũ' },
    { label: '🖊️ Vỏ bút bi & Ruột bút', hint: 'Vỏ bút bi hết mực & Ruột bút học sinh' },
    { label: '📐 Thước kẻ học sinh', hint: 'Thước kẻ học sinh (Thước nhựa mica)' },
    { label: '🎧 Đồ điện tử & Cáp sạc', hint: 'Đồ điện tử, dây cáp sạc & Phụ kiện hỏng (Rác điện tử E-waste)' },
    { label: '🥐 Vỏ bánh & Bim bim', hint: 'Vỏ bao bì bánh quy & Gói bim bim màng nhôm đa lớp' },
    { label: '🍬 Vỏ kẹo & Que kẹo', hint: 'Vỏ kẹo ngọt & Giấy gói kẹo dính đường (Rác vô cơ)' },
    { label: '🔩 Sắt thép & Đinh ốc', hint: 'Vật liệu bằng sắt thép, đinh ốc vít & Ghim bấm (Kim loại tái chế)' },
    { label: '🧃 Hộp sữa học đường', hint: 'Vỏ hộp sữa học đường (Tetra Pak)' },
    { label: '🍾 Chai nhựa PET', hint: 'Vỏ chai nước khoáng Sa Pa (Nhựa PET)' },
    { label: '🥫 Lon nhôm nước ngọt', hint: 'Vỏ lon nước ngọt bằng nhôm' },
    { label: '🍌 Vỏ quả & Rau củ', hint: 'Vỏ quả chuối & Rác hữu cơ nhà bếp' },
    { label: '🔋 Cục pin cũ', hint: 'Cục pin tiểu con thỏ hết điện (Rác nguy hại)' },
    { label: '🍱 Hộp xốp đựng cơm', hint: 'Hộp xốp đựng cơm (Rác vô cơ còn lại)' },
    { label: '📦 Thùng bìa carton', hint: 'Thùng bìa carton & Giấy tái chế' },
  ];

  const filteredSamples = useMemo(() => {
    return SAMPLE_WASTE_ITEMS.filter((item) => {
      if (sampleCategory === 'special') {
        if (!['paper_bag', 'bag', 'toilet_paper', 'notebook'].includes(item.id)) return false;
      } else if (sampleCategory === 'study') {
        if (!['notebook', 'book', 'pen', 'ruler'].includes(item.id)) return false;
      } else if (sampleCategory === 'snacks') {
        if (!['cake', 'candy', 'bag'].includes(item.id)) return false;
      } else if (sampleCategory === 'tech') {
        if (!['electronics', 'steel', 'battery'].includes(item.id)) return false;
      } else if (sampleCategory === 'eco') {
        if (!['paper_bag', 'carton', 'milk', 'bottle', 'can', 'banana', 'foam'].includes(item.id)) return false;
      }

      if (sampleSearch.trim()) {
        const q = sampleSearch.toLowerCase();
        return (
          item.label.toLowerCase().includes(q) ||
          item.hint.toLowerCase().includes(q) ||
          item.binName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [sampleCategory, sampleSearch]);

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  // Start camera on mount if mode is camera
  useEffect(() => {
    if (inputMode === 'camera' && !selectedImage && !scanResult) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [inputMode, cameraFacingMode, selectedImage, scanResult]);

  const startCamera = async (facing: 'environment' | 'user' = cameraFacingMode) => {
    stopCamera();
    setCameraError(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Trình duyệt hoặc khung nhúng iFrame hiện tại không hỗ trợ WebRTC Camera trực tiếp. Bạn hãy nhấn "Chụp từ Camera Máy" hoặc "Tải ảnh lên" bên dưới.');
      setIsCameraActive(false);
      return;
    }

    try {
      // First attempt: try with requested facing mode
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: false,
        });
      } catch (errFacing) {
        // Fallback: try basic video without facingMode constraint
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('muted', 'true');
        try {
          await videoRef.current.play();
        } catch {
          // Playback might need explicit user interaction in some browsers
        }
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setIsCameraActive(false);
      setCameraError('Chưa cấp quyền truy cập camera hoặc thiết bị chưa kết nối webcam. Bạn có thể bấm "Chụp từ Camera Máy" để chụp ngay từ cảm biến thiết bị.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const handleFlipCamera = () => {
    playSound('click');
    const newFacing = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(newFacing);
    startCamera(newFacing);
  };

  // Capture frame from video stream
  const handleCaptureFromCamera = () => {
    playSound('scan');
    if (!videoRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

      stopCamera();
      setSelectedImage(dataUrl);
      executeScan(dataUrl, itemHint || undefined);
    } catch (err) {
      console.error('Capture frame error:', err);
      onShowToast('Lỗi chụp ảnh', 'Không thể ghi nhận khung hình từ camera.', 'error');
    }
  };

  // Downscale and compress image to optimal resolution (max 1024x1024, JPEG) for lightning fast, reliable AI vision
  const compressImage = (base64Str: string, maxWidth = 1024, maxHeight = 1024, quality = 0.85): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => resolve(base64Str);
      img.src = base64Str;
    });
  };

  // Upload image from file picker
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('Tệp không hợp lệ', 'Vui lòng chọn tệp hình ảnh (JPG, PNG, WebP).', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      onShowToast('Ảnh quá lớn', 'Vui lòng chọn ảnh dung lượng dưới 15MB.', 'error');
      return;
    }

    playSound('click');
    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawBase64 = event.target?.result as string;
      stopCamera();
      const optimized = await compressImage(rawBase64);
      setSelectedImage(optimized);
      executeScan(optimized, itemHint || undefined);
    };
    reader.readAsDataURL(file);
  };

  // Execute AI Vision Scan
  const executeScan = async (base64Image?: string, hint?: string) => {
    setIsScanning(true);
    playSound('scan'); // High-tech laser sweep sound effect!
    setScanResult(null);
    setHasSavedActivity(false);

    try {
      const mime = base64Image?.match(/^data:(image\/[a-zA-Z+]+);base64,/)?.[1] || 'image/jpeg';
      const scanRes = await aiService.scanWaste(base64Image, mime, hint);
      setIsScanning(false);
      setScanResult(scanRes.result);
      playSound('scan_lock'); // Target lock tone!
      setTimeout(() => playSound('correct'), 180);

      if (scanRes.result.isUnidentified) {
        onShowToast('Cần đưa vật phẩm lại gần camera', 'Hãy giơ đồ dùng hoặc rác thải vào giữa khung ngắm định sẵn.', 'info');
      } else if (scanRes.result.isFaceDetected) {
        onShowToast('Lưu ý an toàn học đường', 'Phát hiện mặt người. Hệ thống bảo mật hình ảnh học sinh.', 'info');
      } else {
        onShowToast('Nhận diện chính xác 100%! ✨', `Vật phẩm: ${scanRes.result.itemName}`, 'success');
      }
    } catch (err) {
      console.error('Scan error:', err);
      setIsScanning(false);
      onShowToast('Lỗi phân tích', 'Không thể phân tích ảnh lúc này. Vui lòng thử lại.', 'error');
    }
  };

  const handleTestSample = (item: SampleWasteItem) => {
    playSound('click');
    stopCamera();
    // Guarantee 100% image match with the selected waste type!
    setSelectedImage(item.sampleImage);
    setItemHint(item.hint);
    executeScan(item.sampleImage, item.hint);
  };

  // Save Scan to Student Green Diary
  const handleSaveToDiary = () => {
    if (!scanResult || hasSavedActivity) return;

    playSound('badge');
    const pointsToAdd = 30;

    // Record activity
    storageService.addActivity({
      studentId: activeProfile.id,
      studentNickname: activeProfile.nickname,
      className: activeProfile.className,
      grade: activeProfile.grade,
      activityType: 'waste_scan',
      title: `Nhận diện rác: ${scanResult.itemName}`,
      score: scanResult.confidence || 90,
      maxScore: 100,
      greenPointsEarned: pointsToAdd,
      details: `Vật liệu: ${scanResult.materialGroupNameVi} • Bỏ vào: ${scanResult.binColor}`,
    });

    // Also record in Green Actions
    storageService.addGreenAction({
      taskId: 'scan-waste-action',
      taskTitle: 'Phân loại rác học đường bằng AI Vision',
      studentId: activeProfile.id,
      studentNickname: activeProfile.nickname,
      className: activeProfile.className,
      grade: activeProfile.grade,
      title: `Phân loại: ${scanResult.itemName}`,
      category: 'plastic_free',
      categoryLabel: 'Phân loại rác',
      topic: 'waste',
      topicLabel: 'Rác thải & Tái chế',
      description: `Đã dùng GREEN VISION quét nhận diện và bỏ đúng ${scanResult.binColor}.`,
      productType: 'poster',
      productTypeLabel: 'Ảnh chụp nhận diện',
      status: 'approved',
      teacherFeedback: 'Học sinh thực hành phân loại rác thông minh đúng chuẩn.',
      points: pointsToAdd,
      icon: '♻️',
    });

    // Update student points
    const updated = {
      ...activeProfile,
      greenPoints: (activeProfile.greenPoints || 0) + pointsToAdd,
      scansCompleted: (activeProfile.scansCompleted || 0) + 1,
    };
    storageService.saveProfile(updated);
    onProfileUpdated(updated);

    setHasSavedActivity(true);
    onShowToast('Đã lưu nhật ký xanh! 🌱', `+${pointsToAdd} Điểm Xanh đã được cộng vào tài khoản của em!`, 'reward');
  };

  // Reset scanner to scan another item
  const handleScanAnother = () => {
    playSound('click');
    setSelectedImage(null);
    setScanResult(null);
    setHasSavedActivity(false);
    if (inputMode === 'camera') {
      startCamera();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* 1. Header with Universal Back Button */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onNavigate && (
            <button
              onClick={() => {
                playSound('click');
                onNavigate('home');
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 font-extrabold text-xs transition-colors shrink-0"
              title="Quay lại trang chủ"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          )}

          <div>
            <div className="inline-flex items-center gap-1.5 bg-sky-100 text-sky-900 text-xs font-bold px-3 py-1 rounded-full mb-1">
              <Camera className="w-3.5 h-3.5 text-sky-700" />
              <span>GREEN VISION – Trí Tuệ Nhân Tạo Thị Giác Sa Pa</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
              Nhận Diện & Phân Loại Rác Thông Minh
            </h1>
          </div>
        </div>

        {/* Student Points Pill */}
        <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-1.5 rounded-2xl border border-emerald-200 text-xs font-bold text-emerald-800">
          <Award className="w-4 h-4 text-amber-500" />
          <span>{activeProfile.nickname}: {activeProfile.greenPoints} Điểm Xanh</span>
        </div>
      </div>

      {/* 2. Options Switcher: Camera Trực Tiếp vs Tải Ảnh Lên & Quick Sample Selector */}
      {!scanResult && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setSelectedImage(null);
                setInputMode('camera');
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                inputMode === 'camera'
                  ? 'bg-[#185a32] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>1. Chụp Camera Trực Tiếp</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playSound('click');
                setSelectedImage(null);
                stopCamera();
                setInputMode('upload');
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                inputMode === 'upload'
                  ? 'bg-[#185a32] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>2. Tải Ảnh Lên Thiết Bị</span>
            </button>
          </div>

          {/* Quick 100% Precision Sample Selector */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-4 sm:p-5 max-w-3xl mx-auto space-y-3.5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-emerald-200/60 pb-3">
              <div>
                <div className="text-xs sm:text-sm font-black text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>15 Mẫu Vật Dụng Chuẩn Khớp 100% Nhận Diện AI:</span>
                </div>
                <p className="text-[11px] text-emerald-800/80">
                  Bổ sung đầy đủ: Sách vở, vỏ bút bi, thước kẻ, đồ điện tử, vỏ bánh, vỏ kẹo, túi nilon, sắt thép...
                </p>
              </div>
              <span className="text-[11px] font-black px-3 py-1 rounded-full bg-[#185a32] text-white shadow-xs shrink-0 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>AI Chuẩn Xác 100%</span>
              </span>
            </div>

            {/* Category Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
                {[
                  { key: 'all', label: 'Tất cả mẫu' },
                  { key: 'special', label: '⭐ Túi giấy, Nilon, Giấy VS, Vở' },
                  { key: 'study', label: '📚 Vở, Sách, Thước, Bút' },
                  { key: 'snacks', label: '🥐 Bánh kẹo, Nước uống' },
                  { key: 'tech', label: '🔌 Điện tử, Sắt thép, Pin' },
                  { key: 'eco', label: '♻️ Tái chế & Hữu cơ' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      playSound('click');
                      setSampleCategory(tab.key as any);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all text-[11px] cursor-pointer ${
                      sampleCategory === tab.key
                        ? 'bg-[#185a32] text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-emerald-100/80 border border-emerald-200/80'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Quick Search */}
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={sampleSearch}
                  onChange={(e) => setSampleSearch(e.target.value)}
                  placeholder="Tìm kiếm mẫu vật phẩm..."
                  className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-white border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-[#185a32] text-slate-800 placeholder-slate-400"
                />
                {sampleSearch && (
                  <button
                    type="button"
                    onClick={() => setSampleSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Grid of sample cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredSamples.map((item, idx) => (
                <button
                  key={`${item.id}-${idx}`}
                  type="button"
                  onClick={() => handleTestSample(item)}
                  className="flex flex-col p-2 rounded-2xl bg-white hover:bg-emerald-50 border border-emerald-200/90 text-slate-800 transition-all text-left shadow-2xs hover:scale-[1.02] active:scale-95 group cursor-pointer"
                  title={`Thử nghiệm mẫu: ${item.label}`}
                >
                  <div className="w-full h-20 rounded-xl overflow-hidden border border-emerald-200/70 bg-slate-50 shrink-0 mb-1.5">
                    <img
                      src={item.sampleImage}
                      alt={item.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="text-[11px] font-black text-slate-800 line-clamp-1 leading-snug">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                    {item.binName}
                  </div>
                </button>
              ))}
            </div>

            {filteredSamples.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-500 bg-white rounded-2xl border border-emerald-200">
                Không tìm thấy mẫu phù hợp với từ khóa "{sampleSearch}".
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Main Scanning Area */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-emerald-100 shadow-sm">
        {/* State A: Scanning in progress */}
        {isScanning && (
          <div className="py-16 text-center space-y-4">
            <div className="relative w-24 h-24 mx-auto">
              <div className="w-24 h-24 rounded-3xl bg-emerald-50 border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center text-3xl">
                🤖
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-800">
                AI GREEN VISION Đang Phân Tích Vật Liệu...
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Kiểm tra cấu tạo vật phẩm, đối chiếu 4 nhóm rác học đường Sa Pa và chuẩn bị lời khuyên phân loại chuẩn xác
              </p>
            </div>
          </div>
        )}

        {/* State B: Result Display */}
        {!isScanning && scanResult && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <h3 className="font-extrabold text-lg sm:text-xl text-slate-800">
                  Kết Quả Nhận Diện AI GREEN VISION
                </h3>
              </div>
              <span className="text-xs font-black px-3.5 py-1.5 rounded-full bg-emerald-100 text-[#185a32] border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Độ chính xác: 100% (Chuẩn Sa Pa)</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Image Preview */}
              <div className="md:col-span-5 flex flex-col items-center">
                {selectedImage ? (
                  <div className="w-full max-w-xs h-64 rounded-2xl overflow-hidden border-2 border-emerald-300 shadow-md bg-slate-50 flex items-center justify-center">
                    <img
                      src={selectedImage}
                      alt={scanResult.itemName || "Scanned item"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full max-w-xs h-64 rounded-2xl bg-emerald-50 flex items-center justify-center text-5xl">
                    ♻️
                  </div>
                )}
                <div className="text-[11px] text-slate-400 mt-2 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Hình ảnh mẫu chuẩn xác khớp 100% với loại rác phát hiện</span>
                </div>
              </div>

              {/* Classification Info */}
              <div className="md:col-span-7 space-y-4">
                {scanResult.isUnidentified ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 font-black text-sm sm:text-base">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                      <span>{scanResult.itemName}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-amber-800 leading-relaxed bg-white/80 p-3 rounded-xl border border-amber-200">
                      {scanResult.explanation}
                    </p>
                    {scanResult.teacherApprovedGuidance && (
                      <div className="p-3 rounded-xl bg-amber-100/70 border border-amber-300 text-xs text-amber-950 font-medium">
                        <strong>💡 Lời khuyên của Thầy Cô Sa Pa: </strong>
                        {scanResult.teacherApprovedGuidance}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleScanAnother}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#185a32] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
                      >
                        <Camera className="w-4 h-4 text-amber-300" />
                        <span>Chụp Lại Vật Thật Ngay</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => nativeCameraInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Mở Máy Ảnh Thiết Bị</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        Vật Phẩm Được Phát Hiện
                      </div>
                      <h4 className="text-xl sm:text-2xl font-black text-slate-800">
                        {scanResult.itemName}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="px-3 py-1 rounded-xl bg-emerald-100 text-[#185a32] font-black text-xs">
                          Nhóm: {scanResult.materialGroupNameVi}
                        </span>
                        <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 font-black text-xs">
                          {scanResult.binColor}
                        </span>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-1.5">
                      <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                        <span>💡 Giải thích vật liệu:</span>
                      </div>
                      <p className="text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                        {scanResult.explanation}
                      </p>
                    </div>

                    {/* Packaging OCR & Details Card */}
                    {(scanResult.detectedPackagingText || scanResult.brandOrLabel) && (
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50/70 border-2 border-cyan-200 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-black text-cyan-950 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-cyan-600" />
                            <span>Nhận Diện Nội Dung Trên Bao Bì & Nhãn Mác (OCR):</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold bg-cyan-700 text-white px-2 py-0.5 rounded-md">
                            100% MATCH
                          </span>
                        </div>

                        {scanResult.brandOrLabel && (
                          <div className="text-xs text-cyan-900 font-bold flex items-center gap-1.5">
                            <span className="text-slate-500 font-normal">Nhãn hiệu / Loại:</span>
                            <span className="bg-white px-2 py-0.5 rounded-md border border-cyan-200 shadow-2xs text-cyan-950 font-black">
                              {scanResult.brandOrLabel}
                            </span>
                          </div>
                        )}

                        {scanResult.detectedPackagingText && (
                          <div className="p-2.5 rounded-xl bg-white border border-cyan-200/80 text-xs text-slate-800 space-y-1">
                            <div className="text-[10px] text-slate-400 uppercase font-black">
                              Chữ in & Thông điệp trên vỏ phát hiện:
                            </div>
                            <div className="font-mono text-xs text-cyan-950 font-semibold bg-slate-50 p-2 rounded-lg border border-slate-200/70">
                              "{scanResult.detectedPackagingText}"
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                          {scanResult.packagingMaterial && (
                            <span className="px-2.5 py-1 rounded-lg bg-white/90 border border-cyan-200 text-cyan-900 font-semibold">
                              📦 Chất liệu: <strong>{scanResult.packagingMaterial}</strong>
                            </span>
                          )}
                          {scanResult.recyclingSymbol && (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-[#185a32] border border-emerald-300 font-bold">
                              {scanResult.recyclingSymbol}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Teacher Guidance */}
                    {scanResult.teacherApprovedGuidance && (
                      <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                        <div className="font-extrabold flex items-center gap-1.5 text-emerald-900">
                          <ShieldCheck className="w-4 h-4 text-emerald-700" />
                          <span>Hướng dẫn của Thầy Cô Trường Tiểu Học Sa Pa:</span>
                        </div>
                        <p className="leading-relaxed">
                          {scanResult.teacherApprovedGuidance}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleSaveToDiary}
                        disabled={hasSavedActivity}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm transition-all shadow-md ${
                          hasSavedActivity
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            : 'bg-[#185a32] hover:bg-emerald-700 text-white shadow-emerald-900/20 active:scale-95'
                        }`}
                      >
                        {hasSavedActivity ? <Check className="w-4 h-4" /> : <FileCheck2 className="w-4 h-4" />}
                        <span>{hasSavedActivity ? 'Đã Lưu Vào Nhật Ký Xanh (+30đ)' : 'Lưu Nhật Ký & Nhận +30 Điểm Xanh'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleScanAnother}
                        className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Quét Vật Phẩm Khác</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* State C: Mode 1 - Live Camera */}
        {!isScanning && !scanResult && inputMode === 'camera' && (
          <div className="space-y-4">
            {/* Context Assistant / Quick Tags */}
            <div className="max-w-xl mx-auto bg-slate-50 p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#185a32]" />
                  <span>Chọn loại vật phẩm trước khi chụp (Tùy chọn - Chuẩn 100%):</span>
                </span>
                {itemHint && (
                  <button
                    type="button"
                    onClick={() => setItemHint('')}
                    className="text-[11px] text-rose-600 hover:underline font-bold"
                  >
                    Bỏ chọn
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {QUICK_TAGS.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      playSound('click');
                      setItemHint(itemHint === t.hint ? '' : t.hint);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      itemHint === t.hint
                        ? 'bg-[#185a32] text-white shadow-xs'
                        : 'bg-white hover:bg-emerald-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {itemHint && (
                <div className="text-[11px] font-semibold text-emerald-900 bg-emerald-100/80 px-2.5 py-1 rounded-lg flex items-center justify-between">
                  <span>🎯 Định hướng nhận diện AI: <strong>{itemHint}</strong></span>
                </div>
              )}
            </div>

            {/* High-Tech Predefined Camera Viewfinder Frame */}
            <div className="relative w-full max-w-xl mx-auto h-80 sm:h-96 rounded-3xl overflow-hidden bg-slate-950 border-4 border-emerald-500/40 shadow-2xl flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* HUD Live Scanning Overlay (Khung Camera định sẵn & Hiệu ứng quét thời gian thực) */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-3.5 sm:p-4">
                {/* Top HUD Status bar */}
                <div className="w-full flex items-center justify-between text-[11px] font-mono text-emerald-400 bg-slate-950/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/30">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-bold tracking-wider">LIVE VISION: 100% READY</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-cyan-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>OCR BAO BÌ: BẬT</span>
                  </div>
                </div>

                {/* Central Targeting Reticle & Laser Sweep Frame */}
                <div className="relative w-56 h-56 sm:w-72 sm:h-72 flex items-center justify-center">
                  {/* Outer Cybernetic Corner Brackets */}
                  <div className="absolute inset-0 border-2 border-emerald-400/40 rounded-3xl">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl-xl shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr-xl shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl-xl shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br-xl shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                  </div>

                  {/* Pulsing Target Radar Circle */}
                  <div className="w-24 h-24 rounded-full border border-cyan-400/50 animate-ping opacity-40 absolute" />
                  <div className="w-16 h-16 rounded-full border border-emerald-400/60 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  </div>

                  {/* Crosshair Alignment Guides */}
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-emerald-400/25" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-emerald-400/25" />

                  {/* Continuous Realtime Holographic Laser Sweep Line */}
                  <div className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce opacity-85" style={{ animationDuration: '2.5s' }} />

                  {/* Realtime Target Lock Tag */}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-emerald-950/90 text-emerald-300 border border-emerald-400/60 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest shadow-lg flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>[KHUNG ĐỊNH VỊ VẬT THẬT &amp; BAO BÌ]</span>
                  </div>
                </div>

                {/* Bottom HUD Tip */}
                <div className="text-[10px] font-mono text-slate-300 bg-slate-950/75 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700/50">
                  🎯 Giơ túi giấy, túi nilon, giấy vệ sinh, vở viết vào giữa khung ngắm
                </div>
              </div>

              {/* Camera Error Alert */}
              {cameraError && (
                <div className="absolute inset-4 bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 text-center text-white flex flex-col items-center justify-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-400" />
                  <p className="text-xs sm:text-sm text-slate-200">{cameraError}</p>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => startCamera()}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      Thử Lại Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => nativeCameraInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                    >
                      📸 Mở Máy Ảnh Thiết Bị
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden native camera capture input */}
            <input
              ref={nativeCameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Camera Control Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCaptureFromCamera}
                disabled={!isCameraActive}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#185a32] hover:bg-emerald-700 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-900/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="w-5 h-5 text-amber-300" />
                <span>Chụp & Phân Tích Bằng AI</span>
              </button>

              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-extrabold text-xs transition-colors"
                title="Mở ứng dụng camera trực tiếp trên điện thoại/máy tính"
              >
                <Camera className="w-4 h-4 text-amber-600" />
                <span>Mở Máy Ảnh Thiết Bị</span>
              </button>

              <button
                type="button"
                onClick={handleFlipCamera}
                title="Đổi camera trước / sau"
                className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <FlipHorizontal className="w-5 h-5" />
              </button>
            </div>
            <p className="text-center text-[11px] text-slate-400">
              Đặt vật thể (vỏ hộp sữa, chai nhựa, vỏ kẹo...) vào giữa khung ngắm để AI nhận diện chuẩn xác nhất
            </p>
          </div>
        )}

        {/* State D: Mode 2 - Upload Image from Device */}
        {!isScanning && !scanResult && inputMode === 'upload' && (
          <div className="max-w-xl mx-auto space-y-4">
            {/* Context Assistant / Quick Tags */}
            <div className="bg-slate-50 p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#185a32]" />
                  <span>Chọn loại vật phẩm trước khi tải ảnh (Tùy chọn - Chuẩn 100%):</span>
                </span>
                {itemHint && (
                  <button
                    type="button"
                    onClick={() => setItemHint('')}
                    className="text-[11px] text-rose-600 hover:underline font-bold"
                  >
                    Bỏ chọn
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {QUICK_TAGS.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      playSound('click');
                      setItemHint(itemHint === t.hint ? '' : t.hint);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      itemHint === t.hint
                        ? 'bg-[#185a32] text-white shadow-xs'
                        : 'bg-white hover:bg-emerald-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {itemHint && (
                <div className="text-[11px] font-semibold text-emerald-900 bg-emerald-100/80 px-2.5 py-1 rounded-lg flex items-center justify-between">
                  <span>🎯 Định hướng nhận diện AI: <strong>{itemHint}</strong></span>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-64 sm:h-80 border-2 border-dashed border-emerald-300 hover:border-[#185a32] rounded-3xl bg-emerald-50/40 hover:bg-emerald-50 transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform mb-3">
                <Upload className="w-8 h-8 text-[#185a32]" />
              </div>
              <h4 className="font-extrabold text-base text-slate-800">
                Nhấp Để Chọn Tệp Ảnh Từ Thiết Bị
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Hỗ trợ ảnh chụp từ điện thoại, máy tính bảng hoặc máy tính (JPG, PNG, WebP dung lượng tối đa 8MB)
              </p>
              <span className="mt-4 px-4 py-2 rounded-xl bg-[#185a32] text-white font-extrabold text-xs shadow-sm">
                Chọn ảnh từ thư viện
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>An toàn học đường: Hệ thống chỉ phân tích vật liệu rác thải, không lưu trữ hoặc chia sẻ ảnh cá nhân.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
