// =====================================================
// نظام المسؤول Firebase
// =====================================================

const FirebaseAdmin = {
    // تسجيل الدخول
    login: async function(email, password) {
        return await FirebaseAuth.login(email, password);
    },
    
    // تسجيل الخروج
    logout: async function() {
        const result = await FirebaseAuth.logout();
        if (result.success) this.setAdminMode(false);
    },
    
    // تفعيل وضع المسؤول
    setAdminMode: function(isAdmin) {
        window.appState.isAdmin = isAdmin;
        
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = isAdmin ? 'inline-flex' : 'none';
        });
        
        const lockIcon = document.getElementById('lockIcon');
        if (lockIcon) lockIcon.innerHTML = isAdmin ? '<i class="fas fa-lock-open"></i>' : '<i class="fas fa-lock"></i>';
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.style.display = isAdmin ? 'flex' : 'none';
        
        if (isAdmin) {
            document.body.classList.remove('viewer-mode');
            this.startAdminClock();
        } else {
            document.body.classList.add('viewer-mode');
        }
        
        if (typeof renderContent === 'function') renderContent();
    },
    
    // التحقق من الجلسة
    checkSession: async function() {
        const { isAdmin } = await FirebaseAuth.getCurrentUser();
        this.setAdminMode(isAdmin);
    },
    
    // عرض نافذة تسجيل الدخول
    showLoginModal: function() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.add('active');
            document.getElementById('adminEmail').value = '';
            document.getElementById('adminPassword').value = '';
        }
    },
    
    // معالجة تسجيل الدخول
    handleLogin: async function() {
        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value;
        
        if (!email || !password) {
            Utils.showToast('الرجاء إدخال البريد وكلمة المرور', 'warning');
            return;
        }
        
        const result = await this.login(email, password);
        if (result.success) {
            this.setAdminMode(result.isAdmin);
            document.getElementById('loginModal').classList.remove('active');
            document.getElementById('adminPassword').value = '';
            
            if (!result.isAdmin) {
                Utils.showToast('⚠️ هذا الحساب ليس مسؤولاً', 'warning');
            }
        }
    },
    
    // ساعة المسؤول
    startAdminClock: function() {
        const clockSpan = document.querySelector('#adminClock span');
        if (!clockSpan) return;
        if (this.clockInterval) clearInterval(this.clockInterval);
        this.clockInterval = setInterval(() => {
            clockSpan.innerText = new Date().toLocaleTimeString('ar-EG');
        }, 1000);
    },
    
    // عرض تقرير النظام
    showSystemReport: function() {
        alert(`📋 تقرير النظام:
        
🌿 الأعشاب: ${window.appState.herbs.length}
📂 التصنيفات: ${window.appState.categories.length}
👑 المسؤول: ${window.appState.isAdmin ? 'نشط' : 'غير نشط'}
🌐 الإنترنت: ${navigator.onLine ? 'متصل' : 'غير متصل'}`);
    },
    
    // مسح الكاش
    clearCache: function() {
        if (confirm('⚠️ مسح الكاش وإعادة التحميل؟')) {
            localStorage.clear();
            location.reload();
        }
    },
    
    // نسخ الرابط
    copyAppLink: function() {
        navigator.clipboard.writeText(window.location.href);
        Utils.showToast('✅ تم نسخ الرابط', 'success');
    },
    
    // اختبار الاتصال
    testConnection: function() {
        Utils.showToast(navigator.onLine ? '✅ الإنترنت متصل' : '❌ غير متصل', navigator.onLine ? 'success' : 'error');
    },
    
    // إعادة ضبط المزامنة
    resetSync: function() {
        if (confirm('⚠️ إعادة تحميل البيانات من السحابة؟')) {
            FirebaseSync.fetchAllData(true);
        }
    },
    
    // دوال إضافية
    cleanFirebaseCache: function() { Utils.showToast('✅ تم', 'success'); },
    showActionLog: function() { alert('📋 سجل الإجراءات قيد التطوير'); },
    requestNotifications: async function() {
        if ('Notification' in window) {
            const perm = await Notification.requestPermission();
            Utils.showToast(perm === 'granted' ? '✅ تم تفعيل الإشعارات' : '❌ لم يتم', perm === 'granted' ? 'success' : 'warning');
        }
    }
};

window.FirebaseAdmin = FirebaseAdmin;
