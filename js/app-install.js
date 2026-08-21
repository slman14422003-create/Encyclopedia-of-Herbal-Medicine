// =====================================================
// نظام تثبيت التطبيق (Android Style)
// =====================================================

const AppInstaller = {
    deferredPrompt: null,
    isInstalled: false,
    
    init: function() {
        console.log('[AppInstaller] تهيئة نظام التثبيت...');
        this.setupInstallPrompt();
        this.checkInstallStatus();
        this.setupPeriodicSync();
        this.setupBackgroundFetch();
    },
    
    setupInstallPrompt: function() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallBanner();
            console.log('[AppInstaller] تم اكتشاف إمكانية التثبيت');
        });
        
        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.deferredPrompt = null;
            this.hideInstallBanner();
            this.showWelcomeNotification();
            console.log('[AppInstaller] تم تثبيت التطبيق بنجاح');
        });
    },
    
    showInstallBanner: function() {
        // إزالة أي بانر موجود
        const existingBanner = document.querySelector('.install-banner');
        if (existingBanner) existingBanner.remove();
        
        const banner = document.createElement('div');
        banner.className = 'install-banner';
        banner.innerHTML = `
            <div class="install-banner-content">
                <div class="install-banner-icon">
                    <i class="fas fa-download"></i>
                </div>
                <div class="install-banner-text">
                    <strong>تثبيت التطبيق</strong>
                    <span>قم بتثبيت الموسوعة على جهازك للوصول السريع</span>
                </div>
                <button class="install-banner-btn" id="installAppBtn">
                    تثبيت
                </button>
                <button class="install-banner-close" id="closeBannerBtn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        document.body.appendChild(banner);
        
        document.getElementById('installAppBtn')?.addEventListener('click', () => this.installApp());
        document.getElementById('closeBannerBtn')?.addEventListener('click', () => this.hideInstallBanner());
        
        // تخزين أن المستخدم شاهد البانر
        localStorage.setItem('install_banner_shown', 'true');
    },
    
    hideInstallBanner: function() {
        const banner = document.querySelector('.install-banner');
        if (banner) banner.remove();
    },
    
    installApp: async function() {
        if (!this.deferredPrompt) {
            this.showInstallGuide();
            return;
        }
        
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            this.isInstalled = true;
            this.hideInstallBanner();
            this.showToast('✅ تم تثبيت التطبيق بنجاح!', 'success');
        } else {
            this.showToast('❌ تم إلغاء التثبيت', 'info');
        }
        this.deferredPrompt = null;
    },
    
    showInstallGuide: function() {
        const modal = document.createElement('div');
        modal.className = 'modal-glass active';
        modal.innerHTML = `
            <div class="modal-glass-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3><i class="fas fa-download"></i> تثبيت التطبيق</h3>
                    <div class="close-modal-btn" onclick="this.closest('.modal-glass').classList.remove('active')">✕</div>
                </div>
                <div style="text-align:center; padding:20px;">
                    <i class="fas fa-mobile-alt" style="font-size:60px; color:var(--primary); margin-bottom:15px;"></i>
                    <p>لتثبيت التطبيق على جهازك:</p>
                    <ul style="text-align:right; margin:15px 0;">
                        <li>📍 في Chrome: اضغط على القائمة (⋮) ثم "تثبيت التطبيق"</li>
                        <li>📍 في Samsung Internet: اضغط على القائمة ثم "إضافة إلى الشاشة الرئيسية"</li>
                        <li>📍 في Firefox: اضغط على القائمة ثم "تثبيت"</li>
                    </ul>
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" onclick="this.closest('.modal-glass').classList.remove('active')">فهمت</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },
    
    checkInstallStatus: function() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            document.body.classList.add('app-installed');
            console.log('[AppInstaller] التطبيق يعمل في وضع التطبيق المثبت');
        }
        
        window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
            if (e.matches) {
                this.isInstalled = true;
                document.body.classList.add('app-installed');
            }
        });
    },
    
    setupPeriodicSync: function() {
        if ('periodicSync' in navigator.serviceWorker) {
            navigator.serviceWorker.ready.then(reg => {
                reg.periodicSync.register('periodic-sync', {
                    minInterval: 24 * 60 * 60 * 1000 // كل 24 ساعة
                }).catch(e => console.log('[AppInstaller] Periodic sync not supported:', e));
            });
        }
    },
    
    setupBackgroundFetch: function() {
        if ('BackgroundFetchManager' in window) {
            console.log('[AppInstaller] Background fetch متاحة');
        }
    },
    
    setupAutoUpdate: function() {
        // التحقق من التحديثات كل ساعة
        setInterval(() => {
            if (navigator.onLine && this.isInstalled) {
                this.checkForUpdates();
            }
        }, 60 * 60 * 1000);
    },
    
    checkForUpdates: async function() {
        try {
            const response = await fetch('./version.json?t=' + Date.now());
            const newVersion = await response.json();
            const currentVersion = localStorage.getItem('app_version');
            
            if (currentVersion && currentVersion !== newVersion.version) {
                this.showUpdateNotification(newVersion);
            }
            localStorage.setItem('app_version', newVersion.version);
        } catch(e) {
            console.error('[AppInstaller] فشل التحقق من التحديثات:', e);
        }
    },
    
    showUpdateNotification: function(version) {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-notification-content">
                <i class="fas fa-sync-alt fa-spin"></i>
                <span>🔄 تحديث جديد متاح (${version.version})</span>
                <button onclick="location.reload()">تحديث الآن</button>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 10000);
    },
    
    showWelcomeNotification: function() {
        setTimeout(() => {
            this.showToast('🎉 شكراً لتثبيت تطبيق موسوعة الأعشاب!', 'success');
        }, 1000);
    },
    
    showToast: function(message, type) {
        const toast = document.createElement('div');
        toast.className = 'app-toast';
        toast.innerHTML = `<div class="app-toast-content ${type}">${message}</div>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

// تشغيل مدير التثبيت
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AppInstaller.init());
} else {
    AppInstaller.init();
}

window.AppInstaller = AppInstaller;
window.installApp = () => AppInstaller.installApp();
