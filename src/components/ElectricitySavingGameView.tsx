import React, { useState } from 'react';
import {
  Zap,
  CheckCircle2,
  XCircle,
  Award,
  RefreshCw,
  Volume2,
  VolumeX,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { StudentProfile } from '../types';
import { ELECTRICITY_SCENARIOS, ElectricityScenario } from '../data/gameScenariosData';
import { storageService } from '../services/storageService';
import { playSound, isSoundEnabled, setSoundEnabled } from '../utils/audio';

interface ElectricitySavingGameViewProps {
  activeProfile: StudentProfile;
  onProfileUpdated: (updated: StudentProfile) => void;
  onShowToast?: (title: string, desc?: string, type?: 'success' | 'reward' | 'info' | 'error') => void;
}

export const ElectricitySavingGameView: React.FC<ElectricitySavingGameViewProps> = ({
  activeProfile,
  onProfileUpdated,
  onShowToast,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const currentScenario: ElectricityScenario = ELECTRICITY_SCENARIOS[currentIndex];

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playSound('click');
  };

  const handleSelectOption = (optId: string) => {
    if (selectedOptionId !== null) return;
    setSelectedOptionId(optId);

    const chosen = currentScenario.options.find(o => o.id === optId);
    if (chosen?.isCorrect) {
      playSound('correct');
      setScore(prev => prev + 25);
      setCorrectCount(prev => prev + 1);
    } else {
      playSound('wrong');
    }
  };

  const handleNext = () => {
    playSound('click');
    if (currentIndex < ELECTRICITY_SCENARIOS.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOptionId(null);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    setIsFinished(true);
    const finalScore = score + (selectedOptionId ? (currentScenario.options.find(o => o.id === selectedOptionId)?.isCorrect ? 25 : 0) : 0);
    const finalCorrect = correctCount + (selectedOptionId ? (currentScenario.options.find(o => o.id === selectedOptionId)?.isCorrect ? 1 : 0) : 0);

    playSound(finalScore >= 75 ? 'victory' : 'combo');

    const pointsEarned = finalCorrect * 25 + 20;

    // Save Activity
    storageService.addActivity({
      studentId: activeProfile.id,
      studentNickname: activeProfile.nickname,
      className: activeProfile.className,
      grade: activeProfile.grade,
      activityType: 'electricity_saving',
      title: 'Trường học tiết kiệm điện Sa Pa',
      score: finalScore,
      maxScore: 100,
      greenPointsEarned: pointsEarned,
      details: `Đạt ${finalCorrect}/${ELECTRICITY_SCENARIOS.length} tình huống an toàn & tiết kiệm điện`,
    });

    // Save Game History
    storageService.addGameHistory({
      gameType: 'electricity_saving',
      gameTitle: 'Trường Học Tiết Kiệm Điện',
      score: finalScore,
      maxScore: 100,
      correctAnswers: finalCorrect,
      totalQuestions: ELECTRICITY_SCENARIOS.length,
      badge: finalScore >= 75 ? 'Hiệp Sĩ Năng Lượng Xanh' : 'Chiến Sĩ Tiết Kiệm Điện',
      studentNickname: activeProfile.nickname,
      className: activeProfile.className,
    });

    onProfileUpdated(storageService.getActiveProfile());

    if (onShowToast) {
      onShowToast(
        'Hoàn thành bài học tiết kiệm điện! ⚡',
        `Bạn nhận được +${pointsEarned} Điểm Xanh`,
        'reward'
      );
    }
  };

  const resetGame = () => {
    playSound('click');
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setScore(0);
    setCorrectCount(0);
    setIsFinished(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-amber-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
              <span>⚡</span>
              <span>Trường Học Tiết Kiệm & An Toàn Điện</span>
            </h2>
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Tình huống {currentIndex + 1}/{ELECTRICITY_SCENARIOS.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ứng dụng công nghệ xanh, bảo vệ an toàn điện cho học sinh tiểu học
          </p>
        </div>

        {/* Stats & Sound */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-amber-50 text-slate-700 transition-all border border-slate-200"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-amber-600" /> : <VolumeX className="w-4 h-4 text-rose-500" />}
          </button>

          <div className="flex items-center gap-3 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200">
            <div className="text-center">
              <span className="text-[10px] text-amber-700 font-bold uppercase block">Điểm Số</span>
              <span className="text-base font-black text-amber-900 leading-none">{score}/100</span>
            </div>
            <div className="h-4 w-px bg-amber-200" />
            <div className="text-center">
              <span className="text-[10px] text-amber-700 font-bold uppercase block">Đúng</span>
              <span className="text-base font-black text-amber-900 leading-none">{correctCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Stage */}
      {!isFinished && currentScenario && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentScenario.icon}</span>
              <div>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Khu vực: {currentScenario.location}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 mt-1">
                  {currentScenario.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>An toàn điện là số 1</span>
            </div>
          </div>

          {/* Situation Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200 text-slate-800 text-sm sm:text-base leading-relaxed font-semibold">
            "{currentScenario.situation}"
          </div>

          <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            👉 Hành vi sử dụng an toàn và tiết kiệm điện nhất là:
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {currentScenario.options.map((opt, idx) => {
              const isSelected = selectedOptionId === opt.id;
              const isAnswered = selectedOptionId !== null;

              let style = 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-800';
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
                      <div className="mt-2 pt-2 border-t border-black/10 space-y-1">
                        <p className="text-xs font-medium">
                          💡 <strong>Bài học:</strong> {opt.explanation}
                        </p>
                        {opt.safetyNotice && (
                          <p className="text-xs font-black text-rose-700 flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                            <span>{opt.safetyNotice}</span>
                          </p>
                        )}
                      </div>
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
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-7 py-3 rounded-2xl shadow-lg shadow-amber-500/25 text-sm transition-all hover:scale-105 active:scale-95"
              >
                <span>{currentIndex === ELECTRICITY_SCENARIOS.length - 1 ? 'Xem Kết Quả' : 'Tình Huống Tiếp Theo'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Completion Modal */}
      {isFinished && (
        <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border-2 border-amber-300 shadow-2xl max-w-lg mx-auto space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center text-5xl mx-auto shadow-lg shadow-amber-400/30 animate-bounce">
            ⚡
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800">
              Xuất Sắc Hoàn Thành!
            </h3>
            <p className="text-amber-800 font-extrabold text-sm mt-1">
              Bạn {activeProfile.nickname} đã nắm vững quy tắc sử dụng an toàn và tiết kiệm điện
            </p>
          </div>

          <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 space-y-2">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Tổng kết điểm số
            </div>
            <div className="text-4xl font-black text-amber-900">
              {score} / 100 Điểm
            </div>
            <div className="text-xs text-slate-600 font-semibold">
              Đúng {correctCount} / {ELECTRICITY_SCENARIOS.length} tình huống an toàn điện
            </div>
            <div className="text-xs text-amber-800 font-bold flex items-center justify-center gap-1 mt-1">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Được trao huy hiệu: <strong>"Hiệp Sĩ Năng Lượng Xanh"</strong></span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={resetGame}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-8 py-3 rounded-2xl shadow-lg shadow-amber-500/25 transition-all text-sm hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Luyện Tập Lại</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
