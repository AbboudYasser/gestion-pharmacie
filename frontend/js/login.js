// هذا الملف مسؤول عن معالجة منطق صفحة تسجيل الدخول (login.html).
// هو يأخذ بيانات المستخدم (اسم المستخدم، كلمة المرور، الدور) ويرسلها إلى الخادم الخلفي للمصادقة.

// عند تحميل الصفحة بالكامل، يتم تشغيل هذه الدالة.
document.addEventListener("DOMContentLoaded", function() {
    // الحصول على عناصر النموذج من صفحة HTML
    const loginForm = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const roleSelect = document.getElementById("role");
    const loginButton = document.querySelector(".login-btn");
    
    // تم إزالة التحقق من تسجيل الدخول هنا للسماح للمستخدم بالبقاء في صفحة تسجيل الدخول
    // حتى لو كان هناك توكن قديم، لتمكين إعادة تسجيل الدخول بشكل صحيح.
    // if (PharmacyAPI.authToken() && PharmacyAPI.currentUser()) {
    //     window.location.href = "dashboard.html";
    //     return;
    // }
    
    // إضافة مستمع حدث لنموذج تسجيل الدخول عند إرساله (الضغط على زر تسجيل الدخول)
    if (loginForm) {
        loginForm.addEventListener("submit", async function(e) {
            e.preventDefault(); // منع السلوك الافتراضي للنموذج (إعادة تحميل الصفحة)
            
            // الحصول على القيم المدخلة من المستخدم
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim(); // لا يوجد .value هنا
            const role = roleSelect.value;
            
            // التحقق من أن جميع الحقول المطلوبة قد تم ملؤها
            if (!username || !password || !role) {
                showAlert("يرجى ملء جميع الحقول المطلوبة", "danger");
                return;
            }
            
            // إظهار حالة التحميل وتعطيل الزر لمنع الإرسال المتعدد
            showLoading(true);
            
            try {
                // استدعاء دالة login من ملف api.js لإرسال بيانات تسجيل الدخول إلى الخادم الخلفي.
                // إذا فشل هذا الاتصال، فستظهر رسالة "Failed to fetch" في المتصفح.
                const result = await PharmacyAPI.login(username, password, role);
                
                // إذا كان تسجيل الدخول ناجحاً (الخادم استجاب بنجاح)
                if (result.success) {
                    showAlert("تم تسجيل الدخول بنجاح", "success");
                    
                    // انتظار قصير ثم التوجيه إلى لوحة التحكم
                    setTimeout(() => {
                        window.location.href = "dashboard.html";
                    }, 1500);
                } else {
                    // التعامل مع حالات الفشل التي يرجعها الخادم (مثل بيانات اعتماد غير صحيحة)
                    showAlert(result.message || "خطأ في تسجيل الدخول", "danger");
                }
            } catch (error) {
                // التعامل مع الأخطاء التي تأتي من الخادم أو أخطاء الشبكة
                showAlert(error.message || "خطأ في تسجيل الدخول", "danger");
            } finally {
                // إعادة الزر إلى حالته الطبيعية بعد انتهاء العملية
                showLoading(false);
            }
        });
    }
});

// دالة لتبديل رؤية كلمة المرور (إظهار/إخفاء)
function togglePassword() {
    const passwordInput = document.getElementById("password");
    const toggleIcon = document.getElementById("toggleIcon");
    
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleIcon.classList.remove("fa-eye");
        toggleIcon.classList.add("fa-eye-slash");
    } else {
        passwordInput.type = "password";
        toggleIcon.classList.remove("fa-eye-slash");
        toggleIcon.classList.add("fa-eye");
    }
}

// دالة لعرض رسائل التنبيه للمستخدم (نجاح، خطأ، تحذير)
function showAlert(message, type) {
    const existingAlert = document.querySelector(".alert");
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement("div");
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class=\"fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-triangle"}"></i>
        ${message}
    `;
    
    const loginCard = document.querySelector(".login-card");
    loginCard.insertBefore(alert, loginCard.firstChild);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// دالة لإظهار/إخفاء حالة التحميل على زر تسجيل الدخول
function showLoading(show) {
    const loginBtn = document.querySelector(".login-btn");
    
    if (show) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = "<i class=\"fas fa-spinner fa-spin\"></i> جاري التحميل...";
    } else {
        loginBtn.disabled = false;
        loginBtn.innerHTML = "تسجيل الدخول";
    }
}

// تم إزالة checkExistingLogin() من هنا لمنع إعادة التوجيه التلقائية
// عند تحميل صفحة تسجيل الدخول، مما يسمح للمستخدم بإعادة تسجيل الدخول يدوياً.




