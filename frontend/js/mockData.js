// ملف البيانات الوهمية
// يوفر بيانات تجريبية عندما يكون الخادم غير متاح أو في وضع التطوير

// بيانات المستخدمين الوهمية
const mockUsers = [
    {
        id: 'user1',
        username: 'admin',
        password: 'admin123', // في التطبيق الحقيقي، لا نحفظ كلمات المرور بوضوح
        name: 'أحمد محمد الإداري',
        role: 'hospital_manager',
        email: 'admin@hospital.dz',
        phone: '+213555123456',
        department: 'الإدارة العامة',
        created_at: '2024-01-15T08:00:00Z',
        last_login: '2025-01-19T10:30:00Z',
        active: true
    },
    {
        id: 'user2',
        username: 'pharmacist',
        password: 'pharm123',
        name: 'فاطمة علي الصيدلانية',
        role: 'pharmacy_head',
        email: 'pharmacist@hospital.dz',
        phone: '+213555234567',
        department: 'الصيدلية الرئيسية',
        created_at: '2024-02-01T09:00:00Z',
        last_login: '2025-01-19T09:15:00Z',
        active: true
    },
    {
        id: 'user3',
        username: 'doctor',
        password: 'doc123',
        name: 'د. محمد حسن الطبيب',
        role: 'doctor',
        email: 'doctor@hospital.dz',
        phone: '+213555345678',
        department: 'الطب الباطني',
        created_at: '2024-01-20T07:30:00Z',
        last_login: '2025-01-19T08:45:00Z',
        active: true
    }
];

// بيانات المرضى الوهمية
const mockPatients = [
    {
        id: 'patient1',
        national_id: '1234567890123456',
        full_name: 'محمد أحمد بن علي',
        date_of_birth: '1985-03-15',
        gender: 'ذكر',
        phone: '+213661123456',
        address: 'حي السلام، الجزائر العاصمة',
        emergency_contact: '+213661234567',
        medical_history: 'ضغط الدم المرتفع، السكري من النوع الثاني',
        allergies: ['البنسلين', 'الأسبرين'],
        insurance_number: 'INS001234567',
        created_at: '2024-06-01T10:00:00Z',
        updated_at: '2025-01-15T14:30:00Z'
    },
    {
        id: 'patient2',
        national_id: '2345678901234567',
        full_name: 'فاطمة محمد بن يوسف',
        date_of_birth: '1992-07-22',
        gender: 'أنثى',
        phone: '+213662234567',
        address: 'حي النصر، وهران',
        emergency_contact: '+213662345678',
        medical_history: 'الربو، حساسية الطعام',
        allergies: ['الفول السوداني', 'المأكولات البحرية'],
        insurance_number: 'INS002345678',
        created_at: '2024-08-15T11:30:00Z',
        updated_at: '2025-01-18T16:45:00Z'
    },
    {
        id: 'patient3',
        national_id: '3456789012345678',
        full_name: 'علي حسن بن محمد',
        date_of_birth: '1978-11-08',
        gender: 'ذكر',
        phone: '+213663345678',
        address: 'حي الزيتون، قسنطينة',
        emergency_contact: '+213663456789',
        medical_history: 'أمراض القلب، ارتفاع الكوليسترول',
        allergies: [],
        insurance_number: 'INS003456789',
        created_at: '2024-05-20T09:15:00Z',
        updated_at: '2025-01-10T12:20:00Z'
    }
];

// بيانات الأدوية الوهمية
const mockMedications = [
    {
        id: 'med1',
        name: 'باراسيتامول 500mg',
        generic_name: 'Paracetamol',
        category: 'مسكنات الألم',
        manufacturer: 'شركة الأدوية الجزائرية',
        batch_number: 'PAR2024001',
        quantity: 500,
        unit: 'قرص',
        minimum_stock: 100,
        expiry_date: '2026-12-31',
        price: 25.50,
        location: 'رف A-1',
        created_at: '2024-01-10T08:00:00Z',
        updated_at: '2025-01-19T10:00:00Z'
    },
    {
        id: 'med2',
        name: 'أموكسيسيلين 250mg',
        generic_name: 'Amoxicillin',
        category: 'مضادات حيوية',
        manufacturer: 'مختبرات الشرق الأوسط',
        batch_number: 'AMX2024002',
        quantity: 75,
        unit: 'كبسولة',
        minimum_stock: 50,
        expiry_date: '2025-08-15',
        price: 45.00,
        location: 'رف B-2',
        created_at: '2024-02-05T09:30:00Z',
        updated_at: '2025-01-18T15:45:00Z'
    },
    {
        id: 'med3',
        name: 'أوميبرازول 20mg',
        generic_name: 'Omeprazole',
        category: 'أدوية الجهاز الهضمي',
        manufacturer: 'الشركة الوطنية للأدوية',
        batch_number: 'OME2024003',
        quantity: 200,
        unit: 'كبسولة',
        minimum_stock: 80,
        expiry_date: '2027-03-20',
        price: 35.75,
        location: 'رف C-1',
        created_at: '2024-03-12T11:15:00Z',
        updated_at: '2025-01-17T13:30:00Z'
    }
];

// بيانات الوصفات الطبية الوهمية
const mockPrescriptions = [
    {
        id: 'pres1',
        patient_id: 'patient1',
        patient_name: 'محمد أحمد بن علي',
        doctor_id: 'user3',
        doctor_name: 'د. محمد حسن الطبيب',
        department: 'الطب الباطني',
        diagnosis: 'التهاب في الحلق',
        status: 'معلقة',
        created_date: '2025-01-19T09:30:00Z',
        dispensed_date: null,
        medications: [
            {
                medication_id: 'med2',
                name: 'أموكسيسيلين 250mg',
                dosage: '250mg كل 8 ساعات',
                quantity: 21,
                unit: 'كبسولة',
                duration: '7 أيام'
            },
            {
                medication_id: 'med1',
                name: 'باراسيتامول 500mg',
                dosage: '500mg عند الحاجة',
                quantity: 10,
                unit: 'قرص',
                duration: 'حسب الحاجة'
            }
        ],
        notes: 'يُنصح بتناول الدواء مع الطعام'
    },
    {
        id: 'pres2',
        patient_id: 'patient2',
        patient_name: 'فاطمة محمد بن يوسف',
        doctor_id: 'user3',
        doctor_name: 'د. محمد حسن الطبيب',
        department: 'الطب الباطني',
        diagnosis: 'ارتجاع المريء',
        status: 'مصروفة',
        created_date: '2025-01-18T14:15:00Z',
        dispensed_date: '2025-01-18T16:30:00Z',
        medications: [
            {
                medication_id: 'med3',
                name: 'أوميبرازول 20mg',
                dosage: '20mg مرة واحدة يومياً',
                quantity: 30,
                unit: 'كبسولة',
                duration: '30 يوم'
            }
        ],
        notes: 'يُتناول قبل الإفطار بـ 30 دقيقة'
    }
];

// بيانات الموردين الوهمية
const mockSuppliers = [
    {
        id: 'sup1',
        name: 'شركة الأدوية الجزائرية',
        contact_person: 'أحمد بن محمد',
        phone: '+213021123456',
        email: 'contact@algerian-pharma.dz',
        address: 'المنطقة الصناعية، الجزائر العاصمة',
        license_number: 'LIC001234567',
        rating: 4.5,
        active: true,
        created_at: '2024-01-01T00:00:00Z'
    },
    {
        id: 'sup2',
        name: 'مختبرات الشرق الأوسط',
        contact_person: 'فاطمة علي',
        phone: '+213031234567',
        email: 'info@middle-east-labs.com',
        address: 'حي الصناعات، وهران',
        license_number: 'LIC002345678',
        rating: 4.2,
        active: true,
        created_at: '2024-02-15T00:00:00Z'
    }
];

// بيانات طلبات الشراء الوهمية
const mockPurchaseOrders = [
    {
        id: 'po1',
        supplier_id: 'sup1',
        supplier_name: 'شركة الأدوية الجزائرية',
        order_date: '2025-01-15T10:00:00Z',
        expected_delivery: '2025-01-25T10:00:00Z',
        status: 'معلقة',
        total_amount: 15750.00,
        items: [
            {
                medication_id: 'med1',
                name: 'باراسيتامول 500mg',
                quantity: 1000,
                unit_price: 25.50,
                total_price: 25500.00
            }
        ],
        notes: 'طلب عاجل - نقص في المخزون'
    }
];

// إحصائيات وهمية للوحة التحكم
const mockDashboardStats = {
    prescriptions: {
        total: 156,
        today: 12,
        pending: 8,
        dispensed_today: 4
    },
    inventory: {
        total_medications: 1247,
        low_stock: 15,
        expired_soon: 8,
        out_of_stock: 3
    },
    suppliers: {
        total: 25,
        active: 23,
        pending_orders: 5
    },
    patients: {
        total: 2847,
        new_today: 6,
        with_allergies: 342
    }
};

// دالة لمحاكاة تأخير الشبكة
function simulateNetworkDelay(min = 500, max = 1500) {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
}

// دالة لمحاكاة استجابة API ناجحة
function createSuccessResponse(data, message = 'تم بنجاح') {
    return {
        success: true,
        message: message,
        data: data,
        timestamp: new Date().toISOString()
    };
}

// دالة لمحاكاة استجابة API فاشلة
function createErrorResponse(message = 'حدث خطأ', code = 'UNKNOWN_ERROR') {
    return {
        success: false,
        message: message,
        error_code: code,
        timestamp: new Date().toISOString()
    };
}

// دالة للبحث في البيانات
function searchInArray(array, searchTerm, fields) {
    if (!searchTerm) return array;
    
    const term = searchTerm.toLowerCase();
    return array.filter(item => {
        return fields.some(field => {
            const value = item[field];
            if (typeof value === 'string') {
                return value.toLowerCase().includes(term);
            }
            if (Array.isArray(value)) {
                return value.some(v => v.toLowerCase().includes(term));
            }
            return false;
        });
    });
}

// دالة لتصفية البيانات
function filterArray(array, filters) {
    return array.filter(item => {
        return Object.keys(filters).every(key => {
            const filterValue = filters[key];
            const itemValue = item[key];
            
            if (!filterValue) return true;
            
            if (typeof filterValue === 'string') {
                return itemValue === filterValue;
            }
            
            if (Array.isArray(filterValue)) {
                return filterValue.includes(itemValue);
            }
            
            return true;
        });
    });
}

// دالة لترقيم الصفحات
function paginateArray(array, page = 1, limit = 10) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
        data: array.slice(startIndex, endIndex),
        pagination: {
            current_page: page,
            total_pages: Math.ceil(array.length / limit),
            total_items: array.length,
            items_per_page: limit,
            has_next: endIndex < array.length,
            has_prev: page > 1
        }
    };
}

// تصدير البيانات الوهمية والدوال المساعدة
window.MockData = {
    // البيانات
    users: mockUsers,
    patients: mockPatients,
    medications: mockMedications,
    prescriptions: mockPrescriptions,
    suppliers: mockSuppliers,
    purchaseOrders: mockPurchaseOrders,
    dashboardStats: mockDashboardStats,
    
    // الدوال المساعدة
    simulateNetworkDelay,
    createSuccessResponse,
    createErrorResponse,
    searchInArray,
    filterArray,
    paginateArray,
    
    // دوال للحصول على البيانات بطريقة تحاكي API
    async getUsers(filters = {}) {
        await simulateNetworkDelay();
        const filtered = filterArray(mockUsers, filters);
        return createSuccessResponse(filtered);
    },
    
    async getPatients(filters = {}) {
        await simulateNetworkDelay();
        const filtered = filterArray(mockPatients, filters);
        return createSuccessResponse(filtered);
    },
    
    async getMedications(filters = {}) {
        await simulateNetworkDelay();
        const filtered = filterArray(mockMedications, filters);
        return createSuccessResponse(filtered);
    },
    
    async getPrescriptions(filters = {}) {
        await simulateNetworkDelay();
        const filtered = filterArray(mockPrescriptions, filters);
        return createSuccessResponse(filtered);
    },
    
    async getDashboardStats() {
        await simulateNetworkDelay();
        return createSuccessResponse(mockDashboardStats);
    },
    
    async login(username, password, role) {
        await simulateNetworkDelay();
        
        const user = mockUsers.find(u => 
            u.username === username && 
            u.password === password &&
            u.role === role
        );
        
        if (user) {
            const token = 'mock_token_' + Date.now();
            const userWithoutPassword = { ...user };
            delete userWithoutPassword.password;
            
            return createSuccessResponse({
                token: token,
                user: userWithoutPassword
            }, 'تم تسجيل الدخول بنجاح');
        } else {
            return createErrorResponse('بيانات الدخول غير صحيحة', 'INVALID_CREDENTIALS');
        }
    }
};
