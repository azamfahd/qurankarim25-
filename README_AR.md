# دليل مشروع "أنيس القلوب" (Anis Al-Qulub - Quranic Companion)

هذا الملف يشرح كافة التفاصيل التقنية، خطوات الربط، وطريقة النشر الخاصة بتطبيق "أنيس القلوب".

## 1. نظرة عامة على المشروع
"أنيس القلوب" هو رفيق قرآني ذكي يستخدم الذكاء الاصطناعي (Gemini API) لتقديم آيات قرآنية وتفاسير مناسبة للحالة النفسية للمستخدم، مع ميزات إضافية مثل الأذكار، المسبحة، أوقات الصلاة، والقبلة.

## 2. التقنيات المستخدمة
*   **Frontend:** React (TypeScript) + Vite.
*   **Styling:** Tailwind CSS + Framer Motion (للتحريك).
*   **AI:** Google Gemini API (عبر مكتبة `@google/genai`).
*   **Backend & Auth:** Firebase (Firestore & Authentication) + Supabase (خيار بديل للمزامنة).
*   **Icons:** Lucide React.

## 3. إعدادات الربط (Integration)

### أ. ربط الذكاء الاصطناعي (Gemini API)
التطبيق يعتمد على مفتاح API من Google AI Studio.
1.  احصل على مفتاح من: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2.  في بيئة AI Studio Build، قم بإضافة السر (Secret) باسم `GEMINI_API_KEY`.
3.  يمكن للمستخدمين أيضاً إضافة مفاتيحهم الخاصة من داخل إعدادات التطبيق.

### ب. ربط قاعدة البيانات (Firebase & Supabase)
تم دمج نظام مزامنة مزدوج يتيح للمستخدم الاختيار بين Firebase و Supabase.

#### 1. Firebase (الخيار التلقائي)
يتم إعداده عبر أداة `set_up_firebase`.
*   `firebase-applet-config.json`: بيانات الاتصال.
*   `firestore.rules`: قواعد الأمان.

#### 2. Supabase (الخيار الأساسي الجديد)
لربط Supabase، أضف الأسرار التالية:
*   `VITE_SUPABASE_URL`: رابط المشروع.
*   `VITE_SUPABASE_ANON_KEY`: مفتاح Anon.

### ج. ميزة "نظام المزامنة الأساسي"
يمكن للمستخدم التبديل بين Firestore و Supabase من داخل الإعدادات > الحساب.
*   تم تعيين **Supabase كخيار أساسي**.
*   يعمل **Firestore كبديل تلقائي** في حال عدم توفر إعدادات Supabase.

## 4. خطوات النشر والتشغيل

### التشغيل المحلي (Local Development)
1.  قم بتحميل المشروع.
2.  نفذ الأمر `npm install` لتثبيت المكتبات.
3.  نفذ الأمر `npm run dev` للتشغيل.

### النشر (Deployment)
التطبيق مهيأ للنشر على **Cloud Run** أو أي منصة استضافة ثابتة (مثل Vercel أو Firebase Hosting).
*   **لبناء المشروع:** `npm run build`.
*   **المخرجات:** ستجدها في مجلد `dist/`.

## 5. قواعد الأمان (Firestore Rules)
تم إعداد القواعد لتكون صارمة:
*   لا يمكن لأي مستخدم قراءة أو كتابة بيانات مستخدم آخر.
*   يتم التحقق من صحة البيانات (Validation) قبل حفظها (مثل طول الاسم، تنسيق البريد، إلخ).
*   يوجد نظام "مسؤول" (Admin) محدد ببريدك الإلكتروني (`azamfahd25@gmail.com`) للتحكم الكامل إذا لزم الأمر.

## 6. ميزات هامة في الكود
*   **PWA Ready:** التطبيق يدعم التثبيت على الهاتف (Installable).
*   **Offline Mode:** يعمل التطبيق جزئياً بدون إنترنت (الأذكار، المسبحة، عرض البيانات المحفوظة محلياً).
*   **Responsive Design:** واجهة متوافقة تماماً مع الجوال والحاسوب.
*   **Error Handling:** نظام متطور لالتقاط أخطاء Firebase وعرضها للمطور لتسهيل الإصلاح.

## 7. ملاحظات للمطور
*   عند تغيير هيكل البيانات في Firestore، يجب تحديث ملف `firestore.rules` وملف `firebase-blueprint.json`.
*   يتم استخدام `localStorage` كنسخة احتياطية في حال فشل الاتصال بـ Firebase.

---
تم إعداد هذا الدليل لمساعدتك في فهم وإدارة مشروعك بكل سهولة.
