// =====================================================
// المزامنة - نسخة تعمل 100%
// =====================================================

const FirebaseSync = {
    // جلب جميع الأعشاب
    fetchHerbs: async function() {
        const snapshot = await db.collection('herbs').get();
        const herbs = [];
        snapshot.forEach(doc => {
            herbs.push({ id: doc.id, ...doc.data() });
        });
        return herbs;
    },
    
    // جلب جميع التصنيفات
    fetchCategories: async function() {
        const snapshot = await db.collection('categories').get();
        const categories = [];
        snapshot.forEach(doc => {
            categories.push({ id: doc.id, ...doc.data() });
        });
        return categories;
    },
    
    // جلب جميع البيانات
    fetchAllData: async function() {
        try {
            const [categories, herbs] = await Promise.all([
                this.fetchCategories(),
                this.fetchHerbs()
            ]);
            
            window.appState.categories = categories;
            window.appState.herbs = herbs;
            
            if (typeof renderContent === 'function') renderContent();
            if (typeof updateHerbCount === 'function') updateHerbCount();
            
            console.log(`✅ تم التحميل: ${herbs.length} عشبة`);
            return true;
        } catch (error) {
            console.error('❌ فشل التحميل:', error);
            return false;
        }
    },
    
    // إضافة عشبة
    addHerb: async function(herbData) {
        try {
            console.log('➕ إضافة عشبة:', herbData.name);
            
            const docRef = await db.collection('herbs').add({
                name: herbData.name,
                category_id: herbData.categoryId || null,
                benefits: herbData.benefits || '—',
                warnings: herbData.warnings || '—',
                harms: herbData.harms || '—',
                usage: herbData.usage || '—',
                notes: herbData.notes || '—',
                image_url: herbData.imageUrl || null,
                created_at: new Date()
            });
            
            console.log('✅ تمت الإضافة، ID:', docRef.id);
            alert(`✅ تم إضافة ${herbData.name}`);
            await this.fetchAllData();
            return { success: true };
        } catch (error) {
            console.error('❌ فشل:', error);
            alert('❌ فشل الإضافة: ' + error.message);
            return { success: false };
        }
    },
    
    // تعديل عشبة
    updateHerb: async function(id, herbData) {
        try {
            await db.collection('herbs').doc(id).update({
                name: herbData.name,
                category_id: herbData.categoryId || null,
                benefits: herbData.benefits || '—',
                warnings: herbData.warnings || '—',
                harms: herbData.harms || '—',
                usage: herbData.usage || '—',
                notes: herbData.notes || '—',
                image_url: herbData.imageUrl || null,
                updated_at: new Date()
            });
            
            alert(`✅ تم تعديل ${herbData.name}`);
            await this.fetchAllData();
            return { success: true };
        } catch (error) {
            alert('❌ فشل التعديل: ' + error.message);
            return { success: false };
        }
    },
    
    // حذف عشبة
    deleteHerb: async function(id) {
        const herb = window.appState.herbs.find(h => h.id === id);
        if (!confirm(`⚠️ حذف "${herb?.name}"؟`)) return { success: false };
        
        try {
            await db.collection('herbs').doc(id).delete();
            alert(`✅ تم الحذف`);
            await this.fetchAllData();
            return { success: true };
        } catch (error) {
            alert('❌ فشل الحذف: ' + error.message);
            return { success: false };
        }
    }
};

window.FirebaseSync = FirebaseSync;
