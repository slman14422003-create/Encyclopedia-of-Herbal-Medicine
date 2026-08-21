// =====================================================
// الدوال المساعدة العامة
// =====================================================

const Utils = {
    // تنسيق النص HTML
    escapeHtml: function(s) {
        if (!s) return '—';
        return s.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    },
    
    // عرض رسالة منبثقة
    showToast: function(msg, type = 'info') {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        toast.innerHTML = `
            <div style="background:var(--card-bg);color:var(--text);padding:12px 20px;border-radius:50px;position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:10001;box-shadow:0 4px 15px rgba(0,0,0,0.2);display:flex;align-items:center;gap:10px;border:1px solid var(--separator);backdrop-filter:blur(10px);">
                <span>${icons[type] || 'ℹ️'}</span>
                <span>${msg}</span>
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), AppConfig.ui.toastDuration);
    },
    
    // التحقق من الاتصال بالإنترنت
    isOnline: function() {
        return navigator.onLine;
    },
    
    // تأخير
    delay: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // الحصول على معلمات URL
    getUrlParams: function() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },
    
    // نسخ النص إلى الحافظة
    copyToClipboard: async function(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('✅ تم النسخ', 'success');
            return true;
        } catch (err) {
            this.showToast('❌ فشل النسخ', 'error');
            return false;
        }
    },
    
    // مشاركة التطبيق
    shareApp: async function() {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: APP_CONFIG.NAME,
                    text: 'استكشف فوائد وأضرار الأعشاب الطبية',
                    url: window.location.href
                });
            } catch (err) {
                console.log('مشاركة ملغاة', err);
            }
        } else {
            this.copyToClipboard(window.location.href);
        }
    },
    
    // فتح واتساب
    openWhatsApp: function() {
        const phone = "0932934273";
        const cleanPhone = phone.replace(/\D/g, '');
        const internationalPhone = "963" + cleanPhone;
        const url = "https://wa.me/" + internationalPhone + "?text=مرحباً%20أريد%20الاستفسار%20عن%20الأعشاب";
        window.open(url, '_blank');
    },
    
    // ضغط الصورة
    compressImage: async function(file, maxWidth = 800, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function(e) {
                const img = new Image();
                img.src = e.target.result;
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    let width = img.width, height = img.height;
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    const compressInfo = document.getElementById('compressInfo');
                    if (compressInfo) {
                        compressInfo.innerHTML = '✅ تم الضغط: ' + (file.size / 1024).toFixed(2) + ' KB → ' + (compressedDataUrl.length * 0.75 / 1024).toFixed(2) + ' KB';
                    }
                    resolve(compressedDataUrl);
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    },
    
    // التحقق من صحة البريد الإلكتروني
    isValidEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // تنسيق التاريخ
    formatDate: function(timestamp) {
        return new Date(timestamp).toLocaleString('ar-EG');
    },
    
    // الحصول على الوقت الحالي
    getCurrentTime: function() {
        return new Date().toLocaleTimeString('ar-EG');
    },
    
    // بدء ساعة المسؤول
    startAdminClock: function() {
        const clockSpan = document.querySelector('#adminClock span');
        if (!clockSpan) return;
        setInterval(() => {
            clockSpan.innerText = this.getCurrentTime();
        }, 1000);
    }
};

window.Utils = Utils;
