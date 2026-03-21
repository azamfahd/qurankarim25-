# دليل ربط Google Analytics مع مشروع أنيس القلوب

## 📊 معلومات Google Analytics

تم ربط التطبيق بنجاح مع **Google Analytics 4 (GA4)** باستخدام البيانات التالية:

| المعلومة | القيمة |
|---------|--------|
| **Tracking ID** | `G-JF6G1NEPWT` |
| **Measurement ID** | `387875738` |
| **Script URL** | `https://www.googletagmanager.com/gtag/js?id=G-JF6G1NEPWT` |

## 🔧 التغييرات المطبقة

### 1. تحديث ملف `index.html`

تم إضافة كود Google Analytics الرسمي إلى رأس الملف (head section):

```html
<!-- Google Analytics (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-JF6G1NEPWT"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-JF6G1NEPWT');
</script>
```

**الموقع في الملف:** يوجد الكود مباشرة بعد روابط Google Fonts وقبل Polyfill للمتصفحات القديمة.

## 📈 ما الذي سيتم تتبعه؟

بعد تفعيل Google Analytics، سيتم تتبع:

1. **عدد الزوار** - عدد الأشخاص الذين يزورون التطبيق
2. **جلسات المستخدم** - مدة الجلسة وعدد الصفحات المزارة
3. **الأحداث** - تفاعلات المستخدم مثل:
   - البحث عن الآيات
   - إرسال الرسائل
   - فتح الإعدادات
   - حفظ السجل
4. **معلومات الجهاز** - نوع الجهاز والمتصفح والموقع الجغرافي
5. **الأداء** - سرعة تحميل الصفحة والأخطاء

## 🚀 الخطوات التالية

### للتحقق من أن Google Analytics يعمل:

1. **افتح Google Analytics Dashboard:**
   - اذهب إلى [Google Analytics](https://analytics.google.com)
   - اختر الحساب والخاصية المناسبة
   - انتظر بضع دقائق حتى تظهر البيانات

2. **اختبر التطبيق محلياً:**
   ```bash
   npm run dev
   ```
   - افتح التطبيق في المتصفح
   - تفاعل مع الواجهة (ابحث عن آيات، أرسل رسائل)

3. **تحقق من البيانات في Google Analytics:**
   - اذهب إلى "Real-time" (الوقت الفعلي)
   - يجب أن ترى نشاطك يظهر فوراً

### لإضافة أحداث مخصصة (اختياري):

إذا كنت تريد تتبع أحداث محددة في التطبيق، يمكنك إضافة الكود التالي في مكان معين:

```javascript
// مثال: تتبع عند البحث عن آية
gtag('event', 'search_verse', {
  'search_query': userInput,
  'timestamp': new Date().toISOString()
});

// مثال: تتبع عند حفظ السجل
gtag('event', 'save_history', {
  'history_count': totalMessages,
  'timestamp': new Date().toISOString()
});
```

## 📝 ملاحظات مهمة

- ✅ **الكود مثبت بشكل صحيح** في `index.html`
- ✅ **التطبيق يعمل بدون إنترنت** (Progressive Web App) - Google Analytics سيعمل عند الاتصال بالإنترنت
- ✅ **الخصوصية محمية** - لا يتم تخزين بيانات شخصية حساسة
- ⚠️ **قد يستغرق الأمر 24-48 ساعة** حتى تظهر جميع البيانات في Google Analytics

## 🔐 الأمان والخصوصية

- **Tracking ID عام** - يمكن مشاركته بأمان (ليس سري)
- **لا توجد بيانات شخصية** - لا يتم إرسال كلمات مرور أو معلومات حساسة
- **الامتثال للخصوصية** - يتوافق مع GDPR و سياسات الخصوصية

## 📞 للمساعدة

إذا واجهت مشاكل:

1. تأكد من أن Tracking ID صحيح: `G-JF6G1NEPWT`
2. تحقق من أن الكود موجود في `<head>` من `index.html`
3. افتح "Developer Tools" (F12) وتحقق من عدم وجود أخطاء في Console
4. انتظر 24-48 ساعة قبل القلق من عدم ظهور البيانات

---

**آخر تحديث:** 18 مارس 2026  
**الحالة:** ✅ مفعل وجاهز للاستخدام
