// ملف إدارة الموردين - محدث لبنية قاعدة البيانات الجديدة
// يتعامل مع جدول fournisseur حسب البنية الجديدة

/**
 * فئة إدارة الموردين
 * تحتوي على جميع الوظائف المطلوبة لإدارة بيانات الموردين
 */
class SuppliersManager {
    constructor() {
        this.suppliers = []; // قائمة الموردين المحملة
        this.currentFilters = {}; // الفلاتر الحالية
        this.currentPage = 1; // الصفحة الحالية
        this.itemsPerPage = 10; // عدد العناصر في الصفحة
        
        // تهيئة الصفحة عند التحميل
        this.init();
    }

    /**
     * تهيئة الصفحة وتحميل البيانات
     */
    async init() {
        try {
            // تحميل قائمة الموردين
            await this.loadSuppliers();
            
            // إعداد مستمعي الأحداث
            this.setupEventListeners();
            
            // عرض الإحصائيات
            this.updateSuppliersStats();
            
            console.log('✅ تم تهيئة صفحة الموردين بنجاح');
        } catch (error) {
            console.error('خطأ في تهيئة صفحة الموردين:', error);
            if (typeof PharmacyAPI !== 'undefined') {
                PharmacyAPI.showMessage('خطأ في تحميل بيانات الموردين', 'error');
            }
        }
    }

    /**
     * تحميل قائمة الموردين من قاعدة البيانات
     */
    async loadSuppliers(filters = {}) {
        try {
            // عرض مؤشر التحميل
            this.showLoading(true);
            
            // استدعاء API لجلب الموردين
            if (typeof PharmacyAPI !== 'undefined') {
                const result = await PharmacyAPI.getSuppliers(filters);
                
                if (result.success) {
                    this.suppliers = result.data || [];
                } else {
                    throw new Error(result.error || 'فشل في تحميل الموردين');
                }
            } else {
                // استخدام بيانات تجريبية إذا لم يكن API متوفراً
                this.loadSampleData();
            }
            
            this.renderSuppliersTable();
            this.updatePagination();
            this.updateSuppliersStats();
            
        } catch (error) {
            console.error('خطأ في تحميل الموردين:', error);
            
            // استخدام بيانات تجريبية في حالة الفشل
            this.loadSampleData();
            this.renderSuppliersTable();
            this.updatePagination();
            this.updateSuppliersStats();
            
            if (typeof PharmacyAPI !== 'undefined') {
                PharmacyAPI.showMessage('تم تحميل بيانات تجريبية', 'warning');
            }
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * تحميل بيانات تجريبية (fallback)
     */
    loadSampleData() {
        this.suppliers = [
            {
                cod_four: "FOUR001",
                nom_four: "شركة الأدوية المتحدة",
                adr_four: "شارع الاستقلال، الجزائر العاصمة",
                tel_four: "021-123-456",
                email_four: "info@united-pharma.dz"
            },
            {
                cod_four: "FOUR002", 
                nom_four: "مختبرات الشرق الأوسط",
                adr_four: "حي النصر، وهران",
                tel_four: "041-789-012",
                email_four: "contact@middle-east-labs.dz"
            },
            {
                cod_four: "FOUR003",
                nom_four: "شركة نوفو نورديسك الجزائر",
                adr_four: "المنطقة الصناعية، قسنطينة",
                tel_four: "031-345-678",
                email_four: "algeria@novonordisk.com"
            },
            {
                cod_four: "FOUR004",
                nom_four: "مؤسسة الأدوية الجزائرية",
                adr_four: "شارع ديدوش مراد، الجزائر العاصمة",
                tel_four: "021-987-654",
                email_four: "info@algerian-pharma.dz"
            },
            {
                cod_four: "FOUR005",
                nom_four: "شركة فايزر المغرب العربي",
                adr_four: "المنطقة الحرة، عنابة",
                tel_four: "038-456-789",
                email_four: "maghreb@pfizer.com"
            },
            {
                cod_four: "FOUR006",
                nom_four: "مختبرات سانوفي الجزائر",
                adr_four: "حي الرياض، سطيف",
                tel_four: "036-123-789",
                email_four: "algeria@sanofi.com"
            }
        ];
    }

    /**
     * عرض جدول الموردين
     */
    renderSuppliersTable() {
        const tableBody = document.getElementById('suppliers-table-body');
        if (!tableBody) return;

        // مسح المحتوى الموجود
        tableBody.innerHTML = '';

        // حساب العناصر للصفحة الحالية
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageSuppliers = this.suppliers.slice(startIndex, endIndex);

        if (pageSuppliers.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <i class="fas fa-truck text-muted"></i>
                        <p class="mt-2 text-muted">لا يوجد موردين</p>
                    </td>
                </tr>
            `;
            return;
        }

        // عرض الموردين
        pageSuppliers.forEach(supplier => {
            const row = this.createSupplierRow(supplier);
            tableBody.appendChild(row);
        });
    }

    /**
     * إنشاء صف مورد في الجدول
     */
    createSupplierRow(supplier) {
        const row = document.createElement('tr');
        
        // تحديد حالة المورد (افتراضياً نشط)
        const status = 'نشط';
        const statusClass = 'success';
        
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <div class="supplier-avatar me-3">
                        <i class="fas fa-building fa-2x text-primary"></i>
                    </div>
                    <div class="supplier-info">
                        <strong>${supplier.nom_four}</strong>
                        <small class="text-muted d-block">كود: ${supplier.cod_four}</small>
                    </div>
                </div>
            </td>
            <td>
                <div class="contact-info">
                    <div><i class="fas fa-phone me-2"></i>${supplier.tel_four || 'غير محدد'}</div>
                    <div><i class="fas fa-envelope me-2"></i>${supplier.email_four || 'غير محدد'}</div>
                </div>
            </td>
            <td>
                <small class="text-muted">${supplier.adr_four || 'غير محدد'}</small>
            </td>
            <td>
                <span class="badge bg-${statusClass}">${status}</span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="suppliersManager.viewSupplier('${supplier.cod_four}')" title="عرض">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="suppliersManager.editSupplier('${supplier.cod_four}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-info" onclick="suppliersManager.showSupplierOrders('${supplier.cod_four}')" title="الطلبات">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="suppliersManager.deleteSupplier('${supplier.cod_four}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        return row;
    }

    /**
     * تحديث إحصائيات الموردين
     */
    updateSuppliersStats() {
        const totalSuppliers = this.suppliers.length;
        const activeSuppliers = this.suppliers.length; // افتراضياً جميع الموردين نشطين
        const suppliersWithEmail = this.suppliers.filter(s => s.email_four && s.email_four.trim() !== '').length;
        const suppliersWithPhone = this.suppliers.filter(s => s.tel_four && s.tel_four.trim() !== '').length;

        // تحديث العناصر في الواجهة
        this.updateStatElement('total-suppliers', totalSuppliers);
        this.updateStatElement('active-suppliers', activeSuppliers);
        this.updateStatElement('suppliers-with-email', suppliersWithEmail);
        this.updateStatElement('suppliers-with-phone', suppliersWithPhone);
    }

    /**
     * تحديث عنصر إحصائي
     */
    updateStatElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    /**
     * إعداد مستمعي الأحداث
     */
    setupEventListeners() {
        // البحث
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // زر إضافة مورد جديد
        const addSupplierBtn = document.getElementById('add-supplier-btn');
        if (addSupplierBtn) {
            addSupplierBtn.addEventListener('click', () => {
                this.showAddSupplierModal();
            });
        }

        // زر تصدير البيانات
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        // نموذج حفظ المورد
        const saveSupplierBtn = document.getElementById('save-supplier-btn');
        if (saveSupplierBtn) {
            saveSupplierBtn.addEventListener('click', () => {
                this.saveSupplier();
            });
        }
    }

    /**
     * معالجة البحث
     */
    async handleSearch(searchTerm) {
        this.currentFilters.search = searchTerm;
        await this.applyFilters();
    }

    /**
     * تطبيق الفلاتر
     */
    async applyFilters() {
        this.currentPage = 1; // العودة للصفحة الأولى
        
        if (typeof PharmacyAPI !== 'undefined') {
            await this.loadSuppliers(this.currentFilters);
        } else {
            // تطبيق الفلاتر محلياً على البيانات التجريبية
            this.applyLocalFilters();
        }
    }

    /**
     * تطبيق الفلاتر محلياً (للبيانات التجريبية)
     */
    applyLocalFilters() {
        let filteredSuppliers = [...this.suppliers];

        // فلتر البحث
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            filteredSuppliers = filteredSuppliers.filter(s => 
                s.cod_four.toLowerCase().includes(searchTerm) ||
                s.nom_four.toLowerCase().includes(searchTerm) ||
                (s.adr_four && s.adr_four.toLowerCase().includes(searchTerm)) ||
                (s.tel_four && s.tel_four.toLowerCase().includes(searchTerm)) ||
                (s.email_four && s.email_four.toLowerCase().includes(searchTerm))
            );
        }

        // تحديث قائمة الموردين المعروضة
        this.suppliers = filteredSuppliers;
        this.renderSuppliersTable();
        this.updatePagination();
        this.updateSuppliersStats();
    }

    /**
     * عرض نافذة إضافة مورد جديد
     */
    showAddSupplierModal() {
        const modal = document.getElementById('add-supplier-modal');
        if (modal) {
            // مسح النموذج
            this.clearSupplierForm();
            
            // عرض النافذة
            if (typeof $ !== 'undefined') {
                $(modal).modal('show');
            } else if (typeof bootstrap !== 'undefined') {
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();
            } else {
                modal.style.display = 'block';
            }
        }
    }

    /**
     * مسح نموذج المورد
     */
    clearSupplierForm() {
        const form = document.getElementById('supplier-form');
        if (form) {
            form.reset();
            form.dataset.editMode = 'false';
        }
    }

    /**
     * حفظ مورد جديد أو تحديث مورد موجود
     */
    async saveSupplier() {
        try {
            const form = document.getElementById('supplier-form');
            if (!form) return;

            const formData = new FormData(form);
            const supplierData = {
                cod_four: formData.get('cod_four'),
                nom_four: formData.get('nom_four'),
                adr_four: formData.get('adr_four'),
                tel_four: formData.get('tel_four'),
                email_four: formData.get('email_four')
            };

            // التحقق من صحة البيانات
            if (!this.validateSupplierData(supplierData)) {
                return;
            }

            // تحديد ما إذا كان مورد جديد أم تحديث
            const isEdit = form.dataset.editMode === 'true';
            let result;

            if (typeof PharmacyAPI !== 'undefined') {
                if (isEdit) {
                    result = await PharmacyAPI.updateSupplier(supplierData.cod_four, supplierData);
                } else {
                    result = await PharmacyAPI.createSupplier(supplierData);
                }

                if (result.success) {
                    PharmacyAPI.showMessage(
                        isEdit ? 'تم تحديث بيانات المورد بنجاح' : 'تم إضافة المورد بنجاح',
                        'success'
                    );
                    
                    // إغلاق النافذة وإعادة تحميل البيانات
                    this.hideModal('add-supplier-modal');
                    await this.loadSuppliers(this.currentFilters);
                } else {
                    throw new Error(result.error);
                }
            } else {
                // محاكاة الحفظ للبيانات التجريبية
                if (isEdit) {
                    const index = this.suppliers.findIndex(s => s.cod_four === supplierData.cod_four);
                    if (index !== -1) {
                        this.suppliers[index] = { ...this.suppliers[index], ...supplierData };
                    }
                } else {
                    this.suppliers.push(supplierData);
                }
                
                this.hideModal('add-supplier-modal');
                this.renderSuppliersTable();
                this.updatePagination();
                this.updateSuppliersStats();
                
                alert(isEdit ? 'تم تحديث بيانات المورد بنجاح' : 'تم إضافة المورد بنجاح');
            }
        } catch (error) {
            console.error('خطأ في حفظ المورد:', error);
            
            if (typeof PharmacyAPI !== 'undefined') {
                PharmacyAPI.showMessage('خطأ في حفظ بيانات المورد: ' + error.message, 'error');
            } else {
                alert('خطأ في حفظ بيانات المورد: ' + error.message);
            }
        }
    }

    /**
     * إخفاء النافذة المنبثقة
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            if (typeof $ !== 'undefined') {
                $(modal).modal('hide');
            } else if (typeof bootstrap !== 'undefined') {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) bsModal.hide();
            } else {
                modal.style.display = 'none';
            }
        }
    }

    /**
     * التحقق من صحة بيانات المورد
     */
    validateSupplierData(data) {
        if (!data.cod_four || !data.nom_four) {
            const message = 'يرجى ملء جميع الحقول المطلوبة';
            if (typeof PharmacyAPI !== 'undefined') {
                PharmacyAPI.showMessage(message, 'error');
            } else {
                alert(message);
            }
            return false;
        }

        // التحقق من صحة البريد الإلكتروني
        if (data.email_four && !this.validateEmail(data.email_four)) {
            const message = 'يرجى إدخال بريد إلكتروني صحيح';
            if (typeof PharmacyAPI !== 'undefined') {
                PharmacyAPI.showMessage(message, 'error');
            } else {
                alert(message);
            }
            return false;
        }

        return true;
    }

    /**
     * التحقق من صحة البريد الإلكتروني
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * عرض تفاصيل المورد
     */
    viewSupplier(supplierCode) {
        const supplier = this.suppliers.find(s => s.cod_four === supplierCode);
        if (!supplier) return;

        const modalContent = `
            <div class="supplier-details">
                <div class="row">
                    <div class="col-md-6">
                        <h5><i class="fas fa-building"></i> معلومات الشركة</h5>
                        <p><strong>اسم الشركة:</strong> ${supplier.nom_four}</p>
                        <p><strong>كود المورد:</strong> ${supplier.cod_four}</p>
                        <p><strong>العنوان:</strong> ${supplier.adr_four || 'غير محدد'}</p>
                    </div>
                    <div class="col-md-6">
                        <h5><i class="fas fa-phone"></i> معلومات الاتصال</h5>
                        <p><strong>الهاتف:</strong> ${supplier.tel_four || 'غير محدد'}</p>
                        <p><strong>البريد الإلكتروني:</strong> ${supplier.email_four || 'غير محدد'}</p>
                    </div>
                </div>
            </div>
        `;

        // عرض النافذة المنبثقة
        this.showInfoModal('تفاصيل المورد', modalContent);
    }

    /**
     * تعديل مورد موجود
     */
    async editSupplier(supplierCode) {
        const supplier = this.suppliers.find(s => s.cod_four === supplierCode);
        if (!supplier) return;

        // ملء النموذج ببيانات المورد
        this.fillSupplierForm(supplier);
        
        // تعيين وضع التعديل
        const form = document.getElementById('supplier-form');
        if (form) {
            form.dataset.editMode = 'true';
        }

        // عرض النافذة
        this.showAddSupplierModal();
    }

    /**
     * ملء نموذج المورد بالبيانات
     */
    fillSupplierForm(supplier) {
        const form = document.getElementById('supplier-form');
        if (!form) return;

        const codFourInput = form.querySelector('[name="cod_four"]');
        const nomFourInput = form.querySelector('[name="nom_four"]');
        const adrFourInput = form.querySelector('[name="adr_four"]');
        const telFourInput = form.querySelector('[name="tel_four"]');
        const emailFourInput = form.querySelector('[name="email_four"]');

        if (codFourInput) codFourInput.value = supplier.cod_four;
        if (nomFourInput) nomFourInput.value = supplier.nom_four;
        if (adrFourInput) adrFourInput.value = supplier.adr_four || '';
        if (telFourInput) telFourInput.value = supplier.tel_four || '';
        if (emailFourInput) emailFourInput.value = supplier.email_four || '';
    }

    /**
     * عرض طلبات المورد
     */
    showSupplierOrders(supplierCode) {
        const supplier = this.suppliers.find(s => s.cod_four === supplierCode);
        if (!supplier) return;

        // بيانات تجريبية للطلبات
        const ordersContent = `
            <div class="supplier-orders">
                <h5><i class="fas fa-shopping-cart"></i> طلبات المورد - ${supplier.nom_four}</h5>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>رقم الطلب</th>
                                <th>التاريخ</th>
                                <th>الحالة</th>
                                <th>المبلغ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>ORD001</td>
                                <td>2024-01-15</td>
                                <td><span class="badge bg-success">مكتمل</span></td>
                                <td>15,000 دج</td>
                            </tr>
                            <tr>
                                <td>ORD002</td>
                                <td>2024-01-10</td>
                                <td><span class="badge bg-warning">قيد التنفيذ</span></td>
                                <td>8,500 دج</td>
                            </tr>
                            <tr>
                                <td>ORD003</td>
                                <td>2024-01-05</td>
                                <td><span class="badge bg-success">مكتمل</span></td>
                                <td>22,300 دج</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="mt-3">
                    <small class="text-muted">
                        <i class="fas fa-info-circle"></i>
                        هذه بيانات تجريبية. في النظام الحقيقي، سيتم جلب الطلبات من قاعدة البيانات.
                    </small>
                </div>
            </div>
        `;

        this.showInfoModal('طلبات المورد', ordersContent);
    }

    /**
     * حذف مورد
     */
    async deleteSupplier(supplierCode) {
        const supplier = this.suppliers.find(s => s.cod_four === supplierCode);
        if (!supplier) return;

        if (confirm(`هل أنت متأكد من حذف المورد "${supplier.nom_four}"؟`)) {
            try {
                if (typeof PharmacyAPI !== 'undefined') {
                    const result = await PharmacyAPI.deleteSupplier(supplierCode);
                    
                    if (result.success) {
                        PharmacyAPI.showMessage('تم حذف المورد بنجاح', 'success');
                        await this.loadSuppliers(this.currentFilters);
                    } else {
                        throw new Error(result.error);
                    }
                } else {
                    // حذف من البيانات التجريبية
                    const index = this.suppliers.findIndex(s => s.cod_four === supplierCode);
                    if (index !== -1) {
                        this.suppliers.splice(index, 1);
                        this.renderSuppliersTable();
                        this.updatePagination();
                        this.updateSuppliersStats();
                        alert('تم حذف المورد بنجاح');
                    }
                }
            } catch (error) {
                console.error('خطأ في حذف المورد:', error);
                const message = 'خطأ في حذف المورد';
                if (typeof PharmacyAPI !== 'undefined') {
                    PharmacyAPI.showMessage(message, 'error');
                } else {
                    alert(message);
                }
            }
        }
    }

    /**
     * عرض نافذة معلومات
     */
    showInfoModal(title, content) {
        // إنشاء نافذة منبثقة ديناميكية
        const modalHtml = `
            <div class="modal fade" id="info-modal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            ${content}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // إزالة النافذة السابقة إن وجدت
        const existingModal = document.getElementById('info-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // إضافة النافذة الجديدة
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // عرض النافذة
        const modal = document.getElementById('info-modal');
        if (typeof bootstrap !== 'undefined') {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
            
            // إزالة النافذة عند الإغلاق
            modal.addEventListener('hidden.bs.modal', function() {
                modal.remove();
            });
        } else if (typeof $ !== 'undefined') {
            $(modal).modal('show');
            
            // إزالة النافذة عند الإغلاق
            $(modal).on('hidden.bs.modal', function() {
                modal.remove();
            });
        } else {
            modal.style.display = 'block';
        }
    }

    /**
     * تصدير البيانات
     */
    exportData() {
        try {
            // تحويل البيانات إلى CSV
            const csvContent = this.convertToCSV(this.suppliers);
            
            // إنشاء رابط التحميل
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `suppliers_report_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            const message = 'تم تصدير البيانات بنجاح';
            if (typeof PharmacyAPI !== 'undefined') {
                PharmacyAPI.showMessage(message, 'success');
            } else {
                alert(message);
            }
        } catch (error) {
            console.error('خطأ في تصدير البيانات:', error);
            const message = 'خطأ في تصدير البيانات';
            if (typeof PharmacyAPI !== 'undefined') {
                PharmacyAPI.showMessage(message, 'error');
            } else {
                alert(message);
            }
        }
    }

    /**
     * تحويل البيانات إلى تنسيق CSV
     */
    convertToCSV(data) {
        const headers = ['كود المورد', 'اسم الشركة', 'العنوان', 'الهاتف', 'البريد الإلكتروني'];
        const csvRows = [headers.join(',')];
        
        data.forEach(supplier => {
            const row = [
                supplier.cod_four,
                `"${supplier.nom_four}"`,
                `"${supplier.adr_four || ''}"`,
                supplier.tel_four || '',
                supplier.email_four || ''
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }

    /**
     * تحديث ترقيم الصفحات
     */
    updatePagination() {
        const totalPages = Math.ceil(this.suppliers.length / this.itemsPerPage);
        const paginationContainer = document.getElementById('pagination-container');
        
        if (!paginationContainer) return;

        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '<nav><ul class="pagination justify-content-center">';
        
        // زر السابق
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="suppliersManager.goToPage(${this.currentPage - 1})">السابق</a>
            </li>
        `;
        
        // أرقام الصفحات
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="suppliersManager.goToPage(${i})">${i}</a>
                </li>
            `;
        }
        
        // زر التالي
        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="suppliersManager.goToPage(${this.currentPage + 1})">التالي</a>
            </li>
        `;
        
        paginationHTML += '</ul></nav>';
        paginationContainer.innerHTML = paginationHTML;
    }

    /**
     * الانتقال إلى صفحة معينة
     */
    async goToPage(page) {
        const totalPages = Math.ceil(this.suppliers.length / this.itemsPerPage);
        
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderSuppliersTable();
        this.updatePagination();
    }

    /**
     * عرض/إخفاء مؤشر التحميل
     */
    showLoading(show) {
        const loadingElement = document.getElementById('loading-indicator');
        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
        }
    }
}

// إنشاء مثيل من مدير الموردين عند تحميل الصفحة
let suppliersManager;

document.addEventListener('DOMContentLoaded', function() {
    suppliersManager = new SuppliersManager();
});

console.log('✅ تم تحميل ملف إدارة الموردين - محدث لبنية قاعدة البيانات الجديدة');
