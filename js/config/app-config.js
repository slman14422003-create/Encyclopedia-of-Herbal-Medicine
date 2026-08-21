// =====================================================
// الإعدادات الأساسية للتطبيق
// =====================================================

const AppConfig = {
    // إعدادات الصور
    images: {
        maxWidth: 800,
        defaultQuality: 0.8,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxSize: 5 * 1024 * 1024 // 5 MB
    },
    
    // إعدادات البحث
    search: {
        minQueryLength: 2,
        maxResults: 50,
        debounceDelay: 300
    },
    
    // إعدادات الواجهة
    ui: {
        animationsEnabled: true,
        toastDuration: 3000,
        splashTimeout: 3000,
        autoHideProgressDelay: 1500
    },
    
    // إعدادات المزامنة
    sync: {
        retryAttempts: 5,
        retryDelay: 1000,
        timeout: 25000,
        autoSync: true
    },
    
    // إعدادات الإشعارات
    notifications: {
        enabled: true,
        defaultIcon: 'icons/icon-192.png',
        vibrate: [200, 100, 200]
    },
    
    // إعدادات الأمان
    security: {
        adminEmailPattern: /@/,
        minPasswordLength: 6,
        sessionTimeout: 24 * 60 * 60 * 1000 // 24 ساعة
    },
    
    // خطوط حجم النص
    fontLevels: {
        normal: { class: '', label: 'عادي', size: '1rem' },
        large: { class: 'font-large', label: 'كبير', size: '1.2rem' },
        xlarge: { class: 'font-xlarge', label: 'أكبر', size: '1.4rem' }
    }
};

// تصدير
window.AppConfig = AppConfig;
