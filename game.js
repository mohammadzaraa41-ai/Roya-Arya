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
    { id: 'neon', name: 'أطياف النيون الأصلية', desc: 'السماوي والوردي الكلاسيكي', cyan: '#00f3ff', magenta: '#ff007f', cost: 0 },
    { id: 'aurora', name: 'شفق الفضاء الزمردي', desc: 'الزمردي ولهب المرجان', cyan: '#06d6a0', magenta: '#ff5400', cost: 150 },
    { id: 'celestial', name: 'السديم الملكي', desc: 'البنفسجي والذهب الشمسي', cyan: '#7209b7', magenta: '#ffb703', cost: 300 },
    { id: 'supernova', name: 'شمس السوبرنوفا', desc: 'اللهب الشمسي والأرجواني الكوني', cyan: '#ff7700', magenta: '#d90429', cost: 450 }
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
    gameMode: 'campaign' // 'campaign' or 'endless'
  };

  // Achievements Definition with Targets and Rewards
  const ACHIEVEMENTS = [
    { id: 'first_gem', icon: '💎', title: 'بريق الأطياف', desc: 'جمع 50 جوهرة نيونية', target: 50, reward: 50, type: 'gems' },
    { id: 'ad_supporter', icon: '🎁', title: 'حليف الأطياف', desc: 'مشاهدة إعلان مكافأة ودعم اللعبة', target: 1, reward: 100, type: 'ads' },
    { id: 'first_shot', icon: '🎯', title: 'قناص الأطياف', desc: 'إنهاء مرحلة بضربة واحدة فقط', target: 1, reward: 50, type: 'oneshot' },
    { id: 'combo_master', icon: '⚡', title: 'سيد الكومبو', desc: 'تحقيق كومبو x3 أو أكثر', target: 3, reward: 50, type: 'combo' },
    { id: 'crystal_hunter', icon: '💎', title: 'صائد البلورات', desc: 'سحق 30 بلورة نيونية', target: 30, reward: 60, type: 'crystals' },
    { id: 'portal_traveler', icon: '🌀', title: 'مسافر الأبعاد', desc: 'استخدام بوابات الانتقال الفضائي 3 مرات', target: 3, reward: 50, type: 'portals' },
    { id: 'stars_collector', icon: '🌟', title: 'جامع النجوم', desc: 'جمع 15 نجمة أو أكثر في المراحل', target: 15, reward: 80, type: 'stars' },
    { id: 'skin_collector', icon: '🎨', title: 'أناقة النيون', desc: 'فتح مظهر نيون جديد للأرواح', target: 2, reward: 70, type: 'skins' },
    { id: 'harmony_master', icon: '👑', title: 'سيد المجرات', desc: 'بلوغ المرحلة 8 (العالم الثاني)', target: 8, reward: 100, type: 'level' }
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

  // Drag / Slinging State
  const drag = {
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    anchorX: CANVAS_LOGICAL_WIDTH / 2,
    anchorY: CANVAS_LOGICAL_HEIGHT - 65
  };

  // Screen Shake (Trauma)
  let screenTrauma = 0;
  let shakeOffsetX = 0;
  let shakeOffsetY = 0;

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
  function resizeCanvas() {
    const rect = canvasWrapper.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    scale = Math.min(rect.width / CANVAS_LOGICAL_WIDTH, rect.height / CANVAS_LOGICAL_HEIGHT);

    drag.anchorX = CANVAS_LOGICAL_WIDTH / 2;
    drag.anchorY = CANVAS_LOGICAL_HEIGHT - 65;
  }

  // --- Screen Shake & Haptic Helpers ---
  function addTrauma(amount) {
    screenTrauma = Math.min(1.0, screenTrauma + amount);
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
      const speed = 1.5 + Math.random() * 5.5;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colorCode,
        radius: 2 + Math.random() * 3.5,
        alpha: 1,
        life: 0.85 + Math.random() * 0.35,
        decay: 0.025 + Math.random() * 0.02
      });
    }

    // Add luminous shockwave ring
    shockwaves.push({
      x: x,
      y: y,
      radius: 6,
      maxRadius: 45,
      alpha: 0.8,
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

    orbs = [];
    crystals = [];
    walls = [];
    prisms = [];
    spinners = [];
    portals = [];
    particles = [];
    floatingTexts = [];
    shockwaves = [];

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
          pulse: Math.random() * Math.PI
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
    hudLevelText.textContent = `المرحلة ${state.currentLevel}`;
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

  // --- Physics & Collision Engine ---
  function updatePhysics(dt) {
    if (state.gameState !== 'FLYING') return;

    // Flight Safety Watchdog (prevents perpetual loops)
    state.flightSafetyTimer = (state.flightSafetyTimer || 0) + (dt || 0.016);
    if (state.flightSafetyTimer > 7.5) {
      handleFlightEnd();
      return;
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

    orbs.forEach(orb => {
      if (!orb.active) return;

      // Update positions
      orb.x += orb.vx;
      orb.y += orb.vy;

      // Air resistance damping
      orb.vx *= DAMPING;
      orb.vy *= DAMPING;

      const speed = Math.hypot(orb.vx, orb.vy);

      // Trailing Particles
      if (Math.random() < 0.6) {
        orb.trail.push({
          x: orb.x,
          y: orb.y,
          color: COLORS[orb.colorType].main,
          alpha: 0.65,
          radius: orb.radius * 0.75
        });
      }
      if (orb.trail.length > 12) orb.trail.shift();

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
    crystal.hp--;
    state.currentCombo++;
    if (state.currentCombo > state.maxCombo) {
      state.maxCombo = state.currentCombo;
    }

    // Melodic Sound & Juice
    window.soundEngine.playHarmonicHit(state.currentCombo);
    triggerHaptic('heavy');
    addTrauma(0.22);

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

    if (crystal.hp <= 0) {
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
      toastTitle.textContent = `${ach.icon} وسام: ${ach.title} (+${ach.reward} 💎)`;
      toastDesc.textContent = ach.desc;
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
      btnDoubleAd.disabled = false;
      btnDoubleAd.innerHTML = `<span class="ad-pill-tag">مكافأة x2</span><span>🎬 شاهد إعلاناً وضاعف الجواهر (+${stageGems * 2} 💎)</span>`;
      btnDoubleAd.onclick = () => {
        showRewardedAd(() => {
          addGems(stageGems, true);
          btnDoubleAd.disabled = true;
          btnDoubleAd.innerHTML = `<span style="color:#06d6a0;">تمت مضاعفة المكافأة بنجاح! ✓ (+${stageGems * 2} 💎)</span>`;
        }, 'جاري تجهيز مضاعفة مكافأة النصر...');
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
    // Handle Canvas Resolution scale
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    ctx.save();
    ctx.scale(scale * dpr, scale * dpr);

    // Apply Screen Shake (Trauma Decay)
    if (screenTrauma > 0) {
      shakeOffsetX = (Math.random() * 2 - 1) * screenTrauma * screenTrauma * 16;
      shakeOffsetY = (Math.random() * 2 - 1) * screenTrauma * screenTrauma * 16;
      screenTrauma = Math.max(0, screenTrauma - 0.035);
    } else {
      shakeOffsetX = 0;
      shakeOffsetY = 0;
    }
    ctx.translate(shakeOffsetX, shakeOffsetY);

    // Clear Canvas with subtle deep vignette
    ctx.clearRect(-20, -20, CANVAS_LOGICAL_WIDTH + 40, CANVAS_LOGICAL_HEIGHT + 40);

    // Draw Subtle Tech Grid Background
    drawGridBackground();

    // Draw Level Entities
    drawWalls();
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

    // Draw Particles & Shockwaves
    drawParticles();
    drawShockwaves();
    drawFloatingTexts();

    // Draw Launcher Base Pad
    drawLauncherPad();

    ctx.restore();
  }

  function drawGridBackground() {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 1;
    const step = 35;
    for (let x = 0; x < CANVAS_LOGICAL_WIDTH; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_LOGICAL_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_LOGICAL_HEIGHT; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_LOGICAL_WIDTH, y);
      ctx.stroke();
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

      // Outer Glowing Ring
      ctx.fillStyle = colorDef.glow;
      ctx.beginPath();
      ctx.arc(0, 0, c.radius + 5, 0, Math.PI * 2);
      ctx.fill();

      // Faceted Hexagon Crystal
      ctx.fillStyle = colorDef.main;
      ctx.strokeStyle = '#fff';
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

      // Multi-hit health badge
      if (c.maxHp > 1) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(c.hp, 0, 0);
      }

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
      // Draw Motion Trails
      orb.trail.forEach((t, i) => {
        ctx.save();
        ctx.fillStyle = t.color;
        ctx.globalAlpha = (i / orb.trail.length) * 0.45;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius * (i / orb.trail.length), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Main Orb
      const colorDef = COLORS[orb.colorType] || COLORS.cyan;

      ctx.save();

      // Outer Corona (Crisp concentric aura instead of shadowBlur)
      ctx.fillStyle = colorDef.glow;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.radius + 6, 0, Math.PI * 2);
      ctx.fill();

      // Main Core
      const grad = ctx.createRadialGradient(
        orb.x - 3, orb.y - 3, 2,
        orb.x, orb.y, orb.radius
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, colorDef.main);
      grad.addColorStop(1, '#060a17');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
      ctx.fill();

      // Ethereal Eye / Identifier
      ctx.fillStyle = '#fff';
      ctx.font = '900 10px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(orb.id === 'roya' ? 'R' : 'A', orb.x, orb.y);

      ctx.restore();
    });
  }

  function drawLauncherPad() {
    ctx.save();
    ctx.translate(drag.anchorX, drag.anchorY);

    // Glowing base ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.stroke();

    // Pull Sling Band
    if (drag.active && state.gameState === 'AIMING') {
      const pullX = drag.currentX - drag.anchorX;
      const pullY = drag.currentY - drag.anchorY;

      // Outer sling halo
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(-25, 0);
      ctx.lineTo(pullX, pullY);
      ctx.lineTo(25, 0);
      ctx.stroke();

      // Inner sling line
      ctx.strokeStyle = COLORS.cyan.main;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-25, 0);
      ctx.lineTo(pullX, pullY);
      ctx.lineTo(25, 0);
      ctx.stroke();

      // Glowing Grip Center
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(pullX, pullY, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawPredictiveTrajectory() {
    const pullX = drag.anchorX - drag.currentX;
    const pullY = drag.anchorY - drag.currentY;
    const dist = Math.hypot(pullX, pullY);
    if (dist < 10) return;

    let simX = drag.anchorX;
    let simY = drag.anchorY;
    let simVx = pullX * LAUNCH_SPEED_FACTOR;
    let simVy = pullY * LAUNCH_SPEED_FACTOR;

    ctx.save();

    const maxSteps = 45;
    for (let s = 0; s < maxSteps; s++) {
      simX += simVx;
      simY += simVy;

      // Bounce check with screen boundaries
      if (simX <= 18 || simX >= CANVAS_LOGICAL_WIDTH - 18) {
        simVx = -simVx;
      }
      if (simY <= 20) {
        simVy = -simVy;
      }

      // Draw dashed trajectory dot (Layered hardware acceleration, 0 shadowBlur)
      if (s % 3 === 0) {
        const radius = Math.max(1.5, 4.5 * (1 - s / maxSteps));
        const alpha = Math.max(0.2, 1 - (s / maxSteps));

        // Outer cyan glow dot
        ctx.fillStyle = `rgba(0, 243, 255, ${alpha * 0.45})`;
        ctx.beginPath();
        ctx.arc(simX, simY, radius + 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright core dot
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(simX, simY, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
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

      ctx.save();
      ctx.strokeStyle = s.color;
      ctx.globalAlpha = s.alpha;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
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
      ctx.globalAlpha = ft.alpha;
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
      x: (clientX - rect.left) / scale,
      y: (clientY - rect.top) / scale
    };
  }

  function onPointerDown(e) {
    if (state.gameState !== 'AIMING') return;

    // Prevent default gesture delays / scrolling
    if (e.cancelable) e.preventDefault();

    const coords = getCanvasCoords(e);
    const distToAnchor = Math.hypot(coords.x - drag.anchorX, coords.y - drag.anchorY);

    // Permit drag if touched near anchor or bottom 40% of playfield
    if (distToAnchor < 140 || coords.y > CANVAS_LOGICAL_HEIGHT * 0.6) {
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
  }

  function onPointerMove(e) {
    if (!drag.active || state.gameState !== 'AIMING') return;
    if (e.cancelable) e.preventDefault();

    const coords = getCanvasCoords(e);
    const dx = coords.x - drag.anchorX;
    const dy = coords.y - drag.anchorY;
    const dist = Math.hypot(dx, dy);

    if (dist > MAX_DRAG_DIST) {
      const angle = Math.atan2(dy, dx);
      drag.currentX = drag.anchorX + Math.cos(angle) * MAX_DRAG_DIST;
      drag.currentY = drag.anchorY + Math.sin(angle) * MAX_DRAG_DIST;
    } else {
      drag.currentX = coords.x;
      drag.currentY = coords.y;
    }
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

    const pullX = drag.anchorX - drag.currentX;
    const pullY = drag.anchorY - drag.currentY;
    const dist = Math.hypot(pullX, pullY);

    if (dist > 18) {
      const vx = pullX * LAUNCH_SPEED_FACTOR;
      const vy = pullY * LAUNCH_SPEED_FACTOR;
      fireTwinSpirits(vx, vy);
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
        addFloatingText('تمت استعادة VIP + 500 💎!', drag.anchorX, drag.anchorY - 40, '#06d6a0');
        alert('✨ تم التحقق من حساب Apple StoreKit بنجاح: تم تفعيل باقة VIP الملكية، فتح جميع الأطياف، وإضافة 500 جوهرة نيون!');
      };
    }
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

      const card = document.createElement('div');
      card.className = `achieve-card ${isUnlocked ? 'unlocked' : ''}`;
      card.innerHTML = `
        <span class="achieve-icon">${ach.icon}</span>
        <span class="achieve-name">${ach.title}</span>
        <span class="achieve-detail">${ach.desc}</span>
        <span class="achieve-reward-pill">+${ach.reward} 💎</span>
        <div class="achieve-card-progress-bar">
          <div class="achieve-card-progress-fill" style="width: ${isUnlocked ? '100%' : progressPercent + '%'}; background:${isUnlocked ? 'var(--prism-gold)' : 'var(--roya-cyan)'};"></div>
        </div>
        <span style="font-size:0.65rem; font-weight:800; color:${isUnlocked ? 'var(--prism-gold)' : 'var(--text-muted)'}; margin-top:3px;">
          ${isUnlocked ? 'مكتمل ★' : `(${currentVal}/${ach.target})`}
        </span>
      `;
      grid.appendChild(card);
    });
  }

  function populateLevelsGrid() {
    const grid = document.getElementById('levels-grid');
    grid.innerHTML = '';

    const maxUnlocked = Object.keys(state.savedProgress.completedLevels).length + 1;

    for (let l = 1; l <= Math.max(12, maxUnlocked); l++) {
      const tile = document.createElement('div');
      const isLocked = l > maxUnlocked;
      const isCompleted = state.savedProgress.completedLevels[l] !== undefined;
      const isCurrent = l === state.currentLevel;

      tile.className = `level-tile ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}`;
      tile.innerHTML = `
        <span>${l}</span>
        ${isCompleted ? `<span class="level-tile-stars">${'★'.repeat(state.savedProgress.completedLevels[l])}</span>` : ''}
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
  }

  function populateSkinsModal() {
    const list = document.getElementById('skins-list');
    if (!list) return;
    list.innerHTML = '';
    updateGemsDisplay();

    const unlockedSkins = state.savedProgress.unlockedSkins || ['neon'];
    const currentGems = state.savedProgress.gems || 0;

    SKINS.forEach(sk => {
      const isOwned = unlockedSkins.includes(sk.id);
      const isSelected = state.activeSkin === sk.id;
      const item = document.createElement('div');
      item.className = `skin-item ${isSelected ? 'selected' : ''}`;

      let actionHtml = '';
      if (isSelected) {
        actionHtml = '<span style="color:var(--roya-cyan); font-weight:800; font-size:0.85rem;">مُفعل ✓</span>';
      } else if (isOwned) {
        actionHtml = '<button class="btn-secondary btn-select-skin" style="padding:5px 12px; font-size:0.8rem;">تفعيل</button>';
      } else {
        const canAfford = currentGems >= sk.cost;
        actionHtml = `
          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
            <button class="btn-skin-buy" style="opacity:${canAfford ? '1' : '0.6'};" ${canAfford ? '' : 'title="تحتاج للمزيد من الجواهر"'}>
              شراء ${sk.cost} 💎
            </button>
            <button class="btn-skin-ad">
              فتح بإعلان 🎬
            </button>
          </div>
        `;
      }

      item.innerHTML = `
        <div class="skin-info">
          <div class="skin-swatch" style="background: linear-gradient(135deg, ${sk.cyan}, ${sk.magenta});"></div>
          <div>
            <div class="skin-label">${sk.name}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${sk.desc}</div>
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
              alert(`تحتاج إلى ${sk.cost - state.savedProgress.gems} 💎 جوهرة إضافية! يمكنك الحصول عليها مجاناً بمشاهدة الإعلانات أو الفوز بالمراحل.`);
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
              addFloatingText(`تم فتح مظهر ${sk.name}! ✨`, drag.anchorX, drag.anchorY - 40, '#06d6a0');
            }, `جاري فتح مظهر ${sk.name}...`);
          };
        }
      }

      list.appendChild(item);
    });
  }

  // --- Game Loop ---
  let lastTime = performance.now();
  function gameLoop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    updatePhysics(dt);
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
