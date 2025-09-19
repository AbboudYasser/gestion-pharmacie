// هذا الملف هو نقطة الاتصال الرئيسية بين الواجهة الأمامية (الموقع الذي تراه) والخادم الخلفي (الذي يوفر البيانات).
// تم تحديثه ليستخدم نظام التكوين المرن والبيانات الوهمية عند الحاجة.

// التأكد من تحميل ملفات التكوين والبيانات الوهمية
if (!window.PharmacyConfig) {
    console.error('❌ Configuration not loaded! Make sure config.js is included before api.js');
}

if (!window.MockData) {
    console.error('❌ Mock data not loaded! Make sure mockData.js is included before api.js');
}

// الحصول على عنوان API من التكوين
const API_BASE_URL = window.PharmacyConfig ? window.PharmacyConfig.API_BASE_URL : 'https://qjh9iecend13.manus.space/api';

// متغيرات عامة لتخزين معلومات المستخدم والتوكن (رمز المصادقة)
let currentUser = null;
let authToken = null;

// وظائف المساعدة لعرض الرسائل وحفظ/تحميل التوكن
function showMessage(message, type = 'info') {
    // هذه الدالة تعرض رسائل للمستخدم (مثل "تم تسجيل الدخول بنجاح" أو "خطأ في الاتصال")
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    document.body.insertBefore(messageDiv, document.body.firstChild);
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

function saveAuthToken(token, user) {
    // هذه الدالة تحفظ التوكن ومعلومات المستخدم في ذاكرة المتصفح المحلية (localStorage)
    // هذا يسمح للمستخدم بالبقاء مسجلاً حتى بعد إغلاق المتصفح.
    authToken = token;
    currentUser = user;
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function loadAuthToken() {
    // هذه الدالة تقوم بتحميل التوكن ومعلومات المستخدم من ذاكرة المتصفح عند فتح الصفحة.
    authToken = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
        currentUser = JSON.parse(userStr);
    }
}

function clearAuthToken() {
    // هذه الدالة تقوم بحذف التوكن ومعلومات المستخدم من ذاكرة المتصفح عند تسجيل الخروج.
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
}

function getAuthHeaders() {
    // هذه الدالة تقوم بإعداد الرؤوس (Headers) لطلبات API، بما في ذلك توكن المصادقة.
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };
}

// وظائف API الرئيسية: هذه الدالة هي المسؤولة عن إرسال جميع الطلبات إلى الخادم الخلفي
async function apiCall(endpoint, method = 'GET', data = null, requireAuth = true) {
    // التحقق من إعدادات التكوين
    const config = window.PharmacyConfig;
    
    // إذا كان وضع البيانات الوهمية مفعل، استخدم البيانات الوهمية
    if (config && config.MOCK_DATA) {
        return await handleMockApiCall(endpoint, method, data);
    }
    
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // إضافة توكن المصادقة إذا كان متوفراً ومطلوباً
        if (requireAuth && authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        const requestConfig = {
            method: method,
            headers: headers
        };
        
        // إضافة البيانات للطلبات POST و PUT
        if (data && (method === 'POST' || method === 'PUT')) {
            requestConfig.body = JSON.stringify(data);
        }
        
        // إرسال الطلب إلى الخادم الخلفي
        const response = await fetch(`${API_BASE_URL}${endpoint}`, requestConfig);
        const result = await response.json();
        
        // التحقق من نجاح الاستجابة
        if (!response.ok) {
            throw new Error(result.message || 'خطأ في الخادم');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        
        // في حالة فشل الاتصال، التبديل إلى البيانات الوهمية
        if (config && config.isFeatureEnabled('OFFLINE_MODE')) {
            console.warn('🔄 Switching to mock data due to network error');
            config.enableMockMode();
            return await handleMockApiCall(endpoint, method, data);
        }
        
        throw error;
    }
}

// دالة للتعامل مع البيانات الوهمية
async function handleMockApiCall(endpoint, method, data) {
    if (!window.MockData) {
        throw new Error('Mock data not available');
    }
    
    const mockData = window.MockData;
    
    // تحليل المسار لتحديد نوع البيانات المطلوبة
    const pathParts = endpoint.split('/').filter(part => part);
    const resource = pathParts[0]; // أول جزء من المسار (مثل 'auth', 'patients', 'prescriptions')
    
    switch (resource) {
        case 'auth':
            if (pathParts[1] === 'login' && method === 'POST') {
                return await mockData.login(data.username, data.password, data.role);
            }
            break;
            
        case 'patients':
            if (method === 'GET') {
                return await mockData.getPatients();
            }
            break;
            
        case 'prescriptions':
            if (method === 'GET') {
                return await mockData.getPrescriptions();
            }
            break;
            
        case 'inventory':
            if (method === 'GET') {
                return await mockData.getMedications();
            }
            break;
            
        case 'reports':
            if (pathParts[1] === 'dashboard') {
                return await mockData.getDashboardStats();
            }
            break;
            
        case 'users':
            if (method === 'GET') {
                return await mockData.getUsers();
            }
            break;
            
        default:
            // للمسارات غير المعرفة، إرجاع استجابة فارغة
            return mockData.createSuccessResponse([], 'لا توجد بيانات متاحة');
    }
    
    // إذا لم يتم العثور على مطابقة، إرجاع خطأ
    throw new Error(`Mock endpoint not implemented: ${method} ${endpoint}`);
}

// وظائف المصادقة (تسجيل الدخول وتسجيل الخروج)
async function login(username, password, role) {
    try {
        // هذه الدالة ترسل طلب تسجيل الدخول إلى الخادم الخلفي.
        const result = await apiCall('/auth/login', 'POST', {
            username: username,
            password: password,
            role: role
        }, false);
        
        if (result.success) {
            saveAuthToken(result.token, result.user);
            return result;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        throw error;
    }
}

async function logout() {
    try {
        // هذه الدالة ترسل طلب تسجيل الخروج إلى الخادم الخلفي وتحذف التوكن.
        // في هذه النسخة المبسطة، لا يوجد endpoint حقيقي لتسجيل الخروج في الخادم الخلفي.
        // لذلك، يمكننا إزالة استدعاء apiCall هنا والاكتفاء بمسح التوكن محليًا.
        // if (authToken) {
        //     await apiCall('/auth/logout', 'POST');
        // }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        clearAuthToken();
        window.location.href = 'login.html'; // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
    }
}

// وظائف API للوصفات، المخزون، الموردين، التقارير، والمستخدمين
// كل هذه الدوال تستخدم دالة apiCall الرئيسية لإرسال الطلبات إلى الخادم الخلفي.
// على سبيل المثال، getPrescriptions ترسل طلب GET إلى /api/prescriptions
async function getPrescriptions(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/prescriptions${queryParams ? '?' + queryParams : ''}`;
    return await apiCall(endpoint);
}

async function getPrescriptionStats() {
    return await apiCall('/prescriptions/stats');
}

async function dispensePrescription(prescriptionId) {
    return await apiCall(`/prescriptions/${prescriptionId}/dispense`, 'PUT');
}

async function getInventory(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/inventory${queryParams ? '?' + queryParams : ''}`;
    return await apiCall(endpoint);
}

async function getInventoryStats() {
    return await apiCall('/inventory/stats');
}

async function getLowStockItems() {
    return await apiCall('/inventory/low-stock');
}

async function getSuppliers(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/suppliers${queryParams ? '?' + queryParams : ''}`;
    return await apiCall(endpoint);
}

async function getPurchaseOrders(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/suppliers/orders${queryParams ? '?' + queryParams : ''}`;
    return await apiCall(endpoint);
}

async function getDashboardStats() {
    return await apiCall('/reports/dashboard');
}

async function getPrescriptionsReport(startDate, endDate) {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/reports/prescriptions${queryParams ? '?' + queryParams : ''}`;
    return await apiCall(endpoint);
}

async function getInventoryReport(category = null) {
    const params = {};
    if (category) params.category = category;
    
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/reports/inventory${queryParams ? '?' + queryParams : ''}`;
    return await apiCall(endpoint);
}

async function getUsers(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/users${queryParams ? '?' + queryParams : ''}`;
    return await apiCall(endpoint);
}

// تحميل التوكن عند تحميل الصفحة لأول مرة
document.addEventListener('DOMContentLoaded', function() {
    loadAuthToken();
});

// تصدير الوظائف للاستخدام العام في باقي ملفات JavaScript
window.PharmacyAPI = {
    login,
    logout,
    getPrescriptions,
    getPrescriptionStats,
    dispensePrescription,
    getInventory,
    getInventoryStats,
    getLowStockItems,
    getSuppliers,
    getPurchaseOrders,
    getDashboardStats,
    getPrescriptionsReport,
    getInventoryReport,
    getUsers,
    showMessage,
    currentUser: () => currentUser,
    authToken: () => authToken
};



