// ملف إدارة المرضى - محدث لبنية قاعدة البيانات الجديدة
// يتعامل مع جدول patients حسب البنية الجديدة

/**
 * فئة إدارة المرضى
 * تحتوي على جميع الوظائف المطلوبة لإدارة بيانات المرضى
 */
class PatientsManager {
    constructor() {
        this.patients = []; // قائمة المرضى المحملة
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
            // تحميل قائمة المرضى
            await this.loadPatients();
            
            // إعداد مستمعي الأحداث
            this.setupEventListeners();
            
            // عرض الإحصائيات
            this.updatePatientsStats();
            
            console.log('✅ تم تهيئة صفحة المرضى بنجاح');
        } catch (error) {
            console.error('خطأ في تهيئة صفحة المرضى:', error);
            if (typeof PharmacyAPI !== 'undefined') {
                PharmacyAPI.showMessage('خطأ في تحميل بيانات المرضى', 'error');
            }
        }
    }

    /**
     * تحميل قائمة المرضى من قاعدة البيانات
     */
    async loadPatients(filters = {}) {
        try {
            // عرض مؤشر التحميل
            this.showLoading(true);
            
            // استدعاء API لجلب المرضى
            if (typeof PharmacyAPI !== 'undefined') {
                const result = await PharmacyAPI.getPatients(filters);
                
                if (result.success) {
                    this.patients = result.data || [];
                } else {
                    throw new Error(result.error || 'فشل في تحميل المرضى');
                }
            } else {
                // استخدام بيانات تجريبية إذا لم يكن API متوفراً
                this.loadSampleData();
            }
            
            this.renderPatientsTable();
            this.updatePagination();
            this.updatePatientsStats();
            
        } catch (error) {
            console.error('خطأ في تحميل المرضى:', error);
            
            // استخدام بيانات تجريبية في حالة الفشل
            this.loadSampleData();
            this.renderPatientsTable();
            this.updatePagination();
            this.updatePatientsStats();
            
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
        this.patients = [
            {
                id: "PAT001",
                full_name: "أحمد محمد علي",
                date_of_birth: "1985-03-15",
                address: "حي النصر، الجزائر العاصمة"
            },
            {
                id: "PAT002",
                full_name: "فاطمة الزهراء بن عيسى",
                date_of_birth: "1992-07-22",
                address: "حي البدر، وهران"
            },
            {
                id: "PAT003",
                full_name: "محمد الأمين قاسمي",
                date_of_birth: "1978-11-08",
                address: "حي الفرح، قسنطينة"
            },
            {
                id: "PAT004",
                full_name: "خديجة بوعلام",
                date_of_birth: "1990-01-30",
                address: "حي السلام، عنابة"
            },
            {
                id: "PAT005",
                full_name: "يوسف بن صالح",
                date_of_birth: "1965-09-12",
                address: "حي الشهداء، سطيف"
            },
            {
                id: "PAT006",
                full_name: "عائشة مرابط",
                date_of_birth: "1988-04-18",
                address: "حي الأمل، تلمسان"
            }
        ];
    }

    /**
     * عرض جدول المرضى
     */
    renderPatientsTable() {
        const tableBody = document.getElementById('patients-table-body');
        if (!tableBody) return;

        // مسح المحتوى الموجود
        tableBody.innerHTML = '';

        // حساب العناصر للصفحة الحالية
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pagePatients = this.patients.slice(startIndex, endIndex);

        if (pagePatients.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        <i class="fas fa-users text-muted"></i>
                        <p class="mt-2 text-muted">لا يوجد مرضى</p>
                    </td>
                </tr>
            `;
            return;
        }

        // عرض المرضى
        pagePatients.forEach(patient => {
            const row = this.createPatientRow(patient);
            tableBody.appendChild(row);
        });
    }

    /**
     * إنشاء صف مريض في الجدول
     */
    createPatientRow(patient) {
        const row = document.createElement('tr');
        
        // حساب العمر
        const age = this.calculateAge(patient.date_of_birth);
        
        // تنسيق تاريخ الميلاد
        const formattedDate = typeof PharmacyAPI !== 'undefined' ? 
            PharmacyAPI.formatDate(patient.date_of_birth) : 
            new Date(patient.date_of_birth).toLocaleDateString('ar-SA');
        
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    <div class="patient-avatar me-3">
                        <i class="fas fa-user-circle fa-2x text-primary"></i>
                    </div>
                    <div class="patient-info">
                        <strong>${patient.full_name}</strong>
                        <small class="text-muted d-block">معرف: ${patient.id}</small>
                    </div>
                </div>
            </td>
            <td>
                <span class="badge badge-info">${age} سنة</span>
            </td>
            <td>${formattedDate}</td>
            <td>
                <small class="text-muted">${patient.address || 'غير محدد'}</small>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="patientsManager.viewPatient('${patient.id}')" title="عرض">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="patientsManager.editPatient('${patient.id}')" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-info" onclick="patientsManager.showPatientHistory('${patient.id}')" title="السجل الطبي">
                        <i class="fas fa-history"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="patientsManager.deletePatient('${patient.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        return row;
    }

    /**
     * حساب العمر من تاريخ الميلاد
     */
    calculateAge(birthDate) {
        if (!birthDate) return 'غير محدد';
        
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }

    /**
     * تحديث إحصائيات المرضى
     */
    updatePatientsStats() {
        const totalPatients = this.patients.length;
        const malePatients = this.patients.filter(p => this.isMale(p.full_name)).length;
        const femalePatients = totalPatients - malePatients;
        const averageAge = this.calculateAverageAge();

        // تحديث العناصر في الواجهة
        this.updateStatElement('total-patients', totalPatients);
        this.updateStatElement('male-patients', malePatients);
        this.updateStatElement('female-patients', femalePatients);
        this.updateStatElement('average-age', averageAge);
    }

    /**
     * تحديد الجنس من الاسم (تقريبي)
     */
    isMale(fullName) {
        const maleNames = ['أحمد', 'محمد', 'علي', 'حسن', 'حسين', 'عبد', 'يوسف', 'إبراهيم', 'عمر', 'خالد'];
        const femaleNames = ['فاطمة', 'عائشة', 'خديجة', 'زينب', 'مريم', 'سارة', 'نور', 'أمينة', 'ليلى', 'هدى'];
        
        const firstName = fullName.split(' ')[0];
        
        if (maleNames.some(name => firstName.includes(name))) return true;
        if (femaleNames.some(name => firstName.includes(name))) return false;
        
        // افتراضي: ذكر
        return true;
    }

    /**
     * حساب متوسط العمر
     */
    calculateAverageAge() {
        if (this.patients.length === 0) return 0;
        
        const totalAge = this.patients.reduce((sum, patient) => {
            const age = this.calculateAge(patient.date_of_birth);
            return sum + (typeof age === 'number' ? age : 0);
        }, 0);
        
        return Math.round(totalAge / this.patients.length);
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

        // زر إضافة مريض جديد
        const addPatientBtn = document.getElementById('add-patient-btn');
        if (addPatientBtn) {
            addPatientBtn.addEventListener('click', () => {
                this.showAddPatientModal();
            });
        }

        // زر تصدير البيانات
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        // نموذج حفظ المريض
        const savePatientBtn = document.getElementById('save-patient-btn');
        if (savePatientBtn) {
            savePatientBtn.addEventListener('click', () => {
                this.savePatient();
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
            await this.loadPatients(this.currentFilters);
        } else {
            // تطبيق الفلاتر محلياً على البيانات التجريبية
            this.applyLocalFilters();
        }
    }

    /**
     * تطبيق الفلاتر محلياً (للبيانات التجريبية)
     */
    applyLocalFilters() {
        let filteredPatients = [...this.patients];

        // فلتر البحث
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            filteredPatients = filteredPatients.filter(p => 
                p.id.toLowerCase().includes(searchTerm) ||
                p.full_name.toLowerCase().includes(searchTerm) ||
                (p.address && p.address.toLowerCase().includes(searchTerm))
            );
        }

        // تحديث قائمة المرضى المعروضة
        this.patients = filteredPatients;
        this.renderPatientsTable();
        this.updatePagination();
        this.updatePatientsStats();
    }

    /**
     * عرض نافذة إضافة مريض جديد
     */
    showAddPatientModal() {
        const modal = document.getElementById('add-patient-modal');
        if (modal) {
            // مسح النموذج
            this.clearPatientForm();
            
            // عرض النافذة
            if (typeof $ !== 'undefined') {
                $(modal).modal('show');
            } else {
                modal.style.display = 'block';
            }
        }
    }

    /**
     * مسح نموذج المريض
     */
    clearPatientForm() {
        const form = document.getElementById('patient-form');
        if (form) {
            form.reset();
            form.dataset.editMode = 'false';
        }
    }

    /**
     * حفظ مريض جديد أو تحديث مريض موجود
     */
    async savePatient() {
        try {
            const form = document.getElementById('patient-form');
            if (!form) return;

            const formData = new FormData(form);
            const patientData = {
                id: formData.get('id'),
                full_name: formData.get('full_name'),
                date_of_birth: formData.get('date_of_birth'),
                address: formData.get('address')
            };

            // التحقق من صحة البيانات
            if (!this.validatePatientData(patientData)) {
                return;
            }

            // تحديد ما إذا كان مريض جديد أم تحديث
            const isEdit = form.dataset.editMode === 'true';
            let result;

            if (typeof PharmacyAPI !== 'undefined') {
                if (isEdit) {
                    result = await PharmacyAPI.updatePatient(patientData.id, patientData);
                } else {
                    result = await PharmacyAPI.createPatient(patientData);
                }

                if (result.success) {
                    PharmacyAPI.showMessage(
                        isEdit ? 'تم تحديث بيانات المريض بنجاح' : 'تم إضافة المريض بنجاح',
                        'success'
                    );
                    
                    // إغلاق النافذة وإعادة تحميل البيانات
                    this.hideModal('add-patient-modal');
                    await this.loadPatients(this.currentFilters);
                } else {
                    throw new Error(result.error);
                }
            } else {
                // محاكاة الحفظ للبيانات التجريبية
                if (isEdit) {
                    const index = this.patients.findIndex(p => p.id === patientData.id);
                    if (index !== -1) {
                        this.patients[index] = { ...this.patients[index], ...patientData };
                    }
                } else {
                    this.patients.push(patientData);
                }
                
                this.hideModal('add-patient-modal');
                this.renderPatientsTable();
                this.updatePagination();
                this.updatePatientsStats();
                
                alert(isEdit ? 'تم تحديث بيانات المريض بنجاح' : 'تم إضافة المريض بنجاح');
            }
        } catch (error) {
            console.error('خطأ في حفظ المريض:', error);
            
            if (typeof PharmacyAPI !== 'undefined') {
                PharmacyAPI.showMessage('خطأ في حفظ بيانات المريض: ' + error.message, 'error');
            } else {
                alert('خطأ في حفظ بيانات المريض: ' + error.message);
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
     * التحقق من صحة بيانات المريض
     */
    validatePatientData(data) {
        if (!data.id || !data.full_name) {
            const message = 'يرجى ملء جميع الحقول المطلوبة';
            if (typeof PharmacyAPI !== 'undefined') {
                PharmacyAPI.showMessage(message, 'error');
            } else {
                alert(message);
            }
            return false;
        }

        if (data.date_of_birth) {
            const birthDate = new Date(data.date_of_birth);
            const today = new Date();
            
            if (birthDate > today) {
                const message = 'تاريخ الميلاد لا يمكن أن يكون في المستقبل';
                if (typeof PharmacyAPI !== 'undefined') {
                    PharmacyAPI.showMessage(message, 'error');
                } else {
                    alert(message);
                }
                return false;
            }
        }

        return true;
    }

    /**
     * عرض تفاصيل المريض
     */
    viewPatient(patientId) {
        const patient = this.patients.find(p => p.id === patientId);
        if (!patient) return;

        const age = this.calculateAge(patient.date_of_birth);
        const formattedDate = typeof PharmacyAPI !== 'undefined' ? 
            PharmacyAPI.formatDate(patient.date_of_birth) : 
            new Date(patient.date_of_birth).toLocaleDateString('ar-SA');

        const modalContent = `
            <div class="patient-details">
                <div class="row">
                    <div class="col-md-6">
                        <h5><i class="fas fa-user"></i> معلومات شخصية</h5>
                        <p><strong>الاسم الكامل:</strong> ${patient.full_name}</p>
                        <p><strong>معرف المريض:</strong> ${patient.id}</p>
                        <p><strong>تاريخ الميلاد:</strong> ${formattedDate}</p>
                        <p><strong>العمر:</strong> ${age} سنة</p>
                    </div>
                    <div class="col-md-6">
                        <h5><i class="fas fa-map-marker-alt"></i> معلومات الاتصال</h5>
                        <p><strong>العنوان:</strong> ${patient.address || 'غير محدد'}</p>
                    </div>
                </div>
            </div>
        `;

        // عرض النافذة المنبثقة
        this.showInfoModal('تفاصيل المريض', modalContent);
    }

    /**
     * تعديل مريض موجود
     */
    async editPatient(patientId) {
        const patient = this.patients.find(p => p.id === patientId);
        if (!patient) return;

        // ملء النموذج ببيانات المريض
        this.fillPatientForm(patient);
        
        // تعيين وضع التعديل
        const form = document.getElementById('patient-form');
        if (form) {
            form.dataset.editMode = 'true';
        }

        // عرض النافذة
        this.showAddPatientModal();
    }

    /**
     * ملء نموذج المريض بالبيانات
     */
    fillPatientForm(patient) {
        const form = document.getElementById('patient-form');
        if (!form) return;

        const idInput = form.querySelector('[name="id"]');
        const fullNameInput = form.querySelector('[name="full_name"]');
        const dateOfBirthInput = form.querySelector('[name="date_of_birth"]');
        const addressInput = form.querySelector('[name="address"]');

        if (idInput) idInput.value = patient.id;
        if (fullNameInput) fullNameInput.value = patient.full_name;
        if (dateOfBirthInput) dateOfBirthInput.value = patient.date_of_birth;
        if (addressInput) addressInput.value = patient.address || '';
    }

    /**
     * عرض السجل الطبي للمريض
     */
    showPatientHistory(patientId) {
        const patient = this.patients.find(p => p.id === patientId);
        if (!patient) return;

        // بيانات تجريبية للسجل الطبي
        const historyContent = `
            <div class="patient-history">
                <h5><i class="fas fa-history"></i> السجل الطبي - ${patient.full_name}</h5>
                <div class="timeline">
                    <div class="timeline-item">
                        <div class="timeline-date">2024-01-15</div>
                        <div class="timeline-content">
                            <h6>زيارة عامة</h6>
                            <p>فحص دوري - حالة صحية جيدة</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-date">2023-11-20</div>
                        <div class="timeline-content">
                            <h6>وصفة طبية</h6>
                            <p>باراسيتامول 500mg - للصداع</p>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-date">2023-08-10</div>
                        <div class="timeline-content">
                            <h6>تحليل دم</h6>
                            <p>نتائج طبيعية - لا توجد مشاكل</p>
                        </div>
                    </div>
                </div>
                <div class="mt-3">
                    <small class="text-muted">
                        <i class="fas fa-info-circle"></i>
                        هذه بيانات تجريبية. في النظام الحقيقي، سيتم جلب السجل الطبي من قاعدة البيانات.
                    </small>
                </div>
            </div>
        `;

        this.showInfoModal('السجل الطبي', historyContent);
    }

    /**
     * حذف مريض
     */
    async deletePatient(patientId) {
        const patient = this.patients.find(p => p.id === patientId);
        if (!patient) return;

        if (confirm(`هل أنت متأكد من حذف المريض "${patient.full_name}"؟`)) {
            try {
                if (typeof PharmacyAPI !== 'undefined') {
                    const result = await PharmacyAPI.deletePatient(patientId);
                    
                    if (result.success) {
                        PharmacyAPI.showMessage('تم حذف المريض بنجاح', 'success');
                        await this.loadPatients(this.currentFilters);
                    } else {
                        throw new Error(result.error);
                    }
                } else {
                    // حذف من البيانات التجريبية
                    const index = this.patients.findIndex(p => p.id === patientId);
                    if (index !== -1) {
                        this.patients.splice(index, 1);
                        this.renderPatientsTable();
                        this.updatePagination();
                        this.updatePatientsStats();
                        alert('تم حذف المريض بنجاح');
                    }
                }
            } catch (error) {
                console.error('خطأ في حذف المريض:', error);
                const message = 'خطأ في حذف المريض';
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
                            <button type="button" class="close" data-dismiss="modal">
                                <span>&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            ${content}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">إغلاق</button>
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
        if (typeof $ !== 'undefined') {
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
            const csvContent = this.convertToCSV(this.patients);
            
            // إنشاء رابط التحميل
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `patients_report_${new Date().toISOString().split('T')[0]}.csv`);
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
        const headers = ['معرف المريض', 'الاسم الكامل', 'تاريخ الميلاد', 'العمر', 'العنوان'];
        const csvRows = [headers.join(',')];
        
        data.forEach(patient => {
            const age = this.calculateAge(patient.date_of_birth);
            const row = [
                patient.id,
                `"${patient.full_name}"`,
                patient.date_of_birth,
                age,
                `"${patient.address || ''}"`
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }

    /**
     * تحديث ترقيم الصفحات
     */
    updatePagination() {
        const totalPages = Math.ceil(this.patients.length / this.itemsPerPage);
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
                <a class="page-link" href="#" onclick="patientsManager.goToPage(${this.currentPage - 1})">السابق</a>
            </li>
        `;
        
        // أرقام الصفحات
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="patientsManager.goToPage(${i})">${i}</a>
                </li>
            `;
        }
        
        // زر التالي
        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="patientsManager.goToPage(${this.currentPage + 1})">التالي</a>
            </li>
        `;
        
        paginationHTML += '</ul></nav>';
        paginationContainer.innerHTML = paginationHTML;
    }

    /**
     * الانتقال إلى صفحة معينة
     */
    async goToPage(page) {
        const totalPages = Math.ceil(this.patients.length / this.itemsPerPage);
        
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderPatientsTable();
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

// إنشاء مثيل من مدير المرضى عند تحميل الصفحة
let patientsManager;

document.addEventListener('DOMContentLoaded', function() {
    patientsManager = new PatientsManager();
});

console.log('✅ تم تحميل ملف إدارة المرضى - محدث لبنية قاعدة البيانات الجديدة');
