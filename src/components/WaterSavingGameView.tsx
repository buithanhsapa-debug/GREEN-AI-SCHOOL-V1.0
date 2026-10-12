import React, { useState } from 'react';
import {
  Droplets,
  CheckCircle2,
  XCircle,
  Award,
  RefreshCw,
  Sparkles,
  Volume2,
  VolumeX,
  ArrowRight,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { StudentProfile } from '../types';
import { WATER_SCENARIOS, WaterScenario } from '../data/gameScenariosData';
import { storageService } from '../services/storageService';
import { playSound, isSoundEnabled, setSoundEnabled } from '../utils/audio';

interface WaterSavingGameViewProps {
  activeProfile: StudentProfile;
  onProfileUpdated: (updated: StudentProfile) => void;
  onShowToast?: (title: string, desc?: string, type?: 'success' | 'reward' | 'info' | 'error') => void;
}

export const WaterSavingGameView: React.FC<WaterSavingGameViewProps> = ({
  activeProfile,
  onProfileUpdated,
  onShowToast,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [totalWaterSaved, setTotalWaterSaved] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const currentScenario: WaterScenario = WATER_SCENARIOS[currentIndex];

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playSound('click');
  };

  const handleSelectOption = (optId: string) => {
    if (selectedOptionId !== null) return; // already answered
    setSelectedOptionId(optId);

    const chosen = currentScenario.options.find(o => o.id === optId);
    if (chosen?.isCorrect) {
      playSound('correct');
      setScore(prev => prev + 20);
      setCorrectCount(prev => prev + 1);
      setTotalWaterSaved(prev => prev + chosen.waterSavedLiters);
    } else {
      playSound('wrong');
    }
  };

  const handleNext = () => {
    playSound('click');
    if (currentIndex < WATER_SCENARIOS.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOptionId(null);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    setIsFinished(true);
    const finalScore = score + (selectedOptionId ? (currentScenario.options.find(o => o.id === selectedOptionId)?.isCorrect ? 20 : 0) : 0);
    const finalWater = totalWaterSaved + (selectedOptionId ? (currentScenario.options.find(o => o.id === selectedOptionId)?.waterSavedLiters || 0) : 0);
    const finalCorrect = correctCount + (selectedOptionId ? (currentScenario.options.find(o => o.id === selectedOptionId)?.isCorrect ? 1 : 0) : 0);

    playSound(finalScore >= 60 ? 'victory' : 'combo');

    const pointsEarned = finalCorrect * 20 + 20;

    // Save to General Activity
    storageService.addActivity({
      studentId: activeProfile.id,
      studentNickname: activeProfile.nickname,
      className: activeProfile.className,
      grade: activeProfile.grade,
      activityType: 'water_saving',
      title: 'Thử thách tiết kiệm nước Sa Pa',
      score: finalScore,
      maxScore: 100,
      greenPointsEarned: pointsEarned,
      details: `Tiết kiệm được ${finalWater}L nước ngọt (${finalCorrect}/5 câu đúng)`,
    });

    // Save to Game History
    storageService.addGameHistory({
      gameType: 'water_saving',
      gameTitle: 'Thử Thách Tiết Kiệm Nước',
      score: finalScore,
      maxScore: 100,
      correctAnswers: finalCorrect,
      totalQuestions: WATER_SCENARIOS.length,
      badge: finalScore >= 80 ? 'Giọt Nước Vàng Sa Pa' : 'Chiến Sĩ Tiết Kiệm Nước',
      studentNickname: activeProfile.nickname,
      className: activeProfile.className,
    });

    onProfileUpdated(storageService.getActiveProfile());

    if (onShowToast) {
      onShowToast(
        'Hoàn thành thử thách nước sạch! 💧',
        `Bạn đã tiết kiệm được ${finalWater} lít nước và nhận +${pointsEarned} Điểm Xanh!`,
        'reward'
      );
    }
  };

  const resetGame = () => {
    playSound('click');
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setScore(0);
    setTotalWaterSaved(0);
    setCorrectCount(0);
    setIsFinished(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
              <span>💧</span>
              <span>Thử Thách Tiết Kiệm Nước Sạch Sa Pa</span>
            </h2>
            <span className="bg-sky-100 text-sky-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Tình huống {currentIndex + 1}/{WATER_SCENARIOS.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Lựa chọn hành vi thông thái tại trường học, gia đình và bên dòng suối Mường Hoa
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-sky-50 text-slate-700 transition-all border border-slate-200"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-sky-600" /> : <VolumeX className="w-4 h-4 text-rose-500" />}
          </button>

          <div className="flex items-center gap-3 bg-sky-50 px-4 py-2 rounded-2xl border border-sky-200">
            <div className="text-center">
              <span className="text-[10px] text-sky-700 font-bold uppercase block">Đã Tiết Kiệm</span>
              <span className="text-base font-black text-sky-900 leading-none">{totalWaterSaved} Lít</span>
            </div>
            <div className="h-4 w-px bg-sky-200" />
            <div className="text-center">
              <span className="text-[10px] text-sky-700 font-bold uppercase block">Điểm</span>
              <span className="text-base font-black text-sky-900 leading-none">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Playing Stage */}
      {!isFinished && currentScenario && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-sm space-y-6">
          {/* Situation Context Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentScenario.icon}</span>
              <div>
                <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full">
                  Địa điểm: {currentScenario.location}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 mt-1">
                  {currentScenario.title}
                </h3>
              </div>
            </div>
          </div>

          {/* Situation Description Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-50 to-teal-50 border border-sky-200 text-slate-800 text-sm sm:text-base leading-relaxed font-semibold">
            "{currentScenario.situation}"
          </div>

          <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            👉 Em hãy chọn cách hành động đúng đắn nhất:
          </div>

          {/* Options Grid */}
          <div className="space-y-3">
            {currentScenario.options.map((opt, idx) => {
              const isSelected = selectedOptionId === opt.id;
              const isAnswered = selectedOptionId !== null;

              let style = 'bg-slate-50 hover:bg-sky-50 border-slate-200 text-slate-800';
              if (isAnswered) {
                if (opt.isCorrect) {
                  style = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-300';
                } else if (isSelected && !opt.isCorrect) {
                  style = 'bg-rose-50 border-rose-400 text-rose-950 font-bold';
                } else {
                  style = 'bg-slate-50 border-slate-200 opacity-50';
                }
              }

              const letter = String.fromCharCode(65 + idx);

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  disabled={isAnswered}
                  className={`w-full p-4 sm:p-5 rounded-2xl border-2 text-left transition-all flex items-start gap-3.5 text-sm ${style}`}
                >
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                    isAnswered && opt.isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {letter}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-sm sm:text-base">{opt.text}</p>
                    {isAnswered && isSelected && (
                      <p className="text-xs mt-2 pt-2 border-t border-black/10 font-medium">
                        💡 <strong>Giải thích sư phạm:</strong> {opt.explanation}
                      </p>
                    )}
                  </div>
                  {isAnswered && opt.isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-1" />}
                  {isAnswered && isSelected && !opt.isCorrect && <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-1" />}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          {selectedOptionId !== null && (
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-black px-7 py-3 rounded-2xl shadow-lg shadow-sky-600/25 text-sm transition-all hover:scale-105 active:scale-95"
              >
                <span>{currentIndex === WATER_SCENARIOS.length - 1 ? 'Xem Kết Quả' : 'Tình Huống Tiếp Theo'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Completion Modal */}
      {isFinished && (
        <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border-2 border-sky-300 shadow-2xl max-w-lg mx-auto space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-sky-400 to-teal-300 text-white flex items-center justify-center text-5xl mx-auto shadow-lg shadow-sky-400/30 animate-bounce">
            💧
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800">
              Hoàn Thành Thử Thách Nước Sạch!
            </h3>
            <p className="text-sky-700 font-extrabold text-sm mt-1">
              Bạn {activeProfile.nickname} đã xuất sắc vượt qua các tình huống bảo vệ nguồn nước Sa Pa
            </p>
          </div>

          <div className="bg-sky-50 p-5 rounded-2xl border border-sky-200 space-y-2">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Thành tích đạt được
            </div>
            <div className="text-4xl font-black text-sky-800">
              Tiết kiệm {totalWaterSaved} Lít Nước
            </div>
            <div className="text-xs text-slate-600 font-semibold">
              Trả lời đúng {correctCount} / {WATER_SCENARIOS.length} tình huống ({score} điểm)
            </div>
            <div className="text-xs text-amber-700 font-bold flex items-center justify-center gap-1 mt-1">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Được trao huy hiệu: <strong>"Giọt Nước Vàng Sa Pa"</strong></span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={resetGame}
              className="bg-sky-600 hover:bg-sky-500 text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-sky-600/25 transition-all text-sm hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Thử Thách Lại</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
