import React, { useState, useEffect, useRef } from 'react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Award,
  RefreshCw,
  Sparkles,
  Volume2,
  VolumeX,
  ArrowRight,
  Clock,
  Users,
  User,
  Plus,
  Edit3,
  Check,
  Bot
} from 'lucide-react';
import { StudentProfile } from '../types';
import { ARENA_QUIZ_QUESTIONS, EcoQuizQuestion } from '../data/gameScenariosData';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import { playSound, isSoundEnabled, setSoundEnabled } from '../utils/audio';

interface EcoQuizArenaViewProps {
  activeProfile: StudentProfile;
  onProfileUpdated: (updated: StudentProfile) => void;
  onShowToast?: (title: string, desc?: string, type?: 'success' | 'reward' | 'info' | 'error') => void;
}

export const EcoQuizArenaView: React.FC<EcoQuizArenaViewProps> = ({
  activeProfile,
  onProfileUpdated,
  onShowToast,
}) => {
  // Modes & Settings
  const [playMode, setPlayMode] = useState<'solo' | 'team'>('solo');
  const [timerLimit, setTimerLimit] = useState<number>(0); // 0 = no limit, 20s, 10s
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [questions, setQuestions] = useState<EcoQuizQuestion[]>(ARENA_QUIZ_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Solo Stats
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Team Stats (Team Green vs Team Forest)
  const [teamTurn, setTeamTurn] = useState<'teamA' | 'teamB'>('teamA');
  const [scoreTeamA, setScoreTeamA] = useState(0);
  const [scoreTeamB, setScoreTeamB] = useState(0);

  const [isFinished, setIsFinished] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  // Teacher AI question generation & review
  const [showAiModal, setShowAiModal] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiDraftQuestion, setAiDraftQuestion] = useState<EcoQuizQuestion | null>(null);

  const timerRef = useRef<any>(null);

  const currentQ = questions[currentIndex];

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playSound('click');
  };

  // Reset timer on new question
  useEffect(() => {
    if (timerLimit > 0 && !isFinished && selectedOption === null) {
      setTimeLeft(timerLimit);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [currentIndex, timerLimit, isFinished, selectedOption]);

  const handleTimeOut = () => {
    if (selectedOption === null) {
      playSound('wrong');
      setSelectedOption(-1); // timeout selection
    }
  };

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return;
    clearInterval(timerRef.current);
    setSelectedOption(idx);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      playSound('correct');
      if (playMode === 'solo') {
        setScore(prev => prev + 20);
        setCorrectCount(prev => prev + 1);
      } else {
        if (teamTurn === 'teamA') {
          setScoreTeamA(prev => prev + 20);
        } else {
          setScoreTeamB(prev => prev + 20);
        }
      }
    } else {
      playSound('wrong');
    }
  };

  const handleNext = () => {
    playSound('click');
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      if (playMode === 'team') {
        setTeamTurn(prev => (prev === 'teamA' ? 'teamB' : 'teamA'));
      }
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    setIsFinished(true);
    clearInterval(timerRef.current);

    if (playMode === 'solo') {
      const finalScore = score + (selectedOption !== null && selectedOption === currentQ.correctIndex ? 20 : 0);
      const finalCorrect = correctCount + (selectedOption !== null && selectedOption === currentQ.correctIndex ? 1 : 0);
      playSound(finalScore >= 60 ? 'victory' : 'combo');

      const pointsEarned = finalCorrect * 20 + 20;

      storageService.addActivity({
        studentId: activeProfile.id,
        studentNickname: activeProfile.nickname,
        className: activeProfile.className,
        grade: activeProfile.grade,
        activityType: 'eco_quiz',
        title: 'Đấu trường tri thức xanh Sa Pa',
        score: finalScore,
        maxScore: 100,
        greenPointsEarned: pointsEarned,
        details: `Trả lời đúng ${finalCorrect}/${questions.length} câu trắc nghiệm`,
      });

      storageService.addGameHistory({
        gameType: 'eco_quiz',
        gameTitle: 'Đấu Trường Tri Thức Xanh',
        score: finalScore,
        maxScore: 100,
        correctAnswers: finalCorrect,
        totalQuestions: questions.length,
        badge: finalScore >= 80 ? 'Huy Hiệu Trí Tuệ Xanh' : 'Hiệp Sĩ Môi Trường',
        studentNickname: activeProfile.nickname,
        className: activeProfile.className,
      });

      onProfileUpdated(storageService.getActiveProfile());
      if (onShowToast) {
        onShowToast('Đấu trường hoàn thành! 🏆', `Bạn đạt ${finalScore} điểm và nhận +${pointsEarned} Điểm Xanh`, 'reward');
      }
    } else {
      playSound('victory');
      if (onShowToast) {
        const winner = scoreTeamA > scoreTeamB ? 'Đội Mầm Xanh' : scoreTeamA < scoreTeamB ? 'Đội Rừng Xanh' : 'Cả 2 đội hòa nhau';
        onShowToast('Trận so tài kết thúc! 🎉', `Chiến thắng thuộc về: ${winner}`, 'reward');
      }
    }
  };

  const resetGame = () => {
    playSound('click');
    clearInterval(timerRef.current);
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setCorrectCount(0);
    setScoreTeamA(0);
    setScoreTeamB(0);
    setTeamTurn('teamA');
    setIsFinished(false);
  };

  // AI Generate Question for Teacher Review
  const handleAiGenerateQuestion = async () => {
    setIsAiGenerating(true);
    playSound('click');
    try {
      const res = await aiService.generateQuiz(String(activeProfile.grade || 3), 'kiến thức môi trường Sa Pa', 1);
      if (res.questions.length > 0) {
        const q = res.questions[0];
        setAiDraftQuestion({
          id: Date.now(),
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          topic: 'Kiến thức AI tạo',
        });
      }
    } catch {
      console.warn('AI quiz generation failed');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleApproveAiQuestion = () => {
    if (!aiDraftQuestion) return;
    playSound('badge');
    setQuestions(prev => [aiDraftQuestion, ...prev]);
    setAiDraftQuestion(null);
    setShowAiModal(false);
    if (onShowToast) {
      onShowToast('Đã duyệt câu hỏi mới! ✨', 'Câu hỏi đã được bổ sung vào Đấu trường kiến thức.', 'success');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner with Game Setup Controls */}
      <div className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
              <span>🏆</span>
              <span>Đấu Trường Kiến Thức Môi Trường Sa Pa</span>
            </h2>
            <span className="bg-purple-100 text-purple-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Câu {currentIndex + 1}/{questions.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Trắc nghiệm kiến thức sinh thái, hỗ trợ hẹn giờ và thi đấu đồng đội
          </p>
        </div>

        {/* Controls & Mode Switches */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sound */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-100 hover:bg-purple-50 text-slate-700 transition-all border border-slate-200"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-purple-600" /> : <VolumeX className="w-4 h-4 text-rose-500" />}
          </button>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => {
                setPlayMode('solo');
                resetGame();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                playMode === 'solo' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Cá Nhân</span>
            </button>
            <button
              onClick={() => {
                setPlayMode('team');
                resetGame();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                playMode === 'team' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Thi Đấu Nhóm</span>
            </button>
          </div>

          {/* Timer Selector */}
          <select
            value={timerLimit}
            onChange={(e) => {
              setTimerLimit(Number(e.target.value));
              resetGame();
            }}
            className="bg-slate-100 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
          >
            <option value={0}>⏳ Không giới hạn</option>
            <option value={20}>⚡ 20 giây / câu</option>
            <option value={10}>🔥 10 giây / câu</option>
          </select>

          {/* Teacher AI Generate Button */}
          <button
            onClick={() => {
              setShowAiModal(true);
              if (!aiDraftQuestion) {
                handleAiGenerateQuestion();
              }
            }}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition-all"
            title="AI tạo thêm câu hỏi và giáo viên kiểm duyệt"
          >
            <Bot className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Thầy cô thêm câu hỏi AI</span>
          </button>
        </div>
      </div>

      {/* Main Playing Stage */}
      {!isFinished && currentQ && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-6">
          {/* Header Bar with Team status or Timer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            {playMode === 'solo' ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-purple-800 bg-purple-100 px-3 py-1 rounded-full">
                  Chủ đề: {currentQ.topic}
                </span>
                <span className="text-xs font-bold text-slate-600">
                  Điểm: <strong className="text-purple-700">{score}</strong>
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  teamTurn === 'teamA' ? 'bg-emerald-600 text-white ring-2 ring-emerald-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  🌱 Đội Mầm Xanh: {scoreTeamA} Điểm {teamTurn === 'teamA' && '(Đang trả lời)'}
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  teamTurn === 'teamB' ? 'bg-teal-600 text-white ring-2 ring-teal-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  🌲 Đội Rừng Xanh: {scoreTeamB} Điểm {teamTurn === 'teamB' && '(Đang trả lời)'}
                </div>
              </div>
            )}

            {/* Countdown Timer Display */}
            {timerLimit > 0 && (
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black ${
                timeLeft <= 5 ? 'bg-rose-100 text-rose-700 animate-ping' : 'bg-amber-100 text-amber-800'
              }`}>
                <Clock className="w-4 h-4" />
                <span>Còn {timeLeft}s</span>
              </div>
            )}
          </div>

          {/* Question Text Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              {currentQ.question}
            </h3>
          </div>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isAnswered = selectedOption !== null;

              let style = 'bg-slate-50 hover:bg-purple-50 border-slate-200 text-slate-800';
              if (isAnswered) {
                if (idx === currentQ.correctIndex) {
                  style = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-300';
                } else if (isSelected && idx !== currentQ.correctIndex) {
                  style = 'bg-rose-50 border-rose-400 text-rose-950 font-bold';
                } else {
                  style = 'bg-slate-50 border-slate-200 opacity-50';
                }
              }

              const letter = String.fromCharCode(65 + idx);

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all flex items-start gap-3.5 text-sm ${style}`}
                >
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                    isAnswered && idx === currentQ.correctIndex ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {letter}
                  </span>
                  <span className="flex-1 font-medium text-sm sm:text-base">{opt}</span>
                  {isAnswered && idx === currentQ.correctIndex && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                  {isAnswered && isSelected && idx !== currentQ.correctIndex && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Drawer */}
          {selectedOption !== null && (
            <div className={`p-4 rounded-2xl border animate-in fade-in duration-200 ${
              selectedOption === currentQ.correctIndex
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}>
              <div className="font-black text-sm flex items-center gap-2">
                <span>{selectedOption === currentQ.correctIndex ? '🎉 Trả lời chính xác!' : '⏰ Hết giờ hoặc câu trả lời chưa đúng!'}</span>
              </div>
              <p className="text-xs mt-1 leading-relaxed opacity-90 font-medium">
                💡 <strong>Lời giải thích:</strong> {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Next Button */}
          {selectedOption !== null && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-black px-7 py-3 rounded-2xl shadow-lg shadow-purple-600/25 text-sm transition-all hover:scale-105 active:scale-95"
              >
                <span>{currentIndex === questions.length - 1 ? 'Xem Kết Quả Đấu Trường' : 'Câu Hỏi Tiếp Theo'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Completion Modal */}
      {isFinished && (
        <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border-2 border-purple-300 shadow-2xl max-w-lg mx-auto space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-400 text-white flex items-center justify-center text-5xl mx-auto shadow-lg shadow-purple-500/30 animate-bounce">
            🏆
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-800">
              {playMode === 'solo' ? 'Hoàn Thành Đấu Trường!' : 'Kết Thúc Trận So Tài Nhóm!'}
            </h3>
            <p className="text-purple-700 font-extrabold text-sm mt-1">
              {playMode === 'solo'
                ? `Chúc mừng bạn ${activeProfile.nickname} đã hoàn thành xuất sắc các câu hỏi`
                : scoreTeamA > scoreTeamB
                ? '🏆 Đội Mầm Xanh đã giành chiến thắng chung cuộc!'
                : scoreTeamA < scoreTeamB
                ? '🏆 Đội Rừng Xanh đã giành chiến thắng chung cuộc!'
                : '🤝 Hai đội có số điểm bằng nhau, cùng là người chiến thắng!'}
            </p>
          </div>

          {playMode === 'solo' ? (
            <div className="bg-purple-50 p-5 rounded-2xl border border-purple-200 space-y-2">
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Điểm số chung cuộc
              </div>
              <div className="text-4xl font-black text-purple-900">
                {score} / 100 Điểm
              </div>
              <div className="text-xs text-slate-600 font-semibold">
                Đúng {correctCount} / {questions.length} câu trắc nghiệm
              </div>
              <div className="text-xs text-amber-700 font-bold flex items-center justify-center gap-1 mt-1">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Được trao: <strong>"Huy Hiệu Trí Tuệ Xanh Sa Pa"</strong></span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                <div className="text-xs font-bold text-emerald-800">🌱 Đội Mầm Xanh</div>
                <div className="text-3xl font-black text-emerald-900 mt-1">{scoreTeamA} Điểm</div>
              </div>
              <div className="bg-teal-50 p-4 rounded-2xl border border-teal-200">
                <div className="text-xs font-bold text-teal-800">🌲 Đội Rừng Xanh</div>
                <div className="text-3xl font-black text-teal-900 mt-1">{scoreTeamB} Điểm</div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={resetGame}
              className="bg-purple-600 hover:bg-purple-500 text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-purple-600/25 transition-all text-sm hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Chơi Lại Ván Mới</span>
            </button>
          </div>
        </div>
      )}

      {/* Teacher AI Question Generator & Review Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-teal-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                <h3 className="text-base sm:text-lg font-black text-slate-800">
                  AI Tạo Câu Hỏi & Thầy Cô Kiểm Duyệt
                </h3>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              AI sẽ đề xuất câu hỏi trắc nghiệm môi trường mới. Thầy cô xem trước, chỉnh sửa nếu cần và bấm <strong>Duyệt Thêm Vào Đấu Trường</strong> để học sinh làm.
            </p>

            {isAiGenerating && (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-teal-800 font-bold">AI đang tạo câu hỏi trắc nghiệm...</p>
              </div>
            )}

            {!isAiGenerating && aiDraftQuestion && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Nội dung câu hỏi:</label>
                  <input
                    type="text"
                    value={aiDraftQuestion.question}
                    onChange={(e) => setAiDraftQuestion({ ...aiDraftQuestion, question: e.target.value })}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-200 font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">4 Đáp án (Chọn radio để đặt đáp án đúng):</label>
                  {aiDraftQuestion.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                      <input
                        type="radio"
                        name="correct-ai-opt"
                        checked={aiDraftQuestion.correctIndex === oIdx}
                        onChange={() => setAiDraftQuestion({ ...aiDraftQuestion, correctIndex: oIdx })}
                        className="w-4 h-4 text-teal-600"
                      />
                      <span className="font-extrabold text-slate-400">{String.fromCharCode(65 + oIdx)}.</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const nextOpts = [...aiDraftQuestion.options];
                          nextOpts[oIdx] = e.target.value;
                          setAiDraftQuestion({ ...aiDraftQuestion, options: nextOpts });
                        }}
                        className="flex-1 font-medium text-slate-800 focus:outline-hidden"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Lời giải thích:</label>
                  <textarea
                    rows={2}
                    value={aiDraftQuestion.explanation}
                    onChange={(e) => setAiDraftQuestion({ ...aiDraftQuestion, explanation: e.target.value })}
                    className="w-full p-2 bg-white rounded-xl border border-slate-200 font-medium text-slate-800"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleAiGenerateQuestion}
                disabled={isAiGenerating}
                className="flex items-center gap-1.5 text-xs text-teal-700 font-bold hover:underline"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>AI tạo câu khác</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Đóng
                </button>
                <button
                  onClick={handleApproveAiQuestion}
                  disabled={!aiDraftQuestion || isAiGenerating}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs shadow-md shadow-emerald-600/20"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Duyệt Thêm Vào Game</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
