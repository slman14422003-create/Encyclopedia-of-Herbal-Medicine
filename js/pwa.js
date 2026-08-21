// =====================================================
// PWA متقدم - تجربة تطبيق Android حقيقي
// =====================================================

const PWAManager = {
    deferredPrompt: null,
    isInstalled: false,
    
    init: async function() {
        console.log('[PWA] بدء تهيئة التطبيق...');
        await this.registerServiceWorker();
        this.setupInstallPrompt();
        this.checkInstallStatus();
        this.setupAutoUpdate();
        this.setupBackgroundSync();
        this.setupPushNotifications();
        this.setupSplashScreen();
        this.setupAppBadge();
        this.setupWakeLock();
        this.setupScreenOrientation();
    },
    
    // تسجيل Service Worker متقدم
    registerServiceWorker: async function() {
        if (!('serviceWorker' in navigator)) {
            console.log('[PWA] Service Worker غير مدعوم');
            return false;
        }
        
        try {
            const swCode = `// Service Worker متقدم لتجربة تطبيق حقيقي
const CACHE_NAME = 'herbal-app-v8';
const STATIC_CACHE = 'herbal-static-v8';
const DATA_CACHE = 'herbal-data-v8';
const IMAGE_CACHE = 'herbal-images-v8';

const STATIC_ASSETS = [
    '.', './', './index.html', './manifest.json', './offline.html',
    './css/style.css', './js/firebase-config.js', './js/firebase-auth.js',
    './js/firebase-sync.js', './js/config/constants.js', './js/config/app-config.js',
    './js/core/utils.js', './js/core/cache.js', './js/core/ui.js',
    './js/features/compare.js', './js/features/bookmarks.js', './js/features/search.js',
    './js/features/herbs.js', './js/features/categories.js', './js/features/firebase-admin.js',
    './js/events.js', './js/app.js', './js/pwa.js'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (key !== STATIC_CACHE && key !== DATA_CACHE && 
                    key !== IMAGE_CACHE && key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            })
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    if (event.request.destination === 'image') {
        event.respondWith(
            caches.match(event.request).then(cached => {
                const fetchPromise = fetch(event.request).then(response => {
                    if (response && response.status === 200) {
                        caches.open(IMAGE_CACHE).then(cache => cache.put(event.request, response.clone()));
                    }
                    return response;
                }).catch(() => cached);
                return cached || fetchPromise;
            })
        );
        return;
    }
    
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => caches.match('./offline.html'))
        );
        return;
    }
    
    event.respondWith(
        caches.match(event.request).then(cached => {
            return cached || fetch(event.request).then(response => {
                const clone = response.clone();
                caches.open(DATA_CACHE).then(cache => cache.put(event.request, clone));
                return response;
            });
        })
    );
});

self.addEventListener('sync', event => {
    if (event.tag === 'sync-herbs') {
        event.waitUntil(
            fetch('/api/sync').catch(() => console.log('Sync failed'))
        );
    }
});

self.addEventListener('push', event => {
    let data = { title: '🌿 موسوعة الأعشاب', body: 'تحديث جديد!' };
    if (event.data) {
        try { data = event.data.json(); } catch(e) { data.body = event.data.text(); }
    }
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-72.png',
            vibrate: [200, 100, 200],
            data: { url: './' }
        })
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data?.url || './'));
});`;
            
            const swBlob = new Blob([swCode], { type: 'application/javascript' });
            const swURL = URL.createObjectURL(swBlob);
            const registration = await navigator.serviceWorker.register(swURL);
            this.swRegistration = registration;
            console.log('[PWA] ✅ Service Worker تم تسجيله');
            return true;
        } catch (error) {
            console.error('[PWA] ❌ فشل التسجيل:', error);
            return false;
        }
    },
    
    // إعداد تثبيت التطبيق
    setupInstallPrompt: function() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
            console.log('[PWA] ✅ جاهز للتثبيت');
        });
        
        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.deferredPrompt = null;
            this.hideInstallButton();
            this.showToast('🎉 تم تثبيت التطبيق بنجاح!', 'success');
            console.log('[PWA] ✅ تم تثبيت التطبيق');
        });
    },
    
    // إظهار زر التثبيت
    showInstallButton: function() {
        const installBtn = document.getElementById('installPwaBtn');
        if (installBtn) {
            installBtn.style.display = 'flex';
            installBtn.style.animation = 'pulse 0.5s';
        }
    },
    
    hideInstallButton: function() {
        const installBtn = document.getElementById('installPwaBtn');
        if (installBtn) installBtn.style.display = 'none';
    },
    
    // تثبيت التطبيق
    installPWA: async function() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                this.isInstalled = true;
                this.hideInstallButton();
                this.showToast('✅ تم تثبيت التطبيق', 'success');
            }
            this.deferredPrompt = null;
        } else {
            this.showInstallGuide();
        }
    },
    
    showInstallGuide: function() {
        alert('📲 لتثبيت التطبيق:\n\n• Chrome: اضغط القائمة ⋮ ثم "تثبيت التطبيق"\n• Safari: اضغط مشاركة ثم "إضافة إلى الشاشة الرئيسية"');
    },
    
    // التحقق من حالة التثبيت
    checkInstallStatus: function() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            this.hideInstallButton();
            document.body.classList.add('app-installed');
            console.log('[PWA] ✅ التطبيق يعمل في وضع PWA');
        }
        
        window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
            if (e.matches) {
                this.isInstalled = true;
                this.hideInstallButton();
            }
        });
    },
    
    // تحديث تلقائي
    setupAutoUpdate: function() {
        // التحقق من التحديثات كل ساعة
        setInterval(() => {
            if (navigator.onLine && this.swRegistration) {
                this.swRegistration.update();
                console.log('[PWA] 🔍 التحقق من التحديثات...');
            }
        }, 60 * 60 * 1000);
        
        // مراقبة التحديثات من Service Worker
        navigator.serviceWorker?.addEventListener('message', (event) => {
            if (event.data?.type === 'UPDATE_AVAILABLE') {
                this.showUpdateNotification();
            }
        });
    },
    
    showUpdateNotification: function() {
        const toast = document.createElement('div');
        toast.className = 'update-toast';
        toast.innerHTML = `
            <div style="position:fixed;bottom:20px;left:20px;right:20px;background:var(--primary);color:white;padding:12px 20px;border-radius:60px;z-index:10000;display:flex;justify-content:space-between;align-items:center;">
                <span>🔄 تحديث جديد متاح!</span>
                <button onclick="location.reload()" style="background:white;color:var(--primary);border:none;border-radius:30px;padding:5px 15px;cursor:pointer;">تحديث</button>
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 10000);
    },
    
    // مزامنة الخلفية
    setupBackgroundSync: function() {
        if ('sync' in navigator.serviceWorker) {
            navigator.serviceWorker.ready.then(reg => {
                reg.sync.register('sync-herbs').catch(e => console.log('[PWA] Background sync:', e));
            });
        }
    },
    
    // إشعارات الدفع
    setupPushNotifications: async function() {
        if ('Notification' in window && navigator.serviceWorker) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('[PWA] ✅ إشعارات مفعلة');
            }
        }
    },
    
    // شاشة بداية محسنة
    setupSplashScreen: function() {
        const splash = document.getElementById('splashScreen');
        const mainApp = document.getElementById('mainApp');
        if (splash && mainApp) {
            setTimeout(() => {
                splash.style.opacity = '0';
                splash.style.visibility = 'hidden';
                setTimeout(() => {
                    splash.style.display = 'none';
                    mainApp.style.display = 'block';
                }, 500);
            }, 2000);
        }
    },
    
    // شارة التطبيق (Badge)
    setupAppBadge: function() {
        if ('setAppBadge' in navigator) {
            // عرض عدد التحديثات
            setInterval(() => {
                const herbsCount = window.appState?.herbs?.length || 0;
                navigator.setAppBadge(herbsCount).catch(() => {});
            }, 60000);
        }
    },
    
    // منع الشاشة من الإطفاء
    setupWakeLock: function() {
        let wakeLock = null;
        const requestWakeLock = async () => {
            if ('wakeLock' in navigator) {
                try {
                    wakeLock = await navigator.wakeLock.request('screen');
                    console.log('[PWA] ✅ Wake Lock مفعل');
                } catch(e) {}
            }
        };
        requestWakeLock();
    },
    
    // قفل اتجاه الشاشة
    setupScreenOrientation: function() {
        if ('screen' in window && 'orientation' in window.screen) {
            window.screen.orientation.lock('portrait').catch(() => {});
        }
    },
    
    // عرض رسالة
    showToast: function(message, type) {
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2e7d32';
        toast.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:${bgColor};color:white;padding:10px 20px;border-radius:40px;z-index:10001;font-size:13px;`;
        toast.innerHTML = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

// تهيئة PWA
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => PWAManager.init(), 500);
});

// ربط زر التثبيت
document.addEventListener('DOMContentLoaded', () => {
    const installBtn = document.getElementById('installPwaBtn');
    if (installBtn) {
        installBtn.addEventListener('click', () => PWAManager.installPWA());
    }
});

window.PWAManager = PWAManager;
window.installPWA = () => PWAManager.installPWA();
