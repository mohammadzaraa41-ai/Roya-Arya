/**
 * Roya & Arya: Neon Ricochet
 * Comprehensive Internationalization (i18n) Engine
 * Supports Arabic (RTL) & English (LTR) with instant live toggle
 */

(function () {
  const TRANSLATIONS = {
    ar: {
      lang_code: 'ar',
      dir: 'rtl',
      lang_name: 'العربية',
      toggle_btn_label: 'English 🌐',

      // Top HUD
      hud_score_label: 'النقاط',
      hud_stage_prefix: 'المرحلة',
      hud_shots_title: 'Roya (سماوي) & Arya (وردي)',
      hud_gems_title: 'رصيد جواهر النيون',
      btn_pause_title: 'إيقاف مؤقت',
      btn_sound_title: 'كتم/تشغيل الصوت',

      // Playfield Hints
      hint_aim: 'اسحب وصوّب لإطلاق رويا وآريا ✨',
      combo_prefix: 'COMBO x',

      // Title Screen
      game_tagline: 'Neon Ricochet & Harmonic Spirits',
      spirit_roya_name: 'Roya',
      spirit_roya_role: 'طيف رويا الأزرق',
      spirit_arya_name: 'Arya',
      spirit_arya_role: 'طيف الطاقة الوردي',
      game_intro_desc: 'وجّه الروحين التوأم عبر المنشورات والبوابات النيونية لتفتيت بلورات الظلام بأقل عدد من الارتدادات!',
      
      tab_campaign: 'حملة العوالم (30 مرحلة)',
      tab_endless: 'النمط اللانهائي السريع 🔥',
      btn_play: 'ابدأ اللعب الآن',
      btn_levels: 'المراحل',
      btn_skins: 'الأطياف',
      btn_achievements: 'الأوسمة',
      daily_reward_tag: 'مكافأة الأطياف السريعة',
      daily_reward_title: 'شاهد إعلاناً واحصل على <strong>+100 💎 جوهرة</strong> مجاناً!',
      btn_claim_reward: 'مكافأة 🎬',
      privacy_policy: 'سياسة الخصوصية | Privacy Policy',

      feat_one_finger: '⚡ تحكم بإصبع واحد',
      feat_audio: '🎵 نغمات تفاعلية',
      feat_offline: '📱 بدون إنترنت',

      // Victory Modal
      victory_title: 'انتصار نقي!',
      victory_subtitle: 'تم تطهير جميع بلورات المرحلة بنجاح',
      stat_shots: 'الضربات',
      stat_score: 'النقاط',
      stat_max_combo: 'أعلى كومبو',
      stat_gems: 'الجواهر',
      btn_double_reward_ad: '🎬 شاهد إعلاناً وضاعف الجواهر',
      btn_double_reward_done: 'تمت مضاعفة المكافأة بنجاح! ✓',
      btn_next_level: 'المرحلة التالية',
      btn_replay_level: 'إعادة المحاولة',

      // Game Over Modal
      gameover_title: 'نفدت الأطياف!',
      gameover_subtitle: 'بقيت بعض البلورات صامدة، استعد التركيز والزاوية',
      ad_offer_badge: 'مكافأة فورية',
      ad_offer_desc: 'شاهد إعلاناً قصيراً للحصول على <strong>+2 طلقة إضافية</strong> ومواصلة اللعب الآن!',
      btn_revive: 'احصل على +2 أطياف مجاناً',
      btn_retry: 'إعادة المرحلة من البداية',
      btn_main_menu: 'القائمة الرئيسية',

      // Pause Modal
      pause_title: 'إيقاف مؤقت',
      setting_sound: 'المؤثرات الصوتية والموسيقى (SFX)',
      setting_haptics: 'الاهتزاز اللمسي (Haptics)',
      setting_laser: 'خط التصويب المساعد',
      setting_lang: 'اللغة (Language)',
      btn_resume: 'متابعة اللعب',
      btn_restart: 'إعادة المرحلة',
      btn_quit: 'القائمة الرئيسية',

      // Level Select Modal
      levels_title: 'اختر المرحلة',
      levels_subtitle: 'تقدم في المراحل لفتح تحديات المنشورات الدوارة والبوابات الفضائية',
      world_1_name: 'العالم 1: سديم النيون',
      world_2_name: 'العالم 2: بوابات الأثير',
      world_3_name: 'العالم 3: الفوضى الحركية',
      locked_stage: 'مغلق',
      level_shots_left: 'ضربات',

      // Skins Modal
      skins_title: 'أزياء وأطياف رويا وآريا',
      skins_balance: 'رصيدك من الجواهر:',
      skins_subtitle: 'خصّص الهالات الضوئية ومسارات النجوم للأرواح',
      skin_active: 'مفعّل حالياً ✓',
      skin_equip: 'تفعيل',
      skin_buy: 'فتح بـ',
      not_enough_gems: 'لا توجد جواهر كافية!',

      // Achievements Modal
      achieve_title: 'الأوسمة والإنجازات',
      achieve_completed: 'الأوسمة المكتملة:',
      achieve_bonus_desc: 'كل وسام تفتحه يمنحك جواهر فورية!',
      achieve_unlocked: 'مكتمل ✓',
      toast_new_achieve: 'وسام جديد!',

      // Ad Simulation
      ad_sim_loading: 'جاري تشغيل الإعلان الترويجي...',
      ad_sim_ready_in: 'مكافأتك ستكون جاهزة خلال',
      ad_sim_seconds: 'ثوانٍ',

      // VIP Banner
      vip_banner_text: '✨ باقة VIP الملكية: بدون إعلانات + أطياف المجرة النادرة',
      btn_restore_iap: 'استعادة المشتريات',
      vip_restore_success: 'تم فحص حساب Apple وتأكيد المشتريات بنجاح!'
    },

    en: {
      lang_code: 'en',
      dir: 'ltr',
      lang_name: 'English',
      toggle_btn_label: 'عربي 🌐',

      // Top HUD
      hud_score_label: 'SCORE',
      hud_stage_prefix: 'STAGE',
      hud_shots_title: 'Roya (Cyan) & Arya (Magenta)',
      hud_gems_title: 'Neon Gems Balance',
      btn_pause_title: 'Pause',
      btn_sound_title: 'Toggle Sound',

      // Playfield Hints
      hint_aim: 'Drag & aim to launch Roya & Arya ✨',
      combo_prefix: 'COMBO x',

      // Title Screen
      game_tagline: 'Neon Ricochet & Harmonic Spirits',
      spirit_roya_name: 'Roya',
      spirit_roya_role: 'Cyan Pulse Spirit',
      spirit_arya_name: 'Arya',
      spirit_arya_role: 'Magenta Flame Spirit',
      game_intro_desc: 'Guide the twin spirits through prisms and cosmic portals to shatter dark crystals with minimum ricochets!',
      
      tab_campaign: 'Worlds Campaign (30 Stages)',
      tab_endless: 'Fast Endless Mode 🔥',
      btn_play: 'PLAY NOW',
      btn_levels: 'Stages',
      btn_skins: 'Skins',
      btn_achievements: 'Achievements',
      daily_reward_tag: 'Quick Spirit Reward',
      daily_reward_title: 'Watch an ad and get <strong>+100 💎 Gems</strong> free!',
      btn_claim_reward: 'Reward 🎬',
      privacy_policy: 'Privacy Policy',

      feat_one_finger: '⚡ One-Finger Aim',
      feat_audio: '🎵 Melodic Audio',
      feat_offline: '📱 100% Offline',

      // Victory Modal
      victory_title: 'PURE VICTORY!',
      victory_subtitle: 'All stage crystals successfully shattered',
      stat_shots: 'Shots',
      stat_score: 'Score',
      stat_max_combo: 'Max Combo',
      stat_gems: 'Gems',
      btn_double_reward_ad: '🎬 Watch Ad & Double Gems',
      btn_double_reward_done: 'Reward Doubled Successfully! ✓',
      btn_next_level: 'Next Stage',
      btn_replay_level: 'Retry',

      // Game Over Modal
      gameover_title: 'OUT OF SPIRITS!',
      gameover_subtitle: 'Some crystals survived. Refocus your angles',
      ad_offer_badge: 'Instant Revive',
      ad_offer_desc: 'Watch a quick ad to get <strong>+2 Extra Shots</strong> and continue now!',
      btn_revive: 'Get +2 Shots Free',
      btn_retry: 'Restart Stage',
      btn_main_menu: 'Main Menu',

      // Pause Modal
      pause_title: 'PAUSED',
      setting_sound: 'Sound & Music (SFX)',
      setting_haptics: 'Haptic Feedback',
      setting_laser: 'Trajectory Guide Laser',
      setting_lang: 'Language / اللغة',
      btn_resume: 'Resume Game',
      btn_restart: 'Restart Stage',
      btn_quit: 'Main Menu',

      // Level Select Modal
      levels_title: 'SELECT STAGE',
      levels_subtitle: 'Progress through worlds to unlock rotating spinners and cosmic wormholes',
      world_1_name: 'World 1: Neon Genesis',
      world_2_name: 'World 2: Prisms & Portals',
      world_3_name: 'World 3: Kinetic Chaos',
      locked_stage: 'Locked',
      level_shots_left: 'shots',

      // Skins Modal
      skins_title: 'Roya & Arya Spirit Skins',
      skins_balance: 'Gems Balance:',
      skins_subtitle: 'Customize ethereal auras and stellar stardust trails',
      skin_active: 'Equipped ✓',
      skin_equip: 'Equip',
      skin_buy: 'Unlock for',
      not_enough_gems: 'Not enough gems!',

      // Achievements Modal
      achieve_title: 'ACHIEVEMENTS',
      achieve_completed: 'Completed Badges:',
      achieve_bonus_desc: 'Every unlocked badge awards instant Gems!',
      achieve_unlocked: 'Completed ✓',
      toast_new_achieve: 'New Badge!',

      // Ad Simulation
      ad_sim_loading: 'Loading Sponsored Ad...',
      ad_sim_ready_in: 'Reward will be ready in',
      ad_sim_seconds: 'seconds',

      // VIP Banner
      vip_banner_text: '✨ Royal VIP Pass: Ad-Free + Rare Galaxy Spirits',
      btn_restore_iap: 'Restore Purchases',
      vip_restore_success: 'Apple ID purchases verified successfully!'
    }
  };

  // Determine initial language: saved preference or browser setting
  let savedLang = localStorage.getItem('roya_arya_lang');
  if (!savedLang) {
    const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    savedLang = navLang.startsWith('ar') ? 'ar' : 'en';
  }

  let currentLang = savedLang;

  function t(key, fallback = '') {
    const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
    return dict[key] !== undefined ? dict[key] : (TRANSLATIONS.en[key] || fallback || key);
  }

  function setLanguage(lang) {
    if (lang !== 'ar' && lang !== 'en') lang = 'en';
    currentLang = lang;
    localStorage.setItem('roya_arya_lang', lang);

    const doc = document.documentElement;
    doc.lang = lang;
    doc.dir = TRANSLATIONS[lang].dir;

    // Apply translations to all DOM nodes marked with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (val) {
        if (el.tagName === 'INPUT' && el.type === 'button') {
          el.value = val;
        } else {
          el.innerHTML = val;
        }
      }
    });

    // Apply translations to attributes marked with data-i18n-attr (format: "title:key,placeholder:key")
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const spec = el.getAttribute('data-i18n-attr');
      spec.split(',').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        if (attr && key) {
          el.setAttribute(attr, t(key));
        }
      });
    });

    // Update Language Toggle Button Labels
    document.querySelectorAll('.btn-lang-toggle-text').forEach(el => {
      el.textContent = TRANSLATIONS[lang].toggle_btn_label;
    });

    // Broadcast language change to window
    window.dispatchEvent(new CustomEvent('roya:langchange', { detail: { lang: currentLang } }));
  }

  function toggleLanguage() {
    setLanguage(currentLang === 'ar' ? 'en' : 'ar');
  }

  // Export globals
  window.i18n = {
    t,
    setLanguage,
    toggleLanguage,
    getLang: () => currentLang,
    isRTL: () => currentLang === 'ar',
    translations: TRANSLATIONS
  };

  // Auto-init on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLang);
  });
})();
