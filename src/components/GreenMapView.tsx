import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Info,
  Award,
  CheckCircle2,
  Sparkles,
  Filter,
  Trees,
  Droplets,
  Zap,
  Trash2,
  Plus,
  Edit3,
  Check,
  X,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Gamepad2,
  Users,
  ChevronRight,
  Clock,
  Eye,
  Flag,
  HelpCircle,
  RotateCcw,
  Layers,
  Send,
  MessageSquare,
  AlertCircle,
  Wifi,
  WifiOff,
  Sun,
  School,
  Target,
  ArrowLeft,
  Compass,
  Wind,
  Thermometer,
  Activity
} from 'lucide-react';
import {
  CampusZoneItem,
  GreenMapPoint,
  MapTaskSubmission,
  NavTab,
  SchoolCampusZone,
  StudentProfile
} from '../types';
import { DEFAULT_CAMPUS_ZONES, INITIAL_MAP_POINTS } from '../data/mapData';
import { storageService, TeacherZoneTask } from '../services/storageService';
import { AuthUser } from '../services/authService';
import { playSound } from '../utils/audio';

interface GreenMapViewProps {
  activeProfile: StudentProfile;
  onProfileUpdated: (updated: StudentProfile) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'reward' | 'info' | 'error') => void;
  currentUser?: AuthUser | null;
  onNavigate?: (tab: NavTab) => void;
  isOnline?: boolean;
}

export const GreenMapView: React.FC<GreenMapViewProps> = ({
  activeProfile,
  onProfileUpdated,
  onShowToast,
  currentUser,
  onNavigate,
  isOnline = true,
}) => {
  // Navigation tabs within Green Map
  const [activeTab, setActiveTab] = useState<'map' | 'zones' | 'points' | 'zone_tasks' | 'submissions' | 'progress'>('map');

  // Map view styling mode: '3d_isometric' (3D không gian sinh thái chân thực) | 'vector' (illustrated eco-map) | 'blueprint' (architectural grid) | 'offline' (minimalist)
  const [mapStyleMode, setMapStyleMode] = useState<'3d_isometric' | 'vector' | 'blueprint' | 'offline'>('3d_isometric');

  // Interactive quick pin placement mode for teachers
  const [isClickToPinMode, setIsClickToPinMode] = useState<boolean>(false);

  // Map data
  const [zones, setZones] = useState<CampusZoneItem[]>([]);
  const [points, setPoints] = useState<GreenMapPoint[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedPoint, setSelectedPoint] = useState<GreenMapPoint | null>(null);
  const [completedPointIds, setCompletedPointIds] = useState<Set<string>>(new Set());

  // Task interaction state
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [actionReportText, setActionReportText] = useState<string>('');
  const [isTaskDone, setIsTaskDone] = useState<boolean>(false);
  const [showAnswerExplanation, setShowAnswerExplanation] = useState<boolean>(false);

  // Submissions & Class Progress state
  const [submissions, setSubmissions] = useState<MapTaskSubmission[]>([]);
  const [submissionFilterStatus, setSubmissionFilterStatus] = useState<string>('ALL');
  const [submissionFilterClass, setSubmissionFilterClass] = useState<string>('ALL');
  const [teacherReviewNote, setTeacherReviewNote] = useState<Record<string, string>>({});
  const [classProgress, setClassProgress] = useState<
    { className: string; totalPoints: number; completedCount: number; studentCount: number }[]
  >([]);

  // Teacher Zone Tasks
  const [zoneTasks, setZoneTasks] = useState<TeacherZoneTask[]>([]);
  const [showZoneTaskModal, setShowZoneTaskModal] = useState<boolean>(false);
  const [newZoneTaskTitle, setNewZoneTaskTitle] = useState<string>('');
  const [newZoneTaskZoneId, setNewZoneTaskZoneId] = useState<string>('thung_rac');
  const [newZoneTaskTargetClass, setNewZoneTaskTargetClass] = useState<string>('3A1');
  const [newZoneTaskDesc, setNewZoneTaskDesc] = useState<string>('');
  const [newZoneTaskPoints, setNewZoneTaskPoints] = useState<number>(50);

  // Teacher Point Editor Modal state
  const [showPointModal, setShowPointModal] = useState<boolean>(false);
  const [editingPointId, setEditingPointId] = useState<string | null>(null);
  const [pointName, setPointName] = useState<string>('');
  const [pointZone, setPointZone] = useState<string>('san_truong');
  const [pointDesc, setPointDesc] = useState<string>('');
  const [pointImgUrl, setPointImgUrl] = useState<string>('');
  const [pointIcon, setPointIcon] = useState<string>('🌱');
  const [pointXPercent, setPointXPercent] = useState<number>(50);
  const [pointYPercent, setPointYPercent] = useState<number>(50);
  const [pointPointsReward, setPointPointsReward] = useState<number>(25);
  const [pointTips, setPointTips] = useState<string>('');
  const [pointSafetyNote, setPointSafetyNote] = useState<string>('Khu vực an toàn được nhà trường phê duyệt, có giáo viên giám sát.');

  // Mission editor state
  const [missionTitle, setMissionTitle] = useState<string>('');
  const [missionDesc, setMissionDesc] = useState<string>('');
  const [missionType, setMissionType] = useState<'quiz' | 'action_report' | 'game_link'>('quiz');
  const [missionQuestion, setMissionQuestion] = useState<string>('');
  const [missionOptions, setMissionOptions] = useState<string[]>([
    'Phương án A',
    'Phương án B',
    'Phương án C',
    'Phương án D',
  ]);
  const [missionCorrectIndex, setMissionCorrectIndex] = useState<number>(0);
  const [missionExplanation, setMissionExplanation] = useState<string>('');
  const [missionActionPrompt, setMissionActionPrompt] = useState<string>('');
  const [missionLinkedGame, setMissionLinkedGame] = useState<string>('waste_sorting');
  const [missionLinkedTab, setMissionLinkedTab] = useState<string>('game');
  const [lessonTopic, setLessonTopic] = useState<string>('');
  const [lessonTakeaway, setLessonTakeaway] = useState<string>('');

  // Zone editor modal
  const [showZoneModal, setShowZoneModal] = useState<boolean>(false);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [zoneName, setZoneName] = useState<string>('');
  const [zoneIcon, setZoneIcon] = useState<string>('🌳');
  const [zoneColor, setZoneColor] = useState<string>('text-emerald-700');
  const [zoneBgLight, setZoneBgLight] = useState<string>('bg-emerald-50');
  const [zoneBorderColor, setZoneBorderColor] = useState<string>('border-emerald-300');
  const [zoneDesc, setZoneDesc] = useState<string>('');

  // Ref to the map container for coordinate calculation
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Load points, zones, submissions
  useEffect(() => {
    loadMapData();
  }, [activeProfile.id]);

  const loadMapData = () => {
    const loadedZones = storageService.getCampusZones();
    setZones(loadedZones);

    const loadedPoints = storageService.getMapPoints();
    setPoints(loadedPoints);

    const subs = storageService.getMapSubmissions();
    setSubmissions(subs);

    const tasks = storageService.getMapZoneTasks();
    setZoneTasks(tasks);

    const progress = storageService.getClassMapProgress();
    setClassProgress(progress);

    // Identify points completed by this student
    const myApproved = subs
      .filter((s) => (s.studentId === activeProfile.id || s.studentNickname === activeProfile.nickname) && s.status === 'approved')
      .map((s) => s.pointId);
    setCompletedPointIds(new Set(myApproved));

    if (!selectedPoint && loadedPoints.length > 0) {
      setSelectedPoint(loadedPoints[0]);
    }
  };

  // Switch selected point
  const handleSelectPoint = (pt: GreenMapPoint) => {
    playSound('click');
    setSelectedPoint(pt);
    setSelectedQuizAnswer(null);
    setActionReportText('');
    setShowAnswerExplanation(false);
    setIsTaskDone(completedPointIds.has(pt.id));
  };

  // Interactive Pin Placement by Clicking Canvas (For Teachers)
  const handleMapCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isClickToPinMode) return;
    if (!mapContainerRef.current) return;

    const rect = mapContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const xPercent = Math.round(Math.max(5, Math.min(95, (clickX / rect.width) * 100)));
    const yPercent = Math.round(Math.max(5, Math.min(95, (clickY / rect.height) * 100)));

    setIsClickToPinMode(false);
    handleOpenAddPointModal(xPercent, yPercent);
  };

  // Submit student mission on a point
  const handleCompleteMission = () => {
    if (!selectedPoint) return;

    if (selectedPoint.mission.type === 'quiz') {
      if (selectedQuizAnswer === null) {
        onShowToast('Chưa chọn đáp án', 'Vui lòng chọn 1 phương án trả lời nhé!', 'info');
        return;
      }

      const isCorrect = selectedQuizAnswer === selectedPoint.mission.correctIndex;
      if (!isCorrect) {
        playSound('wrong');
        setShowAnswerExplanation(true);
        onShowToast('Chưa chính xác rồi!', selectedPoint.mission.explanation || 'Hãy đọc kỹ lại hướng dẫn và thử lại nhé!', 'error');
        return;
      }
    } else if (selectedPoint.mission.type === 'action_report') {
      if (!actionReportText.trim()) {
        onShowToast('Thiếu thông tin', 'Vui lòng ghi lại hành động của em trước khi nộp!', 'info');
        return;
      }
    }

    playSound('badge');
    setShowAnswerExplanation(true);

    // Create a submission
    const newSub = storageService.addMapSubmission({
      pointId: selectedPoint.id,
      pointName: selectedPoint.name,
      studentId: activeProfile.id,
      studentNickname: activeProfile.nickname,
      className: activeProfile.className,
      grade: activeProfile.grade,
      submittedAnswer: selectedPoint.mission.type === 'quiz' ? selectedQuizAnswer! : actionReportText.trim(),
      notes: selectedPoint.mission.type === 'action_report' ? actionReportText.trim() : undefined,
      status: 'approved', // Auto-approve quiz for instant positive reinforcement
      pointsAwarded: selectedPoint.pointsReward,
    });

    // Record activity & reward student
    storageService.addActivity({
      studentId: activeProfile.id,
      studentNickname: activeProfile.nickname,
      className: activeProfile.className,
      grade: activeProfile.grade,
      activityType: 'green_action',
      title: `GREEN MAP: ${selectedPoint.name}`,
      greenPointsEarned: selectedPoint.pointsReward,
      details: `Khu vực: ${selectedPoint.zoneNameVi} • Hoàn thành nhiệm vụ: ${selectedPoint.mission.title}`,
    });

    onProfileUpdated(storageService.getActiveProfile());

    const nextCompleted = new Set(completedPointIds);
    nextCompleted.add(selectedPoint.id);
    setCompletedPointIds(nextCompleted);
    setIsTaskDone(true);
    setSubmissions((prev) => [newSub, ...prev]);

    onShowToast(
      'Xuất sắc! 🗺️✨',
      `Đã hoàn thành nhiệm vụ tại "${selectedPoint.name}" (+${selectedPoint.pointsReward} Điểm Xanh)`,
      'reward'
    );
  };

  // Quick navigation to linked game or tab
  const handleOpenLinkedFeature = () => {
    if (!selectedPoint || !onNavigate) return;
    playSound('click');

    const targetTab = (selectedPoint.mission.linkedTab as NavTab) || 'game';
    onNavigate(targetTab);
  };

  // --- Reset to Sample Test Data ---
  const handleResetSampleData = () => {
    if (confirm('Thầy cô có muốn khôi phục bộ dữ liệu mẫu bản đồ trường Sa Pa ban đầu để kiểm thử không?')) {
      playSound('badge');
      const freshPoints = storageService.resetMapPointsToDefault();
      const freshZones = storageService.resetCampusZones();
      setPoints(freshPoints);
      setZones(freshZones);
      if (freshPoints.length > 0) setSelectedPoint(freshPoints[0]);
      onShowToast('Đã khôi phục dữ liệu mẫu! 🔄', 'Toàn bộ 8 điểm xanh và 6 phân khu chuẩn Sa Pa đã sẵn sàng.', 'success');
    }
  };

  // --- Teacher Point Management ---
  const handleOpenAddPointModal = (x = 50, y = 50) => {
    playSound('click');
    setEditingPointId(null);
    setPointName('');
    setPointZone('san_truong');
    setPointDesc('');
    setPointImgUrl('https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80');
    setPointIcon('🌱');
    setPointXPercent(x);
    setPointYPercent(y);
    setPointPointsReward(25);
    setPointTips('Hãy chung tay giữ gìn khuôn viên trường luôn xanh - sạch - đẹp.');
    setPointSafetyNote('Khu vực an toàn đã được kiểm tra, có thầy cô giám sát thường xuyên.');

    // Mission defaults
    setMissionTitle('Nhiệm vụ xanh mới');
    setMissionDesc('Mô tả nhiệm vụ cho học sinh thực hiện tại điểm này');
    setMissionType('quiz');
    setMissionQuestion('Câu hỏi trắc nghiệm môi trường cho học sinh:');
    setMissionOptions(['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D']);
    setMissionCorrectIndex(0);
    setMissionExplanation('Lời giải thích khen ngợi học sinh');
    setMissionActionPrompt('');
    setMissionLinkedGame('waste_sorting');
    setMissionLinkedTab('game');
    setLessonTopic('Giáo dục môi trường Sa Pa');
    setLessonTakeaway('Hành động nhỏ tạo nên thay đổi lớn.');

    setShowPointModal(true);
  };

  const handleOpenEditPointModal = (pt: GreenMapPoint) => {
    playSound('click');
    setEditingPointId(pt.id);
    setPointName(pt.name);
    setPointZone(pt.zone);
    setPointDesc(pt.description);
    setPointImgUrl(pt.imageUrl || '');
    setPointIcon(pt.icon);
    setPointXPercent(pt.xPercent);
    setPointYPercent(pt.yPercent);
    setPointPointsReward(pt.pointsReward);
    setPointTips(pt.tips);
    setPointSafetyNote(pt.safetyNote || 'Khu vực an toàn được nhà trường phê duyệt.');

    setMissionTitle(pt.mission.title);
    setMissionDesc(pt.mission.description);
    setMissionType(pt.mission.type);
    setMissionQuestion(pt.mission.question || '');
    setMissionOptions(pt.mission.options || ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D']);
    setMissionCorrectIndex(pt.mission.correctIndex || 0);
    setMissionExplanation(pt.mission.explanation || '');
    setMissionActionPrompt(pt.mission.actionPrompt || '');
    setMissionLinkedGame(pt.mission.linkedGame || 'waste_sorting');
    setMissionLinkedTab(pt.mission.linkedTab || 'game');
    setLessonTopic(pt.mission.attachedLesson?.topic || '');
    setLessonTakeaway(pt.mission.attachedLesson?.takeaway || '');

    setShowPointModal(true);
  };

  const handleSavePoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pointName.trim()) return;

    playSound('badge');

    // Find zone name
    const zoneMatch = zones.find((z) => z.id === pointZone);
    const resolvedZoneNameVi = zoneMatch ? zoneMatch.name : 'Phân Khu Trường Học';

    const missionData = {
      title: missionTitle.trim() || 'Nhiệm vụ xanh',
      description: missionDesc.trim(),
      type: missionType,
      question: missionType === 'quiz' ? missionQuestion.trim() : undefined,
      options: missionType === 'quiz' ? missionOptions : undefined,
      correctIndex: missionType === 'quiz' ? missionCorrectIndex : undefined,
      explanation: missionType === 'quiz' ? missionExplanation.trim() : undefined,
      actionPrompt: missionType === 'action_report' ? missionActionPrompt.trim() : undefined,
      linkedGame: (missionLinkedGame as any) || undefined,
      linkedTab: (missionLinkedTab as any) || undefined,
      attachedLesson: lessonTopic.trim()
        ? { topic: lessonTopic.trim(), takeaway: lessonTakeaway.trim() }
        : undefined,
    };

    if (editingPointId) {
      // Update
      const updated = storageService.updateMapPoint(editingPointId, {
        name: pointName.trim(),
        zone: pointZone,
        zoneNameVi: resolvedZoneNameVi,
        description: pointDesc.trim(),
        imageUrl: pointImgUrl.trim(),
        icon: pointIcon,
        xPercent: pointXPercent,
        yPercent: pointYPercent,
        pointsReward: pointPointsReward,
        tips: pointTips.trim(),
        safetyNote: pointSafetyNote.trim(),
        mission: missionData,
      });

      if (updated) {
        setPoints((prev) => prev.map((p) => (p.id === editingPointId ? updated : p)));
        if (selectedPoint?.id === editingPointId) {
          setSelectedPoint(updated);
        }
        onShowToast('Đã cập nhật điểm xanh! 📍', `Đã lưu thay đổi cho "${updated.name}"`, 'success');
      }
    } else {
      // Create new
      const created = storageService.addMapPoint({
        name: pointName.trim(),
        zone: pointZone,
        zoneNameVi: resolvedZoneNameVi,
        description: pointDesc.trim(),
        imageUrl: pointImgUrl.trim(),
        icon: pointIcon,
        xPercent: pointXPercent,
        yPercent: pointYPercent,
        pointsReward: pointPointsReward,
        tips: pointTips.trim(),
        safetyNote: pointSafetyNote.trim(),
        mission: missionData,
        createdBy: currentUser?.displayName || 'Thầy Cô Sa Pa',
        isApprovedByTeacher: true,
      });

      setPoints((prev) => [...prev, created]);
      setSelectedPoint(created);
      onShowToast('Đã thêm điểm xanh mới! 🎯', `Đã ghim "${created.name}" lên sơ đồ trường`, 'success');
    }

    setShowPointModal(false);
  };

  const handleDeletePoint = (id: string) => {
    if (confirm('Thầy cô có chắc chắn muốn xóa điểm xanh này khỏi sơ đồ trường không?')) {
      playSound('click');
      storageService.deleteMapPoint(id);
      setPoints((prev) => prev.filter((p) => p.id !== id));
      if (selectedPoint?.id === id) {
        const remaining = points.filter((p) => p.id !== id);
        setSelectedPoint(remaining.length > 0 ? remaining[0] : null);
      }
      onShowToast('Đã xóa điểm xanh', 'Điểm xanh đã được gỡ khỏi bản đồ trường.', 'info');
    }
  };

  // --- Teacher Campus Zone Management ---
  const handleOpenAddZoneModal = () => {
    playSound('click');
    setEditingZoneId(null);
    setZoneName('');
    setZoneIcon('🌿');
    setZoneColor('text-emerald-700');
    setZoneBgLight('bg-emerald-50');
    setZoneBorderColor('border-emerald-300');
    setZoneDesc('');
    setShowZoneModal(true);
  };

  const handleOpenEditZoneModal = (z: CampusZoneItem) => {
    playSound('click');
    setEditingZoneId(z.id);
    setZoneName(z.name);
    setZoneIcon(z.icon);
    setZoneColor(z.color);
    setZoneBgLight(z.bgLight);
    setZoneBorderColor(z.borderColor);
    setZoneDesc(z.description);
    setShowZoneModal(true);
  };

  const handleSaveZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName.trim()) return;

    playSound('badge');
    if (editingZoneId) {
      const updated = storageService.updateCampusZone(editingZoneId, {
        name: zoneName.trim(),
        icon: zoneIcon.trim() || '🌿',
        color: zoneColor,
        bgLight: zoneBgLight,
        borderColor: zoneBorderColor,
        description: zoneDesc.trim(),
      });
      if (updated) {
        setZones(storageService.getCampusZones());
        onShowToast('Đã cập nhật khu vực! 🏫', `Đã lưu thay đổi cho "${updated.name}"`, 'success');
      }
    } else {
      const created = storageService.addCampusZone({
        name: zoneName.trim(),
        icon: zoneIcon.trim() || '🌿',
        color: zoneColor,
        bgLight: zoneBgLight,
        borderColor: zoneBorderColor,
        description: zoneDesc.trim(),
      });
      setZones(storageService.getCampusZones());
      onShowToast('Đã thêm phân khu mới! 🌳', `Khu vực "${created.name}" đã sẵn sàng trên bản đồ`, 'success');
    }
    setShowZoneModal(false);
  };

  const handleDeleteZone = (id: string) => {
    if (confirm('Thầy cô có chắc chắn muốn xóa khu vực này không?')) {
      playSound('click');
      storageService.deleteCampusZone(id);
      setZones(storageService.getCampusZones());
      onShowToast('Đã xóa khu vực', 'Phân khu đã được gỡ khỏi hệ thống.', 'info');
    }
  };

  // --- Teacher Zone Tasks Management ---
  const handleCreateZoneTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneTaskTitle.trim()) return;

    playSound('badge');
    const matchedZone = zones.find((z) => z.id === newZoneTaskZoneId);
    const newTask = storageService.addMapZoneTask({
      title: newZoneTaskTitle.trim(),
      zoneId: newZoneTaskZoneId,
      zoneName: matchedZone ? matchedZone.name : 'Phân Khu Trường Học',
      targetClass: newZoneTaskTargetClass,
      description: newZoneTaskDesc.trim(),
      pointsReward: newZoneTaskPoints,
      createdBy: currentUser?.displayName || 'Thầy Cô Sa Pa',
    });

    setZoneTasks((prev) => [newTask, ...prev]);
    setShowZoneTaskModal(false);
    setNewZoneTaskTitle('');
    setNewZoneTaskDesc('');
    onShowToast('Đã phát động thử thách! 🎯', `Giao nhiệm vụ tại ${newTask.zoneName} cho lớp ${newTask.targetClass}`, 'reward');
  };

  const handleDeleteZoneTask = (id: string) => {
    if (confirm('Thầy cô có muốn hủy nhiệm vụ khu vực này không?')) {
      playSound('click');
      storageService.deleteMapZoneTask(id);
      setZoneTasks((prev) => prev.filter((t) => t.id !== id));
      onShowToast('Đã hủy nhiệm vụ', 'Nhiệm vụ đã được gỡ bỏ.', 'info');
    }
  };

  // --- Review Student Submission with Teacher Notes ---
  const handleReviewSubmission = (subId: string, status: 'approved' | 'rejected') => {
    playSound('badge');
    const feedback = teacherReviewNote[subId] || (status === 'approved' ? 'Thầy cô khen ngợi em đã hoàn thành xuất sắc!' : 'Em hãy đọc kỹ lại hướng dẫn và thử lại nhé!');
    const updated = storageService.reviewMapSubmission(
      subId,
      status,
      status === 'approved' ? 30 : 0,
      currentUser?.displayName || 'Thầy Cô Sa Pa',
      feedback
    );

    if (updated) {
      setSubmissions((prev) => prev.map((s) => (s.id === subId ? updated : s)));
      onShowToast(
        status === 'approved' ? 'Đã duyệt bài nộp! ✅' : 'Đã phản hồi cần làm lại',
        status === 'approved' ? 'Học sinh nhận được điểm thưởng.' : 'Đã gửi lời dặn dò cho học sinh.',
        status === 'approved' ? 'success' : 'info'
      );
    }
  };

  // Filter points on the map
  const filteredPoints = points.filter((p) => {
    if (selectedZone === 'ALL') return true;
    return p.zone === selectedZone;
  });

  // Filter submissions
  const filteredSubmissions = submissions.filter((s) => {
    const matchStatus = submissionFilterStatus === 'ALL' || s.status === submissionFilterStatus;
    const matchClass = submissionFilterClass === 'ALL' || s.className === submissionFilterClass;
    return matchStatus && matchClass;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner & Module Navigation Header */}
      <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          {onNavigate && (
            <button
              onClick={() => {
                playSound('click');
                onNavigate('home');
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 font-extrabold text-xs transition-colors shrink-0 mt-1"
              title="Quay lại trang chủ"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          )}

          <div>
            <div className="inline-flex items-center gap-1.5 bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>GREEN MAP – Sơ Đồ Trường Học Xanh Sa Pa</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800">
              Bản Đồ Môi Trường Tương Tác Trường Tiểu Học Sa Pa
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Khám phá các trạm sinh thái, hoàn thành nhiệm vụ thực tế và kết nối cùng các trò chơi xanh học đường.
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-extrabold">
          <button
            onClick={() => {
              playSound('click');
              setActiveTab('map');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              activeTab === 'map'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Sơ Đồ Tương Tác</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setActiveTab('zones');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              activeTab === 'zones'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Phân Khu ({zones.length})</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setActiveTab('points');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              activeTab === 'points'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Điểm Xanh ({points.length})</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setActiveTab('zone_tasks');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              activeTab === 'zone_tasks'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Nhiệm Vụ Khu Vực ({zoneTasks.length})</span>
          </button>

          <button
            onClick={() => {
              playSound('click');
              setActiveTab('submissions');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              activeTab === 'submissions'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Duyệt Bài Nộp</span>
            {submissions.filter((s) => s.status === 'pending').length > 0 && (
              <span className="bg-amber-400 text-slate-900 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {submissions.filter((s) => s.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              playSound('click');
              setActiveTab('progress');
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              activeTab === 'progress'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Tiến Độ Lớp</span>
          </button>
        </div>
      </div>

      {/* Safety & Offline Notice Banner */}
      <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-sky-50 rounded-2xl p-4 border border-teal-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-teal-950 font-bold">
          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            <strong>Bảo vệ an toàn học đường:</strong> Sơ đồ minh họa được nhà trường phê duyệt. Không thu thập GPS hay công khai vị trí cá nhân, bảo mật dữ liệu học đường tuyệt đối.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetSampleData}
            title="Khôi phục lại toàn bộ dữ liệu mẫu trường Sa Pa để thử nghiệm"
            className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg transition-all"
          >
            <RotateCcw className="w-3 h-3 text-slate-500" />
            <span>Nạp lại dữ liệu mẫu Sa Pa</span>
          </button>
          <div className="text-[11px] text-teal-700 font-semibold bg-white px-2.5 py-1 rounded-lg border border-teal-200">
            📍 Đã hoàn thành: {completedPointIds.size}/{points.length} điểm
          </div>
        </div>
      </div>

      {/* ========================================================
          TAB 1: SƠ ĐỒ TRƯỜNG TƯƠNG TÁC (INTERACTIVE CAMPUS MAP)
      ======================================================== */}
      {activeTab === 'map' && (
        <div className="space-y-6">
          {/* Controls bar: Zone Filter & Map Style Selector */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Zone Filter Strip */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  playSound('click');
                  setSelectedZone('ALL');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedZone === 'ALL'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-teal-50 border-slate-200'
                }`}
              >
                Tất Cả ({points.length})
              </button>

              {zones.map((zone) => {
                const count = points.filter((p) => p.zone === zone.id).length;
                return (
                  <button
                    key={zone.id}
                    onClick={() => {
                      playSound('click');
                      setSelectedZone(zone.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedZone === zone.id
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-teal-50 border-slate-200'
                    }`}
                  >
                    <span>{zone.icon}</span>
                    <span>{zone.name}</span>
                    <span className="text-[10px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Map Style & Click-to-Pin Mode */}
            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <button
                onClick={() => {
                  playSound('click');
                  setIsClickToPinMode(!isClickToPinMode);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  isClickToPinMode
                    ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
                title="Nhấp vào bất kỳ điểm nào trên bản đồ để chọn tọa độ thêm điểm xanh"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isClickToPinMode ? 'Đang chọn tọa độ (nhấp vào bản đồ)' : 'Ghim nhanh trên bản đồ'}</span>
              </button>

              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setMapStyleMode('3d_isometric')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    mapStyleMode === '3d_isometric' ? 'bg-[#185a32] text-white shadow-xs font-black' : 'text-slate-600'
                  }`}
                  title="Mô phỏng 3D không gian sinh thái và trạm quan trắc Sa Pa"
                >
                  <Compass className="w-3.5 h-3.5 text-amber-300" />
                  <span>3D Không Gian</span>
                </button>
                <button
                  onClick={() => setMapStyleMode('vector')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    mapStyleMode === 'vector' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                  title="Bản đồ minh họa sinh thái 2D"
                >
                  Sinh Thái 2D
                </button>
                <button
                  onClick={() => setMapStyleMode('blueprint')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    mapStyleMode === 'blueprint' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                  title="Sơ đồ kiến trúc lưới kỹ thuật"
                >
                  Kiến Trúc
                </button>
                <button
                  onClick={() => setMapStyleMode('offline')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    mapStyleMode === 'offline' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                  title="Chế độ ngoại tuyến thu gọn"
                >
                  Ngoại Tuyến
                </button>
              </div>
            </div>
          </div>

          {/* Scientific Sa Pa Weather & Environmental Sensor Station */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 rounded-3xl text-white text-xs border border-emerald-500/30 shadow-md">
            <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                🍃
              </div>
              <div>
                <div className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Chỉ số AQI</div>
                <div className="font-black text-sm text-emerald-400">18 • Rất Tốt</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-black">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-sky-300 font-bold uppercase tracking-wider">Bụi PM2.5</div>
                <div className="font-black text-sm text-sky-300">6.8 µg/m³</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                <Thermometer className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Nhiệt độ Sa Pa</div>
                <div className="font-black text-sm text-amber-300">16.5°C</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-black">
                <Droplets className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-teal-300 font-bold uppercase tracking-wider">Độ ẩm núi cao</div>
                <div className="font-black text-sm text-teal-300">84% Sương Mù</div>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 flex items-center gap-2 px-2 py-1 bg-white/5 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Gió & Tọa độ</div>
                <div className="font-black text-[11px] text-indigo-300 truncate">3.2m/s • 1.500m</div>
              </div>
            </div>
          </div>

          {/* Interactive Map Layout & Detail Sheet */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Illustrated Map Canvas (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-teal-600" />
                  <span>{isClickToPinMode ? '👉 Hãy nhấp lên bản đồ để chọn vị trí ghim:' : 'Chạm vào điểm trên sơ đồ để nhận nhiệm vụ môi trường:'}</span>
                </span>
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md font-semibold">
                  {mapStyleMode === '3d_isometric' ? '🌐 3D Không Gian Sa Pa' : mapStyleMode === 'blueprint' ? '📐 Kiến Trúc Lưới' : mapStyleMode === 'offline' ? '💾 Ngoại Tuyến' : '🌿 Sinh Thái 2D'}
                </span>
              </div>

              {/* Vector Blueprint Interactive Canvas with 3D isometric support */}
              <div
                ref={mapContainerRef}
                onClick={handleMapCanvasClick}
                style={
                  mapStyleMode === '3d_isometric'
                    ? {
                        transform: 'perspective(900px) rotateX(12deg) scale(0.98)',
                        transformOrigin: 'center center',
                        boxShadow: '0 20px 35px -10px rgba(16, 185, 129, 0.25), 0 10px 15px -5px rgba(0, 0, 0, 0.1)',
                      }
                    : undefined
                }
                className={`relative w-full aspect-16/10 rounded-3xl overflow-hidden shadow-inner select-none p-4 transition-all duration-500 ${
                  isClickToPinMode ? 'cursor-crosshair ring-4 ring-amber-400/50' : 'cursor-default'
                } ${
                  mapStyleMode === '3d_isometric'
                    ? 'bg-gradient-to-br from-emerald-100 via-teal-100/90 to-sky-100 border-4 border-emerald-500/90'
                    : mapStyleMode === 'vector'
                    ? 'bg-gradient-to-br from-emerald-100/90 via-teal-50/80 to-sky-100/90 border-3 border-emerald-400/80'
                    : mapStyleMode === 'blueprint'
                    ? 'bg-slate-900 border-3 border-cyan-500/80 text-cyan-200'
                    : 'bg-emerald-50/60 border-2 border-emerald-300'
                }`}
              >
                {/* SVG Campus Architectural Zones */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="campusGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path
                        d="M 30 0 L 0 0 0 30"
                        fill="none"
                        stroke={mapStyleMode === 'blueprint' ? '#06b6d4' : '#10b981'}
                        strokeWidth="0.5"
                        strokeOpacity={mapStyleMode === 'blueprint' ? '0.2' : '0.15'}
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#campusGrid)" />

                  {/* Sa Pa Mountain Silhouette in the background */}
                  {mapStyleMode === 'vector' && (
                    <path
                      d="M 0 50 Q 80 15 160 45 Q 240 10 340 50 Q 450 15 600 45 L 600 0 L 0 0 Z"
                      fill="#0284c7"
                      fillOpacity="0.08"
                    />
                  )}

                  {/* 1. School Main Yard (Sân trường) */}
                  <rect
                    x="20%"
                    y="26%"
                    width="32%"
                    height="34%"
                    rx="16"
                    fill={mapStyleMode === 'blueprint' ? '#0e7490' : '#fef3c7'}
                    fillOpacity={mapStyleMode === 'blueprint' ? '0.3' : '0.45'}
                    stroke={mapStyleMode === 'blueprint' ? '#22d3ee' : '#f59e0b'}
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />

                  {/* 2. Classroom Buildings Block (Khối lớp học 2 tầng) */}
                  <rect
                    x="56%"
                    y="18%"
                    width="34%"
                    height="32%"
                    rx="12"
                    fill={mapStyleMode === 'blueprint' ? '#1e1b4b' : '#e0e7ff'}
                    fillOpacity={mapStyleMode === 'blueprint' ? '0.6' : '0.5'}
                    stroke={mapStyleMode === 'blueprint' ? '#818cf8' : '#6366f1'}
                    strokeWidth="1.5"
                  />

                  {/* 3. Experiential Garden (Vườn thực nghiệm & hoa Sa Pa) */}
                  <rect
                    x="12%"
                    y="62%"
                    width="28%"
                    height="30%"
                    rx="14"
                    fill={mapStyleMode === 'blueprint' ? '#064e3b' : '#d1fae5'}
                    fillOpacity={mapStyleMode === 'blueprint' ? '0.5' : '0.55'}
                    stroke={mapStyleMode === 'blueprint' ? '#34d399' : '#10b981'}
                    strokeWidth="1.5"
                  />

                  {/* 4. Clean Water & Cafeteria (Bồn nước sạch & Nhà ăn) */}
                  <rect
                    x="42%"
                    y="60%"
                    width="24%"
                    height="24%"
                    rx="12"
                    fill={mapStyleMode === 'blueprint' ? '#082f49' : '#e0f2fe'}
                    fillOpacity={mapStyleMode === 'blueprint' ? '0.5' : '0.55'}
                    stroke={mapStyleMode === 'blueprint' ? '#38bdf8' : '#0284c7'}
                    strokeWidth="1.5"
                  />

                  {/* 5. Solar Roof Top (Mái năng lượng mặt trời) */}
                  <rect
                    x="64%"
                    y="10%"
                    width="22%"
                    height="10%"
                    rx="8"
                    fill={mapStyleMode === 'blueprint' ? '#713f12' : '#fef08a'}
                    fillOpacity={mapStyleMode === 'blueprint' ? '0.7' : '0.6'}
                    stroke={mapStyleMode === 'blueprint' ? '#facc15' : '#ca8a04'}
                    strokeWidth="1"
                  />

                  {/* Paved Walkways Connecting Campus */}
                  <path
                    d="M 20 80 Q 250 150 450 120"
                    stroke={mapStyleMode === 'blueprint' ? '#334155' : '#cbd5e1'}
                    strokeWidth="10"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.5"
                  />
                  <path
                    d="M 220 120 L 300 240"
                    stroke={mapStyleMode === 'blueprint' ? '#334155' : '#cbd5e1'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.4"
                  />
                </svg>

                {/* Zone Labels on Map */}
                <div className="absolute top-3 left-4 text-[9px] font-black text-emerald-800 uppercase tracking-widest bg-white/85 px-2 py-0.5 rounded-md shadow-xs pointer-events-none backdrop-blur-xs">
                  🌸 VƯỜN THỰC NGHIỆM
                </div>
                <div className="absolute top-3 right-4 text-[9px] font-black text-indigo-800 uppercase tracking-widest bg-white/85 px-2 py-0.5 rounded-md shadow-xs pointer-events-none backdrop-blur-xs">
                  🏫 KHỐI PHÒNG HỌC
                </div>
                <div className="absolute bottom-3 left-4 text-[9px] font-black text-amber-800 uppercase tracking-widest bg-white/85 px-2 py-0.5 rounded-md shadow-xs pointer-events-none backdrop-blur-xs">
                  🚩 SÂN TRƯỜNG CHÍNH
                </div>
                <div className="absolute bottom-3 right-4 text-[9px] font-black text-sky-800 uppercase tracking-widest bg-white/85 px-2 py-0.5 rounded-md shadow-xs pointer-events-none backdrop-blur-xs">
                  💧 BỒN NƯỚC SẠCH & BÁN TRÚ
                </div>

                {/* Interactive Map Pins */}
                {filteredPoints.map((pt) => {
                  const isSelected = selectedPoint?.id === pt.id;
                  const isDone = completedPointIds.has(pt.id);

                  return (
                    <button
                      key={pt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPoint(pt);
                      }}
                      style={{ left: `${pt.xPercent}%`, top: `${pt.yPercent}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all z-10 ${
                        isSelected ? 'scale-125 z-30' : 'hover:scale-115'
                      }`}
                      title={pt.name}
                    >
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-lg border-2 transition-all ${
                          isSelected
                            ? 'bg-amber-400 border-white text-slate-900 ring-4 ring-amber-400/40 shadow-amber-400/30'
                            : isDone
                            ? 'bg-emerald-600 border-white text-white ring-2 ring-emerald-300'
                            : 'bg-white border-teal-500 text-slate-800'
                        }`}
                      >
                        <span>{pt.icon}</span>
                        {isDone && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border border-white">
                            ✓
                          </div>
                        )}
                      </div>

                      {/* Tooltip label */}
                      <span
                        className={`absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm pointer-events-none transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white'
                            : 'bg-white/95 text-slate-800 border border-slate-200 opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {pt.name.slice(0, 18)}...
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Quick Select Carousel */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {filteredPoints.map((pt) => {
                  const isSelected = selectedPoint?.id === pt.id;
                  const isDone = completedPointIds.has(pt.id);
                  return (
                    <button
                      key={pt.id}
                      onClick={() => handleSelectPoint(pt)}
                      className={`p-2.5 rounded-2xl border text-left text-xs font-bold transition-all flex items-center gap-2 truncate ${
                        isSelected
                          ? 'bg-teal-50 border-teal-400 text-teal-950 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-base shrink-0">{pt.icon}</span>
                      <div className="truncate">
                        <div className="truncate text-[11px] font-extrabold">{pt.name}</div>
                        <div className="text-[9px] text-slate-400 font-medium">
                          {isDone ? '✅ Đã hoàn thành' : `+${pt.pointsReward} Điểm`}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Location Mission & Action Sheet (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {selectedPoint ? (
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-100 shadow-sm space-y-5 animate-in zoom-in-95 duration-150">
                  {/* Point Header */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-teal-100 text-teal-900 font-extrabold px-2.5 py-0.5 rounded-full">
                          {selectedPoint.zoneNameVi}
                        </span>
                        {completedPointIds.has(selectedPoint.id) && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Đã đạt</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-800 mt-2 leading-snug">
                        {selectedPoint.name}
                      </h3>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center text-2xl shrink-0 border border-teal-100">
                      {selectedPoint.icon}
                    </div>
                  </div>

                  {/* Photo preview if available */}
                  {selectedPoint.imageUrl && (
                    <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
                      <img
                        src={selectedPoint.imageUrl}
                        alt={selectedPoint.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to SVG placeholder if offline
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {selectedPoint.description}
                  </p>

                  {/* Safety Note */}
                  {selectedPoint.safetyNote && (
                    <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                      <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span>{selectedPoint.safetyNote}</span>
                    </div>
                  )}

                  {/* Tips Card */}
                  {selectedPoint.tips && (
                    <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 text-xs">
                      <strong className="text-emerald-950 flex items-center gap-1.5 mb-1 font-black">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Lời khuyên của Bé Mầm Xanh:</span>
                      </strong>
                      <p className="text-emerald-800 font-medium leading-relaxed">
                        {selectedPoint.tips}
                      </p>
                    </div>
                  )}

                  {/* Attached Lesson Card */}
                  {selectedPoint.mission.attachedLesson && (
                    <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-200 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-sky-950">
                        <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                        <span>Bài học xanh: {selectedPoint.mission.attachedLesson.topic}</span>
                      </div>
                      <p className="text-sky-800 text-[11px] font-medium leading-relaxed">
                        {selectedPoint.mission.attachedLesson.takeaway}
                      </p>
                    </div>
                  )}

                  {/* Environmental Mission Card */}
                  <div className="bg-gradient-to-br from-amber-50/80 to-yellow-50/40 p-4 sm:p-5 rounded-3xl border border-amber-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-md">
                        Nhiệm Vụ Môi Trường (+{selectedPoint.pointsReward} Điểm Xanh)
                      </span>
                    </div>

                    <h4 className="font-black text-slate-800 text-sm">
                      {selectedPoint.mission.title}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium">
                      {selectedPoint.mission.description}
                    </p>

                    {/* Quiz Mission Type */}
                    {selectedPoint.mission.type === 'quiz' && (
                      <div className="space-y-2 pt-2 text-xs">
                        <p className="font-extrabold text-slate-800">
                          {selectedPoint.mission.question}
                        </p>
                        <div className="space-y-1.5">
                          {selectedPoint.mission.options?.map((opt, oIdx) => (
                            <button
                              key={oIdx}
                              onClick={() => {
                                playSound('click');
                                setSelectedQuizAnswer(oIdx);
                              }}
                              className={`w-full p-2.5 rounded-xl border text-left font-bold transition-all flex items-center gap-2 ${
                                selectedQuizAnswer === oIdx
                                  ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-xs'
                                  : 'bg-white text-slate-700 hover:bg-amber-100/50 border-slate-200'
                              }`}
                            >
                              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black">
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span>{opt}</span>
                            </button>
                          ))}
                        </div>

                        {showAnswerExplanation && selectedPoint.mission.explanation && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold mt-2">
                            💡 {selectedPoint.mission.explanation}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Report Mission Type */}
                    {selectedPoint.mission.type === 'action_report' && (
                      <div className="space-y-2 pt-2 text-xs">
                        <label className="font-bold text-slate-800 block">
                          {selectedPoint.mission.actionPrompt || 'Ghi lại hành động của em tại đây:'}
                        </label>
                        <textarea
                          rows={2}
                          value={actionReportText}
                          onChange={(e) => setActionReportText(e.target.value)}
                          placeholder="Ví dụ: Em đã cùng bạn gấp gọn 3 hộp sữa giấy học đường..."
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-hidden"
                        />
                      </div>
                    )}

                    {/* Mission Submit Button */}
                    <div className="pt-2">
                      <button
                        onClick={handleCompleteMission}
                        disabled={isTaskDone}
                        className={`w-full py-3 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                          isTaskDone
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 hover:scale-102 active:scale-98'
                        }`}
                      >
                        {isTaskDone ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Đã Hoàn Thành Nhiệm Vụ Này</span>
                          </>
                        ) : (
                          <>
                            <Award className="w-4 h-4 text-amber-300" />
                            <span>Nộp Nhiệm Vụ & Nhận +{selectedPoint.pointsReward} Điểm Xanh</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Integration: Linked Game or Diary Action */}
                    {selectedPoint.mission.linkedTab && onNavigate && (
                      <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                        <span className="text-[11px] text-amber-900 font-bold">
                          Liên kết bài học & trò chơi:
                        </span>
                        <button
                          onClick={handleOpenLinkedFeature}
                          className="flex items-center gap-1 text-xs font-black text-emerald-700 bg-white hover:bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-300 shadow-xs transition-all hover:scale-105 active:scale-95"
                        >
                          {selectedPoint.mission.linkedTab === 'game' ? (
                            <>
                              <Gamepad2 className="w-3.5 h-3.5 text-amber-600" />
                              <span>Mở Trò Chơi Xanh</span>
                            </>
                          ) : selectedPoint.mission.linkedTab === 'scanner' ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-sky-600" />
                              <span>Mở AI Nhận Diện Rác</span>
                            </>
                          ) : (
                            <>
                              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Ghi Vào Nhật Ký Xanh</span>
                            </>
                          )}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-400">
                  <MapPin className="w-10 h-10 mx-auto opacity-50 mb-2" />
                  <p className="text-xs font-bold">Chọn một điểm xanh trên bản đồ để khám phá</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: QUẢN LÝ PHÂN KHU TRƯỜNG HỌC (CAMPUS ZONES)
      ======================================================== */}
      {activeTab === 'zones' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Layers className="w-6 h-6 text-emerald-600" />
                <span>Quản Lý Các Phân Khu Trong Trường Tiểu Học Sa Pa</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Thầy cô có thể tạo và tùy biến các khu vực: Sân trường, Vườn cây, Lớp học, Trạm rác, Nước sạch, Năng lượng...
              </p>
            </div>

            <button
              onClick={handleOpenAddZoneModal}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Phân Khu Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.map((z) => {
              const pointCount = points.filter((p) => p.zone === z.id).length;
              return (
                <div
                  key={z.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between gap-4 hover:border-teal-300 transition-all"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center text-2xl shrink-0 border border-teal-100">
                      {z.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-teal-100 text-teal-900">
                          {pointCount} Điểm ghim
                        </span>
                        {z.isCustom && (
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                            Tự tạo
                          </span>
                        )}
                      </div>
                      <h4 className="font-black text-slate-900 text-base">{z.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {z.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[10px]">
                      Mã khu: {z.id}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditZoneModal(z)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>
                      {z.isCustom && (
                        <button
                          onClick={() => handleDeleteZone(z.id)}
                          className="p-1.5 rounded-xl hover:bg-rose-50 text-rose-600 transition-all"
                          title="Xóa khu vực này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: QUẢN LÝ ĐIỂM XANH TRƯỜNG HỌC (POINTS MANAGEMENT)
      ======================================================== */}
      {activeTab === 'points' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Edit3 className="w-6 h-6 text-emerald-600" />
                <span>Quản Lý Điểm Sinh Thái Trên Sơ Đồ Trường Học</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Thầy cô có thể thêm, chỉnh sửa tọa độ (x, y), phân khu, nhiệm vụ và bài học xanh đính kèm.
              </p>
            </div>

            <button
              onClick={() => handleOpenAddPointModal()}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Điểm Xanh Mới</span>
            </button>
          </div>

          {/* Points List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {points.map((pt) => (
              <div
                key={pt.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between gap-4 hover:border-teal-300 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center text-2xl shrink-0 border border-teal-100">
                    {pt.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-teal-100 text-teal-900">
                        {pt.zoneNameVi}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Tọa độ: {pt.xPercent}%, {pt.yPercent}%
                      </span>
                    </div>
                    <h4 className="font-black text-slate-900 text-base">{pt.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {pt.description}
                    </p>
                    <div className="text-[11px] text-amber-800 font-bold mt-2">
                      Nhiệm vụ: <strong>{pt.mission.title}</strong> (+{pt.pointsReward} Điểm)
                    </div>
                    {pt.mission.attachedLesson && (
                      <div className="text-[10px] text-sky-700 font-semibold mt-1">
                        📖 Bài học: {pt.mission.attachedLesson.topic}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[10px]">
                    Tạo bởi: {pt.createdBy}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditPointModal(pt)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={() => handleDeletePoint(pt.id)}
                      className="p-1.5 rounded-xl hover:bg-rose-50 text-rose-600 transition-all"
                      title="Xóa điểm này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: NHIỆM VỤ KHU VỰC (ZONE CHALLENGES)
      ======================================================== */}
      {activeTab === 'zone_tasks' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Target className="w-6 h-6 text-sky-600" />
                <span>Nhiệm Vụ Xanh Theo Từng Khu Vực Trường Học</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Thầy cô có thể tạo chiến dịch và thử thách xanh gắn liền với từng phân khu cụ thể cho từng khối lớp.
              </p>
            </div>

            <button
              onClick={() => setShowZoneTaskModal(true)}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-sky-600/20 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Nhiệm Vụ Khu Vực</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {zoneTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between gap-4 hover:border-sky-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-sky-100 text-sky-900">
                      📍 {task.zoneName}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                      Áp dụng: Lớp {task.targetClass}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 text-base">{task.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {task.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="font-black text-emerald-700">
                    +{task.pointsReward} Điểm Xanh Thưởng
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">Bởi: {task.createdBy}</span>
                    <button
                      onClick={() => handleDeleteZoneTask(task.id)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-all"
                      title="Xóa nhiệm vụ này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: DUYỆT BÀI NỘP CỦA HỌC SINH (REVIEW SUBMISSIONS)
      ======================================================== */}
      {activeTab === 'submissions' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-amber-500" />
                <span>Duyệt Nội Dung Học Sinh Gửi Từ Bản Đồ</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Xem lại câu trả lời và báo cáo hành động xanh của các em tại từng trạm trường học.
              </p>
            </div>

            {/* Submissions Filter */}
            <div className="flex items-center gap-2">
              <select
                value={submissionFilterStatus}
                onChange={(e) => setSubmissionFilterStatus(e.target.value)}
                className="p-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-800"
              >
                <option value="ALL">Tất Cả Trạng Thái</option>
                <option value="pending">⏳ Chờ duyệt</option>
                <option value="approved">✓ Đã duyệt</option>
                <option value="rejected">✕ Cần sửa lại</option>
              </select>

              <select
                value={submissionFilterClass}
                onChange={(e) => setSubmissionFilterClass(e.target.value)}
                className="p-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-800"
              >
                <option value="ALL">Tất Cả Lớp</option>
                <option value="1A1">Lớp 1A1</option>
                <option value="2A2">Lớp 2A2</option>
                <option value="3A1">Lớp 3A1</option>
                <option value="4B">Lớp 4B</option>
                <option value="5A">Lớp 5A</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <span className="text-base">📍</span>
                    <span>Điểm xanh: <strong>{sub.pointName}</strong></span>
                  </div>
                  <span className="text-slate-400 text-[11px]">
                    Học sinh: <strong>{sub.studentNickname}</strong> (Lớp {sub.className}) • {new Date(sub.submittedAt).toLocaleString('vi-VN')}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Nội dung nộp:
                  </span>
                  <p className="text-slate-800 font-semibold leading-relaxed">
                    {typeof sub.submittedAnswer === 'number'
                      ? `Đã chọn đáp án trắc nghiệm: ${String.fromCharCode(65 + sub.submittedAnswer)}`
                      : sub.submittedAnswer || sub.notes}
                  </p>
                </div>

                {sub.teacherFeedback && (
                  <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 font-medium">
                    💬 Lời dặn của thầy cô: {sub.teacherFeedback}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                      sub.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-900'
                        : sub.status === 'pending'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-rose-100 text-rose-900'
                    }`}>
                      {sub.status === 'approved' ? '✓ Đã Duyệt (+ Điểm Xanh)' : sub.status === 'pending' ? '⏳ Chờ Thầy Cô Duyệt' : '✕ Cần Làm Lại'}
                    </span>
                    {sub.reviewedBy && (
                      <span className="text-[10px] text-slate-400">
                        Bởi: {sub.reviewedBy}
                      </span>
                    )}
                  </div>

                  {sub.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Nhận xét khen ngợi..."
                        value={teacherReviewNote[sub.id] || ''}
                        onChange={(e) => setTeacherReviewNote({ ...teacherReviewNote, [sub.id]: e.target.value })}
                        className="p-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
                      />
                      <button
                        onClick={() => handleReviewSubmission(sub.id, 'approved')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
                      >
                        Duyệt +30đ
                      </button>
                      <button
                        onClick={() => handleReviewSubmission(sub.id, 'rejected')}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                      >
                        Yêu Cầu Làm Lại
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredSubmissions.length === 0 && (
              <div className="text-center py-10 bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs font-bold">
                Không tìm thấy bài nộp nào phù hợp với bộ lọc.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 6: TIẾN ĐỘ HOÀN THÀNH CỦA CÁC LỚP (CLASS PROGRESS)
      ======================================================== */}
      {activeTab === 'progress' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-6 border border-indigo-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-600" />
                <span>Tiến Độ Khám Phá Bản Đồ Xanh Theo Từng Lớp</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Theo dõi mức độ hoàn thành nhiệm vụ môi trường của các khối lớp tiểu học Sa Pa.
              </p>
            </div>

            <div className="text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-200 px-3 py-1.5 rounded-xl">
              5 Khối Lớp Thi Đua
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {classProgress.map((cls) => {
              const maxPossible = points.length * (cls.studentCount || 1);
              const percent = maxPossible > 0 ? Math.min(100, Math.round((cls.completedCount / maxPossible) * 100)) : 0;

              return (
                <div
                  key={cls.className}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3 text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-xl font-black mx-auto">
                    {cls.className}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-base">Lớp {cls.className}</h4>
                    <p className="text-[11px] text-slate-400">{cls.studentCount} Học sinh</p>
                  </div>

                  <div className="bg-indigo-50 p-3 rounded-2xl border border-indigo-100">
                    <div className="text-[10px] text-indigo-800 font-bold uppercase">Nhiệm vụ đạt:</div>
                    <div className="text-xl font-black text-indigo-950 mt-0.5">{cls.completedCount} Lượt</div>
                    <div className="w-full h-1.5 bg-indigo-200 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>

                  <div className="text-xs font-black text-emerald-700">
                    +{cls.totalPoints} Điểm Xanh
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: THÊM / SỬA ĐIỂM XANH TRƯỜNG HỌC
      ======================================================== */}
      {showPointModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-teal-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📍</span>
                <h3 className="text-base sm:text-lg font-black text-slate-800">
                  {editingPointId ? 'Chỉnh Sửa Điểm Xanh' : 'Thêm Điểm Xanh Mới Vào Sơ Đồ Trường'}
                </h3>
              </div>
              <button
                onClick={() => setShowPointModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePoint} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 mb-1 block">Tên điểm xanh trên sơ đồ:</label>
                <input
                  type="text"
                  value={pointName}
                  onChange={(e) => setPointName(e.target.value)}
                  placeholder="Ví dụ: Bồn nước lọc RO tự ngắt, Hộp gom pin cũ..."
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Phân khu trường học:</label>
                  <select
                    value={pointZone}
                    onChange={(e) => setPointZone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.icon} {z.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Biểu tượng (Icon emoji):</label>
                  <input
                    type="text"
                    value={pointIcon}
                    onChange={(e) => setPointIcon(e.target.value)}
                    placeholder="♻️, 💧, 🌸, 🏫, 🔋..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Tọa độ X (% ngang):</label>
                  <input
                    type="number"
                    min={5}
                    max={95}
                    value={pointXPercent}
                    onChange={(e) => setPointXPercent(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Tọa độ Y (% dọc):</label>
                  <input
                    type="number"
                    min={5}
                    max={95}
                    value={pointYPercent}
                    onChange={(e) => setPointYPercent(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Điểm Xanh thưởng:</label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    step={5}
                    value={pointPointsReward}
                    onChange={(e) => setPointPointsReward(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Ảnh minh họa (URL):</label>
                <input
                  type="url"
                  value={pointImgUrl}
                  onChange={(e) => setPointImgUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Mô tả điểm xanh:</label>
                <textarea
                  rows={2}
                  value={pointDesc}
                  onChange={(e) => setPointDesc(e.target.value)}
                  placeholder="Mô tả công dụng và vị trí trong trường Sa Pa..."
                  className="w-full p-2 rounded-xl border border-slate-200 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Lời khuyên của Bé Mầm Xanh:</label>
                <input
                  type="text"
                  value={pointTips}
                  onChange={(e) => setPointTips(e.target.value)}
                  placeholder="Ví dụ: Vặn chặt vòi nước khi rửa tay xong..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Ghi chú an toàn cho học sinh:</label>
                <input
                  type="text"
                  value={pointSafetyNote}
                  onChange={(e) => setPointSafetyNote(e.target.value)}
                  placeholder="Ví dụ: Khu vực an toàn có camera và giáo viên giám sát..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800"
                />
              </div>

              {/* Mission Builder Section */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="font-black text-amber-950 text-xs flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Thiết lập Nhiệm Vụ Môi Trường & Bài Học:</span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Tên nhiệm vụ:</label>
                  <input
                    type="text"
                    value={missionTitle}
                    onChange={(e) => setMissionTitle(e.target.value)}
                    placeholder="Ví dụ: Thử thách phân loại rác tại trạm..."
                    className="w-full p-2 bg-white rounded-xl border border-slate-200 font-bold text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 mb-1 block">Hình thức nhiệm vụ:</label>
                    <select
                      value={missionType}
                      onChange={(e) => setMissionType(e.target.value as any)}
                      className="w-full p-2 bg-white rounded-xl border border-slate-200 font-bold text-slate-800"
                    >
                      <option value="quiz">Câu hỏi trắc nghiệm</option>
                      <option value="action_report">Báo cáo hành động thực tế</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 mb-1 block">Liên kết phân hệ:</label>
                    <select
                      value={missionLinkedTab}
                      onChange={(e) => setMissionLinkedTab(e.target.value)}
                      className="w-full p-2 bg-white rounded-xl border border-slate-200 font-bold text-slate-800"
                    >
                      <option value="game">Khu Trò Chơi (Green Game)</option>
                      <option value="diary">Nhật Ký Xanh (Green Diary)</option>
                      <option value="scanner">AI Máy Quét (Green Vision)</option>
                      <option value="ai">Trợ Lý AI (Green Guide)</option>
                    </select>
                  </div>
                </div>

                {/* Attached Lesson */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 mb-1 block">Chủ đề bài học đính kèm:</label>
                    <input
                      type="text"
                      value={lessonTopic}
                      onChange={(e) => setLessonTopic(e.target.value)}
                      placeholder="Ví dụ: Quy trình phân loại vỏ hộp sữa..."
                      className="w-full p-2 bg-white rounded-xl border border-slate-200 font-medium text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 mb-1 block">Thông điệp cốt lõi:</label>
                    <input
                      type="text"
                      value={lessonTakeaway}
                      onChange={(e) => setLessonTakeaway(e.target.value)}
                      placeholder="Ví dụ: Uống hết sữa -> gấp bẹp -> thùng vàng..."
                      className="w-full p-2 bg-white rounded-xl border border-slate-200 font-medium text-slate-800"
                    />
                  </div>
                </div>

                {missionType === 'quiz' ? (
                  <div className="space-y-2">
                    <div>
                      <label className="font-bold text-slate-700 mb-1 block">Câu hỏi trắc nghiệm:</label>
                      <input
                        type="text"
                        value={missionQuestion}
                        onChange={(e) => setMissionQuestion(e.target.value)}
                        placeholder="Nội dung câu hỏi..."
                        className="w-full p-2 bg-white rounded-xl border border-slate-200 font-bold text-slate-800"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 block">4 Đáp án (Chọn radio để đặt đáp án đúng):</label>
                      {missionOptions.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200">
                          <input
                            type="radio"
                            name="correct-mission-opt"
                            checked={missionCorrectIndex === oIdx}
                            onChange={() => setMissionCorrectIndex(oIdx)}
                            className="w-4 h-4 text-teal-600"
                          />
                          <span className="font-extrabold text-slate-400">{String.fromCharCode(65 + oIdx)}.</span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const next = [...missionOptions];
                              next[oIdx] = e.target.value;
                              setMissionOptions(next);
                            }}
                            className="flex-1 font-medium text-slate-800 focus:outline-hidden"
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 mb-1 block">Lời giải thích khen ngợi:</label>
                      <input
                        type="text"
                        value={missionExplanation}
                        onChange={(e) => setMissionExplanation(e.target.value)}
                        placeholder="Chính xác! Lời giải thích..."
                        className="w-full p-2 bg-white rounded-xl border border-slate-200 font-medium text-slate-800"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="font-bold text-slate-700 mb-1 block">Lời gợi mở hành động cho học sinh:</label>
                    <input
                      type="text"
                      value={missionActionPrompt}
                      onChange={(e) => setMissionActionPrompt(e.target.value)}
                      placeholder="Ví dụ: Em hãy ghi lại số lượng rác em đã nhặt hôm nay..."
                      className="w-full p-2 bg-white rounded-xl border border-slate-200 font-medium text-slate-800"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPointModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black shadow-md shadow-teal-600/20"
                >
                  Lưu Điểm Xanh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: THÊM / SỬA PHÂN KHU TRƯỜNG HỌC
      ======================================================== */}
      {showZoneModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-emerald-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏫</span>
                <h3 className="text-base sm:text-lg font-black text-slate-800">
                  {editingZoneId ? 'Sửa Phân Khu Trường Học' : 'Thêm Phân Khu Trường Học Mới'}
                </h3>
              </div>
              <button
                onClick={() => setShowZoneModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveZone} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 mb-1 block">Tên phân khu trường học:</label>
                <input
                  type="text"
                  required
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  placeholder="Ví dụ: Khu vườn ươm Sa Pa, Sân bóng thể thao..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Biểu tượng (Icon emoji):</label>
                <input
                  type="text"
                  value={zoneIcon}
                  onChange={(e) => setZoneIcon(e.target.value)}
                  placeholder="🌳, 🚩, 🏫, ♻️, 💧..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Mô tả đặc điểm & hoạt động:</label>
                <textarea
                  rows={2}
                  value={zoneDesc}
                  onChange={(e) => setZoneDesc(e.target.value)}
                  placeholder="Mô tả vai trò môi trường của phân khu này..."
                  className="w-full p-2 rounded-xl border border-slate-200 font-medium text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowZoneModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md shadow-emerald-600/20"
                >
                  Lưu Phân Khu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: TẠO NHIỆM VỤ KHU VỰC CHO THẦY CÔ
      ======================================================== */}
      {showZoneTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-sky-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <h3 className="text-base sm:text-lg font-black text-slate-800">
                  Tạo Nhiệm Vụ Xanh Tại Khu Vực
                </h3>
              </div>
              <button
                onClick={() => setShowZoneTaskModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateZoneTask} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 mb-1 block">Tên chiến dịch / Thử thách:</label>
                <input
                  type="text"
                  required
                  value={newZoneTaskTitle}
                  onChange={(e) => setNewZoneTaskTitle(e.target.value)}
                  placeholder="Ví dụ: Chiến dịch chăm sóc vườn su su Sa Pa..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Khu vực chỉ định:</label>
                  <select
                    value={newZoneTaskZoneId}
                    onChange={(e) => setNewZoneTaskZoneId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                  >
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.icon} {z.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Khối lớp thực hiện:</label>
                  <select
                    value={newZoneTaskTargetClass}
                    onChange={(e) => setNewZoneTaskTargetClass(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                  >
                    <option value="TOÀN TRƯỜNG">Toàn Trường</option>
                    <option value="1A1">Lớp 1A1</option>
                    <option value="2A2">Lớp 2A2</option>
                    <option value="3A1">Lớp 3A1</option>
                    <option value="4B">Lớp 4B</option>
                    <option value="5A">Lớp 5A</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Điểm Xanh thưởng:</label>
                <input
                  type="number"
                  min={10}
                  max={200}
                  step={5}
                  value={newZoneTaskPoints}
                  onChange={(e) => setNewZoneTaskPoints(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Hướng dẫn cụ thể cho học sinh:</label>
                <textarea
                  rows={2}
                  value={newZoneTaskDesc}
                  onChange={(e) => setNewZoneTaskDesc(e.target.value)}
                  placeholder="Ví dụ: Giờ ra chơi các em nhặt rác quanh bồn hoa và bỏ vào thùng rác..."
                  className="w-full p-2 rounded-xl border border-slate-200 font-medium text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowZoneTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black shadow-md shadow-sky-600/20"
                >
                  Phát Động Nhiệm Vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
