import React, { useState } from 'react';
import {
  Trees,
  CheckCircle2,
  XCircle,
  Award,
  RefreshCw,
  Sparkles,
  Volume2,
  VolumeX,
  ArrowRight,
  Heart,
  HelpCircle
} from 'lucide-react';
import { StudentProfile } from '../types';
import { TREE_ACTIONS, TreeActionScenario } from '../data/gameScenariosData';
import { storageService } from '../services/storageService';
import { playSound, isSoundEnabled, setSoundEnabled } from '../utils/audio';

interface TreeProtectionGameViewProps {
  activeProfile: StudentProfile;
  onProfileUpdated: (updated: StudentProfile) => void;
  onShowToast?: (title: string, desc?: string, type?: 'success' | 'reward' | 'info' | 'error') => void;
}

export const TreeProtectionGameView: React.FC<TreeProtectionGameViewProps> = ({
  activeProfile,
  onProfileUpdated,
  onShowToast,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userChoice, setUserChoice] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [treeGrowthStage, setTreeGrowthStage] = useState(1); // 1 to 6
  const [isFinished, setIsFinished] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const currentAction: TreeActionScenario = TREE_ACTIONS[currentIndex];

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playSound('click');
  };

  const handleChoose = (isGood: boolean) => {
    if (userChoice !== null) return;
    setUserChoice(isGood);

    const isCorrect = isGood === currentAction.isGoodBehavior;
    if (isCorrect) {
      playSound('correct');
      setScore(prev => prev + 15);
      setCorrectCount(prev => prev + 1);
      setTreeGrowthStage(prev => Math.min(6, prev + 1));
    } else {
      playSound('wrong');
    }
  };

  const handleNext = () => {
    playSound('click');
    if (currentIndex < TREE_ACTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserChoice(null);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    setIsFinished(true);
    const finalScore = score + (userChoice !== null ? (userChoice === currentAction.isGoodBehavior ? 15 : 0) : 0);
    const finalCorrect = correctCount + (userChoice !== null ? (userChoice === currentAction.isGoodBehavior ? 1 : 0) : 0);

    playSound(finalScore >= 60 ? 'victory' : 'combo');

    const pointsEarned = finalCorrect * 15 + 20;

    // Save Activity
    storageService.addActivity({
      studentId: activeProfile.id,
      studentNickname: activeProfile.nickname,
      className: activeProfile.className,
      grade: activeProfile.grade,
      activityType: 'tree_protection',
      title: 'Bảo vệ cây xanh Sa Pa',
      score: finalScore,
      maxScore: 100,
      greenPointsEarned: pointsEarned,
      details: `Nhận biết chính xác ${finalCorrect}/${TREE_ACTIONS.length} hành vi bảo vệ cây xanh`,
    });

    // Save Game History
    storageService.addGameHistory({
      gameType: 'tree_protection',
      gameTitle: 'Bảo Vệ Cây Xanh Sa Pa',
      score: finalScore,
      maxScore: 100,
      correctAnswers: finalCorrect,
      totalQuestions: TREE_ACTIONS.length,
      badge: finalScore >= 75 ? 'Vệ Sĩ Cây Rừng Hoàng Liên' : 'Bạn Thân Của Cây',
      studentNickname: activeProfile.nickname,
      className: activeProfile.className,
    });

    onProfileUpdated(storageService.getActiveProfile());

    if (onShowToast) {
      onShowToast(
        'Hoàn thành bảo vệ cây xanh! 🌲',
        `Cây của bạn đã đơm hoa và bạn nhận được +${pointsEarned} Điểm Xanh`,
        'reward'
      );
    }
  };

  const resetGame = () => {
    playSound('click');
    setCurrentIndex(0);
    setUserChoice(null);
    setScore(0);
    setCorrectCount(0);
    setTreeGrowthStage(1);
    setIsFinished(false);
  };

  // Tree growth visuals
  const treeIcons = ['🌱', '🌿', '🪴', '🌲', '🌳', '🌸🌳'];
  const treeLabels = [
    'Hạt mầm nhú lá',
    'Cây con xanh tươi',
    'Cây bén rễ khỏe',
    'Cây vươn cành lá',
    'Cổ thụ bóng mát',
    'Cổ thụ đơm hoa rực rỡ'
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
              <span>🌲</span>
              <span>Bảo Vệ Cây Xanh & Vườn Trường Sa Pa</span>
            </h2>
            <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Hành vi {currentIndex + 1}/{TREE_ACTIONS.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Phân biệt hành vi phù hợp (Nên làm) và không phù hợp (Không nên làm) để nuôi cây lớn
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-emerald-50 text-slate-700 transition-all border border-slate-200"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-rose-500" />}
          </button>

          <div className="flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200">
            <div className="text-center">
              <span className="text-[10px] text-emerald-700 font-bold uppercase block">Cây Lớn Lên</span>
              <span className="text-base font-black text-emerald-900 leading-none">Cấp {treeGrowthStage}/6</span>
            </div>
            <div className="h-4 w-px bg-emerald-200" />
            <div className="text-center">
              <span className="text-[10px] text-emerald-700 font-bold uppercase block">Điểm</span>
              <span className="text-base font-black text-emerald-900 leading-none">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Playing Stage */}
      {!isFinished && currentAction && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Left: Interactive Tree Visualizer */}
          <div className="md:col-span-4 bg-gradient-to-b from-emerald-100 via-teal-50 to-amber-50 rounded-3xl p-6 border-2 border-emerald-300 shadow-sm text-center flex flex-col items-center justify-between">
            <div className="text-xs font-black text-emerald-800 uppercase tracking-wider bg-white/80 px-3 py-1 rounded-full">
              Vườn Cây Của Em
            </div>

            <div className="py-6 my-auto text-center">
              <span className="text-7xl sm:text-8xl transition-all duration-300 inline-block animate-bounce">
                {treeIcons[treeGrowthStage - 1]}
              </span>
              <h4 className="font-extrabold text-sm text-emerald-900 mt-3">
                {treeLabels[treeGrowthStage - 1]}
              </h4>
              <p className="text-[11px] text-emerald-700 font-medium mt-1">
                Mỗi lựa chọn đúng sẽ giúp cây của em lớn thêm một bậc!
              </p>
            </div>

            <div className="w-full bg-emerald-200/80 rounded-full h-3 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${(treeGrowthStage / 6) * 100}%` }}
              />
            </div>
          </div>

          {/* Right: Action Scenario Card */}
          <div className="md:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{currentAction.icon}</span>
                <h3 className="font-black text-lg text-slate-800">
                  {currentAction.title}
                </h3>
              </div>

              {/* Action Description */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm sm:text-base leading-relaxed font-semibold flex items-start gap-3">
                <span className="text-4xl shrink-0">{currentAction.imageEmoji}</span>
                <p className="mt-1 font-medium">"{currentAction.actionDescription}"</p>
              </div>

              <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mt-4">
                👉 Theo em, đây là hành vi như thế nào?
              </div>
            </div>

            {/* 2 Big Choice Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleChoose(true)}
                disabled={userChoice !== null}
                className={`p-5 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-2 ${
                  userChoice !== null
                    ? currentAction.isGoodBehavior
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-black shadow-md ring-2 ring-emerald-300'
                      : userChoice === true
                      ? 'bg-rose-100 border-rose-400 text-rose-950'
                      : 'opacity-40 border-slate-200 bg-slate-50'
                    : 'bg-emerald-50/80 hover:bg-emerald-100 border-emerald-300 text-emerald-900 hover:scale-105 active:scale-95'
                }`}
              >
                <span className="text-3xl">✅</span>
                <span className="font-black text-base">HÀNH VI PHÙ HỢP (TỐT)</span>
                <span className="text-xs opacity-80">Nên làm để bảo vệ cây</span>
              </button>

              <button
                onClick={() => handleChoose(false)}
                disabled={userChoice !== null}
                className={`p-5 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-2 ${
                  userChoice !== null
                    ? !currentAction.isGoodBehavior
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-black shadow-md ring-2 ring-emerald-300'
                      : userChoice === false
                      ? 'bg-rose-100 border-rose-400 text-rose-950'
                      : 'opacity-40 border-slate-200 bg-slate-50'
                    : 'bg-rose-50/80 hover:bg-rose-100 border-rose-300 text-rose-900 hover:scale-105 active:scale-95'
                }`}
              >
                <span className="text-3xl">❌</span>
                <span className="font-black text-base">KHÔNG PHÙ HỢP (XẤU)</span>
                <span className="text-xs opacity-80">Không nên làm, gây hại cây</span>
              </button>
            </div>

            {/* Feedback Drawer */}
            {userChoice !== null && (
              <div className={`p-4 rounded-2xl border animate-in fade-in duration-200 ${
                userChoice === currentAction.isGoodBehavior
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}>
                <div className="font-black text-sm flex items-center gap-2">
                  <span>{userChoice === currentAction.isGoodBehavior ? '🎉 Em chọn hoàn toàn chính xác!' : '🤔 Chưa chính xác rồi em nhé!'}</span>
                </div>
                <p className="text-xs mt-1 leading-relaxed opacity-90 font-medium">
                  {currentAction.explanation}
                </p>
                <p className="text-xs text-emerald-800 font-bold mt-1.5 pt-1.5 border-t border-black/10">
                  🌿 <strong>Lời khuyên xanh:</strong> {currentAction.ecoTip}
                </p>
              </div>
            )}

            {/* Next Button */}
            {userChoice !== null && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-7 py-3 rounded-2xl shadow-lg shadow-emerald-600/25 text-sm transition-all hover:scale-105 active:scale-95"
                >
                  <span>{currentIndex === TREE_ACTIONS.length - 1 ? 'Xem Kết Quả Vườn Cây' : 'Hành Vi Tiếp Theo'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {isFinished && (
        <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border-2 border-emerald-300 shadow-2xl max-w-lg mx-auto space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-300 text-white flex items-center justify-center text-5xl mx-auto shadow-lg shadow-emerald-400/30 animate-bounce">
            🌲
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800">
              Vườn Cây Xanh Tốt!
            </h3>
            <p className="text-emerald-700 font-extrabold text-sm mt-1">
              Bạn {activeProfile.nickname} đã nhận biết xuất sắc các hành vi bảo vệ thiên nhiên
            </p>
          </div>

          <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 space-y-2">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Kết quả thử thách
            </div>
            <div className="text-4xl font-black text-emerald-800">
              {score} / 100 Điểm
            </div>
            <div className="text-xs text-slate-600 font-semibold">
              Nhận diện đúng {correctCount} / {TREE_ACTIONS.length} hành vi bảo vệ cây
            </div>
            <div className="text-xs text-amber-700 font-bold flex items-center justify-center gap-1 mt-1">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Được trao huy hiệu: <strong>"Vệ Sĩ Cây Rừng Hoàng Liên"</strong></span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={resetGame}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-emerald-600/25 transition-all text-sm hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Chăm Sóc Lại Vườn Cây</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
