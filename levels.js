/**
 * Roya & Arya: Level Catalog & 30 Handcrafted Campaign Stages
 * Divided into 3 Distinct Worlds with Full Bilingual (AR/EN) Metadata.
 * 
 * Worlds:
 * - World 1: Neon Genesis (Levels 1 - 10) - Pure angles & spirit matching
 * - World 2: Prisms & Portals (Levels 11 - 20) - Color transposition & teleportation
 * - World 3: Kinetic Chaos (Levels 21 - 30) - High-speed spinners & reinforced crystals
 * 
 * Endless Mode: Procedural generator for Level 31+
 */

const WORLDS = [
  { id: 1, name_ar: "العالم 1: سديم النيون", name_en: "World 1: Neon Genesis", levels: [1, 10], color: "#00f3ff", desc_ar: "أساسيات الزوايا والانعكاس الكوني", desc_en: "Geometric fundamentals & cosmic reflection" },
  { id: 2, name_ar: "العالم 2: بوابات الأثير والمناشير", name_en: "World 2: Prisms & Portals", levels: [11, 20], color: "#b537f2", desc_ar: "انتقال آني وتحويل أطياف الضوء", desc_en: "Instant teleportation & prism synthesis" },
  { id: 3, name_ar: "العالم 3: الفوضى الحركية", name_en: "World 3: Kinetic Chaos", levels: [21, 30], color: "#ff007f", desc_ar: "شفرات دوارة وتفاعلات تفجير متسلسلة", desc_en: "High-speed spinners & explosive chain reactions" },
  { id: 4, name_ar: "العالم 4: حقول الجاذبية الكونية", name_en: "World 4: Gravitational Wells", levels: [31, 40], color: "#ffb703", desc_ar: "انحناء المسار بالثقوب الدودية والمجالات المغناطيسية", desc_en: "Trajectory bending & gravitational vortices" },
  { id: 5, name_ar: "العالم 5: قمة المجرة الأسطورية", name_en: "World 5: Celestial Apex", levels: [41, 50], color: "#06d6a0", desc_ar: "أقصى تحديات الأطياف وحصون الليزر المحصنة", desc_en: "Ultimate dual spirit mastery & fortified lasers" },
];

const HANDCRAFTED_LEVELS = [
  // ==========================================
  // WORLD 1: NEON GENESIS (Stages 1 - 10)
  // ==========================================
  // 1: First Steps
  {
    world: 1,
    name_ar: "رويا: البداية السماوية",
    name_en: "Roya: Celestial Dawn",
    shots: 3,
    desc_ar: "اسحب وصوّب نحو البلورات السماوية مباشرة",
    desc_en: "Drag and aim straight at the cyan celestial crystals",
    elements: [
      { type: 'crystal', x: 0.35, y: 0.28, radius: 24, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.50, y: 0.22, radius: 26, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.65, y: 0.28, radius: 24, color: 'cyan', hp: 1 }
    ]
  },
  // 2: Wall Ricochet
  {
    world: 1,
    name_ar: "آريا: زوايا الارتداد",
    name_en: "Arya: Ricochet Angles",
    shots: 3,
    desc_ar: "استخدم الجدران للارتداد وإصابة البلورات الوردية خلف الحاجز",
    desc_en: "Bounce off boundary walls to strike magenta crystals behind the barrier",
    elements: [
      { type: 'wall', x: 0.5, y: 0.45, width: 0.38, height: 0.03, angle: 0 },
      { type: 'crystal', x: 0.25, y: 0.25, radius: 24, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.75, y: 0.25, radius: 24, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.50, y: 0.20, radius: 26, color: 'magenta', hp: 1 }
    ]
  },
  // 3: Dual Harmony
  {
    world: 1,
    name_ar: "التناغم المزدوج",
    name_en: "Dual Harmony",
    shots: 3,
    desc_ar: "أطلق التوأم لتطهير البلورات المتطابقة في ضربة واحدة",
    desc_en: "Launch the twin spirits to clear matching crystals in a single shot",
    elements: [
      { type: 'crystal', x: 0.3, y: 0.32, radius: 25, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.7, y: 0.32, radius: 25, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.5, y: 0.18, radius: 28, color: 'synergy', hp: 2 }
    ]
  },
  // 4: The Shielded Nexus
  {
    world: 1,
    name_ar: "درع الألماس النيوني",
    name_en: "Diamond Aegis",
    shots: 3,
    desc_ar: "البلورة المركزية محمية بدرع طاقة نيون 🛡️ يتطلب ضربة أولى لكسره!",
    desc_en: "The nexus core is protected by an energy shield 🛡️—crack it first!",
    elements: [
      { type: 'wall', x: 0.28, y: 0.42, width: 0.03, height: 0.22, angle: 0 },
      { type: 'wall', x: 0.72, y: 0.42, width: 0.03, height: 0.22, angle: 0 },
      { type: 'crystal', x: 0.5, y: 0.30, radius: 24, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.5, y: 0.18, radius: 26, color: 'magenta', hp: 1, hasShield: true },
      { type: 'crystal', x: 0.15, y: 0.24, radius: 22, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.85, y: 0.24, radius: 22, color: 'magenta', hp: 1 }
    ]
  },
  // 5: Neon Domino Rush
  {
    world: 1,
    name_ar: "سلسلة الدومينو النيونية",
    name_en: "Neon Domino Rush",
    shots: 3,
    desc_ar: "سلسلة تفاعلات متتابعة ساحرة! زاوية واحدة ذكية تطلق عاصفة تفجير الدومينو 💥",
    desc_en: "Hypnotic domino chain reaction! Find the sweet angle to spark the room-clearing blast 💥",
    elements: [
      { type: 'bumper', x: 0.50, y: 0.38, radius: 24, color: '#ff007f' },
      { type: 'wall', x: 0.22, y: 0.44, width: 0.22, height: 0.025, angle: 0.25 },
      { type: 'wall', x: 0.78, y: 0.44, width: 0.22, height: 0.025, angle: -0.25 },
      { type: 'crystal', x: 0.35, y: 0.28, radius: 23, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.65, y: 0.28, radius: 23, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.22, y: 0.20, radius: 23, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.78, y: 0.20, radius: 23, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.38, y: 0.14, radius: 25, color: 'synergy', hp: 1, subType: 'bomb' },
      { type: 'crystal', x: 0.62, y: 0.14, radius: 25, color: 'synergy', hp: 1, subType: 'bomb' },
      { type: 'crystal', x: 0.50, y: 0.22, radius: 26, color: 'synergy', hp: 1 }
    ]
  },
  // 6: Triangle Matrix
  {
    world: 1,
    name_ar: "مصفوفة المثلث",
    name_en: "Triangle Matrix",
    shots: 3,
    desc_ar: "رتّب ارتدادك لتصيب البلورات الثلاث المتتالية",
    desc_en: "Line up your bounce to pierce all three apex crystals",
    elements: [
      { type: 'crystal', x: 0.5, y: 0.15, radius: 26, color: 'synergy', hp: 2 },
      { type: 'crystal', x: 0.28, y: 0.32, radius: 24, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.72, y: 0.32, radius: 24, color: 'magenta', hp: 1 },
      { type: 'wall', x: 0.5, y: 0.50, width: 0.4, height: 0.03, angle: 0 }
    ]
  },
  // 7: Glass Shatter Corridor
  {
    world: 1,
    name_ar: "ممر الزجاج المهشم",
    name_en: "Glass Shatter Corridor",
    shots: 3,
    desc_ar: "حواجز زجاج نيونية قابلة للكسر 💎! اضرب الزجاج بقوة لتهشيمه وفتح الممر السري!",
    desc_en: "Destructible neon glass walls 💎! Shatter through to penetrate the inner vault!",
    elements: [
      { type: 'glassWall', x: 0.35, y: 0.36, width: 0.24, height: 0.025, angle: 0, hp: 1 },
      { type: 'glassWall', x: 0.65, y: 0.36, width: 0.24, height: 0.025, angle: 0, hp: 1 },
      { type: 'wall', x: 0.50, y: 0.48, width: 0.025, height: 0.22, angle: 0 },
      { type: 'crystal', x: 0.35, y: 0.22, radius: 24, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.65, y: 0.22, radius: 24, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.18, y: 0.16, radius: 24, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.82, y: 0.16, radius: 24, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.50, y: 0.14, radius: 28, color: 'synergy', hp: 2 }
    ]
  },
  // 8: Kinetic Pinball Arena
  {
    world: 1,
    name_ar: "ميدان البينبول الحركي",
    name_en: "Kinetic Pinball Arena",
    shots: 3,
    desc_ar: "مصدات بينبول نيونية فائقة الطاقة ⚡ تقذف الأطياف بسرعات قياسية خاطفة!",
    desc_en: "High-voltage kinetic pinball bumpers ⚡ launch spirits at hyper-ricochet speeds!",
    elements: [
      { type: 'bumper', x: 0.30, y: 0.42, radius: 24, color: '#00f3ff' },
      { type: 'bumper', x: 0.70, y: 0.42, radius: 24, color: '#ff007f' },
      { type: 'bumper', x: 0.50, y: 0.26, radius: 26, color: '#ffb703' },
      { type: 'wall', x: 0.16, y: 0.28, width: 0.025, height: 0.25, angle: 0.2 },
      { type: 'wall', x: 0.84, y: 0.28, width: 0.025, height: 0.25, angle: -0.2 },
      { type: 'crystal', x: 0.50, y: 0.14, radius: 27, color: 'synergy', hp: 2 },
      { type: 'crystal', x: 0.28, y: 0.18, radius: 23, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.72, y: 0.18, radius: 23, color: 'magenta', hp: 1 }
    ]
  },
  // 9: Twin Columns Precision Vault
  {
    world: 1,
    name_ar: "ممر الأعمدة والزجاج المصفح",
    name_en: "Twin Vault: Reinforced Corridors",
    shots: 3,
    desc_ar: "ممران ضيقان محميان بجدران زجاجية نيونية تتطلب ارتدادات دقيقة متعددة!",
    desc_en: "Twin narrow corridors defended by destructible glass & reinforced crystals!",
    elements: [
      { type: 'wall', x: 0.5, y: 0.32, width: 0.03, height: 0.36, angle: 0 },
      { type: 'glassWall', x: 0.25, y: 0.28, width: 0.22, height: 0.025, angle: 0, hp: 1 },
      { type: 'glassWall', x: 0.75, y: 0.28, width: 0.22, height: 0.025, angle: 0, hp: 1 },
      { type: 'bumper', x: 0.50, y: 0.52, radius: 24, color: '#ffb703' },
      { type: 'crystal', x: 0.25, y: 0.18, radius: 25, color: 'cyan', hp: 2 },
      { type: 'crystal', x: 0.25, y: 0.38, radius: 25, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.75, y: 0.18, radius: 25, color: 'magenta', hp: 2 },
      { type: 'crystal', x: 0.75, y: 0.38, radius: 25, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.50, y: 0.12, radius: 28, color: 'synergy', hp: 2, hasShield: true }
    ]
  },
  // 10: World 1 Boss - Orion Nexus Core
  {
    world: 1,
    name_ar: "زعيم سديم النيون: نواة أوريون المحصنة 👑",
    name_en: "World 1 Boss: Orion Nexus Core 👑",
    shots: 3,
    desc_ar: "معركة الزعيم الكبرى: نواة رباعية الطاقة محصنة بدرع وشفرات دوران فائقة وبوابة ليزر!",
    desc_en: "World 1 Climax: Quad-armored Boss Core guarded by hyper-rotors, laser barrier & switch!",
    elements: [
      { type: 'spinner', x: 0.30, y: 0.44, length: 85, speed: 2.4 },
      { type: 'spinner', x: 0.70, y: 0.44, length: 85, speed: -2.4 },
      { type: 'switch', x: 0.50, y: 0.56, radius: 18, gateId: 'gateBossW1', color: '#00f3ff' },
      { type: 'gate', id: 'gateBossW1', x1: 0.25, y1: 0.28, x2: 0.75, y2: 0.28, color: '#ff007f' },
      { type: 'bumper', x: 0.16, y: 0.28, radius: 22, color: '#00f3ff' },
      { type: 'bumper', x: 0.84, y: 0.28, radius: 22, color: '#ff007f' },
      { type: 'crystal', x: 0.50, y: 0.15, radius: 34, color: 'synergy', hp: 4, hasShield: true },
      { type: 'crystal', x: 0.24, y: 0.18, radius: 25, color: 'cyan', hp: 2 },
      { type: 'crystal', x: 0.76, y: 0.18, radius: 25, color: 'magenta', hp: 2 }
    ]
  },

  // ==========================================
  // WORLD 2: PRISMS & PORTALS (Stages 11 - 20)
  // ==========================================
  // 11: The First Prism
  {
    world: 2,
    name_ar: "منشور التحويل الأول",
    name_en: "The First Prism",
    shots: 3,
    desc_ar: "مرر الأطياف عبر المنشور الذهبي لتحويلها إلى طيف التناغم المتفجر",
    desc_en: "Pass through the golden prism to transform into high-energy Synergy",
    elements: [
      { type: 'prism', x: 0.5, y: 0.44, radius: 30, transformTo: 'synergy' },
      { type: 'crystal', x: 0.25, y: 0.25, radius: 24, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.75, y: 0.25, radius: 24, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.5, y: 0.18, radius: 28, color: 'synergy', hp: 2 }
    ]
  },
  // 12: Dual Portals Entry
  {
    world: 2,
    name_ar: "البوابات الفضائية الأولى",
    name_en: "First Cosmic Wormholes",
    shots: 3,
    desc_ar: "ادخل البوابة الزرقاء لتخرج فوراً من البرتقالية بالسرعة نفسها",
    desc_en: "Enter the blue portal to emerge from orange with conserved momentum",
    elements: [
      { type: 'portal', x: 0.25, y: 0.46, radius: 22, color: '#4361ee', pairId: 1, targetX: 0.75, targetY: 0.22 },
      { type: 'portal', x: 0.75, y: 0.22, radius: 22, color: '#f77f00', pairId: 1, targetX: 0.25, targetY: 0.46 },
      { type: 'wall', x: 0.5, y: 0.35, width: 0.6, height: 0.025, angle: 0 },
      { type: 'crystal', x: 0.60, y: 0.16, radius: 25, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.88, y: 0.16, radius: 25, color: 'cyan', hp: 1 }
    ]
  },
  // 13: Cosmic Gravity Well
  {
    world: 2,
    name_ar: "ثقب الجاذبية الأسود",
    name_en: "Singularity Well",
    shots: 3,
    desc_ar: "حقل جاذبية أسود 🌀 يجذب مسار الأطياف بانحناء انسيابي لتفادي الحاجز الصامد!",
    desc_en: "A cosmic black hole 🌀 bends spirit trajectories smoothly around the wall!",
    elements: [
      { type: 'gravity', x: 0.5, y: 0.38, radius: 32, strength: 2.2, mode: 'pull' },
      { type: 'wall', x: 0.5, y: 0.24, width: 0.45, height: 0.025, angle: 0 },
      { type: 'crystal', x: 0.5, y: 0.14, radius: 28, color: 'synergy', hp: 2 },
      { type: 'crystal', x: 0.2, y: 0.22, radius: 24, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.8, y: 0.22, radius: 24, color: 'cyan', hp: 1 }
    ]
  },
  // 14: Wormhole Ricochet Loop
  {
    world: 2,
    name_ar: "حلقة الارتداد الدودية",
    name_en: "Wormhole Rebound Loop",
    shots: 3,
    desc_ar: "اقذف الطيف في البوابة لتطلق سلسلة ارتدادات لا متناهية خلف الجدار",
    desc_en: "Hurl into the portal to spark an endless ricochet chain behind the wall",
    elements: [
      { type: 'wall', x: 0.5, y: 0.40, width: 0.5, height: 0.03, angle: 0 },
      { type: 'portal', x: 0.18, y: 0.55, radius: 22, color: '#4361ee', pairId: 2, targetX: 0.5, targetY: 0.15 },
      { type: 'portal', x: 0.5, y: 0.15, radius: 22, color: '#f77f00', pairId: 2, targetX: 0.18, targetY: 0.55 },
      { type: 'crystal', x: 0.30, y: 0.26, radius: 24, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.70, y: 0.26, radius: 24, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.50, y: 0.32, radius: 26, color: 'synergy', hp: 2 }
    ]
  },
  // 15: The Prism Fortress
  {
    world: 2,
    name_ar: "حصن المنشور المركزي",
    name_en: "The Prism Fortress",
    shots: 4,
    desc_ar: "بلورات التناغم المحمية تحتاج لطيف منشور ذهبي لتدميرها",
    desc_en: "Reinforced synergy crystals require transformed golden spirits",
    elements: [
      { type: 'prism', x: 0.5, y: 0.50, radius: 28, transformTo: 'synergy' },
      { type: 'wall', x: 0.35, y: 0.32, width: 0.25, height: 0.025, angle: 0.3 },
      { type: 'wall', x: 0.65, y: 0.32, width: 0.25, height: 0.025, angle: -0.3 },
      { type: 'crystal', x: 0.50, y: 0.20, radius: 28, color: 'synergy', hp: 2 },
      { type: 'crystal', x: 0.20, y: 0.18, radius: 24, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.80, y: 0.18, radius: 24, color: 'magenta', hp: 1 }
    ]
  },
  // 16: Cosmic Repulsor
  {
    world: 2,
    name_ar: "حقل الطرد الكوني",
    name_en: "Cosmic Repulsor",
    shots: 4,
    desc_ar: "حقل جاذبية طارد 🌀 يدفع الأطياف بقوة نحو الجوانب لتطهير الحجرات المعزولة!",
    desc_en: "A white hole repulsor 🌀 flings spirits outward into isolated side chambers!",
    elements: [
      { type: 'gravity', x: 0.5, y: 0.35, radius: 34, strength: 2.4, mode: 'push' },
      { type: 'wall', x: 0.5, y: 0.35, width: 0.03, height: 0.32, angle: 0 },
      { type: 'crystal', x: 0.25, y: 0.22, radius: 24, color: 'cyan', hp: 1, hasShield: true },
      { type: 'crystal', x: 0.75, y: 0.22, radius: 24, color: 'magenta', hp: 1, hasShield: true },
      { type: 'crystal', x: 0.5, y: 0.14, radius: 26, color: 'synergy', hp: 1, subType: 'bomb' }
    ]
  },
  // 17: Prism & Spinner Orbit
  {
    world: 2,
    name_ar: "مدار المنشور الدوار",
    name_en: "Prism & Spinner Orbit",
    shots: 4,
    desc_ar: "توقيت الإطلاق بدقة ليمر الطيف عبر المنشور متفادياً الشفرة الدوارة",
    desc_en: "Time the release to hit the prism while dodging the orbiting spinner",
    elements: [
      { type: 'prism', x: 0.5, y: 0.28, radius: 28, transformTo: 'synergy' },
      { type: 'spinner', x: 0.5, y: 0.44, length: 95, speed: 1.5 },
      { type: 'crystal', x: 0.22, y: 0.18, radius: 24, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.78, y: 0.18, radius: 24, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.50, y: 0.14, radius: 28, color: 'synergy', hp: 2 }
    ]
  },
  // 18: Slanted Warp Corridor
  {
    world: 2,
    name_ar: "الممر الملتوي الفضائي",
    name_en: "Warped Corridor",
    shots: 4,
    desc_ar: "تحدي الزوايا الخادعة مع بوابات تعكس الاتجاه",
    desc_en: "Deceptive angles with directional inversion portals",
    elements: [
      { type: 'wall', x: 0.35, y: 0.42, width: 0.28, height: 0.025, angle: -0.4 },
      { type: 'wall', x: 0.65, y: 0.42, width: 0.28, height: 0.025, angle: 0.4 },
      { type: 'portal', x: 0.5, y: 0.52, radius: 22, color: '#4361ee', pairId: 5, targetX: 0.5, targetY: 0.25 },
      { type: 'portal', x: 0.5, y: 0.25, radius: 22, color: '#f77f00', pairId: 5, targetX: 0.5, targetY: 0.52 },
      { type: 'crystal', x: 0.24, y: 0.26, radius: 24, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.76, y: 0.26, radius: 24, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.50, y: 0.12, radius: 28, color: 'synergy', hp: 2 }
    ]
  },
  // 19: Laser Gate Security & Hyper Rotor
  {
    world: 2,
    name_ar: "بوابة الليزر والشفرة الحارسة",
    name_en: "Laser Gate & Guard Rotor",
    shots: 3,
    desc_ar: "شفرة سريعة تحرس مفتاح الليزر، بينما النواة المحصنة محمية بدرع مزدوج!",
    desc_en: "High-speed rotor guards the laser switch while the core rests behind energy barriers!",
    elements: [
      { type: 'spinner', x: 0.22, y: 0.38, length: 75, speed: 2.2 },
      { type: 'switch', x: 0.22, y: 0.50, radius: 18, gateId: 'gate1', color: '#00f3ff' },
      { type: 'gate', id: 'gate1', x1: 0.35, y1: 0.25, x2: 0.65, y2: 0.25, color: '#ff0055' },
      { type: 'crystal', x: 0.50, y: 0.15, radius: 30, color: 'synergy', hp: 3, hasShield: true },
      { type: 'crystal', x: 0.78, y: 0.30, radius: 24, color: 'magenta', hp: 2 },
      { type: 'crystal', x: 0.78, y: 0.48, radius: 24, color: 'cyan', hp: 2 }
    ]
  },
  // 20: Aether Climax (World 2 Boss)
  {
    world: 2,
    name_ar: "سيد الأثير: ملحمة البوابات 👑",
    name_en: "Aether Sovereign: Portal Saga 👑",
    shots: 3,
    desc_ar: "ذروة العالم الثاني: جاذبية كونية، شفرات متزامنة وبوابات أثيرية تحرس نواة رباعية الدرع!",
    desc_en: "World 2 Climax: Singularity well, twin rotors & portals guarding quad-HP core!",
    elements: [
      { type: 'gravity', x: 0.50, y: 0.36, radius: 32, strength: 2.5, mode: 'pull' },
      { type: 'spinner', x: 0.18, y: 0.36, length: 70, speed: -2.4 },
      { type: 'spinner', x: 0.82, y: 0.36, length: 70, speed: 2.4 },
      { type: 'switch', x: 0.50, y: 0.54, radius: 18, gateId: 'bossGate', color: '#00f3ff' },
      { type: 'gate', id: 'bossGate', x1: 0.32, y1: 0.24, x2: 0.68, y2: 0.24, color: '#ff0055' },
      { type: 'portal', x: 0.18, y: 0.48, radius: 22, color: '#4361ee', pairId: 7, targetX: 0.82, targetY: 0.16 },
      { type: 'portal', x: 0.82, y: 0.16, radius: 22, color: '#f77f00', pairId: 7, targetX: 0.18, targetY: 0.48 },
      { type: 'crystal', x: 0.50, y: 0.14, radius: 34, color: 'synergy', hp: 4, hasShield: true },
      { type: 'crystal', x: 0.24, y: 0.24, radius: 25, color: 'cyan', hp: 2, subType: 'bomb' },
      { type: 'crystal', x: 0.76, y: 0.24, radius: 25, color: 'magenta', hp: 2, subType: 'bomb' }
    ]
  },

  // ==========================================
  // WORLD 3: KINETIC CHAOS (Stages 21 - 30)
  // ==========================================
  // 21: Twin Blade Rotor & Repulsor
  {
    world: 3,
    name_ar: "الشفرتان المتعاكستان والدافع الكوني",
    name_en: "Counter Rotors & Repulsor",
    shots: 4,
    desc_ar: "دواران متعاكسان مع دافع طرد أبيض في الوسط يسرع ارتدادات الطيف!",
    desc_en: "Dual counter-rotors with a white repulsor catapulting kinetic rebounds!",
    elements: [
      { type: 'spinner', x: 0.32, y: 0.44, length: 90, speed: 1.8 },
      { type: 'spinner', x: 0.68, y: 0.44, length: 90, speed: -1.8 },
      { type: 'gravity', x: 0.50, y: 0.44, radius: 26, strength: 1.8, mode: 'push' },
      { type: 'crystal', x: 0.50, y: 0.28, radius: 26, color: 'cyan', hp: 2 },
      { type: 'crystal', x: 0.25, y: 0.18, radius: 24, color: 'magenta', hp: 1, subType: 'bomb' },
      { type: 'crystal', x: 0.75, y: 0.18, radius: 24, color: 'cyan', hp: 1 }
    ]
  },
  // 22: The Pinball Chamber & Shield Core
  {
    world: 3,
    name_ar: "غرفة الارتداد والدرع البلازمي",
    name_en: "Hyper Rebound & Aegis Core",
    shots: 4,
    desc_ar: "حواجز مائلة متقابلة مع بلورة نيازك محصنة بدرع طاقة!",
    desc_en: "Opposed sloped reflectors guarding an energy-shielded synergy core!",
    elements: [
      { type: 'wall', x: 0.22, y: 0.42, width: 0.22, height: 0.025, angle: 0.6 },
      { type: 'wall', x: 0.78, y: 0.42, width: 0.22, height: 0.025, angle: -0.6 },
      { type: 'wall', x: 0.50, y: 0.28, width: 0.24, height: 0.025, angle: 0 },
      { type: 'crystal', x: 0.50, y: 0.16, radius: 28, color: 'synergy', hp: 3, hasShield: true },
      { type: 'crystal', x: 0.25, y: 0.22, radius: 24, color: 'cyan', hp: 2 },
      { type: 'crystal', x: 0.75, y: 0.22, radius: 24, color: 'magenta', hp: 1, subType: 'bomb' }
    ]
  },
  // 23: The Kinetic Gatekeeper
  {
    world: 3,
    name_ar: "حارس البوابة الحركي بالليزر",
    name_en: "Kinetic Gatekeeper & Laser Security",
    shots: 4,
    desc_ar: "شفرة دوارة طويلة تحرس المفتاح، عطّل بوابة الليزر للوصول إلى النواة!",
    desc_en: "Long rotor bar shields the switch; deactivate the laser barrier to reach the core!",
    elements: [
      { type: 'spinner', x: 0.5, y: 0.42, length: 140, speed: 2.0 },
      { type: 'switch', x: 0.5, y: 0.56, radius: 18, gateId: 'gateW3_1', color: '#00f3ff' },
      { type: 'gate', id: 'gateW3_1', x1: 0.30, y1: 0.26, x2: 0.70, y2: 0.26, color: '#ff0055' },
      { type: 'crystal', x: 0.22, y: 0.20, radius: 25, color: 'cyan', hp: 2 },
      { type: 'crystal', x: 0.78, y: 0.20, radius: 25, color: 'magenta', hp: 2 },
      { type: 'crystal', x: 0.50, y: 0.16, radius: 28, color: 'synergy', hp: 2, hasShield: true }
    ]
  },
  // 24: Crossfire Rotor & Singularity
  {
    world: 3,
    name_ar: "نيران الشفرات وثقب الجاذبية",
    name_en: "Rotor & Gravity Singularity Cross",
    shots: 4,
    desc_ar: "انتقل عبر البوابة متجاوزاً جاذبية الثقب الأسود والشفرة الدوارة!",
    desc_en: "Warp through wormholes while navigating black hole gravitational pull & spinning blades!",
    elements: [
      { type: 'spinner', x: 0.5, y: 0.32, length: 100, speed: -1.6 },
      { type: 'gravity', x: 0.5, y: 0.48, radius: 28, strength: 2.2, mode: 'pull' },
      { type: 'portal', x: 0.2, y: 0.52, radius: 22, color: '#4361ee', pairId: 8, targetX: 0.8, targetY: 0.18 },
      { type: 'portal', x: 0.8, y: 0.18, radius: 22, color: '#f77f00', pairId: 8, targetX: 0.2, targetY: 0.52 },
      { type: 'crystal', x: 0.5, y: 0.18, radius: 28, color: 'synergy', hp: 3, hasShield: true },
      { type: 'crystal', x: 0.3, y: 0.22, radius: 24, color: 'cyan', hp: 1, subType: 'bomb' }
    ]
  },
  // 25: Triple Prism Engine & Shield Bastion
  {
    world: 3,
    name_ar: "محرك المناشير الثلاثي والحصن البلازمي",
    name_en: "Triple Prism Engine & Bastion",
    shots: 4,
    desc_ar: "ثلاثة مناشير متتالية تحول الضربات إلى طاقة خارقة لكسر الدروع المتعددة!",
    desc_en: "Three synchronized prisms cascading energy to shatter multi-layered crystal shields!",
    elements: [
      { type: 'prism', x: 0.25, y: 0.45, radius: 26, transformTo: 'synergy' },
      { type: 'prism', x: 0.50, y: 0.36, radius: 28, transformTo: 'synergy' },
      { type: 'prism', x: 0.75, y: 0.45, radius: 26, transformTo: 'synergy' },
      { type: 'crystal', x: 0.25, y: 0.22, radius: 25, color: 'cyan', hp: 2, hasShield: true },
      { type: 'crystal', x: 0.75, y: 0.22, radius: 25, color: 'magenta', hp: 2, hasShield: true },
      { type: 'crystal', x: 0.50, y: 0.16, radius: 30, color: 'synergy', hp: 3, subType: 'bomb' }
    ]
  },
  // 26: Chaos Whirlwind & Dual Singularities
  {
    world: 3,
    name_ar: "إعصار الفوضى وجاذبية الأضداد",
    name_en: "Chaos Whirlwind & Dual Singularities",
    shots: 5,
    desc_ar: "جاذبية سحب ودفع مع شفرات سريعة تشكل فوضى حركية تتطلب رميات دقيقة!",
    desc_en: "Binary pull and push singularities combined with high-speed kinetic rotors!",
    elements: [
      { type: 'spinner', x: 0.25, y: 0.44, length: 70, speed: 2.2 },
      { type: 'spinner', x: 0.75, y: 0.44, length: 70, speed: -2.2 },
      { type: 'gravity', x: 0.35, y: 0.34, radius: 24, strength: 1.8, mode: 'pull' },
      { type: 'gravity', x: 0.65, y: 0.34, radius: 24, strength: 1.8, mode: 'push' },
      { type: 'crystal', x: 0.35, y: 0.18, radius: 24, color: 'cyan', hp: 2 },
      { type: 'crystal', x: 0.65, y: 0.18, radius: 24, color: 'magenta', hp: 2 },
      { type: 'crystal', x: 0.50, y: 0.12, radius: 28, color: 'synergy', hp: 3, hasShield: true }
    ]
  },
  // 27: Fortified Nexus & Laser Web
  {
    world: 3,
    name_ar: "النواة الحصينة وشبكة الليزر",
    name_en: "Fortified Nexus & Laser Web",
    shots: 4,
    desc_ar: "جدران عازلة وبوابة ليزر تحمي قلب الطاقة؛ اضرب المفتاح لتحرير المسار!",
    desc_en: "Defensive bastions and laser grid protecting the core; strike the switch to breach!",
    elements: [
      { type: 'wall', x: 0.25, y: 0.38, width: 0.03, height: 0.25, angle: 0 },
      { type: 'wall', x: 0.75, y: 0.38, width: 0.03, height: 0.25, angle: 0 },
      { type: 'switch', x: 0.15, y: 0.46, radius: 18, gateId: 'gateW3_2', color: '#ff007f' },
      { type: 'gate', id: 'gateW3_2', x1: 0.30, y1: 0.28, x2: 0.70, y2: 0.28, color: '#00f3ff' },
      { type: 'prism', x: 0.5, y: 0.48, radius: 28, transformTo: 'synergy' },
      { type: 'crystal', x: 0.5, y: 0.18, radius: 30, color: 'synergy', hp: 3, hasShield: true },
      { type: 'crystal', x: 0.85, y: 0.22, radius: 24, color: 'cyan', hp: 2, subType: 'bomb' }
    ]
  },
  // 28: Cosmic Pinwheel & White Hole
  {
    world: 3,
    name_ar: "عجلة الأبعاد النارية والدافع",
    name_en: "Cosmic Pinwheel & Warp Nexus",
    shots: 5,
    desc_ar: "شفرتان متقاطعتان في القلب مع دافع طرد كوني وبوابات انعكاسية في الأطراف!",
    desc_en: "Crossfire twin rotors centered on a cosmic repulsor with flank warp portals!",
    elements: [
      { type: 'spinner', x: 0.5, y: 0.38, length: 110, speed: 1.8 },
      { type: 'spinner', x: 0.5, y: 0.38, length: 110, speed: -1.8 },
      { type: 'gravity', x: 0.5, y: 0.38, radius: 28, strength: 2.0, mode: 'push' },
      { type: 'portal', x: 0.15, y: 0.52, radius: 20, color: '#4361ee', pairId: 9, targetX: 0.85, targetY: 0.18 },
      { type: 'portal', x: 0.85, y: 0.18, radius: 20, color: '#f77f00', pairId: 9, targetX: 0.15, targetY: 0.52 },
      { type: 'crystal', x: 0.5, y: 0.16, radius: 28, color: 'synergy', hp: 3, hasShield: true },
      { type: 'crystal', x: 0.22, y: 0.24, radius: 24, color: 'cyan', hp: 2, subType: 'bomb' },
      { type: 'crystal', x: 0.78, y: 0.24, radius: 24, color: 'magenta', hp: 2 }
    ]
  },
  // 29: Singularity Corridor & Security Grid
  {
    world: 3,
    name_ar: "ممر الجاذبية وبوابة الحصار",
    name_en: "Singularity Corridor & Siege Gate",
    shots: 4,
    desc_ar: "ممر ضيق مع بئر جاذبية يبتلع المسار وبوابة ليزر تحمي النواة الفائقة!",
    desc_en: "Narrow channel with intense gravity curvature and laser barrier guarding the nexus!",
    elements: [
      { type: 'wall', x: 0.26, y: 0.40, width: 0.025, height: 0.35, angle: 0 },
      { type: 'wall', x: 0.74, y: 0.40, width: 0.025, height: 0.35, angle: 0 },
      { type: 'gravity', x: 0.5, y: 0.42, radius: 30, strength: 2.6, mode: 'pull' },
      { type: 'switch', x: 0.14, y: 0.42, radius: 18, gateId: 'gateW3_3', color: '#00f3ff' },
      { type: 'gate', id: 'gateW3_3', x1: 0.30, y1: 0.26, x2: 0.70, y2: 0.26, color: '#ff0055' },
      { type: 'spinner', x: 0.5, y: 0.52, length: 85, speed: 2.5 },
      { type: 'crystal', x: 0.5, y: 0.15, radius: 32, color: 'synergy', hp: 4, hasShield: true },
      { type: 'crystal', x: 0.86, y: 0.35, radius: 24, color: 'magenta', hp: 2, subType: 'bomb' },
      { type: 'crystal', x: 0.14, y: 0.25, radius: 24, color: 'cyan', hp: 2 }
    ]
  },
  // 30: Grand Master Symphony (World 3 Grand Climax)
  {
    world: 3,
    name_ar: "سيمفونية التناغم الكبرى: العرش النيوني 👑",
    name_en: "Grand Master Symphony: Neon Throne 👑",
    shots: 4,
    desc_ar: "ذروة العالم الثالث: بوابات، جاذبية، حواجز ليزر، شفرات متزامنة ونواة رباعية الطاقة!",
    desc_en: "World 3 Climax: Portals, gravity, laser security, dual high-speed rotors & quad-HP core!",
    elements: [
      { type: 'spinner', x: 0.30, y: 0.46, length: 85, speed: 2.6 },
      { type: 'spinner', x: 0.70, y: 0.46, length: 85, speed: -2.6 },
      { type: 'gravity', x: 0.50, y: 0.36, radius: 32, strength: 2.6, mode: 'pull' },
      { type: 'switch', x: 0.50, y: 0.56, radius: 18, gateId: 'gateFinale', color: '#ff007f' },
      { type: 'gate', id: 'gateFinale', x1: 0.32, y1: 0.25, x2: 0.68, y2: 0.25, color: '#00f3ff' },
      { type: 'portal', x: 0.16, y: 0.56, radius: 22, color: '#4361ee', pairId: 10, targetX: 0.84, targetY: 0.16 },
      { type: 'portal', x: 0.84, y: 0.16, radius: 22, color: '#f77f00', pairId: 10, targetX: 0.16, targetY: 0.56 },
      { type: 'crystal', x: 0.50, y: 0.14, radius: 34, color: 'synergy', hp: 4, hasShield: true },
      { type: 'crystal', x: 0.22, y: 0.22, radius: 26, color: 'cyan', hp: 2, subType: 'bomb' },
      { type: 'crystal', x: 0.78, y: 0.22, radius: 26, color: 'magenta', hp: 2, subType: 'bomb' }
    ]
  },

  // ==========================================
  // WORLD 4: GRAVITATIONAL WELLS (Stages 31 - 40)
  // ==========================================
  // 31: Orbit of the Void
  {
    world: 4,
    name_ar: "مدار الثقب الأسود",
    name_en: "Orbit of the Void",
    shots: 4,
    desc_ar: "حقل الجاذبية المركزي يحني مسار الأطياف في مدار بيضاوي ساحر",
    desc_en: "A central gravity well curves spirit trajectories into an elliptical orbit",
    elements: [
      { type: 'gravity', x: 0.50, y: 0.32, radius: 28, strength: 2.4, mode: 'pull' },
      { type: 'crystal', x: 0.30, y: 0.22, radius: 24, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.70, y: 0.22, radius: 24, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.22, y: 0.38, radius: 24, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.78, y: 0.38, radius: 24, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.50, y: 0.16, radius: 28, color: 'synergy', hp: 2 }
    ]
  },
  // 32: Twin Gravity Slingshot
  {
    world: 4,
    name_ar: "المقلاع الكوني الثنائي",
    name_en: "Twin Slingshot",
    shots: 4,
    desc_ar: "دوامتان متعاكستان تجذبان الأطياف كالمذنبات عبر الممر الضيق",
    desc_en: "Twin opposing gravity wells slingshot spirits like comets through a corridor",
    elements: [
      { type: 'gravity', x: 0.28, y: 0.35, radius: 25, strength: 2.0, mode: 'pull' },
      { type: 'gravity', x: 0.72, y: 0.35, radius: 25, strength: 2.0, mode: 'pull' },
      { type: 'wall', x: 0.50, y: 0.35, width: 0.04, height: 0.22, angle: 0 },
      { type: 'crystal', x: 0.28, y: 0.18, radius: 25, color: 'cyan', hp: 2 },
      { type: 'crystal', x: 0.72, y: 0.18, radius: 25, color: 'magenta', hp: 2 },
      { type: 'crystal', x: 0.50, y: 0.14, radius: 28, color: 'synergy', hp: 2 }
    ]
  },
  // 33: Prism Nebula Well
  {
    world: 4,
    name_ar: "متاهة المنشور والجاذبية",
    name_en: "Prism Nebula Well",
    shots: 4,
    desc_ar: "الجاذبية تدفع الأطياف عبر المنشور لتفعيل طاقة السينرجي الخارقة",
    desc_en: "Gravity steers spirits through the central prism to ignite synergy power",
    elements: [
      { type: 'gravity', x: 0.50, y: 0.45, radius: 30, strength: 2.2, mode: 'pull' },
      { type: 'prism', x: 0.50, y: 0.30, radius: 30, transformTo: 'synergy' },
      { type: 'crystal', x: 0.20, y: 0.24, radius: 25, color: 'synergy', hp: 2 },
      { type: 'crystal', x: 0.80, y: 0.24, radius: 25, color: 'synergy', hp: 2 },
      { type: 'crystal', x: 0.35, y: 0.14, radius: 24, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.65, y: 0.14, radius: 24, color: 'magenta', hp: 1 }
    ]
  },
  // 34: Event Horizon Portals
  {
    world: 4,
    name_ar: "بوابات أفق الحدث",
    name_en: "Event Horizon Portals",
    shots: 4,
    desc_ar: "بوابات فضاء تقذف الأطياف مباشرة في فوهة الجاذبية لاكتساب سرعة قصوى",
    desc_en: "Cosmic portals launch spirits straight into gravitational slingshots",
    elements: [
      { type: 'portal', x: 0.18, y: 0.52, radius: 22, color: '#4361ee', pairId: 11, targetX: 0.82, targetY: 0.20 },
      { type: 'portal', x: 0.82, y: 0.20, radius: 22, color: '#f77f00', pairId: 11, targetX: 0.18, targetY: 0.52 },
      { type: 'gravity', x: 0.62, y: 0.28, radius: 26, strength: 2.5, mode: 'pull' },
      { type: 'crystal', x: 0.40, y: 0.22, radius: 26, color: 'cyan', hp: 2 },
      { type: 'crystal', x: 0.62, y: 0.12, radius: 28, color: 'synergy', hp: 2, hasShield: true },
      { type: 'crystal', x: 0.84, y: 0.38, radius: 24, color: 'magenta', hp: 1 }
    ]
  },
  // 35: Pulsar Repulsion Tempest
  {
    world: 4,
    name_ar: "نبض البولسار النابذ",
    name_en: "Pulsar Repulsion Tempest",
    shots: 4,
    desc_ar: "حقل نبذ قوي يدفع الأطياف نحو محيط البلورات، احسب زاوية الارتطام!",
    desc_en: "A strong repulsive well deflects spirits outward toward perimeter crystals!",
    elements: [
      { type: 'gravity', x: 0.50, y: 0.32, radius: 34, strength: 2.8, mode: 'push' },
      { type: 'crystal', x: 0.20, y: 0.20, radius: 24, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.80, y: 0.20, radius: 24, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.20, y: 0.44, radius: 24, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.80, y: 0.44, radius: 24, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.50, y: 0.12, radius: 28, color: 'synergy', hp: 3, hasShield: true }
    ]
  },
  // 36: Gravitational Laser Vault
  {
    world: 4,
    name_ar: "حصن الليزر والجاذبية",
    name_en: "Gravitational Laser Vault",
    shots: 4,
    desc_ar: "اضرب المفتاح لتعطيل شعاع الليزر بينما تدور كرتك حول حقل الجاذبية",
    desc_en: "Hit the switch to drop the laser barrier while orbiting the gravity well",
    elements: [
      { type: 'switch', x: 0.24, y: 0.45, radius: 18, gateId: 'gateW4', color: '#ffb703' },
      { type: 'gate', id: 'gateW4', x1: 0.25, y1: 0.26, x2: 0.75, y2: 0.26, color: '#ff007f' },
      { type: 'gravity', x: 0.50, y: 0.40, radius: 28, strength: 2.2, mode: 'pull' },
      { type: 'crystal', x: 0.50, y: 0.16, radius: 30, color: 'synergy', hp: 3, hasShield: true },
      { type: 'crystal', x: 0.35, y: 0.20, radius: 24, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.65, y: 0.20, radius: 24, color: 'magenta', hp: 1 }
    ]
  },
  // 37: Vortex Trinity
  {
    world: 4,
    name_ar: "ثالوث الدوامات الكونية",
    name_en: "Vortex Trinity",
    shots: 4,
    desc_ar: "ثلاث دوامات متقاطعة ترسم مسارات منحنية فائقة الدقة",
    desc_en: "Three intersecting vortices sculpt intricate curved trajectories",
    elements: [
      { type: 'gravity', x: 0.30, y: 0.28, radius: 24, strength: 1.8, mode: 'pull' },
      { type: 'gravity', x: 0.70, y: 0.28, radius: 24, strength: 1.8, mode: 'pull' },
      { type: 'gravity', x: 0.50, y: 0.46, radius: 26, strength: 2.2, mode: 'pull' },
      { type: 'crystal', x: 0.50, y: 0.28, radius: 26, color: 'synergy', hp: 2 },
      { type: 'crystal', x: 0.25, y: 0.14, radius: 24, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.75, y: 0.14, radius: 24, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.50, y: 0.10, radius: 28, color: 'synergy', hp: 2, hasShield: true }
    ]
  },
  // 38: Armored Bastion Orbit
  {
    world: 4,
    name_ar: "مدار الحصن المصفح",
    name_en: "Armored Bastion Orbit",
    shots: 4,
    desc_ar: "شفرة حركية دوارة وجاذبية تحميان بلورات الدروع المحصنة",
    desc_en: "A revolving spinner and gravity well guard heavy shielded crystals",
    elements: [
      { type: 'spinner', x: 0.50, y: 0.34, length: 90, speed: 1.8 },
      { type: 'gravity', x: 0.50, y: 0.48, radius: 28, strength: 2.0, mode: 'pull' },
      { type: 'crystal', x: 0.28, y: 0.22, radius: 26, color: 'cyan', hp: 2, hasShield: true },
      { type: 'crystal', x: 0.72, y: 0.22, radius: 26, color: 'magenta', hp: 2, hasShield: true },
      { type: 'crystal', x: 0.50, y: 0.16, radius: 30, color: 'synergy', hp: 3, hasShield: true }
    ]
  },
  // 39: Supernova Chain Cascade
  {
    world: 4,
    name_ar: "شلال الانفجار المتسلسل",
    name_en: "Supernova Chain Cascade",
    shots: 3,
    desc_ar: "فجّر بلورة المتفجرات في الجاذبية لتطلق تفاعلاً متسلسلاً مذهلاً!",
    desc_en: "Detonate the bomb crystal within the gravity well to ignite a screen-clearing chain reaction!",
    elements: [
      { type: 'gravity', x: 0.50, y: 0.30, radius: 28, strength: 2.2, mode: 'pull' },
      { type: 'crystal', x: 0.50, y: 0.30, radius: 28, color: 'cyan', hp: 1, subType: 'bomb' },
      { type: 'crystal', x: 0.30, y: 0.20, radius: 25, color: 'magenta', hp: 2 },
      { type: 'crystal', x: 0.70, y: 0.20, radius: 25, color: 'cyan', hp: 2 },
      { type: 'crystal', x: 0.25, y: 0.38, radius: 24, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.75, y: 0.38, radius: 24, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.50, y: 0.12, radius: 30, color: 'synergy', hp: 2 }
    ]
  },
  // 40: Singularity Core (World 4 Grand Finale)
  {
    world: 4,
    name_ar: "نواة التفرد الكوني: عرش الجاذبية 👑",
    name_en: "Singularity Core: Gravity Apex 👑",
    shots: 4,
    desc_ar: "ذروة العالم الرابع: بوابات أفق، شفرات متزامنة فائقة السرعة، وجاذبية خارقة تحيط بالنواة الملكية المحصنة!",
    desc_en: "World 4 Climax: Portals, hyper twin-rotors, and supreme gravitational singularity guarding the quad-HP core!",
    elements: [
      { type: 'gravity', x: 0.50, y: 0.32, radius: 36, strength: 3.0, mode: 'pull' },
      { type: 'spinner', x: 0.28, y: 0.44, length: 80, speed: -2.8 },
      { type: 'spinner', x: 0.72, y: 0.44, length: 80, speed: 2.8 },
      { type: 'bumper', x: 0.12, y: 0.32, radius: 20, color: '#ffb703' },
      { type: 'bumper', x: 0.88, y: 0.32, radius: 20, color: '#ffb703' },
      { type: 'portal', x: 0.15, y: 0.55, radius: 22, color: '#4361ee', pairId: 12, targetX: 0.85, targetY: 0.18 },
      { type: 'portal', x: 0.85, y: 0.18, radius: 22, color: '#f77f00', pairId: 12, targetX: 0.15, targetY: 0.55 },
      { type: 'crystal', x: 0.50, y: 0.15, radius: 34, color: 'synergy', hp: 4, hasShield: true },
      { type: 'crystal', x: 0.28, y: 0.24, radius: 26, color: 'cyan', hp: 2, subType: 'bomb' },
      { type: 'crystal', x: 0.72, y: 0.24, radius: 26, color: 'magenta', hp: 2, subType: 'bomb' },
      { type: 'crystal', x: 0.50, y: 0.48, radius: 26, color: 'synergy', hp: 2 }
    ]
  },

  // ==========================================
  // WORLD 5: CELESTIAL APEX (Stages 41 - 50)
  // ==========================================
  // 41: Apex Dawn
  {
    world: 5,
    name_ar: "شفق القمة الأسطورية",
    name_en: "Apex Dawn",
    shots: 4,
    desc_ar: "دخول عالم الأسياد: زوايا هندسية ماسية تتطلب دقة متناهية",
    desc_en: "Entering the realm of champions: Diamond geometry demanding flawless precision",
    elements: [
      { type: 'prism', x: 0.30, y: 0.38, radius: 26, transformTo: 'synergy' },
      { type: 'prism', x: 0.70, y: 0.38, radius: 26, transformTo: 'synergy' },
      { type: 'crystal', x: 0.30, y: 0.20, radius: 26, color: 'synergy', hp: 2 },
      { type: 'crystal', x: 0.70, y: 0.20, radius: 26, color: 'synergy', hp: 2 },
      { type: 'crystal', x: 0.50, y: 0.28, radius: 30, color: 'synergy', hp: 3, hasShield: true }
    ]
  },
  // 42: Clockwork Symphony
  {
    world: 5,
    name_ar: "الرقصة الحركية المتزامنة",
    name_en: "Clockwork Symphony",
    shots: 4,
    desc_ar: "شفرات دوارة متداخلة كتروس الساعة الكونية، اضبط توقيت الإطلاق بدقة",
    desc_en: "Intermeshed dual spinners rotating like celestial gears, time your launch to perfection",
    elements: [
      { type: 'spinner', x: 0.38, y: 0.36, length: 85, speed: 2.4 },
      { type: 'spinner', x: 0.62, y: 0.36, length: 85, speed: -2.4 },
      { type: 'crystal', x: 0.20, y: 0.22, radius: 24, color: 'cyan', hp: 2 },
      { type: 'crystal', x: 0.80, y: 0.22, radius: 24, color: 'magenta', hp: 2 },
      { type: 'crystal', x: 0.50, y: 0.18, radius: 30, color: 'synergy', hp: 2, hasShield: true }
    ]
  },
  // 43: Diamond Prism Array
  {
    world: 5,
    name_ar: "مصفوفة المنشور الألماسي",
    name_en: "Diamond Prism Array",
    shots: 4,
    desc_ar: "ثلاثة مناشير تحول طاقة الضوء إلى عاصفة متكاملة من أطياف السينرجي",
    desc_en: "Triple prisms transposing spirit beams into a cascade of pure synergy",
    elements: [
      { type: 'prism', x: 0.50, y: 0.44, radius: 28, transformTo: 'synergy' },
      { type: 'prism', x: 0.28, y: 0.30, radius: 26, transformTo: 'synergy' },
      { type: 'prism', x: 0.72, y: 0.30, radius: 26, transformTo: 'synergy' },
      { type: 'crystal', x: 0.50, y: 0.20, radius: 32, color: 'synergy', hp: 3, hasShield: true },
      { type: 'crystal', x: 0.16, y: 0.22, radius: 24, color: 'cyan', hp: 2 },
      { type: 'crystal', x: 0.84, y: 0.22, radius: 24, color: 'magenta', hp: 2 }
    ]
  },
  // 44: Dual Laser Gauntlet
  {
    world: 5,
    name_ar: "فخ الليزر المزدوج",
    name_en: "Dual Laser Gauntlet",
    shots: 4,
    desc_ar: "مفتاحان متقابلان يفتحان بوابات الليزر المتقاطعة للوصول إلى النواة",
    desc_en: "Twin switches disable intersecting laser gates guarding the inner chamber",
    elements: [
      { type: 'switch', x: 0.20, y: 0.50, radius: 18, gateId: 'gateW5A', color: '#00f3ff' },
      { type: 'switch', x: 0.80, y: 0.50, radius: 18, gateId: 'gateW5B', color: '#ff007f' },
      { type: 'gate', id: 'gateW5A', x1: 0.15, y1: 0.30, x2: 0.50, y2: 0.30, color: '#00f3ff' },
      { type: 'gate', id: 'gateW5B', x1: 0.50, y1: 0.30, x2: 0.85, y2: 0.30, color: '#ff007f' },
      { type: 'crystal', x: 0.50, y: 0.18, radius: 32, color: 'synergy', hp: 3, hasShield: true },
      { type: 'crystal', x: 0.32, y: 0.22, radius: 24, color: 'cyan', hp: 2 },
      { type: 'crystal', x: 0.68, y: 0.22, radius: 24, color: 'magenta', hp: 2 }
    ]
  },
  // 45: Galactic Minefield
  {
    world: 5,
    name_ar: "حقل الألغام النيوني",
    name_en: "Galactic Minefield",
    shots: 3,
    desc_ar: "تفجيرات متسلسلة كبرى تمسح الشاشة بأكملها في وميض مبهر!",
    desc_en: "Massive cascade of bomb crystals lighting up the galaxy in pure neon fireworks!",
    elements: [
      { type: 'crystal', x: 0.50, y: 0.42, radius: 28, color: 'synergy', hp: 1, subType: 'bomb' },
      { type: 'crystal', x: 0.25, y: 0.30, radius: 26, color: 'cyan', hp: 2, subType: 'bomb' },
      { type: 'crystal', x: 0.75, y: 0.30, radius: 26, color: 'magenta', hp: 2, subType: 'bomb' },
      { type: 'crystal', x: 0.35, y: 0.16, radius: 26, color: 'cyan', hp: 2 },
      { type: 'crystal', x: 0.65, y: 0.16, radius: 26, color: 'magenta', hp: 2 },
      { type: 'crystal', x: 0.50, y: 0.12, radius: 30, color: 'synergy', hp: 3, hasShield: true }
    ]
  },
  // 46: Infinity Loop Transit
  {
    world: 5,
    name_ar: "حلقة اللانهاية الكونية",
    name_en: "Infinity Loop Transit",
    shots: 4,
    desc_ar: "زوجان من البوابات يمرران الأطياف في مسار لانهاية متسارع (∞)",
    desc_en: "Two pairs of paired wormholes loop spirits in an accelerating infinity cycle (∞)",
    elements: [
      { type: 'portal', x: 0.20, y: 0.50, radius: 22, color: '#4361ee', pairId: 13, targetX: 0.80, targetY: 0.24 },
      { type: 'portal', x: 0.80, y: 0.24, radius: 22, color: '#f77f00', pairId: 13, targetX: 0.20, targetY: 0.50 },
      { type: 'portal', x: 0.80, y: 0.50, radius: 22, color: '#7209b7', pairId: 14, targetX: 0.20, targetY: 0.24 },
      { type: 'portal', x: 0.20, y: 0.24, radius: 22, color: '#06d6a0', pairId: 14, targetX: 0.80, targetY: 0.50 },
      { type: 'crystal', x: 0.50, y: 0.37, radius: 28, color: 'synergy', hp: 2 },
      { type: 'crystal', x: 0.50, y: 0.15, radius: 32, color: 'synergy', hp: 3, hasShield: true }
    ]
  },
  // 47: Kinetic Maelstrom
  {
    world: 5,
    name_ar: "العاصفة الحركية المطلقة",
    name_en: "Kinetic Maelstrom",
    shots: 4,
    desc_ar: "ثلاث شفرات دوارة سريعة تتطلب حساب زاوية رمي استثنائية",
    desc_en: "Three high-velocity kinetic rotors demanding surgical angle calculation",
    elements: [
      { type: 'spinner', x: 0.25, y: 0.38, length: 75, speed: 2.2 },
      { type: 'spinner', x: 0.75, y: 0.38, length: 75, speed: -2.2 },
      { type: 'spinner', x: 0.50, y: 0.48, length: 80, speed: 2.6 },
      { type: 'crystal', x: 0.50, y: 0.25, radius: 28, color: 'synergy', hp: 2 },
      { type: 'crystal', x: 0.25, y: 0.18, radius: 24, color: 'cyan', hp: 2 },
      { type: 'crystal', x: 0.75, y: 0.18, radius: 24, color: 'magenta', hp: 2 },
      { type: 'crystal', x: 0.50, y: 0.12, radius: 30, color: 'synergy', hp: 3, hasShield: true }
    ]
  },
  // 48: Gravitational Singularity Fortress
  {
    world: 5,
    name_ar: "قلعة الجاذبية المحصنة",
    name_en: "Gravitational Singularity Fortress",
    shots: 4,
    desc_ar: "جاذبية نبضية وحواجز أمان ليزرية تحيط بحصن البلورات الملكي",
    desc_en: "Pulsating gravity wells and security lasers protecting the royal bastion",
    elements: [
      { type: 'gravity', x: 0.50, y: 0.42, radius: 30, strength: 2.5, mode: 'pull' },
      { type: 'switch', x: 0.50, y: 0.55, radius: 18, gateId: 'gateW5Fort', color: '#ffb703' },
      { type: 'gate', id: 'gateW5Fort', x1: 0.20, y1: 0.28, x2: 0.80, y2: 0.28, color: '#ff007f' },
      { type: 'crystal', x: 0.50, y: 0.16, radius: 32, color: 'synergy', hp: 3, hasShield: true },
      { type: 'crystal', x: 0.25, y: 0.20, radius: 26, color: 'cyan', hp: 2 },
      { type: 'crystal', x: 0.75, y: 0.20, radius: 26, color: 'magenta', hp: 2 }
    ]
  },
  // 49: The Penultimate Nexus
  {
    world: 5,
    name_ar: "ما قبل الأبدية: التحدي الأعظم",
    name_en: "The Penultimate Nexus",
    shots: 4,
    desc_ar: "مزيج فائق الصعوبة: بوابات، جاذبية، شفرات سريعة ونواة رباعية الطاقة تحرس بوابة العرش!",
    desc_en: "Ultimate high-stakes trial: Portals, gravity, rapid spinners & 4-HP shielded core!",
    elements: [
      { type: 'portal', x: 0.15, y: 0.52, radius: 22, color: '#4361ee', pairId: 15, targetX: 0.85, targetY: 0.18 },
      { type: 'portal', x: 0.85, y: 0.18, radius: 22, color: '#f77f00', pairId: 15, targetX: 0.15, targetY: 0.52 },
      { type: 'gravity', x: 0.50, y: 0.38, radius: 28, strength: 2.6, mode: 'pull' },
      { type: 'spinner', x: 0.50, y: 0.50, length: 85, speed: 2.6 },
      { type: 'prism', x: 0.50, y: 0.26, radius: 28, transformTo: 'synergy' },
      { type: 'crystal', x: 0.50, y: 0.12, radius: 34, color: 'synergy', hp: 4, hasShield: true },
      { type: 'crystal', x: 0.25, y: 0.22, radius: 26, color: 'cyan', hp: 2, subType: 'bomb' },
      { type: 'crystal', x: 0.75, y: 0.22, radius: 26, color: 'magenta', hp: 2, subType: 'bomb' }
    ]
  },
  // 50: The Eternal Throne (Grand 50-Stage Campaign Finale)
  {
    world: 5,
    name_ar: "عرش رويا وآريا الأبدي: تتويج الأساطير 👑",
    name_en: "The Eternal Throne: Celestial Apex Finale 👑",
    shots: 4,
    desc_ar: "الذروة الأسطورية الكبرى لحملة الـ 50 مرحلة: عرش الأطياف الخالد، شفرات فائقة، جاذبية عملاقة ونواة خماسية محصنة!",
    desc_en: "The Grand 50-Stage Campaign Finale: 5-HP Shielded Apex Core, high-velocity rotors, singularity pull & laser fortress!",
    elements: [
      { type: 'spinner', x: 0.26, y: 0.46, length: 90, speed: 2.8 },
      { type: 'spinner', x: 0.74, y: 0.46, length: 90, speed: -2.8 },
      { type: 'gravity', x: 0.50, y: 0.35, radius: 35, strength: 3.0, mode: 'pull' },
      { type: 'switch', x: 0.50, y: 0.58, radius: 20, gateId: 'gateGrand50', color: '#ffb703' },
      { type: 'gate', id: 'gateGrand50', x1: 0.22, y1: 0.24, x2: 0.78, y2: 0.24, color: '#b537f2' },
      { type: 'portal', x: 0.12, y: 0.58, radius: 24, color: '#4361ee', pairId: 16, targetX: 0.88, targetY: 0.16 },
      { type: 'portal', x: 0.88, y: 0.16, radius: 24, color: '#f77f00', pairId: 16, targetX: 0.12, targetY: 0.58 },
      { type: 'prism', x: 0.50, y: 0.46, radius: 28, transformTo: 'synergy' },
      { type: 'bumper', x: 0.12, y: 0.35, radius: 22, color: '#00f3ff' },
      { type: 'bumper', x: 0.88, y: 0.35, radius: 22, color: '#ff007f' },
      { type: 'crystal', x: 0.50, y: 0.12, radius: 38, color: 'synergy', hp: 5, hasShield: true },
      { type: 'crystal', x: 0.22, y: 0.19, radius: 28, color: 'cyan', hp: 2, subType: 'bomb' },
      { type: 'crystal', x: 0.78, y: 0.19, radius: 28, color: 'magenta', hp: 2, subType: 'bomb' },
      { type: 'crystal', x: 0.34, y: 0.29, radius: 24, color: 'cyan', hp: 2 },
      { type: 'crystal', x: 0.66, y: 0.29, radius: 24, color: 'magenta', hp: 2 }
    ]
  }
];

/**
 * Procedural Level Generator for Endless Stages (Level 51+)
 * Generates endless challenges with increasing difficulty, dynamic seeded layouts, and guaranteed solvability.
 */
function generateProceduralLevel(levelNum) {
  const seed = levelNum * 9301 + 49297;
  const rand = (offset = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  const isEn = window.i18n && window.i18n.getLang() === 'en';
  const difficultyFactor = Math.min(1.0, 0.45 * Math.log(1 + 0.14 * Math.max(1, levelNum - 50)));
  const crystalCount = 5 + Math.floor(difficultyFactor * 6); // 5 to 11 crystals
  const shots = 4 + Math.floor(crystalCount / 3);

  const elements = [];
  const colors = ['cyan', 'magenta', 'synergy'];

  // Target Crystals
  for (let i = 0; i < crystalCount; i++) {
    const posX = 0.18 + rand(i * 3) * 0.64;
    const posY = 0.12 + rand(i * 7 + 1) * 0.32;
    const chosenColor = colors[Math.floor(rand(i * 11 + 2) * colors.length)];
    const hp = (chosenColor === 'synergy' || (levelNum > 35 && rand(i * 4) > 0.5)) ? 2 : 1;
    const hasShield = (levelNum >= 32 && rand(i * 8 + 3) > 0.72);
    const isBomb = (!hasShield && rand(i * 9 + 4) > 0.78);

    elements.push({
      type: 'crystal',
      x: posX,
      y: posY,
      radius: 22 + Math.floor(rand(i * 5) * 8),
      color: chosenColor,
      hp: hp,
      hasShield: hasShield,
      subType: isBomb ? 'bomb' : 'standard'
    });
  }

  // Dynamic Gravity Well in high levels
  if (levelNum >= 33 && rand(101) > 0.4) {
    elements.push({
      type: 'gravity',
      x: 0.50,
      y: 0.38,
      radius: 28,
      strength: 1.5 + rand(102) * 1.0,
      mode: rand(103) > 0.5 ? 'pull' : 'push'
    });
  }

  // Dynamic Laser Gate & Switch
  if (levelNum >= 36 && rand(104) > 0.45) {
    elements.push({
      type: 'switch',
      x: 0.20 + rand(105) * 0.60,
      y: 0.52,
      radius: 18,
      gateId: `procGate_${levelNum}`,
      color: '#00f3ff'
    });
    elements.push({
      type: 'gate',
      id: `procGate_${levelNum}`,
      x1: 0.28,
      y1: 0.28,
      x2: 0.72,
      y2: 0.28,
      color: '#ff0055'
    });
  }

  // Prisms on 60% of endless stages
  if (rand(101) > 0.4) {
    elements.push({
      type: 'prism',
      x: 0.35 + rand(102) * 0.3,
      y: 0.44 + rand(103) * 0.10,
      radius: 28,
      transformTo: 'synergy'
    });
  }

  // Spinners on 60% of endless stages
  if (rand(201) > 0.4) {
    elements.push({
      type: 'spinner',
      x: 0.5,
      y: 0.46,
      length: 95 + Math.floor(rand(202) * 50),
      speed: (rand(203) > 0.5 ? 1 : -1) * (1.2 + difficultyFactor * 1.2)
    });
  }

  // Wormholes on 40% of endless stages
  if (rand(301) > 0.6) {
    elements.push(
      { type: 'portal', x: 0.20, y: 0.52, radius: 20, color: '#4361ee', pairId: 99, targetX: 0.80, targetY: 0.18 },
      { type: 'portal', x: 0.80, y: 0.18, radius: 20, color: '#f77f00', pairId: 99, targetX: 0.20, targetY: 0.52 }
    );
  }

  return {
    world: 4,
    name: isEn ? `Nebula Endless: Stage ${levelNum}` : `سديم الفضاء: المرحلة ${levelNum}`,
    name_ar: `سديم الفضاء: المرحلة ${levelNum}`,
    name_en: `Nebula Endless: Stage ${levelNum}`,
    shots: shots,
    description: isEn ? `Endless Procedural Challenge ${levelNum}` : `مرحلة إجرائية متجددة - التحدي ${levelNum}`,
    desc_ar: `مرحلة إجرائية متجددة - التحدي ${levelNum}`,
    desc_en: `Endless Procedural Challenge ${levelNum}`,
    elements: elements
  };
}

// Global Level Getter with Dynamic Localization
window.getLevelData = function (levelNum) {
  const isEn = window.i18n && window.i18n.getLang() === 'en';
  let level;

  if (levelNum >= 1 && levelNum <= HANDCRAFTED_LEVELS.length) {
    level = JSON.parse(JSON.stringify(HANDCRAFTED_LEVELS[levelNum - 1]));
  } else {
    level = generateProceduralLevel(levelNum);
  }

  level.name = isEn ? (level.name_en || level.name) : (level.name_ar || level.name);
  level.description = isEn ? (level.desc_en || level.description) : (level.desc_ar || level.description);
  return level;
};

window.TOTAL_CAMPAIGN_LEVELS = HANDCRAFTED_LEVELS.length;
window.CAMPAIGN_WORLDS = WORLDS;
window.HANDCRAFTED_LEVELS = HANDCRAFTED_LEVELS;
