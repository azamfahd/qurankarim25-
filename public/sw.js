
const CACHE_NAME = 'anis-al-qulub-app-v1';
const RUNTIME_CACHE = 'anis-al-qulub-runtime-v1';

// الموارد الأساسية التي يجب تخزينها فوراً عند التثبيت
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

// Install Event: تخزين الملفات الأساسية
self.addEventListener('install', (event) => {
  self.skipWaiting(); // تفعيل التحديث فوراً دون انتظار إغلاق التبويبات
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch((err) => console.log('Precache error:', err))
  );
});

// Activate Event: تنظيف النسخ القديمة من الكاش
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // السيطرة على الصفحات المفتوحة فوراً
  );
});

// Fetch Event: استراتيجيات التعامل مع الطلبات
self.addEventListener('fetch', (event) => {
  // تجاهل الطلبات غير المدعومة (مثل chrome-extension)
  if (!event.request.url.startsWith('http')) return;

  // تجاهل طلبات POST (مثل طلبات Gemini API) لأنها لا تخزن في الكاش
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // استراتيجية 1: Cache First (الكاش أولاً ثم الشبكة)
  // مناسبة لـ: المكتبات الخارجية (esm.sh)، الخطوط، الصور، وملفات الصوت
  if (
    url.hostname.includes('esm.sh') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('everyayah.com') || // تخزين التلاوات
    url.hostname.includes('cdn-icons-png') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|json|mp3)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return caches.open(RUNTIME_CACHE).then((cache) => {
          return fetch(event.request).then((response) => {
            // تخزين الاستجابة الصالحة فقط
            if (response && response.status === 200 && response.type !== 'error') {
              cache.put(event.request, response.clone());
            }
            return response;
          }).catch((err) => {
            // فشل الشبكة ولم نجد الملف في الكاش
            return null;
          });
        });
      })
    );
    return;
  }

  // استراتيجية 2: Network First (الشبكة أولاً ثم الكاش)
  // مناسبة لـ: ملفات التطبيق الرئيسية HTML لضمان الحصول على التحديثات
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // تحديث الكاش بالنسخة الجديدة
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // إذا فشلت الشبكة، نحاول الجلب من الكاش
        return caches.match(event.request);
      })
  );
});