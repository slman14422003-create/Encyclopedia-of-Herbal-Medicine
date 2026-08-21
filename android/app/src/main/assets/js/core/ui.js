// =====================================================
// نظام واجهة المستخدم المتقدم - UI System
// =====================================================

const UISystem = {
    // مستويات الخط
    fontLevels: {
        normal: { 
            class: '', 
            label: 'عادي', 
            scale: 1,
            rootSize: '16px',
            cardSize: '14px',
            titleSize: '18px'
        },
        large: { 
            class: 'font-large', 
            label: 'كبير', 
            scale: 1.25,
            rootSize: '20px',
            cardSize: '17px',
            titleSize: '22px'
        },
        xlarge: { 
            class: 'font-xlarge', 
            label: 'أكبر', 
            scale: 1.5,
            rootSize: '24px',
            cardSize: '20px',
            titleSize: '26px'
        }
    },
    
    currentLevel: 'normal',
    
    // تهيئة حجم الخط
    initFontSize: function() {
        const saved = localStorage.getItem('fontSize');
        if (saved && this.fontLevels[saved]) {
            this.currentLevel = saved;
            this.applyFontSize(saved);
        } else {
            this.currentLevel = 'normal';
            this.applyFontSize('normal');
        }
        this.updateButtonLabel();
        console.log('✅ تم تهيئة حجم الخط:', this.fontLevels[this.currentLevel].label);
    },
    
    // تطبيق حجم الخط على كل العناصر
    applyFontSize: function(level) {
        const settings = this.fontLevels[level];
        if (!settings) return;
        
        // تغيير حجم الخط الأساسي للصفحة
        document.documentElement.style.fontSize = settings.rootSize;
        
        // إضافة/إزالة الكلاسات
        document.body.classList.remove('font-large', 'font-xlarge');
        if (level !== 'normal') {
            document.body.classList.add(settings.class);
        }
        
        // تطبيق على جميع الحاويات
        this.applyToAllElements(settings);
        
        // حفظ الإعداد
        localStorage.setItem('fontSize', level);
        this.currentLevel = level;
        
        console.log(`✅ تم تغيير حجم الخط إلى: ${settings.label} (${settings.scale}x)`);
    },
    
    // تطبيق على جميع العناصر
    applyToAllElements: function(settings) {
        // تحديث البطاقات
        const cards = document.querySelectorAll('.herb-card, .category-card, .herb-card *, .category-card *');
        cards.forEach(card => {
            if (card.style) card.style.fontSize = 'inherit';
        });
        
        // تحديث المودالات
        const modals = document.querySelectorAll('.modal-glass-content, .modal-glass-content *');
        modals.forEach(modal => {
            if (modal.style) modal.style.fontSize = 'inherit';
        });
        
        // تحديث شريط الأدوات
        const toolbars = document.querySelectorAll('.toolbar, .toolbar *, .visitor-toolbar, .visitor-toolbar *');
        toolbars.forEach(el => {
            if (el.style) el.style.fontSize = 'inherit';
        });
        
        // تحديث نموذج الإضافة
        const forms = document.querySelectorAll('.form-group, .form-group *, .modal-actions, .modal-actions *');
        forms.forEach(el => {
            if (el.style) el.style.fontSize = 'inherit';
        });
        
        // إعادة عرض المحتوى
        if (typeof renderContent === 'function') {
            setTimeout(() => renderContent(), 50);
        }
    },
    
    // تحديث زر حجم الخط
    updateButtonLabel: function() {
        const fontSizeLabel = document.getElementById('fontSizeLabel');
        if (fontSizeLabel) {
            fontSizeLabel.innerText = this.fontLevels[this.currentLevel].label;
        }
    },
    
    // تبديل حجم الخط
    cycleFontSize: function() {
        const levels = ['normal', 'large', 'xlarge'];
        const currentIndex = levels.indexOf(this.currentLevel);
        const nextIndex = (currentIndex + 1) % levels.length;
        const nextLevel = levels[nextIndex];
        
        this.applyFontSize(nextLevel);
        this.updateButtonLabel();
        this.showToast(`✅ تم تغيير حجم الخط إلى: ${this.fontLevels[nextLevel].label}`, 'success');
    },
    
    // تعيين حجم خط معين
    setFontSize: function(level) {
        if (this.fontLevels[level]) {
            this.applyFontSize(level);
            this.updateButtonLabel();
        }
    },
    
    // تهيئة المظهر
    initTheme: function() {
        const savedTheme = localStorage.getItem('theme');
        const modeTextSpan = document.getElementById('modeText');
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            if (modeTextSpan) modeTextSpan.innerText = 'ليلي';
        } else {
            document.body.classList.remove('dark-mode');
            if (modeTextSpan) modeTextSpan.innerText = 'نهاري';
        }
        console.log('✅ تم تهيئة المظهر:', savedTheme === 'dark' ? 'ليلي' : 'نهاري');
    },
    
    // تبديل المظهر
    toggleTheme: function() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        const modeTextSpan = document.getElementById('modeText');
        if (modeTextSpan) {
            modeTextSpan.innerText = isDark ? 'ليلي' : 'نهاري';
        }
        
        this.showToast(isDark ? '🌙 الوضع الليلي مفعل' : '☀️ الوضع النهاري مفعل', 'success');
    },
    
    // تبديل العرض
    setCurrentView: function(view) {
        window.appState.currentView = view;
        if (typeof renderContent === 'function') {
            renderContent();
        }
        
        const btns = document.querySelectorAll('.view-btn');
        btns.forEach(btn => {
            if (btn.dataset.view === view) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },
    
    // عرض رسالة
    showToast: function(message, type) {
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2e7d32';
        toast.style.cssText = `
            position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
            background: ${bgColor}; color: white; padding: 12px 24px;
            border-radius: 50px; z-index: 10001; font-size: 14px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2); text-align: center;
            min-width: 200px; max-width: 90%;
        `;
        toast.innerHTML = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

window.UISystem = UISystem;
