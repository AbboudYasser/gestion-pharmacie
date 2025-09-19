// متغيرات عامة لصفحة المرضى
let currentPatients = [];
let filteredPatients = [];
let currentPage = 1;
let patientsPerPage = 10;
let currentPatientId = null;

// تحميل البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    loadPatients();
    loadPatientsStats();
});

// تحميل قائمة المرضى
async function loadPatients() {
    try {
        showLoading();
        const response = await apiCall('/api/patients', 'GET');
        
        if (response.success) {
            currentPatients = response.patients;
            filteredPatients = [...currentPatients];
            displayPatients();
            updatePagination();
        } else {
            showError('فشل في تحميل قائمة المرضى');
        }
    } catch (error) {
        console.error('خطأ في تحميل المرضى:', error);
        showError('حدث خطأ في تحميل البيانات');
    } finally {
        hideLoading();
    }
}

// تحميل إحصائيات المرضى
async function loadPatientsStats() {
    try {
        // حساب الإحصائيات من البيانات المحملة
        const totalPatients = currentPatients.length;
        
        // حساب المرضى الجدد اليوم
        const today = new Date().toDateString();
        const newPatientsToday = currentPatients.filter(patient => {
            const createdDate = new Date(patient.created_at).toDateString();
            return createdDate === today;
        }).length;
        
        // حساب المرضى الذين لديهم حساسيات
        const allergiesCount = currentPatients.filter(patient => 
            patient.allergies && patient.allergies.length > 0
        ).length;
        
        // تحديث العرض
        document.getElementById('totalPatients').textContent = totalPatients;
        document.getElementById('newPatientsToday').textContent = newPatientsToday;
        document.getElementById('allergiesCount').textContent = allergiesCount;
        
        // يمكن إضافة استدعاء API للحصول على عدد الوصفات النشطة
        document.getElementById('activePrescriptions').textContent = '0';
        
    } catch (error) {
        console.error('خطأ في تحميل الإحصائيات:', error);
    }
}

// عرض قائمة المرضى في الجدول
function displayPatients() {
    const tbody = document.getElementById('patientsTableBody');
    tbody.innerHTML = '';
    
    const startIndex = (currentPage - 1) * patientsPerPage;
    const endIndex = startIndex + patientsPerPage;
    const patientsToShow = filteredPatients.slice(startIndex, endIndex);
    
    patientsToShow.forEach(patient => {
        const row = createPatientRow(patient);
        tbody.appendChild(row);
    });
    
    updatePaginationInfo();
}

// إنشاء صف في جدول المرضى
function createPatientRow(patient) {
    const row = document.createElement('tr');
    
    // حساب العمر
    const age = calculateAge(patient.date_of_birth);
    
    // تنسيق الحساسيات
    const allergiesHtml = patient.allergies && patient.allergies.length > 0 
        ? patient.allergies.map(allergy => `<span class="allergies-badge">${allergy}</span>`).join('')
        : '<span class="text-muted">لا توجد</span>';
    
    // تنسيق تاريخ التسجيل
    const createdDate = new Date(patient.created_at).toLocaleDateString('ar-SA');
    
    row.innerHTML = `
        <td>${patient.national_id}</td>
        <td>${patient.full_name}</td>
        <td>${patient.gender}</td>
        <td>${age} سنة</td>
        <td>${patient.phone}</td>
        <td>${createdDate}</td>
        <td>${allergiesHtml}</td>
        <td>
            <div class="action-buttons">
                <button class="btn btn-sm btn-info" onclick="viewPatientDetails('${patient.id}')" title="عرض التفاصيل">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="editPatient('${patient.id}')" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deletePatient('${patient.id}')" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    
    return row;
}

// حساب العمر من تاريخ الميلاد
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

// البحث في المرضى
function searchPatients() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    filteredPatients = currentPatients.filter(patient => {
        return patient.full_name.toLowerCase().includes(searchTerm) ||
               patient.national_id.includes(searchTerm) ||
               patient.phone.includes(searchTerm);
    });
    
    currentPage = 1;
    displayPatients();
    updatePagination();
}

// تصفية المرضى
function filterPatients() {
    const genderFilter = document.getElementById('genderFilter').value;
    const ageFilter = document.getElementById('ageFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    filteredPatients = currentPatients.filter(patient => {
        // تصفية البحث
        const matchesSearch = patient.full_name.toLowerCase().includes(searchTerm) ||
                            patient.national_id.includes(searchTerm) ||
                            patient.phone.includes(searchTerm);
        
        // تصفية الجنس
        const matchesGender = !genderFilter || patient.gender === genderFilter;
        
        // تصفية العمر
        let matchesAge = true;
        if (ageFilter) {
            const age = calculateAge(patient.date_of_birth);
            switch (ageFilter) {
                case '0-18':
                    matchesAge = age <= 18;
                    break;
                case '19-60':
                    matchesAge = age >= 19 && age <= 60;
                    break;
                case '60+':
                    matchesAge = age > 60;
                    break;
            }
        }
        
        return matchesSearch && matchesGender && matchesAge;
    });
    
    currentPage = 1;
    displayPatients();
    updatePagination();
}

// عرض نافذة إضافة مريض جديد
function showAddPatientModal() {
    document.getElementById('modalTitle').textContent = 'إضافة مريض جديد';
    document.getElementById('patientForm').reset();
    currentPatientId = null;
    document.getElementById('patientModal').classList.add('show');
}

// إغلاق نافذة المريض
function closePatientModal() {
    document.getElementById('patientModal').classList.remove('show');
}

// حفظ بيانات المريض
async function savePatient() {
    try {
        const formData = new FormData(document.getElementById('patientForm'));
        const patientData = {
            national_id: formData.get('nationalId'),
            full_name: formData.get('fullName'),
            date_of_birth: formData.get('dateOfBirth'),
            gender: formData.get('gender'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            emergency_contact: formData.get('emergencyContact'),
            medical_history: formData.get('medicalHistory'),
            insurance_number: formData.get('insuranceNumber'),
            allergies: formData.get('allergies') ? formData.get('allergies').split(',').map(s => s.trim()) : []
        };
        
        // التحقق من البيانات المطلوبة
        if (!patientData.national_id || !patientData.full_name || !patientData.date_of_birth || 
            !patientData.gender || !patientData.phone) {
            showError('يرجى ملء جميع الحقول المطلوبة');
            return;
        }
        
        showLoading();
        
        let response;
        if (currentPatientId) {
            // تحديث مريض موجود
            response = await apiCall(`/api/patients/${currentPatientId}`, 'PUT', patientData);
        } else {
            // إضافة مريض جديد
            response = await apiCall('/api/patients', 'POST', patientData);
        }
        
        if (response.success) {
            showSuccess(response.message);
            closePatientModal();
            loadPatients();
            loadPatientsStats();
        } else {
            showError(response.message);
        }
        
    } catch (error) {
        console.error('خطأ في حفظ المريض:', error);
        showError('حدث خطأ في حفظ البيانات');
    } finally {
        hideLoading();
    }
}

// تعديل مريض
async function editPatient(patientId) {
    try {
        const patient = currentPatients.find(p => p.id === patientId);
        if (!patient) {
            showError('لم يتم العثور على المريض');
            return;
        }
        
        // ملء النموذج ببيانات المريض
        document.getElementById('nationalId').value = patient.national_id;
        document.getElementById('fullName').value = patient.full_name;
        document.getElementById('dateOfBirth').value = patient.date_of_birth;
        document.getElementById('gender').value = patient.gender;
        document.getElementById('phone').value = patient.phone;
        document.getElementById('address').value = patient.address || '';
        document.getElementById('emergencyContact').value = patient.emergency_contact || '';
        document.getElementById('medicalHistory').value = patient.medical_history || '';
        document.getElementById('insuranceNumber').value = patient.insurance_number || '';
        document.getElementById('allergies').value = patient.allergies ? patient.allergies.join(', ') : '';
        
        currentPatientId = patientId;
        document.getElementById('modalTitle').textContent = 'تعديل بيانات المريض';
        document.getElementById('patientModal').classList.add('show');
        
    } catch (error) {
        console.error('خطأ في تحميل بيانات المريض:', error);
        showError('حدث خطأ في تحميل البيانات');
    }
}

// عرض تفاصيل المريض
async function viewPatientDetails(patientId) {
    try {
        const patient = currentPatients.find(p => p.id === patientId);
        if (!patient) {
            showError('لم يتم العثور على المريض');
            return;
        }
        
        // ملء بيانات المريض
        document.getElementById('detailNationalId').textContent = patient.national_id;
        document.getElementById('detailFullName').textContent = patient.full_name;
        document.getElementById('detailGender').textContent = patient.gender;
        document.getElementById('detailDateOfBirth').textContent = patient.date_of_birth;
        document.getElementById('detailAge').textContent = calculateAge(patient.date_of_birth) + ' سنة';
        document.getElementById('detailPhone').textContent = patient.phone;
        document.getElementById('detailEmergencyContact').textContent = patient.emergency_contact || 'غير محدد';
        document.getElementById('detailInsuranceNumber').textContent = patient.insurance_number || 'غير محدد';
        document.getElementById('detailAddress').textContent = patient.address || 'غير محدد';
        document.getElementById('detailAllergies').textContent = patient.allergies && patient.allergies.length > 0 
            ? patient.allergies.join(', ') : 'لا توجد حساسيات معروفة';
        document.getElementById('detailMedicalHistory').textContent = patient.medical_history || 'لا يوجد تاريخ مرضي مسجل';
        
        currentPatientId = patientId;
        
        // تحميل وصفات المريض
        loadPatientPrescriptions(patientId);
        
        document.getElementById('patientDetailsModal').classList.add('show');
        
    } catch (error) {
        console.error('خطأ في عرض تفاصيل المريض:', error);
        showError('حدث خطأ في تحميل التفاصيل');
    }
}

// تحميل وصفات المريض
async function loadPatientPrescriptions(patientId) {
    try {
        const response = await apiCall(`/api/patients/${patientId}/prescriptions`, 'GET');
        
        if (response.success) {
            const prescriptionsContainer = document.getElementById('patientPrescriptions');
            
            if (response.prescriptions.length === 0) {
                prescriptionsContainer.innerHTML = '<p class="text-muted">لا توجد وصفات طبية مسجلة لهذا المريض</p>';
                return;
            }
            
            prescriptionsContainer.innerHTML = response.prescriptions.map(prescription => `
                <div class="prescription-item">
                    <div class="prescription-header">
                        <h4>وصفة رقم: ${prescription.id}</h4>
                        <span class="prescription-status status-${prescription.status}">${prescription.status}</span>
                    </div>
                    <div class="prescription-details">
                        <p><strong>الطبيب:</strong> ${prescription.doctor_name}</p>
                        <p><strong>التاريخ:</strong> ${new Date(prescription.created_date).toLocaleDateString('ar-SA')}</p>
                        <p><strong>التشخيص:</strong> ${prescription.diagnosis}</p>
                        <div class="medications">
                            <strong>الأدوية:</strong>
                            <ul>
                                ${prescription.medications.map(med => `
                                    <li>${med.name} - ${med.dosage} (${med.quantity} ${med.unit})</li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('خطأ في تحميل وصفات المريض:', error);
        document.getElementById('patientPrescriptions').innerHTML = '<p class="text-danger">حدث خطأ في تحميل الوصفات</p>';
    }
}

// إغلاق نافذة تفاصيل المريض
function closePatientDetailsModal() {
    document.getElementById('patientDetailsModal').classList.remove('show');
}

// تعديل المريض الحالي من نافذة التفاصيل
function editCurrentPatient() {
    closePatientDetailsModal();
    editPatient(currentPatientId);
}

// حذف مريض
async function deletePatient(patientId) {
    if (!confirm('هل أنت متأكد من حذف هذا المريض؟ لا يمكن التراجع عن هذا الإجراء.')) {
        return;
    }
    
    try {
        showLoading();
        
        // في الوقت الحالي، سنقوم بحذف المريض من القائمة المحلية فقط
        // يمكن إضافة API endpoint للحذف لاحقاً
        currentPatients = currentPatients.filter(p => p.id !== patientId);
        filteredPatients = filteredPatients.filter(p => p.id !== patientId);
        
        showSuccess('تم حذف المريض بنجاح');
        displayPatients();
        updatePagination();
        loadPatientsStats();
        
    } catch (error) {
        console.error('خطأ في حذف المريض:', error);
        showError('حدث خطأ في حذف المريض');
    } finally {
        hideLoading();
    }
}

// تصدير قائمة المرضى
function exportPatients() {
    try {
        const csvContent = generatePatientsCSV();
        downloadCSV(csvContent, 'patients_list.csv');
        showSuccess('تم تصدير قائمة المرضى بنجاح');
    } catch (error) {
        console.error('خطأ في تصدير البيانات:', error);
        showError('حدث خطأ في تصدير البيانات');
    }
}

// إنشاء ملف CSV للمرضى
function generatePatientsCSV() {
    const headers = ['رقم الهوية', 'الاسم الكامل', 'الجنس', 'تاريخ الميلاد', 'رقم الهاتف', 'العنوان', 'الحساسيات'];
    const rows = filteredPatients.map(patient => [
        patient.national_id,
        patient.full_name,
        patient.gender,
        patient.date_of_birth,
        patient.phone,
        patient.address || '',
        patient.allergies ? patient.allergies.join('; ') : ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

// تحديث المرضى
function refreshPatients() {
    loadPatients();
    loadPatientsStats();
    showSuccess('تم تحديث البيانات');
}

// إدارة التبويبات في نافذة التفاصيل
function showTab(tabName) {
    // إخفاء جميع التبويبات
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    // إزالة الحالة النشطة من جميع الأزرار
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // إظهار التبويب المحدد
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
}

// إدارة التصفح
function updatePagination() {
    const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
    const pageNumbers = document.getElementById('pageNumbers');
    
    pageNumbers.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageLink.textContent = i;
        pageLink.onclick = (e) => {
            e.preventDefault();
            currentPage = i;
            displayPatients();
            updatePagination();
        };
        pageNumbers.appendChild(pageLink);
    }
    
    // تحديث أزرار التنقل
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages;
}

function updatePaginationInfo() {
    const startIndex = (currentPage - 1) * patientsPerPage + 1;
    const endIndex = Math.min(currentPage * patientsPerPage, filteredPatients.length);
    
    document.getElementById('showingStart').textContent = startIndex;
    document.getElementById('showingEnd').textContent = endIndex;
    document.getElementById('totalRecords').textContent = filteredPatients.length;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayPatients();
        updatePagination();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayPatients();
        updatePagination();
    }
}

// وظائف مساعدة للتحميل والرسائل
function showLoading() {
    document.body.classList.add('loading');
}

function hideLoading() {
    document.body.classList.remove('loading');
}

function showSuccess(message) {
    // يمكن استخدام مكتبة للإشعارات مثل toastr
    alert(message);
}

function showError(message) {
    alert('خطأ: ' + message);
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

