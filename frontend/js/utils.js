// ملف الدوال المساعدة المشتركة
// يحتوي على دوال مفيدة يمكن استخدامها في جميع أنحاء التطبيق

// ===== دوال التاريخ والوقت =====

/**
 * تنسيق التاريخ للعرض باللغة العربية
 * @param {string|Date} date - التاريخ المراد تنسيقه
 * @param {string} format - نوع التنسيق ('short', 'long', 'time')
 * @returns {string} التاريخ المنسق
 */
function formatDate(date, format = 'short') {
    if (!date) return 'غير محدد';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'تاريخ غير صحيح';
    
    const options = {
        short: { year: 'numeric', month: '2-digit', day: '2-digit' },
        long: { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        },
        time: { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
        },
        datetime: {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }
    };
    
    return dateObj.toLocaleDateString('ar-SA', options[format] || options.short);
}

/**
 * حساب العمر من تاريخ الميلاد
 * @param {string|Date} birthDate - تاريخ الميلاد
 * @returns {number} العمر بالسنوات
 */
function calculateAge(birthDate) {
    if (!birthDate) return 0;
    
    const today = new Date();
    const birth = new Date(birthDate);
    
    if (isNaN(birth.getTime())) return 0;
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

/**
 * حساب الفرق بين تاريخين
 * @param {string|Date} date1 - التاريخ الأول
 * @param {string|Date} date2 - التاريخ الثاني
 * @param {string} unit - وحدة القياس ('days', 'hours', 'minutes')
 * @returns {number} الفرق بالوحدة المحددة
 */
function dateDifference(date1, date2, unit = 'days') {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffMs = Math.abs(d2 - d1);
    
    const units = {
        days: 1000 * 60 * 60 * 24,
        hours: 1000 * 60 * 60,
        minutes: 1000 * 60,
        seconds: 1000
    };
    
    return Math.floor(diffMs / (units[unit] || units.days));
}

// ===== دوال التحقق من صحة البيانات =====

/**
 * التحقق من صحة رقم الهوية الوطنية الجزائرية
 * @param {string} nationalId - رقم الهوية
 * @returns {boolean} true إذا كان صحيحاً
 */
function validateNationalId(nationalId) {
    if (!nationalId || typeof nationalId !== 'string') return false;
    
    // رقم الهوية الجزائرية يجب أن يكون 18 رقم
    const cleanId = nationalId.replace(/\s/g, '');
    return /^\d{18}$/.test(cleanId);
}

/**
 * التحقق من صحة رقم الهاتف الجزائري
 * @param {string} phone - رقم الهاتف
 * @returns {boolean} true إذا كان صحيحاً
 */
function validatePhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    
    // أرقام الهاتف الجزائرية: +213 أو 0 متبوعة بـ 9 أرقام
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return /^(\+213|0)[5-7]\d{8}$/.test(cleanPhone);
}

/**
 * التحقق من صحة البريد الإلكتروني
 * @param {string} email - البريد الإلكتروني
 * @returns {boolean} true إذا كان صحيحاً
 */
function validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ===== دوال التنسيق والعرض =====

/**
 * تنسيق الأرقام للعرض باللغة العربية
 * @param {number} number - الرقم المراد تنسيقه
 * @param {string} type - نوع التنسيق ('currency', 'decimal', 'percent')
 * @returns {string} الرقم المنسق
 */
function formatNumber(number, type = 'decimal') {
    if (number === null || number === undefined || isNaN(number)) return '0';
    
    const options = {
        currency: { 
            style: 'currency', 
            currency: 'DZD',
            minimumFractionDigits: 2
        },
        decimal: { 
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        },
        percent: { 
            style: 'percent',
            minimumFractionDigits: 1
        }
    };
    
    return new Intl.NumberFormat('ar-DZ', options[type] || options.decimal).format(number);
}

/**
 * اقتطاع النص وإضافة نقاط
 * @param {string} text - النص المراد اقتطاعه
 * @param {number} maxLength - الطول الأقصى
 * @returns {string} النص المقتطع
 */
function truncateText(text, maxLength = 50) {
    if (!text || typeof text !== 'string') return '';
    
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength).trim() + '...';
}

/**
 * تحويل النص إلى slug (للروابط)
 * @param {string} text - النص المراد تحويله
 * @returns {string} النص المحول
 */
function slugify(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// ===== دوال المصفوفات والكائنات =====

/**
 * البحث في مصفوفة من الكائنات
 * @param {Array} array - المصفوفة
 * @param {string} searchTerm - مصطلح البحث
 * @param {Array} fields - الحقول المراد البحث فيها
 * @returns {Array} النتائج المطابقة
 */
function searchArray(array, searchTerm, fields) {
    if (!Array.isArray(array) || !searchTerm || !Array.isArray(fields)) {
        return array || [];
    }
    
    const term = searchTerm.toLowerCase().trim();
    if (!term) return array;
    
    return array.filter(item => {
        return fields.some(field => {
            const value = getNestedValue(item, field);
            if (typeof value === 'string') {
                return value.toLowerCase().includes(term);
            }
            if (Array.isArray(value)) {
                return value.some(v => 
                    typeof v === 'string' && v.toLowerCase().includes(term)
                );
            }
            return false;
        });
    });
}

/**
 * ترتيب مصفوفة من الكائنات
 * @param {Array} array - المصفوفة
 * @param {string} field - الحقل المراد الترتيب حسبه
 * @param {string} direction - اتجاه الترتيب ('asc', 'desc')
 * @returns {Array} المصفوفة مرتبة
 */
function sortArray(array, field, direction = 'asc') {
    if (!Array.isArray(array)) return [];
    
    return [...array].sort((a, b) => {
        const valueA = getNestedValue(a, field);
        const valueB = getNestedValue(b, field);
        
        // التعامل مع القيم الفارغة
        if (valueA === null || valueA === undefined) return 1;
        if (valueB === null || valueB === undefined) return -1;
        
        // التعامل مع التواريخ
        if (valueA instanceof Date && valueB instanceof Date) {
            return direction === 'asc' ? valueA - valueB : valueB - valueA;
        }
        
        // التعامل مع الأرقام
        if (typeof valueA === 'number' && typeof valueB === 'number') {
            return direction === 'asc' ? valueA - valueB : valueB - valueA;
        }
        
        // التعامل مع النصوص
        const strA = String(valueA).toLowerCase();
        const strB = String(valueB).toLowerCase();
        
        if (direction === 'asc') {
            return strA.localeCompare(strB, 'ar');
        } else {
            return strB.localeCompare(strA, 'ar');
        }
    });
}

/**
 * الحصول على قيمة من كائن باستخدام مسار متداخل
 * @param {Object} obj - الكائن
 * @param {string} path - المسار (مثل 'user.profile.name')
 * @returns {*} القيمة
 */
function getNestedValue(obj, path) {
    if (!obj || !path) return undefined;
    
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
}

/**
 * تجميع مصفوفة حسب حقل معين
 * @param {Array} array - المصفوفة
 * @param {string} field - الحقل المراد التجميع حسبه
 * @returns {Object} كائن مجمع
 */
function groupBy(array, field) {
    if (!Array.isArray(array)) return {};
    
    return array.reduce((groups, item) => {
        const key = getNestedValue(item, field);
        const groupKey = key !== undefined ? String(key) : 'undefined';
        
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        
        return groups;
    }, {});
}

// ===== دوال التخزين المحلي =====

/**
 * حفظ بيانات في التخزين المحلي
 * @param {string} key - المفتاح
 * @param {*} value - القيمة
 * @returns {boolean} true إذا تم الحفظ بنجاح
 */
function saveToStorage(key, value) {
    try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
        return true;
    } catch (error) {
        console.error('Error saving to storage:', error);
        return false;
    }
}

/**
 * تحميل بيانات من التخزين المحلي
 * @param {string} key - المفتاح
 * @param {*} defaultValue - القيمة الافتراضية
 * @returns {*} القيمة المحملة أو الافتراضية
 */
function loadFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error loading from storage:', error);
        return defaultValue;
    }
}

/**
 * حذف بيانات من التخزين المحلي
 * @param {string} key - المفتاح
 * @returns {boolean} true إذا تم الحذف بنجاح
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from storage:', error);
        return false;
    }
}

// ===== دوال الواجهة =====

/**
 * عرض رسالة تنبيه
 * @param {string} message - الرسالة
 * @param {string} type - نوع الرسالة ('success', 'error', 'warning', 'info')
 * @param {number} duration - مدة العرض بالميلي ثانية
 */
function showNotification(message, type = 'info', duration = 5000) {
    // إزالة الإشعارات السابقة
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // إنشاء الإشعار الجديد
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // إضافة الأنماط
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: '10000',
        maxWidth: '400px',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        animation: 'slideInRight 0.3s ease-out',
        direction: 'rtl'
    });
    
    // إضافة الإشعار إلى الصفحة
    document.body.appendChild(notification);
    
    // إزالة الإشعار تلقائياً
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }
}

/**
 * الحصول على أيقونة الإشعار حسب النوع
 * @param {string} type - نوع الإشعار
 * @returns {string} فئة الأيقونة
 */
function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

/**
 * عرض مؤشر التحميل
 * @param {boolean} show - إظهار أو إخفاء
 * @param {string} message - رسالة التحميل
 */
function showLoading(show = true, message = 'جاري التحميل...') {
    let loader = document.getElementById('global-loader');
    
    if (show) {
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.innerHTML = `
                <div class="loader-backdrop">
                    <div class="loader-content">
                        <div class="spinner"></div>
                        <p>${message}</p>
                    </div>
                </div>
            `;
            document.body.appendChild(loader);
        }
        loader.style.display = 'flex';
    } else {
        if (loader) {
            loader.style.display = 'none';
        }
    }
}

// ===== دوال أخرى مفيدة =====

/**
 * تأخير التنفيذ (debounce)
 * @param {Function} func - الدالة المراد تأخيرها
 * @param {number} wait - وقت التأخير بالميلي ثانية
 * @returns {Function} الدالة المؤخرة
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * نسخ نص إلى الحافظة
 * @param {string} text - النص المراد نسخه
 * @returns {Promise<boolean>} true إذا تم النسخ بنجاح
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('تم نسخ النص بنجاح', 'success', 2000);
        return true;
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        showNotification('فشل في نسخ النص', 'error', 3000);
        return false;
    }
}

/**
 * تحميل ملف CSV
 * @param {string} content - محتوى الملف
 * @param {string} filename - اسم الملف
 */
function downloadCSV(content, filename = 'data.csv') {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

// تصدير جميع الدوال للاستخدام العام
window.PharmacyUtils = {
    // دوال التاريخ والوقت
    formatDate,
    calculateAge,
    dateDifference,
    
    // دوال التحقق
    validateNationalId,
    validatePhone,
    validateEmail,
    
    // دوال التنسيق
    formatNumber,
    truncateText,
    slugify,
    
    // دوال المصفوفات
    searchArray,
    sortArray,
    getNestedValue,
    groupBy,
    
    // دوال التخزين
    saveToStorage,
    loadFromStorage,
    removeFromStorage,
    
    // دوال الواجهة
    showNotification,
    showLoading,
    
    // دوال أخرى
    debounce,
    copyToClipboard,
    downloadCSV
};

// إضافة أنماط CSS للإشعارات والتحميل
const utilsStyles = document.createElement('style');
utilsStyles.textContent = `
    .notification {
        background: white;
        border-left: 4px solid #007bff;
        color: #333;
        font-family: 'Cairo', sans-serif;
    }
    
    .notification-success {
        border-left-color: #28a745;
        background: #d4edda;
        color: #155724;
    }
    
    .notification-error {
        border-left-color: #dc3545;
        background: #f8d7da;
        color: #721c24;
    }
    
    .notification-warning {
        border-left-color: #ffc107;
        background: #fff3cd;
        color: #856404;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-close {
        background: none;
        border: none;
        cursor: pointer;
        padding: 5px;
        margin-right: 10px;
    }
    
    #global-loader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10001;
    }
    
    .loader-content {
        background: white;
        padding: 30px;
        border-radius: 10px;
        text-align: center;
        font-family: 'Cairo', sans-serif;
    }
    
    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #007bff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 15px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;

document.head.appendChild(utilsStyles);
