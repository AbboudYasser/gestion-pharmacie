// ملف API موحد للتعامل مع قاعدة البيانات الجديدة
// يحتوي على جميع الوظائف المطلوبة للتفاعل مع Supabase Edge Functions
// محدث ليتوافق مع بنية قاعدة البيانات الجديدة

/**
 * فئة PharmacyAPI - واجهة موحدة للتعامل مع API
 * محدثة لتتوافق مع بنية قاعدة البيانات الجديدة
 */
class PharmacyAPI {
    
    /**
     * إرسال طلب إلى Supabase Edge Function
     * @param {string} functionName اسم الوظيفة
     * @param {object} data البيانات المراد إرسالها
     * @returns {Promise} النتيجة
     */
    static async callFunction(functionName, data = {}) {
        try {
            const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'حدث خطأ في الخادم');
            }

            return { success: true, data: result };
        } catch (error) {
            console.error(`خطأ في ${functionName}:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * دالة عامة لاستدعاء API Handler
     * @param {string} table اسم الجدول
     * @param {string} method العملية (select, insert, update, delete)
     * @param {object} payload البيانات
     * @param {object} match شروط البحث
     * @param {object} filters فلاتر إضافية
     * @param {string} select الحقول المطلوبة
     * @returns {Promise} النتيجة
     */
    static async apiCall(table, method, payload = null, match = null, filters = null, select = null) {
        try {
            const response = await fetch(`${SUPABASE_URL}/functions/v1/api-handler`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    table,
                    method,
                    payload,
                    match,
                    filters,
                    select
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                return { success: true, data: result.data };
            } else {
                return { success: false, error: result.error || 'خطأ غير معروف' };
            }
        } catch (error) {
            console.error(`خطأ في استدعاء API للجدول ${table}:`, error);
            return { success: false, error: 'خطأ في الاتصال بالخادم' };
        }
    }

    /**
     * تسجيل دخول المستخدم
     * @param {string} email البريد الإلكتروني
     * @param {string} password كلمة المرور
     * @returns {Promise} نتيجة تسجيل الدخول
     */
    static async login(email, password) {
        return await this.callFunction('login-user', { email, password });
    }

    /**
     * تعيين كلمة مرور جديدة
     * @param {string} email البريد الإلكتروني
     * @param {string} newPassword كلمة المرور الجديدة
     * @returns {Promise} نتيجة تعيين كلمة المرور
     */
    static async setPassword(email, newPassword) {
        return await this.callFunction('set-password', { email, newPassword });
    }

    /**
     * التحقق من وجود المستخدم
     * @param {string} email البريد الإلكتروني
     * @returns {Promise} بيانات المستخدم
     */
    static async checkUserExists(email) {
        return await this.callFunction('api', { 
            action: 'CHECK_USER_EXISTS', 
            payload: { email } 
        });
    }

    /**
     * الحصول على إحصائيات لوحة التحكم
     * @returns {Promise} الإحصائيات
     */
    static async getDashboardStats() {
        try {
            // الحصول على إحصائيات المنتجات
            const productsResult = await this.apiCall('produit', 'select');
            const products = productsResult.success ? productsResult.data : [];
            
            // الحصول على إحصائيات الموردين
            const suppliersResult = await this.apiCall('fournisseur', 'select');
            const suppliers = suppliersResult.success ? suppliersResult.data : [];
            
            // الحصول على إحصائيات المرضى
            const patientsResult = await this.apiCall('patients', 'select');
            const patients = patientsResult.success ? patientsResult.data : [];
            
            // حساب الإحصائيات
            const stats = {
                totalProducts: products.length,
                lowStockProducts: products.filter(p => p.qte_stc < 10).length,
                outOfStockProducts: products.filter(p => p.qte_stc === 0).length,
                totalSuppliers: suppliers.length,
                totalPatients: patients.length,
                totalValue: products.reduce((sum, p) => sum + (p.p_u * p.qte_stc), 0)
            };
            
            return { success: true, data: stats };
        } catch (error) {
            console.error('خطأ في جلب إحصائيات لوحة التحكم:', error);
            return { success: false, error: 'فشل في جلب الإحصائيات' };
        }
    }

    /**
     * الحصول على عناصر المخزون المنخفض
     * @returns {Promise} قائمة العناصر
     */
    static async getLowStockItems() {
        return await this.getLowStockProducts(10);
    }

    // === إدارة المنتجات (الأدوية) ===

    /**
     * الحصول على قائمة المنتجات
     * @param {object} filters المرشحات (اختيارية)
     * @returns {Promise} قائمة المنتجات
     */
    static async getProducts(filters = {}) {
        return await this.apiCall('produit', 'select', null, null, filters);
    }

    /**
     * إضافة منتج جديد
     * @param {object} productData بيانات المنتج
     * @returns {Promise} نتيجة الإضافة
     */
    static async createProduct(productData) {
        return await this.apiCall('produit', 'insert', productData);
    }

    /**
     * تحديث منتج موجود
     * @param {string} ref_prod مرجع المنتج
     * @param {object} productData البيانات الجديدة
     * @returns {Promise} نتيجة التحديث
     */
    static async updateProduct(ref_prod, productData) {
        return await this.apiCall('produit', 'update', productData, { ref_prod });
    }

    /**
     * حذف منتج
     * @param {string} ref_prod مرجع المنتج
     * @returns {Promise} نتيجة الحذف
     */
    static async deleteProduct(ref_prod) {
        return await this.apiCall('produit', 'delete', null, { ref_prod });
    }

    /**
     * الحصول على المنتجات منخفضة المخزون
     * @param {number} threshold الحد الأدنى للمخزون
     * @returns {Promise} قائمة المنتجات
     */
    static async getLowStockProducts(threshold = 10) {
        return await this.apiCall('produit', 'select', null, null, { 
            low_stock: true, 
            low_stock_threshold: threshold 
        });
    }

    // === إدارة الموردين ===

    /**
     * الحصول على قائمة الموردين
     * @param {object} filters المرشحات (اختيارية)
     * @returns {Promise} قائمة الموردين
     */
    static async getSuppliers(filters = {}) {
        return await this.apiCall('fournisseur', 'select', null, null, filters);
    }

    /**
     * إضافة مورد جديد
     * @param {object} supplierData بيانات المورد
     * @returns {Promise} نتيجة الإضافة
     */
    static async createSupplier(supplierData) {
        return await this.apiCall('fournisseur', 'insert', supplierData);
    }

    /**
     * تحديث مورد موجود
     * @param {string} cod_four كود المورد
     * @param {object} supplierData البيانات الجديدة
     * @returns {Promise} نتيجة التحديث
     */
    static async updateSupplier(cod_four, supplierData) {
        return await this.apiCall('fournisseur', 'update', supplierData, { cod_four });
    }

    /**
     * حذف مورد
     * @param {string} cod_four كود المورد
     * @returns {Promise} نتيجة الحذف
     */
    static async deleteSupplier(cod_four) {
        return await this.apiCall('fournisseur', 'delete', null, { cod_four });
    }

    // === إدارة المرضى ===

    /**
     * الحصول على قائمة المرضى
     * @param {object} filters المرشحات (اختيارية)
     * @returns {Promise} قائمة المرضى
     */
    static async getPatients(filters = {}) {
        return await this.apiCall('patients', 'select', null, null, filters);
    }

    /**
     * إضافة مريض جديد
     * @param {object} patientData بيانات المريض
     * @returns {Promise} نتيجة الإضافة
     */
    static async createPatient(patientData) {
        return await this.apiCall('patients', 'insert', patientData);
    }

    /**
     * تحديث مريض موجود
     * @param {string} id معرف المريض
     * @param {object} patientData البيانات الجديدة
     * @returns {Promise} نتيجة التحديث
     */
    static async updatePatient(id, patientData) {
        return await this.apiCall('patients', 'update', patientData, { id });
    }

    /**
     * حذف مريض
     * @param {string} id معرف المريض
     * @returns {Promise} نتيجة الحذف
     */
    static async deletePatient(id) {
        return await this.apiCall('patients', 'delete', null, { id });
    }

    // === إدارة الخدمات ===

    /**
     * الحصول على قائمة الخدمات
     * @returns {Promise} قائمة الخدمات
     */
    static async getServices() {
        return await this.apiCall('service', 'select');
    }

    /**
     * إضافة خدمة جديدة
     * @param {object} serviceData بيانات الخدمة
     * @returns {Promise} نتيجة الإضافة
     */
    static async createService(serviceData) {
        return await this.apiCall('service', 'insert', serviceData);
    }

    /**
     * الحصول على المستخدمين
     * @param {object} filters المرشحات (اختيارية)
     * @returns {Promise} قائمة المستخدمين
     */
    static async getUsers(filters = {}) {
        return await this.callFunction('api-handler', {
            table: 'users',
            method: 'select',
            select: 'id, email, prenom, nom, role, created_at',
            match: filters
        });
    }

    /**
     * إضافة مستخدم جديد
     * @param {object} userData بيانات المستخدم
     * @returns {Promise} نتيجة الإضافة
     */
    static async addUser(userData) {
        return await this.callFunction('api-handler', {
            table: 'users',
            method: 'insert',
            payload: userData
        });
    }

    /**
     * تحديث بيانات المستخدم
     * @param {number} userId معرف المستخدم
     * @param {object} userData البيانات الجديدة
     * @returns {Promise} نتيجة التحديث
     */
    static async updateUser(userId, userData) {
        return await this.callFunction('api-handler', {
            table: 'users',
            method: 'update',
            payload: userData,
            match: { id: userId }
        });
    }

    /**
     * حذف مستخدم
     * @param {number} userId معرف المستخدم
     * @returns {Promise} نتيجة الحذف
     */
    static async deleteUser(userId) {
        return await this.callFunction('api-handler', {
            table: 'users',
            method: 'delete',
            match: { id: userId }
        });
    }

    /**
     * صرف وصفة طبية
     * @param {number} prescriptionId معرف الوصفة
     * @returns {Promise} نتيجة الصرف
     */
    static async dispensePrescription(prescriptionId) {
        // هذه دالة تجريبية - يجب تطويرها حسب منطق العمل
        return await this.callFunction('api-handler', {
            table: 'prescriptions',
            method: 'update',
            payload: { status: 'مصروفة', dispensed_at: new Date().toISOString() },
            match: { id: prescriptionId }
        });
    }

    /**
     * عرض رسالة للمستخدم
     * @param {string} message الرسالة
     * @param {string} type نوع الرسالة (success, error, warning, info)
     */
    static showMessage(message, type = 'info') {
        // استخدام دالة showNotification من utils.js
        if (window.PharmacyUtils && window.PharmacyUtils.showNotification) {
            window.PharmacyUtils.showNotification(message, type);
        } else {
            // fallback إذا لم تكن utils.js محملة
            alert(message);
        }
    }

    /**
     * تسجيل خروج المستخدم
     */
    static logout() {
        // مسح بيانات المستخدم من التخزين المحلي
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        
        // إعادة توجيه إلى صفحة تسجيل الدخول
        window.location.href = 'login.html';
    }

    /**
     * الحصول على بيانات المستخدم الحالي من التخزين المحلي
     * @returns {object} بيانات المستخدم
     */
    static getCurrentUser() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            return JSON.parse(userData);
        }
        return {
            id: localStorage.getItem('userId'),
            role: localStorage.getItem('userRole'),
            name: localStorage.getItem('userName') || 'مستخدم'
        };
    }

    // === دوال مساعدة جديدة ===

    /**
     * تنسيق التاريخ
     * @param {string} dateString التاريخ
     * @returns {string} التاريخ المنسق
     */
    static formatDate(dateString) {
        if (!dateString) return 'غير محدد';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (error) {
            return 'تاريخ غير صالح';
        }
    }

    /**
     * تنسيق المبلغ المالي
     * @param {number} amount المبلغ
     * @returns {string} المبلغ المنسق
     */
    static formatCurrency(amount) {
        if (typeof amount !== 'number') return '0.00 دج';
        
        return new Intl.NumberFormat('ar-DZ', {
            style: 'currency',
            currency: 'DZD',
            minimumFractionDigits: 2
        }).format(amount);
    }

    /**
     * توليد معرف فريد
     * @param {string} prefix البادئة
     * @returns {string} المعرف الفريد
     */
    static generateId(prefix = '') {
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substr(2, 5);
        return `${prefix}${timestamp}${randomStr}`.toUpperCase();
    }

    /**
     * التحقق من صحة البريد الإلكتروني
     * @param {string} email البريد الإلكتروني
     * @returns {boolean} صحة البريد الإلكتروني
     */
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * التحقق من صحة رقم الهاتف الجزائري
     * @param {string} phone رقم الهاتف
     * @returns {boolean} صحة رقم الهاتف
     */
    static validateAlgerianPhone(phone) {
        const phoneRegex = /^(0)(5|6|7)[0-9]{8}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }
}

// تصدير الفئة للاستخدام العام
window.PharmacyAPI = PharmacyAPI;

console.log("✅ تم تحميل ملف API بنجاح - محدث لبنية قاعدة البيانات الجديدة.");
