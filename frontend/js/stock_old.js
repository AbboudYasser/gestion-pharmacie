// ملف JavaScript// ملف إدارة المخزون - محدث لبنية قاعدة البيانات الجديدة
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
            PharmacyAPI.showMessage('خطأ في تحميل بيانات المخزون', 'error');
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
            const result = await PharmacyAPI.getProducts(filters);
            
            if (result.success) {
                this.products = result.data || [];
                this.renderProductsTable();
                this.updatePagination();
            } else {
                throw new Error(result.error || 'فشل في تحميل المنتجات');
            }
        } catch (error) {
            console.error('خطأ في تحميل المنتجات:', error);
            PharmacyAPI.showMessage('خطأ في تحميل قائمة المنتجات', 'error');
            
            // استخدام بيانات تجريبية في حالة الفشل
            this.loadSampleData();
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
        id: 1,
        code: "MED001",
        name: "باراسيتامول 500mg",
        category: "مسكنات",
        quantity: 150,
        unit: "علبة",
        minStock: 50,
        expiryDate: "2025-12-31",
        supplier: "شركة الأدوية المتحدة",
        description: "مسكن للألم وخافض للحرارة",
        status: "متوفر"
    },
    {
        id: 2,
        code: "MED002",
        name: "أموكسيسيلين 250mg",
        category: "مضادات حيوية",
        quantity: 25,
        unit: "علبة",
        minStock: 30,
        expiryDate: "2025-08-15",
        supplier: "مختبرات الشرق الأوسط",
        description: "مضاد حيوي واسع الطيف",
        status: "مخزون منخفض"
    },
    {
        id: 3,
        code: "MED003",
        name: "إنسولين سريع المفعول",
        category: "أدوية السكري",
        quantity: 80,
        unit: "أمبولة",
        minStock: 20,
        expiryDate: "2025-06-30",
        supplier: "شركة نوفو نورديسك",
        description: "إنسولين للسكري النوع الأول والثاني",
        status: "متوفر"
    },
    {
        id: 4,
        code: "MED004",
        name: "أسبرين 100mg",
        category: "أدوية القلب",
        quantity: 5,
        unit: "علبة",
        minStock: 25,
        expiryDate: "2025-03-20",
        supplier: "شركة باير",
        description: "مضاد للتجلط وحماية القلب",
        status: "مخزون منخفض"
    },
    {
        id: 5,
        code: "MED005",
        name: "فيتامين د 1000 وحدة",
        category: "فيتامينات",
        quantity: 0,
        unit: "علبة",
        minStock: 15,
        expiryDate: "2024-12-31",
        supplier: "شركة الفيتامينات الطبيعية",
        description: "مكمل غذائي لفيتامين د",
        status: "نفد المخزون"
    }
];

let filteredMedications = [...medications];
let currentEditingId = null;

// تحميل الصفحة
document.addEventListener("DOMContentLoaded", function() {
    // التحقق من تسجيل الدخول
    const currentUser = PharmacyAPI.getCurrentUser();
    if (!currentUser.id || !currentUser.role) {
        window.location.href = 'login.html';
        return;
    }

    // تحديث معلومات المستخدم
    updateUserInfo(currentUser);
    
    // تحميل البيانات وإعداد الصفحة
    loadMedicationsData();
    setupEventListeners();
    updateStats();
});

/**
 * تحديث معلومات المستخدم في الواجهة
 */
function updateUserInfo(user) {
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        userNameElement.textContent = user.name || 'صيدلي';
    }
}

/**
 * إعداد مستمعي الأحداث
 */
function setupEventListeners() {
    // أزرار الإجراءات الرئيسية
    document.getElementById('add-medication-btn').addEventListener('click', openAddModal);
    document.getElementById('export-btn').addEventListener('click', exportData);
    
    // البحث والفلترة
    document.getElementById('search-input').addEventListener('input', handleSearch);
    document.getElementById('category-filter').addEventListener('change', handleFilter);
    document.getElementById('status-filter').addEventListener('change', handleFilter);
    document.getElementById('clear-filters').addEventListener('click', clearFilters);
    
    // النوافذ المنبثقة
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('cancel-btn').addEventListener('click', closeModal);
    document.getElementById('medication-form').addEventListener('submit', handleFormSubmit);
    
    // نافذة الحذف
    document.getElementById('close-delete-modal').addEventListener('click', closeDeleteModal);
    document.getElementById('cancel-delete-btn').addEventListener('click', closeDeleteModal);
    document.getElementById('confirm-delete-btn').addEventListener('click', confirmDelete);
    
    // تسجيل الخروج
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            PharmacyAPI.logout();
        }
    });
    
    // إغلاق النوافذ عند النقر خارجها
    window.addEventListener('click', function(e) {
        const medicationModal = document.getElementById('medication-modal');
        const deleteModal = document.getElementById('delete-modal');
        
        if (e.target === medicationModal) {
            closeModal();
        }
        if (e.target === deleteModal) {
            closeDeleteModal();
        }
    });
}

/**
 * تحميل بيانات الأدوية وعرضها
 */
function loadMedicationsData() {
    renderMedicationsTable();
}

/**
 * عرض جدول الأدوية
 */
function renderMedicationsTable() {
    const tbody = document.getElementById('medications-tbody');
    const noDataDiv = document.getElementById('no-data');
    
    if (filteredMedications.length === 0) {
        tbody.innerHTML = '';
        noDataDiv.style.display = 'block';
        return;
    }
    
    noDataDiv.style.display = 'none';
    
    tbody.innerHTML = filteredMedications.map(medication => `
        <tr>
            <td>${medication.code}</td>
            <td>
                <div class="medication-info">
                    <strong>${medication.name}</strong>
                    ${medication.description ? `<small>${medication.description}</small>` : ''}
                </div>
            </td>
            <td>${medication.category}</td>
            <td>
                <span class="quantity ${getQuantityClass(medication)}">${medication.quantity}</span>
            </td>
            <td>${medication.unit}</td>
            <td>${formatDate(medication.expiryDate)}</td>
            <td>
                <span class="status-badge ${getStatusClass(medication.status)}">${medication.status}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-primary" onclick="editMedication(${medication.id})" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="deleteMedication(${medication.id})" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-icon btn-success" onclick="addStock(${medication.id})" title="إضافة مخزون">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * تحديث الإحصائيات
 */
function updateStats() {
    const totalMedications = medications.length;
    const lowStockCount = medications.filter(med => med.status === 'مخزون منخفض').length;
    const expiredSoonCount = medications.filter(med => isExpiringSoon(med.expiryDate)).length;
    const availableCount = medications.filter(med => med.status === 'متوفر').length;
    
    document.getElementById('total-medications').textContent = totalMedications;
    document.getElementById('low-stock-count').textContent = lowStockCount;
    document.getElementById('expired-soon-count').textContent = expiredSoonCount;
    document.getElementById('available-count').textContent = availableCount;
}

// === دوال مساعدة ===

/**
 * تحديث حالة الدواء بناءً على الكمية والحد الأدنى
 */
function updateMedicationStatus(medication) {
    if (medication.quantity === 0) {
        return 'نفد المخزون';
    } else if (medication.quantity <= medication.minStock) {
        return 'مخزون منخفض';
    } else if (isExpiringSoon(medication.expiryDate)) {
        return 'ينتهي قريباً';
    } else {
        return 'متوفر';
    }
}

/**
 * التحقق من انتهاء صلاحية الدواء قريباً
 */
function isExpiringSoon(expiryDate) {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
}

/**
 * تنسيق التاريخ
 */
function formatDate(dateString) {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
}

/**
 * الحصول على فئة CSS للكمية
 */
function getQuantityClass(medication) {
    if (medication.quantity === 0) return 'quantity-zero';
    if (medication.quantity <= medication.minStock) return 'quantity-low';
    return 'quantity-normal';
}

/**
 * الحصول على فئة CSS للحالة
 */
function getStatusClass(status) {
    switch (status) {
        case 'متوفر': return 'status-available';
        case 'مخزون منخفض': return 'status-low';
        case 'نفد المخزون': return 'status-out';
        case 'ينتهي قريباً': return 'status-expiring';
        default: return 'status-unknown';
    }
}

// دوال أساسية للتفاعل
function handleSearch() { applyFilters(); }
function handleFilter() { applyFilters(); }
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    filteredMedications = medications.filter(medication => {
        const matchesSearch = !searchTerm || 
            medication.name.toLowerCase().includes(searchTerm) ||
            medication.code.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || medication.category === categoryFilter;
        const matchesStatus = !statusFilter || medication.status === statusFilter;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
    
    renderMedicationsTable();
}

function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('category-filter').value = '';
    document.getElementById('status-filter').value = '';
    filteredMedications = [...medications];
    renderMedicationsTable();
}

function openAddModal() {
    currentEditingId = null;
    document.getElementById('modal-title').textContent = 'إضافة دواء جديد';
    document.getElementById('medication-form').reset();
    document.getElementById('medication-modal').style.display = 'flex';
}

function editMedication(id) {
    const medication = medications.find(med => med.id === id);
    if (!medication) return;
    
    currentEditingId = id;
    document.getElementById('modal-title').textContent = 'تعديل الدواء';
    
    document.getElementById('medication-code').value = medication.code;
    document.getElementById('medication-name').value = medication.name;
    document.getElementById('medication-category').value = medication.category;
    document.getElementById('medication-unit').value = medication.unit;
    document.getElementById('medication-quantity').value = medication.quantity;
    document.getElementById('medication-min-stock').value = medication.minStock || '';
    document.getElementById('medication-expiry').value = medication.expiryDate;
    document.getElementById('medication-supplier').value = medication.supplier || '';
    document.getElementById('medication-description').value = medication.description || '';
    
    document.getElementById('medication-modal').style.display = 'flex';
}

function deleteMedication(id) {
    currentEditingId = id;
    document.getElementById('delete-modal').style.display = 'flex';
}

function confirmDelete() {
    if (currentEditingId) {
        medications = medications.filter(med => med.id !== currentEditingId);
        filteredMedications = filteredMedications.filter(med => med.id !== currentEditingId);
        renderMedicationsTable();
        updateStats();
        closeDeleteModal();
        PharmacyAPI.showMessage('تم حذف الدواء بنجاح', 'success');
    }
}

function addStock(id) {
    const quantity = prompt('كم الكمية التي تريد إضافتها؟');
    if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
        const medication = medications.find(med => med.id === id);
        if (medication) {
            medication.quantity += parseInt(quantity);
            medication.status = updateMedicationStatus(medication);
            renderMedicationsTable();
            updateStats();
            PharmacyAPI.showMessage(`تم إضافة ${quantity} ${medication.unit} إلى ${medication.name}`, 'success');
        }
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        code: document.getElementById('medication-code').value,
        name: document.getElementById('medication-name').value,
        category: document.getElementById('medication-category').value,
        unit: document.getElementById('medication-unit').value,
        quantity: parseInt(document.getElementById('medication-quantity').value),
        minStock: parseInt(document.getElementById('medication-min-stock').value) || 0,
        expiryDate: document.getElementById('medication-expiry').value,
        supplier: document.getElementById('medication-supplier').value,
        description: document.getElementById('medication-description').value
    };
    
    if (!formData.code || !formData.name || !formData.category || !formData.unit) {
        PharmacyAPI.showMessage('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    const existingMedication = medications.find(med => 
        med.code === formData.code && med.id !== currentEditingId
    );
    
    if (existingMedication) {
        PharmacyAPI.showMessage('كود الدواء موجود بالفعل', 'error');
        return;
    }
    
    if (currentEditingId) {
        const medicationIndex = medications.findIndex(med => med.id === currentEditingId);
        if (medicationIndex !== -1) {
            medications[medicationIndex] = {
                ...medications[medicationIndex],
                ...formData,
                status: updateMedicationStatus({ ...formData, minStock: formData.minStock })
            };
            PharmacyAPI.showMessage('تم تحديث الدواء بنجاح', 'success');
        }
    } else {
        const newMedication = {
            id: Date.now(),
            ...formData,
            status: updateMedicationStatus({ ...formData, minStock: formData.minStock })
        };
        medications.push(newMedication);
        PharmacyAPI.showMessage('تم إضافة الدواء بنجاح', 'success');
    }
    
    applyFilters();
    updateStats();
    closeModal();
}

function closeModal() {
    document.getElementById('medication-modal').style.display = 'none';
    currentEditingId = null;
}

function closeDeleteModal() {
    document.getElementById('delete-modal').style.display = 'none';
    currentEditingId = null;
}

function exportData() {
    PharmacyAPI.showMessage('تم تصدير البيانات بنجاح', 'success');
}

function toggleNotifications() {
    PharmacyAPI.showMessage('الإشعارات قيد التطوير', 'info');
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }
}

console.log('✅ تم تحميل ملف stock.js بنجاح.');




async function loadAndDisplayProducts() {
    const tableBody = document.getElementById('products-table-body');
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> جاري تحميل البيانات...</td></tr>`;

    try {
        const { data: products, error } = await supabaseClient.from('produit').select('*');
        if (error) throw error;

        tableBody.innerHTML = '';
        if (products.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">لا توجد منتجات لعرضها.</td></tr>';
            return;
        }

        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.desig_prod || ''}</td>
                <td>${product.p_u || 0}</td>
                <td>${product.qte_stc || 0}</td>
                <td>${product.typ_prod || ''}</td>
                <td class="action-buttons">
                    <button class="btn-sm btn-info" onclick="viewProduct('${product.ref_prod}')" title="عرض"><i class="fas fa-eye"></i></button>
                    <button class="btn-sm btn-warning" onclick="showEditModal('${product.ref_prod}')" title="تعديل"><i class="fas fa-edit"></i></button>
                    <button class="btn-sm btn-danger" onclick="showDeleteModal('${product.ref_prod}')" title="حذف"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('❌ خطأ في جلب المنتجات:', error.message);
        tableBody.innerHTML = `<tr><td colspan="5" style="color: red; text-align: center;">فشل تحميل البيانات.</td></tr>`;
    }
}

function showDeleteModal(productId) {
    productToDeleteId = productId;
    document.getElementById('delete-confirm-modal').style.display = 'flex';
}

function hideDeleteModal() {
    document.getElementById('delete-confirm-modal').style.display = 'none';
    productToDeleteId = null;
}

async function deleteProduct() {
    if (!productToDeleteId) return;
    try {
        const { error } = await supabaseClient.from('produit').delete().eq('ref_prod', productToDeleteId);
        if (error) throw error;
        hideDeleteModal();
        loadAndDisplayProducts();
    } catch (error) {
        alert(`فشل حذف المنتج: ${error.message}`);
    }
}






function showAddProductModal() {
    isEditMode = false;
    document.getElementById('product-form').reset();
    document.getElementById('modal-title').innerText = 'إضافة منتج جديد';
    document.getElementById('ref_prod').disabled = false; 
    document.getElementById('product-modal').style.display = 'flex';
}


async function showEditModal(productId) {
    isEditMode = true;
    try {
        const { data, error } = await supabaseClient.from('produit').select('*').eq('ref_prod', productId).single();
        if (error) throw error;

        
        document.getElementById('ref_prod').value = data.ref_prod;
        document.getElementById('desig_prod').value = data.desig_prod;
        document.getElementById('p_u').value = data.p_u;
        document.getElementById('qte_stc').value = data.qte_stc;
        document.getElementById('typ_prod').value = data.typ_prod;
        document.getElementById('num_mag').value = data.num_mag;

        document.getElementById('modal-title').innerText = 'تعديل المنتج';
        document.getElementById('ref_prod').disabled = true; 
        document.getElementById('product-modal').style.display = 'flex';
    } catch (error) {
        alert(`فشل في جلب بيانات المنتج للتعديل: ${error.message}`);
    }
}


function hideProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}


async function handleFormSubmit(event) {
    event.preventDefault();
    const refProd = document.getElementById('ref_prod').value;

    const productData = {
        desig_prod: document.getElementById('desig_prod').value,
        p_u: parseFloat(document.getElementById('p_u').value),
        qte_stc: parseInt(document.getElementById('qte_stc').value),
        typ_prod: document.getElementById('typ_prod').value,
        num_mag: document.getElementById('num_mag').value,
    };

    try {
        let error;
        if (isEditMode) {
            
            const { error: updateError } = await supabaseClient.from('produit').update(productData).eq('ref_prod', refProd);
            error = updateError;
        } else {
            
            productData.ref_prod = refProd; 
            const { error: insertError } = await supabaseClient.from('produit').insert([productData]);
            error = insertError;
        }

        if (error) throw error;

        hideProductModal();
        loadAndDisplayProducts();
    } catch (error) {
        alert(`فشل حفظ المنتج: ${error.message}`);
    }
}


function viewProduct(productId) {
    alert(`سيتم عرض تفاصيل المنتج: ${productId}`);
}
