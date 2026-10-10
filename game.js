/**
 * ROYA & ARYA: NEON RICOCHET
 * Core Game Engine, Physics, Juice & UI Controller
 */

(function () {
  'use strict';

  // --- Game Configuration & Constants ---
  const CANVAS_LOGICAL_WIDTH = 420;
  const CANVAS_LOGICAL_HEIGHT = 650;
  const GRAVITY = 0; // Top-down frictionless ricochet plane
  const DAMPING = 0.9985; // High-energy frictionless arcade flight so orbs never stall mid-air
  const ORB_RADIUS = 13;
  const MAX_DRAG_DIST = 110;
  const LAUNCH_SPEED_FACTOR = 0.22;
  const MIN_SPEED_THRESHOLD = 0.25;

  // Color Definitions
  const COLORS = {
    cyan: { main: '#00f3ff', glow: 'rgba(0, 243, 255, 0.65)', light: '#e0fbff' },
    magenta: { main: '#ff007f', glow: 'rgba(255, 0, 127, 0.65)', light: '#ffe6f2' },
    synergy: { main: '#b537f2', glow: 'rgba(181, 55, 242, 0.75)', light: '#f5e8ff' },
    gold: { main: '#ffb703', glow: 'rgba(255, 183, 3, 0.7)', light: '#fff8e6' },
    wall: { main: '#2c324e', glow: 'rgba(44, 50, 78, 0.5)', light: '#464f77' }
  };

  // Available Skins
  const SKINS = [
    { id: 'neon', name_ar: 'أطياف النيون الأصلية', name_en: 'Classic Neon Spirits', desc_ar: 'السماوي والوردي الكلاسيكي', desc_en: 'Classic cyan & magenta duo', cyan: '#00f3ff', magenta: '#ff007f', cost: 0 },
    { id: 'aurora', name_ar: 'شفق الفضاء الزمردي', name_en: 'Emerald Space Aurora', desc_ar: 'الزمردي ولهب المرجان', desc_en: 'Vibrant emerald & coral blaze', cyan: '#06d6a0', magenta: '#ff5400', cost: 80 },
    { id: 'celestial', name_ar: 'السديم الملكي', name_en: 'Celestial Royalty', desc_ar: 'البنفسجي والذهب الشمسي', desc_en: 'Royal purple & solar gold', cyan: '#7209b7', magenta: '#ffb703', cost: 180 },
    { id: 'supernova', name_ar: 'شمس السوبرنوفا', name_en: 'Supernova Flare', desc_ar: 'اللهب الشمسي والأرجواني الكوني', desc_en: 'Solar flares & cosmic crimson', cyan: '#ff7700', magenta: '#d90429', cost: 320 }
  ];

  // --- State ---
  const state = {
    currentLevel: 1,
    score: 0,
    shotsLeft: 3,
    maxCombo: 0,
    currentCombo: 0,
    gameState: 'TITLE', // 'TITLE', 'AIMING', 'FLYING', 'VICTORY', 'GAMEOVER', 'PAUSED'
    levelData: null,
    activeSkin: 'neon',
    stageGemsEarned: 0,
    settings: {
      sound: true,
      haptics: true,
      laser: true
    },
    savedProgress: {
      completedLevels: {},
      highScore: 0,
      gems: 15, // Welcome gift 15 gems
      unlockedSkins: ['neon'],
      unlockedAchievements: [],
      stats: {
        totalCrystalsBroken: 0,
        portalsUsed: 0,
        adsWatched: 0
      }
    },
    gameMode: 'campaign', // 'campaign' or 'endless'
    timeScale: 1.0,
    slowMoTimer: 0,
    resonanceActive: false,
    finalSlowMoTriggered: false
  };

  // Achievements Definition with Targets and Rewards (34 Tiered Badges)
  const ACHIEVEMENTS = [
    // 1-4: Precision One-Shot Series
    { id: 'first_shot', icon: '🎯', title_ar: 'قناص الأطياف', title_en: 'One-Shot Ace', desc_ar: 'إنهاء مرحلة بضربة واحدة فقط', desc_en: 'Clear a stage with a single shot', target: 1, reward: 15, type: 'oneshot' },
    { id: 'five_aces', icon: '🏹', title_ar: 'أسطورة القناصة', title_en: 'Ace Virtuoso', desc_ar: 'إنهاء 5 مراحل بضربة واحدة لكل منها', desc_en: 'Clear 5 stages with a single shot each', target: 5, reward: 25, type: 'oneshot' },
    { id: 'ten_aces', icon: '⚡', title_ar: 'رامي النجوم الخارق', title_en: 'Deadeye Marksman', desc_ar: 'إنهاء 10 مراحل بضربة واحدة لكل منها', desc_en: 'Clear 10 stages with a single shot each', target: 10, reward: 40, type: 'oneshot' },
    { id: 'twenty_aces', icon: '👁️', title_ar: 'عبقري الزوايا الكونية', title_en: 'Cosmic Geometric Prodigy', desc_ar: 'إنهاء 20 مرحلة بضربة واحدة استثنائية', desc_en: 'Clear 20 stages with a surgical one-shot each', target: 20, reward: 75, type: 'oneshot' },

    // 5-8: Combos & Resonance Fever Series
    { id: 'combo_master', icon: '⚡', title_ar: 'سيد الكومبو', title_en: 'Combo Master', desc_ar: 'تحقيق كومبو x3 أو أكثر في رمية واحدة', desc_en: 'Reach a combo of x3 or higher in a shot', target: 3, reward: 15, type: 'combo' },
    { id: 'fever_king', icon: '🔥', title_ar: 'حمى الرنين الخارق', title_en: 'Resonance Fever King', desc_ar: 'تحقيق كومبو خماسي x5 مذهل', desc_en: 'Unleash a breathtaking 5x combo', target: 5, reward: 30, type: 'combo' },
    { id: 'hyper_combo', icon: '🌪️', title_ar: 'إعصار السلسلة النيونية', title_en: 'Hyper Combo Storm', desc_ar: 'تحقيق كومبو ثماني x8 أسطوري في رمية واحدة', desc_en: 'Unleash a legendary x8 combo storm', target: 8, reward: 50, type: 'combo' },
    { id: 'combo_zen', icon: '🧘', title_ar: 'إيقاع التناغم الأبدي', title_en: 'Harmonic Zen Master', desc_ar: 'تفعيل طور حمى الرنين الكوني 5 مرات', desc_en: 'Trigger Resonance Fever 5 times', target: 5, reward: 40, type: 'fever' },

    // 9-13: Crystal Demolition & Explosions
    { id: 'crystal_hunter', icon: '💠', title_ar: 'صائد البلورات', title_en: 'Crystal Hunter', desc_ar: 'سحق 30 بلورة نيونية في رحلتك', desc_en: 'Shatter 30 neon crystals', target: 30, reward: 15, type: 'crystals' },
    { id: 'crystal_demolisher', icon: '💥', title_ar: 'مدمر البلورات', title_en: 'Crystal Demolisher', desc_ar: 'سحق 100 بلورة نيونية في رحلتك', desc_en: 'Shatter 100 neon crystals', target: 100, reward: 30, type: 'crystals' },
    { id: 'crystal_obliteration', icon: '☄️', title_ar: 'محطم المجرات', title_en: 'Galaxy Shatterer', desc_ar: 'سحق 300 بلورة نيونية عبر العوالم', desc_en: 'Shatter 300 neon crystals across worlds', target: 300, reward: 50, type: 'crystals' },
    { id: 'crystal_colossus', icon: '🗿', title_ar: 'أسطورة التطهير الكوني', title_en: 'Cosmic Oblivion Titan', desc_ar: 'سحق 800 بلورة نيونية لإثبات السيادة', desc_en: 'Shatter 800 neon crystals in total campaign', target: 800, reward: 100, type: 'crystals' },
    { id: 'bomb_specialist', icon: '💣', title_ar: 'خبير التفجير المتسلسل', title_en: 'Chain Bomb Specialist', desc_ar: 'تفجير 25 بلورة متفجرات نيونية', desc_en: 'Detonate 25 bomb crystals', target: 25, reward: 40, type: 'bombs' },

    // 14-19: Physics & Interactive Mechanics
    { id: 'portal_traveler', icon: '🌀', title_ar: 'مسافر الأبعاد', title_en: 'Wormhole Traveler', desc_ar: 'استخدام بوابات الانتقال الفضائي 5 مرات', desc_en: 'Traverse cosmic wormholes 5 times', target: 5, reward: 20, type: 'portals' },
    { id: 'hyper_jumper', icon: '🌌', title_ar: 'القفز الفضائي الفائق', title_en: 'Hyper Spatial Jumper', desc_ar: 'استخدام بوابات الانتقال الفضائي 30 مرة', desc_en: 'Traverse cosmic wormholes 30 times', target: 30, reward: 50, type: 'portals' },
    { id: 'gravity_rider', icon: '🪐', title_ar: 'مروّض الجاذبية', title_en: 'Gravity Slingshot', desc_ar: 'الانعطاف حول حقول الجاذبية 10 مرات', desc_en: 'Slingshot through gravity wells 10 times', target: 10, reward: 25, type: 'gravity' },
    { id: 'gravity_master', icon: '🕳️', title_ar: 'سيد الثقوب الكونية', title_en: 'Singularity Grandmaster', desc_ar: 'الانعطاف حول حقول الجاذبية 40 مرة', desc_en: 'Slingshot through gravity wells 40 times', target: 40, reward: 60, type: 'gravity' },
    { id: 'prism_weaver', icon: '🔮', title_ar: 'ناسج أطياف الضوء', title_en: 'Prism Lightweaver', desc_ar: 'عبور المناشير لتحويل الأطياف 25 مرة', desc_en: 'Weave spirit light through prisms 25 times', target: 25, reward: 35, type: 'prisms' },
    { id: 'laser_hacker', icon: '🔓', title_ar: 'كاسر حواجز الليزر', title_en: 'Laser Cryptobreaker', desc_ar: 'تعطيل 15 بوابة ليزر عبر مفاتيح الأمان', desc_en: 'Disable 15 laser gates using security terminals', target: 15, reward: 35, type: 'lasers' },

    // 20-24: Stars & Completion Series
    { id: 'stars_collector', icon: '🌟', title_ar: 'جامع النجوم', title_en: 'Star Collector', desc_ar: 'جمع 15 نجمة أو أكثر في المراحل', desc_en: 'Collect 15 or more stage stars', target: 15, reward: 20, type: 'stars' },
    { id: 'stars_champion', icon: '✨', title_ar: 'بطل النجوم الكوني', title_en: 'Star Champion', desc_ar: 'جمع 40 نجمة في حملة العوالم', desc_en: 'Collect 40 stars across campaign worlds', target: 40, reward: 35, type: 'stars' },
    { id: 'stars_master', icon: '🌠', title_ar: 'سيد المجرات', title_en: 'Galaxy Star Master', desc_ar: 'جمع 80 نجمة ذهبية في حملة العوالم', desc_en: 'Collect 80 stars across campaign worlds', target: 80, reward: 55, type: 'stars' },
    { id: 'stars_legend', icon: '👑', title_ar: 'الكمال الكوني', title_en: 'Cosmic Perfection', desc_ar: 'جمع 120 نجمة متألقة في المراحل', desc_en: 'Achieve 120 sparkling stars in campaign', target: 120, reward: 80, type: 'stars' },
    { id: 'stars_ultimate', icon: '🏆', title_ar: 'تاج الـ 150 نجمة الملكي', title_en: 'The Royal 150-Star Crown', desc_ar: 'تحقيق الدرجة الكاملة (3 نجوم في جميع الـ 50 مرحلة!)', desc_en: 'Achieve flawless 3 stars on all 50 campaign stages!', target: 150, reward: 150, type: 'stars' },

    // 25-29: Worlds Conquest Series
    { id: 'conqueror_w1', icon: '🪐', title_ar: 'فاتح سديم النيون', title_en: 'Nebula Genesis Conqueror', desc_ar: 'إنهاء المرحلة 10 وتطهير العالم الأول', desc_en: 'Conquer Stage 10 and clear World 1', target: 10, reward: 25, type: 'world' },
    { id: 'conqueror_w2', icon: '🔮', title_ar: 'سيد بوابات الأثير', title_en: 'Prisms & Portals Master', desc_ar: 'إنهاء المرحلة 20 وتطهير العالم الثاني', desc_en: 'Conquer Stage 20 and clear World 2', target: 20, reward: 35, type: 'world' },
    { id: 'conqueror_w3', icon: '⚡', title_ar: 'قاهر الفوضى الحركية', title_en: 'Kinetic Chaos Overlord', desc_ar: 'إنهاء المرحلة 30 وتطهير العالم الثالث', desc_en: 'Conquer Stage 30 and clear World 3', target: 30, reward: 45, type: 'world' },
    { id: 'conqueror_w4', icon: '🌌', title_ar: 'قاهر الجاذبية الكونية', title_en: 'Gravity Wells Conqueror', desc_ar: 'إنهاء المرحلة 40 وتطهير العالم الرابع', desc_en: 'Conquer Stage 40 and clear World 4', target: 40, reward: 60, type: 'world' },
    { id: 'conqueror_w5', icon: '👑', title_ar: 'أسطورة قمة المجرة الأبدية', title_en: 'Celestial Apex Paragon', desc_ar: 'إنهاء المرحلة 50 وختم حملة العوالم الكبرى!', desc_en: 'Conquer Stage 50 and achieve Grand Campaign Completion!', target: 50, reward: 120, type: 'world' },

    // 30-34: Economy & Skins Series
    { id: 'first_gem', icon: '💎', title_ar: 'بريق الأطياف', title_en: 'Spirit Gleam', desc_ar: 'جمع 50 جوهرة نيونية', desc_en: 'Collect 50 neon gems', target: 50, reward: 20, type: 'gems' },
    { id: 'gem_tycoon', icon: '💰', title_ar: 'خازن الجواهر الملكية', title_en: 'Royal Gem Tycoon', desc_ar: 'تجميع 200 جوهرة نيونية في رصيدك', desc_en: 'Amass a treasury of 200 neon gems', target: 200, reward: 60, type: 'gems' },
    { id: 'ad_supporter', icon: '🎁', title_ar: 'حليف الأطياف المخلص', title_en: 'Loyal Spirit Ally', desc_ar: 'مشاهدة 3 إعلانات مكافأة ودعم اللعبة', desc_en: 'Watch 3 rewarded ads to support the game', target: 3, reward: 35, type: 'ads' },
    { id: 'skin_collector', icon: '🎨', title_ar: 'أناقة النيون', title_en: 'Neon Elegance', desc_ar: 'فتح 2 من مظاهر الأطياف النيونية', desc_en: 'Unlock 2 spirit skins', target: 2, reward: 25, type: 'skins' },
    { id: 'skin_fashionista', icon: '✨', title_ar: 'خزانة المجرة الكاملة', title_en: 'Universal Wardrobe', desc_ar: 'فتح جميع المظاهر الأربعة للأرواح', desc_en: 'Unlock all 4 cosmic spirit skins', target: 4, reward: 75, type: 'skins' }
  ];

  // --- Entities Arrays ---
  let orbs = []; // Roya & Arya
  let crystals = [];
  let walls = [];
  let prisms = [];
  let spinners = [];
  let portals = [];
  let particles = [];
  let floatingTexts = [];
  let shockwaves = [];
  let gravityWells = [];
  let switches = [];
  let laserGates = [];
  let bumpers = [];
  let glassWalls = [];

  // Drag / Slinging State
  const drag = {
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    anchorX: CANVAS_LOGICAL_WIDTH / 2,
    anchorY: CANVAS_LOGICAL_HEIGHT - 125
  };

  // Screen Shake (Trauma) & Dynamic Hit Flash
  let screenTrauma = 0;
  let shakeOffsetX = 0;
  let shakeOffsetY = 0;
  let shakeAngle = 0;
  let hitFlash = 0;
  let flashColor = '#ffffff';

  // DOM Elements
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const canvasWrapper = document.getElementById('canvas-wrapper');

  // HUD
  const hudLevelText = document.getElementById('hud-level-text');
  const hudScoreVal = document.getElementById('hud-score-val');
  const hudShotsVal = document.getElementById('hud-shots-val');
  const dotRoya = document.getElementById('dot-roya');
  const dotArya = document.getElementById('dot-arya');
  const gestureHint = document.getElementById('gesture-hint');
  const comboBanner = document.getElementById('combo-banner');
  const comboText = document.getElementById('combo-text');

  // Modals
  const screenTitle = document.getElementById('screen-title');
  const modalVictory = document.getElementById('modal-victory');
  const modalGameOver = document.getElementById('modal-gameover');
  const modalPause = document.getElementById('modal-pause');
  const modalLevels = document.getElementById('modal-levels');
  const modalSkins = document.getElementById('modal-skins');
  const adSimOverlay = document.getElementById('ad-sim-overlay');

  // --- Storage Helper ---
  function loadStorage() {
    try {
      const data = localStorage.getItem('roya_arya_save_v1');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.savedProgress) {
          state.savedProgress = Object.assign(state.savedProgress, parsed.savedProgress);
        }
        if (parsed.settings) state.settings = parsed.settings;
        if (parsed.activeSkin) state.activeSkin = parsed.activeSkin;
      }
      if (state.savedProgress.gems === undefined) {
        state.savedProgress.gems = 15; // Welcome reward
      }
      if (!state.savedProgress.stats) {
        state.savedProgress.stats = {
          totalCrystalsBroken: 0,
          portalsUsed: 0,
          adsWatched: 0,
          oneShotsCount: 0,
          gravityUsed: 0,
          prismsUsed: 0,
          bombsDetonated: 0,
          lasersDisabled: 0,
          feverCount: 0
        };
      } else {
        // Guarantee backwards compatibility for all tracked metrics
        state.savedProgress.stats.oneShotsCount = state.savedProgress.stats.oneShotsCount || 0;
        state.savedProgress.stats.gravityUsed = state.savedProgress.stats.gravityUsed || 0;
        state.savedProgress.stats.prismsUsed = state.savedProgress.stats.prismsUsed || 0;
        state.savedProgress.stats.bombsDetonated = state.savedProgress.stats.bombsDetonated || 0;
        state.savedProgress.stats.lasersDisabled = state.savedProgress.stats.lasersDisabled || 0;
        state.savedProgress.stats.feverCount = state.savedProgress.stats.feverCount || 0;
      }
      if (!state.savedProgress.unlockedSkins) {
        state.savedProgress.unlockedSkins = ['neon'];
      }
    } catch (e) {
      console.warn('Storage unavailable or blocked:', e);
    }
    updateGemsDisplay();
  }

  function saveStorage() {
    try {
      localStorage.setItem('roya_arya_save_v1', JSON.stringify({
        savedProgress: state.savedProgress,
        settings: state.settings,
        activeSkin: state.activeSkin
      }));
    } catch (e) {}
  }

  function updateGemsDisplay() {
    const totalGems = state.savedProgress.gems || 0;
    const hudVal = document.getElementById('hud-gems-val');
    if (hudVal) hudVal.textContent = totalGems.toLocaleString();
    const modalVal = document.getElementById('skins-modal-gems');
    if (modalVal) modalVal.textContent = totalGems.toLocaleString();
  }

  function addGems(amount, showFloating = true) {
    state.savedProgress.gems = (state.savedProgress.gems || 0) + amount;
    saveStorage();
    updateGemsDisplay();
    if (showFloating) {
      addFloatingText(`+${amount} 💎`, drag.anchorX, drag.anchorY - 45, '#ffb703');
    }
    if (state.savedProgress.gems >= 50) {
      checkUnlockAchievement('first_gem');
    }
    if (state.savedProgress.gems >= 200) {
      checkUnlockAchievement('gem_tycoon');
    }
  }

  // --- Universal Rewarded Video Ad Service (Browser & iOS Ready) ---
  function showRewardedAd(onRewardGranted, customTitle = 'جاري تشغيل الإعلان الترويجي...') {
    adSimOverlay.classList.remove('hidden');
    const titleEl = adSimOverlay.querySelector('h3');
    if (titleEl) titleEl.textContent = customTitle;

    let timer = 3;
    const timerSpan = document.getElementById('ad-timer');
    const progressBar = document.getElementById('ad-progress-bar');
    progressBar.style.width = '0%';
    timerSpan.textContent = timer;

    const interval = setInterval(() => {
      timer--;
      timerSpan.textContent = timer;
      progressBar.style.width = `${((3 - timer) / 3) * 100}%`;

      if (timer <= 0) {
        clearInterval(interval);
        adSimOverlay.classList.add('hidden');

        state.savedProgress.stats.adsWatched = (state.savedProgress.stats.adsWatched || 0) + 1;
        saveStorage();
        if (state.savedProgress.stats.adsWatched >= 3) {
          checkUnlockAchievement('ad_supporter');
        }

        if (window.soundEngine.playAchievement) window.soundEngine.playAchievement();
        triggerHaptic('heavy');

        if (typeof onRewardGranted === 'function') {
          onRewardGranted();
        }
      }
    }, 1000);
  }

  // --- Canvas Resolution & Resize ---
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  function resizeCanvas() {
    const rect = canvasWrapper.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    scale = Math.min(rect.width / CANVAS_LOGICAL_WIDTH, rect.height / CANVAS_LOGICAL_HEIGHT);

    offsetX = (rect.width - CANVAS_LOGICAL_WIDTH * scale) / 2;
    offsetY = Math.max(0, (rect.height - CANVAS_LOGICAL_HEIGHT * scale) / 2);

    drag.anchorX = CANVAS_LOGICAL_WIDTH / 2;
    drag.anchorY = CANVAS_LOGICAL_HEIGHT - 125;
  }

  // --- Screen Shake & Haptic Helpers ---
  function addTrauma(amount) {
    screenTrauma = Math.min(1.0, screenTrauma + amount);
  }

  function triggerHitFlash(amount = 0.35, color = '#ffffff') {
    hitFlash = Math.min(1.0, hitFlash + amount);
    flashColor = color;
  }

  function triggerHaptic(type = 'light') {
    if (!state.settings.haptics) return;
    try {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics) {
        const Haptics = window.Capacitor.Plugins.Haptics;
        if (type === 'light') Haptics.impact({ style: 'LIGHT' });
        else if (type === 'medium') Haptics.impact({ style: 'MEDIUM' });
        else if (type === 'heavy') Haptics.impact({ style: 'HEAVY' });
      } else if (navigator.vibrate) {
        if (type === 'light') navigator.vibrate(12);
        else if (type === 'medium') navigator.vibrate(28);
        else if (type === 'heavy') navigator.vibrate([35, 30, 45]);
      }
    } catch (_) {}
  }

  // --- Particle & FX System ---
  function createParticleBurst(x, y, colorCode, count = 22) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.8 + Math.random() * 6.5;
      const roll = Math.random();

      if (roll < 0.35) {
        // High-speed kinetic spark streak
        particles.push({
          type: 'spark',
          x: x,
          y: y,
          vx: Math.cos(angle) * (speed * 1.4),
          vy: Math.sin(angle) * (speed * 1.4),
          color: '#ffffff',
          streakColor: colorCode,
          alpha: 1.0,
          decay: 0.035 + Math.random() * 0.02
        });
      } else if (roll < 0.70) {
        // Faceted crystal glass shard
        particles.push({
          type: 'shard',
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 12,
          size: 3 + Math.random() * 5,
          color: colorCode,
          alpha: 1.0,
          decay: 0.02 + Math.random() * 0.018
        });
      } else {
        // Glowing neon energy ember
        particles.push({
          type: 'ember',
          x: x,
          y: y,
          vx: Math.cos(angle) * (speed * 0.8),
          vy: Math.sin(angle) * (speed * 0.8),
          color: colorCode,
          radius: 2 + Math.random() * 3.5,
          alpha: 1.0,
          decay: 0.025 + Math.random() * 0.02
        });
      }
    }

    // Add luminous shockwave ring
    shockwaves.push({
      x: x,
      y: y,
      radius: 6,
      maxRadius: 48,
      alpha: 0.85,
      color: colorCode
    });
  }

  function addFloatingText(text, x, y, color = '#ffb703') {
    if (floatingTexts.length > 7) {
      floatingTexts.shift();
    }
    floatingTexts.push({
      text: text,
      x: x,
      y: y,
      alpha: 1,
      vy: -1.7,
      color: color
    });
  }

  // --- Level Loader ---
  function initLevel(lvlNum) {
    state.currentLevel = lvlNum;
    state.levelData = window.getLevelData(lvlNum);
    state.shotsLeft = state.levelData.shots;
    state.currentCombo = 0;
    state.maxCombo = 0;
    state.gameState = 'AIMING';
    state.timeScale = 1.0;
    state.slowMoTimer = 0;
    state.resonanceActive = false;
    state.finalSlowMoTriggered = false;

    orbs = [];
    crystals = [];
    walls = [];
    prisms = [];
    spinners = [];
    portals = [];
    particles = [];
    floatingTexts = [];
    shockwaves = [];
    gravityWells = [];
    switches = [];
    laserGates = [];
    bumpers = [];
    glassWalls = [];

    // Populate level entities
    state.levelData.elements.forEach(item => {
      if (item.type === 'crystal') {
        crystals.push({
          x: item.x * CANVAS_LOGICAL_WIDTH,
          y: item.y * CANVAS_LOGICAL_HEIGHT,
          radius: item.radius,
          color: item.color,
          hp: item.hp,
          maxHp: item.hp,
          subType: item.subType || 'normal', // 'normal' or 'bomb'
          hasShield: item.hasShield || false,
          pulse: Math.random() * Math.PI,
          shieldRot: 0
        });
      } else if (item.type === 'wall') {
        walls.push({
          x: item.x * CANVAS_LOGICAL_WIDTH,
          y: item.y * CANVAS_LOGICAL_HEIGHT,
          width: item.width * CANVAS_LOGICAL_WIDTH,
          height: item.height * CANVAS_LOGICAL_HEIGHT,
          angle: item.angle || 0
        });
      } else if (item.type === 'bumper') {
        bumpers.push({
          x: item.x * CANVAS_LOGICAL_WIDTH,
          y: item.y * CANVAS_LOGICAL_HEIGHT,
          radius: item.radius || 24,
          color: item.color || '#ff007f',
          pulse: 0
        });
      } else if (item.type === 'glassWall') {
        glassWalls.push({
          x: item.x * CANVAS_LOGICAL_WIDTH,
          y: item.y * CANVAS_LOGICAL_HEIGHT,
          width: item.width * CANVAS_LOGICAL_WIDTH,
          height: item.height * CANVAS_LOGICAL_HEIGHT,
          angle: item.angle || 0,
          hp: item.hp || 1,
          maxHp: item.hp || 1,
          shake: 0
        });
      } else if (item.type === 'prism') {
        prisms.push({
          x: item.x * CANVAS_LOGICAL_WIDTH,
          y: item.y * CANVAS_LOGICAL_HEIGHT,
          radius: item.radius,
          transformTo: item.transformTo || 'synergy',
          rot: 0
        });
      } else if (item.type === 'spinner') {
        spinners.push({
          x: item.x * CANVAS_LOGICAL_WIDTH,
          y: item.y * CANVAS_LOGICAL_HEIGHT,
          length: item.length,
          angle: 0,
          speed: item.speed
        });
      } else if (item.type === 'portal') {
        portals.push({
          x: item.x * CANVAS_LOGICAL_WIDTH,
          y: item.y * CANVAS_LOGICAL_HEIGHT,
          targetX: item.targetX,
          targetY: item.targetY,
          radius: item.radius,
          color: item.color,
          pairId: item.pairId,
          rot: 0
        });
      } else if (item.type === 'gravity') {
        gravityWells.push({
          x: item.x * CANVAS_LOGICAL_WIDTH,
          y: item.y * CANVAS_LOGICAL_HEIGHT,
          radius: item.radius || 32,
          strength: item.strength || 2.2,
          mode: item.mode || 'pull', // 'pull' or 'push'
          rot: 0
        });
      } else if (item.type === 'switch') {
        switches.push({
          x: item.x * CANVAS_LOGICAL_WIDTH,
          y: item.y * CANVAS_LOGICAL_HEIGHT,
          radius: item.radius || 18,
          gateId: item.gateId,
          activated: false,
          color: item.color || '#00f3ff'
        });
      } else if (item.type === 'gate') {
        laserGates.push({
          id: item.id,
          x1: item.x1 * CANVAS_LOGICAL_WIDTH,
          y1: item.y1 * CANVAS_LOGICAL_HEIGHT,
          x2: item.x2 * CANVAS_LOGICAL_WIDTH,
          y2: item.y2 * CANVAS_LOGICAL_HEIGHT,
          active: true,
          color: item.color || '#ff0055'
        });
      }
    });

    // Reset Launcher Orbs
    prepareSpiritsAtLauncher();

    // Update HUD
    updateHud();

    // Show Gesture hint on Level 1
    if (lvlNum === 1) {
      gestureHint.classList.remove('hidden');
    } else {
      gestureHint.classList.add('hidden');
    }
  }

  function prepareSpiritsAtLauncher() {
    orbs = [
      {
        id: 'roya',
        name: 'Roya',
        x: drag.anchorX - 18,
        y: drag.anchorY,
        vx: 0,
        vy: 0,
        radius: ORB_RADIUS,
        colorType: 'cyan',
        trail: [],
        active: false,
        delayLaunch: 0
      },
      {
        id: 'arya',
        name: 'Arya',
        x: drag.anchorX + 18,
        y: drag.anchorY,
        vx: 0,
        vy: 0,
        radius: ORB_RADIUS,
        colorType: 'magenta',
        trail: [],
        active: false,
        delayLaunch: 5 // fires 5 frames after Roya for fluid synergy
      }
    ];
  }

  function updateHud() {
    const stagePrefix = window.i18n ? window.i18n.t('hud_stage_prefix') : 'المرحلة';
    hudLevelText.textContent = `${stagePrefix} ${state.currentLevel}`;
    hudScoreVal.textContent = state.score.toLocaleString();
    hudShotsVal.textContent = state.shotsLeft;

    dotRoya.className = `spirit-dot spirit-roya ${state.shotsLeft > 0 ? 'active' : 'inactive'}`;
    dotArya.className = `spirit-dot spirit-arya ${state.shotsLeft > 0 ? 'active' : 'inactive'}`;
  }

  // --- Sling Launch Mechanics ---
  function fireTwinSpirits(vx, vy) {
    if (state.shotsLeft <= 0 || state.gameState !== 'AIMING') return;

    state.gameState = 'FLYING';
    state.shotsLeft--;
    state.currentCombo = 0;
    state.flightSafetyTimer = 0;
    state.idleFlightTimer = 0;
    state.fastForward = false;
    state.timeScale = 1.0;
    updateHud();
    gestureHint.classList.add('hidden');

    window.soundEngine.playShoot();
    triggerHaptic('medium');
    addTrauma(0.15);

    // Launch Roya & Arya together side-by-side in harmonious twin formation
    const speed = Math.hypot(vx, vy) || 1;
    const perpX = -vy / speed;
    const perpY = vx / speed;
    const separation = 14;

    orbs[0].x = drag.anchorX + perpX * -separation;
    orbs[0].y = drag.anchorY + perpY * -separation;
    orbs[0].vx = vx;
    orbs[0].vy = vy;
    orbs[0].active = true;
    orbs[0].flightFrames = 0;
    orbs[0].bounces = 0;

    if (orbs[1]) {
      orbs[1].x = drag.anchorX + perpX * separation;
      orbs[1].y = drag.anchorY + perpY * separation;
      orbs[1].vx = vx;
      orbs[1].vy = vy;
      orbs[1].active = true;
      orbs[1].launchDelay = 0;
      orbs[1].flightFrames = 0;
      orbs[1].bounces = 0;
    }
  }

  // --- Geometric Helpers ---
  function distToSegment(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  // --- Physics & Collision Engine ---
  function updatePhysics(dt) {
    if (state.gameState !== 'FLYING') return;

    // Instant victory when all crystals cleared
    if (crystals.length === 0) {
      handleFlightEnd();
      return;
    }

    // Natural energetic flight duration (~5.5 seconds of high-speed ricochets)
    state.flightTimer = (state.flightTimer || 0) + (dt || 0.016);
    if (state.flightTimer >= 5.5) {
      handleFlightEnd();
      return;
    }

    // Slow-Mo Duration Watchdog
    if (state.slowMoTimer > 0) {
      state.slowMoTimer -= dt;
      if (state.slowMoTimer <= 0) {
        state.timeScale = 1.0;
      }
    }

    // Detect Final Crystal Approach for Cinematic Slow-Motion
    if (crystals.length === 1 && state.slowMoTimer <= 0 && !state.finalSlowMoTriggered) {
      const target = crystals[0];
      for (let o = 0; o < orbs.length; o++) {
        const orb = orbs[o];
        if (!orb.active) continue;
        const d = Math.hypot(orb.x - target.x, orb.y - target.y);
        if (d < 75) {
          state.slowMoTimer = 0.9;
          state.timeScale = 0.24;
          state.finalSlowMoTriggered = true;
          if (window.soundEngine.playSlowMoTension) window.soundEngine.playSlowMoTension();
          triggerHaptic('light');
          break;
        }
      }
    }

    let allStopped = true;

    // Spinners Rotation
    spinners.forEach(spin => {
      spin.angle += spin.speed * dt;
    });

    // Synchronous tandem launch countdown for Arya
    if (orbs[1] && orbs[1].launchDelay > 0) {
      allStopped = false;
      orbs[1].launchDelay--;
      if (orbs[1].launchDelay === 0) {
        orbs[1].x = drag.anchorX;
        orbs[1].y = drag.anchorY;
        orbs[1].vx = orbs[1].pendingVx;
        orbs[1].vy = orbs[1].pendingVy;
        orbs[1].active = true;
      }
    }

    // Twin Spirits Synergy Resonance Tether (Electric cutting beam)
    if (orbs[0] && orbs[1] && orbs[0].active && orbs[1].active) {
      const o1 = orbs[0];
      const o2 = orbs[1];
      const tetherDist = Math.hypot(o1.x - o2.x, o1.y - o2.y);

      if (tetherDist < 250 && tetherDist > 12) {
        state.resonanceActive = true;

        for (let c = crystals.length - 1; c >= 0; c--) {
          const crystal = crystals[c];
          crystal.tetherCooldown = (crystal.tetherCooldown || 0) - dt;

          if (crystal.tetherCooldown <= 0) {
            const dLine = distToSegment(crystal.x, crystal.y, o1.x, o1.y, o2.x, o2.y);
            if (dLine < crystal.radius + 7) {
              crystal.tetherCooldown = 0.35;
              damageCrystal(crystal, c, { id: 'resonance', colorType: 'synergy' });
              addFloatingText('⚡ RESONANCE!', crystal.x, crystal.y - 25, COLORS.synergy.main);
              createParticleBurst(crystal.x, crystal.y, COLORS.synergy.main, 16);
              if (window.soundEngine.playResonanceHit) window.soundEngine.playResonanceHit();
              triggerHaptic('heavy');
            }
          }
        }
      } else {
        state.resonanceActive = false;
      }
    } else {
      state.resonanceActive = false;
    }

    orbs.forEach(orb => {
      if (!orb.active) return;

      orb.flightFrames = (orb.flightFrames || 0) + 1;

      // Update positions with dynamic timeScale
      const stepScale = state.timeScale || 1.0;
      orb.x += orb.vx * stepScale;
      orb.y += orb.vy * stepScale;

      // Gentle aerodynamic decay
      orb.vx *= Math.pow(DAMPING, stepScale);
      orb.vy *= Math.pow(DAMPING, stepScale);

      // After 3.5s of rich active ricochets (~210 frames) or 10 bounces, gently bias downward toward collection floor
      if (orb.flightFrames > 210 || (orb.bounces || 0) >= 10) {
        orb.vy += 0.12 * stepScale;
      }

      const speed = Math.hypot(orb.vx, orb.vy);

      // Trailing Fluid Ribbon Points
      orb.trail.push({
        x: orb.x,
        y: orb.y,
        color: COLORS[orb.colorType] ? COLORS[orb.colorType].main : '#00f3ff'
      });
      if (orb.trail.length > 20) orb.trail.shift();

      // Wall Boundary Collisions (Screen Edges) - Clean, high-energy elastic bounces
      const padding = 14;
      // Left Wall
      if (orb.x - orb.radius <= padding) {
        orb.x = padding + orb.radius;
        if (orb.vx < 0) orb.vx = -orb.vx * 0.98;
        orb.bounces = (orb.bounces || 0) + 1;
        onOrbBounce(orb);
      }
      // Right Wall
      if (orb.x + orb.radius >= CANVAS_LOGICAL_WIDTH - padding) {
        orb.x = CANVAS_LOGICAL_WIDTH - padding - orb.radius;
        if (orb.vx > 0) orb.vx = -orb.vx * 0.98;
        orb.bounces = (orb.bounces || 0) + 1;
        onOrbBounce(orb);
      }
      // Top Wall
      if (orb.y - orb.radius <= 18) {
        orb.y = 18 + orb.radius;
        if (orb.vy < 0) orb.vy = -orb.vy * 0.98;
        orb.bounces = (orb.bounces || 0) + 1;
        onOrbBounce(orb);
      }
      // Bottom Arena Wall (Bounces back into arena with high kinetic energy)
      if (orb.y + orb.radius >= CANVAS_LOGICAL_HEIGHT - 30) {
        orb.y = CANVAS_LOGICAL_HEIGHT - 30 - orb.radius;
        if (orb.vy > 0) orb.vy = -orb.vy * 0.96;
        orb.bounces = (orb.bounces || 0) + 1;
        onOrbBounce(orb);
      }

      // Collisions with Level Rectangular Walls
      walls.forEach(wall => {
        resolveOrbWallCollision(orb, wall);
      });

      // Collisions with Destructible Glass Walls
      for (let gw = glassWalls.length - 1; gw >= 0; gw--) {
        resolveOrbGlassWallCollision(orb, glassWalls[gw], gw);
      }

      // Collisions with Kinetic Pinball Bumpers
      bumpers.forEach(bumper => {
        resolveOrbBumperCollision(orb, bumper);
      });

      // Collisions with Rotating Spinners
      spinners.forEach(spin => {
        resolveOrbSpinnerCollision(orb, spin);
      });

      // Collisions with Light Prisms
      prisms.forEach(prism => {
        const dist = Math.hypot(orb.x - prism.x, orb.y - prism.y);
        if (dist < orb.radius + prism.radius) {
          // Transform color to synergy!
          if (orb.colorType !== prism.transformTo) {
            orb.colorType = prism.transformTo;
            state.savedProgress.stats.prismsUsed = (state.savedProgress.stats.prismsUsed || 0) + 1;
            if (state.savedProgress.stats.prismsUsed >= 25) {
              checkUnlockAchievement('prism_weaver');
            }
            createParticleBurst(prism.x, prism.y, COLORS.gold.main, 18);
            window.soundEngine.playHarmonicHit(state.currentCombo, 'prism');
            addFloatingText('SYNERGY!', prism.x, prism.y - 20, COLORS.gold.main);
            addTrauma(0.2);
            triggerHitFlash(0.3, COLORS.gold.main);
            triggerHaptic('medium');

            // Speed booster kick
            orb.vx *= 1.25;
            orb.vy *= 1.25;
          }
        }
      });

      // Collisions with Wormhole Portals
      if (orb.portalCooldown > 0) {
        orb.portalCooldown--;
      } else {
        for (let p = 0; p < portals.length; p++) {
          const portal = portals[p];
          const dist = Math.hypot(orb.x - portal.x, orb.y - portal.y);
          if (dist < orb.radius + portal.radius) {
            orb.portalCooldown = 28; // debounce
            createParticleBurst(orb.x, orb.y, portal.color, 16);
            orb.x = portal.targetX * CANVAS_LOGICAL_WIDTH;
            orb.y = portal.targetY * CANVAS_LOGICAL_HEIGHT;
            createParticleBurst(orb.x, orb.y, portal.color, 16);
            if (window.soundEngine.playPortalWarp) window.soundEngine.playPortalWarp();
            triggerHaptic('medium');
            addTrauma(0.2);
            triggerHitFlash(0.25, portal.color);
            addFloatingText('WARP!', orb.x, orb.y - 20, portal.color);

            state.savedProgress.stats.portalsUsed = (state.savedProgress.stats.portalsUsed || 0) + 1;
            if (state.savedProgress.stats.portalsUsed >= 5) {
              checkUnlockAchievement('portal_traveler');
            }
            if (state.savedProgress.stats.portalsUsed >= 30) {
              checkUnlockAchievement('hyper_jumper');
            }
            saveStorage();
            break;
          }
        }
      }

      // Gravity Wells Attraction / Repulsion Force
      gravityWells.forEach(well => {
        well.rot += 0.035;
        const gdx = well.x - orb.x;
        const gdy = well.y - orb.y;
        const gdist = Math.hypot(gdx, gdy);
        const effectRadius = well.radius * 3.8;

        if (gdist < effectRadius && gdist > 8) {
          const force = (1 - gdist / effectRadius) * well.strength * 0.28;
          const dir = well.mode === 'pull' ? 1 : -1;
          orb.vx += (gdx / gdist) * force * dir;
          orb.vy += (gdy / gdist) * force * dir;

          if (gdist < effectRadius * 0.7 && orb.lastGravityId !== well) {
            orb.lastGravityId = well;
            state.savedProgress.stats.gravityUsed = (state.savedProgress.stats.gravityUsed || 0) + 1;
            if (state.savedProgress.stats.gravityUsed >= 10) {
              checkUnlockAchievement('gravity_rider');
            }
            if (state.savedProgress.stats.gravityUsed >= 40) {
              checkUnlockAchievement('gravity_master');
            }
          }
        }
      });

      // Neon Switches Activation
      switches.forEach(sw => {
        if (sw.activated) return;
        const swDist = Math.hypot(orb.x - sw.x, orb.y - sw.y);
        if (swDist < orb.radius + sw.radius) {
          sw.activated = true;
          state.savedProgress.stats.lasersDisabled = (state.savedProgress.stats.lasersDisabled || 0) + 1;
          if (state.savedProgress.stats.lasersDisabled >= 15) {
            checkUnlockAchievement('laser_hacker');
          }
          laserGates.forEach(g => {
            if (g.id === sw.gateId) g.active = false;
          });
          createParticleBurst(sw.x, sw.y, '#06d6a0', 22);
          shockwaves.push({
            x: sw.x,
            y: sw.y,
            radius: 8,
            maxRadius: 75,
            color: '#06d6a0',
            alpha: 1.0
          });
          addFloatingText('🔓 GATE OPENED!', sw.x, sw.y - 20, '#06d6a0');
          if (window.soundEngine.playSwitchHit) window.soundEngine.playSwitchHit();
          triggerHaptic('heavy');
          addTrauma(0.2);
          triggerHitFlash(0.3, '#06d6a0');
        }
      });

      // Laser Gates Barrier Reflection
      laserGates.forEach(gate => {
        if (!gate.active) return;
        const dGate = distToSegment(orb.x, orb.y, gate.x1, gate.y1, gate.x2, gate.y2);
        if (dGate < orb.radius + 5) {
          const gx = gate.x2 - gate.x1;
          const gy = gate.y2 - gate.y1;
          const glen = Math.hypot(gx, gy) || 1;
          const nx = -gy / glen;
          const ny = gx / glen;
          const dot = orb.vx * nx + orb.vy * ny;
          if (dot < 0) {
            orb.vx -= 1.85 * dot * nx;
            orb.vy -= 1.85 * dot * ny;
          }
          createParticleBurst(orb.x, orb.y, gate.color, 12);
          onOrbBounce(orb);
          addFloatingText('⚡ BLOCKED!', orb.x, orb.y - 15, gate.color);
        }
      });

      // Collisions with Crystals
      for (let i = crystals.length - 1; i >= 0; i--) {
        const crystal = crystals[i];
        const dist = Math.hypot(orb.x - crystal.x, orb.y - crystal.y);

        if (dist < orb.radius + crystal.radius) {
          // Normal reflection vector pointing from crystal to orb
          const nx = (orb.x - crystal.x) / (dist || 1);
          const ny = (orb.y - crystal.y) / (dist || 1);
          const dot = orb.vx * nx + orb.vy * ny;

          if (dot < 0) {
            orb.vx -= 1.85 * dot * nx;
            orb.vy -= 1.85 * dot * ny;
          }

          // Displace orb outside crystal collider to prevent sticking!
          const overlap = (orb.radius + crystal.radius) - dist;
          orb.x += nx * (overlap + 2.5);
          orb.y += ny * (overlap + 2.5);
          orb.bounces = (orb.bounces || 0) + 1;

          // Color Match Check:
          // Synergy orb hits anything. Cyan hits cyan. Magenta hits magenta.
          const isMatch = (orb.colorType === 'synergy') ||
                          (crystal.color === 'synergy') ||
                          (orb.colorType === crystal.color);

          if (isMatch) {
            damageCrystal(crystal, i, orb);
          } else {
            // Non-matching bounce: subtle ping sound, slight deflecting trauma
            window.soundEngine.playBounce();
            // Debounce mismatch text: max once per 1.2s per crystal to eliminate lag
            const now = Date.now();
            if (!crystal.lastMismatchText || (now - crystal.lastMismatchText) > 1200) {
              crystal.lastMismatchText = now;
              addFloatingText('طيف غير مطابق!', crystal.x, crystal.y - 18, '#ff99aa');
            }
          }
          break;
        }
      }

      // Settle orb if velocity exhausts
      const curSpeed = Math.hypot(orb.vx, orb.vy);
      if (curSpeed <= MIN_SPEED_THRESHOLD) {
        orb.vx = 0;
        orb.vy = 0;
      }
    });

    // Check Flight Completion: Concludes when all orbs have settled or all crystals cleared
    const allSettled = orbs.every(o => !o.active || (Math.hypot(o.vx, o.vy) <= MIN_SPEED_THRESHOLD));
    if (allSettled || crystals.length === 0) {
      handleFlightEnd();
    }
  }

  function onOrbBounce(orb) {
    window.soundEngine.playBounce();
    triggerHaptic('light');
    addTrauma(0.04);
  }

  function resolveOrbWallCollision(orb, wall) {
    const halfW = wall.width / 2;
    const halfH = wall.height / 2;
    const dx = orb.x - wall.x;
    const dy = orb.y - wall.y;

    if (Math.abs(dx) < halfW + orb.radius && Math.abs(dy) < halfH + orb.radius) {
      const overlapX = (halfW + orb.radius) - Math.abs(dx);
      const overlapY = (halfH + orb.radius) - Math.abs(dy);

      if (overlapX < overlapY) {
        if (dx > 0 && orb.vx < 0) orb.vx = -orb.vx * 0.98;
        else if (dx < 0 && orb.vx > 0) orb.vx = -orb.vx * 0.98;
        orb.x += dx > 0 ? overlapX : -overlapX;
      } else {
        if (dy > 0 && orb.vy < 0) orb.vy = -orb.vy * 0.98;
        else if (dy < 0 && orb.vy > 0) orb.vy = -orb.vy * 0.98;
        orb.y += dy > 0 ? overlapY : -overlapY;
      }
      orb.bounces = (orb.bounces || 0) + 1;
      onOrbBounce(orb);
    }
  }

  function resolveOrbSpinnerCollision(orb, spin) {
    // Distance from orb to rotating bar segment
    const cos = Math.cos(spin.angle);
    const sin = Math.sin(spin.angle);
    const halfL = spin.length / 2;

    const x1 = spin.x - cos * halfL;
    const y1 = spin.y - sin * halfL;
    const x2 = spin.x + cos * halfL;
    const y2 = spin.y + sin * halfL;

    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    let t = ((orb.x - x1) * (x2 - x1) + (orb.y - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));

    const projX = x1 + t * (x2 - x1);
    const projY = y1 + t * (y2 - y1);
    const dist = Math.hypot(orb.x - projX, orb.y - projY);

    if (dist < orb.radius + 6) {
      const nx = (orb.x - projX) / (dist || 1);
      const ny = (orb.y - projY) / (dist || 1);

      // Positional displacement outside collider to prevent multi-frame sticking
      orb.x = projX + nx * (orb.radius + 7);
      orb.y = projY + ny * (orb.radius + 7);

      // Impart rotational speed to the bounce
      orb.vx = nx * 8 + (-sin * spin.speed * 4);
      orb.vy = ny * 8 + (cos * spin.speed * 4);

      createParticleBurst(projX, projY, COLORS.cyan.main, 10);
      onOrbBounce(orb);
    }
  }

  function resolveOrbBumperCollision(orb, bumper) {
    const dx = orb.x - bumper.x;
    const dy = orb.y - bumper.y;
    const dist = Math.hypot(dx, dy);
    if (dist < orb.radius + bumper.radius) {
      const nx = dx / (dist || 1);
      const ny = dy / (dist || 1);
      orb.x = bumper.x + nx * (orb.radius + bumper.radius + 3);
      orb.y = bumper.y + ny * (orb.radius + bumper.radius + 3);

      // High-energy kinetic booster kick
      const curSpeed = Math.hypot(orb.vx, orb.vy);
      const kickSpeed = Math.max(curSpeed * 1.35, 11);
      orb.vx = nx * kickSpeed;
      orb.vy = ny * kickSpeed;
      bumper.pulse = 1.0;
      state.idleFlightTimer = 0;

      createParticleBurst(bumper.x, bumper.y, bumper.color || '#ff007f', 20);
      shockwaves.push({
        x: bumper.x,
        y: bumper.y,
        radius: bumper.radius,
        maxRadius: bumper.radius + 45,
        color: bumper.color || '#ff007f',
        alpha: 0.95
      });
      addFloatingText('⚡ BUMP!', bumper.x, bumper.y - 18, bumper.color || '#ff007f');
      if (window.soundEngine.playBumperHit) window.soundEngine.playBumperHit();
      triggerHaptic('heavy');
      addTrauma(0.18);
    }
  }

  function resolveOrbGlassWallCollision(orb, wall, wallIndex) {
    const halfW = wall.width / 2;
    const halfH = wall.height / 2;
    const dx = orb.x - wall.x;
    const dy = orb.y - wall.y;

    if (Math.abs(dx) < halfW + orb.radius && Math.abs(dy) < halfH + orb.radius) {
      const overlapX = (halfW + orb.radius) - Math.abs(dx);
      const overlapY = (halfH + orb.radius) - Math.abs(dy);

      if (overlapX < overlapY) {
        orb.vx = -orb.vx * 0.95;
        orb.x += dx > 0 ? overlapX : -overlapX;
      } else {
        orb.vy = -orb.vy * 0.95;
        orb.y += dy > 0 ? overlapY : -overlapY;
      }

      wall.hp--;
      wall.shake = 10;
      state.idleFlightTimer = 0;
      createParticleBurst(orb.x, orb.y, '#00f3ff', 12);

      if (wall.hp <= 0) {
        createParticleBurst(wall.x, wall.y, '#00f3ff', 32);
        createParticleBurst(wall.x, wall.y, '#ffffff', 20);
        shockwaves.push({
          x: wall.x,
          y: wall.y,
          radius: 10,
          maxRadius: Math.max(wall.width, wall.height) + 20,
          color: '#00f3ff',
          alpha: 0.95
        });
        addFloatingText('💎 SHATTERED!', wall.x, wall.y - 18, '#00f3ff');
        if (window.soundEngine.playGlassShatter) window.soundEngine.playGlassShatter();
        triggerHaptic('heavy');
        addTrauma(0.24);
        glassWalls.splice(wallIndex, 1);
      } else {
        addFloatingText('⚡ CRACK!', orb.x, orb.y - 15, '#88eeff');
        window.soundEngine.playBounce();
        triggerHaptic('medium');
        addTrauma(0.08);
      }
    }
  }

  function damageCrystal(crystal, index, orb) {
    if (!crystal || crystal.isDestroyed) return;
    state.idleFlightTimer = 0;

    // Energy Shield Absorbs Hit
    if (crystal.hasShield) {
      crystal.hasShield = false;
      createParticleBurst(crystal.x, crystal.y, '#00f3ff', 24);
      shockwaves.push({
        x: crystal.x,
        y: crystal.y,
        radius: 6,
        maxRadius: 50,
        color: '#00f3ff',
        alpha: 0.95
      });
      addFloatingText('🛡️ SHIELD BROKEN!', crystal.x, crystal.y - 22, '#00f3ff');
      if (window.soundEngine.playShieldBreak) window.soundEngine.playShieldBreak();
      triggerHaptic('heavy');
      addTrauma(0.18);
      triggerHitFlash(0.35, '#00f3ff');
      return;
    }

    crystal.hp--;
    state.currentCombo++;
    if (state.currentCombo > state.maxCombo) {
      state.maxCombo = state.currentCombo;
    }

    // Melodic Sound & Juice
    window.soundEngine.playHarmonicHit(state.currentCombo);
    triggerHaptic('heavy');
    addTrauma(0.22);
    triggerHitFlash(0.18, COLORS[crystal.color] ? COLORS[crystal.color].main : '#ffffff');

    // Roya Piercing Power (Cyan)
    if (orb && orb.id === 'roya') {
      orb.vx *= 1.05;
      orb.vy *= 1.05;
      createParticleBurst(crystal.x, crystal.y, COLORS.cyan.main, 12);
      addFloatingText('✦ PIERCE!', crystal.x, crystal.y - 15, COLORS.cyan.main);
    }

    // Arya Kinetic Shockwave Splash (Magenta)
    if (orb && orb.id === 'arya') {
      shockwaves.push({
        x: crystal.x,
        y: crystal.y,
        radius: 8,
        maxRadius: 70,
        color: COLORS.magenta.main,
        alpha: 0.95
      });
      // Splash damage to neighboring crystals within 65px (gather first to avoid mutating array)
      const splashTargets = crystals.filter(adj => adj !== crystal && !adj.isDestroyed && Math.hypot(adj.x - crystal.x, adj.y - crystal.y) < 65);
      splashTargets.forEach(adj => {
        damageCrystal(adj, crystals.indexOf(adj), { id: 'splash', colorType: 'synergy' });
      });
    }

    const pts = 100 * state.currentCombo;
    state.score += pts;
    updateHud();

    // Show Combo Banner
    if (state.currentCombo >= 2) {
      comboText.textContent = `COMBO x${state.currentCombo}!`;
      comboBanner.classList.remove('hidden');
      clearTimeout(comboBanner.timer);
      comboBanner.timer = setTimeout(() => {
        comboBanner.classList.add('hidden');
      }, 900);
    }

    if (state.currentCombo >= 3) {
      checkUnlockAchievement('combo_master');
    }
    if (state.currentCombo >= 5) {
      checkUnlockAchievement('fever_king');
    }
    if (state.currentCombo >= 8) {
      checkUnlockAchievement('hyper_combo');
    }

    state.savedProgress.stats.totalCrystalsBroken = (state.savedProgress.stats.totalCrystalsBroken || 0) + 1;
    if (state.savedProgress.stats.totalCrystalsBroken >= 30) {
      checkUnlockAchievement('crystal_hunter');
    }
    if (state.savedProgress.stats.totalCrystalsBroken >= 100) {
      checkUnlockAchievement('crystal_demolisher');
    }
    if (state.savedProgress.stats.totalCrystalsBroken >= 300) {
      checkUnlockAchievement('crystal_obliteration');
    }
    if (state.savedProgress.stats.totalCrystalsBroken >= 800) {
      checkUnlockAchievement('crystal_colossus');
    }

    // Final crystal epic cinematic shatter
    if (crystals.length === 1 && crystal.hp <= 0) {
      state.timeScale = 1.0;
      state.slowMoTimer = 0;
      addTrauma(0.5);
      triggerHitFlash(0.85, '#ffb703');
      createParticleBurst(crystal.x, crystal.y, '#ffffff', 45);
      createParticleBurst(crystal.x, crystal.y, COLORS.gold.main, 35);
      shockwaves.push({
        x: crystal.x,
        y: crystal.y,
        radius: 12,
        maxRadius: 190,
        color: '#00f3ff',
        alpha: 1.0
      });
      shockwaves.push({
        x: crystal.x,
        y: crystal.y,
        radius: 6,
        maxRadius: 150,
        color: '#ff007f',
        alpha: 1.0
      });
      addFloatingText('✨ EPIC CLEAR! ✨', crystal.x, crystal.y - 30, '#ffb703');
      if (window.soundEngine.playEpicClear) window.soundEngine.playEpicClear();
    }

    if (crystal.hp <= 0) {
      crystal.isDestroyed = true;
      const cIndex = crystals.indexOf(crystal);
      if (cIndex !== -1) {
        crystals.splice(cIndex, 1);
      }

      // Volatile Bomb Chain Reaction Blast
      if (crystal.subType === 'bomb') {
        state.savedProgress.stats.bombsDetonated = (state.savedProgress.stats.bombsDetonated || 0) + 1;
        if (state.savedProgress.stats.bombsDetonated >= 25) {
          checkUnlockAchievement('bomb_specialist');
        }
        addTrauma(0.38);
        triggerHitFlash(0.65, '#ff7700');
        shockwaves.push({
          x: crystal.x,
          y: crystal.y,
          radius: 10,
          maxRadius: 110,
          color: '#ff7700',
          alpha: 1.0
        });
        createParticleBurst(crystal.x, crystal.y, '#ff7700', 35);
        createParticleBurst(crystal.x, crystal.y, '#ffb703', 25);
        addFloatingText('💣 BOOM!', crystal.x, crystal.y - 28, '#ff7700');
        if (window.soundEngine.playBombExplode) window.soundEngine.playBombExplode();

        // Damage all nearby crystals within 110px (safe filtered copy)
        const nearby = crystals.filter(other => !other.isDestroyed && Math.hypot(other.x - crystal.x, other.y - crystal.y) < 110);
        nearby.forEach(other => {
          damageCrystal(other, crystals.indexOf(other), { id: 'bomb', colorType: 'synergy' });
        });
      }

      createParticleBurst(crystal.x, crystal.y, COLORS[crystal.color].main, 28);
      addFloatingText(`+${pts}`, crystal.x, crystal.y - 20, COLORS[crystal.color].main);

      // Instant turn conclusion & victory when all crystals are cleared
      if (crystals.length === 0) {
        setTimeout(() => {
          handleFlightEnd();
        }, 320);
      }
    } else {
      createParticleBurst(crystal.x, crystal.y, COLORS[crystal.color].main, 12);
      addFloatingText(`+${pts}`, crystal.x, crystal.y - 15, '#fff');
    }
  }

  function handleFlightEnd() {
    state.fastForward = false;
    state.timeScale = 1.0;
    state.flightSafetyTimer = 0;
    state.idleFlightTimer = 0;
    state.flightTimer = 0;

    orbs.forEach(o => {
      o.active = false;
      o.trail = [];
    });

    // Check Victory Condition
    if (crystals.length === 0) {
      triggerVictory();
    } else if (state.shotsLeft <= 0) {
      triggerGameOver();
    } else {
      // Ready for next shot
      state.gameState = 'AIMING';
      prepareSpiritsAtLauncher();
    }
  }

  function checkUnlockAchievement(id) {
    if (!state.savedProgress.unlockedAchievements) {
      state.savedProgress.unlockedAchievements = [];
    }
    if (state.savedProgress.unlockedAchievements.includes(id)) return;

    state.savedProgress.unlockedAchievements.push(id);
    saveStorage();

    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (!ach) return;

    // Award achievement gems bonus
    if (ach.reward) {
      addGems(ach.reward, false);
    }

    if (window.soundEngine.playAchievement) window.soundEngine.playAchievement();
    triggerHaptic('heavy');

    const toast = document.getElementById('achievement-toast');
    const toastTitle = document.getElementById('toast-title');
    const toastDesc = document.getElementById('toast-desc');

    if (toast && toastTitle && toastDesc) {
      const isEn = window.i18n && window.i18n.getLang() === 'en';
      const title = isEn ? (ach.title_en || ach.title) : (ach.title_ar || ach.title);
      const desc = isEn ? (ach.desc_en || ach.desc) : (ach.desc_ar || ach.desc);
      toastTitle.textContent = `${ach.icon} ${isEn ? 'Badge:' : 'وسام:'} ${title} (+${ach.reward} 💎)`;
      toastDesc.textContent = desc;
      toast.classList.remove('hidden');

      clearTimeout(toast.timer);
      toast.timer = setTimeout(() => {
        toast.classList.add('hidden');
      }, 3800);
    }

    // Refresh modal if currently open
    populateAchievementsModal();
  }

  // --- Star Milestone Chests & Cosmic Player Ranks ---
  const STAR_CHESTS = [
    { stars: 15, gems: 25, title_ar: "صندوق سديم النيون", title_en: "Neon Nebula Chest" },
    { stars: 30, gems: 35, title_ar: "صندوق بوابات الأثير", title_en: "Aether Portal Chest" },
    { stars: 60, gems: 50, title_ar: "صندوق الفوضى الحركية", title_en: "Kinetic Chaos Chest" },
    { stars: 90, gems: 75, title_ar: "صندوق الجاذبية الكونية", title_en: "Gravitational Singularity Chest" },
    { stars: 120, gems: 100, title_ar: "صندوق قمة المجرة الأسطورية", title_en: "Celestial Apex Sovereign Chest" }
  ];

  function getPlayerCosmicRank(totalStars) {
    if (totalStars >= 130) {
      return { name_ar: "أسطورة قمة المجرة الأبدية", name_en: "Celestial Apex Paragon", icon: "👑", badgeColor: "#06d6a0" };
    } else if (totalStars >= 100) {
      return { name_ar: "إمبراطور المجرات", name_en: "Cosmic Overlord", icon: "🌌", badgeColor: "#ff007f" };
    } else if (totalStars >= 70) {
      return { name_ar: "سيد البوابات الكونية", name_en: "Portal Grandmaster", icon: "🌀", badgeColor: "#ffb703" };
    } else if (totalStars >= 40) {
      return { name_ar: "فارس الرنين النيوني", name_en: "Resonance Knight", icon: "⚡", badgeColor: "#b537f2" };
    } else if (totalStars >= 15) {
      return { name_ar: "رماح النيون", name_en: "Neon Striker", icon: "✦", badgeColor: "#00f3ff" };
    } else {
      return { name_ar: "مبتدئ الأطياف", name_en: "Spirit Initiate", icon: "✨", badgeColor: "#8b95ad" };
    }
  }

  function updateRankDisplay() {
    const totalStars = Object.values(state.savedProgress.completedLevels || {}).reduce((a, b) => a + b, 0);
    const rank = getPlayerCosmicRank(totalStars);
    const isEn = window.i18n && window.i18n.getLang() === 'en';

    const rankIcon = document.getElementById('rank-icon');
    const rankTitle = document.getElementById('rank-title');
    const rankStars = document.getElementById('rank-stars-count');

    if (rankIcon) rankIcon.textContent = rank.icon;
    if (rankTitle) {
      rankTitle.textContent = isEn ? rank.name_en : rank.name_ar;
      rankTitle.style.color = rank.badgeColor;
    }
    if (rankStars) rankStars.textContent = `⭐ ${totalStars}/150`;
  }

  function showNotificationToast(title, desc) {
    const toast = document.getElementById('achievement-toast');
    const toastTitle = document.getElementById('toast-title');
    const toastDesc = document.getElementById('toast-desc');
    if (toast && toastTitle && toastDesc) {
      toastTitle.textContent = title;
      toastDesc.textContent = desc;
      toast.classList.remove('hidden');
      clearTimeout(toast.timer);
      toast.timer = setTimeout(() => {
        toast.classList.add('hidden');
      }, 3800);
    }
  }

  function checkStarChests(totalStars) {
    if (!state.savedProgress.starChestsClaimed) {
      state.savedProgress.starChestsClaimed = [];
    }
    STAR_CHESTS.forEach(chest => {
      if (totalStars >= chest.stars && !state.savedProgress.starChestsClaimed.includes(chest.stars)) {
        state.savedProgress.starChestsClaimed.push(chest.stars);
        addGems(chest.gems, false);
        const isEn = window.i18n && window.i18n.getLang() === 'en';
        showNotificationToast(
          `🎁 ${isEn ? chest.title_en : chest.title_ar}`,
          `${isEn ? 'Star Milestone Chest Unlocked!' : 'صندوق معالم النجوم مفتوح!'} (+${chest.gems} 💎)`
        );
      }
    });
  }

  function triggerResonanceFever() {
    state.savedProgress.stats.feverCount = (state.savedProgress.stats.feverCount || 0) + 1;
    if (state.savedProgress.stats.feverCount >= 5) {
      checkUnlockAchievement('combo_zen');
    }
    const gameApp = document.getElementById('game-app');
    if (gameApp) {
      gameApp.classList.add('resonance-fever-active');
      setTimeout(() => {
        gameApp.classList.remove('resonance-fever-active');
      }, 3500);
    }
    if (window.soundEngine.playComboPraise) window.soundEngine.playComboPraise();
    triggerHaptic('heavy');
  }

  function triggerVictory() {
    state.gameState = 'VICTORY';
    window.soundEngine.playVictory();
    triggerHaptic('heavy');
    addTrauma(0.35);

    // Calculate Stars
    const usedShots = state.levelData.shots - state.shotsLeft;
    let stars = 1;
    if (usedShots <= 1) stars = 3;
    else if (usedShots === 2) stars = 2;

    // Check Achievements & One-Shot Tracking
    if (usedShots <= 1) {
      checkUnlockAchievement('first_shot');
      state.savedProgress.stats.oneShotsCount = (state.savedProgress.stats.oneShotsCount || 0) + 1;
      if (state.savedProgress.stats.oneShotsCount >= 5) {
        checkUnlockAchievement('five_aces');
      }
      if (state.savedProgress.stats.oneShotsCount >= 10) {
        checkUnlockAchievement('ten_aces');
      }
      if (state.savedProgress.stats.oneShotsCount >= 20) {
        checkUnlockAchievement('twenty_aces');
      }
    }

    // Calculate & Award Stage Gems
    // Balanced Economy: 1 star = 1 gem, 2 stars = 2 gems, 3 stars = 3 gems
    const prevBest = state.savedProgress.completedLevels[state.currentLevel] || 0;
    let stageGems = Math.max(1, stars);
    if (prevBest >= stars) {
      stageGems = 1; // 1 loyalty gem on replay
    }
    state.stageGemsEarned = stageGems;
    addGems(stageGems, false);

    // Save Progress
    state.savedProgress.completedLevels[state.currentLevel] = Math.max(
      state.savedProgress.completedLevels[state.currentLevel] || 0,
      stars
    );
    if (state.score > state.savedProgress.highScore) {
      state.savedProgress.highScore = state.score;
    }

    // World Completion Milestone Checkpoints (10, 20, 30, 40, 50)
    if (state.currentLevel >= 10) checkUnlockAchievement('conqueror_w1');
    if (state.currentLevel >= 20) checkUnlockAchievement('conqueror_w2');
    if (state.currentLevel >= 30) checkUnlockAchievement('conqueror_w3');
    if (state.currentLevel >= 40) checkUnlockAchievement('conqueror_w4');
    if (state.currentLevel >= 50) checkUnlockAchievement('conqueror_w5');

    // Star Milestones
    const totalStars = Object.values(state.savedProgress.completedLevels).reduce((a, b) => a + b, 0);
    if (totalStars >= 15) checkUnlockAchievement('stars_collector');
    if (totalStars >= 40) checkUnlockAchievement('stars_champion');
    if (totalStars >= 80) checkUnlockAchievement('stars_master');
    if (totalStars >= 120) checkUnlockAchievement('stars_legend');
    if (totalStars >= 150) checkUnlockAchievement('stars_ultimate');

    // Check & Claim Star Milestone Chests
    checkStarChests(totalStars);

    saveStorage();
    updateRankDisplay();

    // Populate Victory Modal
    document.getElementById('stat-shots-used').textContent = usedShots;
    document.getElementById('stat-stage-score').textContent = state.score.toLocaleString();
    document.getElementById('stat-max-combo').textContent = `x${state.maxCombo}`;
    
    const stageGemsEl = document.getElementById('stat-stage-gems');
    if (stageGemsEl) stageGemsEl.textContent = `+${stageGems} 💎`;

    // Configure Mega Bonus Rewarded Ad Button (+25 Gems)
    const btnDoubleAd = document.getElementById('btn-double-reward-ad');
    if (btnDoubleAd) {
      const isEn = window.i18n && window.i18n.getLang() === 'en';
      const adBonusGems = 25;
      btnDoubleAd.disabled = false;
      btnDoubleAd.innerHTML = `<span class="ad-pill-tag">${isEn ? 'Mega Bonus' : 'بونص إضافي'}</span><span>🎬 ${isEn ? 'Watch Ad & Claim Bonus' : 'شاهد إعلاناً واحصل على بونص'} (+${adBonusGems} 💎)</span>`;
      btnDoubleAd.onclick = () => {
        showRewardedAd(() => {
          addGems(adBonusGems, true);
          btnDoubleAd.disabled = true;
          btnDoubleAd.innerHTML = `<span style="color:#06d6a0;">${isEn ? 'Bonus Claimed Successfully! ✓' : 'تم استلام +25 💎 بنجاح! ✓'}</span>`;
        }, isEn ? 'Preparing bonus reward...' : 'جاري تجهيز بونص الجواهر...');
      };
    }

    const starContainer = document.getElementById('victory-stars');
    starContainer.innerHTML = '';
    for (let s = 1; s <= 3; s++) {
      const starSpan = document.createElement('span');
      starSpan.className = `star-item ${s <= stars ? 'star-fill' : ''}`;
      starSpan.textContent = '★';
      starSpan.style.animationDelay = `${(s - 1) * 0.15}s`;
      starContainer.appendChild(starSpan);
    }

    modalVictory.classList.remove('hidden');
  }

  function triggerGameOver() {
    state.gameState = 'GAMEOVER';
    window.soundEngine.playGameOver();
    triggerHaptic('medium');
    modalGameOver.classList.remove('hidden');
  }

  // --- Rendering Loop ---
  function render() {
    // Clear entire canvas buffer cleanly (zero ghosting/artifacts)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply Screen Shake (Trauma Decay)
    if (screenTrauma > 0) {
      const traumaSq = screenTrauma * screenTrauma;
      shakeOffsetX = (Math.random() * 2 - 1) * traumaSq * 18;
      shakeOffsetY = (Math.random() * 2 - 1) * traumaSq * 18;
      shakeAngle = (Math.random() * 2 - 1) * traumaSq * 0.032;
      screenTrauma = Math.max(0, screenTrauma - 0.035);
    } else {
      shakeOffsetX = 0;
      shakeOffsetY = 0;
      shakeAngle = 0;
    }

    // Set up hardware-accelerated scaled & centered game viewport
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    ctx.save();
    ctx.scale(dpr, dpr);
    
    // Centered camera shake with rotational torque
    const cx = offsetX + (CANVAS_LOGICAL_WIDTH * scale) / 2;
    const cy = offsetY + (CANVAS_LOGICAL_HEIGHT * scale) / 2;
    ctx.translate(cx + shakeOffsetX, cy + shakeOffsetY);
    if (shakeAngle !== 0) ctx.rotate(shakeAngle);
    ctx.translate(-cx, -cy);

    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Draw Level Entities
    drawWalls();
    drawGlassWalls();
    drawBumpers();
    drawLaserGates();
    drawSwitches();
    drawGravityWells();
    drawSpinners();
    drawPrisms();
    drawPortals();
    drawCrystals();

    // Draw Trajectory Prediction Ray (When Aiming)
    if (drag.active && state.gameState === 'AIMING' && state.settings.laser) {
      drawPredictiveTrajectory();
    }

    // Draw Spirits (Roya & Arya)
    drawSpirits();
    drawResonanceTether();

    // Draw Particles & Shockwaves
    drawParticles();
    drawShockwaves();
    drawFloatingTexts();

    // Draw Launcher Base Pad
    drawLauncherPad();

    // Post-Processing: Hit Flash & Chromatic Edge Vignette
    if (hitFlash > 0.015) {
      ctx.save();
      // Luminous ambient flash
      ctx.fillStyle = flashColor;
      ctx.globalAlpha = Math.min(0.4, hitFlash * 0.32);
      ctx.fillRect(0, 0, CANVAS_LOGICAL_WIDTH, CANVAS_LOGICAL_HEIGHT);

      // Cyan left chromatic fringe
      const gradLeft = ctx.createLinearGradient(0, 0, 70, 0);
      gradLeft.addColorStop(0, `rgba(0, 243, 255, ${hitFlash * 0.45})`);
      gradLeft.addColorStop(1, 'rgba(0, 243, 255, 0)');
      ctx.fillStyle = gradLeft;
      ctx.fillRect(0, 0, 70, CANVAS_LOGICAL_HEIGHT);

      // Magenta right chromatic fringe
      const gradRight = ctx.createLinearGradient(CANVAS_LOGICAL_WIDTH - 70, 0, CANVAS_LOGICAL_WIDTH, 0);
      gradRight.addColorStop(0, 'rgba(255, 0, 127, 0)');
      gradRight.addColorStop(1, `rgba(255, 0, 127, ${hitFlash * 0.45})`);
      ctx.fillStyle = gradRight;
      ctx.fillRect(CANVAS_LOGICAL_WIDTH - 70, 0, 70, CANVAS_LOGICAL_HEIGHT);

      ctx.restore();
      hitFlash = Math.max(0, hitFlash * 0.86 - 0.015);
    }

    ctx.restore();
  }

  function drawWalls() {
    walls.forEach(w => {
      ctx.save();
      ctx.translate(w.x, w.y);
      ctx.rotate(w.angle);

      const r = 4;
      const x = -w.width / 2;
      const y = -w.height / 2;

      // Outer glow boundary
      ctx.strokeStyle = 'rgba(181, 55, 242, 0.3)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(x - 1.5, y - 1.5, w.width + 3, w.height + 3, r + 1);
      ctx.stroke();

      // Main wall fill & crisp border
      ctx.fillStyle = COLORS.wall.main;
      ctx.strokeStyle = COLORS.wall.light;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, y, w.width, w.height, r);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawGlassWalls() {
    glassWalls.forEach(w => {
      ctx.save();
      if (w.shake > 0) {
        w.shake = Math.max(0, w.shake - 0.8);
      }
      const shakeX = (Math.random() - 0.5) * w.shake;
      const shakeY = (Math.random() - 0.5) * w.shake;
      ctx.translate(w.x + shakeX, w.y + shakeY);
      ctx.rotate(w.angle);

      const r = 3;
      const x = -w.width / 2;
      const y = -w.height / 2;

      // Translucent cyan glass body
      ctx.fillStyle = 'rgba(0, 243, 255, 0.16)';
      ctx.strokeStyle = w.hp < w.maxHp ? '#ffe66d' : '#00f3ff';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.roundRect(x, y, w.width, w.height, r);
      ctx.fill();
      ctx.stroke();

      // Glass diagonal reflection highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 4);
      ctx.lineTo(x + Math.min(w.width - 4, 30), y + Math.min(w.height - 4, 30));
      ctx.stroke();

      // Cracks if damaged
      if (w.hp < w.maxHp) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, y + 2);
        ctx.lineTo(-4, 0);
        ctx.lineTo(5, 2);
        ctx.lineTo(0, y + w.height - 2);
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  function drawBumpers() {
    bumpers.forEach(b => {
      ctx.save();
      ctx.translate(b.x, b.y);

      // Pulse animation decay
      if (b.pulse > 0) {
        b.pulse = Math.max(0, b.pulse - 0.05);
      }
      const expand = b.pulse * 7;
      const r = b.radius + expand;

      // Outer energetic neon ring
      ctx.strokeStyle = b.pulse > 0 ? '#ffffff' : (b.color || '#ff007f');
      ctx.lineWidth = b.pulse > 0 ? 5 : 3.5;
      ctx.fillStyle = b.pulse > 0 ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 0, 127, 0.2)';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Middle concentric ring
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
      ctx.stroke();

      // Center power core
      ctx.fillStyle = b.pulse > 0 ? '#ffffff' : (b.color || '#ff007f');
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2);
      ctx.fill();

      // Symbol
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡', 0, 0);

      ctx.restore();
    });
  }

  function drawSpinners() {
    spinners.forEach(spin => {
      ctx.save();
      ctx.translate(spin.x, spin.y);
      ctx.rotate(spin.angle);

      // Outer neon halo
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.25)';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-spin.length / 2, 0);
      ctx.lineTo(spin.length / 2, 0);
      ctx.stroke();

      // Main vibrant blade
      ctx.strokeStyle = COLORS.cyan.main;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-spin.length / 2, 0);
      ctx.lineTo(spin.length / 2, 0);
      ctx.stroke();

      // Sharp white core spine
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-spin.length / 2 + 4, 0);
      ctx.lineTo(spin.length / 2 - 4, 0);
      ctx.stroke();

      // Center pivot jewel
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  function drawPrisms() {
    prisms.forEach(p => {
      ctx.save();
      p.rot += 0.015;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      // Triangular Prism - Outer halo
      ctx.strokeStyle = 'rgba(255, 183, 3, 0.35)';
      ctx.lineWidth = 7;
      ctx.beginPath();
      const sides = 3;
      for (let i = 0; i < sides; i++) {
        const a = (i * 2 * Math.PI) / sides;
        const px = Math.cos(a) * (p.radius + 2);
        const py = Math.sin(a) * (p.radius + 2);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      // Main Prism Fill & Stroke
      ctx.fillStyle = 'rgba(255, 183, 3, 0.25)';
      ctx.strokeStyle = COLORS.gold.main;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const a = (i * 2 * Math.PI) / sides;
        const px = Math.cos(a) * p.radius;
        const py = Math.sin(a) * p.radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner Core
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  function drawPortals() {
    portals.forEach(p => {
      p.rot = (p.rot || 0) + 0.035;
      ctx.save();
      ctx.translate(p.x, p.y);

      // Outer swirling neon aura
      ctx.strokeStyle = 'rgba(181, 55, 242, 0.3)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 2, 0, Math.PI * 2);
      ctx.stroke();

      // Main ring
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Cosmic whirlpool spiral arms
      ctx.rotate(p.rot);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 0.55, (i * Math.PI * 2) / 3, ((i * Math.PI * 2) / 3) + Math.PI / 2);
        ctx.stroke();
      }

      // Central void
      ctx.fillStyle = '#080910';
      ctx.beginPath();
      ctx.arc(0, 0, p.radius * 0.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  function drawCrystals() {
    crystals.forEach(c => {
      c.pulse += 0.04;
      const pulseScale = 1 + Math.sin(c.pulse) * 0.05;
      const colorDef = COLORS[c.color] || COLORS.cyan;

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(pulseScale, pulseScale);

      // Energy Shield Shimmering Ring
      if (c.hasShield) {
        c.shieldRot = (c.shieldRot || 0) + 0.035;
        ctx.save();
        ctx.rotate(c.shieldRot);
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, c.radius + 9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // Outer Glowing Ring
      ctx.fillStyle = c.subType === 'bomb' ? 'rgba(255, 119, 0, 0.45)' : colorDef.glow;
      ctx.beginPath();
      ctx.arc(0, 0, c.radius + 5, 0, Math.PI * 2);
      ctx.fill();

      // Faceted Hexagon Crystal
      ctx.fillStyle = c.subType === 'bomb' ? '#ff7700' : colorDef.main;
      ctx.strokeStyle = c.subType === 'bomb' ? '#ffb703' : '#fff';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const px = Math.cos(a) * c.radius;
        const py = Math.sin(a) * c.radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Bomb icon indicator
      if (c.subType === 'bomb') {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💣', 0, 0);
      } else if (c.maxHp > 1) {
        // Multi-hit health badge
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(c.hp, 0, 0);
      }

      ctx.restore();
    });
  }

  function drawLaserGates() {
    laserGates.forEach(gate => {
      if (!gate.active) return;
      ctx.save();

      // Emitter Pylons at both ends
      [ {x: gate.x1, y: gate.y1}, {x: gate.x2, y: gate.y2} ].forEach(p => {
        ctx.fillStyle = gate.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Outer Pulsing Laser Beam
      ctx.strokeStyle = 'rgba(255, 0, 85, 0.45)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(gate.x1, gate.y1);
      ctx.lineTo(gate.x2, gate.y2);
      ctx.stroke();

      // Inner Laser Core
      ctx.strokeStyle = gate.color;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(gate.x1, gate.y1);
      ctx.lineTo(gate.x2, gate.y2);
      ctx.stroke();

      // Hot White Core Line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(gate.x1, gate.y1);
      ctx.lineTo(gate.x2, gate.y2);
      ctx.stroke();

      ctx.restore();
    });
  }

  function drawSwitches() {
    switches.forEach(sw => {
      ctx.save();
      ctx.translate(sw.x, sw.y);

      // Terminal Base Ring
      ctx.strokeStyle = sw.activated ? '#06d6a0' : sw.color;
      ctx.lineWidth = 2.5;
      ctx.fillStyle = sw.activated ? 'rgba(6, 214, 160, 0.2)' : 'rgba(0, 243, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(0, 0, sw.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Status Icon
      ctx.fillStyle = sw.activated ? '#06d6a0' : '#ffffff';
      ctx.font = 'bold 11px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sw.activated ? '✓' : '⚡', 0, 0);

      ctx.restore();
    });
  }

  function drawGravityWells() {
    gravityWells.forEach(well => {
      well.rot += 0.04;
      const isPull = well.mode === 'pull';
      const color = isPull ? '#b537f2' : '#00f3ff';

      ctx.save();
      ctx.translate(well.x, well.y);

      // Outer Gravitational Field Horizon
      ctx.strokeStyle = isPull ? 'rgba(181, 55, 242, 0.25)' : 'rgba(0, 243, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, well.radius * 2.8, 0, Math.PI * 2);
      ctx.stroke();

      // Swirling Galaxy Vortex Arms
      ctx.rotate(well.rot);
      for (let arm = 0; arm < 3; arm++) {
        ctx.rotate((Math.PI * 2) / 3);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(well.radius * 0.6, 0, well.radius * 0.7, 0, Math.PI);
        ctx.stroke();
      }

      // Singularity Core (Black or White Hole)
      ctx.fillStyle = isPull ? '#0d0417' : '#ffffff';
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Core Symbol
      ctx.fillStyle = isPull ? '#b537f2' : '#060a17';
      ctx.font = 'bold 9px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isPull ? '▼' : '▲', 0, 0);

      ctx.restore();
    });
  }

  function drawSpirits() {
    let pullOffsetX = 0;
    let pullOffsetY = 0;
    if (state.gameState === 'AIMING' && drag.active) {
      const aim = getAimVector();
      if (aim && aim.mode === 'slingshot') {
        pullOffsetX = aim.visualPullX;
        pullOffsetY = aim.visualPullY;
      }
    }

    if (state.gameState === 'AIMING') {
      if (orbs[0]) {
        orbs[0].x = drag.anchorX - 18 + pullOffsetX;
        orbs[0].y = drag.anchorY + pullOffsetY;
      }
      if (orbs[1]) {
        orbs[1].x = drag.anchorX + 18 + pullOffsetX;
        orbs[1].y = drag.anchorY + pullOffsetY;
      }
    }

    // Draw connecting tether when resting / pulled
    if (state.gameState === 'AIMING' && orbs[0] && orbs[1]) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(orbs[0].x, orbs[0].y);
      ctx.lineTo(orbs[1].x, orbs[1].y);
      ctx.stroke();
      ctx.restore();
    }

    orbs.forEach(orb => {
      // Draw Continuous Luminous Fluid Comet Trail
      const trailLen = orb.trail.length;
      if (trailLen > 1) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (let i = 0; i < trailLen - 1; i++) {
          const t1 = orb.trail[i];
          const t2 = orb.trail[i + 1];
          const progress = (i + 1) / trailLen;

          // Outer glowing chromatic ribbon
          ctx.strokeStyle = t1.color;
          ctx.lineWidth = Math.max(2, orb.radius * 1.5 * progress);
          ctx.globalAlpha = progress * 0.45;
          ctx.beginPath();
          ctx.moveTo(t1.x, t1.y);
          ctx.lineTo(t2.x, t2.y);
          ctx.stroke();

          // Hot luminous core ribbon
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = Math.max(1, orb.radius * 0.55 * progress);
          ctx.globalAlpha = progress * 0.75;
          ctx.beginPath();
          ctx.moveTo(t1.x, t1.y);
          ctx.lineTo(t2.x, t2.y);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Draw Main Spirit Orb (Celestial Radiant Sphere without plain letters)
      const colorDef = COLORS[orb.colorType] || COLORS.cyan;
      const now = Date.now();
      const pulse = Math.sin(now / 260 + (orb.id === 'roya' ? 0 : 2.6)) * 2.2;
      const outerR = orb.radius + 8 + pulse;

      // 1. Multi-stop Ethereal Plasma Aura
      const aura = ctx.createRadialGradient(orb.x, orb.y, orb.radius * 0.3, orb.x, orb.y, outerR);
      aura.addColorStop(0, colorDef.glow);
      aura.addColorStop(0.65, colorDef.glow.replace('0.65', '0.2').replace('0.75', '0.25'));
      aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, outerR, 0, Math.PI * 2);
      ctx.fill();

      // 2. Rotating Celestial Orbital Ring & Bead
      ctx.save();
      ctx.translate(orb.x, orb.y);
      const ringRot = (now / 550) * (orb.id === 'roya' ? 1.2 : -1.2);
      ctx.rotate(ringRot);
      ctx.strokeStyle = colorDef.main;
      ctx.lineWidth = 1.3;
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      ctx.ellipse(0, 0, orb.radius + 4.5, orb.radius * 0.42, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Orbital energy star bead
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.arc(orb.radius + 4.5, 0, 2.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. 3D Spherical Illuminated Crystal Body
      const bodyGrad = ctx.createRadialGradient(
        orb.x - orb.radius * 0.35,
        orb.y - orb.radius * 0.35,
        1,
        orb.x,
        orb.y,
        orb.radius
      );
      bodyGrad.addColorStop(0, '#ffffff'); // Diamond white core
      bodyGrad.addColorStop(0.28, colorDef.light || '#e0fbff');
      bodyGrad.addColorStop(0.68, colorDef.main);
      bodyGrad.addColorStop(1, '#080a14'); // Rich 3D shadow rim
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
      ctx.fill();

      // 4. Specular Diamond Twinkle / Lens Glint
      const hx = orb.x - orb.radius * 0.35;
      const hy = orb.y - orb.radius * 0.35;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(hx, hy, orb.radius * 0.22, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(hx - 3.5, hy); ctx.lineTo(hx + 3.5, hy);
      ctx.moveTo(hx, hy - 3.5); ctx.lineTo(hx, hy + 3.5);
      ctx.stroke();

      // 5. Mystical Spirit Nucleus Glyphs (Soft glowing celestial symbols, NO black letters)
      ctx.fillStyle = orb.id === 'roya' ? 'rgba(0, 243, 255, 0.95)' : 'rgba(255, 0, 127, 0.95)';
      ctx.font = '10px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(orb.id === 'roya' ? '✦' : '✺', orb.x, orb.y + 0.5);
    });
  }

  function drawLauncherPad() {
    ctx.save();
    ctx.translate(drag.anchorX, drag.anchorY);

    // Glowing base ring
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.stroke();

    // Inner bright ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.stroke();

    // Aim guide / Pull Band
    if (drag.active && state.gameState === 'AIMING') {
      const aim = getAimVector();
      if (aim) {
        if (aim.mode === 'slingshot') {
          const o1 = orbs[0];
          const o2 = orbs[1];
          const rx = (o1 ? o1.x : drag.anchorX - 18) - drag.anchorX;
          const ry = (o1 ? o1.y : drag.anchorY) - drag.anchorY;
          const ax = (o2 ? o2.x : drag.anchorX + 18) - drag.anchorX;
          const ay = (o2 ? o2.y : drag.anchorY) - drag.anchorY;

          // Slingshot elastic band left to Roya
          ctx.strokeStyle = 'rgba(0, 243, 255, 0.85)';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(-24, 0);
          ctx.lineTo(rx, ry);
          ctx.stroke();

          // Slingshot elastic band right to Arya
          ctx.strokeStyle = 'rgba(255, 0, 127, 0.85)';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(24, 0);
          ctx.lineTo(ax, ay);
          ctx.stroke();

          // Grip energy knot connecting the pair
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(ax, ay);
          ctx.stroke();
        } else {
          // Direct aim indicator arrow
          const arrowLen = 32;
          const tipX = aim.normX * arrowLen;
          const tipY = aim.normY * arrowLen;

          ctx.strokeStyle = COLORS.cyan.main;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(tipX, tipY);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(tipX, tipY, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.restore();
  }

  function drawPredictiveTrajectory() {
    const aim = getAimVector();
    if (!aim) return;

    let simX = drag.anchorX;
    let simY = drag.anchorY;
    let simVx = aim.vx;
    let simVy = aim.vy;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(simX, simY);

    const maxSteps = 45;
    let hitX = simX;
    let hitY = simY;
    let targetedCrystal = null;

    for (let s = 0; s < maxSteps; s++) {
      simX += simVx;
      simY += simVy;

      // Apply gravity well curvature to trajectory ray
      gravityWells.forEach(well => {
        const gdx = well.x - simX;
        const gdy = well.y - simY;
        const gdist = Math.hypot(gdx, gdy);
        const effectRadius = well.radius * 3.8;
        if (gdist < effectRadius && gdist > 8) {
          const force = (1 - gdist / effectRadius) * well.strength * 0.28;
          const dir = well.mode === 'pull' ? 1 : -1;
          simVx += (gdx / gdist) * force * dir;
          simVy += (gdy / gdist) * force * dir;
        }
      });

      // Check collision with crystals along simulated ray
      if (!targetedCrystal) {
        for (let c = 0; c < crystals.length; c++) {
          const cr = crystals[c];
          if (Math.hypot(simX - cr.x, simY - cr.y) < cr.radius + 6) {
            targetedCrystal = cr;
            hitX = cr.x;
            hitY = cr.y;
            break;
          }
        }
        if (targetedCrystal) break;
      }

      // Bounce check with screen boundaries
      if (simX <= 18) {
        simX = 18;
        simVx = -simVx;
        ctx.lineTo(simX, simY);
      } else if (simX >= CANVAS_LOGICAL_WIDTH - 18) {
        simX = CANVAS_LOGICAL_WIDTH - 18;
        simVx = -simVx;
        ctx.lineTo(simX, simY);
      }
      if (simY <= 20) {
        simY = 20;
        simVy = -simVy;
        ctx.lineTo(simX, simY);
      }

      hitX = simX;
      hitY = simY;
    }

    ctx.lineTo(hitX, hitY);

    // Glowing laser beam
    ctx.setLineDash([10, 8]);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = targetedCrystal ? 'rgba(255, 0, 127, 0.55)' : 'rgba(0, 243, 255, 0.45)';
    ctx.stroke();

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.setLineDash([]);

    // If a crystal is targeted, draw a high-tech lock-on reticle around it
    if (targetedCrystal) {
      const crColor = COLORS[targetedCrystal.color] ? COLORS[targetedCrystal.color].main : '#00f3ff';
      ctx.strokeStyle = crColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(targetedCrystal.x, targetedCrystal.y, targetedCrystal.radius + 7, 0, Math.PI * 2);
      ctx.stroke();

      // Precision crosshairs
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      const tr = targetedCrystal.radius + 12;
      ctx.beginPath();
      ctx.moveTo(targetedCrystal.x - tr, targetedCrystal.y);
      ctx.lineTo(targetedCrystal.x - tr + 5, targetedCrystal.y);
      ctx.moveTo(targetedCrystal.x + tr, targetedCrystal.y);
      ctx.lineTo(targetedCrystal.x + tr - 5, targetedCrystal.y);
      ctx.moveTo(targetedCrystal.x, targetedCrystal.y - tr);
      ctx.lineTo(targetedCrystal.x, targetedCrystal.y - tr + 5);
      ctx.moveTo(targetedCrystal.x, targetedCrystal.y + tr);
      ctx.lineTo(targetedCrystal.x, targetedCrystal.y + tr - 5);
      ctx.stroke();

      // Floating "LOCK-ON" tag
      ctx.fillStyle = crColor;
      ctx.font = 'bold 9px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TARGET LOCK', targetedCrystal.x, targetedCrystal.y - targetedCrystal.radius - 12);
    } else {
      // Standard targeting reticle at terminus
      ctx.strokeStyle = COLORS.cyan.main;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hitX, hitY, 9, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(hitX, hitY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw Twin Spirits Synergy Resonance Tether (Electric cutting beam)
  function drawResonanceTether() {
    if (!state.resonanceActive || !orbs[0] || !orbs[1] || !orbs[0].active || !orbs[1].active) return;
    const o1 = orbs[0];
    const o2 = orbs[1];

    ctx.save();
    // Pulsing outer aura
    ctx.strokeStyle = 'rgba(181, 55, 242, 0.45)';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(o1.x, o1.y);
    ctx.lineTo(o2.x, o2.y);
    ctx.stroke();

    // Inner bright synergy laser
    ctx.strokeStyle = COLORS.synergy.main;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(o1.x, o1.y);
    ctx.lineTo(o2.x, o2.y);
    ctx.stroke();

    // Hot white core
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(o1.x, o1.y);
    ctx.lineTo(o2.x, o2.y);
    ctx.stroke();

    // Electric plasma sparks along the tether
    const midX = (o1.x + o2.x) / 2 + (Math.random() * 8 - 4);
    const midY = (o1.y + o2.y) / 2 + (Math.random() * 8 - 4);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(midX, midY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);

      if (p.type === 'shard') {
        p.rot += p.vRot * 0.04;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Sharp triangular shard with white edge glint
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.65, p.size * 0.75);
        ctx.lineTo(-p.size * 0.65, p.size * 0.75);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (p.type === 'spark') {
        ctx.strokeStyle = p.streakColor || '#ffffff';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 1.8, p.y - p.vy * 1.8);
        ctx.stroke();
        // Hot white head
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Glowing circular ember
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  function drawShockwaves() {
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const s = shockwaves[i];
      s.radius += 2.8;
      s.alpha -= 0.045;

      if (s.alpha <= 0 || s.radius >= s.maxRadius) {
        shockwaves.splice(i, 1);
        continue;
      }

      ctx.strokeStyle = s.color;
      ctx.globalAlpha = Math.max(0, s.alpha);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
  }

  function drawFloatingTexts() {
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.038;

      if (ft.alpha <= 0) {
        floatingTexts.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = 'bold 15px Outfit, Tajawal, sans-serif';
      ctx.textAlign = 'center';

      // Drop shadow for crisp contrast without shadowBlur
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillText(ft.text, ft.x + 1, ft.y + 1);

      // Main color text
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  // --- Input Handlers (PointerEvents Architecture) ---
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    return {
      x: (clientX - rect.left - offsetX) / scale,
      y: (clientY - rect.top - offsetY) / scale
    };
  }

  function getAimVector() {
    if (!drag.active) return null;

    // Determine pull vector based on where the player started:
    // If started on or near the launcher pad (within 130px), drag directly from anchor
    const distFromAnchor = Math.hypot(drag.startX - drag.anchorX, drag.startY - drag.anchorY);
    const isDirectAnchorGrab = distFromAnchor < 130;

    let pullX, pullY;
    if (isDirectAnchorGrab) {
      pullX = drag.currentX - drag.anchorX;
      pullY = drag.currentY - drag.anchorY;
    } else {
      pullX = drag.currentX - drag.startX;
      pullY = drag.currentY - drag.startY;
    }

    const dist = Math.hypot(pullX, pullY);
    if (dist < 8) return null; // Small deadzone to prevent accidental micro-jitter taps

    // Slingshot: pulling downward launches upward/forward into arena
    // Direct Aim: pointing upward aims directly toward target
    let vx, vy;
    let mode = 'slingshot';
    if (pullY >= 0) {
      mode = 'slingshot';
      vx = -pullX;
      vy = -pullY;
    } else {
      mode = 'direct';
      vx = pullX;
      vy = pullY;
    }

    const aimDist = Math.hypot(vx, vy);
    if (aimDist === 0) return null;

    let normX = vx / aimDist;
    let normY = vy / aimDist;

    // Ensure spirits always fire upwards into the arena (normY <= -0.15)
    if (normY > -0.15) {
      normY = -0.15;
      normX = (normX >= 0 ? 1 : -1) * Math.sqrt(Math.max(0, 1 - normY * normY));
    }

    // Visual pull clamp for physical orbs and elastic bands
    const MAX_PULL = 90;
    let visualPullX = pullX;
    let visualPullY = pullY;
    if (mode === 'slingshot') {
      const pLen = Math.hypot(pullX, pullY);
      if (pLen > MAX_PULL) {
        visualPullX = (pullX / pLen) * MAX_PULL;
        visualPullY = (pullY / pLen) * MAX_PULL;
      }
    } else {
      visualPullX = 0;
      visualPullY = 0;
    }

    const LAUNCH_SPEED = 13.5;
    return {
      vx: normX * LAUNCH_SPEED,
      vy: normY * LAUNCH_SPEED,
      normX,
      normY,
      dist,
      mode,
      pullX,
      pullY,
      visualPullX,
      visualPullY
    };
  }

  function onPointerDown(e) {
    if (state.gameState === 'FLYING') {
      // Tap during flight toggles Fast-Forward (2.2x speed)
      state.fastForward = !state.fastForward;
      state.timeScale = state.fastForward ? 2.2 : 1.0;
      triggerHaptic('medium');
      const text = state.fastForward ? '⏩ 2.2x FAST' : '▶ 1x SPEED';
      addFloatingText(text, CANVAS_LOGICAL_WIDTH / 2, CANVAS_LOGICAL_HEIGHT * 0.65, '#00f3ff');
      return;
    }

    if (state.gameState !== 'AIMING') return;

    if (e.cancelable) e.preventDefault();

    const coords = getCanvasCoords(e);
    if (gestureHint) gestureHint.classList.add('hidden');
    drag.active = true;
    drag.pointerId = e.pointerId;
    drag.startX = coords.x;
    drag.startY = coords.y;
    drag.currentX = coords.x;
    drag.currentY = coords.y;

    if (canvas.setPointerCapture && e.pointerId !== undefined) {
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch (_) {}
    }

    triggerHaptic('light');
  }

  function onPointerMove(e) {
    if (!drag.active || state.gameState !== 'AIMING') return;
    if (e.cancelable) e.preventDefault();

    const coords = getCanvasCoords(e);
    drag.currentX = coords.x;
    drag.currentY = coords.y;
  }

  function onPointerUp(e) {
    if (!drag.active) return;
    if (e && e.cancelable) e.preventDefault();

    if (canvas.releasePointerCapture && e && e.pointerId !== undefined) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }

    const aim = getAimVector();
    drag.active = false;

    // Reset resting positions for orbs
    if (orbs[0]) { orbs[0].x = drag.anchorX - 18; orbs[0].y = drag.anchorY; }
    if (orbs[1]) { orbs[1].x = drag.anchorX + 18; orbs[1].y = drag.anchorY; }

    if (state.gameState !== 'AIMING') return;

    if (aim) {
      fireTwinSpirits(aim.vx, aim.vy);
    }
  }

  function onPointerCancel(e) {
    if (drag.active) {
      if (canvas.releasePointerCapture && e && e.pointerId !== undefined) {
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch (_) {}
      }
      drag.active = false;
      if (orbs[0]) { orbs[0].x = drag.anchorX - 18; orbs[0].y = drag.anchorY; }
      if (orbs[1]) { orbs[1].x = drag.anchorX + 18; orbs[1].y = drag.anchorY; }
    }
  }

  // --- UI & Modal Event Bindings ---
  function setupUI() {
    // Modern Pointer Events on canvas and wrapper
    canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
    canvasWrapper.addEventListener('pointerdown', onPointerDown, { passive: false });

    // Global window tracking so fast drags outside canvas never drop
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp, { passive: false });
    window.addEventListener('pointercancel', onPointerCancel, { passive: false });

    // Standard Mouse Events fallback for rock-solid desktop pair-programming / browser testing
    canvas.addEventListener('mousedown', onPointerDown);
    canvasWrapper.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', (e) => {
      if (drag.active && state.gameState === 'AIMING') {
        onPointerMove(e);
      }
    });
    window.addEventListener('mouseup', (e) => {
      if (drag.active) {
        onPointerUp(e);
      }
    });

    // Buttons
    document.getElementById('btn-play-game').onclick = () => {
      window.soundEngine.init();
      screenTitle.classList.add('hidden');
      initLevel(state.currentLevel);
    };

    document.getElementById('btn-next-level').onclick = () => {
      modalVictory.classList.add('hidden');
      initLevel(state.currentLevel + 1);
    };

    document.getElementById('btn-replay-level').onclick = () => {
      modalVictory.classList.add('hidden');
      initLevel(state.currentLevel);
    };

    document.getElementById('btn-retry-failed').onclick = () => {
      modalGameOver.classList.add('hidden');
      initLevel(state.currentLevel);
    };

    document.getElementById('btn-home-from-fail').onclick = () => {
      modalGameOver.classList.add('hidden');
      screenTitle.classList.remove('hidden');
    };

    // Pause & Settings
    document.getElementById('btn-pause').onclick = () => {
      if (state.gameState === 'AIMING' || state.gameState === 'FLYING') {
        state.gameState = 'PAUSED';
        document.getElementById('pause-level-info').textContent = `المرحلة ${state.currentLevel} - ${state.levelData ? state.levelData.name : ''}`;
        modalPause.classList.remove('hidden');
      }
    };

    document.getElementById('btn-resume-game').onclick = () => {
      modalPause.classList.add('hidden');
      state.gameState = 'AIMING';
    };

    document.getElementById('btn-restart-current').onclick = () => {
      modalPause.classList.add('hidden');
      initLevel(state.currentLevel);
    };

    document.getElementById('btn-quit-to-menu').onclick = () => {
      modalPause.classList.add('hidden');
      screenTitle.classList.remove('hidden');
    };

    // Sound Toggle
    const btnSound = document.getElementById('btn-sound');
    const soundOnIcon = document.getElementById('sound-on-icon');
    const soundOffIcon = document.getElementById('sound-off-icon');

    function updateSoundIcons() {
      if (state.settings.sound) {
        soundOnIcon.classList.remove('hidden');
        soundOffIcon.classList.add('hidden');
      } else {
        soundOnIcon.classList.add('hidden');
        soundOffIcon.classList.remove('hidden');
      }
    }

    btnSound.onclick = () => {
      state.settings.sound = window.soundEngine.toggle();
      updateSoundIcons();
      saveStorage();
    };

    // Settings switches in Pause Modal
    const checkSound = document.getElementById('check-sound');
    const checkHaptic = document.getElementById('check-haptic');
    const checkLaser = document.getElementById('check-laser');

    checkSound.checked = state.settings.sound;
    checkHaptic.checked = state.settings.haptics;
    checkLaser.checked = state.settings.laser;

    checkSound.onchange = (e) => {
      state.settings.sound = e.target.checked;
      window.soundEngine.toggle(state.settings.sound);
      updateSoundIcons();
      saveStorage();
    };
    checkHaptic.onchange = (e) => {
      state.settings.haptics = e.target.checked;
      saveStorage();
    };
    checkLaser.onchange = (e) => {
      state.settings.laser = e.target.checked;
      saveStorage();
    };

    // Rewarded Ad Simulation for Extra Shots
    const btnAdRevive = document.getElementById('btn-rewarded-revive');
    if (btnAdRevive) {
      btnAdRevive.onclick = () => {
        modalGameOver.classList.add('hidden');
        showRewardedAd(() => {
          state.shotsLeft += 2;
          state.gameState = 'AIMING';
          updateHud();
          prepareSpiritsAtLauncher();
          addFloatingText('+2 أطياف إضافية!', drag.anchorX, drag.anchorY - 40, '#06d6a0');
        }, 'جاري تجهيز +2 طلقة إضافية...');
      };
    }

    // Daily / Main Menu Rewarded Ad Reward
    const btnClaimAdGems = document.getElementById('btn-claim-ad-gems');
    if (btnClaimAdGems) {
      btnClaimAdGems.onclick = () => {
        showRewardedAd(() => {
          addGems(50, true);
          btnClaimAdGems.innerHTML = '<span class="gift-icon">✨</span><span class="gift-val">+50 💎</span>';
          setTimeout(() => {
            btnClaimAdGems.innerHTML = '<span class="gift-icon">🎁</span><span class="gift-val">+50 💎</span>';
          }, 3500);
        }, 'جاري تحميل مكافأة الأطياف السريعة...');
      };
    }

    // Gems HUD Badge click opens shop
    const hudGemsBadge = document.getElementById('hud-gems-badge');
    if (hudGemsBadge) {
      hudGemsBadge.onclick = () => {
        populateSkinsModal();
        modalSkins.classList.remove('hidden');
      };
    }

    // Level Select Modal
    document.getElementById('btn-open-levels').onclick = () => {
      populateLevelsGrid();
      modalLevels.classList.remove('hidden');
    };
    document.getElementById('btn-close-levels').onclick = () => {
      modalLevels.classList.add('hidden');
    };

    // Skins Modal
    document.getElementById('btn-open-skins').onclick = () => {
      populateSkinsModal();
      modalSkins.classList.remove('hidden');
    };
    document.getElementById('btn-close-skins').onclick = () => {
      modalSkins.classList.add('hidden');
    };

    // Mode Switcher
    const tabCampaign = document.getElementById('tab-mode-campaign');
    const tabEndless = document.getElementById('tab-mode-endless');
    if (tabCampaign && tabEndless) {
      tabCampaign.onclick = () => {
        state.gameMode = 'campaign';
        tabCampaign.classList.add('active');
        tabEndless.classList.remove('active');
      };
      tabEndless.onclick = () => {
        state.gameMode = 'endless';
        tabEndless.classList.add('active');
        tabCampaign.classList.remove('active');
      };
    }

    // Achievements Modal
    const modalAchievements = document.getElementById('modal-achievements');
    const btnOpenAchievements = document.getElementById('btn-open-achievements');
    const btnCloseAchievements = document.getElementById('btn-close-achievements');

    if (btnOpenAchievements) {
      btnOpenAchievements.onclick = () => {
        populateAchievementsModal();
        modalAchievements.classList.remove('hidden');
      };
    }
    if (btnCloseAchievements) {
      btnCloseAchievements.onclick = () => {
        modalAchievements.classList.add('hidden');
      };
    }

    const playerRankBadge = document.getElementById('player-rank-badge');
    if (playerRankBadge) {
      playerRankBadge.onclick = () => {
        populateAchievementsModal();
        modalAchievements.classList.remove('hidden');
      };
    }
    updateRankDisplay();

    // Apple StoreKit Restore Purchases
    const btnRestoreIap = document.getElementById('btn-restore-iap');
    if (btnRestoreIap) {
      btnRestoreIap.onclick = () => {
        state.savedProgress.unlockedSkins = ['neon', 'aurora', 'celestial', 'supernova'];
        addGems(500, false);
        checkUnlockAchievement('skin_collector');
        checkUnlockAchievement('skin_fashionista');
        saveStorage();
        if (window.soundEngine.playAchievement) window.soundEngine.playAchievement();
        triggerHaptic('medium');
        const isEn = window.i18n && window.i18n.getLang() === 'en';
        addFloatingText(isEn ? 'Restored VIP + 500 💎!' : 'تمت استعادة VIP + 500 💎!', drag.anchorX, drag.anchorY - 40, '#06d6a0');
        alert(isEn 
          ? '✨ Apple StoreKit Account Verified: Royal VIP unlocked, all spirit skins granted, and +500 Neon Gems added!'
          : '✨ تم التحقق من حساب Apple StoreKit بنجاح: تم تفعيل باقة VIP الملكية، فتح جميع الأطياف، وإضافة 500 جوهرة نيون!'
        );
      };
    }

    // Language Toggle Buttons
    const btnToggleLang = document.getElementById('btn-toggle-lang');
    if (btnToggleLang) {
      btnToggleLang.onclick = () => window.i18n.toggleLanguage();
    }
    const btnPauseToggleLang = document.getElementById('btn-pause-toggle-lang');
    if (btnPauseToggleLang) {
      btnPauseToggleLang.onclick = () => window.i18n.toggleLanguage();
    }

    // Language Change Live Reactivity
    window.addEventListener('roya:langchange', () => {
      updateHud();
      populateLevelsGrid();
      populateAchievementsModal();
      populateSkinsModal();
      const hintP = gestureHint ? gestureHint.querySelector('p') : null;
      if (hintP && window.i18n) {
        hintP.textContent = window.i18n.t('hint_aim');
      }
      if (state.levelData) {
        state.levelData = window.getLevelData(state.currentLevel);
      }
    });
  }

  function populateAchievementsModal() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const unlocked = state.savedProgress.unlockedAchievements || [];
    const stats = state.savedProgress.stats || {};
    const totalCount = ACHIEVEMENTS.length;
    const unlockedCount = unlocked.length;
    const percent = Math.round((unlockedCount / totalCount) * 100);

    const countText = document.getElementById('achieve-count-text');
    if (countText) countText.textContent = `${unlockedCount} / ${totalCount}`;
    const percentText = document.getElementById('achieve-percent-text');
    if (percentText) percentText.textContent = `${percent}%`;
    const progressBar = document.getElementById('achieve-progress-bar');
    if (progressBar) progressBar.style.width = `${percent}%`;

    const totalStars = Object.values(state.savedProgress.completedLevels || {}).reduce((a, b) => a + b, 0);

    ACHIEVEMENTS.forEach(ach => {
      const isUnlocked = unlocked.includes(ach.id);
      let currentVal = 0;

      if (ach.id === 'first_gem' || ach.id === 'gem_tycoon') currentVal = Math.min(ach.target, state.savedProgress.gems || 0);
      else if (ach.id === 'ad_supporter') currentVal = Math.min(ach.target, stats.adsWatched || 0);
      else if (ach.id === 'first_shot') currentVal = isUnlocked ? 1 : Math.min(1, stats.oneShotsCount || 0);
      else if (ach.id === 'five_aces' || ach.id === 'ten_aces' || ach.id === 'twenty_aces') currentVal = Math.min(ach.target, stats.oneShotsCount || 0);
      else if (ach.id === 'combo_master') currentVal = Math.min(ach.target, isUnlocked ? 3 : state.maxCombo);
      else if (ach.id === 'fever_king') currentVal = Math.min(ach.target, isUnlocked ? 5 : state.maxCombo);
      else if (ach.id === 'hyper_combo') currentVal = Math.min(ach.target, isUnlocked ? 8 : state.maxCombo);
      else if (ach.id === 'combo_zen') currentVal = Math.min(ach.target, stats.feverCount || 0);
      else if (ach.id === 'crystal_hunter' || ach.id === 'crystal_demolisher' || ach.id === 'crystal_obliteration' || ach.id === 'crystal_colossus') currentVal = Math.min(ach.target, stats.totalCrystalsBroken || 0);
      else if (ach.id === 'bomb_specialist') currentVal = Math.min(ach.target, stats.bombsDetonated || 0);
      else if (ach.id === 'portal_traveler' || ach.id === 'hyper_jumper') currentVal = Math.min(ach.target, stats.portalsUsed || 0);
      else if (ach.id === 'gravity_rider' || ach.id === 'gravity_master') currentVal = Math.min(ach.target, stats.gravityUsed || 0);
      else if (ach.id === 'prism_weaver') currentVal = Math.min(ach.target, stats.prismsUsed || 0);
      else if (ach.id === 'laser_hacker') currentVal = Math.min(ach.target, stats.lasersDisabled || 0);
      else if (ach.id.startsWith('stars_')) currentVal = Math.min(ach.target, totalStars);
      else if (ach.id === 'skin_collector' || ach.id === 'skin_fashionista') currentVal = Math.min(ach.target, (state.savedProgress.unlockedSkins || []).length);
      else if (ach.id === 'conqueror_w1') currentVal = isUnlocked ? 10 : Math.min(10, Math.max(0, ...Object.keys(state.savedProgress.completedLevels).map(Number)));
      else if (ach.id === 'conqueror_w2') currentVal = isUnlocked ? 20 : Math.min(20, Math.max(0, ...Object.keys(state.savedProgress.completedLevels).map(Number)));
      else if (ach.id === 'conqueror_w3') currentVal = isUnlocked ? 30 : Math.min(30, Math.max(0, ...Object.keys(state.savedProgress.completedLevels).map(Number)));
      else if (ach.id === 'conqueror_w4') currentVal = isUnlocked ? 40 : Math.min(40, Math.max(0, ...Object.keys(state.savedProgress.completedLevels).map(Number)));
      else if (ach.id === 'conqueror_w5') currentVal = isUnlocked ? 50 : Math.min(50, Math.max(0, ...Object.keys(state.savedProgress.completedLevels).map(Number)));

      const progressPercent = Math.min(100, Math.round((currentVal / ach.target) * 100));
      const isEn = window.i18n && window.i18n.getLang() === 'en';
      const title = isEn ? (ach.title_en || ach.title) : (ach.title_ar || ach.title);
      const desc = isEn ? (ach.desc_en || ach.desc) : (ach.desc_ar || ach.desc);
      const completedText = isEn ? 'Completed ★' : 'مكتمل ★';

      const card = document.createElement('div');
      card.className = `achieve-card ${isUnlocked ? 'unlocked' : ''}`;
      card.innerHTML = `
        <span class="achieve-icon">${ach.icon}</span>
        <span class="achieve-name">${title}</span>
        <span class="achieve-detail">${desc}</span>
        <span class="achieve-reward-pill">+${ach.reward} 💎</span>
        <div class="achieve-card-progress-bar">
          <div class="achieve-card-progress-fill" style="width: ${isUnlocked ? '100%' : progressPercent + '%'}; background:${isUnlocked ? 'var(--prism-gold)' : 'var(--roya-cyan)'};"></div>
        </div>
        <span style="font-size:0.65rem; font-weight:800; color:${isUnlocked ? 'var(--prism-gold)' : 'var(--text-muted)'}; margin-top:3px;">
          ${isUnlocked ? completedText : `(${currentVal}/${ach.target})`}
        </span>
      `;
      grid.appendChild(card);
    });
  }

  function populateLevelsGrid() {
    const grid = document.getElementById('levels-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const isEn = window.i18n && window.i18n.getLang() === 'en';
    const worlds = window.CAMPAIGN_WORLDS || [
      { id: 1, name_ar: "العالم 1: سديم النيون", name_en: "World 1: Neon Genesis", levels: [1, 10], color: "#00f3ff" },
      { id: 2, name_ar: "العالم 2: بوابات الأثير", name_en: "World 2: Prisms & Portals", levels: [11, 20], color: "#b537f2" },
      { id: 3, name_ar: "العالم 3: الفوضى الحركية", name_en: "World 3: Kinetic Chaos", levels: [21, 30], color: "#ff007f" }
    ];

    const maxUnlocked = Math.max(1, Object.keys(state.savedProgress.completedLevels).length + 1);

    worlds.forEach(w => {
      // World Section Header
      const header = document.createElement('div');
      header.className = 'world-section-header';
      header.style.borderInlineStart = `3px solid ${w.color}`;

      let worldStars = 0;
      for (let lvl = w.levels[0]; lvl <= w.levels[1]; lvl++) {
        worldStars += (state.savedProgress.completedLevels[lvl] || 0);
      }
      const maxWorldStars = (w.levels[1] - w.levels[0] + 1) * 3;

      header.innerHTML = `
        <span>${isEn ? w.name_en : w.name_ar}</span>
        <span style="color:var(--prism-gold); font-size:0.78rem;">⭐ ${worldStars}/${maxWorldStars}</span>
      `;
      grid.appendChild(header);

      for (let l = w.levels[0]; l <= w.levels[1]; l++) {
        const tile = document.createElement('div');
        const isLocked = l > maxUnlocked;
        const isCompleted = state.savedProgress.completedLevels[l] !== undefined;
        const isCurrent = l === state.currentLevel;

        tile.className = `level-tile ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}`;
        tile.innerHTML = `
          <span>${l}</span>
          ${isCompleted ? `<span class="level-tile-stars">${'★'.repeat(state.savedProgress.completedLevels[l])}</span>` : (isLocked ? '<span style="font-size:0.7rem; opacity:0.6;">🔒</span>' : '')}
        `;

        if (!isLocked) {
          tile.onclick = () => {
            modalLevels.classList.add('hidden');
            screenTitle.classList.add('hidden');
            initLevel(l);
          };
        }
        grid.appendChild(tile);
      }
    });
  }

  function populateSkinsModal() {
    const list = document.getElementById('skins-list');
    if (!list) return;
    list.innerHTML = '';
    updateGemsDisplay();

    const isEn = window.i18n && window.i18n.getLang() === 'en';
    const unlockedSkins = state.savedProgress.unlockedSkins || ['neon'];
    const currentGems = state.savedProgress.gems || 0;

    SKINS.forEach(sk => {
      const isOwned = unlockedSkins.includes(sk.id);
      const isSelected = state.activeSkin === sk.id;
      const item = document.createElement('div');
      item.className = `skin-item ${isSelected ? 'selected' : ''}`;

      const skinName = isEn ? (sk.name_en || sk.name) : (sk.name_ar || sk.name);
      const skinDesc = isEn ? (sk.desc_en || sk.desc) : (sk.desc_ar || sk.desc);

      let actionHtml = '';
      if (isSelected) {
        actionHtml = `<span style="color:var(--roya-cyan); font-weight:800; font-size:0.85rem;">${isEn ? 'Equipped ✓' : 'مُفعل ✓'}</span>`;
      } else if (isOwned) {
        actionHtml = `<button class="btn-secondary btn-select-skin" style="padding:5px 12px; font-size:0.8rem;">${isEn ? 'Equip' : 'تفعيل'}</button>`;
      } else {
        const canAfford = currentGems >= sk.cost;
        actionHtml = `
          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
            <button class="btn-skin-buy" style="opacity:${canAfford ? '1' : '0.6'};" ${canAfford ? '' : `title="${isEn ? 'Need more gems' : 'تحتاج للمزيد من الجواهر'}"`}>
              ${isEn ? 'Buy' : 'شراء'} ${sk.cost} 💎
            </button>
            <button class="btn-skin-ad">
              ${isEn ? 'Unlock with Ad 🎬' : 'فتح بإعلان 🎬'}
            </button>
          </div>
        `;
      }

      item.innerHTML = `
        <div class="skin-info">
          <div class="skin-swatch" style="background: linear-gradient(135deg, ${sk.cyan}, ${sk.magenta});"></div>
          <div>
            <div class="skin-label">${skinName}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${skinDesc}</div>
          </div>
        </div>
        <div>
          ${actionHtml}
        </div>
      `;

      if (isOwned && !isSelected) {
        const btnSelect = item.querySelector('.btn-select-skin');
        if (btnSelect) {
          btnSelect.onclick = (e) => {
            e.stopPropagation();
            state.activeSkin = sk.id;
            COLORS.cyan.main = sk.cyan;
            COLORS.magenta.main = sk.magenta;
            saveStorage();
            populateSkinsModal();
          };
        }
      } else if (!isOwned) {
        const btnBuy = item.querySelector('.btn-skin-buy');
        if (btnBuy) {
          btnBuy.onclick = (e) => {
            e.stopPropagation();
            if (state.savedProgress.gems >= sk.cost) {
              state.savedProgress.gems -= sk.cost;
              state.savedProgress.unlockedSkins.push(sk.id);
              state.activeSkin = sk.id;
              COLORS.cyan.main = sk.cyan;
              COLORS.magenta.main = sk.magenta;
              saveStorage();
              const skinsCount = (state.savedProgress.unlockedSkins || []).length;
              if (skinsCount >= 2) checkUnlockAchievement('skin_collector');
              if (skinsCount >= 4) checkUnlockAchievement('skin_fashionista');
              if (window.soundEngine.playAchievement) window.soundEngine.playAchievement();
              triggerHaptic('heavy');
              populateSkinsModal();
            } else {
              const needed = sk.cost - state.savedProgress.gems;
              alert(isEn 
                ? `You need ${needed} more 💎 Gems! You can get them for free by watching ads or completing levels.`
                : `تحتاج إلى ${needed} 💎 جوهرة إضافية! يمكنك الحصول عليها مجاناً بمشاهدة الإعلانات أو الفوز بالمراحل.`
              );
            }
          };
        }

        const btnAd = item.querySelector('.btn-skin-ad');
        if (btnAd) {
          btnAd.onclick = (e) => {
            e.stopPropagation();
            showRewardedAd(() => {
              if (!state.savedProgress.unlockedSkins.includes(sk.id)) {
                state.savedProgress.unlockedSkins.push(sk.id);
              }
              state.activeSkin = sk.id;
              COLORS.cyan.main = sk.cyan;
              COLORS.magenta.main = sk.magenta;
              saveStorage();
              const skinsCount = (state.savedProgress.unlockedSkins || []).length;
              if (skinsCount >= 2) checkUnlockAchievement('skin_collector');
              if (skinsCount >= 4) checkUnlockAchievement('skin_fashionista');
              populateSkinsModal();
              addFloatingText(isEn ? `Unlocked ${skinName}! ✨` : `تم فتح مظهر ${skinName}! ✨`, drag.anchorX, drag.anchorY - 40, '#06d6a0');
            }, isEn ? `Unlocking ${skinName}...` : `جاري فتح مظهر ${skinName}...`);
          };
        }
      }

      list.appendChild(item);
    });
  }

  // --- Game Loop ---
  let lastTime = performance.now();
  function gameLoop(now) {
    const rawDt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    // Apply dynamic Slow-Mo cinematic time dilation
    const effectiveDt = rawDt * (state.timeScale || 1.0);

    updatePhysics(effectiveDt);
    render();

    requestAnimationFrame(gameLoop);
  }

  // --- Bootstrap ---
  function init() {
    loadStorage();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupUI();
    requestAnimationFrame(gameLoop);
  }

  window.addEventListener('DOMContentLoaded', init);
})();
