// =====================================================
// إدارة الأعشاب - Herbs Management (نسخة مصححة)
// =====================================================

const HerbManager = {
    // عرض جميع الأعشاب
    renderAll: function() {
        const container = document.getElementById('contentArea');
        const herbs = window.appState.herbs;
        const categories = window.appState.categories;
        
        if (!herbs || herbs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-leaf"></i>
                    <p>لا توجد أعشاب بعد</p>
                    ${window.appState.isAdmin ? '<button class="tool-btn" id="emptyAddHerbBtn" style="margin-top:15px;"><i class="fas fa-plus-circle"></i> إضافة أول عشبة</button>' : ''}
                </div>
            `;
            // ربط زر الإضافة من الحالة الفارغة
            const emptyAddBtn = document.getElementById('emptyAddHerbBtn');
            if (emptyAddBtn) {
                emptyAddBtn.addEventListener('click', () => this.showAddModal());
            }
            return;
        }
        
        let html = '<div class="herbs-grid">';
        for (const herb of herbs) {
            let catName = "بدون تصنيف";
            const category = categories.find(c => c.id === herb.category_id);
            if (category) catName = category.name;
            
            html += `
                <div class="herb-card" data-id="${herb.id}">
                    ${herb.image_url ? `<img src="${this.escapeHtml(herb.image_url)}" class="herb-card-image" loading="lazy" onerror="this.style.display='none'">` : ''}
                    <div class="card-header">
                        <span class="herb-name">🌿 ${this.escapeHtml(herb.name)}</span>
                        <span>${this.escapeHtml(catName)}</span>
                    </div>
                    <div class="info-block"><div class="info-label">💚 الفوائد</div><div class="info-text">${this.escapeHtml(herb.benefits || '—')}</div></div>
                    <div class="info-block"><div class="info-label">⚠️ التحذيرات</div><div class="info-text">${this.escapeHtml(herb.warnings || '—')}</div></div>
                    ${window.appState.isAdmin ? `
                        <div class="card-actions">
                            <i class="fas fa-edit edit-herb" data-id="${herb.id}" style="cursor:pointer;color:var(--primary);"></i>
                            <i class="fas fa-trash-alt del-herb" data-id="${herb.id}" data-name="${this.escapeHtml(herb.name)}" style="cursor:pointer;color:var(--danger);"></i>
                        </div>
                    ` : ''}
                </div>
            `;
        }
        html += '</div>';
        container.innerHTML = html;
        this.attachEvents();
    },
    
    // ربط الأحداث
    attachEvents: function() {
        // أزرار التعديل
        document.querySelectorAll('.edit-herb').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const herbId = btn.dataset.id;
                console.log('✏️ تعديل عشبة:', herbId);
                this.showEditModal(herbId);
            };
        });
        
        // أزرار الحذف
        document.querySelectorAll('.del-herb').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const herbId = btn.dataset.id;
                const herbName = btn.dataset.name;
                console.log('🗑️ حذف عشبة:', herbName);
                window.appState.pendingDeleteId = herbId;
                window.appState.pendingDeleteType = 'herb';
                document.getElementById('deleteMessage').innerHTML = `⚠️ حذف "${herbName}" من السحابة؟`;
                document.getElementById('deleteModal').classList.add('active');
            };
        });
        
        // عرض التفاصيل عند الضغط على البطاقة
        document.querySelectorAll('.herb-card').forEach(card => {
            card.onclick = (e) => {
                if (!e.target.closest('.card-actions')) {
                    this.showDetail(card.dataset.id);
                }
            };
        });
    },
    
    // عرض تفاصيل العشبة
    showDetail: function(id) {
        const herb = window.appState.herbs.find(h => h.id === id);
        if (!herb) return;
        
        let catName = "بدون تصنيف";
        const category = window.appState.categories.find(c => c.id === herb.category_id);
        if (category) catName = category.name;
        
        let html = `
            <div class="info-block"><div class="info-label">التصنيف</div><div class="info-text">${this.escapeHtml(catName)}</div></div>
            <div class="info-block"><div class="info-label">الاسم</div><div class="info-text">${this.escapeHtml(herb.name)}</div></div>
            <div class="info-block"><div class="info-label">💚 الفوائد</div><div class="info-text">${this.escapeHtml(herb.benefits || '—')}</div></div>
            <div class="info-block"><div class="info-label">⚠️ التحذيرات</div><div class="info-text">${this.escapeHtml(herb.warnings || '—')}</div></div>
            <div class="info-block"><div class="info-label">⚡ الأضرار</div><div class="info-text">${this.escapeHtml(herb.harms || '—')}</div></div>
            <div class="info-block"><div class="info-label">🍵 طريقة الاستخدام</div><div class="info-text">${this.escapeHtml(herb.usage || '—')}</div></div>
            <div class="info-block"><div class="info-label">📝 ملاحظات</div><div class="info-text">${this.escapeHtml(herb.notes || '—')}</div></div>
            ${herb.image_url ? `<div class="info-block"><div class="info-label">🖼️ صورة العشبة</div><img src="${this.escapeHtml(herb.image_url)}" style="max-width:100%;border-radius:20px;margin-top:8px;"></div>` : ''}
            <div class="herb-detail-actions">
                <button class="tool-btn" onclick="CompareSystem.add(${JSON.stringify(herb).replace(/"/g, '&quot;')})"><i class="fas fa-balance-scale"></i> مقارنة</button>
                <button class="tool-btn" onclick="BookmarkSystem.toggle('${herb.id}', '${herb.name}')"><i class="fas fa-bookmark"></i> ${BookmarkSystem.isBookmarked(herb.id) ? 'إزالة من الإشارات' : 'إضافة للإشارات'}</button>
                <button class="tool-btn" onclick="SearchSystem.showAdvanced()"><i class="fas fa-search-plus"></i> بحث متقدم</button>
                <button class="tool-btn" onclick="window.print()"><i class="fas fa-print"></i> طباعة</button>
            </div>
        `;
        
        document.getElementById('detailContent').innerHTML = html;
        document.getElementById('detailModal').classList.add('active');
    },
    
    // عرض نموذج إضافة عشبة
    showAddModal: function() {
        if (!window.appState.isAdmin) {
            this.showToast('⚠️ فقط المسؤول يمكنه إضافة أعشاب', 'warning');
            return;
        }
        
        console.log('➕ فتح نافذة إضافة عشبة');
        
        // تنظيف النموذج
        this.resetForm();
        window.appState.currentEditHerbId = null;
        
        // تعيين عنوان النموذج
        const modalTitle = document.getElementById('herbModalTitle');
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> إضافة عشبة جديدة';
        }
        
        // تعبئة قائمة التصنيفات
        this.populateCategorySelect();
        
        // إظهار المودال
        const modal = document.getElementById('herbModal');
        if (modal) {
            modal.classList.add('active');
        } else {
            console.error('❌ عنصر herbModal غير موجود');
            this.showToast('حدث خطأ في فتح النافذة', 'error');
        }
    },
    
    // عرض نموذج تعديل عشبة
    showEditModal: function(id) {
        if (!window.appState.isAdmin) {
            this.showToast('⚠️ فقط المسؤول يمكنه تعديل الأعشاب', 'warning');
            return;
        }
        
        const herb = window.appState.herbs.find(h => h.id === id);
        if (!herb) {
            this.showToast('❌ العشبة غير موجودة', 'error');
            return;
        }
        
        console.log('✏️ فتح نافذة تعديل عشبة:', herb.name);
        
        // تنظيف النموذج
        this.resetForm();
        window.appState.currentEditHerbId = id;
        window.appState.currentImageBase64 = herb.image_url;
        
        // تعبئة البيانات
        const nameInput = document.getElementById('modalHerbName');
        const benefitsInput = document.getElementById('modalHerbBenefits');
        const warningsInput = document.getElementById('modalHerbWarnings');
        const harmsInput = document.getElementById('modalHerbHarams');
        const usageInput = document.getElementById('modalHerbUsage');
        const notesInput = document.getElementById('modalHerbNotes');
        
        if (nameInput) nameInput.value = herb.name;
        if (benefitsInput) benefitsInput.value = herb.benefits || '';
        if (warningsInput) warningsInput.value = herb.warnings || '';
        if (harmsInput) harmsInput.value = herb.harms || '';
        if (usageInput) usageInput.value = herb.usage || '';
        if (notesInput) notesInput.value = herb.notes || '';
        
        // تعبئة قائمة التصنيفات
        this.populateCategorySelect(herb.category_id);
        
        // عرض الصورة إذا وجدت
        if (herb.image_url) {
            const previewContainer = document.getElementById('imagePreviewContainer');
            const clearBtn = document.getElementById('clearImageBtn');
            if (previewContainer) {
                previewContainer.innerHTML = `<img src="${this.escapeHtml(herb.image_url)}" class="herb-image-preview" onclick="document.getElementById('herbImageInput').click()">`;
            }
            if (clearBtn) clearBtn.style.display = 'inline-flex';
        }
        
        // تعيين عنوان النموذج
        const modalTitle = document.getElementById('herbModalTitle');
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="fas fa-edit"></i> تعديل العشبة';
        }
        
        // إظهار المودال
        const modal = document.getElementById('herbModal');
        if (modal) {
            modal.classList.add('active');
        }
    },
    
    // حفظ العشبة (إضافة أو تعديل)
    save: async function() {
        const nameInput = document.getElementById('modalHerbName');
        const name = nameInput ? nameInput.value.trim() : '';
        
        if (!name) {
            this.showToast('الاسم مطلوب', 'warning');
            return;
        }
        
        const categoryId = document.getElementById('modalHerbCategory')?.value || null;
        let imageUrl = window.appState.currentImageBase64;
        
        if (window.appState.currentImageFile) {
            imageUrl = await this.compressImage(window.appState.currentImageFile);
            window.appState.currentImageFile = null;
        }
        
        const herbData = {
            name: name,
            categoryId: categoryId,
            benefits: document.getElementById('modalHerbBenefits')?.value || '—',
            warnings: document.getElementById('modalHerbWarnings')?.value || '—',
            harms: document.getElementById('modalHerbHarams')?.value || '—',
            usage: document.getElementById('modalHerbUsage')?.value || '—',
            notes: document.getElementById('modalHerbNotes')?.value || '—',
            imageUrl: imageUrl || null
        };
        
        let result;
        if (window.appState.currentEditHerbId) {
            // تحديث عشبة موجودة
            result = await FirebaseSync.updateHerb(window.appState.currentEditHerbId, herbData);
            if (result.success) {
                this.showToast('✅ تم تعديل العشبة بنجاح', 'success');
            }
        } else {
            // إضافة عشبة جديدة
            result = await FirebaseSync.addHerb(herbData);
            if (result.success) {
                this.showToast(`✅ تم إضافة ${name} بنجاح`, 'success');
            }
        }
        
        if (result.success) {
            // إغلاق المودال
            const modal = document.getElementById('herbModal');
            if (modal) modal.classList.remove('active');
            
            // تنظيف النموذج
            this.resetForm();
            
            // إعادة تحميل البيانات
            await FirebaseSync.fetchAllData(true);
        } else {
            this.showToast('❌ فشل الحفظ: ' + (result.error || 'خطأ غير معروف'), 'error');
        }
    },
    
    // حذف عشبة
    delete: async function(id) {
        const result = await FirebaseSync.deleteHerb(id);
        if (result.success) {
            this.showToast('✅ تم حذف العشبة', 'success');
            await FirebaseSync.fetchAllData(true);
        } else {
            this.showToast('❌ فشل الحذف: ' + (result.error || 'خطأ غير معروف'), 'error');
        }
    },
    
    // حذف جميع الأعشاب
    deleteAll: async function() {
        if (!confirm('⚠️ هل أنت متأكد من حذف جميع الأعشاب؟')) return;
        const result = await FirebaseSync.deleteAllHerbs();
        if (result.success) {
            this.showToast('✅ تم حذف جميع الأعشاب', 'success');
            await FirebaseSync.fetchAllData(true);
        } else {
            this.showToast('❌ فشل الحذف', 'error');
        }
    },
    
    // حذف جميع البيانات
    deleteAllData: async function() {
        if (!confirm('⚠️ هل أنت متأكد من حذف جميع الأعشاب والتصنيفات؟')) return;
        const result = await FirebaseSync.deleteAllData();
        if (result.success) {
            this.showToast('✅ تم حذف جميع البيانات', 'success');
            await FirebaseSync.fetchAllData(true);
        } else {
            this.showToast('❌ فشل الحذف', 'error');
        }
    },
    
    // تصدير CSV
    exportToCSV: function() {
        const herbs = window.appState.herbs;
        if (!herbs.length) {
            this.showToast('لا توجد أعشاب للتصدير', 'warning');
            return;
        }
        
        const headers = ['الاسم', 'التصنيف', 'الفوائد', 'التحذيرات', 'الأضرار', 'الاستخدام', 'الملاحظات'];
        const rows = herbs.map(h => {
            const cat = window.appState.categories.find(c => c.id === h.category_id);
            return [
                h.name,
                cat ? cat.name : 'بدون تصنيف',
                h.benefits || '—',
                h.warnings || '—',
                h.harms || '—',
                h.usage || '—',
                h.notes || '—'
            ];
        });
        
        const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `herbs_export_${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
        this.showToast('✅ تم تصدير الأعشاب إلى CSV', 'success');
    },
    
    // تعبئة قائمة التصنيفات
    populateCategorySelect: function(selectedId = '') {
        const select = document.getElementById('modalHerbCategory');
        if (!select) return;
        
        let options = '<option value="">-- بدون تصنيف --</option>';
        (window.appState.categories || []).forEach(cat => {
            options += `<option value="${cat.id}" ${cat.id === selectedId ? 'selected' : ''}>${this.escapeHtml(cat.name)}</option>`;
        });
        select.innerHTML = options;
    },
    
    // إعادة تعيين النموذج
    resetForm: function() {
        window.appState.currentEditHerbId = null;
        window.appState.currentImageBase64 = null;
        window.appState.currentImageFile = null;
        
        const nameInput = document.getElementById('modalHerbName');
        const benefitsInput = document.getElementById('modalHerbBenefits');
        const warningsInput = document.getElementById('modalHerbWarnings');
        const harmsInput = document.getElementById('modalHerbHarams');
        const usageInput = document.getElementById('modalHerbUsage');
        const notesInput = document.getElementById('modalHerbNotes');
        const previewContainer = document.getElementById('imagePreviewContainer');
        const clearBtn = document.getElementById('clearImageBtn');
        const compressInfo = document.getElementById('compressInfo');
        
        if (nameInput) nameInput.value = '';
        if (benefitsInput) benefitsInput.value = '';
        if (warningsInput) warningsInput.value = '';
        if (harmsInput) harmsInput.value = '';
        if (usageInput) usageInput.value = '';
        if (notesInput) notesInput.value = '';
        if (previewContainer) previewContainer.innerHTML = '';
        if (clearBtn) clearBtn.style.display = 'none';
        if (compressInfo) compressInfo.innerHTML = '';
        
        this.populateCategorySelect();
    },
    
    // معالجة رفع الصورة
    handleImageUpload: async function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            window.appState.currentImageFile = file;
            const compressed = await this.compressImage(file);
            window.appState.currentImageBase64 = compressed;
            
            const previewContainer = document.getElementById('imagePreviewContainer');
            const clearBtn = document.getElementById('clearImageBtn');
            const compressInfo = document.getElementById('compressInfo');
            
            if (previewContainer) {
                previewContainer.innerHTML = `<img src="${compressed}" class="herb-image-preview" onclick="document.getElementById('herbImageInput').click()">`;
            }
            if (clearBtn) clearBtn.style.display = 'inline-flex';
            if (compressInfo) compressInfo.innerHTML = '✅ تم ضغط الصورة';
        } else {
            this.showToast('ملف غير صالح. يرجى اختيار صورة', 'warning');
        }
    },
    
    // مسح الصورة
    clearImage: function() {
        window.appState.currentImageBase64 = null;
        window.appState.currentImageFile = null;
        
        const imageInput = document.getElementById('herbImageInput');
        const previewContainer = document.getElementById('imagePreviewContainer');
        const clearBtn = document.getElementById('clearImageBtn');
        const compressInfo = document.getElementById('compressInfo');
        
        if (imageInput) imageInput.value = '';
        if (previewContainer) previewContainer.innerHTML = '';
        if (clearBtn) clearBtn.style.display = 'none';
        if (compressInfo) compressInfo.innerHTML = '';
        
        this.showToast('✅ تم مسح الصورة', 'success');
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
                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    },
    
    // عرض رسالة
    showToast: function(message, type) {
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
    },
    
    // تنسيق النص
    escapeHtml: function(s) {
        if (!s) return '—';
        return s.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
    }
};

window.HerbManager = HerbManager;
