// =====================================================
// ربط الأحداث - نسخة كاملة مع تحسين زر المقارنة
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 بدء ربط الأحداث...');

    // ========== ساعة المسؤول ==========
    function updateClock() {
        const clockSpan = document.querySelector('#adminClock span');
        if (clockSpan) {
            const now = new Date();
            clockSpan.innerText = now.toLocaleTimeString('ar-EG');
        }
    }
    updateClock();
    setInterval(updateClock, 1000);

    // ========== الوضع الليلي والنهاري ==========
    const lightModeBtn = document.getElementById('lightModeBtn');
    const darkModeBtn = document.getElementById('darkModeBtn');
    const modeText = document.getElementById('modeText');

    function setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            if (lightModeBtn) lightModeBtn.classList.remove('active');
            if (darkModeBtn) darkModeBtn.classList.add('active');
            if (modeText) modeText.innerText = 'ليلي';
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            if (darkModeBtn) darkModeBtn.classList.remove('active');
            if (lightModeBtn) lightModeBtn.classList.add('active');
            if (modeText) modeText.innerText = 'نهاري';
        }
    }

    if (lightModeBtn) {
        lightModeBtn.addEventListener('click', () => setTheme('light'));
    }
    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', () => setTheme('dark'));
    }

    const savedTheme = localStorage.getItem('theme');
    setTheme(savedTheme === 'dark' ? 'dark' : 'light');

    // ========== أزرار الهيدر ==========
    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
        helpBtn.addEventListener('click', () => window.location.href = './help.html');
    }

    const lockIcon = document.getElementById('lockIcon');
    if (lockIcon) {
        lockIcon.addEventListener('click', () => {
            const modal = document.getElementById('loginModal');
            if (modal) {
                modal.classList.add('active');
                const emailInput = document.getElementById('adminEmail');
                const passwordInput = document.getElementById('adminPassword');
                if (emailInput) emailInput.value = '';
                if (passwordInput) passwordInput.value = '';
            }
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await FirebaseAdmin.logout();
            showToastMessage('✅ تم تسجيل الخروج', 'success');
        });
    }

    // ========== تسجيل الدخول ==========
    // ملاحظة أمنية: التحقق يتم عبر Firebase Authentication الفعلي
    // (FirebaseAdmin.handleLogin) وليس عبر مقارنة نصية في المتصفح.
    const confirmLoginBtn = document.getElementById('confirmLoginBtn');
    if (confirmLoginBtn) {
        confirmLoginBtn.addEventListener('click', async () => {
            const emailInput = document.getElementById('adminEmail');
            const passwordInput = document.getElementById('adminPassword');
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';

            if (!email || !password) {
                showToastMessage('الرجاء إدخال البريد وكلمة المرور', 'warning');
                return;
            }

            const result = await FirebaseAuth.login(email, password);
            if (result.success) {
                window.appState.isAdmin = result.isAdmin;
                document.querySelectorAll('.admin-only').forEach(el => el.style.display = result.isAdmin ? 'inline-flex' : 'none');
                if (lockIcon) lockIcon.innerHTML = result.isAdmin ? '<i class="fas fa-lock-open"></i>' : '<i class="fas fa-lock"></i>';
                if (logoutBtn) logoutBtn.style.display = result.isAdmin ? 'flex' : 'none';
                if (result.isAdmin) document.body.classList.remove('viewer-mode');
                if (typeof renderContent === 'function') renderContent();
                const loginModal = document.getElementById('loginModal');
                if (loginModal) loginModal.classList.remove('active');
                if (passwordInput) passwordInput.value = '';
                showToastMessage('✅ مرحباً أيها المسؤول', 'success');
            } else {
                showToastMessage('❌ البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
            }
        });
    }

    const cancelLoginBtn = document.getElementById('cancelLoginBtn');
    if (cancelLoginBtn) {
        cancelLoginBtn.addEventListener('click', () => {
            const modal = document.getElementById('loginModal');
            if (modal) modal.classList.remove('active');
        });
    }

    // ========== أزرار شريط الأدوات ==========
    const refreshBtn = document.getElementById('refreshDataBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            if (typeof FirebaseSync !== 'undefined') {
                FirebaseSync.fetchAllData(true);
            } else {
                location.reload();
            }
        });
    }

    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            showAdvancedSearchModal();
        });
    }

    const fontSizeBtn = document.getElementById('fontSizeToggleBtn');
    if (fontSizeBtn) {
        fontSizeBtn.addEventListener('click', () => {
            const levels = ['normal', 'large', 'xlarge'];
            let current = localStorage.getItem('fontSize') || 'normal';
            let idx = levels.indexOf(current);
            let next = levels[(idx + 1) % levels.length];
            document.body.classList.remove('font-large', 'font-xlarge');
            if (next !== 'normal') document.body.classList.add(`font-${next}`);
            localStorage.setItem('fontSize', next);
            const label = document.getElementById('fontSizeLabel');
            const names = { normal: 'عادي', large: 'كبير', xlarge: 'أكبر' };
            if (label) label.innerText = names[next];
            showToastMessage(`✅ تم تغيير حجم الخط إلى ${names[next]}`, 'success');
        });
    }

    const whatsappBtn = document.getElementById('whatsappBtn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            window.open('https://wa.me/9630932934273', '_blank');
        });
    }

    // ========== تبديل العرض ==========
    const viewToggle = document.getElementById('viewToggle');
    if (viewToggle) {
        viewToggle.addEventListener('click', (e) => {
            const btn = e.target.closest('.view-btn');
            if (btn && btn.dataset.view) {
                window.appState.currentView = btn.dataset.view;
                document.querySelectorAll('.view-btn').forEach(b => {
                    b.classList.toggle('active', b.dataset.view === window.appState.currentView);
                });
                if (typeof renderContent === 'function') renderContent();
            }
        });
    }

    // ========== أزرار المسؤول ==========
    const addHerbBtn = document.getElementById('addHerbBtn');
    if (addHerbBtn) {
        addHerbBtn.addEventListener('click', () => {
            if (!window.appState.isAdmin) {
                showToastMessage('⚠️ فقط المسؤول يمكنه إضافة أعشاب', 'warning');
                return;
            }
            if (typeof HerbManager !== 'undefined') {
                HerbManager.showAddModal();
            }
        });
    }

    const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
    if (manageCategoriesBtn) {
        manageCategoriesBtn.addEventListener('click', () => {
            if (typeof CategoryManager !== 'undefined') {
                CategoryManager.showManager();
            }
        });
    }

    const backupBtn = document.getElementById('backupBtn');
    if (backupBtn) {
        backupBtn.addEventListener('click', () => {
            const data = {
                categories: window.appState.categories,
                herbs: window.appState.herbs,
                date: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `herbal_backup_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showToastMessage('✅ تم إنشاء النسخة الاحتياطية', 'success');
        });
    }

    const restoreBtn = document.getElementById('restoreBtn');
    if (restoreBtn) {
        restoreBtn.addEventListener('click', () => {
            const fileInput = document.getElementById('restoreFile');
            if (fileInput) fileInput.click();
        });
    }

    const restoreFile = document.getElementById('restoreFile');
    if (restoreFile) {
        restoreFile.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                if (data.categories && data.herbs) {
                    window.appState.categories = data.categories;
                    window.appState.herbs = data.herbs;
                    if (typeof renderContent === 'function') renderContent();
                    if (typeof updateHerbCount === 'function') updateHerbCount();
                    showToastMessage('✅ تم استعادة البيانات', 'success');
                } else {
                    showToastMessage('❌ ملف غير صالح', 'error');
                }
            } catch (err) {
                showToastMessage('❌ فشل استعادة البيانات', 'error');
            }
            restoreFile.value = '';
        });
    }

    const deleteAllBtn = document.getElementById('deleteAllBtn');
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', () => {
            const modal = document.getElementById('deleteAllConfirmModal');
            if (modal) modal.classList.add('active');
        });
    }

    const confirmDeleteAllBtn = document.getElementById('confirmDeleteAllBtn');
    if (confirmDeleteAllBtn) {
        confirmDeleteAllBtn.addEventListener('click', () => {
            if (typeof HerbManager !== 'undefined') {
                HerbManager.deleteAllData();
            }
            const modal = document.getElementById('deleteAllConfirmModal');
            if (modal) modal.classList.remove('active');
        });
    }

    const cancelDeleteAllBtn = document.getElementById('cancelDeleteAllBtn');
    if (cancelDeleteAllBtn) {
        cancelDeleteAllBtn.addEventListener('click', () => {
            const modal = document.getElementById('deleteAllConfirmModal');
            if (modal) modal.classList.remove('active');
        });
    }

    const resetSyncBtn = document.getElementById('resetSyncBtn');
    if (resetSyncBtn) {
        resetSyncBtn.addEventListener('click', () => {
            if (typeof FirebaseSync !== 'undefined') {
                FirebaseSync.fetchAllData(true);
            } else {
                location.reload();
            }
        });
    }

    const clearCacheBtn = document.getElementById('clearCacheBtn');
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', () => {
            if (confirm('⚠️ مسح الكاش وإعادة التحميل؟')) {
                localStorage.clear();
                location.reload();
            }
        });
    }

    const testConnectionBtn = document.getElementById('testConnectionBtn');
    if (testConnectionBtn) {
        testConnectionBtn.addEventListener('click', () => {
            showToastMessage(navigator.onLine ? '✅ الإنترنت متصل' : '❌ لا يوجد اتصال', navigator.onLine ? 'success' : 'error');
        });
    }

    // ========== أزرار الزوار ==========
    const compareBtn = document.getElementById('compareBtn');
    if (compareBtn) {
        compareBtn.addEventListener('click', () => {
            window.location.href = './compare.html';
        });
    }

    const bookmarksBtn = document.getElementById('bookmarksBtn');
    if (bookmarksBtn) {
        bookmarksBtn.addEventListener('click', () => {
            showBookmarksModal();
        });
    }

    const advancedSearchBtn = document.getElementById('advancedSearchBtn');
    if (advancedSearchBtn) {
        advancedSearchBtn.addEventListener('click', () => {
            showAdvancedSearchModal();
        });
    }

    const visitorStatsBtn = document.getElementById('visitorStatsBtn');
    if (visitorStatsBtn) {
        visitorStatsBtn.addEventListener('click', () => {
            showVisitorStats();
        });
    }

    const shareAppBtn = document.getElementById('shareAppBtn');
    if (shareAppBtn) {
        shareAppBtn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({ title: 'موسوعة الأعشاب الطبية', url: location.href });
            } else {
                navigator.clipboard.writeText(location.href);
                showToastMessage('✅ تم نسخ الرابط', 'success');
            }
        });
    }

    const quickHelpBtn = document.getElementById('quickHelpBtn');
    if (quickHelpBtn) {
        quickHelpBtn.addEventListener('click', () => window.location.href = './help.html');
    }

    const visitorResyncBtn = document.getElementById('visitorResyncBtn');
    if (visitorResyncBtn) {
        visitorResyncBtn.addEventListener('click', () => {
            if (typeof FirebaseSync !== 'undefined') {
                FirebaseSync.fetchAllData(true);
            } else {
                location.reload();
            }
            showToastMessage('🔄 جاري إعادة المزامنة...', 'info');
        });
    }

    const visitorClearTempBtn = document.getElementById('visitorClearTempBtn');
    if (visitorClearTempBtn) {
        visitorClearTempBtn.addEventListener('click', () => {
            if (confirm('⚠️ حذف البيانات المؤقتة وإعادة التحميل؟')) {
                localStorage.clear();
                location.reload();
            }
        });
    }

    const visitorCategoriesBtn = document.getElementById('visitorCategoriesBtn');
    if (visitorCategoriesBtn) {
        visitorCategoriesBtn.addEventListener('click', () => {
            showVisitorCategories();
        });
    }

    // ========== أزرار المودالات ==========
    const closeCategoryModal = document.getElementById('closeCategoryModalBtn');
    if (closeCategoryModal) {
        closeCategoryModal.addEventListener('click', () => {
            const modal = document.getElementById('categoryModal');
            if (modal) modal.classList.remove('active');
        });
    }

    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', () => {
            const nameInput = document.getElementById('newCategoryName');
            const name = nameInput ? nameInput.value.trim() : '';
            if (!name) {
                showToastMessage('أدخل اسم التصنيف', 'warning');
                return;
            }
            if (typeof CategoryManager !== 'undefined') {
                CategoryManager.add();
            }
        });
    }

    const closeHerbModal = document.getElementById('closeHerbModalBtn');
    if (closeHerbModal) {
        closeHerbModal.addEventListener('click', () => {
            const modal = document.getElementById('herbModal');
            if (modal) modal.classList.remove('active');
        });
    }

    const cancelHerbModal = document.getElementById('cancelHerbModalBtn');
    if (cancelHerbModal) {
        cancelHerbModal.addEventListener('click', () => {
            const modal = document.getElementById('herbModal');
            if (modal) modal.classList.remove('active');
        });
    }

    const saveHerbBtn = document.getElementById('saveHerbModalBtn');
    if (saveHerbBtn) {
        saveHerbBtn.addEventListener('click', () => {
            if (typeof HerbManager !== 'undefined') {
                HerbManager.save();
            }
        });
    }

    const closeDetailModal = document.getElementById('closeDetailModalBtn');
    if (closeDetailModal) {
        closeDetailModal.addEventListener('click', () => {
            const modal = document.getElementById('detailModal');
            if (modal) modal.classList.remove('active');
        });
    }

    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', () => {
            const modal = document.getElementById('deleteModal');
            if (modal) modal.classList.remove('active');
            window.appState.pendingDeleteId = null;
            window.appState.pendingDeleteType = null;
        });
    }

    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            if (window.appState.pendingDeleteType === 'herb' && window.appState.pendingDeleteId) {
                if (typeof HerbManager !== 'undefined') {
                    HerbManager.delete(window.appState.pendingDeleteId);
                }
            } else if (window.appState.pendingDeleteType === 'category' && window.appState.pendingDeleteId) {
                if (typeof CategoryManager !== 'undefined') {
                    CategoryManager.delete(window.appState.pendingDeleteId);
                }
            }
            const modal = document.getElementById('deleteModal');
            if (modal) modal.classList.remove('active');
            window.appState.pendingDeleteId = null;
            window.appState.pendingDeleteType = null;
        });
    }

    const uploadImageBtn = document.getElementById('uploadImageBtn');
    if (uploadImageBtn) {
        uploadImageBtn.addEventListener('click', () => {
            const fileInput = document.getElementById('herbImageInput');
            if (fileInput) fileInput.click();
        });
    }

    const clearImageBtn = document.getElementById('clearImageBtn');
    if (clearImageBtn) {
        clearImageBtn.addEventListener('click', () => {
            if (typeof HerbManager !== 'undefined') {
                HerbManager.clearImage();
            }
        });
    }

    const herbImageInput = document.getElementById('herbImageInput');
    if (herbImageInput) {
        herbImageInput.addEventListener('change', (e) => {
            if (typeof HerbManager !== 'undefined') {
                HerbManager.handleImageUpload(e);
            }
        });
    }

    // ========== شريط البحث العريض ==========
    const wideSearchInput = document.getElementById('wideSearchInput');
    const wideSearchResults = document.getElementById('wideSearchResults');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    if (wideSearchInput) {
        wideSearchInput.addEventListener('input', function() {
            const query = this.value.trim().toLowerCase();
            if (clearSearchBtn) clearSearchBtn.style.display = query ? 'flex' : 'none';
            if (!query) {
                if (wideSearchResults) {
                    wideSearchResults.classList.remove('show');
                    wideSearchResults.innerHTML = '';
                }
                return;
            }
            const herbs = window.appState.herbs || [];
            const results = herbs.filter(h => 
                h.name.toLowerCase().includes(query) ||
                (h.benefits || '').toLowerCase().includes(query) ||
                (h.warnings || '').toLowerCase().includes(query)
            ).slice(0, 10);
            if (!wideSearchResults) return;
            if (results.length === 0) {
                wideSearchResults.innerHTML = '<div class="wide-search-item" style="justify-content:center;">لا توجد نتائج</div>';
                wideSearchResults.classList.add('show');
                return;
            }
            let html = '';
            for (const h of results) {
                let catName = "بدون تصنيف";
                const cat = (window.appState.categories || []).find(c => c.id === h.category_id);
                if (cat) catName = cat.name;
                html += `
                    <div class="wide-search-item" onclick="showFullHerbDetail('${h.id}')">
                        <div class="wide-search-item-icon"><i class="fas fa-leaf"></i></div>
                        <div class="wide-search-item-info">
                            <div class="wide-search-item-title">🌿 ${escapeHtmlStatic(h.name)}</div>
                            <div class="wide-search-item-desc">${escapeHtmlStatic(catName)}</div>
                        </div>
                        <i class="fas fa-chevron-left"></i>
                    </div>
                `;
            }
            wideSearchResults.innerHTML = html;
            wideSearchResults.classList.add('show');
        });

        document.addEventListener('click', function(e) {
            if (wideSearchResults && wideSearchInput && 
                !wideSearchInput.contains(e.target) && 
                !wideSearchResults.contains(e.target)) {
                wideSearchResults.classList.remove('show');
            }
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function() {
            if (wideSearchInput) {
                wideSearchInput.value = '';
                wideSearchInput.focus();
                if (wideSearchResults) {
                    wideSearchResults.classList.remove('show');
                    wideSearchResults.innerHTML = '';
                }
                clearSearchBtn.style.display = 'none';
            }
        });
    }

    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const closeSearchModal = document.getElementById('closeSearchModalBtn');

    if (closeSearchModal) {
        closeSearchModal.addEventListener('click', () => {
            const modal = document.getElementById('searchModal');
            if (modal) modal.classList.remove('active');
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const q = this.value.trim().toLowerCase();
            if (!q) {
                if (searchResults) searchResults.innerHTML = '<div class="empty-state">اكتب اسم العشبة للبحث</div>';
                return;
            }
            const herbs = window.appState.herbs || [];
            const results = herbs.filter(h => h.name.toLowerCase().includes(q));
            if (results.length) {
                let html = '';
                for (const h of results) {
                    html += `<div class="search-item" onclick="showFullHerbDetail('${h.id}')"><b>🌿 ${escapeHtmlStatic(h.name)}</b><br><small>${escapeHtmlStatic((h.benefits || '').substring(0, 70))}</small></div>`;
                }
                if (searchResults) searchResults.innerHTML = html;
            } else {
                if (searchResults) searchResults.innerHTML = '<div class="empty-state">لا توجد نتائج</div>';
            }
        });
    }

    // ========== إغلاق المودالات ==========
    document.querySelectorAll('.modal-glass').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // ========== تهيئة وضع المسؤول ==========
    // يتم التحقق من صلاحية المسؤول عبر جلسة Firebase الفعلية فقط
    // (وليس عبر علم قابل للتعديل في localStorage)
    document.body.classList.add('viewer-mode');
    window.appState.isAdmin = false;
    if (typeof FirebaseAuth !== 'undefined') {
        FirebaseAuth.getCurrentUser().then(({ isAdmin }) => {
            window.appState.isAdmin = isAdmin;
            document.querySelectorAll('.admin-only').forEach(el => el.style.display = isAdmin ? 'inline-flex' : 'none');
            if (lockIcon) lockIcon.innerHTML = isAdmin ? '<i class="fas fa-lock-open"></i>' : '<i class="fas fa-lock"></i>';
            if (logoutBtn) logoutBtn.style.display = isAdmin ? 'flex' : 'none';
            if (isAdmin) {
                document.body.classList.remove('viewer-mode');
                if (typeof renderContent === 'function') renderContent();
            }
        });
    }

    console.log('✅ تم ربط جميع الأحداث بنجاح');
});

// ========== دوال مساعدة ==========

function escapeHtmlStatic(s) {
    if (!s) return '—';
    return s.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

function showToastMessage(message, type = 'info') {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2e7d32';
    toast.style.cssText = `
        position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
        background: ${bgColor}; color: white; padding: 10px 20px;
        border-radius: 40px; z-index: 10001; font-size: 13px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2); text-align: center;
    `;
    toast.innerHTML = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ========== عرض تفاصيل العشبة الكاملة ==========
function showFullHerbDetail(id) {
    const herb = window.appState.herbs.find(h => h.id === id);
    if (!herb) {
        showToastMessage('❌ العشبة غير موجودة', 'error');
        return;
    }

    // إغلاق أي مودال مفتوح
    document.querySelectorAll('.modal-glass.active').forEach(m => m.classList.remove('active'));

    let catName = "بدون تصنيف";
    const category = window.appState.categories.find(c => c.id === herb.category_id);
    if (category) catName = category.name;

    let html = `
        <div class="info-block">
            <div class="info-label">📂 التصنيف</div>
            <div class="info-text">${escapeHtmlStatic(catName)}</div>
        </div>
        <div class="info-block">
            <div class="info-label">🌿 الاسم</div>
            <div class="info-text">${escapeHtmlStatic(herb.name)}</div>
        </div>
        <div class="info-block">
            <div class="info-label">💚 الفوائد الصحية</div>
            <div class="info-text">${escapeHtmlStatic(herb.benefits || '—')}</div>
        </div>
        <div class="info-block">
            <div class="info-label">⚠️ التحذيرات الهامة</div>
            <div class="info-text">${escapeHtmlStatic(herb.warnings || '—')}</div>
        </div>
        <div class="info-block">
            <div class="info-label">⚡ الأضرار المحتملة</div>
            <div class="info-text">${escapeHtmlStatic(herb.harms || '—')}</div>
        </div>
        <div class="info-block">
            <div class="info-label">🍵 طريقة الاستخدام والجرعات</div>
            <div class="info-text">${escapeHtmlStatic(herb.usage || '—')}</div>
        </div>
        <div class="info-block">
            <div class="info-label">📝 ملاحظات إضافية</div>
            <div class="info-text">${escapeHtmlStatic(herb.notes || '—')}</div>
        </div>
        ${herb.image_url ? `<div class="info-block"><div class="info-label">🖼️ صورة العشبة</div><img src="${escapeHtmlStatic(herb.image_url)}" style="max-width:100%;border-radius:16px;margin-top:8px;"></div>` : ''}
    `;

    // إضافة الأزرار في الأسفل (عريضة ومنسقة)
    html += `
        <div style="display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap; justify-content: center;">
            <button class="tool-btn" onclick="addToCompareAndClose('${herb.id}')" style="flex: 1; min-width: 100px;">
                <i class="fas fa-balance-scale"></i> مقارنة
            </button>
            <button class="tool-btn" onclick="toggleBookmark('${herb.id}', '${escapeHtmlStatic(herb.name)}')" style="flex: 1; min-width: 100px;">
                <i class="fas fa-bookmark"></i> ${isHerbBookmarked(herb.id) ? 'إزالة من الإشارات' : 'إضافة للإشارات'}
            </button>
            <button class="tool-btn" onclick="showAdvancedSearchModal()" style="flex: 1; min-width: 100px;">
                <i class="fas fa-search-plus"></i> بحث متقدم
            </button>
            <button class="tool-btn" onclick="printHerbDetail('${herb.id}')" style="flex: 1; min-width: 100px;">
                <i class="fas fa-print"></i> طباعة
            </button>
        </div>
    `;

    // إنشاء المودال مع زر الإغلاق في الأعلى
    const modal = document.createElement('div');
    modal.className = 'modal-glass active';
    modal.id = 'herbDetailModal';
    modal.innerHTML = `
        <div class="modal-glass-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3><i class="fas fa-leaf"></i> تفاصيل العشبة</h3>
                <div class="close-modal-btn" onclick="this.closest('.modal-glass').classList.remove('active')">
                    <i class="fas fa-times"></i>
                </div>
            </div>
            ${html}
        </div>
    `;
    document.body.appendChild(modal);
}

// دالة إضافة للمقارنة وإغلاق نافذة التفاصيل
function addToCompareAndClose(herbId) {
    const herb = window.appState.herbs.find(h => h.id === herbId);
    if (!herb) return;
    
    let compareList = JSON.parse(localStorage.getItem('herbal_compare_list') || '[]');
    
    if (compareList.some(h => h.id === herbId)) {
        showToastMessage('⚠️ هذه العشبة موجودة بالفعل في المقارنة', 'warning');
        return;
    }
    
    if (compareList.length >= 4) {
        showToastMessage('⚠️ يمكن مقارنة 4 أعشاب كحد أقصى', 'warning');
        return;
    }
    
    compareList.push(herb);
    localStorage.setItem('herbal_compare_list', JSON.stringify(compareList));
    showToastMessage(`✅ تم إضافة ${herb.name} إلى المقارنة`, 'success');
    
    // إغلاق نافذة تفاصيل العشبة
    const detailModal = document.getElementById('herbDetailModal');
    if (detailModal) {
        detailModal.classList.remove('active');
    }
    // إغلاق أي مودال تفاصيل آخر
    document.querySelectorAll('#herbDetailModal').forEach(m => m.classList.remove('active'));
}

// دالة إضافة للمقارنة بدون إغلاق (للاستخدامات الأخرى)
function addToCompare(herbId) {
    const herb = window.appState.herbs.find(h => h.id === herbId);
    if (!herb) return;
    
    let compareList = JSON.parse(localStorage.getItem('herbal_compare_list') || '[]');
    
    if (compareList.some(h => h.id === herbId)) {
        showToastMessage('⚠️ هذه العشبة موجودة بالفعل في المقارنة', 'warning');
        return;
    }
    
    if (compareList.length >= 4) {
        showToastMessage('⚠️ يمكن مقارنة 4 أعشاب كحد أقصى', 'warning');
        return;
    }
    
    compareList.push(herb);
    localStorage.setItem('herbal_compare_list', JSON.stringify(compareList));
    showToastMessage(`✅ تم إضافة ${herb.name} إلى المقارنة`, 'success');
}

function isHerbBookmarked(herbId) {
    const bookmarks = JSON.parse(localStorage.getItem('herbal_bookmarks') || '[]');
    return bookmarks.includes(herbId);
}

function toggleBookmark(herbId, herbName) {
    let bookmarks = JSON.parse(localStorage.getItem('herbal_bookmarks') || '[]');
    const index = bookmarks.indexOf(herbId);
    
    if (index === -1) {
        bookmarks.push(herbId);
        localStorage.setItem('herbal_bookmarks', JSON.stringify(bookmarks));
        showToastMessage(`✅ تمت إضافة ${herbName} إلى الإشارات`, 'success');
    } else {
        bookmarks.splice(index, 1);
        localStorage.setItem('herbal_bookmarks', JSON.stringify(bookmarks));
        showToastMessage(`🗑️ تمت إزالة ${herbName} من الإشارات`, 'info');
    }
}

function printHerbDetail(id) {
    const herb = window.appState.herbs.find(h => h.id === id);
    if (!herb) return;
    
    let catName = "بدون تصنيف";
    const category = window.appState.categories.find(c => c.id === herb.category_id);
    if (category) catName = category.name;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>${herb.name} - موسوعة الأعشاب</title>
            <style>
                body { font-family: 'Cairo', sans-serif; padding: 30px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
                h1 { color: #2e7d32; border-bottom: 2px solid #2e7d32; padding-bottom: 10px; }
                .info { margin: 15px 0; padding: 10px; background: #f5f5f5; border-radius: 10px; border-right: 4px solid #2e7d32; }
                .label { font-weight: bold; color: #1b5e20; margin-bottom: 5px; }
                img { max-width: 100%; border-radius: 10px; margin: 10px 0; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
                @media print { button { display: none; } }
            </style>
        </head>
        <body>
            <h1>🌿 ${herb.name}</h1>
            <div class="info"><div class="label">📂 التصنيف:</div> ${catName}</div>
            <div class="info"><div class="label">💚 الفوائد الصحية:</div> ${herb.benefits || '—'}</div>
            <div class="info"><div class="label">⚠️ التحذيرات:</div> ${herb.warnings || '—'}</div>
            <div class="info"><div class="label">⚡ الأضرار:</div> ${herb.harms || '—'}</div>
            <div class="info"><div class="label">🍵 طريقة الاستخدام:</div> ${herb.usage || '—'}</div>
            <div class="info"><div class="label">📝 ملاحظات:</div> ${herb.notes || '—'}</div>
            ${herb.image_url ? `<img src="${herb.image_url}" alt="${herb.name}">` : ''}
            <div class="footer">موسوعة الأعشاب الطبية - تم الطباعة بتاريخ ${new Date().toLocaleDateString('ar-EG')}</div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// ========== دوال المودالات الأخرى ==========
function showBookmarksModal() {
    const bookmarks = JSON.parse(localStorage.getItem('herbal_bookmarks') || '[]');
    if (bookmarks.length === 0) {
        showToastMessage('📭 لا توجد إشارات مرجعية', 'info');
        return;
    }
    const bookmarkedHerbs = (window.appState.herbs || []).filter(h => bookmarks.includes(h.id));
    if (bookmarkedHerbs.length === 0) {
        showToastMessage('📭 لا توجد أعشاب في الإشارات', 'info');
        return;
    }
    let html = '<div style="max-height:400px;overflow-y:auto;">';
    for (const h of bookmarkedHerbs) {
        html += `<div class="category-item" style="cursor:pointer;" onclick="showFullHerbDetail('${h.id}'); this.closest('.modal-glass').classList.remove('active')">
                    <div class="category-name-display"><i class="fas fa-bookmark" style="color:#ff9800;"></i><span>🌿 ${escapeHtmlStatic(h.name)}</span></div>
                    <i class="fas fa-chevron-left"></i>
                </div>`;
    }
    html += '</div><div class="modal-actions"><button class="btn-secondary" onclick="clearBookmarks()">مسح الكل</button><button class="btn-primary" onclick="this.closest(\'.modal-glass\').classList.remove(\'active\')">إغلاق</button></div>';
    
    const modal = document.createElement('div');
    modal.className = 'modal-glass active';
    modal.innerHTML = `<div class="modal-glass-content"><div class="modal-header"><h3>🔖 الإشارات المرجعية</h3><div class="close-modal-btn" onclick="this.closest('.modal-glass').classList.remove('active')">✕</div></div>${html}</div>`;
    document.body.appendChild(modal);
}

function showAdvancedSearchModal() {
    let categoriesOptions = '<option value="all">جميع التصنيفات</option>';
    (window.appState.categories || []).forEach(cat => {
        categoriesOptions += `<option value="${cat.id}">${escapeHtmlStatic(cat.name)}</option>`;
    });
    
    const modal = document.createElement('div');
    modal.className = 'modal-glass active';
    modal.innerHTML = `
        <div class="modal-glass-content" style="max-width:500px;">
            <div class="modal-header"><h3>🔍 بحث متقدم</h3><div class="close-modal-btn" onclick="this.closest('.modal-glass').classList.remove('active')">✕</div></div>
            <div class="filter-group"><label>🔎 كلمة البحث</label><input type="text" id="advSearchQuery" class="search-input" placeholder="أدخل كلمة البحث..."></div>
            <div class="filter-group"><label>📂 التصنيف</label><select id="advSearchCategory">${categoriesOptions}</select></div>
            <div class="filter-group"><label>📍 البحث في</label><select id="advSearchField"><option value="name">الاسم فقط</option><option value="all">جميع الحقول</option></select></div>
            <div class="modal-actions"><button class="btn-primary" onclick="performAdvancedSearch()">بحث</button><button class="btn-secondary" onclick="this.closest('.modal-glass').classList.remove('active')">إلغاء</button></div>
            <div id="advSearchResults" style="margin-top:16px;"></div>
        </div>
    `;
    document.body.appendChild(modal);
    const queryInput = document.getElementById('advSearchQuery');
    if (queryInput) queryInput.focus();
}

function performAdvancedSearch() {
    const queryInput = document.getElementById('advSearchQuery');
    const categorySelect = document.getElementById('advSearchCategory');
    const fieldSelect = document.getElementById('advSearchField');
    const resultsDiv = document.getElementById('advSearchResults');
    
    const query = queryInput ? queryInput.value.trim().toLowerCase() : '';
    const categoryId = categorySelect ? categorySelect.value : 'all';
    const searchField = fieldSelect ? fieldSelect.value : 'name';
    
    if (!query) {
        if (resultsDiv) resultsDiv.innerHTML = '<div class="empty-state">الرجاء إدخال كلمة البحث</div>';
        return;
    }
    
    let results = (window.appState.herbs || []).filter(h => categoryId !== 'all' ? h.category_id === categoryId : true);
    results = results.filter(h => {
        if (searchField === 'name') return h.name.toLowerCase().includes(query);
        return h.name.toLowerCase().includes(query) || (h.benefits || '').toLowerCase().includes(query);
    });
    
    if (resultsDiv) {
        if (results.length) {
            resultsDiv.innerHTML = `<h4 style="margin-bottom:10px;color:var(--primary);">📋 نتائج البحث (${results.length})</h4>${results.map(h => `<div class="search-item" onclick="showFullHerbDetail('${h.id}')"><b>🌿 ${escapeHtmlStatic(h.name)}</b><div style="font-size:12px;color:var(--text-secondary);">${escapeHtmlStatic((h.benefits || '').substring(0, 80))}</div></div>`).join('')}`;
        } else {
            resultsDiv.innerHTML = '<div class="empty-state">❌ لا توجد نتائج</div>';
        }
    }
}

function showVisitorStats() {
    const herbCount = window.appState.herbs?.length || 0;
    const catCount = window.appState.categories?.length || 0;
    const bookmarkCount = JSON.parse(localStorage.getItem('herbal_bookmarks') || '[]').length;
    let visits = parseInt(localStorage.getItem('visitor_count') || '1');
    localStorage.setItem('visitor_count', visits + 1);
    alert(`📊 إحصائيات سريعة:\n👥 عدد زياراتك: ${visits}\n🌿 عدد الأعشاب: ${herbCount}\n📂 عدد التصنيفات: ${catCount}\n🔖 الإشارات: ${bookmarkCount}`);
}

function showVisitorCategories() {
    if (!window.appState.categories?.length) {
        showToastMessage('لا توجد تصنيفات', 'warning');
        return;
    }
    let msg = '📂 التصنيفات:\n';
    for (const c of window.appState.categories) {
        const count = window.appState.herbs.filter(h => h.category_id === c.id).length;
        msg += `\n📁 ${c.name} (${count} عشبة)`;
    }
    alert(msg);
}

function clearBookmarks() {
    if (confirm('⚠️ مسح جميع الإشارات؟')) {
        localStorage.removeItem('herbal_bookmarks');
        showToastMessage('✅ تم مسح الإشارات', 'success');
        document.querySelectorAll('.modal-glass.active').forEach(m => m.classList.remove('active'));
    }
}

// تصدير الدوال للنطاق العام
window.showFullHerbDetail = showFullHerbDetail;
window.addToCompare = addToCompare;
window.addToCompareAndClose = addToCompareAndClose;
window.toggleBookmark = toggleBookmark;
window.printHerbDetail = printHerbDetail;
window.showBookmarksModal = showBookmarksModal;
window.showAdvancedSearchModal = showAdvancedSearchModal;
window.performAdvancedSearch = performAdvancedSearch;
window.showVisitorStats = showVisitorStats;
window.showVisitorCategories = showVisitorCategories;
window.clearBookmarks = clearBookmarks;
window.showToastMessage = showToastMessage;
