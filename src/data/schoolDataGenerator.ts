import { GreenAction, GreenActionTopic, SchoolClass, StudentProfile, TeacherAccount } from '../types';
import { OFFICIAL_TEACHERS_LIST } from './teachersData';

// Danh sách chuẩn xác đúng 35 lớp từ 1A1 đến 5A7
export const ALL_35_CLASS_NAMES: string[] = [
  '1A1', '1A2', '1A3', '1A4', '1A5', '1A6', '1A7',
  '2A1', '2A2', '2A3', '2A4', '2A5', '2A6', '2A7',
  '3A1', '3A2', '3A3', '3A4', '3A5', '3A6', '3A7',
  '4A1', '4A2', '4A3', '4A4', '4A5', '4A6', '4A7',
  '5A1', '5A2', '5A3', '5A4', '5A5', '5A6', '5A7',
];

const ROOM_THEMES: Record<number, string> = {
  1: 'Dãy Hoa Ban Sa Pa',
  2: 'Dãy Mận Tả Van',
  3: 'Dãy Đỗ Quyên Hoàng Liên',
  4: 'Dãy Pơ Mu Xanh',
  5: 'Dãy Đỉnh Fansipan',
};

// Phân công tự động 35 giáo viên vào đúng 35 lớp học
export const CLASS_TEACHER_MAP: Record<string, { id: string; name: string; title: string }> = {
  '1A1': { id: 'gv-25', name: 'Đỗ Thuý Lan', title: 'Giáo viên Chủ nhiệm Lớp 1A1' },
  '1A2': { id: 'gv-02', name: 'Tống Phương Anh', title: 'Giáo viên Chủ nhiệm Lớp 1A2' },
  '1A3': { id: 'gv-03', name: 'Trần Thị Biển', title: 'Giáo viên Chủ nhiệm Lớp 1A3' },
  '1A4': { id: 'gv-04', name: 'Nguyễn Thanh Bình', title: 'Giáo viên Chủ nhiệm Lớp 1A4' },
  '1A5': { id: 'gv-05', name: 'Phạm Đình Canh', title: 'Giáo viên Chủ nhiệm Lớp 1A5' },
  '1A6': { id: 'gv-07', name: 'Chử Khoa Ngọc Diệp', title: 'Giáo viên Chủ nhiệm Lớp 1A6' },
  '1A7': { id: 'gv-08', name: 'Nguyễn Thị Chiều Duyên', title: 'Giáo viên Chủ nhiệm Lớp 1A7' },
  '2A1': { id: 'gv-10', name: 'Trương Thị Thu Hà', title: 'Giáo viên Chủ nhiệm Lớp 2A1' },
  '2A2': { id: 'gv-11', name: 'Đặng Thúy Hằng', title: 'Giáo viên Chủ nhiệm Lớp 2A2' },
  '2A3': { id: 'gv-12', name: 'Nguyễn Thị Hảo', title: 'Giáo viên Chủ nhiệm Lớp 2A3' },
  '2A4': { id: 'gv-14', name: 'Hà Thu Hiền', title: 'Giáo viên Chủ nhiệm Lớp 2A4' },
  '2A5': { id: 'gv-16', name: 'Mai Thị Huệ', title: 'Giáo viên Chủ nhiệm Lớp 2A5' },
  '2A6': { id: 'gv-20', name: 'Bùi Lan Hương', title: 'Giáo viên Chủ nhiệm Lớp 2A6' },
  '2A7': { id: 'gv-21', name: 'Phạm Thị Huyền', title: 'Giáo viên Chủ nhiệm Lớp 2A7' },
  '3A1': { id: 'user-teacher-kimhoa', name: 'Cô Hoàng Thị Kim Hoa', title: 'Giáo viên Chủ nhiệm Lớp 3A1 – Khối trưởng' },
  '3A2': { id: 'gv-22', name: 'Trần Thị Thu Huyền', title: 'Giáo viên Chủ nhiệm Lớp 3A2' },
  '3A3': { id: 'gv-23', name: 'Nguyễn Thị Minh Khuyên', title: 'Giáo viên Chủ nhiệm Lớp 3A3' },
  '3A4': { id: 'gv-24', name: 'Đỗ Thanh Kim', title: 'Giáo viên Chủ nhiệm Lớp 3A4' },
  '3A5': { id: 'gv-27', name: 'Nguyễn Thị Linh', title: 'Giáo viên Chủ nhiệm Lớp 3A5' },
  '3A6': { id: 'gv-28', name: 'Hà Thị Loan', title: 'Giáo viên Chủ nhiệm Lớp 3A6' },
  '3A7': { id: 'gv-29', name: 'Lê Hồng Loan', title: 'Giáo viên Chủ nhiệm Lớp 3A7' },
  '4A1': { id: 'gv-30', name: 'Nguyễn Thị Song Loan', title: 'Giáo viên Chủ nhiệm Lớp 4A1' },
  '4A2': { id: 'gv-31', name: 'Bùi Huy Long', title: 'Giáo viên Chủ nhiệm Lớp 4A2' },
  '4A3': { id: 'gv-33', name: 'Hoàng Thị Kim Lý', title: 'Giáo viên Chủ nhiệm Lớp 4A3' },
  '4A4': { id: 'gv-34', name: 'Đỗ Thị Hoa Mai', title: 'Giáo viên Chủ nhiệm Lớp 4A4' },
  '4A5': { id: 'gv-35', name: 'Đỗ Văn Nam', title: 'Giáo viên Chủ nhiệm Lớp 4A5' },
  '4A6': { id: 'gv-36', name: 'Phí Ngọc Nam', title: 'Giáo viên Chủ nhiệm Lớp 4A6' },
  '4A7': { id: 'gv-37', name: 'Trần Thị Thu Nga', title: 'Giáo viên Chủ nhiệm Lớp 4A7' },
  '5A1': { id: 'gv-38', name: 'Nguyễn Thị Kim Ngân', title: 'Giáo viên Chủ nhiệm Lớp 5A1' },
  '5A2': { id: 'gv-39', name: 'Đoàn Thị Ngoan', title: 'Giáo viên Chủ nhiệm Lớp 5A2' },
  '5A3': { id: 'gv-40', name: 'Nguyễn Thị Nguyệt', title: 'Giáo viên Chủ nhiệm Lớp 5A3' },
  '5A4': { id: 'gv-41', name: 'Trần Như Nguyệt', title: 'Giáo viên Chủ nhiệm Lớp 5A4' },
  '5A5': { id: 'gv-42', name: 'Ngô Thị Nhiên', title: 'Giáo viên Chủ nhiệm Lớp 5A5' },
  '5A6': { id: 'gv-43', name: 'Nguyễn Thị Hồng Nhung', title: 'Giáo viên Chủ nhiệm Lớp 5A6' },
  '5A7': { id: 'gv-59', name: 'Nguyễn Thị Hằng Yến', title: 'Giáo viên Chủ nhiệm Lớp 5A7' },
};

// Số lượng học sinh phân bổ chuẩn xác cho từng lớp trong 35 lớp:
// 14 lớp đầu (Khối 1 và Khối 2: 7 + 7 = 14 lớp) có 41 em/lớp = 574 em
// 21 lớp sau (Khối 3, 4, 5: 7 + 7 + 7 = 21 lớp) có 40 em/lớp = 840 em
// Tổng cộng đúng 1,414 học sinh toàn trường
export const CLASS_STUDENT_COUNTS: Record<string, number> = {
  '1A1': 41, '1A2': 41, '1A3': 41, '1A4': 41, '1A5': 41, '1A6': 41, '1A7': 41,
  '2A1': 41, '2A2': 41, '2A3': 41, '2A4': 41, '2A5': 41, '2A6': 41, '2A7': 41,
  '3A1': 40, '3A2': 40, '3A3': 40, '3A4': 40, '3A5': 40, '3A6': 40, '3A7': 40,
  '4A1': 40, '4A2': 40, '4A3': 40, '4A4': 40, '4A5': 40, '4A6': 40, '4A7': 40,
  '5A1': 40, '5A2': 40, '5A3': 40, '5A4': 40, '5A5': 40, '5A6': 40, '5A7': 40,
};

// Tạo chính xác 35 lớp học
export function generateOfficial35Classes(): SchoolClass[] {
  const list: SchoolClass[] = [];
  for (let grade = 1; grade <= 5; grade++) {
    for (let sec = 1; sec <= 7; sec++) {
      const name = `${grade}A${sec}`;
      const teacherInfo = CLASS_TEACHER_MAP[name] || {
        id: 'user-teacher-kimhoa',
        name: 'Cô Hoàng Thị Kim Hoa',
        title: 'Giáo viên Mặc Định',
      };
      const count = CLASS_STUDENT_COUNTS[name] || 40;
      list.push({
        id: `cls-${name.toLowerCase()}`,
        name,
        grade,
        headTeacherId: teacherInfo.id,
        headTeacherName: teacherInfo.name,
        room: `Phòng ${grade}0${sec} - ${ROOM_THEMES[grade]}`,
        schoolYear: '2025-2026',
        targetStudents: count,
        description: `Lớp ${name} - Trường TH Sa Pa (${teacherInfo.name} phụ trách, ${count} học sinh)`,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
      });
    }
  }
  return list;
}

// Danh sách họ và tên đệm đậm chất Sa Pa (H'Mông, Dao, Giáy, Tày, Kinh)
const SURNAMES = [
  'Vàng', 'Thào', 'Giàng', 'Chảo', 'Lò', 'Tản', 'Lý', 'Nông', 'Mùa', 'Đặng',
  'Hoàng', 'Bùi', 'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Đỗ', 'Vũ', 'Chu', 'Lương',
  'Triệu', 'Phùng', 'Đinh', 'Dương', 'Bàn'
];

const MID_BOY = ['A', 'Văn', 'Minh', 'Đức', 'Quốc', 'Gia', 'Bảo', 'Đình', 'Hữu', 'Tuấn'];
const MID_GIRL = ['Thị', 'Ngọc', 'Thùy', 'Kim', 'Thu', 'Lan', 'Hồng', 'Phương', 'Mai', 'Thảo'];

const FIRST_BOY = [
  'Páo', 'Lù', 'Dơ', 'Dũng', 'Khang', 'Nam', 'Bình', 'Kiệt', 'Phúc', 'Quân',
  'Huy', 'Sơn', 'Khoa', 'Hưng', 'Đạt', 'Dương', 'Giang', 'Tú', 'Việt', 'Cường',
  'Lâm', 'Long', 'Phong', 'Bách', 'Thắng', 'Hải', 'Nghĩa', 'Trọng', 'Duy', 'Toàn'
];

const FIRST_GIRL = [
  'Mỷ', 'Sử', 'Dung', 'Chi', 'Mai', 'Linh', 'Trang', 'An', 'Thảo', 'Trâm',
  'Yến', 'Nhi', 'Hương', 'Ngân', 'Hà', 'Vân', 'Anh', 'Quyên', 'Thương', 'Huyền',
  'Châu', 'Tâm', 'Bích', 'Diệp', 'Quỳnh', 'Ánh', 'Vy', 'Tiên', 'Ly', 'Oanh'
];

const AVATARS = ['🌱', '🐾', '🐿️', '🦊', '🦅', '🌸', '🐻', '🐝', '🍀', '🦋', '⭐', '🎈', '🦉', '🎋', '🌿', '🍄'];

const BADGE_COLLECTIONS = [
  ['Tân Binh Xanh', 'Công Dân Sa Pa'],
  ['Hiệp Sĩ Mầm Xanh', 'Ngôi Sao Phân Loại'],
  ['Bảo Vệ Rừng Sa Pa', 'Chiến Sĩ Nước Sạch'],
  ['Thợ Săn Rác Nhựa', 'Đại Sứ Môi Trường'],
  ['Tiết Kiệm Điện Siêu Đẳng', 'Búp Sen Xanh'],
];

// Tạo tự động 1,414 học sinh chia vào 35 lớp (14 lớp có 41 em, 21 lớp có 40 em = 1414 em)
export function generate1414Students(): StudentProfile[] {
  const students: StudentProfile[] = [];
  let studentCounter = 0;

  for (let cIdx = 0; cIdx < ALL_35_CLASS_NAMES.length; cIdx++) {
    const className = ALL_35_CLASS_NAMES[cIdx];
    const grade = parseInt(className.charAt(0), 10);
    // Phân bổ đúng chuẩn theo từng lớp: 14 lớp đầu có 41 học sinh, 21 lớp sau có 40 học sinh -> đúng 1,414 em
    const countInThisClass = CLASS_STUDENT_COUNTS[className] || (cIdx < 14 ? 41 : 40);

    for (let st = 1; st <= countInThisClass; st++) {
      studentCounter++;
      const isBoy = (studentCounter + st) % 2 === 0;
      const surname = SURNAMES[(studentCounter * 7 + st) % SURNAMES.length];
      const mid = isBoy
        ? MID_BOY[(studentCounter * 3 + st) % MID_BOY.length]
        : MID_GIRL[(studentCounter * 5 + st) % MID_GIRL.length];
      const first = isBoy
        ? FIRST_BOY[(studentCounter * 11 + st) % FIRST_BOY.length]
        : FIRST_GIRL[(studentCounter * 13 + st) % FIRST_GIRL.length];

      const fullName = `${surname} ${mid} ${first}`;
      const codeStr = String(st).padStart(2, '0');
      const studentId = `hs-${className.toLowerCase()}-${codeStr}`;
      const avatar = AVATARS[(studentCounter + st) % AVATARS.length];
      const badges = BADGE_COLLECTIONS[(studentCounter + cIdx) % BADGE_COLLECTIONS.length];
      const greenPoints = 120 + ((studentCounter * 17) % 350);

      students.push({
        id: studentId,
        nickname: fullName,
        realNamePreview: `${surname} ${mid.charAt(0)}. ${first}`,
        grade,
        className,
        avatar,
        greenPoints,
        badges,
        sortGamesPlayed: 2 + (studentCounter % 8),
        quizzesCompleted: 1 + (studentCounter % 5),
        actionsLogged: 1 + (studentCounter % 4),
        scansCompleted: 1 + (studentCounter % 6),
      });
    }
  }

  return students;
}

interface ActionTemplate {
  topic: GreenActionTopic;
  category: 'waste_sorting' | 'water_saving' | 'energy_saving' | 'tree_planting' | 'cleanup';
  categoryLabel: string;
  topicLabel: string;
  titles: string[];
  descriptions: string[];
  feedbacks: string[];
  icon: string;
}

const ACTION_TEMPLATES: ActionTemplate[] = [
  {
    topic: 'waste',
    category: 'waste_sorting',
    categoryLabel: 'Phân loại rác & Tái chế',
    topicLabel: 'Rác thải & Tái chế',
    titles: [
      'Phân loại rác 4 nguồn đúng chuẩn tại lớp học',
      'Thu gom và bóc dẹp vỏ hộp sữa học đường sau giờ giải lao',
      'Bỏ túi ni-lông vào thùng vô cơ và khuyên bạn dùng túi vải',
      'Thu gom pin cũ tại nhà nộp vào Hộp Thu Gom Rác Nguy Hại',
      'Tái chế chai nhựa PET làm chậu trồng hoa mười giờ',
      'Xếp gọn vở viết cũ đã dùng hết đem nộp tái chế giấy',
      'Phân loại vỏ bánh kẹo màng nhôm vào thùng rác vô cơ',
    ],
    descriptions: [
      'Em đã phân loại rác chính xác 100% vào đúng 4 thùng rác của trường, giúp lớp luôn gọn gàng sạch sẽ.',
      'Sau khi uống sữa, em bóc 4 tai hộp, bóp dẹp phẳng và xếp ngay ngắn vào thùng tái chế màu vàng của lớp.',
      'Em đã nhặt vỏ bánh kẹo và túi bóng vương trên sân trường, bỏ vào đúng thùng rác vô cơ còn lại.',
      'Em gom được 3 cục pin đồng hồ cũ ở nhà mang đến bỏ vào Hộp Thu Gom Pin Nguy Hại tại sảnh trường.',
      'Em rửa sạch chai nước khoáng Sa Pa, khoét lỗ nhỏ làm chậu cây mầm xanh treo ở góc ban công lớp học.',
      'Em cùng các bạn gom sách báo cũ và giấy trắng viết hết để nộp cho kế hoạch nhỏ tái sinh giấy mới.',
      'Em kiểm tra và nhắc nhở các bạn không vứt que kem nhựa và vỏ kẹo ngọt bừa bãi xuống gầm bàn.',
    ],
    feedbacks: [
      'Thầy cô rất khen ngợi em đã thực hiện đúng quy trình phân loại rác 4 nguồn, xứng đáng là tấm gương sáng!',
      'Hành động phân loại rác rất chuẩn xác và kịp thời. Em hãy tiếp tục giữ vững tinh thần này nhé!',
      'Ý thức bóc dẹp hộp sữa tái chế của em rất đáng khen, góp phần giữ gìn trường học Sa Pa xanh sạch đẹp!',
      'Tuyệt vời! Hành động thu gom pin cũ bảo vệ đất và nguồn nước ngầm Sa Pa không bị nhiễm độc chì.',
      'Sự sáng tạo tái chế chai nhựa của em rất đẹp mắt, thầy cô cộng điểm tối đa cho em nhé!',
    ],
    icon: '♻️',
  },
  {
    topic: 'water',
    category: 'water_saving',
    categoryLabel: 'Tiết kiệm nước sạch',
    topicLabel: 'Bảo vệ nguồn nước',
    titles: [
      'Thực hiện quy tắc khóa vòi nước 20 giây khi xoa xà phòng',
      'Dùng cốc hứng nước súc miệng, không để vòi chảy tràn',
      'Tận dụng nước rửa tay sạch để tưới ẩm bồn hoa lớp',
      'Kiểm tra và khóa chặt các vòi nước khu vệ sinh trước giờ về',
      'Tuyên truyền bảo vệ khe suối Mường Hoa không bị xả rác',
      'Báo cáo thầy cô kịp thời vòi nước bị rò rỉ tại khu bồn rửa',
    ],
    descriptions: [
      'Em rửa tay 6 bước đúng cách và luôn khóa vòi nước trong 20 giây khi đang xoa xà phòng diệt khuẩn.',
      'Em dùng bình nước cá nhân và ca cốc lấy nước vừa đủ uống, tuyệt đối không mở vòi chảy xối xả lãng phí.',
      'Em hứng lại nước rửa rau củ tại nhà bếp bán trú để tưới ẩm cho khóm hoa cúc trước cửa lớp.',
      'Trước khi ra về, em đi kiểm tra toàn bộ 4 vòi nước khu vệ sinh và vặn chặt lại vòi nước bị rỉ.',
      'Em vẽ bức tranh tuyên truyền nhắc nhở không vứt túi ni-lông hay rác bẩn xuống các khe suối vùng cao.',
      'Em phát hiện một vòi nước bị rỉ giọt ở sân trường và đã báo ngay với bác bảo vệ để sửa chữa kịp thời.',
    ],
    feedbacks: [
      'Thầy cô rất tự hào về tinh thần tiết kiệm từng giọt nước sạch vùng cao của em!',
      'Hành vi rửa tay đúng quy chuẩn và tiết kiệm nước rất gương mẫu, đáng để cả lớp noi theo.',
      'Sự cẩn thận kiểm tra khóa chặt vòi nước của em đã giúp nhà trường tiết kiệm được nhiều nước sạch.',
      'Ý thức bảo vệ khe suối Sa Pa rất đáng quý, thầy cô chấm điểm xuất sắc cho em!',
      'Hành động phát hiện và báo sửa vòi rò rỉ rất nhanh nhẹn, tuyên dương em trước lớp nhé!',
    ],
    icon: '💧',
  },
  {
    topic: 'electricity',
    category: 'energy_saving',
    categoryLabel: 'Tiết kiệm năng lượng',
    topicLabel: 'Tiết kiệm điện năng',
    titles: [
      'Tắt đèn và quạt điện khi cả lớp di chuyển ra sân thể dục',
      'Tận dụng ánh sáng tự nhiên qua cửa sổ trong giờ học',
      'Tắt dàn máy vi tính và rút nguồn sau tiết thực hành số',
      'Tắt công tắc điện và kiểm tra các thiết bị trước khi tan học',
      'Tuyên truyền tắt các thiết bị điện không cần thiết tại nhà',
    ],
    descriptions: [
      'Khi chuông báo giờ thể dục ngoài trời, em nán lại kiểm tra và tắt toàn bộ 4 quạt trần cùng đèn chiếu sáng.',
      'Vào buổi sáng nắng đẹp, em kéo rèm cửa sổ để đón ánh sáng tự nhiên và xin phép cô giáo tắt bớt bóng điện.',
      'Sau khi hoàn thành bài tập tin học, em đã Shutdown máy tính và tắt màn hình đúng quy trình.',
      'Em là tổ trưởng trực nhật, luôn kiểm tra tắt cầu dao điện lớp học trước khi đóng cửa phòng về nhà.',
      'Ở nhà, em luôn nhắc nhở em nhỏ tắt tivi và đèn phòng khi ra ngoài để giảm tiêu thụ điện năng.',
    ],
    feedbacks: [
      'Hành động gương mẫu của một công dân số xanh nhỏ tuổi, thầy cô đánh giá rất cao!',
      'Ý thức tiết kiệm điện bảo vệ nguồn năng lượng quốc gia rất tuyệt vời, tiếp tục phát huy em nhé!',
      'Lớp học luôn tiết kiệm điện nhờ sự tự giác của em và các bạn, cô cho em điểm tối đa!',
      'Thầy rất vui khi thấy em có trách nhiệm cao với lớp học và tài nguyên chung.',
      'Tinh thần tự giác của em rất đáng khen ngợi, cô sẽ tuyên dương em trong buổi sinh hoạt tuần!',
    ],
    icon: '💡',
  },
  {
    topic: 'trees',
    category: 'tree_planting',
    categoryLabel: 'Chăm sóc cây xanh',
    topicLabel: 'Trồng cây & Rừng xanh',
    titles: [
      'Tưới nước và nhặt lá vàng cho bồn hoa cúc trước cửa lớp',
      'Chăm sóc cây sa mu cổ thụ ở góc sân trường Sa Pa',
      'Trồng chậu cây nha đam xanh tươi đặt trên bậu cửa sổ',
      'Nhổ cỏ dại và xới đất tơi xốp cho luống hoa ban trường học',
      'Không bẻ cành bứt lá, bảo vệ cây non mới trồng trên đồi',
    ],
    descriptions: [
      'Mỗi buổi sáng đến trường, em đều mang ca nước tưới ẩm cho khóm hoa cúc và nhặt sạch lá úa vàng.',
      'Em cùng các bạn dọn sạch lá khô và rác dưới gốc cây sa mu già, giúp gốc cây luôn thông thoáng.',
      'Em mang một cây cảnh nhỏ từ nhà đến góp vào góc sinh thái của lớp, hàng ngày chăm sóc chu đáo.',
      'Em dùng xẻng nhỏ xới đất quanh gốc cây hoa ban non và nhặt sạch sỏi đá để cây phát triển tốt.',
      'Em luôn nhắc các bạn trong trường không đu bám, bẻ cành cây non mới trồng trong khuôn viên.',
    ],
    feedbacks: [
      'Tình yêu thiên nhiên cây cỏ của em thật đáng quý, bồn hoa của lớp đẹp hơn nhờ có em!',
      'Thầy cô rất khen ngợi hành động chăm sóc cây xanh cần mẫn của em mỗi ngày.',
      'Cây xanh cho bóng mát và không khí trong lành, việc làm của em có ý nghĩa rất lớn với trường Sa Pa.',
      'Góc thiên nhiên của lớp rực rỡ tươi tốt nhờ công chăm sóc của em, cô tặng em điểm thưởng nhé!',
      'Ý thức bảo vệ cây cối của em rất gương mẫu, chúc em luôn yêu mến môi trường sống!',
    ],
    icon: '🌸',
  },
  {
    topic: 'general',
    category: 'cleanup',
    categoryLabel: 'Vệ sinh môi trường',
    topicLabel: 'Nếp sống xanh Sa Pa',
    titles: [
      'Quét dọn hành lang lớp học và sân trường sạch bóng',
      'Lau chùi bàn ghế, bảng lớp tinh tươm trước giờ học',
      'Nhặt rác thải nhựa xung quanh cổng trường và vườn hoa',
      'Tự chuẩn bị bình nước cá nhân khi đi học, không dùng chai 1 lần',
      'Tuyên truyền nếp sống xanh không xả rác cho du khách Sa Pa',
    ],
    descriptions: [
      'Em cầm chổi quét sạch sẽ lá cây và bụi cát ở hành lang trước cửa lớp, đổ rác đúng nơi quy định.',
      'Em giặt khăn sạch lau bảng và lau bàn ghế học tập sáng bóng, giúp các bạn có chỗ ngồi học thoải mái.',
      'Em tình nguyện cùng đội sao đỏ đi nhặt sạch các mẩu túi nilon và que kem rơi ở cổng trường.',
      'Em luôn mang theo bình giữ nhiệt đựng nước ấm từ nhà, không bao giờ mua nước đóng chai nhựa một lần.',
      'Khi thấy du khách làm rơi vỏ bánh trên đường đi học, em đã nhặt lên và chỉ giúp họ thùng rác gần nhất.',
    ],
    feedbacks: [
      'Hành động đẹp của một học sinh văn minh du lịch Sa Pa, thầy cô rất tự hào về em!',
      'Lớp học luôn sạch đẹp và tinh tươm nhờ có bàn tay chăm chỉ của em, cô cho điểm 10 nhé!',
      'Ý thức giữ gìn vệ sinh chung từ những việc nhỏ nhất của em rất đáng khen ngợi!',
      'Thầy khen ngợi tinh thần trách nhiệm và lòng nhiệt tình của em đối với tập thể lớp!',
      'Hành vi văn minh của em đã góp phần làm đẹp thêm hình ảnh trường Tiểu học Sa Pa!',
    ],
    icon: '🧹',
  },
];

// Tạo tự động ít nhất 1,414 Nhật ký hành động xanh (mỗi học sinh ít nhất 1 bài viết),
// có chủ đề khác nhau, nhận xét phong phú và TOÀN BỘ ĐÃ ĐƯỢC GIÁO VIÊN PHÊ DUYỆT (approved + verified = true)
export function generate1414GreenActions(students: StudentProfile[]): GreenAction[] {
  const actions: GreenAction[] = [];

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const templateIdx = i % ACTION_TEMPLATES.length;
    const template = ACTION_TEMPLATES[templateIdx];

    const titleIdx = (i * 3) % template.titles.length;
    const descIdx = (i * 7) % template.descriptions.length;
    const fbIdx = (i * 5) % template.feedbacks.length;

    // Lấy thông tin giáo viên phụ trách lớp của học sinh đó
    const teacherInfo = CLASS_TEACHER_MAP[student.className] || {
      id: 'user-teacher-kimhoa',
      name: 'Cô Hoàng Thị Kim Hoa',
      title: 'Giáo viên phụ trách',
    };

    const actionId = `act-${student.id}-01`;
    // Phân bổ thời gian trong vòng 30 ngày qua
    const daysAgo = (i % 28) + 1;
    const timestamp = Date.now() - daysAgo * 24 * 60 * 60 * 1000 - ((i % 12) * 3600 * 1000);
    const reviewedAt = timestamp + 1000 * 60 * 60 * (1 + (i % 8));

    actions.push({
      id: actionId,
      studentId: student.id,
      studentNickname: student.nickname,
      className: student.className,
      grade: student.grade,
      title: template.titles[titleIdx],
      category: template.category,
      categoryLabel: template.categoryLabel,
      topic: template.topic,
      topicLabel: template.topicLabel,
      description: template.descriptions[descIdx],
      productType: (i % 3 === 0) ? 'drawing' : 'text_reflection',
      productTypeLabel: (i % 3 === 0) ? 'Tranh vẽ hành động' : 'Nhật ký thực hành',
      status: 'approved', // ĐƯỢC TOÀN BỘ GIÁO VIÊN PHÊ DUYỆT
      teacherFeedback: `${teacherInfo.name}: ${template.feedbacks[fbIdx]}`,
      points: 25 + ((i * 5) % 25),
      timestamp,
      reviewedAt,
      reviewedBy: teacherInfo.name, // Giáo viên của đúng lớp đó phê duyệt
      icon: template.icon,
      verified: true, // Xác thực 100%
    });
  }

  return actions;
}
