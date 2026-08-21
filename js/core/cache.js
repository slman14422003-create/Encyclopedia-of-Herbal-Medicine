// =====================================================
// إدارة الكاش والتخزين المحلي
// =====================================================

const CacheManager = {
    // حفظ البيانات في الكاش
    save: function(categories, herbs) {
        try {
            const cacheData = {
                categories: categories,
                herbs: herbs,
                timestamp: Date.now(),
                version: APP_CONFIG.VERSION
            };
            localStorage.setItem(APP_CONFIG.CACHE_KEY, JSON.stringify(cacheData));
            console.log('💾 تم حفظ البيانات في الكاش');
            return true;
        } catch (e) {
            console.warn('فشل حفظ الكاش:', e);
            return false;
        }
    },
    
    // تحميل البيانات من الكاش
    load: function(allowEmpty = true) {
        try {
            const raw = localStorage.getItem(APP_CONFIG.CACHE_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                if (data.categories && data.herbs && (data.categories.length > 0 || data.herbs.length > 0 || allowEmpty)) {
                    return {
                        categories: data.categories,
                        herbs: data.herbs,
                        timestamp: data.timestamp,
                        version: data.version
                    };
                }
            }
        } catch (e) {
            console.warn('فشل تحميل الكاش:', e);
        }
        return null;
    },
    
    // مسح الكاش
    clear: function() {
        try {
            localStorage.removeItem(APP_CONFIG.CACHE_KEY);
            // مسح الكاشات القديمة
            localStorage.removeItem('herbal_cache_v2');
            localStorage.removeItem('herbal_cache_v1');
            
            // مسح كاش Service Worker
            if ('caches' in window) {
                caches.keys().then(names => {
                    names.forEach(name => {
                        if (name.includes('herbal')) {
                            caches.delete(name);
                        }
                    });
                });
            }
            
            Utils.showToast('🗑️ تم مسح الكاش بنجاح', 'success');
            return true;
        } catch (e) {
            console.error('فشل مسح الكاش:', e);
            Utils.showToast('❌ فشل مسح الكاش', 'error');
            return false;
        }
    },
    
    // الحصول على معلومات الكاش
    getInfo: function() {
        const data = this.load();
        if (data) {
            const age = Date.now() - (data.timestamp || 0);
            const ageHours = Math.floor(age / (1000 * 60 * 60));
            return {
                hasCache: true,
                herbsCount: data.herbs?.length || 0,
                categoriesCount: data.categories?.length || 0,
                timestamp: data.timestamp,
                date: Utils.formatDate(data.timestamp),
                age: age,
                ageHours: ageHours,
                version: data.version || 'unknown'
            };
        }
        return { hasCache: false };
    },
    
    // تنظيف الكاش القديم تلقائياً
    autoClean: function() {
        const info = this.getInfo();
        if (info.hasCache && info.ageHours > 168) { // أكثر من 7 أيام
            console.log('🧹 تنظيف الكاش القديم تلقائياً');
            this.clear();
        }
    },
    
    // تصدير البيانات إلى ملف JSON
    exportData: function() {
        const data = this.load();
        if (!data) {
            Utils.showToast('⚠️ لا توجد بيانات للتصدير', 'warning');
            return;
        }
        
        const exportData = {
            exportDate: new Date().toISOString(),
            version: APP_CONFIG.VERSION,
            categories: data.categories,
            herbs: data.herbs,
            stats: {
                herbsCount: data.herbs?.length || 0,
                categoriesCount: data.categories?.length || 0
            }
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `herbal_export_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        Utils.showToast('✅ تم تصدير البيانات بنجاح', 'success');
    }
};

window.CacheManager = CacheManager;
