// ملف إدارة المخزون - محدث لبنية قاعدة البيانات الجديدة
// يتعامل مع جدول produit وmagasin حسب البنية الجديدة

/**
 * فئة إدارة المخزون
 * تحتوي على جميع الوظائف المطلوبة لإدارة المنتجات والمخزون
 */
class StockManager {
    constructor() {
        this.products = []; // قائمة المنتجات المحملة
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
            // تحميل قائمة المنتجات
            await this.loadProducts();
            
            // تحميل قائمة المخازن للفلترة
            await this.loadWarehouses();
            
            // إعداد مستمعي الأحداث
            this.setupEventListeners();
            
            // عرض الإحصائيات
            this.updateStockStats();
            
            console.log('✅ تم تهيئة صفحة المخزون بنجاح');
        } catch (error) {
            console.error('خطأ في تهيئة صفحة المخزون:', error);
            if (typeof PharmacyAPI !== 'undefined') {
                PharmacyAPI.showMessage('خطأ في تحميل بيانات المخزون', 'error');
            }
        }
    }

    /**
     * تحميل قائمة المنتجات من قاعدة البيانات
     */
    async loadProducts(filters = {}) {
        try {
            // عرض مؤشر التحميل
            this.showLoading(true);
            
            // استدعاء API لجلب المنتجات
            if (typeof PharmacyAPI !== 'undefined') {
                const result = await PharmacyAPI.getProducts(filters);
                
                if (result.success) {
                    this.products = result.data || [];
                } else {
                    throw new Error(result.error || 'فشل في تحميل المنتجات');
                }
            } else {
                // استخدام بيانات تجريبية إذا لم يكن API متوفراً
                this.loadSampleData();
            }
            
            this.renderProductsTable();
            this.updatePagination();
            this.updateStockStats();
            
        } catch (error) {
            console.error('خطأ في تحميل المنتجات:', error);
            
            // استخدام بيانات تجريبية في حالة الفشل
            this.loadSampleData();
            this.renderProductsTable();
            this.updatePagination();
            this.updateStockStats();
            
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
        this.products = [
            {
                ref_prod: "MED001",
                desig_prod: "باراسيتامول 500mg",
                typ_prod: "مسكنات",
                qte_stc: 150,
                p_u: 25.50,
                num_mag: "MAG001"
            },
            {
                ref_prod: "MED002",
                desig_prod: "أموكسيسيلين 250mg",
                typ_prod: "مضادات حيوية",
                qte_stc: 8,
                p_u: 45.00,
                num_mag: "MAG001"
            },
            {
                ref_prod: "MED003",
                desig_prod: "إنسولين سريع المفعول",
                typ_prod: "أدوية السكري",
                qte_stc: 80,
                p_u: 120.00,
                num_mag: "MAG002"
            },
            {
                ref_prod: "MED004",
                desig_prod: "أسبرين 100mg",
                typ_prod: "أدوية القلب",
                qte_stc: 0,
                p_u: 15.75,
                num_mag: "MAG001"
            },
            {
                ref_prod: "MED005",
                desig_prod: "فيتامين د 1000 وحدة",
                typ_prod: "فيتامينات",
                qte_stc: 200,
                p_u: 30.00,
                num_mag: "MAG003"
            }
        ];
    }

    /**
     * تحميل قائمة المخازن
     */
    async loadWarehouses() {
        try {
            if (typeof PharmacyAPI !== 'undefined') {
                const result = await PharmacyAPI.apiCall('magasin', 'select');
                
                if (result.success) {
                    const warehouses = result.data || [];
                    this.populateWarehouseFilter(warehouses);
                }
            } else {
                // بيانات تجريبية للمخازن
                const sampleWarehouses = [
                    { num_mag: "MAG001", stok_ini: 1000, stok_fin: 800 },
                    { num_mag: "MAG002", stok_ini: 500, stok_fin: 450 },
                    { num_mag: "MAG003", stok_ini: 750, stok_fin: 600 }
                ];
                this.populateWarehouseFilter(sampleWarehouses);
            }
        } catch (error) {
            console.error('خطأ في تحميل المخازن:', error);
        }
    }

    /**
     * ملء قائمة المخازن في الفلتر
     */
    populateWarehouseFilter(warehouses) {
        const warehouseSelect = document.getElementById('warehouse-filter');
        if (warehouseSelect) {
            // مسح الخيارات الموجودة
            warehouseSelect.innerHTML = '<option value="">جميع المخازن</option>';
            
            // إضافة المخازن
            warehouses.forEach(warehouse => {
                const option = document.createElement('option');
                option.value = warehouse.num_mag;
                option.textContent = `مخزن ${warehouse.num_mag}`;
                warehouseSelect.appendChild(option);
            });
        }
    }

    /**
     * عرض جدول المنتجات
     */
    renderProductsTable() {
        const tableBody = document.getElementById('products-table-body');
        if (!tableBody) return;

        // مسح المحتوى الموجود
        tableBody.innerHTML = '';

        // حساب العناصر للصفحة الحالية
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageProducts = this.products.slice(startIndex, endIndex);

        if (pageProducts.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4">
                        <i class="fas fa-box-open text-muted"></i>
                        <p class="mt-2 text-muted">لا توجد منتجات</p>
                    </td>
                </tr>
            `;
            return;
        }

        // عرض المنتجات
        pageProducts.forEach(product => {
            const row = this.createProductRow(product);
            tableBody.appendChild(row);
        });
    }

    /**
     * إنشاء صف منتج في الجدول
     */
    createProductRow(product) {
        const row = document.createElement('tr');
        
        // تحديد حالة المخزون
        const stockStatus = this.getStockStatus(product.qte_stc);
        const stockClass = stockStatus.class;
        const stockIcon = stockStatus.icon;
        
        // تنسيق السعر والقيمة الإجمالية
        const unitPrice = typeof PharmacyAPI !== 'undefined' ? 
            PharmacyAPI.formatCurrency(product.p_u) : 
            `${product.p_u.toFixed(2)} دج`;
            
        const totalValue = typeof PharmacyAPI !== 'undefined' ? 
            PharmacyAPI.formatCurrency(product.p_u * product.qte_stc) : 
            `${(product.p_u * product.qte_stc).toFixed(2)} دج`;
        
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <div class="product-info">
                        <strong>${product.ref_prod}</strong>
                        <small class="text-muted d-block">${product.desig_prod}</small>
                    </div>
                </div>
            </td>
            <td>
                <span class="badge badge-secondary">${product.typ_prod || 'غير محدد'}</span>
            </td>
            <td>
                <span class="stock-quantity ${stockClass}">
                    <i class="${stockIcon}"></i>
                    ${product.qte_stc}
                </span>
            </td>
            <td>${unitPrice}</td>
            <td>${totalValue}</td>
            <td>
                <span class="badge badge-info">${product.num_mag || 'غير محدد'}</span>
            </td>
            <td>
                <span class="badge ${stockClass}">
                    ${stockStatus.text}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="stockManager.editProduct('${product.ref_prod}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="stockManager.adjustStock('${product.ref_prod}')" title="تعديل المخزون">
                        <i class="fas fa-plus-minus"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="stockManager.deleteProduct('${product.ref_prod}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        return row;
    }

    /**
     * تحديد حالة المخزون
     */
    getStockStatus(quantity) {
        if (quantity === 0) {
            return {
                class: 'text-danger',
                icon: 'fas fa-times-circle',
                text: 'نفد المخزون'
            };
        } else if (quantity < 10) {
            return {
                class: 'text-warning',
                icon: 'fas fa-exclamation-triangle',
                text: 'مخزون منخفض'
            };
        } else {
            return {
                class: 'text-success',
                icon: 'fas fa-check-circle',
                text: 'متوفر'
            };
        }
    }

    /**
     * تحديث إحصائيات المخزون
     */
    updateStockStats() {
        const totalProducts = this.products.length;
        const lowStockProducts = this.products.filter(p => p.qte_stc < 10).length;
        const outOfStockProducts = this.products.filter(p => p.qte_stc === 0).length;
        const totalValue = this.products.reduce((sum, p) => sum + (p.p_u * p.qte_stc), 0);

        // تحديث العناصر في الواجهة
        this.updateStatElement('total-products', totalProducts);
        this.updateStatElement('low-stock-products', lowStockProducts);
        this.updateStatElement('out-of-stock-products', outOfStockProducts);
        
        const formattedValue = typeof PharmacyAPI !== 'undefined' ? 
            PharmacyAPI.formatCurrency(totalValue) : 
            `${totalValue.toFixed(2)} دج`;
        this.updateStatElement('total-stock-value', formattedValue);
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

        // فلتر نوع المنتج
        const typeFilter = document.getElementById('type-filter');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.handleTypeFilter(e.target.value);
            });
        }

        // فلتر المخزون المنخفض
        const lowStockFilter = document.getElementById('low-stock-filter');
        if (lowStockFilter) {
            lowStockFilter.addEventListener('change', (e) => {
                this.handleLowStockFilter(e.target.checked);
            });
        }

        // فلتر المخزن
        const warehouseFilter = document.getElementById('warehouse-filter');
        if (warehouseFilter) {
            warehouseFilter.addEventListener('change', (e) => {
                this.handleWarehouseFilter(e.target.value);
            });
        }

        // زر إضافة منتج جديد
        const addProductBtn = document.getElementById('add-product-btn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => {
                this.showAddProductModal();
            });
        }

        // زر تصدير البيانات
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        // نموذج حفظ المنتج
        const saveProductBtn = document.getElementById('save-product-btn');
        if (saveProductBtn) {
            saveProductBtn.addEventListener('click', () => {
                this.saveProduct();
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
     * معالجة فلتر نوع المنتج
     */
    async handleTypeFilter(type) {
        if (type) {
            this.currentFilters.typ_prod = type;
        } else {
            delete this.currentFilters.typ_prod;
        }
        await this.applyFilters();
    }

    /**
     * معالجة فلتر المخزون المنخفض
     */
    async handleLowStockFilter(isChecked) {
        if (isChecked) {
            this.currentFilters.low_stock = true;
        } else {
            delete this.currentFilters.low_stock;
        }
        await this.applyFilters();
    }

    /**
     * معالجة فلتر المخزن
     */
    async handleWarehouseFilter(warehouseId) {
        if (warehouseId) {
            this.currentFilters.num_mag = warehouseId;
        } else {
            delete this.currentFilters.num_mag;
        }
        await this.applyFilters();
    }

    /**
     * تطبيق الفلاتر
     */
    async applyFilters() {
        this.currentPage = 1; // العودة للصفحة الأولى
        
        if (typeof PharmacyAPI !== 'undefined') {
            await this.loadProducts(this.currentFilters);
        } else {
            // تطبيق الفلاتر محلياً على البيانات التجريبية
            this.applyLocalFilters();
        }
    }

    /**
     * تطبيق الفلاتر محلياً (للبيانات التجريبية)
     */
    applyLocalFilters() {
        let filteredProducts = [...this.products];

        // فلتر البحث
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            filteredProducts = filteredProducts.filter(p => 
                p.ref_prod.toLowerCase().includes(searchTerm) ||
                p.desig_prod.toLowerCase().includes(searchTerm)
            );
        }

        // فلتر نوع المنتج
        if (this.currentFilters.typ_prod) {
            filteredProducts = filteredProducts.filter(p => 
                p.typ_prod === this.currentFilters.typ_prod
            );
        }

        // فلتر المخزون المنخفض
        if (this.currentFilters.low_stock) {
            filteredProducts = filteredProducts.filter(p => p.qte_stc < 10);
        }

        // فلتر المخزن
        if (this.currentFilters.num_mag) {
            filteredProducts = filteredProducts.filter(p => 
                p.num_mag === this.currentFilters.num_mag
            );
        }

        // تحديث قائمة المنتجات المعروضة
        this.products = filteredProducts;
        this.renderProductsTable();
        this.updatePagination();
        this.updateStockStats();
    }

    /**
     * عرض نافذة إضافة منتج جديد
     */
    showAddProductModal() {
        const modal = document.getElementById('add-product-modal');
        if (modal) {
            // مسح النموذج
            this.clearProductForm();
            
            // عرض النافذة
            if (typeof $ !== 'undefined') {
                $(modal).modal('show');
            } else {
                modal.style.display = 'block';
            }
        }
    }

    /**
     * مسح نموذج المنتج
     */
    clearProductForm() {
        const form = document.getElementById('product-form');
        if (form) {
            form.reset();
            form.dataset.editMode = 'false';
        }
    }

    /**
     * حفظ منتج جديد أو تحديث منتج موجود
     */
    async saveProduct() {
        try {
            const form = document.getElementById('product-form');
            if (!form) return;

            const formData = new FormData(form);
            const productData = {
                ref_prod: formData.get('ref_prod'),
                desig_prod: formData.get('desig_prod'),
                p_u: parseFloat(formData.get('p_u')),
                typ_prod: formData.get('typ_prod'),
                qte_stc: parseInt(formData.get('qte_stc')),
                num_mag: formData.get('num_mag')
            };

            // التحقق من صحة البيانات
            if (!this.validateProductData(productData)) {
                return;
            }

            // تحديد ما إذا كان منتج جديد أم تحديث
            const isEdit = form.dataset.editMode === 'true';
            let result;

            if (typeof PharmacyAPI !== 'undefined') {
                if (isEdit) {
                    result = await PharmacyAPI.updateProduct(productData.ref_prod, productData);
                } else {
                    result = await PharmacyAPI.createProduct(productData);
                }

                if (result.success) {
                    PharmacyAPI.showMessage(
                        isEdit ? 'تم تحديث المنتج بنجاح' : 'تم إضافة المنتج بنجاح',
                        'success'
                    );
                    
                    // إغلاق النافذة وإعادة تحميل البيانات
                    this.hideModal('add-product-modal');
                    await this.loadProducts(this.currentFilters);
                } else {
                    throw new Error(result.error);
                }
            } else {
                // محاكاة الحفظ للبيانات التجريبية
                if (isEdit) {
                    const index = this.products.findIndex(p => p.ref_prod === productData.ref_prod);
                    if (index !== -1) {
                        this.products[index] = { ...this.products[index], ...productData };
                    }
                } else {
                    this.products.push(productData);
                }
                
                this.hideModal('add-product-modal');
                this.renderProductsTable();
                this.updatePagination();
                this.updateStockStats();
                
                alert(isEdit ? 'تم تحديث المنتج بنجاح' : 'تم إضافة المنتج بنجاح');
            }
        } catch (error) {
            console.error('خطأ في حفظ المنتج:', error);
            
            if (typeof PharmacyAPI !== 'undefined') {
                PharmacyAPI.showMessage('خطأ في حفظ المنتج: ' + error.message, 'error');
            } else {
                alert('خطأ في حفظ المنتج: ' + error.message);
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
            } else {
                modal.style.display = 'none';
            }
        }
    }

    /**
     * التحقق من صحة بيانات المنتج
     */
    validateProductData(data) {
        if (!data.ref_prod || !data.desig_prod) {
            const message = 'يرجى ملء جميع الحقول المطلوبة';
            if (typeof PharmacyAPI !== 'undefined') {
                PharmacyAPI.showMessage(message, 'error');
            } else {
                alert(message);
            }
            return false;
        }

        if (data.p_u <= 0) {
            const message = 'يجب أن يكون السعر أكبر من صفر';
            if (typeof PharmacyAPI !== 'undefined') {
                PharmacyAPI.showMessage(message, 'error');
            } else {
                alert(message);
            }
            return false;
        }

        if (data.qte_stc < 0) {
            const message = 'لا يمكن أن تكون الكمية سالبة';
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
     * تعديل منتج موجود
     */
    async editProduct(ref_prod) {
        const product = this.products.find(p => p.ref_prod === ref_prod);
        if (!product) return;

        // ملء النموذج ببيانات المنتج
        this.fillProductForm(product);
        
        // تعيين وضع التعديل
        const form = document.getElementById('product-form');
        if (form) {
            form.dataset.editMode = 'true';
        }

        // عرض النافذة
        this.showAddProductModal();
    }

    /**
     * ملء نموذج المنتج بالبيانات
     */
    fillProductForm(product) {
        const form = document.getElementById('product-form');
        if (!form) return;

        const refProdInput = form.querySelector('[name="ref_prod"]');
        const desigProdInput = form.querySelector('[name="desig_prod"]');
        const puInput = form.querySelector('[name="p_u"]');
        const typProdInput = form.querySelector('[name="typ_prod"]');
        const qteStcInput = form.querySelector('[name="qte_stc"]');
        const numMagInput = form.querySelector('[name="num_mag"]');

        if (refProdInput) refProdInput.value = product.ref_prod;
        if (desigProdInput) desigProdInput.value = product.desig_prod;
        if (puInput) puInput.value = product.p_u;
        if (typProdInput) typProdInput.value = product.typ_prod || '';
        if (qteStcInput) qteStcInput.value = product.qte_stc;
        if (numMagInput) numMagInput.value = product.num_mag || '';
    }

    /**
     * تعديل كمية المخزون
     */
    async adjustStock(ref_prod) {
        const product = this.products.find(p => p.ref_prod === ref_prod);
        if (!product) return;

        const newQuantity = prompt(`الكمية الحالية: ${product.qte_stc}\nأدخل الكمية الجديدة:`, product.qte_stc);
        
        if (newQuantity !== null) {
            const quantity = parseInt(newQuantity);
            
            if (isNaN(quantity) || quantity < 0) {
                const message = 'يرجى إدخال كمية صحيحة';
                if (typeof PharmacyAPI !== 'undefined') {
                    PharmacyAPI.showMessage(message, 'error');
                } else {
                    alert(message);
                }
                return;
            }

            try {
                if (typeof PharmacyAPI !== 'undefined') {
                    const result = await PharmacyAPI.updateProduct(ref_prod, { qte_stc: quantity });
                    
                    if (result.success) {
                        PharmacyAPI.showMessage('تم تحديث كمية المخزون بنجاح', 'success');
                        await this.loadProducts(this.currentFilters);
                    } else {
                        throw new Error(result.error);
                    }
                } else {
                    // تحديث البيانات التجريبية
                    product.qte_stc = quantity;
                    this.renderProductsTable();
                    this.updateStockStats();
                    alert('تم تحديث كمية المخزون بنجاح');
                }
            } catch (error) {
                console.error('خطأ في تحديث المخزون:', error);
                const message = 'خطأ في تحديث المخزون';
                if (typeof PharmacyAPI !== 'undefined') {
                    PharmacyAPI.showMessage(message, 'error');
                } else {
                    alert(message);
                }
            }
        }
    }

    /**
     * حذف منتج
     */
    async deleteProduct(ref_prod) {
        const product = this.products.find(p => p.ref_prod === ref_prod);
        if (!product) return;

        if (confirm(`هل أنت متأكد من حذف المنتج "${product.desig_prod}"؟`)) {
            try {
                if (typeof PharmacyAPI !== 'undefined') {
                    const result = await PharmacyAPI.deleteProduct(ref_prod);
                    
                    if (result.success) {
                        PharmacyAPI.showMessage('تم حذف المنتج بنجاح', 'success');
                        await this.loadProducts(this.currentFilters);
                    } else {
                        throw new Error(result.error);
                    }
                } else {
                    // حذف من البيانات التجريبية
                    const index = this.products.findIndex(p => p.ref_prod === ref_prod);
                    if (index !== -1) {
                        this.products.splice(index, 1);
                        this.renderProductsTable();
                        this.updatePagination();
                        this.updateStockStats();
                        alert('تم حذف المنتج بنجاح');
                    }
                }
            } catch (error) {
                console.error('خطأ في حذف المنتج:', error);
                const message = 'خطأ في حذف المنتج';
                if (typeof PharmacyAPI !== 'undefined') {
                    PharmacyAPI.showMessage(message, 'error');
                } else {
                    alert(message);
                }
            }
        }
    }

    /**
     * تصدير البيانات
     */
    exportData() {
        try {
            // تحويل البيانات إلى CSV
            const csvContent = this.convertToCSV(this.products);
            
            // إنشاء رابط التحميل
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `stock_report_${new Date().toISOString().split('T')[0]}.csv`);
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
        const headers = ['مرجع المنتج', 'اسم المنتج', 'النوع', 'الكمية', 'السعر', 'القيمة الإجمالية', 'المخزن'];
        const csvRows = [headers.join(',')];
        
        data.forEach(product => {
            const row = [
                product.ref_prod,
                `"${product.desig_prod}"`,
                product.typ_prod || '',
                product.qte_stc,
                product.p_u,
                product.p_u * product.qte_stc,
                product.num_mag || ''
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }

    /**
     * تحديث ترقيم الصفحات
     */
    updatePagination() {
        const totalPages = Math.ceil(this.products.length / this.itemsPerPage);
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
                <a class="page-link" href="#" onclick="stockManager.goToPage(${this.currentPage - 1})">السابق</a>
            </li>
        `;
        
        // أرقام الصفحات
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="stockManager.goToPage(${i})">${i}</a>
                </li>
            `;
        }
        
        // زر التالي
        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="stockManager.goToPage(${this.currentPage + 1})">التالي</a>
            </li>
        `;
        
        paginationHTML += '</ul></nav>';
        paginationContainer.innerHTML = paginationHTML;
    }

    /**
     * الانتقال إلى صفحة معينة
     */
    async goToPage(page) {
        const totalPages = Math.ceil(this.products.length / this.itemsPerPage);
        
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderProductsTable();
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

// إنشاء مثيل من مدير المخزون عند تحميل الصفحة
let stockManager;

document.addEventListener('DOMContentLoaded', function() {
    stockManager = new StockManager();
});

console.log('✅ تم تحميل ملف إدارة المخزون - محدث لبنية قاعدة البيانات الجديدة');
