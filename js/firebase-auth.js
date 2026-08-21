// =====================================================
// المصادقة - نسخة تعمل 100%
// =====================================================

const FirebaseAuth = {
    currentUser: null,
    isAdmin: false,
    
    // تسجيل الدخول
    login: async function(email, password) {
        try {
            console.log('🔐 تسجيل الدخول:', email);
            
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            this.currentUser = userCredential.user;
            this.isAdmin = (this.currentUser.uid === ADMIN_UID);
            
            console.log('✅ تم تسجيل الدخول');
            console.log('🆔 UID:', this.currentUser.uid);
            console.log('👑 مسؤول:', this.isAdmin);
            
            if (this.isAdmin) {
                alert('✅ مرحباً أيها المسؤول');
            } else {
                alert('✅ تم تسجيل الدخول');
            }
            
            return { success: true, isAdmin: this.isAdmin };
        } catch (error) {
            console.error('❌ فشل:', error.code);
            alert('❌ فشل تسجيل الدخول: ' + error.message);
            return { success: false };
        }
    },
    
    // تسجيل الخروج
    logout: async function() {
        await auth.signOut();
        this.currentUser = null;
        this.isAdmin = false;
        alert('✅ تم تسجيل الخروج');
        return { success: true };
    },

    // التحقق من جلسة Firebase الحالية (يُستخدم عند تحميل التطبيق)
    getCurrentUser: function() {
        return new Promise(resolve => {
            const unsubscribe = auth.onAuthStateChanged(user => {
                unsubscribe();
                this.currentUser = user || null;
                this.isAdmin = !!(user && user.uid === ADMIN_UID);
                resolve({ user: this.currentUser, isAdmin: this.isAdmin });
            });
        });
    }
};

window.FirebaseAuth = FirebaseAuth;
