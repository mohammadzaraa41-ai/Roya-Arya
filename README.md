# 🌟 Roya & Arya: Neon Ricochet

> **2D Hybrid-Casual / Physics Puzzle & Color Ricochet Game**  
> Designed for **iOS (Apple App Store)** & **Android (Google Play)** using **Capacitor 7** & HTML5 Canvas / Web Audio API.

![Roya & Arya Icon](icon.jpg)

---

## 🎮 Game Concept & Mechanics

**Roya & Arya** combines one-finger slingshot physics with real-time color shifting and dimensional portals:
- **Roya (رويا):** The tranquil Cyan Spirit of vision and precision (`#00f3ff`).
- **Arya (آريا):** The radiant Magenta Spirit of momentum and power (`#ff007f`).
- **Harmonic Prisms:** Passing through prisms fuses them into the **Synergy Spectrum (`#b537f2`)**, shattering all darkness.
- **Wormhole Portals:** Teleport spirits instantaneously across arena coordinates with conserved momentum.
- **Dynamic Pentatonic Audio:** Each ricochet scales up musical notes in the Pentatonic scale (C, D, E, G, A), creating an interactive symphony with every shot.

---

## 📱 Apple App Store Ready

- **Guideline 4.2 Compliant:** Deep content with 12 handcrafted levels, 2 distinct worlds, Endless mode, achievements system, and customizable skins.
- **Safe Area Insets:** Fully supports iPhone Notch & Dynamic Island via `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`.
- **Privacy First (No Data Collected):** Offline-first architecture. Includes built-in `privacy.html`.
- **StoreKit In-App Purchases:** Native-compliant Restore Purchases interface.
- **Locked Portrait Mode:** Configured in `Info.plist` for ideal handheld gameplay.

---

## 📁 Project Structure

```
roya-and-arya/
├── index.html              # Main HTML markup and UI screens
├── style.css               # Neo-Minimalist styling & animations
├── game.js                 # 2D physics engine, portals & juice
├── audio.js                # Web Audio API pentatonic synthesizer
├── levels.js               # Handcrafted levels catalog & procedural engine
├── privacy.html            # Apple App Store Privacy Policy
├── icon.jpg                # 1024x1024 Retina App Icon
├── capacitor.config.json   # Capacitor mobile config
├── package.json            # Project dependencies
└── ios/                    # Native Xcode Project workspace (App.xcworkspace)
```

---

## 🚀 Getting Started

### Run in Browser (Local Dev)
```bash
python -m http.server 4173
# Open http://localhost:4173
```

### Sync & Open in Xcode (macOS)
```bash
npm install
npx cap sync ios
npx cap open ios
```

---

## 📜 License
MIT License - Created for Roya & Arya.
