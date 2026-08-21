// =====================================================
// إدارة التصنيفات - Categories Management
// =====================================================

const CategoryManager = {
    // عرض جميع التصنيفات
    renderAll: function() {
        const container = document.getElementById('contentArea');
        const categories = window.appState.categories;
        const herbs = window.appState.herbs;
        
        if (!categories || categories.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-folder-open"></i><p>لا توجد تصنيفات</p><button class="tool-btn admin-only" onclick="CategoryManager.showManager()">➕ إضافة تصنيف</button></div>';
            return;
        }
        
        let html = '<div class="categories-grid">';
        for (const cat of categories) {
            const herbsCount = herbs.filter(h => h.category_id === cat.id).length;
            html += `
                <div class="category-card" data-cat-id="${cat.id}">
                    <div class="card-header">
                        <span class="category-name">📁 ${this.escapeHtml(cat.name)}</span>
                        <span>${herbsCount} عشبة</span>
                    </div>
                    <div>اضغط لعرض الأعشاب</div>
                    ${window.appState.isAdmin ? `
                        <div class="card-actions">
                            <i class="fas fa-edit edit-cat" data-id="${cat.id}" data-name="${this.escapeHtml(cat.name)}"></i>
                            <i class="fas fa-trash-alt del-cat" data-id="${cat.id}" data-name="${this.escapeHtml(cat.name)}"></i>
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
        document.querySelectorAll('.category-card').forEach(card => {
            card.onclick = (e) => {
                if (!e.target.closest('.card-actions')) {
                    this.showCategoryHerbs(card.dataset.catId);
                }
            };
        });
        
        if (window.appState.isAdmin) {
            document.querySelectorAll('.edit-cat').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    this.edit(btn.dataset.id, btn.dataset.name);
                };
            });
            
            document.querySelectorAll('.del-cat').forEach(btn => {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    window.appState.pendingDeleteId = btn.dataset.id;
                    window.appState.pendingDeleteType = 'category';
                    document.getElementById('deleteMessage').innerHTML = `⚠️ حذف التصنيف "${btn.dataset.name}" وجميع أعشابه؟`;
                    document.getElementById('deleteModal').classList.add('active');
                };
            });
        }
    },
    
    // عرض أعشاب تصنيف معين
    showCategoryHerbs: function(catId) {
        const category = window.appState.categories.find(c => c.id === catId);
        if (!category) return;
        
        const catHerbs = window.appState.herbs.filter(h => h.category_id === catId);
        const container = document.getElementById('contentArea');
        
        if (!catHerbs.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>📂 لا توجد أعشاب في "${this.escapeHtml(category.name)}"</p>
                    <button class="tool-btn" id="backToCategoriesBtn"><i class="fas fa-arrow-right"></i> العودة</button>
                </div>
            `;
            document.getElementById('backToCategoriesBtn')?.addEventListener('click', () => {
                window.appState.currentView = 'categories';
                this.renderAll();
                const btns = document.querySelectorAll('.view-btn');
                btns.forEach(btn => btn.classList.toggle('active', btn.dataset.view === 'categories'));
            });
            return;
        }
        
        let html = `
            <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem;">
                <button id="backCatBtn" class="tool-btn"><i class="fas fa-arrow-right"></i> التصنيفات</button>
                <h3>📂 ${this.escapeHtml(category.name)}</h3>
            </div>
            <div class="herbs-grid">
        `;
        
        for (const herb of catHerbs) {
            html += `
                <div class="herb-card" data-id="${herb.id}">
                    ${herb.image_url ? `<img src="${this.escapeHtml(herb.image_url)}" class="herb-card-image" loading="lazy">` : ''}
                    <div class="herb-name">🌿 ${this.escapeHtml(herb.name)}</div>
                    <div class="info-block"><div class="info-label">💚 الفوائد</div><div class="info-text">${this.escapeHtml(herb.benefits || '—')}</div></div>
                    <div class="info-block"><div class="info-label">⚠️ التحذيرات</div><div class="info-text">${this.escapeHtml(herb.warnings || '—')}</div></div>
                </div>
            `;
        }
        html += '</div>';
        container.innerHTML = html;
        
        document.getElementById('backCatBtn')?.addEventListener('click', () => {
            window.appState.currentView = 'categories';
            this.renderAll();
            const btns = document.querySelectorAll('.view-btn');
            btns.forEach(btn => btn.classList.toggle('active', btn.dataset.view === 'categories'));
        });
        
        document.querySelectorAll('.herb-card').forEach(card => {
            card.onclick = () => HerbManager.showDetail(card.dataset.id);
        });
    },
    
    // عرض مدير التصنيفات
    showManager: function() {
        let listHtml = '';
        for (const cat of window.appState.categories) {
            const herbsCount = window.appState.herbs.filter(h => h.category_id === cat.id).length;
            listHtml += `
                <div class="category-item">
                    <div class="category-name-display">
                        <i class="fas fa-folder"></i> ${this.escapeHtml(cat.name)}
                        <span style="font-size:0.7rem; background:var(--primary); color:white; padding:2px 8px; border-radius:30px;">${herbsCount}</span>
                    </div>
                    <div class="category-actions">
                        <i class="fas fa-edit edit-cat-item" data-id="${cat.id}" data-name="${this.escapeHtml(cat.name)}" style="color:var(--primary);"></i>
                        <i class="fas fa-trash-alt del-cat-item" data-id="${cat.id}" data-name="${this.escapeHtml(cat.name)}" style="color:var(--danger);"></i>
                    </div>
                </div>
            `;
        }
        
        document.getElementById('categoriesList').innerHTML = listHtml || '<div class="empty-state">لا توجد تصنيفات</div>';
        
        document.querySelectorAll('.edit-cat-item').forEach(btn => {
            btn.onclick = () => this.edit(btn.dataset.id, btn.dataset.name);
        });
        
        document.querySelectorAll('.del-cat-item').forEach(btn => {
            btn.onclick = () => {
                window.appState.pendingDeleteId = btn.dataset.id;
                window.appState.pendingDeleteType = 'category';
                document.getElementById('deleteMessage').innerHTML = `⚠️ حذف التصنيف "${btn.dataset.name}" وجميع أعشابه؟`;
                document.getElementById('deleteModal').classList.add('active');
                document.getElementById('categoryModal').classList.remove('active');
            };
        });
        
        document.getElementById('categoryModal').classList.add('active');
    },
    
    // إضافة تصنيف جديد
    add: async function() {
        const name = document.getElementById('newCategoryName').value.trim();
        if (!name) {
            this.showToast('أدخل اسم التصنيف', 'warning');
            return;
        }
        
        const result = await FirebaseSync.addCategory(name);
        if (result.success) {
            this.showToast('✅ تم إضافة التصنيف', 'success');
            document.getElementById('newCategoryName').value = '';
            await FirebaseSync.fetchAllData(false);
            this.showManager();
            this.renderAll();
        } else {
            this.showToast('❌ فشل الإضافة', 'error');
        }
    },
    
    // تعديل تصنيف
    edit: async function(id, currentName) {
        const newName = prompt('تعديل اسم التصنيف', currentName);
        if (newName && newName !== currentName) {
            const result = await FirebaseSync.updateCategory(id, newName);
            if (result.success) {
                this.showToast('✅ تم التعديل', 'success');
                await FirebaseSync.fetchAllData(false);
                this.showManager();
                this.renderAll();
            } else {
                this.showToast('❌ فشل التعديل', 'error');
            }
        }
    },
    
    // حذف تصنيف
    delete: async function(id) {
        const result = await FirebaseSync.deleteCategory(id);
        if (result.success) {
            this.showToast('✅ تم حذف التصنيف', 'success');
            await FirebaseSync.fetchAllData(true);
        } else {
            this.showToast('❌ فشل الحذف', 'error');
        }
    },
    
    // عرض التصنيفات للزوار
    showVisitorCategories: function() {
        if (!window.appState.categories.length) {
            this.showToast('لا توجد تصنيفات', 'warning');
            return;
        }
        
        let html = '';
        for (const cat of window.appState.categories) {
            const count = window.appState.herbs.filter(h => h.category_id === cat.id).length;
            html += `
                <div class="category-item" style="cursor:pointer;" data-cat-id="${cat.id}">
                    <div class="category-name-display">
                        <i class="fas fa-folder"></i> ${this.escapeHtml(cat.name)}
                        <span style="background:var(--primary);color:white;padding:2px 8px;border-radius:30px;">${count}</span>
                    </div>
                    <i class="fas fa-chevron-left"></i>
                </div>
            `;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal-glass active';
        modal.innerHTML = `
            <div class="modal-glass-content" style="max-width:500px;">
                <div class="modal-header">
                    <h3>📂 جميع التصنيفات</h3>
                    <div class="close-modal-btn" onclick="this.closest('.modal-glass').classList.remove('active')"><i class="fas fa-times"></i></div>
                </div>
                <div style="max-height:400px;overflow-y:auto;">${html}</div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="this.closest('.modal-glass').classList.remove('active')">إغلاق</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelectorAll('.category-item').forEach(item => {
            item.onclick = () => {
                modal.classList.remove('active');
                this.showCategoryHerbs(item.dataset.catId);
            };
        });
    },
    
    escapeHtml: function(s) {
        if (!s) return '—';
        return s.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
    },
    
    showToast: function(message, type) {
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2e7d32';
        toast.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:${bgColor};color:white;padding:12px 24px;border-radius:50px;z-index:10001;font-size:14px;`;
        toast.innerHTML = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

window.CategoryManager = CategoryManager;
