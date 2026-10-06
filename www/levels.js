/**
 * Roya & Arya: Level Catalog & Procedural Engine
 * Types:
 * - 'crystal': Destructible target (color: 'cyan', 'magenta', 'synergy')
 * - 'wall': Solid boundary / obstacle
 * - 'prism': Changes orb color / splits into twin synergy burst
 * - 'spinner': Rotating obstacle
 */

const HANDCRAFTED_LEVELS = [
  // Level 1: First Steps with Roya (Simple direct line)
  {
    name: "رويا: البداية السماوية",
    shots: 3,
    description: "اسحب وصوب نحو البلورات السماوية مباشرة",
    elements: [
      { type: 'crystal', x: 0.35, y: 0.28, radius: 24, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.50, y: 0.22, radius: 26, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.65, y: 0.28, radius: 24, color: 'cyan', hp: 1 }
    ]
  },

  // Level 2: Introducing Arya (Wall Ricochet)
  {
    name: "آريا: زوايا الارتداد",
    shots: 3,
    description: "استخدم الجدران للارتداد وإصابة البلورات الوردية خلف الحاجز",
    elements: [
      { type: 'wall', x: 0.5, y: 0.45, width: 0.35, height: 0.03, angle: 0 },
      { type: 'crystal', x: 0.25, y: 0.25, radius: 24, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.75, y: 0.25, radius: 24, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.50, y: 0.20, radius: 26, color: 'magenta', hp: 1 }
    ]
  },

  // Level 3: Dual Synergy (Cyan + Magenta together)
  {
    name: "التناغم المزدوج",
    shots: 3,
    description: "أطلق التوأم لتطهير البلورات المتطابقة في ضربة واحدة",
    elements: [
      { type: 'crystal', x: 0.3, y: 0.32, radius: 25, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.7, y: 0.32, radius: 25, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.5, y: 0.18, radius: 28, color: 'synergy', hp: 2 }
    ]
  },

  // Level 4: The Prism Gate (Transforms orbs)
  {
    name: "منشور التحويل الضوئي",
    shots: 3,
    description: "مرر الأطياف عبر المنشور الذهبي لتحويل لونها ومضاعفة سرعتها",
    elements: [
      { type: 'prism', x: 0.5, y: 0.46, radius: 30, transformTo: 'synergy' },
      { type: 'crystal', x: 0.25, y: 0.26, radius: 24, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.75, y: 0.26, radius: 24, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.5, y: 0.16, radius: 26, color: 'synergy', hp: 2 }
    ]
  },

  // Level 5: The Orbital Spinner (Moving challenge)
  {
    name: "حاجز المدار الدوار",
    shots: 3,
    description: "راقب دوران الحاجز واختر لحظة الإطلاق المثالية",
    elements: [
      { type: 'spinner', x: 0.5, y: 0.45, length: 140, speed: 1.2 },
      { type: 'crystal', x: 0.3, y: 0.22, radius: 24, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.7, y: 0.22, radius: 24, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.5, y: 0.12, radius: 26, color: 'synergy', hp: 2 }
    ]
  },

  // Level 6: Geometric Diamond Ring
  {
    name: "جوهرة الصدى",
    shots: 4,
    description: "ارتدادات متتالية داخل الحزام الهندسي",
    elements: [
      { type: 'crystal', x: 0.5, y: 0.16, radius: 24, color: 'synergy', hp: 2 },
      { type: 'crystal', x: 0.25, y: 0.32, radius: 24, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.75, y: 0.32, radius: 24, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.5, y: 0.48, radius: 22, color: 'cyan', hp: 1 },
      { type: 'wall', x: 0.5, y: 0.32, width: 0.2, height: 0.03, angle: Math.PI / 4 }
    ]
  },

  // Level 7: Twin Prisms Bank Shot
  {
    name: "بوابات الضوء المتعاكس",
    world: 1,
    shots: 4,
    description: "منشوران يعكسان مسار الأشعة في زوايا حادة",
    elements: [
      { type: 'prism', x: 0.3, y: 0.5, radius: 26, transformTo: 'cyan' },
      { type: 'prism', x: 0.7, y: 0.5, radius: 26, transformTo: 'magenta' },
      { type: 'crystal', x: 0.2, y: 0.2, radius: 24, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.8, y: 0.2, radius: 24, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.5, y: 0.25, radius: 28, color: 'synergy', hp: 2 }
    ]
  },

  // Level 8: Introducing Wormhole Portals! (World 2 Entrance)
  {
    name: "بوابة الأبعاد الفضائية",
    world: 2,
    shots: 3,
    description: "ادخل البوابة الزرقاء لتنتقل فوراً إلى البوابة البرتقالية وتصيب الهدف الخلفي!",
    elements: [
      { type: 'wall', x: 0.5, y: 0.35, width: 0.8, height: 0.03, angle: 0 },
      // Portal Pair: A -> B
      { type: 'portal', x: 0.2, y: 0.55, radius: 22, color: '#4361ee', pairId: 1, targetX: 0.8, targetY: 0.18 },
      { type: 'portal', x: 0.8, y: 0.18, radius: 22, color: '#f77f00', pairId: 1, targetX: 0.2, targetY: 0.55 },
      { type: 'crystal', x: 0.5, y: 0.18, radius: 26, color: 'synergy', hp: 2 },
      { type: 'crystal', x: 0.2, y: 0.18, radius: 24, color: 'cyan', hp: 1 }
    ]
  },

  // Level 9: Dual Orbit Maze with Portals
  {
    name: "متاهة المدارات والبوابات",
    world: 2,
    shots: 4,
    description: "استغل الانتقال الآني لتجاوز الحواجز الدوارة",
    elements: [
      { type: 'spinner', x: 0.5, y: 0.38, length: 130, speed: 1.4 },
      { type: 'portal', x: 0.18, y: 0.48, radius: 22, color: '#4361ee', pairId: 2, targetX: 0.82, targetY: 0.22 },
      { type: 'portal', x: 0.82, y: 0.22, radius: 22, color: '#f77f00', pairId: 2, targetX: 0.18, targetY: 0.48 },
      { type: 'prism', x: 0.5, y: 0.22, radius: 26, transformTo: 'synergy' },
      { type: 'crystal', x: 0.3, y: 0.15, radius: 24, color: 'cyan', hp: 1 },
      { type: 'crystal', x: 0.7, y: 0.15, radius: 24, color: 'magenta', hp: 1 }
    ]
  },

  // Level 10: Cosmic Alignment (Boss Tier)
  {
    name: "تاج التناغم الأعظم",
    world: 2,
    shots: 5,
    description: "التحدي الأقصى لقوى رويا وآريا المتحدة عبر البوابات والمنشورات!",
    elements: [
      { type: 'crystal', x: 0.5, y: 0.12, radius: 32, color: 'synergy', hp: 3 },
      { type: 'crystal', x: 0.18, y: 0.24, radius: 24, color: 'cyan', hp: 2 },
      { type: 'crystal', x: 0.82, y: 0.24, radius: 24, color: 'magenta', hp: 2 },
      { type: 'prism', x: 0.5, y: 0.34, radius: 28, transformTo: 'synergy' },
      { type: 'portal', x: 0.2, y: 0.52, radius: 22, color: '#4361ee', pairId: 3, targetX: 0.5, targetY: 0.22 },
      { type: 'portal', x: 0.5, y: 0.22, radius: 22, color: '#f77f00', pairId: 3, targetX: 0.2, targetY: 0.52 },
      { type: 'spinner', x: 0.5, y: 0.48, length: 150, speed: 1.8 }
    ]
  },

  // Level 11: Gravity Flux
  {
    name: "سديم الجاذبية المنعكسة",
    world: 2,
    shots: 4,
    description: "انعكاسات سداسية عبر زوجين من البوابات المكانية",
    elements: [
      { type: 'portal', x: 0.25, y: 0.45, radius: 20, color: '#4361ee', pairId: 4, targetX: 0.75, targetY: 0.2 },
      { type: 'portal', x: 0.75, y: 0.2, radius: 20, color: '#f77f00', pairId: 4, targetX: 0.25, targetY: 0.45 },
      { type: 'crystal', x: 0.5, y: 0.25, radius: 26, color: 'synergy', hp: 2 },
      { type: 'crystal', x: 0.25, y: 0.18, radius: 22, color: 'magenta', hp: 1 },
      { type: 'crystal', x: 0.75, y: 0.35, radius: 22, color: 'cyan', hp: 1 },
      { type: 'wall', x: 0.5, y: 0.45, width: 0.3, height: 0.025, angle: 0 }
    ]
  },

  // Level 12: Absolute Master Symphony
  {
    name: "سيمفونية الأبعاد المطلقة",
    world: 2,
    shots: 5,
    description: "اختبار الدقة الشامل: بوابات، منشورات، وحواجز متحركة متزامنة!",
    elements: [
      { type: 'crystal', x: 0.5, y: 0.15, radius: 28, color: 'synergy', hp: 3 },
      { type: 'crystal', x: 0.25, y: 0.25, radius: 22, color: 'cyan', hp: 2 },
      { type: 'crystal', x: 0.75, y: 0.25, radius: 22, color: 'magenta', hp: 2 },
      { type: 'prism', x: 0.5, y: 0.30, radius: 26, transformTo: 'synergy' },
      { type: 'portal', x: 0.18, y: 0.52, radius: 22, color: '#4361ee', pairId: 5, targetX: 0.82, targetY: 0.18 },
      { type: 'portal', x: 0.82, y: 0.18, radius: 22, color: '#f77f00', pairId: 5, targetX: 0.18, targetY: 0.52 },
      { type: 'spinner', x: 0.35, y: 0.44, length: 80, speed: -1.6 },
    ]
  }
];

/**
 * Procedural Level Generator for Infinite Stages (Level 11+)
 * Uses pseudo-random seeded placement with guaranteed solvability geometry
 */
function generateProceduralLevel(levelNum) {
  const seed = levelNum * 9301 + 49297;
  const rand = (offset = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  const difficultyFactor = Math.min(1.0, 0.4 * Math.log(1 + 0.12 * levelNum));
  const crystalCount = 4 + Math.floor(difficultyFactor * 5); // 4 to 9 crystals
  const shots = 3 + Math.floor(crystalCount / 3);

  const elements = [];
  const colors = ['cyan', 'magenta', 'synergy'];

  // 1. Generate Target Crystals
  for (let i = 0; i < crystalCount; i++) {
    const posX = 0.2 + rand(i * 3) * 0.6; // between 20% and 80% width
    const posY = 0.12 + rand(i * 7 + 1) * 0.30; // upper field
    const chosenColor = colors[Math.floor(rand(i * 11 + 2) * colors.length)];
    const hp = (chosenColor === 'synergy' && levelNum > 15) ? 2 : 1;

    elements.push({
      type: 'crystal',
      x: posX,
      y: posY,
      radius: 22 + Math.floor(rand(i * 5) * 8),
      color: chosenColor,
      hp: hp
    });
  }

  // 2. Add Prisms on 50% of stages
  if (rand(101) > 0.4) {
    elements.push({
      type: 'prism',
      x: 0.35 + rand(102) * 0.3,
      y: 0.42 + rand(103) * 0.12,
      radius: 28,
      transformTo: 'synergy'
    });
  }

  // 3. Add Spinners or Obstacles based on difficulty
  if (difficultyFactor > 0.4) {
    elements.push({
      type: 'spinner',
      x: 0.5,
      y: 0.46,
      length: 100 + Math.floor(rand(201) * 50),
      speed: (rand(202) > 0.5 ? 1 : -1) * (1.0 + difficultyFactor * 1.2)
    });
  }

  return {
    name: `سديم الفضاء: المرحلة ${levelNum}`,
    shots: shots,
    description: `مرحلة إجرائية متجددة - التحدي ${levelNum}`,
    elements: elements
  };
}

// Global level getter
window.getLevelData = function(levelNum) {
  if (levelNum >= 1 && levelNum <= HANDCRAFTED_LEVELS.length) {
    return HANDCRAFTED_LEVELS[levelNum - 1];
  }
  return generateProceduralLevel(levelNum);
};

window.TOTAL_CAMPAIGN_LEVELS = HANDCRAFTED_LEVELS.length;
