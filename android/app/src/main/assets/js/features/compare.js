// =====================================================
// نظام المقارنة المتقدم بين الأعشاب
// =====================================================

const CompareSystem = {
    list: [],
    maxItems: 4,
    
    // تحميل قائمة المقارنة
    load: function() {
        const saved = localStorage.getItem('herbal_compare_list');
        if (saved) {
            this.list = JSON.parse(saved);
        }
        return this.list;
    },
    
    // حفظ قائمة المقارنة
    save: function() {
        localStorage.setItem('herbal_compare_list', JSON.stringify(this.list));
    },
    
    // إضافة عشبة للمقارنة
    add: function(herb) {
        if (!herb) return false;
        
        if (this.list.some(h => h.id === herb.id)) {
            this.showToast('⚠️ هذه العشبة موجودة بالفعل في المقارنة', 'warning');
            return false;
        }
        
        if (this.list.length >= this.maxItems) {
            this.showToast(`⚠️ يمكن مقارنة ${this.maxItems} أعشاب كحد أقصى`, 'warning');
            return false;
        }
        
        this.list.push(herb);
        this.save();
        this.showToast(`✅ تم إضافة ${herb.name} إلى المقارنة`, 'success');
        return true;
    },
    
    // إزالة عشبة من المقارنة
    remove: function(herbId) {
        const herb = this.list.find(h => h.id === herbId);
        this.list = this.list.filter(h => h.id !== herbId);
        this.save();
        if (herb) {
            this.showToast(`🗑️ تم إزالة ${herb.name} من المقارنة`, 'info');
        }
        return herb;
    },
    
    // مسح القائمة بالكامل
    clear: function() {
        this.list = [];
        this.save();
        this.showToast('✅ تم مسح قائمة المقارنة', 'success');
        this.closeModal();
    },
    
    // إغلاق المودال
    closeModal: function() {
        document.querySelectorAll('.modal-glass.active').forEach(m => m.classList.remove('active'));
    },
    
    // عرض نافذة المقارنة
    show: function() {
        this.load();
        
        if (this.list.length < 2) {
            this.showToast('⚠️ أضف عشبتين على الأقل للمقارنة (اضغط على زر المقارنة في صفحة تفاصيل العشبة)', 'warning');
            return;
        }
        
        // بناء جدول المقارنة
        let html = `
            <div class="compare-container">
                <div class="compare-stats">
                    <span>📊 مقارنة ${this.list.length} أعشاب</span>
                    <button class="compare-clear-btn" onclick="CompareSystem.clear()">
                        <i class="fas fa-trash-alt"></i> مسح الكل
                    </button>
                </div>
                <div class="compare-table-wrapper">
                    <table class="compare-table">
                        <thead>
                            <tr>
                                <th>الميزة</th>
                                ${this.list.map(h => `<th>
                                    <div class="compare-herb-header">
                                        <i class="fas fa-leaf"></i>
                                        ${this.escapeHtml(h.name)}
                                        <button class="compare-remove-btn" onclick="CompareSystem.remove('${h.id}'); CompareSystem.show();">
                                            <i class="fas fa-times-circle"></i>
                                        </button>
                                    </div>
                                </th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        const fields = [
            { label: '💚 الفوائد الصحية', key: 'benefits', icon: 'fas fa-heartbeat' },
            { label: '⚠️ التحذيرات الهامة', key: 'warnings', icon: 'fas fa-exclamation-triangle' },
            { label: '⚡ الأضرار المحتملة', key: 'harms', icon: 'fas fa-skull-crosswalk' },
            { label: '🍵 طريقة الاستخدام', key: 'usage', icon: 'fas fa-mug-hot' },
            { label: '📝 ملاحظات إضافية', key: 'notes', icon: 'fas fa-sticky-note' }
        ];
        
        for (const field of fields) {
            html += `
                <tr>
                    <td class="compare-label">
                        <i class="${field.icon}"></i> ${field.label}
                    </td>
                    ${this.list.map(h => `
                        <td class="compare-value">
                            ${this.escapeHtml(h[field.key] || '—')}
                        </td>
                    `).join('')}
                </tr>
            `;
        }
        
        // إضافة صف الصور إذا وجدت
        if (this.list.some(h => h.image_url)) {
            html += `
                <tr>
                    <td class="compare-label"><i class="fas fa-image"></i> صورة العشبة</td>
                    ${this.list.map(h => `
                        <td class="compare-value">
                            ${h.image_url ? `<img src="${this.escapeHtml(h.image_url)}" class="compare-image" onclick="window.open('${this.escapeHtml(h.image_url)}', '_blank')">` : '—'}
                        </td>
                    `).join('')}
                </tr>
            `;
        }
        
        html += `
                        </tbody>
                    </table>
                </div>
                <div class="compare-actions">
                    <button class="btn-secondary" onclick="CompareSystem.closeModal()">
                        <i class="fas fa-times"></i> إغلاق
                    </button>
                    <button class="btn-primary" onclick="CompareSystem.print()">
                        <i class="fas fa-print"></i> طباعة المقارنة
                    </button>
                </div>
            </div>
        `;
        
        const modal = document.createElement('div');
        modal.className = 'modal-glass active';
        modal.innerHTML = `
            <div class="modal-glass-content" style="max-width: 95%; max-height: 85vh; overflow-y: auto;">
                <div class="modal-header">
                    <h3><i class="fas fa-balance-scale"></i> مقارنة الأعشاب</h3>
                    <div class="close-modal-btn" onclick="CompareSystem.closeModal()">
                        <i class="fas fa-times"></i>
                    </div>
                </div>
                ${html}
            </div>
        `;
        document.body.appendChild(modal);
    },
    
    // طباعة المقارنة
    print: function() {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>مقارنة الأعشاب - موسوعة الأعشاب الطبية</title>
                <style>
                    body { font-family: 'Cairo', sans-serif; padding: 20px; max-width: 1200px; margin: 0 auto; }
                    h1 { color: #2e7d32; text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: right; vertical-align: top; }
                    th { background: #2e7d32; color: white; }
                    td:first-child { background: #f5f5f5; font-weight: bold; }
                    .compare-image { max-width: 100px; border-radius: 8px; }
                    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
                    @media print {
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>🌿 مقارنة الأعشاب الطبية</h1>
                <p>تاريخ الطباعة: ${new Date().toLocaleString('ar-EG')}</p>
        `);
        
        // بناء الجدول
        printWindow.document.write(`
            <table>
                <thead>
                    <tr>
                        <th>الميزة</th>
                        ${this.list.map(h => `<th>${this.escapeHtml(h.name)}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
        `);
        
        const fields = [
            { label: 'الفوائد الصحية', key: 'benefits' },
            { label: 'التحذيرات', key: 'warnings' },
            { label: 'الأضرار', key: 'harms' },
            { label: 'طريقة الاستخدام', key: 'usage' },
            { label: 'ملاحظات', key: 'notes' }
        ];
        
        for (const field of fields) {
            printWindow.document.write(`
                <tr>
                    <td><strong>${field.label}</strong></td>
                    ${this.list.map(h => `<td>${this.escapeHtml(h[field.key] || '—')}</td>`).join('')}
                </tr>
            `);
        }
        
        printWindow.document.write(`
                </tbody>
            </table>
            <div class="footer">
                موسوعة الأعشاب الطبية - نظام المقارنة المتقدم
            </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    },
    
    // تحديث أزرار المقارنة في الواجهة
    updateButtons: function() {
        document.querySelectorAll('.compare-btn').forEach(btn => {
            const herbId = btn.dataset.id;
            if (this.list.some(h => h.id === herbId)) {
                btn.innerHTML = '<i class="fas fa-check-circle"></i> تم الإضافة';
                btn.disabled = true;
                btn.style.opacity = '0.6';
            }
        });
    },
    
    // عرض رسالة
    showToast: function(message, type) {
        if (typeof window.showToastMessage === 'function') {
            window.showToastMessage(message, type);
        } else {
            alert(message);
        }
    },
    
    // تنسيق النص
    escapeHtml: function(s) {
        if (!s) return '—';
        return s.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
    }
};

window.CompareSystem = CompareSystem;
