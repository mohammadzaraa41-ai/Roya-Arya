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
  const DAMPING = 0.994; // Gentle air drag for elegant deceleration
  const ORB_RADIUS = 13;
  const MAX_DRAG_DIST = 110;
  const LAUNCH_SPEED_FACTOR = 0.22;
  const MIN_SPEED_THRESHOLD = 0.35;

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
    { id: 'aurora', name_ar: 'شفق الفضاء الزمردي', name_en: 'Emerald Space Aurora', desc_ar: 'الزمردي ولهب المرجان', desc_en: 'Vibrant emerald & coral blaze', cyan: '#06d6a0', magenta: '#ff5400', cost: 150 },
    { id: 'celestial', name_ar: 'السديم الملكي', name_en: 'Celestial Royalty', desc_ar: 'البنفسجي والذهب الشمسي', desc_en: 'Royal purple & solar gold', cyan: '#7209b7', magenta: '#ffb703', cost: 300 },
    { id: 'supernova', name_ar: 'شمس السوبرنوفا', name_en: 'Supernova Flare', desc_ar: 'اللهب الشمسي والأرجواني الكوني', desc_en: 'Solar flares & cosmic crimson', cyan: '#ff7700', magenta: '#d90429', cost: 450 }
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
      gems: 50, // Welcome gift 50 gems
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

  // Achievements Definition with Targets and Rewards
  const ACHIEVEMENTS = [
    { id: 'first_gem', icon: '💎', title_ar: 'بريق الأطياف', title_en: 'Spirit Gleam', desc_ar: 'جمع 50 جوهرة نيونية', desc_en: 'Collect 50 neon gems', target: 50, reward: 50, type: 'gems' },
    { id: 'ad_supporter', icon: '🎁', title_ar: 'حليف الأطياف', title_en: 'Spirit Ally', desc_ar: 'مشاهدة إعلان مكافأة ودعم اللعبة', desc_en: 'Watch a rewarded ad to support the game', target: 1, reward: 100, type: 'ads' },
    { id: 'first_shot', icon: '🎯', title_ar: 'قناص الأطياف', title_en: 'One-Shot Ace', desc_ar: 'إنهاء مرحلة بضربة واحدة فقط', desc_en: 'Clear a stage with a single shot', target: 1, reward: 50, type: 'oneshot' },
    { id: 'combo_master', icon: '⚡', title_ar: 'سيد الكومبو', title_en: 'Combo Master', desc_ar: 'تحقيق كومبو x3 أو أكثر', desc_en: 'Reach a combo of x3 or higher', target: 3, reward: 50, type: 'combo' },
    { id: 'crystal_hunter', icon: '💠', title_ar: 'صائد البلورات', title_en: 'Crystal Hunter', desc_ar: 'سحق 30 بلورة نيونية', desc_en: 'Shatter 30 neon crystals', target: 30, reward: 60, type: 'crystals' },
    { id: 'portal_traveler', icon: '🌀', title_ar: 'مسافر الأبعاد', title_en: 'Wormhole Traveler', desc_ar: 'استخدام بوابات الانتقال الفضائي 3 مرات', desc_en: 'Traverse cosmic portals 3 times', target: 3, reward: 50, type: 'portals' },
    { id: 'stars_collector', icon: '🌟', title_ar: 'جامع النجوم', title_en: 'Star Collector', desc_ar: 'جمع 15 نجمة أو أكثر في المراحل', desc_en: 'Collect 15 or more stage stars', target: 15, reward: 80, type: 'stars' },
    { id: 'skin_collector', icon: '🎨', title_ar: 'أناقة النيون', title_en: 'Neon Elegance', desc_ar: 'فتح مظهر نيون جديد للأرواح', desc_en: 'Unlock a new spirit skin', target: 2, reward: 70, type: 'skins' },
    { id: 'harmony_master', icon: '👑', title_ar: 'سيد المجرات', title_en: 'Galaxy Master', desc_ar: 'بلوغ المرحلة 10 وإنهاء العالم الأول', desc_en: 'Conquer Stage 10 and clear World 1', target: 10, reward: 100, type: 'level' }
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
        state.savedProgress.gems = 50; // Welcome reward
      }
      if (!state.savedProgress.stats) {
        state.savedProgress.stats = { totalCrystalsBroken: 0, portalsUsed: 0, adsWatched: 0 };
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
        checkUnlockAchievement('ad_supporter');

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
    floatingTexts.push({
      text: text,
      x: x,
      y: y,
      alpha: 1,
      vy: -1.4,
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
    updateHud();
    gestureHint.classList.add('hidden');

    window.soundEngine.playShoot();
    triggerHaptic('medium');
    addTrauma(0.15);

    // Launch Roya immediately
    orbs[0].x = drag.anchorX;
    orbs[0].y = drag.anchorY;
    orbs[0].vx = vx;
    orbs[0].vy = vy;
    orbs[0].active = true;

    // Launch Arya with deterministic frame countdown (4 frames ~66ms)
    if (orbs[1]) {
      orbs[1].x = drag.anchorX;
      orbs[1].y = drag.anchorY;
      const angle = Math.atan2(vy, vx) + (Math.PI / 36);
      const speed = Math.hypot(vx, vy);
      orbs[1].pendingVx = Math.cos(angle) * speed;
      orbs[1].pendingVy = Math.sin(angle) * speed;
      orbs[1].launchDelay = 4;
      orbs[1].active = false;
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

    // Flight Safety Watchdog (prevents perpetual loops)
    state.flightSafetyTimer = (state.flightSafetyTimer || 0) + (dt || 0.016);
    if (state.flightSafetyTimer > 7.5) {
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

      if (tetherDist < 190 && tetherDist > 15) {
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

      // Update positions
      orb.x += orb.vx;
      orb.y += orb.vy;

      // Air resistance damping
      orb.vx *= DAMPING;
      orb.vy *= DAMPING;

      const speed = Math.hypot(orb.vx, orb.vy);

      // Trailing Fluid Ribbon Points
      orb.trail.push({
        x: orb.x,
        y: orb.y,
        color: COLORS[orb.colorType] ? COLORS[orb.colorType].main : '#00f3ff'
      });
      if (orb.trail.length > 18) orb.trail.shift();

      // Wall Boundary Collisions (Screen Edges)
      const padding = 14;
      // Left Wall
      if (orb.x - orb.radius <= padding) {
        orb.x = padding + orb.radius;
        orb.vx = -orb.vx * 0.95;
        onOrbBounce(orb);
      }
      // Right Wall
      if (orb.x + orb.radius >= CANVAS_LOGICAL_WIDTH - padding) {
        orb.x = CANVAS_LOGICAL_WIDTH - padding - orb.radius;
        orb.vx = -orb.vx * 0.95;
        onOrbBounce(orb);
      }
      // Top Wall
      if (orb.y - orb.radius <= 18) {
        orb.y = 18 + orb.radius;
        orb.vy = -orb.vy * 0.95;
        onOrbBounce(orb);
      }
      // Bottom Launcher Wall (Bounces back into arena, doesn't kill)
      if (orb.y + orb.radius >= CANVAS_LOGICAL_HEIGHT - 30) {
        orb.y = CANVAS_LOGICAL_HEIGHT - 30 - orb.radius;
        orb.vy = -orb.vy * 0.9;
        onOrbBounce(orb);
      }

      // Collisions with Level Rectangular Walls
      walls.forEach(wall => {
        resolveOrbWallCollision(orb, wall);
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
            if (state.savedProgress.stats.portalsUsed >= 3) {
              checkUnlockAchievement('portal_traveler');
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
        }
      });

      // Neon Switches Activation
      switches.forEach(sw => {
        if (sw.activated) return;
        const swDist = Math.hypot(orb.x - sw.x, orb.y - sw.y);
        if (swDist < orb.radius + sw.radius) {
          sw.activated = true;
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
          orb.vx -= 1.9 * dot * nx;
          orb.vy -= 1.9 * dot * ny;
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
          // Normal reflection vector
          const nx = (orb.x - crystal.x) / dist;
          const ny = (orb.y - crystal.y) / dist;
          const dot = orb.vx * nx + orb.vy * ny;

          orb.vx -= 1.9 * dot * nx;
          orb.vy -= 1.9 * dot * ny;

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
            addFloatingText('طيف غير مطابق!', crystal.x, crystal.y - 15, '#888');
          }
          break;
        }
      }

      // Check if orb has settled down
      if (speed > MIN_SPEED_THRESHOLD) {
        allStopped = false;
      } else {
        orb.vx = 0;
        orb.vy = 0;
      }
    });

    // Check Flight Completion
    if (allStopped) {
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
        orb.vx = -orb.vx * 0.95;
        orb.x += dx > 0 ? overlapX : -overlapX;
      } else {
        orb.vy = -orb.vy * 0.95;
        orb.y += dy > 0 ? overlapY : -overlapY;
      }
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

  function damageCrystal(crystal, index, orb) {
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
      // Splash damage to neighboring crystals within 65px
      crystals.forEach((adj, adjIdx) => {
        if (adj !== crystal && Math.hypot(adj.x - crystal.x, adj.y - crystal.y) < 65) {
          adj.hp--;
          createParticleBurst(adj.x, adj.y, COLORS.magenta.main, 10);
          addFloatingText('💥 SPLASH!', adj.x, adj.y - 12, COLORS.magenta.main);
          if (adj.hp <= 0) {
            crystals.splice(adjIdx, 1);
            addGems(1, false);
          }
        }
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

    state.savedProgress.stats.totalCrystalsBroken = (state.savedProgress.stats.totalCrystalsBroken || 0) + 1;
    if (state.savedProgress.stats.totalCrystalsBroken >= 30) {
      checkUnlockAchievement('crystal_hunter');
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
      // Volatile Bomb Chain Reaction Blast
      if (crystal.subType === 'bomb') {
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

        // Damage all nearby crystals within 110px
        for (let c = crystals.length - 1; c >= 0; c--) {
          const other = crystals[c];
          if (other !== crystal) {
            const bd = Math.hypot(other.x - crystal.x, other.y - crystal.y);
            if (bd < 110) {
              damageCrystal(other, c, { id: 'bomb', colorType: 'synergy' });
            }
          }
        }
      }

      createParticleBurst(crystal.x, crystal.y, COLORS[crystal.color].main, 28);
      addFloatingText(`+${pts}`, crystal.x, crystal.y - 20, COLORS[crystal.color].main);
      // Award +2 Gems for every shattered crystal
      addGems(2, false);
      addFloatingText('+2 💎', crystal.x, crystal.y - 38, '#ffb703');
      crystals.splice(index, 1);
    } else {
      createParticleBurst(crystal.x, crystal.y, COLORS[crystal.color].main, 12);
      addFloatingText(`+${pts}`, crystal.x, crystal.y - 15, '#fff');
    }
  }

  function handleFlightEnd() {
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

    // Check Achievements
    if (usedShots <= 1) {
      checkUnlockAchievement('first_shot');
    }

    // Calculate & Award Stage Gems
    const stageGems = 15 + (stars * 10);
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

    const totalStars = Object.values(state.savedProgress.completedLevels).reduce((a, b) => a + b, 0);
    if (totalStars >= 15) {
      checkUnlockAchievement('stars_collector');
    }
    if (state.currentLevel >= 8) {
      checkUnlockAchievement('harmony_master');
    }

    saveStorage();

    // Populate Victory Modal
    document.getElementById('stat-shots-used').textContent = usedShots;
    document.getElementById('stat-stage-score').textContent = state.score.toLocaleString();
    document.getElementById('stat-max-combo').textContent = `x${state.maxCombo}`;
    
    const stageGemsEl = document.getElementById('stat-stage-gems');
    if (stageGemsEl) stageGemsEl.textContent = `+${stageGems} 💎`;

    // Configure Double Reward Ad Button
    const btnDoubleAd = document.getElementById('btn-double-reward-ad');
    if (btnDoubleAd) {
      const isEn = window.i18n && window.i18n.getLang() === 'en';
      btnDoubleAd.disabled = false;
      btnDoubleAd.innerHTML = `<span class="ad-pill-tag">${isEn ? 'Reward x2' : 'مكافأة x2'}</span><span>🎬 ${isEn ? 'Watch Ad & Double Gems' : 'شاهد إعلاناً وضاعف الجواهر'} (+${stageGems * 2} 💎)</span>`;
      btnDoubleAd.onclick = () => {
        showRewardedAd(() => {
          addGems(stageGems, true);
          btnDoubleAd.disabled = true;
          btnDoubleAd.innerHTML = `<span style="color:#06d6a0;">${isEn ? 'Reward Doubled Successfully! ✓' : 'تمت مضاعفة المكافأة بنجاح! ✓'} (+${stageGems * 2} 💎)</span>`;
        }, isEn ? 'Preparing double reward...' : 'جاري تجهيز مضاعفة مكافأة النصر...');
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
    // Draw connecting tether when resting
    if (state.gameState === 'AIMING' && orbs[0] && orbs[1]) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
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

      // Draw Main Orb (Hardware-accelerated concentric arcs)
      const colorDef = COLORS[orb.colorType] || COLORS.cyan;

      // Outer Glow Aura
      ctx.fillStyle = colorDef.glow;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.radius + 5, 0, Math.PI * 2);
      ctx.fill();

      // Main Orb Body
      ctx.fillStyle = colorDef.main;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
      ctx.fill();

      // Sharp Hot White Core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(orb.x - 2, orb.y - 2, orb.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Identifier Letter
      ctx.fillStyle = '#060810';
      ctx.font = '900 10px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(orb.id === 'roya' ? 'R' : 'A', orb.x, orb.y);
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
          const pullX = drag.currentX - drag.anchorX;
          const pullY = drag.currentY - drag.anchorY;

          // Sling elastic line
          ctx.strokeStyle = COLORS.cyan.main;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-22, 0);
          ctx.lineTo(pullX, pullY);
          ctx.lineTo(22, 0);
          ctx.stroke();

          // Grip Center
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(pullX, pullY, 8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Direct aim indicator arrow
          const arrowLen = 28;
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
      ft.alpha -= 0.022;

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

    const dx = drag.currentX - drag.anchorX;
    const dy = drag.currentY - drag.anchorY;
    const dist = Math.hypot(dx, dy);

    if (dist < 10) return null; // Deadzone to avoid accidental taps

    let vx, vy;
    if (dy > 0) {
      // Slingshot mode: pulling down launches forward/upward
      vx = -dx;
      vy = -dy;
    } else {
      // Direct aim mode: dragging/pointing upward aims directly at target
      vx = dx;
      vy = dy;
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

    const LAUNCH_SPEED = 13.5;
    return {
      vx: normX * LAUNCH_SPEED,
      vy: normY * LAUNCH_SPEED,
      normX,
      normY,
      dist,
      mode: dy > 0 ? 'slingshot' : 'direct'
    };
  }

  function onPointerDown(e) {
    if (state.gameState !== 'AIMING') return;

    // Prevent default gesture delays / scrolling
    if (e.cancelable) e.preventDefault();

    const coords = getCanvasCoords(e);
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

    drag.active = false;

    if (state.gameState !== 'AIMING') return;

    const aim = getAimVector();
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
    }
  }

  // --- UI & Modal Event Bindings ---
  function setupUI() {
    // Modern Pointer Events with Pointer Capture
    canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
    canvasWrapper.addEventListener('pointerdown', onPointerDown, { passive: false });
    canvas.addEventListener('pointermove', onPointerMove, { passive: false });
    canvas.addEventListener('pointerup', onPointerUp, { passive: false });
    canvas.addEventListener('pointercancel', onPointerCancel, { passive: false });

    // Safety fallback listeners on window
    window.addEventListener('pointerup', onPointerUp, { passive: false });
    window.addEventListener('pointercancel', onPointerCancel, { passive: false });

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
          addGems(100, true);
          btnClaimAdGems.innerHTML = '<span>تم الاستلام! ✓</span>';
          setTimeout(() => {
            btnClaimAdGems.innerHTML = '<span>مكافأة 🎬</span>';
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

    // Apple StoreKit Restore Purchases
    const btnRestoreIap = document.getElementById('btn-restore-iap');
    if (btnRestoreIap) {
      btnRestoreIap.onclick = () => {
        state.savedProgress.unlockedSkins = ['neon', 'aurora', 'celestial', 'supernova'];
        addGems(500, false);
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

      if (ach.id === 'first_gem') currentVal = Math.min(ach.target, state.savedProgress.gems || 0);
      else if (ach.id === 'ad_supporter') currentVal = Math.min(ach.target, stats.adsWatched || 0);
      else if (ach.id === 'first_shot') currentVal = isUnlocked ? 1 : 0;
      else if (ach.id === 'combo_master') currentVal = Math.min(ach.target, isUnlocked ? 3 : state.maxCombo);
      else if (ach.id === 'crystal_hunter') currentVal = Math.min(ach.target, stats.totalCrystalsBroken || 0);
      else if (ach.id === 'portal_traveler') currentVal = Math.min(ach.target, stats.portalsUsed || 0);
      else if (ach.id === 'stars_collector') currentVal = Math.min(ach.target, totalStars);
      else if (ach.id === 'skin_collector') currentVal = Math.min(ach.target, (state.savedProgress.unlockedSkins || []).length);
      else if (ach.id === 'harmony_master') currentVal = Math.min(ach.target, state.currentLevel);

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
              checkUnlockAchievement('skin_collector');
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
              checkUnlockAchievement('skin_collector');
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
