/**
 * Roya & Arya: Cinematic Welcome Intro Scene
 * Hardware-accelerated Canvas & Web Audio sequence.
 * Features the ethereal cosmic dance of Roya & Arya, synergy resonance ignition,
 * and high-voltage neon brand reveal before transitioning to the title screen.
 */
(function () {
  let introCanvas = null;
  let introCtx = null;
  let introOverlay = null;
  let introLogoBox = null;
  let btnSkip = null;
  let animFrameId = null;
  let startTime = null;
  let isCompleted = false;

  const DURATION_MS = 3800; // 3.8s cinematic duration
  const STARS_COUNT = 65;
  const stars = [];

  function initStars(w, h) {
    stars.length = 0;
    for (let i = 0; i < STARS_COUNT; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2.2 + 0.6,
        alpha: Math.random() * 0.7 + 0.3,
        pulseSpeed: Math.random() * 0.04 + 0.02,
        color: Math.random() > 0.5 ? '#00f3ff' : '#ff007f'
      });
    }
  }

  function resizeIntro() {
    if (!introCanvas || !introOverlay) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = introOverlay.getBoundingClientRect();
    introCanvas.width = rect.width * dpr;
    introCanvas.height = rect.height * dpr;
    if (introCtx) {
      introCtx.scale(dpr, dpr);
    }
  }

  function renderIntro(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / DURATION_MS, 1.0);

    const rect = introOverlay.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2 - 25;

    // Clear with semi-translucent dark cosmic gradient for trailing motion blur
    introCtx.fillStyle = 'rgba(8, 9, 16, 0.28)';
    introCtx.fillRect(0, 0, w, h);

    // 1. Draw Cosmic Starfield
    stars.forEach(s => {
      s.alpha += Math.sin(timestamp * s.pulseSpeed * 0.05) * 0.015;
      const a = Math.max(0.1, Math.min(0.9, s.alpha));
      introCtx.fillStyle = s.color === '#00f3ff' ? `rgba(0, 243, 255, ${a})` : `rgba(255, 0, 127, ${a})`;
      introCtx.beginPath();
      introCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      introCtx.fill();
    });

    // 2. Cosmic Spiral Trajectories of Roya (Cyan) and Arya (Magenta)
    // t: 0.0 -> 0.5 = sweeping approach into spiral
    // t: 0.5 -> 0.7 = orbital acceleration at center
    // t: 0.7 -> 1.0 = resonance ignition and brand burst
    const t = progress;

    let royaX, royaY, aryaX, aryaY;
    let distanceRadius;
    let angle;

    if (t < 0.55) {
      // Approach Phase: Inward spiraling vortex
      const easeT = Math.pow(t / 0.55, 1.4);
      distanceRadius = (1 - easeT) * (Math.min(w, h) * 0.48) + 38;
      angle = t * Math.PI * 5.5;

      royaX = cx + Math.cos(angle) * distanceRadius;
      royaY = cy + Math.sin(angle) * distanceRadius * 0.75;

      aryaX = cx + Math.cos(angle + Math.PI) * distanceRadius;
      aryaY = cy + Math.sin(angle + Math.PI) * distanceRadius * 0.75;
    } else {
      // Harmonic Orbit & Convergence Phase
      const postT = (t - 0.55) / 0.45;
      distanceRadius = 38 * Math.max(0.2, 1 - postT * 0.85);
      angle = 0.55 * Math.PI * 5.5 + postT * Math.PI * 7;

      royaX = cx + Math.cos(angle) * distanceRadius;
      royaY = cy + Math.sin(angle) * distanceRadius * 0.6;

      aryaX = cx + Math.cos(angle + Math.PI) * distanceRadius;
      aryaY = cy + Math.sin(angle + Math.PI) * distanceRadius * 0.6;
    }

    // 3. Synergy Resonance Tether Beam (Ignites around t >= 0.4)
    if (t > 0.35) {
      const beamAlpha = Math.min(1.0, (t - 0.35) * 4.5);
      introCtx.save();
      introCtx.strokeStyle = `rgba(181, 55, 242, ${beamAlpha * 0.95})`;
      introCtx.lineWidth = 3.5 + Math.sin(timestamp * 0.05) * 1.5;
      introCtx.beginPath();
      introCtx.moveTo(royaX, royaY);
      introCtx.lineTo(aryaX, aryaY);
      introCtx.stroke();

      // Outer electric halo
      introCtx.strokeStyle = `rgba(255, 255, 255, ${beamAlpha * 0.75})`;
      introCtx.lineWidth = 1.2;
      introCtx.beginPath();
      introCtx.moveTo(royaX, royaY);
      introCtx.lineTo(aryaX, aryaY);
      introCtx.stroke();
      introCtx.restore();
    }

    // 4. Expanding Shockwaves upon Convergence (t >= 0.55)
    if (t >= 0.55) {
      const shockProgress = (t - 0.55) / 0.45;
      const shockR = shockProgress * Math.min(w, h) * 0.7;
      const shockAlpha = Math.max(0, 1 - shockProgress);

      introCtx.save();
      introCtx.strokeStyle = `rgba(0, 243, 255, ${shockAlpha * 0.8})`;
      introCtx.lineWidth = 4 * shockAlpha;
      introCtx.beginPath();
      introCtx.arc(cx, cy, shockR, 0, Math.PI * 2);
      introCtx.stroke();

      introCtx.strokeStyle = `rgba(255, 0, 127, ${shockAlpha * 0.6})`;
      introCtx.lineWidth = 2 * shockAlpha;
      introCtx.beginPath();
      introCtx.arc(cx, cy, Math.max(0, shockR - 18), 0, Math.PI * 2);
      introCtx.stroke();
      introCtx.restore();

      // Trigger sound on the convergence moment
      if (!window.__introSoundPlayed && window.soundEngine) {
        window.__introSoundPlayed = true;
        try {
          window.soundEngine.playIntroCelestial();
        } catch (_) {}
      }

      // Show the brand logo card
      if (introLogoBox && !introLogoBox.classList.contains('active')) {
        introLogoBox.classList.add('active');
      }
    }

    // 5. Draw Roya Orb (Cyan)
    drawIntroOrb(introCtx, royaX, royaY, 15, '#00f3ff', 'rgba(0, 243, 255, 0.65)', '✦');

    // 6. Draw Arya Orb (Magenta)
    drawIntroOrb(introCtx, aryaX, aryaY, 15, '#ff007f', 'rgba(255, 0, 127, 0.65)', '✺');

    if (progress < 1.0 && !isCompleted) {
      animFrameId = requestAnimationFrame(renderIntro);
    } else {
      finishIntro();
    }
  }

  function drawIntroOrb(ctx, x, y, radius, colorHex, glowRgba, symbol) {
    ctx.save();
    // Glowing outer corona
    ctx.fillStyle = glowRgba;
    ctx.beginPath();
    ctx.arc(x, y, radius + 10, 0, Math.PI * 2);
    ctx.fill();

    // 3D Spherical body
    const grad = ctx.createRadialGradient(x - radius * 0.35, y - radius * 0.35, 1, x, y, radius);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, colorHex);
    grad.addColorStop(0.85, colorHex);
    grad.addColorStop(1, '#05070f');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Specular glint
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - radius * 0.32, y - radius * 0.32, radius * 0.28, 0, Math.PI * 2);
    ctx.fill();

    // Sacred center glyph
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, x, y + 0.5);
    ctx.restore();
  }

  function finishIntro() {
    if (isCompleted) return;
    isCompleted = true;

    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }

    if (introOverlay) {
      introOverlay.classList.add('fade-out');
      setTimeout(() => {
        if (introOverlay) {
          introOverlay.style.display = 'none';
        }
      }, 650);
    }
  }

  function startIntro() {
    introOverlay = document.getElementById('intro-cinematic');
    introCanvas = document.getElementById('intro-canvas');
    introLogoBox = document.getElementById('intro-logo-box');
    btnSkip = document.getElementById('btn-skip-intro');

    if (!introOverlay || !introCanvas) return;

    introCtx = introCanvas.getContext('2d');
    resizeIntro();
    window.addEventListener('resize', resizeIntro);

    const rect = introOverlay.getBoundingClientRect();
    initStars(rect.width, rect.height);

    if (btnSkip) {
      btnSkip.onclick = (e) => {
        e.stopPropagation();
        finishIntro();
      };
    }

    // Tapping anywhere after 1 second skips smoothly
    introOverlay.onclick = () => {
      finishIntro();
    };

    // Pre-initialize audio engine on first gesture
    window.addEventListener('pointerdown', function onceAudio() {
      if (window.soundEngine) {
        window.soundEngine.init();
      }
      window.removeEventListener('pointerdown', onceAudio);
    }, { once: true });

    animFrameId = requestAnimationFrame(renderIntro);
  }

  // Launch intro as soon as DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startIntro);
  } else {
    startIntro();
  }
})();
