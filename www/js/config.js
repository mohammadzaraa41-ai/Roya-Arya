/**
 * ROYA & ARYA — Central configuration.
 * All gameplay tuning, economy values and content definitions live here so
 * balancing never requires touching engine code.
 */

export const VERSION = '1.1.0';

// Logical (world) resolution. Rendering scales this to any screen.
export const WORLD_W = 420;
export const WORLD_H = 650;

export const PHYS = Object.freeze({
  STEP: 1 / 60,            // fixed simulation step (seconds) — identical on 60Hz & 120Hz screens
  MAX_STEPS_PER_FRAME: 10, // prevents "spiral of death" after a long frame
  ORB_RADIUS: 13,
  DAMPING: 0.986,          // per step — shots settle in ~4s instead of ~12s
  RESTITUTION: 0.92,
  MIN_SPEED: 0.45,
  SETTLE_STEPS: 10,        // consecutive slow steps before an orb counts as stopped
  MAX_SPEED: 26,
  MAX_FLIGHT_STEPS: 60 * 8, // hard cap: a shot can never last more than 8s
  WIN_DELAY_STEPS: 30,     // short celebration window after the last crystal breaks
  MAX_DRAG: 110,
  MIN_PULL: 16,
  LAUNCH_FACTOR: 0.22,
  TWIN_DELAY_STEPS: 5,
  TWIN_SPREAD: Math.PI / 36,
  PRISM_BOOST: 1.2,
  SPINNER_THICKNESS: 4,
  FAST_FORWARD: 3,
  BOUNDS: Object.freeze({ left: 14, right: WORLD_W - 14, top: 18, bottom: WORLD_H - 30 }),
});

export const LAUNCHER = Object.freeze({ x: WORLD_W / 2, y: WORLD_H - 65 });

/** Live palette used by the renderer. Mutated by applySkin(). */
export const PALETTE = {
  cyan: '#00f3ff',
  magenta: '#ff007f',
  synergy: '#b537f2',
  gold: '#ffb703',
  spinner: '#c9d4ff',
};

export const SKINS = Object.freeze([
  { id: 'neon', name: 'أطياف النيون', desc: 'السماوي والوردي الكلاسيكي', cyan: '#00f3ff', magenta: '#ff007f', synergy: '#b537f2', cost: 0 },
  { id: 'aurora', name: 'شفق الزمرّد', desc: 'زمردي ولهب المرجان', cyan: '#06d6a0', magenta: '#ff6b35', synergy: '#b537f2', cost: 150 },
  { id: 'celestial', name: 'السديم الملكي', desc: 'أزرق ملكي وذهب شمسي', cyan: '#4d7cff', magenta: '#ffd166', synergy: '#e056fd', cost: 300 },
  { id: 'supernova', name: 'شمس السوبرنوفا', desc: 'لهب شمسي وأحمر كوني', cyan: '#ffe14d', magenta: '#ff3b5c', synergy: '#9d4edd', cost: 450 },
]);

export function applySkin(skin) {
  if (!skin) return;
  PALETTE.cyan = skin.cyan;
  PALETTE.magenta = skin.magenta;
  PALETTE.synergy = skin.synergy;
}

export const ECONOMY = Object.freeze({
  WELCOME_GEMS: 50,
  GEMS_PER_CRYSTAL: 2,
  VICTORY_BASE: 15,
  VICTORY_PER_STAR: 10,
  SCORE_PER_HIT: 100,
  REVIVE_GEM_COST: 30,
  REVIVE_GEM_SHOTS: 1,
  REVIVE_AD_SHOTS: 2,
  MAX_REVIVES: 2,
});

/** 7-day login streak (loops after day 7). */
export const DAILY_REWARDS = Object.freeze([20, 30, 40, 50, 60, 80, 120]);

/**
 * Achievements. `progress(ctx)` returns the current value; unlocked when >= target.
 * ctx = { stats, totalStars, threeStars, highest, skins, streak }
 */
export const ACHIEVEMENTS = Object.freeze([
  { id: 'first_shot', icon: '🎯', title: 'قنّاص الأطياف', desc: 'أنهِ مرحلة بضربة واحدة', target: 1, reward: 50, progress: c => c.stats.oneShotWins },
  { id: 'combo_master', icon: '⚡', title: 'سيد الكومبو', desc: 'حقق كومبو ×3 في ضربة واحدة', target: 3, reward: 50, progress: c => c.stats.bestCombo },
  { id: 'crystal_hunter', icon: '💠', title: 'صائد البلورات', desc: 'حطّم 30 بلورة نيونية', target: 30, reward: 60, progress: c => c.stats.crystalsShattered },
  { id: 'portal_traveler', icon: '🌀', title: 'مسافر الأبعاد', desc: 'اعبر البوابات الفضائية 3 مرات', target: 3, reward: 50, progress: c => c.stats.portalsUsed },
  { id: 'gem_shine', icon: '💎', title: 'بريق الجواهر', desc: 'اربح 150 جوهرة من اللعب', target: 150, reward: 40, progress: c => c.stats.gemsEarned },
  { id: 'stars_collector', icon: '🌟', title: 'جامع النجوم', desc: 'اجمع 15 نجمة', target: 15, reward: 80, progress: c => c.totalStars },
  { id: 'daily_streak', icon: '🔥', title: 'وفاء الأطياف', desc: 'استلم الهدية اليومية 3 أيام متتالية', target: 3, reward: 70, progress: c => c.streak },
  { id: 'skin_collector', icon: '🎨', title: 'أناقة النيون', desc: 'افتح طيفاً جديداً', target: 2, reward: 70, progress: c => c.skins },
  { id: 'harmony_master', icon: '👑', title: 'سيد المجرات', desc: 'أكمل المرحلة 8', target: 8, reward: 100, progress: c => c.highest },
  { id: 'perfectionist', icon: '✨', title: 'الكمال النيوني', desc: '3 نجوم في 10 مراحل', target: 10, reward: 150, progress: c => c.threeStars },
  { id: 'campaign_hero', icon: '🏆', title: 'بطل الحملة', desc: 'أكمل مراحل الحملة الـ12', target: 12, reward: 200, progress: c => c.highest },
]);
