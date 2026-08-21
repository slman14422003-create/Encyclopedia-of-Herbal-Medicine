// =====================================================
// نظام الإشارات المرجعية
// =====================================================

const BookmarkSystem = {
    list: [],
    
    // تحميل الإشارات
    load: function() {
        const saved = localStorage.getItem('herbal_bookmarks');
        if (saved) {
            this.list = JSON.parse(saved);
        }
        return this.list;
    },
    
    // حفظ الإشارات
    save: function() {
        localStorage.setItem('herbal_bookmarks', JSON.stringify(this.list));
    },
    
    // التحقق مما إذا كانت العشبة في الإشارات
    isBookmarked: function(herbId) {
        return this.list.includes(herbId);
    },
    
    // إضافة/إزالة إشارة
    toggle: function(herbId, herbName) {
        const index = this.list.indexOf(herbId);
        if (index === -1) {
            if (this.list.length >= 100) {
                this.showToast('⚠️ يمكن حفظ 100 عشبة كحد أقصى', 'warning');
                return false;
            }
            this.list.push(herbId);
            this.save();
            this.showToast(`✅ تمت إضافة ${herbName} إلى الإشارات`, 'success');
        } else {
            this.list.splice(index, 1);
            this.save();
            this.showToast(`🗑️ تمت إزالة ${herbName} من الإشارات`, 'info');
        }
        this.updateButtons();
        return true;
    },
    
    // مسح جميع الإشارات
    clear: function() {
        if (confirm('⚠️ هل تريد مسح جميع الإشارات المرجعية؟')) {
            this.list = [];
            this.save();
            this.showToast('✅ تم مسح جميع الإشارات', 'success');
            this.closeModal();
        }
    },
    
    // تصدير الإشارات
    exportBookmarks: function() {
        const bookmarkedHerbs = (window.appState.herbs || []).filter(h => this.list.includes(h.id));
        if (bookmarkedHerbs.length === 0) {
            this.showToast('لا توجد إشارات للتصدير', 'warning');
            return;
        }
        
        const data = {
            exportDate: new Date().toISOString(),
            bookmarks: bookmarkedHerbs
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `herbal_bookmarks_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('✅ تم تصدير الإشارات', 'success');
    },
    
    // إغلاق المودال
    closeModal: function() {
        document.querySelectorAll('.modal-glass.active').forEach(m => m.classList.remove('active'));
    },
    
    // عرض الإشارات
    show: function() {
        this.load();
        
        if (this.list.length === 0) {
            this.showToast('📭 لا توجد إشارات مرجعية', 'info');
            return;
        }
        
        const bookmarkedHerbs = (window.appState.herbs || []).filter(h => this.list.includes(h.id));
        
        if (bookmarkedHerbs.length === 0) {
            this.showToast('📭 لا توجد أعشاب في الإشارات', 'info');
            return;
        }
        
        let html = `
            <div class="bookmarks-header">
                <div class="bookmarks-stats">
                    <i class="fas fa-bookmark"></i> ${bookmarkedHerbs.length} إشارة
                </div>
                <div class="bookmarks-actions">
                    <button class="bookmarks-export" onclick="BookmarkSystem.exportBookmarks()">
                        <i class="fas fa-download"></i> تصدير
                    </button>
                    <button class="bookmarks-clear" onclick="BookmarkSystem.clear()">
                        <i class="fas fa-trash-alt"></i> مسح الكل
                    </button>
                </div>
            </div>
            <div class="bookmarks-list">
        `;
        
        for (const herb of bookmarkedHerbs) {
            let catName = "بدون تصنيف";
            const cat = (window.appState.categories || []).find(c => c.id === herb.category_id);
            if (cat) catName = cat.name;
            
            html += `
                <div class="bookmark-item" onclick="BookmarkSystem.goToHerb('${herb.id}')">
                    <div class="bookmark-icon">
                        <i class="fas fa-bookmark"></i>
                    </div>
                    <div class="bookmark-info">
                        <div class="bookmark-name">🌿 ${this.escapeHtml(herb.name)}</div>
                        <div class="bookmark-category">${this.escapeHtml(catName)}</div>
                    </div>
                    <div class="bookmark-remove" onclick="event.stopPropagation(); BookmarkSystem.toggle('${herb.id}', '${herb.name}')">
                        <i class="fas fa-times-circle"></i>
                    </div>
                </div>
            `;
        }
        
        html += `
            </div>
            <div class="bookmarks-footer">
                <button class="btn-primary" onclick="BookmarkSystem.closeModal()">إغلاق</button>
            </div>
        `;
        
        const modal = document.createElement('div');
        modal.className = 'modal-glass active';
        modal.innerHTML = `
            <div class="modal-glass-content" style="max-width: 550px;">
                <div class="modal-header">
                    <h3><i class="fas fa-bookmark"></i> الإشارات المرجعية</h3>
                    <div class="close-modal-btn" onclick="BookmarkSystem.closeModal()">
                        <i class="fas fa-times"></i>
                    </div>
                </div>
                ${html}
            </div>
        `;
        document.body.appendChild(modal);
    },
    
    // الانتقال إلى العشبة
    goToHerb: function(herbId) {
        this.closeModal();
        if (typeof window.showHerbDetail === 'function') {
            window.showHerbDetail(herbId);
        }
    },
    
    // تحديث أزرار الإشارات في الواجهة
    updateButtons: function() {
        document.querySelectorAll('.bookmark-btn, .result-bookmark').forEach(btn => {
            const herbId = btn.dataset.id;
            if (this.isBookmarked(herbId)) {
                btn.innerHTML = '<i class="fas fa-bookmark"></i> إزالة';
                btn.style.color = '#ff9800';
            } else {
                btn.innerHTML = '<i class="fas fa-bookmark"></i> حفظ';
                btn.style.color = '';
            }
        });
    },
    
    showToast: function(message, type) {
        if (typeof window.showToastMessage === 'function') {
            window.showToastMessage(message, type);
        } else {
            alert(message);
        }
    },
    
    escapeHtml: function(s) {
        if (!s) return '—';
        return s.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
    }
};

window.BookmarkSystem = BookmarkSystem;
