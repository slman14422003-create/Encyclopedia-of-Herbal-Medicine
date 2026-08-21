// =====================================================
// إعدادات Firebase - نسخة تعمل 100%
// =====================================================

const firebaseConfig = {
    apiKey: "AIzaSyAkVYaspguYs6gXAOaV7xoiesa38nqgm10",
    authDomain: "semoharbs.firebaseapp.com",
    projectId: "semoharbs",
    storageBucket: "semoharbs.firebasestorage.app",
    messagingSenderId: "497780761661",
    appId: "1:497780761661:web:95ae225c648814c0ed7654"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);

// المصادقة
const auth = firebase.auth();

// قاعدة البيانات
const db = firebase.firestore();

// إعدادات قاعدة البيانات
db.settings({
    ignoreUndefinedProperties: true
});

// أسماء المجموعات
const COLLECTIONS = {
    HERBS: 'herbs',
    CATEGORIES: 'categories'
};

// UID المسؤول
const ADMIN_UID = "OWssFNrZDaZfeSlrLF8ReS8O6LM2";

// تصدير
window.auth = auth;
window.db = db;
window.COLLECTIONS = COLLECTIONS;
window.ADMIN_UID = ADMIN_UID;

console.log('✅ Firebase initialized');
console.log('📁 Project:', firebaseConfig.projectId);
console.log('👑 Admin UID:', ADMIN_UID);
