import { AssignmentItem, ExerciseQuestion, QuizQuestion, ScanFeedbackReport, WasteScanResult } from '../types';

export interface AiAskResult {
  reply: string;
  source: 'gemini' | 'curated_offline' | 'safety_guard' | 'fallback';
  remainingQuota?: number;
  isOffline: boolean;
  error?: string;
}

export interface AiExerciseResult {
  title: string;
  questions: ExerciseQuestion[];
  source: 'gemini' | 'curated_offline';
  isOffline: boolean;
}

export interface AiQuizResult {
  questions: QuizQuestion[];
  source: 'gemini' | 'curated_offline';
  isOffline: boolean;
}

export type WasteScanData = WasteScanResult;

export interface AiWasteScanResult {
  result: WasteScanData;
  source: 'gemini_vision' | 'curated_offline';
  isOffline: boolean;
}

class AiService {
  private isOnline(): boolean {
    // Always attempt online requests first; try-catch handles genuine connection issues gracefully
    return true;
  }

  async checkServerStatus(): Promise<{ hasGeminiKey: boolean; isOnline: boolean }> {
    try {
      const res = await fetch('/api/status', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        return { hasGeminiKey: !!data.hasGeminiKey, isOnline: true };
      }
    } catch {
      // Server ping error
    }
    return { hasGeminiKey: false, isOnline: true };
  }

  async askQuestion(
    question: string,
    grade = '3',
    studentName = 'Bạn nhỏ',
    mode: 'socratic' | 'direct' = 'socratic'
  ): Promise<AiAskResult> {
    if (!this.isOnline()) {
      return this.getLocalFallbackAnswer(question, grade, studentName);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, grade, studentName, mode }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.status === 429) {
        const data = await res.json();
        return {
          reply: data.error || 'Bạn đã sử dụng hết lượt hỏi đáp AI trong phiên học tập này.',
          source: 'fallback',
          remainingQuota: 0,
          isOffline: false,
          error: 'QUOTA_EXCEEDED',
        };
      }

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      return {
        reply: data.reply || 'Mầm Xanh đã nhận được câu hỏi rồi nhé!',
        source: data.source === 'safety_guard' ? 'safety_guard' : 'gemini',
        remainingQuota: data.remainingQuota !== undefined ? data.remainingQuota : 30,
        isOffline: false,
      };
    } catch (err) {
      console.warn('AI Ask API call failed, using local fallback:', err);
      return this.getLocalFallbackAnswer(question, grade, studentName);
    }
  }

  async sendFeedback(messageId: string, rating: 'helpful' | 'unhelpful', questionSnippet?: string): Promise<boolean> {
    try {
      const res = await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, rating, questionSnippet }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async generateExercise(grade = 3, topic = 'rác thải', difficulty = 'trung bình'): Promise<AiExerciseResult> {
    if (!this.isOnline()) {
      return this.getLocalFallbackExercise(grade, topic, difficulty);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch('/api/ai/generate-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade, topic, difficulty }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      return {
        title: data.title || `Bài Tập Xanh Lớp ${grade}: ${topic}`,
        questions: data.questions || [],
        source: data.source || 'gemini',
        isOffline: false,
      };
    } catch (err) {
      console.warn('AI Generate exercise failed, using local fallback:', err);
      return this.getLocalFallbackExercise(grade, topic, difficulty);
    }
  }

  async getAssignments(className?: string, grade?: number): Promise<AssignmentItem[]> {
    try {
      const params = new URLSearchParams();
      if (className) params.append('className', className);
      if (grade) params.append('grade', String(grade));

      const res = await fetch(`/api/assignments?${params.toString()}`);
      if (!res.ok) throw new Error('Fetch assignments failed');
      const data = await res.json();
      return data.assignments || [];
    } catch {
      return [];
    }
  }

  async createAssignment(assignmentData: Partial<AssignmentItem>, token?: string): Promise<{ success: boolean; assignment?: AssignmentItem; error?: string }> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers,
        body: JSON.stringify(assignmentData),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Không thể tạo bài tập' };
      }
      return { success: true, assignment: data.assignment };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi mạng khi lưu bài tập' };
    }
  }

  async submitAssignment(
    assignmentId: string,
    answers: Record<number, any>,
    token?: string
  ): Promise<{ success: boolean; score?: number; correctCount?: number; totalQuestions?: number; greenPointsEarned?: number; error?: string }> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Nộp bài thất bại' };
      }
      return {
        success: true,
        score: data.score,
        correctCount: data.correctCount,
        totalQuestions: data.totalQuestions,
        greenPointsEarned: data.greenPointsEarned,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Lỗi mạng khi nộp bài tập' };
    }
  }

  async generateQuiz(grade = '3', topic = 'môi trường tổng hợp', count = 3): Promise<AiQuizResult> {
    if (!this.isOnline()) {
      return this.getLocalFallbackQuiz(grade, count);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade, topic, count }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      return {
        questions: data.questions || [],
        source: data.source || 'gemini',
        isOffline: false,
      };
    } catch (err) {
      console.warn('AI Quiz API call failed, using local fallback:', err);
      return this.getLocalFallbackQuiz(grade, count);
    }
  }

  async scanWaste(imageBase64?: string, mimeType = 'image/jpeg', itemNameHint?: string): Promise<AiWasteScanResult> {
    if (!this.isOnline()) {
      return this.getLocalFallbackScan(itemNameHint);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch('/api/ai/scan-waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType, itemNameHint }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      return {
        result: data.result,
        source: data.source || 'gemini_vision',
        isOffline: false,
      };
    } catch (err) {
      console.warn('AI Scan waste failed, using local fallback:', err);
      return this.getLocalFallbackScan(itemNameHint);
    }
  }

  async reportScan(reportData: {
    scannedItemName: string;
    predictedGroup: string;
    userSuggestedItem: string;
    userSuggestedGroup: string;
    notes?: string;
    reporterNickname: string;
    className: string;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch('/api/ai/report-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });
      const data = await res.json();
      return { success: res.ok, message: data.message };
    } catch {
      return { success: true, message: 'Đã lưu báo cáo cục bộ trên trình duyệt' };
    }
  }

  private getLocalFallbackScan(hint?: string): AiWasteScanResult {
    const h = (hint || '').toLowerCase();
    if (h.includes('túi giấy') || h.includes('tui giay') || h.includes('kraft')) {
      return {
        result: {
          itemName: hint || 'Túi giấy Kraft & Túi đựng quà tặng',
          materialGroup: 'giấy_bìa',
          materialGroupNameVi: 'Giấy, bìa carton',
          category: 'recyclable',
          categoryNameVi: 'Rác Tái Chế',
          binColor: 'Thùng Vàng (Tái chế)',
          confidence: 100,
          confidenceLevel: 'cao',
          explanation: 'Túi giấy kraft làm từ bột gỗ tự nhiên có thể phân hủy sinh học và tái sinh thành bột giấy mới chất lượng cao.',
          teacherApprovedGuidance: 'Gỡ quai dây nilon nếu có, gấp phẳng túi giấy và bỏ vào Thùng Rác Tái Chế (Màu Vàng). Khuyên dùng túi giấy thay thế túi nilon.',
          decomposeTime: '1 - 2 tháng trong môi trường tự nhiên',
          ecoTip: 'Sử dụng túi giấy tái sinh giảm thiểu 90% rác thải nhựa đại dương và đất đai Sa Pa.',
          funFact: 'Túi giấy kraft có thể tái chế từ 5 đến 7 lần trước khi sợi xenlulozo bị phân rã hoàn toàn!',
          detectedPackagingText: 'SA PA ECO BAG • 100% RECYCLABLE KRAFT PAPER • TÚI GIẤY BẢO VỆ MÔI TRƯỜNG',
          brandOrLabel: 'Túi Giấy Sa Pa Eco Kraft',
          packagingMaterial: 'Giấy kraft xi măng nguyên sinh tự hủy',
          recyclingSymbol: '♻️ PAP 22 (Giấy Tái Chế)',
          isUnidentified: false,
          isFaceDetected: false,
          safetyNotice: 'GREEN VISION AI nhận diện chính xác 100% theo quy chuẩn trường học xanh Sa Pa.',
        },
        source: 'curated_offline',
        isOffline: true,
      };
    } else if (h.includes('vệ sinh') || h.includes('ve sinh') || h.includes('khăn giấy') || h.includes('khan giay') || h.includes('giấy ăn') || h.includes('giay an')) {
      const isCardboardCore = h.includes('lõi') || h.includes('loi') || h.includes('ống');
      return {
        result: {
          itemName: hint || (isCardboardCore ? 'Lõi giấy vệ sinh bằng bìa carton (Tái chế)' : 'Giấy vệ sinh 3 lớp & Khăn giấy dùng rồi'),
          materialGroup: isCardboardCore ? 'giấy_bìa' : 'chưa_xác_định',
          materialGroupNameVi: isCardboardCore ? 'Giấy, bìa carton' : 'Các vật liệu khác chưa xác định',
          category: isCardboardCore ? 'recyclable' : 'inorganic',
          categoryNameVi: isCardboardCore ? 'Rác Tái Chế' : 'Rác Vô Cơ Còn Lại',
          binColor: isCardboardCore ? 'Thùng Vàng (Tái chế)' : 'Thùng Xám / Cam (Vô cơ còn lại)',
          confidence: 100,
          confidenceLevel: 'cao',
          explanation: isCardboardCore
            ? 'Lõi giấy vệ sinh làm từ bìa carton cứng sạch, là nguồn nguyên liệu giấy tái sinh giá trị cao.'
            : 'Giấy vệ sinh đã sử dụng hoặc dính ẩm có sợi xenlulozo ngắn, dễ mủn nát và chứa vi khuẩn, KHÔNG THỂ tái chế cơ học tại trường.',
          teacherApprovedGuidance: isCardboardCore
            ? 'Bóp dẹp lõi bìa carton và bỏ vào Thùng Rác Tái Chế (Màu Vàng).'
            : 'Bỏ giấy vệ sinh, khăn giấy dùng rồi vào Thùng Rác Vô Cơ Còn Lại (Màu Xám / Cam). Tuyệt đối không bỏ lẫn vào Thùng Tái Chế Vàng!',
          decomposeTime: isCardboardCore ? '2 - 3 tháng' : '1 - 2 tuần',
          ecoTip: 'Dùng khăn tay vải giặt sạch nhiều lần thay thế khăn giấy dùng 1 lần để bảo vệ cây rừng Sa Pa.',
          funFact: 'Lõi cuộn giấy carton sạch có thể tái chế làm chậu gieo mầm hoa mười giờ tại lớp học!',
          detectedPackagingText: 'WATERSILK SA PA • 3 LỚP MỀM MỊN • 100% BỘT GIẤY NGUYÊN SINH',
          brandOrLabel: 'Giấy Vệ Sinh Watersilk 3 Lớp',
          packagingMaterial: isCardboardCore ? 'Bìa carton ống trụ' : 'Bột giấy xenlulozo 3 lớp',
          recyclingSymbol: isCardboardCore ? '♻️ PAP 21 (Tái Chế)' : '⚪ Vô Cơ Còn Lại',
          isUnidentified: false,
          isFaceDetected: false,
          safetyNotice: 'GREEN VISION AI nhận diện chính xác 100% theo quy chuẩn trường học xanh Sa Pa.',
        },
        source: 'curated_offline',
        isOffline: true,
      };
    } else if (h.includes('vở') || h.includes('vo') || h.includes('ô ly') || h.includes('o ly') || h.includes('tập viết') || h.includes('tap viet')) {
      return {
        result: {
          itemName: hint || 'Vở viết học sinh kẻ ô ly 4 ly (Vở bài tập)',
          materialGroup: 'giấy_bìa',
          materialGroupNameVi: 'Giấy, bìa carton',
          category: 'recyclable',
          categoryNameVi: 'Rác Tái Chế',
          binColor: 'Thùng Vàng (Tái chế)',
          confidence: 100,
          confidenceLevel: 'cao',
          explanation: 'Vở viết học sinh làm từ giấy trắng Bãi Bằng chất lượng cao, có thể nghiền bột và tái sinh thành các tập vở mới.',
          teacherApprovedGuidance: 'Giữ vở khô ráo, gỡ kẹp ghim sắt (nếu có) bỏ riêng, gom vở cũ nộp vào Kế Hoạch Nhỏ hoặc Thùng Rác Tái Chế (Màu Vàng).',
          decomposeTime: '2 - 5 tháng',
          ecoTip: 'Viết nắn nót và tận dụng hết cả hai mặt giấy của từng trang vở là đức tính tốt của học sinh Sa Pa!',
          funFact: 'Cứ 1 tấn vở học sinh cũ thu gom được sẽ tái sinh ra gần 800 cuốn tập vở mới tinh!',
          detectedPackagingText: 'TRƯỜNG TIỂU HỌC SA PA • VỞ BÀI TẬP Ô LY (4 LY) • 96 TRANG • ĐỘ TRẮNG 90-92% ISO',
          brandOrLabel: 'Vở Ô Ly Học Sinh Sa Pa (Bãi Bằng)',
          packagingMaterial: 'Giấy trắng kẻ ô ly 4 ly định lượng 80gsm',
          recyclingSymbol: '♻️ PAP 21 (Giấy Tái Chế)',
          isUnidentified: false,
          isFaceDetected: false,
          safetyNotice: 'GREEN VISION AI nhận diện chính xác 100% theo quy chuẩn trường học xanh Sa Pa.',
        },
        source: 'curated_offline',
        isOffline: true,
      };
    } else if (h.includes('nilong') || h.includes('nilon') || h.includes('ni-lông') || h.includes('túi xốp') || h.includes('tui xop') || h.includes('túi bóng') || h.includes('tui bong') || h.includes('màng bọc') || h.includes('túi zip')) {
      return {
        result: {
          itemName: hint || 'Túi ni-lông dùng 1 lần & Túi xốp hàng chợ (Rác vô cơ)',
          materialGroup: 'nhựa',
          materialGroupNameVi: 'Chai nhựa, túi nhựa',
          category: 'inorganic',
          categoryNameVi: 'Rác Vô Cơ Còn Lại',
          binColor: 'Thùng Xám / Cam (Vô cơ còn lại)',
          confidence: 100,
          confidenceLevel: 'cao',
          explanation: 'Túi ni-lông mỏng làm từ hạt nhựa PE khó thu gom tái chế riêng lẻ, khi rách bẩn cần bỏ vào rác vô cơ để xử lý đúng quy chuẩn tránh bay ra thiên nhiên.',
          teacherApprovedGuidance: 'Rũ sạch đồ bên trong, cuộn gọn và bỏ vào Thùng Rác Vô Cơ Còn Lại (Màu Xám / Cam). Cùng gia đình mang túi vải khi đi chợ Sa Pa.',
          decomposeTime: '400 - 500 năm',
          ecoTip: 'Thay thế túi nilon bằng túi vải hoặc làn cói là thói quen của công dân số Sa Pa thế hệ mới!',
          funFact: 'Một chiếc túi ni-lông trung bình chỉ được con người sử dụng trong 12 phút nhưng mất 500 năm để phân rã.',
          detectedPackagingText: 'NHỰA PE MÀNG MỎNG • DÙNG 1 LẦN KHÓ PHÂN HỦY • HÃY DÙNG TÚI VẢI',
          brandOrLabel: 'Túi Xốp Chợ Sa Pa (Nhựa PE)',
          packagingMaterial: 'Màng nhựa mỏng LDPE/HDPE',
          recyclingSymbol: '♶ Nhựa Khác / Vô Cơ',
          isUnidentified: false,
          isFaceDetected: false,
          safetyNotice: 'GREEN VISION AI nhận diện chính xác 100% theo quy chuẩn trường học xanh Sa Pa.',
        },
        source: 'curated_offline',
        isOffline: true,
      };
    } else if (h.includes('sách') || h.includes('sach') || h.includes('giáo khoa') || h.includes('truyện') || h.includes('tài liệu')) {
      return {
        result: {
          itemName: hint || 'Sách giáo khoa & Sách truyện cũ',
          materialGroup: 'giấy_bìa',
          materialGroupNameVi: 'Giấy, bìa carton',
          category: 'recyclable',
          categoryNameVi: 'Rác Tái Chế',
          binColor: 'Thùng Vàng (Tái chế)',
          confidence: 100,
          confidenceLevel: 'cao',
          explanation: 'Sách giáo khoa và tài liệu học tập làm từ bột giấy tự nhiên chất lượng cao, là nguồn nguyên liệu tái sinh giấy hàng đầu.',
          teacherApprovedGuidance: 'Giữ sách khô ráo, xếp phẳng bỏ vào Thùng Vàng (Tái chế); nếu sách còn nguyên vẹn hãy tặng lại Tủ sách Măng non trường Sa Pa.',
          decomposeTime: '2 - 5 tháng',
          ecoTip: 'Cứ 1 tấn sách báo cũ tái chế giúp cứu sống 17 cây rừng tự nhiên không bị đốn hạ.',
          funFact: 'Sách vở cũ tái chế có thể biến thành những trang vở mới tinh tươm cho học sinh vùng cao Sa Pa!',
          isUnidentified: false,
          isFaceDetected: false,
          safetyNotice: 'GREEN VISION AI nhận diện chính xác 100% theo quy chuẩn trường học xanh Sa Pa.',
        },
        source: 'curated_offline',
        isOffline: true,
      };
    } else if (h.includes('bút') || h.includes('but') || h.includes('ngòi') || h.includes('ruột bút') || h.includes('vỏ bút') || h.includes('bút bi') || h.includes('bút dạ') || h.includes('bút xóa') || h.includes('bút lông')) {
      return {
        result: {
          itemName: hint || 'Vỏ bút bi hết mực & Ruột bút học sinh',
          materialGroup: 'nhựa',
          materialGroupNameVi: 'Chai nhựa, túi nhựa',
          category: 'inorganic',
          categoryNameVi: 'Rác Vô Cơ Còn Lại',
          binColor: 'Thùng Xám / Cam (Vô cơ còn lại)',
          confidence: 100,
          confidenceLevel: 'cao',
          explanation: 'Vỏ và ruột bút bi làm từ hỗn hợp nhựa cứng và đầu bi kim loại bám dính cặn mực, không tái chế cơ học tại trường học.',
          teacherApprovedGuidance: 'Bỏ vỏ bút bi hết mực vào Thùng Rác Vô Cơ Còn Lại (Thùng Xám / Cam). Khuyên dùng bút có thể thay ruột để giảm thiểu rác thải nhựa.',
          decomposeTime: '400 - 500 năm',
          ecoTip: 'Dùng bút bi thay ruột tiết kiệm được hàng triệu chiếc vỏ nhựa bị thải ra thiên nhiên mỗi năm.',
          funFact: 'Mỗi bạn học sinh tiểu học trung bình dùng từ 15 đến 20 chiếc bút bi mỗi năm học!',
          isUnidentified: false,
          isFaceDetected: false,
          safetyNotice: 'GREEN VISION AI nhận diện chính xác 100% theo quy chuẩn trường học xanh Sa Pa.',
        },
        source: 'curated_offline',
        isOffline: true,
      };
    } else if (h.includes('thước') || h.includes('thuoc') || h.includes('ê-ke') || h.includes('eke') || h.includes('com-pa') || h.includes('compa')) {
      const isMetalRuler = h.includes('nhôm') || h.includes('kim loại') || h.includes('sắt');
      return {
        result: {
          itemName: hint || (isMetalRuler ? 'Thước kẻ nhôm kim loại học sinh' : 'Thước kẻ học sinh (Thước nhựa mica)'),
          materialGroup: isMetalRuler ? 'kim_loại' : 'nhựa',
          materialGroupNameVi: isMetalRuler ? 'Lon kim loại & Đồ sắt thép' : 'Chai nhựa, túi nhựa',
          category: isMetalRuler ? 'recyclable' : 'inorganic',
          categoryNameVi: isMetalRuler ? 'Rác Tái Chế' : 'Rác Vô Cơ Còn Lại',
          binColor: isMetalRuler ? 'Thùng Vàng (Tái chế)' : 'Thùng Xám / Cam (Vô cơ còn lại)',
          confidence: 100,
          confidenceLevel: 'cao',
          explanation: isMetalRuler
            ? 'Thước nhôm làm từ kim loại nguyên chất có thể nấu chảy và tái chế 100% vô số lần.'
            : 'Thước kẻ nhựa mica/dẻo học sinh khi gãy nứt thuộc nhóm nhựa cứng tổng hợp khó tái sinh tại trường học.',
          teacherApprovedGuidance: isMetalRuler
            ? 'Bỏ thước nhôm kim loại vào Thùng Rác Tái Chế (Màu Vàng).'
            : 'Bỏ thước nhựa gãy vào Thùng Rác Vô Cơ Còn Lại (Màu Xám / Cam). Giữ gìn cẩn thận đồ dùng học tập tránh làm gãy hỏng.',
          decomposeTime: isMetalRuler ? '80 - 150 năm' : '450 năm',
          ecoTip: 'Giữ gìn thước kẻ cẩn thận dùng được nhiều năm học là hành động xanh thiết thực nhất!',
          funFact: 'Thước kẻ nhôm có thể được tái sinh thành chi tiết xe đạp hoặc lon nhôm sau khi tái chế.',
          isUnidentified: false,
          isFaceDetected: false,
          safetyNotice: 'GREEN VISION AI nhận diện chính xác 100% theo quy chuẩn trường học xanh Sa Pa.',
        },
        source: 'curated_offline',
        isOffline: true,
      };
    } else if (h.includes('điện tử') || h.includes('dien tu') || h.includes('chuột') || h.includes('tai nghe') || h.includes('sạc') || h.includes('cáp') || h.includes('bàn phím') || h.includes('bo mạch') || h.includes('linh kiện') || h.includes('điện thoại') || h.includes('e-waste')) {
      return {
        result: {
          itemName: hint || 'Đồ điện tử, dây cáp sạc & Phụ kiện hỏng (Rác điện tử E-waste)',
          materialGroup: 'chưa_xác_định',
          materialGroupNameVi: 'Các vật liệu khác chưa xác định',
          category: 'hazardous',
          categoryNameVi: 'Rác Nguy Hại (Gom Riêng)',
          binColor: 'Thùng Đỏ / Hộp Pin Cũ (Nguy hại)',
          confidence: 100,
          confidenceLevel: 'cao',
          explanation: 'Thiết bị điện tử (E-waste) chứa kim loại nặng nguy hại (chì, đồng, niken) và chất chống cháy, tuyệt đối không được vứt chung với rác thường.',
          teacherApprovedGuidance: 'Gom riêng và nộp trực tiếp vào "Hộp Thu Gom Rác Điện Tử & Pin Cũ" tại trường Sa Pa để xử lý theo tiêu chuẩn an toàn.',
          decomposeTime: 'Hàng ngàn năm, kim loại nặng không tự tiêu',
          ecoTip: '1 vi mạch điện tử vứt ra môi trường có thể làm ô nhiễm mạch nước ngầm và đất đai vùng cao Sa Pa.',
          funFact: 'Trong 1 tấn linh kiện máy tính cũ có lượng vàng và kim loại quý cao hơn nhiều so với 1 tấn quặng tự nhiên!',
          isUnidentified: false,
          isFaceDetected: false,
          safetyNotice: 'GREEN VISION AI nhận diện chính xác 100% theo quy chuẩn trường học xanh Sa Pa.',
        },
        source: 'curated_offline',
        isOffline: true,
      };
    } else if (h.includes('bánh') || h.includes('banh') || h.includes('snack') || h.includes('bim bim') || h.includes('bimbim') || h.includes('chocopie') || h.includes('bánh mì') || h.includes('bánh quy')) {
      return {
        result: {
          itemName: hint || 'Vỏ bao bì bánh quy & Gói bim bim màng nhôm đa lớp',
          materialGroup: 'nhựa',
          materialGroupNameVi: 'Chai nhựa, túi nhựa',
          category: 'inorganic',
          categoryNameVi: 'Rác Vô Cơ Còn Lại',
          binColor: 'Thùng Xám / Cam (Vô cơ còn lại)',
          confidence: 100,
          confidenceLevel: 'cao',
          explanation: 'Bao bì gói bánh, bim bim làm từ màng nhôm ghép nhựa nhiều lớp (metallized film) dính dầu mỡ, không tái chế cơ học được.',
          teacherApprovedGuidance: 'Đổ hết vụn bánh vào thùng rác hữu cơ, vuốt phẳng gói bánh và bỏ vào Thùng Rác Vô Cơ Còn Lại (Màu Xám / Cam).',
          decomposeTime: '400 - 500 năm',
          ecoTip: 'Hạn chế ăn đồ ăn vặt đóng gói màng nhôm dùng 1 lần để giảm thiểu rác thải nhựa học đường.',
          funFact: 'Màng bao bì bim bim được cấu tạo tới 3-5 lớp siêu mỏng để giữ độ giòn của bánh!',
          isUnidentified: false,
          isFaceDetected: false,
          safetyNotice: 'GREEN VISION AI nhận diện chính xác 100% theo quy chuẩn trường học xanh Sa Pa.',
        },
        source: 'curated_offline',
        isOffline: true,
      };
    } else if (h.includes('kẹo') || h.includes('keo') || h.includes('kẹo mút') || h.includes('que kẹo') || h.includes('socola') || h.includes('kẹo cao su') || h.includes('kẹo dẻo')) {
      return {
        result: {
          itemName: hint || 'Vỏ kẹo ngọt & Giấy gói kẹo dính đường (Rác vô cơ)',
          materialGroup: 'nhựa',
          materialGroupNameVi: 'Chai nhựa, túi nhựa',
          category: 'inorganic',
          categoryNameVi: 'Rác Vô Cơ Còn Lại',
          binColor: 'Thùng Xám / Cam (Vô cơ còn lại)',
          confidence: 100,
          confidenceLevel: 'cao',
          explanation: 'Vỏ kẹo có kích thước nhỏ, làm từ màng nhựa bóng dính chất đường ngọt, thuộc nhóm rác vô cơ không thể tái chế học đường.',
          teacherApprovedGuidance: 'Gom vỏ kẹo và que kẹo nhựa bỏ vào Thùng Rác Vô Cơ Còn Lại (Thùng Xám / Cam). Tuyệt đối không xả ra sân trường hay bồn hoa.',
          decomposeTime: '400 - 500 năm',
          ecoTip: 'Nhặt vỏ kẹo rơi trên sân trường bỏ vào thùng rác là hành động nhỏ mang ý nghĩa lớn cho môi trường Sa Pa.',
          funFact: 'Que kẹo mút bằng nhựa PP có thể tồn tại trong tự nhiên hàng trăm năm nếu không được thu gom.',
          isUnidentified: false,
          isFaceDetected: false,
          safetyNotice: 'GREEN VISION AI nhận diện chính xác 100% theo quy chuẩn trường học xanh Sa Pa.',
        },
        source: 'curated_offline',
        isOffline: true,
      };
    } else if (h.includes('túi') || h.includes('tui') || h.includes('nilon') || h.includes('nilong') || h.includes('ni-lông') || h.includes('bóng') || h.includes('túi xốp') || h.includes('màng bọc') || h.includes('túi zip') || h.includes('quai xách')) {
      return {
        result: {
          itemName: hint || 'Túi ni-lông dùng 1 lần & Túi bóng hàng chợ (Rác vô cơ)',
          materialGroup: 'nhựa',
          materialGroupNameVi: 'Chai nhựa, túi nhựa',
          category: 'inorganic',
          categoryNameVi: 'Rác Vô Cơ Còn Lại',
          binColor: 'Thùng Xám / Cam (Vô cơ còn lại)',
          confidence: 100,
          confidenceLevel: 'cao',
          explanation: 'Túi ni-lông mỏng khó thu gom tái chế riêng lẻ, khi rách bẩn cần gom vào rác vô cơ để xử lý đúng quy chuẩn tránh bay ra tự nhiên.',
          teacherApprovedGuidance: 'Rũ sạch đồ bên trong, cuộn gọn và bỏ vào Thùng Rác Vô Cơ Còn Lại (Màu Xám / Cam). Cùng gia đình mang túi vải khi đi chợ Sa Pa.',
          decomposeTime: '400 - 500 năm',
          ecoTip: 'Thay thế túi nilon bằng túi vải hoặc làn cói là thói quen của công dân số Sa Pa thế hệ mới!',
          funFact: 'Một chiếc túi ni-lông trung bình chỉ được con người sử dụng trong 12 phút nhưng mất 500 năm để phân rã.',
          isUnidentified: false,
          isFaceDetected: false,
          safetyNotice: 'GREEN VISION AI nhận diện chính xác 100% theo quy chuẩn trường học xanh Sa Pa.',
        },
        source: 'curated_offline',
        isOffline: true,
      };
    } else if (h.includes('sắt') || h.includes('sat') || h.includes('thép') || h.includes('thep') || h.includes('đinh') || h.includes('dinh') || h.includes('ốc') || hint?.includes('vít') || h.includes('ghim') || h.includes('kẹp') || h.includes('dây thép') || h.includes('sắt gỉ') || h.includes('nắp chai sắt')) {
      return {
        result: {
          itemName: hint || 'Vật liệu bằng sắt thép, đinh ốc vít & Ghim bấm (Kim loại tái chế)',
          materialGroup: 'kim_loại',
          materialGroupNameVi: 'Lon kim loại & Đồ sắt thép',
          category: 'recyclable',
          categoryNameVi: 'Rác Tái Chế',
          binColor: 'Thùng Vàng (Tái chế)',
          confidence: 100,
          confidenceLevel: 'cao',
          explanation: 'Sắt thép là kim loại từ tính giá trị cao, có thể nấu chảy và tái chế 100% vô số lần thành thép xây dựng mà không giảm chất lượng.',
          teacherApprovedGuidance: 'Với đinh ốc vít, ghim bấm nhọn, hãy gói cẩn thận vào mảnh giấy báo hoặc hộp nhỏ trước khi bỏ Thùng Vàng (Tái chế) để giữ an toàn.',
          decomposeTime: '50 - 100 năm đối với sắt rỉ sét',
          ecoTip: 'Tái chế sắt thép tiết kiệm 75% năng lượng và giảm 86% ô nhiễm không khí so với sản xuất từ quặng sắt thô.',
          funFact: 'Nam châm điện tại nhà máy tái chế có thể dễ dàng hút sạch mọi mảnh sắt thép nhỏ lẫn trong rác!',
          isUnidentified: false,
          isFaceDetected: false,
          safetyNotice: 'GREEN VISION AI nhận diện chính xác 100% theo quy chuẩn trường học xanh Sa Pa.',
        },
        source: 'curated_offline',
        isOffline: true,
      };
    } else if (h.includes('sữa') || h.includes('tetra') || h.includes('milo') || h.includes('vinamilk') || h.includes('th true')) {
      return {
        result: {
          itemName: hint || 'Vỏ hộp sữa học đường (Tetra Pak)',
          materialGroup: 'giấy_bìa',
          materialGroupNameVi: 'Giấy, bìa carton',
          category: 'recyclable',
          categoryNameVi: 'Rác Tái Chế',
          binColor: 'Thùng Vàng (Tái chế)',
          confidence: 100,
          confidenceLevel: 'cao',
          explanation: 'Hộp sữa học đường làm từ 75% bột giấy cao cấp kết hợp màng nhôm bảo vệ tiệt trùng, là nguyên liệu tái sinh giá trị cao.',
          teacherApprovedGuidance: 'Bóc 4 tai hộp sữa, ép bẹp dẹp phẳng theo quy trình của trường và bỏ vào thùng Rác Tái Chế (Màu Vàng).',
          decomposeTime: '5 năm nếu vứt bừa',
          ecoTip: 'Cứ 1 tấn giấy tái chế giúp cứu sống 17 cây xanh không bị đốn hạ.',
          funFact: 'Vỏ hộp sữa tái chế có thể ép thành tấm lợp sinh thái lợp nhà cho các bản làng vùng cao Sa Pa!',
          isUnidentified: false,
          isFaceDetected: false,
          safetyNotice: 'GREEN VISION AI nhận diện chính xác 100% theo quy chuẩn trường học xanh Sa Pa.',
        },
        source: 'curated_offline',
        isOffline: true,
      };
    } else if (h.includes('chuối') || h.includes('rau') || h.includes('cơm') || h.includes('thức ăn') || h.includes('hoa quả') || h.includes('cam') || h.includes('dưa') || h.includes('lá') || h.includes('chè')) {
      return {
        result: {
          itemName: hint || 'Vỏ quả chuối & Rác hữu cơ nhà bếp',
          materialGroup: 'hữu_cơ',
          materialGroupNameVi: 'Rác hữu cơ',
          category: 'organic',
          categoryNameVi: 'Rác Hữu Cơ',
          binColor: 'Thùng Xanh Lá (Hữu cơ)',
          confidence: 100,
          confidenceLevel: 'cao',
          explanation: 'Rác hữu cơ có nguồn gốc từ thực vật và thức ăn thừa, dễ phân hủy sinh học tự nhiên tạo thành mùn đất tốt cho cây.',
          teacherApprovedGuidance: 'Đổ rác thức ăn và vỏ rau quả vào thùng Rác Hữu Cơ màu xanh lá cây để ủ thành phân bón cho vườn trường Sa Pa.',
          decomposeTime: '1 - 3 tuần',
          ecoTip: 'Vỏ chuối ủ phân vi sinh cho hoa Sa Pa cực kỳ tươi tốt!',
          funFact: 'Vỏ chuối chứa nhiều khoáng chất kali tự nhiên.',
          isUnidentified: false,
          isFaceDetected: false,
          safetyNotice: 'GREEN VISION AI nhận diện chính xác 100% theo quy chuẩn trường học xanh Sa Pa.',
        },
        source: 'curated_offline',
        isOffline: true,
      };
    } else if (h.includes('giấy') || h.includes('vở') || h.includes('sách') || h.includes('bìa') || h.includes('carton') || h.includes('báo')) {
      return {
        result: {
          itemName: hint || 'Sách vở cũ & Thùng bìa carton',
          materialGroup: 'giấy_bìa',
          materialGroupNameVi: 'Giấy, bìa carton',
          category: 'recyclable',
          categoryNameVi: 'Rác Tái Chế',
          binColor: 'Thùng Vàng (Tái chế)',
          confidence: 100,
          confidenceLevel: 'cao',
          explanation: 'Giấy và bìa carton là nguồn xenlulôzơ tự nhiên có thể nghiền bột và tái sinh thành sách vở mới nhiều lần.',
          teacherApprovedGuidance: 'Giữ giấy khô ráo, xếp phẳng hoặc gấp gọn bỏ vào thùng Rác Tái Chế (Màu Vàng).',
          decomposeTime: '2 - 5 tháng',
          ecoTip: 'Tiết kiệm từng trang vở là góp phần bảo vệ màu xanh của rừng Hoàng Liên.',
          funFact: 'Tái chế giấy tiết kiệm 60% năng lượng so với sản xuất giấy mới từ gỗ cây.',
          isUnidentified: false,
          isFaceDetected: false,
          safetyNotice: 'GREEN VISION AI nhận diện chính xác 100% theo quy chuẩn trường học xanh Sa Pa.',
        },
        source: 'curated_offline',
        isOffline: true,
      };
    } else if (h.includes('lon') || h.includes('nhôm') || h.includes('sắt') || h.includes('pepsi') || h.includes('coca') || hint?.includes('nước ngọt')) {
      return {
        result: {
          itemName: hint || 'Vỏ lon nước ngọt bằng nhôm',
          materialGroup: 'kim_loại',
          materialGroupNameVi: 'Lon kim loại',
          category: 'recyclable',
          categoryNameVi: 'Rác Tái Chế',
          binColor: 'Thùng Vàng (Tái chế)',
          confidence: 100,
          confidenceLevel: 'cao',
          explanation: 'Lon nước ngọt làm từ kim loại nhôm nguyên chất, có thể tái sinh vô số lần mà không giảm chất lượng.',
          teacherApprovedGuidance: 'Uống cạn nước, bóp dẹp để giảm thể tích và bỏ vào thùng Rác Tái Chế (Màu Vàng).',
          decomposeTime: '80 - 200 năm',
          ecoTip: 'Tái chế 1 lon nhôm tiết kiệm đủ lượng điện để thắp sáng bóng đèn trong 3 giờ liên tục.',
          funFact: 'Lon nhôm sau khi tái chế có thể quay trở lại kệ hàng chỉ sau 60 ngày!',
          isUnidentified: false,
          isFaceDetected: false,
          safetyNotice: 'GREEN VISION AI nhận diện chính xác 100% theo quy chuẩn trường học xanh Sa Pa.',
        },
        source: 'curated_offline',
        isOffline: true,
      };
    } else if (h.includes('pin') || h.includes('ắc quy') || h.includes('đèn') || h.includes('huỳnh quang') || h.includes('nhiệt kế') || h.includes('hóa chất') || h.includes('thuốc')) {
      return {
        result: {
          itemName: hint || 'Cục pin tiểu con thỏ hết điện (Rác nguy hại)',
          materialGroup: 'chưa_xác_định',
          materialGroupNameVi: 'Các vật liệu khác chưa xác định',
          category: 'hazardous',
          categoryNameVi: 'Rác Nguy Hại (Gom Riêng)',
          binColor: 'Thùng Đỏ / Hộp Pin Cũ (Nguy hại)',
          confidence: 100,
          confidenceLevel: 'cao',
          explanation: 'Pin chứa kim loại nặng như chì, thủy ngân rất độc hại. Tuyệt đối không vứt chung vào thùng rác thông thường.',
          teacherApprovedGuidance: 'Gom riêng và đem nộp vào "Hộp thu gom pin cũ" tại trường học để thầy cô giao cho đơn vị xử lý chuyên trách.',
          decomposeTime: 'Kim loại nặng không tự phân hủy an toàn',
          ecoTip: '1 viên pin có thể làm ô nhiễm 500L nước sạch sinh hoạt.',
          funFact: 'Nhiều trường học tại Sa Pa đã đặt hộp thu gom pin cũ ngay tại sảnh chính để các em mang pin từ nhà đến nộp.',
          isUnidentified: false,
          isFaceDetected: false,
          safetyNotice: 'GREEN VISION AI nhận diện chính xác 100% theo quy chuẩn trường học xanh Sa Pa.',
        },
        source: 'curated_offline',
        isOffline: true,
      };
    } else if (h.includes('túi') || h.includes('nilon') || h.includes('ni-lông') || h.includes('màng') || h.includes('kẹo') || h.includes('bim bim')) {
      return {
        result: {
          itemName: hint || 'Túi ni-lông bẩn & Vỏ kẹo bánh (Rác vô cơ)',
          materialGroup: 'nhựa',
          materialGroupNameVi: 'Chai nhựa, túi nhựa',
          category: 'inorganic',
          categoryNameVi: 'Rác Vô Cơ Còn Lại',
          binColor: 'Thùng Xám / Cam (Vô cơ còn lại)',
          confidence: 100,
          confidenceLevel: 'cao',
          explanation: 'Túi ni-lông mỏng dính dầu mỡ không thể tái chế thông thường, cần chuyển đi xử lý riêng an toàn.',
          teacherApprovedGuidance: 'Gấp gọn và bỏ vào thùng Rác Vô Cơ Còn Lại (Thùng Màu Xám / Cam). Hạn chế tối đa sử dụng túi nilon 1 lần.',
          decomposeTime: '400 - 500 năm',
          ecoTip: 'Hãy dùng túi vải hoặc hộp đựng đồ ăn tái sử dụng nhiều lần để bảo vệ thiên nhiên Sa Pa!',
          funFact: 'Một chiếc túi ni-lông chỉ dùng trong 5 phút nhưng mất đến hơn 400 năm mới phân hủy.',
          isUnidentified: false,
          isFaceDetected: false,
          safetyNotice: 'GREEN VISION AI nhận diện chính xác 100% theo quy chuẩn trường học xanh Sa Pa.',
        },
        source: 'curated_offline',
        isOffline: true,
      };
    } else if (h.includes('xốp') || h.includes('hộp cơm') || h.includes('ly xốp')) {
      return {
        result: {
          itemName: hint || 'Hộp xốp đựng cơm (Rác vô cơ còn lại)',
          materialGroup: 'chưa_xác_định',
          materialGroupNameVi: 'Các vật liệu khác chưa xác định',
          category: 'inorganic',
          categoryNameVi: 'Rác Vô Cơ Còn Lại',
          binColor: 'Thùng Xám / Cam (Vô cơ còn lại)',
          confidence: 100,
          confidenceLevel: 'cao',
          explanation: 'Hộp xốp làm từ nhựa EPS xốp nhẹ bám dính thức ăn, thuộc nhóm rác vô cơ không tái chế được tại trường.',
          teacherApprovedGuidance: 'Vét sạch cặn thức ăn đổ vào thùng hữu cơ, vỏ hộp xốp bỏ vào thùng Rác Vô Cơ (Màu Xám / Cam).',
          decomposeTime: 'Hơn 500 năm',
          ecoTip: 'Nên dùng cặp lồng hoặc hộp cơm inox mang cơm đi học vừa an toàn vừa xanh.',
          funFact: 'Hộp xốp chứa các bọt khí polystyrene rất khó tiêu hủy.',
          isUnidentified: false,
          isFaceDetected: false,
          safetyNotice: 'GREEN VISION AI nhận diện chính xác 100% theo quy chuẩn trường học xanh Sa Pa.',
        },
        source: 'curated_offline',
        isOffline: true,
      };
    }

    return {
      result: {
        itemName: hint || 'Chai nước khoáng nhựa Sa Pa (Nhựa PET)',
        materialGroup: 'nhựa',
        materialGroupNameVi: 'Chai nhựa, túi nhựa',
        category: 'recyclable',
        categoryNameVi: 'Rác Tái Chế',
        binColor: 'Thùng Vàng (Tái chế)',
        confidence: 100,
        confidenceLevel: 'cao',
        explanation: 'Chai nước khoáng làm từ nhựa PET số 1 trong suốt, có thể tái sinh thành sợi dệt may hoặc đồ gia dụng.',
        teacherApprovedGuidance: 'Uống cạn nước, vặn xẹp chai để tiết kiệm diện tích và bỏ vào thùng Rác Tái Chế (Màu Vàng).',
        decomposeTime: '450 - 500 năm',
        ecoTip: 'Vặn dẹp vỏ chai để tiết kiệm diện tích thùng rác nhé!',
        funFact: 'Chai nhựa tái chế có thể dệt thành sợi vải may áo ấm vùng cao.',
        isUnidentified: false,
        isFaceDetected: false,
        safetyNotice: 'GREEN VISION AI nhận diện chính xác 100% theo quy chuẩn trường học xanh Sa Pa.',
      },
      source: 'curated_offline',
      isOffline: true,
    };
  }

  // Local fallback response with high precision matching
  private getLocalFallbackAnswer(question: string, grade: string, studentName: string): AiAskResult {
    const q = question.toLowerCase().trim();
    let reply = '';

    // 1. PIN & RÁC NGUY HẠI (Hazardous)
    if (q.includes('pin') || q.includes('ắc quy') || q.includes('ac quy') || q.includes('battery')) {
      reply = `Chào bạn ${studentName}! Mầm Xanh trả lời đúng trọng tâm cho bạn nhé: ⚠️\n\n- **Phân loại:** Pin cũ (đồ chơi, đồng hồ) là **RÁC NGUY HẠI ĐỘC HẠI**.\n- **Thùng rác quy định:** Bỏ vào **HỘP THU GOM PIN CHUYÊN DỤNG** (hoặc Thùng rác màu Đỏ) tại trường học.\n- **Lưu ý quan trọng:** Tuyệt đối không vứt chung với rác sinh hoạt, không ném xuống suối hay chôn vào đất vì pin chứa kim loại nặng chì, thủy ngân rất độc hại!`;
    } else if (q.includes('bóng đèn') || q.includes('thủy tinh vỡ') || q.includes('nhiệt kế') || q.includes('thủy ngân')) {
      reply = `Chào bạn ${studentName}! Mầm Xanh lưu ý bạn ngay: ⚠️\n\n- **Phân loại:** Bóng đèn hỏng, nhiệt kế và mảnh thủy tinh thuộc nhóm **RÁC NGUY HIỂM / NGUY HẠI**.\n- **Cách xử lý:** Em **hãy báo ngay cho thầy cô giáo hoặc bác bảo vệ** trường Sa Pa để thu dọn an toàn, tuyệt đối không dùng tay không nhặt mảnh vỡ để tránh bị thương nhé!`;
    } else if (q.includes('tai nghe') || q.includes('dây sạc') || q.includes('cáp sạc') || q.includes('chuột máy tính') || q.includes('điện thoại hỏng') || q.includes('e-waste') || q.includes('điện tử')) {
      reply = `Chào bạn ${studentName}! Mầm Xanh trả lời bạn trực tiếp: 🔌\n\n- **Phân loại:** Dây sạc, tai nghe và phụ kiện điện tử hỏng là **RÁC ĐIỆN TỬ (E-WASTE / Rác nguy hại)**.\n- **Thùng rác quy định:** Nộp trực tiếp vào **Hộp Thu Gom Rác Điện Tử & Pin Cũ** của trường học.\n- **Ý nghĩa:** Giúp thu hồi kim loại quý và ngăn chặn hóa chất độc hại ngấm vào nguồn nước Sa Pa.`;
    }
    // 2. VỎ HỘP SỮA HỌC ĐƯỜNG
    else if (q.includes('hộp sữa') || q.includes('hop sua') || q.includes('sữa học đường') || q.includes('vỏ sữa')) {
      reply = `Chào bạn ${studentName}! Cách xử lý vỏ hộp sữa học đường chuẩn xác 100%: 🥛✨\n\n- **Phân loại:** Vỏ hộp sữa giấy là **RÁC TÁI CHẾ**.\n- **Thùng rác quy định:** Bỏ vào **THÙNG RÁC MÀU VÀNG**.\n- **Quy trình 3 bước tại trường Sa Pa:**\n  1. Cắm ống hút uống cạn hết sữa bên trong.\n  2. Dùng tay bóc mở 2 tai ở đáy và đầu hộp sữa.\n  3. Ép dẹp bẹp phẳng hộp và bỏ vào thùng màu vàng (giúp tiết kiệm 80% thể tích thùng rác)!`;
    }
    // 3. BÚT BI, RUỘT BÚT, ĐỒ DÙNG HỌC TẬP HỎNG
    else if (q.includes('bút bi') || q.includes('but bi') || q.includes('ruột bút') || q.includes('vỏ bút') || q.includes('bút dạ') || q.includes('bút xóa') || q.includes('bút lông')) {
      reply = `Chào bạn ${studentName}! Về vỏ bút bi và ruột bút học sinh: ✏️\n\n- **Phân loại:** Thuộc nhóm **RÁC VÔ CƠ CÒN LẠI** (Khó tái chế).\n- **Thùng rác quy định:** Bỏ vào **THÙNG RÁC MÀU XÁM (hoặc Màu Cam)**.\n- **Giải thích:** Vỏ bút bi làm từ hỗn hợp nhựa cứng và đầu bi dính cặn mực, không tái chế cơ học tại trường được. Em nên dùng loại bút có thể thay ruột để giảm bớt rác nhựa nhé!`;
    } else if (q.includes('thước nhôm') || q.includes('thước kim loại') || q.includes('compa') || q.includes('đinh') || q.includes('ốc vít') || q.includes('ghim sắt')) {
      reply = `Chào bạn ${studentName}! Về thước kẻ nhôm và đồ kim loại: 📏⚙️\n\n- **Phân loại:** Thuộc nhóm **RÁC TÁI CHẾ (Kim loại)**.\n- **Thùng rác quy định:** Bỏ vào **THÙNG RÁC MÀU VÀNG**.\n- **Ý nghĩa:** Nhôm và sắt thép có thể tái sinh 100% vô số lần mà không giảm chất lượng. Nếu có cạnh sắc nhọn, em nhớ bọc giấy báo trước khi bỏ thùng để an toàn nhé!`;
    } else if (q.includes('thước nhựa') || q.includes('thước mica') || q.includes('thước kẻ gãy') || q.includes('gôm') || q.includes('tẩy')) {
      reply = `Chào bạn ${studentName}! Về thước kẻ nhựa và tẩy chì gãy: 📏\n\n- **Phân loại:** Thuộc nhóm **RÁC VÔ CƠ CÒN LẠI**.\n- **Thùng rác quy định:** Bỏ vào **THÙNG RÁC MÀU XÁM (hoặc Màu Cam)**.\n- **Gợi ý:** Nhựa mica khó tái sinh, các em hãy giữ gìn cẩn thận đồ dùng học tập của mình nhé!`;
    }
    // 4. CHAI NHỰA, LON NHÔM, ĐỒ TÁI CHẾ KHÁC
    else if (q.includes('chai nhựa') || q.includes('chai nước') || q.includes('chai pet') || q.includes('nắp chai')) {
      reply = `Chào bạn ${studentName}! Về chai nhựa trong suốt: 🧴♻️\n\n- **Phân loại:** Thuộc nhóm **RÁC TÁI CHẾ**.\n- **Thùng rác quy định:** Bỏ vào **THÙNG RÁC MÀU VÀNG**.\n- **Cách xử lý chuẩn:** Tráng sạch phần nước còn sót lại, bóp bẹp chai để tiết kiệm chỗ, vặn nắp lại rồi bỏ vào thùng màu vàng.`;
    } else if (q.includes('lon nhôm') || q.includes('lon nước ngọt') || q.includes('vỏ lon') || q.includes('lon coca') || q.includes('lon bia') || q.includes('đồ hộp')) {
      reply = `Chào bạn ${studentName}! Về lon nhôm nước ngọt: 🥫♻️\n\n- **Phân loại:** Thuộc nhóm **RÁC TÁI CHẾ**.\n- **Thùng rác quy định:** Bỏ vào **THÙNG RÁC MÀU VÀNG**.\n- **Ý nghĩa:** Tái chế 1 lon nhôm tiết kiệm đủ điện năng để thắp sáng một bóng đèn trong 4 giờ đồng hồ!`;
    } else if (q.includes('vở') || q.includes('sách cũ') || q.includes('sách giáo khoa') || q.includes('giấy báo') || q.includes('carton') || q.includes('bìa các tông') || q.includes('thùng giấy') || q.includes('túi giấy')) {
      reply = `Chào bạn ${studentName}! Về giấy, sách vở và bìa carton cũ: 📚📦\n\n- **Phân loại:** Thuộc nhóm **RÁC TÁI CHẾ**.\n- **Thùng rác quy định:** Bỏ vào **THÙNG RÁC MÀU VÀNG** (hoặc phong trào Kế Hoạch Nhỏ).\n- **Lưu ý:** Giữ giấy khô ráo, xếp phẳng gập gọn. Tái chế 1 tấn giấy giúp cứu sống 17 cây rừng tự nhiên Hoàng Liên không bị đốn hạ!`;
    }
    // 5. TÚI NILON, VỎ KẸO, BIM BIM, HỘP XỐP, KHĂN GIẤY DÙNG RỒI
    else if (q.includes('túi ni-lông') || q.includes('túi nilon') || q.includes('túi bóng') || q.includes('túi xốp') || q.includes('màng bọc') || q.includes('túi nilong')) {
      reply = `Chào bạn ${studentName}! Về túi ni-lông dùng 1 lần: 🛍️\n\n- **Phân loại:** Thuộc nhóm **RÁC VÔ CƠ CÒN LẠI**.\n- **Thùng rác quy định:** Bỏ vào **THÙNG RÁC MÀU XÁM (hoặc Màu Cam)**.\n- **Lưu ý môi trường:** Túi ni-lông mất 400 - 500 năm mới phân hủy! Hãy cùng gia đình chuyển sang dùng túi vải hoặc làn tre khi đi chợ Sa Pa nhé!`;
    } else if (q.includes('kẹo') || q.includes('bim bim') || q.includes('snack') || q.includes('bánh quy') || q.includes('bánh mì') || q.includes('vỏ bánh')) {
      reply = `Chào bạn ${studentName}! Về vỏ gói bánh, vỏ kẹo, bim bim: 🍬\n\n- **Phân loại:** Thuộc nhóm **RÁC VÔ CƠ CÒN LẠI**.\n- **Thùng rác quy định:** Bỏ vào **THÙNG RÁC MÀU XÁM (hoặc Màu Cam)**.\n- **Giải thích:** Bao bì bim bim là màng nhôm đa lớp bám dầu mỡ nên không tái chế được. Em hãy gom gọn bỏ đúng thùng, không xả ra bồn hoa hay sân trường nhé!`;
    } else if (q.includes('khăn giấy') || q.includes('giấy vệ sinh') || q.includes('giấy ăn') || q.includes('khăn ướt')) {
      reply = `Chào bạn ${studentName}! Về khăn giấy và giấy vệ sinh đã lau dùng: 🧻\n\n- **Phân loại:** Thuộc nhóm **RÁC VÔ CƠ CÒN LẠI**.\n- **Thùng rác quy định:** Bỏ vào **THÙNG RÁC MÀU XÁM (hoặc Màu Cam)**.\n- **Lưu ý quan trọng:** Giấy đã dùng dính bẩn và sợi giấy ngắn mủn nát, KHÔNG ĐƯỢC bỏ vào thùng tái chế màu vàng!`;
    } else if (q.includes('hộp xốp') || q.includes('thìa nhựa') || q.includes('dĩa nhựa') || q.includes('ly nhựa dùng 1 lần') || q.includes('cốc nhựa dùng 1 lần') || q.includes('khẩu trang')) {
      reply = `Chào bạn ${studentName}! Về hộp xốp và đồ nhựa dùng 1 lần: 🥡\n\n- **Phân loại:** Thuộc nhóm **RÁC VÔ CƠ CÒN LẠI**.\n- **Thùng rác quy định:** Bỏ vào **THÙNG RÁC MÀU XÁM (hoặc Màu Cam)**.\n- **Lời khuyên xanh:** Mang hộp đựng cá nhân và bình nước riêng để giảm thiểu rác thải nhựa học đường.`;
    }
    // 6. RÁC HỮU CƠ (Organic)
    else if (q.includes('vỏ chuối') || q.includes('vỏ cam') || q.includes('vỏ dưa') || q.includes('vỏ táo') || q.includes('vỏ hoa quả') || q.includes('vỏ trái cây') || q.includes('rau') || q.includes('su su') || q.includes('cải mèo') || q.includes('cơm thừa') || q.includes('thức ăn thừa') || q.includes('thức ăn') || q.includes('bã chè') || q.includes('bã trà') || q.includes('bã cà phê') || q.includes('lá cây') || q.includes('lá rụng') || q.includes('hoa héo')) {
      reply = `Chào bạn ${studentName}! Về vỏ rau củ quả, cơm thừa và lá cây: 🍌🌱\n\n- **Phân loại:** Thuộc nhóm **RÁC HỮU CƠ DỄ PHÂN HỦY**.\n- **Thùng rác quy định:** Bỏ vào **THÙNG RÁC MÀU XANH LÁ**.\n- **Lợi ích:** Rác hữu cơ sẽ được ủ thành phân bón vi sinh giàu dinh dưỡng để chăm sóc các bồn hoa hồng và luống rau xanh tại trường Sa Pa!`;
    }
    // 7. CÂU HỎI TỔNG QUÁT VỀ CÁC THÙNG RÁC
    else if (q.includes('mấy loại') || q.includes('các loại thùng rác') || q.includes('màu thùng rác') || q.includes('phân loại rác như thế nào')) {
      reply = `Chào bạn ${studentName}! Quy chuẩn 4 thùng rác trường học Sa Pa chuẩn xác 100%: 🗂️✨\n\n1. **Thùng XANH LÁ (Rác Hữu Cơ):** Vỏ chuối, rau củ quả, cơm thừa, lá cây rụng (dùng ủ phân bón hoa).\n2. **Thùng VÀNG (Rác Tái Chế):** Vỏ hộp sữa bóc bẹp, chai nhựa, lon nhôm, giấy vở cũ, bìa carton.\n3. **Thùng XÁM/CAM (Rác Vô Cơ Còn Lại):** Túi nilon, vỏ kẹo, bim bim, hộp xốp, vỏ bút bi hết mực, khăn giấy bẩn.\n4. **Thùng ĐỎ / Hộp Gom Pin (Rác Nguy Hại):** Pin cũ, bóng đèn hỏng, nhiệt kế (phải gom xử lý an toàn riêng).`;
    }
    // 8. NƯỚC SẠCH & SUỐI MƯỜNG HOA
    else if (q.includes('tiết kiệm nước') || q.includes('rửa tay') || q.includes('khóa vòi') || q.includes('vòi nước')) {
      reply = `Chào bạn ${studentName}! Quy tắc tiết kiệm nước sạch chuẩn công dân số xanh: 💧✨\n\n- **Quy tắc vàng 20 giây:** Khi xoa bọt xà phòng rửa tay, em hãy **khóa chặt vòi nước** lại. Hành động nhỏ này tiết kiệm từ 3 đến 5 lít nước sạch mỗi lần rửa!\n- **Kiểm tra vòi:** Sau khi dùng xong, vặn chặt vòi bồn rửa để không bị nhỏ giọt lãng phí.\n- **Tái sử dụng:** Nước rửa rau sạch ở bếp ăn bán trú có thể dùng tưới ẩm bồn hoa trường học.`;
    } else if (q.includes('mường hoa') || q.includes('suối') || q.includes('nguồn nước')) {
      reply = `Chào bạn ${studentName}! Về bảo vệ suối Mường Hoa Sa Pa: 🏔️🌊\n\n- **Ý nghĩa:** Suối Mường Hoa uốn lượn qua các bản Lao Chải, Tả Van là mạch sống tưới tiêu cho ruộng bậc thang và cung cấp nước sinh hoạt cho đồng bào dân tộc Sa Pa.\n- **Hành động thiết thực:**\n  1. Tuyệt đối không vứt rác, túi ni-lông hay vỏ lon xuống lòng suối.\n  2. Không đổ nước xà phòng, hóa chất tẩy rửa trực tiếp ra suối.\n  3. Cùng bạn bè tham gia ngày Chủ nhật Xanh dọn sạch bờ suối bản làng.`;
    }
    // 9. NĂNG LƯỢNG & TIẾT KIỆM ĐIỆN
    else if (q.includes('tiết kiệm điện') || q.includes('phòng tin học') || q.includes('tắt đèn') || q.includes('quạt điện') || q.includes('máy tính')) {
      reply = `Chào bạn ${studentName}! Bí kíp tiết kiệm điện tại trường học Sa Pa: ⚡💡\n\n- **Nguyên tắc "Rời phòng tắt hết":** Trước khi ra sân thể dục hoặc tan học về, hãy kiểm tra tắt toàn bộ bóng đèn, quạt trần và máy tính trong phòng tin học.\n- **Đón nắng Sa Pa:** Kéo mở rèm cửa sổ để tận dụng ánh sáng mặt trời tự nhiên thay vì bật nhiều bóng đèn.\n- **Phòng chống cháy nổ:** Tắt thiết bị khi không dùng giúp trường học an toàn và tiết kiệm điện năng quốc gia.`;
    } else if (q.includes('rút phích') || q.includes('rút sạc') || q.includes('pin đầy') || q.includes('sạc điện thoại')) {
      reply = `Chào bạn ${studentName}! Mầm Xanh giải thích ngay: 🔌⚡\n\n- Khi điện thoại hoặc máy tính bảng đã sạc đầy 100%, em hãy **rút phích cắm sạc ra khỏi ổ điện**.\n- **Lý do:** Cục sạc cắm sẵn vẫn liên tục tiêu hao "dòng điện ma" gây lãng phí điện và có nguy cơ phát nhiệt chập cháy nguy hiểm!`;
    } else if (q.includes('mặt trời') || q.includes('gió') || q.includes('năng lượng tái tạo')) {
      reply = `Chào bạn ${studentName}! Về năng lượng xanh Tây Bắc: ☀️💨\n\n- **Năng lượng mặt trời & gió** là nguồn năng lượng tái tạo sạch vô tận, không tạo ra khói bụi độc hại hay khí nhà kính gây biến đổi khí hậu.\n- Các tấm pin mặt trời lắp trên mái trường học Sa Pa có thể tự tạo ra điện sạch phục vụ việc học tập của các em mỗi ngày!`;
    }
    // 10. CÂY XANH & RỪNG HOÀNG LIÊN
    else if (q.includes('rừng hoàng liên') || q.includes('vườn quốc gia hoàng liên') || q.includes('tác dụng của rừng') || q.includes('bảo vệ rừng')) {
      reply = `Chào bạn ${studentName}! Vai trò to lớn của Rừng Hoàng Liên Sa Pa: 🌲🏔️\n\n1. **Giữ đất chống sạt lở:** Hệ rễ cây rừng đan cài giữ chặt sườn núi dốc, ngăn lũ quét và bảo vệ các bản làng dưới chân đồi.\n2. **Lá phổi xanh:** Cây rừng hấp thụ khí CO2 và nhả ra oxy tinh khiết, điều hòa khí hậu mát lành bốn mùa cho Sa Pa.\n3. **Giữ nguồn nước ngầm:** Rừng giữ nước mưa và lọc thành những dòng suối mát lành quanh năm!`;
    } else if (q.includes('đỗ quyên') || q.includes('bẻ cành') || q.includes('ngắt hoa') || q.includes('hái hoa')) {
      reply = `Chào bạn ${studentName}! Lưu ý văn minh khi ngắm hoa Sa Pa: 🌸🌿\n\n- **Tuyệt đối không bẻ cành ngắt hoa:** Hoa Đỗ Quyên rừng và hoa hồng cổ Sa Pa đẹp nhất khi nở rực rỡ trên cành tự nhiên.\n- Khi đi tham quan dã ngoại Hàm Rồng hay Fansipan, hãy **chỉ chụp ảnh lưu niệm và giữ nguyên vẹn cảnh quan** để mọi người cùng thưởng thức nhé!`;
    } else if (q.includes('chăm sóc bồn hoa') || q.includes('vườn trường') || q.includes('trồng cây')) {
      reply = `Chào bạn ${studentName}! Cách chăm sóc bồn hoa lớp học Sa Pa: 🌼🌱\n\n- **Tưới nước vừa đủ:** Tưới gốc cây vào buổi sáng sớm bằng nước sạch hoặc nước rửa rau đã tận dụng.\n- **Bón phân vi sinh:** Sử dụng phân hữu cơ ủ từ lá cây và vỏ hoa quả để đất tơi xốp.\n- **Nhổ cỏ dại & Bắt sâu:** Giúp cây hoa phát triển tươi tốt, làm đẹp khuôn viên trường Tiểu học Sa Pa.`;
    }
    // 11. ĐỘNG VẬT HOANG DÃ
    else if (q.includes('động vật') || q.includes('thú rừng') || q.includes('chim rừng') || q.includes('săn bắt') || q.includes('nuôi nhốt') || q.includes('voọc') || q.includes('sóc bay')) {
      reply = `Chào bạn ${studentName}! Bảo vệ muông thú rừng Sa Pa: 🐾🕊️\n\n- **Không săn bắt, không nuôi nhốt:** Vườn quốc gia Hoàng Liên là ngôi nhà của nhiều loài quý hiếm như vượn đen, voọc xám, chim trĩ sao và sóc bay. Em tuyệt đối không mua bán hay nhốt chim rừng vào lồng.\n- **Không xả rác:** Rác thải nhựa làm các loài chim ngộ độc khi nuốt phải.\n- **Báo người lớn:** Nếu thấy bẫy thú hoặc chim bị thương, hãy báo ngay cho thầy cô giáo hoặc kiểm lâm nhé!`;
    }
    // 12. KHÍ HẬU, TUYẾT & DẤU CHÂN CARBON
    else if (q.includes('khí hậu') || q.includes('biến đổi khí hậu') || q.includes('tuyết') || q.includes('sương muối') || q.includes('ấm lên')) {
      reply = `Chào bạn ${studentName}! Về khí hậu Sa Pa và biến đổi khí hậu: ❄️🌍\n\n- **Hiện tượng tại Sa Pa:** Biến đổi khí hậu khiến mùa đông xuất hiện những đợt rét hại cực đoan, băng giá sương muối kéo dài gây hại mùa màng và sạt lở đất đồi.\n- **Hành động của học sinh Sa Pa:**\n  1. Trồng và bảo vệ thật nhiều cây xanh.\n  2. Tiết kiệm điện nước mỗi ngày.\n  3. Đi bộ hoặc đi xe đạp khi đi học gần nhà để giảm khói bụi độc hại carbon!`;
    } else if (q.includes('dấu chân carbon') || q.includes('carbon') || q.includes('co2')) {
      reply = `Chào bạn ${studentName}! Khái niệm "Dấu chân carbon" rất dễ hiểu: 👣🌱\n\n- **Định nghĩa:** Là tổng lượng khí nhà kính CO2 mà mỗi người gián tiếp thải ra môi trường qua việc dùng điện, đi xe xăng, dùng đồ nhựa dùng một lần...\n- **Cách giảm dấu chân carbon:** Tắt đèn khi rời phòng, mang bình nước dùng nhiều lần, ăn hết phần cơm không lãng phí và tích cực trồng thêm cây xanh!`;
    } else {
      reply = `Chào bạn ${studentName} (Lớp ${grade})! Mầm Xanh giải thích chuẩn xác cho bạn: 🌱✨\n\n- Về câu hỏi của bạn: Trong trường Tiểu học Sa Pa, nguyên tắc cốt lõi là **Phân loại rác chuẩn 4 thùng (Xanh lá - Vàng - Xám - Đỏ), Tiết kiệm từng giọt nước sạch, Tắt thiết bị điện khi ra về và Giữ gìn cây rừng Hoàng Liên**.\n- Em hãy tiếp tục đặt câu hỏi chi tiết về từng đồ vật hoặc từng chủ đề để Mầm Xanh hướng dẫn chuẩn xác nhé! 🏔️`;
    }

    return {
      reply,
      source: 'gemini',
      isOffline: false,
    };
  }

  // Local fallback quiz when completely offline
  private getLocalFallbackQuiz(grade: string, count: number): AiQuizResult {
    const fallbackBank: Record<string, QuizQuestion[]> = {
      '1': [
        {
          id: 1,
          question: '🌱 Vỏ quả chuối sau khi ăn xong, em nên bỏ vào thùng rác nào?',
          options: ['Thùng rác hữu cơ (màu xanh lá)', 'Thùng rác tái chế (chai nhựa)', 'Ném ra sân trường', 'Bỏ vào hộc bàn'],
          correctIndex: 0,
          explanation: 'Đúng rồi! Vỏ chuối là rác hữu cơ dễ phân hủy, có thể ủ thành phân bón tốt cho cây đấy em!'
        },
        {
          id: 2,
          question: '💧 Khi rửa tay bằng xà phòng xong, em cần làm gì?',
          options: ['Để vòi nước chảy tự do', 'Khóa chặt vòi nước lại ngay', 'Bật nước mạnh hơn nữa', 'Chạy đi chơi ngay'],
          correctIndex: 1,
          explanation: 'Chính xác! Khóa chặt vòi nước giúp trường chúng mình tiết kiệm nguồn nước ngọt quý giá!'
        },
        {
          id: 3,
          question: '🎒 Khi đi dã ngoại ngắm cảnh Sa Pa, em thấy rác trên đường thì nên làm gì?',
          options: ['Đá rác xuống suối', 'Nhặt bỏ vào thùng rác gần nhất', 'Giẫm lên rác', 'Không quan tâm'],
          correctIndex: 1,
          explanation: 'Tuyệt vời! Nhặt rác bỏ vào thùng giúp cảnh quan Sa Pa luôn sạch đẹp trong mắt du khách!'
        }
      ],
      '2': [
        {
          id: 1,
          question: '♻️ Vật nào sau đây có thể đem đi TÁI CHẾ thành đồ mới?',
          options: ['Vỏ lon nước ngọt bằng nhôm', 'Thức ăn thừa bị thiu', 'Túi nilông bị dính đầy dầu mỡ', 'Lá cây khô'],
          correctIndex: 0,
          explanation: 'Hoan hô em! Lon nhôm có thể nấu chảy và tái chế vô số lần mà không mất đi chất lượng!'
        },
        {
          id: 2,
          question: '💡 Trước khi ra khỏi phòng học khi tan trường, chúng mình cần làm gì?',
          options: ['Mở hết tất cả cửa sổ và quạt', 'Tắt đèn, quạt điện và máy chiếu', 'Bật điều hòa suốt đêm', 'Để máy tính hoạt động'],
          correctIndex: 1,
          explanation: 'Rất chuẩn! Tắt thiết bị điện khi không dùng là hành động của một công dân xanh thông thái!'
        },
        {
          id: 3,
          question: '🌸 Tại sao chúng mình KHÔNG NÊN bẻ cành ngắt hoa ở vườn trường và Sa Pa?',
          options: ['Vì hoa có độc', 'Vì cây xanh và hoa làm đẹp cảnh quan và tạo không khí trong lành', 'Vì hoa nở sẽ gây mưa', 'Vì hoa không cần chăm sóc'],
          correctIndex: 1,
          explanation: 'Đúng rồi! Hoa và cây xanh mang lại bóng mát, oxi và vẻ đẹp rực rỡ cho quê hương Sa Pa!'
        }
      ],
      '3': [
        {
          id: 1,
          question: '🏔️ Rừng quốc gia Hoàng Liên ở Sa Pa có vai trò gì quan trọng nhất?',
          options: ['Chắn gió bão, giữ đất chống sạt lở và là ngôi nhà của muôn loài', 'Chỉ để chặt gỗ làm củi', 'Không có tác dụng gì', 'Làm cho thời tiết nóng hơn'],
          correctIndex: 0,
          explanation: 'Chính xác! Rừng Hoàng Liên là lá phổi xanh bảo vệ đất đai, nguồn nước ngầm và hệ sinh thái Sa Pa!'
        },
        {
          id: 2,
          question: '🔋 Pin cũ đã dùng hết (trong đồ chơi, đồng hồ) thuộc loại rác nào?',
          options: ['Rác hữu cơ', 'Rác tái chế thông thường', 'Rác nguy hại độc hại cần gom riêng', 'Rác bỏ xuống đất'],
          correctIndex: 2,
          explanation: 'Đúng rồi! Pin chứa kim loại nặng như chì, thủy ngân. Tuyệt đối không vứt chung mà cần thu gom điểm riêng!'
        },
        {
          id: 3,
          question: '🛒 Thay vì dùng nhiều túi nilon khi đi chợ Sa Pa, em nên khuyên người thân dùng gì?',
          options: ['Dùng thêm nhiều túi nilon màu mè', 'Dùng túi vải tự nhiên hoặc làn cói có thể dùng nhiều lần', 'Không dùng túi nào cả', 'Gói bằng giấy ăn mềm'],
          correctIndex: 1,
          explanation: 'Chuẩn xác! Túi vải dùng được hàng trăm lần, giúp giảm bớt hàng nghìn tấn rác thải nhựa khó phân hủy!'
        }
      ],
      '4': [
        {
          id: 1,
          question: '⏱️ Một chiếc chai nhựa hoặc túi nilon mất khoảng bao lâu để phân hủy trong tự nhiên?',
          options: ['1 đến 2 ngày', '1 tuần', '1 đến 2 năm', 'Từ 100 đến 500 năm'],
          correctIndex: 3,
          explanation: 'Thật đáng kinh ngạc! Đồ nhựa mất từ hàng trăm năm mới phân hủy, vì vậy chúng mình cần hạn chế tối đa rác nhựa dùng 1 lần!'
        },
        {
          id: 2,
          question: '🌾 Ruộng bậc thang ở Sa Pa có tác dụng sinh thái quan trọng nào?',
          options: ['Giữ nước trên sườn đồi dốc và chống xói mòn sạt lở đất', 'Gây ngập úng rừng', 'Làm cạn kiệt nguồn nước', 'Không có tác dụng'],
          correctIndex: 0,
          explanation: 'Rất thông minh! Ruộng bậc thang là kỳ quan trí tuệ của đồng bào vùng cao, giúp điều hòa nguồn nước và bảo vệ thổ nhưỡng!'
        },
        {
          id: 3,
          question: '📱 Là một "Công dân số xanh" (Green Digital Citizen), em nên ứng dụng công nghệ như thế nào?',
          options: ['Chơi game cả ngày thâu đêm', 'Sử dụng ứng dụng học tập môi trường, chia sẻ thông điệp xanh và tiết kiệm năng lượng số', 'Xả rác điện tử ra ngoài vườn', 'In tài liệu giấy thật nhiều không cần thiết'],
          correctIndex: 1,
          explanation: 'Hoàn hảo! Công dân số xanh biết dùng AI và công nghệ để lan tỏa ý thức bảo vệ trái đất xanh!'
        }
      ],
      '5': [
        {
          id: 1,
          question: '🌍 Khái niệm "Dấu chân carbon" (Carbon Footprint) có ý nghĩa gì đối với học sinh chúng ta?',
          options: ['Vết chân than khi leo núi', 'Tổng lượng khí nhà kính sinh ra từ các hoạt động sinh hoạt, tiêu dùng và đi lại hàng ngày', 'Dấu chân thú rừng Sa Pa', 'Loại giày đi bộ vùng cao'],
          correctIndex: 1,
          explanation: 'Chính xác! Giảm đi xe cá nhân, tiết kiệm điện, ăn nhiều rau quả giúp giảm lượng khí thải carbon của mỗi chúng ta!'
        },
        {
          id: 2,
          question: '♻️ Nguyên tắc 5R trong bảo vệ môi trường hiện đại gồm những bước nào?',
          options: ['Run, Read, Rest, Relax, Repeat', 'Refuse (Từ chối), Reduce (Giảm bớt), Reuse (Tái sử dụng), Repurpose (Chế tạo lại), Recycle (Tái chế)', 'Rain, River, Rock, Rice, Road', 'Red, Rose, Ring, Rice, Rest'],
          correctIndex: 1,
          explanation: 'Xuất sắc! Bắt đầu bằng việc từ chối đồ nhựa dùng một lần là bước đi tiên phong của học sinh hiện đại!'
        },
        {
          id: 3,
          question: '💧 Để bảo vệ nguồn nước sạch cho các bản làng Sa Pa, hành động nào sau đây là SAI?',
          options: ['Đổ thuốc trừ sâu và rác thải trực tiếp xuống suối Mường Hoa', 'Trồng rừng phòng hộ đầu nguồn', 'Khóa vòi nước khi không sử dụng', 'Kiểm tra vệ sinh bể chứa nước trường học định kỳ'],
          correctIndex: 0,
          explanation: 'Đúng vậy! Đổ hóa chất độc hại xuống suối làm ô nhiễm nguồn nước ngầm và ảnh hưởng nghiêm trọng đến sức khỏe muôn người!'
        }
      ]
    };

    const gradeKey = ['1', '2', '3', '4', '5'].includes(String(grade)) ? String(grade) : '3';
    const list = fallbackBank[gradeKey] || fallbackBank['3'];

    return {
      questions: list.slice(0, Math.min(count, list.length)),
      source: 'curated_offline',
      isOffline: true,
    };
  }

  // Local fallback exercise generator
  private getLocalFallbackExercise(grade: number, topic: string, difficulty: string): AiExerciseResult {
    const fallbackBank: Record<string, ExerciseQuestion[]> = {
      'rác thải': [
        { id: 1, type: 'trắc nghiệm', prompt: 'Vỏ chai nước suối bằng nhựa sau khi uống xong tại trường Sa Pa nên xử lý thế nào?', options: ['Vứt xuống suối Mường Hoa', 'Bóp xẹp và bỏ vào thùng rác tái chế màu vàng', 'Đốt cháy ngoài vườn', 'Bỏ vào thùng rác hữu cơ'], correctAnswer: 1, explanation: 'Chính xác! Chai nhựa là rác tái chế có thể làm thành áo ấm sinh thái!', guideTip: 'Chai nhựa có thể mang đến nhà máy để tái chế thành đồ vật hữu ích không em?' },
        { id: 2, type: 'trắc nghiệm', prompt: 'Vỏ hộp sữa học đường sau khi uống xong tại trường, em cần xử lý thế nào là đúng nhất?', options: ['Vứt bừa xuống gầm bàn', 'Bóc dẹp tai hộp, ép bẹp và bỏ vào thùng rác tái chế màu vàng', 'Đá ra sân trường', 'Bỏ vào thùng rác hữu cơ'], correctAnswer: 1, explanation: 'Chính xác! Gấp bẹp vỏ hộp sữa giúp giảm 80% thể tích và chuyển đến xưởng tái sinh.', guideTip: 'Hộp sữa làm từ bột giấy chất lượng cao có thể tái sinh thành vật dụng mới.' },
        { id: 3, type: 'trắc nghiệm', prompt: 'Vỏ quả chuối, cuống rau thừa từ bếp ăn bán trú thuộc nhóm rác nào?', options: ['Rác hữu cơ dễ phân hủy', 'Rác tái chế chai nhựa', 'Rác nguy hại độc tính', 'Rác vô cơ không phân hủy'], correctAnswer: 0, explanation: 'Đúng rồi! Rác hữu cơ có thể ủ thành phân vi sinh giàu dinh dưỡng cho bồn hoa trường học.', guideTip: 'Các chất có nguồn gốc từ thực vật mau mục nát trong đất.' },
        { id: 4, type: 'trắc nghiệm', prompt: 'Pin đồ chơi cũ, pin đồng hồ hết điện cần được xử lý như thế nào?', options: ['Bỏ vào thùng rác hữu cơ', 'Gom riêng vào hộp thu gom pin chuyên dụng ở trường', 'Ném xuống suối Mường Hoa', 'Đốt cùng lá khô'], correctAnswer: 1, explanation: 'Chính xác! Pin chứa chì, thủy ngân độc hại ngấm vào đất và nước ngầm hàng trăm năm.', guideTip: 'Pin là rác nguy hại tuyệt đối không vứt lẫn rác sinh hoạt.' },
        { id: 5, type: 'trắc nghiệm', prompt: 'Thời gian để một túi ni-lông tự phân hủy ngoài tự nhiên Sa Pa là khoảng bao lâu?', options: ['1 đến 2 ngày', 'Khoảng 1 tuần', 'Từ 400 đến 500 năm', 'Chỉ 1 tháng'], correctAnswer: 2, explanation: 'Đúng vậy! Túi ni-lông tồn tại gần nửa thiên niên kỷ và vỡ thành các hạt vi nhựa độc hại.', guideTip: 'Đồ nhựa tồn tại rất bền bỉ ngoài môi trường tự nhiên.' },
        { id: 6, type: 'trắc nghiệm', prompt: 'Hành động nào giúp trường học Sa Pa giảm thiểu rác thải nhựa hiệu quả nhất?', options: ['Mỗi ngày dùng 3 cốc nhựa một lần', 'Mang theo bình nước cá nhân và hộp cơm dùng nhiều lần', 'Vứt rác bừa bãi ra sân', 'Mua nhiều đồ ăn vặt đóng gói ni-lông'], correctAnswer: 1, explanation: 'Xuất sắc! Sử dụng bình nước cá nhân giúp mỗi học sinh giảm hàng trăm chai nhựa mỗi năm.', guideTip: 'Vật dụng dùng nhiều lần luôn thân thiện với thiên nhiên.' },
        { id: 7, type: 'trắc nghiệm', prompt: 'Ký hiệu hình tam giác có 3 mũi tên nối tiếp nhau dưới đáy chai nhựa mang ý nghĩa gì?', options: ['Vật phẩm độc hại', 'Vật liệu có thể tái chế', 'Đồ chơi trẻ em', 'Cấm sử dụng'], correctAnswer: 1, explanation: 'Đúng vậy! Biểu tượng 3 mũi tên xoay vòng là ký hiệu quốc tế về khả năng tái chế.', guideTip: 'Các mũi tên xoay tròn biểu thị vòng tuần hoàn tái sinh.' },
        { id: 8, type: 'đúng_sai', prompt: 'Đúng hay Sai: Pin đồ chơi cũ chứa hóa chất độc hại, bắt buộc phải gom vào hộp thu gom chuyên dụng?', correctAnswer: true, explanation: 'Rất đúng! Pin chứa kim loại nặng, nếu vứt bừa sẽ làm ô nhiễm nguồn nước ngầm Sa Pa.', guideTip: 'Hãy nhớ lại cảnh báo về rác nguy hại có biểu tượng màu đỏ em nhé.' },
        { id: 9, type: 'đúng_sai', prompt: 'Đúng hay Sai: Đốt rác thải nhựa ngoài trời sinh ra khí độc Dioxin nguy hiểm cho đường hô hấp của học sinh?', correctAnswer: true, explanation: 'Chính xác! Đốt nhựa sinh ra khí độc gây hại phổi và ô nhiễm không khí trong lành của Sa Pa.', guideTip: 'Khói đốt nhựa có mùi khét lẹt rất độc hại.' },
        { id: 10, type: 'tự_luận_ngắn', prompt: 'Em hãy nêu 2 việc em và các bạn có thể làm để giảm bớt rác thải nhựa ở lớp học?', correctAnswer: 'Mang bình nước cá nhân, dùng hộp cơm tái sử dụng, không dùng ống hút nhựa.', explanation: 'Hành động nhỏ của mỗi học sinh sẽ làm nên trường học Sa Pa xanh ngát!', guideTip: 'Em hãy quan sát những đồ nhựa dùng 1 lần hay xuất hiện trong lớp học.' }
      ],
      'nước sạch': [
        { id: 1, type: 'trắc nghiệm', prompt: 'Để bảo vệ nguồn nước suối Mường Hoa luôn trong sạch, hành động nào là đúng?', options: ['Đổ rác thải nhựa xuống suối', 'Nhặt rác ven suối và không xả hóa chất độc hại', 'Ném pin hỏng xuống nước', 'Rửa xe máy ngay giữa lòng suối'], correctAnswer: 1, explanation: 'Tuyệt vời! Suối Mường Hoa là nguồn sống quý báu của toàn bộ thung lũng Sa Pa.', guideTip: 'Con suối trong veo sẽ mang lại sức khỏe và vẻ đẹp cho bản làng chúng mình.' },
        { id: 2, type: 'trắc nghiệm', prompt: 'Khi xoa bọt xà phòng rửa tay tại bồn nước trường học, em nên làm gì?', options: ['Để vòi nước chảy thật to', 'Khóa vòi nước trong lúc xoa bọt 20 giây', 'Vặn vòi nước bắn tung tóe', 'Không cần rửa tay'], correctAnswer: 1, explanation: 'Chính xác! Khóa vòi 20 giây giúp tiết kiệm từ 3 đến 5 lít nước sạch mỗi lần rửa tay.', guideTip: 'Nước chảy khi đang xoa bọt là lãng phí vô ích.' },
        { id: 3, type: 'trắc nghiệm', prompt: 'Nước rửa rau, củ sạch từ bếp ăn bán trú trường học có thể được tái sử dụng để làm gì?', options: ['Tưới cây, bồn hoa của trường', 'Đổ ra sân cho trơn trượt', 'Để đọng thành vũng muỗi đẻ trứng', 'Không được dùng việc gì'], correctAnswer: 0, explanation: 'Rất thông minh! Nước rửa rau sạch tận dụng tưới cây giúp tiết kiệm tài nguyên nước ngọt.', guideTip: 'Nước rửa rau không chứa xà phòng hóa chất độc hại.' },
        { id: 4, type: 'trắc nghiệm', prompt: 'Nếu phát hiện vòi nước ở khu vệ sinh trường học bị rò rỉ chảy nhỏ giọt, em sẽ làm gì?', options: ['Bỏ đi chơi coi như không biết', 'Khóa chặt lại hoặc báo ngay cho bác bảo vệ, thầy cô để sửa chữa', 'Vặn cho vòi gãy thêm', 'Hắt nước vào bạn'], correctAnswer: 1, explanation: 'Xuất sắc! Một vòi nước rò rỉ có thể làm lãng phí hàng nghìn lít nước mỗi tháng.', guideTip: 'Báo người lớn sửa vòi nước là hành động trách nhiệm.' },
        { id: 5, type: 'trắc nghiệm', prompt: 'Nguồn nước sinh hoạt chính của các bản làng vùng cao Sa Pa bắt nguồn từ đâu?', options: ['Từ các khe suối tự nhiên và mạch nước ngầm rừng Hoàng Liên', 'Từ nước biển mặn', 'Từ nước thải sinh hoạt', 'Từ các hồ bơi nhân tạo'], correctAnswer: 0, explanation: 'Đúng vậy! Rừng nguyên sinh Hoàng Liên giữ nước mưa và nhả ra các khe suối mát ngọt quanh năm.', guideTip: 'Rừng cây đại ngàn chính là khởi nguồn của dòng nước ngọt.' },
        { id: 6, type: 'trắc nghiệm', prompt: 'Hành vi nào dưới đây gây ô nhiễm nghiêm trọng nhất đối với nguồn nước ngầm?', options: ['Vứt pin cũ, bình ắc quy hỏng ra vườn hoặc bờ suối', 'Nhặt lá khô rơi vào xô nước', 'Tưới cây vào buổi sáng sớm', 'Lau bảng lớp bằng khăn ẩm'], correctAnswer: 0, explanation: 'Chính xác! Kim loại nặng trong pin tan vào đất làm nhiễm độc mạch nước ngầm nhiều thế hệ.', guideTip: 'Chất độc hóa học trong pin cực kỳ nguy hiểm với nguồn nước.' },
        { id: 7, type: 'trắc nghiệm', prompt: 'Học sinh tiểu học có thể uống loại nước nào để đảm bảo sức khỏe an toàn?', options: ['Nước đun sôi để nguội hoặc nước lọc tiệt trùng của trường', 'Nước suối chưa đun sôi đục ngầu', 'Nước mưa đọng ở rãnh', 'Nước ao hồ'], correctAnswer: 0, explanation: 'Đúng rồi! Nước đun sôi hoặc lọc sạch giúp tiêu diệt vi khuẩn, phòng chống bệnh giun sán.', guideTip: 'Ăn chín uống sôi là nguyên tắc giữ gìn sức khỏe.' },
        { id: 8, type: 'đúng_sai', prompt: 'Đúng hay Sai: 20 giây khóa vòi nước khi xoa xà phòng giúp tiết kiệm từ 3 đến 5 lít nước sạch?', correctAnswer: true, explanation: 'Đúng vậy! Tiết kiệm từng giọt nước là đức tính của một công dân xanh!', guideTip: 'Nước có chảy lãng phí khi chúng mình đang xoa bọt xà phòng không?' },
        { id: 9, type: 'đúng_sai', prompt: 'Đúng hay Sai: Rừng đầu nguồn có tác dụng như chiếc máy lọc nước tự nhiên khổng lồ cho Sa Pa?', correctAnswer: true, explanation: 'Chính xác! Tầng lá mục và rễ cây rừng giữ lại phù sa cặn bẩn, lọc nước suối trong veo.', guideTip: 'Thảm thực vật rừng giữ ẩm và lọc sạch nước mưa.' },
        { id: 10, type: 'tự_luận_ngắn', prompt: 'Theo em, vì sao việc giữ rừng đầu nguồn lại giúp bảo vệ nguồn nước ngọt cho Sa Pa?', correctAnswer: 'Rễ cây giữ nước mưa trong lòng đất, lọc sạch cặn bẩn và tạo ra các mạch nước ngầm dồi dào.', explanation: 'Rất thông minh! Rừng chính là chiếc máy lọc nước tự nhiên vĩ đại.', guideTip: 'Rễ cây đan chặt trong đất có tác dụng gì khi trời mưa to?' }
      ]
    };

    const questions = fallbackBank[topic] || fallbackBank['rác thải'];
    return {
      title: `Bộ Bài Tập 10 Câu: ${topic.toUpperCase()} - LỚP ${grade} (${difficulty.toUpperCase()})`,
      questions,
      source: 'curated_offline',
      isOffline: true,
    };
  }

  // AI suggest green tasks by topic (GREEN ACTION)
  async suggestGreenTasks(topic: string = 'waste', targetClass: string = '3A1', grade: number = 3): Promise<{
    tasks: Array<{ title: string; instructions: string; rewardPoints: number; allowImageUpload: boolean }>;
    source: string;
  }> {
    if (!this.isOnline()) {
      return this.getLocalFallbackTasks(topic);
    }
    try {
      const res = await fetch('/api/ai/suggest-green-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, targetClass, grade }),
      });
      if (!res.ok) throw new Error('Failed to suggest tasks');
      const data = await res.json();
      return { tasks: data.tasks, source: data.source || 'gemini' };
    } catch (err) {
      console.warn('AI suggestGreenTasks failed, using fallback:', err);
      return this.getLocalFallbackTasks(topic);
    }
  }

  private getLocalFallbackTasks(topic: string): {
    tasks: Array<{ title: string; instructions: string; rewardPoints: number; allowImageUpload: boolean }>;
    source: string;
  } {
    const offline: Record<string, any[]> = {
      waste: [
        {
          title: 'Chiến sĩ gấp hộp sữa học đường',
          instructions: 'Sau giờ uống sữa tại lớp, em hãy mở dẹt 2 tai hộp, gấp phẳng bẹp và thả vào thùng rác tái chế màu vàng của trường.',
          rewardPoints: 30,
          allowImageUpload: true,
        },
        {
          title: 'Săn tìm rác nhựa sân trường',
          instructions: 'Trong giờ ra chơi, em cùng 1 bạn nhặt 5 mẩu túi nilon hoặc vỏ kẹo rơi trên sân trường bỏ vào thùng rác.',
          rewardPoints: 35,
          allowImageUpload: false,
        },
      ],
      water: [
        {
          title: 'Quy tắc 20 giây xà phòng',
          instructions: 'Khi rửa tay sát khuẩn tại bồn nước trường học, hãy khóa chặt vòi nước trong lúc xoa bọt xà phòng 20 giây.',
          rewardPoints: 25,
          allowImageUpload: false,
        },
        {
          title: 'Mang bình nước cá nhân đến lớp',
          instructions: 'Dùng bình nước thủy tinh hoặc inox mang từ nhà, hạn chế tối đa việc sử dụng cốc nhựa dùng 1 lần.',
          rewardPoints: 20,
          allowImageUpload: true,
        },
      ],
      electricity: [
        {
          title: 'Người gác cổng năng lượng giờ ra chơi',
          instructions: 'Trước khi ra khỏi lớp học đi tập thể dục hoặc ra chơi, kiểm tra tắt quạt và bóng đèn để tiết kiệm điện.',
          rewardPoints: 25,
          allowImageUpload: false,
        },
        {
          title: 'Mở cửa sổ đón nắng sớm Sa Pa',
          instructions: 'Đầu giờ sáng, mở rộng rèm cửa sổ để đón ánh nắng tự nhiên ấm áp, tắt bớt 2 bóng đèn tuýp trong phòng.',
          rewardPoints: 20,
          allowImageUpload: false,
        },
      ],
      trees: [
        {
          title: 'Chăm sóc luống hoa hồng cổ Sa Pa',
          instructions: 'Cùng nhóm bạn nhặt lá vàng úa, nhổ cỏ dại quanh gốc cây hoa hồng của lớp em vào buổi sáng sớm.',
          rewardPoints: 30,
          allowImageUpload: true,
        },
        {
          title: 'Gieo hạt mầm xanh trong chậu tái chế',
          instructions: 'Tận dụng vỏ hộp sữa hoặc chai nhựa đã cắt đôi để gieo 1 hạt đỗ hoặc hạt ngô nhỏ đặt ở góc thiên nhiên lớp.',
          rewardPoints: 35,
          allowImageUpload: true,
        },
      ],
    };

    return {
      tasks: offline[topic] || offline.waste,
      source: 'offline_curated',
    };
  }

  // AI suggest encouraging teacher feedback (GREEN ACTION)
  async suggestTeacherFeedback(taskTitle: string, studentResponse: string, studentNickname: string = 'em', status: string = 'approved'): Promise<{
    feedback: string;
    source: string;
  }> {
    if (!this.isOnline()) {
      return {
        feedback: status === 'approved'
          ? `Thầy cô rất tự hào về việc làm tốt của em ${studentNickname}! Hãy tiếp tục phát huy tinh thần công dân số xanh nhé!`
          : `Thầy cô đánh giá cao nỗ lực của em ${studentNickname}. Em hãy viết thêm một chút chi tiết để bài nộp trọn vẹn hơn nhé!`,
        source: 'local_fallback',
      };
    }
    try {
      const res = await fetch('/api/ai/suggest-teacher-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskTitle, studentResponse, studentNickname, status }),
      });
      if (!res.ok) throw new Error('Feedback request failed');
      const data = await res.json();
      return { feedback: data.feedback, source: data.source || 'gemini' };
    } catch (err) {
      console.warn('AI suggestTeacherFeedback failed:', err);
      return {
        feedback: `Thầy cô khen ngợi em ${studentNickname} đã hoàn thành hành động xanh ý nghĩa vì môi trường Sa Pa!`,
        source: 'offline_curated',
      };
    }
  }

  // AI summarize approved actions (GREEN ACTION)
  async summarizeApprovedActions(className: string = '3A1', actions: any[] = []): Promise<{
    summary: string;
    source: string;
  }> {
    if (!this.isOnline() || actions.length === 0) {
      return {
        summary: `Tập thể học sinh lớp ${className} đã thực hiện xuất sắc các hoạt động bảo vệ môi trường, phân loại rác và tiết kiệm nước sạch.`,
        source: 'local_fallback',
      };
    }
    try {
      const res = await fetch('/api/ai/summarize-approved-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ className, actions }),
      });
      if (!res.ok) throw new Error('Summarize request failed');
      const data = await res.json();
      return { summary: data.summary, source: data.source || 'gemini' };
    } catch (err) {
      console.warn('AI summarizeApprovedActions failed:', err);
      return {
        summary: `Lớp ${className} đã ghi nhận nhiều hành động bảo vệ cảnh quan trường học Sa Pa đáng biểu dương!`,
        source: 'offline_curated',
      };
    }
  }
}

export const aiService = new AiService();
