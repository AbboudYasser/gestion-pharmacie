// ملف إدارة التكوين والبيئات
// هذا الملف يحدد إعدادات مختلفة حسب البيئة (تطوير، إنتاج، اختبار)

// تحديد البيئة الحالية
// يمكن تحديد البيئة من خلال:
// 1. متغير البيئة NODE_ENV (إذا كان متاحاً)
// 2. فحص الدومين الحالي
// 3. قيمة افتراضية
function detectEnvironment() {
    // فحص إذا كنا في GitHub Pages
    if (window.location.hostname.includes('github.io')) {
        return 'production';
    }
    
    // فحص إذا كنا في localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'development';
    }
    
    // فحص إذا كنا في بيئة اختبار
    if (window.location.hostname.includes('test') || window.location.hostname.includes('staging')) {
        return 'staging';
    }
    
    // افتراضي: إنتاج
    return 'production';
}

// إعدادات البيئات المختلفة
const environments = {
    // بيئة التطوير المحلي
    development: {
        API_BASE_URL: 'http://localhost:5000/api',
        DEBUG: true,
        ENABLE_LOGGING: true,
        CACHE_ENABLED: false,
        MOCK_DATA: false, // استخدام البيانات الحقيقية من الخادم
        FEATURES: {
            OFFLINE_MODE: false,
            REAL_TIME_UPDATES: true,
            ADVANCED_ANALYTICS: true
        }
    },
    
    // بيئة الاختبار/التجريب
    staging: {
        API_BASE_URL: 'https://pharmacy-api-staging.herokuapp.com/api',
        DEBUG: true,
        ENABLE_LOGGING: true,
        CACHE_ENABLED: true,
        MOCK_DATA: false,
        FEATURES: {
            OFFLINE_MODE: false,
            REAL_TIME_UPDATES: true,
            ADVANCED_ANALYTICS: true
        }
    },
    
    // بيئة الإنتاج
    production: {
        API_BASE_URL: 'https://qjh9iecend13.manus.space/api', // الخادم الحالي
        DEBUG: false,
        ENABLE_LOGGING: false,
        CACHE_ENABLED: true,
        MOCK_DATA: true, // استخدام البيانات الوهمية في الإنتاج حتى يتم نشر الخادم
        FEATURES: {
            OFFLINE_MODE: true, // تمكين الوضع غير المتصل في الإنتاج
            REAL_TIME_UPDATES: false,
            ADVANCED_ANALYTICS: false
        }
    }
};

// الحصول على البيئة الحالية
const currentEnvironment = detectEnvironment();

// الحصول على التكوين الحالي
const config = environments[currentEnvironment];

// إضافة معلومات إضافية للتكوين
config.ENVIRONMENT = currentEnvironment;
config.VERSION = '1.0.0';
config.BUILD_DATE = new Date().toISOString();

// دالة للحصول على قيمة تكوين معينة
function getConfig(key, defaultValue = null) {
    return config[key] !== undefined ? config[key] : defaultValue;
}

// دالة للتحقق من تمكين ميزة معينة
function isFeatureEnabled(featureName) {
    return config.FEATURES && config.FEATURES[featureName] === true;
}

// دالة لطباعة معلومات التكوين (للتطوير فقط)
function logConfig() {
    if (config.DEBUG) {
        console.group('🔧 Pharmacy System Configuration');
        console.log('Environment:', config.ENVIRONMENT);
        console.log('API Base URL:', config.API_BASE_URL);
        console.log('Version:', config.VERSION);
        console.log('Debug Mode:', config.DEBUG);
        console.log('Mock Data:', config.MOCK_DATA);
        console.log('Features:', config.FEATURES);
        console.groupEnd();
    }
}

// دالة للتحقق من حالة الاتصال بالخادم
async function checkServerHealth() {
    if (config.MOCK_DATA) {
        return { status: 'mock', message: 'Using mock data' };
    }
    
    try {
        const response = await fetch(`${config.API_BASE_URL}/health`, {
            method: 'GET',
            timeout: 5000 // 5 ثوانٍ timeout
        });
        
        if (response.ok) {
            return { status: 'online', message: 'Server is online' };
        } else {
            return { status: 'error', message: 'Server returned error' };
        }
    } catch (error) {
        return { status: 'offline', message: 'Server is offline or unreachable' };
    }
}

// دالة لتحديث التكوين ديناميكياً (للحالات الطارئة)
function updateConfig(newConfig) {
    Object.assign(config, newConfig);
    
    if (config.DEBUG) {
        console.log('🔄 Configuration updated:', newConfig);
    }
}

// دالة للتبديل إلى وضع البيانات الوهمية
function enableMockMode() {
    updateConfig({ 
        MOCK_DATA: true,
        API_BASE_URL: 'mock://localhost'
    });
    
    if (config.DEBUG) {
        console.warn('⚠️ Switched to mock data mode');
    }
}

// دالة للتبديل إلى الوضع غير المتصل
function enableOfflineMode() {
    updateConfig({
        MOCK_DATA: true,
        FEATURES: {
            ...config.FEATURES,
            OFFLINE_MODE: true,
            REAL_TIME_UPDATES: false
        }
    });
    
    if (config.DEBUG) {
        console.warn('📴 Switched to offline mode');
    }
}

// طباعة التكوين عند تحميل الملف
logConfig();

// تصدير التكوين والدوال للاستخدام في ملفات أخرى
window.PharmacyConfig = {
    // التكوين الأساسي
    ...config,
    
    // الدوال المساعدة
    getConfig,
    isFeatureEnabled,
    checkServerHealth,
    updateConfig,
    enableMockMode,
    enableOfflineMode,
    logConfig,
    
    // معلومات البيئة
    getCurrentEnvironment: () => currentEnvironment,
    getAvailableEnvironments: () => Object.keys(environments)
};

// إضافة مستمع للأخطاء العامة
window.addEventListener('error', function(event) {
    if (config.ENABLE_LOGGING) {
        console.error('🚨 Application Error:', event.error);
    }
});

// إضافة مستمع لأخطاء الشبكة
window.addEventListener('unhandledrejection', function(event) {
    if (config.ENABLE_LOGGING) {
        console.error('🌐 Network Error:', event.reason);
    }
    
    // إذا كان الخطأ متعلق بالشبكة، قم بالتبديل إلى الوضع غير المتصل
    if (event.reason && event.reason.message && event.reason.message.includes('fetch')) {
        enableOfflineMode();
    }
});
