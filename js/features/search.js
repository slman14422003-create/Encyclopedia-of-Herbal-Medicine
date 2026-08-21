// =====================================================
// نظام البحث المتقدم
// =====================================================

const SearchSystem = {
    searchHistory: [],
    
    // تحميل سجل البحث
    loadHistory: function() {
        const saved = localStorage.getItem('search_history');
        if (saved) {
            this.searchHistory = JSON.parse(saved);
        }
        return this.searchHistory;
    },
    
    // حفظ سجل البحث
    saveHistory: function() {
        // الاحتفاظ بآخر 10 عمليات بحث
        if (this.searchHistory.length > 10) {
            this.searchHistory = this.searchHistory.slice(0, 10);
        }
        localStorage.setItem('search_history', JSON.stringify(this.searchHistory));
    },
    
    // إضافة إلى سجل البحث
    addToHistory: function(query) {
        if (!query) return;
        const index = this.searchHistory.indexOf(query);
        if (index !== -1) {
            this.searchHistory.splice(index, 1);
        }
        this.searchHistory.unshift(query);
        this.saveHistory();
    },
    
    // عرض نافذة البحث المتقدم
    showAdvanced: function() {
        const categories = window.appState.categories || [];
        let categoriesOptions = '<option value="all">جميع التصنيفات</option>';
        categories.forEach(cat => {
            categoriesOptions += `<option value="${cat.id}">${this.escapeHtml(cat.name)}</option>`;
        });
        
        // تحميل سجل البحث
        this.loadHistory();
        let historyHtml = '';
        if (this.searchHistory.length > 0) {
            historyHtml = `
                <div class="search-history">
                    <label><i class="fas fa-history"></i> عمليات البحث الأخيرة</label>
                    <div class="history-tags">
                        ${this.searchHistory.map(q => `
                            <span class="history-tag" onclick="SearchSystem.useHistory('${this.escapeHtml(q)}')">
                                ${this.escapeHtml(q)}
                            </span>
                        `).join('')}
                        <span class="history-clear" onclick="SearchSystem.clearHistory()">
                            <i class="fas fa-trash-alt"></i> مسح
                        </span>
                    </div>
                </div>
            `;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal-glass active';
        modal.innerHTML = `
            <div class="modal-glass-content" style="max-width: 580px;">
                <div class="modal-header">
                    <h3><i class="fas fa-search-plus"></i> بحث متقدم</h3>
                    <div class="close-modal-btn" onclick="this.closest('.modal-glass').classList.remove('active')">
                        <i class="fas fa-times"></i>
                    </div>
                </div>
                <div class="advanced-search-container">
                    <div class="filter-group">
                        <label><i class="fas fa-search"></i> كلمة البحث</label>
                        <input type="text" id="advSearchQuery" class="search-input" placeholder="أدخل كلمة البحث..." autocomplete="off">
                    </div>
                    <div class="filter-group">
                        <label><i class="fas fa-folder-tree"></i> التصنيف</label>
                        <select id="advSearchCategory">${categoriesOptions}</select>
                    </div>
                    <div class="filter-group">
                        <label><i class="fas fa-location-dot"></i> البحث في</label>
                        <select id="advSearchField">
                            <option value="name">الاسم فقط</option>
                            <option value="benefits">الفوائد فقط</option>
                            <option value="warnings">التحذيرات فقط</option>
                            <option value="all">جميع الحقول</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label><i class="fas fa-filter"></i> خيارات إضافية</label>
                        <div class="checkbox-group">
                            <label>
                                <input type="checkbox" id="caseSensitive"> حساسية الأحرف
                            </label>
                            <label>
                                <input type="checkbox" id="exactMatch"> تطابق تام
                            </label>
                        </div>
                    </div>
                    ${historyHtml}
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" onclick="SearchSystem.perform()">
                        <i class="fas fa-search"></i> بحث
                    </button>
                    <button class="btn-secondary" onclick="this.closest('.modal-glass').classList.remove('active')">
                        <i class="fas fa-times"></i> إلغاء
                    </button>
                </div>
                <div id="advSearchResults" style="margin-top: 20px;"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        setTimeout(() => {
            const queryInput = document.getElementById('advSearchQuery');
            if (queryInput) queryInput.focus();
        }, 100);
    },
    
    // استخدام كلمة من سجل البحث
    useHistory: function(query) {
        const input = document.getElementById('advSearchQuery');
        if (input) {
            input.value = query;
            this.perform();
        }
    },
    
    // مسح سجل البحث
    clearHistory: function() {
        this.searchHistory = [];
        this.saveHistory();
        this.showAdvanced();
        this.showToast('✅ تم مسح سجل البحث', 'success');
    },
    
    // تنفيذ البحث المتقدم
    perform: function() {
        let query = document.getElementById('advSearchQuery')?.value.trim();
        const categoryId = document.getElementById('advSearchCategory')?.value;
        const searchField = document.getElementById('advSearchField')?.value;
        const caseSensitive = document.getElementById('caseSensitive')?.checked;
        const exactMatch = document.getElementById('exactMatch')?.checked;
        
        if (!query) {
            const resultsDiv = document.getElementById('advSearchResults');
            if (resultsDiv) resultsDiv.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>الرجاء إدخال كلمة البحث</p></div>';
            return;
        }
        
        // إضافة إلى سجل البحث
        this.addToHistory(query);
        
        // تهيئة البحث
        let searchQuery = caseSensitive ? query : query.toLowerCase();
        let results = window.appState.herbs || [];
        
        // فلترة حسب التصنيف
        if (categoryId && categoryId !== 'all') {
            results = results.filter(h => h.category_id === categoryId);
        }
        
        // فلترة حسب حقل البحث
        if (searchField === 'name') {
            results = results.filter(h => {
                let name = caseSensitive ? h.name : h.name.toLowerCase();
                if (exactMatch) return name === searchQuery;
                return name.includes(searchQuery);
            });
        } else if (searchField === 'benefits') {
            results = results.filter(h => {
                let benefits = caseSensitive ? (h.benefits || '') : (h.benefits || '').toLowerCase();
                if (exactMatch) return benefits === searchQuery;
                return benefits.includes(searchQuery);
            });
        } else if (searchField === 'warnings') {
            results = results.filter(h => {
                let warnings = caseSensitive ? (h.warnings || '') : (h.warnings || '').toLowerCase();
                if (exactMatch) return warnings === searchQuery;
                return warnings.includes(searchQuery);
            });
        } else {
            results = results.filter(h => {
                const fields = [
                    h.name,
                    h.benefits || '',
                    h.warnings || '',
                    h.harms || '',
                    h.usage || '',
                    h.notes || ''
                ];
                return fields.some(field => {
                    let f = caseSensitive ? field : field.toLowerCase();
                    if (exactMatch) return f === searchQuery;
                    return f.includes(searchQuery);
                });
            });
        }
        
        const resultsDiv = document.getElementById('advSearchResults');
        if (results.length > 0) {
            resultsDiv.innerHTML = `
                <div class="search-results-header">
                    <h4><i class="fas fa-list"></i> نتائج البحث (${results.length})</h4>
                    <button class="search-export-btn" onclick="SearchSystem.exportResults(${JSON.stringify(results).replace(/"/g, '&quot;')})">
                        <i class="fas fa-download"></i> تصدير
                    </button>
                </div>
                <div class="search-results-list">
                    ${results.map(h => `
                        <div class="search-result-item" onclick="SearchSystem.goToHerb('${h.id}')">
                            <div class="result-header">
                                <i class="fas fa-leaf"></i>
                                <strong>${this.escapeHtml(h.name)}</strong>
                                <span class="result-category">${this.getCategoryName(h.category_id)}</span>
                            </div>
                            <div class="result-preview">
                                ${this.getPreview(h, searchField, query)}
                            </div>
                            <div class="result-actions">
                                <button class="result-compare" onclick="event.stopPropagation(); CompareSystem.add(${JSON.stringify(h).replace(/"/g, '&quot;')})">
                                    <i class="fas fa-balance-scale"></i> مقارنة
                                </button>
                                <button class="result-bookmark" onclick="event.stopPropagation(); BookmarkSystem.toggle('${h.id}', '${h.name}')">
                                    <i class="fas ${BookmarkSystem.isBookmarked(h.id) ? 'fa-bookmark' : 'fa-bookmark'}"></i> 
                                    ${BookmarkSystem.isBookmarked(h.id) ? 'إزالة' : 'حفظ'}
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            resultsDiv.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>❌ لا توجد نتائج مطابقة</p><p class="empty-hint">جرب كلمات بحث أخرى أو تحقق من الإملاء</p></div>';
        }
    },
    
    // الحصول على معاينة النتيجة
    getPreview: function(herb, searchField, query) {
        const q = query.toLowerCase();
        if (searchField === 'benefits' && herb.benefits) {
            return this.highlightText(herb.benefits, q);
        }
        if (searchField === 'warnings' && herb.warnings) {
            return this.highlightText(herb.warnings, q);
        }
        if (herb.benefits) {
            return this.highlightText(herb.benefits, q);
        }
        return 'اضغط لعرض التفاصيل الكاملة';
    },
    
    // تمييز النص المطابق
    highlightText: function(text, query) {
        if (!text) return '—';
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },
    
    // تصدير نتائج البحث
    exportResults: function(results) {
        const data = {
            searchDate: new Date().toISOString(),
            resultsCount: results.length,
            results: results
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `search_results_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('✅ تم تصدير النتائج', 'success');
    },
    
    // الانتقال إلى العشبة
    goToHerb: function(herbId) {
        document.querySelectorAll('.modal-glass.active').forEach(m => m.classList.remove('active'));
        if (typeof window.showHerbDetail === 'function') {
            window.showHerbDetail(herbId);
        }
    },
    
    // البحث السريع (في شريط البحث)
    quickSearch: function(query) {
        if (!query) return [];
        query = query.toLowerCase();
        return (window.appState.herbs || []).filter(h => h.name.toLowerCase().includes(query));
    },
    
    // الحصول على اسم التصنيف
    getCategoryName: function(categoryId) {
        const cat = (window.appState.categories || []).find(c => c.id === categoryId);
        return cat ? cat.name : 'بدون تصنيف';
    },
    
    // إحصائيات الزوار
    showVisitorStats: function() {
        const herbCount = window.appState.herbs?.length || 0;
        const categoryCount = window.appState.categories?.length || 0;
        const bookmarkCount = BookmarkSystem.list.length;
        
        let visits = localStorage.getItem('visitor_count') || 1;
        visits = parseInt(visits) + 1;
        localStorage.setItem('visitor_count', visits);
        
        const lastVisit = localStorage.getItem('last_visit') || 'اليوم';
        localStorage.setItem('last_visit', new Date().toLocaleDateString('ar-EG'));
        
        alert(`📊 إحصائيات سريعة:
        
👥 عدد زياراتك: ${visits}
🌿 عدد الأعشاب المسجلة: ${herbCount}
📂 عدد التصنيفات: ${categoryCount}
🔖 عدد الإشارات المرجعية: ${bookmarkCount}
📅 آخر زيارة: ${lastVisit}`);
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

window.SearchSystem = SearchSystem;
