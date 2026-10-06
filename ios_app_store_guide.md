# 🍏 دليل رفع لعبة Roya & Arya على Apple App Store

تم تحويل وتجهيز اللعبة بالكامل كمشروع أصلي متوافق مع نظام **iOS (Apple Xcode Workspace)** باستخدام محرك **Capacitor 7**.

---

## 📁 مسار ملفات مشروع iOS الأصلي
المشروع متواجد وجاهز في:
📂 `C:\Users\lenovo\.gemini\antigravity-ide\scratch\roya-and-arya\ios\App\`

الملف الرئيسي الذي يتم فتحه في Xcode هو:
`ios/App/App.xcworkspace`

---

## 🛠️ متطلبات نشر تطبيقات Apple
1. **حساب مطور Apple Developer Program** (99$ / سنوياً).
2. **جهاز Mac بنظام macOS** يحتوي على تطبيق **Xcode** (أو استخدام خدمة سحابية مثل MacInCloud / GitHub Actions / Codemagic إذا كنت تعمل من Windows).

---

## 🚀 خطوات تجهيز ورفع التطبيق خطوة بخطوة

### الخطوة 1: فتح المشروع في Xcode
على جهاز الماك، انتقل إلى مجلد اللعبة واكتب:
```bash
npx cap open ios
```
أو اضغط نقرتين على ملف:
`ios/App/App.xcworkspace`

---

### الخطوة 2: إعداد التوقيع الرقمي (Signing & Capabilities)
1. في الشريط الجانبي الأيسر في Xcode، اختر **App**.
2. انتقل إلى تبويب **Signing & Capabilities**.
3. قم بتفعيل **Automatically manage signing**.
4. اختر حساب المطور الخاص بك في **Team**.
5. تأكد من الـ **Bundle Identifier**:
   `com.royaarya.neonricochet` (أو المعرف المسجل في حسابك).

---

### الخطوة 3: التحقق من الأيقونة وشاشات البدء
* تم تضمين الأيقونة الرسمية عالية الدقة 1024x1024 داخل:
  `ios/App/App/Assets.xcassets/AppIcon.appiconset`
* تم ضبط شاشة البدء (Splash Screen) باللون الداكن الفحمي `#080910`.
* تم قفل اتجاه الشاشة على الوضع الرأسي (Portrait Only) لضمان تجربة لعب مثالية.

---

### الخطوة 4: التصدير والرفع عبر Xcode (Archive & Upload)
1. في القائمة العلوية لاختيار الأجهزة، اختر **Any iOS Device (arm64)** بدلاً من الـ Simulator.
2. من شريط القوائم العلوي، اختر:
   `Product` ➔ `Archive`.
3. بعد اكتمال البناء، ستفتح نافذة **Organizer**.
4. اضغط على زر **Distribute App**.
5. اختر **App Store Connect** ➔ **Upload**.
6. اتبع الخطوات التلقائية وسيقوم Xcode بالتحقق من الحزمة ورفعها مباشرة إلى خوادم Apple.

---

### الخطوة 5: الإطلاق على TestFlight و App Store Connect
1. افتح موقع [App Store Connect](https://appstoreconnect.apple.com).
2. انتقل إلى **Apps** ➔ اضغط `+` ➔ **New App**.
3. املأ البيانات:
   * **Name:** `Roya & Arya: Neon Ricochet`
   * **Primary Language:** Arabic أو English
   * **Bundle ID:** اختر `com.royaarya.neonricochet`
   * **SKU:** `roya-arya-001`
4. في تبويب **TestFlight**، ستظهر النسخة المرفوعة بعد معالجتها تلقائياً لاختبارها مباشرة على هواتف الآيفون.
5. في تبويب **App Store**، ارفع لقطات الشاشة (Screenshots) والوصف، ثم اضغط **Submit for Review**.

---

## ⚡ نصائح هامة لاجتياز مراجعة Apple من أول مرة
* **سياسة الخصوصية (Privacy Policy):** اللعبة تعمل كلياً **Offline-First** بدون طلب أي صلاحيات حساسة (الكاميرا، الموقع، جهات الاتصال)، لذا في صفحة App Privacy اختر "No data collected".
* **التصنيف العمري (Age Rating):** اختر 4+ (مناسب للجميع).
