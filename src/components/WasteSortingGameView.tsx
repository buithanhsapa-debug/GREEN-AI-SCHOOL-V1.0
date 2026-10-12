import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Award,
  Heart,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  Volume2,
  VolumeX,
  BookOpen,
  Info,
  X,
  Play
} from 'lucide-react';
import { BinInfo, StudentProfile, WasteCategory, WasteItem } from '../types';
import { BINS, WASTE_ITEMS } from '../data/wasteData';
import { storageService } from '../services/storageService';
import { playSound, isSoundEnabled, setSoundEnabled } from '../utils/audio';

interface WasteSortingGameViewProps {
  activeProfile: StudentProfile;
  onProfileUpdated: (updated: StudentProfile) => void;
  onShowToast?: (title: string, desc?: string, type?: 'success' | 'reward' | 'info' | 'error') => void;
}

export const WasteSortingGameView: React.FC<WasteSortingGameViewProps> = ({
  activeProfile,
  onProfileUpdated,
  onShowToast,
}) => {
  // Game session states
  const [deck, setDeck] = useState<WasteItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [hearts, setHearts] = useState<number>(3);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [lastFeedback, setLastFeedback] = useState<{
    isCorrect: boolean;
    item: WasteItem;
    binName: string;
  } | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [draggedOverBin, setDraggedOverBin] = useState<WasteCategory | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled());

  // Material Group filter/badge mapping
  const getMaterialGroupBadge = (group?: string) => {
    switch (group) {
      case 'giấy':
        return { label: 'Vật liệu: Giấy', color: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'nhựa':
        return { label: 'Vật liệu: Nhựa', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'kim_loại':
        return { label: 'Vật liệu: Kim Loại', color: 'bg-slate-200 text-slate-900 border-slate-400' };
      case 'hữu_cơ':
        return { label: 'Vật liệu: Rác Hữu Cơ', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      default:
        return { label: 'Vật liệu hỗn hợp / Khác', color: 'bg-purple-100 text-purple-900 border-purple-300' };
    }
  };

  // Initialize a new round of 10 shuffled items containing a balance of materials
  const startNewGame = () => {
    playSound('click');
    // Ensure diverse sampling across materials
    const shuffled = [...WASTE_ITEMS].sort(() => 0.5 - Math.random()).slice(0, 10);
    setDeck(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setHearts(3);
    setCorrectCount(0);
    setLastFeedback(null);
    setIsGameOver(false);
    setIsVictory(false);
    setIsDragging(false);
    setDraggedOverBin(null);
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playSound('click');
  };

  const currentItem = deck[currentIndex];

  // Logic to process a sort attempt
  const handleSort = (targetCategory: WasteCategory) => {
    if (!currentItem || isGameOver || isVictory) return;

    const isCorrect = currentItem.category === targetCategory;
    const targetBin = BINS.find(b => b.id === targetCategory);

    if (isCorrect) {
      const newStreak = streak + 1;
      const points = 10 + (newStreak > 2 ? 5 : 0);
      setScore(prev => prev + points);
      setStreak(newStreak);
      setCorrectCount(prev => prev + 1);

      if (newStreak >= 3) {
        playSound('combo');
      } else {
        playSound('correct');
      }

      setLastFeedback({
        isCorrect: true,
        item: currentItem,
        binName: targetBin?.name || '',
      });
    } else {
      playSound('wrong');
      const newHearts = hearts - 1;
      setHearts(newHearts);
      setStreak(0);

      setLastFeedback({
        isCorrect: false,
        item: currentItem,
        binName: targetBin?.name || '',
      });

      if (newHearts <= 0) {
        setIsGameOver(true);
        recordGameEnd(score, correctCount, false);
        return;
      }
    }

    // Move to next item or finish game
    const nextIdx = currentIndex + 1;
    if (nextIdx >= deck.length) {
      setIsVictory(true);
      playSound('victory');
      const finalScore = score + (isCorrect ? 10 : 0);
      const finalCorrect = correctCount + (isCorrect ? 1 : 0);
      recordGameEnd(finalScore, finalCorrect, true);
    } else {
      setCurrentIndex(nextIdx);
    }
  };

  const recordGameEnd = (finalScore: number, finalCorrectCount: number, isWin: boolean) => {
    const earnedPoints = Math.round(finalScore * 0.8) + (isWin ? 30 : 10);
    const badge = isWin ? 'Hiệp Sĩ Phân Loại Rác Sa Pa' : 'Hạt Mầm Cố Gắng';

    // 1. Record in General Activities
    storageService.addActivity({
      studentId: activeProfile.id,
      studentNickname: activeProfile.nickname,
      className: activeProfile.className,
      grade: activeProfile.grade,
      activityType: 'waste_sorting',
      title: 'Đấu trường phân loại rác Sa Pa',
      score: finalScore,
      maxScore: 100,
      greenPointsEarned: earnedPoints,
      details: isWin
        ? `Chiến thắng trọn vẹn ${finalCorrectCount}/10 câu đúng!`
        : `Đúng ${finalCorrectCount}/${currentIndex + 1} câu`,
    });

    // 2. Record in Game History
    storageService.addGameHistory({
      gameType: 'waste_sorting',
      gameTitle: 'Phân Loại Rác Thông Minh',
      score: finalScore,
      maxScore: 100,
      correctAnswers: finalCorrectCount,
      totalQuestions: deck.length,
      badge: isWin ? badge : undefined,
      studentNickname: activeProfile.nickname,
      className: activeProfile.className,
    });

    onProfileUpdated(storageService.getActiveProfile());

    if (onShowToast) {
      onShowToast(
        isWin ? 'Chiến thắng phân loại rác! 🏆' : 'Kết thúc lượt chơi 🌱',
        `Bạn nhận được +${earnedPoints} Điểm Xanh`,
        isWin ? 'reward' : 'info'
      );
    }
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', currentItem.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedOverBin(null);
  };

  const handleDragOver = (e: React.DragEvent, binId: WasteCategory) => {
    e.preventDefault();
    setDraggedOverBin(binId);
  };

  const handleDragLeave = () => {
    setDraggedOverBin(null);
  };

  const handleDrop = (e: React.DragEvent, binId: WasteCategory) => {
    e.preventDefault();
    setIsDragging(false);
    setDraggedOverBin(null);
    handleSort(binId);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Controls & Status Bar */}
      <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
              <span>♻️</span>
              <span>Đấu Trường Phân Loại Rác Sa Pa</span>
            </h2>
            <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Lượt {Math.min(currentIndex + 1, deck.length)}/{deck.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kéo thả hoặc bấm vào thùng rác phù hợp: Giấy, Nhựa, Kim loại, Hữu cơ & Nguy hại
          </p>
        </div>

        {/* Stats Pill & Controls */}
        <div className="flex items-center gap-3">
          {/* Instructions Button */}
          <button
            onClick={() => setShowInstructions(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 transition-all"
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Hướng dẫn chơi</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundOn ? 'Tắt âm thanh' : 'Bật âm thanh'}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition-all border border-slate-200"
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-500" />}
          </button>

          {/* Stats Bar */}
          <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200">
            {/* Hearts (Lives) */}
            <div className="flex items-center gap-1" title="Số lượt sai còn lại (3 tim)">
              {[1, 2, 3].map((h) => (
                <Heart
                  key={h}
                  className={`w-5 h-5 transition-transform ${
                    h <= hearts ? 'text-rose-500 fill-rose-500 scale-105' : 'text-slate-300'
                  }`}
                />
              ))}
            </div>

            <div className="h-4 w-px bg-emerald-200" />

            {/* Score */}
            <div className="text-center">
              <span className="text-[10px] text-emerald-700 font-bold uppercase block">Điểm</span>
              <span className="text-lg font-black text-emerald-900 leading-none">{score}</span>
            </div>

            {/* Streak Combo */}
            {streak >= 2 && (
              <div className="flex items-center gap-1 bg-amber-400 text-slate-900 font-black text-xs px-2.5 py-1 rounded-xl animate-bounce">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Combo x{streak}!</span>
              </div>
            )}

            {/* Reset */}
            <button
              onClick={startNewGame}
              title="Chơi lại ván mới"
              className="p-1.5 rounded-xl hover:bg-emerald-200/60 text-emerald-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Playing Stage */}
      {!isGameOver && !isVictory && currentItem && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Current Draggable Item Token Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border-2 border-emerald-300 shadow-md text-center flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-3 left-4 text-xs font-bold text-slate-400">
              Món rác #{currentIndex + 1}
            </div>

            {/* Material Group Pill */}
            {(() => {
              const matBadge = getMaterialGroupBadge(currentItem.materialGroup);
              return (
                <div className={`text-xs font-extrabold px-3 py-1 rounded-full mb-3 border ${matBadge.color}`}>
                  {matBadge.label}
                </div>
              );
            })()}

            {/* Draggable Card */}
            <div
              draggable
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              className={`w-40 h-40 sm:w-48 sm:h-48 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 border-3 border-dashed border-emerald-400 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 transition-all shadow-md select-none p-3 ${
                isDragging ? 'opacity-40 scale-95 border-emerald-600' : ''
              }`}
            >
              <span className="text-6xl sm:text-7xl group-hover:scale-110 transition-transform drop-shadow-sm">
                {currentItem.emoji}
              </span>
              <span className="text-sm font-extrabold text-slate-800 mt-2 text-center line-clamp-2">
                {currentItem.name}
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2 font-bold flex items-center gap-1">
              <span>👆 Kéo vào thùng hoặc chạm vào nút bên dưới</span>
            </p>

            {/* Description & Decomposition Time */}
            <p className="text-xs text-slate-600 mt-3 font-medium px-4 leading-relaxed">
              "{currentItem.description}"
            </p>

            <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl font-medium">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Thời gian phân hủy tự nhiên: <strong>{currentItem.decomposeTime}</strong></span>
            </div>
          </div>

          {/* 4 Waste Bins Drop & Tap Targets */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BINS.map((bin) => {
              const isOver = draggedOverBin === bin.id;
              return (
                <div
                  key={bin.id}
                  onDragOver={(e) => handleDragOver(e, bin.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, bin.id)}
                  onClick={() => handleSort(bin.id)}
                  className={`p-5 rounded-3xl border-3 transition-all cursor-pointer select-none flex flex-col justify-between min-h-[180px] ${
                    isOver
                      ? 'scale-105 border-emerald-600 bg-emerald-200 shadow-xl ring-4 ring-emerald-300'
                      : bin.bgColor
                  } hover:shadow-md active:scale-98`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-3xl">{bin.icon}</span>
                      <h3 className="font-black text-base mt-2 tracking-tight">
                        {bin.name}
                      </h3>
                      <p className="text-xs opacity-90 font-medium">{bin.subName}</p>
                    </div>

                    <button
                      className="text-xs font-black bg-white/90 hover:bg-white text-slate-800 px-3 py-1.5 rounded-xl shadow-xs shrink-0 transition-transform hover:scale-105 active:scale-95"
                    >
                      Bỏ vào đây ⬇️
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-black/10 text-[11px] opacity-80 leading-relaxed">
                    <strong>Nhóm vật liệu:</strong> {bin.examples}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Immediate Educational Feedback Drawer */}
      {lastFeedback && !isGameOver && !isVictory && (
        <div
          className={`p-4 sm:p-5 rounded-3xl border animate-in slide-in-from-bottom-2 duration-150 flex items-start sm:items-center justify-between gap-4 ${
            lastFeedback.isCorrect
              ? 'bg-emerald-50/95 border-emerald-300 text-emerald-950 shadow-sm'
              : 'bg-rose-50/95 border-rose-300 text-rose-950 shadow-sm'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl mt-0.5">
              {lastFeedback.isCorrect ? '✅' : '❌'}
            </span>
            <div>
              <div className="font-black text-sm sm:text-base flex flex-wrap items-center gap-2">
                <span>
                  {lastFeedback.isCorrect ? 'Chính xác rồi! Hoan hô bạn!' : 'Chưa đúng rồi bạn ơi!'}
                </span>
                <span className="text-xs bg-white px-2.5 py-0.5 rounded-full font-bold border border-black/10">
                  {lastFeedback.item.name} ➔ {BINS.find(b => b.id === lastFeedback.item.category)?.name}
                </span>
              </div>
              <p className="text-xs mt-1.5 leading-relaxed opacity-90 font-medium">
                💡 <strong>Kiến thức môi trường:</strong> {lastFeedback.item.funFact}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Victory Celebration Modal */}
      {isVictory && (
        <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border-2 border-amber-300 shadow-2xl max-w-lg mx-auto space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-white flex items-center justify-center text-5xl mx-auto shadow-lg shadow-amber-400/30 animate-bounce">
            👑
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800">
              Chiến Thắng Xuất Sắc!
            </h3>
            <p className="text-emerald-700 font-extrabold text-sm mt-1">
              Bạn {activeProfile.nickname} đã hoàn thành phân loại rác bảo vệ Sa Pa!
            </p>
          </div>

          <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 space-y-2">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Tổng kết thành tích
            </div>
            <div className="text-4xl font-black text-emerald-800">
              {score} Điểm
            </div>
            <div className="text-xs text-slate-600 font-semibold">
              Đúng {correctCount} / {deck.length} món rác
            </div>
            <div className="text-xs text-amber-700 font-bold flex items-center justify-center gap-1 mt-1">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Được vinh danh huy hiệu: <strong>"Hiệp Sĩ Phân Loại Rác Sa Pa"</strong></span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={startNewGame}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-emerald-600/25 transition-all text-sm hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Chơi Lại Ván Mới</span>
            </button>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border border-rose-200 shadow-xl max-w-lg mx-auto space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-4xl mx-auto">
            🌱
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-800">
              Hết Lượt Thử Rồi!
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Đừng buồn nhé bạn {activeProfile.nickname}, hãy đọc lại hướng dẫn phân loại và thử lại nhé!
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="text-xs text-slate-500 font-bold">Điểm đạt được:</div>
            <div className="text-3xl font-black text-slate-800 mt-1">{score} Điểm</div>
            <div className="text-xs text-slate-500 mt-1">Đúng {correctCount} món rác</div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={startNewGame}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3 rounded-2xl shadow-md shadow-emerald-600/20 transition-all text-sm hover:scale-105 active:scale-95"
            >
              Thử Lại Ngay Nào
            </button>
            <button
              onClick={() => setShowInstructions(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-3 rounded-2xl text-xs transition-all"
            >
              Xem Lại Hướng Dẫn
            </button>
          </div>
        </div>
      )}

      {/* Instructions & Sorting Rules Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-emerald-100 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📖</span>
                <h3 className="text-lg font-black text-slate-800">
                  Hướng Dẫn Phân Loại Rác Chuẩn Sa Pa
                </h3>
              </div>
              <button
                onClick={() => setShowInstructions(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Explanation of 4 bins & materials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                  <span>🌱</span>
                  <span>1. RÁC HỮU CƠ (Xanh Lá)</span>
                </div>
                <p className="text-emerald-800 font-medium">
                  Rau củ thừa, vỏ quả chuối, cơm thừa, lá cây rụng, bã chè. Mau tan trong đất và ủ thành phân hữu cơ bón hoa Sa Pa!
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
                  <span>♻️</span>
                  <span>2. RÁC TÁI CHẾ (Vàng)</span>
                </div>
                <p className="text-amber-800 font-medium">
                  Bao gồm 3 nhóm vật liệu chính:
                  <br />• <strong>Giấy</strong>: Giấy vở cũ, hộp sữa giấy, thùng bìa.
                  <br />• <strong>Nhựa</strong>: Chai nước suối trong, hộp nhựa sạch.
                  <br />• <strong>Kim loại</strong>: Vỏ lon nhôm, hộp cá sắt.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-300 space-y-1">
                <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <span>🗑️</span>
                  <span>3. RÁC VÔ CƠ / CÒN LẠI (Xám)</span>
                </div>
                <p className="text-slate-700 font-medium">
                  Túi nilon rách dính dầu mỡ, hộp xốp bẩn dùng 1 lần, vỏ bánh kẹo màng bóng, ống hút nhựa, khẩu trang y tế.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-1">
                <div className="font-extrabold text-rose-900 flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>4. RÁC NGUY HẠI (Đỏ)</span>
                </div>
                <p className="text-rose-800 font-medium">
                  Cục pin tiểu hết điện, bóng đèn tuýp hỏng, nhiệt kế vỡ. Chứa kim loại độc, tuyệt đối gom riêng nộp thầy cô!
                </p>
              </div>
            </div>

            {/* How to play */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
              <div className="font-black text-slate-900">Cách thao tác:</div>
              <p>• <strong>Kéo thả</strong>: Dùng chuột hoặc ngón tay kéo thẻ vật thể vào đúng 1 trong 4 thùng rác.</p>
              <p>• <strong>Chạm nhanh</strong>: Bấm trực tiếp vào nút "Bỏ vào đây ⬇️" trên thùng rác em chọn.</p>
              <p>• Trả lời đúng liên tiếp để đạt <strong>Combo x2, x3</strong> nhận thêm nhiều điểm thưởng!</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowInstructions(false)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all"
              >
                Đã hiểu, vào chơi ngay! 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
