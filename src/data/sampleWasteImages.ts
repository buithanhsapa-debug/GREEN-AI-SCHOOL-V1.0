// High-resolution realistic visual representations of sample waste items for Green Vision testing
// Provides instant 100% matched visual display & fallback scanning data

export interface SampleWasteItem {
  id: string;
  label: string;
  icon: string;
  hint: string;
  category: 'recyclable' | 'organic' | 'hazardous' | 'other';
  binColor: 'yellow' | 'green' | 'red' | 'gray';
  binName: string;
  sampleImage: string;
}

// Helpers to encode crisp SVG data URLs
const svgToDataUrl = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

// 1. Thùng Bìa Carton (Brown corrugated cardboard box)
const cartonSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="boxFront" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#c29158"/>
      <stop offset="100%" stop-color="#9d6d36"/>
    </linearGradient>
    <linearGradient id="boxSide" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#a6733a"/>
      <stop offset="100%" stop-color="#7e5323"/>
    </linearGradient>
    <linearGradient id="boxTop" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#d6a36a"/>
      <stop offset="100%" stop-color="#e3b57e"/>
    </linearGradient>
    <filter id="boxShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="10" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Studio Background -->
  <rect width="400" height="300" fill="url(#bgGrad)"/>
  <ellipse cx="200" cy="250" rx="140" ry="20" fill="#000" opacity="0.15" filter="blur(4px)"/>

  <!-- 3D Cardboard Box -->
  <g filter="url(#boxShadow)">
    <!-- Top Open Left Flap -->
    <polygon points="120,95 80,60 140,50 180,80" fill="#cf9c63" stroke="#875822" stroke-width="1.5"/>
    <!-- Top Open Right Flap -->
    <polygon points="260,115 310,75 250,65 200,95" fill="#ba8951" stroke="#875822" stroke-width="1.5"/>
    <!-- Back Inside of Box -->
    <polygon points="120,95 200,80 280,105 200,120" fill="#5c3a15"/>

    <!-- Front Left Face (Side) -->
    <polygon points="120,95 200,120 200,230 120,195" fill="url(#boxSide)" stroke="#744a1e" stroke-width="1.5"/>
    <!-- Front Right Face (Main Front) -->
    <polygon points="200,120 280,105 280,210 200,230" fill="url(#boxFront)" stroke="#744a1e" stroke-width="1.5"/>

    <!-- Corrugated Texture Lines on Front -->
    <line x1="210" y1="123" x2="210" y2="228" stroke="#875723" stroke-width="1" opacity="0.4"/>
    <line x1="225" y1="120" x2="225" y2="224" stroke="#875723" stroke-width="1" opacity="0.4"/>
    <line x1="240" y1="117" x2="240" y2="220" stroke="#875723" stroke-width="1" opacity="0.4"/>
    <line x1="255" y1="113" x2="255" y2="216" stroke="#875723" stroke-width="1" opacity="0.4"/>
    <line x1="270" y1="109" x2="270" y2="212" stroke="#875723" stroke-width="1" opacity="0.4"/>

    <!-- Shipping / Packaging Tape -->
    <polygon points="196,120 204,120 204,230 196,230" fill="#c49b4b" opacity="0.8"/>

    <!-- Carton Stamps & Labels -->
    <g transform="translate(215, 145) rotate(-5)">
      <!-- Recycling Symbol -->
      <circle cx="25" cy="25" r="22" fill="#fff" opacity="0.85"/>
      <path d="M 25 10 L 29 17 L 21 17 Z M 14 30 L 15 22 L 20 26 Z M 36 30 L 30 26 L 35 22 Z" fill="#15803d"/>
      <path d="M 23 16 A 12 12 0 0 1 34 25" fill="none" stroke="#15803d" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 32 29 A 12 12 0 0 1 18 31" fill="none" stroke="#15803d" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 16 26 A 12 12 0 0 1 23 16" fill="none" stroke="#15803d" stroke-width="2.5" stroke-linecap="round"/>
      <text x="25" y="58" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="#3e2710" text-anchor="middle">BÌA CARTON 100% TÁI CHẾ</text>
    </g>

    <!-- Fragile / Handle with Care Icon -->
    <g transform="translate(135, 135) skewY(15)">
      <rect x="0" y="0" width="45" height="35" rx="3" fill="#fff" opacity="0.8"/>
      <text x="22" y="14" font-family="Arial, sans-serif" font-size="6" font-weight="black" fill="#b91c1c" text-anchor="middle">📦 GIẤY SA PA</text>
      <text x="22" y="24" font-family="Arial, sans-serif" font-size="5.5" font-weight="bold" fill="#1e293b" text-anchor="middle">THÙNG CARTON</text>
    </g>
  </g>

  <!-- Foreground Title Tag -->
  <g transform="translate(20, 20)">
    <rect x="0" y="0" width="165" height="28" rx="8" fill="#185a32"/>
    <text x="12" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">📦 Bìa Carton &amp; Hộp Giấy</text>
  </g>
  <g transform="translate(275, 20)">
    <rect x="0" y="0" width="105" height="28" rx="8" fill="#ca8a04"/>
    <text x="10" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">🟡 Thùng Vàng</text>
  </g>
</svg>
`;

// 2. Vỏ Hộp Sữa Học Đường (Tetra Pak style school milk carton)
const milkSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="bgMilk" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f0fdf4"/>
      <stop offset="100%" stop-color="#dcfce7"/>
    </linearGradient>
    <linearGradient id="cartonFront" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="60%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#bae6fd"/>
    </linearGradient>
    <linearGradient id="cartonSide" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0369a1"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
  </defs>

  <rect width="400" height="300" fill="url(#bgMilk)"/>
  <ellipse cx="200" cy="255" rx="90" ry="16" fill="#000" opacity="0.16" filter="blur(4px)"/>

  <!-- 3D Milk Carton -->
  <g transform="translate(145, 50)">
    <!-- Slanted Top Roof -->
    <polygon points="30,35 70,10 110,35 70,60" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
    <polygon points="70,10 110,35 110,5 70,0" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>

    <!-- Straw Hole Puncture Circle -->
    <circle cx="55" cy="40" r="5.5" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/>
    <circle cx="55" cy="40" r="3" fill="#94a3b8"/>

    <!-- Left Side Face -->
    <polygon points="0,60 30,35 30,190 0,195" fill="url(#cartonSide)" stroke="#0369a1" stroke-width="1"/>
    <!-- Main Front Face -->
    <polygon points="30,35 110,35 110,190 30,190" fill="url(#cartonFront)" stroke="#0284c7" stroke-width="1"/>

    <!-- White Milk Splash Graphic on Front -->
    <path d="M 30,120 Q 50,105 70,120 T 110,115 L 110,190 L 30,190 Z" fill="#ffffff"/>

    <!-- Milk Brand & School Program Text -->
    <text x="70" y="80" font-family="Arial, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">SỮA TƯƠI</text>
    <text x="70" y="94" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#fef08a" text-anchor="middle">HỌC ĐƯỜNG SA PA</text>
    <text x="70" y="145" font-family="Arial, sans-serif" font-size="10" font-weight="900" fill="#0284c7" text-anchor="middle">180 ml</text>
    <text x="70" y="160" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="#0369a1" text-anchor="middle">TIỆT TRÙNG ÍT ĐƯỜNG</text>

    <!-- Eco 3-Step Flatten Guide Icon -->
    <g transform="translate(42, 168)">
      <rect x="0" y="0" width="56" height="15" rx="3" fill="#15803d"/>
      <text x="28" y="10.5" font-family="Arial, sans-serif" font-size="6.5" font-weight="bold" fill="#ffffff" text-anchor="middle">♻️ GẤP PHẲNG HỘP</text>
    </g>

    <!-- Folded Ear (Tai Hộp) -->
    <polygon points="110,35 125,50 110,65" fill="#0284c7" stroke="#0369a1"/>
  </g>

  <!-- Tags -->
  <g transform="translate(20, 20)">
    <rect x="0" y="0" width="180" height="28" rx="8" fill="#185a32"/>
    <text x="12" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">🧃 Vỏ Hộp Sữa Học Đường</text>
  </g>
  <g transform="translate(275, 20)">
    <rect x="0" y="0" width="105" height="28" rx="8" fill="#ca8a04"/>
    <text x="10" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">🟡 Thùng Vàng</text>
  </g>
</svg>
`;

// 3. Chai Nước Khoáng Nhựa PET (Clear plastic mineral water bottle with blue cap)
const bottleSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="bgBottle" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e0f2fe"/>
    </linearGradient>
    <linearGradient id="petGlass" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
      <stop offset="30%" stop-color="#bae6fd" stop-opacity="0.6"/>
      <stop offset="70%" stop-color="#e0f2fe" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.8"/>
    </linearGradient>
    <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1d4ed8"/>
      <stop offset="50%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1e40af"/>
    </linearGradient>
  </defs>

  <rect width="400" height="300" fill="url(#bgBottle)"/>
  <ellipse cx="200" cy="265" rx="60" ry="14" fill="#000" opacity="0.18" filter="blur(4px)"/>

  <!-- Bottle Silhouette -->
  <g transform="translate(160, 30)">
    <!-- Blue Cap -->
    <rect x="30" y="0" width="20" height="18" rx="3" fill="url(#capGrad)" stroke="#1e3a8a" stroke-width="1"/>
    <line x1="34" y1="2" x2="34" y2="16" stroke="#93c5fd" stroke-width="1"/>
    <line x1="40" y1="2" x2="40" y2="16" stroke="#93c5fd" stroke-width="1"/>
    <line x1="46" y1="2" x2="46" y2="16" stroke="#93c5fd" stroke-width="1"/>
    <!-- Security Ring -->
    <rect x="29" y="18" width="22" height="4" rx="1" fill="#1d4ed8"/>

    <!-- Neck -->
    <rect x="32" y="22" width="16" height="15" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1" opacity="0.9"/>

    <!-- Sloping Shoulders -->
    <path d="M 32,37 Q 32,55 10,75 L 10,215 Q 10,230 40,230 Q 70,230 70,215 L 70,75 Q 48,55 48,37 Z"
          fill="url(#petGlass)" stroke="#0284c7" stroke-width="1.5"/>

    <!-- Inner Highlights -->
    <line x1="16" y1="75" x2="16" y2="215" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
    <line x1="22" y1="80" x2="22" y2="210" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>

    <!-- Blue Mountain Label -->
    <rect x="9.5" y="115" width="61" height="60" rx="3" fill="#0284c7"/>
    <!-- Mountain Graphic -->
    <polygon points="15,150 28,130 40,150" fill="#38bdf8"/>
    <polygon points="32,150 48,125 65,150" fill="#ffffff"/>
    <polygon points="43,133 48,125 54,133" fill="#93c5fd"/>

    <text x="40" y="162" font-family="Arial, sans-serif" font-size="7.5" font-weight="900" fill="#ffffff" text-anchor="middle">SA PA MINERAL</text>
    <text x="40" y="170" font-family="Arial, sans-serif" font-size="5" font-weight="bold" fill="#fef08a" text-anchor="middle">CHAI NHỰA PET 500ml</text>

    <!-- PET 1 Recycling Badge -->
    <g transform="translate(32, 185)">
      <polygon points="8,0 16,14 0,14" fill="none" stroke="#0369a1" stroke-width="1.2"/>
      <text x="8" y="11" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="#0369a1" text-anchor="middle">1</text>
      <text x="8" y="21" font-family="Arial, sans-serif" font-size="5" font-weight="bold" fill="#0369a1" text-anchor="middle">PET</text>
    </g>
  </g>

  <!-- Tags -->
  <g transform="translate(20, 20)">
    <rect x="0" y="0" width="195" height="28" rx="8" fill="#185a32"/>
    <text x="12" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">🍾 Chai Nước Khoáng Nhựa PET</text>
  </g>
  <g transform="translate(275, 20)">
    <rect x="0" y="0" width="105" height="28" rx="8" fill="#ca8a04"/>
    <text x="10" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">🟡 Thùng Vàng</text>
  </g>
</svg>
`;

// 4. Vỏ Lon Nhôm Nước Ngọt (Crushed / upright aluminum beverage can)
const canSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="bgCan" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff1f2"/>
      <stop offset="100%" stop-color="#ffe4e6"/>
    </linearGradient>
    <linearGradient id="canSilver" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#cbd5e1"/>
      <stop offset="50%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
    <linearGradient id="canRed" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#991b1b"/>
      <stop offset="30%" stop-color="#ef4444"/>
      <stop offset="70%" stop-color="#dc2626"/>
      <stop offset="100%" stop-color="#7f1d1d"/>
    </linearGradient>
  </defs>

  <rect width="400" height="300" fill="url(#bgCan)"/>
  <ellipse cx="200" cy="255" rx="75" ry="16" fill="#000" opacity="0.18" filter="blur(4px)"/>

  <!-- 3D Soda Can -->
  <g transform="translate(150, 45)">
    <!-- Top Rim (Silver Chime) -->
    <ellipse cx="50" cy="18" rx="42" ry="12" fill="url(#canSilver)" stroke="#94a3b8" stroke-width="1.5"/>
    <ellipse cx="50" cy="18" rx="36" ry="9" fill="#94a3b8" stroke="#64748b" stroke-width="1"/>

    <!-- Pull Tab (Khoen mở lon) -->
    <g transform="translate(42, 12)">
      <rect x="0" y="0" width="16" height="10" rx="3" fill="#e2e8f0" stroke="#475569" stroke-width="1"/>
      <circle cx="11" cy="5" r="3" fill="#94a3b8"/>
      <rect x="2" y="3.5" width="4" height="3" fill="#cbd5e1"/>
    </g>

    <!-- Top Slope Collar -->
    <path d="M 8,18 Q 0,35 0,45 L 100,45 Q 100,35 92,18 Z" fill="url(#canSilver)" stroke="#94a3b8"/>

    <!-- Main Cylinder Body (Red printed can) -->
    <rect x="0" y="45" width="100" height="145" fill="url(#canRed)" stroke="#7f1d1d" stroke-width="1"/>

    <!-- Metallic Reflection Strip -->
    <rect x="20" y="45" width="15" height="145" fill="#ffffff" opacity="0.35"/>
    <rect x="28" y="45" width="4" height="145" fill="#ffffff" opacity="0.6"/>

    <!-- Brand Typography & Wave -->
    <path d="M 0,110 Q 25,95 50,110 T 100,105 L 100,120 Q 75,105 50,120 T 0,115 Z" fill="#ffffff"/>
    <text x="50" y="95" font-family="Impact, Arial, sans-serif" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">COLD SODA</text>
    <text x="50" y="140" font-family="Arial, sans-serif" font-size="8" font-weight="900" fill="#fef08a" text-anchor="middle">100% LON NHÔM TÁI CHẾ</text>
    <text x="50" y="152" font-family="Arial, sans-serif" font-size="6.5" font-weight="bold" fill="#ffffff" text-anchor="middle">330 ml • ALISAPA</text>

    <!-- ALU Recycling Logo -->
    <g transform="translate(40, 160)">
      <circle cx="10" cy="10" r="10" fill="#ffffff"/>
      <text x="10" y="13" font-family="Arial, sans-serif" font-size="7" font-weight="black" fill="#dc2626" text-anchor="middle">ALU</text>
    </g>

    <!-- Bottom Rim (Silver) -->
    <path d="M 0,190 Q 0,200 10,205 L 90,205 Q 100,200 100,190 Z" fill="url(#canSilver)" stroke="#94a3b8"/>
    <ellipse cx="50" cy="205" rx="40" ry="8" fill="#64748b"/>
  </g>

  <!-- Tags -->
  <g transform="translate(20, 20)">
    <rect x="0" y="0" width="165" height="28" rx="8" fill="#185a32"/>
    <text x="12" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">🥫 Vỏ Lon Nhôm Nước Ngọt</text>
  </g>
  <g transform="translate(275, 20)">
    <rect x="0" y="0" width="105" height="28" rx="8" fill="#ca8a04"/>
    <text x="10" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">🟡 Thùng Vàng</text>
  </g>
</svg>
`;

// 5. Vỏ Chuối & Thức Ăn Thừa (Organic waste - Banana peel & food scraps)
const bananaSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="bgBanana" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f0fdf4"/>
      <stop offset="100%" stop-color="#bbf7d0"/>
    </linearGradient>
    <linearGradient id="peelYellow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </linearGradient>
    <linearGradient id="peelInside" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef9c3"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>
  </defs>

  <rect width="400" height="300" fill="url(#bgBanana)"/>
  <ellipse cx="200" cy="245" rx="100" ry="18" fill="#000" opacity="0.15" filter="blur(4px)"/>

  <!-- Banana Peel Graphic -->
  <g transform="translate(100, 60)">
    <!-- Crown Stem (Cuống chuối xanh nâu) -->
    <path d="M 90,65 Q 98,35 110,30 L 118,34 Q 106,42 98,70 Z" fill="#4d7c0f" stroke="#365314" stroke-width="1.5"/>

    <!-- Left Flap Peel (Vỏ rũ bên trái) -->
    <path d="M 95,70 Q 50,110 20,150 Q 5,170 30,175 Q 60,160 85,100 Z" fill="url(#peelYellow)" stroke="#a16207" stroke-width="1.5"/>
    <path d="M 85,100 Q 60,155 35,170 Q 50,165 75,130 Z" fill="url(#peelInside)"/>
    <!-- Brown Tip -->
    <circle cx="22" cy="165" r="5" fill="#713f12"/>

    <!-- Right Flap Peel (Vỏ rũ bên phải) -->
    <path d="M 105,70 Q 150,105 180,140 Q 200,160 175,170 Q 140,150 112,100 Z" fill="url(#peelYellow)" stroke="#a16207" stroke-width="1.5"/>
    <!-- Brown Tip -->
    <circle cx="185" cy="155" r="5.5" fill="#713f12"/>

    <!-- Center Hanging Flap (Vỏ trước mặt) -->
    <path d="M 95,70 Q 100,120 95,185 Q 105,195 115,180 Q 112,120 105,70 Z" fill="url(#peelYellow)" stroke="#854d0e" stroke-width="1.5"/>
    <circle cx="103" cy="188" r="6" fill="#713f12"/>

    <!-- Organic Ripening Freckles (Đốm tiêu tự nhiên) -->
    <circle cx="70" cy="120" r="2" fill="#713f12" opacity="0.6"/>
    <circle cx="65" cy="135" r="1.5" fill="#713f12" opacity="0.6"/>
    <circle cx="130" cy="115" r="2.5" fill="#713f12" opacity="0.6"/>
    <circle cx="145" cy="130" r="1.8" fill="#713f12" opacity="0.6"/>
    <circle cx="100" cy="140" r="2" fill="#713f12" opacity="0.6"/>

    <!-- Compost Green Leaf Badge -->
    <g transform="translate(135, 170)">
      <rect x="0" y="0" width="65" height="22" rx="6" fill="#15803d"/>
      <text x="32" y="15" font-family="Arial, sans-serif" font-size="8" font-weight="900" fill="#ffffff" text-anchor="middle">🍃 Ủ PHÂN COMPOST</text>
    </g>
  </g>

  <!-- Tags -->
  <g transform="translate(20, 20)">
    <rect x="0" y="0" width="180" height="28" rx="8" fill="#185a32"/>
    <text x="12" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">🍌 Vỏ Chuối &amp; Thức Ăn Thừa</text>
  </g>
  <g transform="translate(265, 20)">
    <rect x="0" y="0" width="115" height="28" rx="8" fill="#15803d"/>
    <text x="10" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">🟢 Thùng Xanh Lá</text>
  </g>
</svg>
`;

// 6. Pin Cũ Đã Qua Sử Dụng (Used AA battery - Hazardous waste)
const batterySvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="bgBattery" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff1f2"/>
      <stop offset="100%" stop-color="#fecdd3"/>
    </linearGradient>
    <linearGradient id="batGold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ca8a04"/>
      <stop offset="40%" stop-color="#fde047"/>
      <stop offset="100%" stop-color="#a16207"/>
    </linearGradient>
    <linearGradient id="batBlack" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="40%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
  </defs>

  <rect width="400" height="300" fill="url(#bgBattery)"/>
  <ellipse cx="200" cy="255" rx="80" ry="16" fill="#000" opacity="0.22" filter="blur(4px)"/>

  <!-- 3D AA Battery -->
  <g transform="translate(160, 45)">
    <!-- Positive Terminal Nub (+) -->
    <rect x="28" y="0" width="24" height="12" rx="3" fill="#e2e8f0" stroke="#64748b" stroke-width="1.5"/>
    <rect x="34" y="2" width="12" height="4" fill="#ffffff"/>

    <!-- Battery Top Shoulder (Gold Rim) -->
    <ellipse cx="40" cy="18" rx="38" ry="10" fill="url(#batGold)" stroke="#854d0e" stroke-width="1"/>

    <!-- Battery Upper Section (Gold) -->
    <rect x="2" y="18" width="76" height="50" fill="url(#batGold)" stroke="#854d0e" stroke-width="1"/>
    <!-- Plus symbol -->
    <text x="40" y="48" font-family="Arial, sans-serif" font-size="28" font-weight="900" fill="#713f12" text-anchor="middle">+</text>

    <!-- Battery Lower Section (Black Body) -->
    <rect x="2" y="68" width="76" height="125" fill="url(#batBlack)" stroke="#0f172a" stroke-width="1"/>

    <!-- Highlighting Strip -->
    <rect x="18" y="18" width="12" height="175" fill="#ffffff" opacity="0.25"/>

    <!-- Battery Brand & Warning Label -->
    <text x="40" y="98" font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="#facc15" text-anchor="middle">PIN CON THỎ</text>
    <text x="40" y="112" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#ffffff" text-anchor="middle">1.5V • SIZE AA</text>

    <!-- Hazardous Crossed Out Bin Warning Graphic -->
    <g transform="translate(24, 125)">
      <rect x="0" y="0" width="32" height="34" rx="4" fill="#b91c1c"/>
      <!-- Skull / Hazard Symbol -->
      <text x="16" y="22" font-family="Arial, sans-serif" font-size="16" text-anchor="middle">⚠️</text>
      <text x="16" y="30" font-family="Arial, sans-serif" font-size="4.5" font-weight="bold" fill="#ffffff" text-anchor="middle">RÁC NGUY HẠI</text>
    </g>

    <!-- Bottom Negative Base (-) -->
    <ellipse cx="40" cy="193" rx="38" ry="10" fill="#94a3b8" stroke="#475569" stroke-width="1.5"/>
    <text x="40" y="186" font-family="Arial, sans-serif" font-size="16" font-weight="900" fill="#ffffff" text-anchor="middle">-</text>
  </g>

  <!-- Tags -->
  <g transform="translate(20, 20)">
    <rect x="0" y="0" width="195" height="28" rx="8" fill="#991b1b"/>
    <text x="12" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">🔋 Pin Cũ (Rác Thải Nguy Hại)</text>
  </g>
  <g transform="translate(265, 20)">
    <rect x="0" y="0" width="115" height="28" rx="8" fill="#dc2626"/>
    <text x="10" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">🔴 Thùng Đỏ / Hộp Pin</text>
  </g>
</svg>
`;

// 7. Túi Ni-Lông Bẩn & Vỏ Kẹo Bánh (Dirty plastic bag & snack wrappers - Non-recyclable)
const bagSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="bgBag" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="bagPlastic" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f1f5f9" stop-opacity="0.85"/>
      <stop offset="50%" stop-color="#cbd5e1" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#94a3b8" stop-opacity="0.85"/>
    </linearGradient>
  </defs>

  <rect width="400" height="300" fill="url(#bgBag)"/>
  <ellipse cx="200" cy="250" rx="110" ry="18" fill="#000" opacity="0.16" filter="blur(4px)"/>

  <!-- Crumpled Plastic Shopping Bag -->
  <g transform="translate(100, 45)">
    <!-- Bag Handles (Quai túi xách) -->
    <path d="M 40,40 Q 30,10 50,5 Q 70,10 65,40" fill="none" stroke="#94a3b8" stroke-width="8" stroke-linecap="round"/>
    <path d="M 135,40 Q 130,10 150,5 Q 170,10 160,40" fill="none" stroke="#94a3b8" stroke-width="8" stroke-linecap="round"/>

    <!-- Bag Main Body with Folds & Wrinkles -->
    <path d="M 30,45 Q 15,100 20,180 Q 25,205 100,205 Q 175,205 180,180 Q 185,100 170,45 Q 150,55 130,45 Q 100,55 70,45 Z"
          fill="url(#bagPlastic)" stroke="#64748b" stroke-width="2"/>

    <!-- Wrinkle Crease Lines -->
    <path d="M 40,70 Q 70,90 90,75 T 150,85" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.8"/>
    <path d="M 35,110 Q 80,130 110,105 T 165,120" fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.8"/>
    <path d="M 45,150 Q 85,170 120,150 T 160,165" fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.8"/>

    <!-- Dirt / Grease Stains (Vết bẩn không tái chế được) -->
    <ellipse cx="75" cy="130" rx="15" ry="8" fill="#ca8a04" opacity="0.3"/>
    <ellipse cx="130" cy="150" rx="18" ry="10" fill="#ea580c" opacity="0.35"/>

    <!-- Non-Recyclable Notice Badge -->
    <g transform="translate(45, 100)">
      <rect x="0" y="0" width="110" height="32" rx="6" fill="#475569"/>
      <text x="55" y="15" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#ffffff" text-anchor="middle">TÚI NI-LÔNG DÙNG 1 LẦN</text>
      <text x="55" y="26" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="#fca5a5" text-anchor="middle">❌ KHÔNG TÁI CHẾ ĐƯỢC</text>
    </g>
  </g>

  <!-- Tags -->
  <g transform="translate(20, 20)">
    <rect x="0" y="0" width="165" height="28" rx="8" fill="#475569"/>
    <text x="12" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">🛍️ Túi Ni-Lông Dùng 1 Lần</text>
  </g>
  <g transform="translate(265, 20)">
    <rect x="0" y="0" width="115" height="28" rx="8" fill="#475569"/>
    <text x="10" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">⚪ Thùng Còn Lại</text>
  </g>
</svg>
`;

// 8. Hộp Xốp Đựng Cơm (Styrofoam clamshell takeout box - Non-recyclable other waste)
const foamSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="bgFoam" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="foamWhite" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </linearGradient>
    <linearGradient id="foamShadow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
  </defs>

  <rect width="400" height="300" fill="url(#bgFoam)"/>
  <ellipse cx="200" cy="250" rx="120" ry="18" fill="#000" opacity="0.16" filter="blur(4px)"/>

  <!-- 3D Open/Closed Clamshell Styrofoam Box -->
  <g transform="translate(70, 70)">
    <!-- Bottom Base Tray -->
    <polygon points="40,90 220,90 250,150 10,150" fill="url(#foamShadow)" stroke="#94a3b8" stroke-width="1.5"/>
    <polygon points="10,150 250,150 240,175 20,175" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>

    <!-- Hinged Lid (Nắp hộp xốp) -->
    <polygon points="40,90 220,90 240,20 20,20" fill="url(#foamWhite)" stroke="#94a3b8" stroke-width="1.5"/>
    <!-- Lid Ribbing & Texture -->
    <line x1="60" y1="30" x2="70" y2="80" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="100" y1="30" x2="110" y2="80" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="150" y1="30" x2="155" y2="80" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="190" y1="30" x2="195" y2="80" stroke="#e2e8f0" stroke-width="2"/>

    <!-- Latch Tab (Khóa gài) -->
    <rect x="115" y="15" width="30" height="8" rx="2" fill="#ffffff" stroke="#94a3b8" stroke-width="1"/>

    <!-- Grease / Gravy Stain Notice (Dính dầu mỡ) -->
    <ellipse cx="140" cy="120" rx="25" ry="12" fill="#f59e0b" opacity="0.25"/>

    <!-- Notice Label -->
    <g transform="translate(65, 40)">
      <rect x="0" y="0" width="130" height="28" rx="6" fill="#334155"/>
      <text x="65" y="13" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#ffffff" text-anchor="middle">HỘP XỐP EPS ĐỰNG THỨC ĂN</text>
      <text x="65" y="23" font-family="Arial, sans-serif" font-size="6.5" font-weight="bold" fill="#fca5a5" text-anchor="middle">⚠️ KHÓ PHÂN HỦY - RÁC VÔ CƠ</text>
    </g>
  </g>

  <!-- Tags -->
  <g transform="translate(20, 20)">
    <rect x="0" y="0" width="180" height="28" rx="8" fill="#475569"/>
    <text x="12" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">🍱 Hộp Xốp Đựng Cơm (EPS)</text>
  </g>
  <g transform="translate(265, 20)">
    <rect x="0" y="0" width="115" height="28" rx="8" fill="#475569"/>
    <text x="10" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">⚪ Thùng Còn Lại</text>
  </g>
</svg>
`;

// 9. Sách Giáo Khoa & Tập Vở Học Sinh Cũ (Giấy Tái Chế - Thùng Vàng)
const bookSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="bgBook" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#eff6ff"/>
      <stop offset="100%" stop-color="#dbeafe"/>
    </linearGradient>
    <linearGradient id="bookCover" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1d4ed8"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#bgBook)"/>
  <ellipse cx="200" cy="250" rx="120" ry="18" fill="#000" opacity="0.16" filter="blur(4px)"/>

  <!-- Stack of Books & Notebooks -->
  <g transform="translate(90, 75)">
    <!-- Bottom Book -->
    <rect x="10" y="110" width="200" height="30" rx="4" fill="#059669" stroke="#047857" stroke-width="2"/>
    <path d="M 205 112 L 218 118 L 218 136 L 205 138 Z" fill="#f8fafc" stroke="#cbd5e1"/>
    <!-- Middle Notebook -->
    <rect x="20" y="75" width="185" height="32" rx="4" fill="#d97706" stroke="#b45309" stroke-width="2"/>
    <path d="M 195 78 L 212 84 L 212 102 L 195 104 Z" fill="#f8fafc" stroke="#cbd5e1"/>
    <!-- Top Open/Closed Textbook -->
    <rect x="15" y="30" width="190" height="42" rx="5" fill="url(#bookCover)" stroke="#172554" stroke-width="2"/>
    <rect x="35" y="42" width="150" height="20" rx="3" fill="#ffffff" opacity="0.95"/>
    <text x="110" y="56" font-family="Arial, sans-serif" font-size="9" font-weight="black" fill="#1e3a8a" text-anchor="middle">SÁCH GIÁO KHOA SA PA</text>
    <!-- Paper Spine Lines -->
    <line x1="28" y1="30" x2="28" y2="72" stroke="#60a5fa" stroke-width="2"/>
  </g>

  <!-- Tags -->
  <g transform="translate(20, 20)">
    <rect x="0" y="0" width="185" height="28" rx="8" fill="#185a32"/>
    <text x="12" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">📚 Sách Giáo Khoa &amp; Vở Cũ</text>
  </g>
  <g transform="translate(275, 20)">
    <rect x="0" y="0" width="105" height="28" rx="8" fill="#ca8a04"/>
    <text x="10" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">🟡 Thùng Vàng</text>
  </g>
</svg>
`;

// 10. Vỏ Bút Bi Hết Mực & Ruột Bút (Rác Vô Cơ Còn Lại - Thùng Xám/Cam)
const penSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="bgPen" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </linearGradient>
    <linearGradient id="penBody" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="50%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#bgPen)"/>
  <ellipse cx="200" cy="245" rx="130" ry="14" fill="#000" opacity="0.14" filter="blur(4px)"/>

  <!-- Ballpoint Pen & Empty Refill -->
  <g transform="translate(50, 110) rotate(-15)">
    <!-- Pen Barrel -->
    <rect x="30" y="50" width="220" height="16" rx="8" fill="url(#penBody)" stroke="#0369a1" stroke-width="1.5"/>
    <!-- Clear Window / Empty ink indicator -->
    <rect x="90" y="54" width="70" height="8" rx="4" fill="#ffffff" opacity="0.45"/>
    <line x1="95" y1="58" x2="155" y2="58" stroke="#ef4444" stroke-width="2" stroke-dasharray="3,3"/>
    <!-- Pen Tip (Cone) -->
    <polygon points="30,50 10,58 30,66" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/>
    <circle cx="10" cy="58" r="2" fill="#f59e0b"/>
    <!-- Pen Clicker / Cap Clip -->
    <rect x="250" y="48" width="24" height="20" rx="3" fill="#0284c7" stroke="#0369a1" stroke-width="1.5"/>
    <path d="M 230 48 L 260 48 L 260 40 L 220 40 L 220 50" fill="#0284c7" stroke="#0369a1" stroke-width="1.5"/>

    <!-- Separate Empty Refill below -->
    <rect x="40" y="85" width="200" height="5" rx="2" fill="#e2e8f0" stroke="#94a3b8"/>
    <polygon points="40,84 25,87.5 40,91" fill="#cbd5e1"/>
    <text x="140" y="105" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#64748b" text-anchor="middle">RUỘT BÚT BI HẾT MỰC</text>
  </g>

  <!-- Tags -->
  <g transform="translate(20, 20)">
    <rect x="0" y="0" width="185" height="28" rx="8" fill="#475569"/>
    <text x="12" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">🖊️ Vỏ Bút Bi &amp; Ruột Hết Mực</text>
  </g>
  <g transform="translate(265, 20)">
    <rect x="0" y="0" width="115" height="28" rx="8" fill="#475569"/>
    <text x="10" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">⚪ Thùng Còn Lại</text>
  </g>
</svg>
`;

// 11. Thước Kẻ Học Sinh (Nhựa Mica - Rác Vô Cơ Còn Lại - Thùng Xám/Cam)
const rulerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="bgRuler" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fdf4ff"/>
      <stop offset="100%" stop-color="#fae8ff"/>
    </linearGradient>
    <linearGradient id="rulerBody" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="50%" stop-color="#e9d5ff"/>
      <stop offset="100%" stop-color="#c084fc"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#bgRuler)"/>
  <ellipse cx="200" cy="240" rx="140" ry="15" fill="#000" opacity="0.14" filter="blur(4px)"/>

  <!-- Ruler Plastic Scale -->
  <g transform="translate(50, 110) rotate(10)">
    <rect x="0" y="20" width="280" height="50" rx="6" fill="url(#rulerBody)" stroke="#a855f7" stroke-width="2" opacity="0.9"/>
    <!-- Ruler Graduation Hash Marks (Centimeters & Millimeters) -->
    <line x1="20" y1="20" x2="20" y2="40" stroke="#7e22ce" stroke-width="2"/>
    <text x="20" y="52" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#7e22ce" text-anchor="middle">0</text>
    <line x1="45" y1="20" x2="45" y2="32" stroke="#7e22ce" stroke-width="1.5"/>
    <line x1="70" y1="20" x2="70" y2="40" stroke="#7e22ce" stroke-width="2"/>
    <text x="70" y="52" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#7e22ce" text-anchor="middle">5</text>
    <line x1="95" y1="20" x2="95" y2="32" stroke="#7e22ce" stroke-width="1.5"/>
    <line x1="120" y1="20" x2="120" y2="40" stroke="#7e22ce" stroke-width="2"/>
    <text x="120" y="52" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#7e22ce" text-anchor="middle">10</text>
    <line x1="145" y1="20" x2="145" y2="32" stroke="#7e22ce" stroke-width="1.5"/>
    <line x1="170" y1="20" x2="170" y2="40" stroke="#7e22ce" stroke-width="2"/>
    <text x="170" y="52" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#7e22ce" text-anchor="middle">15</text>
    <line x1="195" y1="20" x2="195" y2="32" stroke="#7e22ce" stroke-width="1.5"/>
    <line x1="220" y1="20" x2="220" y2="40" stroke="#7e22ce" stroke-width="2"/>
    <text x="220" y="52" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#7e22ce" text-anchor="middle">20</text>

    <!-- School Brand Label on Ruler -->
    <text x="140" y="65" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#6b21a8" text-anchor="middle">THƯỚC KẺ HỌC SINH 20CM - NHỰA MICA</text>
  </g>

  <!-- Tags -->
  <g transform="translate(20, 20)">
    <rect x="0" y="0" width="180" height="28" rx="8" fill="#475569"/>
    <text x="12" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">📐 Thước Kẻ Học Sinh (Nhựa)</text>
  </g>
  <g transform="translate(265, 20)">
    <rect x="0" y="0" width="115" height="28" rx="8" fill="#475569"/>
    <text x="10" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">⚪ Thùng Còn Lại</text>
  </g>
</svg>
`;

// 12. Đồ Điện Tử, Cáp Sạc & Tai Nghe Hỏng (Rác Nguy Hại / E-Waste - Thùng Đỏ)
const electronicsSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="bgElec" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef2f2"/>
      <stop offset="100%" stop-color="#fee2e2"/>
    </linearGradient>
    <linearGradient id="mouseBody" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#bgElec)"/>
  <ellipse cx="200" cy="245" rx="120" ry="16" fill="#000" opacity="0.16" filter="blur(4px)"/>

  <!-- Computer Mouse & USB Cable -->
  <g transform="translate(100, 70)">
    <!-- USB Cable coiled -->
    <path d="M 90 90 C 40 40, 20 120, 70 140 C 120 160, 160 80, 180 50" fill="none" stroke="#64748b" stroke-width="4.5" stroke-linecap="round"/>
    <!-- USB Plug Head -->
    <rect x="175" y="35" width="22" height="15" rx="3" fill="#94a3b8" stroke="#475569"/>
    <rect x="195" y="39" width="8" height="7" fill="#cbd5e1"/>

    <!-- Mouse Body -->
    <path d="M 65 95 C 65 60, 125 60, 125 95 L 125 150 C 125 175, 65 175, 65 150 Z" fill="url(#mouseBody)" stroke="#0f172a" stroke-width="2"/>
    <!-- Mouse Wheel -->
    <line x1="95" y1="65" x2="95" y2="105" stroke="#334155" stroke-width="1.5"/>
    <rect x="92" y="75" width="6" height="14" rx="3" fill="#e2e8f0"/>

    <!-- Warning / E-Waste Label -->
    <rect x="35" y="15" width="130" height="24" rx="5" fill="#b91c1c"/>
    <text x="100" y="31" font-family="Arial, sans-serif" font-size="7.5" font-weight="black" fill="#ffffff" text-anchor="middle">⚡ RÁC ĐIỆN TỬ E-WASTE</text>
  </g>

  <!-- Tags -->
  <g transform="translate(20, 20)">
    <rect x="0" y="0" width="195" height="28" rx="8" fill="#b91c1c"/>
    <text x="12" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">🎧 Đồ Điện Tử &amp; Cáp Sạc Hỏng</text>
  </g>
  <g transform="translate(285, 20)">
    <rect x="0" y="0" width="95" height="28" rx="8" fill="#b91c1c"/>
    <text x="10" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">🔴 Thùng Đỏ</text>
  </g>
</svg>
`;

// 13. Vỏ Bao Bì Bánh Quy & Gói Bim Bim (Màng Nhôm Đa Lớp - Thùng Xám/Cam)
const cakeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="bgCake" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="100%" stop-color="#fef3c7"/>
    </linearGradient>
    <linearGradient id="snackBag" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ea580c"/>
      <stop offset="50%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#c2410c"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#bgCake)"/>
  <ellipse cx="200" cy="245" rx="110" ry="16" fill="#000" opacity="0.16" filter="blur(4px)"/>

  <!-- Metallic Foil Snack / Cake Bag -->
  <g transform="translate(110, 70)">
    <!-- Crinkled Pouch Shape -->
    <path d="M 20 30 Q 90 20 160 30 L 175 160 Q 90 170 5 160 Z" fill="url(#snackBag)" stroke="#9a3412" stroke-width="2"/>
    <!-- Top & Bottom Zig-Zag Crimping -->
    <line x1="20" y1="30" x2="160" y2="30" stroke="#7c2d12" stroke-width="4" stroke-dasharray="4,2"/>
    <line x1="5" y1="160" x2="175" y2="160" stroke="#7c2d12" stroke-width="4" stroke-dasharray="4,2"/>
    <!-- Metallic Foil Sheen -->
    <path d="M 45 40 Q 80 80 120 45" fill="none" stroke="#fed7aa" stroke-width="3" opacity="0.6"/>
    <path d="M 35 90 Q 75 130 145 100" fill="none" stroke="#fed7aa" stroke-width="3" opacity="0.6"/>
    <!-- Graphic Text / Biscuit Label -->
    <rect x="35" y="75" width="110" height="38" rx="6" fill="#ffffff" opacity="0.95"/>
    <text x="90" y="93" font-family="Arial, sans-serif" font-size="9.5" font-weight="black" fill="#c2410c" text-anchor="middle">SNACK BÁNH QUY</text>
    <text x="90" y="105" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="#78350f" text-anchor="middle">MÀNG NHÔM ĐA LỚP</text>
  </g>

  <!-- Tags -->
  <g transform="translate(20, 20)">
    <rect x="0" y="0" width="180" height="28" rx="8" fill="#475569"/>
    <text x="12" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">🥐 Vỏ Bánh Quy &amp; Bim Bim</text>
  </g>
  <g transform="translate(265, 20)">
    <rect x="0" y="0" width="115" height="28" rx="8" fill="#475569"/>
    <text x="10" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">⚪ Thùng Còn Lại</text>
  </g>
</svg>
`;

// 14. Vỏ Kẹo Mút & Giấy Gói Kẹo (Nhựa Màng Mỏng - Thùng Xám/Cam)
const candySvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="bgCandy" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff1f2"/>
      <stop offset="100%" stop-color="#ffe4e6"/>
    </linearGradient>
    <linearGradient id="candyWrap" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e11d48"/>
      <stop offset="50%" stop-color="#fb7185"/>
      <stop offset="100%" stop-color="#be123c"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#bgCandy)"/>
  <ellipse cx="200" cy="245" rx="100" ry="14" fill="#000" opacity="0.14" filter="blur(4px)"/>

  <!-- Lollipop Stick & Twisted Candy Wrapper -->
  <g transform="translate(100, 80)">
    <!-- Candy Plastic Stick -->
    <rect x="130" y="60" width="6" height="110" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>

    <!-- Twisted Wrapper Ends (Left & Right Flaps) -->
    <polygon points="40,40 10,25 20,55 5,80 40,65" fill="#f43f5e" stroke="#be123c"/>
    <polygon points="120,40 150,25 140,55 155,80 120,65" fill="#f43f5e" stroke="#be123c"/>

    <!-- Central Round Candy Bubble -->
    <circle cx="80" cy="55" r="38" fill="url(#candyWrap)" stroke="#9f1239" stroke-width="2"/>
    <!-- Swirl pattern on lollipop wrapper -->
    <path d="M 80 55 Q 60 40 70 25 M 80 55 Q 100 40 90 25 M 80 55 Q 70 75 60 80 M 80 55 Q 95 75 105 70" stroke="#ffffff" stroke-width="2.5" fill="none" opacity="0.8"/>

    <!-- Label -->
    <rect x="25" y="115" width="115" height="22" rx="4" fill="#881337"/>
    <text x="82" y="130" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#ffffff" text-anchor="middle">VỎ KẸO MÚT &amp; QUE NHỰA</text>
  </g>

  <!-- Tags -->
  <g transform="translate(20, 20)">
    <rect x="0" y="0" width="175" height="28" rx="8" fill="#475569"/>
    <text x="12" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">🍬 Vỏ Kẹo &amp; Que Nhựa</text>
  </g>
  <g transform="translate(265, 20)">
    <rect x="0" y="0" width="115" height="28" rx="8" fill="#475569"/>
    <text x="10" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">⚪ Thùng Còn Lại</text>
  </g>
</svg>
`;

// 15. Vật Liệu Bằng Sắt Thép, Đinh Ốc & Ghim Bấm (Kim Loại Tái Chế - Thùng Vàng)
const steelSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="bgSteel" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="steelMetal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#94a3b8"/>
      <stop offset="50%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#64748b"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#bgSteel)"/>
  <ellipse cx="200" cy="245" rx="125" ry="16" fill="#000" opacity="0.16" filter="blur(4px)"/>

  <!-- Steel Nails, Bolts, Screws & Staples -->
  <g transform="translate(100, 75)">
    <!-- Steel Bolt (Bu-lông sắt) -->
    <g transform="translate(10, 30) rotate(25)">
      <!-- Hex Head -->
      <polygon points="25,5 35,0 45,5 45,15 35,20 25,15" fill="url(#steelMetal)" stroke="#334155" stroke-width="1.5"/>
      <!-- Threaded Shank -->
      <rect x="30" y="18" width="10" height="65" fill="url(#steelMetal)" stroke="#334155" stroke-width="1.5"/>
      <!-- Screw Threads -->
      <line x1="30" y1="35" x2="40" y2="35" stroke="#475569" stroke-width="2"/>
      <line x1="30" y1="45" x2="40" y2="45" stroke="#475569" stroke-width="2"/>
      <line x1="30" y1="55" x2="40" y2="55" stroke="#475569" stroke-width="2"/>
      <line x1="30" y1="65" x2="40" y2="65" stroke="#475569" stroke-width="2"/>
      <line x1="30" y1="75" x2="40" y2="75" stroke="#475569" stroke-width="2"/>
    </g>

    <!-- Large Steel Nail (Đinh sắt) -->
    <g transform="translate(70, 20) rotate(-35)">
      <!-- Flat Head -->
      <ellipse cx="20" cy="10" rx="12" ry="4" fill="#cbd5e1" stroke="#334155" stroke-width="1.5"/>
      <!-- Pointed Shank -->
      <polygon points="17,12 23,12 21,95 20,105 19,95" fill="url(#steelMetal)" stroke="#334155" stroke-width="1.5"/>
    </g>

    <!-- Office Staples / Paperclips (Ghim bấm & Kẹp sắt) -->
    <rect x="120" y="70" width="35" height="12" rx="2" fill="none" stroke="#64748b" stroke-width="3"/>
    <rect x="110" y="90" width="45" height="12" rx="2" fill="none" stroke="#64748b" stroke-width="3"/>

    <!-- Magnet Icon Showing Magnetic Recyclable Property -->
    <g transform="translate(130, 115)">
      <path d="M 0 0 C 0 25, 30 25, 30 0" fill="none" stroke="#ef4444" stroke-width="6"/>
      <rect x="-3" y="-8" width="6" height="8" fill="#3b82f6"/>
      <rect x="27" y="-8" width="6" height="8" fill="#3b82f6"/>
    </g>
  </g>

  <!-- Tags -->
  <g transform="translate(20, 20)">
    <rect x="0" y="0" width="190" height="28" rx="8" fill="#185a32"/>
    <text x="12" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">🔩 Sắt Thép, Đinh Ốc &amp; Ghim</text>
  </g>
  <g transform="translate(275, 20)">
    <rect x="0" y="0" width="105" height="28" rx="8" fill="#ca8a04"/>
    <text x="10" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">🟡 Thùng Vàng</text>
  </g>
</svg>
`;

// 16. Túi Giấy Kraft & Túi Quà Tặng (Giấy Tái Chế - Thùng Vàng)
const paperBagSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="bgPaperBag" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fdfbf7"/>
      <stop offset="100%" stop-color="#f5ede3"/>
    </linearGradient>
    <linearGradient id="kraftFront" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#d4a373"/>
      <stop offset="100%" stop-color="#bc8a5f"/>
    </linearGradient>
    <linearGradient id="kraftSide" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#a9714b"/>
      <stop offset="100%" stop-color="#8f563b"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#bgPaperBag)"/>
  <ellipse cx="200" cy="255" rx="120" ry="16" fill="#000" opacity="0.14" filter="blur(4px)"/>

  <!-- Paper Bag Body -->
  <g transform="translate(100, 60)">
    <!-- Twine Handles -->
    <path d="M 50 30 C 50 -15, 85 -15, 85 30" fill="none" stroke="#78350f" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M 115 30 C 115 -15, 150 -15, 150 30" fill="none" stroke="#78350f" stroke-width="4.5" stroke-linecap="round"/>

    <!-- Bag Side Gusset -->
    <polygon points="150,30 185,50 185,185 150,165" fill="url(#kraftSide)" stroke="#78350f" stroke-width="1.5"/>

    <!-- Bag Front Face -->
    <polygon points="15,30 150,30 150,165 15,165" fill="url(#kraftFront)" stroke="#78350f" stroke-width="1.5"/>

    <!-- Serrated Top Edge -->
    <line x1="15" y1="30" x2="150" y2="30" stroke="#a9714b" stroke-width="2" stroke-dasharray="3,2"/>

    <!-- Eco Leaf Logo & Printed Brand Text -->
    <circle cx="82" cy="78" r="22" fill="#15803d" opacity="0.9"/>
    <path d="M 82 66 C 94 66, 94 85, 82 90 C 70 85, 70 66, 82 66 Z" fill="#ffffff"/>
    <line x1="82" y1="70" x2="82" y2="88" stroke="#15803d" stroke-width="1.5"/>

    <text x="82" y="112" font-family="Arial, sans-serif" font-size="10" font-weight="black" fill="#451a03" text-anchor="middle">SA PA ECO BAG</text>
    <text x="82" y="125" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="#15803d" text-anchor="middle">100% RECYCLABLE KRAFT</text>
    <text x="82" y="136" font-family="Arial, sans-serif" font-size="6.5" font-weight="bold" fill="#78350f" text-anchor="middle">TÚI GIẤY BẢO VỆ MÔI TRƯỜNG</text>

    <!-- Barcode at bottom -->
    <g transform="translate(45, 145)">
      <rect x="0" y="0" width="75" height="12" fill="#ffffff" opacity="0.9"/>
      <line x1="5" y1="2" x2="5" y2="10" stroke="#000" stroke-width="1.5"/>
      <line x1="10" y1="2" x2="10" y2="10" stroke="#000" stroke-width="2"/>
      <line x1="16" y1="2" x2="16" y2="10" stroke="#000" stroke-width="1"/>
      <line x1="22" y1="2" x2="22" y2="10" stroke="#000" stroke-width="2.5"/>
      <line x1="30" y1="2" x2="30" y2="10" stroke="#000" stroke-width="1"/>
      <line x1="36" y1="2" x2="36" y2="10" stroke="#000" stroke-width="2"/>
      <line x1="44" y1="2" x2="44" y2="10" stroke="#000" stroke-width="1.5"/>
      <line x1="52" y1="2" x2="52" y2="10" stroke="#000" stroke-width="2"/>
      <line x1="60" y1="2" x2="60" y2="10" stroke="#000" stroke-width="1"/>
      <line x1="68" y1="2" x2="68" y2="10" stroke="#000" stroke-width="2"/>
    </g>
  </g>

  <!-- Tags -->
  <g transform="translate(20, 20)">
    <rect x="0" y="0" width="185" height="28" rx="8" fill="#185a32"/>
    <text x="12" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">🛍️ Túi Giấy (Kraft &amp; Quà)</text>
  </g>
  <g transform="translate(275, 20)">
    <rect x="0" y="0" width="105" height="28" rx="8" fill="#ca8a04"/>
    <text x="10" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">🟡 Thùng Vàng</text>
  </g>
</svg>
`;

// 17. Giấy Vệ Sinh & Khăn Giấy (Rác Vô Cơ Còn Lại - Thùng Xám/Cam; Lõi Bìa Bỏ Thùng Vàng)
const toiletPaperSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="bgTP" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="rollWhite" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="tubeCardboard" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#bgTP)"/>
  <ellipse cx="200" cy="250" rx="115" ry="15" fill="#000" opacity="0.14" filter="blur(4px)"/>

  <!-- Toilet Paper Roll -->
  <g transform="translate(110, 60)">
    <!-- Main Cylinder Body -->
    <path d="M 30 50 L 30 150 C 30 175, 150 175, 150 150 L 150 50 Z" fill="url(#rollWhite)" stroke="#cbd5e1" stroke-width="2"/>

    <!-- Top Ellipse (Top Face of Roll) -->
    <ellipse cx="90" cy="50" rx="60" ry="25" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>

    <!-- Inner Cardboard Tube Hole -->
    <ellipse cx="90" cy="50" rx="22" ry="9" fill="url(#tubeCardboard)" stroke="#451a03" stroke-width="1.5"/>
    <ellipse cx="90" cy="52" rx="18" ry="7" fill="#311505"/>

    <!-- Unrolled Tail of Toilet Paper Hanging -->
    <path d="M 30 110 C 10 130, 5 160, 10 185 L 65 185 C 55 160, 50 130, 45 110 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
    <line x1="10" y1="185" x2="65" y2="185" stroke="#94a3b8" stroke-dasharray="3,3" stroke-width="1.5"/>

    <!-- Embossed Feather Pattern on Surface -->
    <g stroke="#cbd5e1" stroke-width="1" fill="none" opacity="0.6">
      <path d="M 45 80 Q 55 85 65 80"/>
      <path d="M 80 85 Q 90 90 100 85"/>
      <path d="M 115 80 Q 125 85 135 80"/>
      <path d="M 50 120 Q 60 125 70 120"/>
      <path d="M 85 125 Q 95 130 105 125"/>
    </g>

    <!-- Product Branding Label -->
    <rect x="42" y="92" width="96" height="34" rx="4" fill="#0284c7" opacity="0.92"/>
    <text x="90" y="106" font-family="Arial, sans-serif" font-size="8.5" font-weight="black" fill="#ffffff" text-anchor="middle">WATERSILK SA PA</text>
    <text x="90" y="116" font-family="Arial, sans-serif" font-size="6.5" font-weight="bold" fill="#e0f2fe" text-anchor="middle">3 LỚP MỀM MỊN • 100% BỘT GIẤY</text>
  </g>

  <!-- Tags -->
  <g transform="translate(20, 20)">
    <rect x="0" y="0" width="185" height="28" rx="8" fill="#475569"/>
    <text x="12" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">🧻 Giấy Vệ Sinh &amp; Khăn Giấy</text>
  </g>
  <g transform="translate(265, 20)">
    <rect x="0" y="0" width="115" height="28" rx="8" fill="#475569"/>
    <text x="10" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">⚪ Thùng Còn Lại</text>
  </g>
</svg>
`;

// 18. Vở Viết Học Sinh Kẻ Ô Ly (Giấy Tái Chế - Thùng Vàng)
const notebookSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="bgNotebook" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#eff6ff"/>
      <stop offset="100%" stop-color="#dbeafe"/>
    </linearGradient>
    <linearGradient id="nbCover" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="50%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#bgNotebook)"/>
  <ellipse cx="200" cy="250" rx="125" ry="16" fill="#000" opacity="0.15" filter="blur(4px)"/>

  <!-- Student Grid Notebook 4-Ly -->
  <g transform="translate(85, 45) rotate(-3)">
    <!-- Book Pages Edge (White Thickness) -->
    <polygon points="215,30 230,38 230,195 215,188" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
    <!-- Bottom Pages Edge -->
    <polygon points="15,188 215,188 230,195 30,195" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="1.5"/>

    <!-- Front Notebook Cover -->
    <rect x="15" y="25" width="200" height="165" rx="6" fill="url(#nbCover)" stroke="#1e40af" stroke-width="2"/>

    <!-- Spine Binding Ribbon (Left) -->
    <rect x="15" y="25" width="22" height="165" rx="3" fill="#1e3a8a"/>
    <line x1="26" y1="35" x2="26" y2="180" stroke="#93c5fd" stroke-width="1.5" stroke-dasharray="4,4"/>

    <!-- School Label Badge on Cover -->
    <rect x="52" y="55" width="145" height="100" rx="6" fill="#ffffff" stroke="#2563eb" stroke-width="2"/>
    <rect x="56" y="59" width="137" height="92" rx="4" fill="none" stroke="#93c5fd" stroke-width="1"/>

    <text x="124" y="74" font-family="Arial, sans-serif" font-size="8.5" font-weight="black" fill="#1e3a8a" text-anchor="middle">TRƯỜNG TIỂU HỌC SA PA</text>
    <text x="124" y="87" font-family="Arial, sans-serif" font-size="9" font-weight="black" fill="#dc2626" text-anchor="middle">VỞ BÀI TẬP Ô LY (4 LY)</text>

    <!-- Student Lines on Label -->
    <text x="65" y="103" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#334155">Họ và tên: <tspan fill="#0f172a">Bùi Minh Triết</tspan></text>
    <line x1="105" y1="104" x2="182" y2="104" stroke="#94a3b8" stroke-dasharray="2,2"/>

    <text x="65" y="117" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#334155">Lớp: <tspan fill="#0f172a">3A1</tspan> — Năm học: 2025-2026</text>
    <line x1="85" y1="118" x2="182" y2="118" stroke="#94a3b8" stroke-dasharray="2,2"/>

    <text x="65" y="131" font-family="Arial, sans-serif" font-size="7.5" font-weight="bold" fill="#334155">Môn: <tspan fill="#0f172a">Tiếng Việt &amp; Toán</tspan></text>
    <line x1="88" y1="132" x2="182" y2="132" stroke="#94a3b8" stroke-dasharray="2,2"/>

    <!-- Grade & Page Specs -->
    <rect x="65" y="138" width="118" height="12" rx="3" fill="#f1f5f9"/>
    <text x="124" y="147" font-family="Arial, sans-serif" font-size="6.5" font-weight="bold" fill="#1e40af" text-anchor="middle">96 TRANG • ĐỘ TRẮNG 90-92% ISO</text>
  </g>

  <!-- Tags -->
  <g transform="translate(20, 20)">
    <rect x="0" y="0" width="190" height="28" rx="8" fill="#185a32"/>
    <text x="12" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">📓 Vở Viết Học Sinh (Kẻ Ô Ly)</text>
  </g>
  <g transform="translate(275, 20)">
    <rect x="0" y="0" width="105" height="28" rx="8" fill="#ca8a04"/>
    <text x="10" y="18" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff">🟡 Thùng Vàng</text>
  </g>
</svg>
`;

export const SAMPLE_WASTE_ITEMS: SampleWasteItem[] = [
  {
    id: 'paper_bag',
    label: 'Túi giấy (Kraft & Quà tặng)',
    icon: '🛍️',
    hint: 'Túi giấy đựng quà & Túi kraft xi măng có quai xách',
    category: 'recyclable',
    binColor: 'yellow',
    binName: 'Thùng Vàng (Tái chế)',
    sampleImage: svgToDataUrl(paperBagSvg),
  },
  {
    id: 'bag',
    label: 'Túi ni-lông dùng 1 lần',
    icon: '🛍️',
    hint: 'Túi ni-lông dùng 1 lần & Túi bóng hàng chợ (Rác vô cơ)',
    category: 'other',
    binColor: 'gray',
    binName: 'Thùng Trắng/Xám (Còn lại)',
    sampleImage: svgToDataUrl(bagSvg),
  },
  {
    id: 'toilet_paper',
    label: 'Giấy vệ sinh & Khăn giấy',
    icon: '🧻',
    hint: 'Cuộn giấy vệ sinh, lõi giấy & Khăn giấy lau tay',
    category: 'other',
    binColor: 'gray',
    binName: 'Thùng Trắng/Xám (Còn lại)',
    sampleImage: svgToDataUrl(toiletPaperSvg),
  },
  {
    id: 'notebook',
    label: 'Vở viết học sinh (Kẻ ô ly)',
    icon: '📓',
    hint: 'Vở viết học sinh kẻ ô ly 4 ly (Vở bài tập cũ)',
    category: 'recyclable',
    binColor: 'yellow',
    binName: 'Thùng Vàng (Tái chế)',
    sampleImage: svgToDataUrl(notebookSvg),
  },
  {
    id: 'book',
    label: 'Sách giáo khoa & Sách truyện',
    icon: '📚',
    hint: 'Sách giáo khoa & Sách truyện cũ',
    category: 'recyclable',
    binColor: 'yellow',
    binName: 'Thùng Vàng (Tái chế)',
    sampleImage: svgToDataUrl(bookSvg),
  },
  {
    id: 'pen',
    label: 'Vỏ bút bi & Ruột bút',
    icon: '🖊️',
    hint: 'Vỏ bút bi hết mực & Ruột bút học sinh',
    category: 'other',
    binColor: 'gray',
    binName: 'Thùng Trắng/Xám (Còn lại)',
    sampleImage: svgToDataUrl(penSvg),
  },
  {
    id: 'ruler',
    label: 'Thước kẻ học sinh',
    icon: '📐',
    hint: 'Thước kẻ học sinh (Thước nhựa mica)',
    category: 'other',
    binColor: 'gray',
    binName: 'Thùng Trắng/Xám (Còn lại)',
    sampleImage: svgToDataUrl(rulerSvg),
  },
  {
    id: 'electronics',
    label: 'Đồ điện tử, sạc & tai nghe',
    icon: '🎧',
    hint: 'Đồ điện tử, dây cáp sạc & Phụ kiện hỏng (Rác điện tử E-waste)',
    category: 'hazardous',
    binColor: 'red',
    binName: 'Thùng Đỏ (Nguy hại / E-Waste)',
    sampleImage: svgToDataUrl(electronicsSvg),
  },
  {
    id: 'cake',
    label: 'Vỏ bánh quy & Gói bim bim',
    icon: '🥐',
    hint: 'Vỏ bao bì bánh quy & Gói bim bim màng nhôm đa lớp',
    category: 'other',
    binColor: 'gray',
    binName: 'Thùng Trắng/Xám (Còn lại)',
    sampleImage: svgToDataUrl(cakeSvg),
  },
  {
    id: 'candy',
    label: 'Vỏ kẹo mút & Que kẹo',
    icon: '🍬',
    hint: 'Vỏ kẹo ngọt & Giấy gói kẹo dính đường (Rác vô cơ)',
    category: 'other',
    binColor: 'gray',
    binName: 'Thùng Trắng/Xám (Còn lại)',
    sampleImage: svgToDataUrl(candySvg),
  },
  {
    id: 'steel',
    label: 'Sắt thép, đinh ốc & Ghim',
    icon: '🔩',
    hint: 'Vật liệu bằng sắt thép, đinh ốc vít & Ghim bấm (Kim loại tái chế)',
    category: 'recyclable',
    binColor: 'yellow',
    binName: 'Thùng Vàng (Tái chế)',
    sampleImage: svgToDataUrl(steelSvg),
  },
  {
    id: 'carton',
    label: 'Bìa carton & Thùng giấy',
    icon: '📦',
    hint: 'Thùng bìa carton & Giấy tái chế',
    category: 'recyclable',
    binColor: 'yellow',
    binName: 'Thùng Vàng (Tái chế)',
    sampleImage: svgToDataUrl(cartonSvg),
  },
  {
    id: 'milk',
    label: 'Vỏ hộp sữa học đường',
    icon: '🧃',
    hint: 'Vỏ hộp sữa học đường (Tetra Pak)',
    category: 'recyclable',
    binColor: 'yellow',
    binName: 'Thùng Vàng (Tái chế)',
    sampleImage: svgToDataUrl(milkSvg),
  },
  {
    id: 'bottle',
    label: 'Chai nước khoáng Sa Pa',
    icon: '🍾',
    hint: 'Vỏ chai nước khoáng Sa Pa (Nhựa PET)',
    category: 'recyclable',
    binColor: 'yellow',
    binName: 'Thùng Vàng (Tái chế)',
    sampleImage: svgToDataUrl(bottleSvg),
  },
  {
    id: 'can',
    label: 'Vỏ lon nhôm nước ngọt',
    icon: '🥫',
    hint: 'Vỏ lon nước ngọt bằng nhôm',
    category: 'recyclable',
    binColor: 'yellow',
    binName: 'Thùng Vàng (Tái chế)',
    sampleImage: svgToDataUrl(canSvg),
  },
  {
    id: 'banana',
    label: 'Vỏ chuối & thức ăn thừa',
    icon: '🍌',
    hint: 'Vỏ quả chuối & Rác hữu cơ nhà bếp',
    category: 'organic',
    binColor: 'green',
    binName: 'Thùng Xanh (Hữu cơ)',
    sampleImage: svgToDataUrl(bananaSvg),
  },
  {
    id: 'battery',
    label: 'Pin cũ (Rác nguy hại)',
    icon: '🔋',
    hint: 'Cục pin tiểu con thỏ hết điện (Rác nguy hại)',
    category: 'hazardous',
    binColor: 'red',
    binName: 'Thùng Đỏ (Nguy hại)',
    sampleImage: svgToDataUrl(batterySvg),
  },
  {
    id: 'foam',
    label: 'Hộp xốp đựng cơm (EPS)',
    icon: '🍱',
    hint: 'Hộp xốp đựng cơm (Rác vô cơ còn lại)',
    category: 'other',
    binColor: 'gray',
    binName: 'Thùng Trắng/Xám (Còn lại)',
    sampleImage: svgToDataUrl(foamSvg),
  },
];
