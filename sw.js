// =====================================================
// Service Worker متقدم - تطبيق Android نظامي
// الإصدار 7.0 - تخزين دائم ومزامنة ذكية
// =====================================================

const CACHE_VERSION = 'v7';
const CACHE_NAME = `herbal-pwa-${CACHE_VERSION}`;
const STATIC_CACHE = `herbal-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `herbal-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `herbal-images-${CACHE_VERSION}`;
const DATA_CACHE = `herbal-data-${CACHE_VERSION}`;
const OFFLINE_CACHE = `herbal-offline-${CACHE_VERSION}`;

// فترة فحص التحديثات (كل 24 ساعة)
const UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000;

// الأصول الثابتة
const STATIC_ASSETS = [
  '.',
  './',
  './index.html',
  './manifest.json',
  './offline.html',
  './compare.html',
  './help.html',
  './privacy.html',
  './css/style.css',
  './js/firebase-config.js',
  './js/firebase-auth.js',
  './js/firebase-sync.js',
  './js/config/constants.js',
  './js/config/app-config.js',
  './js/core/utils.js',
  './js/core/cache.js',
  './js/core/ui.js',
  './js/features/compare.js',
  './js/features/bookmarks.js',
  './js/features/search.js',
  './js/features/herbs.js',
  './js/features/categories.js',
  './js/features/firebase-admin.js',
  './js/events.js',
  './js/app.js',
  './js/pwa.js',
  './js/performance-optimizer.js',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js'
];

// صفحة عدم الاتصال
const OFFLINE_PAGE = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>غير متصل - موسوعة الأعشاب الطبية</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Cairo',sans-serif;background:linear-gradient(135deg,#1b5e20,#2e7d32);color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center}
        .container{max-width:400px;padding:30px}
        .icon{font-size:80px;margin-bottom:20px;animation:float 2s infinite}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        h1{font-size:24px;margin-bottom:10px}
        p{font-size:14px;opacity:0.9;margin-bottom:30px}
        .btn{background:#ffd700;color:#1b5e20;border:none;padding:12px 28px;border-radius:60px;font-size:16px;font-weight:bold;cursor:pointer}
        .features{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:30px}
        .feature{background:rgba(255,255,255,0.1);padding:8px 15px;border-radius:50px;font-size:12px}
        .version{margin-top:30px;font-size:11px;opacity:0.5}
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🌿</div>
        <h1>⚠️ غير متصل بالإنترنت</h1>
        <p>يبدو أنك غير متصل بالإنترنت.<br>البيانات المتاحة حالياً هي آخر نسخة محفوظة.</p>
        <button class="btn" onclick="location.reload()">🔄 إعادة المحاولة</button>
        <div class="features">
            <span class="feature">📚 بيانات محفوظة</span>
            <span class="feature">🔍 بحث محلي</span>
            <span class="feature">⭐ إشارات مرجعية</span>
            <span class="feature">📝 ملاحظات</span>
        </div>
        <div class="version">موسوعة الأعشاب الطبية - الإصدار 7.0</div>
    </div>
</body>
</html>`;

// تثبيت Service Worker
self.addEventListener('install', event => {
  console.log(`[SW] تثبيت الإصدار ${CACHE_VERSION}...`);
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// تفعيل Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] تفعيل...');
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map(key => {
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE && 
              key !== IMAGE_CACHE && key !== DATA_CACHE && 
              key !== OFFLINE_CACHE && key !== CACHE_NAME) {
            console.log('[SW] حذف الكاش القديم:', key);
            return caches.delete(key);
          }
        })
      );
      await self.clients.claim();
    })()
  );
});

// ========== استراتيجيات التخزين المتقدمة ==========

// طلبات Firebase - Network First مع تخزين مؤقت
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // بيانات Firebase - تخزين مؤقت للاستخدام دون اتصال
  if (url.hostname.includes('firebase') || url.hostname.includes('firestore')) {
    event.respondWith(
      fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(DATA_CACHE).then(cache => {
          cache.put(event.request.url, clone);
        });
        return response;
      }).catch(async () => {
        const cached = await caches.match(event.request.url);
        if (cached) return cached;
        return new Response(JSON.stringify({ 
          error: 'offline', 
          message: 'غير متصل بالإنترنت، يتم عرض البيانات المخزنة' 
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }
  
  // الأصول الثابتة - Cache First
  if (STATIC_ASSETS.some(asset => url.href.includes(asset)) || 
      url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }
  
  // الصور - Stale-While-Revalidate
  if (url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)/i)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async cache => {
        const cached = await cache.match(event.request);
        const fetchPromise = fetch(event.request).then(response => {
          if (response && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }
  
  // باقي الطلبات - Network First
  event.respondWith(
    fetch(event.request).then(response => {
      const clone = response.clone();
      caches.open(DYNAMIC_CACHE).then(cache => cache.put(event.request, clone));
      return response;
    }).catch(async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      if (event.request.mode === 'navigate') {
        return caches.match('./offline.html') || new Response(OFFLINE_PAGE, {
          headers: { 'Content-Type': 'text/html' }
        });
      }
      return new Response('غير متصل', { status: 503 });
    })
  );
});

// ========== مزامنة الخلفية ==========
self.addEventListener('sync', event => {
  console.log('[SW] مزامنة خلفية:', event.tag);
  
  if (event.tag === 'sync-herbs') {
    event.waitUntil(
      (async () => {
        try {
          const clients = await self.clients.matchAll({ type: 'window' });
          clients.forEach(client => {
            client.postMessage({ type: 'SYNC_STARTED' });
          });
          
          // محاولة المزامنة مع Firebase
          const syncData = await caches.match('/sync-data');
          if (syncData) {
            const data = await syncData.json();
            await fetch('/api/sync', {
              method: 'POST',
              body: JSON.stringify(data),
              headers: { 'Content-Type': 'application/json' }
            });
            await caches.delete('/sync-data');
          }
          
          clients.forEach(client => {
            client.postMessage({ type: 'SYNC_COMPLETED' });
          });
        } catch (err) {
          console.error('[SW] فشل المزامنة:', err);
        }
      })()
    );
  }
});

// ========== إشعارات الدفع ==========
self.addEventListener('push', event => {
  let data = {
    title: '🌿 موسوعة الأعشاب الطبية',
    body: '📚 تحديث جديد في الموسوعة!',
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-72.png',
    vibrate: [200, 100, 200],
    tag: 'herbal-update'
  };
  
  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch(e) {
      data.body = event.data.text();
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      vibrate: data.vibrate,
      tag: data.tag,
      renotify: true,
      actions: [
        { action: 'open', title: '📖 فتح التطبيق' },
        { action: 'dismiss', title: '❌ إغلاق' }
      ]
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'open') {
    event.waitUntil(clients.openWindow('./'));
  }
});

// ========== معالجة الرسائل من التطبيق ==========
self.addEventListener('message', event => {
  const { type, data } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(
        (async () => {
          const keys = await caches.keys();
          await Promise.all(keys.map(key => caches.delete(key)));
          if (event.ports?.[0]) {
            event.ports[0].postMessage({ success: true });
          }
        })()
      );
      break;
      
    case 'GET_CACHE_SIZE':
      event.waitUntil(
        (async () => {
          const keys = await caches.keys();
          let total = 0;
          for (const key of keys) {
            const cache = await caches.open(key);
            const requests = await cache.keys();
            total += requests.length;
          }
          if (event.ports?.[0]) {
            event.ports[0].postMessage({ size: total, caches: keys.length });
          }
        })()
      );
      break;
      
    case 'CACHE_DATA':
      if (data && data.url && data.content) {
        event.waitUntil(
          caches.open(DATA_CACHE).then(cache => {
            return cache.put(data.url, new Response(JSON.stringify(data.content), {
              headers: { 'Content-Type': 'application/json' }
            }));
          })
        );
      }
      break;
  }
});

// التحقق الدوري من التحديثات
setInterval(async () => {
  try {
    const registration = await self.registration;
    await registration.update();
  } catch(e) {
    console.error('[SW] فشل التحقق من التحديثات:', e);
  }
}, UPDATE_CHECK_INTERVAL);

console.log(`[SW] ✅ Service Worker ${CACHE_VERSION} - جاهز كتطبيق Android`);
