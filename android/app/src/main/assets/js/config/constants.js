// =====================================================
// الثوابت والمتغيرات العامة
// =====================================================

// ثوابت التطبيق
const APP_CONFIG = {
    NAME: 'موسوعة الأعشاب الطبية',
    VERSION: '5.0.0',
    CACHE_KEY: 'herbal_cache_v3',
    MAX_COMPARE_ITEMS: 4,
    MAX_BOOKMARKS: 100,
    SYNC_INTERVAL: 30 * 60 * 1000, // 30 دقيقة
    CACHE_EXPIRY: 7 * 24 * 60 * 60 * 1000 // 7 أيام
};

// المتغيرات العامة (سيتم ربطها بـ window)
let appState = {
    isAdmin: false,
    categories: [],
    herbs: [],
    currentView: 'all',
    currentEditHerbId: null,
    pendingDeleteId: null,
    pendingDeleteType: null,
    currentImageBase64: null,
    currentImageFile: null,
    unsubscribeCategories: null,
    unsubscribeHerbs: null,
    reconnectAttempts: 0,
    isSyncActive: true,
    isRefreshing: false,
    actionLog: []
};

// الإعدادات المحفوظة في localStorage
const STORAGE_KEYS = {
    CACHE: 'herbal_cache_v3',
    THEME: 'theme',
    FONT_SIZE: 'fontSize',
    BOOKMARKS: 'herbal_bookmarks',
    COMPARE_LIST: 'herbal_compare_list',
    VISITOR_COUNT: 'visitor_count',
    VISITOR: 'visitor',
    LAST_VISIT: 'last_visit',
    ADMIN_LOG: 'adminActionLog',
    VERSION_HASH: 'herbal_version_hash',
    APP_VERSION: 'herbal_app_version'
};

// دوال مساعدة لتهيئة المتغيرات
function updateHerbCount() {
    const herbCountSpan = document.getElementById('herbCount');
    if (herbCountSpan) {
        herbCountSpan.innerText = window.appState.herbs.length + ' عشبة';
    }
}

function renderContent() {
    if (window.appState.currentView === 'all') {
        if (typeof HerbManager !== 'undefined' && HerbManager.renderAll) {
            HerbManager.renderAll();
        }
    } else {
        if (typeof CategoryManager !== 'undefined' && CategoryManager.renderAll) {
            CategoryManager.renderAll();
        }
    }
}

// تصدير للنطاق العام
window.APP_CONFIG = APP_CONFIG;
window.appState = appState;
window.STORAGE_KEYS = STORAGE_KEYS;
window.updateHerbCount = updateHerbCount;
window.renderContent = renderContent;
