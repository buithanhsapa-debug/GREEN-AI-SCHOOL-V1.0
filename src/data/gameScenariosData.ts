export interface WaterScenario {
  id: string;
  title: string;
  location: 'Trường học' | 'Gia đình' | 'Bản làng Sa Pa';
  icon: string;
  situation: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
    waterSavedLiters: number;
  }[];
}

export interface ElectricityScenario {
  id: string;
  title: string;
  location: 'Lớp học' | 'Phòng tin học' | 'Gia đình';
  icon: string;
  situation: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
    safetyNotice?: string;
  }[];
}

export interface TreeActionScenario {
  id: string;
  title: string;
  icon: string;
  actionDescription: string;
  imageEmoji: string;
  isGoodBehavior: boolean;
  explanation: string;
  ecoTip: string;
}

export interface EcoQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
}

// 1. DỮ LIỆU TÌNH HUỐNG TIẾT KIỆM NƯỚC
export const WATER_SCENARIOS: WaterScenario[] = [
  {
    id: 'water-1',
    title: 'Rửa tay bằng xà phòng sau giờ ra chơi',
    location: 'Trường học',
    icon: '🧼',
    situation: 'Sau khi vui chơi ở sân trường Sa Pa, bạn đến bồn rửa tay để sát khuẩn bằng xà phòng. Trong lúc xoa xà phòng tạo bọt (khoảng 20 giây), bạn sẽ làm gì?',
    options: [
      {
        id: 'opt-1',
        text: 'Vặn chặt vòi nước lại trong lúc xoa bọt xà phòng, xoa xong mới mở nước tráng sạch.',
        isCorrect: true,
        explanation: 'Chính xác! 20 giây vặn vòi giúp tiết kiệm từ 3 đến 5 lít nước sạch mỗi lần rửa tay.',
        waterSavedLiters: 4,
      },
      {
        id: 'opt-2',
        text: 'Để vòi nước chảy tự do xối xả cho vui tai trong lúc xoa xà phòng.',
        isCorrect: false,
        explanation: 'Nước sạch sẽ bị lãng phí vô ích trôi xuống cống trong khi bạn đang xoa bọt xà phòng!',
        waterSavedLiters: 0,
      },
      {
        id: 'opt-3',
        text: 'Vặn nước mở to hết cỡ để nước bắn tung tóe ra sàn bồn rửa.',
        isCorrect: false,
        explanation: 'Vừa gây lãng phí nước nghiêm trọng, vừa làm ướt sàn nhà gây nguy cơ trơn trượt té ngã!',
        waterSavedLiters: 0,
      }
    ]
  },
  {
    id: 'water-2',
    title: 'Phát hiện vòi nước bị rò rỉ nhỏ giọt',
    location: 'Trường học',
    icon: '🚰',
    situation: 'Khi đi ngang qua khu vệ sinh trường học, bạn nghe thấy tiếng "tách... tách..." và nhìn thấy một vòi nước đang bị rò rỉ từng giọt nước xuống bồn.',
    options: [
      {
        id: 'opt-1',
        text: 'Lại gần thử vặn chặt van nước lại; nếu van bị hỏng, báo ngay cho thầy cô giáo hoặc bác bảo vệ.',
        isCorrect: true,
        explanation: 'Rất tuyệt vời! Một giọt nước rò rỉ có thể làm lãng phí đến 30 lít nước mỗi ngày nếu không sửa chữa kịp thời.',
        waterSavedLiters: 25,
      },
      {
        id: 'opt-2',
        text: 'Bỏ qua và coi như không thấy vì đó không phải là việc của mình.',
        isCorrect: false,
        explanation: 'Nguồn nước ngọt của Sa Pa rất quý báu, mỗi học sinh đều có trách nhiệm bảo vệ.',
        waterSavedLiters: 0,
      },
      {
        id: 'opt-3',
        text: 'Lấy tay nghịch bẻ cong vòi nước để xem có phun mạnh hơn không.',
        isCorrect: false,
        explanation: 'Hành động này có thể làm vỡ đường ống nước và gây hỏng tài sản nhà trường!',
        waterSavedLiters: 0,
      }
    ]
  },
  {
    id: 'water-3',
    title: 'Giúp mẹ rửa rau củ su su tại nhà',
    location: 'Gia đình',
    icon: '🥬',
    situation: 'Chiều nay bạn giúp mẹ chuẩn bị bữa tối ở nhà. Bạn được giao nhiệm vụ rửa một rổ ngọn su su tươi ngon vừa hái ở vườn Sa Pa.',
    options: [
      {
        id: 'opt-1',
        text: 'Hứng một chậu nước sạch để rửa rau, sau đó dùng nước rửa rau này để tưới cho chậu hoa hồng ngoài sân.',
        isCorrect: true,
        explanation: 'Ý tưởng tái sử dụng nước tuyệt vời! Vừa rửa rau sạch sẽ vừa không tốn thêm nước tưới cây.',
        waterSavedLiters: 10,
      },
      {
        id: 'opt-2',
        text: 'Bật vòi nước máy xả trực tiếp liên tục vào từng cọng rau cho nước tràn lênh láng.',
        isCorrect: false,
        explanation: 'Xả trực tiếp liên tục tốn gấp 3 lần lượng nước so với việc rửa trong chậu sạch.',
        waterSavedLiters: 0,
      },
      {
        id: 'opt-3',
        text: 'Rửa rau xong đổ cả chậu nước bẩn lẫn lá rác ra thảm cỏ trước cửa nhà.',
        isCorrect: false,
        explanation: 'Cần đổ rác lá úa vào thùng hữu cơ để tránh làm mất vệ sinh sân nhà.',
        waterSavedLiters: 0,
      }
    ]
  },
  {
    id: 'water-4',
    title: 'Đánh răng vào buổi sáng vùng cao',
    location: 'Gia đình',
    icon: '🪥',
    situation: 'Mỗi buổi sáng thức dậy trong tiết trời sương mù se lạnh của Sa Pa, bạn chuẩn bị đánh răng để chuẩn bị tới trường.',
    options: [
      {
        id: 'opt-1',
        text: 'Dùng một chiếc cốc nhỏ lấy lượng nước vừa đủ để súc miệng, khóa chặt vòi nước trong lúc chải răng.',
        isCorrect: true,
        explanation: 'Chuẩn xác! Dùng cốc lấy nước giúp bạn chỉ tốn khoảng 0.5 lít nước thay vì hơn 6 lít nếu để vòi chảy liên tục.',
        waterSavedLiters: 6,
      },
      {
        id: 'opt-2',
        text: 'Mở vòi nước chảy đầy bồn suốt 3 phút chải răng.',
        isCorrect: false,
        explanation: 'Hàng lít nước ngọt quý giá đã trôi tuột xuống cống khi bạn chưa cần dùng tới!',
        waterSavedLiters: 0,
      }
    ]
  },
  {
    id: 'water-5',
    title: 'Dã ngoại ngắm cảnh suối Mường Hoa',
    location: 'Bản làng Sa Pa',
    icon: '🏞️',
    situation: 'Vào cuối tuần, gia đình bạn đi dã ngoại bên dòng suối Mường Hoa tuyệt đẹp. Khi rửa tay chân sau khi đi bộ trên đường mòn, bạn sẽ:',
    options: [
      {
        id: 'opt-1',
        text: 'Rửa nhẹ nhàng, không vứt bất kỳ chai nhựa, túi nilon hay hóa chất tẩy rửa nào xuống lòng suối.',
        isCorrect: true,
        explanation: 'Hoan hô em! Giữ dòng suối Mường Hoa luôn trong lành để cung cấp nước sinh hoạt cho toàn bộ thung lũng.',
        waterSavedLiters: 50,
      },
      {
        id: 'opt-2',
        text: 'Mang xà phòng giặt ra giữa dòng suối giặt đồ rồi xả bọt trắng xóa xuống nước.',
        isCorrect: false,
        explanation: 'Hóa chất xà phòng làm chết các loài cá, ốc và gây ô nhiễm nguồn nước của bản làng!',
        waterSavedLiters: 0,
      }
    ]
  }
];

// 2. DỮ LIỆU TÌNH HUỐNG TIẾT KIỆM ĐIỆN VÀ AN TOÀN ĐIỆN
export const ELECTRICITY_SCENARIOS: ElectricityScenario[] = [
  {
    id: 'elec-1',
    title: 'Ánh nắng ban mai trong phòng học',
    location: 'Lớp học',
    icon: '☀️',
    situation: 'Buổi sáng, ánh nắng mặt trời Sa Pa chiếu sáng rực rỡ qua cửa sổ lớp học, không khí trong lành mát mẻ.',
    options: [
      {
        id: 'opt-1',
        text: 'Kéo rèm cửa đón ánh sáng tự nhiên và gió mát, tắt bớt đèn điện và quạt không cần thiết.',
        isCorrect: true,
        explanation: 'Ánh sáng tự nhiên rất tốt cho mắt học sinh và giúp trường học tiết kiệm hàng nghìn số điện mỗi tháng!',
      },
      {
        id: 'opt-2',
        text: 'Kéo kín rèm tối om rồi bật tất cả bóng đèn tuýp và quạt quay hết tốc lực.',
        isCorrect: false,
        explanation: 'Lãng phí điện năng và làm phòng học ngột ngạt hơn so với đón gió tự nhiên của núi rừng.',
      }
    ]
  },
  {
    id: 'elec-2',
    title: 'Hết giờ thực hành tại phòng Tin học',
    location: 'Phòng tin học',
    icon: '💻',
    situation: 'Chuông báo hết tiết Tin học vang lên, cả lớp chuẩn bị xếp hàng trở về phòng học chính.',
    options: [
      {
        id: 'opt-1',
        text: 'Chọn lệnh "Shut down" tắt máy tính đúng cách, tắt màn hình và nhắc thầy cô tắt cầu dao chung của phòng.',
        isCorrect: true,
        explanation: 'Rất chính xác! Tắt máy tính đúng quy trình giúp bảo vệ thiết bị và không hao phí điện lúc không sử dụng.',
      },
      {
        id: 'opt-2',
        text: 'Cứ để máy tính bật sáng trưng rồi ùa chạy nhanh ra ngoài chơi.',
        isCorrect: false,
        explanation: 'Để máy tính hoạt động liên tục vừa tiêu tốn điện vừa làm giảm tuổi thọ của máy tính nhà trường.',
      }
    ]
  },
  {
    id: 'elec-3',
    title: 'Phát hiện ổ cắm điện bị lỏng hoặc dây điện hở',
    location: 'Lớp học',
    icon: '⚡',
    situation: 'Ở góc cuối lớp học, bạn nhìn thấy ổ cắm điện hơi bị lung lay và có một đoạn dây điện bị tróc vỏ màu đen.',
    options: [
      {
        id: 'opt-1',
        text: 'TUYỆT ĐỐI KHÔNG CHẠM TAY VÀO, nhắc các bạn tránh xa và báo ngay cho thầy cô giáo hoặc bác bảo vệ.',
        isCorrect: true,
        explanation: 'BẠN ĐÃ LÀM HOÀN TOÀN ĐÚNG! An toàn điện là số 1. Học sinh tiểu học tuyệt đối không tự sửa chữa điện nguy hiểm.',
        safetyNotice: '🛡️ Quy tắc an toàn: Không chạm tay vào ổ cắm hay dây hở, luôn nhờ người lớn xử lý.',
      },
      {
        id: 'opt-2',
        text: 'Lấy ngón tay hoặc que sắt thử chọc vào ổ cắm xem có điện hay không.',
        isCorrect: false,
        explanation: 'CỰC KỲ NGUY HIỂM! Dòng điện 220V có thể giật chết người ngay tức khắc. Tuyệt đối không bao giờ làm điều này!',
        safetyNotice: '⚠️ CẢNH BÁO NGUY HIỂM TÍNH MẠNG!',
      },
      {
        id: 'opt-3',
        text: 'Lấy băng dính thường tự quấn quanh dây điện hở.',
        isCorrect: false,
        explanation: 'Học sinh không có kiến thức kỹ thuật điện, tự ý chạm vào có thể bị điện giật bất cứ lúc nào.',
        safetyNotice: '🛡️ Phải luôn báo người lớn chuyên môn sửa chữa an toàn.',
      }
    ]
  },
  {
    id: 'elec-4',
    title: 'Thiết bị sạc pin đã đầy 100%',
    location: 'Gia đình',
    icon: '🔋',
    situation: 'Chiếc đèn học tích điện hoặc máy tính bảng học tập của bạn đã cắm sạc đủ giờ và đèn báo xanh 100% pin.',
    options: [
      {
        id: 'opt-1',
        text: 'Nhờ bố mẹ hoặc người lớn rút phích sạc ra khỏi ổ cắm để ngắt điện hoàn toàn.',
        isCorrect: true,
        explanation: 'Chính xác! Thiết bị sạc dù đầy pin vẫn tiêu thụ điện năng ngầm và cắm liên tục dễ gây chai pin, chập cháy.',
      },
      {
        id: 'opt-2',
        text: 'Cứ cắm sạc liên tục cả ngày lẫn đêm suốt tuần.',
        isCorrect: false,
        explanation: 'Cục sạc sẽ bị nóng lên, tiêu tốn điện và tiềm ẩn nguy cơ chập cháy điện trong gia đình.',
      }
    ]
  }
];

// 3. DỮ LIỆU BẢO VỆ CÂY XANH (HÀNH VI PHÙ HỢP VÀ KHÔNG PHÙ HỢP)
export const TREE_ACTIONS: TreeActionScenario[] = [
  {
    id: 'tree-1',
    title: 'Tưới nước cho bồn hoa của lớp',
    icon: '🚿',
    actionDescription: 'Tưới nước vừa đủ vào sáng sớm hoặc chiều mát cho luống hoa cúc và dạ yến thảo ở hành lang lớp học.',
    imageEmoji: '🌸',
    isGoodBehavior: true,
    explanation: 'Hành vi rất tốt! Tưới nước vào thời điểm mát mẻ giúp rễ cây hấp thụ nước hiệu quả nhất mà không bị bốc hơi.',
    ecoTip: 'Nhớ dùng bình tưới có vòi hoa sen nhỏ để không làm xói đất gốc cây em nhé!',
  },
  {
    id: 'tree-2',
    title: 'Bẻ cành hoa đào phai Sa Pa',
    icon: '🌸',
    actionDescription: 'Thấy cành đào phai đầu xuân nở hoa rực rỡ ở sân trường, bạn trèo lên bẻ cành mang vào lớp cắm bàn.',
    imageEmoji: '🥀',
    isGoodBehavior: false,
    explanation: 'Hành vi KHÔNG phù hợp! Bẻ cành làm gãy chồi non, cây bị chảy nhựa suy kiệt và mất đi vẻ đẹp chung của trường học.',
    ecoTip: 'Hoa để trên cành sẽ khoe sắc cho hàng trăm bạn học sinh và thầy cô cùng ngắm nhìn!',
  },
  {
    id: 'tree-3',
    title: 'Xới đất và nhặt cỏ dại quanh gốc cây',
    icon: '🌱',
    actionDescription: 'Trong giờ chăm sóc góc thiên nhiên, các bạn cùng nhau nhặt lá vàng úa, nhổ cỏ dại và xới đất tơi xốp.',
    imageEmoji: '🪴',
    isGoodBehavior: true,
    explanation: 'Hành vi tuyệt vời! Đất tơi xốp giúp rễ cây thở được và hấp thu dinh dưỡng tốt hơn, không bị cỏ dại tranh thức ăn.',
    ecoTip: 'Lá cây khô nhặt được có thể gom vào thùng rác hữu cơ ủ thành phân bón.',
  },
  {
    id: 'tree-4',
    title: 'Khắc tên hoặc chữ lên thân cây cổ thụ',
    icon: '🔪',
    actionDescription: 'Dùng vật nhọn hoặc bút xóa khắc tên mình và ngày tháng lên thân cây thông ở sân trường Sa Pa.',
    imageEmoji: '🌲',
    isGoodBehavior: false,
    explanation: 'Hành vi RẤT XẤU! Lớp vỏ cây giống như làn da bảo vệ cây. Khắc tên làm rách vỏ khiến nấm mốc và vi khuẩn tấn công làm cây chết dần.',
    ecoTip: 'Hãy để lại dấu ấn bằng những việc làm tốt, đừng để lại vết thương trên thân cây xanh!',
  },
  {
    id: 'tree-5',
    title: 'Làm biển tên giới thiệu cây trong trường',
    icon: '🏷️',
    actionDescription: 'Tái chế bìa cứng làm bảng tên mini ghi: "Cây Hoa Ban - Lớp 3A1 chăm sóc" và buộc nhẹ nhàng quanh thân cây.',
    imageEmoji: '🌳',
    isGoodBehavior: true,
    explanation: 'Hành vi rất sáng tạo và nhân văn! Vừa giúp các bạn học sinh biết tên cây, vừa khơi dậy tình yêu thiên nhiên.',
    ecoTip: 'Lưu ý buộc bằng dây mềm, không đóng đinh sắt vào thân cây nhé!',
  },
  {
    id: 'tree-6',
    title: 'Ném vỏ kẹo và túi nilon vào bồn cây',
    icon: '🍬',
    actionDescription: 'Ăn xong que kem hoặc gói bánh kẹo, tiện tay nhét rác nilon vào bụi hoa mười giờ dưới gốc cây.',
    imageEmoji: '🚯',
    isGoodBehavior: false,
    explanation: 'Hành vi SAI TRÁI! Rác nhựa không phân hủy làm đất bị bí khí, rễ cây không phát triển được và gây mất vệ sinh học đường.',
    ecoTip: 'Hãy đi thêm vài bước để bỏ rác đúng vào thùng rác màu vàng hoặc màu xám nhé!',
  }
];

// 4. DỮ LIỆU ĐẤU TRƯỜNG KIẾN THỨC MÔI TRƯỜNG (ECO QUIZ ARENA)
export const ARENA_QUIZ_QUESTIONS: EcoQuizQuestion[] = [
  {
    id: 1,
    question: 'Loại rác nào sau đây thuộc nhóm RÁC HỮU CƠ dễ phân hủy tự nhiên?',
    options: ['Vỏ củ su su và cuống rau cải mèo', 'Vỏ lon nước ngọt bằng nhôm', 'Túi nilon rách', 'Chai nước suối bằng nhựa'],
    correctIndex: 0,
    explanation: 'Chính xác! Vỏ rau củ hữu cơ phân hủy thành mùn dinh dưỡng nuôi đất Sa Pa.',
    topic: 'Phân loại rác',
  },
  {
    id: 2,
    question: 'Khi phát hiện một vòi nước trong trường học bị rò rỉ chảy nhỏ giọt, em nên làm gì?',
    options: ['Lấy gậy chọc vào vòi', 'Bỏ đi coi như không biết', 'Khóa chặt vòi lại hoặc báo ngay cho thầy cô/bảo vệ', 'Mở nước to hơn'],
    correctIndex: 2,
    explanation: 'Đúng rồi! Báo người lớn sửa chữa kịp thời giúp tránh thất thoát hàng chục lít nước sạch mỗi ngày.',
    topic: 'Tiết kiệm nước',
  },
  {
    id: 3,
    question: 'Hành động nào sau đây là AN TOÀN và TIẾT KIỆM điện nhất trong phòng học?',
    options: ['Mở rèm tận dụng ánh sáng tự nhiên và tắt đèn khi ra khỏi phòng', 'Tự ý lấy que chọc vào ổ cắm điện', 'Bật toàn bộ đèn và quạt suốt đêm', 'Kéo kín rèm bật đèn sáng trưng'],
    correctIndex: 0,
    explanation: 'Rất chuẩn! Ánh sáng tự nhiên vừa tốt cho thị giác vừa tiết kiệm điện năng.',
    topic: 'Tiết kiệm điện',
  },
  {
    id: 4,
    question: 'Rừng quốc gia Hoàng Liên tại Sa Pa có vai trò sinh thái quan trọng nhất là gì?',
    options: ['Để chặt gỗ làm bàn ghế', 'Chắn gió bão, giữ đất chống sạt lở và nuôi dưỡng nguồn nước ngầm', 'Làm thời tiết Sa Pa nóng hơn', 'Không có tác dụng gì'],
    correctIndex: 1,
    explanation: 'Xuất sắc! Rừng Hoàng Liên là lá phổi xanh và lá chắn chở che cho quê hương Sa Pa!',
    topic: 'Cây xanh & Rừng',
  },
  {
    id: 5,
    question: 'Một chiếc túi nilon hoặc chai nhựa vứt bừa bãi ngoài tự nhiên mất khoảng bao lâu để phân hủy?',
    options: ['Vài ngày', '1 tuần', '1 đến 2 năm', 'Từ 100 đến 500 năm'],
    correctIndex: 3,
    explanation: 'Thật đáng kinh ngạc! Rác nhựa tồn tại hàng trăm năm, vì vậy chúng mình cần hạn chế đồ nhựa 1 lần!',
    topic: 'Rác thải nhựa',
  },
  {
    id: 6,
    question: 'Cục pin đồ chơi cũ sau khi dùng hết điện thuộc loại rác nào cần xử lý?',
    options: ['Rác hữu cơ làm phân bón', 'Rác nguy hại chứa kim loại nặng cần thu gom riêng', 'Rác vứt xuống suối Mường Hoa', 'Rác chôn dưới bồn hoa'],
    correctIndex: 1,
    explanation: 'Chính xác! Pin chứa chì và thủy ngân rất độc, bắt buộc phải gom vào hộp thu gom pin của trường!',
    topic: 'Rác nguy hại',
  }
];
