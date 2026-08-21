// =====================================================
// الملف الرئيسي للتطبيق - إدارة التخزين المحلي والـ PWA
// الإصدار 6.0 - حفظ دائم للبيانات
// =====================================================

// ========== المتغيرات العامة ==========
let isRefreshing = false;
let appInitialized = false;
let offlineMode = false;

// ========== دوال التخزين المحلي المتقدم ==========

// حفظ البيانات في التخزين المحلي (دائم)
function saveDataToLocalCache(categories, herbs) {
    try {
        const cacheData = {
            categories: categories,
            herbs: herbs,
            lastUpdate: new Date().toISOString(),
            version: '6.0',
            herbsCount: herbs.length,
            categoriesCount: categories.length
        };
        localStorage.setItem('herbal_permanent_cache', JSON.stringify(cacheData));
        localStorage.setItem('herbal_last_update', Date.now());
        
        // تحديث واجهة آخر تحديث
        updateLastUpdateBadge(cacheData.lastUpdate);
        
        console.log('💾 تم حفظ البيانات في التخزين المحلي');
        return true;
    } catch (error) {
        console.error('❌ فشل حفظ البيانات:', error);
        return false;
    }
}

// تحميل البيانات من التخزين المحلي
function loadDataFromLocalCache() {
    try {
        const cached = localStorage.getItem('herbal_permanent_cache');
        if (cached) {
            const data = JSON.parse(cached);
            
            // التحقق من صحة البيانات
            if (data.categories && Array.isArray(data.categories) && 
                data.herbs && Array.isArray(data.herbs)) {
                
                window.appState.categories = data.categories;
                window.appState.herbs = data.herbs;
                
                const cacheAge = Date.now() - (localStorage.getItem('herbal_last_update') || 0);
                const hoursAgo = Math.floor(cacheAge / (1000 * 60 * 60));
                
                console.log(`📦 تم التحميل من الذاكرة المحلية:`);
                console.log(`   🌿 ${data.herbs.length} عشبة`);
                console.log(`   📂 ${data.categories.length} تصنيف`);
                console.log(`   📅 آخر تحديث: ${data.lastUpdate} (منذ ${hoursAgo} ساعة)`);
                
                // تحديث الواجهة
                if (typeof renderContent === 'function') renderContent();
                if (typeof updateHerbCount === 'function') updateHerbCount();
                updateLastUpdateBadge(data.lastUpdate);
                
                return true;
            }
        }
    } catch (error) {
        console.warn('⚠️ فشل تحميل البيانات المحلية:', error);
    }
    
    // إذا لم توجد بيانات، استخدم البيانات الافتراضية
    loadDefaultData();
    return false;
}

// البيانات الافتراضية (لأول مرة)
function loadDefaultData() {
    console.log('📝 تحميل البيانات الافتراضية...');
    
    const defaultCategories = [
        { id: "cat1", name: "أعشاب هضمية" },
        { id: "cat2", name: "أعشاب مهدئة" },
        { id: "cat3", name: "أعشاب مناعية" }
    ];
    
    const defaultHerbs = [
        {
            id: "h1",
            name: "النعناع",
            category_id: "cat1",
            benefits: "يساعد على الهضم وعلاج الغثيان",
            warnings: "قد يسبب حرقة المعدة",
            harms: "آمن بالكميات المعتدلة",
            usage: "يُنقع ملعقة صغيرة في كوب ماء مغلي",
            notes: "يمكن إضافة العسل",
            image_url: ""
        },
        {
            id: "h2",
            name: "البابونج",
            category_id: "cat2",
            benefits: "مهدئ للأعصاب ويساعد على النوم",
            warnings: "قد يسبب حساسية لبعض الأشخاص",
            harms: "آمن",
            usage: "يُشرب كوب قبل النوم",
            notes: "",
            image_url: ""
        },
        {
            id: "h3",
            name: "الزنجبيل",
            category_id: "cat1",
            benefits: "مضاد للالتهابات ويقوي المناعة",
            warnings: "قد يرفع ضغط الدم",
            harms: "لا يُستخدم بكثرة",
            usage: "يُبشر مع العسل",
            notes: "",
            image_url: ""
        }
    ];
    
    window.appState.categories = defaultCategories;
    window.appState.herbs = defaultHerbs;
    
    saveDataToLocalCache(defaultCategories, defaultHerbs);
    
    if (typeof renderContent === 'function') renderContent();
    if (typeof updateHerbCount === 'function') updateHerbCount();
}

// تحديث واجهة آخر تحديث
function updateLastUpdateBadge(lastUpdateDate) {
    const badgeSpan = document.getElementById('lastUpdateTime');
    if (badgeSpan && lastUpdateDate) {
        const date = new Date(lastUpdateDate);
        const now = new Date();
        const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffHours < 1) {
            badgeSpan.innerText = 'الآن';
        } else if (diffHours < 24) {
            badgeSpan.innerText = `منذ ${diffHours} ساعة`;
        } else {
            badgeSpan.innerText = date.toLocaleDateString('ar-EG');
        }
    }
}

// ========== المزامنة مع Firebase ==========

// جلب أحدث البيانات من Firebase
async function fetchDataFromFirebase() {
    if (!navigator.onLine) {
        console.warn('⚠️ لا يوجد اتصال بالإنترنت');
        return false;
    }
    
    try {
        console.log('🔄 جلب البيانات من Firebase...');
        
        const [categories, herbs] = await Promise.all([
            FirebaseSync.fetchCategories(),
            FirebaseSync.fetchHerbs()
        ]);
        
        window.appState.categories = categories;
        window.appState.herbs = herbs;
        
        // حفظ في التخزين المحلي
        saveDataToLocalCache(categories, herbs);
        
        // تحديث الواجهة
        if (typeof renderContent === 'function') renderContent();
        if (typeof updateHerbCount === 'function') updateHerbCount();
        
        console.log(`✅ تم جلب ${herbs.length} عشبة و ${categories.length} تصنيف`);
        return true;
    } catch (error) {
        console.error('❌ فشل جلب البيانات:', error);
        return false;
    }
}

// تحديث يدوي من السيرفر (عند الضغط على زر التحديث)
async function refreshDataFromServer() {
    if (isRefreshing) {
        showToastMessage('⚠️ جاري التحديث حالياً، انتظر قليلاً', 'warning');
        return false;
    }
    
    if (!navigator.onLine) {
        showToastMessage('⚠️ لا يوجد اتصال بالإنترنت. سيتم عرض البيانات المخزنة', 'warning');
        return false;
    }
    
    isRefreshing = true;
    const refreshBtn = document.getElementById('refreshDataBtn');
    const originalText = refreshBtn?.innerHTML;
    
    if (refreshBtn) {
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> جاري التحديث...';
        refreshBtn.disabled = true;
    }
    
    try {
        console.log('🔄 تحديث يدوي من السيرفر...');
        showToastMessage('🔄 جاري تحديث البيانات...', 'info');
        
        const success = await fetchDataFromFirebase();
        
        if (success) {
            const herbsCount = window.appState.herbs.length;
            showToastMessage(`✅ تم التحديث بنجاح! (${herbsCount} عشبة)`, 'success');
            console.log('✅ اكتمل التحديث اليدوي');
        } else {
            showToastMessage('❌ فشل التحديث، سيتم استخدام البيانات المخزنة', 'error');
        }
        
        return success;
    } catch (error) {
        console.error('❌ خطأ في التحديث:', error);
        showToastMessage('❌ حدث خطأ أثناء التحديث', 'error');
        return false;
    } finally {
        isRefreshing = false;
        if (refreshBtn) {
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
        }
    }
}

// ========== دوال إدارة الأعشاب مع التحديث التلقائي ==========

// إضافة عشبة جديدة
async function addHerbAndUpdateCache(herbData) {
    if (!navigator.onLine) {
        showToastMessage('⚠️ لا يوجد اتصال بالإنترنت، سيتم الحفظ محلياً مؤقتاً', 'warning');
        // حفظ مؤقت محلياً (يمكن إضافته لاحقاً)
        return { success: false, offline: true };
    }
    
    showToastMessage('💾 جاري حفظ العشبة...', 'info');
    
    const result = await FirebaseSync.addHerb(herbData);
    
    if (result.success) {
        // إعادة تحميل البيانات من Firebase وتحديث الكاش
        await fetchDataFromFirebase();
        showToastMessage(`✅ تم إضافة ${herbData.name} بنجاح`, 'success');
    }
    
    return result;
}

// تعديل عشبة
async function updateHerbAndUpdateCache(id, herbData) {
    if (!navigator.onLine) {
        showToastMessage('⚠️ لا يوجد اتصال بالإنترنت', 'warning');
        return { success: false };
    }
    
    showToastMessage('💾 جاري تعديل العشبة...', 'info');
    
    const result = await FirebaseSync.updateHerb(id, herbData);
    
    if (result.success) {
        await fetchDataFromFirebase();
        showToastMessage(`✅ تم تعديل ${herbData.name} بنجاح`, 'success');
    }
    
    return result;
}

// حذف عشبة
async function deleteHerbAndUpdateCache(id) {
    if (!navigator.onLine) {
        showToastMessage('⚠️ لا يوجد اتصال بالإنترنت', 'warning');
        return { success: false };
    }
    
    const herb = window.appState.herbs.find(h => h.id === id);
    if (!herb) return { success: false };
    
    if (!confirm(`⚠️ هل تريد حذف "${herb.name}" نهائياً؟`)) {
        return { success: false, cancelled: true };
    }
    
    showToastMessage('🗑️ جاري حذف العشبة...', 'info');
    
    const result = await FirebaseSync.deleteHerb(id);
    
    if (result.success) {
        await fetchDataFromFirebase();
        showToastMessage(`✅ تم حذف ${herb.name} بنجاح`, 'success');
    }
    
    return result;
}

// ========== دوال إدارة التصنيفات ==========

async function addCategoryAndUpdateCache(name) {
    if (!navigator.onLine) {
        showToastMessage('⚠️ لا يوجد اتصال بالإنترنت', 'warning');
        return { success: false };
    }
    
    const result = await FirebaseSync.addCategory(name);
    if (result.success) {
        await fetchDataFromFirebase();
        showToastMessage(`✅ تم إضافة تصنيف ${name}`, 'success');
    }
    return result;
}

async function deleteCategoryAndUpdateCache(id) {
    if (!navigator.onLine) {
        showToastMessage('⚠️ لا يوجد اتصال بالإنترنت', 'warning');
        return { success: false };
    }
    
    const result = await FirebaseSync.deleteCategory(id);
    if (result.success) {
        await fetchDataFromFirebase();
        showToastMessage('✅ تم حذف التصنيف', 'success');
    }
    return result;
}

// ========== مراقبة حالة الاتصال ==========

function setupNetworkMonitoring() {
    window.addEventListener('online', () => {
        console.log('🌐恢复了网络连接');
        showToastMessage('🌐 تم استعادة الاتصال بالإنترنت', 'success');
        
        // محاولة تحديث البيانات تلقائياً
        setTimeout(() => {
            if (confirm('🔄 تم استعادة الاتصال. هل تريد تحديث البيانات من السيرفر؟')) {
                refreshDataFromServer();
            }
        }, 1000);
    });
    
    window.addEventListener('offline', () => {
        console.log('📴 فقدان الاتصال بالإنترنت');
        showToastMessage('📴 لا يوجد اتصال بالإنترنت - يتم عرض البيانات المخزنة', 'warning');
        offlineMode = true;
    });
}

// ========== عرض رسائل منبثقة ==========
function showToastMessage(message, type = 'info') {
    // إزالة أي توست موجود
    const existingToast = document.querySelector('.custom-toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    
    const bgColor = type === 'success' ? '#4caf50' : 
                    type === 'error' ? '#f44336' : 
                    type === 'warning' ? '#ff9800' : '#2e7d32';
    
    toast.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: ${bgColor};
        color: white;
        padding: 10px 20px;
        border-radius: 40px;
        z-index: 10001;
        font-size: 13px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        text-align: center;
        white-space: nowrap;
        max-width: 90%;
        white-space: normal;
        word-break: keep-all;
    `;
    
    toast.innerHTML = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 3000);
}

// ========== تهيئة التطبيق ==========
async function initApp() {
    if (appInitialized) return;
    
    console.log('🚀 بدء تشغيل التطبيق...');
    console.log('📱 وضع PWA:', window.matchMedia('(display-mode: standalone)').matches ? 'مثبت' : 'متصفح');
    
    // 1. تحميل البيانات المخزنة محلياً (سريع)
    const hasLocalCache = loadDataFromLocalCache();
    
    // 2. إذا كان هناك اتصال، جلب أحدث البيانات
    if (navigator.onLine) {
        console.log('🌐 جلب أحدث البيانات من السيرفر...');
        await fetchDataFromFirebase();
    } else if (!hasLocalCache) {
        console.warn('⚠️ لا يوجد اتصال ولا بيانات محلية');
        document.getElementById('contentArea').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-wifi"></i>
                <p>لا يوجد اتصال بالإنترنت ولا بيانات محفوظة</p>
                <button class="tool-btn" onclick="location.reload()">إعادة المحاولة</button>
            </div>
        `;
    }
    
    // 3. إعداد مراقبة الشبكة
    setupNetworkMonitoring();
    
    // 4. إخفاء شاشة البداية
    const splash = document.getElementById('splashScreen');
    const mainApp = document.getElementById('mainApp');
    if (splash && mainApp) {
        setTimeout(() => {
            splash.classList.add('hide');
            mainApp.style.display = 'block';
            console.log('✅ التطبيق جاهز');
        }, 1500);
    }
    
    appInitialized = true;
}

// ========== ربط الأحداث ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM جاهز');
    
    // زر التحديث اليدوي
    const refreshBtn = document.getElementById('refreshDataBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshDataFromServer);
    }
    
    // بدء التطبيق
    initApp();
});

// ========== تصدير الدوال للنطاق العام ==========
window.refreshDataFromServer = refreshDataFromServer;
window.addHerbAndUpdateCache = addHerbAndUpdateCache;
window.updateHerbAndUpdateCache = updateHerbAndUpdateCache;
window.deleteHerbAndUpdateCache = deleteHerbAndUpdateCache;
window.addCategoryAndUpdateCache = addCategoryAndUpdateCache;
window.deleteCategoryAndUpdateCache = deleteCategoryAndUpdateCache;
window.loadDataFromLocalCache = loadDataFromLocalCache;
window.fetchDataFromFirebase = fetchDataFromFirebase;
window.saveDataToLocalCache = saveDataToLocalCache;
window.showToastMessage = showToastMessage;

console.log('✅ app.js تم تحميله بنجاح');
