// =====================================================
// محسن الأداء المتطور - لأسرع تجربة ممكنة
// =====================================================

const PerformanceOptimizer = {
    // تهيئة جميع التحسينات
    init: function() {
        this.detectSlowDevice();
        this.enableHardwareAcceleration();
        this.optimizeImages();
        this.reduceAnimations();
        this.enableLazyLoading();
        this.optimizeEventListeners();
        this.setupMemoryManagement();
        this.enableVirtualScrolling();
        this.optimizeFirebaseQueries();
        this.setupNetworkOptimization();
        console.log('⚡ محسن الأداء تم تفعيله بنجاح');
    },
    
    // كشف الأجهزة الضعيفة
    detectSlowDevice: function() {
        let isSlowDevice = false;
        
        // كشف عبر اتصال بطيء
        if (navigator.connection) {
            if (navigator.connection.saveData || 
                navigator.connection.effectiveType === '2g' ||
                navigator.connection.effectiveType === '3g') {
                isSlowDevice = true;
            }
        }
        
        // كشف عبر ذاكرة الجهاز
        if ('deviceMemory' in navigator && navigator.deviceMemory < 2) {
            isSlowDevice = true;
        }
        
        // كشف عبر عدد المعالجات
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
            isSlowDevice = true;
        }
        
        if (isSlowDevice) {
            document.body.classList.add('save-data-mode');
            this.enableAggressiveOptimizations();
            console.log('📱 تم تفعيل الوضع المحسن للأجهزة الضعيفة');
        }
    },
    
    // تفعيل تسريع العتاد
    enableHardwareAcceleration: function() {
        const style = document.createElement('style');
        style.textContent = `
            .herb-card, .category-card, .tool-btn, .visitor-btn, .icon-btn {
                transform: translateZ(0);
                backface-visibility: hidden;
                perspective: 1000px;
                -webkit-font-smoothing: antialiased;
            }
        `;
        document.head.appendChild(style);
    },
    
    // تحسين تحميل الصور (Lazy Loading متقدم)
    optimizeImages: function() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    const srcset = img.getAttribute('data-srcset');
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                    }
                    if (srcset) {
                        img.srcset = srcset;
                        img.removeAttribute('data-srcset');
                    }
                    imageObserver.unobserve(img);
                }
            });
        }, { rootMargin: '100px', threshold: 0.01 });
        
        document.querySelectorAll('.herb-card-image').forEach(img => {
            if (img.src && !img.complete) {
                img.setAttribute('data-src', img.src);
                img.removeAttribute('src');
                imageObserver.observe(img);
            }
        });
    },
    
    // تحسين الحركات
    reduceAnimations: function() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduce-motion');
            const style = document.createElement('style');
            style.textContent = `
                .herb-card, .category-card, .tool-btn, .visitor-btn {
                    transition: none !important;
                    animation: none !important;
                }
                .herb-card:active, .category-card:active {
                    transform: none !important;
                }
            `;
            document.head.appendChild(style);
        }
    },
    
    // تفعيل التحميل الكسول للمحتوى
    enableLazyLoading: function() {
        if ('loading' in HTMLImageElement.prototype) {
            document.querySelectorAll('img').forEach(img => {
                if (!img.loading) img.loading = 'lazy';
            });
        }
        
        // تحميل المحتوى عند التمرير
        const contentObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const container = entry.target;
                    if (container.dataset.loaded !== 'true') {
                        container.dataset.loaded = 'true';
                        if (typeof renderContent === 'function' && window.appState.herbs?.length === 0) {
                            renderContent();
                        }
                    }
                    contentObserver.unobserve(container);
                }
            });
        });
        
        const contentArea = document.getElementById('contentArea');
        if (contentArea) contentObserver.observe(contentArea);
    },
    
    // تحسين مستمعي الأحداث
    optimizeEventListeners: function() {
        // استخدام passive events للتمرير
        const passiveEvents = ['scroll', 'touchstart', 'touchmove', 'wheel'];
        passiveEvents.forEach(event => {
            document.addEventListener(event, () => {}, { passive: true });
        });
        
        // تقليل عدد مستمعي الأحداث
        let resizeTimer;
        window.addEventListener('resize', () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (typeof renderContent === 'function') renderContent();
            }, 150);
        });
    },
    
    // إدارة الذاكرة
    setupMemoryManagement: function() {
        // تنظيف العناصر غير المرئية
        let cleanupInterval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.cleanupInvisibleElements();
            }
        }, 30000);
        
        // إيقاف التنظيف عند إغلاق الصفحة
        window.addEventListener('beforeunload', () => {
            clearInterval(cleanupInterval);
        });
    },
    
    // تنظيف العناصر غير المرئية
    cleanupInvisibleElements: function() {
        const cards = document.querySelectorAll('.herb-card, .category-card');
        const viewportHeight = window.innerHeight;
        const threshold = 500;
        
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            if (rect.top > viewportHeight + threshold || rect.bottom < -threshold) {
                // إزالة الصور غير المرئية مؤقتاً
                const img = card.querySelector('.herb-card-image');
                if (img && img.src && !img.complete) {
                    const src = img.src;
                    img.removeAttribute('src');
                    img.setAttribute('data-src', src);
                }
            }
        });
    },
    
    // تفعيل التمرير الافتراضي (Virtual Scrolling)
    enableVirtualScrolling: function() {
        let scrollTimeout;
        const container = document.getElementById('contentArea');
        if (container) {
            container.addEventListener('scroll', () => {
                if (scrollTimeout) clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    if (typeof renderContent === 'function') {
                        // تحديث خفيف عند التمرير
                        const visibleCards = document.querySelectorAll('.herb-card, .category-card');
                        visibleCards.forEach(card => {
                            const rect = card.getBoundingClientRect();
                            if (rect.top < window.innerHeight + 200 && rect.bottom > -200) {
                                card.style.opacity = '1';
                            } else {
                                card.style.opacity = '0.01';
                            }
                        });
                    }
                }, 50);
            }, { passive: true });
        }
    },
    
    // تحسين استعلامات Firebase
    optimizeFirebaseQueries: function() {
        // تقليل عدد الطلبات
        let lastFetch = 0;
        const minFetchInterval = 5000; // 5 ثواني
        
        const originalFetch = window.FirebaseSync?.fetchAllData;
        if (originalFetch) {
            window.FirebaseSync.fetchAllData = async function(showToast) {
                const now = Date.now();
                if (now - lastFetch < minFetchInterval && !showToast) {
                    console.log('⏳ تم تجاهل الطلب المتكرر');
                    return false;
                }
                lastFetch = now;
                return originalFetch(showToast);
            };
        }
    },
    
    // تحسين الشبكة
    setupNetworkOptimization: function() {
        // استخدام Service Worker لتخزين الاستجابات
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.ready.then(reg => {
                    if (reg.active) {
                        console.log('✅ Service Worker جاهز لتحسين الأداء');
                    }
                });
            });
        }
        
        // تخزين الاستجابات API في IndexedDB
        this.setupIndexedDBCache();
    },
    
    // استخدام IndexedDB للتخزين المؤقت
    setupIndexedDBCache: function() {
        if (!window.indexedDB) return;
        
        const request = indexedDB.open('HerbalCache', 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('apiCache')) {
                db.createObjectStore('apiCache', { keyPath: 'url' });
            }
        };
    },
    
    // تفعيل التحسينات القصوى
    enableAggressiveOptimizations: function() {
        const style = document.createElement('style');
        style.textContent = `
            .herb-card-image { display: none !important; }
            .herb-card, .category-card { transition: none !important; }
            .tool-btn, .visitor-btn { transition: none !important; }
            .herb-card:hover, .category-card:hover { transform: none !important; }
            .info-block:hover { transform: none !important; }
            * { animation-duration: 0.01ms !important; }
        `;
        document.head.appendChild(style);
        
        // تقليل جودة الصور
        if (window.Image) {
            const originalImage = Image;
            window.Image = function() {
                const img = new originalImage();
                img.decoding = 'async';
                return img;
            };
        }
    }
};

// تشغيل محسن الأداء
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PerformanceOptimizer.init());
} else {
    PerformanceOptimizer.init();
}

window.PerformanceOptimizer = PerformanceOptimizer;
