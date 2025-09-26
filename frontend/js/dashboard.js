
document.addEventListener("DOMContentLoaded", async function() {
    // الحصول على بيانات المستخدم الحالي من التخزين المحلي
    const currentUser = PharmacyAPI.getCurrentUser();
    
    // التحقق من تسجيل الدخول
    if (!currentUser.id || !currentUser.role) {
        // إعادة توجيه إلى صفحة تسجيل الدخول إذا لم يكن المستخدم مسجل الدخول
        window.location.href = 'login.html';
        return;
    }
    
    // تحديث معلومات المستخدم في الواجهة
    updateUserInfo(currentUser);
    
    // تحميل بيانات لوحة التحكم
    await loadDashboardData();
    
    // إعداد مستمعي الأحداث
    setupEventListeners();
});

function updateUserInfo(user) {
    
    const userNameElements = document.querySelectorAll(".user-name");
    userNameElements.forEach(element => {
        element.textContent = user.name;
    });
    
    
    const userRoleElements = document.querySelectorAll(".user-role");
    userRoleElements.forEach(element => {
        element.textContent = getRoleDisplayName(user.role);
    });
    
    
    adjustUIForUserRole(user.role);
}

function getRoleDisplayName(role) {
    const roleNames = {
        "hospital_manager": "مدير المستشفى",
        "pharmacy_head": "رئيس الصيدلية",
        "department_pharmacist": "صيدلي القسم",
        "doctor": "طبيب",
        "supplier": "مورد"
    };
    return roleNames[role] || role;
}

function adjustUIForUserRole(role) {
    
    const sections = {
        "hospital_manager": ["prescriptions", "inventory", "suppliers", "reports", "users"],
        "pharmacy_head": ["prescriptions", "inventory", "suppliers", "reports"],
        "department_pharmacist": ["prescriptions", "inventory"],
        "doctor": ["prescriptions"],
        "supplier": ["suppliers"]
    };
    
    const allowedSections = sections[role] || [];
    
    
    const allSections = document.querySelectorAll("[data-section]");
    allSections.forEach(section => {
        const sectionName = section.getAttribute("data-section");
        if (!allowedSections.includes(sectionName)) {
            section.style.display = "none";
        }
    });
    
    
    const menuItems = document.querySelectorAll(".sidebar-menu a[data-section]");
    menuItems.forEach(item => {
        const sectionName = item.getAttribute("data-section");
        if (!allowedSections.includes(sectionName)) {
            item.parentElement.style.display = "none";
        }
    });
}

async function loadDashboardData() {
    try {
        // تحميل إحصائيات لوحة التحكم
        const dashboardStats = await PharmacyAPI.getDashboardStats();
        if (dashboardStats.success) {
            updateDashboardStats(dashboardStats.data);
        }
        
        // تحميل الوصفات المعلقة
        const prescriptions = await PharmacyAPI.getPrescriptions({ status: "معلقة" });
        if (prescriptions.success) {
            updatePendingPrescriptions(prescriptions.data || []);
        }
        
        // تحميل عناصر المخزون المنخفض
        const lowStockItems = await PharmacyAPI.getLowStockItems();
        if (lowStockItems.success) {
            updateLowStockItems(lowStockItems.data || []);
        }
        
        // عرض الأدوية الأكثر طلباً (بيانات تجريبية)
        updatePopularMedications([
            { name: "باراسيتامول 500mg", requests: 45 },
            { name: "أموكسيسيلين 250mg", requests: 32 },
            { name: "أوميبرازول 20mg", requests: 28 }
        ]);
        
    } catch (error) {
        console.error("Error loading dashboard data:", error);
        PharmacyAPI.showMessage("خطأ في تحميل بيانات لوحة التحكم", "error");
    }
}

function updateDashboardStats(stats) {
    
    document.getElementById("total-prescriptions").textContent = stats.prescriptions.total;
    document.getElementById("today-prescriptions").textContent = stats.prescriptions.today;
    document.getElementById("pending-prescriptions").textContent = stats.prescriptions.pending;
    
    
    document.getElementById("total-medications").textContent = stats.inventory.total_medications;
    document.getElementById("low-stock-count").textContent = stats.inventory.low_stock;
    document.getElementById("expired-soon-count").textContent = stats.inventory.expired_soon;
    
    
    document.getElementById("active-suppliers").textContent = stats.suppliers.total;
    document.getElementById("pending-orders").textContent = stats.suppliers.pending_orders;
}

function updatePendingPrescriptions(prescriptions) {
    const container = document.getElementById("pending-prescriptions-list");
    if (!container) return;
    
    container.innerHTML = "";
    
    if (prescriptions.length === 0) {
        container.innerHTML = "<p class=\"no-data\">لا توجد وصفات معلقة</p>";
        return;
    }
    
    prescriptions.slice(0, 5).forEach(prescription => {
        const prescriptionElement = document.createElement("div");
        prescriptionElement.className = "prescription-item";
        prescriptionElement.innerHTML = `
            <div class=\"prescription-info\">
                <h4>${prescription.patient_name}</h4>
                <p>د. ${prescription.doctor_name} - ${prescription.department || ""}</p>
                <span class=\"prescription-date\">${prescription.date}</span>
            </div>
            <button class=\"btn btn-primary btn-sm\" onclick=\"dispensePrescription(\'${prescription.id}\')\">
                صرف الوصفة
            </button>
        `;
        container.appendChild(prescriptionElement);
    });
}

function updateLowStockItems(items) {
    const container = document.getElementById("low-stock-items-list");
    if (!container) return;
    
    container.innerHTML = "";
    
    if (items.length === 0) {
        container.innerHTML = "<p class=\"no-data\">جميع الأصناف متوفرة بكميات كافية</p>";
        return;
    }
    
    items.slice(0, 5).forEach(item => {
        const itemElement = document.createElement("div");
        itemElement.className = "stock-item";
        itemElement.innerHTML = `
            <div class=\"item-info\">
                <h4>${item.name}</h4>
                <p>الكمية المتبقية: ${item.quantity} ${item.unit}</p>
                <span class=\"minimum-stock\">الحد الأدنى: ${item.minimum_stock || "N/A"}</span>
            </div>
            <span class=\"status-badge status-warning\">${item.status || "Low Stock"}</span>
        `;
        container.appendChild(itemElement);
    });
}

function updatePopularMedications(medications) {
    const container = document.getElementById("popular-medications-list");
    if (!container) return;
    
    container.innerHTML = "";
    
    medications.forEach((medication, index) => {
        const medicationElement = document.createElement("div");
        medicationElement.className = "medication-item";
        medicationElement.innerHTML = `
            <span class=\"rank\">${index + 1}</span>
            <div class=\"medication-info\">
                <h4>${medication.name}</h4>
                <p>${medication.requests} طلب</p>
            </div>
        `;
        container.appendChild(medicationElement);
    });
}

async function dispensePrescription(prescriptionId) {
    try {
        const result = await PharmacyAPI.dispensePrescription(prescriptionId);
        if (result.success) {
            PharmacyAPI.showMessage("تم صرف الوصفة بنجاح", "success");
            
            await loadDashboardData();
        }
    } catch (error) {
        PharmacyAPI.showMessage(error.message || "خطأ في صرف الوصفة", "error");
    }
}

function setupEventListeners() {
    
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function(e) {
            e.preventDefault();
            if (confirm("هل أنت متأكد من تسجيل الخروج؟")) {
                PharmacyAPI.logout();
            }
        });
    }
    
    
    const menuItems = document.querySelectorAll(".sidebar-menu a");
    menuItems.forEach(item => {
        item.addEventListener("click", function(e) {
            e.preventDefault();
            const section = this.getAttribute("data-section");
            if (section) {
                showSection(section);
            }
        });
    });
    
    
    const refreshBtn = document.getElementById("refresh-btn");
    if (refreshBtn) {
        refreshBtn.addEventListener("click", async function() {
            this.disabled = true;
            this.innerHTML = "<i class=\"fas fa-spinner fa-spin\"></i>";
            await loadDashboardData();
            this.disabled = false;
            this.innerHTML = "<i class=\"fas fa-sync-alt\"></i>";
        });
    }
}

function showSection(sectionName) {
    
    const sections = document.querySelectorAll(".dashboard-section");
    sections.forEach(section => {
        section.style.display = "none";
    });
    
    
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.style.display = "block";
    }
    
    
    const menuItems = document.querySelectorAll(".sidebar-menu a");
    menuItems.forEach(item => {
        item.classList.remove("active");
    });
    
    const activeItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeItem) {
        activeItem.classList.add("active");
    }
    
    
    loadSectionData(sectionName);
}

async function loadSectionData(sectionName) {
    try {
        switch (sectionName) {
            case "prescriptions":
                await loadPrescriptionsData();
                break;
            case "inventory":
                await loadInventoryData();
                break;
            case "suppliers":
                await loadSuppliersData();
                break;
            case "reports":
                await loadReportsData();
                break;
            case "users":
                await loadUsersData();
                break;
        }
    } catch (error) {
        console.error(`Error loading ${sectionName} data:`, error);
        PharmacyAPI.showMessage(`خطأ في تحميل بيانات ${sectionName}`, "error");
    }
}

async function loadPrescriptionsData() {
    
    const prescriptions = await PharmacyAPI.getPrescriptions();
    
    console.log("Prescriptions loaded:", prescriptions);
}

async function loadInventoryData() {
    
    const inventory = await PharmacyAPI.getInventory();
    
    console.log("Inventory loaded:", inventory);
}

async function loadSuppliersData() {
    
    const suppliers = await PharmacyAPI.getSuppliers();
    
    console.log("Suppliers loaded:", suppliers);
}

async function loadReportsData() {
    
    const reports = await PharmacyAPI.getDashboardStats();
    
    console.log("Reports loaded:", reports);
}

async function loadUsersData() {
    
    const users = await PharmacyAPI.getUsers();
    
    console.log("Users loaded:", users);
}


